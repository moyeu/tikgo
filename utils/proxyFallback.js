import AES from "crypto-js/aes";
import SHA256 from "crypto-js/sha256";
import HmacSHA256 from "crypto-js/hmac-sha256";
import { enc, mode, pad, lib } from "crypto-js";
import { getProxyServer } from "./proxyService";

const SECRET_KEY = "d7964ab28a06bd7cf825930bbOYt7aAD";

// 🔹 Chuyển đổi SECRET_KEY sang SHA-256 để khớp với PHP
const KEY_HASH = enc.Hex.parse(SHA256(SECRET_KEY).toString());

export function fallbackDownload(
  url,
  fileName,
  fileSize,
  fileExtension,
  setProgress,
  userRegion,
  userIP
) {
  //console.log("🔍 Debug: `userRegion` nhận trong proxyFallback.js:", userRegion);
  //console.log("🔍 Debug: `userIP` nhận trong proxyFallback.js:", userIP);

  if (!userRegion || userRegion === "Unknown" || userRegion === undefined) {
    //console.warn("⚠️ Không thể xác định khu vực, sử dụng Proxy Châu Âu mặc định.");
    userRegion = "DE";
  }

  const proxyServer = getProxyServer(userRegion);
  //console.log("🔍 Debug: `proxyServer` nhận trong getProxyServer:", proxyServer);

  if (!proxyServer || proxyServer.includes("example.com")) {
    //alert("⚠️ Lỗi hệ thống: Không tìm thấy máy chủ proxy phù hợp. Vui lòng thử lại sau!");
    if (typeof setProgress === "function") {
      setProgress(0);
    }
    return;
  }

  // 🔹 Chuẩn bị payload JSON
  const payload = {
    url,
    fileName,
    fileSize,
    fileExtension,
    userIP,
    timestamp: Date.now(),
  };

  //console.log("📡 Payload trước khi mã hóa:", payload);

  // 🔹 Tạo IV ngẫu nhiên (16 byte)
  const iv = lib.WordArray.random(16);

  // 🔹 Mã hóa AES-256-CBC với IV (KHÔNG gộp IV vào CipherText)
  const encrypted = AES.encrypt(JSON.stringify(payload), KEY_HASH, {
    iv: iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });

  // 🔹 Tạo JSON chứa { iv, data, timestamp }
  const jsonPayload = JSON.stringify({
    iv: enc.Base64.stringify(iv),
    data: encrypted.toString(),
    timestamp: payload.timestamp,
  });

  // 🔹 Mã hóa JSON thành Base64
  const encryptedData = enc.Base64.stringify(enc.Utf8.parse(jsonPayload));

  // 🔹 Tạo chữ ký HMAC-SHA256 để xác thực request
  const signature = HmacSHA256(encryptedData + payload.timestamp, SECRET_KEY).toString(enc.Hex);

  // 🔹 Lưu encryptedData vào LocalStorage để lấy cho test.php
  localStorage.setItem("debug_encryptedData", encryptedData);

  // 🔹 Hiển thị log chi tiết để copy
  //console.log("✅ Lưu encryptedData vào localStorage: debug_encryptedData");
  //console.log("📌 Copy giá trị này để nhập vào `test.php`:");
  //console.log("🔑 Encrypted Data:", encryptedData);
  //console.log("🔏 Signature:", signature);
  //console.log("📡 Timestamp:", payload.timestamp);

  // 🔹 Gửi dữ liệu lên Proxy Server bằng Form POST
  const finalUrl = `${proxyServer}/download`;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = finalUrl;
  form.target = "_blank";

  const inputEncryptedData = document.createElement("input");
  inputEncryptedData.type = "hidden";
  inputEncryptedData.name = "encryptedData";
  inputEncryptedData.value = encryptedData;
  form.appendChild(inputEncryptedData);

  const inputTimestamp = document.createElement("input");
  inputTimestamp.type = "hidden";
  inputTimestamp.name = "timestamp";
  inputTimestamp.value = payload.timestamp;
  form.appendChild(inputTimestamp);

  const inputSignature = document.createElement("input");
  inputSignature.type = "hidden";
  inputSignature.name = "signature";
  inputSignature.value = signature;
  form.appendChild(inputSignature);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
