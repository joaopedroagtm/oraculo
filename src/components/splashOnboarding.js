// Splash Screen & Onboarding Flow 
// Inspirado nas diretrizes de design com linhas vetoriais limpas, tons de prata/grafite e micro-acentos sutis.

import { sound } from '../services/audio.js';

export const SPLASH_LOGO_SVG = `
<div class="splash-temple-totem-wrapper">
  <div class="splash-temple-aura-glow"></div>
  <div class="splash-temple-orbital-ring"></div>
  <div class="splash-temple-center-arch">
    <img src="./favicon.png" alt="Templo Sagrado" class="splash-temple-logo-img" />
  </div>
</div>
`;

export const ONBOARDING_SVGS = {
  // Tela 1: Portais de Treino (Órbitas, radar e portais concêntricos)
  portais: `
  <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="ob-vector-art">
    <!-- Grade / Eixos de Radar -->
    <circle cx="110" cy="110" r="95" stroke="#334155" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>
    <circle cx="110" cy="110" r="75" stroke="#475569" stroke-width="1.25" opacity="0.6"/>
    <circle cx="110" cy="110" r="55" stroke="#64748b" stroke-width="1.5"/>
    <circle cx="110" cy="110" r="35" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="110" cy="110" r="18" stroke="#cbd5e1" stroke-width="1.75"/>
    <circle cx="110" cy="110" r="6" fill="#e2e8f0"/>

    <!-- Retículo de Alinhamento -->
    <line x1="110" y1="8" x2="110" y2="212" stroke="#334155" stroke-width="1" stroke-dasharray="3 3"/>
    <line x1="8" y1="110" x2="212" y2="110" stroke="#334155" stroke-width="1" stroke-dasharray="3 3"/>

    <!-- Órbitas Elípticas Cósmicas em Ângulo -->
    <ellipse cx="110" cy="110" rx="90" ry="34" transform="rotate(-25 110 110)" stroke="#94a3b8" stroke-width="1.5"/>
    <ellipse cx="110" cy="110" rx="76" ry="24" transform="rotate(35 110 110)" stroke="#64748b" stroke-width="1.25" stroke-dasharray="5 3"/>

    <!-- Nós de Constelação Sutis -->
    <circle cx="34" cy="74" r="3" fill="#cbd5e1"/>
    <circle cx="186" cy="146" r="3" fill="#94a3b8"/>
    <circle cx="158" cy="62" r="2.5" fill="#e2e8f0"/>
    <circle cx="70" cy="160" r="2" fill="#cbd5e1"/>
    
    <!-- Centelha de Navegação -->
    <path d="M110 22 L112 28 L118 30 L112 32 L110 38 L108 32 L102 30 L108 28 Z" fill="#ffffff" opacity="0.9"/>
  </svg>
  `,

  // Tela 2: Pilares da Constância (3 Colunas Gregas Clássicas)
  pilares: `
  <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="ob-vector-art">
    <!-- Linha de Base dos Degraus (Crepidoma) -->
    <line x1="20" y1="185" x2="200" y2="185" stroke="#475569" stroke-width="1.75"/>
    <line x1="28" y1="180" x2="192" y2="180" stroke="#64748b" stroke-width="1.5"/>
    <line x1="36" y1="175" x2="184" y2="175" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- COLUNA ESQUERDA (Alpha) -->
    <rect x="46" y="70" width="28" height="100" stroke="#64748b" stroke-width="1.5" fill="#0c0e14"/>
    <line x1="53" y1="72" x2="53" y2="168" stroke="#475569" stroke-width="1.25"/>
    <line x1="60" y1="72" x2="60" y2="168" stroke="#475569" stroke-width="1.25"/>
    <line x1="67" y1="72" x2="67" y2="168" stroke="#475569" stroke-width="1.25"/>
    <!-- Capitel e Base -->
    <rect x="42" y="62" width="36" height="8" rx="2" stroke="#94a3b8" stroke-width="1.5" fill="#141824"/>
    <polygon points="60,110 65,117 60,124 55,117" stroke="#cbd5e1" stroke-width="1.25" fill="none"/>

    <!-- COLUNA CENTRAL (Constância / Mais Alta) -->
    <rect x="94" y="48" width="32" height="122" stroke="#cbd5e1" stroke-width="1.75" fill="#0f121a"/>
    <line x1="102" y1="50" x2="102" y2="168" stroke="#94a3b8" stroke-width="1.25"/>
    <line x1="110" y1="50" x2="110" y2="168" stroke="#cbd5e1" stroke-width="1.25"/>
    <line x1="118" y1="50" x2="118" y2="168" stroke="#94a3b8" stroke-width="1.25"/>
    <!-- Capitel Central com volutas -->
    <rect x="88" y="38" width="44" height="10" rx="2" stroke="#e2e8f0" stroke-width="1.75" fill="#1a1f2e"/>
    <!-- Emblema Losango Central -->
    <polygon points="110,95 118,105 110,115 102,105" stroke="#ffffff" stroke-width="1.5" fill="#111625"/>
    <circle cx="110" cy="105" r="2" fill="#ffffff"/>

    <!-- COLUNA DIREITA (Gamma) -->
    <rect x="146" y="70" width="28" height="100" stroke="#64748b" stroke-width="1.5" fill="#0c0e14"/>
    <line x1="153" y1="72" x2="153" y2="168" stroke="#475569" stroke-width="1.25"/>
    <line x1="160" y1="72" x2="160" y2="168" stroke="#475569" stroke-width="1.25"/>
    <line x1="167" y1="72" x2="167" y2="168" stroke="#475569" stroke-width="1.25"/>
    <!-- Capitel e Base -->
    <rect x="142" y="62" width="36" height="8" rx="2" stroke="#94a3b8" stroke-width="1.5" fill="#141824"/>
    <polygon points="160,110 165,117 160,124 155,117" stroke="#94a3b8" stroke-width="1.25" fill="none"/>

    <!-- Estrela / Centelha no topo do Pilar Central -->
    <path d="M110 16 L112 24 L120 26 L112 28 L110 36 L108 28 L100 26 L108 24 Z" fill="#ffffff"/>
    <circle cx="110" cy="26" r="1.5" fill="#cbd5e1"/>
  </svg>
  `,

  // Tela 3: Oráculo IA
  oraculo: `
  <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="ob-vector-art">
    <!-- Círculo de Proteção Cósmica -->
    <circle cx="110" cy="110" r="92" stroke="#334155" stroke-width="1.25" stroke-dasharray="3 3"/>
    
    <!-- Losango / Diamante de Enquadramento Sagrado -->
    <polygon points="110,24 196,110 110,196 24,110" stroke="#94a3b8" stroke-width="1.5" fill="#090a0f"/>
    <polygon points="110,38 182,110 110,182 38,110" stroke="#475569" stroke-width="1.25"/>

    <!-- Órbitas Cruzadas Atômicas / Cósmicas -->
    <ellipse cx="110" cy="110" rx="84" ry="28" transform="rotate(-30 110 110)" stroke="#64748b" stroke-width="1.25"/>
    <ellipse cx="110" cy="110" rx="84" ry="28" transform="rotate(30 110 110)" stroke="#64748b" stroke-width="1.25"/>

    <!-- Olho do Oráculo (Linhas de Pálpebra Elegantes) -->
    <path d="M50 110 Q110 65 170 110 Q110 155 50 110 Z" stroke="#e2e8f0" stroke-width="2" fill="#0f1118"/>
    
    <!-- Íris e Pupila -->
    <circle cx="110" cy="110" r="22" stroke="#94a3b8" stroke-width="1.75" fill="#141724"/>
    <circle cx="110" cy="110" r="10" fill="#e2e8f0"/>
    <circle cx="113" cy="107" r="3" fill="#ffffff"/> <!-- Brilho especular Apple -->

    <!-- Micro Pontos de Constelação -->
    <circle cx="110" cy="24" r="3" fill="#ffffff"/>
    <circle cx="196" cy="110" r="3" fill="#cbd5e1"/>
    <circle cx="110" cy="196" r="3" fill="#94a3b8"/>
    <circle cx="24" cy="110" r="3" fill="#e2e8f0"/>
  </svg>
  `
};

export const SplashService = {
  show({ onFinish }) {
    // Evita duplicidade se já houver splash
    document.querySelectorAll('#app-splash-screen').forEach(el => el.remove());

    const splash = document.createElement('div');
    splash.id = 'app-splash-screen';
    splash.className = 'app-splash-screen';
    splash.innerHTML = `
      <div class="splash-inner">
        <div class="splash-logo-container">
          ${SPLASH_LOGO_SVG}
        </div>
        <div class="splash-brand-block">
          <h1 class="splash-brand-title">ORÁCULO: agite-me!</h1>
          <div class="splash-brand-sub">Treine e evolue o melhor templo: seu corpo</div>
        </div>
        <div class="splash-footer-loader">
          <div class="splash-loader-text">Carregando...</div>
          <div class="splash-progress-track">
            <div class="splash-progress-bar"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(splash);

    // Duração de 1 segundo de carregamento fluido com movimento
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
        if (typeof onFinish === 'function') onFinish();
      }, 300);
    }, 1000);
  }
};
