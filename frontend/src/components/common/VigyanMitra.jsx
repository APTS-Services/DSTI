// src/components/common/VigyanMitra.jsx
// "Ask Vigyan Mitra" — a help assistant that answers ONLY from content published
// on this website and cites the source page. No external API or third-party script.
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ExternalLink, Send, Sparkles, X } from 'lucide-react';
import { askVigyanMitra } from '../../utils/searchIndex';
import { useLanguage } from '../../i18n/LanguageContext';

const SUGGESTIONS = [
  'How do I apply for RTI?',
  'What incentives are available for investors?',
  'Which districts have space-tech institutions?',
  'What is the Drone Policy?',
];

export default function VigyanMitra({ open, onClose }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const ask = (question) => {
    const q = (question ?? input).trim();
    if (!q) return;
    const res = askVigyanMitra(q);
    setMessages((prev) => [...prev, { role: 'user', text: q }, { role: 'bot', ...res }]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t('vigyanMitra')}>
      <button type="button" className="flex-1 cursor-default" aria-label={t('closeMenu')} onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-neutral-900 to-primary-700 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-500 text-neutral-950">
              <Bot size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold">{t('vigyanMitra')}</p>
              <p className="text-[0.7rem] text-primary-100">{t('governmentOf')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('closeMenu')} className="rounded p-1 hover:bg-white/15">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles size={16} className="text-secondary-500" aria-hidden="true" /> {t('vigyanMitra')}
              </p>
              <p className="mt-2">{t('vigyanMitraDesc')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-primary-300 bg-white px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50 dark:border-primary-700 dark:bg-neutral-900 dark:text-primary-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-neutral-900 px-3.5 py-2 text-sm text-white">{m.text}</p>
              </div>
            ) : (
              <div key={i} className="flex gap-2">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                  <Bot size={14} aria-hidden="true" />
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                  <p className="leading-relaxed">{m.answer}</p>
                  {m.sources?.length > 0 && (
                    <div className="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-700">
                      <p className="text-[0.68rem] font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-300">{t('sources')}</p>
                      <ul className="mt-1 space-y-1">
                        {m.sources.map((s) => (
                          <li key={s.path + s.title}>
                            <Link to={s.path} onClick={onClose} className="flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline dark:text-primary-300">
                              <ExternalLink size={11} aria-hidden="true" /> {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="border-t border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('typeQuestion')}
              aria-label={t('typeQuestion')}
              className="input-style"
            />
            <button type="submit" className="btn-primary flex-shrink-0" aria-label={t('submit')}>
              <Send size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-[0.68rem] text-neutral-500 dark:text-neutral-400">{t('vigyanDisclaimer')}</p>
        </form>
      </aside>
    </div>
  );
}
