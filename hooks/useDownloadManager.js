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

        if (!userRegion || !userIP) {
            alert("⚠️ Không thể xác định vị trí của bạn. Vui lòng thử lại!");
            return;
        }

        // ♻️ Nếu > 1024MB => tải qua Proxy
        if (size && size > 1024 * 1024 * 1024) {
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
            const cancel = fetchAndDownload(videoUrl, fileName, size, setProgress, userRegion);

            if (!cancel) {
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

            // ✅ Bọc cancel để UI reset ngay khi bấm
            setCancelDownload(() => () => {
                try { cancel(); } finally {
                    setProgress(0);            // reset thanh tiến trình ngay
                    setCancelDownload(null);   // ẩn nút Cancel ngay
                }
            });
        } catch (error) {
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
