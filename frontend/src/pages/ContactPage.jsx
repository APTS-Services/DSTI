// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import useSEO from '../utils/useSEO';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import { contact } from '../data/site';
import { officers } from '../data/officers';
import { addFeedback } from '../data/store';

export default function ContactPage() {
  const { t, tc } = useLanguage();
  useSEO({ title: t('contact'), path: '/contact' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [done, setDone] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // Stored securely in the app store (server-side store when the backend is wired up)
    // and flagged for notification to the Department.
    addFeedback(form);
    setDone(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <>
      <PageHero title={t('contact')} subtitle="Head office, officers and feedback." breadcrumbs={[{ label: t('contact') }]} />

      <div className="dst-container py-10">
        {/* Head office */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="dst-card p-6 lg:col-span-2">
            <SectionHeading title={t('headOffice')} />
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary-600" aria-hidden="true" />
                <span className="text-neutral-600 dark:text-neutral-200">{tc(contact.headOffice)}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="flex-shrink-0 text-primary-600" aria-hidden="true" />
                <span className="text-neutral-600 dark:text-neutral-200">{contact.phone} · Fax {contact.fax}</span>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="flex-shrink-0 text-primary-600" aria-hidden="true" />
                <a href={`mailto:${contact.email}`} className="dst-link">{contact.email}</a>
              </li>
              <li className="flex gap-3">
                <Clock size={18} className="flex-shrink-0 text-primary-600" aria-hidden="true" />
                <span className="text-neutral-600 dark:text-neutral-200">{contact.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Feedback form */}
          <div className="dst-card p-6">
            <SectionHeading title={t('feedbackForm')} />
            {done ? (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-primary-50 p-6 text-center dark:bg-neutral-800">
                <CheckCircle2 size={36} className="text-primary-600" aria-hidden="true" />
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{t('feedbackSuccess')}</p>
                <button type="button" onClick={() => setDone(false)} className="btn-outline">{t('sendFeedback')}</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="label-style" htmlFor="fb-name">{t('yourName')} *</label>
                  <input id="fb-name" name="name" required value={form.name} onChange={onChange} className="input-style" />
                </div>
                <div>
                  <label className="label-style" htmlFor="fb-email">{t('yourEmail')} *</label>
                  <input id="fb-email" name="email" type="email" required value={form.email} onChange={onChange} className="input-style" />
                </div>
                <div>
                  <label className="label-style" htmlFor="fb-phone">{t('yourPhone')}</label>
                  <input id="fb-phone" name="phone" value={form.phone} onChange={onChange} className="input-style" />
                </div>
                <div>
                  <label className="label-style" htmlFor="fb-subject">{t('subject')} *</label>
                  <input id="fb-subject" name="subject" required value={form.subject} onChange={onChange} className="input-style" />
                </div>
                <div>
                  <label className="label-style" htmlFor="fb-message">{t('yourMessage')} *</label>
                  <textarea id="fb-message" name="message" required rows={4} value={form.message} onChange={onChange} className="input-style" />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Send size={16} aria-hidden="true" /> {t('sendFeedback')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Officers */}
        <div className="mt-12">
          <SectionHeading title={t('listOfOfficers')} />
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
            <table className="dst-table">
              <caption className="sr-only">{t('listOfOfficers')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('officerName')}</th>
                  <th scope="col">{t('designation')}</th>
                  <th scope="col" className="hidden sm:table-cell">{t('office')}</th>
                  <th scope="col">{t('phone')}</th>
                  <th scope="col" className="hidden lg:table-cell">{t('email')}</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((o) => (
                  <tr key={o.email}>
                    <td className="font-semibold text-neutral-900 dark:text-neutral-100">{o.name}</td>
                    <td>{o.designation}</td>
                    <td className="hidden sm:table-cell">{o.office}</td>
                    <td className="whitespace-nowrap">{o.phone}</td>
                    <td className="hidden lg:table-cell">
                      <a href={`mailto:${o.email}`} className="dst-link">{o.email}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
