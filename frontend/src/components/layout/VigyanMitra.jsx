// "Ask Vigyan Mitra" — answers only from content published on this website and
// cites the source page. The answer itself is composed per question by
// utils/assistant.js; no external AI service is involved.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ExternalLink, RotateCcw, Send, X } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ask as localAsk, suggestions } from '../../utils/assistant';
import { api } from '../../api/client';

export function AssistantLauncher({ onOpen }) {
  const { t } = useLanguage();
  return (
    <button type="button" className="assistant-launcher" onClick={onOpen} aria-label={t('vigyanMitra')}>
      <span className="avatar"><Bot size={22} aria-hidden="true" /></span>
      <span className="text"><strong>{t('vigyanMitra')}</strong><small>{t('howCanIHelp')}</small></span>
    </button>
  );
}

function Sources({ list, label, onClose }) {
  return (
    <>
      <p className="small fw-semibold text-uppercase text-muted-2 mb-1">{label}</p>
      <ol className="vm-sources list-unstyled mb-0 small d-grid gap-1">
        {list.map((s, i) => (
          <li key={`${s.path}-${i}`} className="d-flex align-items-start gap-2">
            <span className="vm-cite" aria-hidden="true">{i + 1}</span>
            <Link to={s.path} onClick={onClose} className="d-inline-flex align-items-center gap-1">
              {s.title} <ExternalLink size={12} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

function Answer({ m, onFollowUp, onClose, t }) {
  if (!m.matched) {
    return (
      <p className="mb-0">
        {t('noAnswer')} <Link to="/contact" onClick={onClose}>{t('contact')}</Link>
      </p>
    );
  }
  return (
    <>
      <p className="mb-2">{m.lead}</p>
      {m.bullets.length > 0 && (
        <ul className="vm-facts list-unstyled mb-2">
          {m.bullets.map((b, i) => (
            <li key={`${b.label}-${i}`}>
              <span className="vm-fact-label">{b.label}</span>
              <span>{b.value}</span>
            </li>
          ))}
        </ul>
      )}
      {m.note && <p className="small text-muted-2 mb-2">{m.note}</p>}
      <Sources list={m.sources} label={t('sources')} onClose={onClose} />
      {m.followUps.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {m.followUps.map((q) => (
            <button key={q} type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => onFollowUp(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** Maps the backend answer (POST /api/v1/assistant/ask) onto the chat bubble. */
function toMessage(payload) {
  if (!payload) return { matched: false, bullets: [], sources: [], followUps: [] };
  return {
    matched: Boolean(payload.answered),
    intent: payload.intent || null,
    lead: payload.lead || payload.answer || '',
    bullets: Array.isArray(payload.bullets) ? payload.bullets : [],
    note: payload.note || '',
    sources: (payload.sources || []).map((s) => ({ title: s.title, path: s.url || s.path || '/' })),
    followUps: payload.follow_ups || payload.followUps || []
  };
}

export default function VigyanMitra({ open, onClose }) {
  const { t, lang } = useLanguage();
  const { data } = useContent();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const inFlight = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const starters = useMemo(() => suggestions(data, lang), [data, lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Answers come from the backend: POST /api/v1/assistant/ask composes them from
  // the records published in MySQL (tenders, documents, policies, districts,
  // events, officers, contact details…) and cites the page that holds each fact.
  // The in-flight text guards against React StrictMode's double effect run.
  useEffect(() => {
    if (!open) return undefined;
    const last = messages[messages.length - 1];
    if (!last || !last.me) return undefined;
    if (inFlight.current === last.text) return undefined;
    inFlight.current = last.text;
    const previous = messages.slice(0, -1).reverse().find((m) => m.me)?.text || '';
    const previousIntent = [...messages].reverse().find((m) => !m.me)?.intent || null;
    setPending(true);
    api('/api/v1/assistant/ask', {
      method: 'POST',
      body: { question: last.text, lang, previous, previous_intent: previousIntent || undefined }
    })
      .then((res) => setMessages((m) => [...m, { me: false, ...toMessage(res?.data) }]))
      .catch(() => {
        // The API is unreachable (offline, rate limited): answer from the copy of
        // the same CMS content that is already cached in this browser.
        setMessages((m) => [...m, { me: false, ...localAsk(data, last.text, lang, { previous, previousIntent }) }]);
      })
      .finally(() => {
        inFlight.current = null;
        setPending(false);
      });
    return undefined;
  }, [open, messages, data, lang]);

  if (!open) return null;

  const send = (value) => {
    const q = (value ?? input).trim().slice(0, 200);
    if (!q) return;
    setMessages((m) => [...m, { me: true, text: q }]);
    setInput('');
  };

  return (
    <div className="overlay side" role="dialog" aria-modal="true" aria-labelledby="vm-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="sheet">
        <div className="chat-head d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center gap-2">
            <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white text-primary" style={{ width: 38, height: 38 }}><Bot size={20} aria-hidden="true" /></span>
            <div>
              <h2 id="vm-title" className="h6 mb-0 text-white">{t('vigyanMitra')}</h2>
              <small className="opacity-75">{t('vigyanDisclaimer')}</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-1">
            {messages.length > 0 && (
              <button type="button" className="btn btn-sm btn-light-outline btn-icon" onClick={() => setMessages([])} aria-label={t('vmClear')} title={t('vmClear')}>
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            )}
            <button type="button" className="btn btn-sm btn-light-outline btn-icon" onClick={onClose} aria-label={t('closeMenu')}><X size={18} aria-hidden="true" /></button>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-3" aria-live="polite">
          {messages.length === 0 && (
            <div className="bubble bot">
              <p className="mb-2">{t('vigyanMitraDesc')}</p>
              {starters.length > 0 && (
                <>
                  <p className="small fw-semibold text-uppercase text-muted-2 mb-1">{t('vmTryAsking')}</p>
                  <div className="d-flex flex-wrap gap-2">
                    {starters.map((s) => (
                      <button key={s} type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => send(s)}>{s}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {messages.map((m, i) => (m.me ? (
            <p key={i} className="bubble me mb-0">{m.text}</p>
          ) : (
            <div key={i} className="bubble bot">
              <Answer m={m} onFollowUp={send} onClose={onClose} t={t} />
            </div>
          )))}
          {pending && (
            <p className="bubble bot mb-0 text-muted-2">{t('loading')}</p>
          )}
          <div ref={endRef} />
        </div>

        <form className="border-top p-3 d-flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <label htmlFor="vm-input" className="visually-hidden">{t('typeQuestion')}</label>
          <input ref={inputRef} id="vm-input" className="form-control" placeholder={t('typeQuestion')} value={input} onChange={(e) => setInput(e.target.value)} maxLength={200} autoComplete="off" />
          <button type="submit" className="btn btn-primary btn-icon flex-shrink-0" aria-label={t('submit')}><Send size={16} aria-hidden="true" /></button>
        </form>
      </aside>
    </div>
  );
}
