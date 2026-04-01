let timerId = null;
let alarmId = null;
let timerEnd = null;
let alarmWhen = null;
let ringing = false;
let timerRunning = false;
let alarmSet = false;
let mode = 'timer';

function status(msg, err = false) {
  const ell = document.getElementById('status');
  if (!ell) return;
  ell.textContent = msg;
  ell.className = err ? 'status error' : 'status';
}

function button() {
  return document.getElementById('submit');
}

function action(state) {
  const btn = button();
  if (!btn) return;

  if (state === 'ringing') {
    btn.textContent = 'Stop Alarm';
    btn.style.backgroundColor = '#c62828';
    btn.style.color = '#fff';
  } else if (state === 'running') {
    btn.textContent = 'Check Time';
    btn.style.backgroundColor = '#ff9800';
    btn.style.color = '#000';
  } else {
    btn.textContent = mode === 'timer' ? 'Set Timer' : 'Save Alarm';
    btn.style.backgroundColor = '';
    btn.style.color = '';
  }

  btn.disabled = false;
}

function play() {
  const sound = document.getElementById('alarm');
  if (!sound) {
    status('No alarm sound found, man.', true);
    return;
  }

  ringing = true;
  sound.loop = true;
  sound.currentTime = 0;

  const promise = sound.play();
  if (promise && typeof promise.catch === 'function') {
    promise.catch((err) => {
      ringing = false;
      status('Browser blocked playback. Click anything and try again.', true);
      action('idle');
      console.warn('sound block:', err);
    });
  }

  status('Ringing! Hit Stop Alarm when you are done.');
  action('ringing');
}

function stop() {
  if (!ringing) return;

  const sound = document.getElementById('alarm');
  if (!sound) return;

  sound.loop = false;
  sound.pause();
  sound.currentTime = 0;
  ringing = false;

  status('Alarm stopped.');
  action('idle');
}

function parseTime(hour, minute, second) {
  const h = Number(hour);
  const m = Number(minute);
  const s = Number(second);

  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    Number.isNaN(s) ||
    h < 0 ||
    m < 0 ||
    m > 59 ||
    s < 0 ||
    s > 59
  ) {
    return null;
  }

  return { h, m, s };
}

function timer(ms) {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }

  timerEnd = Date.now() + ms;
  timerRunning = true;
  alarmSet = false;

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  status(`Timer set for ${h}h ${m}m ${s}s`);
  action('running');

  timerId = setTimeout(() => {
    timerRunning = false;
    timerId = null;
    timerEnd = null;
    status('Timer done! Let there be alarm.');
    play();
  }, ms);
}

function stopTimer() {
  if (!timerRunning) return;
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }

  timerRunning = false;
  timerEnd = null;
  status('Timer cancelled. No rush.');
  action('idle');
}

function alarm(date) {
  if (alarmId !== null) {
    clearTimeout(alarmId);
    alarmId = null;
  }

  const wait = date.getTime() - Date.now();
  if (wait <= 0) {
    status('Pick a future time, mate.', true);
    return;
  }

  alarmWhen = date;
  alarmSet = true;
  timerRunning = false;
  status(`Alarm is set for ${date.toLocaleString()}`);
  action('running');

  alarmId = setTimeout(() => {
    alarmSet = false;
    alarmId = null;
    alarmWhen = null;
    status('Alarm time! Going off now.');
    play();
  }, wait);
}

function stopAlarm() {
  if (!alarmSet) return;
  if (alarmId !== null) {
    clearTimeout(alarmId);
    alarmId = null;
  }

  alarmWhen = null;
  alarmSet = false;
  status('Alarm cancelled, nice choice.');
  action('idle');
}

function remaining() {
  if (timerRunning && timerEnd) {
    const left = timerEnd - Date.now();
    if (left <= 0) {
      timerRunning = false;
      timerId = null;
      timerEnd = null;
      status('Timer ended, alarm starting.');
      play();
      return;
    }

    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    status(`Time left: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    return;
  }

  if (alarmSet && alarmWhen) {
    const left = alarmWhen.getTime() - Date.now();
    if (left <= 0) {
      alarmSet = false;
      alarmId = null;
      alarmWhen = null;
      status('Alarm time is now!');
      play();
      return;
    }

    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    status(`Alarm in: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    return;
  }

  if (ringing) {
    status('Alarm is currently ringing!');
    return;
  }

  status('Nothing running right now.', true);
}

function handleForm(e) {
  if (e) e.preventDefault();

  if (ringing) {
    stop();
    return;
  }

  if (timerRunning || alarmSet) {
    remaining();
    return;
  }

  const datePick = document.getElementById('date');
  const timePick = document.getElementById('time');

  if (datePick && timePick) {
    const dateValue = datePick.value;
    const timeValue = timePick.value;

    if (!dateValue || !timeValue) {
      status('Need both date and time for an alarm.', true);
      return;
    }

    const target = new Date(`${dateValue}T${timeValue}`);
    if (Number.isNaN(target.getTime())) {
      status('Broken date/time format.', true);
      return;
    }

    if (target <= new Date()) {
      status('Future only, please.', true);
      return;
    }

    mode = 'alarm';
    alarm(target);
    return;
  }

  const hInput = document.getElementById('hours');
  const mInput = document.getElementById('minutes');
  const sInput = document.getElementById('seconds');

  const parts = parseTime(hInput?.value, mInput?.value, sInput?.value);
  if (!parts) {
    status('Invalid timer. hours 0-99, minutes 0-59, seconds 0-59.', true);
    return;
  }

  const total = parts.h * 3600 + parts.m * 60 + parts.s;
  if (total <= 0) {
    status('Duration must be more than zero.', true);
    return;
  }

  if (total >= 24 * 3600) {
    status('Over 24h? Use alarm mode instead.', true);
    return;
  }

  mode = 'timer';
  timer(total * 1000);
}

function boot() {
  const form = document.getElementById('alarm-form');
  if (form) form.addEventListener('submit', handleForm);

  mode = document.getElementById('date') && document.getElementById('time') ? 'alarm' : 'timer';
  action('idle');
}

document.addEventListener('DOMContentLoaded', boot);
