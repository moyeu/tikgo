import { useState, useCallback, useMemo } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import SeoMeta from '../components/SeoMeta'; // ✅ Import component SEO metadata
import TikTokDownloader from '../components/TikTokDownloader'; // ✅ Import trực tiếp (Không Lazy-load)

export default function Mp3Download() {
  const { t } = useTranslation('mp3');
  const router = useRouter();
  const [hasResults, setHasResults] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(-1);

  // ✅ Dùng useCallback() để tránh tạo lại hàm mỗi lần render
  const toggleFAQ = useCallback((index) => {
    setOpenFAQ((prev) => (prev === index ? -1 : index));
  }, []);

  // ✅ Lấy nội dung Markdown từ JSON
  const extraLongContent = t('extra_long_content');
  const sumContent = t('sum_content');
  const faqsData = t('extra_faq', { returnObjects: true });
  const faqs = useMemo(() => (Array.isArray(faqsData) ? faqsData : []), [faqsData]);

  // ✅ Tối ưu ReactMarkdown bằng useMemo() để tránh re-render không cần thiết
  const memoizedExtraLongContent = useMemo(() => (
    extraLongContent ? (
      <ReactMarkdown allowedElements={['h2', 'h3', 'h4', 'p', 'ul', 'li', 'strong', 'em', 'a', 'br']}>
        {extraLongContent}
      </ReactMarkdown>
    ) : null
  ), [extraLongContent]);

  const memoizedSumContent = useMemo(() => (
    sumContent ? (
      <ReactMarkdown allowedElements={['p', 'ul', 'li', 'strong', 'em', 'br']}>
        {sumContent}
      </ReactMarkdown>
    ) : null
  ), [sumContent]);

  return (
    <>
      {/* ✅ Thêm SEO Metadata */}
      <SeoMeta pageKey="mp3" />

      <div className="containerWrapper">
        {/* ✅ Chỉ hiển thị navbar, title, description khi chưa có kết quả */}
        {!hasResults && (
          <>
            <nav className="navbar" aria-label="Main Navigation">
              <Link href="/" className={`navItem ${router.asPath === "/" ? "active" : ""}`}>
                <img src="/icons/video-w.svg" alt="Video" width="20" height="20" />
                <span>{t('nav_video')}</span>
              </Link>
              <Link href="/mp3" className={`navItem ${router.asPath === "/mp3" ? "active" : ""}`}>
                <img src="/icons/mp3-w.svg" alt="Music" width="20" height="20" />
                <span>{t('nav_mp3')}</span>
              </Link>
              <Link href="/slide" className={`navItem ${router.asPath === "/slide" ? "active" : ""}`}>
                <img src="/icons/slide-w.svg" alt="Slide" width="20" height="20" />
                <span>{t('nav_slide')}</span>
              </Link>
              <Link href="/story" className={`navItem ${router.asPath === "/story" ? "active" : ""}`}>
                <img src="/icons/story-w.svg" alt="Story" width="20" height="20" />
                <span>{t('nav_story')}</span>
              </Link>
            </nav>

            {/* ✅ Tiêu đề và mô tả */}
            <div className="textContainer">
              <h1 className="title">{t('title')}</h1>
              <p className="description">{t('description')}</p>
            </div>
          </>
        )}

        {/* ✅ Giao diện tải TikTok MP3 */}
        <TikTokDownloader setHasResults={setHasResults} />
      </div>

      {/* ✅ Chỉ hiển thị nội dung mở rộng khi không có kết quả tải xuống */}
      {!hasResults && (
        <div className="container">
          <section className="extraContent">
            {/* ✅ Hiển thị nội dung dài với Markdown đã được memo hóa */}
            {memoizedExtraLongContent && (
              <div className="extraLongContent">
                {memoizedExtraLongContent}
              </div>
            )}

            {/* ✅ FAQ Accordion */}
            <div className="faqAccordion">
              <h4>{t('extra_faq_title')}</h4>
              {faqs.map((faq, index) => (
                <div key={index} className="faqItem">
                  <button className="faqQuestion" onClick={() => toggleFAQ(index)}>
                    {faq.faq_question}
                    <span className="faqIcon">{openFAQ === index ? '-' : '+'}</span>
                  </button>
                  <div className={`faqAnswer ${openFAQ === index ? 'open' : ''}`}>
                    <ReactMarkdown allowedElements={['p', 'strong', 'em', 'br', 'ul', 'a', 'li']}>
                      {faq.faq_answer}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Hiển thị nội dung tóm tắt đã được memo hóa */}
            {memoizedSumContent && (
              <div className="sumContent">
                {memoizedSumContent}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

// ✅ Lấy dữ liệu dịch từ server
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'mp3'], { fallbackLng: 'en' })),
    },
  };
}
