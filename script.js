// Improve focus visibility for keyboard users per WCAG 2.1
(function focusVisible(){
  function onFirstTab(e){ if (e.key === 'Tab') { document.body.classList.add('keyboard'); window.removeEventListener('keydown', onFirstTab); window.addEventListener('mousedown', onMouseDownOnce); } }
  function onMouseDownOnce(){ document.body.classList.remove('keyboard'); window.removeEventListener('mousedown', onMouseDownOnce); window.addEventListener('keydown', onFirstTab); }
  window.addEventListener('keydown', onFirstTab);
})();

// Mobile menu: toggle + focus trap + ESC close
const toggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
let releaseFocusTrap = null;

function trapFocus(container, initial) {
  const selector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  function getFocusable() {
    return Array.from(container.querySelectorAll(selector)).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true' && el.tabIndex !== -1 && el.offsetParent !== null);
  }
  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (focusable.length === 0) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', onKeydown);
  (initial || getFocusable()[0] || container).focus();
  return () => document.removeEventListener('keydown', onKeydown);
}

function openMenu() {
  toggle.setAttribute('aria-expanded', 'true');
  toggle.classList.add('active');
  mobileNav.classList.add('active');
  document.body.style.overflow = 'hidden';
  releaseFocusTrap = trapFocus(mobileNav, mobileNav.querySelector('a'));
}
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.classList.remove('active');
  mobileNav.classList.remove('active');
  document.body.style.overflow = '';
  if (releaseFocusTrap) { releaseFocusTrap(); releaseFocusTrap = null; }
  toggle.focus();
}

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    if (mobileNav.classList.contains('active')) closeMenu(); else openMenu();
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

// Loader: fade out after load
(function initLoader(){
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.style.opacity = '0';
      setTimeout(() => { if (loader) loader.style.display = 'none'; }, 500);
    }, 800);
  });
})();

// Scroll progress
(function initScrollProgress(){
  const progress = document.getElementById('scrollProgress');
  const update = () => {
    const docHeight = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const scrollPercent = (window.pageYOffset / docHeight) * 100;
    if (progress) progress.style.width = scrollPercent + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Navigation dots + aria-current in header nav
(function initNavigationDots(){
  const dots = document.querySelectorAll('.nav-dot-item');
  const sections = Array.from(document.querySelectorAll('section'));
  const headerLinks = document.querySelectorAll('header nav a');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetId = dot.getAttribute('data-section');
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
  const onScroll = () => {
    const mid = window.innerHeight / 2;
    let current = '';
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= mid && rect.bottom >= mid) { current = section.id; break; }
    }
    dots.forEach(d => d.classList.toggle('active', d.getAttribute('data-section') === current));
    headerLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const matches = href.startsWith('#') && href.slice(1) === current;
      if (matches) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Intersection animation
(function initScrollAnimations(){
  const observer = new IntersectionObserver((entries, obs) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('animate'); obs.unobserve(e.target); }
    }
  }, { threshold: 0.2, rootMargin: '-50px 0px' });
  document.querySelectorAll('.skill-item, .exp-item, .client-item, .testimonial-item').forEach(el => observer.observe(el));
})();

// Parallax (hero panoramic) + subtle rotation; disabled on reduced motion
(function initParallax(){
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  let ticking = false;
  const heroMedia = document.querySelector('.hero-media');
  const planet = document.querySelector('.planet-image');
  function update(){
    const scrolled = window.pageYOffset;
    if (heroMedia) { heroMedia.style.transform = `translateY(${scrolled * -0.2}px)`; }
    if (planet) { planet.style.transform = `rotate(${scrolled * 0.1}deg)`; }
    ticking = false;
  }
  function onScroll(){ if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
