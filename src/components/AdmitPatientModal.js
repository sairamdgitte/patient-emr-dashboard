import React, { useState } from 'react';
import * as Ic from './Icons';

const TODAY = new Date().toISOString().split('T')[0];

// Pool of 8 realistic demo patients — rotates each time modal opens
const DEMO_POOL = [
  {
    name: 'Sophie Chen', gender: 'Female', dob: '1991-06-18',
    ward: 'Cardiac 5C', room: '5C-06', bed: 'A', attending: 'Dr. S. Lin',
    reason: 'Acute chest pain · troponin pending',
    conditions: 'acute-coronary-syndrome, hypertension',
    allergies: 'morphine, shellfish',
    medications: 'active-aspirin, active-ticagrelor, active-enoxaparin',
    obs_bp: '158/94', obs_hr: '102', obs_spo2: '95', obs_rr: '22', obs_temp: '37.4', obs_weight: '64',
  },
  {
    name: 'James Okonkwo', gender: 'Male', dob: '1968-03-22',
    ward: 'Respiratory 5C', room: '5C-11', bed: 'B', attending: 'Dr. T. Nguyen',
    reason: 'COPD exacerbation · IV antibiotics',
    conditions: 'copd, pneumonia',
    allergies: 'penicillin',
    medications: 'active-salbutamol, active-prednisolone, active-amoxicillin-clavulanate',
    obs_bp: '134/82', obs_hr: '94', obs_spo2: '89', obs_rr: '26', obs_temp: '38.2', obs_weight: '81',
  },
  {
    name: 'Maria Gonzalez', gender: 'Female', dob: '1985-11-09',
    ward: 'Medical 7B', room: '7B-16', bed: 'A', attending: 'Dr. R. Patel',
    reason: 'New-onset T2DM · DKA workup',
    conditions: 'type-2-diabetes, hypertension',
    allergies: 'sulfonamides, iodine',
    medications: 'active-insulin-glargine, active-metformin, active-ramipril',
    obs_bp: '148/92', obs_hr: '88', obs_spo2: '97', obs_rr: '18', obs_temp: '36.9', obs_weight: '92',
  },
  {
    name: 'David Park', gender: 'Male', dob: '1955-08-14',
    ward: 'Renal 4D', room: '4D-05', bed: 'A', attending: 'Dr. T. Nguyen',
    reason: 'AKI on CKD · fluid management',
    conditions: 'chronic-kidney-disease, heart-failure',
    allergies: 'ACE inhibitors',
    medications: 'active-furosemide, active-bisoprolol, completed-ramipril',
    obs_bp: '162/98', obs_hr: '68', obs_spo2: '94', obs_rr: '20', obs_temp: '36.5', obs_weight: '88',
  },
  {
    name: 'Aisha Rahman', gender: 'Female', dob: '1978-01-30',
    ward: 'Rheumatology 6A', room: '6A-07', bed: '-', attending: 'Dr. S. Lin',
    reason: 'Lupus flare · renal involvement',
    conditions: 'rheumatoid-arthritis, hypertension',
    allergies: 'NSAIDs',
    medications: 'active-hydroxychloroquine, active-mycophenolate, active-prednisolone',
    obs_bp: '142/88', obs_hr: '82', obs_spo2: '96', obs_rr: '17', obs_temp: '37.6', obs_weight: '62',
  },
  {
    name: 'Thomas Mueller', gender: 'Male', dob: '1972-04-05',
    ward: 'Cardiac 5C', room: '5C-08', bed: 'B', attending: 'Dr. S. Lin',
    reason: 'New AF · rate control · anticoagulation',
    conditions: 'atrial-fibrillation, hyperlipidaemia',
    allergies: 'contrast dye',
    medications: 'active-bisoprolol, active-apixaban, active-atorvastatin',
    obs_bp: '138/86', obs_hr: '112', obs_spo2: '97', obs_rr: '16', obs_temp: '36.7', obs_weight: '95',
  },
  {
    name: 'Priya Sharma', gender: 'Female', dob: '1994-09-25',
    ward: 'Medical 7B', room: '7B-18', bed: 'A', attending: 'Dr. K. Walsh',
    reason: 'Severe anaemia · transfusion pending',
    conditions: 'iron-deficiency-anaemia, anxiety',
    allergies: '',
    medications: 'active-ferrous-sulfate, active-sertraline, active-pantoprazole',
    obs_bp: '104/62', obs_hr: '108', obs_spo2: '98', obs_rr: '19', obs_temp: '36.8', obs_weight: '52',
  },
  {
    name: 'Robert Williams', gender: 'Male', dob: '1960-12-11',
    ward: 'Endocrine 3A', room: '3A-09', bed: '-', attending: 'Dr. K. Walsh',
    reason: 'Thyroid storm · ICU step-down',
    conditions: 'hypothyroidism, osteoporosis',
    allergies: 'latex, codeine',
    medications: 'active-levothyroxine, active-propranolol, active-alendronate',
    obs_bp: '152/90', obs_hr: '118', obs_spo2: '96', obs_rr: '24', obs_temp: '38.6', obs_weight: '76',
  },
];

// Track which demo index to use next (persists across modal opens within session)
let demoIndex = 0;

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, half }) => (
  <div style={{ flex: half ? '1 1 48%' : '1 1 100%', minWidth: half ? 180 : 'auto' }}>
    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 4 }}>
      {label} {required && <span style={{ color: 'var(--crit)' }}>*</span>}
    </label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
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
      name={name} value={value} onChange={onChange} required={required}
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
  // Pick next demo patient from the pool
  const [form, setForm] = useState(() => {
    const demo = DEMO_POOL[demoIndex % DEMO_POOL.length];
    demoIndex++;
    return { ...demo };
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name || !form.dob || !form.gender) {
      alert('Please fill in name, date of birth, and gender.');
      return;
    }

    setSubmitting(true);

    const newPatient = {
      id: Date.now(),
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
      _ward: form.ward,
      _room: form.room,
      _bed: form.bed,
      _reason: form.reason,
      _attending: form.attending,
      _isNew: true, // Flag for delete button
    };

    setTimeout(() => {
      onAdmit(newPatient);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '90vh' }}>
        <div className="row" style={{ marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 300, margin: 0, color: 'var(--htl-indigo)' }}>
              Admit new patient
            </h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>
              Pre-filled for demo · a different patient each time
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Ic.X /></button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="micro" style={{ color: 'var(--text-3)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--line-soft)' }}>Demographics</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field label="Full name" name="name" value={form.name} onChange={set} required half />
            <Select label="Gender" name="gender" value={form.gender} onChange={set} options={['Female', 'Male', 'Other']} required half />
            <Field label="Date of birth" name="dob" value={form.dob} onChange={set} type="date" required half />
            <Field label="Allergies" name="allergies" value={form.allergies} onChange={set} placeholder="comma-separated" half />
          </div>
        </div>

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

        <div style={{ marginBottom: 20 }}>
          <div className="micro" style={{ color: 'var(--text-3)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--line-soft)' }}>Clinical</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field label="Conditions" name="conditions" value={form.conditions} onChange={set} placeholder="comma-separated" />
            <Field label="Medications" name="medications" value={form.medications} onChange={set} placeholder="prefix: active-, completed-, previous-use-" />
          </div>
        </div>

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

        <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? (<><div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> Admitting…</>) : (<><Ic.Plus /> Admit patient</>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmitPatientModal;
