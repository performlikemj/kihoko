import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import FlashBook from '../components/flash/FlashBook';
import FlashSheet from '../components/flash/FlashSheet';
import { FlashShell } from '../components/flash/FlashStyles';
export default function FlashPage() {
  const [designs, setDesigns] = useState([]), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [note, setNote] = useState(''), [selected, setSelected] = useState(null), [paidSession, setPaidSession] = useState(null);
  const [params, setParams] = useSearchParams();
  const cancelling = useRef(null);
  const refresh = useCallback(async () => {
    try { const res = await apiService.getFlash(); setDesigns(res.data?.data || []); setError(''); }
    catch { setError('The flash book could not load. Please try again in a moment.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const sessionId = params.get('cancelled');
  useEffect(() => {
    if (!sessionId || cancelling.current === sessionId) return;
    cancelling.current = sessionId; setPaidSession(null);
    apiService.cancelFlashClaim(sessionId).then(async () => {
      const summary = await apiService.getFlashClaim(sessionId);
      if (summary.data?.data?.status === 'paid') { setPaidSession(sessionId); setNote('Your payment is confirmed. Your design is safe.'); }
      else if (['cancelled', 'expired'].includes(summary.data?.data?.status)) setNote('No payment was taken. The design is free again.');
      else setNote('We could not confirm this checkout yet. Please check again in a moment.');
      const next = new URLSearchParams(params); next.delete('cancelled'); setParams(next, { replace: true });
      await refresh();
    }).catch(() => { cancelling.current = null; setNote('We could not confirm the cancellation yet. Your checkout hold will expire automatically; please try refreshing.'); });
  }, [sessionId, params, setParams, refresh]);
  useEffect(() => {
    const visibility = () => { if (document.visibilityState === 'visible') refresh(); };
    const timer = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60000);
    document.addEventListener('visibilitychange', visibility);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', visibility); };
  }, [refresh]);
  useEffect(() => { if (selected && designs.find(d => d.id === selected.id)?.status !== 'available') { setSelected(null); setNote('Someone just claimed this design'); } }, [designs, selected]);
  return <FlashShell>
    <header className="flash-heading"><small>One design. One person.</small><h1>The flash book</h1><p>A collection of little things waiting to become tattoos.<br />Drawn by Kiho, made yours in Osaka.</p></header>
    {note && <p className="flash-note" role="status">{note}{paidSession && <> <Link to={`/flash/claimed?session_id=${encodeURIComponent(paidSession)}`}>View confirmation</Link></>}</p>}
    {error && <div className="flash-note flash-error" role="alert"><p>{error}</p><button className="category-btn" onClick={refresh}>Try again</button></div>}
    {loading ? <div className="flash-cover" aria-label="Loading flash book"><span>Kihoko</span><strong>Flash</strong><p>Opening the book…</p></div> : designs.length ? <FlashBook designs={designs} onSelect={setSelected} paused={!!selected} /> : !error && <div className="flash-cover"><span>Kihoko</span><strong>Flash</strong><p>New flash coming soon</p></div>}
    {selected && <FlashSheet design={selected} onClose={() => setSelected(null)} onConflict={message => { setSelected(null); setNote(message); refresh(); }} />}
  </FlashShell>;
}
