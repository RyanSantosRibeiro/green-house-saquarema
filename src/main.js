import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contact, stays, gallery, reels } from './data.js';

gsap.registerPlugin(ScrollTrigger);
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const controller = new AbortController();
const on = (target, event, callback, options = {}) => target.addEventListener(event, callback, { ...options, signal: controller.signal });

$('#stay-grid').innerHTML = stays.map(stay => `<article class="stay-card"><button class="stay-image" data-stay="${stay.id}" aria-label="Ver detalhes: ${stay.name}"><img src="/images/${stay.image}" width="600" height="800" loading="lazy" alt="${stay.name} da Green House Saqua"/><span class="round-arrow">${icon('up')}</span></button><p>${stay.label}</p><h3><button data-stay="${stay.id}">${stay.name}</button></h3><div class="stay-meta">${icon(stay.id === 'camping' ? 'sun' : 'bed')}<span>${stay.id === 'camping' ? 'Estrutura para acampar' : stay.amenities[0]}</span></div></article>`).join('');
$('#panel-fotos').innerHTML = gallery.map((photo, index) => `<button class="gallery-photo" data-photo="${index}" aria-label="Ampliar: ${photo.title}"><img src="/images/${photo.image}" width="768" height="1024" loading="lazy" alt="${photo.alt}"/><span>${photo.title}${icon('up')}</span></button>`).join('');
$('#panel-reels').innerHTML = reels.map(reel => `<a class="reel-card" href="${reel.url}" target="_blank" rel="noopener noreferrer" aria-label="${reel.title}, assistir no Instagram"><img src="/images/${reel.image}" width="640" height="853" loading="lazy" alt="Capa de uma publicação da Green House Saqua"/><span class="play-circle">${icon('play')}</span><span>${reel.title}<small>Assistir no Instagram ↗</small></span></a>`).join('');
// Icons are decorative; the nearby text or control label supplies their name.
$$('svg').forEach(svg => svg.setAttribute('aria-hidden', 'true'));

