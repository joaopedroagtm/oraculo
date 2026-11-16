// Componente: Calendário Mensal de Treinos (Estilo Stories Arquivados)
// Exibe os dias do mês em grade de 7 colunas; dias com treino exibem a foto registrada (ou marcador de consagração).

import { sound } from '../services/audio.js';

export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class WorkoutPhotoCalendar {
  constructor(containerElement, history = [], options = {}) {
    this.container = containerElement;
    this.history = Array.isArray(history) ? history : [];
    this.onSelectDay = typeof options.onSelectDay === 'function' ? options.onSelectDay : null;
    this.title = options.title || 'CALENDÁRIO DE TREINOS';
    this.subtitle = options.subtitle || 'Toque em um dia registrado para rever foto, legenda e cargas';

    const now = new Date();
    this.viewYear = options.initialYear ?? now.getFullYear();
    this.viewMonth = options.initialMonth ?? now.getMonth();

    this.render();
  }

  update(history) {
    this.history = Array.isArray(history) ? history : [];
    this.render();
  }

  groupHistoryByDate() {
    const map = new Map();
    this.history.forEach(item => {
      if (!item || !item.date) return;
      const key = String(item.date).slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return map;
  }

  render() {
    if (!this.container) return;

    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const isCurrentOrFutureMonth =
      this.viewYear > currentYear ||
      (this.viewYear === currentYear && this.viewMonth >= currentMonth);

    const monthStart = new Date(this.viewYear, this.viewMonth, 1);
    const monthNameRaw = monthStart.toLocaleDateString('pt-BR', { month: 'long' });
    const monthLabel = `${monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1)} ${this.viewYear}`;

    const firstWeekday = monthStart.getDay(); // 0 (Dom) - 6 (Sáb)
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const dateMap = this.groupHistoryByDate();

    const monthPrefix = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-`;
    let monthWorkoutsCount = 0;
    let monthPhotosCount = 0;

    for (const [dateKey, items] of dateMap.entries()) {
      if (dateKey.startsWith(monthPrefix)) {
        monthWorkoutsCount += items.length;
        if (items.some(w => Boolean(w.photoUrl))) {
          monthPhotosCount++;
        }
      }
    }

    const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

    const cellsHtml = [];
    for (let blank = 0; blank < firstWeekday; blank++) {
      cellsHtml.push('<div class="cal-day-cell is-empty" aria-hidden="true"></div>');
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayWorkouts = dateMap.get(dayKey) || [];
      const hasWorkouts = dayWorkouts.length > 0;
      const workoutWithPhoto = dayWorkouts.find(w => w.photoUrl && w.photoUrl.trim().length > 10);
      const isToday = dayKey === todayKey;
      const isFuture = dayKey > todayKey;

      const classes = [
        'cal-day-cell',
        hasWorkouts ? 'has-workout' : '',
        workoutWithPhoto ? 'has-photo' : '',
        isToday ? 'is-today' : '',
        isFuture ? 'is-future' : ''
      ].filter(Boolean).join(' ');

      if (workoutWithPhoto) {
        cellsHtml.push(`
          <button
            type="button"
            class="${classes}"
            data-cal-date="${dayKey}"
            aria-label="Dia ${day}: ${dayWorkouts.length} treino(s) com foto"
          >
            <img src="${workoutWithPhoto.photoUrl}" alt="Treino dia ${day}" class="cal-day-photo" loading="lazy" />
            <span class="cal-day-scrim"></span>
            <span class="cal-day-num-badge">${day}</span>
            ${dayWorkouts.length > 1 ? `<span class="cal-day-multi-badge">${dayWorkouts.length}x</span>` : ''}
          </button>
        `);
      } else if (hasWorkouts) {
        cellsHtml.push(`
          <button
            type="button"
            class="${classes}"
            data-cal-date="${dayKey}"
            aria-label="Dia ${day}: ${dayWorkouts.length} treino(s) concluído(s)"
          >
            <span class="cal-day-num">${day}</span>
            <span class="cal-day-done-dot"></span>
            ${dayWorkouts.length > 1 ? `<span class="cal-day-multi-badge">${dayWorkouts.length}x</span>` : ''}
          </button>
        `);
      } else {
        cellsHtml.push(`
          <div class="${classes}">
            <span class="cal-day-num">${day}</span>
          </div>
        `);
      }
    }

    this.container.innerHTML = `
      <section class="stone-panel workout-calendar-card">
        <div class="cal-header">
          <div class="cal-title-block">
            <div class="cal-title-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3 class="cal-title">${this.title}</h3>
            </div>
            <p class="cal-subtitle">${this.subtitle}</p>
          </div>
          <div class="cal-month-stats-pill">
            <span>${monthWorkoutsCount} ${monthWorkoutsCount === 1 ? 'treino' : 'treinos'}</span>
            ${monthPhotosCount > 0 ? `<span class="cal-stats-sep">•</span><span>${monthPhotosCount} ${monthPhotosCount === 1 ? 'foto' : 'fotos'}</span>` : ''}
          </div>
        </div>

        <div class="cal-month-nav">
          <button type="button" class="cal-nav-btn" data-cal-nav="prev" aria-label="Mês anterior">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="cal-month-label">${monthLabel}</span>
          <button type="button" class="cal-nav-btn ${isCurrentOrFutureMonth ? 'is-disabled' : ''}" data-cal-nav="next" ${isCurrentOrFutureMonth ? 'disabled' : ''} aria-label="Próximo mês">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="cal-weekdays-row">
          ${weekdays.map(w => `<span>${w}</span>`).join('')}
        </div>

        <div class="cal-days-grid">
          ${cellsHtml.join('')}
        </div>
      </section>
    `;

    this.bindEvents(dateMap);
  }

  bindEvents(dateMap) {
    const prevBtn = this.container.querySelector('[data-cal-nav="prev"]');
    const nextBtn = this.container.querySelector('[data-cal-nav="next"]');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.viewMonth === 0) {
          this.viewMonth = 11;
          this.viewYear -= 1;
        } else {
          this.viewMonth -= 1;
        }
        try { sound.playTapSound(); } catch (_) { }
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (nextBtn.disabled) return;
        if (this.viewMonth === 11) {
          this.viewMonth = 0;
          this.viewYear += 1;
        } else {
          this.viewMonth += 1;
        }
        try { sound.playTapSound(); } catch (_) { }
        this.render();
      });
    }

    this.container.querySelectorAll('[data-cal-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dateKey = btn.getAttribute('data-cal-date');
        const items = dateMap.get(dateKey) || [];
        if (items.length > 0 && this.onSelectDay) {
          try {
            sound.playTapSound();
            if ('vibrate' in navigator) navigator.vibrate(25);
          } catch (_) { }
          this.onSelectDay(dateKey, items);
        }
      });
    });
  }
}
