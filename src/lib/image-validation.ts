const SIGNATURE_BYTES = 12;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

export async function detectImageType(blob: Blob): Promise<string | null> {
  const bytes = new Uint8Array(await blob.slice(0, SIGNATURE_BYTES).arrayBuffer());

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}
