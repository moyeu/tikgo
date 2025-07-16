import Head from 'next/head';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
    getMetaTags, 
    getSeoLinks, 
    getStructuredData, 
    getFAQSchema, 
    getBreadcrumbSchemaFromCanonical, // <-- Sử dụng hàm mới
    getOrganizationSchema, 
    getServiceSchema, 
    getWebSiteSchema,
    getWebAppSchema,
    // getHowToSchema ✅ Import HowTo Schema
} from '../utils/seo';

export default function SeoMeta({ pageKey }) {
    const router = useRouter();
    const { locale, locales, asPath } = router;
    const { t } = useTranslation(pageKey);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tikgo.me';

    // ✅ Tính toán SEO metadata
    const meta = useMemo(() => getMetaTags(pageKey, baseUrl, locale, t), [pageKey, baseUrl, locale]);
    const structuredData = useMemo(() => getStructuredData(pageKey, baseUrl, locale, t), [pageKey, baseUrl, locale]);
    const faqSchema = useMemo(() => ['video', 'mp3', 'slide', 'story'].includes(pageKey) ? getFAQSchema(pageKey, t) : null, [pageKey, t]);
    const seoLinks = useMemo(() => getSeoLinks(baseUrl, locale, asPath, locales), [baseUrl, locale, asPath, locales]);
    const canonical = seoLinks.canonical;
    const hreflangs = useMemo(() => seoLinks.hreflangs, [seoLinks]);

    // ✅ Kiểm tra loại trang hiện tại
    const isHomePage = pageKey === 'video'; // Trang chủ tải video
    const isServicePage = ['mp3', 'slide', 'story'].includes(pageKey); // Trang tải nội dung
    const isAboutPage = pageKey === 'about'; // Trang About
    const isPolicyPage = ['privacy-policy', 'contact', 'terms'].includes(pageKey); // Trang chính sách, liên hệ

    // ✅ Chỉ tải schema phù hợp cho từng trang
    const organizationSchema = useMemo(() => (isHomePage || isAboutPage) ? getOrganizationSchema(baseUrl, locale, t) : null, [isHomePage, isAboutPage, baseUrl, locale, t]);
    const serviceSchema = useMemo(() => isServicePage ? getServiceSchema(baseUrl, pageKey, locale, t) : null, [isServicePage, baseUrl, pageKey, locale, t]);
    const webSiteSchema = useMemo(() => isHomePage ? getWebSiteSchema(baseUrl, locale, t) : null, [isHomePage, baseUrl, locale, t]);
    const webAppSchema = useMemo(() => isHomePage ? getWebAppSchema(baseUrl, locale, t) : null, [isHomePage, baseUrl, locale, t]);
    
    // ✅ Sử dụng hàm getBreadcrumbSchemaFromCanonical để tạo Breadcrumb Schema
    const breadcrumbSchema = useMemo(() => getBreadcrumbSchemaFromCanonical(canonical), [canonical]);

    /* ✅ Gọi HowTo Schema với kiểm tra dữ liệu hợp lệ
    const howToSchema = useMemo(() => {
        if (['video', 'mp3', 'slide', 'story'].includes(pageKey)) {
            const schema = getHowToSchema(baseUrl, locale, t);
            return schema && schema.step.length > 0 ? schema : null;
        }
        return null;
    }, [pageKey, baseUrl, locale, t]);
	*/
    return (
        <Head>
            {/* ✅ Meta cơ bản */}
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
            <meta charSet="UTF-8" />
            <meta httpEquiv="Content-Language" content={locale} />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="keywords" content={meta.keywords} />
            <meta name="robots" content={meta.robots} />
            <meta name="copyright" content={meta.copyright} />
            <meta httpEquiv="Last-Modified" content={new Date().toUTCString()} />
			<meta httpEquiv="Cache-Control" content="max-age=86400, must-revalidate" />

            {/* ✅ Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={meta.ogTitle} />
            <meta property="og:description" content={meta.ogDescription} />
            <meta property="og:image" content={meta.ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:url" content={meta.ogUrl} />
            <meta property="og:site_name" content={meta.ogSiteName} />
            <meta property="og:locale" content={meta.ogLocale} />
            {Array.isArray(meta.ogLocaleAlternate) &&
				meta.ogLocaleAlternate.map((altLocale, index) => (
					<meta key={`og-locale-${index}`} property="og:locale:alternate" content={altLocale} />
			))}

            {/* ✅ Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={meta.ogTitle} />
            <meta name="twitter:description" content={meta.ogDescription} />
            <meta name="twitter:image" content={meta.ogImage} />
            <meta name="twitter:site" content="@tikgo_me" />
            <meta name="twitter:creator" content="@tikgo_me" />

            {/* ✅ Canonical & Hreflang */}
            <link rel="canonical" href={canonical} />
            {hreflangs.map((tag, index) => (
                <link key={index} rel={tag.rel} hrefLang={tag.hrefLang} href={tag.href} />
            ))}

            {/* ✅ Favicon */}
            <link rel="icon" type="image/x-icon" href={`${baseUrl}/favicon.ico`} />
			<link rel="icon" type="image/png" sizes="16x16" href={`${baseUrl}/favicon-16x16.png`} />
			<link rel="icon" type="image/png" sizes="32x32" href={`${baseUrl}/favicon-32x32.png`} />
			<link rel="icon" type="image/png" sizes="192x192"  href={`${baseUrl}/android-icon-192x192.png`} />
			<link rel="apple-touch-icon" type="image/png" href={`${baseUrl}/apple-touch-icon.png`} />
			
            {/* ✅ Schema Markup */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {webSiteSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />}
            {webAppSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />}
            {organizationSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />}
            {serviceSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />}
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
            {/*{howToSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />}  ✅ Đảm bảo HowTo Schema hoạt động đúng */}
        </Head>
    );
}
