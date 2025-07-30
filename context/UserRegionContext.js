import { createContext, useContext, useEffect, useState } from 'react';
import wsClient from '../utils/wsClient'; // ✅ Import WebSocket Client

// ✅ Tạo Context
const UserRegionContext = createContext();

// ✅ Hook dùng trong component để lấy `userRegion`, `userIP` & `loading`
export function useUserRegion() {
    return useContext(UserRegionContext);
}

// ✅ Provider cho toàn bộ ứng dụng
export function UserRegionProvider({ children }) {
    const [userRegion, setUserRegion] = useState("Unknown");
    const [userIP, setUserIP] = useState("0.0.0.0");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //console.log("🔌 Kết nối WebSocket để lấy IP & Region...");

        // Kết nối WebSocket để lấy IP & Region từ backend
        wsClient.start(({ ip, region }) => {
            if (ip && region) {
                setUserIP(ip);
                setUserRegion(region);
                setLoading(false);
                //console.log("🌍 Cập nhật từ WebSocket - IP:", ip, "| Region:", region);
            } else {
                //console.error("⚠️ Không nhận được dữ liệu từ WebSocket!");
            }
        });

        return () => {
            wsClient.close(); // ✅ Đóng WebSocket khi unmount
        };
    }, []);

    return (
        <UserRegionContext.Provider value={{ userRegion, userIP, loading, setUserRegion }}>
            {children}
        </UserRegionContext.Provider>
    );
}
