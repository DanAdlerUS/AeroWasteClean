import { useEffect, useState } from 'react';
import { getNextImageBatch, submitImageReview } from '../../utils/api';

export default function LitterValidation() {
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch a batch assigned to this reviewer (mock reviewer 'admin' for now)
  useEffect(() => {
    (async () => {
      try {
        const data = await getNextImageBatch({ reviewer: 'admin', limit: 6 });
        setImages(data.items || []); // expected: [{id, image_url, ai_class, ai_conf, mission_id, ts}, ...]
      } catch (e) {
        setError('Failed to load images.');
      }
    })();
  }, []);

  const updateLocal = (id, patch) => {
    setImages(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      // Build payload: only images with a decision
      const payload = images
        .filter(i => typeof i.human_is_litter !== 'undefined')
        .map(i => ({
          id: i.id,
          is_litter: !!i.human_is_litter,
          litter_class: i.human_class || null,
          weight_grams: i.human_weight ? Number(i.human_weight) : null
        }));

      if (payload.length === 0) {
        setError('Please review at least one image.');
        setSaving(false);
        return;
      }

      await submitImageReview(payload);
      // after submit, reload a new batch
      const data = await getNextImageBatch({ reviewer: 'admin', limit: 6 });
      setImages(data.items || []);
    } catch (e) {
      setError('Failed to submit reviews.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>Litter Image Validation</h2>
      <p>Classify images and provide optional weight estimate.</p>
      {error && <p style={{color:'red'}}>{error}</p>}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px'}}>
        {images.map(img => (
          <div key={img.id} style={{border:'1px solid #ddd', borderRadius:'6px', padding:'8px', background:'#fafafa'}}>
            <img src={img.image_url} alt={img.id} style={{width:'100%', height:'180px', objectFit:'cover', borderRadius:'4px'}} />
            <div style={{fontSize:'0.9rem', marginTop:'6px', color:'#333'}}>
              <div><strong>ID:</strong> {img.id}</div>
              <div><strong>AI:</strong> {img.ai_class} ({Math.round((img.ai_conf||0)*100)}%)</div>
              <div><strong>Mission:</strong> {img.mission_id}</div>
              <div><strong>Time:</strong> {img.ts}</div>
            </div>

            <div style={{marginTop:'8px'}}>
              <label>
                <input
                  type="radio"
                  name={`is_litter_${img.id}`}
                  onChange={() => updateLocal(img.id, { human_is_litter: true })}
                  checked={img.human_is_litter === true}
                /> Litter
              </label>
              {' '}
              <label>
                <input
                  type="radio"
                  name={`is_litter_${img.id}`}
                  onChange={() => updateLocal(img.id, { human_is_litter: false })}
                  checked={img.human_is_litter === false}
                /> Not Litter
              </label>
            </div>

            <div style={{marginTop:'6px'}}>
              <label>Class:&nbsp;
                <select
                  value={img.human_class || ''}
                  onChange={e => updateLocal(img.id, { human_class: e.target.value })}
                  disabled={img.human_is_litter !== true}
                >
                  <option value="">Select</option>
                  <option value="plastic">Plastic</option>
                  <option value="glass">Glass</option>
                  <option value="paper">Paper</option>
                  <option value="cardboard">Cardboard</option>
                  <option value="cigarette">Cigarette</option>
                  <option value="tyre">Tyre</option>
                </select>
              </label>
            </div>

            <div style={{marginTop:'6px'}}>
              <label>Weight (g):&nbsp;
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 200"
                  value={img.human_weight || ''}
                  onChange={e => updateLocal(img.id, { human_weight: e.target.value })}
                  disabled={img.human_is_litter !== true}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:'10px'}}>
        <button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Reviews'}
        </button>
      </div>
    </div>
  );
}
