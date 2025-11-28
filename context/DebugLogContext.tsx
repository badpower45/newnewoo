import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type DebugLogLevel = 'log' | 'info' | 'warn' | 'error';

export interface DebugEntry {
  id: string;
  time: string;
  level: DebugLogLevel;
  message: string;
  data?: any[];
  stack?: string;
}

interface DebugContextType {
  entries: DebugEntry[];
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [open, setOpen] = useState(false);
  const originals = useRef<{ [k in DebugLogLevel]: any }>({
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  });

  const addEntry = (level: DebugLogLevel, args: any[], err?: any) => {
    const time = new Date().toLocaleTimeString();
    const message = args.map((a: any) => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    const stack = err?.stack || (args.find((a: any) => a instanceof Error)?.stack);
    setEntries(prev => [{ id: crypto.randomUUID(), time, level, message, data: args, stack }, ...prev].slice(0, 500));
  };

  useEffect(() => {
    // Patch console methods
    console.log = (...args: any[]) => { addEntry('log', args); originals.current.log.apply(console, args); };
    console.info = (...args: any[]) => { addEntry('info', args); originals.current.info.apply(console, args); };
    console.warn = (...args: any[]) => { addEntry('warn', args); originals.current.warn.apply(console, args); };
    console.error = (...args: any[]) => { addEntry('error', args); originals.current.error.apply(console, args); };

    const onError = (event: ErrorEvent) => { addEntry('error', [event.message], event.error); };
    const onRejection = (event: PromiseRejectionEvent) => { addEntry('error', ['Unhandled rejection', event.reason]); };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      // restore best-effort
      console.log = originals.current.log;
      console.info = originals.current.info;
      console.warn = originals.current.warn;
      console.error = originals.current.error;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  const value = useMemo(() => ({ entries, clear: () => setEntries([]), open, setOpen }), [entries, open]);
  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
};

export const useDebug = () => {
  const ctx = useContext(DebugContext);
  if (!ctx) throw new Error('useDebug must be used within DebugProvider');
  return ctx;
};
