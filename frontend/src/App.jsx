// src/App.jsx — DSTI application shell and routing.
import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

// Shell
import TopBar from './components/common/TopBar';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import SearchOverlay from './components/common/SearchOverlay';
import VigyanMitra from './components/common/VigyanMitra';

// Public pages
import HomePage from './pages/HomePage';
import { AboutPage, AwardsPage, MissionPage, ObjectivesPage, OrganisationStructurePage } from './pages/about/AboutPages';
import { DistrictExplorerPage, HowItConnectsPage, OrganisationDetailPage, OrganisationsPage } from './pages/organisations/OrganisationPages';
import { ICTPage, ProjectsPage } from './pages/ict/ICTPages';
import { PoliciesPage, PolicyDetailPage } from './pages/policies/PolicyPages';
import InvestorsPage from './pages/InvestorsPage';
import {
  ActsRulesPage, ECitizenPage, FAQsPage, GovernmentOrdersPage, GuidelinesPage, ITActPage,
  NotificationsPage, PoSHPage, PoliciesEcPage, RTIPage, UsefulLinksPage,
} from './pages/ecitizen/ECitizenPages';
import TendersPage from './pages/TendersPage';
import { EventsPage, MediaPage, ScienceStoriesPage } from './pages/media/MediaPages';
import ContactPage from './pages/ContactPage';
import { HelpPage, ScreenReaderAccessPage, SitemapPage } from './pages/StatutoryExtraPages';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import {
  AdminAnalytics, AdminDashboard, AdminFeedbackInbox, ManageDocuments, ManageEvents, ManageNews, ManageTenders,
} from './pages/admin/AdminPages';

export default function App() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tenders" element={<ManageTenders />} />
          <Route path="documents" element={<ManageDocuments />} />
          <Route path="news" element={<ManageNews />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="feedback" element={<AdminFeedbackInbox />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <a
        href="#main-content"
        className="sr-only-focusable absolute left-4 top-2 z-[60] rounded bg-secondary-500 px-4 py-2 font-semibold text-neutral-950"
      >
        Skip to main content
      </a>

      <TopBar />
      <Header onOpenSearch={() => setSearchOpen(true)} onOpenAssistant={() => setAssistantOpen(true)} />
      <ScrollToTop />

      <main id="main-content" className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/mission" element={<MissionPage />} />
          <Route path="/about/objectives" element={<ObjectivesPage />} />
          <Route path="/about/organisation" element={<OrganisationStructurePage />} />
          <Route path="/about/awards" element={<AwardsPage />} />

          <Route path="/organisations" element={<OrganisationsPage />} />
          <Route path="/organisations/:id" element={<OrganisationDetailPage />} />
          <Route path="/districts" element={<DistrictExplorerPage />} />
          <Route path="/how-it-connects" element={<HowItConnectsPage />} />

          <Route path="/ict" element={<ICTPage />} />
          <Route path="/ict/projects" element={<ProjectsPage />} />

          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/policies/:id" element={<PolicyDetailPage />} />

          <Route path="/investors" element={<InvestorsPage />} />

          <Route path="/ecitizen" element={<ECitizenPage />} />
          <Route path="/ecitizen/rti" element={<RTIPage />} />
          <Route path="/ecitizen/acts" element={<ActsRulesPage />} />
          <Route path="/ecitizen/government-orders" element={<GovernmentOrdersPage />} />
          <Route path="/ecitizen/notifications" element={<NotificationsPage />} />
          <Route path="/ecitizen/policies" element={<PoliciesEcPage />} />
          <Route path="/ecitizen/guidelines" element={<GuidelinesPage />} />
          <Route path="/ecitizen/faqs" element={<FAQsPage />} />
          <Route path="/ecitizen/useful-links" element={<UsefulLinksPage />} />
          <Route path="/ecitizen/it-act-2000" element={<ITActPage />} />
          <Route path="/ecitizen/posh-act" element={<PoSHPage />} />

          <Route path="/tenders" element={<TendersPage />} />

          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/science-stories" element={<ScienceStoriesPage />} />
          <Route path="/media/events" element={<EventsPage />} />

          <Route path="/contact" element={<ContactPage />} />

          <Route path="/screen-reader-access" element={<ScreenReaderAccessPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />

          <Route path="/search" element={<SearchResultsPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <ScrollToTopButton />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <VigyanMitra open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
