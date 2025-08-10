import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

const languages = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'id', label: '🇮🇩 Bahasa Indonesia' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'pt', label: '🇵🇹 Português' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'cs', label: '🇨🇿 Čeština' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'th', label: '🇹🇭 ไทย' },
  { code: 'zh', label: '🇹🇼 繁體中文' },
];

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === router.locale) || languages[0];

  // ✅ Tối ưu getLocalizedPath
  const getLocalizedPath = (lang) => {
    const pathSegments = router.asPath.split('/').filter(Boolean);
    if (languages.some(l => l.code === pathSegments[0])) {
      pathSegments[0] = lang;
    } else {
      pathSegments.unshift(lang);
    }
    return lang === 'en' ? `/${pathSegments.slice(1).join('/')}` || '/' : `/${pathSegments.join('/')}`;
  };

  // ✅ Cải thiện quản lý eventListener bằng useRef
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* ✅ Logo bên trái với điều hướng về homepage tương ứng */}
        <div className={styles.logo}>
          <a href={router.locale === 'en' ? '/' : `/${router.locale}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            ✨ TikGo.me
          </a>
        </div>

        {/* ✅ Language switcher dạng dropdown */}
        <div className={styles.languageSwitcher} ref={dropdownRef}>
          <button
            className={styles.dropdownButton}
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
          >
            {currentLang.label} 
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              {languages.map(({ code, label }) => (
                <a key={code} href={getLocalizedPath(code)} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}