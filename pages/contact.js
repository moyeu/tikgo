import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function Contact() {
    const { t } = useTranslation('about');
    const { locale } = useRouter();

    return (
        <>
            <Head>
                <title>{`${t('contact.title')}`}</title>
                <meta name="description" content={t('contact.description')} />
            </Head>
            <main>
                <div className="container">
                    <section className="extraLongContent">
                        <div className="title">{t('contact.title')}</div>
                        <p>{t('contact.description')}</p>
                        <p>{t('contact.contact_info')}</p>
                        <p>
                            <strong>{t('contact.telegram')}:</strong> <a href="https://t.me/tikgo_me">@tikgo_me</a>
                        </p>
                        <p>
                            <strong>{t('contact.email')}:</strong> <a href="mailto:tikgo.me@gmail.com">tikgo.me@gmail.com</a>
                        </p>
  
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
