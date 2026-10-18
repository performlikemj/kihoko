import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { apiService } from '../services/api';

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  color: ${({ theme }) => theme.text};
  h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: 400; letter-spacing: -.03em; margin-bottom: 3rem; }
  h2 { font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 400; letter-spacing: -.02em; margin: 0 0 .75rem; }
  section { margin-bottom: 4rem; overflow-wrap: anywhere; }
  .collab-note { color: ${({ theme }) => theme.textMuted}; white-space: pre-wrap; max-width: 650px; margin-bottom: .5rem; }
  .collab-link { display: inline-flex; align-items: center; min-height: 44px; text-decoration: underline; text-underline-offset: .2em; margin-bottom: .5rem; }
  .collab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 1rem; margin-top: 1.5rem; }
  .collab-photo { min-width: 0; width: 100%; aspect-ratio: 4 / 5; padding: 12px; border: 0; border-radius: 4px; background: ${({ theme }) => theme.background === '#121212' ? '#e9e4d8' : '#f5f1e8'}; cursor: zoom-in; }
  .collab-photo img { display: block; width: 100%; height: 100%; object-fit: contain; }
  .collab-state { text-align: center; padding: 4rem 0; color: ${({ theme }) => theme.textMuted}; }
  button { font: inherit; color: inherit; }
  button:focus-visible, a:focus-visible { outline: 3px solid ${({ theme }) => theme.accentBlue}; outline-offset: 4px; }
`;

const Viewer = styled.div`
  position: fixed; inset: 0; z-index: 2100;
  display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 12px;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  background: #101010; color: #fff; touch-action: pan-y;
  .collab-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-width: 0; }
  h2 { font-size: 1rem; font-weight: 400; margin: 0; overflow-wrap: anywhere; }
  button { flex: none; width: 44px; height: 44px; border: 1px solid #ffffff55; border-radius: 50%; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
  button:focus-visible { outline: 3px solid ${({ theme }) => theme.accentBlue}; outline-offset: -3px; }
  .collab-full-image { min-width: 0; min-height: 0; display: grid; place-items: center; }
  .collab-full-paper { min-width: 0; min-height: 0; width: min(100%, 1100px, calc((100dvh - 180px) * var(--art-ratio))); height: min(100%, calc(100dvh - 180px), calc((100dvw - 32px) / var(--art-ratio)), calc(1100px / var(--art-ratio))); background: ${({ theme }) => theme.background === '#121212' ? '#e9e4d8' : '#f5f1e8'}; }
  img { display: block; width: 100%; height: 100%; min-height: 0; object-fit: contain; }
  .collab-view-controls { display: flex; align-items: center; justify-content: center; gap: 24px; }
  .collab-view-controls span { min-width: 4rem; text-align: center; font-size: .85rem; }
`;

// Validate again at the rendering boundary, including when a cached API is older.
function externalLink(value) {
  try {
    if (!/^https?:\/\//i.test(value)) return null;
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return { href: url.href, label: `${url.hostname}${url.pathname === '/' ? '' : url.pathname} ↗` };
  } catch { return null; }
}

function PhotoViewer({ collab, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const panel = useRef(null);
  const touch = useRef(null);
  const move = useCallback(delta => setIndex(i => (i + delta + collab.images.length) % collab.images.length), [collab.images.length]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const siblings = [...document.body.children].filter(node => !node.contains(panel.current));
    const inert = siblings.map(node => node.inert);
    siblings.forEach(node => { node.inert = true; });
    panel.current.querySelector('button').focus();
    const key = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'Tab') {
        const targets = [...panel.current.querySelectorAll('button')];
        const first = targets[0], last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = overflow;
      siblings.forEach((node, i) => { node.inert = inert[i]; });
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [move, onClose]);
  const image = collab.images[index];
  return createPortal(
    <Viewer ref={panel} role="dialog" aria-modal="true" aria-labelledby="collab-view-title"
      onTouchStart={event => { touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={event => {
        if (!touch.current) return;
        const dx = event.changedTouches[0].clientX - touch.current.x;
        const dy = event.changedTouches[0].clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}>
      <div className="collab-toolbar"><h2 id="collab-view-title">{collab.title}</h2><button type="button" aria-label="Close full-screen photos" onClick={onClose}>×</button></div>
      <div className="collab-full-image"><div className="collab-full-paper" style={{ '--art-ratio': image.width / image.height }}><img src={image.url} alt={`${collab.title} — photo ${index + 1}`} width={image.width} height={image.height} /></div></div>
      <div className="collab-view-controls">
        {collab.images.length > 1 && <button type="button" aria-label="Previous photo" onClick={() => move(-1)}>←</button>}
        <span role="status" aria-live="polite">{index + 1} / {collab.images.length}</span>
        {collab.images.length > 1 && <button type="button" aria-label="Next photo" onClick={() => move(1)}>→</button>}
      </div>
    </Viewer>, document.body
  );
}

export default function CollaborationsPage() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const close = useCallback(() => setSelected(null), []);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await apiService.getCollabs();
      if (!response.data?.success || !Array.isArray(response.data.data)) throw new Error('Invalid response');
      setCollabs(response.data.data);
    } catch { setError('Collaborations could not load. Please try again in a moment.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <Page>
    <h1>Collaborations</h1>
    {loading ? <p className="collab-state" role="status">Loading collaborations…</p> : error ?
      <div className="collab-state" role="alert"><p>{error}</p><button type="button" className="category-btn" onClick={refresh}>Try again</button></div> :
      collabs.length ? collabs.map((collab, collabIndex) => {
        const link = externalLink(collab.link);
        return <section key={collab.id} aria-labelledby={`collab-title-${collabIndex}`}>
          <h2 id={`collab-title-${collabIndex}`}>{collab.title}</h2>
          {collab.note && <p className="collab-note">{collab.note}</p>}
          {link && <a className="collab-link" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>}
          <div className="collab-grid">{collab.images.map((image, index) =>
            <button type="button" className="collab-photo" key={`${collab.id}-${index}`} aria-label={`View ${collab.title}, photo ${index + 1} full-screen`} onClick={() => setSelected({ collab, index })}>
              <img src={image.thumbnailUrl || image.url} alt={`${collab.title} — photo ${index + 1}`} width={image.width} height={image.height} loading="lazy" decoding="async" />
            </button>
          )}</div>
        </section>;
      }) : <p className="collab-state">Collaborations coming soon</p>}
    {selected && <PhotoViewer collab={selected.collab} initialIndex={selected.index} onClose={close} />}
  </Page>;
}
