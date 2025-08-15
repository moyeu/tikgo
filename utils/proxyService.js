// utils/proxyService.js
// Minimal change: PROXY_SERVERS now arrays; provide random or round-robin pick.
// Không đổi signature getProxyServer(region)

const USE_ROUND_ROBIN = false; // false = random (mặc định). true = round-robin.
const DEFAULT_PROXY = "https://sv2.tube5s.com";

const PROXY_SERVERS = {
  America: ["https://sv2.tube5s.com"],   // giữ dưới dạng mảng để dễ mở rộng
  Europe:  ["https://sv2.tube5s.com"],   // thay đổi nếu bạn có servers cho EU
  Asia:    ["https://sv2.tube5s.com", "https://sv4.tube5s.com"] // <- bổ sung sv2 + sv4
};

// module-level counters for round-robin (per-region)
const rrCounters = {
  America: 0,
  Europe: 0,
  Asia: 0
};

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

function pickRoundRobin(list, regionKey) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const key = regionKey in rrCounters ? regionKey : 'Asia';
  const idx = rrCounters[key] % list.length;
  rrCounters[key] = (rrCounters[key] + 1) % (Number.MAX_SAFE_INTEGER >>> 0); // avoid overflow
  return list[idx];
}

// public
export function getProxyServer(region) {
  // Normalize region input
  const r = (region || '').toString().toUpperCase().trim();

  // Helper to select list by region
  let list;
  if (["US", "CA", "MX"].includes(r)) {
    list = PROXY_SERVERS.America;
  } else if (["FR", "DE", "GB", "ES", "IT", "NL"].includes(r)) {
    list = PROXY_SERVERS.Europe;
  } else if (["VN", "JP", "KR", "CN", "TH", "SG", "ID", "IN"].includes(r)) {
    list = PROXY_SERVERS.Asia;
  } else {
    // default -> Asia
    list = PROXY_SERVERS.Asia;
  }

  if (!Array.isArray(list) || list.length === 0) {
    //console.warn('[proxyService] proxy list empty — using default', { region, DEFAULT_PROXY });
    // safe fallback: last-resort single URL (kept as before)
  return DEFAULT_PROXY;
  }

  // Pick using configured strategy
  if (USE_ROUND_ROBIN) {
    return pickRoundRobin(list, (list === PROXY_SERVERS.Asia ? 'Asia' : (list === PROXY_SERVERS.Europe ? 'Europe' : 'America')));
  } else {
    return pickRandom(list);
  }
}
