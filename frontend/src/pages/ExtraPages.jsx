// Screen reader access, help, sitemap, search results and 404.
import React, { useMemo } from 'react';
import { Link, Route, Routes, useSearchParams } from 'react-router-dom';
import { useCollection, useContent } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import PageSections from '../components/common/PageSections';
import Empty from '../components/common/Empty';
import { search } from '../utils/searchIndex';
import NotFound from './NotFound';

function CmsPage({ id, titleKey, faq }) {
  const { t, tc } = useLanguage();
  const page = useCollection('pages').find((p) => p.id === id);
  useSEO({ title: t(titleKey) });
  return (
    <>
      <PageHero title={tc(page?.title) || t(titleKey)} subtitle={tc(page?.subtitle)} crumbs={[{ label: t('statutoryPages'), to: '/sitemap' }, { label: t(titleKey) }]} />
      <div className="container section-sm" style={{ maxWidth: 900 }}>
        {faq
          ? (page?.sections || []).map((s, i) => <details key={i} className="faq"><summary>{tc(s.heading)}</summary><div className="body">{(s.body || []).map((b, j) => <p key={j} className="mb-1">{tc(b)}</p>)}</div></details>)
          : <PageSections page={page} />}
      </div>
    </>
  );
}

const STATUTORY = [
  ['websitePolicy', '/policies/website-policy'], ['privacyPolicy', '/policies/privacy-policy'], ['termsOfUse', '/policies/terms-of-use'],
  ['copyright', '/policies/copyright'], ['disclaimer', '/policies/disclaimer'], ['hyperlinkPolicy', '/policies/hyperlink-policy'],
  ['accessibilityStatement', '/policies/accessibility-statement'], ['screenReaderAccess', '/screen-reader-access'], ['help', '/help'],
];

function Sitemap() {
  const { t, tc } = useLanguage();
  const nav = useCollection('navigation');
  useSEO({ title: t('sitemap') });
  return (
    <>
      <PageHero title={t('sitemap')} crumbs={[{ label: t('sitemap') }]} />
      <div className="container section-sm">
        <div className="row g-4">
          {nav.map((n) => (
            <nav key={n.id} className="col-sm-6 col-lg-4" aria-label={tc(n.label)}>
              <h2 className="h5 fw-bold"><Link to={n.to} className="text-body">{tc(n.label)}</Link></h2>
              {n.children?.length > 0 && <ul className="d-grid gap-1">{n.children.map((c) => <li key={c.to}><Link to={c.to}>{tc(c.label)}</Link></li>)}</ul>}
            </nav>
          ))}
          <nav className="col-sm-6 col-lg-4" aria-label={t('statutoryPages')}>
            <h2 className="h5 fw-bold">{t('statutoryPages')}</h2>
            <ul className="d-grid gap-1">{STATUTORY.map(([k, to]) => <li key={k}><Link to={to}>{t(k)}</Link></li>)}</ul>
          </nav>
        </div>
      </div>
    </>
  );
}

function SearchResults() {
  const { t, tc, lang } = useLanguage();
  const { data } = useContent();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const results = useMemo(() => search(data, q, { limit: 50, lang }), [data, q, lang]);
  useSEO({ title: `${t('searchResults')}${q ? `: ${q}` : ''}` });
  return (
    <>
      <PageHero title={t('searchResults')} crumbs={[{ label: t('search') }]}>
        <form className="d-flex gap-2 mt-3" style={{ maxWidth: 640 }} role="search" onSubmit={(e) => { e.preventDefault(); setParams({ q: new FormData(e.currentTarget).get('q') || '' }); }}>
          <label htmlFor="sq" className="visually-hidden">{t('search')}</label>
          <input id="sq" name="q" type="search" className="form-control" defaultValue={q} key={q} maxLength={120} placeholder={t('searchPlaceholder')} />
          <button className="btn btn-primary" type="submit">{t('search')}</button>
        </form>
      </PageHero>
      <div className="container section-sm" style={{ maxWidth: 960 }}>
        <p className="text-muted-2" aria-live="polite">{results.length} {t('resultsFor')} “{q}”</p>
        {!results.length ? <Empty text={t('noResults')} /> : (
          <ol className="list-unstyled d-grid gap-3">
            {results.map((r) => (
              <li key={r.id}><Link to={r.path} className="dst-card hoverable p-3"><span className="pill me-2">{t(`type_${r.type}`)}</span><strong>{tc(r.titleObj)}</strong><small className="d-block text-muted-2 mt-1">{r.snippet}</small></Link></li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

export default function ExtraPages() {
  return (
    <Routes>
      <Route path="/screen-reader-access" element={<CmsPage id="screen-reader-access" titleKey="screenReaderAccess" />} />
      <Route path="/help" element={<CmsPage id="help" titleKey="help" faq />} />
      <Route path="/sitemap" element={<Sitemap />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
