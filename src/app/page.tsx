'use client';

import Link from 'next/link';
import { FiTruck, FiMapPin, FiUsers, FiBell, FiBarChart2, FiShield, FiArrowRight, FiZap, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/types';
import styles from './landing.module.css';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="FleetMan Logo" className="w-8 h-8 rounded-full object-cover mr-2" />
          <span className={styles.logoText}>FleetMan</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>{t('nav.features')}</a>
          <a href="#stats" className={styles.navLink}>{t('nav.stats')}</a>

          {/* Language Switcher */}
          <div className="language-switcher">
            <button
              className={`language-btn ${language === 'FR' ? 'active' : ''}`}
              onClick={() => setLanguage(Language.FR)}
            >
              FR
            </button>
            <button
              className={`language-btn ${language === 'ENG' ? 'active' : ''}`}
              onClick={() => setLanguage(Language.ENG)}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>

          <Link href="/register" className={styles.registerButton}>
            {t('nav.register')}
          </Link>
          <Link href="/login" className={styles.ctaButton}>
            {t('nav.login')}
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className={styles.mobileNav}>
          <div className="language-switcher">
            <button
              className={`language-btn ${language === 'FR' ? 'active' : ''}`}
              onClick={() => setLanguage(Language.FR)}
            >
              FR
            </button>
            <button
              className={`language-btn ${language === 'ENG' ? 'active' : ''}`}
              onClick={() => setLanguage(Language.ENG)}
            >
              EN
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          <Link href="/login" className={styles.ctaButton}>
            {t('nav.login')}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <FiZap />
            {t('hero.badge')}
          </div>
          <h1 className={styles.heroTitle}>
            {t('hero.title.part1')}{' '}
            <span className={styles.animatedTextContainer}>
              <span className={styles.animatedText}>
                <span>{t('hero.word1')}</span>
                <span>{t('hero.word2')}</span>
                <span>{t('hero.word3')}</span>
                <span>{t('hero.word4')}</span>
                <span>{t('hero.word5')}</span>
              </span>
            </span>
            {' '}{t('hero.title.part2')}
          </h1>
          <p className={styles.heroSubtitle}>
            {t('hero.subtitle')}
          </p>
          <div className={styles.heroButtons}>
            <Link href="/register" className={styles.primaryButton}>
              {t('hero.cta.register')}
              <FiArrowRight />
            </Link>
            <Link href="/login" className={styles.secondaryButton}>
              {t('hero.cta.login')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('features.title')}</h2>
          <p className={styles.sectionSubtitle}>
            {t('features.subtitle')}
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiMapPin />
            </div>
            <h3 className={styles.featureTitle}>{t('features.tracking.title')}</h3>
            <p className={styles.featureDescription}>
              {t('features.tracking.desc')}
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiUsers />
            </div>
            <h3 className={styles.featureTitle}>{t('features.drivers.title')}</h3>
            <p className={styles.featureDescription}>
              {t('features.drivers.desc')}
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiBell />
            </div>
            <h3 className={styles.featureTitle}>{t('features.alerts.title')}</h3>
            <p className={styles.featureDescription}>
              {t('features.alerts.desc')}
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiBarChart2 />
            </div>
            <h3 className={styles.featureTitle}>{t('features.analytics.title')}</h3>
            <p className={styles.featureDescription}>
              {t('features.analytics.desc')}
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiTruck />
            </div>
            <h3 className={styles.featureTitle}>{t('features.management.title')}</h3>
            <p className={styles.featureDescription}>
              {t('features.management.desc')}
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiShield />
            </div>
            <h3 className={styles.featureTitle}>{t('features.security.title')}</h3>
            <p className={styles.featureDescription}>
              {t('features.security.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>99.9%</div>
            <div className={styles.statLabel}>{t('stats.availability')}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>24/7</div>
            <div className={styles.statLabel}>{t('stats.realtime')}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>-30%</div>
            <div className={styles.statLabel}>{t('stats.cost')}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>+50%</div>
            <div className={styles.statLabel}>{t('stats.efficiency')}</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>{t('cta.title')}</h2>
          <p className={styles.ctaText}>
            {t('cta.text')}
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/register" className={styles.primaryButton}>
              {t('hero.cta.register')}
              <FiArrowRight />
            </Link>
            <Link href="/login" className={styles.secondaryButton}>
              {t('cta.hasAccount')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/logo.png" alt="FleetMan Logo" className="w-6 h-6 rounded-full object-cover mr-2" />
            <span className={styles.logoText}>FleetMan</span>
          </div>
          <p className={styles.footerText}>
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
