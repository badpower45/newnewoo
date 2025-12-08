import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Guard against duplicate custom element registration (e.g., mce-autosize-textarea) to prevent runtime errors
if (typeof window !== 'undefined' && window.customElements) {
  const originalDefine = window.customElements.define.bind(window.customElements);
  window.customElements.define = (name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => {
    if (window.customElements.get(name)) return; // skip if already registered
    originalDefine(name, constructor, options);
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);