const menuToggle = $('.menu-toggle');
const nav = $('#navigation');
const mobileQuery = matchMedia('(max-width: 900px)');
function setMenu(open, restoreFocus = false) {
  console.debug('Menu diagnostic', { open, width: window.innerWidth, mobile: mobileQuery.matches });
  nav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', open);
  $('main').inert = open;
  $('footer').inert = open;
  $('.floating-contact').inert = open;
  if (open) $('a', nav).focus();
  else if (restoreFocus) menuToggle.focus();
}
on(menuToggle, 'click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
on(nav, 'click', event => { if (event.target.closest('a')) setMenu(false); });
on(mobileQuery, 'change', event => { console.debug('Viewport diagnostic', event.matches, window.innerWidth); if (!event.matches) setMenu(false); });
on(document, 'keydown', event => {
  if (!nav.classList.contains('is-open')) return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
    const elements = $$('a,button', $('.site-header')).filter(e => e.getClientRects().length);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

const bookingDialog = $('#booking-dialog');
const stayDialog = $('#stay-dialog');
const photoDialog = $('#gallery-dialog');
const dialogs = $$('dialog');
let dialogOpener;
function openDialog(dialog, opener = document.activeElement) {
  if (nav.classList.contains('is-open')) setMenu(false);
  dialogs.filter(d => d.open).forEach(d => d.close());
  dialogOpener = opener;
  dialog.showModal();
  document.body.classList.add('modal-open');
  scheduleSlide();
}
dialogs.forEach(dialog => {
  on(dialog, 'close', () => {
    if (!dialogs.some(d => d.open)) {
      document.body.classList.remove('modal-open');
      if (dialogOpener?.isConnected && !dialogOpener.closest('dialog:not([open])')) dialogOpener.focus({ preventScroll: true });
    }
    scheduleSlide();
  });
  on(dialog, 'click', event => {
    if (event.target.closest('[data-close]')) dialog.close();
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
});
on(document, 'click', event => {
  const book = event.target.closest('[data-book]');
  if (book) {
    const interest = book.dataset.book || 'Hospedagem';
    $('#interest').value = interest;
    $('#booking-error').textContent = '';
    $('#whatsapp-fallback')?.remove();
    openDialog(bookingDialog, book.closest('dialog') ? dialogOpener : book);
    return;
  }
  const stayButton = event.target.closest('[data-stay]');
  if (stayButton) {
    const stay = stays.find(s => s.id === stayButton.dataset.stay);
    $('#stay-dialog-content').innerHTML = `<div class="stay-detail"><img src="/images/${stay.image}" width="600" height="800" alt="${stay.name} da Green House"/><div class="stay-detail-copy"><p class="section-label">${stay.label}</p><h2 id="stay-title">${stay.name}</h2><p>${stay.description}</p><ul class="amenity-list">${stay.amenities.map(a => `<li>${icon('check')}${a}</li>`).join('')}</ul><small>${stay.note}</small><button class="button button-green" data-book="${stay.name}">Consultar esta acomodação ${icon('up')}</button><p>Valores e disponibilidade sob consulta.</p></div></div>`;
    openDialog(stayDialog, stayButton);
  }
  const photoButton = event.target.closest('[data-photo]');
  if (photoButton) { showPhoto(Number(photoButton.dataset.photo)); openDialog(photoDialog, photoButton); }
});

const form = $('#booking-form');
const arrival = $('input[name="arrival"]', form);
const departure = $('input[name="departure"]', form);
const localDate = new Date();
const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2,'0')}-${String(localDate.getDate()).padStart(2,'0')}`;
arrival.min = today;
departure.min = today;
on(arrival, 'change', () => { departure.min = arrival.value || today; });
on(form, 'input', () => { $('#booking-error').textContent = ''; $('#whatsapp-fallback')?.remove(); });
on(form, 'submit', event => {
  event.preventDefault();
  if (arrival.value && departure.value && departure.value <= arrival.value) {
    $('#booking-error').textContent = 'A saída precisa ser depois da chegada.';
    departure.focus();
    return;
  }
  const fields = new FormData(form);
  const formatDate = date => date.split('-').reverse().join('/');
  const lines = ['Olá, Green House Saqua! Vim pelo site e gostaria de informações.', `Interesse: ${fields.get('interest')}.`];
  if (arrival.value) lines.push(`Chegada: ${formatDate(arrival.value)}.`);
  if (departure.value) lines.push(`Saída: ${formatDate(departure.value)}.`);
  if (fields.get('guests')) lines.push(`Grupo: ${fields.get('guests')}.`);
  lines.push('Podem me informar valores e disponibilidade?');
  const url = `https://wa.me/${contact.phone}?text=${encodeURIComponent(lines.join('\n'))}`;
  // This only opens a draft. The visitor sends it in WhatsApp; no reservation is made here.
  let fallback = $('#whatsapp-fallback');
  if (!fallback) {
    fallback = document.createElement('a');
    fallback.id = 'whatsapp-fallback'; fallback.className = 'text-link';
    fallback.target = '_blank'; fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Se o WhatsApp não abriu, toque aqui';
    form.append(fallback);
  }
  fallback.href = url;
  window.open(url, '_blank', 'noopener,noreferrer');
});

let photoIndex = 0;
function showPhoto(index) {
  photoIndex = (index + gallery.length) % gallery.length;
  const photo = gallery[photoIndex];
  $('#gallery-image').src = `/images/${photo.image}`;
  $('#gallery-image').alt = photo.alt;
  $('#gallery-title').textContent = photo.title;
  $('#gallery-count').textContent = `${photoIndex + 1} de ${gallery.length}`;
}
on($('#gallery-prev'), 'click', () => showPhoto(photoIndex - 1));
on($('#gallery-next'), 'click', () => showPhoto(photoIndex + 1));
on(photoDialog, 'keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
});
const tabs = $$('.gallery-tabs [role="tab"]');
function selectGalleryTab(tab) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1;
    $(`#${item.getAttribute('aria-controls')}`).hidden = !active;
  });
  ScrollTrigger.refresh();
}
tabs.forEach((tab, index) => {
  on(tab, 'click', () => selectGalleryTab(tab));
  on(tab, 'keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[1 - index];
    selectGalleryTab(next); next.focus();
  });
});
$$('.faq-list details').forEach(detail => on(detail, 'toggle', () => ScrollTrigger.refresh()));

