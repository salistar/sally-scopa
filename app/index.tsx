/**
 * @file index.tsx
 * @description Entry point / root redirect for the Scopa app. Checks auth token and redirects to tabs or welcome screen.
 * @author Idriss Kriouile
 * @date 2026-04-05
 * @project SallyCards - Scopa
 */

import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import * as api from '../shared/api';

export default function Index() {
  // Check if user has a valid auth token stored
  const token = api.getAuthToken();

  // useEffect: Log component mount and auth state for debugging
  useEffect(() => {
    console.log('[Scopa/index] Component mounted');
    console.log('[Scopa/index] Auth token present:', !!token);
  }, []);

  // If token exists, user is authenticated — redirect to main tabs
  if (token) {
    console.log('[Scopa/index] Navigating to /(tabs)');
    return <Redirect href="/(tabs)" />;
  }

  // No token — redirect to welcome/onboarding screen
  console.log('[Scopa/index] Navigating to /auth/welcome');
  return <Redirect href="/auth/welcome" />;
}

/* === End of index.tsx — Scopa — SallyCards === */
