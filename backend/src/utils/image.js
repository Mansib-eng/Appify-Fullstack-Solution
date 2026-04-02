export function fileToBase64(file) {
  if (!file) return null;
  const mimeType = file.mimetype || "image/jpeg";
  const base64 = file.buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}
