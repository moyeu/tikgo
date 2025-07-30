import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function TermsOfService() {
    const { t } = useTranslation('terms');

    return (
        <>
            <Head>
                <title>{`${t('title')} - ${t('description')}`}</title>
                <meta name="description" content={t('description')} />
            </Head>
            <main>
                <div className="container">
                    <section className="extraLongContent">
                        <h1>{t('title')}</h1>
                        <p>{t('description')}</p>

                        <h3>{t('intellectual_property.title')}</h3>
                        <h4>{t('intellectual_property.use_license.title')}</h4>
                        <p>{t('intellectual_property.use_license.content')}</p>

                        <h4>{t('intellectual_property.copyright.title')}</h4>
                        <p>{t('intellectual_property.copyright.content')}</p>

                        <h3>{t('disclaimer.title')}</h3>
                        <p>{t('disclaimer.content')}</p>

                        <h3>{t('links.title')}</h3>
                        <p>{t('links.content')}</p>

                        <h3>{t('limitations.title')}</h3>
                        <p>{t('limitations.content')}</p>

                        <h3>{t('modifications.title')}</h3>
                        <p>{t('modifications.content')}</p>
                    </section>
                </div>
            </main>
        </>
    );
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common', 'terms']))
        }
    };
}
