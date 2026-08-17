export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

export function getConfidenceLevel(lastConfirmedAt: string): "high" | "medium" | "low" {
  const diffHours = (Date.now() - new Date(lastConfirmedAt).getTime()) / 3600000;
  if (diffHours < 6) return "high";
  if (diffHours < 48) return "medium";
  return "low";
}
