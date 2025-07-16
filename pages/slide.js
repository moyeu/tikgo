import { useState, useCallback, useMemo } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import SeoMeta from '../components/SeoMeta'; // ✅ Import component SEO metadata
import TikTokDownloader from '../components/TikTokDownloader'; // ✅ Import trực tiếp mà không lazy-load

export default function SlideDownload() {
  const { t } = useTranslation('slide');
  const router = useRouter();
  const [hasResults, setHasResults] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(-1);

  // ✅ Dùng useCallback() để tránh tạo lại hàm mỗi lần render
  const toggleFAQ = useCallback((index) => {
    setOpenFAQ((prev) => (prev === index ? -1 : index));
  }, []);

  // ✅ Lấy dữ liệu từ JSON
  const nav_video = t('nav_video');
  const nav_mp3 = t('nav_mp3');
  const nav_slide = t('nav_slide');
  const nav_story = t('nav_story');
  const title = t('title');
  const description = t('description');
  const extraLongContent = t('extra_long_content');
  const sumContent = t('sum_content');
  const faqsData = t('extra_faq', { returnObjects: true });

  // ✅ Dùng useMemo() để tránh tạo lại danh sách faqs mỗi lần render
  const faqs = useMemo(() => (Array.isArray(faqsData) ? faqsData : []), [faqsData]);

  // ✅ Dùng useMemo() để tránh re-render không cần thiết cho ReactMarkdown
  const memoizedExtraLongContent = useMemo(() => (
    extraLongContent ? (
      <ReactMarkdown allowedElements={['h4', 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'img', 'br']}>
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
      <SeoMeta pageKey="slide" />

      <div className="containerWrapper">
        {/* ✅ Chỉ hiển thị navbar, title, description khi chưa có kết quả */}
        {!hasResults && (
          <>
            <nav className="navbar" aria-label="Main Navigation">
              <Link href="/" className={`navItem ${router.asPath === "/" ? "active" : ""}`}>
                <img src="/icons/video-w.svg" alt="Video" width="20" height="20" />
                <span>{nav_video}</span>
              </Link>
              <Link href="/mp3" className={`navItem ${router.asPath === "/mp3" ? "active" : ""}`}>
                <img src="/icons/mp3-w.svg" alt="Music" width="20" height="20" />
                <span>{nav_mp3}</span>
              </Link>
              <Link href="/slide" className={`navItem ${router.asPath === "/slide" ? "active" : ""}`}>
                <img src="/icons/slide-w.svg" alt="Slide" width="20" height="20" />
                <span>{nav_slide}</span>
              </Link>
              <Link href="/story" className={`navItem ${router.asPath === "/story" ? "active" : ""}`}>
                <img src="/icons/story-w.svg" alt="Story" width="20" height="20" />
                <span>{nav_story}</span>
              </Link>
            </nav>

            {/* ✅ Tiêu đề và mô tả */}
            <div className="textContainer">
              <h1 className="title">{title}</h1>
              <p className="description">{description}</p>
            </div>
          </>
        )}

        {/* ✅ Giao diện tải TikTok slideshow / images */}
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
                    <ReactMarkdown allowedElements={['p', 'strong', 'em', 'br', 'ul', 'li']}>
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
      ...(await serverSideTranslations(locale, ['common', 'slide'], { fallbackLng: 'en' })),
    },
  };
}
