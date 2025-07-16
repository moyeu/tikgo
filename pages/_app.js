import '../styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config.js';
import { UserRegionProvider } from '../context/UserRegionContext';
import Header from '../components/Header';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ✅ Lazy-load Footer (chỉ tải khi client-side render)
const Footer = dynamic(() => import('../components/Footer'), { ssr: false });

const GA_TRACKING_ID = 'G-9SQV60YEJ2';

function AppContent({ Component, pageProps }) {
    return (
        <div className="app-wrapper">
            <Header />
            <div className="content">
                <Component {...pageProps} />
            </div>
            <Footer /> {/* Footer chỉ tải khi client-side render */}
        </div>
    );
}

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url) => {
            window.gtag('config', GA_TRACKING_ID, { page_path: url });
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return (
        <UserRegionProvider>
            {/* Google Analytics */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_TRACKING_ID}', {
                            page_path: window.location.pathname,
                        });
                    `,
                }}
            />
            <AppContent Component={Component} pageProps={pageProps} />
        </UserRegionProvider>
    );
}

// ✅ Đảm bảo appWithTranslation được gọi với cấu hình i18n
export default appWithTranslation(MyApp, nextI18NextConfig);
