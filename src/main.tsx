import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Catch any uncaught module-init or runtime error and render a readable
// fallback instead of a blank screen. iOS Safari does not surface the
// browser console to most users, so an unhandled error there used to
// silently leave a white page.
function renderFatalFallback(message: string) {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #6C4AB0 0%, #9B87F5 55%, #38BDF8 100%);
      color: #fff;
      text-align: center;
    ">
      <div style="max-width: 420px;">
        <div style="font-size: 22px; font-weight: 600; margin-bottom: 12px;">
          Lumicoria couldn't start
        </div>
        <div style="font-size: 14px; opacity: 0.88; line-height: 1.6;">
          Something went wrong loading the app. Try refreshing the page.
          If this keeps happening, email
          <a style="color: #fff; text-decoration: underline;" href="mailto:support@lumicoria.ai">support@lumicoria.ai</a>.
        </div>
        <div style="font-size: 11px; opacity: 0.65; margin-top: 18px; font-family: ui-monospace, monospace;">
          ${message}
        </div>
      </div>
    </div>
  `;
}

window.addEventListener('error', (e) => {
  if (!document.getElementById('root')?.firstChild) {
    renderFatalFallback(e.message || 'Unknown error');
  }
});
window.addEventListener('unhandledrejection', (e) => {
  if (!document.getElementById('root')?.firstChild) {
    renderFatalFallback(String(e.reason ?? 'Unknown error'));
  }
});

try {
  createRoot(document.getElementById('root')!).render(<App />);
} catch (err) {
  renderFatalFallback(err instanceof Error ? err.message : String(err));
}
