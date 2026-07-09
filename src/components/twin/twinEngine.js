// ============================================
// HTL DIGITAL TWIN — Patient Flow Engine
// Deterministic stock-and-flow model of ED →
// inpatient movement. No clinical decisions:
// beds, queues, staffing, timestamps only.
// ============================================

export const SIM_START_HOUR = 11;   // demo starts 11:00
export const SIM_HOURS = 9;         // model until 20:00
export const TICK_MIN = 15;
export const TICKS = (SIM_HOURS * 60) / TICK_MIN; // 36

export const WARDS = [
  { key: 'ed',     name: 'Emergency',        short: 'ED',  cap: 20, occ0: 15, dcReady: 0, kind: 'ed' },
  { key: 'med7b',  name: 'Medical 7B',       short: '7B',  cap: 28, occ0: 26, dcReady: 5, kind: 'ward' },
  { key: 'surg5a', name: 'Surgical 5A',      short: '5A',  cap: 24, occ0: 21, dcReady: 3, kind: 'ward' },
  { key: 'icu',    name: 'ICU Step-down',    short: 'SD',  cap: 12, occ0: 11, dcReady: 1, kind: 'ward' },
  { key: 'lounge', name: 'Discharge Lounge', short: 'DL',  cap: 10, occ0: 0,  dcReady: 0, kind: 'lounge' },
];

// ED arrivals per hour from 11:00 → 19:00 (typical weekday afternoon ramp)
const ARRIVALS_PER_HOUR = [6, 7, 9, 11, 10, 8, 6, 5, 4];
const ADMIT_FRACTION = 0.35;          // arrivals needing an inpatient bed
const ED_TREAT_DISCHARGE_RATE = 0.085; // share of non-admit ED patients leaving per tick

export const DEFAULT_LEVERS = {
  overflowBeds: false,   // open 6 flex beds on Medical 7B
  dischargePush: false,  // pull discharge-ready patients forward to before 13:00
  extraPorter: false,    // second porter → doubles transfer throughput
  loungeActive: false,   // discharge-ready patients wait in lounge, freeing beds now
};

