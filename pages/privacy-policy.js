import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function PrivacyPolicy() {
    const { t } = useTranslation('policy');

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

                        <h3>{t('personal_info.title')}</h3>
                        <p>{t('personal_info.content')}</p>

                        <h3>{t('policy_changes.title')}</h3>
                        <p>{t('policy_changes.content')}</p>

                        <h3>{t('advertising.title')}</h3>
                        <p>{t('advertising.content')}</p>

                        <h3>{t('acceptance.title')}</h3>
                        <p>{t('acceptance.content')}</p>
                    </section>
                </div>
            </main>
        </>
    );
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common', 'policy']))
        }
    };
}
