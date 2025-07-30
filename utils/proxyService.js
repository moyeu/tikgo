// Danh sách Proxy Server theo khu vực
const PROXY_SERVERS = {
    America: "https://sv2.tube5s.com",
    Europe: "https://sv2.tube5s.com",
    Asia: "https://sv2.tube5s.com"
};

// Hàm lấy Proxy Server dựa vào khu vực user (dữ liệu từ API server)
export function getProxyServer(region) {
	//console.log("🔍 Debug: `userRegion` khi gọi getProxyServer:", region);
    if (["US", "CA", "MX"].includes(region)) return PROXY_SERVERS.America;
    if (["FR", "DE", "GB", "ES", "IT", "NL"].includes(region)) return PROXY_SERVERS.Europe;
    if (["VN", "JP", "KR", "CN", "TH", "SG", "ID", "IN"].includes(region)) return PROXY_SERVERS.Asia;

    return PROXY_SERVERS.Asia; // Mặc định chọn Proxy Châu Á nếu không xác định được
}
