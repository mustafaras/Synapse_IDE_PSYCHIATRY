import React from 'react';
import { createRoot } from 'react-dom/client';


import '@/styles/fonts.css'
import '@/styles/ui.css'

import AppRoot from './app/AppRoot';

import '@/services/editor/aiEditorBridgeGlobal';
import { AppErrorBoundary, installGlobalRejectionHandler } from './app/ErrorBoundary';
import './services/tasksAdapter';
import { initOtelOnce } from '@/observability/otel';

import '@/features/psychiatry/storeDebug';


import { initRemoveToolkitCtas } from './lib/removeCtas';
initRemoveToolkitCtas();

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ ROOT ELEMENT NOT FOUND!');
  document.body.innerHTML =
    '<h1 style="color: red; font-size: 2rem; text-align: center; margin-top: 2rem;">ERROR: Root element not found!</h1>';
} else {
  try {
    installGlobalRejectionHandler();

  try { initOtelOnce(); } catch {}
    const root = createRoot(rootElement);

    try {


      const params = new URLSearchParams(location.search);
      if (params.get('aiWipeKeys') === '1') {
    try { (window as any)?.useAiSettingsStore?.getState?.().clearAllKeys?.(); } catch {}
        try {
          const unified = (window as any)?.useAiConfigStore?.getState?.();
          unified?.clearAllKeys?.();
        } catch {}
      }
    } catch {}


    let StrictWrapper: React.ComponentType<{ children: React.ReactNode }> = React.StrictMode;
    try {
      const sp = new URLSearchParams(location.search);
      if (sp.has('nostrict')) StrictWrapper = ({ children }) => <>{children}</>;
    } catch {  }
    root.render(
      <StrictWrapper>
        <AppErrorBoundary>
          <AppRoot />
        </AppErrorBoundary>
      </StrictWrapper>
    );
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : String(error);
    document.body.innerHTML = `<h1 style="color: red; font-size: 1.5rem; text-align: center; margin: 2rem; padding: 2rem; border: 2px solid red;">ERROR: ${errorMessage}</h1>`;
    document.body.innerHTML += `<pre style="color: red; text-align: left; margin: 2rem; padding: 1rem; background: #f0f0f0;">${errorStack}</pre>`;
  }
}
