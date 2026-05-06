import React, { useState, useMemo } from 'react';
import * as Ic from './Icons';
import { CONDITION_LABEL } from './data';

const PU = process.env.PUBLIC_URL;

const Avatar = ({ p, size = 36 }) => {
  const [err, setErr] = useState(false);
  const ini = p.name.split(' ').map(s => s[0]).join('').slice(0, 2);
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {!err && p.photo ? <img src={`${PU}/images/${p.photo}.png`} alt="" onError={() => setErr(true)} /> : ini}
    </div>
  );
};

const StatusDot = ({ status }) => {
  const m = { critical: { c: 'var(--crit)', l: 'Critical' }, watch: { c: 'var(--warn)', l: 'Watch' }, stable: { c: 'var(--ok)', l: 'Stable' } };
  const s = m[status] || m.stable;
  return (
    <span className="row" style={{ gap: 6, color: s.c, fontWeight: 600, fontSize: 12 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', boxShadow: `0 0 0 3px color-mix(in oklab, currentColor 18%, transparent)` }} />
      <span style={{ color: 'var(--text-2)' }}>{s.l}</span>
    </span>
  );
};

const Sparkline = ({ values, color = 'var(--text)' }) => {
  const w = 64, h = 18;
  const mn = Math.min(...values), mx = Math.max(...values), rg = mx - mn || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1) * w).toFixed(1)},${(h - ((v - mn) / rg) * h).toFixed(1)}`).join(' ');
  return <svg width={w} height={h} style={{ display: 'block' }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

const Worklist = ({ patients, selectedId, onSelect, onOpen }) => {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('priority');
  const counts = { all: patients.length, critical: patients.filter(p => p.status === 'critical').length, watch: patients.filter(p => p.status === 'watch').length, stable: patients.filter(p => p.status === 'stable').length };

  const filtered = useMemo(() => {
    let p = patients;
    if (filter !== 'all') p = p.filter(x => x.status === filter);
    if (query) { const q = query.toLowerCase(); p = p.filter(x => x.name.toLowerCase().includes(q) || x.mrn.includes(q)); }
    if (sort === 'priority') { const o = { critical: 0, watch: 1, stable: 2 }; p = [...p].sort((a, b) => o[a.status] - o[b.status]); }
    else if (sort === 'name') p = [...p].sort((a, b) => a.name.localeCompare(b.name));
    return p;
  }, [patients, filter, sort, query]);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-hd">
        <div>
          <h1 className="page-hd__title"><span style={{ fontWeight: 200 }}>My </span>patients <em>· today</em></h1>
          <p className="page-hd__sub">Tuesday, 6 May 2026 · {patients.length} active · {counts.critical} critical, {counts.watch} watch</p>
        </div>
        <div className="page-hd__actions">
          <button className="btn"><Ic.Filter />Filter</button>
          <button className="btn"><Ic.Download />Export</button>
          <button className="btn btn--primary"><Ic.Plus />Admit patient</button>
        </div>
      </div>

      <div style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-elev)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', background: 'var(--bg-sunken)', padding: 3, borderRadius: 7, border: '1px solid var(--line)' }}>
          {['all', 'critical', 'watch', 'stable'].map(k => (
            <button key={k} onClick={() => setFilter(k)} style={{ appearance: 'none', border: 0, padding: '5px 12px', fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit', borderRadius: 5, cursor: 'default', background: filter === k ? 'var(--bg-elev)' : 'transparent', color: filter === k ? 'var(--text)' : 'var(--text-3)', boxShadow: filter === k ? 'var(--shadow-sm)' : 'none', textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {k}<span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-4)' }}>{counts[k]}</span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1, maxWidth: 320, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 32, border: '1px solid var(--line)', borderRadius: 6, background: 'var(--bg)' }}>
          <Ic.Search size={13} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, MRN…" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit', color: 'var(--text)' }} />
        </div>
      </div>

      <div style={{ padding: '20px 28px 28px' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-sunken)', borderBottom: '1px solid var(--line)' }}>
                {['Patient', 'Status', 'Ward · Room', 'Reason', 'LOS', 'HR', 'Conditions', 'Attending', 'Updated', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} onClick={() => onSelect(p.id)} onDoubleClick={() => onOpen(p.id)}
                  style={{ cursor: 'default', borderBottom: i < filtered.length - 1 ? '1px solid var(--line-soft)' : '0', background: selectedId === p.id ? 'var(--niin-teal-soft)' : 'transparent', position: 'relative' }}>
                  <td style={{ padding: '10px 14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: p.status === 'critical' ? 'var(--crit)' : p.status === 'watch' ? 'var(--warn)' : 'transparent' }} />
                    <div className="row" style={{ gap: 10 }}>
                      <Avatar p={p} size={36} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>MRN {p.mrn} · {p.age}{p.sex}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}><StatusDot status={p.status} /></td>
                  <td style={{ padding: '10px 14px' }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.ward}</div><div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.room} · {p.bed}</div></td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-2)', maxWidth: 240, fontSize: 12.5 }}>{p.reason}</td>
                  <td style={{ padding: '10px 14px' }} className="mono">{p.los}d</td>
                  <td style={{ padding: '10px 14px' }}>
                    <Sparkline values={Array.from({ length: 12 }, (_, i) => 70 + Math.sin(i * 0.6 + p.age * 0.1) * 12 + (p.status === 'critical' ? 25 : p.status === 'watch' ? 8 : 0))} color={p.status === 'critical' ? 'var(--crit)' : p.status === 'watch' ? 'var(--warn)' : 'var(--text-2)'} />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                      {p.conditions.slice(0, 2).map(c => (<span key={c} className="tag tag--neutral">{CONDITION_LABEL[c] || c}</span>))}
                      {p.conditions.length > 2 && <span className="tag tag--neutral">+{p.conditions.length - 2}</span>}
                      {p.allergies.length > 0 && <span className="tag tag--crit"><Ic.Alert size={10} />{p.allergies.length}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-2)', fontSize: 12.5 }}>{p.attending}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-3)' }} className="mono">{p.updated} ago</td>
                  <td style={{ padding: '10px 8px' }}>
                    <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}>
                      <Ic.ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Worklist;
export { Avatar, StatusDot, Sparkline };
