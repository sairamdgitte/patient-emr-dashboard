import React, { useState } from 'react';
import * as Ic from './Icons';
import { Avatar, StatusDot } from './Worklist';
import { CONDITION_LABEL, medLabel, recent, inRange, WH_IC, WH_AI, HF_SPACE, PAT_PHONE, HOST_PHONE } from './data';

const Section = ({ title, action, children }) => (
  <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div className="row"><div className="micro" style={{ color: 'var(--text-3)' }}>{title}</div><div style={{ flex: 1 }} />{action}</div>
    {children}
  </div>
);

const VitalCard = ({ icon: C, label, value, unit, status, range }) => (
  <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div className="row" style={{ color: 'var(--text-3)', fontSize: 11.5 }}>
      <C size={13} />
      <span style={{ textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 10.5, fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1 }} />
      {status && status !== 'ok' && <span className={`tag tag--${status === 'high' ? 'crit' : 'warn'}`} style={{ fontSize: 10 }}>{status === 'high' ? '↑ High' : '↓ Low'}</span>}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontSize: 28, fontWeight: 300, color: status === 'high' ? 'var(--crit)' : status === 'low' ? 'var(--warn)' : 'var(--htl-indigo)', letterSpacing: '-.02em' }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{unit}</span>
    </div>
    <div style={{ fontSize: 10.5, color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>ref {range}</div>
  </div>
);

const PatientView = ({ p, onBack }) => {
  const [tab, setTab] = useState('Summary');
  const [showIC, setShowIC] = useState(false);
  const [icStatus, setIcStatus] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const tabs = ['Summary', 'Medications', 'Conditions', 'Observations', 'Webex'];

  const fireIC = async () => {
    setShowIC(true); setIcStatus('Connecting…');
    try {
      await fetch(WH_IC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientName: p.name, patientMobile: PAT_PHONE, hostMobile: HOST_PHONE }) });
      setIcStatus('Webex Instant Connect initiated! Both parties will receive a connection request.');
    } catch (e) { setIcStatus('Failed to connect. Try again.'); }
  };

  const fireAI = async () => {
    setShowAI(true); setAiLoading(true); setAiText('');
    try {
      const prompt = `Provide a concise 3-4 sentence clinical summary for: ${p.name}, ${p.age}${p.sex}, conditions: ${p.conditions.join(', ')}, allergies: ${p.allergies.join(', ') || 'none'}, meds: ${p.medications.map(m => medLabel(m).name).join(', ')}. Recent obs: ${p.observations.slice(-5).map(o => `${o.type}:${o.value}${o.unit}`).join(', ')}. Focus on key risks, notable trends, clinical attention areas.`;
      const r = await fetch(HF_SPACE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: [prompt] }) });
      const { event_id } = await r.json();
      const r2 = await fetch(`${HF_SPACE}/${event_id}`);
      const txt = await r2.text();
      const lines = txt.split('\n').filter(l => l.startsWith('data:'));
      const d = JSON.parse(lines[lines.length - 1].replace('data: ', ''));
      setAiText(d[0]);
    } catch (e) { setAiText('Unable to generate AI summary at this time.'); }
    finally { setAiLoading(false); }
  };

  const sendSMS = async () => {
    try {
      await fetch(WH_AI, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientName: p.name, patientMobile: PAT_PHONE, patientSummary: aiText }) });
      alert('Summary sent to patient!');
    } catch (e) { alert('Failed to send.'); }
  };

  const hr = recent(p, 'Heart rate'), bp = recent(p, 'Blood pressure'), spo2 = recent(p, 'SpO₂'), rr = recent(p, 'Respiratory rate'), wt = recent(p, 'Body weight');
  const sysOk = bp ? inRange(bp.split('/')[0], '<140') : 'ok';
  const PU = process.env.PUBLIC_URL;

  return (
    <div className="fade-up">
      {/* Patient header */}
      <div style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ padding: '18px 28px 22px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <Avatar p={p} size={84} />
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 300, margin: 0, letterSpacing: '-.02em', color: 'var(--htl-indigo)' }}>{p.name}</h1>
              <StatusDot status={p.status} />
              {p.allergies.map(a => (<span key={a} className="tag tag--crit"><Ic.Alert size={11} />Allergy: {a}</span>))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <span className="mono">MRN {p.mrn}</span>
              <span>{p.age} yrs · {p.Gender}</span>
              <span>DOB {new Date(p['D.O.B']).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>·</span>
              <span><b style={{ color: 'var(--text-2)' }}>Ward</b> {p.ward}</span>
              <span><b style={{ color: 'var(--text-2)' }}>Room</b> <span className="mono">{p.room}</span> · Bed {p.bed}</span>
              <span>Day {p.los}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn--sm" onClick={fireIC}><Ic.Phone />Webex Connect</button>
            <button className="btn btn--accent btn--sm" onClick={fireAI}><Ic.Brain />AI Summary</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (<button key={t} className={`tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>{t}</button>))}
      </div>

      {/* Summary */}
      {tab === 'Summary' && (
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              <VitalCard icon={Ic.Heart} label="Heart rate" value={hr || '—'} unit="bpm" status={hr ? inRange(hr, '60-100') : 'ok'} range="60–100" />
              <VitalCard icon={Ic.Activity} label="Blood pressure" value={bp || '—'} unit="mmHg" status={sysOk} range="<140/90" />
              <VitalCard icon={Ic.Lung} label="SpO₂" value={spo2 || '—'} unit="%" status={spo2 ? inRange(spo2, '95-100') : 'ok'} range="95–100" />
              <VitalCard icon={Ic.Activity} label="Resp rate" value={rr || '—'} unit="/min" status={rr ? inRange(rr, '12-20') : 'ok'} range="12–20" />
              <VitalCard icon={Ic.Activity} label="Weight" value={wt || '—'} unit="kg" status="ok" range="—" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Section title="Active conditions">
                {p.conditions.map(c => (<div key={c} className="row" style={{ padding: '8px 0', borderTop: '1px solid var(--line-soft)', gap: 10 }}><span className="tag tag--warn">Active</span><span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{CONDITION_LABEL[c] || c}</span></div>))}
                {p.allergies.length > 0 && (<div style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--line)' }}><div className="micro" style={{ marginBottom: 6 }}>Allergies</div><div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{p.allergies.map(a => <span key={a} className="tag tag--crit"><Ic.Alert size={10} />{a}</span>)}</div></div>)}
              </Section>
              <Section title={`Medications · ${p.medications.length}`}>
                {p.medications.map(m => { const { name, status } = medLabel(m); const tone = status === 'active' ? 'ok' : status === 'completed' ? 'info' : 'neutral'; return (<div key={m} className="row" style={{ padding: '8px 0', borderTop: '1px solid var(--line-soft)', gap: 10 }}><Ic.Pill size={14} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div></div><span className={`tag tag--${tone}`}>{status}</span></div>); })}
              </Section>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="Care team">
              {[{ n: p.attending, r: 'Attending', on: true }, { n: 'RN Sofia Marquez', r: 'Primary nurse', on: true }, { n: 'Pharm. Liu Wei', r: 'Pharmacy', on: false }].map(t => (
                <div key={t.n} className="row" style={{ padding: '6px 0', gap: 10 }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, position: 'relative' }}>
                    {t.n.split(' ').slice(-2).map(s => s[0]).join('')}
                    {t.on && <span style={{ position: 'absolute', right: -1, bottom: -1, width: 9, height: 9, borderRadius: '50%', background: 'var(--ok)', border: '2px solid var(--bg-elev)' }} />}
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.n}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.r}</div></div>
                </div>
              ))}
            </Section>
            <Section title="Lab integrations">
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>Connected to <b style={{ color: 'var(--text-2)' }}>NIIN Health Alliance</b> sandbox · Cisco distributed infrastructure · HTL ML pipelines.</div>
            </Section>
          </div>
        </div>
      )}

      {/* Medications */}
      {tab === 'Medications' && (
        <div style={{ padding: 28 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="micro" style={{ marginBottom: 12 }}>All medications · {p.medications.length}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>{['Medication', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>)}</tr></thead>
              <tbody>{p.medications.map((m, i) => { const { name, status } = medLabel(m); const tone = status === 'active' ? 'ok' : status === 'completed' ? 'info' : 'neutral'; return (<tr key={i} style={{ borderBottom: '1px solid var(--line-soft)' }}><td style={{ padding: '10px 10px', fontWeight: 500 }}><Ic.Pill size={12} /> {name}</td><td style={{ padding: '10px 10px' }}><span className={`tag tag--${tone}`}>{status}</span></td></tr>); })}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conditions */}
      {tab === 'Conditions' && (
        <div style={{ padding: 28 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="micro" style={{ marginBottom: 12 }}>Active conditions</div>
            {p.conditions.map(c => (<div key={c} className="row" style={{ padding: '10px 0', borderTop: '1px solid var(--line-soft)', gap: 10 }}><span className="tag tag--warn">Active</span><span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{CONDITION_LABEL[c] || c}</span></div>))}
          </div>
        </div>
      )}

      {/* Observations */}
      {tab === 'Observations' && (
        <div style={{ padding: 28 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="micro" style={{ marginBottom: 12 }}>All observations · {p.observations.length}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>{['Date', 'Type', 'Value', 'Unit', 'Reference', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>)}</tr></thead>
              <tbody>{p.observations.slice().sort((a, b) => b.date.localeCompare(a.date)).map((o, i) => { const t = inRange(o.value.toString().split('/')[0], o.reference_range); return (<tr key={i} style={{ borderBottom: '1px solid var(--line-soft)' }}><td className="mono" style={{ padding: '8px 10px', color: 'var(--text-2)' }}>{o.date}</td><td style={{ padding: '8px 10px' }}>{o.type}</td><td className="mono" style={{ padding: '8px 10px', fontWeight: 600, color: t === 'high' ? 'var(--crit)' : t === 'low' ? 'var(--warn)' : 'var(--text)' }}>{o.value}</td><td style={{ padding: '8px 10px', color: 'var(--text-3)' }}>{o.unit}</td><td className="mono" style={{ padding: '8px 10px', color: 'var(--text-4)' }}>{o.reference_range || '—'}</td><td style={{ padding: '8px 10px' }}>{t === 'high' ? <span className="tag tag--crit">↑ High</span> : t === 'low' ? <span className="tag tag--warn">↓ Low</span> : <span className="tag tag--ok">Normal</span>}</td></tr>); })}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Webex tab */}
      {tab === 'Webex' && (
        <div style={{ padding: 28 }}>
          <div className="card" style={{ padding: 24, maxWidth: 540 }}>
            <div className="micro" style={{ marginBottom: 8 }}>Cisco Webex Instant Connect</div>
            <h2 style={{ fontFamily: 'var(--sans)', fontSize: 22, fontWeight: 300, margin: '0 0 6px', color: 'var(--htl-indigo)' }}>Reach {p.name.split(' ')[0]} now</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 18px', lineHeight: 1.5 }}>Both parties will receive a secure Webex connection request. No client install required.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-sunken)', borderRadius: 6 }}><Ic.Phone size={14} /><span style={{ flex: 1, fontSize: 13 }}>Patient mobile</span><span className="mono" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>+{PAT_PHONE}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-sunken)', borderRadius: 6 }}><Ic.Stethoscope size={14} /><span style={{ flex: 1, fontSize: 13 }}>Clinician mobile</span><span className="mono" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>+{HOST_PHONE}</span></div>
            </div>
            <button className="btn btn--accent" onClick={fireIC}><Ic.Phone />Initiate connection</button>
          </div>
        </div>
      )}

      {/* Instant Connect Modal */}
      {showIC && (
        <div className="modal-overlay" onClick={() => setShowIC(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="row" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--sans)', fontSize: 22, fontWeight: 300, margin: 0, color: 'var(--htl-indigo)', flex: 1 }}>📞 Webex Instant Connect</h3>
              <button className="icon-btn" onClick={() => setShowIC(false)}><Ic.X /></button>
            </div>
            <div style={{ padding: 16, background: 'var(--niin-teal-soft)', borderRadius: 8, fontSize: 13, marginBottom: 16, color: 'var(--ok)' }}>{icStatus}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
              <div style={{ marginBottom: 6 }}><b>Patient:</b> {p.name}</div>
              <div style={{ marginBottom: 6 }}><b>Patient Phone:</b> +{PAT_PHONE}</div>
              <div><b>Host Phone:</b> +{HOST_PHONE}</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {showAI && (
        <div className="modal-overlay" onClick={() => setShowAI(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="row" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--sans)', fontSize: 22, fontWeight: 300, margin: 0, color: 'var(--htl-indigo)', flex: 1 }}>🤖 AI Patient Summary</h3>
              <button className="icon-btn" onClick={() => setShowAI(false)}><Ic.X /></button>
            </div>
            {aiLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 12 }}>Generating summary…</div>
                <div className="spinner" />
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 12 }}>This may take a moment</div>
              </div>
            ) : (
              <div>
                <div style={{ padding: 16, background: 'var(--bg-sunken)', borderRadius: 8, borderLeft: '3px solid var(--niin-teal)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-2)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>{aiText}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" style={{ flex: 1 }} onClick={() => setShowAI(false)}>Close</button>
                  <button className="btn btn--accent" style={{ flex: 1 }} onClick={sendSMS}><Ic.Send />Send to Patient</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;
