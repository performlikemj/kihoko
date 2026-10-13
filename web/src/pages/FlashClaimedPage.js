import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArtworkFrame, FlashShell } from '../components/flash/FlashStyles';
import { formatDeposit } from '../components/flash/FlashSheet';
export default function FlashClaimedPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [claim, setClaim] = useState(null), [waiting, setWaiting] = useState(true), [retry, setRetry] = useState(0);
  useEffect(() => {
    let stopped = false, timer, attempts = 0;
    setWaiting(true); setClaim(null);
    if (!sessionId?.startsWith('cs_')) { setWaiting(false); return; }
    const poll = async () => {
      attempts++;
      try {
        const response = await apiService.getFlashClaim(sessionId);
        if (stopped) return;
        const data = response.data?.data; setClaim(data);
        if (['paid', 'expired', 'cancelled'].includes(data?.status)) { setWaiting(false); return; }
      } catch { if (stopped) return; }
      if (attempts < 6) timer = setTimeout(poll, 1800);
      else setWaiting(false);
    };
    poll(); return () => { stopped = true; clearTimeout(timer); };
  }, [sessionId, retry]);
  const paid = claim?.status === 'paid';
  return <FlashShell><div className="flash-result" aria-live="polite">
    <small>Kihoko / Flash</small>
    <h1>{paid ? 'It’s yours' : waiting ? 'A little moment…' : claim?.status === 'pending' ? 'Confirming your deposit' : 'Let’s check your claim'}</h1>
    {claim?.thumbnailUrl && <div className="claimed-image-frame"><ArtworkFrame><img src={claim.thumbnailUrl} alt={claim.flashTitle || 'Your design'} /></ArtworkFrame></div>}
    {claim?.flashTitle && <h2>{claim.flashTitle}</h2>}
    {paid ? <><p>Your design is reserved for you. Kiho will email you to arrange your tattoo session in Osaka.</p><p>{formatDeposit(claim.depositJpy)} deposit — non-refundable, deducted from your final tattoo price.</p></> : <>
      <p>{waiting ? 'We’re waiting for payment confirmation. This can take a few seconds.' : claim?.status === 'expired' || claim?.status === 'cancelled' ? 'This checkout has ended. You can return to the book to see what’s available.' : 'We haven’t received payment confirmation yet. If you paid, keep your Stripe receipt and check again shortly.'}</p>
      {!waiting && sessionId?.startsWith('cs_') && <button className="category-btn" onClick={() => setRetry(n => n + 1)}>Check again</button>}
    </>}
    <Link to="/flash">← Back to the flash book</Link>
  </div></FlashShell>;
}
