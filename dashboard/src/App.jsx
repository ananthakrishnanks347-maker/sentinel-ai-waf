import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Trash2, 
  Lock,
  Terminal,
  Zap
} from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [wsStatus, setWsStatus] = useState('Connecting');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/logs');

    ws.onopen = () => setWsStatus('Connected');
    ws.onclose = () => setWsStatus('Disconnected');
    ws.onerror = () => setWsStatus('Error');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newLog = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          ...data
        };
        setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      } catch (err) {
        console.error('Failed to parse WS log:', err);
      }
    };

    return () => ws.close();
  }, []);

  const totalRequests = logs.length;
  const blockedRequests = logs.filter((l) => l.status && l.status.includes('BLOCKED')).length;
  const allowedRequests = logs.filter((l) => l.status && l.status.includes('ALLOWED')).length;
  const threatRatio = totalRequests > 0 ? ((blockedRequests / totalRequests) * 100).toFixed(1) : '0.0';

  const filteredLogs = logs.filter((log) => {
    if (filter === 'BLOCKED') return log.status && log.status.includes('BLOCKED');
    if (filter === 'ALLOWED') return log.status && log.status.includes('ALLOWED');
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sentinel-AI WAF
            </h1>
            <p className="text-xs text-slate-400">Next-Gen Real-Time Security Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          <Radio className={`w-4 h-4 ${wsStatus === 'Connected' ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-300">
            WS Status: <span className={wsStatus === 'Connected' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{wsStatus}</span>
          </span>
        </div>
      </header>

      {/* Metrics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase">
            <span>Total Inspected</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-mono">{totalRequests}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase">
            <span>Threats Blocked</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-2 font-mono">{blockedRequests}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase">
            <span>Clean Allowed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{allowedRequests}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase">
            <span>Threat Ratio</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2 font-mono">{threatRatio}%</p>
        </div>
      </section>

      {/* Table Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-slate-200">Live Traffic Feed</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {['ALL', 'BLOCKED', 'ALLOWED'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    filter === type
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLogs([])}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 rounded-lg"
              title="Clear Console"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase">
                <th className="p-3.5">Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Endpoint Path</th>
                <th className="p-3.5">Threat Classification</th>
                <th className="p-3.5">Payload Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                    Waiting for HTTP traffic... Run test_attacks.py to view live logs.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isBlocked = log.status && log.status.includes('BLOCKED');
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-400">{log.timestamp}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            isBlocked
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isBlocked ? <Lock className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-300">{log.method}</td>
                      <td className="p-3.5 text-indigo-300 font-semibold">{log.path}</td>
                      <td className="p-3.5">
                        <span className={isBlocked ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                          {log.threat_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate" title={log.payload}>
                        {log.payload}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
