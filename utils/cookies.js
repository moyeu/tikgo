 export const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}; 
/*
export const setCookie = (name, value, minutes) => {
  const date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000); // 🔥 Chỉnh thành phút thay vì ngày
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};
*/

export const getCookie = (name) => {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    let [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
};
