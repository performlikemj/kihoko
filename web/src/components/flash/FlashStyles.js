import styled from 'styled-components';

const paperTone = ({ theme }) => theme.background === '#121212' ? '#e9e4d8' : '#f5f1e8';
// Images never participate in track sizing: the frame reserves its own space,
// and both image axes resolve against that definite box before and after load.
// Paint paper inside the blend context, including beneath transformed book art.
export const ArtworkFrame = styled.div`
  position: relative; display: block; width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden; background: var(--paper); isolation: isolate;
  > img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; padding: 0; mix-blend-mode: multiply; filter: none; opacity: 1; }
`;
export const FullArtworkView = styled.div`
  /* A light paper surface keeps transparent dark ink readable in either theme. */
  --paper: ${paperTone};
  --paper-ink: #36372e;
  position: fixed; inset: 0; z-index: 2100; background: #101010; color: #fff;
  display: grid; grid-template-rows: 44px minmax(0, 1fr); gap: 12px; padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  .fullscreen-art { display: grid; place-items: center; min-width: 0; min-height: 0; width: 100%; height: 100%; border: 0; padding: 0; background: transparent; cursor: zoom-out; }
  .fullscreen-paper { width: min(100%, 1100px, calc((100dvh - 128px) * var(--art-ratio))); height: min(100%, calc(100dvh - 128px), calc((100dvw - 32px) / var(--art-ratio)), calc(1100px / var(--art-ratio))); min-width: 0; min-height: 0; padding: min(16px, 2dvh, 2vw); border-radius: 4px; background: var(--paper); color: var(--paper-ink); box-shadow: 0 12px 40px #0006; }
  .fullscreen-paper img { mix-blend-mode: multiply; opacity: 1; filter: none; }
  .fullscreen-toolbar { display: flex; justify-content: flex-end; }
  .fullscreen-close { width: 44px; height: 44px; border: 1px solid #ffffff55; border-radius: 50%; background: #101010cc; color: #fff; font-size: 1.5rem; cursor: pointer; }
  button:focus-visible { outline: 3px solid ${({ theme }) => theme.accentBlue}; outline-offset: -3px; }
`;
export const FlashShell = styled.section`
  --paper: ${paperTone};
  --paper-ink: #36372e;
  --scrubber-border: ${({ theme }) => theme.background === '#121212' ? '#292820' : '#f5f1e8'};
  --ink: ${({ theme }) => theme.text};
  max-width: 1180px; margin: 0 auto; padding: 1rem 24px 4rem;
  color: var(--ink); font-family: ${({ theme }) => theme.fontBody};
  .flash-heading { text-align: center; margin: 0 auto 2rem; max-width: 540px; }
  .flash-heading small { text-transform: uppercase; letter-spacing: .22em; color: ${({ theme }) => theme.textMuted}; }
  h1 { font-weight: 400; letter-spacing: -.04em; font-size: clamp(2.6rem, 7vw, 4.4rem); margin: .4rem 0; }
  .flash-heading p { color: ${({ theme }) => theme.textMuted}; font-size: .95rem; }
  button { font-family: inherit; color: inherit; }
  button:focus-visible, a:focus-visible { outline: 3px solid ${({ theme }) => theme.accentBlue}; outline-offset: 4px; }
  .flash-note { text-align: center; margin: 1rem auto; max-width: 650px; }
  .flash-error { color: ${({ theme }) => theme.background === '#121212' ? '#ffb0a8' : '#9c3027'}; }
  .flash-controls { display: flex; justify-content: center; align-items: center; gap: 1.25rem; margin-top: 12px; font-size: .8rem; }
  .flash-controls button { border: 1px solid ${({ theme }) => theme.border}; border-radius: 50%; background: transparent; width: 44px; height: 44px; font-size: 1.2rem; }
  button:disabled { opacity: .4; cursor: default; }
  .flash-book-layout { --flash-header-height: 100px; }
  .flash-scrubber { display: block; width: min(320px, 100%); height: 44px; margin: 4px auto; }
  .flash-scrubber input { appearance: none; -webkit-appearance: none; display: block; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; }
  .flash-scrubber input::-webkit-slider-runnable-track { height: 3px; border-radius: 3px; background: linear-gradient(to right, var(--ink) var(--flash-progress), ${({ theme }) => theme.border} var(--flash-progress)); }
  .flash-scrubber input::-moz-range-track { height: 3px; border-radius: 3px; background: ${({ theme }) => theme.border}; }
  .flash-scrubber input::-moz-range-progress { height: 3px; background: var(--ink); }
  .flash-scrubber input::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; height: 14px; width: 14px; margin-top: -5.5px; border: 2px solid var(--scrubber-border); border-radius: 50%; background: var(--ink); }
  .flash-scrubber input::-moz-range-thumb { height: 10px; width: 10px; border: 2px solid var(--scrubber-border); border-radius: 50%; background: var(--ink); }
  .flash-scrubber input:focus-visible { outline: 3px solid ${({ theme }) => theme.accentBlue}; outline-offset: 2px; border-radius: 8px; }
  .flash-hint { text-align: center; font-size: .75rem; line-height: 1.5; opacity: .55; margin: 8px 0 0; }
  .flash-cover { width: min(300px, 90%); aspect-ratio: 3/4; margin: 2rem auto; padding: 2rem; display: grid; place-content: center; text-align: center; background: ${({ theme }) => theme.background === '#121212' ? theme.cardBackground : 'var(--paper)'}; color: ${({ theme }) => theme.text}; border-radius: 4px 14px 14px 4px; border-left: 16px solid ${({ theme }) => theme.border}; box-shadow: 6px 8px 0 ${({ theme }) => theme.cardBackground}, 10px 15px 25px #0002; }
  .flash-cover span { letter-spacing: .3em; font-size: .75rem; }
  .flash-cover strong { font-size: 2rem; font-weight: 400; margin: 1rem 0 3rem; }
  .flash-result { text-align: center; max-width: 600px; margin: 1rem auto; }
  .claimed-image-frame { width: min(240px, 100%); height: min(300px, 45dvh); background: var(--paper); color: var(--paper-ink); padding: 16px; margin: 1rem auto; }
  .flash-result p { margin: 1rem 0; }
  .flash-result a { display: inline-flex; align-items: center; min-height: 44px; text-decoration: underline; }
  @media(max-width: 767px) { padding: .5rem 18px 2.5rem; .flash-heading { margin-bottom: 1.5rem; } }
`;
export const BookFrame = styled.div`
  --flash-paper-height: min(650px, 52vw, max(220px, calc(100dvh - 160px)));
  width: min(100%, calc(var(--flash-paper-height) * 1.75 + 16px)); margin: 0 auto;
  position: relative; perspective: 2000px; border-radius: 8px; padding: 6px 8px 10px;
  background: ${({ theme }) => theme.background === '#121212' ? '#191a17' : '#b8b6a3'};
  box-shadow: 0 30px 50px -20px #0005, 0 3px 8px #0002;
  .book-spread { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); position: relative; }
  .book-spine { position: absolute; z-index: 2; width: 24px; top: 6px; bottom: 10px; left: calc(50% - 12px); background: linear-gradient(90deg, transparent, #0003 48%, #0004 50%, #fff1 60%, transparent); pointer-events: none; }
  .book-edge { position: absolute; top: 20%; bottom: 20%; width: 44px; border: none; background: transparent; z-index: 4; cursor: pointer; display: grid; align-items: center; opacity: .5; font-size: 1.5rem; }
  .book-edge.prev { left: -22px; } .book-edge.next { right: -22px; }
  .turning-leaf { position: absolute; z-index: 3; top: 6px; bottom: 10px; width: calc(50% - 8px); transform-style: preserve-3d; pointer-events: none; }
  .turning-leaf.forward { left: 50%; transform-origin: left center; }
  .turning-leaf.backward { right: 50%; transform-origin: right center; }
  .leaf-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .leaf-back { transform: rotateY(180deg); }
  .turn-shadow { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, #0006, transparent); pointer-events: none; }
  .phone-page { touch-action: pan-y; }
  @media(min-width:768px) and (max-width:1399px) { --flash-paper-height: min(650px, 72vw, max(220px, calc(100dvh - 160px))); }
  @media(max-width:767px) { --flash-paper-height: min(570px, 130vw, max(220px, calc(100dvh - var(--flash-header-height, 100px) - 180px))); width: min(100%, calc(var(--flash-paper-height) * .8 + 10px)); padding: 5px 5px 8px; overflow: hidden; .book-spine { display: none; } }
`;
export const Paper = styled.div`
  height: var(--flash-paper-height); position: relative; background: var(--paper); color: var(--paper-ink);
  padding: 24px 24px 16px; overflow: hidden; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 16px;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, #88888804 3px, #88888804 4px);
  .paper-caption { display: flex; justify-content: space-between; font-size: .58rem; line-height: 1.5; letter-spacing: .18em; text-transform: uppercase; opacity: ${({ theme }) => theme.background === '#121212' ? .8 : .5}; }
  .paper-art { min-height: 0; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 22px; }
  .paper-art[data-designs-per-page='1'] { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
  .paper-number { text-align: center; font-size: .7rem; line-height: 1.5; opacity: ${({ theme }) => theme.background === '#121212' ? .8 : .5}; }
  .paper-end { grid-column: 1 / -1; grid-row: 1 / -1; display: grid; place-content: center; text-align: center; opacity: ${({ theme }) => theme.background === '#121212' ? .8 : .5}; font-size: .85rem; }
  @media(max-width:767px) { padding: 20px 20px 14px; gap: 12px; .paper-art { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); } }

`;
export const Design = styled.div`
  position: relative; min-height: 0; min-width: 0; height: 100%;
  .design-target { width: 100%; height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: 10px; min-height: 0; min-width: 0; border: 0; background: transparent; padding: 0; text-align: center; font: inherit; color: inherit; }
  button.design-target { cursor: pointer; transition: transform .2s; }
  button.design-target:hover { transform: translateY(-4px); }
  .art-reserve { min-height: 0; min-width: 0; position: relative; overflow: hidden; }
  img { position: absolute; inset: 0; display: block; max-height: 100%; width: 100%; height: 100%; object-fit: contain; }
  .unavailable img { opacity: .4; }
  .design-title { font-size: .68rem; line-height: 1.4; letter-spacing: .04em; margin: 0; overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
  .place-tag { display: inline-block; margin-left: 6px; font-size: .6rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase; opacity: ${({ theme }) => theme.background === '#121212' ? .8 : .7}; vertical-align: baseline; }
  .design-sticker { position: absolute; right: 12px; top: 12px; border-radius: 50%; width: 64px; height: 64px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff8ee; background: #b44136; transform: rotate(-13deg); font-size: .8rem; font-weight: 700; line-height: 1.5; box-shadow: 2px 3px 5px #0002; border: 3px double #ffffff66; pointer-events: none; }
  .design-sticker.held { border-radius: 3px; width: 90px; height: 43px; background: #c7a368; color: #302717; transform: rotate(7deg); font-size: .65rem; }
  @media(max-width:767px) { .design-title { font-size: .85rem; } .design-sticker { width: 78px; height: 78px; font-size: 1rem; } .design-sticker.held { width: 100px; height: 48px; font-size: .75rem; } }
  @media(prefers-reduced-motion:reduce) { button.design-target { transition: none; } }
`;
export const SheetBackdrop = styled.div`
  position: fixed; inset: 0; z-index: 2000; background: #0009; display: grid; place-items: center; padding: 24px;
  @media(max-width:767px) { padding: 0; }
`;
export const SheetPanel = styled.div`
  --paper: ${paperTone};
  --paper-ink: #36372e;
  width: min(900px, 100%); max-height: calc(100dvh - 48px); overflow-y: auto; overscroll-behavior: contain;
  background: ${({ theme }) => theme.background}; color: ${({ theme }) => theme.text}; border-radius: 24px;
  padding: clamp(24px, 4vw, 40px); position: relative;
  .sheet-close { position: absolute; right: 12px; top: 12px; width: 44px; height: 44px; border: 0; border-radius: 50%; background: ${({ theme }) => theme.cardBackground}; color: inherit; font-size: 1.5rem; cursor: pointer; z-index: 1; }
  .sheet-detail { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: center; gap: 32px; }
  .sheet-image-frame { position: relative; display: block; width: 100%; height: min(60dvh, 480px); min-width: 0; min-height: 0; border: 0; cursor: zoom-in; background: var(--paper); color: var(--paper-ink); padding: 18px; }
  .sheet-image-hint { position: absolute; bottom: 12px; right: 12px; padding: 4px 8px; border-radius: 12px; font-size: .7rem; color: var(--paper-ink); background: var(--paper); pointer-events: none; }
  h2 { font-weight: 400; font-size: 1.8rem; padding-right: 40px; margin: 0 0 16px; }
  p { margin-bottom: 1rem; }
  .sheet-place { display: inline-block; margin: 0 0 12px; font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; }
  .sheet-size-note { font-size: .85rem; color: ${({ theme }) => theme.textMuted}; }
  .sheet-description { white-space: pre-wrap; }
  .deposit-note { font-size: .85rem; border-top: 1px solid ${({ theme }) => theme.border}; padding-top: 1rem; }
  .flash-primary { min-height: 48px; padding: 12px 24px; border-radius: 999px; border: 0; background: ${({ theme }) => theme.text}; color: ${({ theme }) => theme.background}; font: inherit; cursor: pointer; }
  .flash-primary:disabled { opacity: .5; cursor: wait; }
  .flash-back { min-height: 44px; border: 0; background: transparent; color: inherit; padding: 0 12px 0 0; text-decoration: underline; }
  .booking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .booking-field { min-width: 0; }
  label { display: block; margin-bottom: 6px; font-weight: 600; font-size: .9rem; }
  input:not([type='checkbox']), select, textarea { width: 100%; min-height: 48px; font: inherit; font-size: 16px; color: inherit; background: ${({ theme }) => theme.cardBackground}; border: 1px solid ${({ theme }) => theme.inputBorder}; border-radius: 14px; padding: 12px 14px; }
  textarea { min-height: 100px; resize: vertical; }
  .wide { grid-column: 1 / -1; }
  .agreement { display: flex; align-items: flex-start; gap: 10px; min-height: 44px; padding: 10px 0; font-weight: 400; cursor: pointer; }
  .agreement input { flex: 0 0 20px; width: 20px; height: 20px; margin-top: 2px; accent-color: ${({ theme }) => theme.text}; }
  .field-error, .submit-error { font-size: .85rem; color: ${({ theme }) => theme.background === '#121212' ? '#ffb0a8' : '#9c3027'}; margin: 5px 0 0; }
  .submit-error { margin: 18px 0; }
  :focus-visible { outline: 3px solid ${({ theme }) => theme.accentBlue}; outline-offset: 3px; }
  @media(max-width:767px) { width: 100%; max-height: 100dvh; height: 100dvh; border-radius: 0; padding: 60px 24px 32px; .sheet-detail { grid-template-columns: 1fr; gap: 24px; } .sheet-image-frame { height: min(42dvh, 480px); } .booking-grid { grid-template-columns: 1fr; } }
`;
