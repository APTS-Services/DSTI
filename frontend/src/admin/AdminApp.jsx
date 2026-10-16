import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AdminProvider, useAdmin } from './AdminContext';
import Login from './Login';
import ChangePassword from './ChangePassword';
import Layout from './Layout';
import Dashboard from './Dashboard';
import CollectionList from './CollectionList';
import ItemEditor from './ItemEditor';
import SettingsEditor from './SettingsEditor';
import Feedback from './Feedback';
import Analytics from './Analytics';
import MediaLibrary from './MediaLibrary';
import Users from './Users';
import AuditLog from './AuditLog';
import Backup from './Backup';
import Loading from '../components/common/Loading';
import useSEO from '../hooks/useSEO';

function Guard({ children }) {
  const { loading, user } = useAdmin();
  const { pathname } = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: pathname }} />;
  if (user.mustChangePassword) return <Navigate to="/admin/change-password" replace />;
  return children;
}

function Routed() {
  useSEO({ title: 'CMS' });
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route element={<Guard><Layout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="c/:collection" element={<CollectionList />} />
        <Route path="c/:collection/:key" element={<ItemEditor />} />
        <Route path="settings/:name" element={<SettingsEditor />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="users" element={<Users />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="backup" element={<Backup />} />
        <Route path="account" element={<ChangePassword embedded />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/admin/*" element={<Routed />} />
      </Routes>
    </AdminProvider>
  );
}
