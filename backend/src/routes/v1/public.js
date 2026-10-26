// src/routes/v1/public.js — public REST API.
const express = require('express');
const c = require('../../controllers/apiPublicController');
const { feedbackLimiter, assistantLimiter, trackLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Home
router.get('/home', c.home);
router.get('/banners', c.banners);
router.get('/news', c.news);
router.get('/audience-cards', c.audienceCards);
router.get('/quick-links', c.quickLinks);
router.get('/story-panels', c.storyPanels);
router.get('/almanac', c.almanac);
router.get('/social-links', c.socialLinks);

// Pages
router.get('/pages', c.pages);
router.get('/pages/:slug', c.page);
router.get('/footer-pages', c.footerPages);
router.get('/sitemap', c.sitemap);
router.get('/sitemap.xml', c.sitemapXml);

// About / awards
router.get('/awards', c.awards);
router.get('/awards/years', c.awardYears);
router.get('/awards/:year', c.awardsByYear);

// Organisations, sectors, districts
router.get('/organisations', c.organisations);
router.get('/organisations/:slug', c.organisation);
router.get('/sectors', c.sectors);
router.get('/districts', c.districts);
router.get('/districts/:slug', c.district);
router.get('/district-institutions', c.districtInstitutions);
router.get('/district-institutions/:id', c.districtInstitution);
router.get('/district-map', c.districtMap);
router.get('/connections', c.connections);

// Policies
router.get('/policies', c.policies);
router.get('/policies/:slug', c.policy);

// Documents
router.get('/document-categories', c.documentCategories);
router.get('/documents', c.documents);
router.get('/documents/:id/download', c.documentDownload);
router.get('/documents/:id', c.document);
router.get('/faqs', c.faqs);
router.get('/rti', c.rti);

// Tenders
router.get('/tenders', c.tenders);
router.get('/tenders/:id/download', c.tenderDownload);
router.get('/tenders/:id', c.tender);

// Media
router.get('/science-stories', c.scienceStories);
router.get('/science-stories/:id', c.scienceStory);
router.get('/events', c.events);
router.get('/events/:slug', c.event);

// Contact
router.get('/contact/office', c.office);
router.get('/contact/officers', c.officers);
router.post('/feedback', feedbackLimiter, c.feedback);

// Search & assistant
router.get('/search', c.search);
router.get('/search/suggest', c.suggest);
router.post('/assistant/ask', assistantLimiter, c.ask);
router.post('/assistant/feedback', c.assistantFeedback);

// Analytics
router.post('/track/view', trackLimiter, c.trackView);
router.get('/stats/visitors', c.visitors);
router.get('/stats/site', c.siteCounts);

// Settings & health
router.get('/settings/public', c.publicSettings);
router.get('/health', c.health);

module.exports = router;
