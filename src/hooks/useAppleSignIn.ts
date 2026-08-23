import { useEffect, useState } from 'react';
import { APPLE_CLIENT_ID, APPLE_REDIRECT_URI } from '../config';

const SDK_URL = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: { code: string; id_token: string; state?: string };
          user?: { name?: { firstName?: string; lastName?: string }; email?: string };
        }>;
      };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

const loadAppleScript = (): Promise<void> => {
  if (window.AppleID) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Sign in with Apple SDK'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
};

export interface AppleSignInResult {
  identityToken: string;
  authorizationCode: string;
  givenName?: string;
  familyName?: string;
  email?: string;
}

/**
 * Wires up Apple's JS SDK against the configured Services ID. Returns
 * `available: false` (and a no-op signIn) when VITE_APPLE_CLIENT_ID isn't
 * set, so callers can hide the button entirely instead of showing one that
 * will always fail — see .env.example for the Apple Developer setup this
 * needs.
 */
export const useAppleSignIn = () => {
  const available = !!APPLE_CLIENT_ID;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!available) return;
    loadAppleScript()
      .then(() => {
        window.AppleID!.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: APPLE_REDIRECT_URI,
          usePopup: true,
        });
        setReady(true);
      })
      .catch((err) => console.error('Apple SDK load failed:', err));
  }, [available]);

  const signIn = async (): Promise<AppleSignInResult> => {
    if (!available || !window.AppleID) {
      throw new Error('Sign in with Apple is not configured for this environment.');
    }
    const res = await window.AppleID.auth.signIn();
    return {
      identityToken: res.authorization.id_token,
      authorizationCode: res.authorization.code,
      givenName: res.user?.name?.firstName,
      familyName: res.user?.name?.lastName,
      email: res.user?.email,
    };
  };

  return { available, ready, signIn };
};
