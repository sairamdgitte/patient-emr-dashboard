export const CONDITION_LABEL = {
  'hypertension': 'Hypertension', 'type-2-diabetes': 'Type 2 diabetes',
  'type-1-diabetes': 'Type 1 diabetes', 'coronary-artery-disease': 'Coronary artery disease',
  'hyperlipidaemia': 'Hyperlipidaemia', 'osteoporosis': 'Osteoporosis',
  'hypothyroidism': 'Hypothyroidism', 'asthma': 'Asthma',
  'allergic-rhinitis': 'Allergic rhinitis', 'anxiety': 'Anxiety',
  'iron-deficiency-anaemia': 'Iron-deficiency anaemia',
  'chronic-kidney-disease': 'Chronic kidney disease', 'gout': 'Gout',
  'coeliac-disease': 'Coeliac disease', 'rheumatoid-arthritis': 'Rheumatoid arthritis',
  'depression': 'Depression',
};

export const medLabel = (m) => {
  const status = m.startsWith('active-') ? 'active' : m.startsWith('completed-') ? 'completed' : m.startsWith('previous-use-') ? 'previous' : 'unknown';
  const name = m.replace(/^(active|completed|previous-use)-/, '').split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  return { name, status };
};

export const calcAge = (dob) => {
  const b = new Date(dob), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
};

export const recent = (p, type) => {
  const o = p.observations.filter(x => x.type === type).sort((a, b) => b.date.localeCompare(a.date))[0];
  return o ? o.value : null;
};

export const inRange = (v, range) => {
  if (v == null || !range) return 'ok';
  const n = parseFloat(v);
  if (range.startsWith('<')) return n > parseFloat(range.slice(1)) ? 'high' : 'ok';
  if (range.startsWith('>')) return n < parseFloat(range.slice(1)) ? 'low' : 'ok';
  if (range.includes('-')) {
    const [lo, hi] = range.split('-').map(parseFloat);
    if (n < lo) return 'low';
    if (n > hi) return 'high';
  }
  return 'ok';
};

export const computeStatus = (p) => {
  const dates = [...new Set(p.observations.map(o => o.date))].sort();
  const latest = p.observations.filter(o => o.date === dates[dates.length - 1]);
  let outOf = 0, severe = 0;
  for (const o of latest) {
    const r = o.reference_range;
    if (!r) continue;
    const v = parseFloat(o.value);
    let lo = -Infinity, hi = Infinity;
    if (r.startsWith('<')) hi = parseFloat(r.slice(1));
    else if (r.startsWith('>')) lo = parseFloat(r.slice(1));
    else if (r.includes('-')) { const [a, b] = r.split('-').map(parseFloat); lo = a; hi = b; }
    if (!isFinite(v)) continue;
    if (v < lo || v > hi) {
      outOf++;
      const dev = v < lo ? (lo - v) / lo : (v - hi) / hi;
      if (dev > 0.4) severe++;
    }
  }
  if (severe >= 1 || outOf >= 3) return 'critical';
  if (outOf >= 1) return 'watch';
  return 'stable';
};

export const PHOTO_MAP = {
  2: 'amira-singh', 3: 'Carlos-Mendoza', 4: 'Elena-Petrova',
  5: 'Kwame-Boateng', 6: 'Linh-Tran', 7: 'Noah-Johnson',
  8: 'Ravi-Patel', 9: 'Yasmin-Farah',
};

const WARDS = [
  { ward: 'Medical 7B', room: '7B-12', bed: 'A', att: 'Dr. R. Patel' },
  { ward: 'Cardiac 5C', room: '5C-04', bed: 'B', att: 'Dr. S. Lin' },
  { ward: 'Endocrine 3A', room: '3A-08', bed: '-', att: 'Dr. K. Walsh' },
  { ward: 'Respiratory 5C', room: '5C-09', bed: 'A', att: 'Dr. T. Nguyen' },
  { ward: 'Outpatient 2B', room: '2B-03', bed: '-', att: 'Dr. R. Patel' },
  { ward: 'Renal 4D', room: '4D-02', bed: 'B', att: 'Dr. T. Nguyen' },
  { ward: 'Endocrine 3A', room: '3A-11', bed: '-', att: 'Dr. K. Walsh' },
  { ward: 'Rheumatology 6A', room: '6A-05', bed: '-', att: 'Dr. S. Lin' },
];

const REASONS = {
  'Amira Singh': 'BP review · titration of amlodipine',
  'Carlos Mendoza': 'Lipid review · post-CABG day 2',
  'Elena Petrova': 'TSH titration · DEXA follow-up',
  'Kwame Boateng': 'Asthma flare · spirometry today',
  'Linh Tran': 'Anaemia review · ferritin pending',
  'Noah Johnson': 'CKD stage 3b · BP optimisation',
  'Ravi Patel': 'T1DM control · CGM review',
  'Yasmin Farah': 'RA flare · methotrexate dose review',
};

const UPDATED = ['3m', '12m', '22m', '31m', '45m', '1h', '1h', '2h'];

export const enrichPatients = (raw) => {
  return raw.map((p, i) => {
    const w = WARDS[i % WARDS.length];
    return {
      ...p,
      age: calcAge(p['D.O.B']),
      sex: p.Gender === 'Female' ? 'F' : 'M',
      photo: PHOTO_MAP[p.id],
      mrn: `${(8000 + p.id * 137).toString().slice(0, 4)}-${(2000 + p.id * 911).toString().slice(0, 4)}`,
      status: computeStatus(p),
      ward: w.ward, room: w.room, bed: w.bed, attending: w.att,
      los: (i % 5) + 1,
      reason: REASONS[p.name] || p.conditions[0],
      updated: UPDATED[i],
    };
  });
};

// Webhook URLs
export const WH_IC = "https://hooks.au.webexconnect.io/events/G3M7VZ5STN";
export const WH_AI = "https://hooks.au.webexconnect.io/events/LHLVF8UJTQ";
export const HF_SPACE = "https://sairam17-patient-summary-api.hf.space/gradio_api/call/predict";
export const PAT_PHONE = "61490192036";
export const HOST_PHONE = "61414005070";
