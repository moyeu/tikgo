import { useState } from 'react';
import { fetchAndDownload } from '../utils/fetchBlob';
import { fallbackDownload } from '../utils/proxyFallback';

export default function useDownloadManager(userRegion, userIP) {
    const [progress, setProgress] = useState(0);
    const [cancelDownload, setCancelDownload] = useState(null);

    const handleVideoDownload = (media) => {
        const { url: videoUrl, format, size } = media;
        const randomNumber = Math.floor(Math.random() * (100000000 - 1000000) + 1000000);
        const fileName = `tikgo.me-${randomNumber}.${format}`;

        //console.log("🔍 userRegion trước khi gọi fallbackDownload:", userRegion);
        //console.log("🔍 userIP trước khi gọi fallbackDownload:", userIP);

        if (!userRegion || !userIP) {
            alert("⚠️ Không thể xác định vị trí của bạn. Vui lòng thử lại!");
            return;
        }

        // ♻️ Kiểm tra kích thước file. Nếu > 1024MB => tải qua Proxy
        if (size && size > 1024 * 1024 * 1024) {
            //console.warn("⚠️ File quá lớn, tải xuống qua Proxy.");
            return fallbackDownload(
                videoUrl,
                fileName,
                size,
                format,
                setProgress,
                userRegion,
                userIP
            );
        }

        try {
            //console.log("🚀 Bắt đầu tải với fetchBlob.js...");
            const cancel = fetchAndDownload(videoUrl, fileName, size, setProgress, userRegion);

            if (!cancel) {
                //console.warn("⚠️ Fetch bị lỗi ngay lập tức, fallback qua Proxy.");
                return fallbackDownload(
                    videoUrl,
                    fileName,
                    size,
                    format,
                    setProgress,
                    userRegion,
                    userIP
                );
            }

            setCancelDownload(() => cancel);
        } catch (error) {
            //console.error("❌ Lỗi tải xuống:", error);
            //console.warn("⚠️ Chuyển sang tải qua Proxy...");
            fallbackDownload(
                videoUrl,
                fileName,
                size,
                format,
                setProgress,
                userRegion,
                userIP
            );
        }
    };

    return { progress, handleVideoDownload, cancelDownload };
}
