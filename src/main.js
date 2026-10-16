// Controlador Principal •
// Estética 
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
import { initPixelStars } from './components/pixelStars.js';
import { SplashService, ONBOARDING_SVGS } from './components/splashOnboarding.js';

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
    this.currentTab = 'treino';
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

  showCosmicModalAlert({ title = 'ORÁCULO NOTIFICA', message, type = 'success', onConfirm = null }) {
    // Remove qualquer outro alert ativo para evitar duplicidade
    document.querySelectorAll('.cosmic-alert-overlay').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'cosmic-alert-overlay';
    overlay.id = 'cosmic-alert-overlay';

    let iconSvg = '';
    if (type === 'warning') {
      iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    }

    overlay.innerHTML = `
      <div class="cosmic-alert-card">
        <div class="cosmic-alert-glow"></div>
        <div class="cosmic-alert-icon-ring ${type}">
          ${iconSvg}
        </div>
        <div class="cosmic-alert-title">${title}</div>
        <div class="cosmic-alert-message">${message}</div>
        <button type="button" class="cosmic-alert-btn" id="cosmic-alert-btn">
          <span>ENTENDIDO</span>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    sound.playTapSound();
    if ('vibrate' in navigator) navigator.vibrate(25);

    const closeAlert = () => {
      overlay.style.animation = 'cosmic-alert-fade-in 0.15s ease-in reverse forwards';
      setTimeout(() => {
        overlay.remove();
        if (onConfirm) onConfirm();
      }, 150);
    };

    overlay.querySelector('#cosmic-alert-btn')?.addEventListener('click', closeAlert);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAlert();
    });

    // Auto-fechamento suave após 3.5 segundos
    setTimeout(() => {
      if (document.body.contains(overlay)) closeAlert();
    }, 3500);
  }

  showCosmicConfirm({ title = 'CONFIRMAÇÃO', message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) {
    return new Promise((resolve) => {
      document.querySelectorAll('.cosmic-confirm-overlay').forEach(el => el.remove());

      const overlay = document.createElement('div');
      overlay.className = 'cosmic-confirm-overlay';

      const iconSvg = isDestructive
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

      overlay.innerHTML = `
        <div class="cosmic-confirm-card">
          <div class="cosmic-confirm-glow ${isDestructive ? 'destructive' : ''}"></div>
          <div class="cosmic-confirm-icon-ring ${isDestructive ? 'destructive' : ''}">
            ${iconSvg}
          </div>
          <div class="cosmic-confirm-title">${title}</div>
          <div class="cosmic-confirm-message">${message}</div>
          <div class="cosmic-confirm-actions">
            <button type="button" class="btn-cosmic-cancel" id="btn-confirm-cancel">
              ${cancelText}
            </button>
            <button type="button" class="btn-cosmic-confirm ${isDestructive ? 'destructive' : ''}" id="btn-confirm-ok">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      sound.playTapSound();
      if ('vibrate' in navigator) navigator.vibrate(20);

      const finish = (result) => {
        overlay.style.animation = 'cosmic-alert-fade-in 0.15s ease-in reverse forwards';
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 150);
      };

      overlay.querySelector('#btn-confirm-cancel')?.addEventListener('click', () => {
        sound.playTapSound();
        finish(false);
      });

      overlay.querySelector('#btn-confirm-ok')?.addEventListener('click', () => {
        sound.playTapSound();
        finish(true);
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) finish(false);
      });
    });
  }

  init() {
    // Intercepta window.alert para transformar em modal interno moderno no centro da tela
    window.alert = (msg) => {
      let type = 'success';
      let title = 'ORÁCULO NOTIFICA';
      if (typeof msg === 'string') {
        const lower = msg.toLowerCase();
        if (lower.includes('erro') || lower.includes('não foi possível') || lower.includes('inválido')) {
          type = 'error';
          title = 'ATENÇÃO';
        } else if (lower.includes('foto') || lower.includes('aura')) {
          title = 'AURA ATUALIZADA';
          type = 'success';
        } else if (lower.includes('sucesso') || lower.includes('bem-vindo')) {
          title = 'SANTUÁRIO SINCRONIZADO';
          type = 'success';
        } else if (lower.includes('saiu')) {
          title = 'DESCONECTADO';
          type = 'warning';
        }
      }
      this.showCosmicModalAlert({ title, message: msg, type });
    };

    this.setupStopwatch();
    this.bindNavigation();
    this.setupDrawerMenu();
    this.setupHeaderTimerLink();
    this.setupHeaderStreakLink();
    this.setupHeaderAvatar();
    this.initSupabaseAuth();
    this.updateHeaderStreak();

    // Exibe Splash Screen
    SplashService.show({
      onFinish: () => {
        if (!this.profile.isOnboarded) {
          this.openAppleOnboarding(0);
        }
      }
    });

    this.renderCurrentTab();
  }

  setupStopwatch() {
    this.stopwatch = new WorkoutStopwatch((formattedTime, elapsedSeconds) => {
      // Atualiza mostradores de cronômetro
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
        this.renderTreinoView(content);
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

        // Feedback de animação
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
        const rawName = (this.profile && this.profile.name) ? this.profile.name.trim() : '';
        if (!rawName) {
          initialsEl.textContent = '?';
          initialsEl.style.display = 'block';
        } else {
          const parts = rawName.split(/\s+/);
          const initials = parts.length > 1
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
          initialsEl.textContent = initials;
          initialsEl.style.display = 'block';
        }
      }
    }

    this.updateDrawerHeaderSubtitle();
  }

  updateDrawerHeaderSubtitle() {
    const subtitleEl = document.querySelector('#drawer-header-subtitle') || document.querySelector('.drawer-subtitle');
    if (subtitleEl) {
      const p = this.profile || StorageService.getProfile();
      const rawName = (p && p.name) ? p.name.trim() : '';
      const firstName = rawName ? rawName.split(/\s+/)[0] : 'Guerreiro';
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
          this.showCosmicModalAlert({
            title: 'FOTO ATUALIZADA',
            message: 'Foto do guerreiro atualizada com aura cósmica!',
            type: 'success'
          });
        } catch (err) {
          console.error('Erro ao processar foto:', err);
          this.showCosmicModalAlert({
            title: 'ERRO NA IMAGEM',
            message: 'Não foi possível carregar a imagem. Tente outra foto da sua galeria.',
            type: 'error'
          });
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
    const btnLogout = document.querySelector('#drawer-btn-logout');
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
            ? `<img src="${profile.avatarUrl}" alt="${profile.name || 'Avatar'}" style="width: 100%; height: 100%; object-fit: cover;" />`
            : `<span style="font-family: var(--font-hud); font-size: 0.95rem; color: #fff; font-weight: 700;">${(profile.name && profile.name.trim()) ? profile.name.trim()[0].toUpperCase() : '?'}</span>`}
              </div>
            </div>
            <div class="drawer-user-meta" style="flex: 1; min-width: 0;">
              <div class="drawer-user-name">${(profile.name && profile.name.trim()) ? profile.name : 'Guerreiro (Sem nome)'}</div>
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

    const btnDemo = document.querySelector('#drawer-btn-demo');
    if (btnDemo) {
      btnDemo.addEventListener('click', async () => {
        const ok = await this.showCosmicConfirm({
          title: 'CARREGAR DEMO',
          message: 'Deseja carregar histórico de treinos simulados para testar streaks e gráficos?',
          confirmText: 'Carregar Demo',
          cancelText: 'Cancelar'
        });
        if (ok) {
          StorageService.loadDemoData();
          closeDrawer();
          this.profile = StorageService.getProfile();
          this.updateHeaderStreak();
          this.updateHeaderAvatar();
          this.renderCurrentTab();
          this.showCosmicModalAlert({
            title: 'DEMONSTRAÇÃO CARREGADA',
            message: 'Histórico e metas de teste foram injetados com sucesso!',
            type: 'success'
          });
        }
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        closeDrawer();
        const ok = await this.showCosmicConfirm({
          title: 'DESLOGAR DO TEMPLO',
          message: 'Deseja realmente sair da sua conta e retornar à tela inicial de onboarding?',
          confirmText: 'Sim, Deslogar',
          cancelText: 'Permanecer',
          isDestructive: true
        });
        if (ok) {
          if (this.supabaseUser) {
            await SupabaseService.signOut();
          }
          this.profile.isOnboarded = false;
          this.profile.name = '';
          StorageService.saveProfile(this.profile);
          this.supabaseUser = null;
          this.updateHeaderAvatar();
          this.openAppleOnboarding(0);
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
                this.showCosmicModalAlert({
                  title: 'DADOS IMPORTADOS',
                  message: 'Backup restaurado com sucesso! Seus treinos e histórico estão ativos.',
                  type: 'success'
                });
                this.switchTab('templo');
              } else {
                this.showCosmicModalAlert({
                  title: 'ARQUIVO INVÁLIDO',
                  message: 'O arquivo JSON selecionado não contém um formato de backup válido.',
                  type: 'error'
                });
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
  // VIEW 5: TEMPLO (& PERFIL)
  // ==========================================
  renderTemploView(container) {
    const p = this.profile || StorageService.getProfile();
    const stats = StorageService.getStats();
    const history = StorageService.getHistory();
    const isBioConfigured = Boolean(p.hasConfiguredBio);
    const weightDisplay = (isBioConfigured && p.weight) ? `${p.weight} kg` : '-- kg';
    const heightDisplay = (isBioConfigured && p.height) ? `${p.height} cm` : '-- cm';
    const imc = (isBioConfigured && p.weight && p.height) ? (p.weight / ((p.height / 100) * (p.height / 100))).toFixed(1) : '--';
    const goalFreqText = (isBioConfigured && p.goal)
      ? `${p.goal.toUpperCase()} • ${p.frequency || 4}x / SEMANA`
      : 'Métricas pendentes';

    // Cálculo de Patente Cósmica / Gamificação
    let rankLevel = 1;
    let rankTitle = 'Iniciado';
    let rankBadgeColor = '#38bdf8';
    let rankBadgeSVG = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(56,189,248,0.7));">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(56,189,248,0.15)"/>
        <path d="M12 8v8"/>
        <path d="M8 12h8"/>
      </svg>
    `;
    let rankProgress = Math.min(100, Math.round((stats.totalWorkouts / 5) * 100));
    let nextRankText = `${Math.max(1, 5 - stats.totalWorkouts)} treinos para Guerreiro de Aço`;

    if (stats.totalWorkouts >= 30) {
      rankLevel = 4;
      rankTitle = 'Titã';
      rankBadgeColor = '#c084fc';
      rankBadgeSVG = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(192,132,252,0.8));">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(192,132,252,0.25)"/>
        </svg>
      `;
      rankProgress = 100;
      nextRankText = 'Grau Máximo de Glória Atingido';
    } else if (stats.totalWorkouts >= 15) {
      rankLevel = 3;
      rankTitle = 'Guardião do Templo';
      rankBadgeColor = '#ec4899';
      rankBadgeSVG = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(236,72,153,0.8));">
          <path d="M2 9.5L12 4l10 5.5v1H2v-1z" fill="rgba(236,72,153,0.15)"/>
          <line x1="6" y1="11" x2="6" y2="18"/>
          <line x1="10" y1="11" x2="10" y2="18"/>
          <line x1="14" y1="11" x2="14" y2="18"/>
          <line x1="18" y1="11" x2="18" y2="18"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
          <line x1="2" y1="21" x2="22" y2="21"/>
        </svg>
      `;
      rankProgress = Math.min(100, Math.round(((stats.totalWorkouts - 15) / 15) * 100));
      nextRankText = `${30 - stats.totalWorkouts} treinos para Titã do Cosmos`;
    } else if (stats.totalWorkouts >= 5) {
      rankLevel = 2;
      rankTitle = 'Guerreiro de Aço';
      rankBadgeColor = '#fbbf24';
      rankBadgeSVG = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(251,191,36,0.8));">
          <line x1="6" y1="18" x2="18" y2="6"/>
          <polyline points="13 6 18 6 18 11"/>
          <line x1="4" y1="16" x2="8" y2="20"/>
          <line x1="18" y1="18" x2="6" y2="6"/>
          <polyline points="11 6 6 6 6 11"/>
          <line x1="20" y1="16" x2="16" y2="20"/>
        </svg>
      `;
      rankProgress = Math.min(100, Math.round(((stats.totalWorkouts - 5) / 10) * 100));
      nextRankText = `${15 - stats.totalWorkouts} treinos para Guardião do Templo`;
    }

    // Insígnias / Badges
    const badges = [
      {
        id: 'first-workout',
        iconSVG: `
          <img src="./favicon.png" alt="Primeiro Templo" style="width: 26px; height: 26px; border-radius: 8px; object-fit: contain; filter: drop-shadow(0 0 6px rgba(56,189,248,0.6)); display: block;" />
        `,
        title: 'Primeiro Templo',
        desc: 'Completou o 1º treino no templo',
        unlocked: stats.totalWorkouts >= 1
      },
      {
        id: 'streak-flame',
        iconSVG: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" fill="rgba(249,115,22,0.25)"/>
          </svg>
        `,
        title: 'Chama Viva',
        desc: 'Manteve streak de 3+ dias',
        unlocked: stats.currentStreak >= 3 || stats.bestStreak >= 3
      },
      {
        id: 'tita-force',
        iconSVG: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 5v14"/>
            <path d="M18 5v14"/>
            <path d="M2 9v6"/>
            <path d="M22 9v6"/>
            <path d="M2 12h20"/>
            <rect x="5" y="7" width="2" height="10" rx="1" fill="rgba(236,72,153,0.3)"/>
            <rect x="17" y="7" width="2" height="10" rx="1" fill="rgba(236,72,153,0.3)"/>
          </svg>
        `,
        title: 'Força de Titã',
        desc: 'Ergueu 5+ toneladas em carga',
        unlocked: stats.totalVolumeKg >= 5000
      },
      {
        id: 'communion',
        iconSVG: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3" fill="rgba(192,132,252,0.35)"/>
          </svg>
        `,
        title: 'Comunhão',
        desc: 'Consultou a sabedoria do Oráculo',
        unlocked: (StorageService.getChatHistory().length > 1 || StorageService.getChatSessions().length > 0)
      }
    ];

    container.innerHTML = `
      <div style="padding: 16px 18px 80px;">
        <!-- Cabeçalho do Templo -->
        <div style="margin-bottom: 14px;">
          <h2 style="font-family: var(--font-carved); font-size: 1.35rem; color: #fff; margin-bottom: 2px;">
            MEU TEMPLO
          </h2>
          <p style="font-size: 0.78rem; color: var(--concrete-300);">
            Seu santuário pessoal, perfil, insígnias e conquistas sagradas.
          </p>
        </div>

        <!-- 1. SABEDORIA DO DIA (Topo do Templo) -->
        <section class="energy-oracle-banner" style="margin-bottom: 14px;">
          <div class="oracle-banner-header">
            <div class="oracle-tag-group">
              <span class="oracle-icon-quote" style="display: inline-flex; align-items: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--baby-pink)" style="filter: drop-shadow(0 0 6px var(--baby-pink));">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </span>
              <span class="oracle-quote-tag">SABEDORIA DO DIA</span>
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

        <!-- 2. CARTÃO DE PERFIL DO GUERREIRO (Métricas kg, cm, IMC) -->
        <div class="stone-panel" style="margin-bottom: 14px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(14, 16, 24, 0.85); box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <div class="templo-warrior-card-header">
            <div class="warrior-header-left">
              <h3 class="warrior-header-title">
                ${(p.name && p.name.trim()) ? p.name : 'Guerreiro Cósmico'}
              </h3>
              <div class="warrior-header-sub">
                ${isBioConfigured ? `
                  <span class="warrior-sub-configured">${goalFreqText}</span>
                ` : `
                  <span class="warrior-sub-pending">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Métricas pendentes
                  </span>
                `}
              </div>
            </div>
            <button id="btn-edit-profile" class="templo-edit-profile-btn" type="button" title="Editar medidas corporais e preferências">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span>Editar Perfil</span>
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; background: rgba(0,0,0,0.35); padding: 10px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
            <div>
              <div style="font-family: var(--font-hud); font-size: 1.1rem; color: #fff;">${weightDisplay}</div>
              <div style="font-size: 0.65rem; color: var(--concrete-400); text-transform: uppercase;">Peso</div>
            </div>
            <div>
              <div style="font-family: var(--font-hud); font-size: 1.1rem; color: #fff;">${heightDisplay}</div>
              <div style="font-size: 0.65rem; color: var(--concrete-400); text-transform: uppercase;">Altura</div>
            </div>
            <div>
              <div style="font-family: var(--font-hud); font-size: 1.1rem; color: #ffffff;">${imc}</div>
              <div style="font-size: 0.65rem; color: var(--concrete-400); text-transform: uppercase;">IMC</div>
            </div>
          </div>
        </div>

        <!-- 3. PATENTE CÓSMICA / NÍVEL DO GUERREIRO -->
        <div class="stone-panel" style="margin-bottom: 14px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="cosmic-rank-badge-live" id="templo-rank-badge" style="--badge-glow: ${rankBadgeColor};" title="Sua insígnia de patente cósmica atual (Toque para canalizar!)">
                ${rankBadgeSVG}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 0.65rem; color: var(--concrete-400); text-transform: uppercase; font-family: var(--font-hud); letter-spacing: 1px;">
                    PATENTE
                  </span>
                  <span style="font-size: 0.62rem; padding: 1px 6px; border-radius: 4px; background: rgba(56,189,248,0.12); color: #7dd3fc; font-weight: 700; font-family: var(--font-hud);">
                    GRAU ${rankLevel}/4
                  </span>
                </div>
                <div style="font-family: var(--font-serif); font-size: 1.22rem; font-weight: 700; color: #fff; margin-top: 1px; letter-spacing: 0.2px;">
                  ${rankTitle}
                </div>
              </div>
            </div>
            <button id="btn-rank-info-modal" type="button" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--concrete-300); border-radius: 999px; padding: 5px 12px; font-size: 0.68rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Entender o sistema de patentes e insígnias">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Como funciona?</span>
            </button>
          </div>

          <p style="font-size: 0.74rem; color: var(--concrete-300); margin: 0 0 12px; line-height: 1.4;">
            Sua <strong>graduação marcial contínua</strong>. Evolui a cada treino concluído no app, forjando um novo brasão sagrado de maestria.
          </p>

          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; margin-bottom: 6px;">
            <div style="height: 100%; width: ${rankProgress}%; background: linear-gradient(90deg, #38bdf8, #ec4899); border-radius: 999px; transition: width 0.4s ease;"></div>
          </div>
          <div style="font-size: 0.68rem; color: var(--concrete-400); display: flex; justify-content: space-between;">
            <span>Evolução</span>
            <span style="color: #fff; font-weight: 600;">${nextRankText}</span>
          </div>
        </div>

        <!-- 4. VITRINE DE INSÍGNIAS CÓSMICAS (Design Mobile Impecável & Favicon Sagrado) -->
        <div class="stone-panel" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.72rem; color: var(--concrete-300); text-transform: uppercase; font-family: var(--font-hud); letter-spacing: 1px; font-weight: 700;">
                INSÍGNIAS & CONQUISTAS
              </span>
            </div>
            <span style="font-size: 0.7rem; color: var(--neon-cyan); font-weight: 700;">
              ${badges.filter(b => b.unlocked).length}/${badges.length} desbloqueadas
            </span>
          </div>

          <p style="font-size: 0.72rem; color: var(--concrete-400); margin: 0 0 12px; line-height: 1.4;">
            <strong>Medalhas de honra</strong> concedidas por cumprir feitos específicos de constância, carga e exploração.
          </p>

          <div class="templo-badges-list">
            ${badges.map(b => `
              <div class="templo-badge-card ${b.unlocked ? 'unlocked' : 'locked'}" data-badge-id="${b.id}" title="Toque para ver detalhes da conquista">
                <div class="templo-badge-left">
                  <div class="templo-badge-icon-box">
                    ${b.iconSVG}
                  </div>
                  <div class="templo-badge-info">
                    <div class="templo-badge-title">${b.title}</div>
                    <div class="templo-badge-desc">${b.desc}</div>
                  </div>
                </div>
                <div class="templo-badge-status-pill ${b.unlocked ? 'unlocked' : 'locked'}">
                  ${b.unlocked ? `
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Conquistada</span>
                  ` : `
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Bloqueada</span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Eventos do Templo
    const rankBadgeEl = container.querySelector('#templo-rank-badge');
    if (rankBadgeEl) {
      rankBadgeEl.addEventListener('click', () => {
        sound.playTapSound();
        if ('vibrate' in navigator) navigator.vibrate([25, 35, 45]);
        rankBadgeEl.style.transform = 'scale(1.22) rotate(8deg)';
        setTimeout(() => {
          rankBadgeEl.style.transform = '';
        }, 250);
      });
    }

    const btnEditProfile = container.querySelector('#btn-edit-profile');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        this.openProfileManagerModal();
      });
    }

    const btnRankInfo = container.querySelector('#btn-rank-info-modal');
    if (btnRankInfo) {
      btnRankInfo.addEventListener('click', () => {
        sound.playTapSound();
        if ('vibrate' in navigator) navigator.vibrate([20, 25]);
        btnRankInfo.style.transform = 'scale(0.92)';
        setTimeout(() => {
          btnRankInfo.style.transform = '';
          this.openHonorSystemModal();
        }, 120);
      });
    }

    // Modal de Insígnias Cósmicas: quebra de linha no Status, estilização diferenciada 
    container.querySelectorAll('.templo-badge-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-badge-id');
        const badge = badges.find(b => b.id === id);
        if (badge) {
          sound.playTapSound();
          if ('vibrate' in navigator) navigator.vibrate(25);
          
          const statusTitle = badge.unlocked ? 'STATUS: DESBLOQUEADA' : 'STATUS: BLOQUEADA';
          const statusText = badge.unlocked
            ? 'Consagrada no santuário através dos seus treinos no templo.'
            : 'Bloqueada no momento. Continue treinando para forjar este feito marcial.';
          const statusColor = badge.unlocked ? '#38bdf8' : 'var(--concrete-400)';
          const statusBg = badge.unlocked ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)';
          const statusBorder = badge.unlocked ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)';

          const badgeHtml = `
            <div style="font-size: 0.85rem; color: var(--concrete-300); margin-bottom: 14px; line-height: 1.45;">
              ${badge.desc}.
            </div>
            <div style="padding: 10px 14px; border-radius: 10px; background: ${statusBg}; border: 1px solid ${statusBorder}; text-align: left;">
              <div style="font-size: 0.65rem; color: ${statusColor}; text-transform: uppercase; font-family: var(--font-hud); letter-spacing: 1px; font-weight: 800; margin-bottom: 4px;">
                ${statusTitle}
              </div>
              <div style="font-size: 0.78rem; color: #ffffff; line-height: 1.4;">
                ${statusText}
              </div>
            </div>
          `;

          this.showCosmicModalAlert({
            title: badge.title.toUpperCase(),
            message: badgeHtml,
            type: badge.unlocked ? 'success' : 'info'
          });
        }
      });
    });

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
  }

  // ==========================================
  // VIEW 2: TREINO ATIVO & CRONÔMETRO
  // ==========================================
  renderTreinoView(container) {
    const p = this.profile || StorageService.getProfile();

    if (!this.activeSession) {
      // Saudação dinâmica baseada no horário do dia e no nome do usuário
      const currentHour = new Date().getHours();
      let greetingTime = 'Olá';
      if (currentHour >= 5 && currentHour < 12) {
        greetingTime = 'Bom dia';
      } else if (currentHour >= 12 && currentHour < 18) {
        greetingTime = 'Boa tarde';
      } else {
        greetingTime = 'Boa noite';
      }

      const rawName = (p.name && p.name.trim()) ? p.name.trim() : '';
      const isNamed = rawName && rawName.toLowerCase() !== 'guerreiro (sem nome)' && rawName.toLowerCase() !== 'guerreiro cósmico';
      const displayName = isNamed ? rawName : 'Guerreiro(a)';

      // Nenhum treino em andamento: exibe seletor de rotina para iniciar
      container.innerHTML = `
        <div style="padding: 16px 18px 28px; text-align: center;">
          <!-- Totem do Portal Cósmico Interativo com Anéis Orbitais e Favicon Sagrado -->
          <div class="portal-totem-wrapper">
            <div class="portal-totem-interactive" id="treino-portal-totem" title="Toque para canalizar a energia cósmica!">
              <div class="totem-aura-glow"></div>
              <div class="totem-orbital-ring"></div>
              <div class="totem-center-arch">
                <img src="./favicon.png" alt="Portal Cósmico" class="totem-favicon-img" />
              </div>
            </div>
            
            <div style="margin-top: 10px;">
              <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); font-size: 0.68rem; color: #e2e8f0; font-weight: 700; letter-spacing: 0.5px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>
                </svg>
                Seja bem vindo ao Oráculo
              </span>
            </div>
          </div>

          <h2 style="font-family: var(--font-carved); font-size: 1.4rem; color: #fff; margin-bottom: 4px; letter-spacing: 0.5px;">
            ${greetingTime}, ${displayName}!
          </h2>
          <p style="font-size: 0.82rem; color: var(--concrete-300); margin-bottom: 22px;">
            Escolha seu portal do dia para iniciar o treino.
          </p>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${(() => {
              const routineMetaConfig = {
                'portal-a': {
                  accent: '#38bdf8',
                  glow: 'rgba(56, 189, 248, 0.35)',
                  badgeBg: 'rgba(56, 189, 248, 0.12)',
                  badgeBorder: 'rgba(56, 189, 248, 0.35)',
                  svgGlyph: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 11h8"/><path d="M12 7v8"/></svg>`,
                  muscles: ['Peitoral', 'Deltoides', 'Tríceps'],
                  focusTag: 'EMPURRAR • FORÇA SUPERIOR',
                  setsEstimate: '~15 Séries'
                },
                'portal-b': {
                  accent: '#ec4899',
                  glow: 'rgba(236, 72, 153, 0.35)',
                  badgeBg: 'rgba(236, 72, 153, 0.12)',
                  badgeBorder: 'rgba(236, 72, 153, 0.35)',
                  svgGlyph: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14"/><path d="M18 5v14"/><path d="M2 12h20"/><rect x="5" y="7" width="2" height="10" rx="1" fill="rgba(236,72,153,0.3)"/><rect x="17" y="7" width="2" height="10" rx="1" fill="rgba(236,72,153,0.3)"/></svg>`,
                  muscles: ['Costas', 'Bíceps', 'Core'],
                  focusTag: 'PUXAR • EXPANSÃO DORSAL',
                  setsEstimate: '~12 Séries'
                },
                'portal-c': {
                  accent: '#fbbf24',
                  glow: 'rgba(251, 191, 36, 0.35)',
                  badgeBg: 'rgba(251, 191, 36, 0.12)',
                  badgeBorder: 'rgba(251, 191, 36, 0.35)',
                  svgGlyph: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(251,191,36,0.25)"/></svg>`,
                  muscles: ['Quadríceps', 'Posteriores', 'Pilares'],
                  focusTag: 'PERNAS • BASE DE CONCRETO',
                  setsEstimate: '~14 Séries'
                }
              };

              const currentRoutines = StorageService.getRoutines();

              return currentRoutines.map(routine => {
                const meta = routineMetaConfig[routine.id] || {
                  accent: routine.color || '#38bdf8',
                  glow: 'rgba(56, 189, 248, 0.3)',
                  badgeBg: 'rgba(56, 189, 248, 0.1)',
                  badgeBorder: 'rgba(56, 189, 248, 0.25)',
                  svgGlyph: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
                  muscles: ['Geral', 'Força'],
                  focusTag: routine.subtitle || 'PORTAL SAGRADO',
                  setsEstimate: '~12 Séries'
                };

                return `
                  <div class="portal-living-card" data-routine-id="${routine.id}" style="--portal-accent: ${meta.accent}; --portal-glow: ${meta.glow}; --portal-badge-bg: ${meta.badgeBg}; --portal-badge-border: ${meta.badgeBorder};" title="Toque para iniciar ${routine.title}">
                    <div class="portal-ambient-glow"></div>

                    <!-- Barra Superior do Portal -->
                    <div class="portal-top-bar">
                      <div class="portal-badge-chip">
                        <span class="portal-glyph-slot">${meta.svgGlyph}</span>
                        <span>${routine.code}</span>
                      </div>
                      <div class="portal-time-chip">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="9"/>
                          <polyline points="12 6 12 12 15 15"/>
                        </svg>
                        <span>~${routine.durationMin} min</span>
                      </div>
                    </div>

                    <!-- Título e Subtítulo -->
                    <div class="portal-title-row">
                      <div class="portal-living-subtitle">${meta.focusTag}</div>
                      <h3 class="portal-living-title">${routine.title}</h3>
                    </div>

                    <p class="portal-living-desc">${routine.description}</p>

                    <!-- Tags de Grupos Musculares Alvo -->
                    <div class="portal-muscle-tags">
                      ${meta.muscles.map(m => `
                        <span class="portal-muscle-pill">
                          <span class="portal-muscle-dot"></span>
                          ${m}
                        </span>
                      `).join('')}
                    </div>

                    <!-- Metadados de Exercícios & Séries -->
                    <div class="portal-meta-bar">
                      <span>Volume Estimado: <strong class="portal-meta-highlight">${routine.exercises ? routine.exercises.length : 4} Exercícios</strong></span>
                      <span>Séries: <strong class="portal-meta-highlight">${meta.setsEstimate}</strong></span>
                    </div>

                    <!-- Lista/Accordion de Exercícios do Portal com Opção de Troca Manual -->
                    <div class="portal-exercises-preview" onclick="event.stopPropagation()">
                      <div class="portal-exercises-preview-header">
                        <span class="portal-ex-preview-title">MOVIMENTOS DO PORTAL (${routine.exercises ? routine.exercises.length : 0})</span>
                        <button class="btn-toggle-portal-exercises" data-toggle-portal-ex="${routine.id}" type="button">
                          <span>Personalizar</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                      </div>
                      <div class="portal-exercises-list hidden" id="portal-ex-list-${routine.id}">
                        ${(routine.exercises || []).map((exItem, exIdx) => {
                          const exData = EXERCISES.find(e => e.id === exItem.exerciseId) || { name: exItem.exerciseId, equipment: 'Aparelho' };
                          return `
                            <div class="portal-ex-item-row">
                              <div class="portal-ex-item-info">
                                <span class="portal-ex-item-num">${exIdx + 1}</span>
                                <div class="portal-ex-item-text">
                                  <span class="portal-ex-item-name">${exData.name}</span>
                                  <span class="portal-ex-item-detail">${exItem.sets} séries • ${exItem.reps} reps • ${exData.equipment || ''}</span>
                                </div>
                              </div>
                              <button class="btn-portal-swap-ex" data-portal-id="${routine.id}" data-old-ex-id="${exItem.exerciseId}" type="button" title="Trocar este exercício">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                                Trocar
                              </button>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>

                    <!-- Botão de Iniciar Portal com Shimmer e Seta -->
                    <button class="portal-launch-btn" type="button" data-start-routine="${routine.id}">
                      <span>INICIAR ESTE PORTAL</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </div>
                `;
              }).join('');
            })()}
          </div>
        </div>
      `;

      // Interação tátil no Totem 
      const totem = container.querySelector('#treino-portal-totem');
      if (totem) {
        totem.addEventListener('click', () => {
          sound.playTapSound();
          if ('vibrate' in navigator) navigator.vibrate([30, 40, 50]);
          totem.style.transform = 'scale(1.15) rotate(8deg)';
          setTimeout(() => {
            totem.style.transform = '';
          }, 350);
        });
      }

      // Eventos de Personalização de Exercícios no Portal
      container.querySelectorAll('[data-toggle-portal-ex]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rId = btn.getAttribute('data-toggle-portal-ex');
          const listEl = container.querySelector(`#portal-ex-list-${rId}`);
          if (listEl) {
            listEl.classList.toggle('hidden');
            const isExpanded = !listEl.classList.contains('hidden');
            const labelSpan = btn.querySelector('span');
            if (labelSpan) labelSpan.textContent = isExpanded ? 'Recolher' : 'Personalizar';
            sound.playTapSound();
          }
        });
      });

      container.querySelectorAll('.btn-portal-swap-ex').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const portalId = btn.getAttribute('data-portal-id');
          const oldExId = btn.getAttribute('data-old-ex-id');
          this.openRoutineExerciseSwapModal(portalId, oldExId, container);
        });
      });

      const launchRoutine = (rId) => {
        sound.playTapSound();
        if ('vibrate' in navigator) navigator.vibrate([25, 35]);
        const userRoutines = StorageService.getRoutines();
        const picked = userRoutines.find(r => r.id === rId);
        if (picked) {
          this.startWorkoutSession(picked);
          this.renderTreinoView(container);
        }
      };

      container.querySelectorAll('.portal-living-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // Se clicou na área de personalização ou botões, ignora lançamento acidental
          if (e.target.closest('.portal-exercises-preview') || e.target.closest('button')) return;
          const rId = card.getAttribute('data-routine-id');
          launchRoutine(rId);
        });
      });

      container.querySelectorAll('[data-start-routine]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rId = btn.getAttribute('data-start-routine');
          launchRoutine(rId);
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      Como Fazer
                    </button>
                    <button class="btn-oracle-swap" data-swap-exercise="${exIndex}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      Trocar com IA
                    </button>
                  </div>
                </div>
                <div class="exercise-sub-row">
                  <span class="muscle-tag" style="display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                    ${exData.muscleLabel}
                  </span>
                  <span class="equip-tag"> ${displayEquip}</span>
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

    // 4. Substituir Exercício com Gemini
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

    // 5. Finalizar Treino (Check-out)
    const finishBtn = container.querySelector('#btn-finish-workout');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.openCheckoutConfirmModal();
      });
    }
  }

  // Modal de Confirmação In-App do Check-out 
  openCheckoutConfirmModal() {
    const modalContainer = document.querySelector('#modal-container');
    const title = this.activeSession?.routineTitle || 'Treino Cósmico';

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="checkout-confirm-overlay">
        <div class="modal-sheet stone-panel checkout-celebration-card" style="text-align: center; max-width: 380px;">
          <div style="margin-bottom: 12px; display: flex; justify-content: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(56, 189, 248, 0.25);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </div>
          </div>
          <h2 class="celebration-title" style="margin-bottom: 6px;">FAZER CHECK-OUT?</h2>
          <div class="celebration-subtitle" style="margin-bottom: 16px;">
            Deseja finalizar o <strong>${title}</strong>, registrar as cargas e consagrar seu Streak?
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
            <button class="btn-enter-temple" id="btn-confirm-checkout" style="padding: 13px; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              SIM, CONSAGRAR TREINO!
            </button>
            <button class="btn-exercise-guide" id="btn-cancel-checkout" style="justify-content: center; padding: 10px;">
              Continuar Treinando
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

  // Modal de Personalização de Exercícios no Portal (Antes de Iniciar o Treino)
  openRoutineExerciseSwapModal(portalId, oldExId, container) {
    const modalContainer = document.querySelector('#modal-container');
    const currentEx = EXERCISES.find(e => e.id === oldExId) || { id: oldExId, name: oldExId, muscle: 'peito', muscleLabel: 'Geral', equipment: 'Equipamento' };
    const userRoutines = StorageService.getRoutines();
    const routine = userRoutines.find(r => r.id === portalId);
    const routineTitle = routine ? routine.title : 'Portal';

    // Alternativas do mesmo grupo muscular
    const alternatives = EXERCISES.filter(e => e.muscle === currentEx.muscle && e.id !== currentEx.id);
    let selectedExId = alternatives.length > 0 ? alternatives[0].id : '';

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="swap-exercise-overlay">
        <div class="swap-modal-sheet">
          <div class="modal-handle-bar"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); display: flex; align-items: center; justify-content: center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              </div>
              <div>
                <h3 style="font-family: var(--font-hud); font-size: 0.85rem; color: #fff; letter-spacing: 1.2px; text-transform: uppercase; margin: 0;">
                  PERSONALIZAR MOVIMENTO
                </h3>
                <small style="color: var(--concrete-300); font-size: 0.68rem;">${routineTitle}</small>
              </div>
            </div>
            <button id="btn-close-swap-modal" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <div class="swap-card-comparison" style="margin-top: 4px;">
            <div class="swap-box-current">
              <span class="swap-label-tag">MOVIMENTO ATUAL</span>
              <div class="swap-item-name">${currentEx.name}</div>
              <div class="swap-item-equip">Aparelho: ${currentEx.equipment} • Foco: ${currentEx.muscleLabel}</div>
            </div>
          </div>

          <div class="swap-alternatives-section">
            <div class="swap-alternatives-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              SELECIONE A ALTERNATIVA (${alternatives.length} DISPONÍVEIS)
            </div>
            <div class="swap-catalog-grid" id="swap-catalog-options">
              ${alternatives.map((alt, idx) => `
                <div class="swap-option-card ${idx === 0 ? 'selected' : ''}" data-alt-id="${alt.id}">
                  <div class="swap-option-radio"></div>
                  <div class="swap-option-details">
                    <span class="swap-option-name">${alt.name}</span>
                    <span class="swap-option-equip">${alt.equipment} • ${alt.targetGroup}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="swap-modal-actions">
            <button class="btn-enter-temple" id="btn-confirm-routine-swap" style="padding: 12px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              CONFIRMAR ALTERAÇÃO NO PORTAL
            </button>
            <button class="btn-exercise-guide" id="btn-cancel-routine-swap" style="justify-content: center; padding: 10px;">
              Manter Exercício Atual
            </button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#btn-close-swap-modal').addEventListener('click', close);
    modalContainer.querySelector('#btn-cancel-routine-swap').addEventListener('click', close);
    modalContainer.querySelector('#swap-exercise-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'swap-exercise-overlay') close();
    });

    // Seleção de cards
    modalContainer.querySelectorAll('.swap-option-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playTapSound();
        modalContainer.querySelectorAll('.swap-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedExId = card.getAttribute('data-alt-id');
      });
    });

    // Confirmação
    modalContainer.querySelector('#btn-confirm-routine-swap').addEventListener('click', () => {
      if (!selectedExId) return;
      StorageService.swapExerciseInRoutine(portalId, oldExId, selectedExId);
      sound.playCheckSound();
      if ('vibrate' in navigator) navigator.vibrate(60);
      close();
      this.renderTreinoView(container);
    });
  }

  // Modal Interativo de Substituição com IA Gemini + Catálogo Manual
  openExerciseSwapModal(exIdx, currentExItem, exObj, container) {
    const modalContainer = document.querySelector('#modal-container');
    const currentName = currentExItem.exerciseName || exObj.name;
    const currentEquip = currentExItem.exerciseEquipment || exObj.equipment;

    // Renderiza o modal em estado inicial de carregamento
    modalContainer.innerHTML = `
      <div class="modal-overlay" id="swap-exercise-overlay">
        <div class="swap-modal-sheet">
          <div class="modal-handle-bar"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); display: flex; align-items: center; justify-content: center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <div>
                <h3 style="font-family: var(--font-hud); font-size: 0.85rem; color: #fff; letter-spacing: 1.2px; text-transform: uppercase; margin: 0;">
                  ADAPTAÇÃO DE MOVIMENTO
                </h3>
                <small style="color: var(--concrete-300); font-size: 0.68rem;">Oráculo IA + Catálogo de Biomecânica</small>
              </div>
            </div>
            <button id="btn-close-swap-modal" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <div id="swap-modal-content">
            <div class="swap-modal-loading">
              <div class="swap-orb-pulse"></div>
              <div style="font-size: 0.88rem; color: #ffffff; font-weight: 600;">Sintonizando frequências do templo...</div>
              <div style="font-size: 0.74rem; color: var(--concrete-300);">Calculando alternativas biomecânicas para "${currentName}"</div>
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

      const alternatives = EXERCISES.filter(e => e.muscle === exObj.muscle && e.id !== exObj.id);
      let selectedEx = EXERCISES.find(e => e.name.toLowerCase() === suggestion.alternativeName.toLowerCase()) || alternatives[0] || exObj;

      contentEl.innerHTML = `
        <div class="swap-card-comparison">
          <div class="swap-box-current">
            <span class="swap-label-tag">EXERCÍCIO ATUAL</span>
            <div class="swap-item-name">${currentName}</div>
            <div class="swap-item-equip">Aparelho: ${currentEquip}</div>
          </div>

          <div class="swap-box-suggested swap-option-card selected" id="ai-suggested-card" data-alt-id="${selectedEx.id}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="swap-label-tag" style="display: inline-flex; align-items: center; gap: 4px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                SUGESTÃO PRINCIPAL DO ORÁCULO
              </span>
              <div class="swap-option-radio"></div>
            </div>
            <div class="swap-item-name">${suggestion.alternativeName}</div>
            <div class="swap-item-equip">Aparelho / Acessório: ${suggestion.equipment}</div>
          </div>
        </div>

        <div class="swap-reason-box">
          <div class="swap-reason-title" style="display: flex; align-items: center; gap: 5px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.5.7 2.8 1.8 3.7C8.6 11.2 8 12.5 8 14v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1c0-1.5-.6-2.8-1.3-3.8 1.1-.9 1.8-2.2 1.8-3.7A4.5 4.5 0 0 0 12 2z"/>
            </svg>
            ANÁLISE BIOMECÂNICA:
          </div>
          <div class="swap-reason-text">${suggestion.reason}</div>
        </div>

        ${alternatives.length > 1 ? `
          <div class="swap-alternatives-section">
            <div class="swap-alternatives-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              OU ESCOLHA OUTRO DO CATÁLOGO (${alternatives.length} OPÇÕES)
            </div>
            <div class="swap-catalog-grid">
              ${alternatives.filter(alt => alt.id !== selectedEx.id).map(alt => `
                <div class="swap-option-card" data-alt-id="${alt.id}">
                  <div class="swap-option-radio"></div>
                  <div class="swap-option-details">
                    <span class="swap-option-name">${alt.name}</span>
                    <span class="swap-option-equip">${alt.equipment} • ${alt.targetGroup}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="swap-modal-actions">
          <button class="btn-enter-temple" id="btn-apply-swap" style="padding: 12px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            CONFIRMAR SUBSTITUIÇÃO NO TREINO
          </button>
          <button class="btn-exercise-guide" id="btn-cancel-swap" style="justify-content: center; padding: 10px;">
            Manter Exercício Atual
          </button>
        </div>
      `;

      // Seleção entre a sugestão do Oráculo ou os outros cards do catálogo
      contentEl.querySelectorAll('.swap-option-card').forEach(card => {
        card.addEventListener('click', () => {
          sound.playTapSound();
          contentEl.querySelectorAll('.swap-option-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          const altId = card.getAttribute('data-alt-id');
          selectedEx = EXERCISES.find(e => e.id === altId) || selectedEx;
        });
      });

      contentEl.querySelector('#btn-cancel-swap').addEventListener('click', close);
      contentEl.querySelector('#btn-apply-swap').addEventListener('click', () => {
        const oldExId = currentExItem.exerciseId || exObj.id;
        currentExItem.exerciseId = selectedEx.id;
        currentExItem.exerciseName = selectedEx.name;
        currentExItem.exerciseEquipment = selectedEx.equipment;
        StorageService.saveActiveSession(this.activeSession);

        if (this.activeSession.routineId) {
          StorageService.swapExerciseInRoutine(this.activeSession.routineId, oldExId, selectedEx.id);
        }

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
  // VIEW 4: HISTÓRICO & STREAKS 
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

        <!-- Estatísticas Visuais Pro no Topo (Cards com Medidores Gráficos) -->
        <div class="stats-grid-row-pro">
          <!-- Card 1: Medidor de Chama Sagrada (Streak) -->
          <div class="stat-metric-card-pro">
            <div class="stat-pro-visual">
              <svg width="42" height="42" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="18" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2.5" />
                <circle cx="21" cy="21" r="18" fill="none" stroke="url(#flameRingGrad)" stroke-width="2.8" stroke-dasharray="113" stroke-dashoffset="${Math.max(10, 113 - Math.min(100, ((stats.bestStreak || 1) / 7) * 113))}" stroke-linecap="round" transform="rotate(-90 21 21)" />
                <defs>
                  <linearGradient id="flameRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ef4444" />
                    <stop offset="50%" stop-color="#f97316" />
                    <stop offset="100%" stop-color="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <div style="position: absolute; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 0 5px rgba(249,115,22,0.9));">
                  <path d="M12 2C9.5 5.5 8 8.5 8 11.5c0 1.2.3 2.3.8 3.2-1.3-.8-2.3-2.1-2.8-3.7C4.8 12.5 4 14.7 4 17c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-2.5-7.5-5-10.5-.5 2-1.5 3.5-3 4.5.3-2.5 0-5.5-2-9z" fill="url(#flameRingGrad)"/>
                  <path d="M12 14c-1.5 1.5-2 3-2 4.5 0 2.2 1.8 3.5 3 3.5s3-1.3 3-3.5c0-1.8-1-3.2-2-4.5-.5-.7-1.5-.7-2 0z" fill="#fef08a"/>
                </svg>
              </div>
            </div>
            <div class="stat-pro-val" style="color: #fbbf24;">${stats.bestStreak}d</div>
            <div class="stat-pro-lbl">Recorde Streak</div>
            <span class="stat-pro-subtag" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
              </svg>
              Atual: ${stats.currentStreak}d
            </span>
          </div>

          <!-- Card 2: Dial Cósmico de Tempo (Minutos) -->
          <div class="stat-metric-card-pro">
            <div class="stat-pro-visual">
              <svg width="42" height="42" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="18" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2.5" />
                <circle cx="21" cy="21" r="18" fill="none" stroke="url(#timeDialGrad)" stroke-width="2.8" stroke-dasharray="113" stroke-dashoffset="${Math.max(15, 113 - Math.min(100, ((stats.totalMinutes || 1) / 120) * 113))}" stroke-linecap="round" transform="rotate(-90 21 21)" />
                <defs>
                  <linearGradient id="timeDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="100%" stop-color="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div style="position: absolute; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 5px rgba(56,189,248,0.7));">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 6 12 12 15 15" />
                </svg>
              </div>
            </div>
            <div class="stat-pro-val">${stats.totalMinutes >= 60 ? (stats.totalMinutes / 60).toFixed(1) + 'h' : stats.totalMinutes + 'm'}</div>
            <div class="stat-pro-lbl">Tempo Dedicado</div>
            <span class="stat-pro-subtag" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="13" r="8"/>
                <path d="M12 9v4l2.5 1.5"/>
                <path d="M12 2v3"/>
              </svg>
              ~${stats.totalWorkouts > 0 ? Math.round(stats.totalMinutes / stats.totalWorkouts) : 0}m / ses
            </span>
          </div>

          <!-- Card 3: Colunata / Templo de Sessões Batidas -->
          <div class="stat-metric-card-pro">
            <div class="stat-pro-visual">
              <svg width="42" height="42" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="18" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2.5" />
                <circle cx="21" cy="21" r="18" fill="none" stroke="url(#pillarSessGrad)" stroke-width="2.8" stroke-dasharray="113" stroke-dashoffset="${Math.max(10, 113 - Math.min(100, ((stats.totalWorkouts || 1) / 10) * 113))}" stroke-linecap="round" transform="rotate(-90 21 21)" />
                <defs>
                  <linearGradient id="pillarSessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ec4899" />
                    <stop offset="100%" stop-color="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div style="position: absolute; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 5px rgba(244,114,182,0.8));">
                  <path d="M2 9.5L12 4l10 5.5v1H2v-1z" />
                  <line x1="6" y1="11" x2="6" y2="18" />
                  <line x1="12" y1="11" x2="12" y2="18" />
                  <line x1="18" y1="11" x2="18" y2="18" />
                  <line x1="2" y1="21" x2="22" y2="21" />
                </svg>
              </div>
            </div>
            <div class="stat-pro-val" style="color: #f472b6;">${stats.totalWorkouts}</div>
            <div class="stat-pro-lbl">Sessões Batidas</div>
            <span class="stat-pro-subtag" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 9.5L12 4l10 5.5v1H2v-1z" />
                <line x1="6" y1="11" x2="6" y2="18" />
                <line x1="12" y1="11" x2="12" y2="18" />
                <line x1="18" y1="11" x2="18" y2="18" />
                <line x1="2" y1="21" x2="22" y2="21" />
              </svg>
              ${(stats.totalVolumeKg / 1000).toFixed(1)}t carga
            </span>
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
    const p = this.profile || StorageService.getProfile();
    const stats = StorageService.getStats();
    const workoutHistory = StorageService.getHistory();
    const imc = (p.weight && p.height) ? (p.weight / ((p.height / 100) * (p.height / 100))).toFixed(1) : '22.0';
    const hasApiKey = Boolean((p.geminiApiKey && p.geminiApiKey.trim().length > 10) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY));

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
      <div class="oracle-view-wrapper">
        <div style="margin-bottom: 10px;">
          <h2 style="font-family: var(--font-carved); font-size: 1.35rem; color: #fff; margin-bottom: 2px;">
            ORÁCULO CÓSMICO
          </h2>
          <p style="font-size: 0.78rem; color: var(--concrete-300);">
            Converse sobre sua rotina, adaptação de cargas e biomecânica com o Oráculo.
          </p>
        </div>

        <!-- PAINEL DO ORÁCULO COM ABAS [ Conversa Atual ] [ Histórico de Chats ] -->
        <div class="stone-panel oracle-chat-panel full-height-panel">
          
          <!-- Seletor de Abas no Topo do Oráculo (Opção A) -->
          <div class="oracle-subtabs-row" style="display: flex; gap: 6px; margin-bottom: 12px; background: rgba(0,0,0,0.4); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <button id="btn-oracle-subtab-chat" class="oracle-subtab-btn ${this.currentOracleTab === 'chat' ? 'active' : ''}" style="flex: 1; padding: 8px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; background: ${this.currentOracleTab === 'chat' ? 'rgba(255,255,255,0.14)' : 'transparent'}; color: ${this.currentOracleTab === 'chat' ? '#ffffff' : 'var(--concrete-400)'}; border: ${this.currentOracleTab === 'chat' ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent'};">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Conversa Atual
            </button>
            <button id="btn-oracle-subtab-history" class="oracle-subtab-btn ${this.currentOracleTab === 'history' ? 'active' : ''}" style="flex: 1; padding: 8px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; background: ${this.currentOracleTab === 'history' ? 'rgba(255,255,255,0.14)' : 'transparent'}; color: ${this.currentOracleTab === 'history' ? '#ffffff' : 'var(--concrete-400)'}; border: ${this.currentOracleTab === 'history' ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent'};">
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
                <!-- Portal Cósmico com Anéis Giratórios e Gradiente Rosa e Azul -->
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
                        <stop offset="70%" stop-color="#f472b6"/>
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
                  <div style="font-size: 0.68rem; color: var(--concrete-300);">
                    Memória ativa • ${(p.name && p.name.trim()) ? p.name : 'Guerreiro'} • ${(p.hasConfiguredBio && p.weight) ? p.weight + 'kg • ' : ''}${stats.currentStreak}d Streak
                  </div>
                </div>
              </div>

              <!-- Ações da Conversa Atual: Novo Chat (+) & Limpar -->
              <div style="display: flex; gap: 6px; align-items: center;">
                <button id="btn-new-oracle-chat" title="Iniciar Nova Conversa (arquiva a atual no histórico)" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.22); color: #ffffff; border-radius: 6px; padding: 4px 8px; font-size: 0.68rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
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
              <button class="oracle-prompt-chip" data-prompt="O que treinar hoje?">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="12 8 8 12 12 16 12 8"/>
                </svg>
                O que treinar hoje?
              </button>
              <button class="oracle-prompt-chip" data-prompt="Como progredir carga nos exercícios com segurança?">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 5v14M18 5v14M2 9v6M22 9v6M2 12h20"/>
                </svg>
                Dicas de Carga
              </button>
              <button class="oracle-prompt-chip" data-prompt="Quanto de proteína e água devo consumir para o meu peso?">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a5 5 0 0 1 5 5c0 5-5 13-5 13S7 12 7 7a5 5 0 0 1 5-5z"/>
                </svg>
                Proteína & Dieta
              </button>
              <button class="oracle-prompt-chip" data-prompt="Dor muscular pós-treino vs lesão: como diferenciar?">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Dor vs Lesão
              </button>
              <button class="oracle-prompt-chip" data-prompt="Como está meu histórico e evolução no templo?">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Meu Progresso
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
                      <div style="display: flex; justify-content: center; margin-bottom: 8px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); display: flex; align-items: center; justify-content: center;">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        </div>
                      </div>
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
                              <h4 style="font-size: 0.84rem; color: #fff; font-weight: 700; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span>${sess.title}</span>
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
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const sessId = btn.getAttribute('data-session-id');
        const ok = await this.showCosmicConfirm({
          title: 'EXCLUIR CONVERSA',
          message: 'Deseja excluir esta conversa do histórico do Oráculo?',
          confirmText: 'Excluir',
          cancelText: 'Cancelar',
          isDestructive: true
        });
        if (ok) {
          StorageService.deleteChatSession(sessId);
          this.renderOraculoView(container);
        }
      });
    });

    const btnClearAllSessions = container.querySelector('#btn-clear-all-sessions');
    if (btnClearAllSessions) {
      btnClearAllSessions.addEventListener('click', async () => {
        const ok = await this.showCosmicConfirm({
          title: 'LIMPAR TODO O HISTÓRICO',
          message: 'Deseja apagar permanentemente todas as conversas salvas no templo?',
          confirmText: 'Apagar Todas',
          cancelText: 'Cancelar',
          isDestructive: true
        });
        if (ok) {
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
      const warriorName = (p.name && p.name.trim()) ? p.name : 'do Templo';
      const warriorGoal = p.goal || 'hipertrofia';
      chatHistory = [
        {
          id: 'msg-welcome',
          sender: 'oracle',
          text: `Saudações, guerreiro(a) **${warriorName}**! Eu sou o Oráculo do Templo Cósmico.\n\nTenho acesso à sua biometria (**${p.weight || 75}kg**, foco em **${warriorGoal}**), aos seus **${stats.currentStreak} dias de sequência** e ao seu histórico no templo. Como posso guiar seu treino ou sua evolução hoje?`,
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
              <span class="oracle-msg-sender">${isUser ? 'Você' : 'Oráculo'}</span>
              <span class="oracle-msg-time">${msg.timestamp || ''}</span>
            </div>
            <div class="oracle-msg-text">
              ${formatOracleMessageText(msg.text)}
              ${msg.actionHtml || ''}
            </div>
            ${!isUser && msg.source === 'gemini' ? `
              <div class="oracle-msg-badge-source"> Resposta criada pelo Gemini. Certifique-se sempre de consultar outras fontes.</div>
            ` : ''}
          </div>
        `;
      }).join('');

      messagesContainer.querySelectorAll('.action-view-routine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchTab('treino');
        });
      });

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
        const currentRoutines = StorageService.getRoutines();
        const response = await GeminiService.askOracleChat({
          userMessage: trimmed,
          chatHistory,
          userProfile: this.profile,
          workoutHistory,
          activeSession: this.activeSession,
          stats,
          routines: currentRoutines,
          apiKey: this.profile.geminiApiKey || (import.meta.env?.VITE_GEMINI_API_KEY || '')
        });

        // Remove balão de pensamento
        const currentThinking = container.querySelector('#oracle-thinking-bubble');
        if (currentThinking) currentThinking.remove();

        let responseText = response.text || '';
        let actionCardHtml = '';

        // Detecção e Execução de Ação de Troca de Exercício
        const actionMatch = responseText.match(/\[ACTION:SWAP_EXERCISE\s+routineId="([^"]+)"\s+oldExerciseId="([^"]+)"\s+newExerciseId="([^"]+)"\]/);
        if (actionMatch) {
          const [fullTag, routineId, oldExId, newExId] = actionMatch;
          responseText = responseText.replace(fullTag, '').trim();

          // Executa a mutação na persistência do treino
          const updatedRoutine = StorageService.swapExerciseInRoutine(routineId, oldExId, newExId);

          // Se houver treino ativo correspondente, atualiza a sessão imediatamente
          if (this.activeSession && (this.activeSession.routineId === routineId || (this.activeSession.exercises || []).some(e => e.exerciseId === oldExId))) {
            const actEx = this.activeSession.exercises.find(e => e.exerciseId === oldExId);
            const newExObj = EXERCISES.find(e => e.id === newExId);
            if (actEx && newExObj) {
              actEx.exerciseId = newExObj.id;
              actEx.exerciseName = newExObj.name;
              actEx.exerciseEquipment = newExObj.equipment;
              StorageService.saveActiveSession(this.activeSession);
            }
          }

          const oldExObj = EXERCISES.find(e => e.id === oldExId);
          const newExObj = EXERCISES.find(e => e.id === newExId);
          const routineTitle = updatedRoutine ? updatedRoutine.title : (routineId === 'portal-a' ? 'Portal Alpha' : routineId === 'portal-b' ? 'Portal Beta' : 'Portal Gamma');

          actionCardHtml = `
            <div class="oracle-action-card">
              <div class="action-card-top">
                <span class="action-badge-tag">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  TREINO ATUALIZADO COM SUCESSO
                </span>
                <span class="action-routine-code">${routineTitle}</span>
              </div>
              <div class="action-swap-flow">
                <span class="action-ex-pill old">${oldExObj ? oldExObj.name : oldExId}</span>
                <span class="action-swap-arrow">➔</span>
                <span class="action-ex-pill new">${newExObj ? newExObj.name : newExId}</span>
              </div>
              <div class="action-card-footer">
                <span>Modificação sincronizada à sua ficha</span>
                <button class="action-view-routine-btn" type="button" data-go-tab="treino">Ver no Treino</button>
              </div>
            </div>
          `;
        }

        const oracleMsg = {
          id: 'msg-' + Date.now(),
          sender: 'oracle',
          text: responseText,
          actionHtml: actionCardHtml,
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
      btnClearChat.addEventListener('click', async () => {
        const ok = await this.showCosmicConfirm({
          title: 'LIMPAR CONVERSA',
          message: 'Deseja apagar todas as mensagens da conversa atual?',
          confirmText: 'Limpar Mensagens',
          cancelText: 'Cancelar',
          isDestructive: true
        });
        if (ok) {
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

  // Modal Didático: Sistema de Honra (Patentes vs Insígnias)
  openHonorSystemModal() {
    const modalContainer = document.querySelector('#modal-container');
    const stats = StorageService.getStats();
    const workouts = stats.totalWorkouts || 0;

    let currentGrade = 1;
    if (workouts >= 30) currentGrade = 4;
    else if (workouts >= 15) currentGrade = 3;
    else if (workouts >= 5) currentGrade = 2;

    const ranksConfig = [
      {
        grade: 1,
        title: 'Iniciado',
        color: '#38bdf8',
        range: '0 a 4 treinos',
        minWorkouts: 0,
        svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(56,189,248,0.2)"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
        </svg>`
      },
      {
        grade: 2,
        title: 'Guerreiro de Aço',
        color: '#fbbf24',
        range: '5 a 14 treinos',
        minWorkouts: 5,
        svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="6" y1="18" x2="18" y2="6"/>
          <polyline points="13 6 18 6 18 11"/>
          <line x1="4" y1="16" x2="8" y2="20"/>
          <line x1="18" y1="18" x2="6" y2="6"/>
          <polyline points="11 6 6 6 6 11"/>
          <line x1="20" y1="16" x2="16" y2="20"/>
        </svg>`
      },
      {
        grade: 3,
        title: 'Guardião do Templo',
        color: '#ec4899',
        range: '15 a 29 treinos',
        minWorkouts: 15,
        svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 9.5L12 4l10 5.5v1H2v-1z" fill="rgba(236,72,153,0.2)"/>
          <line x1="6" y1="11" x2="6" y2="18"/>
          <line x1="10" y1="11" x2="10" y2="18"/>
          <line x1="14" y1="11" x2="14" y2="18"/>
          <line x1="18" y1="11" x2="18" y2="18"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
          <line x1="2" y1="21" x2="22" y2="21"/>
        </svg>`
      },
      {
        grade: 4,
        title: 'Titã',
        color: '#c084fc',
        range: '30+ treinos',
        minWorkouts: 30,
        svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(192,132,252,0.3)"/>
        </svg>`
      }
    ];

    modalContainer.innerHTML = `
      <div class="honor-modal-overlay" id="honor-system-overlay">
        <div class="honor-modal-sheet" id="honor-system-sheet">
          <div class="modal-handle-bar"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v8"/>
                  <path d="M8 12h8"/>
                </svg>
              </div>
              <div>
                <h3 style="font-family: var(--font-carved); font-size: 1.15rem; color: #fff; margin: 0;">SISTEMA DE HONRA</h3>
                <small style="color: var(--neon-cyan); font-size: 0.68rem; letter-spacing: 0.5px;">PATENTES VS. INSÍGNIAS</small>
              </div>
            </div>
            <button id="btn-close-honor-modal" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer; line-height: 1;">&times;</button>
          </div>

          <!-- Comparativo Didático -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;">
            <div style="font-size: 0.8rem; color: #fff; font-weight: 700; margin-bottom: 6px;">Qual a diferença entre Patente e Insígnia?</div>
            <div style="font-size: 0.74rem; color: var(--concrete-300); line-height: 1.5;">
              • <strong style="color: #38bdf8;">Patente</strong>: É a sua <strong>graduação marcial contínua</strong> (seu nível geral). Conforme você bate treinos no templo, seu nível sobe e o brasão ganha novas formas e metais sagrados.<br/><br/>
              • <strong style="color: #ec4899;">Insígnias</strong>: São <strong>conquistas e medalhas de honra</strong> desbloqueadas por cumprir façanhas pontuais (ex: bater o 1º treino, acumular 5 toneladas, manter 3 dias de streak, etc.).
            </div>
          </div>

          <!-- Os 4 Graus Dinâmicos com Movimento -->
          <div style="margin-bottom: 18px;">
            <div style="font-family: var(--font-hud); font-size: 0.72rem; color: var(--concrete-400); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;">
              AS 4 PATENTES CÓSMICAS
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${ranksConfig.map(r => {
                const isCurrent = r.grade === currentGrade;
                const isAchieved = workouts >= r.minWorkouts;
                const missing = r.minWorkouts - workouts;
                return `
                  <div class="degree-rank-card ${isCurrent ? 'is-current' : ''}" data-degree-card="${r.grade}" style="--deg-color: ${r.color}; --deg-glow: ${r.color}50;" title="Toque para sentir a energia do grau">
                    <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                      <div class="degree-icon-slot deg-${r.grade}">
                        ${r.svg}
                      </div>
                      <div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 0.65rem; color: ${r.color}; font-weight: 700; font-family: var(--font-hud); letter-spacing: 0.5px;">
                            GRAU ${r.grade}
                          </span>
                          <span style="font-size: 0.65rem; color: var(--concrete-500);">• ${r.range}</span>
                        </div>
                        <div style="font-family: var(--font-serif); font-size: 1.02rem; font-weight: 700; color: #fff; margin-top: 1px;">
                          ${r.title}
                        </div>
                      </div>
                    </div>

                    <div style="flex-shrink: 0; text-align: right;">
                      ${isCurrent ? `
                        <span class="degree-current-pill">PATENTE ATUAL</span>
                      ` : isAchieved ? `
                        <span style="color: #34d399; font-size: 0.68rem; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Conquistado
                        </span>
                      ` : `
                        <span style="font-size: 0.66rem; color: var(--concrete-400); display: inline-flex; align-items: center; gap: 4px;">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          Faltam ${missing}
                        </span>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <button id="btn-close-honor-modal-action" class="btn-enter-temple" style="width: 100%; padding: 12px; font-size: 0.82rem; font-weight: 700;">
            ENTENDI!
          </button>
        </div>
      </div>
    `;

    const close = () => {
      sound.playTapSound();
      const overlay = modalContainer.querySelector('#honor-system-overlay');
      const sheet = modalContainer.querySelector('#honor-system-sheet');
      if (overlay) {
        overlay.style.transition = 'opacity 0.2s ease';
        overlay.style.opacity = '0';
        if (sheet) {
          sheet.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease';
          sheet.style.transform = 'scale(0.88) translateY(18px)';
          sheet.style.opacity = '0';
        }
        setTimeout(() => { modalContainer.innerHTML = ''; }, 200);
      } else {
        modalContainer.innerHTML = '';
      }
    };

    modalContainer.querySelector('#btn-close-honor-modal')?.addEventListener('click', close);
    modalContainer.querySelector('#btn-close-honor-modal-action')?.addEventListener('click', close);
    modalContainer.querySelector('#honor-system-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'honor-system-overlay') close();
    });

    modalContainer.querySelectorAll('.degree-rank-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playTapSound();
        if ('vibrate' in navigator) navigator.vibrate([20, 30]);
        card.style.transform = 'scale(1.03) translateY(-2px)';
        setTimeout(() => { card.style.transform = ''; }, 200);
      });
    });
  }

  // ==========================================
  // MODAIS
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

    let selectedAura = aura;
    let selectedGoal = p.goal || 'hipertrofia';
    let selectedFreq = p.frequency || 4;

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="profile-manager-overlay">
        <div class="modal-sheet stone-panel profile-manager-sheet" style="max-width: 440px;">
          <div class="modal-handle-bar"></div>

          <!-- Cabeçalho do Modal -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 style="font-family: var(--font-carved); font-size: 1.05rem; color: #fff; margin: 0;">
                  EDITAR PERFIL DO GUERREIRO
                </h3>
                <small style="color: var(--neon-cyan); font-size: 0.68rem;">Personalize suas métricas, foto e aura do templo</small>
              </div>
            </div>
            <button id="btn-close-profile-manager" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <!-- 1. Destaque do Avatar Atual com Aura Viva -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 4px 0 12px;">
            <div class="avatar-aura-slot" style="width: 74px; height: 74px; cursor: default;">
              <div class="avatar-aura-ring" id="modal-preview-aura-ring" style="background: ${aura}; box-shadow: 0 0 20px ${aura}; inset: -5px;"></div>
              <div class="avatar-photo-circle" id="modal-preview-avatar-circle" style="border-width: 2px;">
                ${p.avatarUrl
        ? `<img src="${p.avatarUrl}" alt="${p.name || 'Avatar'}" />`
        : `<span class="avatar-initials-fallback" style="font-size: 1.5rem;">${(p.name && p.name.trim()) ? p.name.trim()[0].toUpperCase() : '?'}</span>`}
              </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 2px;">
              <button class="btn-enter-temple" id="btn-pick-avatar-modal" style="padding: 6px 14px; font-size: 0.74rem;">
                Escolher Foto
              </button>
              ${p.avatarUrl ? `
                <button id="btn-remove-avatar-modal" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; border-radius: 8px; padding: 6px 12px; font-size: 0.72rem; cursor: pointer;">
                  Remover
                </button>
              ` : ''}
            </div>
          </div>

          <!-- 2. Formulário de Métricas Físicas e Identidade -->
          <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 14px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 12px;">
            <!-- Campo Nome -->
            <div>
              <label style="display: block; font-size: 0.68rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase; margin-bottom: 5px; font-family: var(--font-hud); letter-spacing: 0.5px;">
                Nome do Guerreiro
              </label>
              <input 
                type="text" 
                id="profile-edit-name" 
                value="${p.name || ''}" 
                placeholder="Como deseja ser chamado(a)?" 
                style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 9px 12px; border-radius: 8px; font-size: 0.84rem; outline: none;"
              />
            </div>

            <!-- Grid Peso e Altura -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 0.68rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase; margin-bottom: 5px; font-family: var(--font-hud); letter-spacing: 0.5px;">
                  Peso (kg)
                </label>
                <input 
                  type="number" 
                  id="profile-edit-weight" 
                  value="${(p.hasConfiguredBio && p.weight) ? p.weight : (p.weight || '')}" 
                  placeholder="Ex: 75" 
                  min="30" 
                  max="250" 
                  step="0.5"
                  style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 9px 12px; border-radius: 8px; font-size: 0.84rem; outline: none;"
                />
              </div>

              <div>
                <label style="display: block; font-size: 0.68rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase; margin-bottom: 5px; font-family: var(--font-hud); letter-spacing: 0.5px;">
                  Altura (cm)
                </label>
                <input 
                  type="number" 
                  id="profile-edit-height" 
                  value="${(p.hasConfiguredBio && p.height) ? p.height : (p.height || '')}" 
                  placeholder="Ex: 178" 
                  min="100" 
                  max="240" 
                  step="1"
                  style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 9px 12px; border-radius: 8px; font-size: 0.84rem; outline: none;"
                />
              </div>
            </div>

            <!-- Objetivo Principal -->
            <div>
              <label style="display: block; font-size: 0.68rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase; margin-bottom: 6px; font-family: var(--font-hud); letter-spacing: 0.5px;">
                Objetivo do Treino
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;" id="profile-edit-goal-chips">
                ${[
                  { key: 'hipertrofia', label: 'Hipertrofia' },
                  { key: 'emagrecimento', label: 'Definição' },
                  { key: 'forca', label: 'Força Bruta' },
                  { key: 'condicionamento', label: 'Condicionamento' }
                ].map(g => {
                  const isSel = selectedGoal === g.key;
                  return `
                    <button 
                      type="button" 
                      class="profile-goal-btn" 
                      data-goal="${g.key}"
                      style="padding: 8px; border-radius: 8px; font-size: 0.74rem; font-weight: 600; cursor: pointer; text-align: center; border: 1px solid ${isSel ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.12)'}; background: ${isSel ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.03)'}; color: ${isSel ? '#fff' : 'var(--concrete-300)'}; transition: all 0.2s;"
                    >
                      ${g.label}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Frequência Semanal -->
            <div>
              <label style="display: block; font-size: 0.68rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase; margin-bottom: 6px; font-family: var(--font-hud); letter-spacing: 0.5px;">
                Frequência Semanal
              </label>
              <div style="display: flex; gap: 6px;" id="profile-edit-freq-chips">
                ${[2, 3, 4, 5, 6].map(freq => {
                  const isSel = selectedFreq === freq;
                  return `
                    <button 
                      type="button" 
                      class="profile-freq-btn" 
                      data-freq="${freq}"
                      style="flex: 1; padding: 7px 4px; border-radius: 8px; font-size: 0.74rem; font-weight: 700; cursor: pointer; text-align: center; border: 1px solid ${isSel ? 'var(--baby-pink)' : 'rgba(255,255,255,0.12)'}; background: ${isSel ? 'rgba(236,72,153,0.18)' : 'rgba(255,255,255,0.03)'}; color: ${isSel ? '#fff' : 'var(--concrete-300)'}; transition: all 0.2s;"
                    >
                      ${freq}x
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- 3. Escolha da Aura Cósmica (17 Tonalidades + Custom Touch) -->
          <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px;">
              <span style="font-size: 0.68rem; color: var(--concrete-300); font-weight: 700; text-transform: uppercase; font-family: var(--font-hud); letter-spacing: 0.5px;">
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
              <!-- Botão + para seletor touch integrado -->
              <div style="position: relative; display: inline-flex; align-items: center; justify-content: center;">
                <button 
                  class="aura-custom-plus-btn" 
                  id="btn-custom-aura-color" 
                  type="button"
                  title="Ajuste Touch da Aura (+)"
                  style="width: 27px; height: 27px; border-radius: 50%; background: ${isCustomAura ? aura : 'conic-gradient(from 180deg at 50% 50%, #f43f5e 0deg, #fbbf24 60deg, #10b981 120deg, #38bdf8 180deg, #818cf8 240deg, #f472b6 300deg, #f43f5e 360deg)'}; border: ${isCustomAura ? '2.5px solid #fff' : '1.5px solid rgba(255,255,255,0.7)'}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 ${isCustomAura ? '16px ' + aura : '8px rgba(255,255,255,0.3)'}; transform: ${isCustomAura ? 'scale(1.15)' : 'scale(1)'};"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8));">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Painel Integrado Mobile/Touch -->
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

          <!-- 4. BOTÃO PRINCIPAL DE SALVAMENTO -->
          <button id="btn-save-full-profile" class="btn-enter-temple" style="width: 100%; padding: 13px; font-size: 0.88rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            SALVAR ALTERAÇÕES DO PERFIL
          </button>

          <!-- 5. Sincronização em Nuvem Supabase -->
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
            <button 
              id="btn-open-supabase-auth" 
              class="btn-finish-workout" 
              style="width: 100%; padding: 10px; font-size: 0.78rem; background: ${this.supabaseUser ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.25)'}; border-color: ${this.supabaseUser ? 'rgba(239,68,68,0.5)' : 'rgba(56,189,248,0.5)'}; color: #fff;"
            >
              ${this.supabaseUser ? 'Sair da Minha Conta' : 'Fazer Login ou criar uma conta'}
            </button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#btn-close-profile-manager').addEventListener('click', close);
    modalContainer.querySelector('#profile-manager-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'profile-manager-overlay') close();
    });

    // Seletor de Objetivo (chips)
    modalContainer.querySelectorAll('.profile-goal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedGoal = btn.getAttribute('data-goal');
        modalContainer.querySelectorAll('.profile-goal-btn').forEach(b => {
          const isTarget = b === btn;
          b.style.borderColor = isTarget ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.12)';
          b.style.background = isTarget ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.03)';
          b.style.color = isTarget ? '#fff' : 'var(--concrete-300)';
        });
      });
    });

    // Seletor de Frequência (chips)
    modalContainer.querySelectorAll('.profile-freq-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFreq = parseInt(btn.getAttribute('data-freq'), 10);
        modalContainer.querySelectorAll('.profile-freq-btn').forEach(b => {
          const isTarget = b === btn;
          b.style.borderColor = isTarget ? 'var(--baby-pink)' : 'rgba(255,255,255,0.12)';
          b.style.background = isTarget ? 'rgba(236,72,153,0.18)' : 'rgba(255,255,255,0.03)';
          b.style.color = isTarget ? '#fff' : 'var(--concrete-300)';
        });
      });
    });

    // Botão de Salvar Alterações Unificado
    modalContainer.querySelector('#btn-save-full-profile').addEventListener('click', async () => {
      const nameInput = modalContainer.querySelector('#profile-edit-name');
      const weightInput = modalContainer.querySelector('#profile-edit-weight');
      const heightInput = modalContainer.querySelector('#profile-edit-height');

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const weightVal = weightInput && weightInput.value ? parseFloat(weightInput.value) : null;
      const heightVal = heightInput && heightInput.value ? parseFloat(heightInput.value) : null;

      this.profile.name = nameVal || (p.name || '');
      this.profile.weight = (weightVal && !isNaN(weightVal) && weightVal > 0) ? weightVal : null;
      this.profile.height = (heightVal && !isNaN(heightVal) && heightVal > 0) ? heightVal : null;
      this.profile.goal = selectedGoal;
      this.profile.frequency = selectedFreq;
      this.profile.auraColor = selectedAura;
      this.profile.hasConfiguredBio = true;

      StorageService.saveProfile(this.profile);
      if (this.supabaseUser) {
        await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
      }

      this.updateHeaderAvatar();
      this.updateDrawerHeaderSubtitle();
      sound.playCheckSound();
      close();
      this.renderCurrentTab();
      this.showCosmicModalAlert({
        title: 'PERFIL ATUALIZADO!',
        message: 'Suas métricas e personalizações foram salvas no santuário.',
        type: 'info'
      });
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
        const ok = await this.showCosmicConfirm({
          title: 'REMOVER FOTO',
          message: 'Deseja remover sua foto de perfil e restaurar o avatar cósmico padrão?',
          confirmText: 'Remover Foto',
          cancelText: 'Cancelar',
          isDestructive: true
        });
        if (ok) {
          this.profile.avatarUrl = '';
          StorageService.saveProfile(this.profile);
          if (this.supabaseUser) {
            await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
          }
          this.updateHeaderAvatar();
          this.renderCurrentTab();
          sound.playTapSound();
          close();
          this.showCosmicModalAlert({
            title: 'FOTO REMOVIDA',
            message: 'Foto de perfil removida com sucesso.',
            type: 'info'
          });
        }
      });
    }

    // Alterar Cor da Aura (Atualiza Preview em Tempo Real sem fechar o modal)
    modalContainer.querySelectorAll('.aura-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pickedAura = btn.getAttribute('data-aura');
        selectedAura = pickedAura;
        this.profile.auraColor = pickedAura;

        const ring = modalContainer.querySelector('#modal-preview-aura-ring');
        const hexLabel = modalContainer.querySelector('#aura-current-hex-label');
        if (ring) {
          ring.style.background = pickedAura;
          ring.style.boxShadow = `0 0 20px ${pickedAura}`;
        }
        if (hexLabel) {
          hexLabel.textContent = pickedAura.toUpperCase();
          hexLabel.style.color = pickedAura;
        }

        modalContainer.querySelectorAll('.aura-color-btn').forEach(b => {
          const isTarget = b === btn;
          b.style.border = isTarget ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.25)';
          b.style.transform = isTarget ? 'scale(1.15)' : 'scale(1)';
          b.style.boxShadow = isTarget ? `0 0 14px ${pickedAura}` : '3px rgba(0,0,0,0.5)';
        });

        sound.playTapSound();
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
        const ok = await this.showCosmicConfirm({
          title: 'DESCONECTAR CONTA',
          message: 'Deseja sair da sua conta Supabase e desconectar a sincronização na nuvem?',
          confirmText: 'Sair e Desconectar',
          cancelText: 'Permanecer',
          isDestructive: true
        });
        if (ok) {
          await SupabaseService.signOut();
          this.supabaseUser = null;
          StorageService.switchUser('joao');
          this.profile = StorageService.getProfile();
          close();
          this.updateHeaderAvatar();
          this.updateHeaderStreak();
          this.renderCurrentTab();
          this.showCosmicModalAlert({
            title: 'CONTA DESCONECTADA',
            message: 'Você saiu da sua conta. O app voltou ao modo local.',
            type: 'info'
          });
        }
      } else {
        close();
        this.openSupabaseAuthModal();
      }
    });

    // Atalho para Editar Bio
    modalContainer.querySelector('#btn-edit-bio-quick').addEventListener('click', () => {
      close();
      this.openOnboardingModal('calibrate');
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
              <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                </svg>
              </div>
              <div>
                <h3 style="font-family: var(--font-carved); font-size: 1.1rem; color: #fff; margin: 0;">
                  MINHA CONTA
                </h3>
                <small style="color: #94a3b8; font-size: 0.68rem;">Sincronize entre seus aparelhos</small>
              </div>
            </div>
            <button id="btn-close-auth-modal" style="background: none; border: none; color: var(--concrete-400); font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <!-- Abas Entrar / Cadastrar -->
          <div style="display: flex; border-bottom: 1px solid rgba(255,255,255,0.12); margin-bottom: 16px;">
            <button id="tab-auth-login" class="filter-pill active" style="flex: 1; border-radius: 0; background: none; border-bottom: 2px solid #ffffff; color: #ffffff;">
              ENTRAR
            </button>
            <button id="tab-auth-signup" class="filter-pill" style="flex: 1; border-radius: 0; background: none; border-bottom: 2px solid transparent; color: #94a3b8;">
              CRIAR CONTA
            </button>
          </div>

          <form id="supabase-auth-form">
            <div class="form-group" id="group-auth-name" style="display: none;">
              <label class="form-label">Nome</label>
              <input type="text" class="form-input" id="auth-name" value="${p.name || ''}" placeholder="Ex: João Pedro" />
            </div>

            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" class="form-input" id="auth-email" placeholder="seu-email@exemplo.com" required />
            </div>

            <div class="form-group">
              <label class="form-label">Senha (mínimo 6 caracteres)</label>
              <input type="password" class="form-input" id="auth-password" placeholder="••••••••" minlength="6" required />
            </div>

            <div id="auth-error-msg" style="display: none; padding: 8px 12px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); border-radius: 8px; color: #fca5a5; font-size: 0.74rem; margin-bottom: 12px;"></div>

            <button type="submit" id="btn-submit-auth" class="btn-enter-temple" style="width: 100%; padding: 12px; font-size: 0.85rem; margin-bottom: 10px; background: #ffffff; color: #000000; font-weight: 700;">
              ENTRAR
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
      tabLogin.style.borderBottomColor = '#ffffff';
      tabLogin.style.color = '#ffffff';
      tabSignup.classList.remove('active');
      tabSignup.style.borderBottomColor = 'transparent';
      tabSignup.style.color = '#94a3b8';
      nameGroup.style.display = 'none';
      submitBtn.textContent = 'ENTRAR';
      errorBox.style.display = 'none';
    });

    tabSignup.addEventListener('click', () => {
      mode = 'signup';
      tabSignup.classList.add('active');
      tabSignup.style.borderBottomColor = '#ffffff';
      tabSignup.style.color = '#ffffff';
      tabLogin.classList.remove('active');
      tabLogin.style.borderBottomColor = 'transparent';
      tabLogin.style.color = '#94a3b8';
      nameGroup.style.display = 'block';
      submitBtn.textContent = 'Criar nova conta';
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
            submitBtn.textContent = 'Criar nova conta';
            return;
          }

          if (res.data?.user) {
            this.supabaseUser = res.data.user;
            this.profile.email = email;
            if (name) this.profile.name = name;
            this.profile.isOnboarded = true;
            StorageService.saveProfile(this.profile);
            await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
          }

          sound.playVictoryFanfare();
          this.showCosmicModalAlert({
            title: 'CONTA CRIADA',
            message: 'Conta criada e sincronizada com sucesso no Supabase!',
            type: 'success'
          });
        } else {
          const res = await SupabaseService.signIn(email, password);
          if (!res.success) {
            errorBox.textContent = res.error || 'Credenciais inválidas.';
            errorBox.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'ENTRAR';
            return;
          }

          this.supabaseUser = res.data.user;
          this.profile.email = email;
          this.profile.isOnboarded = true;

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
          this.showCosmicModalAlert({
            title: 'BEM-VINDO DE VOLTA',
            message: `Conexão restabelecida ao seu templo, ${this.profile.name || 'Guerreiro'}!`,
            type: 'success'
          });
        }

        this.updateHeaderAvatar();
        this.updateHeaderStreak();
        this.renderCurrentTab();
        close();
      } catch (err) {
        errorBox.textContent = err.message || 'Erro inesperado na conexão.';
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'signup' ? 'Criar nova conta' : 'ENTRAR';
      }
    });
  }

  // ==========================================
  // MODAIS (ONBOARDING, GUIA ANATÔMICO & CHECKOUT)
  // ==========================================
  openOptionPickerModal({ title, subtitle, options, currentValue, onSelect }) {
    let pickerOverlay = document.querySelector('#option-picker-overlay');
    if (!pickerOverlay) {
      pickerOverlay = document.createElement('div');
      pickerOverlay.id = 'option-picker-overlay';
      pickerOverlay.className = 'cosmic-confirm-overlay';
      pickerOverlay.style.zIndex = '3100';
      document.body.appendChild(pickerOverlay);
    }

    pickerOverlay.innerHTML = `
      <div class="cosmic-confirm-card" style="max-width: 380px; text-align: left; max-height: 85vh; display: flex; flex-direction: column; padding: 22px 18px 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
          <div>
            <h3 style="font-family: var(--font-carved); font-size: 1.25rem; color: #fff; margin: 0 0 4px; letter-spacing: 0.03em;">
              ${title}
            </h3>
            <p style="font-size: 0.78rem; color: #94a3b8; margin: 0;">
              ${subtitle}
            </p>
          </div>
          <button type="button" id="btn-close-picker" style="background: none; border: none; color: #94a3b8; font-size: 1.5rem; line-height: 1; cursor: pointer; padding: 2px 6px;">&times;</button>
        </div>

        <div class="picker-options-list" style="overflow-y: auto; max-height: 55vh; padding-right: 4px;">
          ${options.map(opt => `
            <div class="picker-option-card ${String(opt.value) === String(currentValue) ? 'active' : ''}" data-value="${opt.value}">
              <div class="picker-option-left">
                <div class="picker-option-icon">${opt.icon}</div>
                <div class="picker-option-meta">
                  <div class="picker-option-title">${opt.title}</div>
                  <div class="picker-option-desc">${opt.desc}</div>
                </div>
              </div>
              <div class="picker-option-radio">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const closePicker = () => {
      pickerOverlay.remove();
    };

    pickerOverlay.querySelector('#btn-close-picker')?.addEventListener('click', closePicker);
    pickerOverlay.addEventListener('click', (e) => {
      if (e.target === pickerOverlay) closePicker();
    });

    pickerOverlay.querySelectorAll('.picker-option-card').forEach(card => {
      card.addEventListener('click', () => {
        sound.playTapSound();
        if ('vibrate' in navigator) navigator.vibrate(25);
        const val = card.getAttribute('data-value');
        onSelect(val);
        closePicker();
      });
    });
  }

  openOnboardingModal(step = 'gateway') {
    this.openAppleOnboarding(step === 'calibrate' ? 3 : 0);
  }

  openAppleOnboarding(stepIndex = 0) {
    const modalContainer = document.querySelector('#modal-container');
    const p = this.profile || StorageService.getProfile();

    if (!this._tempOnboarding) {
      this._tempOnboarding = {
        name: p.name || '',
        weight: p.weight || 75,
        height: p.height || 178,
        age: p.age || 24,
        goal: p.goal || 'hipertrofia',
        frequency: p.frequency || 4,
        email: p.email || '',
        password: ''
      };
    }

    const t = this._tempOnboarding;

    // SLIDES 0, 1, 2: INTRODUÇÃO
    if (stepIndex < 3) {
      const slides = [
        {
          badge: '01 | Olá, seja bem vindo(a)',
          svg: ONBOARDING_SVGS.portais,
          title: 'Olá, seja bem vindo(a)',
          desc: 'Este não é um simples app de treino que você encontra por aí.',
          btnText: 'CONTINUAR'
        },
        {
          badge: '02 | PILARES DA CONSTÂNCIA',
          svg: ONBOARDING_SVGS.pilares,
          title: 'PILARES DA CONSTÂNCIA',
          desc: 'Construa uma rotina inabalável sobre os pilares da disciplina.',
          btnText: 'CONTINUAR'
        },
        {
          badge: '03 | ORÁCULO IA',
          svg: ONBOARDING_SVGS.oraculo,
          title: 'ORÁCULO IA',
          desc: 'Seu guia personalizado para treinos. Inteligência artificial para direcionar sua jornada com suporte a rotinas dinâmicas.',
          btnText: 'COMEÇAR JORNADA'
        }
      ];

      const current = slides[stepIndex];

      modalContainer.innerHTML = `
        <div class="onboarding-fullscreen-portal" id="onboarding-fullscreen-portal">
          <div class="onboarding-apple-container">
            <div class="onboarding-apple-nav" style="justify-content: flex-end;">
              <button type="button" class="onboarding-apple-skip" id="btn-ob-skip">Pular</button>
            </div>

            <div class="onboarding-apple-card">
              ${current.svg}
              <h2 class="onboarding-apple-title">${current.title}</h2>
              <p class="onboarding-apple-desc">${current.desc}</p>
            </div>

            <div class="onboarding-apple-bottom">
              <div class="onboarding-apple-dots">
                <span class="onboarding-apple-dot ${stepIndex === 0 ? 'active' : ''}"></span>
                <span class="onboarding-apple-dot ${stepIndex === 1 ? 'active' : ''}"></span>
                <span class="onboarding-apple-dot ${stepIndex === 2 ? 'active' : ''}"></span>
              </div>
              <button type="button" class="onboarding-apple-btn glow" id="btn-ob-next">
                <span>${current.btnText}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      modalContainer.querySelector('#btn-ob-skip')?.addEventListener('click', () => {
        sound.playTapSound();
        this.openAppleOnboarding(3);
      });

      modalContainer.querySelector('#btn-ob-next')?.addEventListener('click', () => {
        sound.playTapSound();
        this.openAppleOnboarding(stepIndex + 1);
      });

      return;
    }

    // CONFIGURAÇÕES DE OBJETIVO E FREQUÊNCIA
    const GOAL_CONFIG = {
      hipertrofia: {
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14"/><path d="M18 5v14"/><path d="M2 9v6"/><path d="M22 9v6"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`,
        title: 'Hipertrofia Muscular',
        sub: 'Ganho de massa magra & volume',
        desc: 'Foco em tensão mecânica contínua, sobrecarga progressiva e densidade muscular.'
      },
      emagrecimento: {
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/></svg>`,
        title: 'Definição & Queima',
        sub: 'Queima de gordura & definição',
        desc: 'Foco em densidade metabólica, gasto calórico e tônus atlético preservando músculos.'
      },
      condicionamento: {
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        title: 'Força & Condicionamento',
        sub: 'Performance atlética & funcional',
        desc: 'Foco em potência, resistência aeróbica e condicionamento integral para a vida.'
      }
    };

    const FREQ_CONFIG = {
      3: {
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z"/><path d="M12 15c0-3-2-5-5-5 0 3 2 5 5 5z"/></svg>`,
        title: '3 Dias na Semana',
        sub: 'Ideal para iniciantes ou rotinas cheias',
        desc: 'Descanso intercalado entre treinos, excelente para adaptação e recuperação física.'
      },
      4: {
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        title: '4 Dias na Semana',
        sub: 'Divisão recomendada (Equilíbrio ideal)',
        desc: 'O ponto ideal de consistência semanal para evolução sólida e recuperação muscular.'
      },
      5: {
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3.5 2-5 0 2 1 3 2 3s2-2 0-7z"/><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12"/></svg>`,
        title: '5 Dias na Semana',
        sub: 'Alta frequência e volume elevado',
        desc: 'Para quem busca ritmo avançado de treinos com divisão segmentada por grupamento.'
      }
    };

    // ==========================================
    // ETAPA 1 DE 3: NOME & MÉTRICAS FÍSICAS (stepIndex === 3)
    // ==========================================
    if (stepIndex === 3) {
      modalContainer.innerHTML = `
        <div class="onboarding-fullscreen-portal" id="onboarding-calibrate-portal">
          <div class="onboarding-apple-container" style="text-align: left;">
            <div class="onboarding-apple-nav" style="justify-content: space-between;">
              <button type="button" class="onboarding-apple-skip" id="ob-btn-back" style="padding-left: 0; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                <span>Voltar</span>
              </button>
              <span class="onboarding-apple-badge">ETAPA 1 DE 3</span>
            </div>

            <div class="onboarding-wizard-progress">
              <div class="onboarding-wizard-bar active"></div>
              <div class="onboarding-wizard-bar"></div>
              <div class="onboarding-wizard-bar"></div>
            </div>

            <div style="margin: 4px 0 16px;">
              <h2 class="onboarding-apple-title" style="font-size: 1.6rem; text-align: left; margin: 0 0 6px;">
                SEU PERFIL
              </h2>
              <p class="onboarding-apple-desc" style="text-align: left; max-width: 100%; font-size: 0.84rem; margin: 0;">
                Defina como te chamar e suas medidas básicas para calibrarmos cargas, volumes e descansos ideais.
              </p>
            </div>

            <form id="onboarding-step1-form" style="width: 100%;">
              <!-- NOME DO USUÁRIO -->
              <div class="form-group" style="margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                  <label class="form-label" style="margin: 0;">Como devemos te chamar?</label>
                  <span style="font-size: 0.7rem; color: #94a3b8;">Opcional</span>
                </div>
                <div class="field-with-icon-wrapper">
                  <div class="field-prefix-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input type="text" class="form-input field-input-with-icon" id="ob-name" value="${t.name || ''}" placeholder="Seu nome ou apelido (ex: Marco)" />
                  <button type="button" class="btn-anonymous-badge" id="btn-set-anon" title="Entrar sem nome">
                    <span style="font-weight: 700;">?</span>
                    <span>Anônimo</span>
                  </button>
                </div>
                <div class="form-field-helper">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>Você pode alterar seu nome a qualquer momento nas configurações.</span>
                </div>
              </div>

              <!-- MÉTRICAS FÍSICAS REFINADAS -->
              <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                  <label class="form-label" style="margin: 0;">Métricas Físicas</label>
                  <span style="font-size: 0.7rem; color: #94a3b8;">Valores estimados</span>
                </div>
                <div class="metrics-stepper-grid">
                  <div class="metric-stepper-card">
                    <div class="metric-card-label">PESO</div>
                    <div class="metric-input-row">
                      <input type="number" class="metric-num-input" id="ob-weight" value="${t.weight || 75}" min="30" max="250" />
                      <span class="metric-unit">kg</span>
                    </div>
                    <div class="metric-actions">
                      <button type="button" class="metric-btn-step" data-step-target="ob-weight" data-delta="-1" aria-label="Diminuir peso">−</button>
                      <button type="button" class="metric-btn-step" data-step-target="ob-weight" data-delta="1" aria-label="Aumentar peso">+</button>
                    </div>
                  </div>

                  <div class="metric-stepper-card">
                    <div class="metric-card-label">ALTURA</div>
                    <div class="metric-input-row">
                      <input type="number" class="metric-num-input" id="ob-height" value="${t.height || 178}" min="100" max="230" />
                      <span class="metric-unit">cm</span>
                    </div>
                    <div class="metric-actions">
                      <button type="button" class="metric-btn-step" data-step-target="ob-height" data-delta="-1" aria-label="Diminuir altura">−</button>
                      <button type="button" class="metric-btn-step" data-step-target="ob-height" data-delta="1" aria-label="Aumentar altura">+</button>
                    </div>
                  </div>

                  <div class="metric-stepper-card">
                    <div class="metric-card-label">IDADE</div>
                    <div class="metric-input-row">
                      <input type="number" class="metric-num-input" id="ob-age" value="${t.age || 24}" min="12" max="100" />
                      <span class="metric-unit">anos</span>
                    </div>
                    <div class="metric-actions">
                      <button type="button" class="metric-btn-step" data-step-target="ob-age" data-delta="-1" aria-label="Diminuir idade">−</button>
                      <button type="button" class="metric-btn-step" data-step-target="ob-age" data-delta="1" aria-label="Aumentar idade">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" class="onboarding-apple-btn glow" style="margin-top: 10px; background: #ffffff; color: #000000; font-weight: 800;">
                <span>CONTINUAR (1/3)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </form>
          </div>
        </div>
      `;

      // Handlers Step 1
      modalContainer.querySelector('#ob-btn-back')?.addEventListener('click', () => {
        sound.playTapSound();
        this.openAppleOnboarding(2);
      });

      const btnAnon = modalContainer.querySelector('#btn-set-anon');
      const nameInput = modalContainer.querySelector('#ob-name');
      if (btnAnon && nameInput) {
        btnAnon.addEventListener('click', () => {
          sound.playTapSound();
          nameInput.value = '';
          nameInput.placeholder = 'Entrando como Anônimo';
          nameInput.focus();
        });
      }

      modalContainer.querySelectorAll('.metric-btn-step').forEach(btn => {
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
            sound.playTapSound();
            if ('vibrate' in navigator) navigator.vibrate(20);
          }
        });
      });

      modalContainer.querySelector('#onboarding-step1-form').addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playTapSound();
        this._tempOnboarding.name = modalContainer.querySelector('#ob-name').value.trim();
        this._tempOnboarding.weight = parseFloat(modalContainer.querySelector('#ob-weight').value) || 75;
        this._tempOnboarding.height = parseFloat(modalContainer.querySelector('#ob-height').value) || 178;
        this._tempOnboarding.age = parseInt(modalContainer.querySelector('#ob-age').value, 10) || 24;
        this.openAppleOnboarding(4);
      });

      return;
    }

    // ==========================================
    // ETAPA 2 DE 3: OBJETIVO & FREQUÊNCIA (stepIndex === 4)
    // ==========================================
    if (stepIndex === 4) {
      const currentGoalKey = t.goal || 'hipertrofia';
      const currentGoalObj = GOAL_CONFIG[currentGoalKey] || GOAL_CONFIG.hipertrofia;

      const currentFreqKey = t.frequency || 4;
      const currentFreqObj = FREQ_CONFIG[currentFreqKey] || FREQ_CONFIG[4];

      modalContainer.innerHTML = `
        <div class="onboarding-fullscreen-portal" id="onboarding-calibrate-portal">
          <div class="onboarding-apple-container" style="text-align: left;">
            <div class="onboarding-apple-nav" style="justify-content: space-between;">
              <button type="button" class="onboarding-apple-skip" id="ob-btn-back" style="padding-left: 0; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                <span>Voltar</span>
              </button>
              <span class="onboarding-apple-badge">ETAPA 2 DE 3</span>
            </div>

            <div class="onboarding-wizard-progress">
              <div class="onboarding-wizard-bar active"></div>
              <div class="onboarding-wizard-bar active"></div>
              <div class="onboarding-wizard-bar"></div>
            </div>

            <div style="margin: 4px 0 16px;">
              <h2 class="onboarding-apple-title" style="font-size: 1.6rem; text-align: left; margin: 0 0 6px;">
                OBJETIVO & ROTINA
              </h2>
              <p class="onboarding-apple-desc" style="text-align: left; max-width: 100%; font-size: 0.84rem; margin: 0;">
                Escolha seu foco primordial e a frequência de dias semanais que você dedicará ao templo.
              </p>
            </div>

            <form id="onboarding-step2-form" style="width: 100%;">
              <!-- OBJETIVO PRINCIPAL -->
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label">Objetivo Principal</label>
                <button type="button" class="custom-select-trigger" id="ob-goal-trigger">
                  <div class="custom-select-trigger-content">
                    <div class="custom-select-icon" id="ob-goal-icon">${currentGoalObj.icon}</div>
                    <div class="custom-select-text">
                      <strong id="ob-goal-title">${currentGoalObj.title}</strong>
                      <span class="custom-select-sub" id="ob-goal-sub">${currentGoalObj.sub}</span>
                    </div>
                  </div>
                  <div class="custom-select-badge-action">
                    <span>Alterar</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </button>
                <input type="hidden" id="ob-goal" value="${currentGoalKey}" />
              </div>

              <!-- FREQUÊNCIA SEMANAL -->
              <div class="form-group" style="margin-bottom: 24px;">
                <label class="form-label">Frequência Semanal Desejada</label>
                <button type="button" class="custom-select-trigger" id="ob-freq-trigger">
                  <div class="custom-select-trigger-content">
                    <div class="custom-select-icon" id="ob-freq-icon">${currentFreqObj.icon}</div>
                    <div class="custom-select-text">
                      <strong id="ob-freq-title">${currentFreqObj.title}</strong>
                      <span class="custom-select-sub" id="ob-freq-sub">${currentFreqObj.sub}</span>
                    </div>
                  </div>
                  <div class="custom-select-badge-action">
                    <span>Alterar</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </button>
                <input type="hidden" id="ob-frequency" value="${currentFreqKey}" />
              </div>

              <button type="submit" class="onboarding-apple-btn glow" style="background: #ffffff; color: #000000; font-weight: 800;">
                <span>AVANÇAR PARA O ACESSO (2/3)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </form>
          </div>
        </div>
      `;

      // Handlers Step 2
      modalContainer.querySelector('#ob-btn-back')?.addEventListener('click', () => {
        sound.playTapSound();
        this.openAppleOnboarding(3);
      });

      const goalTrigger = modalContainer.querySelector('#ob-goal-trigger');
      if (goalTrigger) {
        goalTrigger.addEventListener('click', () => {
          sound.playTapSound();
          const currentVal = modalContainer.querySelector('#ob-goal').value;
          const goalOptionsList = [
            { value: 'hipertrofia', icon: GOAL_CONFIG.hipertrofia.icon, title: GOAL_CONFIG.hipertrofia.title, desc: GOAL_CONFIG.hipertrofia.desc },
            { value: 'emagrecimento', icon: GOAL_CONFIG.emagrecimento.icon, title: GOAL_CONFIG.emagrecimento.title, desc: GOAL_CONFIG.emagrecimento.desc },
            { value: 'condicionamento', icon: GOAL_CONFIG.condicionamento.icon, title: GOAL_CONFIG.condicionamento.title, desc: GOAL_CONFIG.condicionamento.desc }
          ];

          this.openOptionPickerModal({
            title: 'Objetivo Principal',
            subtitle: 'Qual é o seu maior foco de treinamento agora?',
            options: goalOptionsList,
            currentValue: currentVal,
            onSelect: (selectedVal) => {
              const chosen = GOAL_CONFIG[selectedVal];
              if (chosen) {
                modalContainer.querySelector('#ob-goal').value = selectedVal;
                modalContainer.querySelector('#ob-goal-icon').innerHTML = chosen.icon;
                modalContainer.querySelector('#ob-goal-title').textContent = chosen.title;
                modalContainer.querySelector('#ob-goal-sub').textContent = chosen.sub;
                this._tempOnboarding.goal = selectedVal;
              }
            }
          });
        });
      }

      const freqTrigger = modalContainer.querySelector('#ob-freq-trigger');
      if (freqTrigger) {
        freqTrigger.addEventListener('click', () => {
          sound.playTapSound();
          const currentVal = modalContainer.querySelector('#ob-frequency').value;
          const freqOptionsList = [
            { value: '3', icon: FREQ_CONFIG[3].icon, title: FREQ_CONFIG[3].title, desc: FREQ_CONFIG[3].desc },
            { value: '4', icon: FREQ_CONFIG[4].icon, title: FREQ_CONFIG[4].title, desc: FREQ_CONFIG[4].desc },
            { value: '5', icon: FREQ_CONFIG[5].icon, title: FREQ_CONFIG[5].title, desc: FREQ_CONFIG[5].desc }
          ];

          this.openOptionPickerModal({
            title: 'Frequência Semanal',
            subtitle: 'Quantos dias por semana você pretende treinar?',
            options: freqOptionsList,
            currentValue: currentVal,
            onSelect: (selectedVal) => {
              const chosen = FREQ_CONFIG[selectedVal];
              if (chosen) {
                modalContainer.querySelector('#ob-frequency').value = selectedVal;
                modalContainer.querySelector('#ob-freq-icon').innerHTML = chosen.icon;
                modalContainer.querySelector('#ob-freq-title').textContent = chosen.title;
                modalContainer.querySelector('#ob-freq-sub').textContent = chosen.sub;
                this._tempOnboarding.frequency = parseInt(selectedVal, 10);
              }
            }
          });
        });
      }

      modalContainer.querySelector('#onboarding-step2-form').addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playTapSound();
        this._tempOnboarding.goal = modalContainer.querySelector('#ob-goal').value || 'hipertrofia';
        this._tempOnboarding.frequency = parseInt(modalContainer.querySelector('#ob-frequency').value, 10) || 4;
        this.openAppleOnboarding(5);
      });

      return;
    }

    // ==========================================
    // ETAPA 3 DE 3: CADASTRO DO USUÁRIO & ACESSO (stepIndex === 5)
    // ==========================================
    if (stepIndex === 5) {
      modalContainer.innerHTML = `
        <div class="onboarding-fullscreen-portal" id="onboarding-calibrate-portal">
          <div class="onboarding-apple-container" style="text-align: left;">
            <div class="onboarding-apple-nav" style="justify-content: space-between;">
              <button type="button" class="onboarding-apple-skip" id="ob-btn-back" style="padding-left: 0; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                <span>Voltar</span>
              </button>
              <span class="onboarding-apple-badge">ETAPA 3 DE 3</span>
            </div>

            <div class="onboarding-wizard-progress">
              <div class="onboarding-wizard-bar active"></div>
              <div class="onboarding-wizard-bar active"></div>
              <div class="onboarding-wizard-bar active"></div>
            </div>

            <div style="margin: 4px 0 14px;">
              <h2 class="onboarding-apple-title" style="font-size: 1.6rem; text-align: left; margin: 0 0 6px;">
                CRIE SUA CONTA
              </h2>
              <p class="onboarding-apple-desc" style="text-align: left; max-width: 100%; font-size: 0.84rem; margin: 0;">
                Sincronize seu templo na nuvem para treinar no iPhone, Mac ou qualquer dispositivo com segurança.
              </p>
            </div>

            <!-- Abas Criar Conta / Entrar -->
            <div class="onboarding-auth-tabs">
              <button type="button" id="ob-tab-signup" class="onboarding-auth-tab active">
                CRIAR CONTA
              </button>
              <button type="button" id="ob-tab-login" class="onboarding-auth-tab">
                JÁ TENHO CONTA (ENTRAR)
              </button>
            </div>

            <form id="onboarding-auth-form" style="width: 100%;">
              <div class="form-group" id="ob-group-name" style="margin-bottom: 12px;">
                <label class="form-label">Nome</label>
                <input type="text" class="form-input" id="ob-auth-name" value="${t.name || ''}" placeholder="Seu nome ou apelido" />
              </div>

              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">E-mail</label>
                <input type="email" class="form-input" id="ob-auth-email" placeholder="seu-email@exemplo.com" required />
              </div>

              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label">Senha (mínimo 6 caracteres)</label>
                <input type="password" class="form-input" id="ob-auth-password" placeholder="••••••••" minlength="6" required />
              </div>

              <div id="ob-auth-error" style="display: none; padding: 10px 12px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); border-radius: 8px; color: #fca5a5; font-size: 0.76rem; margin-bottom: 14px; line-height: 1.4;"></div>

              <button type="submit" id="ob-btn-submit-auth" class="onboarding-apple-btn glow" style="width: 100%; background: #ffffff; color: #000000; font-weight: 800;">
                <span>CRIAR CONTA & ENTRAR</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </form>

            <!-- Card Destaque: Carregar Dados de Demonstração (Portfólio) -->
            <div class="onboarding-demo-card">
              <button type="button" class="onboarding-demo-action-btn" id="ob-btn-demo-mode">
                <div class="demo-badge-pill">DEMO</div>
                <div class="demo-card-body">
                  <strong>Carregar Dados de Demonstração</strong>
                  <span>Explore o templo com treinos, históricos e conquistas preenchidos</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <!-- Opção Local Offline Discreta -->
            <div style="text-align: center; margin-top: 10px; width: 100%;">
              <button type="button" id="ob-btn-offline-local" style="background: none; border: none; color: #94a3b8; font-size: 0.76rem; cursor: pointer; padding: 8px; text-decoration: underline;">
                Continuar sem cadastro (Modo Offline Local)
              </button>
            </div>
          </div>
        </div>
      `;

      // Handlers Step 3
      modalContainer.querySelector('#ob-btn-back')?.addEventListener('click', () => {
        sound.playTapSound();
        this.openAppleOnboarding(4);
      });

      let authMode = 'signup';
      const tabSignup = modalContainer.querySelector('#ob-tab-signup');
      const tabLogin = modalContainer.querySelector('#ob-tab-login');
      const groupName = modalContainer.querySelector('#ob-group-name');
      const submitBtn = modalContainer.querySelector('#ob-btn-submit-auth');
      const errorBox = modalContainer.querySelector('#ob-auth-error');

      tabSignup.addEventListener('click', () => {
        authMode = 'signup';
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        groupName.style.display = 'block';
        submitBtn.querySelector('span').textContent = 'CRIAR CONTA & ENTRAR';
        errorBox.style.display = 'none';
        sound.playTapSound();
      });

      tabLogin.addEventListener('click', () => {
        authMode = 'login';
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        groupName.style.display = 'none';
        submitBtn.querySelector('span').textContent = 'ENTRAR NO TEMPLO';
        errorBox.style.display = 'none';
        sound.playTapSound();
      });

      // Ação: Dados de Demonstração
      modalContainer.querySelector('#ob-btn-demo-mode')?.addEventListener('click', () => {
        StorageService.loadDemoData();
        this.profile = StorageService.getProfile();
        this.updateHeaderStreak();
        this.updateHeaderAvatar();
        modalContainer.innerHTML = '';
        sound.playVictoryFanfare();
        this.switchTab('templo');
      });

      // Ação: Modo Offline Local
      modalContainer.querySelector('#ob-btn-offline-local')?.addEventListener('click', () => {
        this.profile = {
          ...this.profile,
          name: this._tempOnboarding.name || this.profile.name || '',
          weight: this._tempOnboarding.weight || 75,
          height: this._tempOnboarding.height || 178,
          age: this._tempOnboarding.age || 24,
          goal: this._tempOnboarding.goal || 'hipertrofia',
          frequency: this._tempOnboarding.frequency || 4,
          isOnboarded: true
        };
        StorageService.saveProfile(this.profile);
        modalContainer.innerHTML = '';
        sound.playVictoryFanfare();
        this.updateHeaderStreak();
        this.updateHeaderAvatar();
        this.renderCurrentTab();
      });

      // Submissão do Formulário de Autenticação Supabase
      modalContainer.querySelector('#onboarding-auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = modalContainer.querySelector('#ob-auth-email').value.trim();
        const password = modalContainer.querySelector('#ob-auth-password').value;
        const name = (authMode === 'signup')
          ? modalContainer.querySelector('#ob-auth-name').value.trim()
          : (this._tempOnboarding.name || '');

        submitBtn.disabled = true;
        const origText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = 'Sincronizando com o templo...';
        errorBox.style.display = 'none';

        try {
          if (authMode === 'signup') {
            const res = await SupabaseService.signUp(email, password, {
              name: name || 'Guerreiro',
              auraColor: '#cbd5e1'
            });

            if (!res.success) {
              errorBox.textContent = res.error || 'Erro ao criar conta no Supabase.';
              errorBox.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.querySelector('span').textContent = origText;
              return;
            }

            // Conta criada com sucesso! Atualiza perfil com as métricas do onboarding
            this.profile = {
              ...this.profile,
              name: name || this._tempOnboarding.name || '',
              email,
              weight: this._tempOnboarding.weight || 75,
              height: this._tempOnboarding.height || 178,
              age: this._tempOnboarding.age || 24,
              goal: this._tempOnboarding.goal || 'hipertrofia',
              frequency: this._tempOnboarding.frequency || 4,
              isOnboarded: true
            };

            StorageService.saveProfile(this.profile);

            if (res.data?.user) {
              this.supabaseUser = res.data.user;
              await SupabaseService.saveProfile(this.supabaseUser.id, this.profile);
            }

            sound.playVictoryFanfare();
            modalContainer.innerHTML = '';
            this.updateHeaderStreak();
            this.updateHeaderAvatar();
            this.renderCurrentTab();

            this.showCosmicModalAlert({
              title: 'CONTA CRIADA',
              message: 'Seu perfil foi criado e sincronizado com sucesso na nuvem do Templo!',
              type: 'success'
            });
          } else {
            // Modo Login
            const res = await SupabaseService.signIn(email, password);
            if (!res.success) {
              errorBox.textContent = res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.';
              errorBox.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.querySelector('span').textContent = origText;
              return;
            }

            this.supabaseUser = res.data.user;
            this.profile.email = email;
            this.profile.isOnboarded = true;

            const cloudProfile = await SupabaseService.getProfile(this.supabaseUser.id);
            if (cloudProfile) {
              this.profile = { ...this.profile, ...cloudProfile, isOnboarded: true };
            }

            StorageService.saveProfile(this.profile);
            sound.playVictoryFanfare();
            modalContainer.innerHTML = '';
            this.updateHeaderStreak();
            this.updateHeaderAvatar();
            this.renderCurrentTab();
          }
        } catch (err) {
          errorBox.textContent = err.message || 'Erro inesperado na conexão.';
          errorBox.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.querySelector('span').textContent = origText;
        }
      });

      return;
    }
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
              <span class="ext-btn-icon" style="display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </span>
              <div class="ext-btn-texts">
                <strong>MuscleWiki Oficial</strong>
                <small>Guia 3D & Biomecânica ↗</small>
              </div>
            </a>
            <a href="${exercise.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="ext-guide-btn youtube-btn">
              <span class="ext-btn-icon" style="display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </span>
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
            <h4 style="font-family: var(--font-hud); font-size: 0.75rem; color: var(--neon-pink); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              ERROS COMUNS DE INICIANTES:
            </h4>
            <ul style="list-style-type: none; display: flex; flex-direction: column; gap: 4px;">
              ${exercise.mistakes.map(m => `
                <li style="font-size: 0.78rem; color: var(--concrete-300);">• ${m}</li>
              `).join('')}
            </ul>
          </div>

          <!-- Dica de Ouro -->
          <div style="background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.25); padding: 12px; border-radius: 10px; margin-bottom: 20px;">
            <div style="font-family: var(--font-hud); font-size: 0.75rem; color: var(--neon-cyan); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18h6"/>
                <path d="M10 22h4"/>
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
              </svg>
              DICA DE OURO:
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
          <div class="celebration-trophy" style="display: flex; justify-content: center; margin-bottom: 8px;">
            <div style="width: 62px; height: 62px; border-radius: 50%; background: rgba(56, 189, 248, 0.12); border: 1.5px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 24px rgba(56, 189, 248, 0.35);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.7));">
                <path d="M2 9.5L12 4l10 5.5v1H2v-1z" fill="rgba(56, 189, 248, 0.2)" />
                <line x1="6" y1="11" x2="6" y2="18" />
                <line x1="10" y1="11" x2="10" y2="18" />
                <line x1="14" y1="11" x2="14" y2="18" />
                <line x1="18" y1="11" x2="18" y2="18" />
                <line x1="3" y1="18" x2="21" y2="18" />
                <line x1="2" y1="21" x2="22" y2="21" />
              </svg>
            </div>
          </div>
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
              <div class="recap-val" style="color: var(--solar-gold); display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                +1 DIA
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" fill="rgba(249,115,22,0.3)"/>
                </svg>
              </div>
              <div class="recap-lbl">Streak Atualizado</div>
            </div>
          </div>

          <p style="font-size: 0.8rem; color: var(--concrete-300); font-style: italic; margin-bottom: 24px;">
            “O descanso agora é o solo onde a sua força floresce.”
          </p>

          <button class="btn-enter-temple" id="btn-close-checkout">
            RETORNAR AO TEMPLO 
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
  initPixelStars();
  new AgiteMeApp();
});
