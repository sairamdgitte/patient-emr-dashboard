import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as Ic from '../Icons';
import TwinScene from './TwinScene';
import { simulate, bedStatesAt, DEFAULT_LEVERS, WARDS, TICKS, hhmm } from './twinEngine';
import './twin.css';

// ============================================
// HTL DIGITAL TWIN — Patient Flow Command View
// Live state → 8-hour forecast → what-if sandbox.
// Admin data only: beds, queues, staffing.
// ============================================

const LEVER_DEFS = [
  { key: 'overflowBeds', label: 'Open 6 flex beds · Medical 7B', hint: 'Adds surge capacity to the busiest ward' },
  { key: 'dischargePush', label: 'Pull discharges forward', hint: 'Half of discharge-ready patients leave before 13:00' },
  { key: 'loungeActive', label: 'Activate discharge lounge', hint: 'Ready patients wait in the lounge, freeing beds now' },
  { key: 'extraPorter', label: 'Add second transfer porter', hint: 'Doubles ED → ward transfer throughput' },
];

const fmtBreach = (r) =>
  r.breachAt !== null ? r.breachTime : '—';

function KPI({ label, value, sub, tone }) {
  return (
    <div className={`twin-kpi ${tone ? `twin-kpi--${tone}` : ''}`}>
      <span className="twin-kpi__label">{label}</span>
      <span className="twin-kpi__value">{value}</span>
      {sub && <span className="twin-kpi__sub">{sub}</span>}
    </div>
  );
}

