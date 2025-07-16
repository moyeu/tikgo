export function extractUrl(inputText) {
    try {
        const urlRegex = /(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}[^\s]*)/g;
        const matches = inputText.match(urlRegex);
        
        if (!matches || matches.length === 0) {
            return { url: null, found: false };
        }
        
        // Giữ nguyên URL gốc, không xóa query string
        return { url: matches[0], found: true };
    } catch (error) {
        return { url: null, found: false };
    }
}
