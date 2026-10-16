// Server-generated image CAPTCHA with refresh button.
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

const Captcha = forwardRef(function Captcha({ value, onChange, invalid, id = 'captcha' }, ref) {
  const { t } = useLanguage();
  const [c, setC] = useState(null);
  const refresh = useCallback(async () => {
    onChange('');
    try {
      setC(await api('/api/auth/captcha'));
    } catch {
      setC(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useImperativeHandle(ref, () => ({ id: c?.id, refresh }), [c, refresh]);

  return (
    <div>
      <label htmlFor={id} className="form-label">{t('captcha')} <span className="text-danger">*</span></label>
      <div className="d-flex flex-wrap align-items-center gap-2">
        {c ? <img src={c.image} alt={t('captchaAlt')} className="captcha-img" width="150" height="48" /> : <span className="captcha-img skeleton d-inline-block" style={{ width: 150 }} />}
        <button type="button" className="btn btn-outline-secondary btn-icon" onClick={refresh} aria-label={t('refreshCaptcha')} title={t('refreshCaptcha')}>
          <RefreshCw size={16} aria-hidden="true" />
        </button>
        <input
          id={id}
          className={`form-control ${invalid ? 'is-invalid' : ''}`}
          style={{ maxWidth: 170 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          maxLength={8}
          required
          aria-describedby={`${id}-help`}
        />
      </div>
      <div id={`${id}-help`} className="form-text">{t('captchaHelp')}</div>
    </div>
  );
});

export default Captcha;
