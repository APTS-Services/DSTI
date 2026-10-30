// Application shell and routing. Pages are code-split so each visit downloads
// only what it needs.
import React, { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ContentProvider, useContent } from './context/ContentContext';
import { useLanguage } from './i18n/LanguageContext';
import TopBar from './components/layout/TopBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SearchOverlay from './components/layout/SearchOverlay';
import VigyanMitra, { AssistantLauncher } from './components/layout/VigyanMitra';
import ScrollTopButton from './components/layout/ScrollTopButton';
import Loading from './components/common/Loading';
import usePageTracking from './hooks/usePageTracking';

const HomePage = lazy(() => import('./pages/HomePage'));
const About = lazy(() => import('./pages/AboutPages'));
const Orgs = lazy(() => import('./pages/OrganisationPages'));
const ICT = lazy(() => import('./pages/ICTPages'));
const Policies = lazy(() => import('./pages/PolicyPages'));
const InvestorsPage = lazy(() => import('./pages/InvestorsPage'));
const ECitizen = lazy(() => import('./pages/ECitizenPages'));
const TendersPage = lazy(() => import('./pages/TendersPage'));
const Media = lazy(() => import('./pages/MediaPages'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const Extra = lazy(() => import('./pages/ExtraPages'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  // Run before paint so the new page is measured (and its reveal animations are
  // triggered) at the top of the window, not at the previous page's offset.
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);
  // Links such as /contact#officers: the target may only exist once the
  // lazily loaded page has rendered, so look for it for a short while.
  useEffect(() => {
    if (!hash) return undefined;
    let tries = 0;
    const id = decodeURIComponent(hash.slice(1));
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 30) {
        clearInterval(timer);
        if (el) {
          el.scrollIntoView({ block: 'start' });
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
        }
      }
    }, 100);
    return () => clearInterval(timer);
  }, [pathname, hash]);
  return null;
}

function PublicSite() {
  const { t } = useLanguage();
  const { ready, error } = useContent();
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeAssistant = useCallback(() => setAssistantOpen(false), []);
  usePageTracking();

  return (
    <div className="d-flex flex-column min-vh-100">
      <a href="#main-content" className="skip-link">{t('skipToContent')}</a>
      <TopBar />
      <Header onSearch={() => setSearchOpen(true)} onAssistant={() => setAssistantOpen(true)} />
      <ScrollToTop />
      <main id="main-content" tabIndex={-1} className="flex-grow-1">
        {error && !ready && (
          <div className="container py-5"><div className="alert alert-warning">{t('contentUnavailable')}</div></div>
        )}
        {!ready && !error && <Loading lines={5} />}
        {ready && (
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about/*" element={<About />} />
              <Route path="/organisations/*" element={<Orgs />} />
              <Route path="/districts" element={<Orgs page="districts" />} />
              <Route path="/how-it-connects" element={<Orgs page="connect" />} />
              <Route path="/ict/*" element={<ICT />} />
              <Route path="/policies/*" element={<Policies />} />
              <Route path="/investors" element={<InvestorsPage />} />
              <Route path="/ecitizen/*" element={<ECitizen />} />
              <Route path="/tenders" element={<TendersPage />} />
              <Route path="/media/*" element={<Media />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="*" element={<Extra />} />
            </Routes>
          </Suspense>
        )}
      </main>
      <Footer />
      <ScrollTopButton />
      <AssistantLauncher onOpen={() => setAssistantOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <VigyanMitra open={assistantOpen} onClose={closeAssistant} />
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <ContentProvider>
      {pathname.startsWith('/admin') ? (
        <Suspense fallback={<Loading />}><AdminApp /></Suspense>
      ) : (
        <PublicSite />
      )}
    </ContentProvider>
  );
}
