import { fallbackDownload } from './proxyFallback';

let downloadWorker = null;

export function fetchAndDownload(url, fileName = "video.mp4", fileSize, setProgress, userRegion) {
  if (downloadWorker) {
    // Đang tải, bỏ qua để tránh trùng
    return;
  }

  downloadWorker = new Worker(new URL('../workers/worker.js', import.meta.url));

  // Gửi lệnh bắt đầu (tương thích: worker cũng chấp nhận message không type)
  downloadWorker.postMessage({ type: 'start', url, fileSize });

  downloadWorker.onmessage = (event) => {
    const data = event.data || {};

    if (data.progress) {
      if (setProgress) setProgress(data.progress);
      return;
    }

    if (data.canceled) {
      // Người dùng đã hủy: reset UI, dọn dẹp, KHÔNG fallback
      if (setProgress) setProgress(0);
      try { downloadWorker.terminate(); } catch (_) {}
      downloadWorker = null;
      return;
    }

    if (data.complete) {
      const blobUrl = URL.createObjectURL(data.blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      if (setProgress) setProgress(100);

      try { downloadWorker.terminate(); } catch (_) {}
      downloadWorker = null;
      return;
    }

    if (data.error) {
      // Lỗi thật sự → fallback proxy (Fix A: truyền đúng fileExtension + tham số)
      if (setProgress) setProgress(0);
      try { downloadWorker.terminate(); } catch (_) {}
      downloadWorker = null;

      // Suy ra phần mở rộng từ fileName, mặc định 'mp4'
      let ext = 'mp4';
      const dot = fileName.lastIndexOf('.');
      if (dot > -1 && dot < fileName.length - 1) {
        ext = fileName.slice(dot + 1).split('?')[0].toLowerCase();
      }

      // ĐÚNG THỨ TỰ: (url, fileName, fileSize, fileExtension, setProgress, userRegion)
      fallbackDownload(url, fileName, fileSize, ext, setProgress, userRegion);
    }
  };

  // Trả hàm hủy: gửi message 'cancel' (không terminate ngay)
  return () => {
    if (!downloadWorker) return;
    try {
      downloadWorker.postMessage({ type: 'cancel' });
      // Phòng trường hợp worker không phản hồi, kill sau 1.5s
      setTimeout(() => {
        if (downloadWorker) {
          try { downloadWorker.terminate(); } catch (_) {}
          downloadWorker = null;
          if (setProgress) setProgress(0);
        }
      }, 1500);
    } catch (_) {
      // Nếu không gửi được, terminate cứng
      try { downloadWorker.terminate(); } catch (__) {}
      downloadWorker = null;
      if (setProgress) setProgress(0);
    }
  };
}
