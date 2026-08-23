import React, { useState } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAppleSignIn } from '../../hooks/useAppleSignIn';

/**
 * Shared Google + Apple sign-in row used on Welcome, Login, and Register.
 * Previously each screen re-implemented Google sign-in independently (with
 * inconsistent error handling — Welcome's failure path was silently
 * swallowed) and Apple/Microsoft were unwired decorative icons. Consolidated
 * here so all three screens behave identically and errors always surface
 * via the shared toast system.
 */
const SocialAuthButtons: React.FC = () => {
  const { loginWithGoogleToken, loginWithApple } = useAuth();
  const { toast } = useToast();
  const { available: appleAvailable, signIn: appleSignIn } = useAppleSignIn();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setBusy('google');
      try {
        const backendRes = await axios.post(
          '/api/auth/google',
          { access_token: tokenResponse.access_token },
          { withCredentials: true }
        );
        const { token, type } = backendRes.data;
        const ok = await loginWithGoogleToken(`${type} ${token}`);
        if (!ok) toast('Google sign-in failed. Please try again.', 'error');
      } catch (err) {
        console.error('Google sign-in error:', err);
        toast('Google sign-in failed. Please try again.', 'error');
      } finally {
        setBusy(null);
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      toast('Google sign-in failed. Please try again.', 'error');
    },
  });

  const handleAppleClick = async () => {
    setBusy('apple');
    try {
      const result = await appleSignIn();
      const ok = await loginWithApple(result);
      if (!ok) toast('Apple sign-in failed. Please try again.', 'error');
    } catch (err) {
      console.error('Apple sign-in error:', err);
      toast('Apple sign-in failed. Please try again.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => googleLogin()}
        disabled={busy !== null}
        aria-label="Continue with Google"
        className="w-11 h-11 flex items-center justify-center rounded-full border border-border-strong bg-surface hover:bg-surface-muted transition disabled:opacity-50"
      >
        <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
      </button>

      {appleAvailable && (
        <button
          type="button"
          onClick={handleAppleClick}
          disabled={busy !== null}
          aria-label="Continue with Apple"
          className="w-11 h-11 flex items-center justify-center rounded-full border border-border-strong bg-surface hover:bg-surface-muted transition disabled:opacity-50"
        >
          <img src="https://www.apple.com/favicon.ico" alt="" className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SocialAuthButtons;
