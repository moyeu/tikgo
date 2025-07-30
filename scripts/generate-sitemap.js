/**
 * generate-sitemap.js
 * Tạo file sitemap.xml trong thư mục public/ khi build
 */
const fs = require('fs');
const path = require('path');

// ✅ BASE_URL lấy từ biến môi trường, fallback về https://tikgo.me
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tikgo.me';

// 🌍 Danh sách ngôn ngữ hỗ trợ (tùy chỉnh theo nhu cầu)
const locales = ['en', 'vi', 'id', 'ar', 'de', 'es', 'pt', 'fr', 'it', 'cz', 'tr', 'ja', 'th', 'zh-tw'];

// 🔹 Danh sách các trang chính (trang chủ = '')
const pages = ['', 'mp3', 'slide', 'story', 'about'];

/**
 * Helper: Tạo URL cho một trang + locale.
 * - page = '' → homepage
 *   - 'en' → baseUrl
 *   - locale khác → baseUrl/locale
 * - page != '' → subpage
 *   - 'en' → baseUrl/page
 *   - locale khác → baseUrl/locale/page
 */
function getUrlForLocale(baseUrl, locale, page) {
  if (page === '') {
    // Homepage
    return locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;
  } else {
    // Subpage
    return locale === 'en' ? `${baseUrl}/${page}` : `${baseUrl}/${locale}/${page}`;
  }
}

/**
 * Helper: Tạo các <xhtml:link> alternate cho sitemap
 * Bao gồm x-default + tất cả locales
 */
function generateAlternateLinks(page) {
  // x-default sẽ trỏ về bản tiếng Anh
  let links = `<xhtml:link rel="alternate" hreflang="x-default" href="${getUrlForLocale(baseUrl, 'en', page)}" />\n`;

  // Thêm các locale
  links += locales
    .map(locale => {
      const href = getUrlForLocale(baseUrl, locale, page);
      return `<xhtml:link rel="alternate" hreflang="${locale}" href="${href}" />`;
    })
    .join('\n');

  return links;
}

/**
 * Tạo <url> entry cho sitemap
 * @param {string} loc - URL chính
 * @param {boolean} isHomePage - có phải trang chủ?
 * @param {string} alternateLinks - <xhtml:link ...> alternate
 */
function generateUrlEntry(loc, isHomePage, alternateLinks) {
  const lastmod = new Date().toISOString();    // Lấy ngày giờ hiện tại
  const changefreq = isHomePage ? 'daily' : 'weekly';
  const priority = isHomePage ? '1.0' : '0.8';

  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${alternateLinks}
  </url>`;
}

// ✅ Tạo mảng <url> cho mỗi cặp (locale, page)
const urls = locales.flatMap(locale => {
  return pages.map(page => {
    const isHomePage = page === '';
    const loc = getUrlForLocale(baseUrl, locale, page);
    const alternateLinks = generateAlternateLinks(page);
    return generateUrlEntry(loc, isHomePage, alternateLinks);
  });
});

// ✅ Gộp tất cả <url> vào <urlset> với namespace xhtml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  ${urls.join('\n')}
</urlset>`;

// ✅ Ghi file sitemap.xml vào thư mục public/
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemapContent, 'utf8');

console.log('✅ Sitemap generated successfully!');
