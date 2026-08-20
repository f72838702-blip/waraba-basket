/**
 * Compression d'image côté navigateur, avant upload.
 *
 * Une photo de téléphone (souvent 3-4 Mo) est redimensionnée à une taille
 * raisonnable puis ré-encodée en JPEG qualité moyenne → ~100-200 Ko. Cela
 * limite drastiquement la consommation du bucket Storage Supabase (1 Go sur
 * le plan gratuit) sans dégrader l'affichage de la carte membre (la photo
 * n'est jamais affichée en grand).
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
 * Compresse un fichier image. Retourne un nouveau `File` prêt à être envoyé.
 * En cas d'échec (format non lisible, canvas indisponible), lève une erreur
 * pour que l'appelant puisse replier sur le fichier original.
 */
export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<File> {
  const { maxDimension, quality, mimeType } = { ...DEFAULTS, ...opts };

  // 1) Décodage de l'image source (createImageBitmap quand dispo, sinon <img>).
  let bitmap: ImageBitmap | undefined;
  let img: HTMLImageElement | undefined;
  let objectUrl: string | undefined;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    img = new Image();
    const url = URL.createObjectURL(file);
    objectUrl = url;
    await new Promise<void>((resolve, reject) => {
      img!.onload = () => resolve();
      img!.onerror = () => reject(new Error("Image illisible"));
      img!.src = url;
    });
  }

  const srcW = bitmap?.width ?? img?.naturalWidth ?? 0;
  const srcH = bitmap?.height ?? img?.naturalHeight ?? 0;
  if (!srcW || !srcH) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (bitmap) bitmap.close?.();
    throw new Error("Image invalide");
  }

  // 2) Mise à l'échelle (conserve le ratio) si l'image dépasse maxDimension.
  let w = srcW;
  let h = srcH;
  if (w > maxDimension || h > maxDimension) {
    const ratio = Math.min(maxDimension / w, maxDimension / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  // 3) Dessin sur canvas.
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (bitmap) bitmap.close?.();
    throw new Error("Canvas indisponible");
  }
  // Fond blanc pour le JPEG (évite le noir sur un PNG transparent).
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage((bitmap ?? img) as CanvasImageSource, 0, 0, w, h);

  if (objectUrl) URL.revokeObjectURL(objectUrl);
  if (bitmap) bitmap.close?.();

  // 4) Ré-encodage.
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