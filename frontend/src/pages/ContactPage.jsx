import React, { useRef, useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Printer, Send } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { useCollection, useSetting } from '../context/ContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import PageHero from '../components/common/PageHero';
import Captcha from '../components/common/Captcha';
import Reveal from '../components/common/Reveal';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };

function FeedbackForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [captcha, setCaptcha] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle' });
  const capRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('errName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = t('errEmail');
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = t('errPhone');
    if (form.message.trim().length < 10) e.message = t('errMessage');
    if (!captcha.trim()) e.captcha = t('errCaptcha');
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus({ state: 'sending' });
    try {
      const res = await api('/api/public/feedback', { method: 'POST', body: { ...form, captchaId: capRef.current?.id, captcha } });
      setStatus({ state: 'done', ref: res.reference });
      setForm(EMPTY);
      capRef.current?.refresh();
    } catch (err) {
      const fields = err instanceof ApiError ? err.body.fields || (err.body.field ? { [err.body.field]: err.message } : {}) : {};
      setErrors(fields);
      setStatus({ state: 'error', message: err.message });
      capRef.current?.refresh();
    }
  };

  if (status.state === 'done') {
    return (
      <div className="alert alert-success d-flex gap-3" role="status">
        <CheckCircle2 aria-hidden="true" />
        <div><strong>{t('feedbackSuccess')}</strong><div>{t('referenceNo')}: {status.ref}</div>
          <button type="button" className="btn btn-sm btn-outline-success mt-2" onClick={() => setStatus({ state: 'idle' })}>{t('sendAnother')}</button></div>
      </div>
    );
  }

  const field = (k, label, props = {}) => (
    <div className={props.full ? 'col-12' : 'col-md-6'}>
      <label htmlFor={`fb-${k}`} className="form-label">{label}{props.required && <span className="text-danger"> *</span>}</label>
      {props.textarea ? (
        <textarea id={`fb-${k}`} className={`form-control ${errors[k] ? 'is-invalid' : ''}`} rows={5} value={form[k]} onChange={set(k)} maxLength={2000} required={props.required} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `fb-${k}-err` : undefined} />
      ) : (
        <input id={`fb-${k}`} type={props.type || 'text'} className={`form-control ${errors[k] ? 'is-invalid' : ''}`} value={form[k]} onChange={set(k)} maxLength={props.max || 150} required={props.required} autoComplete={props.auto} inputMode={props.mode} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `fb-${k}-err` : undefined} />
      )}
      {errors[k] && <div id={`fb-${k}-err`} className="invalid-feedback">{errors[k]}</div>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="row g-3" aria-describedby="fb-note">
      {status.state === 'error' && <div className="col-12"><div className="alert alert-danger mb-0" role="alert">{status.message}</div></div>}
      {field('name', t('yourName'), { required: true, max: 100, auto: 'name' })}
      {field('email', t('yourEmail'), { required: true, type: 'email', max: 160, auto: 'email' })}
      {field('phone', t('yourPhone'), { type: 'tel', max: 10, auto: 'tel', mode: 'numeric' })}
      {field('subject', t('subject'), { max: 150 })}
      {field('message', t('yourMessage'), { required: true, textarea: true, full: true })}
      <div className="col-12">
        <Captcha ref={capRef} value={captcha} onChange={setCaptcha} invalid={Boolean(errors.captcha)} id="fb-captcha" />
        {errors.captcha && <div className="text-danger small mt-1">{errors.captcha}</div>}
      </div>
      <div className="col-12 d-flex flex-wrap align-items-center gap-3">
        <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={status.state === 'sending'}>
          {status.state === 'sending' ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />} {t('sendFeedback')}
        </button>
        <small id="fb-note" className="text-muted-2">{t('feedbackPrivacy')}</small>
      </div>
    </form>
  );
}

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
            <div className="dst-card p-4">
              <h2 className="h4 fw-bold mb-3">{t('feedbackForm')}</h2>
              <FeedbackForm />
            </div>
          </Reveal>
        </div>
        <h2 className="section-title h3 mt-5 mb-3">{t('listOfOfficers')}</h2>
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
