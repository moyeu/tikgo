import { useState } from 'react';
import { fetchAndDownload } from '../utils/fetchBlob';
import { fallbackDownload } from '../utils/proxyFallback';

/**
 * Quản lý tải video qua Blob:
 * 1️⃣ Gọi /api/down?media=<b64>&bandwidth_saving=1  ➜ 302 ➜ CDN
 * 2️⃣ Nếu CDN trả lỗi/CORS ➜ fallbackDownload (proxy)
 * 3️⃣ File > 1 GB cũng đi thẳng proxy để tránh timeout dài
 */
export default function useDownloadManager(userRegion, userIP) {
  const [progress, setProgress] = useState(0);
  const [cancelDownload, setCancelDownload] = useState(null);

  const handleVideoDownload = (media) => {
    const { url: videoUrl, format, size } = media;
    const randomNumber = Math.floor(Math.random() * (100000000 - 1000000) + 1000000);
    const fileName = `tikgo.me-${randomNumber}.${format}`;

    // Không có IP / region → báo lỗi
    if (!userRegion || !userIP) {
      alert('⚠️ Không thể xác định vị trí của bạn. Vui lòng thử lại!');
      return;
    }

    // File lớn > 1 GB: proxy ngay
    if (size && size > 1024 * 1024 * 1024) {
      fallbackDownload(videoUrl, fileName, size, format, setProgress, userRegion, userIP);
      return;
    }

    /* 🚀 URL redirect tiết kiệm băng thông */
    const encoded     = btoa(videoUrl); // base64-url
    const redirectUrl = `/api/down?media=${encoded}&bandwidth_saving=1`;

    try {
      const cancel = fetchAndDownload(
        redirectUrl,
        fileName,
        size,
        setProgress,
        userRegion,
        /* onEarlyFail: chuyển sang proxy nếu 302 theo CDN vẫn lỗi */
        () => fallbackDownload(videoUrl, fileName, size, format, setProgress, userRegion, userIP)
      );

      if (cancel) setCancelDownload(() => cancel);
    } catch (err) {
      // Bất kỳ lỗi nào khác → dùng proxy
      fallbackDownload(videoUrl, fileName, size, format, setProgress, userRegion, userIP);
    }
  };

  return { progress, handleVideoDownload, cancelDownload };
}
