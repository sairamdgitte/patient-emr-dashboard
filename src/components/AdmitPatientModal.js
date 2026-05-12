import React, { useState } from 'react';
import * as Ic from './Icons';

const TODAY = new Date().toISOString().split('T')[0];

// Pre-filled demo patient for quick demo submission
const DEMO_DEFAULTS = {
  name: 'Sophie Chen',
  gender: 'Female',
  dob: '1991-06-18',
  ward: 'Medical 7B',
  room: '7B-15',
  bed: 'A',
  reason: 'Acute chest pain · troponin pending',
  attending: 'Dr. R. Patel',
  conditions: 'acute-coronary-syndrome, hypertension',
  allergies: 'morphine, shellfish',
  medications: 'active-aspirin, active-ticagrelor, active-enoxaparin',
  obs_bp: '158/94',
  obs_hr: '102',
  obs_spo2: '95',
  obs_rr: '22',
  obs_temp: '37.4',
  obs_weight: '64',
};

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, half }) => (
  <div style={{ flex: half ? '1 1 48%' : '1 1 100%', minWidth: half ? 180 : 'auto' }}>
    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 4 }}>
      {label} {required && <span style={{ color: 'var(--crit)' }}>*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{
        width: '100%', padding: '8px 10px', fontSize: 13, fontFamily: 'var(--sans)',
        border: '1px solid var(--line)', borderRadius: 6, background: 'var(--bg)',
        color: 'var(--text)', outline: 'none', transition: 'border .15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--niin-teal)'}
      onBlur={e => e.target.style.borderColor = 'var(--line)'}
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, required, half }) => (
  <div style={{ flex: half ? '1 1 48%' : '1 1 100%', minWidth: half ? 180 : 'auto' }}>
    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 4 }}>
      {label} {required && <span style={{ color: 'var(--crit)' }}>*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      style={{
        width: '100%', padding: '8px 10px', fontSize: 13, fontFamily: 'var(--sans)',
        border: '1px solid var(--line)', borderRadius: 6, background: 'var(--bg)',
        color: 'var(--text)', outline: 'none', appearance: 'none',
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M1 1l4 4 4-4' fill='none' stroke='%236c6a8a' stroke-width='1.5'/></svg>\")",
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const AdmitPatientModal = ({ onClose, onAdmit }) => {
  const [form, setForm] = useState(DEMO_DEFAULTS);
  const [submitting, setSubmitting] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name || !form.dob || !form.gender) {
      alert('Please fill in name, date of birth, and gender.');
      return;
    }

    setSubmitting(true);

    // Build the patient object matching enhanced_patients.json format
    const newPatient = {
      id: Date.now(), // unique ID
      name: form.name,
      Gender: form.gender,
      'D.O.B': form.dob,
      allergies: form.allergies ? form.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
      conditions: form.conditions ? form.conditions.split(',').map(c => c.trim()).filter(Boolean) : [],
      medications: form.medications ? form.medications.split(',').map(m => m.trim()).filter(Boolean) : [],
      observations: [
        form.obs_bp && { type: 'Blood pressure', value: form.obs_bp, unit: 'mmHg', reference_range: '<120/80', date: TODAY },
        form.obs_hr && { type: 'Heart rate', value: form.obs_hr, unit: 'bpm', reference_range: '60-100', date: TODAY },
        form.obs_spo2 && { type: 'SpO₂', value: form.obs_spo2, unit: '%', reference_range: '95-100', date: TODAY },
        form.obs_rr && { type: 'Respiratory rate', value: form.obs_rr, unit: 'breaths/min', reference_range: '12-20', date: TODAY },
        form.obs_temp && { type: 'Temperature', value: form.obs_temp, unit: '°C', reference_range: '36.1-37.2', date: TODAY },
        form.obs_weight && { type: 'Body weight', value: form.obs_weight, unit: 'kg', reference_range: '', date: TODAY },
      ].filter(Boolean),
      // Extra fields for enrichPatients
      _ward: form.ward,
      _room: form.room,
      _bed: form.bed,
      _reason: form.reason,
      _attending: form.attending,
    };

    // Small delay to show the submitting state
    setTimeout(() => {
      onAdmit(newPatient);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '90vh' }}>
        {/* Header */}
        <div className="row" style={{ marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 300, margin: 0, color: 'var(--htl-indigo)' }}>
              Admit new patient
            </h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>
              Fields are pre-filled for demo · edit any field before submitting
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Ic.X /></button>
        </div>

        {/* Demographics section */}
        <div style={{ marginBottom: 20 }}>
          <div className="micro" style={{ color: 'var(--text-3)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--line-soft)' }}>Demographics</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field label="Full name" name="name" value={form.name} onChange={set} required placeholder="e.g. Sophie Chen" half />
            <Select label="Gender" name="gender" value={form.gender} onChange={set} options={['Female', 'Male', 'Other']} required half />
            <Field label="Date of birth" name="dob" value={form.dob} onChange={set} type="date" required half />
            <Field label="Allergies" name="allergies" value={form.allergies} onChange={set} placeholder="comma-separated" half />
          </div>
        </div>

        {/* Ward / Location */}
        <div style={{ marginBottom: 20 }}>
          <div className="micro" style={{ color: 'var(--text-3)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--line-soft)' }}>Admission details</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Select label="Ward" name="ward" value={form.ward} onChange={set} options={['Medical 7B', 'Cardiac 5C', 'Endocrine 3A', 'Respiratory 5C', 'Outpatient 2B', 'Renal 4D', 'Rheumatology 6A', 'Emergency']} required half />
            <Field label="Room" name="room" value={form.room} onChange={set} placeholder="e.g. 7B-15" half />
            <Select label="Bed" name="bed" value={form.bed} onChange={set} options={['A', 'B', '-']} half />
            <Select label="Attending" name="attending" value={form.attending} onChange={set} options={['Dr. R. Patel', 'Dr. S. Lin', 'Dr. K. Walsh', 'Dr. T. Nguyen']} required half />
            <Field label="Reason for admission" name="reason" value={form.reason} onChange={set} placeholder="Primary reason" />
          </div>
        </div>

        {/* Clinical */}
        <div style={{ marginBottom: 20 }}>
          <div className="micro" style={{ color: 'var(--text-3)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--line-soft)' }}>Clinical</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field label="Conditions" name="conditions" value={form.conditions} onChange={set} placeholder="comma-separated, e.g. hypertension, asthma" />
            <Field label="Medications" name="medications" value={form.medications} onChange={set} placeholder="prefix with active-, completed-, previous-use-" />
          </div>
        </div>

        {/* Vitals on admission */}
        <div style={{ marginBottom: 24 }}>
          <div className="micro" style={{ color: 'var(--text-3)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--line-soft)' }}>Vitals on admission</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field label="Blood pressure (mmHg)" name="obs_bp" value={form.obs_bp} onChange={set} placeholder="120/80" half />
            <Field label="Heart rate (bpm)" name="obs_hr" value={form.obs_hr} onChange={set} placeholder="72" half />
            <Field label="SpO₂ (%)" name="obs_spo2" value={form.obs_spo2} onChange={set} placeholder="97" half />
            <Field label="Resp rate (/min)" name="obs_rr" value={form.obs_rr} onChange={set} placeholder="16" half />
            <Field label="Temperature (°C)" name="obs_temp" value={form.obs_temp} onChange={set} placeholder="36.8" half />
            <Field label="Weight (kg)" name="obs_weight" value={form.obs_weight} onChange={set} placeholder="70" half />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary"
            style={{ flex: 2 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> Admitting…</>
            ) : (
              <><Ic.Plus /> Admit patient</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmitPatientModal;
