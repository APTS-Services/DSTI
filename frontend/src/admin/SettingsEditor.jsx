import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { api } from '../api/client';
import { useContent } from '../context/ContentContext';
import { useAdmin } from './AdminContext';
import Fields, { emptyItem } from './FormFields';

export default function SettingsEditor() {
  const { name } = useParams();
  const { schemas } = useAdmin();
  const { reload } = useContent();
  const schema = schemas.settings[name];
  const [value, setValue] = useState(null);
  const [msg, setMsg] = useState(null);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(null);
    setMsg(null);
    if (!schema) return;
    api(`/api/admin/settings/${name}`).then(({ item }) => setValue({ ...emptyItem(schema.fields), ...item })).catch((e) => setMsg({ type: 'danger', text: e.message }));
  }, [name, schema]);

  if (!schema) return <div className="alert alert-warning">You do not have access to these settings.</div>;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      await api(`/api/admin/settings/${name}`, { method: 'PUT', body: value });
      reload();
      setMsg({ type: 'success', text: 'Settings saved.' });
    } catch (err) {
      setErrors(err.body?.errors || []);
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <p className="small text-muted-2 mb-0">Settings</p>
      <h1 className="h3 fw-bold mb-3">{schema.label}</h1>
      {msg && <div className={`alert alert-${msg.type}`} role="alert">{msg.text}{errors.length > 0 && <ul className="mb-0 mt-2 small">{errors.map((er) => <li key={er}>{er}</li>)}</ul>}</div>}
      {!value ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="admin-card p-3 p-md-4">
          <Fields fields={schema.fields} value={value} onChange={setValue} prefix={`s-${name}`} />
          <button type="submit" className="btn btn-primary mt-4 d-inline-flex align-items-center gap-2" disabled={busy}>
            {busy ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Save settings
          </button>
        </div>
      )}
    </form>
  );
}
