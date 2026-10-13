import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiService, handleApiError } from '../../services/api';
import { ArtworkFrame, FullArtworkView, SheetBackdrop, SheetPanel } from './FlashStyles';
const FIELDS = [
  ['name', 'Name', 80, true], ['email', 'Email', 254, true], ['instagram', 'Instagram (optional)', 60],
  ['placement', 'Placement', 200, true], ['size', "Size you'd like", 200], ['skinTone', 'Skin tone (optional)', 60], ['dates', 'Preferred dates', 300], ['notes', 'Anything else', 2000]
];
const TONES = [
  ['Very fair (Type I)', 'Very fair — always burns, never tans (Type I)'],
  ['Fair (Type II)', 'Fair — usually burns, tans minimally (Type II)'],
  ['Medium (Type III)', 'Medium — sometimes burns, tans gradually (Type III)'],
  ['Olive (Type IV)', 'Olive — rarely burns, tans easily (Type IV)'],
  ['Brown (Type V)', 'Brown — very rarely burns, tans deeply (Type V)'],
  ['Deep (Type VI)', 'Deep — never burns, deeply pigmented (Type VI)']
];
export function formatDeposit(amount) { return `¥${(amount ?? 2000).toLocaleString('ja-JP')}`; }
export default function FlashSheet({ design, onClose, onConflict }) {
  const [step, setStep] = useState('detail');
  const [fullScreen, setFullScreen] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const panel = useRef(null), viewer = useRef(null), imageButton = useRef(null), close = useRef(onClose);
  close.current = fullScreen ? () => setFullScreen(false) : onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const siblings = [...document.body.children].filter(node => !node.contains(panel.current));
    const oldInert = siblings.map(node => node.inert);
    siblings.forEach(node => { node.inert = true; });
    panel.current.querySelector('button').focus();
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close.current(); return; }
      if (e.key !== 'Tab') return;
      const activePanel = viewer.current || panel.current;
      const targets = [...activePanel.querySelectorAll('button:not(:disabled), input:not(:disabled), select, textarea, a[href]')].filter(el => el.getClientRects().length);
      if (!targets.length) { e.preventDefault(); activePanel.focus(); return; }
      const first = targets[0], last = targets[targets.length - 1];
      if (e.shiftKey && (document.activeElement === first || !activePanel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !activePanel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; siblings.forEach((node, i) => { node.inert = oldInert[i]; }); if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => {
    panel.current.scrollTop = 0;
    if (step === 'booking') panel.current.querySelector('input').focus();
  }, [step]);
  useEffect(() => {
    if (!fullScreen) return;
    const sheet = panel.current;
    sheet.inert = true;
    viewer.current.querySelector('button').focus();
    return () => {
      sheet.inert = false;
      if (imageButton.current?.isConnected) imageButton.current.focus();
    };
  }, [fullScreen]);
  const submit = async e => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget, values = Object.fromEntries(new FormData(form));
    const next = {};
    for (const [key, , cap, required] of FIELDS) {
      const raw = values[key] || '';
      values[key] = raw.trim();
      if (required && !values[key]) next[key] = `Please enter your ${key}.`;
      else if (/[\x00-\x1f\x7f-\x9f]/.test(raw)) next[key] = 'Please use plain text without line breaks or control characters.';
      else if (values[key].length > cap) next[key] = `Please use ${cap} characters or fewer.`;
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Please enter a valid email address.';
    values.agree = form.elements.agree.checked;
    if (!values.agree) next.agree = 'Please agree to the deposit before continuing.';
    setErrors(next); setError('');
    if (Object.keys(next).length) { form.elements[Object.keys(next)[0]]?.focus(); return; }
    setSending(true);
    try {
      const response = await apiService.claimFlash(design.id, values);
      const url = response.data?.data?.url;
      if (!url) throw new Error('Checkout could not open. Please try again.');
      window.location.assign(url);
    } catch (err) {
      if (err.response?.status === 409) { onConflict(handleApiError(err)); return; }
      setError(err.response ? handleApiError(err) : 'We could not reach checkout. Please check your connection and try again.');
      setSending(false);
    }
  };
  const amount = formatDeposit(design.depositJpy);
  return createPortal(<SheetBackdrop onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <SheetPanel role="dialog" aria-modal={fullScreen ? undefined : true} aria-hidden={fullScreen || undefined} aria-labelledby="flash-sheet-title" tabIndex={-1} ref={panel}>
      <button className="sheet-close" aria-label="Close design" onClick={onClose}>×</button>
      {step === 'detail' ? <div className="sheet-detail">
        <button className="sheet-image-frame" type="button" aria-label={`View ${design.title} full-screen`} onClick={() => setFullScreen(true)} ref={imageButton}>
          <ArtworkFrame><img src={design.imageUrl} alt={design.title} width={design.width} height={design.height} /></ArtworkFrame>
          <span className="sheet-image-hint" aria-hidden="true">Tap to view full-screen</span>
        </button>
        <div><h2 id="flash-sheet-title">{design.title}</h2>{design.place && <span className="sheet-place">{design.place}</span>}<p className="sheet-description">{design.description}</p>
          {(design.sizeNote || design.priceNote) && <p>{[design.sizeNote, design.priceNote].filter(Boolean).join(' · ')}</p>}
          <p className="sheet-size-note">Can be made bigger for an added cost — tell Kiho the size you'd like.</p>
          <p className="deposit-note">{amount} deposit — non-refundable, deducted from your final price</p>
          <button className="flash-primary" onClick={() => setStep('booking')}>Claim this design</button></div>
      </div> : <>
        <button className="flash-back" onClick={() => setStep('detail')} disabled={sending}>← Design details</button>
        <h2 id="flash-sheet-title">Make {design.title} yours</h2>
        <p>Share a little about your tattoo. Kiho will email you to arrange your session in Osaka.</p>
        <form onSubmit={submit} noValidate aria-busy={sending}>
          <div className="booking-grid">
            {FIELDS.map(([key, label, cap, required]) => <div key={key} className={`booking-field ${key === 'notes' ? 'wide' : ''}`}>
              <label htmlFor={`flash-${key}`}>{label}{required ? ' *' : ''}</label>
              {key === 'skinTone' ? <select id={`flash-${key}`} name={key}><option value="">Select your skin tone…</option>{TONES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> : key === 'notes' ? <textarea id={`flash-${key}`} name={key} maxLength={cap} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} /> :
                <input id={`flash-${key}`} name={key} type={key === 'email' ? 'email' : 'text'} autoComplete={key === 'name' || key === 'email' ? key : 'off'} required={required} defaultValue={key === 'size' ? design.sizeNote || '' : undefined} maxLength={cap} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} />}
              {errors[key] && <p className="field-error" id={`error-${key}`}>{errors[key]}</p>}
            </div>)}
            <div className="wide"><label className="agreement"><input type="checkbox" name="agree" required aria-invalid={!!errors.agree} aria-describedby={errors.agree ? 'error-agree' : undefined} /><span>I understand the {amount} deposit is non-refundable and will be deducted from the final price of my tattoo.</span></label>{errors.agree && <p className="field-error" id="error-agree">{errors.agree}</p>}</div>
          </div>
          {error && <p className="submit-error" role="alert">{error}</p>}
          <button className="flash-primary" type="submit" disabled={sending}>{sending ? 'Opening checkout…' : `Continue to payment · ${amount}`}</button>
        </form>
      </>}
    </SheetPanel>
    {fullScreen && <FullArtworkView style={{ '--art-ratio': (design.width || 1) / (design.height || 1) }} ref={viewer} role="dialog" aria-modal="true" aria-label={`${design.title}, full-screen artwork`} tabIndex={-1} onClick={() => setFullScreen(false)}>
      <div className="fullscreen-toolbar"><button className="fullscreen-close" type="button" aria-label="Close full-screen artwork" onClick={() => setFullScreen(false)}>×</button></div>
      <button className="fullscreen-art" type="button" aria-label="Close full-screen artwork and return to design" onClick={() => setFullScreen(false)}>
        <div className="fullscreen-paper"><ArtworkFrame><img src={design.imageUrl} alt={design.title} width={design.width} height={design.height} /></ArtworkFrame></div>
      </button>
    </FullArtworkView>}
  </SheetBackdrop>, document.body);
}
