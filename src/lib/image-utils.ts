export function isRemoteImage(src: string | null | undefined) {
  return src?.startsWith("http://") || src?.startsWith("https://") || false;
}
