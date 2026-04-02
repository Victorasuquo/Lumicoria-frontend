import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Minimal OAuth callback page.
 * Opened as a popup by IntegrationDetail. Reads the authorization code and
 * state from the URL search params, then sends them back to the parent
 * window via postMessage and closes itself.
 */
export default function OAuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setMessage(params.get('error_description') || `Authentication failed: ${error}`);
      // Still notify parent so it can clean up
      window.opener?.postMessage(
        { type: 'oauth_callback', error, error_description: params.get('error_description') },
        window.location.origin,
      );
      setTimeout(() => window.close(), 2500);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Missing authorization code or state. Please try again.');
      setTimeout(() => window.close(), 2500);
      return;
    }

    // Send code + state back to the parent window (IntegrationDetail)
    window.opener?.postMessage(
      { type: 'oauth_callback', code, state },
      window.location.origin,
    );

    setStatus('success');
    setMessage('Authentication successful! This window will close...');
    setTimeout(() => window.close(), 1500);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center p-8 max-w-sm">
        {status === 'processing' && (
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
        )}
        {status === 'error' && (
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        )}
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
