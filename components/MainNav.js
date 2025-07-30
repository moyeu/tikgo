import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MainNav({ t }) {
  const router = useRouter();

  const navItems = useMemo(() => [
    { href: '/', icon: '/icons/video-w.svg', label: t('nav_video') },
    { href: '/mp3', icon: '/icons/mp3-w.svg', label: t('nav_mp3') },
    { href: '/slide', icon: '/icons/slide-w.svg', label: t('nav_slide') },
    { href: '/story', icon: '/icons/story-w.svg', label: t('nav_story') },
  ], [t]);

  return (
    <nav className="navbar" aria-label="Main Navigation">
      {navItems.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`navItem ${router.asPath === href ? 'active' : ''}`}
        >
          <img src={icon} alt={label} width={20} height={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}