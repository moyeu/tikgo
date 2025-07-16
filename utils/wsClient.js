const WS_URL = 'wss://api.tube5s.com/ws/';  // 🔥 Thay bằng WebSocket backend của bạn

class WebSocketClient {
    constructor() {
        this.socket = null;
        this.userIP = null;
        this.userRegion = null;
        this.onDataReceived = null; // Callback function để gửi dữ liệu về frontend
        this.retryInterval = 5000; // ⏳ Thời gian chờ retry nếu lỗi (5 giây)
        this.maxRetries = 3; // 🚀 Số lần thử lại tối đa nếu kết nối thất bại
        this.retryCount = 0; // 🔄 Biến đếm số lần thử lại
    }

    // ✅ Hàm kết nối WebSocket để lấy IP & Region
    connect() {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                //console.warn("⚠️ WebSocket đã kết nối, không tạo kết nối mới.");
                return resolve({ ip: this.userIP, region: this.userRegion });
            }

            //console.log("🔌 Đang kết nối WebSocket để lấy IP & Region...");
            this.socket = new WebSocket(WS_URL);

            // 📌 Khi kết nối thành công
            this.socket.onopen = () => {
                //console.log("✅ WebSocket đã kết nối!");
                this.retryCount = 0; // 🔄 Reset lại số lần thử lại khi kết nối thành công
            };

            // ❌ Xử lý lỗi WebSocket
            this.socket.onerror = (error) => {
                //console.error("🔥 Lỗi WebSocket:", error);

                if (this.retryCount < this.maxRetries) {
                    //console.warn(`⏳ Thử kết nối lại sau ${this.retryInterval / 1000} giây... (${this.retryCount + 1}/${this.maxRetries})`);
                    setTimeout(() => {
                        this.retryCount++;
                        this.connect();
                    }, this.retryInterval);
                } else {
                    //console.error("❌ Không thể kết nối WebSocket sau nhiều lần thử lại.");
                    reject(error);
                }
            };

            // 📩 Nhận dữ liệu từ WebSocket
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "ip_region") {
                        this.userIP = data.ip;
                        this.userRegion = data.region;
                        //console.log(`🌍 Nhận dữ liệu từ WebSocket: IP=${this.userIP}, Region=${this.userRegion}`);

                        // ✅ Gửi dữ liệu về frontend nếu có callback
                        if (this.onDataReceived) {
                            this.onDataReceived({ ip: this.userIP, region: this.userRegion });
                        }

                        // ✅ Tự động đóng kết nối sau khi nhận dữ liệu
                        this.close();
                        resolve({ ip: this.userIP, region: this.userRegion });
                    }
                } catch (error) {
                    //console.error("❌ Lỗi xử lý dữ liệu WebSocket:", error);
                    reject(error);
                }
            };

            // 📴 Khi WebSocket đóng
            this.socket.onclose = () => {
                //console.log("⚠️ WebSocket đã đóng!");
                this.socket = null; // ✅ Đặt lại trạng thái WebSocket khi bị đóng
            };
        });
    }

    // ✅ Hàm đóng kết nối WebSocket
    close() {
        if (this.socket) {
            //console.log("🔌 Đóng kết nối WebSocket...");
            this.socket.close();
            this.socket = null;
        }
    }

    // ✅ Khởi chạy WebSocket và nhận dữ liệu
    async start(onDataReceived) {
        this.onDataReceived = onDataReceived;
        return this.connect();
    }
}

// ✅ Xuất WebSocket Client để dùng trong frontend
const wsClient = new WebSocketClient();
export default wsClient;