const hero = $('.hero');
const heroSlides = $$('.hero-slide');
const dots = $$('.hero-dots button');
const heroPause = $('.hero-pause');
const media = matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = $('#motion-toggle');
let storedMotion;
try { storedMotion = localStorage.getItem('greenhouse-motion'); } catch { /* Storage is optional. */ }
let motionEnabled = storedMotion ? storedMotion === 'on' : !media.matches;
let heroPaused = false, heroVisible = true, hoverControls = false, focusControls = false;
let slideIndex = 0, slideTimer, motionContext;
const captions = ['O mar é só o começo', 'Nossa casa, seu novo canto', 'Histórias que a gente leva'];
function updateHeroControls() {
  const paused = heroPaused || !motionEnabled;
  heroPause.setAttribute('aria-pressed', String(paused));
  heroPause.setAttribute('aria-label', paused ? 'Retomar troca de fotos' : 'Pausar troca de fotos');
  heroPause.textContent = paused ? '▶' : 'Ⅱ';
}
function scheduleSlide() {
  clearTimeout(slideTimer);
  if (!motionEnabled || heroPaused || !heroVisible || document.hidden || hoverControls || focusControls || dialogs.some(d => d.open)) return;
  slideTimer = setTimeout(() => changeSlide(slideIndex + 1), 8000);
}
function changeSlide(index, manual = false) {
  slideIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => { slide.classList.toggle('is-active', i === slideIndex); slide.setAttribute('aria-hidden', String(i !== slideIndex)); });
  dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === slideIndex)));
  $('.hero-caption').textContent = captions[slideIndex];
  if (manual) heroPaused = true;
  updateHeroControls(); scheduleSlide();
}
dots.forEach((dot, index) => on(dot, 'click', () => changeSlide(index, true)));
on($('.hero-prev'), 'click', () => changeSlide(slideIndex - 1, true));
on($('.hero-next'), 'click', () => changeSlide(slideIndex + 1, true));
on(heroPause, 'click', () => {
  if (!motionEnabled) { motionEnabled = true; heroPaused = false; storeMotion(); applyMotion(false); }
  else heroPaused = !heroPaused;
  updateHeroControls(); scheduleSlide();
});
on($('.hero-controls'), 'pointerenter', () => { hoverControls = true; scheduleSlide(); });
on($('.hero-controls'), 'pointerleave', () => { hoverControls = false; scheduleSlide(); });
on(hero, 'focusin', () => { focusControls = true; scheduleSlide(); });
on(hero, 'focusout', event => { focusControls = hero.contains(event.relatedTarget); scheduleSlide(); });
on($('.hero-controls'), 'keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); changeSlide(slideIndex - 1, true); }
  if (event.key === 'ArrowRight') { event.preventDefault(); changeSlide(slideIndex + 1, true); }
});
let touchStart;
on(hero, 'touchstart', event => { touchStart = [event.touches[0].clientX,event.touches[0].clientY]; }, {passive:true});
on(hero, 'touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX-touchStart[0], dy=event.changedTouches[0].clientY-touchStart[1];
  if (Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.5) changeSlide(slideIndex + (dx<0?1:-1),true);
  touchStart = null;
}, {passive:true});
const heroObserver = new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; scheduleSlide(); }, {threshold:.1});
heroObserver.observe(hero);
on(document, 'visibilitychange', scheduleSlide);
function storeMotion() {
  storedMotion = motionEnabled ? 'on' : 'off';
  try { localStorage.setItem('greenhouse-motion',storedMotion); } catch { /* Storage is optional. */ }
}
function applyMotion(intro = false) {
  motionContext?.revert();
  document.documentElement.classList.toggle('motion-paused', !motionEnabled);
  motionToggle.textContent = motionEnabled ? 'Pausar movimento' : 'Ativar movimento';
  motionToggle.setAttribute('aria-pressed', String(!motionEnabled));
  if (motionEnabled) {
    motionContext = gsap.matchMedia();
    if (intro) motionContext.add('(min-width: 0px)', () => {
      gsap.from('.hero-intro, .hero h1, .hero-description, .hero-actions', {y:22,autoAlpha:0,duration:.85,stagger:.09,ease:'power2.out',clearProps:'all'});
    });
    motionContext.add('(min-width: 901px)', () => {
      gsap.to('.hero-slides', {y:48,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
      gsap.fromTo('.house-note', {y:18,rotation:-9}, {y:-12,rotation:-3,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:1.1}});
      gsap.fromTo('.hammock-photo', {y:25}, {y:-16,ease:'none',scrollTrigger:{trigger:'.coliving-layout',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.to('.contact-wave', {xPercent:8,ease:'none',scrollTrigger:{trigger:'.contact-section',start:'top bottom',end:'bottom top',scrub:1.2}});
    });
  }
  updateHeroControls(); scheduleSlide();
}
on(motionToggle, 'click', () => { motionEnabled = !motionEnabled; storeMotion(); applyMotion(); });
on(media, 'change', () => { if (!storedMotion) { motionEnabled = !media.matches; applyMotion(); } });
applyMotion(true);
document.fonts.ready.then(() => { if (!controller.signal.aborted) ScrollTrigger.refresh(); });

const navSections = $$('main section[id]').filter(section => $(`a[href="#${section.id}"]`,nav));
const navObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    $$('a',nav).forEach(a => a.getAttribute('href') === `#${entry.target.id}` ? a.setAttribute('aria-current','location') : a.removeAttribute('aria-current'));
  }
},{rootMargin:'-20% 0px -55% 0px'});
navSections.forEach(s => navObserver.observe(s));
if (import.meta.hot) import.meta.hot.dispose(() => {
  controller.abort(); clearTimeout(slideTimer); heroObserver.disconnect(); navObserver.disconnect(); motionContext?.revert();
  dialogs.forEach(d => d.close()); document.body.classList.remove('modal-open','menu-open');
  $('main').inert=false; $('footer').inert=false; $('.floating-contact').inert=false;
});
