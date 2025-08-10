// workers/worker.js
// Web Worker tải video/audio theo kiểu chia chunk song song + cập nhật tiến trình.
// Hỗ trợ hủy tải bằng AbortController khi nhận message { type: 'cancel' }.

// ======= Fetch options dùng chung (bỏ Referer để tránh 403 hotlink) =======
const FETCH_OPTS = {
  mode: 'cors',
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
  referrer: '',
  credentials: 'omit',
  cache: 'no-store',
  keepalive: false
};

let controller = null;
let canceled = false;

// ======= Tiện ích: thăm dò kích thước file (HEAD, fallback GET range 0-0) =======
async function probeSize(url, signal) {
  let r = await fetch(url, { ...FETCH_OPTS, method: 'HEAD', signal });

  if (!r.ok) {
    r = await fetch(url, {
      ...FETCH_OPTS,
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal
    });
  }
  if (!r.ok) throw new Error(`Probe failed: HTTP ${r.status}`);

  const cr = r.headers.get('content-range');     // "bytes 0-0/TOTAL"
  let size = parseInt(r.headers.get('content-length'), 10);

  if ((!size || Number.isNaN(size)) && cr && /\/(\d+)$/.test(cr)) {
    size = parseInt(RegExp.$1, 10);
  }
  if (!size || Number.isNaN(size)) {
    throw new Error('Không thể xác định kích thước file');
  }
  return size;
}

// ======= Worker entry =======
self.onmessage = async (event) => {
  const data = event.data || {};

  // Yêu cầu hủy từ main thread
  if (data.type === 'cancel') {
    canceled = true;
    try { controller && controller.abort(); } catch (_) {}
    // Thông báo hủy về main thread (để UI reset, không fallback)
    self.postMessage({ canceled: true });
    return;
  }

  // Bắt đầu một lượt tải (giữ tương thích: nếu không gửi type thì coi như 'start')
  const { url, fileSize, parallelChunks = 3 } = data;

  canceled = false;
  controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const signal = controller ? controller.signal : undefined;

  try {
    // 1) Lấy kích thước tổng (nếu chưa có)
    let totalSize = fileSize;
    if (!totalSize) {
      totalSize = await probeSize(url, signal);
    }

    // 2) Chia chunk & tải song song
    const chunkSize = Math.ceil(totalSize / Math.max(1, parallelChunks));
    const chunkPromises = [];
    let receivedBytes = 0;
    let lastReportTime = Date.now();
    let lastReportedBytes = 0;

    for (let i = 0; i < parallelChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize - 1, totalSize - 1);
      if (start > end) break;

      const p = (async () => {
        const res = await fetch(url, {
          ...FETCH_OPTS,
          method: 'GET',
          headers: { Range: `bytes=${start}-${end}` },
          signal
        });

        // Douyin đôi khi trả 200 (không 206); chấp nhận luôn nếu ok
        if (!res.ok || (res.status !== 206 && res.status !== 200)) {
          throw new Error(`Chunk ${start}-${end} failed: HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const parts = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value);
          receivedBytes += value.byteLength;

          // Báo progress ~ mỗi 1s để giảm spam postMessage
          const now = Date.now();
          const elapsed = (now - lastReportTime) / 1000;
          if (elapsed >= 1) {
            const delta = receivedBytes - lastReportedBytes;
            const speedKBs = delta / 1024 / elapsed; // KB/s
            const remain = totalSize - receivedBytes;
            const eta = delta > 0 ? (remain / delta) * elapsed : Infinity;

            self.postMessage({
              progress: Math.floor((receivedBytes / totalSize) * 100),
              speed: speedKBs.toFixed(2),
              remainingTime: isFinite(eta) ? eta.toFixed(2) : '∞'
            });

            lastReportTime = now;
            lastReportedBytes = receivedBytes;
          }
        }
        return new Blob(parts);
      })();

      chunkPromises.push(p);
    }

    const blobs = await Promise.all(chunkPromises);
    const merged = new Blob(blobs);

    // 3) Hoàn tất
    if (!canceled) {
      self.postMessage({ complete: true, blob: merged });
    }
  } catch (err) {
    // Nếu đã hủy hoặc AbortError thì im lặng (đã gửi {canceled:true})
    if (canceled || (err && err.name === 'AbortError')) return;
    self.postMessage({ error: err && err.message ? err.message : String(err) });
  } finally {
    controller = null;
  }
};
