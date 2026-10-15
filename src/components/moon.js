// Componente: Lua Etérea Interativa com Fase Astronômica Real 
// Renderiza a iluminação real calculada a partir do ciclo sinódico, movimento orbital e toque elástico.

import { getAstronomicalMoonPhase } from '../utils/lunar.js';

export class CelestialMoon {
  constructor(containerElement) {
    this.container = containerElement;
    this.element = null;
    this.posX = 0;
    this.posY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.lunarData = getAstronomicalMoonPhase(new Date());
    this.init();
  }

  init() {
    this.element = document.createElement('div');
    this.element.className = 'celestial-moon-wrapper';
    this.element.setAttribute(
      'title',
      `${this.lunarData.phaseName} (${this.lunarData.illuminationPercent}% iluminada) • Toque para interagir`
    );

    const isNewMoon = this.lunarData.illuminationPercent <= 12;
    const isFullMoon = this.lunarData.illuminationPercent >= 85;

    this.element.innerHTML = `
      <div class="moon-aura-cyan"></div>
      <div class="moon-aura-pink"></div>
      <div class="celestial-moon-sphere ${isNewMoon ? 'is-new-moon' : ''}">
        <svg viewBox="0 0 100 100" class="moon-texture-svg">
          <defs>
            <filter id="glow-filter" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffffff" flood-opacity="0.85"/>
            </filter>
            <radialGradient id="new-moon-surface" cx="40%" cy="40%" r="65%">
              <stop offset="0%" stop-color="#1e293b"/>
              <stop offset="60%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#020617"/>
            </radialGradient>
            <radialGradient id="full-moon-surface" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="70%" stop-color="#f1f5f9"/>
              <stop offset="100%" stop-color="#cbd5e1"/>
            </radialGradient>
            <linearGradient id="silver-rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
              <stop offset="50%" stop-color="#93c5fd" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#fbcfe8" stop-opacity="0.8"/>
            </linearGradient>
          </defs>

          ${isNewMoon ? `
            <!-- Corpo Escuro da Lua Nova com Borda Prateada Brilhante -->
            <circle cx="50" cy="50" r="47" fill="url(#new-moon-surface)" stroke="url(#silver-rim-grad)" stroke-width="1.8" filter="url(#glow-filter)" />
            <!-- Arco de Luz Sutil na Borda Esquerda -->
            <path d="M 50 3 A 47 47 0 0 0 50 97 A 43 47 0 0 1 50 3" fill="#ffffff" opacity="0.45" filter="url(#glow-filter)" />
            <!-- Relevo das Crateras em Penumbra -->
            <circle cx="36" cy="38" r="8" fill="#334155" opacity="0.4" />
            <circle cx="62" cy="34" r="11" fill="#1e293b" opacity="0.5" />
            <circle cx="56" cy="64" r="13" fill="#1e293b" opacity="0.45" />
            <circle cx="34" cy="68" r="6" fill="#334155" opacity="0.35" />
          ` : isFullMoon ? `
            <!-- Brilho Pleno da Lua Cheia -->
            <circle cx="50" cy="50" r="48" fill="url(#full-moon-surface)" filter="url(#glow-filter)" />
            <circle cx="34" cy="38" r="9" fill="#e2e8f0" opacity="0.45" />
            <circle cx="62" cy="32" r="12" fill="#cbd5e1" opacity="0.35" />
            <circle cx="58" cy="65" r="14" fill="#cbd5e1" opacity="0.4" />
            <circle cx="32" cy="68" r="7" fill="#e2e8f0" opacity="0.3" />
            <circle cx="45" cy="48" r="5" fill="#94a3b8" opacity="0.25" />
          ` : `
            <!-- Fase Intermediária (Crescente / Gibosa / Minguante) -->
            <circle cx="50" cy="50" r="47" fill="url(#new-moon-surface)" stroke="url(#silver-rim-grad)" stroke-width="1.5" />
            <path d="M 50 3 A 47 47 0 0 1 50 97 A ${Math.abs(50 - this.lunarData.illuminationPercent)} 47 0 0 ${this.lunarData.phaseFraction < 0.5 ? '1' : '0'} 50 3" fill="#ffffff" filter="url(#glow-filter)" />
            <circle cx="34" cy="38" r="7" fill="#cbd5e1" opacity="0.4" />
            <circle cx="60" cy="62" r="10" fill="#cbd5e1" opacity="0.3" />
          `}
        </svg>
      </div>
      <div class="moon-sparkle-stars">
        <span class="m-star s1">✦</span>
        <span class="m-star s2">★</span>
        <span class="m-star s3">✦</span>
      </div>
    `;

    this.container.appendChild(this.element);
    this.bindEvents();
  }

  bindEvents() {
    const el = this.element;

    const onStart = (e) => {
      this.isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.startX = clientX - this.posX;
      this.startY = clientY - this.posY;
      el.classList.add('moon-interacting');
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = Math.max(-50, Math.min(50, clientX - this.startX));
      const deltaY = Math.max(-35, Math.min(35, clientY - this.startY));
      this.posX = deltaX;
      this.posY = deltaY;
      el.style.transform = `translate(${this.posX}px, ${this.posY}px) scale(1.08)`;
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      el.classList.remove('moon-interacting');
      el.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      this.posX = 0;
      this.posY = 0;
      el.style.transform = `translate(0px, 0px) scale(1)`;
      setTimeout(() => {
        el.style.transition = '';
      }, 800);
    };

    el.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    el.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }
}
