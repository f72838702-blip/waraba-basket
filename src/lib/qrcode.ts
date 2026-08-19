import QRCode from "qrcode";

/**
 * Génère un QR code en Data URL (base64) à partir d'une chaîne.
 * Idéal pour billetterie : insère l'URL dans un <img src=.../>.
 */
export async function generateQrCodeDataUrl(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 256,
    color: { dark: "#0F172A", light: "#FFFFFF" },
    ...options,
  });
}

/**
 * Génère un QR code en chaîne SVG (utile pour un rendu côté serveur).
 */
export async function generateQrCodeSvg(
  text: string,
  options?: QRCode.QRCodeToStringOptions
): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    color: { dark: "#0F172A", light: "#FFFFFF" },
    ...options,
  });
}