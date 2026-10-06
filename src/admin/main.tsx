import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'admin-lte/dist/css/adminlte.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './admin.css';
import AdminApp from './AdminApp';
import { AuthProvider } from './auth';
import { ToastProvider } from './components/Toasts';

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <ToastProvider>
          <AdminApp />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
