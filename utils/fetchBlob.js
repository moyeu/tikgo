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
            const response = await fetch(url, { mode: 'cors', signal });
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
                if (total && setProgress && typeof setProgress === 'function') {
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

            if (setProgress && typeof setProgress === 'function') {
                setProgress(100);
            }
        } catch (error) {
            if (setProgress && typeof setProgress === 'function') {
                setProgress(0);
            }
            fallbackDownload(url, fileName, _fileSize, setProgress, userRegion);
        }
    }

    streamAndSave();

    return () => controller.abort();
}