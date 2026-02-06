import React from 'react';
import { Bug, X, Trash2, Copy } from 'lucide-react';
import { useDebug } from '../context/DebugLogContext';

const LevelBadge: React.FC<{ level: 'log' | 'info' | 'warn' | 'error' }> = ({ level }) => {
  const map: Record<string, string> = {
    log: 'bg-gray-100 text-gray-700',
    info: 'bg-blue-100 text-blue-700',
    warn: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${map[level]}`}>{level.toUpperCase()}</span>;
};

export const DebugPanel: React.FC = () => {
  const { entries, clear, open, setOpen } = useDebug();

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entries, null, 2));
    } catch { }
  };

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-full shadow-md bg-black/80 text-white hover:bg-black"
        title="Debug Logs"
      >
        <Bug size={18} />
        <span className="hidden md:inline">Logs</span>
        {entries.length > 0 && (
          <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{entries.filter(e => e.level === 'error').length}</span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/40">
          <div className="absolute right-0 top-0 h-full w-full md:w-[640px] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2 font-bold"><Bug size={18} /> Debug Console</div>
              <div className="flex items-center gap-2">
                <button onClick={copyAll} className="p-2 rounded hover:bg-gray-100" title="Copy JSON"><Copy size={18} /></button>
                <button onClick={clear} className="p-2 rounded hover:bg-gray-100" title="Clear"><Trash2 size={18} /></button>
                <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100" title="Close"><X size={18} /></button>
              </div>
            </div>
            <div className="px-4 py-3 text-sm text-gray-600 border-b">
              Errors: <span className="font-bold text-red-600">{entries.filter(e => e.level === 'error').length}</span> · Warnings: <span className="font-bold text-yellow-600">{entries.filter(e => e.level === 'warn').length}</span> · Logs: <span className="font-bold">{entries.length}</span>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {entries.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No logs yet</div>
              ) : entries.map(e => (
                <div key={e.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <LevelBadge level={e.level} />
                    <span className="text-xs text-gray-500">{e.time}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-900 break-words whitespace-pre-wrap">{e.message}</div>
                  {e.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Stack trace</summary>
                      <pre className="text-[11px] text-gray-700 whitespace-pre-wrap">{e.stack}</pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
