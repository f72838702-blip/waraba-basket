/**
 * Compression d'image côté navigateur, avant upload.
 *
 * Une photo de téléphone (souvent 3-5 Mo, jusqu'à 48-108 MP sur les
 * téléphones récents) est redimensionnée à une taille raisonnable puis
 * ré-encodée en JPEG qualité moyenne → ~100-200 Ko. Cela limite la
 * consommation du bucket Storage Supabase (1 Go sur le plan gratuit) sans
 * dégrader l'affichage de la carte membre (la photo n'est jamais affichée en
 * grand).
 *
 * Mémoire : on évite de matérialiser l'image pleine résolution dans le tas JS.
 *  1) Les dimensions natives sont lues directement dans l'en-tête du fichier
 *     (JPEG/PNG/WebP), SANS décoder les pixels.
 *  2) `createImageBitmap` est appelé avec `resizeWidth/resizeHeight` : le
 *     navigateur décode et sous-échantillonne en une seule passe (flux), la
 *     sortie est déjà réduite → pas d'image pleine résolution en mémoire.
 *     `imageOrientation: "from-image"` applique l'orientation EXIF (les photos
 *     de téléphone sont sinon pivotées).
 *  3) Repli sur <img> + drawImage dans un canvas réduit (sans orientation EXIF
 *     auto) pour les navigateurs ne supportant pas les options de resize.
 *
 * Tout se passe « en arrière-plan » : l'admin choisit sa photo, la version
 * compressée remplace silencieusement le fichier de l'input avant l'envoi.
 */

export type CompressOptions = {
  /** Plus grande arête de l'image de sortie, en px (défaut 1024). */
  maxDimension?: number;
  /** Qualité JPEG 0..1 (défaut 0.82). */
  quality?: number;
  /** Type MIME de sortie (défaut image/jpeg). */
  mimeType?: string;
};

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1024,
  quality: 0.82,
  mimeType: "image/jpeg",
};

/**
 * Lit les dimensions (w, h) d'un fichier image SANS décoder les pixels, en
 * parsant l'en-tête (JPEG SOF / PNG IHDR / WebP RIFF). Mémoire minime même
 * pour un cliché 108 MP : on ne charge que le premier Mio.
 */
async function readImageDimensions(
  file: File
): Promise<{ w: number; h: number }> {
  const buffer = await file.slice(0, 1024 * 1024).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // --- JPEG : parcourir les marqueurs jusqu'au SOF (Start Of Frame) ---
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = bytes[i + 1];
      i += 2;
      // SOF0..SOF15 sauf DHT (0xC4), JPGA (0xC8), DAC (0xCC).
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        const h = view.getUint16(i + 3);
        const w = view.getUint16(i + 5);
        return { w, h };
      }
      // Marqueur avec segment : on saute la longueur.
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        continue; // marqueurs sans segment
      }
      const segLen = view.getUint16(i);
      i += segLen;
    }
    throw new Error("JPEG : SOF introuvable");
  }

  // --- PNG : IHDR à l'offset 16 (largeur) / 20 (hauteur) ---
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { w: view.getUint32(16), h: view.getUint32(20) };
  }

  // --- WebP : RIFF....WEBP puis chunk VP8 / VP8L / VP8X ---
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    const chunk = String.fromCharCode(
      bytes[12],
      bytes[13],
      bytes[14],
      bytes[15]
    );
    if (chunk === "VP8L") {
      // Lossless : width/height codés sur 14 bits.
      const b0 = bytes[21];
      const b1 = bytes[22];
      const b2 = bytes[23];
      const b3 = bytes[24];
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { w, h };
    }
    if (chunk === "VP8X") {
      const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      return { w, h };
    }
    if (chunk === "VP8 ") {
      const w = view.getUint16(26) & 0x3fff;
      const h = view.getUint16(28) & 0x3fff;
      return { w, h };
    }
    throw new Error("WebP : chunk non géré");
  }

  throw new Error("Format non reconnu");
}

/** Indique si le navigateur supporte les options de resize de createImageBitmap. */
function supportsBitmapResize(): boolean {
  return typeof createImageBitmap === "function";
}

/**
 * Compresse un fichier image. Retourne un nouveau `File` prêt à être envoyé.
 * En cas d'échec (format non lisible, canvas indisponible), lève une erreur
 * pour que l'appelant puisse replier sur le fichier original.
 */
export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<File> {
  const { maxDimension, quality, mimeType } = { ...DEFAULTS, ...opts };

  // 1) Dimensions natives lues dans l'en-tête (aucun décodage de pixels).
  const { w: srcW, h: srcH } = await readImageDimensions(file);
  if (!srcW || !srcH) throw new Error("Image invalide");

  // 2) Dimensions cibles (ratio conservé, arête max = maxDimension).
  let w = srcW;
  let h = srcH;
  if (w > maxDimension || h > maxDimension) {
    const ratio = Math.min(maxDimension / w, maxDimension / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  // 3) Canvas de sortie (toujours petit → mémoire négligeable).
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  // Fond blanc pour le JPEG (évite le noir sur un PNG transparent).
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }

  // 4) Décodage + dessin. On privilégie createImageBitmap avec resize (une
  //    seule passe, mémoire maîtrisée) + orientation EXIF ; sinon <img>.
  let bitmap: ImageBitmap | undefined;
  if (supportsBitmapResize()) {
    try {
      bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
        resizeWidth: w,
        resizeHeight: h,
        resizeQuality: "high",
      });
    } catch {
      bitmap = undefined; // options non supportées ou décodage échoué → repli
    }
  }

  if (bitmap) {
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
  } else {
    // Repli : <img> puis drawImage vers le canvas réduit. Le navigateur
    // sous-échantillonne au moment du draw ; on ne crée jamais de canvas
    // pleine résolution. NB : pas d'orientation EXIF auto sur ce chemin.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image illisible"));
        img.src = url;
      });
      ctx.drawImage(img, 0, 0, w, h);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // 5) Ré-encodage.
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression échouée"))),
      mimeType,
      quality
    );
  });

  const ext =
    mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.${ext}`, { type: mimeType });
}

/** Taille lisible : 153600 → « 150 Ko ». */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}