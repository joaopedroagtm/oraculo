// Componente: Santuário 3D das Colunas Gregas & Ciclo Lunar
// chamas sagradas, mini-luas místicas e fases lunares da constância.

import { sound } from '../services/audio.js';

export function renderLunarPhaseSVG(phaseIdx, size = 34) {
  const uid = `lunar-svg-${phaseIdx}-${Math.round(size)}`;
  return `
    <div class="lunar-svg-orb" style="width: ${size}px; height: ${size}px;">
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <defs>
          <filter id="glow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#ffffff" flood-opacity="0.65"/>
          </filter>
          <radialGradient id="dark-side-${uid}" cx="40%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="70%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <radialGradient id="light-side-${uid}" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="70%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </radialGradient>
          <linearGradient id="rim-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.6"/>
          </linearGradient>
        </defs>

        ${phaseIdx === 0 ? `
          <!-- Lua Nova: Corpo Escuro com Halo e Arco de Luz -->
          <circle cx="50" cy="50" r="46" fill="url(#dark-side-${uid})" stroke="url(#rim-${uid})" stroke-width="1.8" />
          <path d="M 50 4 A 46 46 0 0 0 50 96 A 42 46 0 0 1 50 4" fill="#ffffff" opacity="0.5" filter="url(#glow-${uid})" />
          <circle cx="36" cy="38" r="7" fill="#334155" opacity="0.4" />
          <circle cx="62" cy="34" r="10" fill="#1e293b" opacity="0.5" />
          <circle cx="54" cy="65" r="11" fill="#1e293b" opacity="0.4" />
        ` : phaseIdx === 1 ? `
          <!-- Quarto Crescente: Metade Direita Iluminada -->
          <circle cx="50" cy="50" r="46" fill="url(#dark-side-${uid})" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
          <path d="M 50 4 A 46 46 0 0 1 50 96 Z" fill="url(#light-side-${uid})" filter="url(#glow-${uid})" />
          <circle cx="35" cy="40" r="7" fill="#334155" opacity="0.35" />
          <circle cx="68" cy="45" r="9" fill="#cbd5e1" opacity="0.45" />
          <circle cx="60" cy="68" r="8" fill="#cbd5e1" opacity="0.4" />
        ` : phaseIdx === 2 ? `
          <!-- Lua Cheia: Plenamente Iluminada Radiante -->
          <circle cx="50" cy="50" r="46" fill="url(#light-side-${uid})" filter="url(#glow-${uid})" stroke="#ffffff" stroke-width="1" />
          <circle cx="34" cy="38" r="8" fill="#cbd5e1" opacity="0.55" />
          <circle cx="64" cy="32" r="11" fill="#94a3b8" opacity="0.4" />
          <circle cx="58" cy="65" r="13" fill="#cbd5e1" opacity="0.5" />
          <circle cx="32" cy="68" r="7" fill="#94a3b8" opacity="0.35" />
        ` : `
          <!-- Quarto Minguante: Metade Esquerda Iluminada -->
          <circle cx="50" cy="50" r="46" fill="url(#dark-side-${uid})" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
          <path d="M 50 4 A 46 46 0 0 0 50 96 Z" fill="url(#light-side-${uid})" filter="url(#glow-${uid})" />
          <circle cx="32" cy="45" r="9" fill="#cbd5e1" opacity="0.45" />
          <circle cx="40" cy="68" r="8" fill="#cbd5e1" opacity="0.4" />
          <circle cx="65" cy="40" r="7" fill="#334155" opacity="0.35" />
        `}
      </svg>
    </div>
  `;
}

export class WorkoutHeatmap {
  constructor(containerElement, activeDaysSet = new Set(), history = []) {
    this.container = containerElement;
    this.activeDaysSet = activeDaysSet;
    this.history = history;
    this.selectedDayIndex = null;
    this.selectedLunarPhaseIndex = null;
    this.render();
  }

  update(activeDaysSet, history) {
    this.activeDaysSet = activeDaysSet;
    this.history = history;
    this.render();
  }

