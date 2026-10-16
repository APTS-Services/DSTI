// "Ask Vigyan Mitra" — answers only from content published on this website and
// cites the source page. Runs entirely in the browser; no external AI service.
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ExternalLink, Send, X } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ask } from '../../utils/searchIndex';

const SUGGESTIONS = {
  en: ['How do I file an RTI request?', 'What incentives are available for investors?', 'Which districts have space-tech institutions?', 'What is the Drone Policy?'],
  te: ['RTI దరఖాస్తు ఎలా చేయాలి?', 'పెట్టుబడిదారులకు ప్రోత్సాహకాలు', 'డ్రోన్ విధానం', 'తిరుపతి'],
};

export function AssistantLauncher({ onOpen }) {
  const { t } = useLanguage();
  return (
    <button type="button" className="assistant-launcher" onClick={onOpen} aria-label={t('vigyanMitra')}>
      <span className="avatar"><Bot size={22} aria-hidden="true" /></span>
      <span className="text"><strong>{t('vigyanMitra')}</strong><small>{t('howCanIHelp')}</small></span>
    </button>
  );
}

export default function VigyanMitra({ open, onClose }) {
  const { t, lang } = useLanguage();
  const { data } = useContent();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

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

  if (!open) return null;

  const send = (text) => {
    const q = (text ?? input).trim().slice(0, 200);
    if (!q) return;
    setMessages((m) => [...m, { me: true, text: q }, { me: false, ...ask(data, q, lang) }]);
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
          <button type="button" className="btn btn-sm btn-light-outline btn-icon" onClick={onClose} aria-label={t('closeMenu')}><X size={18} aria-hidden="true" /></button>
        </div>

        <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-3" aria-live="polite">
          {messages.length === 0 && (
            <div className="bubble bot">
              <p className="mb-2">{t('vigyanMitraDesc')}</p>
              <div className="d-flex flex-wrap gap-2">
                {SUGGESTIONS[lang].map((s) => (
                  <button key={s} type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (m.me ? (
            <p key={i} className="bubble me mb-0">{m.text}</p>
          ) : (
            <div key={i} className="bubble bot">
              {m.matched ? (
                <>
                  <p className="mb-1"><strong>{m.title}</strong></p>
                  <p className="mb-2">{m.answer}</p>
                  <p className="small fw-semibold text-uppercase text-muted-2 mb-1">{t('sources')}</p>
                  <ul className="list-unstyled mb-0 small d-grid gap-1">
                    {m.sources.map((s) => (
                      <li key={s.path + s.title}>
                        <Link to={s.path} onClick={onClose} className="d-inline-flex align-items-center gap-1"><ExternalLink size={12} aria-hidden="true" /> {s.title}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mb-0">{t('noAnswer')} <Link to="/contact" onClick={onClose}>{t('contact')}</Link></p>
              )}
            </div>
          )))}
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
