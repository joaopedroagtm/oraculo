// Componente: Manequim Anatômico Cósmico (Holograma Corporal Todo Branco com Aura e Luzes) • AGiTe-Me!
// Renderiza uma silhueta atlética branca sobre aura cósmica, destacando os músculos treinados em azul ciano e rosa bebê.

export class CosmicAnatomyHologram {
  constructor(containerElement, routineFocus = 'legs', exercises = []) {
    this.container = containerElement;
    this.routineFocus = routineFocus;
    this.exercises = exercises;
    this.render();
  }

  update(routineFocus, exercises = []) {
    this.routineFocus = routineFocus;
    this.exercises = exercises;
    this.render();
  }

  detectTargetMuscles() {
    const focus = (this.routineFocus || '').toLowerCase();
    const targeted = {
      chest: false,
      shoulders: false,
      back: false,
      arms: false,
      abs: false,
      quads: false,
      glutes: false,
      calves: false
    };

    // Detecção baseada no foco da rotina ou nos exercícios da sessão
    if (focus.includes('peito') || focus.includes('superior') || focus.includes('push') || focus.includes('alpha')) {
      targeted.chest = true;
      targeted.shoulders = true;
      targeted.arms = true; // tríceps
    }
    if (focus.includes('costas') || focus.includes('pull') || focus.includes('beta')) {
      targeted.back = true;
      targeted.arms = true; // bíceps
      targeted.abs = true;
    }
    if (focus.includes('perna') || focus.includes('inferior') || focus.includes('legs') || focus.includes('gamma')) {
      targeted.quads = true;
      targeted.glutes = true;
      targeted.calves = true;
    }
    if (focus.includes('glúteo') || focus.includes('glute')) {
      targeted.glutes = true;
      targeted.quads = true;
    }
    if (focus.includes('abdômen') || focus.includes('core')) {
      targeted.abs = true;
    }

    // Se houver lista de exercícios, reforça os músculos correspondentes
    if (this.exercises && this.exercises.length > 0) {
      this.exercises.forEach(ex => {
        const id = (ex.exerciseId || '').toLowerCase();
        if (id.includes('supino') || id.includes('crucifixo')) targeted.chest = true;
        if (id.includes('desenvolvimento') || id.includes('elevacao')) targeted.shoulders = true;
        if (id.includes('puxada') || id.includes('remada')) targeted.back = true;
        if (id.includes('triceps') || id.includes('biceps')) targeted.arms = true;
        if (id.includes('leg') || id.includes('extensora') || id.includes('agachamento')) targeted.quads = true;
        if (id.includes('flexora') || id.includes('stiff')) targeted.glutes = true;
        if (id.includes('gemeos') || id.includes('panturrilha')) targeted.calves = true;
        if (id.includes('prancha') || id.includes('infra') || id.includes('abdominal')) targeted.abs = true;
      });
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
        <span class="anatomy-subtitle">Holograma Anatômico Cósmico</span>
      </div>

      <div class="anatomy-stage-wrapper">
        <!-- Aura Luminosa de Fundo (Rosa Bebê e Ciano Neon) -->
        <div class="anatomy-aura-layer"></div>

        <!-- Silhueta Humanoide Atlética em Branco Perolado com Zonas Anatômicas Harmoniosas -->
        <svg viewBox="0 0 200 340" class="anatomy-humanoid-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="neon-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#38bdf8" flood-opacity="0.95"/>
              <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="#0ea5e9" flood-opacity="0.65"/>
            </filter>
            <filter id="neon-glow-pink" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#fbcfe8" flood-opacity="0.95"/>
              <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="#f472b6" flood-opacity="0.75"/>
            </filter>
            <radialGradient id="body-white-gradient" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="65%" stop-color="#f1f5f9"/>
              <stop offset="100%" stop-color="#cbd5e1"/>
            </radialGradient>
          </defs>

          <!-- 1. CABEÇA & PESCOÇO HARMONIOSOS -->
          <ellipse cx="100" cy="24" rx="12" ry="16" fill="url(#body-white-gradient)" stroke="#ffffff" stroke-width="0.8"/>
          <!-- Queixo e Mandíbula Suave -->
          <path d="M 92 34 C 95 40, 105 40, 108 34 Z" fill="url(#body-white-gradient)"/>
          <!-- Pescoço -->
          <path d="M 94 37 C 94 48, 92 50, 89 54 L 111 54 C 108 50, 106 48, 106 37 Z" fill="url(#body-white-gradient)" opacity="0.95"/>

          <!-- 2. TRAPÉZIO & COSTAS SUPERIORES -->
          <path d="M 92 42 C 86 46, 76 52, 68 58 L 74 61 C 82 56, 92 48, 95 44 Z" 
                class="muscle-zone ${targets.back ? 'active-cyan' : ''}" 
                fill="${targets.back ? '#38bdf8' : '#e2e8f0'}" 
                filter="${targets.back ? 'url(#neon-glow-cyan)' : 'none'}"/>
          <path d="M 108 42 C 114 46, 124 52, 132 58 L 126 61 C 118 56, 108 48, 105 44 Z" 
                class="muscle-zone ${targets.back ? 'active-cyan' : ''}" 
                fill="${targets.back ? '#38bdf8' : '#e2e8f0'}" 
                filter="${targets.back ? 'url(#neon-glow-cyan)' : 'none'}"/>

          <!-- 3. DELTÓIDES (OMBROS ATLÉTICOS ARREDONDADOS) -->
          <!-- Ombro Esquerdo -->
          <path d="M 68 58 C 59 62, 54 70, 56 80 C 58 86, 65 87, 70 82 C 73 76, 74 68, 73 61 Z" 
                class="muscle-zone ${targets.shoulders ? 'active-cyan' : ''}" 
                fill="${targets.shoulders ? '#38bdf8' : 'url(#body-white-gradient)'}" 
                filter="${targets.shoulders ? 'url(#neon-glow-cyan)' : 'none'}"/>
          <!-- Ombro Direito -->
          <path d="M 132 58 C 141 62, 146 70, 144 80 C 142 86, 135 87, 130 82 C 127 76, 126 68, 127 61 Z" 
                class="muscle-zone ${targets.shoulders ? 'active-cyan' : ''}" 
                fill="${targets.shoulders ? '#38bdf8' : 'url(#body-white-gradient)'}" 
                filter="${targets.shoulders ? 'url(#neon-glow-cyan)' : 'none'}"/>

          <!-- 4. PEITORAL (CURVATURA ESCULPIDA DE PEITORAL MAIOR) -->
          <!-- Peito Esquerdo -->
          <path d="M 98 58 C 88 59, 78 62, 73 65 C 72 73, 74 83, 78 88 C 84 92, 94 91, 98 87 Z" 
                class="muscle-zone ${targets.chest ? 'active-pink' : ''}" 
                fill="${targets.chest ? '#fbcfe8' : 'url(#body-white-gradient)'}" 
                filter="${targets.chest ? 'url(#neon-glow-pink)' : 'none'}"/>
          <!-- Peito Direito -->
          <path d="M 102 58 C 112 59, 122 62, 127 65 C 128 73, 126 83, 122 88 C 116 92, 106 91, 102 87 Z" 
                class="muscle-zone ${targets.chest ? 'active-pink' : ''}" 
                fill="${targets.chest ? '#fbcfe8' : 'url(#body-white-gradient)'}" 
                filter="${targets.chest ? 'url(#neon-glow-pink)' : 'none'}"/>
          <!-- Linha do Esterno Cêntrica -->
          <line x1="100" y1="58" x2="100" y2="88" stroke="rgba(203, 213, 225, 0.45)" stroke-width="0.8"/>

          <!-- 5. ABDÔMEN / CORE (6-PACK ATLÉTICO & CINTURA V-TAPER) -->
          <g class="muscle-zone ${targets.abs ? 'active-cyan' : ''}" filter="${targets.abs ? 'url(#neon-glow-cyan)' : 'none'}">
            <!-- Gominhos Superiores -->
            <path d="M 88 91 L 98 91 L 98 102 L 88 101 C 87 97, 87 94, 88 91 Z" 
                  fill="${targets.abs ? '#38bdf8' : '#f8fafc'}"/>
            <path d="M 102 91 L 112 91 C 113 94, 113 97, 112 101 L 102 102 L 102 91 Z" 
                  fill="${targets.abs ? '#38bdf8' : '#f8fafc'}"/>
            <!-- Gominhos Médios -->
            <path d="M 87 104 L 98 104 L 98 116 L 87 115 C 86 111, 86 107, 87 104 Z" 
                  fill="${targets.abs ? '#38bdf8' : '#f1f5f9'}"/>
            <path d="M 102 104 L 113 104 C 114 107, 114 111, 113 115 L 102 116 L 102 104 Z" 
                  fill="${targets.abs ? '#38bdf8' : '#f1f5f9'}"/>
            <!-- Gominhos Inferiores & V-Taper Cut -->
            <path d="M 87 118 L 98 118 L 98 133 C 94 134, 91 132, 87 128 C 86 124, 86 121, 87 118 Z" 
                  fill="${targets.abs ? '#38bdf8' : '#e2e8f0'}"/>
            <path d="M 102 118 L 113 118 C 114 121, 114 124, 113 128 C 109 132, 106 134, 102 133 L 102 118 Z" 
                  fill="${targets.abs ? '#38bdf8' : '#e2e8f0'}"/>
          </g>
          <!-- Oblíquos / Flancos Laterais da Cintura -->
          <path d="M 76 86 C 79 96, 81 110, 79 126 C 83 131, 86 134, 86 134 L 86 116 C 85 102, 80 93, 76 86 Z" 
                fill="${targets.abs ? '#7dd3fc' : '#e2e8f0'}" opacity="0.85"/>
          <path d="M 124 86 C 121 96, 119 110, 121 126 C 117 131, 114 134, 114 134 L 114 116 C 115 102, 120 93, 124 86 Z" 
                fill="${targets.abs ? '#7dd3fc' : '#e2e8f0'}" opacity="0.85"/>

          <!-- 6. BRAÇOS (BÍCEPS, TRÍCEPS E ANTEBRAÇOS CURVADOS) -->
          <!-- Braço Esquerdo (Bíceps) -->
          <path d="M 58 80 C 53 92, 51 106, 54 118 C 58 122, 64 122, 67 117 C 71 105, 70 91, 67 82 Z" 
                class="muscle-zone ${targets.arms ? 'active-pink' : ''}" 
                fill="${targets.arms ? '#fbcfe8' : 'url(#body-white-gradient)'}" 
                filter="${targets.arms ? 'url(#neon-glow-pink)' : 'none'}"/>
          <!-- Antebraço Esquerdo & Mão -->
          <path d="M 54 119 C 49 131, 46 148, 48 162 C 50 166, 55 166, 58 162 C 62 150, 64 134, 66 120 Z" 
                class="muscle-zone ${targets.arms ? 'active-pink' : ''}" 
                fill="${targets.arms ? '#fbcfe8' : 'url(#body-white-gradient)'}"/>
          <path d="M 48 163 C 46 170, 47 177, 51 181 C 54 181, 56 174, 57 164 Z" fill="#cbd5e1"/>

          <!-- Braço Direito (Bíceps) -->
          <path d="M 142 80 C 147 92, 149 106, 146 118 C 142 122, 136 122, 133 117 C 129 105, 130 91, 133 82 Z" 
                class="muscle-zone ${targets.arms ? 'active-pink' : ''}" 
                fill="${targets.arms ? '#fbcfe8' : 'url(#body-white-gradient)'}" 
                filter="${targets.arms ? 'url(#neon-glow-pink)' : 'none'}"/>
          <!-- Antebraço Direito & Mão -->
          <path d="M 146 119 C 151 131, 154 148, 152 162 C 150 166, 145 166, 142 162 C 138 150, 136 134, 134 120 Z" 
                class="muscle-zone ${targets.arms ? 'active-pink' : ''}" 
                fill="${targets.arms ? '#fbcfe8' : 'url(#body-white-gradient)'}"/>
          <path d="M 152 163 C 154 170, 153 177, 149 181 C 146 181, 144 174, 143 164 Z" fill="#cbd5e1"/>

          <!-- 7. QUADRIL & GLÚTEOS (PELVE ATLÉTICA) -->
          <!-- Glúteo/Quadril Esquerdo -->
          <path d="M 85 133 C 82 140, 78 148, 78 156 C 83 163, 93 165, 98 162 L 98 134 C 93 135, 89 134, 85 133 Z" 
                class="muscle-zone ${targets.glutes ? 'active-pink' : ''}" 
                fill="${targets.glutes ? '#fbcfe8' : '#f8fafc'}" 
                filter="${targets.glutes ? 'url(#neon-glow-pink)' : 'none'}"/>
          <!-- Glúteo/Quadril Direito -->
          <path d="M 115 133 C 118 140, 122 148, 122 156 C 117 163, 107 165, 102 162 L 102 134 C 107 135, 111 134, 115 133 Z" 
                class="muscle-zone ${targets.glutes ? 'active-pink' : ''}" 
                fill="${targets.glutes ? '#fbcfe8' : '#f8fafc'}" 
                filter="${targets.glutes ? 'url(#neon-glow-pink)' : 'none'}"/>

          <!-- 8. QUADRÍCEPS (COXAS COM SWEEP LATERAL & GOTA VASTO MEDIAL) -->
          <!-- Perna Esquerda (Quadríceps Principal) -->
          <path d="M 78 157 C 71 170, 69 190, 72 212 C 73 221, 79 227, 82 229 C 85 229, 87 225, 87 220 C 87 199, 93 180, 97 163 C 90 164, 83 162, 78 157 Z" 
                class="muscle-zone ${targets.quads ? 'active-cyan' : ''}" 
                fill="${targets.quads ? '#38bdf8' : 'url(#body-white-gradient)'}" 
                filter="${targets.quads ? 'url(#neon-glow-cyan)' : 'none'}"/>
          <!-- Vasto Medial Esquerdo (A "Gota" acima do joelho) -->
          <path d="M 86 204 C 88 203, 93 206, 94 213 C 94 221, 89 227, 85 229 C 85 225, 85 214, 86 204 Z" 
                class="muscle-zone ${targets.quads ? 'active-cyan' : ''}" 
                fill="${targets.quads ? '#7dd3fc' : '#ffffff'}"/>

          <!-- Perna Direita (Quadríceps Principal) -->
          <path d="M 122 157 C 129 170, 131 190, 128 212 C 127 221, 121 227, 118 229 C 115 229, 113 225, 113 220 C 113 199, 107 180, 103 163 C 110 164, 117 162, 122 157 Z" 
                class="muscle-zone ${targets.quads ? 'active-cyan' : ''}" 
                fill="${targets.quads ? '#38bdf8' : 'url(#body-white-gradient)'}" 
                filter="${targets.quads ? 'url(#neon-glow-cyan)' : 'none'}"/>
          <!-- Vasto Medial Direito (A "Gota" acima do joelho) -->
          <path d="M 114 204 C 112 203, 107 206, 106 213 C 106 221, 111 227, 115 229 C 115 225, 115 214, 114 204 Z" 
                class="muscle-zone ${targets.quads ? 'active-cyan' : ''}" 
                fill="${targets.quads ? '#7dd3fc' : '#ffffff'}"/>

          <!-- 9. JOELHOS (PÁTELAS DISCRETAS & NATURAIS) -->
          <ellipse cx="84" cy="232" rx="4.5" ry="5" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
          <ellipse cx="116" cy="232" rx="4.5" ry="5" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>

          <!-- 10. PANTURRILHAS (ESCULTURA EM DIAMANTE & TENDÃO DE AQUILES) -->
          <!-- Panturrilha Esquerda -->
          <path d="M 80 236 C 74 245, 72 258, 75 272 C 77 280, 82 293, 82 307 L 87 307 C 87 295, 91 283, 92 273 C 94 259, 92 247, 88 236 Z" 
                class="muscle-zone ${targets.calves ? 'active-pink' : ''}" 
                fill="${targets.calves ? '#fbcfe8' : 'url(#body-white-gradient)'}" 
                filter="${targets.calves ? 'url(#neon-glow-pink)' : 'none'}"/>
          <!-- Panturrilha Direita -->
          <path d="M 120 236 C 126 245, 128 258, 125 272 C 123 280, 118 293, 118 307 L 113 307 C 113 295, 109 283, 108 273 C 106 259, 108 247, 112 236 Z" 
                class="muscle-zone ${targets.calves ? 'active-pink' : ''}" 
                fill="${targets.calves ? '#fbcfe8' : 'url(#body-white-gradient)'}" 
                filter="${targets.calves ? 'url(#neon-glow-pink)' : 'none'}"/>

          <!-- 11. PÉS & BASE ATUALIZADA -->
          <path d="M 80 308 C 77 315, 75 321, 74 324 C 77 326, 87 326, 89 322 C 88 317, 87 312, 87 308 Z" fill="#cbd5e1"/>
          <path d="M 120 308 C 123 315, 125 321, 126 324 C 123 326, 113 326, 111 322 C 112 317, 113 312, 113 308 Z" fill="#cbd5e1"/>
        </svg>

        <!-- Legenda de Foco com Efeitos de Neon -->
        <div class="anatomy-legend-column">
          <div class="anatomy-badge-pill ${targets.quads || targets.chest || targets.shoulders ? 'active-cyan-pill' : ''}">
            <span class="dot-cyan">●</span>
            <span>${targets.quads ? 'Quadríceps (Ciano)' : targets.chest ? 'Peitoral (Ciano)' : targets.back ? 'Costas (Ciano)' : 'Primário'}</span>
          </div>
          <div class="anatomy-badge-pill ${targets.glutes || targets.arms || targets.calves ? 'active-pink-pill' : ''}">
            <span class="dot-pink">●</span>
            <span>${targets.glutes ? 'Glúteos (Rosa Bebê)' : targets.arms ? 'Braços (Rosa Bebê)' : targets.shoulders ? 'Ombros (Rosa Bebê)' : 'Sinergista'}</span>
          </div>
          <div class="anatomy-energy-status">
            ⚡ Ativação Muscular em Tempo Real
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(wrapper);
  }
}
