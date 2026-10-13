// Controlador Principal • AGiTe-Me! (agtm!)
// Estética Etérea 90s, Greco-Alien, Minimalista & Mobile-First

import confetti from 'canvas-confetti';
import { EXERCISES, MUSCLE_GROUPS } from './data/exercises.js';
import { DEFAULT_ROUTINES, getNextRoutine } from './data/routines.js';
import { StorageService } from './services/storage.js';
import { sound } from './services/audio.js';
import { GeminiService } from './services/gemini.js';
import { SupabaseService } from './services/supabase.js';
import { CelestialMoon } from './components/moon.js';
import { WorkoutHeatmap } from './components/heatmap.js';
import { WorkoutStopwatch, RestTimerModal } from './components/timer.js';
import { getAstronomicalMoonPhase } from './utils/lunar.js';
import { CosmicAnatomyHologram } from './components/anatomy.js';

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
  let c = (hex || '#38bdf8').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return { h: 200, s: 95, l: 55 };
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }
  return { h: Math.round(h || 0), s: Math.round(s * 100), l: Math.round(l * 100) };
}

class AgiteMeApp {
  constructor() {
    this.currentTab = 'templo';
    if (localStorage.getItem('agtm_active_slug') === 'marco') {
      StorageService.switchUser('joao');
    }
    this.profile = StorageService.getProfile();
    this.activeSession = StorageService.getActiveSession();
    this.stopwatch = null;
    this.restTimer = new RestTimerModal();
    this.moonInstance = null;
    this.supabaseUser = null;
    this.currentOracleTab = 'chat';

    this.init();
  }

  init() {
    this.setupStopwatch();
    this.bindNavigation();
    this.setupDrawerMenu();
    this.setupHeaderTimerLink();
    this.setupHeaderStreakLink();
    this.setupHeaderAvatar();
    this.initSupabaseAuth();
    this.updateHeaderStreak();

    // Se usuário nunca preencheu perfil, abre onboarding
    if (!this.profile.isOnboarded) {
      this.openOnboardingModal();
    }

    this.renderCurrentTab();
  }

  setupStopwatch() {
    this.stopwatch = new WorkoutStopwatch((formattedTime, elapsedSeconds) => {
      // Atualiza mostradores de cronômetro no DOM se existirem
      const timerDisplay = document.querySelector('#active-timer-display');
      if (timerDisplay) {
        timerDisplay.textContent = formattedTime;
      }

      // Atualiza mini-cronômetro no topo do header (Live Activity / Dynamic Island)
      const headerTimer = document.querySelector('#header-live-timer');
      const headerDigits = document.querySelector('#header-timer-digits');
      if (headerTimer && headerDigits) {
        headerTimer.style.display = 'inline-flex';
        headerDigits.textContent = formattedTime;
      }

      // Salva progresso da sessão ativa periodicamente
      if (this.activeSession) {
        this.activeSession.elapsedSeconds = elapsedSeconds;
        StorageService.saveActiveSession(this.activeSession);
      }
    });

    // Se já havia sessão ativa em andamento ao abrir o app
    if (this.activeSession) {
      this.stopwatch.start(this.activeSession.elapsedSeconds || 0, this.activeSession.startTime);
      if (this.activeSession.isPaused) {
        this.stopwatch.pause();
      }
      this.updateStopwatchDisplayUI(!this.activeSession.isPaused);

      const headerTimer = document.querySelector('#header-live-timer');
      if (headerTimer) {
        headerTimer.style.display = 'inline-flex';
      }
    }
  }

  bindNavigation() {
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    this.renderCurrentTab();
  }

  updateHeaderStreak() {
    const stats = StorageService.getStats();
    const streakCount = document.querySelector('#header-streak-count');
    if (streakCount) {
      streakCount.textContent = stats.currentStreak;
    }
  }

  renderCurrentTab() {
    const content = document.querySelector('#app-content');
    content.scrollTop = 0;

    switch (this.currentTab) {
      case 'templo':
        this.renderTemploView(content);
        break;
      case 'treino':
        this.renderTreinoView(content);
        break;
      case 'exercicios':
        this.renderExerciciosView(content);
        break;
      case 'historico':
        this.renderHistoricoView(content);
        break;
      case 'oraculo':
        this.renderOraculoView(content);
        break;
      default:
        this.renderTemploView(content);
    }
  }