export function hhmm(tick) {
  const mins = SIM_START_HOUR * 60 + tick * TICK_MIN;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Baseline discharge curve: late-afternoon exit (the classic problem).
// dischargePush moves half of the ready pool into the first two hours.
function dischargeSchedule(ward, levers) {
  const out = new Array(TICKS).fill(0);
  if (!ward.dcReady) return out;
  const late = [];
  // baseline: discharges land between 15:00 and 18:00 (ticks 16..28)
  for (let i = 0; i < ward.dcReady; i++) late.push(16 + Math.round((i * 12) / Math.max(1, ward.dcReady - 1)));
  let slots = late;
  if (levers.dischargePush) {
    const early = Math.ceil(ward.dcReady / 2);
    slots = [];
    for (let i = 0; i < early; i++) slots.push(2 + i * 2);            // 11:30 onward
    for (let i = early; i < ward.dcReady; i++) slots.push(late[i]);   // rest unchanged
  }
  slots.forEach(t => { if (t < TICKS) out[t] += 1; });
  return out;
}

export function simulate(levers) {
  const L = { ...DEFAULT_LEVERS, ...levers };
  const wards = WARDS.map(w => ({ ...w }));
  const inpatient = wards.filter(w => w.kind === 'ward');

  // apply structural levers
  const med = inpatient.find(w => w.key === 'med7b');
  const capBonus = L.overflowBeds ? 6 : 0;
  const porterPerTick = L.extraPorter ? 2 : 1;

  // lounge: discharge-ready patients relocate immediately, freeing ward beds
  const lounge = wards.find(w => w.key === 'lounge');
  let loungeOcc = 0;
  const freedByLounge = {};
  inpatient.forEach(w => { freedByLounge[w.key] = L.loungeActive ? w.dcReady : 0; });
  if (L.loungeActive) loungeOcc = inpatient.reduce((s, w) => s + w.dcReady, 0);

  const dcCurves = {};
  inpatient.forEach(w => { dcCurves[w.key] = dischargeSchedule(w, L); });

  // state
  let edOcc = wards[0].occ0;
  let edBoarding = 4; // patients in ED already waiting for a bed
  const occ = {};
  inpatient.forEach(w => { occ[w.key] = w.occ0 - freedByLounge[w.key]; });

  const series = [];
  let breachAt = null, rampRiskAt = null, peakEd = 0, totalTransfers = 0;

  for (let t = 0; t < TICKS; t++) {
    // arrivals
    const arr = ARRIVALS_PER_HOUR[Math.floor((t * TICK_MIN) / 60)] / (60 / TICK_MIN);
    edOcc += arr;
    edBoarding += arr * ADMIT_FRACTION;

    // ED treat-and-discharge stream
    const nonAdmit = Math.max(0, edOcc - edBoarding);
    const tdOut = nonAdmit * ED_TREAT_DISCHARGE_RATE;
    edOcc -= tdOut;

    // inpatient discharges (frees beds); lounge patients go home from the lounge
    const transfersByWard = {};
    inpatient.forEach(w => {
      const d = dcCurves[w.key][t] || 0;
      if (L.loungeActive) loungeOcc = Math.max(0, loungeOcc - d);
      else occ[w.key] = Math.max(0, occ[w.key] - d);
    });

    // transfers ED → wards, limited by free beds and porter throughput
    let porterBudget = porterPerTick;
    for (const w of inpatient) {
      const cap = w.cap + (w.key === 'med7b' ? capBonus : 0);
      let free = Math.floor(cap - occ[w.key]);
      let moved = 0;
      while (porterBudget > 0 && free > 0 && edBoarding >= 1) {
        occ[w.key] += 1; edOcc -= 1; edBoarding -= 1;
        porterBudget -= 1; free -= 1; moved += 1; totalTransfers += 1;
      }
      transfersByWard[w.key] = moved;
    }

    edOcc = Math.max(0, edOcc);
    peakEd = Math.max(peakEd, edOcc);
    if (breachAt === null && edOcc >= wards[0].cap) breachAt = t;
    if (rampRiskAt === null && edOcc >= wards[0].cap * 0.9) rampRiskAt = t;

    series.push({
      t, time: hhmm(t),
      ed: +edOcc.toFixed(1),
      boarding: +Math.max(0, edBoarding).toFixed(1),
      lounge: +loungeOcc.toFixed(1),
      wards: inpatient.reduce((o, w) => ({ ...o, [w.key]: +occ[w.key].toFixed(1) }), {}),
      transfers: transfersByWard,
    });
  }

  const capTotal = inpatient.reduce((s, w) => s + w.cap, 0) + capBonus;
  const occAt = (i) => inpatient.reduce((s, w) => s + series[i].wards[w.key], 0);

  return {
    levers: L,
    series,
    breachAt, breachTime: breachAt !== null ? hhmm(breachAt) : null,
    rampRiskAt, rampRiskTime: rampRiskAt !== null ? hhmm(rampRiskAt) : null,
    peakEd: +peakEd.toFixed(1),
    edCap: wards[0].cap,
    hospOccPctNow: Math.round((occAt(0) / capTotal) * 100),
    totalTransfers,
    capBonus,
  };
}

// Per-bed visual state for the 3D scene at a given tick.
// Beds fill deterministically from index 0 so playback is stable.
export function bedStatesAt(result, tick) {
  const s = result.series[Math.min(tick, result.series.length - 1)];
  const out = {};
  WARDS.forEach(w => {
    const cap = w.cap + (w.key === 'med7b' ? result.capBonus : 0);
    let n;
    if (w.key === 'ed') n = s.ed;
    else if (w.key === 'lounge') n = s.lounge;
    else n = s.wards[w.key];
    const full = Math.min(cap, Math.round(n));
    const states = [];
    for (let i = 0; i < w.cap + (w.key === 'med7b' ? 6 : 0); i++) {
      const isFlex = w.key === 'med7b' && i >= w.cap;
      if (isFlex && !result.levers.overflowBeds) states.push('closed');
      else states.push(i < full ? 'occupied' : 'free');
    }
    out[w.key] = states;
    if (w.key === 'ed') out.rampedCount = Math.max(0, Math.round(n) - cap);
  });
  return out;
}
