import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, MapPin, MessageSquareText, Phone, Printer } from 'lucide-react';
import { useCollection, useSetting } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';

export default function ContactPage() {
  const { t, tc } = useLanguage();
  const c = useSetting('contact');
  const officers = useCollection('officers');
  useSEO({ title: t('contact') });
  return (
    <>
      <PageHero title={t('contact')} crumbs={[{ label: t('contact') }]} />
      <div className="container section-sm">
        <div className="row g-4">
          <Reveal className="col-lg-5">
            <div className="feature-card tone-sky">
              <h2 className="h4">{t('headOffice')}</h2>
              <ul className="list-unstyled d-grid gap-3 mb-0">
                <li className="d-flex gap-3"><MapPin className="flex-shrink-0" aria-hidden="true" /> <span>{tc(c.headOffice)}</span></li>
                {c.phone && <li className="d-flex gap-3"><Phone className="flex-shrink-0" aria-hidden="true" /> <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="text-reset">{c.phone}</a></li>}
                {c.fax && <li className="d-flex gap-3"><Printer className="flex-shrink-0" aria-hidden="true" /> <span>{t('fax')}: {c.fax}</span></li>}
                {c.email && <li className="d-flex gap-3"><Mail className="flex-shrink-0" aria-hidden="true" /> <a href={`mailto:${c.email}`} className="text-reset">{c.email}</a></li>}
                {tc(c.workingHours) && <li className="d-flex gap-3"><Clock className="flex-shrink-0" aria-hidden="true" /> <span>{tc(c.workingHours)}</span></li>}
              </ul>
            </div>
          </Reveal>
          <Reveal className="col-lg-7" delay={0.08}>
            <div className="feature-card tone-mint">
              <MessageSquareText size={38} className="icon" aria-hidden="true" />
              <h2 className="h4">{t('feedbackTitle')}</h2>
              <p>{t('feedbackCta')}</p>
              <div className="d-flex flex-wrap gap-2 mt-auto">
                <Link to="/feedback" className="btn btn-primary d-inline-flex align-items-center gap-2">{t('giveFeedback')} <ArrowRight size={16} aria-hidden="true" /></Link>
                <Link to="/feedback#fb-board-title" className="btn btn-outline-dark">{t('feedbackBoard')}</Link>
              </div>
            </div>
          </Reveal>
        </div>
        <h2 id="officers" className="section-title h3 mt-5 mb-3">{t('listOfOfficers')}</h2>
        <div className="table-wrap">
          <table className="table dst-table">
            <caption className="visually-hidden">{t('listOfOfficers')}</caption>
            <thead><tr><th scope="col">{t('officerName')}</th><th scope="col">{t('designation')}</th><th scope="col" className="d-none d-md-table-cell">{t('office')}</th><th scope="col">{t('phone')}</th><th scope="col">{t('email')}</th></tr></thead>
            <tbody>{officers.map((o) => (
              <tr key={o.id}><td className="fw-semibold">{o.name}</td><td>{o.designation}</td><td className="d-none d-md-table-cell">{o.office}</td><td className="text-nowrap">{o.phone}</td><td>{o.email && <a href={`mailto:${o.email}`}>{o.email}</a>}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