// Hand-rolled SVG forecast chart: baseline (dashed) vs scenario (teal)
function ForecastChart({ baseline, scenario, tick, onScrub }) {
  const Wd = 520, Ht = 150, padL = 30, padR = 10, padT = 12, padB = 22;
  const cap = baseline.edCap;
  const maxY = Math.max(cap + 2, baseline.peakEd, scenario.peakEd) + 2;
  const x = (t) => padL + (t / (TICKS - 1)) * (Wd - padL - padR);
  const y = (v) => padT + (1 - v / maxY) * (Ht - padT - padB);
  const path = (r) => r.series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.ed).toFixed(1)}`).join(' ');

  const ref = useRef(null);
  const scrub = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const rel = ((e.clientX - rect.left) / rect.width) * Wd;
    const t = Math.round(((rel - padL) / (Wd - padL - padR)) * (TICKS - 1));
    onScrub(Math.max(0, Math.min(TICKS - 1, t)));
  };

  return (
    <svg
      ref={ref} className="twin-chart" viewBox={`0 0 ${Wd} ${Ht}`}
      onPointerDown={(e) => { scrub(e); const mv = (ev) => scrub(ev); const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); }}
    >
      {/* capacity line */}
      <line x1={padL} x2={Wd - padR} y1={y(cap)} y2={y(cap)} stroke="var(--crit)" strokeWidth="1" strokeDasharray="2 4" opacity="0.7" />
      <text x={Wd - padR} y={y(cap) - 4} textAnchor="end" className="twin-chart__cap">ED capacity · {cap}</text>

      {/* hour gridlines + labels */}
      {[0, 8, 16, 24, 32].map(t => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={padT} y2={Ht - padB} stroke="var(--line-soft)" strokeWidth="1" />
          <text x={x(t)} y={Ht - 6} textAnchor="middle" className="twin-chart__tick">{hhmm(t)}</text>
        </g>
      ))}

      {/* breach shading on baseline */}
      {baseline.breachAt !== null && (
        <rect x={x(baseline.breachAt)} y={padT} width={x(TICKS - 1) - x(baseline.breachAt)} height={Ht - padT - padB} fill="var(--crit-soft)" opacity="0.5" />
      )}

      <path d={path(baseline)} fill="none" stroke="var(--text-4)" strokeWidth="1.6" strokeDasharray="5 4" />
      <path d={path(scenario)} fill="none" stroke="var(--niin-teal-2)" strokeWidth="2.2" />

      {/* time cursor */}
      <line x1={x(tick)} x2={x(tick)} y1={padT} y2={Ht - padB} stroke="var(--htl-indigo)" strokeWidth="1.4" />
      <circle cx={x(tick)} cy={y(scenario.series[tick].ed)} r="4" fill="var(--niin-teal-2)" stroke="#fff" strokeWidth="1.5" />
      <circle cx={x(tick)} cy={y(baseline.series[tick].ed)} r="3.2" fill="var(--text-4)" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export default function DigitalTwin() {
  const [levers, setLevers] = useState(DEFAULT_LEVERS);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [labels, setLabels] = useState({});

  const baseline = useMemo(() => simulate(DEFAULT_LEVERS), []);
  const scenario = useMemo(() => simulate(levers), [levers]);
  const bedStates = useMemo(() => bedStatesAt(scenario, tick), [scenario, tick]);
  const anyLever = Object.values(levers).some(Boolean);

  // playback
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTick(t => {
        if (t >= TICKS - 1) { setPlaying(false); return t; }
        return t + 1;
      });
    }, 380);
    return () => clearInterval(id);
  }, [playing]);

  const onLabelPositions = useCallback((pos) => setLabels(pos), []);
  const toggle = (k) => setLevers(l => ({ ...l, [k]: !l[k] }));

  const now = scenario.series[tick];
  const breachCleared = baseline.breachAt !== null && scenario.breachAt === null;
  const breachDelayed = scenario.breachAt !== null && baseline.breachAt !== null && scenario.breachAt > baseline.breachAt;

  return (
    <div className="twin">
      {/* ---- header ---- */}
      <div className="twin-head">
        <div>
          <h1 className="twin-head__title">Digital Twin · Patient Flow</h1>
          <p className="twin-head__sub">
            Live bed state and an 8-hour forecast for Ward Block C.
            Test a decision in the sandbox before committing it on the floor.
          </p>
        </div>
        <div className="twin-head__meta">
          <span className="twin-live-dot" /> Live feed · Meraki, ADT, rostering
        </div>
      </div>

      {/* ---- KPI strip ---- */}
      <div className="twin-kpis">
        <KPI label="Sim time" value={now.time} sub={`tick ${tick + 1}/${TICKS}`} />
        <KPI label="ED occupancy" value={`${Math.round(now.ed)}/${scenario.edCap}`}
             tone={now.ed >= scenario.edCap ? 'crit' : now.ed >= scenario.edCap * 0.9 ? 'warn' : 'ok'}
             sub={`${Math.round(now.boarding)} awaiting a bed`} />
        <KPI label="Predicted ED breach" value={fmtBreach(scenario)}
             tone={scenario.breachAt === null ? 'ok' : 'crit'}
             sub={anyLever ? `baseline ${fmtBreach(baseline)}` : 'no interventions applied'} />
        <KPI label="Peak ED load" value={scenario.peakEd}
             sub={anyLever ? `baseline ${baseline.peakEd}` : 'next 8 hours'} />
        <KPI label="Ward occupancy" value={`${scenario.hospOccPctNow}%`} sub="inpatient beds, now" />
      </div>

      <div className="twin-grid">
        {/* ---- 3D twin ---- */}
        <section className="card twin-scene-card">
          <div className="twin-scene-wrap">
            <TwinScene bedStates={bedStates} onLabelPositions={onLabelPositions} />
            {WARDS.map(w => labels[w.key]?.visible && (
              <div key={w.key} className="twin-ward-label" style={{ left: labels[w.key].x, top: labels[w.key].y }}>
                <b>{w.name}</b>
                <span>
                  {w.key === 'ed'
                    ? `${Math.round(now.ed)}/${scenario.edCap}`
                    : w.key === 'lounge'
                      ? `${Math.round(now.lounge)}/${w.cap}`
                      : `${Math.round(now.wards[w.key])}/${w.cap + (w.key === 'med7b' ? scenario.capBonus : 0)}`}
                </span>
              </div>
            ))}
            <div className="twin-legend">
              <span><i className="twin-swatch" style={{ background: 'var(--htl-indigo-2)' }} /> Occupied</span>
              <span><i className="twin-swatch" style={{ background: 'var(--niin-teal)' }} /> Available</span>
              <span><i className="twin-swatch" style={{ background: 'var(--line-strong)' }} /> Closed flex</span>
              <span><i className="twin-swatch" style={{ background: 'var(--crit)' }} /> Ramped arrival</span>
            </div>
          </div>

          {/* ---- timeline ---- */}
          <div className="twin-timeline">
            <button className="btn btn--primary twin-play" onClick={() => {
              if (tick >= TICKS - 1) setTick(0);
              setPlaying(p => !p);
            }}>
              {playing ? 'Pause' : tick >= TICKS - 1 ? 'Replay' : tick > 0 ? 'Resume' : 'Play forecast'}
            </button>
            <input
              type="range" min="0" max={TICKS - 1} value={tick}
              onChange={e => { setPlaying(false); setTick(+e.target.value); }}
              className="twin-scrub" aria-label="Forecast time"
            />
            <span className="twin-timeline__clock">{now.time}</span>
          </div>
        </section>

        {/* ---- right rail ---- */}
        <div className="twin-rail">
          {/* alert */}
          {scenario.breachAt !== null ? (
            <div className="twin-alert twin-alert--crit">
              <Ic.Alert />
              <div>
                <b>ED predicted to breach at {scenario.breachTime}</b>
                <span>Ambulance ramping risk from {scenario.rampRiskTime}. Test interventions below.</span>
              </div>
            </div>
          ) : (
            <div className="twin-alert twin-alert--ok">
              <Ic.Check />
              <div>
                <b>{breachCleared ? `Breach at ${baseline.breachTime} averted` : 'No breach predicted'}</b>
                <span>{breachCleared ? 'Current interventions keep ED under capacity all shift.' : 'ED stays under capacity for the next 8 hours.'}</span>
              </div>
            </div>
          )}

          {/* sandbox */}
          <section className="card twin-sandbox">
            <div className="twin-card-title">
              <h3>What-if sandbox</h3>
              {anyLever && <button className="twin-reset" onClick={() => setLevers(DEFAULT_LEVERS)}>Reset</button>}
            </div>
            <p className="twin-card-sub">Changes apply to the model only — nothing moves on the floor.</p>
            {LEVER_DEFS.map(l => (
              <label key={l.key} className={`twin-lever ${levers[l.key] ? 'is-on' : ''}`}>
                <input type="checkbox" checked={levers[l.key]} onChange={() => toggle(l.key)} />
                <span className="twin-lever__track"><span className="twin-lever__thumb" /></span>
                <span className="twin-lever__text">
                  <b>{l.label}</b>
                  <span>{l.hint}</span>
                </span>
              </label>
            ))}
            {(breachCleared || breachDelayed) && (
              <div className="twin-delta">
                {breachCleared
                  ? <>Breach <s>{baseline.breachTime}</s> → <b>cleared</b> · peak {baseline.peakEd} → <b>{scenario.peakEd}</b></>
                  : <>Breach {baseline.breachTime} → <b>{scenario.breachTime}</b> · peak {baseline.peakEd} → <b>{scenario.peakEd}</b></>}
              </div>
            )}
          </section>

          {/* forecast chart */}
          <section className="card twin-forecast">
            <div className="twin-card-title"><h3>ED occupancy forecast</h3></div>
            <p className="twin-card-sub">
              <i className="twin-key twin-key--scenario" /> scenario ·{' '}
              <i className="twin-key twin-key--baseline" /> baseline · drag to scrub
            </p>
            <ForecastChart baseline={baseline} scenario={scenario} tick={tick} onScrub={(t) => { setPlaying(false); setTick(t); }} />
          </section>

          {/* AI briefing — Fable 5 plugs in here */}
          <section className="card twin-brief">
            <div className="twin-card-title"><h3>Flow briefing</h3><span className="twin-ai-tag">AI</span></div>
            <p>
              {scenario.breachAt !== null
                ? `Afternoon arrivals peak between 13:00 and 15:00 while ${WARDS[1].dcReady + WARDS[2].dcReady + WARDS[3].dcReady} discharge-ready patients are still holding inpatient beds until late afternoon. The bottleneck is bed egress, not ED demand — freeing beds before 13:00 has the largest effect.`
                : `Current interventions hold ED at ${scenario.peakEd} of ${scenario.edCap} at peak. Discharge timing is doing most of the work; flex beds provide the remaining headroom. Recommend confirming porter availability for the 13:00–15:00 window.`}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
