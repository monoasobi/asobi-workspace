const isHtml = (response: Response, text: string) =>
  response.headers.get("content-type")?.includes("text/html") ||
  /^\s*(?:<!doctype html\b|<html\b)/i.test(text);

export const fetchNovelMarkdown = async (
  novelId: number | string,
  preferLocal: boolean,
) => {
  if (preferLocal) {
    // Missing local files can resolve to a Next HTML page, even with status 200.
    const local = await fetch(`/novel/${novelId}.md`, { cache: "no-store" });
    if (local.ok) {
      const text = await local.text();
      if (!isHtml(local, text)) return text;
    } else if (local.status !== 404) {
      throw new Error("Failed to fetch local novel");
    }
  }

  const response = await fetch(`/api/content/novels/${novelId}`);
  if (!response.ok) throw new Error("Failed to fetch novel");
  const text = await response.text();
  if (isHtml(response, text)) throw new Error("Expected novel Markdown, got HTML");
  return text;
};
