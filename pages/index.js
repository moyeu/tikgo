import { useState, useCallback, useMemo } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import SeoMeta from '../components/SeoMeta';
import TikTokDownloader from '../components/TikTokDownloader';
import React from 'react';

// Tách FAQAccordion thành component riêng, tối ưu với useMemo()
const FAQAccordion = React.memo(({ faqs, openFAQ, toggleFAQ, t }) => {
  // Tối ưu faqs với useMemo để tránh re-render không cần thiết
  const memoizedFaqs = useMemo(() => faqs, [faqs]);

  return (
    <div className="faqAccordion">
      {memoizedFaqs.length > 0 && <h4>{t('extra_faq_title', 'Frequently Asked Questions')}</h4>}
      {memoizedFaqs.map((faq, index) => (
        <div key={index} className="faqItem">
          <button className="faqQuestion" onClick={() => toggleFAQ(index)}>
            {faq.faq_question || 'No question available'}
            <span className="faqIcon">{openFAQ === index ? '-' : '+'}</span>
          </button>
          <div className={`faqAnswer ${openFAQ === index ? 'open' : ''}`}>
            <ReactMarkdown allowedElements={['p', 'strong', 'em', 'br', 'ul', 'li']}>
              {faq.faq_answer || 'No answer available'}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
});

export default function Home() {
  const { t } = useTranslation('video');
  const router = useRouter();

  // State
  const [hasResults, setHasResults] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(-1);

  // Tránh re-render không cần thiết
  const handleSetResults = useCallback((newResults) => {
    setHasResults(newResults);
  }, []);

  // Tối ưu toggleFAQ với useCallback
  const toggleFAQ = useCallback((index) => {
    setOpenFAQ((prev) => (prev === index ? -1 : index));
  }, []);

  // Lấy dữ liệu dịch một cách an toàn
  const nav_video = t('nav_video', 'Video');
  const nav_mp3 = t('nav_mp3', 'MP3');
  const nav_slide = t('nav_slide', 'Slide');
  const nav_story = t('nav_story', 'Story');
  const title = t('title', 'TikTok Downloader');
  const description = t('description', 'Download TikTok videos easily.');
  const extra_long_content = t('extra_long_content', '');
  const sum_content = t('sum_content', '');
  const extra_faq = t('extra_faq', { returnObjects: true }) || [];

  // Tối ưu faqs với useMemo để tránh tạo lại mảng
  const faqs = useMemo(() => (Array.isArray(extra_faq) ? extra_faq : []), [extra_faq]);

  // Tạo mảng cho Navigation sử dụng useMemo
  const navItems = useMemo(() => [
    { href: '/', icon: '/icons/video-w.svg', label: nav_video },
    { href: '/mp3', icon: '/icons/mp3-w.svg', label: nav_mp3 },
    { href: '/slide', icon: '/icons/slide-w.svg', label: nav_slide },
    { href: '/story', icon: '/icons/story-w.svg', label: nav_story },
  ], [nav_video, nav_mp3, nav_slide, nav_story]);

  // Tối ưu hóa ReactMarkdown với useMemo để tránh re-render
  const memoizedExtraLongContent = useMemo(() => (
    extra_long_content ? (
      <ReactMarkdown allowedElements={['h2', 'h3', 'h4', 'p', 'ul', 'li', 'strong', 'a', 'em', 'br']}>
        {extra_long_content}
      </ReactMarkdown>
    ) : null
  ), [extra_long_content]);

  const memoizedSumContent = useMemo(() => (
    sum_content ? (
      <ReactMarkdown allowedElements={['p', 'ul', 'li', 'strong', 'em', 'br']}>
        {sum_content}
      </ReactMarkdown>
    ) : null
  ), [sum_content]);

  return (
    <>
      <SeoMeta pageKey="video" />

      <div className="containerWrapper">
        {!hasResults && (
          <>
            <nav className="navbar" aria-label="Main Navigation">
              {navItems.map(({ href, icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`navItem ${router.asPath === href ? 'active' : ''}`}
                >
                  <img src={icon} alt={label} width="20" height="20" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="textContainer">
              <h1 className="title">{title}</h1>
              <p className="description">{description}</p>
            </div>
          </>
        )}

        {/* Giao diện TikTok Downloader */}
        <TikTokDownloader setHasResults={handleSetResults} />
      </div>

      {/* Chỉ hiển thị nội dung mở rộng khi chưa có kết quả */}
      {!hasResults && (
        <div className="container">
          <section className="extraContent">
            {memoizedExtraLongContent && (
              <div className="extraLongContent">
                {memoizedExtraLongContent}
              </div>
            )}

            <FAQAccordion
              faqs={faqs}
              openFAQ={openFAQ}
              toggleFAQ={toggleFAQ}
              t={t}
            />

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

export async function getStaticProps({ locale }) {
  return {
    props: {
      // Giữ nguyên logic lấy dữ liệu dịch
      ...(await serverSideTranslations(locale, ['common', 'video'], { fallbackLng: 'en' })),
    },
    // Tái tạo trang sau 24h
    revalidate: 86400,
  };
}
