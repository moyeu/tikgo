const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi', 'id', 'ar', 'de', 'es', 'pt', 'fr', 'it', 'cz', 'tr', 'ja', 'zh', 'th'],
    localeDetection: false,
    fallbackLng: { // ✅ Đặt fallbackLng vào trong i18n
      'zh-tw': ['zh-tw', 'zh'], // Nếu không có zh-tw thì thử zh trước
      default: ['en'], // Ngôn ngữ mặc định fallback là tiếng Anh
    },
  },
  localePath: path.resolve('./public/locales'), // ✅ Đường dẫn đúng
};
