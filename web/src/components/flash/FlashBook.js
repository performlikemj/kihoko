import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArtworkFrame, BookFrame, Paper, Design } from './FlashStyles';

function Art({ design, onSelect, inert = false }) {
  const available = design.status === 'available';
  const Tag = available && !inert ? 'button' : 'div';
  return <Design>
    <Tag className={`design-target ${available ? '' : 'unavailable'}`} {...(Tag === 'button' ? { type: 'button', onClick: () => onSelect(design), 'aria-label': `View ${design.title}` } : { 'aria-disabled': !available || undefined })}>
      <ArtworkFrame className="art-reserve">
        <img src={design.thumbnailUrl || design.imageUrl} width={design.width} height={design.height} alt={design.title} draggable="false" />
        {!available && <span className={`design-sticker ${design.status}`}><span>{design.status === 'taken' ? 'SOLD' : 'ON HOLD'}</span><span lang="ja">{design.status === 'taken' ? '済' : '予約中'}</span></span>}
      </ArtworkFrame>
      <span className="design-title">{design.title}{design.place && <span className="place-tag">{design.place}</span>}</span>
    </Tag>
  </Design>;
}
function Page({ designs, number, perPage, onSelect, inert }) {
  const place = designs[0]?.place;
  const caption = place && designs.every(design => design.place === place) ? place : 'Osaka, JP';
  return <Paper><div className="paper-caption"><span>Kihoko / Flash</span><span>{caption}</span></div>
    <div className="paper-art" data-designs-per-page={perPage}>{designs.length ? designs.map(d => <Art key={d.id} design={d} onSelect={onSelect} inert={inert} />) : <div className="paper-end">A little space for<br />what comes next.</div>}</div>
    <span className="paper-number">{String(number).padStart(2, '0')}</span>
  </Paper>;
}
function readLayout() {
  return { phone: window.matchMedia('(max-width: 767px)').matches, perPage: window.matchMedia('(min-width: 1400px) and (min-height: 820px)').matches ? 4 : 1 };
}
export default function FlashBook({ designs, onSelect, paused }) {
  const [layout, setLayout] = useState(readLayout);
  const [cursor, setCursor] = useState(0);
  const [turn, setTurn] = useState(null);
  const [direction, setDirection] = useState(1);
  const reduced = useReducedMotion();
  const lastDrag = useRef(0), bookLayout = useRef(null);
  const { phone, perPage } = layout;
  const unit = phone ? 1 : perPage * 2;
  const count = Math.ceil(designs.length / unit);
  const index = Math.min(Math.floor(cursor / unit), count - 1);
  useEffect(() => {
    const queries = [window.matchMedia('(max-width: 767px)'), window.matchMedia('(min-width: 1400px) and (min-height: 820px)')];
    const change = () => { setLayout(readLayout()); setTurn(null); };
    queries.forEach(query => query.addEventListener('change', change));
    return () => queries.forEach(query => query.removeEventListener('change', change));
  }, []);
  useEffect(() => {
    const header = document.querySelector('nav.navbar');
    if (!header) return;
    const measure = () => bookLayout.current?.style.setProperty('--flash-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(header);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const go = target => {
    if (turn || target < 0 || target >= count || target === index) return;
    const dir = target > index ? 1 : -1;
    setDirection(dir);
    if (!phone && !reduced) setTurn({ from: index, to: target, dir });
    else setCursor(target * unit);
  };
  useEffect(() => {
    const key = e => {
      if (paused || e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); go(index + (e.key === 'ArrowRight' ? 1 : -1)); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  // Preload only the next spread; remaining sheets don't mount or fetch yet.
  useEffect(() => {
    designs.slice((index + 1) * unit, (index + 2) * unit).forEach(d => { const img = new Image(); img.src = d.thumbnailUrl || d.imageUrl; });
  }, [designs, index, unit]);
  const sheet = (spread, side, inert = false) => {
    const start = spread * unit + side * perPage;
    return <Page designs={designs.slice(start, start + perPage)} number={spread * 2 + side + 1} perPage={perPage} onSelect={onSelect} inert={inert} />;
  };
  const pageCount = Math.ceil(designs.length / perPage);
  const firstPage = phone ? index + 1 : index * 2 + 1;
  const lastPage = phone ? firstPage : Math.min(firstPage + 1, pageCount);
  const pageLabel = `page ${firstPage === lastPage ? firstPage : `${firstPage}–${lastPage}`} / ${pageCount}`;
  return <div className="flash-book-layout" ref={bookLayout}>
    <BookFrame onClickCapture={e => { if (Date.now() - lastDrag.current < 300) { e.preventDefault(); e.stopPropagation(); } }} aria-label="Kiho’s flash book" aria-busy={!!turn}>
      {phone ? <AnimatePresence mode="wait" initial={false}>
        <motion.div className="phone-page" key={index} initial={{ opacity: 0, x: reduced ? 0 : direction * 35 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : direction * -35 }} transition={{ duration: reduced ? .18 : .22 }}
          drag={paused ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={reduced ? 0 : .65} dragMomentum={false}
          onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 10) lastDrag.current = Date.now(); if (Math.abs(info.offset.x) > 55 || Math.abs(info.velocity.x) > 450) go(index + (info.offset.x < 0 || info.velocity.x < -450 ? 1 : -1)); }}>
          <Page designs={designs.slice(index, index + 1)} number={index + 1} perPage={1} onSelect={onSelect} />
        </motion.div>
      </AnimatePresence> : <>
        <motion.div key={reduced ? index : 'spread'} className="book-spread" initial={reduced ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: .22 }}>
          {sheet(turn ? (turn.dir === 1 ? turn.from : turn.to) : index, 0, !!turn)}
          {sheet(turn ? (turn.dir === 1 ? turn.to : turn.from) : index, 1, !!turn)}
        </motion.div>
        <div className="book-spine" />
        {turn && <motion.div className={`turning-leaf ${turn.dir === 1 ? 'forward' : 'backward'}`} initial={{ rotateY: 0 }} animate={{ rotateY: -180 * turn.dir }} transition={{ duration: .85, ease: [.45, .05, .25, 1] }}
          onAnimationComplete={() => { setCursor(turn.to * unit); setTurn(null); }} aria-hidden="true">
          <div className="leaf-face">{sheet(turn.from, turn.dir === 1 ? 1 : 0, true)}</div>
          <div className="leaf-face leaf-back">{sheet(turn.to, turn.dir === 1 ? 0 : 1, true)}</div>
          <motion.div className="turn-shadow" initial={{ opacity: 0 }} animate={{ opacity: [0, .45, 0], x: ['0%', '15%', '0%'] }} transition={{ duration: .85 }} />
        </motion.div>}
        <button className="book-edge prev" aria-label="Turn to previous pages" disabled={index === 0 || !!turn} onClick={() => go(index - 1)}>‹</button>
        <button className="book-edge next" aria-label="Turn to next pages" disabled={index >= count - 1 || !!turn} onClick={() => go(index + 1)}>›</button>
      </>}
    </BookFrame>
    <div className="flash-controls"><button aria-label="Previous page" onClick={() => go(index - 1)} disabled={index === 0 || !!turn}>←</button>
      <span aria-live="polite">{pageLabel}</span>
      <button aria-label="Next page" onClick={() => go(index + 1)} disabled={index >= count - 1 || !!turn}>→</button></div>
    <label className="flash-scrubber" style={{ '--flash-progress': `${count > 1 ? index / (count - 1) * 100 : 0}%` }}>
      <input type="range" min={0} max={Math.max(1, count - 1)} step={1} value={index} disabled={!!turn || count < 2} onChange={e => go(Number(e.target.value))} aria-label={phone ? 'Jump to a flash page' : 'Jump to a flash spread'} aria-valuetext={pageLabel} />
    </label>
    <p className="flash-hint">{phone ? 'Swipe to leaf through · Tap a design to make it yours' : 'Use the page edges or ← → keys · Select a design to make it yours'}</p>
  </div>;
}
