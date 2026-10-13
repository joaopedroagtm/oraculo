// Cronômetro de Sessão & Timer de Descanso com Vibração e Som • AGiTe-Me!

import { sound } from '../services/audio.js';

export class WorkoutStopwatch {
  constructor(onChange) {
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.isRunning = false;
    this.onChange = onChange;
  }

  start(initialSeconds = 0, initialStartTime = null) {
    this.elapsedSeconds = initialSeconds;
    this.startTime = initialStartTime || Date.now() - (initialSeconds * 1000);
    this.isRunning = true;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      if (this.onChange) {
        this.onChange(this.getFormattedTime(), this.elapsedSeconds);
      }
    }, 1000);

    if (this.onChange) {
      this.onChange(this.getFormattedTime(), this.elapsedSeconds);
    }
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.onChange) {
      this.onChange(this.getFormattedTime(), this.elapsedSeconds);
    }
  }

  resume() {
    if (this.isRunning) return;
    this.start(this.elapsedSeconds, Date.now() - (this.elapsedSeconds * 1000));
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.resume();
    }
    return this.isRunning;
  }

  stop() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    return this.elapsedSeconds;
  }

  getFormattedTime() {
    const hours = Math.floor(this.elapsedSeconds / 3600);
    const minutes = Math.floor((this.elapsedSeconds % 3600) / 60);
    const seconds = this.elapsedSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }
}

// Timer de Descanso (Rest Timer) Modal/Banner
export class RestTimerModal {
  constructor() {
    this.remainingSeconds = 0;
    this.totalDuration = 60;
    this.interval = null;
    this.element = null;
    this.createDom();
  }

  createDom() {
    this.element = document.createElement('div');
    this.element.className = 'rest-timer-overlay hidden';
    this.element.innerHTML = `
      <div class="rest-timer-box stone-panel">
        <div class="rest-glow-orbit"></div>
        <div class="rest-header">
          <span class="rest-badge">TEMPLO DE RECUPERAÇÃO</span>
          <button class="rest-close-btn" id="rest-close-btn">&times;</button>
        </div>
        <div class="rest-ring-container">
          <svg class="rest-progress-ring" viewBox="0 0 120 120">
            <circle class="ring-bg" cx="60" cy="60" r="52" />
            <circle class="ring-fg" id="rest-ring-fg" cx="60" cy="60" r="52" />
          </svg>
          <div class="rest-time-display">
            <span class="rest-seconds" id="rest-seconds-display">60</span>
            <span class="rest-unit">seg</span>
          </div>
        </div>
        <div class="rest-controls">
          <button class="rest-adj-btn" id="rest-sub-15">-15s</button>
          <button class="rest-skip-btn" id="rest-skip-btn">Pular Descanso</button>
          <button class="rest-adj-btn" id="rest-add-15">+15s</button>
        </div>
        <div class="rest-quote" id="rest-quote">“Respire fundo. O músculo se reconstrói no silêncio cósmico.”</div>
      </div>
    `;
    document.body.appendChild(this.element);

    // Event listeners
    this.element.querySelector('#rest-close-btn').addEventListener('click', () => this.stop());
    this.element.querySelector('#rest-skip-btn').addEventListener('click', () => this.stop());
    this.element.querySelector('#rest-add-15').addEventListener('click', () => this.addTime(15));
    this.element.querySelector('#rest-sub-15').addEventListener('click', () => this.addTime(-15));
  }

  start(seconds = 60) {
    this.totalDuration = seconds;
    this.remainingSeconds = seconds;
    this.element.classList.remove('hidden');
    this.updateDom();

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        sound.playCountdownBeep();
        if ('vibrate' in navigator) navigator.vibrate(80);
      }

      if (this.remainingSeconds <= 0) {
        this.stop();
        sound.playRestFinishedAlert();
        if ('vibrate' in navigator) navigator.vibrate([150, 100, 200]);
        return;
      }

      this.updateDom();
    }, 1000);
  }

  addTime(delta) {
    this.remainingSeconds = Math.max(5, this.remainingSeconds + delta);
    this.totalDuration = Math.max(this.remainingSeconds, this.totalDuration + delta);
    this.updateDom();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.element.classList.add('hidden');
  }

  updateDom() {
    const display = this.element.querySelector('#rest-seconds-display');
    const ring = this.element.querySelector('#rest-ring-fg');
    if (display) display.textContent = this.remainingSeconds;

    if (ring) {
      const radius = 52;
      const circumference = 2 * Math.PI * radius;
      const progress = Math.max(0, this.remainingSeconds / this.totalDuration);
      const offset = circumference * (1 - progress);
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.strokeDashoffset = `${offset}`;
    }
  }
}
