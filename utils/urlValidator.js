import { extractUrl } from "./urlExtractor";

export function validateUrl(inputText) {
    try {
        const extracted = extractUrl(inputText);
        if (!extracted.found) {
            return { isValid: false };
        }
        
        const url = extracted.url;
        const parsedUrl = new URL(url);
        
        // Kiểm tra nền tảng (TikTok hoặc Douyin)
        const isTikTok = parsedUrl.hostname.includes("tiktok.com");
        const isDouyin = parsedUrl.hostname.includes("douyin.com");
        
        if (!isTikTok && !isDouyin) {
            return { isValid: false };
        }
        
        // Chỉ áp dụng logic chặn cho TikTok
        if (isTikTok) {
            const invalidPaths = ["/tag/", "/live", "/search", "/explore", "/foryou", "/trending"];
            
            if (parsedUrl.pathname.startsWith("/@")) {
                const pathSegments = parsedUrl.pathname.split("/");
                if (pathSegments.length === 2) {
                    return { isValid: false }; // Đây là profile, vì chỉ có 2 phần tử: ["", "@username"]
                }
            }
            
            if (parsedUrl.pathname === "/" || parsedUrl.pathname === "" || invalidPaths.some(path => parsedUrl.pathname.includes(path))) {
                return { isValid: false };
            }
        }
        
        // Chặn chỉ URL Douyin có /search
        if (isDouyin && parsedUrl.pathname.includes("search")) {
            return { isValid: false };
        }
        
        return { isValid: true, extractedUrl: url };
    } catch (error) {
        return { isValid: false };
    }
}