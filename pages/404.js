import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

export default function Custom404() {
  const { t } = useTranslation('common'); // Sử dụng dữ liệu dịch từ namespace common

  return (
    <div
        className="container"
        style={{ textAlign: 'center', padding: '50px 20px' }}
      >
        <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
        <h2 style={{ marginBottom: '20px' }}>
          {t('page_not_found', 'Page Not Found')}
        </h2>
        <p style={{ marginBottom: '30px' }}>
          {t('oops_message', "Oops! The page you're looking for does not exist.")}
        </p>
        <Link href="/" legacyBehavior>
          <a
            style={{
              padding: '10px 20px',
              background: 'var(--primary-color)',
              color: '#fff',
              borderRadius: 'var(--border-radius)',
              textDecoration: 'none'
            }}
          >
            {t('go_home', 'Go to Home')}
          </a>
        </Link>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], { fallbackLng: 'en' }))
    }
  };
}
