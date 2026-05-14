import React from 'react';
import * as Ic from './Icons';

const PU = process.env.PUBLIC_URL;

export const Header = ({ breadcrumbs, notifs }) => (
  <header className="hd">
    <div className="hd__brand">
      <div className="hd__brand-mark">
        <img src={`${PU}/images/brand/htl-logo.jpg`} alt="HTL" />
      </div>
      <div>
        <div className="hd__brand-name">
          Health Transformation Lab
          <em>Clinical Workspace</em>
        </div>
      </div>
    </div>
    <div className="hd__main">
      <div className="hd__breadcrumbs">
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: 'var(--text-4)' }}>/</span>}
            <span style={{
              fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
              color: i === breadcrumbs.length - 1 ? 'var(--text)' : 'var(--text-3)'
            }}>{b}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div className="hd__search">
        <Ic.Search size={14} />
        <span>Search patients, IHI, orders…</span>
        <kbd>⌘K</kbd>
      </div>
      <div className="hd__actions">
        <button className="icon-btn"><Ic.Inbox /></button>
        <button className="icon-btn">
          <Ic.Bell />
          {notifs > 0 && <span className="badge" />}
        </button>
        <button className="icon-btn"><Ic.Settings /></button>
        <div className="hd__user">
          <div className="avatar">AM</div>
          <div className="hd__user-meta">
            <b>Dr. Anya Mehta</b>
            <span>Attending · Ward 7B</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const NavItem = ({ icon: C, label, count, active, onClick }) => (
  <button className={`nv__item ${active ? 'is-active' : ''}`} onClick={onClick}>
    <C />
    <span>{label}</span>
    {count != null && <span className="count">{count}</span>}
  </button>
);

export const Sidebar = ({ active, onChange, counts }) => (
  <nav className="nv">
    <div className="nv__sect">Today</div>
    <NavItem icon={Ic.Home} label="Overview" active={active === 'overview'} onClick={() => onChange('overview')} />
    <NavItem icon={Ic.Users} label="My Patients" count={counts.patients} active={active === 'worklist'} onClick={() => onChange('worklist')} />
    <NavItem icon={Ic.Inbox} label="Inbox" count={7} active={active === 'inbox'} onClick={() => onChange('inbox')} />
    <NavItem icon={Ic.Calendar} label="Schedule" active={active === 'schedule'} onClick={() => onChange('schedule')} />
    <div className="nv__sect">Clinical</div>
    <NavItem icon={Ic.Clipboard} label="Orders" count={3} active={active === 'orders'} onClick={() => onChange('orders')} />
    <NavItem icon={Ic.Pill} label="Medications" active={active === 'meds'} onClick={() => onChange('meds')} />
    <NavItem icon={Ic.Flask} label="Results" count={12} active={active === 'results'} onClick={() => onChange('results')} />
    <NavItem icon={Ic.Edit} label="Notes" active={active === 'notes'} onClick={() => onChange('notes')} />
    <div className="nv__sect">Lab Tools</div>
    <NavItem icon={Ic.Activity} label="Insights" active={active === 'insights'} onClick={() => onChange('insights')} />
    <NavItem icon={Ic.Phone} label="Webex Connect" active={active === 'webex'} onClick={() => onChange('webex')} />
    <div style={{ flex: 1 }} />
    <div className="nv__divider" />
    <NavItem icon={Ic.Logout} label="Sign out" />
  </nav>
);

export const Footer = () => (
  <footer className="ft">
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="hd__brand-mark" style={{ width: 22, height: 22 }}>
        <img src={`${PU}/images/brand/htl-logo.jpg`} alt="HTL" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <span style={{ color: 'var(--htl-indigo)', fontWeight: 500 }}>Health Transformation Lab</span>
      <span className="ft__sep" />
      <span>Clinical Workspace · v3.2</span>
    </div>
    <div className="ft__partners">
      <span className="ft__partner-label">In partnership with</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600 }}>
        <span style={{ display: 'inline-block', width: 16, height: 16, background: '#e2231a', color: 'white', textAlign: 'center', lineHeight: '16px', fontSize: 10, fontWeight: 700, borderRadius: 2 }}>R</span>
        RMIT University
      </span>
      <span className="ft__sep" />
      <img src={`${PU}/images/brand/cisco-logo.png`} alt="Cisco" style={{ height: 22, width: 'auto', opacity: 0.95 }} />
    </div>
  </footer>
);
