// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const FOLDER       = './random/';   // folder where your media lives
const MAX_FILES    = 100;         // checks 1.jpg ... 100.mp4 etc.
const IMAGE_TIMER  = 5000;        // ms — how long images stay on screen
const CROSSFADE_MS = 1000;        // ms — must match CSS transition

const IMG_EXTS = ['jpg','jpeg','png','webp','gif','avif'];
const VID_EXTS = ['mp4','webm','mov','ogg'];
const ALL_EXTS = [...IMG_EXTS, ...VID_EXTS];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let mediaList  = [];
let current    = 0;
let activeSlot = 'A';
let busy       = false;
let autoTimer  = null;

const slotA    = document.getElementById('slotA');
const slotB    = document.getElementById('slotB');
const preloader = document.getElementById('preloader');
const nomedia  = document.getElementById('nomedia');

// ─────────────────────────────────────────────
//  PROBE — does this file exist?
// ─────────────────────────────────────────────
function probeImage(url) {
  return new Promise(resolve => {
    const img  = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function probeVideo(url) {
  return new Promise(resolve => {
    const v = document.createElement('video');
    let done  = false;

    function finish(result) {
      if (done) return;
      done   = true;
      v.src  = '';
      v.load();
      resolve(result);
    }

    v.preload = 'metadata';
    v.onloadedmetadata = () => finish(true);
    v.onerror          = () => finish(false);
    setTimeout(()      => finish(false), 4000); // timeout fallback
    v.src = url;
  });
}

async function probeFile(url, ext) {
  return IMG_EXTS.includes(ext) ? probeImage(url) : probeVideo(url);
}

// ─────────────────────────────────────────────
//  SCAN — 1 to MAX_FILES, try every extension
// ─────────────────────────────────────────────
async function scanMedia() {
  mediaList = [];

  const tasks = [];

  for (let i = 1; i <= MAX_FILES; i++) {
    tasks.push((async (num) => {
      for (const ext of ALL_EXTS) {
        const url   = `${FOLDER}${num}.${ext}`;
        const found = await probeFile(url, ext);
        if (found) {
          return {
            num,
            src  : url,
            type : VID_EXTS.includes(ext) ? 'video' : 'image'
          };
        }
      }
      return null;
    })(i));
  }

  const results = await Promise.all(tasks);
  mediaList = results.filter(Boolean).sort((a, b) => a.num - b.num);
}

// ─────────────────────────────────────────────
//  CREATE MEDIA ELEMENT
// ─────────────────────────────────────────────
function createElement(item) {
  if (item.type === 'video') {
    const v          = document.createElement('video');
    v.muted          = true;
    v.autoplay       = true;
    v.playsInline    = true;
    v.loop           = false;
    v.preload        = 'auto';
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    // Set source via <source> tag for better codec/format support
    const src        = document.createElement('source');
    src.src          = item.src;
    v.appendChild(src);
    return v;
  } else {
    const img        = new Image();
    img.src          = item.src;
    img.alt          = '';
    img.draggable    = false;
    return img;
  }
}

// ─────────────────────────────────────────────
//  WAIT FOR MEDIA READY TO DISPLAY
// ─────────────────────────────────────────────
function waitReady(el, type) {
  return new Promise(resolve => {
    if (type === 'image') {
      if (el.complete && el.naturalWidth > 0) { resolve(); return; }
      el.onload  = resolve;
      el.onerror = resolve;
    } else {
      // canplay = enough buffered to start
      if (el.readyState >= 3) { resolve(); return; }
      const handler = () => resolve();
      el.addEventListener('canplay', handler, { once: true });
      el.onerror = resolve;
      setTimeout(resolve, 5000); // hard fallback
    }
  });
}

// ─────────────────────────────────────────────
//  CLEAR AUTO TIMER
// ─────────────────────────────────────────────
function clearAuto() {
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
}

// ─────────────────────────────────────────────
//  SCHEDULE NEXT MEDIA
// ─────────────────────────────────────────────
function scheduleNext(el, item) {
  const next = () => goTo((current + 1) % mediaList.length);

  if (item.type === 'video') {
    // Move to next when video ends naturally
    el.addEventListener('ended', next, { once: true });

    // Safety timer: video duration + 8s buffer in case 'ended' doesn't fire
    el.addEventListener('loadedmetadata', () => {
      if (el.duration && isFinite(el.duration)) {
        const safety = (el.duration * 1000) + 8000;
        autoTimer = setTimeout(next, safety);
      }
    }, { once: true });

    // Kick off playback
    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — retry once after short delay
        setTimeout(() => {
          el.play().catch(() => next()); // if still blocked, skip
        }, 600);
      });
    }
  } else {
    // Image — fixed duration
    autoTimer = setTimeout(next, IMAGE_TIMER);
  }
}

// ─────────────────────────────────────────────
//  GO TO — crossfade to index
// ─────────────────────────────────────────────
async function goTo(index, instant = false) {
  if (busy) return;
  busy = true;
  clearAuto();

  const item     = mediaList[index];
  const incoming = activeSlot === 'A' ? slotB : slotA;
  const outgoing  = activeSlot === 'A' ? slotA : slotB;

  // Build new element into hidden slot
  incoming.innerHTML = '';
  const el = createElement(item);
  incoming.appendChild(el);

  // Wait until ready
  await waitReady(el, item.type);

  if (instant) {
    // First load — no fade
    incoming.style.transition = 'none';
    incoming.classList.add('active');
    outgoing.classList.remove('active');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      incoming.style.transition = '';
    }));
  } else {
    // Smooth crossfade
    incoming.classList.add('active');
    outgoing.classList.remove('active');
    setTimeout(() => { outgoing.innerHTML = ''; }, CROSSFADE_MS + 100);
  }

  activeSlot = activeSlot === 'A' ? 'B' : 'A';
  current    = index;
  busy       = false;

  scheduleNext(el, item);
}

// ─────────────────────────────────────────────
//  PAGE REVISIT FIX (bfcache + tab switch)
// ─────────────────────────────────────────────
window.addEventListener('pageshow', e => {
  // e.persisted = true means page came from back/forward cache
  if (e.persisted) init();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Resume video if tab was switched mid-play
    const liveSlot = activeSlot === 'A' ? slotB : slotA;
    const vid = liveSlot.querySelector('video');
    if (vid && vid.paused) vid.play().catch(() => {});
  }
});

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
async function init() {
  clearAuto();
  busy       = false;
  current    = 0;
  activeSlot = 'A';

  slotA.innerHTML = '';
  slotB.innerHTML = '';
  slotA.className = 'slot';
  slotB.className = 'slot';

  preloader.classList.remove('hidden');
  nomedia.classList.remove('show');

  await scanMedia();

  if (mediaList.length === 0) {
    preloader.classList.add('hidden');
    nomedia.classList.add('show');
    return;
  }

  await goTo(0, true);
  preloader.classList.add('hidden');
}

init();