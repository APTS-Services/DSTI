// src/controllers/apiPublicController.js — unauthenticated /api/v1 endpoints.
const path = require('path');
const config = require('../config');
const publicService = require('../services/publicService');
const feedbackService = require('../services/feedbackService');
const analyticsService = require('../services/analyticsService');
const searchService = require('../services/searchService');
const assistantService = require('../services/assistantService');
const settingsService = require('../services/settingsService');
const { asyncHandler, sendSuccess, sendCreated } = require('../utils/http');
const ApiError = require('../utils/ApiError');

const lang = (req) => req.query.lang;

function listHandler(serviceFn) {
  return asyncHandler(async (req, res) => {
    const result = await serviceFn(req);
    if (Array.isArray(result)) return sendSuccess(res, result);
    return sendSuccess(res, result.data, result.meta);
  });
}

const home = asyncHandler(async (req, res) => sendSuccess(res, await publicService.home(lang(req))));
const banners = listHandler((req) => publicService.listResource('banners', req.query));
const news = listHandler((req) => publicService.news(req.query));
const audienceCards = listHandler((req) => publicService.listResource('audience-cards', req.query));
const quickLinks = asyncHandler(async (req, res) => sendSuccess(res, await publicService.quickLinks(req.query)));
const storyPanels = listHandler((req) => publicService.listResource('story-panels', req.query));
const almanac = asyncHandler(async (req, res) => sendSuccess(res, await publicService.almanac(req.query)));
const socialLinks = asyncHandler(async (req, res) => sendSuccess(res, await publicService.socialLinks()));

const pages = listHandler((req) => publicService.listPages(req.query));
const page = asyncHandler(async (req, res) => sendSuccess(res, await publicService.getPage(req.params.slug, lang(req))));
const footerPages = asyncHandler(async (req, res) => sendSuccess(res, await publicService.footerPages(lang(req))));
const sitemap = asyncHandler(async (req, res) => sendSuccess(res, await publicService.sitemap(lang(req))));
const sitemapXml = asyncHandler(async (req, res) => {
  res.type('application/xml').send(await publicService.sitemapXml());
});

const awards = asyncHandler(async (req, res) => sendSuccess(res, await publicService.awardsList(req.query)));
const awardYears = asyncHandler(async (req, res) => sendSuccess(res, await publicService.awardYears()));
const awardsByYear = asyncHandler(async (req, res) =>
  sendSuccess(res, await publicService.awardsByYear(req.params.year, lang(req)))
);

const organisations = listHandler((req) => publicService.organisations(req.query));
const organisation = asyncHandler(async (req, res) =>
  sendSuccess(res, await publicService.organisation(req.params.slug, lang(req)))
);
const sectors = listHandler((req) => publicService.listResource('sectors', req.query));
const districts = asyncHandler(async (req, res) => sendSuccess(res, await publicService.districts(lang(req))));
const district = asyncHandler(async (req, res) => sendSuccess(res, await publicService.district(req.params.slug, lang(req))));
const districtInstitutions = listHandler((req) => publicService.districtInstitutions(req.query));
const districtInstitution = asyncHandler(async (req, res) =>
  sendSuccess(res, await publicService.districtInstitution(req.params.id, lang(req)))
);
const districtMap = asyncHandler(async (req, res) => sendSuccess(res, await publicService.districtMap()));
const connections = asyncHandler(async (req, res) => sendSuccess(res, await publicService.connections(lang(req))));

const policies = listHandler((req) => publicService.policies(req.query));
const policy = asyncHandler(async (req, res) => sendSuccess(res, await publicService.policy(req.params.slug, lang(req))));

const documentCategories = asyncHandler(async (req, res) =>
  sendSuccess(res, await publicService.documentCategories(lang(req)))
);
const documents = listHandler((req) => publicService.documents(req.query));
const document = asyncHandler(async (req, res) => sendSuccess(res, await publicService.document(req.params.id, lang(req))));
const faqs = asyncHandler(async (req, res) => sendSuccess(res, await publicService.faqs(lang(req))));
const rti = listHandler((req) => publicService.rti(req.query));

