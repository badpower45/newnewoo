/// <reference types="vite/client" />

// React 19 JSX types - required for TypeScript to recognize JSX elements
declare namespace React {
  interface JSX {
    IntrinsicElements: {
      [elemName: string]: any;
    };
  }
}

// Fallback JSX namespace for older TypeScript versions
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

interface Window {
  cartSyncTimeout?: number;
  quantityUpdateTimeout?: number;
}
