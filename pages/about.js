import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function About() {
    const { t } = useTranslation('about');
    const { locale } = useRouter();

    return (
        <>
            <Head>
                <title>{`${t('title')}`}</title>
                <meta name="description" content={t('description')} />
            </Head>
            <main>
                <div className="container">
                    <section className="extraLongContent">
                        <div className="title">{t('title')}</div>
                        <p>{t('intro')}</p>
                        
                        <h3>{t('mission.title')}</h3>
                        <p>{t('mission.content')}</p>
                        
                        <h3>{t('services.title')}</h3>
                        <ul>
                            <li>{t('services.video_downloader')}</li>
                            <li>{t('services.slideshow_downloader')}</li>
                            <li>{t('services.story_downloader')}</li>
                            <li>{t('services.tiktok_to_mp3')}</li>
                        </ul>
                        
                        <h3>{t('advantages.title')}</h3>
                        <ul>
                            <li>{t('advantages.no_watermark')}</li>
                            <li>{t('advantages.free')}</li>
                            <li>{t('advantages.cross_platform')}</li>
                            <li>{t('advantages.high_quality')}</li>
                            <li>{t('advantages.easy_to_use')}</li>
                            <li>{t('advantages.multilingual')}</li>
                        </ul>
                        
                        <h3>{t('values.title')}</h3>
                        <ul>
                            <li>{t('values.community')}</li>
                            <li>{t('values.trustworthy')}</li>
                            <li>{t('values.easy_to_use')}</li>
                        </ul>
                        
                        <h3>{t('feedback.title')}</h3>
                        <p>{t('feedback.content')} <a href={`/${locale}/contact`}>{t('feedback.link')}</a></p>
                        
                        <h3>{t('community.title')}</h3>
                        <p>{t('community.content')}</p>
                    </section>
                </div>
            </main>
        </>
    );
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common', 'about']))
        }
    };
}
