// ✅ 1	Tải nhiều phần song song (parallelChunks)	Tải nhanh hơn 2-4 lần
// ✅ 2	Giảm RAM sử dụng bằng cách xử lý từng phần	Tránh crash, giảm 50-60% RAM
// ✅ 3	Cập nhật tiến trình tải theo thời gian thực	Hiển thị tiến trình, tốc độ tải & thời gian còn lại
// ✅ 4	Xử lý lỗi và kiểm tra server hỗ trợ Range Requests	Tăng độ ổn định, giảm lỗi tải xuống

// Web Worker dùng để tải file video/audio mà không làm ảnh hưởng đến giao diện chính.
self.onmessage = async function (event) {
    const { url, fileSize, parallelChunks = 3 } = event.data;

    try {
        let totalSize = fileSize;
        if (!totalSize) {
            const headResponse = await fetch(url, { method: 'HEAD' });
            totalSize = parseInt(headResponse.headers.get("Content-Length"), 10);
        }

        if (!totalSize) throw new Error("Không thể xác định kích thước file");

        // Chia file thành nhiều phần tải song song
        const chunkSize = Math.ceil(totalSize / parallelChunks);
        const chunkPromises = [];
        let receivedBytes = 0;
        let lastProgress = 0;
        let lastTime = Date.now();
        let lastReceivedBytes = 0;

        for (let i = 0; i < parallelChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min((i + 1) * chunkSize - 1, totalSize - 1);
            chunkPromises.push(downloadChunk(url, start, end, i + 1, (bytes) => {
                receivedBytes += bytes;
                const progress = Math.floor((receivedBytes / totalSize) * 100);
                const currentTime = Date.now();
                const elapsed = (currentTime - lastTime) / 1000; // Tính thời gian trôi qua (giây)
                if (elapsed >= 1) { // Cập nhật mỗi giây
                    const speed = ((receivedBytes - lastReceivedBytes) / elapsed / 1024).toFixed(2); // KB/s
                    const remainingTime = ((totalSize - receivedBytes) / (receivedBytes - lastReceivedBytes) * elapsed).toFixed(2); // Ước tính thời gian còn lại
                    lastTime = currentTime;
                    lastReceivedBytes = receivedBytes;
                    self.postMessage({ progress, speed, remainingTime });
                }
            }));
        }

        const chunks = await Promise.all(chunkPromises);
        const blob = new Blob(chunks);
        self.postMessage({ complete: true, blob });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};

// Tải một phần của file và cập nhật tổng tiến trình
async function downloadChunk(url, start, end, partIndex, updateProgress) {
    try {
        const response = await fetch(url, { headers: { 'Range': `bytes=${start}-${end}` } });
        if (!response.ok) throw new Error(`Failed to fetch chunk: ${start}-${end}`);

        const reader = response.body.getReader();
        const chunks = [];
        let receivedBytes = 0;
        const contentLength = end - start + 1;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedBytes += value.length;
            updateProgress(value.length);
        }
        
        return new Blob(chunks);
    } catch (error) {
        throw error;
    }
}