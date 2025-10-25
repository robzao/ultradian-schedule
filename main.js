const chargeEl = document.getElementById('charge');
const overlayEl = document.getElementById('overlay');
const displayEl = document.getElementById('display');
const inProgressEl = document.getElementById('in-progress');
const comingSoonEl = document.getElementById('coming-soon');
const faviconEl = document.getElementById('favicon');
const titleEl = document.getElementById('title');

const FRACTIONS_PER_BLOCK = 6; 
const TOTAL_BLOCKS = 13;
const TOTAL_FRACTIONS = TOTAL_BLOCKS * FRACTIONS_PER_BLOCK;
const SECONDS_IN_DAY = 86400;
const BLOCK_INTERVAL_SEC = SECONDS_IN_DAY / TOTAL_BLOCKS;
const FRACTION_INTERVAL_SEC = SECONDS_IN_DAY / TOTAL_FRACTIONS;
const START_OFFSET_SEC = 6 * 3600 - 4 * BLOCK_INTERVAL_SEC; // Sets block 4 (Morning Routine) to start at 06:00:00
const TARGET_TIMEZONE_HOURS = -3;
const TARGET_TIMEZONE_MS = TARGET_TIMEZONE_HOURS * 3600000;

const chargeList = [
  'charge--green',
  'charge--green',
  'charge--green',
  'charge--green',
  'charge--yellow',
  'charge--red'
];

const inProgressList = [
  'Deep Rest (2)',
  'Deep Rest (3)',
  'Deep Rest (4)',
  'Deep Rest (5)',
  'Morning Routine',
  'Learning Routine (1)',
  'Learning Routine (2)',
  'Learning Routine (3)',
  'Social Routine',
  'Fitness Routine',
  'Active Recall Routine',
  'Evening Routine',
  'Deep Rest (1)'
];

const faviconList = [
  'https://robzao.github.io/ultradian-schedule/images/favicon-green.svg',
  'https://robzao.github.io/ultradian-schedule/images/favicon-green.svg',
  'https://robzao.github.io/ultradian-schedule/images/favicon-green.svg',
  'https://robzao.github.io/ultradian-schedule/images/favicon-green.svg',
  'https://robzao.github.io/ultradian-schedule/images/favicon-yellow.svg',
  'https://robzao.github.io/ultradian-schedule/images/favicon-red.svg'
];

let chargeIdx = 0;
let inProgressIdx = 0;
let faviconIdx = 0;

// ----- TIME HELPERS -----
function secondsSinceMidnight() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const targetTime = new Date(utc + TARGET_TIMEZONE_MS); 
  return targetTime.getHours() * 3600 + targetTime.getMinutes() * 60 + targetTime.getSeconds();
}

function secondsSinceMidnightAdjusted() {
  const seconds = secondsSinceMidnight();
  return (seconds - START_OFFSET_SEC + SECONDS_IN_DAY) % SECONDS_IN_DAY;
}

function msUntilNextInterval(intervalSec) {
  const seconds = secondsSinceMidnightAdjusted();
  const secondsToNext = intervalSec - (seconds % intervalSec);
  return secondsToNext * 1000 + 1; 
}

// ----- PROGRESS HELPERS -----
function getBlockProgress() {
  const adjustedSeconds = secondsSinceMidnightAdjusted();
  const secondsIntoBlock = adjustedSeconds % BLOCK_INTERVAL_SEC;
  const secondsRemaining = BLOCK_INTERVAL_SEC - secondsIntoBlock;
  const percentage = (secondsRemaining / BLOCK_INTERVAL_SEC) * 100;
  return Math.max(1, percentage); 
}

// ----- INDEX HELPERS -----
function getCurrentFractionIndex() {
  const fractions = Math.floor(secondsSinceMidnightAdjusted() / FRACTION_INTERVAL_SEC);
  return fractions % chargeList.length; 
}

function getCurrentBlockIndex() {
  const blocks = Math.floor(secondsSinceMidnightAdjusted() / BLOCK_INTERVAL_SEC);
  return blocks % inProgressList.length; 
}

// ----- CHARGE LOGIC -----
function updateCharge() {
  chargeIdx = getCurrentFractionIndex();
  chargeEl.className = '';
  chargeEl.classList.add(chargeList[chargeIdx]);
}

// ----- SECOND-BASED LOGIC (OVERLAY/DISPLAY/TITLE) -----
function updateSecondBasedLogic() {
  const percentageRaw = getBlockProgress();
  const percentageRounded = Math.ceil(percentageRaw); 
  const scaleYValue = (100 - percentageRaw) / 100;
  overlayEl.style.transform = `scaleY(${scaleYValue})`;
  displayEl.textContent = percentageRounded + '%'; 
  const activityName = inProgressList[getCurrentBlockIndex()]; 
  titleEl.textContent = `${percentageRounded}% – ${activityName}`;
}

// ----- CAPTION LOGIC -----
function updateCaption() {
  inProgressIdx = getCurrentBlockIndex();
  comingSoonEl.textContent = (inProgressIdx < inProgressList.length - 1)
    ? inProgressList[inProgressIdx + 1]
    : inProgressList[0];
  inProgressEl.textContent = inProgressList[inProgressIdx]; 
  displayEl.classList.add('transition-pulse');
  setTimeout(() => {
    displayEl.classList.remove('transition-pulse');
  }, 250); 
}

// ----- FAVICON LOGIC -----
function updateFavicon() {
  faviconIdx = getCurrentFractionIndex();
  faviconEl.href = faviconList[faviconIdx];
}

// ----- SCHEDULE LOGIC -----
function scheduleCharge() {
  updateCharge();
  setTimeout(scheduleCharge, msUntilNextInterval(FRACTION_INTERVAL_SEC));
}

function scheduleSecondBasedLogic() {
  updateSecondBasedLogic();
  setTimeout(scheduleSecondBasedLogic, 1000); 
}

function scheduleCaption() {
  updateCaption();
  setTimeout(scheduleCaption, msUntilNextInterval(BLOCK_INTERVAL_SEC));
}

function scheduleFavicon() {
  updateFavicon();
  setTimeout(scheduleFavicon, msUntilNextInterval(FRACTION_INTERVAL_SEC));
}

// ----- INIT -----
function init() {
  updateSecondBasedLogic();
  overlayEl.offsetHeight;
  overlayEl.classList.add('has-transition');
  scheduleCharge();
  scheduleSecondBasedLogic();
  scheduleCaption();
  scheduleFavicon();
}

document.addEventListener('DOMContentLoaded', init);

// ----- SCHEDULE VISUALIZATION HELPERS -----
function formatSecondsToTime(totalSeconds) {
  let secondsRemaining = Math.round(totalSeconds) % SECONDS_IN_DAY; 
  const hours = Math.floor(secondsRemaining / 3600);
  secondsRemaining %= 3600;
  const minutes = Math.floor(secondsRemaining / 60);
  secondsRemaining %= 60;
  const seconds = secondsRemaining;
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getSchedule() {
  const schedule = [];
  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    const adjustedTime = i * BLOCK_INTERVAL_SEC;
    const realStartTimeSeconds = (adjustedTime + START_OFFSET_SEC + SECONDS_IN_DAY) % SECONDS_IN_DAY;
    const activityName = inProgressList[i];
    schedule.push({
      time: formatSecondsToTime(realStartTimeSeconds),
      activity: activityName
    });
  }
  return schedule;
}
