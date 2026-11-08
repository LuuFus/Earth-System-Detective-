import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/source-serif-4/opsz.css';
import './styles/tokens.css';
import './styles/site.css';
import App from './App';
import { I18nProvider } from './i18n/I18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
);
