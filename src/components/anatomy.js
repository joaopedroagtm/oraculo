// Componente: Manequim Anatômico (Holograma Corporal Biomecânico Frente & Costas)
// Mapeamento biomecânico fiel baseado nos exercícios reais  do MuscleWiki.

export class CosmicAnatomyHologram {
  constructor(containerElement, routineFocus = 'legs', exercises = []) {
    this.container = containerElement;
    this.routineFocus = routineFocus;
    this.exercises = exercises;

    // Detecta os músculos e define a vista inicial inteligente
    const targets = this.detectTargetMuscles();
    this.currentView = targets.defaultView || 'front';
    this.render();
  }

  update(routineFocus, exercises = []) {
    this.routineFocus = routineFocus;
    this.exercises = exercises;
    const targets = this.detectTargetMuscles();
    this.currentView = targets.defaultView || 'front';
    this.render();
  }

  detectTargetMuscles() {
    const focus = (this.routineFocus || '').toLowerCase();

    // Inspeção de exercícios da sessão
    const exerciseIds = (this.exercises || []).map(ex => (ex.exerciseId || ex.id || '').toLowerCase());

    const hasBackExercises = exerciseIds.some(id => id.includes('puxada') || id.includes('remada') || id.includes('pulldown') || id.includes('row'));
    const hasChestExercises = exerciseIds.some(id => id.includes('supino') || id.includes('crucifixo') || id.includes('peck') || id.includes('fly'));
    const hasLegExercises = exerciseIds.some(id => id.includes('leg') || id.includes('extensora') || id.includes('agachamento') || id.includes('flexora'));

    // Determina se é PULL (Costas / Bíceps)
    const isBackPull = hasBackExercises ||
      focus.includes('costas') ||
      focus.includes('pull') ||
      focus.includes('puxar') ||
      focus.includes('beta');

    // Determina se é PUSH (Peito / Ombros / Tríceps)
    const isChestPush = !isBackPull && (hasChestExercises ||
      focus.includes('peito') ||
      focus.includes('push') ||
      focus.includes('empurrar') ||
      focus.includes('alpha'));

    // Determina se é LEGS (Pernas / Inferiores)
    const isLegs = !isBackPull && !isChestPush && (hasLegExercises ||
      focus.includes('perna') ||
      focus.includes('inferior') ||
      focus.includes('legs') ||
      focus.includes('gamma'));

    const targeted = {
      chest: false,
      shoulders: false,
      back: false,
      biceps: false,
      triceps: false,
      abs: false,
      quads: false,
      glutes: false,
      hamstrings: false,
      calves: false,
      defaultView: 'front',
      primaryLabel: 'Músculo Primário',
      secondaryLabel: 'Sinergistas',
      statusText: 'Ativação muscular em tempo real.'
    };

    if (isBackPull) {
      // PORTAL BETA / COSTAS & BÍCEPS
      targeted.back = true;         // Primário (Ciano)
      targeted.biceps = true;       // Secundário (Rosa)
      targeted.abs = true;          // Estabilizador Core
      targeted.defaultView = 'back'; // Começa mostrando as costas!
      targeted.primaryLabel = 'Grande Dorsal & Costas (Ciano)';
      targeted.secondaryLabel = 'Bíceps & Trapézio (Rosa)';
      targeted.statusText = 'Ativação biomecânica em puxadas, dorsal e flexores de braço.';
    } else if (isChestPush) {
      // PORTAL ALPHA / PEITO, OMBROS & TRÍCEPS
      targeted.chest = true;        // Primário (Ciano)
      targeted.shoulders = true;    // Secundário (Rosa)
      targeted.triceps = true;      // Secundário (Rosa)
      targeted.defaultView = 'front';
      targeted.primaryLabel = 'Peitoral Maior (Ciano)';
      targeted.secondaryLabel = 'Ombros & Tríceps (Rosa)';
      targeted.statusText = 'Foco no empurre torácico, estabilização escapular e tríceps.';
    } else if (isLegs) {
      // PORTAL GAMMA / PERNAS & GLÚTEOS
      targeted.quads = true;        // Primário (Ciano)
      targeted.glutes = true;       // Secundário (Rosa)
      targeted.hamstrings = true;   // Secundário (Rosa)
      targeted.calves = true;       // Secundário (Rosa)
      targeted.defaultView = 'front';
      targeted.primaryLabel = 'Quadríceps & Pernas (Ciano)';
      targeted.secondaryLabel = 'Glúteos & Posteriores (Rosa)';
      targeted.statusText = 'Pilares de concreto: base atlética e extensão de quadril.';
    } else {
      // Fallback genérico
      targeted.abs = true;
      targeted.shoulders = true;
      targeted.defaultView = 'front';
      targeted.primaryLabel = 'Core & Ombros (Ciano)';
      targeted.secondaryLabel = 'Membros Ativos (Rosa)';
      targeted.statusText = 'Ativação corporal funcional e estabilidade.';
    }

    return targeted;
  }

