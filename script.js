/* Shared interactions for every page */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  document.addEventListener('DOMContentLoaded', () => {

    /* ---------- mobile nav ---------- */
    const burger = $('#hamburger'), links = $('#nav-links');
    if (burger && links) {
      const close = () => { links.classList.remove('active'); burger.classList.remove('open'); };
      burger.addEventListener('click', () => {
        links.classList.toggle('active'); burger.classList.toggle('open');
      });
      $$('a', links).forEach(a => a.addEventListener('click', close));
      document.addEventListener('keydown', e => e.key === 'Escape' && close());
    }

    /* ---------- scroll progress ---------- */
    const bar = Object.assign(document.createElement('div'), { className: 'progress' });
    document.body.appendChild(bar);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    /* ---------- skills text -> chips (same words, nicer layout) ---------- */
    $$('.card h3').forEach(h => {
      if (/skills/i.test(h.textContent) && h.nextElementSibling) {
        const p = h.nextElementSibling;
        const items = p.textContent.split(',').map(s => s.trim()).filter(Boolean);
        p.textContent = ''; p.classList.add('chips');
        items.forEach(t => p.appendChild(Object.assign(document.createElement('span'), { textContent: t })));
      }
    });

    /* ---------- scroll reveal with stagger ---------- */
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    $$('.section').forEach(sec => {
      [...sec.children].forEach(el => {
        const group = el.matches('.feature-grid, .project-grid, .image-grid');
        const items = group ? [...el.children] : [el];
        items.forEach((it, i) => {
          it.classList.add('rv');
          if (group) it.style.setProperty('--d', Math.min(i * 0.09, 0.45) + 's');
          io.observe(it);
        });
      });
    });

    /* ---------- cards: cursor spotlight + gentle 3D tilt ---------- */
    if (fine) {
      $$('.card, .glass-card, .feature-card, .project-card').forEach(c => {
        c.addEventListener('mousemove', e => {
          const r = c.getBoundingClientRect();
          c.style.setProperty('--cx', (e.clientX - r.left) + 'px');
          c.style.setProperty('--cy', (e.clientY - r.top) + 'px');
        });
      });
      if (!reduce) {
        $$('.feature-card, .project-card, .image-grid img').forEach(c => {
          c.addEventListener('mousemove', e => {
            const r = c.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            c.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateZ(0)`;
          });
          c.addEventListener('mouseleave', () => { c.style.transform = ''; });
        });
        /* magnetic buttons */
        $$('.btn').forEach(b => {
          b.addEventListener('mousemove', e => {
            const r = b.getBoundingClientRect();
            b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
          });
          b.addEventListener('mouseleave', () => { b.style.transform = ''; });
        });
      }
    }

    /* ---------- ripple on buttons ---------- */
    $$('.btn').forEach(b => b.addEventListener('click', e => {
      const r = b.getBoundingClientRect();
      const s = document.createElement('span'); s.className = 'ripple';
      s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
      b.appendChild(s); setTimeout(() => s.remove(), 600);
    }));

    /* ---------- hero: cursor-lit grid ---------- */
    const hero = $('.hero, .game-hero');
    if (hero && fine && !reduce) {
      let tx = 0, ty = 0, x = 0, y = 0, on = false;
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!on) { x = tx; y = ty; on = true; loop(); }
      });
      const loop = () => {
        x += (tx - x) * .12; y += (ty - y) * .12;
        hero.style.setProperty('--mx', x + 'px'); hero.style.setProperty('--my', y + 'px');
        requestAnimationFrame(loop);
      };
    }

    /* ---------- custom cursor ---------- */
    if (fine) {
      const dot = Object.assign(document.createElement('div'), { className: 'cursor-dot' });
      const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
      document.body.append(ring, dot);
      root.classList.add('js-cursor');
      let mx = 0, my = 0, rx = 0, ry = 0;
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
        document.body.classList.add('cursor-on');
      });
      document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on'));
      document.addEventListener('mouseover', e =>
        ring.classList.toggle('hover', !!e.target.closest('a, button, .hamburger, input, textarea, .image-grid img')));
      (function follow() {
        rx += (mx - rx) * .16; ry += (my - ry) * .16;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(follow);
      })();
    }

    /* ---------- page transition between pages ---------- */
    $$('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (/^[\w-]+\.html$/.test(h) && !a.target) {
        a.addEventListener('click', e => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          document.body.classList.add('leaving');
          setTimeout(() => { location.href = h; }, 240);
        });
      }
    });
    addEventListener('pageshow', () => document.body.classList.remove('leaving'));

    /* ---------- image popup (project pages) ---------- */
    const grid = $$('.image-grid img');
    if (grid.length) {
      let popup = $('.image-popup');
      if (!popup) {
        popup = document.createElement('div'); popup.className = 'image-popup';
        popup.innerHTML = '<span class="close-btn">&times;</span><img src="" alt="Preview">';
        document.body.appendChild(popup);
      }
      const big = $('img', popup), x = $('.close-btn', popup);
      const open = src => { big.src = src; popup.classList.add('active'); };
      const shut = () => popup.classList.remove('active');
      grid.forEach(i => i.addEventListener('click', () => open(i.src)));
      x.addEventListener('click', shut);
      popup.addEventListener('click', e => { if (e.target === popup) shut(); });
      document.addEventListener('keydown', e => e.key === 'Escape' && shut());
    }

    /* ---------- trailer video ---------- */
    const video = $('#trailerVideo'), pp = $('#playPauseBtn');
    if (video && pp) {
      pp.addEventListener('click', () => {
        if (video.paused) { video.play(); pp.textContent = '⏸'; }
        else { video.pause(); pp.textContent = '▶'; }
      });
      new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting) { video.play().catch(() => {}); pp.textContent = '⏸'; }
        else video.pause();
      }), { threshold: .5 }).observe(video);
    }
  });
})();
