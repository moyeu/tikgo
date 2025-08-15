// utils/proxyFallback.js
import AES from "crypto-js/aes";
import SHA256 from "crypto-js/sha256";
import HmacSHA256 from "crypto-js/hmac-sha256";
import { enc, mode as cipherMode, pad, lib } from "crypto-js";
import { getProxyServer } from "./proxyService";

const SECRET_KEY = "d7964ab28a06bd7cf825930bbOYt7aAD";

// Chuyển SECRET_KEY sang SHA-256 để khớp phía server
const KEY_HASH = enc.Hex.parse(SHA256(SECRET_KEY).toString());

// (Giữ lại nếu sau này bạn muốn dùng iframe)
function ensureDownloadIframe(name = "tikgo_dl_iframe") {
  let iframe = document.querySelector(`iframe[name="${name}"]`);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = name;
    iframe.id = name;
    iframe.style.display = "none";
    iframe.width = 0;
    iframe.height = 0;
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);
  }
  return name;
}

// ✅ Tự quyết định target: ưu tiên options.target, sau đó localStorage, mặc định là 'self'
function resolveTarget(options) {
  // 1) Caller override (giữ tương thích cũ)
  if (options && options.target) return String(options.target).toLowerCase();

  // 2) Cho phép cấu hình runtime (không bắt buộc)
  try {
    const v = localStorage.getItem("tikgo_fallback_target");
    if (v && /^(iframe|newtab|self)$/i.test(v)) return v.toLowerCase();
  } catch (_) {}

  // 3) Mặc định: luôn 'self' (ép điều hướng trong tab hiện tại)
  return "self";
}

/**
 * Fallback qua proxy server (POST form)
 *
 * @param {string} url
 * @param {string} fileName
 * @param {number} fileSize
 * @param {string} fileExtension
 * @param {function} setProgress
 * @param {string} userRegion
 * @param {string} userIP
 * @param {object} [options] // tùy chọn, vẫn hỗ trợ để tương thích
 */
export function fallbackDownload(
  url,
  fileName,
  fileSize,
  fileExtension,
  setProgress,
  userRegion,
  userIP,
  options
) {
  // ⛏️ Fix (B): BỎ ép "DE" — giữ nguyên userRegion nếu undefined/Unknown
  /**console.debug("[proxyFallback] start", {
    url: typeof url === "string" ? url.slice(0, 120) : url,
    fileName,
    fileSize,
    fileExtension,
    userRegion,
  });
  */

  const proxyServer = getProxyServer(userRegion);
  //console.debug("[proxyFallback] selected proxy", { proxyServer, userRegion });

  if (!proxyServer || proxyServer.includes("example.com")) {
    //console.warn("[proxyFallback] invalid proxy server, aborting.", { proxyServer });
    if (typeof setProgress === "function") setProgress(0);
    return;
  }

  // Payload gửi proxy
  const payload = {
    url,
    fileName,
    fileSize,
    fileExtension,
    userIP,
    timestamp: Date.now(),
  };

  // IV ngẫu nhiên (16 byte)
  const iv = lib.WordArray.random(16);

  // Mã hóa AES-256-CBC (key = SHA256(secret)), IV tách riêng
  const encrypted = AES.encrypt(JSON.stringify(payload), KEY_HASH, {
    iv,
    mode: cipherMode.CBC,
    padding: pad.Pkcs7,
  });

  // Gói {iv, data, timestamp} rồi Base64
  const jsonPayload = JSON.stringify({
    iv: enc.Base64.stringify(iv),
    data: encrypted.toString(),
    timestamp: payload.timestamp,
  });
  const encryptedData = enc.Base64.stringify(enc.Utf8.parse(jsonPayload));

  // Ký HMAC-SHA256
  const signature = HmacSHA256(
    encryptedData + payload.timestamp,
    SECRET_KEY
  ).toString(enc.Hex);

  // Debug tùy chọn
  try {
    // localStorage.setItem("debug_encryptedData", encryptedData);
    //console.debug("[proxyFallback] payload encrypted & stored to localStorage", { ts: payload.timestamp });
  } catch (_) {
    //console.debug("[proxyFallback] localStorage not available for debug_encryptedData");
  }

  // URL nhận tải
  const finalUrl = `${proxyServer}/download`;

  // --- Quyết định target submit ---
  const targetMode = resolveTarget(options); // 'self' mặc định
  let targetName = "_self";

  if (targetMode === "iframe") {
    targetName = ensureDownloadIframe(options?.iframeName || "tikgo_dl_iframe");
  } else if (targetMode === "newtab") {
    targetName = options?.preOpenedName || "_blank";
  } else {
    // 'self'
    targetName = "_self";
  }

  // console.debug("[proxyFallback] submit", { targetMode, targetName, finalUrl });

  // Submit form POST
  const form = document.createElement("form");
  form.method = "POST";
  form.action = finalUrl;
  form.target = targetName;

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

  //console.debug("[proxyFallback] form submitted");
}
