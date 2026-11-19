/* Home page only: preloader, hero effects, marquee, process timeline, featured products */
(() => {
  const { $, $$, card, observe, reduce, fine, markLoaded } = App;

  /* preloader */
  const minWait = reduce ? 0 : 2000, t0 = performance.now();
  addEventListener('load', () => setTimeout(markLoaded, Math.max(0, minWait - (performance.now() - t0))));
  setTimeout(markLoaded, 4500);

  /* featured products from the shared catalogue */
  const featured = ['deal-wali-combo', 'medium-strong-filter', 'classic-filter', 'directors-blend'].map(DATA.byId);
  $('#featured').innerHTML = featured.map((p, i) => card(p, i)).join('');
  $$('#featured .pcard').forEach(c => c.classList.add('reveal'));
  observe($('#featured'));

  /* floating beans */
  const beanBox = $('#beans');
  if (beanBox && !reduce) {
    for (let i = 0; i < 16; i++) {
      const b = document.createElement('i'); b.className = 'bean';
      const w = 14 + Math.random() * 26;
      b.style.cssText = `width:${w}px;height:${w * 1.45}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;rotate:${Math.random() * 360}deg;--t:${7 + Math.random() * 8}s;--x:${(Math.random() - .5) * 90}px;--y:${-30 - Math.random() * 90}px;--r:${(Math.random() - .5) * 240}deg;opacity:${.35 + Math.random() * .5}`;
      beanBox.appendChild(b);
    }
  }

  /* hero mouse parallax */
  const hero = $('#hero'), visual = $('.hero-visual');
  $$('[data-depth]').forEach(el => el.style.setProperty('--dp', el.dataset.depth));
  if (hero && fine && !reduce) {
    hero.addEventListener('mousemove', e => { visual.style.setProperty('--mx', ((e.clientX / innerWidth) - .5) * 2); visual.style.setProperty('--my', ((e.clientY / innerHeight) - .5) * 2); });
    hero.addEventListener('mouseleave', () => { visual.style.setProperty('--mx', 0); visual.style.setProperty('--my', 0); });
  }

  /* marquee: always moving, speeds up while scrolling */
  const track = $('#marqueeTrack');
  if (track && !reduce) {
    let x = 0, lastY = scrollY;
    (function loop() {
      const dy = Math.abs(scrollY - lastY); lastY = scrollY;
      x -= 0.6 + dy * 0.35;
      const half = track.scrollWidth / 2; if (x < -half) x += half;
      track.style.transform = `translateX(${x}px)`; requestAnimationFrame(loop);
    })();
  }

  /* process: scroll-linked line + sticky image swap */
  const steps = $('#steps'), stepEls = $$('#steps li'), pvs = $$('.pv'), pvNum = $('#pvNum');
  const stepIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = stepEls.indexOf(e.target);
    stepEls.forEach((s, k) => s.classList.toggle('active', k === i));
    pvs.forEach((p, k) => p.classList.toggle('active', k === i));
    pvNum.textContent = String(i + 1).padStart(2, '0');
  }), { rootMargin: '-45% 0px -45% 0px' });
  stepEls.forEach(s => stepIO.observe(s));
  addEventListener('scroll', () => {
    const r = steps.getBoundingClientRect();
    steps.style.setProperty('--p', Math.min(1, Math.max(0, (innerHeight * .5 - r.top) / r.height)).toFixed(3));
  }, { passive: true });
})();
