import { fallbackDownload } from './proxyFallback';

let downloadWorker = null;

export function fetchAndDownload(url, fileName = "video.mp4", fileSize, setProgress, userRegion) {
    if (downloadWorker) {
        //console.warn("⚠️ Một quá trình tải xuống đang chạy!");
        return;
    }

    //console.log("🚀 Bắt đầu tải xuống:", url);

    // Khởi tạo Web Worker từ file worker.js
    downloadWorker = new Worker(new URL('../workers/worker.js', import.meta.url));

    // Gửi URL tải xuống và kích thước file cho Worker
    downloadWorker.postMessage({ url, fileSize });

    downloadWorker.onmessage = (event) => {
        if (event.data.progress) {
            if (setProgress && typeof setProgress === "function") {
                setProgress(event.data.progress); // ✅ Cập nhật tiến trình tải xuống
            }
            //console.log(`📥 Tiến trình: ${event.data.progress}%`);
        } else if (event.data.complete) {
            //console.log("✅ Tải xuống hoàn tất!");

            // Tạo URL từ Blob và kích hoạt tải xuống
            const blobUrl = URL.createObjectURL(event.data.blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);

            if (setProgress && typeof setProgress === "function") {
                setProgress(100); // ✅ Hoàn tất tiến trình
            }

            downloadWorker.terminate();
            downloadWorker = null;
        } else if (event.data.error) {
            //console.error("❌ Lỗi tải xuống:", event.data.error);
            if (setProgress && typeof setProgress === "function") {
                setProgress(0);
            }
            downloadWorker.terminate();
            downloadWorker = null;

            // Nếu có lỗi (ví dụ CORS hoặc lỗi mạng), fallback tải qua Server Proxy
            //console.warn("⚠️ Chuyển sang tải qua Proxy...");
            fallbackDownload(url, fileName, fileSize, setProgress, userRegion);
        }
    };

    return () => {
        if (downloadWorker) {
            downloadWorker.terminate();
            downloadWorker = null;
            //console.log("⛔ Quá trình tải xuống đã bị hủy.");
        }
    };
}
