// ✅ Danh sách ngôn ngữ được hỗ trợ
const LOCALE_MAPPING = {
  en: "en",
  vi: "vi",
  id: "id",
  ar: "ar", 
  de: "de",
  es: "es",
  pt: "pt",
  fr: "fr",
  it: "it",
  cz: "cz",
  tr: "tr",
  ja: "ja",
  th: "th",
  "zh-TW": "zh"
};

const SUPPORTED_LOCALES = Object.keys(LOCALE_MAPPING);

/**
 * ✅ Hàm tạo danh sách thẻ hreflang & canonical cho SEO đa ngôn ngữ
 *
 * @param {string} baseUrl  - URL gốc, vd: "https://tikgo.me"
 * @param {string} locale   - Mã locale hiện tại, vd: "en", "vi"...
 * @param {string} asPath   - Đường dẫn hiện tại, vd: "/mp3", "/vi/mp3", ...
 * @param {string[]} locales - Danh sách các locale hỗ trợ
 * @returns {object} { canonical, hreflangs: [] }
 */
export function getSeoLinks(baseUrl, locale, asPath, locales = []) {
  // Bỏ dấu / nếu có ở cuối path
  const cleanPath = asPath.replace(/\/$/, '');

  // ✅ Hàm tạo URL cho một locale cụ thể
  // Nếu là 'en' => baseUrl + cleanPath
  // Ngược lại => baseUrl + '/' + locale + cleanPath
  function makeUrlFor(lng) {
    return lng === 'en'
      ? `${baseUrl}${cleanPath}`
      : `${baseUrl}/${lng}${cleanPath}`;
  }

  // ✅ URL canonical cho trang hiện tại
  const canonical = makeUrlFor(locale);

  // ✅ Xác định URL mặc định (coi tiếng Anh là default)
  const defaultUrl = makeUrlFor('en');

  // ✅ Tạo mảng hreflang
  // - x-default => URL tiếng Anh của nội dung
  // - en => URL tiếng Anh
  // - các locale khác => URL tương ứng
  const hreflangs = [
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: defaultUrl,
    },
    {
      rel: "alternate",
      hrefLang: "en",
      href: defaultUrl,
    },
    ...(
      Array.isArray(locales)
        ? locales
            .filter(lng => lng !== 'en')
            .map(lng => ({
              rel: "alternate",
              hrefLang: LOCALE_MAPPING[lng] || lng,
              href: makeUrlFor(lng),
            }))
        : []
    ),
  ];

  return { canonical, hreflangs };
}


/**
 * ✅ Hàm tạo meta title, description, Open Graph, Twitter Card theo từng trang và ngôn ngữ
 */
