/**
 * carrossel-parceiros.js
 * Carrossel infinito — versão definitiva e limpa.
 * Coloque em: frontend/src/javascript/carrossel-parceiros.js
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Elementos ────────────────────────────────────────── */
    const track   = document.getElementById('carrosselTrack');
    const wrapper = document.getElementById('carrosselParceiros');
    const dotsBox = document.getElementById('carrosselDots');

    if (!track || !wrapper) return;

    const viewport = track.closest('.carrossel-viewport');
    if (!viewport) return;

    const prevBtn = wrapper.querySelector('.carrossel-prev');
    const nextBtn = wrapper.querySelector('.carrossel-next');

    /* ── Estado ───────────────────────────────────────────── */
    // Captura os originais UMA vez, antes de qualquer clone
    const originals = Array.from(track.querySelectorAll('.parceiro-item:not(.clone)'));
    const total = originals.length;
    if (total === 0) return;

    const GAP = 20;          // px — deve ser igual ao gap do CSS
    let itemW       = 180;   // largura de 1 item + gap (recalculado em measure())
    let visible     = 4;     // quantos cabem na viewport
    let idx         = 0;     // posição atual na fita clonada
    let busy        = false; // true enquanto a animação CSS está rodando
    let paused      = false; // true com mouse/touch sobre o carrossel
    let timer       = null;

    /* ── 1. Medir ─────────────────────────────────────────── */
    function measure() {
      const first = originals[0];
      if (!first) return;
      itemW   = first.offsetWidth + GAP;
      visible = Math.max(1, Math.floor(viewport.offsetWidth / itemW));
    }

    /* ── 2. Construir fita com clones ─────────────────────── */
    function buildTrack() {
      // Remove clones antigos
      track.querySelectorAll('.clone').forEach(el => el.remove());

      // Recoloca originais em ordem
      originals.forEach(el => track.appendChild(el));

      // Clones no início = últimos N originais (para o prev funcionar)
      originals.slice(-visible).reverse().forEach(el => {
        const c = el.cloneNode(true);
        c.classList.add('clone');
        track.prepend(c);
      });

      // Clones no fim = primeiros N originais (para o next fazer loop)
      originals.slice(0, visible).forEach(el => {
        const c = el.cloneNode(true);
        c.classList.add('clone');
        track.appendChild(c);
      });

      // Posição inicial: primeiro item original (pula os clones do início)
      idx = visible;
      snap(); // posiciona sem animação
    }

    /* ── 3. Movimento ─────────────────────────────────────── */
    // Posiciona sem animação (teletransporte silencioso)
    function snap() {
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${idx * itemW}px)`;
      track.offsetHeight;    // força reflow — garante que o browser aplica antes da próxima animação
    }

    // Posiciona COM animação
    function slide() {
      if (busy) return;
      busy = true;
      track.style.transition = 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.transform  = `translateX(-${idx * itemW}px)`;
    }

    // Ao terminar a animação: verifica se precisa teletransportar para o loop
    track.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'transform') return; // ignora outros eventos CSS
      busy = false;

      if (idx >= total + visible) {
        // Passou do último original → volta ao início
        idx = visible + (idx - total - visible);
        snap();
      } else if (idx < visible) {
        // Voltou antes do primeiro original → vai para o fim
        idx = total + visible - (visible - idx);
        snap();
      }

      updateDots();
    });

    /* ── 4. Navegação ─────────────────────────────────────── */
    function next() { idx++; slide(); updateDots(); }
    function prev() { idx--; slide(); updateDots(); }

    if (nextBtn) nextBtn.addEventListener('click', () => { if (!busy) { next(); resetTimer(); } });
    if (prevBtn) prevBtn.addEventListener('click', () => { if (!busy) { prev(); resetTimer(); } });

    /* ── 5. Auto-play ─────────────────────────────────────── */
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!paused && !busy) next();
      }, 1500);
    }

    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }

    // Pausa com mouse
    wrapper.addEventListener('mouseenter', () => { paused = true;  clearInterval(timer); });
    wrapper.addEventListener('mouseleave', () => { paused = false; startTimer(); });

    // Pausa com toque (mobile)
    wrapper.addEventListener('touchstart', () => { paused = true;  clearInterval(timer); }, { passive: true });
    wrapper.addEventListener('touchend',   () => { paused = false; startTimer(); },         { passive: true });

    /* ── 6. Swipe (mobile) ────────────────────────────────── */
    let touchX = 0;
    viewport.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
        resetTimer();
      }
    }, { passive: true });

    /* ── 7. Dots ──────────────────────────────────────────── */
    function buildDots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = '';
      const pages = Math.ceil(total / visible);
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carrossel-dot';
        dot.setAttribute('aria-label', `Página ${i + 1}`);
        dot.addEventListener('click', () => {
          if (busy) return;
          idx = visible + i * visible;
          slide();
          updateDots();
          resetTimer();
        });
        dotsBox.appendChild(dot);
      }
      updateDots();
    }

    function updateDots() {
      if (!dotsBox) return;
      const dots = dotsBox.querySelectorAll('.carrossel-dot');
      const page = Math.max(0, Math.min(
        Math.floor((idx - visible) / visible),
        dots.length - 1
      ));
      dots.forEach((d, i) => d.classList.toggle('active', i === page));
    }

    /* ── 8. Init + resize ─────────────────────────────────── */
    function init() {
      measure();
      buildTrack();
      buildDots();
      startTimer();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        clearInterval(timer);
        busy = false;
        init();
      }, 250);
    });

    init();
  });

})();