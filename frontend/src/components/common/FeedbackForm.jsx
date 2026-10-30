// Feedback form (CAPTCHA protected). Used on the Feedback page.
import React, { useRef, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
import Captcha from './Captcha';

const EMPTY = { name: '', email: '', phone: '', category: 'General', subject: '', message: '' };

// Values are stored in English (they drive the CMS reports); labels follow the language.
export const FEEDBACK_CATEGORIES = [
  ['General', 'General', 'సాధారణం'],
  ['Schemes & programmes', 'Schemes & programmes', 'పథకాలు & కార్యక్రమాలు'],
  ['Tenders & procurement', 'Tenders & procurement', 'టెండర్లు & కొనుగోళ్లు'],
  ['RTI', 'Right to Information', 'సమాచార హక్కు'],
  ['Website', 'This website', 'ఈ వెబ్‌సైట్'],
  ['Grievance', 'Grievance', 'ఫిర్యాదు'],
  ['Suggestion', 'Suggestion', 'సూచన'],
];

export default function FeedbackForm({ onSent }) {
  const { t, lang } = useLanguage();
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
      setStatus({ state: 'done', ref: res.reference, email: form.email.trim() });
      setForm(EMPTY);
      onSent?.(res.reference);
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
        <div><strong>{t('feedbackSuccess')}</strong><div>{t('referenceNo')}: <strong className="font-monospace">{status.ref}</strong></div><div className="small">{t('trackFeedbackDesc')}</div>
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
      <div className="col-md-6">
        <label htmlFor="fb-category" className="form-label">{t('category')}</label>
        <select id="fb-category" className="form-select" value={form.category} onChange={set('category')}>
          {FEEDBACK_CATEGORIES.map(([value, en, te]) => <option key={value} value={value}>{lang === 'te' ? te : en}</option>)}
        </select>
      </div>
      {field('subject', t('subject'), { max: 150, full: true })}
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
