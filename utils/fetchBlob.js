import { fallbackDownload } from './proxyFallback';

export function fetchAndDownload(
  url,
  fileName = 'video.mp4',
  _fileSize,
  setProgress,
  userRegion
) {
  const controller = new AbortController();
  const { signal } = controller;

  async function streamAndSave() {
    try {
      // 👉 Ẩn Referer để tránh Douyin 403
      const response = await fetch(url, {
        mode: 'cors',
        signal,
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported');

      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total && setProgress) {
          setProgress(Math.floor((received / total) * 100));
        }
      }

      const blob = new Blob(chunks);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      if (setProgress) setProgress(100);
    } catch (error) {
      // ⛔️ Người dùng bấm “Cancel” → AbortError → KHÔNG fallback
      const isUserAbort = error?.name === 'AbortError' || signal.aborted;
      if (setProgress) setProgress(0);
      if (isUserAbort) return;

      // ⤵️ CDN thật sự lỗi → bật proxy
      fallbackDownload(url, fileName, _fileSize, setProgress, userRegion);
    }
  }

  streamAndSave();
  // Hàm hủy để component gọi khi user nhấn Cancel
  return () => controller.abort();
}
