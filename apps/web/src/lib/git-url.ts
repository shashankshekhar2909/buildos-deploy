/** Parse any git URL into a normalized clone URL with optional PAT injection */
export function buildCloneUrl(repoInput: string, githubToken?: string | null): string {
  const input = repoInput.trim();

  // SSH: git@github.com:owner/repo.git — use as-is (relies on SSH key)
  if (input.startsWith("git@")) return input;

  // Full HTTPS URL
  if (input.startsWith("https://") || input.startsWith("http://")) {
    if (!githubToken) return input;
    // Inject PAT only into github.com URLs
    try {
      const u = new URL(input);
      if (u.hostname === "github.com") {
        u.username = githubToken;
        u.password = "x-oauth-basic";
        return u.toString();
      }
    } catch {}
    return input;
  }

  // shorthand owner/repo → github https
  if (/^[^/\s]+\/[^/\s]+$/.test(input)) {
    const base = `https://github.com/${input}.git`;
    if (!githubToken) return base;
    return `https://${githubToken}:x-oauth-basic@github.com/${input}.git`;
  }

  return input;
}

/** Extract a sensible project name from any git URL */
export function repoNameFromUrl(input: string): string {
  const cleaned = input.trim().replace(/\.git$/, "");
  // SSH: git@github.com:owner/repo
  const sshMatch = cleaned.match(/git@[^:]+:(?:[^/]+\/)?(.+)$/);
  if (sshMatch) return sshMatch[1].split("/").pop() || "";
  // HTTPS: https://host/owner/repo
  try {
    const parts = new URL(cleaned).pathname.split("/").filter(Boolean);
    return parts.pop() || "";
  } catch {}
  // owner/repo
  return cleaned.split("/").pop() || "";
}