  setupHeaderTimerLink() {
    const headerTimer = document.querySelector('#header-live-timer');
    if (headerTimer) {
      headerTimer.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentTab === 'treino' && this.activeSession) {
          const isRunning = this.stopwatch.toggle();
          this.activeSession.isPaused = !isRunning;
          StorageService.saveActiveSession(this.activeSession);
          this.updateStopwatchDisplayUI(isRunning);
          try {
            sound.playTapSound();
            if ('vibrate' in navigator) navigator.vibrate(50);
          } catch (_) { }
        } else {
          this.switchTab('treino');
        }
      });
    }
  }

  setupHeaderStreakLink() {
    const streakPill = document.querySelector('#header-streak-pill');
    if (streakPill) {
      streakPill.style.cursor = 'pointer';
      streakPill.addEventListener('click', () => {
        sound.playTapSound();
        if ('vibrate' in navigator) navigator.vibrate([40, 30, 60]);

        // Feedback de animação de explosão de chamas celestiais
        streakPill.classList.add('streak-flare-pop');
        setTimeout(() => streakPill.classList.remove('streak-flare-pop'), 600);

        // Navega diretamente para a aba de Streaks (historico)
        this.switchTab('historico');
      });
    }
  }

  updateHeaderAvatar() {
    const ring = document.querySelector('#header-avatar-ring');
    const img = document.querySelector('#header-avatar-img');
    const initialsEl = document.querySelector('#header-avatar-initials');
    if (!ring) return;

    const aura = this.profile.auraColor || '#38bdf8';
    ring.style.background = aura;
    ring.style.boxShadow = `0 0 14px ${aura}`;

    if (this.profile.avatarUrl && this.profile.avatarUrl.trim().length > 10) {
      if (img) {
        img.src = this.profile.avatarUrl;
        img.style.display = 'block';
      }
      if (initialsEl) initialsEl.style.display = 'none';
    } else {
      if (img) img.style.display = 'none';
      if (initialsEl) {
        const parts = (this.profile.name || 'Guerreiro').trim().split(/\s+/);
        const initials = parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : (parts[0][0] || 'G').toUpperCase();
        initialsEl.textContent = initials;
        initialsEl.style.display = 'block';
      }
    }

    this.updateDrawerHeaderSubtitle();
  }

  updateDrawerHeaderSubtitle() {
    const subtitleEl = document.querySelector('#drawer-header-subtitle') || document.querySelector('.drawer-subtitle');
    if (subtitleEl) {
      const p = this.profile || StorageService.getProfile();
      const rawName = (p && p.name) ? p.name.trim() : '';
      const firstName = rawName ? rawName.split(/\s+/)[0] : 'você';
      subtitleEl.textContent = `Espaço pra focar no seu corpo, ${firstName}`;
    }
  }

  setupHeaderAvatar() {
    this.updateHeaderAvatar();

    const avatarSlot = document.querySelector('#header-avatar-slot');
    const fileInput = document.querySelector('#header-avatar-file-input');

    if (avatarSlot) {
      avatarSlot.addEventListener('click', () => {
        sound.playTapSound();
        this.openProfileManagerModal();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
          sound.playTapSound();
          const compressedDataUrl = await SupabaseService.compressImageFile(file);
          this.profile.avatarUrl = compressedDataUrl;
          StorageService.saveProfile(this.profile);

          if (this.supabaseUser) {
            await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
          }

          this.updateHeaderAvatar();
          this.renderCurrentTab();
          sound.playCheckSound();
          alert('Foto do guerreiro atualizada com aura cósmica!');
        } catch (err) {
          console.error('Erro ao processar foto:', err);
          alert('Não foi possível carregar a imagem. Tente outra foto da sua galeria.');
        } finally {
          fileInput.value = '';
        }
      });
    }
  }

  async initSupabaseAuth() {
    try {
      const session = await SupabaseService.getCurrentSession();
      if (session?.user) {
        this.supabaseUser = session.user;
        const remoteProfile = await SupabaseService.getProfile(this.supabaseUser.id);
        if (remoteProfile) {
          this.profile = {
            ...this.profile,
            name: remoteProfile.name || this.profile.name,
            age: remoteProfile.age || this.profile.age,
            weight: remoteProfile.weight || this.profile.weight,
            height: remoteProfile.height || this.profile.height,
            goal: remoteProfile.goal || this.profile.goal,
            auraColor: remoteProfile.aura_color || this.profile.auraColor,
            avatarUrl: remoteProfile.avatar_url || this.profile.avatarUrl,
            geminiApiKey: remoteProfile.gemini_api_key || this.profile.geminiApiKey
          };
          StorageService.saveProfile(this.profile);
        }
        this.updateHeaderAvatar();
        this.updateHeaderStreak();
      }
    } catch (err) {
      console.warn('Supabase auth inicialização:', err);
    }
  }

  setupDrawerMenu() {
    const btnMenu = document.querySelector('#btn-header-menu');
    const overlay = document.querySelector('#drawer-overlay');
    const btnClose = document.querySelector('#btn-drawer-close');
    const profileSnippet = document.querySelector('#drawer-profile-snippet');
    const btnDemo = document.querySelector('#drawer-btn-demo');
    const btnExport = document.querySelector('#drawer-btn-export');
    const btnImport = document.querySelector('#drawer-btn-import');

    if (!btnMenu || !overlay) return;

    const openDrawer = () => {
      this.updateDrawerHeaderSubtitle();
      const profile = StorageService.getProfile();
      const stats = StorageService.getStats();
      const aura = profile.auraColor || '#38bdf8';
      if (profileSnippet) {
        profileSnippet.innerHTML = `
          <div class="drawer-user-card" id="drawer-user-card" style="cursor: pointer;" title="Toque para abrir perfil e aura">
            <div class="drawer-user-avatar-slot" style="position: relative; width: 38px; height: 38px; flex-shrink: 0;">
              <div style="position: absolute; inset: -2px; border-radius: 50%; background: ${aura}; filter: blur(4px); opacity: 0.7;"></div>
              <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: #0f172a; border: 1.5px solid ${aura}; display: flex; align-items: center; justify-content: center;">
                ${profile.avatarUrl
            ? `<img src="${profile.avatarUrl}" alt="${profile.name}" style="width: 100%; height: 100%; object-fit: cover;" />`
            : `<span style="font-family: var(--font-hud); font-size: 0.95rem; color: #fff; font-weight: 700;">${(profile.name || 'G')[0].toUpperCase()}</span>`}
              </div>
            </div>
            <div class="drawer-user-meta" style="flex: 1; min-width: 0;">
              <div class="drawer-user-name">${profile.name || 'Guerreiro Cósmico'}</div>
              <div class="drawer-user-stats" style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #ffffff; display: inline-flex; align-items: center; gap: 3px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/></svg>
                  ${stats.currentStreak}d
                </span>
                <span style="color: var(--concrete-500);">•</span>
                <span>${stats.totalWorkouts} treinos</span>
              </div>
            </div>
          </div>
        `;
        const card = profileSnippet.querySelector('#drawer-user-card');
        if (card) {
          card.addEventListener('click', () => {
            closeDrawer();
            this.openProfileManagerModal();
          });
        }
      }

      // Sincroniza a aba ativa no menu drawer com o dock inferior
      document.querySelectorAll('[data-drawer-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-drawer-tab') === this.currentTab);
      });

      overlay.classList.add('active');
    };

    const closeDrawer = () => {
      overlay.classList.remove('active');
    };

    btnMenu.addEventListener('click', openDrawer);
    if (btnClose) btnClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDrawer();
    });

    document.querySelectorAll('[data-drawer-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-drawer-tab');
        this.switchTab(tab);
        closeDrawer();
      });
    });

    if (btnDemo) {
      btnDemo.addEventListener('click', () => {
        if (confirm('Carregar histórico de treinos simulados para demonstrar streaks e gráficos?')) {
          StorageService.loadDemoData();
          closeDrawer();
          this.profile = StorageService.getProfile();
          this.updateHeaderStreak();
          this.updateHeaderAvatar();
          this.renderCurrentTab();
          alert('Demonstração carregada com sucesso!');
        }
      });
    }

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        StorageService.exportData();
        closeDrawer();
      });
    }

    if (btnImport) {
      btnImport.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const success = StorageService.importData(event.target.result);
              if (success) {
                this.profile = StorageService.getProfile();
                this.updateHeaderStreak();
                this.updateHeaderAvatar();
                alert('Dados importados com sucesso!');
                this.switchTab('templo');
              } else {
                alert('Arquivo de backup inválido.');
              }
            };
            reader.readAsText(file);
          }
        };
        fileInput.click();
        closeDrawer();
      });
    }
  }

  // ==========================================
  // VIEW 1: TEMPLO (HOME)
  // ==========================================
  renderTemploView(container) {
    const stats = StorageService.getStats();
    const history = StorageService.getHistory();
    const nextRoutine = getNextRoutine(history);
    const hasActiveWorkout = !!this.activeSession;
    const lunar = getAstronomicalMoonPhase(new Date());

    container.innerHTML = `
      <!-- Palco Celestial: Lua com Fase Astronômica Real e Saudação Cósmica -->
      <section class="templo-celestial-stage">
        <div class="celestial-moon-col">
          <div id="moon-mount-point"></div>
        </div>
        <div class="celestial-stage-info">
          <div class="celestial-stage-badge">
            <span class="badge-spark">${lunar.phaseIcon}</span>
            <span>${lunar.phaseName.toUpperCase()} • ${lunar.illuminationPercent}% ILUMINADA</span>
          </div>
          <h2 class="celestial-stage-title">${lunar.cosmicBlessing}</h2>
          <span class="celestial-stage-hint"></span>
        </div>
      </section>

      <!-- Banner Oráculo com Espaçamento Amplo, Liquid Glass e Troca Dinâmica -->
      <section class="energy-oracle-banner">
        <div class="oracle-banner-header">
          <div class="oracle-tag-group">
            <span class="oracle-icon-quote" style="display: inline-flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--baby-pink)" style="filter: drop-shadow(0 0 6px var(--baby-pink));">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </span>
            <span class="oracle-quote-tag">MENSAGEM PARA VOCÊ</span>
          </div>
          <button class="oracle-cycle-btn" id="btn-refresh-oracle" type="button" title="Invocar novo ensinamento">
            <span class="cycle-arrow">↺</span>
            <span class="cycle-label">Nova profecia</span>
          </button>
        </div>
        <div class="oracle-quote-text" id="templo-oracle-quote">
          ${GeminiService.getOracleDailyWisdom()}
        </div>
      </section>

      <!-- Métricas Rápidas com Furta-Cor e Noite Cósmica -->
      <div class="stats-grid-row">
        <div class="stat-metric-card">
          <div class="stat-metric-val" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; filter: drop-shadow(0 0 4px rgba(249,115,22,0.8)); flex-shrink: 0;">
              <defs>
                <linearGradient id="temploStreakFlame" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#ef4444" />
                  <stop offset="50%" stop-color="#f97316" />
                  <stop offset="100%" stop-color="#fbbf24" />
                </linearGradient>
              </defs>
              <path d="M12 2C9.5 5.5 8 8.5 8 11.5c0 1.2.3 2.3.8 3.2-1.3-.8-2.3-2.1-2.8-3.7C4.8 12.5 4 14.7 4 17c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-2.5-7.5-5-10.5-.5 2-1.5 3.5-3 4.5.3-2.5 0-5.5-2-9z" fill="url(#temploStreakFlame)"/>
              <path d="M12 14c-1.5 1.5-2 3-2 4.5 0 2.2 1.8 3.5 3 3.5s3-1.3 3-3.5c0-1.8-1-3.2-2-4.5-.5-.7-1.5-.7-2 0z" fill="#fef08a" opacity="0.95"/>
            </svg>
            <span style="background: var(--rainbow-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% 200%; animation: rainbow-move 4s ease infinite;">${stats.currentStreak}</span>
          </div>
          <div class="stat-metric-lbl">Dias Seguidos</div>
        </div>
        <div class="stat-metric-card">
          <div class="stat-metric-val" style="color: var(--night-blue-accent);">${stats.totalWorkouts}</div>
          <div class="stat-metric-lbl">Treinos Batidos</div>
        </div>
        <div class="stat-metric-card">
          <div class="stat-metric-val">${(stats.totalVolumeKg / 1000).toFixed(1)}t</div>
          <div class="stat-metric-lbl">Toneladas Carga</div>
        </div>
      </div>

      <!-- Card do Portal Hero (Treino do Dia) -->
      <section class="hero-portal-card">
        <div class="portal-arch-glow"></div>
        <div class="portal-tag-row">
          <span class="portal-code">${nextRoutine.code}</span>
          <span class="portal-duration">⏱️ ~${nextRoutine.durationMin} min</span>
        </div>
        <h2 class="portal-title">${nextRoutine.title}</h2>
        <div class="portal-focus">Foco: ${nextRoutine.focus}</div>

        <div class="portal-preview-list">
          ${nextRoutine.exercises.map(item => {
      const exData = EXERCISES.find(e => e.id === item.exerciseId) || { name: item.exerciseId };
      return `
              <div class="preview-item">
                <span class="ex-name">🏛️ ${exData.name}</span>
                <span class="ex-sets">${item.sets}x ${item.reps}</span>
              </div>
            `;
    }).join('')}
        </div>

        <button class="btn-enter-temple" id="btn-start-or-resume">
          ${hasActiveWorkout ? 'RETOMAR TREINO ATIVO' : 'BATER PONTO & INICIAR TREINO'}
        </button>
      </section>

      <!-- Santuário 3D das Colunas Gregas & Ciclo Lunar -->
      <div id="home-heatmap-mount"></div>
    `;

    // Monta a Lua Branca Interativa
    const moonMount = container.querySelector('#moon-mount-point');
    if (moonMount) {
      new CelestialMoon(moonMount);
    }

    // Monta a Colunata 3D e Ciclo Lunar
    const heatMount = container.querySelector('#home-heatmap-mount');
    if (heatMount) {
      new WorkoutHeatmap(heatMount, stats.activeDaysSet, history);
    }

    // Botão de Trocar/Atualizar Ensinamento do Oráculo
    const refreshOracleBtn = container.querySelector('#btn-refresh-oracle');
    if (refreshOracleBtn) {
      refreshOracleBtn.addEventListener('click', () => {
        const quoteEl = container.querySelector('#templo-oracle-quote');
        if (quoteEl) {
          quoteEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          quoteEl.style.opacity = '0';
          quoteEl.style.transform = 'translateY(6px)';
          setTimeout(() => {
            quoteEl.textContent = GeminiService.getRandomOracleWisdom(quoteEl.textContent);
            quoteEl.style.opacity = '1';
            quoteEl.style.transform = 'translateY(0)';
          }, 250);
        }
      });
    }

    // Ação do Botão Começar/Retomar
    container.querySelector('#btn-start-or-resume').addEventListener('click', () => {
      if (!this.activeSession) {
        this.startWorkoutSession(nextRoutine);
      }
      this.switchTab('treino');
    });
  }

  // ==========================================
  // VIEW 2: TREINO ATIVO & CRONÔMETRO
  // ==========================================
  renderTreinoView(container) {
    if (!this.activeSession) {
      // Nenhum treino em andamento: exibe seletor de rotina para iniciar
      container.innerHTML = `
        <div style="padding: 24px 18px; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🏛️</div>
          <h2 style="font-family: var(--font-carved); font-size: 1.4rem; color: #fff; margin-bottom: 6px;">PORTAIS DE TREINO</h2>
          <p style="font-size: 0.85rem; color: var(--concrete-300); margin-bottom: 24px;">
            Escolha o portal do dia para iniciar o cronômetro cósmico.
          </p>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${DEFAULT_ROUTINES.map(routine => `
              <div class="stone-panel" style="text-align: left; cursor: pointer; border-left: 3px solid ${routine.color};" data-routine-id="${routine.id}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="portal-code" style="color: ${routine.color}; border-color: ${routine.color};">${routine.code}</span>
                  <span style="font-size: 0.75rem; color: var(--concrete-400);">⏱️ ~${routine.durationMin} min</span>
                </div>
                <h3 style="font-family: var(--font-carved); font-size: 1.1rem; color: #fff; margin-bottom: 4px;">${routine.title}</h3>
                <p style="font-size: 0.8rem; color: var(--concrete-300); margin-bottom: 12px;">${routine.description}</p>
                <button class="btn-enter-temple" style="padding: 10px 14px; font-size: 0.85rem;" data-start-routine="${routine.id}">
                  INICIAR ESTE PORTAL ⚡
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('[data-start-routine]').forEach(btn => {
        btn.addEventListener('click', () => {
          const rId = btn.getAttribute('data-start-routine');
          const picked = DEFAULT_ROUTINES.find(r => r.id === rId);
          this.startWorkoutSession(picked);
          this.renderTreinoView(container);
        });
      });
      return;
    }

    // Treino Ativo em Andamento!
    const session = this.activeSession;
    const isRunning = this.stopwatch ? this.stopwatch.isRunning : true;

    container.innerHTML = `
      <!-- Header Fixo com Cronômetro Tátil Interativo -->
      <div class="active-workout-header">
        <div class="stopwatch-display ${isRunning ? '' : 'is-paused'}" id="btn-toggle-stopwatch" title="Toque para pausar ou continuar o cronômetro">
          <div class="stopwatch-meta-row">
            <span class="stopwatch-pulse-indicator"></span>
            <span class="stopwatch-label" id="stopwatch-label-text">${isRunning ? 'TEMPO DECORRIDO' : 'TOQUE P/ RETOMAR'}</span>
          </div>
          <div class="stopwatch-clock-row">
            <span class="stopwatch-digits" id="active-timer-display">${this.stopwatch.getFormattedTime()}</span>
            <span class="stopwatch-state-badge ${isRunning ? 'running' : 'paused'}" id="stopwatch-state-badge">
              ${isRunning ? '▶ ATIVO' : '⏸ PAUSADO'}
            </span>
          </div>
        </div>
        <button class="btn-finish-workout" id="btn-finish-workout">
          CHECK-OUT
        </button>
      </div>

      <div style="padding: 14px 18px 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-family: var(--font-carved); font-size: 1.15rem; color: #fff;">${session.routineTitle}</h2>
          <span class="portal-code">${session.routineCode}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--baby-pink); margin-top: 2px;">
          Foco: ${session.routineFocus}
        </div>
      </div>

      <!-- Holograma Anatômico Cósmico de Ativação Muscular -->
      <div id="workout-anatomy-mount" style="padding: 4px 18px 12px;"></div>

      <!-- Lista de Exercícios Ativos -->
      <div class="workout-exercise-list">
        ${session.exercises.map((item, exIndex) => {
      const exData = EXERCISES.find(e => e.id === item.exerciseId) || {
        name: item.exerciseName || 'Exercício Personalizado',
        equipment: item.exerciseEquipment || 'Halteres/Máquina',
        muscleLabel: 'Músculo Alvo'
      };

      const displayName = item.exerciseName || exData.name;
      const displayEquip = item.exerciseEquipment || exData.equipment;
      const allSetsDone = item.setsData.every(s => s.completed);

      return `
            <div class="exercise-card ${allSetsDone ? 'completed' : ''}" id="exercise-card-${exIndex}">
              <div class="exercise-card-header">
                <div class="exercise-title-row">
                  <h3 class="exercise-name">${displayName}</h3>
                  <div class="exercise-header-actions">
                    <button class="btn-exercise-guide" data-view-exercise="${item.exerciseId}">
                      📖 Como Fazer
                    </button>
                    <button class="btn-oracle-swap" data-swap-exercise="${exIndex}">
                      🔮 Trocar com IA
                    </button>
                  </div>
                </div>
                <div class="exercise-sub-row">
                  <span class="muscle-tag">🎯 ${exData.muscleLabel}</span>
                  <span class="equip-tag">⚡ ${displayEquip}</span>
                </div>
              </div>

              <!-- Tabela de Séries -->
              <div class="sets-table">
                <div class="set-row-header">
                  <span>SÉRIE</span>
                  <span>CARGA (KG)</span>
                  <span>REPS</span>
                  <span>CHECK</span>
                </div>

                ${item.setsData.map((setData, setIndex) => `
                  <div class="set-row ${setData.completed ? 'is-done' : ''}" id="set-row-${exIndex}-${setIndex}">
                    <span class="set-number">${setIndex + 1}</span>
                    <div class="set-input-box">
                      <input 
                        type="number" 
                        class="set-input" 
                        value="${setData.weight}" 
                        data-weight-ex="${exIndex}" 
                        data-weight-set="${setIndex}" 
                        min="0" 
                        step="1"
                      />
                      <span class="set-unit">kg</span>
                    </div>
                    <div class="set-input-box">
                      <input 
                        type="text" 
                        class="set-input" 
                        value="${setData.reps}" 
                        data-reps-ex="${exIndex}" 
                        data-reps-set="${setIndex}" 
                      />
                    </div>
                    <button 
                      class="set-check-btn ${setData.completed ? 'done' : ''}" 
                      data-check-ex="${exIndex}" 
                      data-check-set="${setIndex}"
                    >
                      ✓
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;

    // Monta o Holograma Anatômico no contêiner
    const anatomyMount = container.querySelector('#workout-anatomy-mount');
    if (anatomyMount) {
      new CosmicAnatomyHologram(anatomyMount, session.routineFocus, session.exercises);
    }

    // Conectar Eventos dos Inputs, Cronômetro e Botões
    this.bindActiveWorkoutEvents(container);
    this.updateStopwatchDisplayUI(isRunning);
  }

  updateStopwatchDisplayUI(isRunning) {
    const btn = document.querySelector('#btn-toggle-stopwatch');
    if (btn) {
      btn.classList.toggle('is-paused', !isRunning);
      const label = btn.querySelector('#stopwatch-label-text');
      if (label) {
        label.textContent = isRunning ? 'TEMPO DECORRIDO' : 'TOQUE P/ RETOMAR';
      }
      const badge = btn.querySelector('#stopwatch-state-badge');
      if (badge) {
        badge.textContent = isRunning ? '▶ ATIVO' : '⏸ PAUSADO';
        badge.className = `stopwatch-state-badge ${isRunning ? 'running' : 'paused'}`;
      }
    }

    const headerTimer = document.querySelector('#header-live-timer');
    if (headerTimer) {
      headerTimer.classList.toggle('is-paused', !isRunning);
      const icon = headerTimer.querySelector('.live-timer-icon');
      if (icon) {
        icon.textContent = isRunning ? '⏱️' : '⏸️';
      }
      headerTimer.title = isRunning ? 'Treino em andamento • Toque para pausar' : 'Treino pausado • Toque para retomar';
    }

    const dockTreinoLabel = document.querySelector('#dock-treino-label');
    if (dockTreinoLabel && this.activeSession) {
      dockTreinoLabel.innerHTML = isRunning
        ? 'Treino <span style="color:#38bdf8">●</span>'
        : 'Treino <span style="color:var(--baby-pink)">●</span>';
    }
  }

  bindActiveWorkoutEvents(container) {
    // 0. Toque Interativo no Cronômetro para Pausar / Continuar
    const stopwatchBtn = container.querySelector('#btn-toggle-stopwatch');
    if (stopwatchBtn) {
      stopwatchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isRunning = this.stopwatch.toggle();
        this.activeSession.isPaused = !isRunning;
        StorageService.saveActiveSession(this.activeSession);
        this.updateStopwatchDisplayUI(isRunning);
        try {
          sound.playTapSound();
          if ('vibrate' in navigator) navigator.vibrate(50);
        } catch (_) { }
      });
    }

    // 1. Marcação de Série Concluída & Disparo do Timer de Descanso
    container.querySelectorAll('[data-check-ex]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exIdx = parseInt(btn.getAttribute('data-check-ex'), 10);
        const setIdx = parseInt(btn.getAttribute('data-check-set'), 10);
        const targetSet = this.activeSession.exercises[exIdx].setsData[setIdx];

        targetSet.completed = !targetSet.completed;

        if (targetSet.completed) {
          sound.playCheckSound();
          if ('vibrate' in navigator) navigator.vibrate(60);
          // Dispara o Timer de Descanso Automático (padrão 60s ou do exercício)
          const restSec = this.activeSession.exercises[exIdx].restSec || 60;
          this.restTimer.start(restSec);
        }

        StorageService.saveActiveSession(this.activeSession);
        this.renderTreinoView(container);
      });
    });

    // 2. Atualização de Cargas e Reps nos Inputs
    container.querySelectorAll('[data-weight-ex]').forEach(input => {
      input.addEventListener('change', (e) => {
        const exIdx = parseInt(input.getAttribute('data-weight-ex'), 10);
        const setIdx = parseInt(input.getAttribute('data-weight-set'), 10);
        this.activeSession.exercises[exIdx].setsData[setIdx].weight = parseFloat(e.target.value) || 0;
        StorageService.saveActiveSession(this.activeSession);
      });
    });

    container.querySelectorAll('[data-reps-ex]').forEach(input => {
      input.addEventListener('change', (e) => {
        const exIdx = parseInt(input.getAttribute('data-reps-ex'), 10);
        const setIdx = parseInt(input.getAttribute('data-reps-set'), 10);
        this.activeSession.exercises[exIdx].setsData[setIdx].reps = e.target.value;
        StorageService.saveActiveSession(this.activeSession);
      });
    });

    // 3. Ver Guia / Demonstração do Exercício
    container.querySelectorAll('[data-view-exercise]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.getAttribute('data-view-exercise');
        const exObj = EXERCISES.find(e => e.id === exId);
        if (exObj) {
          this.openExerciseModal(exObj);
        }
      });
    });

    // 4. Substituir Exercício com IA Gemini em Modal Específico
    container.querySelectorAll('[data-swap-exercise]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exIdx = parseInt(btn.getAttribute('data-swap-exercise'), 10);
        const currentExItem = this.activeSession.exercises[exIdx];
        const exObj = EXERCISES.find(e => e.id === currentExItem.exerciseId) || {
          name: currentExItem.exerciseName || 'Exercício',
          muscle: 'pernas',
          muscleLabel: 'Membros Inferiores',
          equipment: currentExItem.exerciseEquipment || 'Máquina'
        };

        this.openExerciseSwapModal(exIdx, currentExItem, exObj, container);
      });
    });

    // 5. Finalizar Treino (Check-out com Modal Elegante In-App)
    const finishBtn = container.querySelector('#btn-finish-workout');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.openCheckoutConfirmModal();
      });
    }
  }

  // Modal de Confirmação In-App do Check-out (Sem alertas nativos de navegador)
  openCheckoutConfirmModal() {
    const modalContainer = document.querySelector('#modal-container');
    const title = this.activeSession?.routineTitle || 'Treino Cósmico';

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="checkout-confirm-overlay">
        <div class="modal-sheet stone-panel checkout-celebration-card" style="text-align: center; max-width: 380px;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🏁</div>
          <h2 class="celebration-title" style="margin-bottom: 6px;">FAZER CHECK-OUT?</h2>
          <div class="celebration-subtitle" style="margin-bottom: 16px;">
            Deseja finalizar o <strong>${title}</strong>, registrar as cargas e consagrar seu Streak?
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
            <button class="btn-enter-temple" id="btn-confirm-checkout" style="padding: 13px; font-size: 0.88rem;">
              ✓ SIM, CONSAGRAR TREINO!
            </button>
            <button class="btn-exercise-guide" id="btn-cancel-checkout" style="justify-content: center; padding: 10px;">
              ✕ Continuar Treinando
            </button>
          </div>
        </div>
      </div>
    `;

    const closeConfirm = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#btn-cancel-checkout').addEventListener('click', closeConfirm);
    modalContainer.querySelector('#checkout-confirm-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'checkout-confirm-overlay') closeConfirm();
    });

    modalContainer.querySelector('#btn-confirm-checkout').addEventListener('click', () => {
      closeConfirm();
      this.finishWorkoutSession();
    });
  }

  // Modal Interativo de Substituição com IA Gemini
  openExerciseSwapModal(exIdx, currentExItem, exObj, container) {
    const modalContainer = document.querySelector('#modal-container');
    const currentName = currentExItem.exerciseName || exObj.name;
    const currentEquip = currentExItem.exerciseEquipment || exObj.equipment;

    // Renderiza o modal em estado inicial de carregamento com orbe cósmico
    modalContainer.innerHTML = `
      <div class="modal-overlay" id="swap-exercise-overlay">
        <div class="swap-modal-sheet">
          <div class="modal-handle-bar"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">🔮</span>
              <div>
                <h3 style="font-family: var(--font-hud); font-size: 0.85rem; color: #fff; letter-spacing: 1.2px; text-transform: uppercase; margin: 0;">
                  ORÁCULO DE SUBSTITUIÇÃO
                </h3>
                <small style="color: var(--baby-pink); font-size: 0.68rem;">Adaptação Inteligente com IA</small>
              </div>
            </div>
            <button id="btn-close-swap-modal" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <div id="swap-modal-content">
            <div class="swap-modal-loading">
              <div class="swap-orb-pulse"></div>
              <div style="font-size: 0.88rem; color: #ffffff; font-weight: 600;">Sintonizando frequências cósmicas...</div>
              <div style="font-size: 0.74rem; color: var(--concrete-300);">Calculando alternativa biomecânica para "${currentName}"</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#btn-close-swap-modal').addEventListener('click', close);
    modalContainer.querySelector('#swap-exercise-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'swap-exercise-overlay') close();
    });

    // Executa a consulta ao GeminiService de forma assíncrona
    GeminiService.substituteExercise(exObj, this.profile, this.profile.geminiApiKey).then(suggestion => {
      const contentEl = modalContainer.querySelector('#swap-modal-content');
      if (!contentEl) return;

      contentEl.innerHTML = `
        <div class="swap-card-comparison">
          <div class="swap-box-current">
            <span class="swap-label-tag">EXERCÍCIO ATUAL</span>
            <div class="swap-item-name">${currentName}</div>
            <div class="swap-item-equip">Aparelho: ${currentEquip}</div>
          </div>

          <div class="swap-box-suggested">
            <span class="swap-label-tag">✨ SUGESTÃO DO ORÁCULO</span>
            <div class="swap-item-name" style="color: var(--baby-pink);">${suggestion.alternativeName}</div>
            <div class="swap-item-equip">Aparelho / Acessório: ${suggestion.equipment}</div>
          </div>
        </div>

        <div class="swap-reason-box">
          <div class="swap-reason-title">🧠 ANÁLISE BIOMECÂNICA:</div>
          <div class="swap-reason-text">${suggestion.reason}</div>
        </div>

        ${suggestion.instructions ? `
          <div style="margin-bottom: 14px; padding: 10px 12px; background: rgba(15, 23, 42, 0.5); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="font-size: 0.68rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">COMO EXECUTAR A ALTERNATIVA:</div>
            <div style="font-size: 0.78rem; color: #f1f5f9;">${suggestion.instructions}</div>
          </div>
        ` : ''}

        <div class="swap-quote-box">
          ${suggestion.oracleQuote}
        </div>

        <div class="swap-modal-actions">
          <button class="btn-enter-temple" id="btn-apply-swap" style="padding: 12px; font-size: 0.85rem;">
            ✓ CONFIRMAR SUBSTITUIÇÃO NO TREINO
          </button>
          <button class="btn-exercise-guide" id="btn-cancel-swap" style="justify-content: center; padding: 10px;">
            ✕ Manter Exercício Atual
          </button>
        </div>
      `;

      modalContainer.querySelector('#btn-cancel-swap').addEventListener('click', close);
      modalContainer.querySelector('#btn-apply-swap').addEventListener('click', () => {
        currentExItem.exerciseName = suggestion.alternativeName;
        currentExItem.exerciseEquipment = suggestion.equipment;
        StorageService.saveActiveSession(this.activeSession);
        sound.playCheckSound();
        if ('vibrate' in navigator) navigator.vibrate(60);
        close();
        this.renderTreinoView(container);
      });
    }).catch(err => {
      console.error(err);
      const contentEl = modalContainer.querySelector('#swap-modal-content');
      if (contentEl) {
        contentEl.innerHTML = `
          <div style="padding: 20px; text-align: center; color: var(--baby-pink);">
            Erro ao consultar o Oráculo. Tente novamente mais tarde.
          </div>
          <button class="btn-exercise-guide" id="btn-err-close" style="width: 100%; justify-content: center; padding: 10px;">Fechar</button>
        `;
        contentEl.querySelector('#btn-err-close').addEventListener('click', close);
      }
    });
  }

  startWorkoutSession(routine) {
    const startTime = Date.now();
    const session = {
      routineId: routine.id,
      routineCode: routine.code,
      routineTitle: routine.title,
      routineFocus: routine.focus,
      startTime: startTime,
      elapsedSeconds: 0,
      isPaused: false,
      exercises: routine.exercises.map(item => {
        const setsData = [];
        for (let i = 0; i < item.sets; i++) {
          setsData.push({
            setNumber: i + 1,
            weight: item.defaultWeight || 10,
            reps: typeof item.reps === 'string' ? item.reps.split(' ')[0] : item.reps,
            completed: false
          });
        }
        return {
          exerciseId: item.exerciseId,
          restSec: item.restSec,
          setsData: setsData
        };
      })
    };

    this.activeSession = session;
    StorageService.saveActiveSession(session);
    this.stopwatch.start(0, startTime);

    this.updateStopwatchDisplayUI(true);

    const headerTimer = document.querySelector('#header-live-timer');
    if (headerTimer) headerTimer.style.display = 'inline-flex';
  }

  finishWorkoutSession() {
    const elapsedSeconds = this.stopwatch.stop();
    const todayStr = new Date().toISOString().split('T')[0];

    // Calcula volume total em kg (peso x reps aproximadas)
    let totalVolumeKg = 0;
    let completedExercisesCount = 0;

    this.activeSession.exercises.forEach(ex => {
      let hadCompleted = false;
      ex.setsData.forEach(s => {
        if (s.completed) {
          hadCompleted = true;
          const numReps = parseInt(s.reps, 10) || 10;
          totalVolumeKg += (s.weight * numReps);
        }
      });
      if (hadCompleted) completedExercisesCount++;
    });

    const finishedWorkout = {
      id: `w-${Date.now()}`,
      routineId: this.activeSession.routineId,
      routineTitle: this.activeSession.routineTitle,
      routineFocus: this.activeSession.routineFocus,
      date: todayStr,
      startTime: this.activeSession.startTime,
      endTime: Date.now(),
      durationSeconds: elapsedSeconds,
      totalWeightVolume: totalVolumeKg,
      completedExercisesCount: completedExercisesCount,
      exercises: this.activeSession.exercises.map(ex => {
        const catalogEx = EXERCISES.find(e => e.id === ex.exerciseId);
        const completedSets = ex.setsData.filter(s => s.completed);
        return {
          exerciseId: ex.exerciseId,
          name: catalogEx ? catalogEx.name : ex.exerciseId,
          targetMuscle: catalogEx ? (catalogEx.muscleLabel || catalogEx.targetMuscle) : '',
          setsData: ex.setsData,
          completedSetsCount: completedSets.length,
          totalSetsCount: ex.setsData.length,
          isCompleted: completedSets.length > 0
        };
      })
    };

    StorageService.addWorkoutToHistory(finishedWorkout);
    if (this.supabaseUser) {
      SupabaseService.addWorkout(this.supabaseUser.id, finishedWorkout).catch(err => console.warn('Sync workout Supabase:', err));
    }
    StorageService.clearActiveSession();
    this.activeSession = null;

    const dockTreinoLabel = document.querySelector('#dock-treino-label');
    if (dockTreinoLabel) dockTreinoLabel.textContent = 'Treino';

    const headerTimer = document.querySelector('#header-live-timer');
    if (headerTimer) headerTimer.style.display = 'none';

    this.updateHeaderStreak();

    // Fanfarra e Celebração com tratamento seguro
    try {
      sound.playVictoryFanfare();
    } catch (_) { }

    try {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#60a5fa', '#fbcfe8', '#ffffff', '#fcd34d']
        });
      }
    } catch (_) { }

    this.openCheckoutCelebrationModal(finishedWorkout);
  }

  // ==========================================
  // VIEW 3: BIBLIOTECA DE MOVIMENTOS & EXERCÍCIOS
  // ==========================================
  renderExerciciosView(container) {
    container.innerHTML = `
      <div style="padding: 16px 18px;">
        <h2 style="font-family: var(--font-carved); font-size: 1.3rem; color: #fff; margin-bottom: 4px;">
          BIBLIOTECA DE MOVIMENTOS
        </h2>
        <p style="font-size: 0.8rem; color: var(--concrete-300); margin-bottom: 14px;">
          Guia biomecânico anatômico com postura, dicas e erros comuns para iniciantes.
        </p>

        <!-- Filtros Musculares -->
        <div class="muscle-filter-scroll" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 14px; -webkit-overflow-scrolling: touch;">
          ${MUSCLE_GROUPS.map(mg => `
            <button 
              class="filter-pill ${mg.id === 'todos' ? 'active' : ''}" 
              data-filter-muscle="${mg.id}"
            >
              ${mg.label}
            </button>
          `).join('')}
        </div>

        <!-- Grade de Exercícios -->
        <div id="exercise-catalog-grid" style="display: flex; flex-direction: column; gap: 12px;"></div>
      </div>
    `;

    const grid = container.querySelector('#exercise-catalog-grid');
    const renderList = (filterMuscle) => {
      const filtered = filterMuscle === 'todos'
        ? EXERCISES
        : EXERCISES.filter(e => e.muscle === filterMuscle);

      grid.innerHTML = filtered.map(ex => `
        <div class="stone-panel" style="display: flex; gap: 12px; align-items: center; cursor: pointer;" data-open-ex="${ex.id}">
          <div style="width: 58px; height: 58px; border-radius: 10px; background: #0a0d16; border: 1px solid rgba(0,240,255,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; position: relative;">
            <img src="${ex.frames[0]}" alt="${ex.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
          </div>
          <div style="flex: 1;">
            <div style="font-size: 0.7rem; color: var(--night-blue-accent); font-weight: 500;">${ex.muscleLabel}</div>
            <h4 style="font-family: var(--font-carved); font-size: 0.95rem; color: #fff; margin-bottom: 2px;">${ex.name}</h4>
            <div style="font-size: 0.72rem; color: var(--concrete-400);">Equipamento: ${ex.equipment}</div>
          </div>
          <div style="color: var(--concrete-400); font-size: 1.2rem;">›</div>
        </div>
      `).join('');

      grid.querySelectorAll('[data-open-ex]').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-open-ex');
          const found = EXERCISES.find(e => e.id === id);
          if (found) this.openExerciseModal(found);
        });
      });
    };

    renderList('todos');

    // Filtros
    container.querySelectorAll('[data-filter-muscle]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('[data-filter-muscle]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderList(btn.getAttribute('data-filter-muscle'));
      });
    });
  }

  // ==========================================
  // VIEW 4: HISTÓRICO & STREAKS (GYMRATS STYLE)
  // ==========================================
  renderHistoricoView(container) {
    const stats = StorageService.getStats();
    const history = StorageService.getHistory();

    container.innerHTML = `
      <div style="padding: 16px 18px;">
        <h2 style="font-family: var(--font-carved); font-size: 1.35rem; color: #fff; margin-bottom: 4px;">
          TEMPLO DA CONSTÂNCIA
        </h2>
        <p style="font-size: 0.8rem; color: var(--concrete-300); margin-bottom: 18px;">
          Sua jornada registrada no concreto cósmico.
        </p>

        <!-- Estatísticas Avançadas no Topo (Big Numbers) -->
        <div class="stats-grid-row" style="margin: 0 0 18px;">
          <div class="stat-metric-card">
            <div class="stat-metric-val" style="color: var(--solar-gold);">${stats.bestStreak}d</div>
            <div class="stat-metric-lbl">Recorde Streak</div>
          </div>
          <div class="stat-metric-card">
            <div class="stat-metric-val">${stats.totalMinutes}m</div>
            <div class="stat-metric-lbl">Minutos Totais</div>
          </div>
          <div class="stat-metric-card">
            <div class="stat-metric-val" style="color: var(--night-blue-accent);">${stats.totalWorkouts}</div>
            <div class="stat-metric-lbl">Sessões</div>
          </div>
        </div>

        <!-- Heatmap Principal (Colunas Gregas 3D & Ciclo Lunar) -->
        <div id="history-heatmap-mount" style="margin-bottom: 22px;"></div>

        <!-- Lista de Sessões Anteriores -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="font-family: var(--font-hud); font-size: 0.82rem; color: var(--concrete-400); letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">
            HISTÓRICO DE SESSÕES
          </h3>
          <span style="font-size: 0.7rem; color: var(--concrete-400); font-family: var(--font-hud);">
            ${history.length} ${history.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${history.length === 0 ? `
            <div class="stone-panel" style="text-align: center; color: var(--concrete-400); font-size: 0.85rem; padding: 24px;">
              Nenhum treino consagrado ainda. Entre no templo para começar sua jornada!
            </div>
          ` : history.map((item, index) => {
      const [y, m, d] = item.date ? item.date.split('-') : [];
      const formattedDate = (y && m && d) ? `${d}/${m}/${y}` : (item.date || 'Hoje');

      // Lista de exercícios concluídos na sessão
      const routineObj = DEFAULT_ROUTINES.find(r => r.id === item.routineId || r.title === item.routineTitle);
      const exercisesList = item.exercises || (routineObj ? routineObj.exercises.map(re => {
        const catEx = EXERCISES.find(e => e.id === re.exerciseId);
        return {
          exerciseId: re.exerciseId,
          name: catEx ? catEx.name : re.exerciseId,
          targetMuscle: catEx ? (catEx.muscleLabel || catEx.targetMuscle) : '',
          isCompleted: true,
          completedSetsCount: re.sets,
          totalSetsCount: re.sets
        };
      }) : []);

      return `
            <div class="stone-panel history-session-card" data-history-idx="${index}" style="cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255,255,255,0.08); padding: 13px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                  <div style="font-family: var(--font-carved); font-size: 0.95rem; color: #fff;">${item.routineTitle}</div>
                  <div style="font-size: 0.72rem; color: var(--concrete-400); margin-top: 3px; display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      ${formattedDate}
                    </span>
                    <span>•</span>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      ${Math.round(item.durationSeconds / 60)} min
                    </span>
                  </div>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                  <div style="font-family: var(--font-sans); font-size: 0.9rem; color: var(--night-blue-accent); font-weight: 700;">
                    ${item.totalWeightVolume ? item.totalWeightVolume.toLocaleString() + ' kg' : 'Concluído'}
                  </div>
                  <div style="font-size: 0.65rem; color: var(--concrete-400);">Volume Total</div>
                </div>
              </div>

              <!-- Exercícios Marcados na Sessão -->
              ${exercisesList.length > 0 ? `
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 0.64rem; color: var(--concrete-400); font-family: var(--font-hud); letter-spacing: 0.8px; text-transform: uppercase;">
                      EXERCÍCIOS CONCLUÍDOS (${exercisesList.filter(e => e.isCompleted).length}/${exercisesList.length}):
                    </span>
                    <span style="font-size: 0.64rem; color: var(--neon-cyan); font-weight: 600; display: inline-flex; align-items: center; gap: 2px;">
                      Ver detalhes ↗
                    </span>
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${exercisesList.map(ex => `
                      <span style="font-size: 0.66rem; padding: 2px 7px; border-radius: 6px; background: ${ex.isCompleted ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)'}; color: ${ex.isCompleted ? '#7dd3fc' : 'var(--concrete-400)'}; border: 1px solid ${ex.isCompleted ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.07)'}; display: inline-flex; align-items: center; gap: 4px;">
                        <span style="color: ${ex.isCompleted ? '#38bdf8' : 'var(--concrete-500)'}; font-weight: 800; font-size: 0.6rem;">${ex.isCompleted ? '✓' : '○'}</span>
                        ${ex.name}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            `;
    }).join('')}
        </div>
      </div>
    `;

    // Clique no card de treino para abrir detalhes completos
    container.querySelectorAll('.history-session-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-history-idx'), 10);
        const item = history[idx];
        if (item) {
          this.openWorkoutDetailsModal(item);
        }
      });
    });

    const heatMount = container.querySelector('#history-heatmap-mount');
    if (heatMount) {
      new WorkoutHeatmap(heatMount, stats.activeDaysSet, history);
    }
  }

  // ==========================================
  // VIEW 5: ORÁCULO IA, PERFIL & CONFIGURAÇÕES
  // ==========================================
  renderOraculoView(container) {
    const p = this.profile;
    const stats = StorageService.getStats();
    const workoutHistory = StorageService.getHistory();
    const imc = (p.weight / ((p.height / 100) * (p.height / 100))).toFixed(1);
    const hasApiKey = Boolean(p.geminiApiKey && p.geminiApiKey.trim().length > 10);

    // Formatador seguro de Markdown simples para o Chat
    const formatOracleMessageText = (raw) => {
      if (!raw) return '';
      let safe = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');

      const paragraphs = safe.split(/\n\n+/);
      return paragraphs.map(para => {
        const lines = para.split(/\n/).map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('- ')) {
            return `<li style="margin-left: 16px; list-style-type: disc;">${trimmed.substring(2)}</li>`;
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return `<li style="margin-left: 16px; list-style-type: decimal;">${trimmed.replace(/^\d+\.\s/, '')}</li>`;
          }
          return line;
        }).join('<br/>');
        return `<p style="margin: 0 0 6px 0;">${lines}</p>`;
      }).join('');
    };

    container.innerHTML = `
      <div style="padding: 16px 18px;">
        <div style="margin-bottom: 10px;">
          <h2 style="font-family: var(--font-carved); font-size: 1.35rem; color: #fff; margin-bottom: 2px;">
            ORÁCULO & PERFIL
          </h2>
          <p style="font-size: 0.78rem; color: var(--concrete-300);">
            Converse sobre sua rotina fitness com o Oráculo. Molde melhor o seu treino.
          </p>
        </div>

        <!-- Cartão de Perfil do Aluno (Posicionado no Topo) -->
        <div class="stone-panel" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <h3 style="font-family: var(--font-carved); font-size: 1.1rem; color: #fff; margin: 0 0 2px;">${p.name}</h3>
              <span style="font-size: 0.72rem; color: var(--baby-pink); font-weight: 600;">${p.goal.toUpperCase()} • ${p.frequency}x / SEMANA</span>
            </div>
            <button id="btn-edit-profile" style="background: rgba(255,255,255,0.06); border: 1px solid var(--concrete-600); color: #fff; border-radius: 8px; padding: 5px 12px; font-size: 0.72rem; cursor: pointer; font-weight: 600; transition: background 0.2s;">
              Editar Perfil
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px;">
            <div>
              <div style="font-family: var(--font-hud); font-size: 1.05rem; color: #fff;">${p.weight} kg</div>
              <div style="font-size: 0.65rem; color: var(--concrete-400);">Peso</div>
            </div>
            <div>
              <div style="font-family: var(--font-hud); font-size: 1.05rem; color: #fff;">${p.height} cm</div>
              <div style="font-size: 0.65rem; color: var(--concrete-400);">Altura</div>
            </div>
            <div>
              <div style="font-family: var(--font-hud); font-size: 1.05rem; color: var(--neon-cyan);">${imc}</div>
              <div style="font-size: 0.65rem; color: var(--concrete-400);">IMC</div>
            </div>
          </div>
        </div>

        <!-- PAINEL DO ORÁCULO COM ABAS [ Conversa Atual ] [ Histórico de Chats ] -->
        <div class="stone-panel oracle-chat-panel" style="margin-bottom: 20px;">
          
          <!-- Seletor de Abas no Topo do Oráculo (Opção A) -->
          <div class="oracle-subtabs-row" style="display: flex; gap: 6px; margin-bottom: 12px; background: rgba(0,0,0,0.4); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <button id="btn-oracle-subtab-chat" class="oracle-subtab-btn ${this.currentOracleTab === 'chat' ? 'active' : ''}" style="flex: 1; padding: 8px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; background: ${this.currentOracleTab === 'chat' ? 'rgba(56,189,248,0.2)' : 'transparent'}; color: ${this.currentOracleTab === 'chat' ? '#38bdf8' : 'var(--concrete-400)'}; border: ${this.currentOracleTab === 'chat' ? '1px solid rgba(56,189,248,0.4)' : '1px solid transparent'};">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Conversa Atual
            </button>
            <button id="btn-oracle-subtab-history" class="oracle-subtab-btn ${this.currentOracleTab === 'history' ? 'active' : ''}" style="flex: 1; padding: 8px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; background: ${this.currentOracleTab === 'history' ? 'rgba(244,114,182,0.2)' : 'transparent'}; color: ${this.currentOracleTab === 'history' ? 'var(--baby-pink)' : 'var(--concrete-400)'}; border: ${this.currentOracleTab === 'history' ? '1px solid rgba(244,114,182,0.4)' : '1px solid transparent'};">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Histórico de Chats (${StorageService.getChatSessions().length})
            </button>
          </div>

          <!-- ABA 1: CONVERSA ATIVA COM O ORÁCULO -->
          <div id="oracle-view-chat" style="display: ${this.currentOracleTab === 'chat' ? 'block' : 'none'};">
            <div class="oracle-chat-header">
              <div style="display: flex; align-items: center; gap: 10px;">
                <!-- Portal Cósmico com Anéis Giratórios e Gradiente -->
                <div class="cosmic-portal-orb" title="Portal do Oráculo Ativo">
                  <svg class="portal-vortex-svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <defs>
                      <linearGradient id="portal-grad-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#38bdf8"/>
                        <stop offset="50%" stop-color="#f472b6"/>
                        <stop offset="100%" stop-color="#a855f7"/>
                      </linearGradient>
                      <radialGradient id="portal-core-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#38bdf8"/>
                        <stop offset="70%" stop-color="#a855f7"/>
                        <stop offset="100%" stop-color="transparent"/>
                      </radialGradient>
                    </defs>
                    <circle class="portal-outer-ring" cx="14" cy="14" r="12" stroke="url(#portal-grad-glow)" stroke-width="1.8" stroke-dasharray="6 3" stroke-linecap="round"/>
                    <circle class="portal-inner-ring" cx="14" cy="14" r="8" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 3"/>
                    <circle class="portal-core-singularity" cx="14" cy="14" r="3.5" fill="url(#portal-core-glow)"/>
                    <path d="M14 2v3M14 23v3M2 14h3M23 14h3" stroke="#f472b6" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>

                <div>
                  <div style="font-family: var(--font-hud); font-size: 0.88rem; color: #fff; letter-spacing: 0.8px;">
                    ORÁCULO
                  </div>
                  <div style="font-size: 0.68rem; color: var(--neon-cyan);">
                    Memória ativa • ${stats.currentStreak}d Streak • ${stats.totalWorkouts} treinos
                  </div>
                </div>
              </div>

              <!-- Ações da Conversa Atual: Novo Chat (+) & Limpar -->
              <div style="display: flex; gap: 6px; align-items: center;">
                <button id="btn-new-oracle-chat" title="Iniciar Nova Conversa (arquiva a atual no histórico)" style="background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.35); color: #38bdf8; border-radius: 6px; padding: 4px 8px; font-size: 0.68rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
                  <span style="font-weight: 900; font-size: 0.8rem;">+</span> Novo Chat
                </button>
                <button id="btn-clear-chat" title="Limpar conversa atual" class="oracle-chat-clear-btn">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 2px;">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Limpar
                </button>
              </div>
            </div>

            <!-- Chips de Perguntas Rápidas -->
            <div class="oracle-chips-slider">
              <button class="oracle-prompt-chip" data-prompt="⚡ O que treinar hoje?">
                ⚡ O que treinar hoje?
              </button>
              <button class="oracle-prompt-chip" data-prompt="🏋️ Como progredir carga nos exercícios?">
                🏋️ Dicas de Carga
              </button>
              <button class="oracle-prompt-chip" data-prompt="🥩 Quanto de proteína e água devo consumir para o meu peso?">
                🥩 Proteína & Dieta
              </button>
              <button class="oracle-prompt-chip" data-prompt="🩹 Dor muscular pós-treino vs lesão: como diferenciar?">
                🩹 Dor vs Lesão
              </button>
              <button class="oracle-prompt-chip" data-prompt="📊 Como está meu histórico e evolução no templo?">
                📊 Meu Progresso
              </button>
            </div>

            <!-- Mensagens do Chat -->
            <div id="oracle-chat-messages" class="oracle-chat-messages"></div>

            <!-- Barra de Envio -->
            <form id="oracle-chat-form" class="oracle-chat-form">
              <input 
                type="text" 
                id="input-oracle-chat" 
                class="oracle-chat-input" 
                placeholder="Pergunte ao Oráculo (treino, nutrição, execução)..." 
                autocomplete="off"
              />
              <button type="submit" id="btn-send-oracle-chat" class="oracle-chat-send-btn" title="Enviar Mensagem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>

          <!-- ABA 2: HISTÓRICO DE CHATS ANTERIORES -->
          <div id="oracle-view-history" style="display: ${this.currentOracleTab === 'history' ? 'block' : 'none'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-family: var(--font-hud); font-size: 0.85rem; color: #fff; letter-spacing: 0.8px;">
                  CONSULTAS ANTERIORES
                </div>
                <div style="font-size: 0.68rem; color: var(--concrete-400);">
                  Conversas guardadas com o Oráculo Cósmico
                </div>
              </div>
              ${StorageService.getChatSessions().length > 0 ? `
                <button id="btn-clear-all-sessions" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 6px; padding: 4px 8px; font-size: 0.68rem; cursor: pointer;">
                  Limpar Todas
                </button>
              ` : ''}
            </div>

            <div id="oracle-history-list-container">
              ${(() => {
        const sessions = StorageService.getChatSessions();
        if (sessions.length === 0) {
          return `
                    <div style="text-align: center; padding: 36px 16px; background: rgba(0,0,0,0.25); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                      <div style="font-size: 1.8rem; margin-bottom: 8px;">📜</div>
                      <div style="font-size: 0.86rem; color: #fff; font-weight: 700; margin-bottom: 4px;">Nenhum chat arquivado ainda</div>
                      <p style="font-size: 0.72rem; color: var(--concrete-300); line-height: 1.4; max-width: 320px; margin: 0 auto 14px;">
                        Quando você conversar com o Oráculo e clicar em <strong>+ Novo Chat</strong>, sua conversa anterior ficará guardada aqui para você reler quando quiser!
                      </p>
                      <button id="btn-back-to-active-chat" class="btn-enter-temple" style="padding: 8px 16px; font-size: 0.75rem;">
                        Conversar Agora
                      </button>
                    </div>
                  `;
        }
        return `
                  <div style="display: flex; flex-direction: column; gap: 10px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
                    ${sessions.map(sess => {
          const firstOracleMsg = sess.messages.find(m => m.sender === 'oracle' && m.id !== 'msg-welcome');
          return `
                        <div class="stone-panel oracle-history-item-card" data-session-id="${sess.id}" style="border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 10px; background: rgba(15,23,42,0.6);">
                          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                            <div style="flex: 1; min-width: 0;">
                              <h4 style="font-size: 0.84rem; color: #fff; font-weight: 700; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                💬 ${sess.title}
                              </h4>
                              <div style="font-size: 0.67rem; color: var(--concrete-400);">
                                ${sess.createdAt} • ${sess.messagesCount || sess.messages.length} mensagens
                              </div>
                            </div>
                            <button class="btn-delete-session" data-session-id="${sess.id}" style="background: none; border: none; color: var(--concrete-500); cursor: pointer; padding: 2px 4px; font-size: 1rem; line-height: 1;" title="Excluir do histórico">
                              &times;
                            </button>
                          </div>

                          ${firstOracleMsg ? `
                            <div style="font-size: 0.72rem; color: var(--concrete-300); line-height: 1.35; margin-bottom: 10px; background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 6px; font-style: italic; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                              "${firstOracleMsg.text.replace(/[*#]/g, '').slice(0, 120)}..."
                            </div>
                          ` : ''}

                          <div style="display: flex; justify-content: flex-end;">
                            <button class="btn-resume-session btn-enter-temple" data-session-id="${sess.id}" style="padding: 6px 14px; font-size: 0.72rem;">
                              Abrir Conversa ↗
                            </button>
                          </div>
                        </div>
                      `;
        }).join('')}
                  </div>
                `;
      })()}
            </div>
          </div>
        </div>
      </div>
    `;

    // ==========================================
    // GERENCIAMENTO DAS ABAS & HISTÓRICO
    // ==========================================
    const tabChatBtn = container.querySelector('#btn-oracle-subtab-chat');
    const tabHistoryBtn = container.querySelector('#btn-oracle-subtab-history');

    if (tabChatBtn && tabHistoryBtn) {
      tabChatBtn.addEventListener('click', () => {
        this.currentOracleTab = 'chat';
        this.renderOraculoView(container);
      });
      tabHistoryBtn.addEventListener('click', () => {
        this.currentOracleTab = 'history';
        this.renderOraculoView(container);
      });
    }

    const btnBackChat = container.querySelector('#btn-back-to-active-chat');
    if (btnBackChat) {
      btnBackChat.addEventListener('click', () => {
        this.currentOracleTab = 'chat';
        this.renderOraculoView(container);
      });
    }

    // Ações do Histórico de Conversas
    container.querySelectorAll('.btn-resume-session').forEach(btn => {
      btn.addEventListener('click', () => {
        const sessId = btn.getAttribute('data-session-id');
        const session = StorageService.getChatSessions().find(s => s.id === sessId);
        if (session && session.messages) {
          const currentMsgs = StorageService.getChatHistory();
          if (currentMsgs && currentMsgs.some(m => m.sender === 'user')) {
            StorageService.archiveCurrentChat(currentMsgs);
          }
          StorageService.saveChatHistory(session.messages);
          this.currentOracleTab = 'chat';
          sound.playTapSound();
          this.renderOraculoView(container);
        }
      });
    });

    container.querySelectorAll('.btn-delete-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sessId = btn.getAttribute('data-session-id');
        if (confirm('Deseja excluir esta conversa do histórico?')) {
          StorageService.deleteChatSession(sessId);
          this.renderOraculoView(container);
        }
      });
    });

    const btnClearAllSessions = container.querySelector('#btn-clear-all-sessions');
    if (btnClearAllSessions) {
      btnClearAllSessions.addEventListener('click', () => {
        if (confirm('Deseja apagar todas as conversas do histórico?')) {
          StorageService.clearAllChatSessions();
          this.renderOraculoView(container);
        }
      });
    }

    // ==========================================
    // GERENCIAMENTO DO CHAT DO ORÁCULO
    // ==========================================
    const messagesContainer = container.querySelector('#oracle-chat-messages');
    let chatHistory = StorageService.getChatHistory();

    // Se estiver vazio, inicia com mensagem de boas-vindas acolhedora do Oráculo
    if (!chatHistory || chatHistory.length === 0) {
      chatHistory = [
        {
          id: 'msg-welcome',
          sender: 'oracle',
          text: `Saudações, guerreiro(a) **${p.name}**! Eu sou o Oráculo do Templo Cósmico.\n\nTenho acesso à sua biometria (**${p.weight}kg**, foco em **${p.goal}**), aos seus **${stats.currentStreak} dias de sequência** e ao seu histórico no templo. Como posso guiar seu treino ou sua evolução hoje?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: hasApiKey ? 'gemini' : 'local'
        }
      ];
      StorageService.saveChatHistory(chatHistory);
    }

    const renderChatMessages = () => {
      if (!messagesContainer) return;
      messagesContainer.innerHTML = chatHistory.map(msg => {
        const isUser = msg.sender === 'user';
        return `
          <div class="oracle-msg-bubble ${isUser ? 'from-user' : 'from-oracle'}">
            <div class="oracle-msg-meta">
              <span class="oracle-msg-sender">${isUser ? 'Você' : 'Oráculo ✨'}</span>
              <span class="oracle-msg-time">${msg.timestamp || ''}</span>
            </div>
            <div class="oracle-msg-text">
              ${formatOracleMessageText(msg.text)}
            </div>
            ${!isUser && msg.source === 'gemini' ? `
              <div class="oracle-msg-badge-source">⚡ Resposta via Gemini 1.5</div>
            ` : ''}
          </div>
        `;
      }).join('');

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    if (this.currentOracleTab === 'chat') {
      renderChatMessages();
    }

    // Botão + Novo Chat
    const btnNewChat = container.querySelector('#btn-new-oracle-chat');
    if (btnNewChat) {
      btnNewChat.addEventListener('click', () => {
        const hasUserMessages = chatHistory.some(m => m.sender === 'user');
        if (hasUserMessages) {
          StorageService.archiveCurrentChat(chatHistory);
        }
        StorageService.clearChatHistory();
        chatHistory = [];
        sound.playTapSound();
        this.renderOraculoView(container);
      });
    }

    // Enviar mensagem para o Oráculo
    const handleSendMessage = async (textToSend) => {
      const trimmed = textToSend.trim();
      if (!trimmed) return;

      const userMsg = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      chatHistory.push(userMsg);
      StorageService.saveChatHistory(chatHistory);
      if (this.supabaseUser) {
        SupabaseService.addChatMessage(this.supabaseUser.id, userMsg).catch(e => console.warn('Sync user msg Supabase:', e));
      }
      renderChatMessages();
      sound.playTapSound();

      // Desabilita input e botão enquanto processa
      const inputEl = container.querySelector('#input-oracle-chat');
      const sendBtn = container.querySelector('#btn-send-oracle-chat');
      if (inputEl) {
        inputEl.value = '';
        inputEl.disabled = true;
      }
      if (sendBtn) sendBtn.disabled = true;

      // Exibe balão de pensamento do Oráculo
      const thinkingEl = document.createElement('div');
      thinkingEl.className = 'oracle-msg-bubble oracle-bubble-thinking';
      thinkingEl.id = 'oracle-thinking-bubble';
      thinkingEl.innerHTML = `
        <div class="oracle-typing-dots">
          <span></span><span></span><span></span>
        </div>
        <span style="font-size: 0.72rem; color: var(--concrete-300);">Sintonizando frequências do templo...</span>
      `;
      if (messagesContainer) {
        messagesContainer.appendChild(thinkingEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      try {
        const response = await GeminiService.askOracleChat({
          userMessage: trimmed,
          chatHistory,
          userProfile: this.profile,
          workoutHistory,
          activeSession: this.activeSession,
          stats,
          apiKey: this.profile.geminiApiKey || (import.meta.env?.VITE_GEMINI_API_KEY || '')
        });

        // Remove balão de pensamento
        const currentThinking = container.querySelector('#oracle-thinking-bubble');
        if (currentThinking) currentThinking.remove();

        const oracleMsg = {
          id: 'msg-' + Date.now(),
          sender: 'oracle',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: response.source || 'local'
        };

        chatHistory.push(oracleMsg);
        StorageService.saveChatHistory(chatHistory);
        if (this.supabaseUser) {
          SupabaseService.addChatMessage(this.supabaseUser.id, oracleMsg).catch(e => console.warn('Sync oracle msg Supabase:', e));
        }
        renderChatMessages();
        sound.playCheckSound();
      } catch (err) {
        console.error('Erro na resposta do Oráculo:', err);
        const currentThinking = container.querySelector('#oracle-thinking-bubble');
        if (currentThinking) currentThinking.remove();

        chatHistory.push({
          id: 'msg-' + Date.now(),
          sender: 'oracle',
          text: 'Os ventos cósmicos oscilaram por um instante. Respire fundo e faça sua pergunta novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'local'
        });
        StorageService.saveChatHistory(chatHistory);
        renderChatMessages();
      } finally {
        if (inputEl) {
          inputEl.disabled = false;
          inputEl.focus();
        }
        if (sendBtn) sendBtn.disabled = false;
      }
    };

    // Submissão do formulário
    const chatForm = container.querySelector('#oracle-chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputEl = container.querySelector('#input-oracle-chat');
        if (inputEl) handleSendMessage(inputEl.value);
      });
    }

    // Clique em chips de sugestão rápida
    container.querySelectorAll('.oracle-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) {
          handleSendMessage(prompt);
        }
      });
    });

    // Limpar histórico da conversa ativa
    const btnClearChat = container.querySelector('#btn-clear-chat');
    if (btnClearChat) {
      btnClearChat.addEventListener('click', () => {
        if (confirm('Deseja limpar as mensagens da conversa atual?')) {
          StorageService.clearChatHistory();
          chatHistory = [];
          this.renderOraculoView(container);
        }
      });
    }

    // Eventos do Perfil & Configs
    const btnEditProfile = container.querySelector('#btn-edit-profile');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        this.openProfileManagerModal();
      });
    }
  }

  // ==========================================
  // MODAL DE DETALHES COMPLETOS DA SESSÃO DE TREINO
  // ==========================================
  openWorkoutDetailsModal(item) {
    const modalContainer = document.querySelector('#modal-container');
    const [y, m, d] = item.date ? item.date.split('-') : [];
    const formattedDate = (y && m && d) ? `${d}/${m}/${y}` : (item.date || 'Hoje');
    const durationMin = Math.round((item.durationSeconds || 0) / 60);

    const routineObj = DEFAULT_ROUTINES.find(r => r.id === item.routineId || r.title === item.routineTitle);
    const exercisesList = item.exercises || (routineObj ? routineObj.exercises.map(re => {
      const catEx = EXERCISES.find(e => e.id === re.exerciseId);
      return {
        exerciseId: re.exerciseId,
        name: catEx ? catEx.name : re.exerciseId,
        targetMuscle: catEx ? (catEx.muscleLabel || catEx.targetMuscle) : '',
        isCompleted: true,
        completedSetsCount: re.sets,
        totalSetsCount: re.sets,
        setsData: Array.from({ length: re.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: re.defaultWeight || 10,
          reps: re.reps || 10,
          completed: true
        }))
      };
    }) : []);

    const completedExCount = exercisesList.filter(e => e.isCompleted).length;

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="workout-details-overlay">
        <div class="modal-sheet stone-panel workout-details-sheet" style="max-width: 440px; max-height: 85vh; display: flex; flex-direction: column;">
          <div class="modal-handle-bar"></div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div>
              <span style="font-family: var(--font-hud); font-size: 0.68rem; color: var(--neon-cyan); letter-spacing: 1px; text-transform: uppercase;">
                REGISTRO DE CONSAGRAÇÃO
              </span>
              <h3 style="font-family: var(--font-carved); font-size: 1.15rem; color: #fff; margin: 2px 0 0;">
                ${item.routineTitle}
              </h3>
              ${item.routineFocus || (routineObj && routineObj.focus) ? `
                <div style="font-size: 0.72rem; color: var(--concrete-300); margin-top: 2px;">
                  Foco: ${item.routineFocus || routineObj.focus}
                </div>
              ` : ''}
            </div>
            <button id="btn-close-workout-details" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer; line-height: 1; padding: 0 4px;">&times;</button>
          </div>

          <!-- Métricas da Sessão -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: var(--concrete-400); text-transform: uppercase; font-family: var(--font-hud);">Data</div>
              <div style="font-size: 0.82rem; color: #fff; font-weight: 700; margin-top: 2px;">${formattedDate}</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: var(--concrete-400); text-transform: uppercase; font-family: var(--font-hud);">Duração</div>
              <div style="font-size: 0.82rem; color: var(--neon-cyan); font-weight: 700; margin-top: 2px;">${durationMin} min</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: var(--concrete-400); text-transform: uppercase; font-family: var(--font-hud);">Volume</div>
              <div style="font-size: 0.82rem; color: var(--solar-gold); font-weight: 700; margin-top: 2px;">${item.totalWeightVolume ? item.totalWeightVolume.toLocaleString() + ' kg' : 'Concluído'}</div>
            </div>
          </div>

          <!-- Lista de Exercícios Executados -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.72rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase; font-family: var(--font-hud); letter-spacing: 1px;">
              EXERCÍCIOS REALIZADOS (${completedExCount}/${exercisesList.length})
            </span>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px; margin-bottom: 14px;">
            ${exercisesList.map((ex, exIdx) => {
      const sets = ex.setsData && ex.setsData.length > 0 ? ex.setsData : [];
      return `
                <div style="background: rgba(15,23,42,0.6); border: 1px solid ${ex.isCompleted ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)'}; border-radius: 10px; padding: 10px 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${sets.length > 0 ? '8px' : '0'};">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="width: 20px; height: 20px; border-radius: 50%; background: ${ex.isCompleted ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)'}; color: ${ex.isCompleted ? '#38bdf8' : 'var(--concrete-400)'}; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; border: 1px solid ${ex.isCompleted ? 'rgba(56,189,248,0.4)' : 'transparent'};">
                        ${ex.isCompleted ? '✓' : (exIdx + 1)}
                      </span>
                      <div>
                        <div style="font-size: 0.84rem; font-weight: 700; color: #fff;">${ex.name}</div>
                        ${ex.targetMuscle ? `<span style="font-size: 0.65rem; color: var(--concrete-400);">${ex.targetMuscle}</span>` : ''}
                      </div>
                    </div>
                    <span style="font-size: 0.7rem; font-family: var(--font-hud); color: ${ex.isCompleted ? '#38bdf8' : 'var(--concrete-400)'}; font-weight: 700;">
                      ${ex.isCompleted ? 'FEITO' : 'NÃO FEITO'}
                    </span>
                  </div>

                  ${sets.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 28px; border-left: 2px solid rgba(56,189,248,0.15); margin-left: 10px;">
                      ${sets.map(s => `
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: ${s.completed ? 'var(--concrete-200)' : 'var(--concrete-500)'};">
                          <span>Série ${s.setNumber}: <strong>${s.weight} kg</strong> × <strong>${s.reps} reps</strong></span>
                          <span style="color: ${s.completed ? '#34d399' : 'var(--concrete-500)'}; font-size: 0.68rem; font-weight: 700;">
                            ${s.completed ? '✓ Concluída' : 'Pulada'}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
    }).join('')}
          </div>

          <button id="btn-done-workout-details" class="btn-enter-temple" style="padding: 10px; font-size: 0.8rem; width: 100%;">
            Fechar
          </button>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#btn-close-workout-details').addEventListener('click', close);
    modalContainer.querySelector('#btn-done-workout-details').addEventListener('click', close);
    modalContainer.querySelector('#workout-details-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'workout-details-overlay') close();
    });
  }

  // ==========================================
  // MODAIS (PERFIL, FOTO COM AURA & AUTENTICAÇÃO SUPABASE)
  // ==========================================
  openProfileManagerModal() {
    const modalContainer = document.querySelector('#modal-container');
    const p = this.profile;
    const currentSlug = StorageService.getCurrentUserSlug();
    const stats = StorageService.getStats();
    const aura = p.auraColor || '#38bdf8';
    const AURA_PRESETS = [
      { color: '#38bdf8', label: 'Ciano Cósmico' },
      { color: '#3b82f6', label: 'Azul Elétrico' },
      { color: '#6366f1', label: 'Índigo Astral' },
      { color: '#8b5cf6', label: 'Violeta Místico' },
      { color: '#a855f7', label: 'Púrpura Titã' },
      { color: '#ec4899', label: 'Rosa Neon' },
      { color: '#f472b6', label: 'Rosa Cósmico' },
      { color: '#f43f5e', label: 'Rubi Real' },
      { color: '#ef4444', label: 'Carmesim' },
      { color: '#f97316', label: 'Chama Solar' },
      { color: '#f59e0b', label: 'Âmbar Dourado' },
      { color: '#fbbf24', label: 'Ouro Sagrado' },
      { color: '#eab308', label: 'Luz Solar' },
      { color: '#84cc16', label: 'Lima Astral' },
      { color: '#10b981', label: 'Esmeralda' },
      { color: '#14b8a6', label: 'Menta Galáctica' },
      { color: '#06b6d4', label: 'Turquesa Glacial' }
    ];
    const isCustomAura = !AURA_PRESETS.some(a => a.color.toLowerCase() === aura.toLowerCase());
    const hsl = hexToHsl(aura);
    const initialHue = hsl.h;
    const initialLight = Math.max(30, Math.min(85, hsl.l));

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="profile-manager-overlay">
        <div class="modal-sheet stone-panel profile-manager-sheet" style="max-width: 440px;">
          <div class="modal-handle-bar"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">🏛️</span>
              <div>
                <h3 style="font-family: var(--font-carved); font-size: 1.05rem; color: #fff; margin: 0;">
                  Sua aura você que escolhe
                </h3>
                <small style="color: var(--baby-pink); font-size: 0.68rem;">Edite aqui algumas personalizações do seu perfil</small>
              </div>
            </div>
            <button id="btn-close-profile-manager" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <!-- Destaque do Avatar Atual com Aura Viva -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 10px 0 14px;">
            <div class="avatar-aura-slot" style="width: 78px; height: 78px; cursor: default;">
              <div class="avatar-aura-ring" id="modal-preview-aura-ring" style="background: ${aura}; box-shadow: 0 0 20px ${aura}; inset: -5px;"></div>
              <div class="avatar-photo-circle" id="modal-preview-avatar-circle" style="border-width: 2px;">
                ${p.avatarUrl
        ? `<img src="${p.avatarUrl}" alt="${p.name}" />`
        : `<span class="avatar-initials-fallback" style="font-size: 1.6rem;">${(p.name || 'G')[0]}</span>`}
              </div>
            </div>

            <div style="text-align: center;">
              <h2 style="font-family: var(--font-carved); font-size: 1.2rem; color: #fff; margin: 0 0 2px;">${p.name}</h2>
              <span style="font-size: 0.72rem; color: var(--neon-cyan); font-weight: 600;">
                 ${stats.currentStreak} dias seguidos • ${p.weight} kg • ${p.goal.toUpperCase()}
              </span>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button class="btn-enter-temple" id="btn-pick-avatar-modal" style="padding: 8px 14px; font-size: 0.76rem;">
                Escolher Foto
              </button>
              ${p.avatarUrl ? `
                <button id="btn-remove-avatar-modal" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; border-radius: 8px; padding: 8px 12px; font-size: 0.72rem; cursor: pointer;">
                  Remover
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Escolha da Aura Cósmica com Paleta Ampliada (17 Tonalidades + Custom Touch) -->
          <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px;">
              <span style="font-size: 0.68rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase;">
                COR DA SUA AURA:
              </span>
              <span id="aura-current-hex-label" style="font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: ${aura}; font-weight: 700; letter-spacing: 0.5px;">${aura.toUpperCase()}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; max-width: 250px; margin: 0 auto; justify-items: center; align-items: center; padding: 4px 0;">
              ${AURA_PRESETS.map(a => {
          const isSelected = aura.toLowerCase() === a.color.toLowerCase();
          return `
                  <button 
                    class="aura-color-btn" 
                    data-aura="${a.color}" 
                    style="width: 27px; height: 27px; border-radius: 50%; background: ${a.color}; border: ${isSelected ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.25)'}; box-shadow: 0 0 ${isSelected ? '14px ' + a.color : '3px rgba(0,0,0,0.5)'}; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};"
                    title="${a.label}"
                  ></button>
                `;
        }).join('')}
              <!-- Botão + para abrir seletor touch integrado -->
              <div style="position: relative; display: inline-flex; align-items: center; justify-content: center;">
                <button 
                  class="aura-custom-plus-btn" 
                  id="btn-custom-aura-color" 
                  type="button"
                  title="Ajuste Touch da Aura (+)"
                  style="width: 27px; height: 27px; border-radius: 50%; background: ${isCustomAura
        ? aura
        : 'conic-gradient(from 180deg at 50% 50%, #f43f5e 0deg, #fbbf24 60deg, #10b981 120deg, #38bdf8 180deg, #818cf8 240deg, #f472b6 300deg, #f43f5e 360deg)'
      }; border: ${isCustomAura
        ? '2.5px solid #fff'
        : '1.5px solid rgba(255,255,255,0.7)'
      }; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 ${isCustomAura
        ? '16px ' + aura
        : '8px rgba(255,255,255,0.3)'
      }; transform: ${isCustomAura
        ? 'scale(1.15)'
        : 'scale(1)'
      };"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8));">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Painel Integrado Mobile/Touch (Sem popups invasivos) -->
            <div id="aura-inline-custom-panel" style="display: ${isCustomAura ? 'block' : 'none'}; margin-top: 12px; padding: 10px 12px; background: rgba(0,0,0,0.45); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.68rem; color: var(--neon-cyan); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Faça a sua cor</span>
                <button id="btn-native-picker-trigger" type="button" style="background: none; border: none; color: var(--concrete-400); font-size: 0.65rem; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" title="Abrir conta-gotas do sistema">
                  <span>Conta-gotas</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2l4 4L7 17H3v-4L14 2z"/></svg>
                </button>
              </div>

              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.62rem; color: var(--concrete-400); margin-bottom: 3px;">
                  <span>Matiz Cósmica</span>
                  <span id="aura-hue-val-label" style="font-family: 'JetBrains Mono', monospace;">${initialHue}°</span>
                </div>
                <input type="range" id="aura-spectrum-range" class="aura-spectrum-slider" min="0" max="360" value="${initialHue}" />
              </div>

              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.62rem; color: var(--concrete-400); margin-bottom: 3px;">
                  <span>Luminosidade</span>
                  <span id="aura-lightness-val-label" style="font-family: 'JetBrains Mono', monospace;">${initialLight}%</span>
                </div>
                <input type="range" id="aura-lightness-range" class="aura-lightness-slider" min="30" max="85" value="${initialLight}" style="background: linear-gradient(to right, #050505 0%, hsl(${initialHue}, 95%, 50%) 50%, #ffffff 100%);" />
              </div>

              <div style="display: flex; gap: 8px;">
                <button id="btn-apply-custom-aura" type="button" class="btn-enter-temple" style="flex: 1; padding: 7px 10px; font-size: 0.72rem;">
                  Consagrar Tom
                </button>
                <button id="btn-close-custom-panel" type="button" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--concrete-300); border-radius: 8px; padding: 7px 10px; font-size: 0.72rem; cursor: pointer;">
                  Fechar
                </button>
              </div>
              <input type="color" id="aura-custom-picker" style="position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;" value="${aura}">
            </div>
          </div>


          <!-- Sincronização em Nuvem Supabase -->
          <div style="background: rgba(15,23,42,0.7); border-radius: 10px; padding: 12px; border: 1px solid rgba(56,189,248,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #fff;">
                Minha conta
              </div>
              <span style="font-size: 0.65rem; color: ${this.supabaseUser ? '#34d399' : '#94a3b8'}; font-weight: 600;">
                ${this.supabaseUser ? '● Conectado' : '○ Modo Local'}
              </span>
            </div>
            <p style="font-size: 0.72rem; color: var(--concrete-300); margin-bottom: 10px; line-height: 1.35;">
              ${this.supabaseUser
        ? `Logado como: <strong>${this.supabaseUser.email}</strong>`
        : 'Você está no modo local. Faça login para salvar seus dados na nuvem.'}
            </p>
            <div style="display: flex; gap: 8px;">
              <button 
                id="btn-open-supabase-auth" 
                class="btn-finish-workout" 
                style="flex: 1; padding: 10px; font-size: 0.78rem; background: ${this.supabaseUser ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.25)'}; border-color: ${this.supabaseUser ? 'rgba(239,68,68,0.5)' : 'rgba(56,189,248,0.5)'}; color: #fff;"
              >
                ${this.supabaseUser ? 'Sair da Minha Conta' : 'Fazer Login ou criar uma conta'}
              </button>
              <button 
                id="btn-edit-bio-quick" 
                style="background: rgba(255,255,255,0.06); border: 1px solid var(--concrete-600); color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 0.74rem; cursor: pointer;"
              >
                Editar perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#btn-close-profile-manager').addEventListener('click', close);
    modalContainer.querySelector('#profile-manager-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'profile-manager-overlay') close();
    });

    // Escolher Foto do Celular
    modalContainer.querySelector('#btn-pick-avatar-modal').addEventListener('click', () => {
      close();
      const fileInput = document.querySelector('#header-avatar-file-input');
      if (fileInput) fileInput.click();
    });

    // Remover Foto
    const removeBtn = modalContainer.querySelector('#btn-remove-avatar-modal');
    if (removeBtn) {
      removeBtn.addEventListener('click', async () => {
        if (confirm('Deseja remover sua foto de perfil?')) {
          this.profile.avatarUrl = '';
          StorageService.saveProfile(this.profile);
          if (this.supabaseUser) {
            await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
          }
          this.updateHeaderAvatar();
          this.renderCurrentTab();
          sound.playTapSound();
          close();
        }
      });
    }

    // Alterar Cor da Aura Cósmica (Paleta Predefinida)
    modalContainer.querySelectorAll('.aura-color-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const selectedAura = btn.getAttribute('data-aura');
        this.profile.auraColor = selectedAura;
        StorageService.saveProfile(this.profile);
        if (this.supabaseUser) {
          await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
        }
        this.updateHeaderAvatar();
        sound.playCheckSound();
        this.openProfileManagerModal();
      });
    });

    // Seletor Touch Integrado de Aura (+)
    const customPanel = modalContainer.querySelector('#aura-inline-custom-panel');
    const customBtn = modalContainer.querySelector('#btn-custom-aura-color');
    const spectrumRange = modalContainer.querySelector('#aura-spectrum-range');
    const lightnessRange = modalContainer.querySelector('#aura-lightness-range');
    const hueValLabel = modalContainer.querySelector('#aura-hue-val-label');
    const lightValLabel = modalContainer.querySelector('#aura-lightness-val-label');
    const btnApplyCustom = modalContainer.querySelector('#btn-apply-custom-aura');
    const btnCloseCustom = modalContainer.querySelector('#btn-close-custom-panel');
    const btnNativeTrigger = modalContainer.querySelector('#btn-native-picker-trigger');
    const customPicker = modalContainer.querySelector('#aura-custom-picker');

    let currentSelectedHex = aura;

    const updateFromSliders = () => {
      const h = parseInt(spectrumRange?.value || '200', 10);
      const l = parseInt(lightnessRange?.value || '55', 10);
      const hex = hslToHex(h, 95, l);
      currentSelectedHex = hex;

      if (hueValLabel) hueValLabel.textContent = `${h}°`;
      if (lightValLabel) lightValLabel.textContent = `${l}%`;

      const ring = modalContainer.querySelector('#modal-preview-aura-ring');
      const hexLabel = modalContainer.querySelector('#aura-current-hex-label');
      if (ring) {
        ring.style.background = hex;
        ring.style.boxShadow = `0 0 22px ${hex}`;
      }
      if (hexLabel) {
        hexLabel.textContent = hex.toUpperCase();
        hexLabel.style.color = hex;
      }
      if (customBtn) {
        customBtn.style.background = hex;
        customBtn.style.boxShadow = `0 0 16px ${hex}`;
        customBtn.style.border = '2.5px solid #fff';
      }
      if (lightnessRange) {
        lightnessRange.style.background = `linear-gradient(to right, #050505 0%, hsl(${h}, 95%, 50%) 50%, #ffffff 100%)`;
      }
    };

    if (customBtn && customPanel) {
      customBtn.addEventListener('click', () => {
        const isHidden = customPanel.style.display === 'none';
        customPanel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          updateFromSliders();
        }
      });
    }

    if (spectrumRange) spectrumRange.addEventListener('input', updateFromSliders);
    if (lightnessRange) lightnessRange.addEventListener('input', updateFromSliders);

    if (btnCloseCustom && customPanel) {
      btnCloseCustom.addEventListener('click', () => {
        customPanel.style.display = 'none';
      });
    }

    if (btnApplyCustom) {
      btnApplyCustom.addEventListener('click', async () => {
        this.profile.auraColor = currentSelectedHex;
        StorageService.saveProfile(this.profile);
        if (this.supabaseUser) {
          await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
        }
        this.updateHeaderAvatar();
        sound.playCheckSound();
        this.openProfileManagerModal();
      });
    }

    if (btnNativeTrigger && customPicker) {
      btnNativeTrigger.addEventListener('click', () => {
        customPicker.click();
      });
    }

    if (customPicker) {
      customPicker.addEventListener('change', async (e) => {
        const val = e.target.value;
        this.profile.auraColor = val;
        StorageService.saveProfile(this.profile);
        if (this.supabaseUser) {
          await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
        }
        this.updateHeaderAvatar();
        sound.playCheckSound();
        this.openProfileManagerModal();
      });
    }

    // Abrir Autenticação Supabase ou Desconectar
    modalContainer.querySelector('#btn-open-supabase-auth').addEventListener('click', async () => {
      if (this.supabaseUser) {
        if (confirm('Deseja sair da sua conta e desconectar?')) {
          await SupabaseService.signOut();
          this.supabaseUser = null;
          StorageService.switchUser('joao');
          this.profile = StorageService.getProfile();
          close();
          this.updateHeaderAvatar();
          this.updateHeaderStreak();
          this.renderCurrentTab();
          alert('Você saiu da sua conta.');
        }
      } else {
        close();
        this.openSupabaseAuthModal();
      }
    });

    // Atalho para Editar Bio
    modalContainer.querySelector('#btn-edit-bio-quick').addEventListener('click', () => {
      close();
      this.openOnboardingModal();
    });
  }

  // Modal de Autenticação Supabase (Login & Cadastro com E-mail e Senha)
  openSupabaseAuthModal() {
    const modalContainer = document.querySelector('#modal-container');
    const p = this.profile;

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="supabase-auth-overlay">
        <div class="modal-sheet stone-panel supabase-auth-sheet" style="max-width: 400px;">
          <div class="modal-handle-bar"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">☁️</span>
              <div>
                <h3 style="font-family: var(--font-carved); font-size: 1.1rem; color: #fff; margin: 0;">
                  ACESSO AO TEMPLO NA NUVEM
                </h3>
                <small style="color: var(--neon-cyan); font-size: 0.68rem;">Sincronize entre Celulares com Supabase</small>
              </div>
            </div>
            <button id="btn-close-auth-modal" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <!-- Abas Entrar / Cadastrar -->
          <div style="display: flex; border-bottom: 1px solid rgba(255,255,255,0.12); margin-bottom: 16px;">
            <button id="tab-auth-login" class="filter-pill active" style="flex: 1; border-radius: 0; background: none; border-bottom: 2px solid #38bdf8;">
              ENTRAR
            </button>
            <button id="tab-auth-signup" class="filter-pill" style="flex: 1; border-radius: 0; background: none; border-bottom: 2px solid transparent;">
              CRIAR CONTA
            </button>
          </div>

          <form id="supabase-auth-form">
            <div class="form-group" id="group-auth-name" style="display: none;">
              <label class="form-label">Nome do Guerreiro</label>
              <input type="text" class="form-input" id="auth-name" value="${p.name || ''}" placeholder="Ex: João Pedro ou Marco" />
            </div>

            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" class="form-input" id="auth-email" placeholder="seu-email@exemplo.com" required />
            </div>

            <div class="form-group">
              <label class="form-label">Senha (mínimo 6 caracteres)</label>
              <input type="password" class="form-input" id="auth-password" placeholder="••••••••" minlength="6" required />
            </div>

            <div id="auth-error-msg" style="display: none; padding: 8px 12px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); border-radius: 8px; color: #fca5a5; font-size: 0.74rem; margin-bottom: 12px;"></div>

            <button type="submit" id="btn-submit-auth" class="btn-enter-temple" style="width: 100%; padding: 12px; font-size: 0.85rem; margin-bottom: 10px;">
              ⚡ ENTRAR NO TEMPLO
            </button>
          </form>

          <p style="font-size: 0.68rem; color: var(--concrete-400); text-align: center; margin: 0;">
            Seus dados ficam gravados com criptografia e isolados por usuário.
          </p>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#btn-close-auth-modal').addEventListener('click', close);
    modalContainer.querySelector('#supabase-auth-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'supabase-auth-overlay') close();
    });

    let mode = 'login';
    const tabLogin = modalContainer.querySelector('#tab-auth-login');
    const tabSignup = modalContainer.querySelector('#tab-auth-signup');
    const nameGroup = modalContainer.querySelector('#group-auth-name');
    const submitBtn = modalContainer.querySelector('#btn-submit-auth');
    const errorBox = modalContainer.querySelector('#auth-error-msg');

    tabLogin.addEventListener('click', () => {
      mode = 'login';
      tabLogin.classList.add('active');
      tabLogin.style.borderBottomColor = '#38bdf8';
      tabSignup.classList.remove('active');
      tabSignup.style.borderBottomColor = 'transparent';
      nameGroup.style.display = 'none';
      submitBtn.textContent = '⚡ ENTRAR NO TEMPLO';
      errorBox.style.display = 'none';
    });

    tabSignup.addEventListener('click', () => {
      mode = 'signup';
      tabSignup.classList.add('active');
      tabSignup.style.borderBottomColor = '#38bdf8';
      tabLogin.classList.remove('active');
      tabLogin.style.borderBottomColor = 'transparent';
      nameGroup.style.display = 'block';
      submitBtn.textContent = '✨ CRIAR NOVO GUERREIRO';
      errorBox.style.display = 'none';
    });

    modalContainer.querySelector('#supabase-auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = modalContainer.querySelector('#auth-email').value.trim();
      const password = modalContainer.querySelector('#auth-password').value;
      const name = modalContainer.querySelector('#auth-name').value.trim();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Conectando aos céus...';
      errorBox.style.display = 'none';

      try {
        if (mode === 'signup') {
          const res = await SupabaseService.signUp(email, password, {
            name: name || p.name,
            auraColor: p.auraColor || '#38bdf8'
          });

          if (!res.success) {
            errorBox.textContent = res.error || 'Erro ao criar conta.';
            errorBox.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = '✨ CRIAR NOVO GUERREIRO';
            return;
          }

          if (res.data?.user) {
            this.supabaseUser = res.data.user;
            this.profile.email = email;
            if (name) this.profile.name = name;
            StorageService.saveProfile(this.profile);
            await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
          }

          sound.playVictoryFanfare();
          alert('Conta criada com sucesso no Supabase!');
        } else {
          const res = await SupabaseService.signIn(email, password);
          if (!res.success) {
            errorBox.textContent = res.error || 'Credenciais inválidas.';
            errorBox.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = '⚡ ENTRAR NO TEMPLO';
            return;
          }

          this.supabaseUser = res.data.user;
          this.profile.email = email;

          // Busca perfil remoto se existir
          const remoteProfile = await SupabaseService.getProfile(this.supabaseUser.id);
          if (remoteProfile) {
            this.profile = {
              ...this.profile,
              name: remoteProfile.name || this.profile.name,
              age: remoteProfile.age || this.profile.age,
              weight: remoteProfile.weight || this.profile.weight,
              height: remoteProfile.height || this.profile.height,
              goal: remoteProfile.goal || this.profile.goal,
              auraColor: remoteProfile.aura_color || this.profile.auraColor,
              avatarUrl: remoteProfile.avatar_url || this.profile.avatarUrl
            };
          } else {
            // Sincroniza perfil local no Supabase
            await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
          }

          // Busca treinos remotos
          const remoteWorkouts = await SupabaseService.getWorkouts(this.supabaseUser.id);
          if (remoteWorkouts && remoteWorkouts.length > 0) {
            StorageService.saveHistory(remoteWorkouts);
          }

          StorageService.saveProfile(this.profile);
          sound.playVictoryFanfare();
          alert(`Bem-vindo de volta ao templo, ${this.profile.name}!`);
        }

        this.updateHeaderAvatar();
        this.updateHeaderStreak();
        this.renderCurrentTab();
        close();
      } catch (err) {
        errorBox.textContent = err.message || 'Erro inesperado na conexão.';
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'signup' ? '✨ CRIAR NOVO GUERREIRO' : '⚡ ENTRAR NO TEMPLO';
      }
    });
  }

  // ==========================================
  // MODAIS (ONBOARDING, GUIA ANATÔMICO & CHECKOUT)
  // ==========================================
  openOnboardingModal() {
    const modalContainer = document.querySelector('#modal-container');
    const p = this.profile;

    modalContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-sheet stone-panel">
          <div class="modal-handle-bar"></div>
          <div class="onboarding-portal">
            <span class="portal-code">PORTAL DE INICIAÇÃO</span>
            <h2 style="font-family: var(--font-carved); font-size: 1.45rem; color: #fff; margin: 8px 0 4px;">
              BEM-VINDO AO ORÁCULO
            </h2>
            <p style="font-size: 0.8rem; color: var(--concrete-300); margin-bottom: 20px;">
              Configuração inicial para calibrar seus treinos no templo de ferro.
            </p>

            <form id="onboarding-form">
              <div class="form-group">
                <label class="form-label">Seu Nome ou Codinome Cósmico</label>
                <input type="text" class="form-input" id="ob-name" value="${p.name || 'João Pedro'}" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div class="form-group">
                  <label class="form-label">Peso (kg)</label>
                  <div class="stepper-input-container">
                    <input type="number" class="form-input stepper-field" id="ob-weight" value="${p.weight || 75}" min="30" max="250" required />
                    <div class="stepper-actions">
                      <button type="button" class="stepper-btn stepper-btn-up" data-step-target="ob-weight" data-delta="1" aria-label="Aumentar peso">▲</button>
                      <button type="button" class="stepper-btn stepper-btn-down" data-step-target="ob-weight" data-delta="-1" aria-label="Diminuir peso">▼</button>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Altura (cm)</label>
                  <div class="stepper-input-container">
                    <input type="number" class="form-input stepper-field" id="ob-height" value="${p.height || 178}" min="100" max="230" required />
                    <div class="stepper-actions">
                      <button type="button" class="stepper-btn stepper-btn-up" data-step-target="ob-height" data-delta="1" aria-label="Aumentar altura">▲</button>
                      <button type="button" class="stepper-btn stepper-btn-down" data-step-target="ob-height" data-delta="-1" aria-label="Diminuir altura">▼</button>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Idade</label>
                  <div class="stepper-input-container">
                    <input type="number" class="form-input stepper-field" id="ob-age" value="${p.age || 24}" min="12" max="100" required />
                    <div class="stepper-actions">
                      <button type="button" class="stepper-btn stepper-btn-up" data-step-target="ob-age" data-delta="1" aria-label="Aumentar idade">▲</button>
                      <button type="button" class="stepper-btn stepper-btn-down" data-step-target="ob-age" data-delta="-1" aria-label="Diminuir idade">▼</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Objetivo Principal</label>
                <select class="form-input" id="ob-goal">
                  <option value="hipertrofia" ${p.goal === 'hipertrofia' ? 'selected' : ''}>Hipertrofia (Ganho de Massa Muscular)</option>
                  <option value="emagrecimento" ${p.goal === 'emagrecimento' ? 'selected' : ''}>Definição & Queima de Gordura</option>
                  <option value="condicionamento" ${p.goal === 'condicionamento' ? 'selected' : ''}>Força & Condicionamento Geral</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Frequência Semanal Desejada</label>
                <select class="form-input" id="ob-frequency">
                  <option value="3" ${p.frequency === 3 ? 'selected' : ''}>3 dias na semana (Ideal para iniciantes)</option>
                  <option value="4" ${p.frequency === 4 ? 'selected' : ''}>4 dias na semana (Divisão recomendada)</option>
                  <option value="5" ${p.frequency === 5 ? 'selected' : ''}>5 dias na semana</option>
                </select>
              </div>

              <button type="submit" class="btn-enter-temple" style="margin-top: 10px;">
                CONSAGRAR PERFIL ⚡
              </button>

              <button type="button" class="demo-recruiter-btn" id="ob-demo-btn">
                Entrar no Modo Demonstração (Portfólio)
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Conectar Botões de Stepper ▲ / ▼ com feedback sonoro e tátil
    modalContainer.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-step-target');
        const delta = parseInt(btn.getAttribute('data-delta'), 10) || 1;
        const input = modalContainer.querySelector(`#${targetId}`);
        if (input) {
          let val = parseInt(input.value, 10);
          if (isNaN(val)) val = 0;
          const min = parseInt(input.getAttribute('min'), 10);
          const max = parseInt(input.getAttribute('max'), 10);
          val += delta;
          if (!isNaN(min) && val < min) val = min;
          if (!isNaN(max) && val > max) val = max;
          input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          sound.playTapSound();
          if ('vibrate' in navigator) navigator.vibrate(20);
        }
      });
    });

    const form = modalContainer.querySelector('#onboarding-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.profile = {
        name: modalContainer.querySelector('#ob-name').value.trim(),
        weight: parseFloat(modalContainer.querySelector('#ob-weight').value),
        height: parseFloat(modalContainer.querySelector('#ob-height').value),
        age: parseInt(modalContainer.querySelector('#ob-age').value, 10),
        goal: modalContainer.querySelector('#ob-goal').value,
        frequency: parseInt(modalContainer.querySelector('#ob-frequency').value, 10),
        isOnboarded: true,
        geminiApiKey: this.profile.geminiApiKey || ''
      };

      StorageService.saveProfile(this.profile);
      modalContainer.innerHTML = '';
      this.renderCurrentTab();
    });

    modalContainer.querySelector('#ob-demo-btn').addEventListener('click', () => {
      StorageService.loadDemoData();
      this.profile = StorageService.getProfile();
      this.updateHeaderStreak();
      modalContainer.innerHTML = '';
      this.switchTab('templo');
    });
  }

  openExerciseModal(exercise) {
    const modalContainer = document.querySelector('#modal-container');
    const frames = exercise.frames || [];
    let currentFrameIdx = 0;
    let isPlaying = true;
    let loopTimer = null;

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="exercise-guide-modal-overlay">
        <div class="modal-sheet">
          <div class="modal-handle-bar"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span class="portal-code" style="font-size: 0.65rem;">${exercise.difficulty.toUpperCase()}</span>
              <h2 style="font-family: var(--font-carved); font-size: 1.25rem; color: #fff; margin-top: 4px;">${exercise.name}</h2>
              <div style="font-size: 0.75rem; color: var(--neon-cyan);">${exercise.targetGroup}</div>
            </div>
            <button id="btn-close-ex-modal" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <!-- Palco de Demonstração Real Dinâmica (Start ↔ Contração Máxima) -->
          <div class="exercise-real-player-stage">
            <img id="modal-frame-img" class="real-frame-img" src="${frames[0]}" alt="${exercise.name}" />
            
            <div class="exercise-phase-pill-overlay" id="modal-phase-badge">
              <span class="phase-dot-live" id="modal-phase-dot"></span>
              <span id="modal-phase-label">Fase 1: Posição Inicial</span>
            </div>

            <div class="exercise-motion-speed-pill">
              <span class="motion-pulse-ring"></span>
              <span>1.3s Ritmo</span>
            </div>

            <!-- Micro-timeline de Ritmo do Ciclo -->
            <div class="player-timeline-track">
              <div class="player-timeline-fill" id="player-timeline-fill"></div>
            </div>

            <div class="exercise-frame-controls">
              <div class="frame-step-tabs">
                <button class="frame-step-btn active" id="btn-frame-0">
                  <span class="phase-badge-num">1</span>
                  <span>Início</span>
                </button>
                <button class="frame-step-btn" id="btn-frame-1">
                  <span class="phase-badge-num">2</span>
                  <span>Pico Contração</span>
                </button>
              </div>
              <button class="frame-play-pause-btn is-looping" id="btn-frame-toggle-play">
                <span class="loop-icon-glyph" id="play-pause-icon">⟳</span>
                <span id="play-pause-text">Loop Ativo</span>
              </button>
            </div>
          </div>

          <!-- Dica Biomecânica Dinâmica da Fase Atual -->
          <div class="exercise-live-coach-bar" id="modal-coach-cue-box">
            <span class="coach-cue-icon" style="display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(56,189,248,0.6));">
                <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"></path>
              </svg>
            </span>
            <span class="coach-cue-text" id="modal-live-cue-text">
              Fase 1: Posição inicial estável. Mantenha as articulações alinhadas e respire preparando a carga.
            </span>
          </div>

          <!-- Links Externos de Alta Autoridade (MuscleWiki & YouTube) -->
          <div class="exercise-external-actions">
            <a href="${exercise.muscleWikiUrl}" target="_blank" rel="noopener noreferrer" class="ext-guide-btn musclewiki-btn">
              <span class="ext-btn-icon">🌐</span>
              <div class="ext-btn-texts">
                <strong>MuscleWiki Oficial</strong>
                <small>Guia 3D & Biomecânica ↗</small>
              </div>
            </a>
            <a href="${exercise.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="ext-guide-btn youtube-btn">
              <span class="ext-btn-icon">🎬</span>
              <div class="ext-btn-texts">
                <strong>Vídeo no YouTube</strong>
                <small>Tutorial passo a passo ↗</small>
              </div>
            </a>
          </div>

          <!-- Passo a Passo de Execução -->
          <div style="margin-bottom: 18px;">
            <h4 style="font-family: var(--font-hud); font-size: 0.78rem; color: var(--concrete-300); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
              COMO EXECUTAR CORRETAMENTE:
            </h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${exercise.steps.map((st, i) => `
                <div style="display: flex; gap: 8px; font-size: 0.82rem; color: var(--concrete-200);">
                  <span style="font-family: var(--font-hud); color: var(--neon-cyan); font-weight: 700;">${i + 1}.</span>
                  <span>${st}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Erros Comuns a Evitar -->
          <div style="margin-bottom: 18px; background: rgba(255,42,133,0.08); border: 1px solid rgba(255,42,133,0.25); padding: 12px; border-radius: 10px;">
            <h4 style="font-family: var(--font-hud); font-size: 0.75rem; color: var(--neon-pink); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
              ⚠️ ERROS COMUNS DE INICIANTES:
            </h4>
            <ul style="list-style-type: none; display: flex; flex-direction: column; gap: 4px;">
              ${exercise.mistakes.map(m => `
                <li style="font-size: 0.78rem; color: var(--concrete-300);">• ${m}</li>
              `).join('')}
            </ul>
          </div>

          <!-- Dica de Ouro -->
          <div style="background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.25); padding: 12px; border-radius: 10px; margin-bottom: 20px;">
            <div style="font-family: var(--font-hud); font-size: 0.75rem; color: var(--neon-cyan); margin-bottom: 4px;">
              💡 DICA:
            </div>
            <div style="font-size: 0.82rem; color: #fff; font-style: italic;">
              ${exercise.goldTip}
            </div>
          </div>

          <button id="btn-done-ex-modal" class="btn-enter-temple" style="padding: 12px;">
            ENTENDIDO
          </button>
        </div>
      </div>
    `;

    let progressTimer = null;
    let cycleProgress = 0;
    const CYCLE_DURATION = 1300; // ms por fase
    const TICK_INTERVAL = 40; // ms

    const frameImg = modalContainer.querySelector('#modal-frame-img');
    const phaseLabel = modalContainer.querySelector('#modal-phase-label');
    const phaseBadge = modalContainer.querySelector('#modal-phase-badge');
    const phaseDot = modalContainer.querySelector('#modal-phase-dot');
    const timelineFill = modalContainer.querySelector('#player-timeline-fill');
    const coachCueText = modalContainer.querySelector('#modal-live-cue-text');
    const btnFrame0 = modalContainer.querySelector('#btn-frame-0');
    const btnFrame1 = modalContainer.querySelector('#btn-frame-1');
    const btnPlayToggle = modalContainer.querySelector('#btn-frame-toggle-play');
    const iconPlay = modalContainer.querySelector('#play-pause-icon');
    const textPlay = modalContainer.querySelector('#play-pause-text');

    const cues = [
      'Fase 1 (Alongamento): Inspire fundo, estabilize a postura e prepare a musculatura sob tensão controlada.',
      'Fase 2 (Contração Máxima): Expire soltando o ar, esmague o músculo alvo no ápice por 1s e controle a descida!'
    ];

    const setFrame = (idx) => {
      if (!frames[idx]) return;
      currentFrameIdx = idx;
      frameImg.style.opacity = '0.75';
      setTimeout(() => {
        frameImg.src = frames[idx];
        frameImg.style.opacity = '1';
      }, 70);

      phaseLabel.textContent = idx === 0
        ? 'Fase 1: Posição Inicial'
        : 'Fase 2: Pico Contração';

      if (coachCueText) {
        coachCueText.textContent = cues[idx];
      }

      btnFrame0.classList.toggle('active', idx === 0);
      btnFrame1.classList.toggle('active', idx === 1);
      btnFrame1.classList.toggle('phase-1-active', idx === 1);

      if (idx === 0) {
        if (phaseDot) {
          phaseDot.style.background = 'var(--neon-cyan)';
          phaseDot.style.boxShadow = '0 0 8px var(--neon-cyan)';
        }
        if (phaseBadge) phaseBadge.style.borderColor = 'rgba(56, 189, 248, 0.55)';
      } else {
        if (phaseDot) {
          phaseDot.style.background = 'var(--baby-pink)';
          phaseDot.style.boxShadow = '0 0 8px var(--baby-pink)';
        }
        if (phaseBadge) phaseBadge.style.borderColor = 'rgba(244, 114, 182, 0.65)';
      }
    };

    const startLoop = () => {
      if (progressTimer) clearInterval(progressTimer);
      isPlaying = true;
      btnPlayToggle.classList.add('is-looping');
      iconPlay.textContent = '⟳';
      textPlay.textContent = 'Loop Ativo';

      cycleProgress = 0;
      progressTimer = setInterval(() => {
        cycleProgress += (TICK_INTERVAL / CYCLE_DURATION) * 100;
        if (cycleProgress >= 100) {
          cycleProgress = 0;
          setFrame(currentFrameIdx === 0 ? 1 : 0);
        }
        if (timelineFill) {
          timelineFill.style.width = `${Math.min(100, cycleProgress)}%`;
        }
      }, TICK_INTERVAL);
    };

    const stopLoop = () => {
      if (progressTimer) clearInterval(progressTimer);
      progressTimer = null;
      isPlaying = false;
      btnPlayToggle.classList.remove('is-looping');
      iconPlay.textContent = '▶';
      textPlay.textContent = 'Pausado';
      if (timelineFill) {
        timelineFill.style.width = '0%';
      }
    };

    const close = () => {
      if (progressTimer) clearInterval(progressTimer);
      modalContainer.innerHTML = '';
    };

    modalContainer.querySelector('#btn-close-ex-modal').addEventListener('click', close);
    modalContainer.querySelector('#btn-done-ex-modal').addEventListener('click', close);
    modalContainer.querySelector('#exercise-guide-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'exercise-guide-modal-overlay') close();
    });

    if (frames.length > 1) {
      startLoop();

      btnFrame0.addEventListener('click', () => {
        stopLoop();
        setFrame(0);
      });

      btnFrame1.addEventListener('click', () => {
        stopLoop();
        setFrame(1);
      });

      btnPlayToggle.addEventListener('click', () => {
        if (isPlaying) {
          stopLoop();
        } else {
          startLoop();
        }
      });
    }
  }

  openCheckoutCelebrationModal(workout) {
    const modalContainer = document.querySelector('#modal-container');
    const mins = Math.round(workout.durationSeconds / 60);

    modalContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-sheet checkout-celebration-card stone-panel">
          <div class="celebration-trophy">🏛️</div>
          <h2 class="celebration-title">TREINO CONSAGRADO!</h2>
          <div class="celebration-subtitle">Você venceu o dia no templo de ferro.</div>

          <div class="checkout-stats-recap">
            <div class="recap-box">
              <div class="recap-val">${mins} min</div>
              <div class="recap-lbl">Tempo Total</div>
            </div>
            <div class="recap-box">
              <div class="recap-val" style="color: var(--night-blue-accent);">${workout.totalWeightVolume.toLocaleString()} kg</div>
              <div class="recap-lbl">Volume Levantado</div>
            </div>
            <div class="recap-box">
              <div class="recap-val" style="color: var(--baby-pink);">${workout.completedExercisesCount}</div>
              <div class="recap-lbl">Exercícios Feitos</div>
            </div>
            <div class="recap-box">
              <div class="recap-val" style="color: var(--solar-gold);">+1 DIA 🔥</div>
              <div class="recap-lbl">Streak Atualizado</div>
            </div>
          </div>

          <p style="font-size: 0.8rem; color: var(--concrete-300); font-style: italic; margin-bottom: 24px;">
            “O descanso agora é o solo onde a sua força floresce.”
          </p>

          <button class="btn-enter-temple" id="btn-close-checkout">
            RETORNAR AO TEMPLO ⚡
          </button>
        </div>
      </div>
    `;

    modalContainer.querySelector('#btn-close-checkout').addEventListener('click', () => {
      modalContainer.innerHTML = '';
      this.switchTab('templo');
    });
  }
}

// Inicializa a aplicação assim que o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
  new AgiteMeApp();
});