  getWeekDates() {
    const now = new Date();
    const day = now.getDay(); // 0 Dom, 1 Seg...
    // Semana começa na Segunda-feira (1) até Domingo (0)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const week = [];
    const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
    const dayFullNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

    const todayStr = now.toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isPast = d < now && !isToday;
      const isFuture = d > now && !isToday;

      week.push({
        index: i,
        shortName: dayNames[i],
        fullName: dayFullNames[i],
        dateObj: d,
        dateStr: dateStr,
        dayNum: d.getDate(),
        monthStr: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        isToday,
        isPast,
        isFuture,
        isCompleted: this.activeDaysSet.has(dateStr),
        workouts: this.history.filter(h => h.date === dateStr)
      });
    }

    return week;
  }

  getMonthlyLunarPhases() {
    // Calcula o status das 4 semanas do mês corrente
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDayOfMonth = now.getDate();
    const currentWeekIdx = Math.min(3, Math.floor((currentDayOfMonth - 1) / 7));
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

    const phases = [
      {
        name: 'Semana I (1-7)',
        phase: 'Lua Nova',
        icon: '🌑',
        desc: 'Fundação da Força & Conexão Neural',
        threshold: 2,
        coaching: 'Início do ciclo: foque na execução impecável, calibragem de cargas e recuperação neural.'
      },
      {
        name: 'Semana II (8-14)',
        phase: 'Quarto Crescente',
        icon: '🌓',
        desc: 'Elevação da Carga & Sobrecarga Progressiva',
        threshold: 3,
        coaching: 'Fase de expansão: aumente ligeiramente as cargas ou adicione 1-2 repetições em séries chave.'
      },
      {
        name: 'Semana III (15-21)',
        phase: 'Lua Cheia',
        icon: '🌕',
        desc: 'Pico de Intensidade & Energia Cósmica Máxima',
        threshold: 3,
        coaching: 'Ápice mensal: energia no pico. Busque seus melhores recordes de volume com segurança.'
      },
      {
        name: 'Semana IV (22+)',
        phase: 'Quarto Minguante',
        icon: '🌘',
        desc: 'Consolidação, Densidade & Aço',
        threshold: 3,
        coaching: 'Fechamento do ciclo: consolide a força conquistada e prepare o corpo para o próximo mês.'
      }
    ];

    // Conta treinos por semana do mês
    const workoutsInMonth = this.history.filter(h => {
      if (!h.date) return false;
      const d = new Date(h.date + 'T00:00:00');
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const weekCounts = [0, 0, 0, 0];
    workoutsInMonth.forEach(w => {
      const dayOfMonth = new Date(w.date + 'T00:00:00').getDate();
      const weekIdx = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
      weekCounts[weekIdx]++;
    });

    return {
      monthLabel: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      currentWeekIdx,
      phases: phases.map((p, idx) => ({
        ...p,
        count: weekCounts[idx],
        isCurrentWeek: idx === currentWeekIdx,
        isAchieved: weekCounts[idx] >= p.threshold
      }))
    };
  }

  render() {
    this.container.innerHTML = '';

    const weekDays = this.getWeekDates();
    const completedCount = weekDays.filter(d => d.isCompleted).length;
    const lunarData = this.getMonthlyLunarPhases();

    // Dia selecionado padrão: hoje ou o mais recente completado
    if (this.selectedDayIndex === null) {
      const todayIdx = weekDays.findIndex(d => d.isToday);
      this.selectedDayIndex = todayIdx !== -1 ? todayIdx : 0;
    }

    if (this.selectedLunarPhaseIndex === null) {
      this.selectedLunarPhaseIndex = lunarData.currentWeekIdx;
    }

    const selectedDay = weekDays[this.selectedDayIndex] || weekDays[0];

    const card = document.createElement('section');
    card.className = 'stone-panel sanctuary-colonnade-card';

    card.innerHTML = `
      <!-- Cabeçalho do Santuário 3D -->
      <div class="sanctuary-header">
        <div class="sanctuary-title-group">
          <div class="sanctuary-icon-glow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 9.5L12 4l10 5.5v1H2v-1z" />
              <line x1="6" y1="11" x2="6" y2="18" />
              <line x1="12" y1="11" x2="12" y2="18" />
              <line x1="18" y1="11" x2="18" y2="18" />
              <line x1="2" y1="21" x2="22" y2="21" />
            </svg>
          </div>
          <div>
            <h3 class="sanctuary-title">SANTUÁRIO DOS PILARES SEMANAIS</h3>
            <p class="sanctuary-subtitle">7 Pilares Semanais • Cada pilar erguido é um treino concluído</p>
          </div>
        </div>
        <div class="sanctuary-streak-tag">
          <span class="pillars-counter-flame" style="display: inline-flex; align-items: center;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; filter: drop-shadow(0 0 4px rgba(249,115,22,0.8));">
              <defs>
                <linearGradient id="heatStreakFlame" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#ef4444" />
                  <stop offset="50%" stop-color="#f97316" />
                  <stop offset="100%" stop-color="#fbbf24" />
                </linearGradient>
              </defs>
              <path d="M12 2C9.5 5.5 8 8.5 8 11.5c0 1.2.3 2.3.8 3.2-1.3-.8-2.3-2.1-2.8-3.7C4.8 12.5 4 14.7 4 17c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-2.5-7.5-5-10.5-.5 2-1.5 3.5-3 4.5.3-2.5 0-5.5-2-9z" fill="url(#heatStreakFlame)"/>
              <path d="M12 14c-1.5 1.5-2 3-2 4.5 0 2.2 1.8 3.5 3 3.5s3-1.3 3-3.5c0-1.8-1-3.2-2-4.5-.5-.7-1.5-.7-2 0z" fill="#fef08a" opacity="0.95"/>
            </svg>
          </span>
          <span class="pillars-counter-val">${completedCount}/7</span>
          <span class="pillars-counter-label">ERGUIDOS</span>
        </div>
      </div>

      <!-- Palco 3D da Colunata com Profundidade e Perspectiva -->
      <div class="colonnade-3d-stage-wrapper">
        <div class="colonnade-3d-ground">
          ${weekDays.map(day => {
      const isSelected = day.index === this.selectedDayIndex;
      return `
              <div 
                class="greek-pillar-column ${day.isCompleted ? 'pillar-elevated' : 'pillar-dormant'} ${day.isToday ? 'pillar-is-today' : ''} ${isSelected ? 'pillar-inspected' : ''}" 
                data-day-index="${day.index}"
                tabindex="0"
                role="button"
                aria-label="Pilar de ${day.fullName}, ${day.isCompleted ? 'erguido com treino concluído' : 'repouso'}"
              >
                <!-- Chama Cósmica / Mini-Lua Flutuante no Topo -->
                <div class="pillar-celestial-crown">
                  ${day.isCompleted ? `
                    <div class="pillar-flame-orb" title="Treino Concluído!">
                      <span class="flame-inner" style="display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#fef08a" />
                          <circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="1.5" />
                        </svg>
                      </span>
                      <div class="flame-aura"></div>
                    </div>
                  ` : day.isToday ? `
                    <div class="pillar-beacon-pulse" title="Erga este pilar hoje!">
                      <span class="beacon-spark"></span>
                    </div>
                  ` : `
                    <div class="pillar-rest-star">
                      <span class="rest-dot">•</span>
                    </div>
                  `}
                </div>

                <!-- Capitel Jônico Esculpido em Mármore -->
                <div class="pillar-capital">
                  <div class="capital-abacus"></div>
                  <div class="capital-echinus">
                    <span class="volute-left"></span>
                    <span class="volute-center"></span>
                    <span class="volute-right"></span>
                  </div>
                </div>

                <!-- Fuste da Coluna com Sulcos Canelados 3D -->
                <div class="pillar-shaft">
                  <div class="fluting-line"></div>
                  <div class="fluting-line"></div>
                  <div class="fluting-line"></div>
                  <div class="fluting-line"></div>
                  ${day.isCompleted ? '<div class="pillar-cosmic-glow"></div>' : ''}
                </div>

                <!-- Plinto / Base Arquitetônica de Mármore -->
                <div class="pillar-base">
                  <div class="base-torus"></div>
                  <div class="base-plinth"></div>
                </div>

                <!-- Rótulo do Dia -->
                <div class="pillar-label-box">
                  <span class="pillar-day-name">${day.shortName}</span>
                  <span class="pillar-day-number">${day.dayNum}</span>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>

      <!-- Painel de Inspeção do Pilar Selecionado -->
      <div class="pillar-oracle-detail stone-panel-inner" id="pillar-inspector">
        <div class="inspector-badge-row">
          <span class="inspector-day-tag" style="display: inline-flex; align-items: center; gap: 5px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 9.5L12 4l10 5.5v1H2v-1z" />
              <line x1="6" y1="11" x2="6" y2="18" />
              <line x1="12" y1="11" x2="12" y2="18" />
              <line x1="18" y1="11" x2="18" y2="18" />
            </svg>
            PILAR DE ${selectedDay.fullName.toUpperCase()} (${selectedDay.dayNum} ${selectedDay.monthStr.toUpperCase()})
          </span>
          ${selectedDay.isCompleted ? `
            <span class="inspector-status-pill completed">✓ TREINO CONCLUÍDO</span>
          ` : selectedDay.isToday ? `
            <span class="inspector-status-pill ready">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px; filter: drop-shadow(0 0 3px currentColor);">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>AGUARDANDO TREINO HOJE
            </span>
          ` : `
            <span class="inspector-status-pill rest" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              REPOUSO DO GUERREIRO
            </span>
          `}
        </div>
        <p class="inspector-text">
          ${selectedDay.isCompleted ? `
            <strong>✓ Treino Concluído:</strong> Você realizou e registrou ${selectedDay.workouts.length} sessão(ões) neste dia. Este pilar está erguido e sua constância semanal fortalecida!
          ` : selectedDay.isToday ? `
            <strong>Pilar de Hoje:</strong> Inicie e conclua sua sessão de treino hoje para erguer esta coluna com chamas sagradas no templo!
          ` : selectedDay.isFuture ? `
            <strong>Pilar Futuro:</strong> O santuário aguarda a sua jornada para os próximos dias da semana.
          ` : `
            <strong>Descanso & Recuperação:</strong> Dia de repouso dos tecidos musculares (ou sem treino registrado). O descanso reconstrói as fibras para o próximo treino.
          `}
        </p>
      </div>

      <!-- Ciclo Lunar de Constância (4 Fases Lunares do Mês) -->
      <div class="lunar-phases-section">
        <div class="lunar-phases-header">
          <span class="lunar-header-title" style="display: inline-flex; align-items: center; gap: 7px;">
            ${renderLunarPhaseSVG(2, 20)} CICLO LUNAR • ${lunarData.monthLabel}
          </span>
          <span class="lunar-header-sub">Toque em uma fase para ver foco e metas</span>
        </div>
        <div class="lunar-phases-track">
          ${lunarData.phases.map((phase, pIdx) => {
      const isSelected = pIdx === this.selectedLunarPhaseIndex;
      return `
              <div 
                class="lunar-phase-pod ${phase.isAchieved ? 'pod-consecrated' : ''} ${phase.isCurrentWeek ? 'pod-current-week' : ''} ${isSelected ? 'pod-selected' : ''}"
                data-lunar-index="${pIdx}"
                tabindex="0"
                role="button"
                title="Toque para ver foco da ${phase.phase}"
              >
                <div class="lunar-orb-glow">
                  ${renderLunarPhaseSVG(pIdx, 36)}
                </div>
                <div class="lunar-pod-info">
                  <div class="lunar-pod-name">${phase.name}</div>
                  ${phase.isCurrentWeek ? '<span class="current-week-tag">ATUAL</span>' : ''}
                  <div class="lunar-pod-status">
                    ${phase.isAchieved ? '✓ Meta Concluída' : `${phase.count}/${phase.threshold} treinos`}
                  </div>
                </div>
              </div>
            `;
    }).join('')}
        </div>

        <!-- Painel Interativo de Detalhes da Fase Lunar Selecionada -->
        <div id="lunar-phase-inspector" class="lunar-inspector-card"></div>
      </div>
    `;

    this.container.appendChild(card);
    this.updateLunarInspector(lunarData.phases[this.selectedLunarPhaseIndex]);
    this.bindEvents(weekDays, lunarData);
  }

  bindEvents(weekDays, lunarData) {
    // 1. Pilares Gregos
    const pillarElements = this.container.querySelectorAll('.greek-pillar-column');
    pillarElements.forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-day-index'), 10);
        if (!isNaN(idx) && idx !== this.selectedDayIndex) {
          this.selectedDayIndex = idx;
          this.updateInspector(weekDays[idx]);

          pillarElements.forEach(p => p.classList.remove('pillar-inspected'));
          el.classList.add('pillar-inspected');

          sound.playTapSound();
          if ('vibrate' in navigator) navigator.vibrate(25);
        }
      });
    });

    // 2. Fases Lunares Clicáveis
    const lunarPods = this.container.querySelectorAll('.lunar-phase-pod');
    lunarPods.forEach(pod => {
      pod.addEventListener('click', () => {
        const idx = parseInt(pod.getAttribute('data-lunar-index'), 10);
        if (!isNaN(idx) && idx !== this.selectedLunarPhaseIndex) {
          this.selectedLunarPhaseIndex = idx;
          lunarPods.forEach(p => p.classList.remove('pod-selected'));
          pod.classList.add('pod-selected');

          const freshLunarData = this.getMonthlyLunarPhases();
          this.updateLunarInspector(freshLunarData.phases[idx]);

          sound.playTapSound();
          if ('vibrate' in navigator) navigator.vibrate(30);
        }
      });
    });
  }

  updateInspector(day) {
    const inspector = this.container.querySelector('#pillar-inspector');
    if (!inspector) return;

    inspector.innerHTML = `
      <div class="inspector-badge-row">
        <span class="inspector-day-tag" style="display: inline-flex; align-items: center; gap: 5px;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 9.5L12 4l10 5.5v1H2v-1z" />
            <line x1="6" y1="11" x2="6" y2="18" />
            <line x1="12" y1="11" x2="12" y2="18" />
            <line x1="18" y1="11" x2="18" y2="18" />
          </svg>
          PILAR DE ${day.fullName.toUpperCase()} (${day.dayNum} ${day.monthStr.toUpperCase()})
        </span>
        ${day.isCompleted ? `
          <span class="inspector-status-pill completed">✓ TREINO CONCLUÍDO</span>
        ` : day.isToday ? `
          <span class="inspector-status-pill ready">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px; filter: drop-shadow(0 0 3px currentColor);">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>AGUARDANDO TREINO HOJE
          </span>
        ` : `
          <span class="inspector-status-pill rest" style="display: inline-flex; align-items: center; gap: 4px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            REPOUSO DO GUERREIRO
          </span>
        `}
      </div>
      <p class="inspector-text">
        ${day.isCompleted ? `
          <strong>✓ Treino Concluído:</strong> Você realizou e registrou ${day.workouts.length} sessão(ões) neste dia. Este pilar está erguido e sua constância semanal fortalecida!
        ` : day.isToday ? `
          <strong>Pilar de Hoje:</strong> Inicie e conclua sua sessão de treino hoje para erguer esta coluna com chamas sagradas no templo!
        ` : day.isFuture ? `
          <strong>Pilar Futuro:</strong> O santuário aguarda a sua jornada para os próximos dias da semana.
        ` : `
          <strong>Descanso & Recuperação:</strong> Dia de repouso dos tecidos musculares (ou sem treino registrado). O descanso reconstrói as fibras para o próximo treino.
        `}
      </p>
    `;
  }

  updateLunarInspector(phase) {
    const inspector = this.container.querySelector('#lunar-phase-inspector');
    if (!inspector || !phase) return;

    const progressPct = Math.min(100, Math.round((phase.count / phase.threshold) * 100));

    inspector.innerHTML = `
      <div class="lunar-inspector-header">
        <div class="lunar-inspector-title">
          <div style="flex-shrink: 0; filter: drop-shadow(0 0 12px rgba(255,255,255,0.35));">
            ${renderLunarPhaseSVG(this.selectedLunarPhaseIndex, 46)}
          </div>
          <div>
            <div class="lunar-inspector-name">${phase.phase} • ${phase.name}</div>
            <div class="lunar-inspector-focus">${phase.desc}</div>
          </div>
        </div>
        <span class="lunar-inspector-badge ${phase.isAchieved ? 'achieved' : 'pending'}">
          ${phase.isAchieved ? '✓ META CONCLUÍDA' : `${phase.count}/${phase.threshold} TREINOS`}
        </span>
      </div>

      <div class="lunar-progress-track">
        <div class="lunar-progress-fill" style="width: ${progressPct}%;"></div>
      </div>

      <div class="lunar-coaching-box">
        <span class="coaching-spark" style="display: inline-flex; align-items: center; justify-content: center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18h6"/>
            <path d="M10 22h4"/>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
          </svg>
        </span>
        <p class="coaching-text">${phase.coaching}</p>
      </div>
    `;
  }
}