const tenders = listHandler((req) => publicService.tenders(req.query));
const tender = asyncHandler(async (req, res) => sendSuccess(res, await publicService.tender(req.params.id, lang(req))));

const scienceStories = listHandler((req) => publicService.scienceStories(req.query));
const scienceStory = asyncHandler(async (req, res) =>
  sendSuccess(res, await publicService.scienceStory(req.params.id, lang(req)))
);
const events = listHandler((req) => publicService.events(req.query));
const event = asyncHandler(async (req, res) => sendSuccess(res, await publicService.event(req.params.slug, lang(req))));

const office = asyncHandler(async (req, res) => sendSuccess(res, await publicService.office(lang(req))));
const officers = asyncHandler(async (req, res) => sendSuccess(res, await publicService.officers(lang(req))));

const feedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.submit(req.body || {}, req);
  sendCreated(res, { reference: result.reference });
});

const feedbackStats = asyncHandler(async (req, res) => sendSuccess(res, await feedbackService.publicStats()));

const search = asyncHandler(async (req, res) => {
  const result = await searchService.search(req.query);
  sendSuccess(res, result.hits, result.meta);
});
const suggest = asyncHandler(async (req, res) => sendSuccess(res, await searchService.suggest(req.query)));
const ask = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await assistantService.ask({
      question: req.body?.question,
      lang: req.body?.lang || req.query.lang,
      previous: req.body?.previous,
      previousIntent: req.body?.previous_intent || req.body?.previousIntent
    })
  )
);
const assistantFeedback = asyncHandler(async (req, res) =>
  sendSuccess(res, await searchService.assistantFeedback(req.body || {}))
);

const trackView = asyncHandler(async (req, res) => {
  await analyticsService.trackView(req.body || {}, req);
  res.status(204).end();
});
const visitors = asyncHandler(async (req, res) => sendSuccess(res, await analyticsService.visitors()));
const siteCounts = asyncHandler(async (req, res) => sendSuccess(res, await publicService.counts()));

const publicSettings = asyncHandler(async (req, res) => sendSuccess(res, await settingsService.publicSettings()));
const health = asyncHandler(async (req, res) => sendSuccess(res, await publicService.health()));

/** Streams an uploaded file (PDF) with the original file name. */
function sendFile(res, next, lookup) {
  lookup
    .then(({ filePath, fileName }) => {
      const absolute = path.join(config.paths.uploadsDir, path.basename(filePath));
      res.download(absolute, fileName, (err) => {
        if (err && !res.headersSent) next(new ApiError(404, 'The file is not available.'));
      });
    })
    .catch(next);
}

const documentDownload = (req, res, next) => sendFile(res, next, publicService.documentDownload(req.params.id));
const tenderDownload = (req, res, next) => sendFile(res, next, publicService.tenderDownload(req.params.id, 'tender'));

module.exports = {
  home,
  banners,
  news,
  audienceCards,
  quickLinks,
  storyPanels,
  almanac,
  socialLinks,
  pages,
  page,
  footerPages,
  sitemap,
  sitemapXml,
  awards,
  awardYears,
  awardsByYear,
  organisations,
  organisation,
  sectors,
  districts,
  district,
  districtInstitutions,
  districtInstitution,
  districtMap,
  connections,
  policies,
  policy,
  documentCategories,
  documents,
  document,
  documentDownload,
  faqs,
  rti,
  tenders,
  tender,
  tenderDownload,
  scienceStories,
  scienceStory,
  events,
  event,
  office,
  officers,
  feedback,
  feedbackStats,
  search,
  suggest,
  ask,
  assistantFeedback,
  trackView,
  visitors,
  siteCounts,
  publicSettings,
  health
};