export function getMetaTags(pageKey, baseUrl, locale, t) {
  const metaTitle = t('meta_title', { defaultValue: "Default Page Title" });
  const metaDescription = t('meta_description', { defaultValue: "Default description for this page." });
  const metaKeywords = t('meta_keywords', { defaultValue: "tiktok downloader, tiktok video downloader, download tiktok video, save tiktok" });
  
  // Nếu pageKey là "video" (homepage) thì không thêm đường dẫn "/video"
  const path = (pageKey && pageKey !== 'video') ? `/${pageKey}` : '';
  
  // Tính canonical URL dựa trên ngôn ngữ và pageKey
  const canonicalUrl = locale === 'en' 
    ? `${baseUrl}${path}` 
    : `${baseUrl}/${locale}${path}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    copyright: `© ${new Date().getFullYear()} ${baseUrl.replace('https://', '')}`,

    // Open Graph Meta Tags
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogImage: `${baseUrl}/thumbnail.jpg`,
    ogImageWidth: "1200",
    ogImageHeight: "630",
    ogUrl: canonicalUrl, // Đồng bộ với canonical URL
    ogSiteName: baseUrl.replace('https://', ''),
    ogLocale: LOCALE_MAPPING[locale] || "en_US",
    ogLocaleAlternate: SUPPORTED_LOCALES
      .filter(lng => lng !== locale)
      .map(lng => LOCALE_MAPPING[lng] || lng),

    // Twitter Card
    twitterCard: "summary_large_image",
    twitterTitle: metaTitle,
    twitterDescription: metaDescription,
    twitterImage: `${baseUrl}/thumbnail.jpg`,
    twitterSite: baseUrl.replace('https://', ''),
  };
}



/**
 * ✅ Hàm tạo WebSite Schema (MỚI BỔ SUNG)
 */
export function getWebSiteSchema(baseUrl, locale, t) {
  const canonicalUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": t("website_name", { defaultValue: "TikGo Downloader" }),
    "url": canonicalUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${canonicalUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}


/**
 * ✅ Hàm tạo structured data WebPage Schema
 */
export function getStructuredData(pageKey, baseUrl, locale, t) {
  // Nếu pageKey là "video" (homepage) thì không thêm đường dẫn "/video"
  const path = (pageKey && pageKey !== 'video') ? `/${pageKey}` : '';
  
  // Tính canonical URL dựa trên ngôn ngữ và pageKey
  const canonicalUrl = locale === 'en'
    ? `${baseUrl}${path}`
    : `${baseUrl}/${locale}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('meta_title', { defaultValue: "Default Page Title" }),
    "description": t('meta_description', { defaultValue: "Default description for this page." }),
    "url": canonicalUrl,
  };
}

/**
 * ✅ Hàm tạo structured data Breadcrumb Schema từ canonical URL
 * @param {string} canonicalUrl - URL chính thức của trang (ví dụ: "https://tikgo.me/vi/mp3")
 * @returns {object} - Breadcrumb Schema theo định dạng JSON-LD
 */
export function getBreadcrumbSchemaFromCanonical(canonicalUrl) {
  // Sử dụng đối tượng URL để phân tích canonicalUrl
  const urlObj = new URL(canonicalUrl);
  // Tách các phần của đường dẫn (pathname) và loại bỏ các phần rỗng
  const segments = urlObj.pathname.split('/').filter(Boolean);
  
  // Xác định homeUrl dựa trên các segment
  // Nếu segment đầu tiên là mã ngôn ngữ (2 ký tự), homeUrl = origin + "/" + segment đó
  let homeUrl = urlObj.origin;
  if (segments.length > 0 && /^[a-z]{2}$/i.test(segments[0])) {
    homeUrl += `/${segments[0]}`;
    // Loại bỏ segment đầu tiên khỏi danh sách vì đã được sử dụng cho homeUrl
    segments.shift();
  }
  
  // Tạo danh sách breadcrumb
  const itemListElement = [];
  
  // Mục "Home" với vị trí 1
  itemListElement.push({
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": homeUrl,
  });
  
  // Xây dựng breadcrumb cho các segment còn lại
  let currentPath = homeUrl;
  segments.forEach((seg, index) => {
    currentPath += `/${seg}`;
    itemListElement.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": seg.replace(/-/g, ' '), // chuyển "-" thành khoảng trắng nếu cần
      "item": currentPath,
    });
  });
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement,
  };
}


/**
 * ✅ FAQ Schema
 */
export function getFAQSchema(pageKey, t) {
  const faqsData = t('extra_faq', { returnObjects: true });
  const faqs = Array.isArray(faqsData) ? faqsData : [];

  if (faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.faq_question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.faq_answer
      }
    }))
  };
}


/**
 * ✅ Organization Schema
 */
