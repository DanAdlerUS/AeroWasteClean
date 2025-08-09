import { useEffect, useState } from 'react';
import { getInitiationThresholds, updateInitiationThresholds } from '../../utils/api';

export default function InitiationManagement() {
  const [rows, setRows] = useState([]);
  const [rtb, setRtb] = useState({ battery_pct: 20, hold_pct: 80 }); // PoC defaults
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getInitiationThresholds();
        setRows(data.classes || [
          { class: 'plastic', conf: 0.85 },
          { class: 'glass', conf: 0.75 },
          { class: 'paper', conf: 0.65 }
        ]);
        setRtb(data.rtb || { battery_pct: 20, hold_pct: 80 });
      } catch {
        // keep defaults
      }
    })();
  }, []);

  const changeConf = (cls, value) => {
    setRows(prev => prev.map(r => r.class === cls ? { ...r, conf: Number(value) } : r));
  };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await updateInitiationThresholds({ classes: rows, rtb });
      setMsg('Saved.');
    } catch {
      setMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>Initiation Management</h2>
      <p>Set AI confidence to trigger vacuum initiation, and Return-to-Base (RTB) criteria.</p>

      <table style={{width:'100%', background:'#fff', borderCollapse:'collapse', borderRadius:'8px', overflow:'hidden'}}>
        <thead>
          <tr>
            <th style={{background:'#004080', color:'#fff', padding:'8px', textAlign:'left'}}>Class</th>
            <th style={{background:'#004080', color:'#fff', padding:'8px', textAlign:'left'}}>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.class}>
              <td style={{padding:'8px'}}>{r.class}</td>
              <td style={{padding:'8px'}}>
                <input
                  type="range" min="0.5" max="0.99" step="0.01"
                  value={r.conf}
                  onChange={e => changeConf(r.class, e.target.value)}
                />
                &nbsp;{Math.round(r.conf * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{marginTop:'1rem'}}>Return to Base (RTB)</h3>
      <div style={{display:'flex', gap:'16px'}}>
        <label>Battery %:&nbsp;
          <input
            type="number" min="0" max="100"
            value={rtb.battery_pct}
            onChange={e => setRtb({...rtb, battery_pct: Number(e.target.value)})}
          />
        </label>
        <label>Hold %:&nbsp;
          <input
            type="number" min="0" max="100"
            value={rtb.hold_pct}
            onChange={e => setRtb({...rtb, hold_pct: Number(e.target.value)})}
          />
        </label>
      </div>

      <div style={{marginTop:'10px'}}>
        <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
        {msg && <span style={{marginLeft:'10px'}}>{msg}</span>}
      </div>
    </div>
  );
}
