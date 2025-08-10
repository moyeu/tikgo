// pages/douyin.js
import { useState, useCallback, useMemo } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import ReactMarkdown from 'react-markdown';
import SeoMeta from '../components/SeoMeta';
import TikTokDownloader from '../components/TikTokDownloader';
import MainNav from '../components/MainNav';

export default function DouyinDownload() {
  const { t } = useTranslation('douyin');          // ① namespace douyin
  const [hasResults, setHasResults] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(-1);

  const toggleFAQ = useCallback((index) => {
    setOpenFAQ((prev) => (prev === index ? -1 : index));
  }, []);

  const extraLongContent = t('extra_long_content');
  const sumContent = t('sum_content');
  const faqsData = t('extra_faq', { returnObjects: true });
  const faqs = useMemo(() => (Array.isArray(faqsData) ? faqsData : []), [faqsData]);

  const memoizedExtraLongContent = useMemo(() => (
    extraLongContent ? (
      <ReactMarkdown allowedElements={['h2','h3','h4','p','ul','li','strong','em','a','br']}>
        {extraLongContent}
      </ReactMarkdown>
    ) : null
  ), [extraLongContent]);

  const memoizedSumContent = useMemo(() => (
    sumContent ? (
      <ReactMarkdown allowedElements={['p','ul','li','strong','em','br']}>
        {sumContent}
      </ReactMarkdown>
    ) : null
  ), [sumContent]);

  return (
    <>
      {/* ② SEO Metadata cho Douyin */}
      <SeoMeta pageKey="douyin" />

      <div className="containerWrapper">
        {!hasResults && (
          <>
            <MainNav t={t} />
            <div className="textContainer">
              <h1 className="title">{t('title')}</h1>
              <p className="description">{t('description')}</p>
            </div>
          </>
        )}

        {/* Giao diện tải Douyin */}
        <TikTokDownloader setHasResults={setHasResults} />
      </div>

      {!hasResults && (
        <div className="container">
          <section className="extraContent">
            {memoizedExtraLongContent && (
              <div className="extraLongContent">
                {memoizedExtraLongContent}
              </div>
            )}

            <div className="faqAccordion">
              <h4>{t('extra_faq_title')}</h4>
              {faqs.map((faq, index) => (
                <div key={index} className="faqItem">
                  <button className="faqQuestion" onClick={() => toggleFAQ(index)}>
                    {faq.faq_question}
                    <span className="faqIcon">{openFAQ === index ? '-' : '+'}</span>
                  </button>
                  <div className={`faqAnswer ${openFAQ === index ? 'open' : ''}`}>
                    <ReactMarkdown allowedElements={['p','strong','em','br','ul','li']}>
                      {faq.faq_answer}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>

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

// ③ Lấy dữ liệu dịch: common + douyin
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'douyin'], { fallbackLng: 'en' })),
    },
    revalidate: 86400,
  };
}