export function getOrganizationSchema(baseUrl, locale, t) {
  const canonicalUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": t("organization_name", { defaultValue: "TikGo - TikTok Downloader" }),
    "url": canonicalUrl,
    "logo": `${baseUrl}/logo.png`,
    "email": t("organization_email", { defaultValue: "support@tikgo.me" }),
    "alternateName": [
      t("alt_name_1", { defaultValue: "TikTok downloader" }),
      t("alt_name_2", { defaultValue: "TikGo" }),
      t("alt_name_3", { defaultValue: "TikTok Video Downloader" }),
      t("alt_name_4", { defaultValue: "TikTok Video Downloader Without Watermark" }),
      t("alt_name_5", { defaultValue: "TikTok Story Viewer Anonymous" })
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": t("organization_email", { defaultValue: "support@tikgo.me" }),
      "contactType": "customer service",
      "availableLanguage": ["English", "Vietnamese"]
    },
    "sameAs": [
      "https://www.facebook.com/tikgo.me",
      "https://twitter.com/tikgome"
    ]
  };
}


/**
 * ✅ WebApplication Schema
 */
export function getWebAppSchema(baseUrl, locale, t) {
  const canonicalUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": t("webapp_name", { defaultValue: "TikGo - TikTok Downloader" }),
    "url": canonicalUrl,
    "image": `${baseUrl}/logo.png`,
    "operatingSystem": "Windows, Linux, iOS, Android, macOS",
    "applicationCategory": "UtilitiesApplication",
    "applicationSubCategory": "TikTok Downloader",
    "description": t("webapp_description", { defaultValue: "Download TikTok videos easily." }),
    "featureList": [
      t("feature_1", { defaultValue: "No watermark" }),
      t("feature_2", { defaultValue: "HD Quality" }),
      t("feature_3", { defaultValue: "HD Quality" }),
      t("feature_4", { defaultValue: "HD Quality" }),
      t("feature_5", { defaultValue: "Fast & Free" })
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "161382"
    },
    "offers": {
      "@type": "Offer",
      "price": 0,
      "priceCurrency": "USD"
    }
  };
}


/**
 * ✅ Service Schema
 */
export function getServiceSchema(baseUrl, pageKey, locale, t) {
  // Xác định phần đường dẫn của trang (ví dụ: "/slide" nếu pageKey là "slide")
  const path = pageKey ? `/${pageKey}` : '';
  
  // Tính canonical URL dựa trên ngôn ngữ và pageKey
  const canonicalUrl = locale === 'en'
    ? `${baseUrl}${path}`
    : `${baseUrl}/${locale}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": t("service_name", { defaultValue: "TikTok Video Downloader" }),
    "provider": {
      "@type": "Organization",
      "name": t("organization_name", { defaultValue: "TikGo" }),
      "url": canonicalUrl
    },
    "serviceType": t("service_type", { defaultValue: "Download TikTok Videos" }),
    "serviceOutput": t("service_output", { defaultValue: "MP4 video files" })
  };
}


/**
 * ✅ HowTo Schema

export function getHowToSchema(baseUrl, locale, t) {
    // Lấy dữ liệu từ JSON
    const howtoTitle = t("howto_title", { defaultValue: "" });
    const howtoDescription = t("howto_description", { defaultValue: "" });
    const howtoImage = t("howto_image", { defaultValue: `${baseUrl}/images/tutorial.jpg` });

    // Kiểm tra nếu không có dữ liệu, return null để tránh lỗi
    if (!howtoTitle || !t("howto_step1.title", { defaultValue: "" })) {
        return null;
    }

    // Tạo danh sách các bước (steps)
    const steps = [];
    for (let i = 1; i <= 5; i++) {
        const stepTitle = t(`howto_step${i}.title`, { defaultValue: "" });
        const stepDescription = t(`howto_step${i}.description`, { defaultValue: "" });
        const stepImage = t(`howto_step${i}.image`, { defaultValue: `${baseUrl}/images/step${i}.jpg` });

        if (stepTitle && stepDescription) {
            steps.push({
                "@type": "HowToStep",
                "name": stepTitle,
                "text": stepDescription,
                "image": stepImage
            });
        }
    }

    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": howtoTitle,
        "description": howtoDescription,
        "image": howtoImage,
        "totalTime": "PT1M",
        "step": steps
    };
}
 */