  render() {
    this.container.innerHTML = '';
    const targets = this.detectTargetMuscles();

    const wrapper = document.createElement('div');
    wrapper.className = 'anatomy-hologram-card stone-panel-inner';

    wrapper.innerHTML = `
      <div class="anatomy-header">
        <div class="anatomy-title-row">
          <span class="anatomy-spark">✦</span>
          <span class="anatomy-title">MAPA DE ATIVAÇÃO MUSCULAR</span>
          <span class="anatomy-spark">✦</span>
        </div>
        <span class="anatomy-subtitle">Holograma Anatômico Cósmico (MuscleWiki Sync)</span>
      </div>

      <!-- Seletor Tátil: Vista Frontal vs Vista Dorsal -->
      <div class="anatomy-view-toggle">
        <button type="button" class="anatomy-toggle-btn ${this.currentView === 'front' ? 'active' : ''}" data-view="front">
          ✦ VISTA FRONTAL
        </button>
        <button type="button" class="anatomy-toggle-btn ${this.currentView === 'back' ? 'active' : ''}" data-view="back">
          ✦ VISTA DORSAL (COSTAS)
        </button>
      </div>

      <div class="anatomy-stage-wrapper">
        <!-- Aura Luminosa de Fundo Cósmico -->
        <div class="anatomy-aura-layer"></div>

        ${this.currentView === 'front' ? this.renderFrontSvg(targets) : this.renderBackSvg(targets)}

        <!-- Legenda de Foco com Efeitos de Neon Sincronizados -->
        <div class="anatomy-legend-column">
          <div class="anatomy-badge-pill active-cyan-pill">
            <span class="dot-cyan">●</span>
            <span>${targets.primaryLabel}</span>
          </div>
          <div class="anatomy-badge-pill active-pink-pill">
            <span class="dot-pink">●</span>
            <span>${targets.secondaryLabel}</span>
          </div>
          <div class="anatomy-energy-status">
            ${targets.statusText}
          </div>
        </div>
      </div>
    `;

    // Conectar eventos do alternador de vistas (Frontal vs Dorsal)
    wrapper.querySelectorAll('.anatomy-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view && view !== this.currentView) {
          this.currentView = view;
          this.render();
          if ('vibrate' in navigator) navigator.vibrate(15);
        }
      });
    });

    this.container.appendChild(wrapper);
  }

  // SILHUETA 1: VISTA FRONTAL (Peitoral, Deltóide Anterior, Bíceps, Abdômen, Quadríceps)
  renderFrontSvg(targets) {
    const isChest = targets.chest;
    const isShoulders = targets.shoulders;
    const isBiceps = targets.biceps;
    const isAbs = targets.abs;
    const isQuads = targets.quads;
    const isBackLats = targets.back;

    return `
      <svg viewBox="0 0 200 340" class="anatomy-humanoid-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="neon-glow-cyan" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00f0ff" flood-opacity="0.95"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#0ea5e9" flood-opacity="0.75"/>
          </filter>
          <filter id="neon-glow-pink" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ff2a85" flood-opacity="0.95"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#f472b6" flood-opacity="0.75"/>
          </filter>
          <linearGradient id="mannequin-pearl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="45%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="muscle-inactive-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
        </defs>

        <!-- 1. BASE CORPORAL CONTÍNUA E ESCULPIDA -->
        <path class="mannequin-base-body" d="
          M 100 12 
          C 91 12, 86 18, 86 26 
          C 86 33, 91 39, 95 44 
          C 95 47, 93 49, 90 51 
          C 85 52, 70 56, 56 60 
          C 52 64, 49 72, 51 82 
          C 51 92, 48 106, 50 118 
          C 47 124, 44 138, 47 158 
          C 46 166, 44 174, 47 180 
          C 49 183, 53 182, 54 176 
          C 56 168, 56 162, 56 158 
          C 59 146, 60 132, 60 120 
          C 62 108, 65 96, 71 85 
          C 72 98, 73 112, 80 126 
          C 81 132, 77 140, 75 152 
          C 72 165, 70 188, 73 214 
          C 74 220, 74 226, 75 230 
          C 71 242, 69 262, 74 294 
          C 75 302, 73 310, 72 318 
          C 71 324, 76 325, 83 324 
          C 85 320, 84 310, 84 300 
          C 88 276, 88 252, 84 230 
          C 83 226, 83 220, 84 214 
          C 86 194, 91 176, 99 158 
          C 101 158, 109 176, 114 194 
          C 116 214, 117 220, 116 226 
          C 112 252, 112 276, 116 300 
          C 116 310, 115 320, 117 324 
          C 124 325, 129 324, 128 318 
          C 127 310, 125 302, 126 294 
          C 131 262, 129 242, 125 230 
          C 126 226, 126 220, 127 214 
          C 130 188, 128 165, 125 152 
          C 123 140, 119 132, 120 126 
          C 127 112, 128 98, 129 85 
          C 135 96, 138 108, 140 120 
          C 140 132, 141 146, 144 158 
          C 144 162, 144 168, 146 176 
          C 147 182, 151 183, 153 180 
          C 156 174, 154 166, 153 158 
          C 156 138, 153 124, 150 118 
          C 152 106, 149 92, 149 82 
          C 151 72, 148 64, 144 60 
          C 130 56, 115 52, 110 51 
          C 107 49, 105 47, 105 44 
          C 109 39, 114 33, 114 26 
          C 114 18, 109 12, 100 12 Z" 
          fill="url(#mannequin-pearl)" 
          stroke="rgba(148, 163, 184, 0.45)" 
          stroke-width="0.8"/>

        <!-- LINHAS ANATÔMICAS: CLAVÍCULAS & ESTERNO -->
        <path d="M 98 52 C 90 52, 75 55, 62 60" stroke="rgba(148, 163, 184, 0.55)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M 102 52 C 110 52, 125 55, 138 60" stroke="rgba(148, 163, 184, 0.55)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <line x1="100" y1="54" x2="100" y2="88" stroke="rgba(148, 163, 184, 0.4)" stroke-width="1" stroke-linecap="round"/>

        <!-- FLANCOS / SERRÁTIL (Dentro do contorno, sem espetos para fora) -->
        <path d="M 72 86 C 73 98, 74 112, 79 124 L 83 124 C 79 112, 78 98, 77 86 Z" 
              class="muscle-zone ${isBackLats ? 'active-cyan' : ''}" 
              fill="${isBackLats ? '#38bdf8' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isBackLats ? '#00f0ff' : 'rgba(148, 163, 184, 0.35)'}"
              stroke-width="0.7"
              filter="${isBackLats ? 'url(#neon-glow-cyan)' : 'none'}"/>
        <path d="M 128 86 C 127 98, 126 112, 121 124 L 117 124 C 121 112, 122 98, 123 86 Z" 
              class="muscle-zone ${isBackLats ? 'active-cyan' : ''}" 
              fill="${isBackLats ? '#38bdf8' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isBackLats ? '#00f0ff' : 'rgba(148, 163, 184, 0.35)'}"
              stroke-width="0.7"
              filter="${isBackLats ? 'url(#neon-glow-cyan)' : 'none'}"/>

        <!-- DELTÓIDES (OMBROS ANTERIORES & LATERAIS) -->
        <path d="M 66 61 C 57 64, 52 71, 51 81 C 53 86, 60 88, 66 84 C 70 79, 71 70, 69 63 Z" 
              class="muscle-zone ${isShoulders ? 'active-pink' : ''}" 
              fill="${isShoulders ? '#f472b6' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isShoulders ? '#ff2a85' : 'rgba(148, 163, 184, 0.45)'}"
              stroke-width="0.75"
              filter="${isShoulders ? 'url(#neon-glow-pink)' : 'none'}"/>
        <path d="M 134 61 C 143 64, 148 71, 149 81 C 147 86, 140 88, 134 84 C 130 79, 129 70, 131 63 Z" 
              class="muscle-zone ${isShoulders ? 'active-pink' : ''}" 
              fill="${isShoulders ? '#f472b6' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isShoulders ? '#ff2a85' : 'rgba(148, 163, 184, 0.45)'}"
              stroke-width="0.75"
              filter="${isShoulders ? 'url(#neon-glow-pink)' : 'none'}"/>

        <!-- PEITORAL MAIOR ESCULPIDO COM CONTORNO ORGÂNICO -->
        <path d="M 98 54 C 88 54, 76 57, 67 63 C 65 72, 66 82, 72 88 C 80 92, 91 91, 98 87 Z" 
              class="muscle-zone ${isChest ? 'active-cyan' : ''}" 
              fill="${isChest ? '#38bdf8' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isChest ? '#00f0ff' : 'rgba(148, 163, 184, 0.5)'}"
              stroke-width="0.8"
              filter="${isChest ? 'url(#neon-glow-cyan)' : 'none'}"/>
        <path d="M 102 54 C 112 54, 124 57, 133 63 C 135 72, 134 82, 128 88 C 120 92, 109 91, 102 87 Z" 
              class="muscle-zone ${isChest ? 'active-cyan' : ''}" 
              fill="${isChest ? '#38bdf8' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isChest ? '#00f0ff' : 'rgba(148, 163, 184, 0.5)'}"
              stroke-width="0.8"
              filter="${isChest ? 'url(#neon-glow-cyan)' : 'none'}"/>

        <!-- ABDÔMEN COM DEFINIÇÃO ATALHADA (Linha Alba e 6-Pack Conectado) -->
        <line x1="100" y1="88" x2="100" y2="136" stroke="rgba(148, 163, 184, 0.55)" stroke-width="1.2"/>
        <g class="muscle-zone ${isAbs ? (isBackLats ? 'active-pink' : 'active-cyan') : ''}" 
           filter="${isAbs ? (isBackLats ? 'url(#neon-glow-pink)' : 'url(#neon-glow-cyan)') : 'none'}">
          <!-- Gomo Superior Esquerdo & Direito -->
          <path d="M 89 89 L 98 89 L 98 99 L 89 99 Z" 
                fill="${isAbs ? (isBackLats ? '#fbcfe8' : '#7dd3fc') : 'url(#muscle-inactive-grad)'}" 
                stroke="rgba(148, 163, 184, 0.45)" stroke-width="0.6"/>
          <path d="M 102 89 L 111 89 L 111 99 L 102 99 Z" 
                fill="${isAbs ? (isBackLats ? '#fbcfe8' : '#7dd3fc') : 'url(#muscle-inactive-grad)'}" 
                stroke="rgba(148, 163, 184, 0.45)" stroke-width="0.6"/>
          <!-- Gomo Médio Esquerdo & Direito -->
          <path d="M 88 102 L 98 102 L 98 113 L 88 113 Z" 
                fill="${isAbs ? (isBackLats ? '#fbcfe8' : '#7dd3fc') : 'url(#muscle-inactive-grad)'}" 
                stroke="rgba(148, 163, 184, 0.45)" stroke-width="0.6"/>
          <path d="M 102 102 L 112 102 L 112 113 L 102 113 Z" 
                fill="${isAbs ? (isBackLats ? '#fbcfe8' : '#7dd3fc') : 'url(#muscle-inactive-grad)'}" 
                stroke="rgba(148, 163, 184, 0.45)" stroke-width="0.6"/>
          <!-- Gomo Inferior & Cintura em V -->
          <path d="M 89 116 L 98 116 L 98 128 C 94 130, 91 128, 89 126 Z" 
                fill="${isAbs ? (isBackLats ? '#fbcfe8' : '#7dd3fc') : 'url(#muscle-inactive-grad)'}" 
                stroke="rgba(148, 163, 184, 0.45)" stroke-width="0.6"/>
          <path d="M 102 116 L 111 116 L 111 126 C 109 128, 106 130, 102 128 Z" 
                fill="${isAbs ? (isBackLats ? '#fbcfe8' : '#7dd3fc') : 'url(#muscle-inactive-grad)'}" 
                stroke="rgba(148, 163, 184, 0.45)" stroke-width="0.6"/>
        </g>
        <!-- Linhas Inguinais (Cintura de Apolo) -->
        <path d="M 82 134 C 88 142, 94 148, 98 152" stroke="rgba(148, 163, 184, 0.5)" stroke-width="0.9" fill="none"/>
        <path d="M 118 134 C 112 142, 106 148, 102 152" stroke="rgba(148, 163, 184, 0.5)" stroke-width="0.9" fill="none"/>

        <!-- BÍCEPS ANTERIORES -->
        <path d="M 65 85 C 57 88, 53 99, 54 113 C 57 117, 62 117, 65 113 C 69 103, 69 93, 66 85 Z" 
              class="muscle-zone ${isBiceps ? 'active-pink' : ''}" 
              fill="${isBiceps ? '#f472b6' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isBiceps ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.75"
              filter="${isBiceps ? 'url(#neon-glow-pink)' : 'none'}"/>
        <path d="M 135 85 C 143 88, 147 99, 146 113 C 143 117, 138 117, 135 113 C 131 103, 131 93, 134 85 Z" 
              class="muscle-zone ${isBiceps ? 'active-pink' : ''}" 
              fill="${isBiceps ? '#f472b6' : 'url(#muscle-inactive-grad)'}" 
              stroke="${isBiceps ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.75"
              filter="${isBiceps ? 'url(#neon-glow-pink)' : 'none'}"/>

        <!-- ANTEBRAÇOS -->
        <path d="M 56 120 C 50 128, 48 142, 50 156 C 53 158, 56 157, 57 154 C 59 142, 60 130, 60 121 Z" 
              fill="url(#muscle-inactive-grad)" stroke="rgba(148, 163, 184, 0.35)" stroke-width="0.6"/>
        <path d="M 144 120 C 150 128, 152 142, 150 156 C 147 158, 144 157, 143 154 C 141 142, 140 130, 140 121 Z" 
              fill="url(#muscle-inactive-grad)" stroke="rgba(148, 163, 184, 0.35)" stroke-width="0.6"/>

        <!-- QUADRÍCEPS (Perfeitamente contidos dentro das pernas, sem protuberâncias externas) -->
        <g class="muscle-zone ${isQuads ? 'active-cyan' : ''}" filter="${isQuads ? 'url(#neon-glow-cyan)' : 'none'}">
          <!-- Coxa Esquerda: Vasto Lateral & Reto Femoral -->
          <path d="M 75 152 C 70 170, 70 192, 73 214 C 76 216, 79 214, 79 206 C 77 186, 78 168, 81 152 Z" 
                fill="${isQuads ? '#38bdf8' : 'url(#muscle-inactive-grad)'}" 
                stroke="${isQuads ? '#00f0ff' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.7"/>
          <path d="M 81 153 C 78 172, 78 194, 80 216 C 83 218, 85 217, 85 214 C 85 192, 85 172, 84 153 Z" 
                fill="${isQuads ? '#7dd3fc' : 'url(#muscle-inactive-grad)'}" 
                stroke="${isQuads ? '#00f0ff' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.7"/>
          <!-- Vasto Medial (Gota sobre o joelho, 100% contida dentro da coxa) -->
          <path d="M 85 194 C 84 204, 82 214, 83 219 C 85 221, 87 219, 87 214 C 87 206, 86 198, 85 194 Z" 
                fill="${isQuads ? '#00f0ff' : '#ffffff'}" 
                stroke="${isQuads ? '#00f0ff' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.7"/>

          <!-- Coxa Direita: Vasto Lateral & Reto Femoral -->
          <path d="M 125 152 C 130 170, 130 192, 127 214 C 124 216, 121 214, 121 206 C 123 186, 122 168, 119 152 Z" 
                fill="${isQuads ? '#38bdf8' : 'url(#muscle-inactive-grad)'}" 
                stroke="${isQuads ? '#00f0ff' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.7"/>
          <path d="M 119 153 C 122 172, 122 194, 120 216 C 117 218, 115 217, 115 214 C 115 192, 115 172, 116 153 Z" 
                fill="${isQuads ? '#7dd3fc' : 'url(#muscle-inactive-grad)'}" 
                stroke="${isQuads ? '#00f0ff' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.7"/>
          <!-- Vasto Medial Direita (100% contida dentro da coxa) -->
          <path d="M 115 194 C 116 204, 118 214, 117 219 C 115 221, 113 219, 113 214 C 113 206, 114 198, 115 194 Z" 
                fill="${isQuads ? '#00f0ff' : '#ffffff'}" 
                stroke="${isQuads ? '#00f0ff' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.7"/>
        </g>

        <!-- PATELAS / JOELHOS (Conectados perfeitamente à tíbia) -->
        <ellipse cx="79" cy="222" rx="4" ry="5" fill="#f8fafc" stroke="rgba(148, 163, 184, 0.5)" stroke-width="0.75"/>
        <ellipse cx="121" cy="222" rx="4" ry="5" fill="#f8fafc" stroke="rgba(148, 163, 184, 0.5)" stroke-width="0.75"/>

        <!-- PANTURRILHAS & TIBIAL ANTERIOR (Iniciam imediatamente abaixo do joelho) -->
        <g class="muscle-zone ${targets.calves ? 'active-pink' : ''}" filter="${targets.calves ? 'url(#neon-glow-pink)' : 'none'}">
          <!-- Panturrilha Esquerda -->
          <path d="M 75 228 C 70 242, 69 262, 74 288 C 77 288, 79 284, 78 272 C 76 256, 76 242, 78 228 Z" 
                fill="${targets.calves ? '#fbcfe8' : 'url(#muscle-inactive-grad)'}" 
                stroke="${targets.calves ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.6"/>
          <path d="M 78 228 C 82 242, 85 258, 84 286 C 81 288, 78 286, 78 272 C 77 256, 78 242, 78 228 Z" 
                fill="${targets.calves ? '#fbcfe8' : 'url(#muscle-inactive-grad)'}" 
                stroke="${targets.calves ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.6"/>
          <!-- Panturrilha Direita -->
          <path d="M 125 228 C 130 242, 131 262, 126 288 C 123 288, 121 284, 122 272 C 124 256, 124 242, 122 228 Z" 
                fill="${targets.calves ? '#fbcfe8' : 'url(#muscle-inactive-grad)'}" 
                stroke="${targets.calves ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.6"/>
          <path d="M 122 228 C 118 242, 115 258, 116 286 C 119 288, 122 286, 122 272 C 123 256, 122 242, 122 228 Z" 
                fill="${targets.calves ? '#fbcfe8' : 'url(#muscle-inactive-grad)'}" 
                stroke="${targets.calves ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}" stroke-width="0.6"/>
        </g>
      </svg>
    `;
  }

  // SILHUETA 2: VISTA DORSAL / COSTAS (Grande Dorsal, Trapézio, Tríceps, Glúteos, Isquiotibiais)
  renderBackSvg(targets) {
    const isBackLats = targets.back;
    const isTriceps = targets.triceps;
    const isGlutes = targets.glutes;
    const isHamstrings = targets.hamstrings;
    const isCalves = targets.calves;

    return `
      <svg viewBox="0 0 200 340" class="anatomy-humanoid-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="neon-glow-cyan" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00f0ff" flood-opacity="0.95"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#0ea5e9" flood-opacity="0.75"/>
          </filter>
          <filter id="neon-glow-pink" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ff2a85" flood-opacity="0.95"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#f472b6" flood-opacity="0.75"/>
          </filter>
          <linearGradient id="mannequin-pearl-back" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="45%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="muscle-inactive-grad-back" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
        </defs>

        <!-- 1. BASE DORSAL CONTÍNUA E ESCULPIDA -->
        <path class="mannequin-base-body" d="
          M 100 12 
          C 91 12, 86 18, 86 26 
          C 86 33, 91 39, 94 44 
          C 94 47, 92 49, 89 51 
          C 84 52, 70 56, 56 60 
          C 52 64, 49 72, 51 82 
          C 51 92, 48 106, 50 118 
          C 47 124, 44 138, 47 158 
          C 46 166, 44 174, 47 180 
          C 49 183, 53 182, 54 176 
          C 56 168, 56 162, 56 158 
          C 59 146, 60 132, 60 120 
          C 62 108, 65 96, 71 85 
          C 72 98, 73 112, 80 126 
          C 81 132, 77 140, 75 152 
          C 72 165, 70 188, 73 214 
          C 74 220, 74 226, 75 230 
          C 71 242, 69 262, 74 294 
          C 75 302, 73 310, 72 318 
          C 71 324, 76 325, 83 324 
          C 85 320, 84 310, 84 300 
          C 88 276, 88 252, 84 230 
          C 83 226, 83 220, 84 214 
          C 86 194, 91 176, 99 158 
          C 101 158, 109 176, 114 194 
          C 116 214, 117 220, 116 226 
          C 112 252, 112 276, 116 300 
          C 116 310, 115 320, 117 324 
          C 124 325, 129 324, 128 318 
          C 127 310, 125 302, 126 294 
          C 131 262, 129 242, 125 230 
          C 126 226, 126 220, 127 214 
          C 130 188, 128 165, 125 152 
          C 123 140, 119 132, 120 126 
          C 127 112, 128 98, 129 85 
          C 135 96, 138 108, 140 120 
          C 140 132, 141 146, 144 158 
          C 144 162, 144 168, 146 176 
          C 147 182, 151 183, 153 180 
          C 156 174, 154 166, 153 158 
          C 156 138, 153 124, 150 118 
          C 152 106, 149 92, 149 82 
          C 151 72, 148 64, 144 60 
          C 130 56, 116 52, 111 51 
          C 108 49, 106 47, 106 44 
          C 109 39, 114 33, 114 26 
          C 114 18, 109 12, 100 12 Z" 
          fill="url(#mannequin-pearl-back)" 
          stroke="rgba(148, 163, 184, 0.45)" 
          stroke-width="0.8"/>

        <!-- NUCA E COLUNA POSTERIOR -->
        <line x1="100" y1="36" x2="100" y2="136" stroke="rgba(148, 163, 184, 0.45)" stroke-width="1.2"/>

        <!-- 1. TRAPÉZIO POSTERIOR (DIAMANTE ANATÔMICO PERFEITO) -->
        <path d="M 100 36 C 96 44, 85 52, 73 58 C 76 66, 86 78, 93 88 C 96 92, 99 96, 100 98 C 101 96, 104 92, 107 88 C 114 78, 124 66, 127 58 C 115 52, 104 44, 100 36 Z" 
              class="muscle-zone ${isBackLats ? 'active-pink' : ''}" 
              fill="${isBackLats ? '#f472b6' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isBackLats ? '#ff2a85' : 'rgba(148, 163, 184, 0.45)'}"
              stroke-width="0.8"
              filter="${isBackLats ? 'url(#neon-glow-pink)' : 'none'}"/>

        <!-- 2. DELTÓIDES POSTERIORES (OMBROS POR TRÁS) -->
        <path d="M 72 58 C 64 61, 56 68, 55 78 C 57 84, 64 85, 68 81 C 72 75, 73 66, 72 58 Z" 
              class="muscle-zone ${targets.shoulders || isBackLats ? 'active-pink' : ''}" 
              fill="${targets.shoulders || isBackLats ? '#fbcfe8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${targets.shoulders || isBackLats ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.75"/>
        <path d="M 128 58 C 136 61, 144 68, 145 78 C 143 84, 136 85, 132 81 C 128 75, 127 66, 128 58 Z" 
              class="muscle-zone ${targets.shoulders || isBackLats ? 'active-pink' : ''}" 
              fill="${targets.shoulders || isBackLats ? '#fbcfe8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${targets.shoulders || isBackLats ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.75"/>

        <!-- 3. GRANDE DORSAL (ASAS DAS COSTAS / LATS - 100% DENTRO DO CONTORNO) -->
        <path d="M 71 85 C 72 98, 74 114, 79 126 C 85 130, 93 126, 96 116 L 95 94 C 88 88, 80 85, 71 85 Z" 
              class="muscle-zone ${isBackLats ? 'active-cyan' : ''}" 
              fill="${isBackLats ? '#38bdf8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isBackLats ? '#00f0ff' : 'rgba(148, 163, 184, 0.5)'}"
              stroke-width="0.8"
              filter="${isBackLats ? 'url(#neon-glow-cyan)' : 'none'}"/>
        <path d="M 129 85 C 128 98, 126 114, 121 126 C 115 130, 107 126, 104 116 L 105 94 C 112 88, 120 85, 129 85 Z" 
              class="muscle-zone ${isBackLats ? 'active-cyan' : ''}" 
              fill="${isBackLats ? '#38bdf8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isBackLats ? '#00f0ff' : 'rgba(148, 163, 184, 0.5)'}"
              stroke-width="0.8"
              filter="${isBackLats ? 'url(#neon-glow-cyan)' : 'none'}"/>

        <!-- ERETORES DA ESPINHA & LOMBAR -->
        <path d="M 94 116 L 99 136 L 101 136 L 106 116 Z" fill="rgba(148, 163, 184, 0.3)"/>

        <!-- 4. TRÍCEPS POSTERIOR (FERRADURA ANATÔMICA) -->
        <path d="M 56 80 C 52 92, 51 106, 54 118 C 58 120, 63 120, 66 114 C 68 104, 68 92, 66 82 Z" 
              class="muscle-zone ${isTriceps ? 'active-pink' : ''}" 
              fill="${isTriceps ? '#f472b6' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isTriceps ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.75"
              filter="${isTriceps ? 'url(#neon-glow-pink)' : 'none'}"/>
        <path d="M 144 80 C 148 92, 149 106, 146 118 C 142 120, 137 120, 134 114 C 132 104, 132 92, 134 82 Z" 
              class="muscle-zone ${isTriceps ? 'active-pink' : ''}" 
              fill="${isTriceps ? '#f472b6' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isTriceps ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.75"
              filter="${isTriceps ? 'url(#neon-glow-pink)' : 'none'}"/>

        <!-- 5. GLÚTEOS MÁXIMOS ESCULPIDOS -->
        <path d="M 99 136 C 90 136, 78 139, 76 150 C 74 163, 83 172, 98 170 L 99 148 Z" 
              class="muscle-zone ${isGlutes ? 'active-pink' : ''}" 
              fill="${isGlutes ? '#f472b6' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isGlutes ? '#ff2a85' : 'rgba(148, 163, 184, 0.45)'}"
              stroke-width="0.75"
              filter="${isGlutes ? 'url(#neon-glow-pink)' : 'none'}"/>
        <path d="M 101 136 C 110 136, 122 139, 124 150 C 126 163, 117 172, 102 170 L 101 148 Z" 
              class="muscle-zone ${isGlutes ? 'active-pink' : ''}" 
              fill="${isGlutes ? '#f472b6' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isGlutes ? '#ff2a85' : 'rgba(148, 163, 184, 0.45)'}"
              stroke-width="0.75"
              filter="${isGlutes ? 'url(#neon-glow-pink)' : 'none'}"/>
        <line x1="100" y1="136" x2="100" y2="170" stroke="rgba(148, 163, 184, 0.6)" stroke-width="1.2"/>

        <!-- 6. ISQUIOTIBIAIS (POSTERIORES DE COXA) -->
        <path d="M 76 170 C 72 186, 72 205, 75 220 C 78 224, 83 224, 85 220 C 88 206, 93 190, 97 170 Z" 
              class="muscle-zone ${isHamstrings ? 'active-pink' : ''}" 
              fill="${isHamstrings ? '#fbcfe8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isHamstrings ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.7"
              filter="${isHamstrings ? 'url(#neon-glow-pink)' : 'none'}"/>
        <path d="M 124 170 C 128 186, 128 205, 125 220 C 122 224, 117 224, 115 220 C 112 206, 107 190, 103 170 Z" 
              class="muscle-zone ${isHamstrings ? 'active-pink' : ''}" 
              fill="${isHamstrings ? '#fbcfe8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isHamstrings ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.7"
              filter="${isHamstrings ? 'url(#neon-glow-pink)' : 'none'}"/>

        <!-- FOSSA POPLÍTEA (ATRÁS DO JOELHO) -->
        <ellipse cx="80" cy="225" rx="3.5" ry="4" fill="#cbd5e1"/>
        <ellipse cx="120" cy="225" rx="3.5" ry="4" fill="#cbd5e1"/>

        <!-- 7. PANTURRILHAS POSTERIORES (GASTROCNÊMIO DIAMANTE & TENDÃO DE AQUILES) -->
        <path d="M 78 234 C 70 246, 68 262, 74 278 C 77 284, 80 294, 81 306 L 86 306 C 86 294, 89 283, 91 273 C 94 259, 91 247, 85 234 Z" 
              class="muscle-zone ${isCalves ? 'active-pink' : ''}" 
              fill="${isCalves ? '#fbcfe8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isCalves ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.65"
              filter="${isCalves ? 'url(#neon-glow-pink)' : 'none'}"/>
        <path d="M 122 234 C 130 246, 132 262, 126 278 C 123 284, 120 294, 119 306 L 114 306 C 114 294, 111 283, 109 273 C 106 259, 109 247, 115 234 Z" 
              class="muscle-zone ${isCalves ? 'active-pink' : ''}" 
              fill="${isCalves ? '#fbcfe8' : 'url(#muscle-inactive-grad-back)'}" 
              stroke="${isCalves ? '#ff2a85' : 'rgba(148, 163, 184, 0.4)'}"
              stroke-width="0.65"
              filter="${isCalves ? 'url(#neon-glow-pink)' : 'none'}"/>

        <!-- TENDÃO DE AQUILES & CALCANHARES -->
        <path d="M 81 306 L 81 318 C 78 322, 75 324, 73 322 C 73 318, 75 312, 76 306 Z" fill="#94a3b8"/>
        <path d="M 119 306 L 119 318 C 122 322, 125 324, 127 322 C 127 318, 125 312, 124 306 Z" fill="#94a3b8"/>
      </svg>
    `;
  }
}
