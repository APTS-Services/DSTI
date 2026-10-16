// Application shell and routing. Pages are code-split so each visit downloads
// only what it needs.
import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
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
const Extra = lazy(() => import('./pages/ExtraPages'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
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
