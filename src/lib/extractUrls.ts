// Helper to extract URLs from text
export function extractUrls(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}