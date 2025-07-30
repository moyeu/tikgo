import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Footer.module.css';
import { memo } from 'react';

const Footer = () => {
  const { t } = useTranslation('common');
  const footerTexts = t('footer', { returnObjects: true });

  const sections = [
    {
      title: footerTexts.tools,
      links: [
        { href: '/', text: footerTexts.tiktok_video },
        { href: '/mp3', text: footerTexts.tiktok_mp3 },
        { href: '/slide', text: footerTexts.tiktok_slide },
        { href: '/story', text: footerTexts.tiktok_story },
      ],
    },
    {
      title: footerTexts.company,
      links: [
        { href: '/terms', text: footerTexts.terms },
        { href: '/privacy-policy', text: footerTexts.privacy },
        { href: '/about', text: footerTexts.about },
        { href: '/contact', text: footerTexts.contact },
      ],
    },
    {
      title: footerTexts.follow_us,
      links: [
        { href: 'https://facebook.com', text: 'Facebook' },
        { href: 'https://linkedin.com', text: 'LinkedIn' },
        { href: 'https://youtube.com', text: 'YouTube' },
        { href: 'https://telegram.org', text: 'Telegram' },
        { href: 'https://x.com', text: 'X.com' },
      ],
      external: true,
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className={styles.title}>{section.title}</h3>
              <ul className={styles.list}>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} className={styles.listItem}>
                    {section.external ? (
                      <a
                        className={styles.link}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        aria-label={`Follow us on ${link.text}`}
                      >
                        {link.text}
                      </a>
                    ) : (
                      <Link className={styles.link} href={link.href}>
                        {link.text}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.copyright}>
          <p>&copy; 2025 {footerTexts.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
