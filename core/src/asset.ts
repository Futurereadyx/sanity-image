const CDN_PATH_PATTERN = /^https?:\/\/[^/]+\/images\/([^/]+)\/([^/]+)\//;

export function parseAssetUrl(url: string | null | undefined): { projectId: string; dataset: string } | undefined {
  if (!url) return undefined;
  const match = CDN_PATH_PATTERN.exec(url);
  return match ? { projectId: match[1], dataset: match[2] } : undefined;
}
