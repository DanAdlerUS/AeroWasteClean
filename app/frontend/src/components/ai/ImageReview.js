import { useEffect, useState } from 'react';
import { getImageReviewHistory } from '../../utils/api';

export default function ImageReview() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getImageReviewHistory({ limit: 20 });
        setRows(data.items || []);
      } catch {
        setError('Failed to load review history.');
      }
    })();
  }, []);

  return (
    <div className="card">
      <h2>Image Review</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'8px', overflow:'hidden'}}>
        <thead>
          <tr>
            <th style={{background:'#004080', color:'#fff', padding:'8px'}}>Date & Time</th>
            <th style={{background:'#004080', color:'#fff', padding:'8px'}}>Mission ID</th>
            <th style={{background:'#004080', color:'#fff', padding:'8px'}}>AI Result</th>
            <th style={{background:'#004080', color:'#fff', padding:'8px'}}>Reviewer</th>
            <th style={{background:'#004080', color:'#fff', padding:'8px'}}>Decision</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td style={{padding:'8px'}}>{r.ts}</td>
              <td style={{padding:'8px'}}>{r.mission_id}</td>
              <td style={{padding:'8px'}}>{r.ai_result}</td>
              <td style={{padding:'8px'}}>{r.reviewer}</td>
              <td style={{padding:'8px'}}>{r.decision}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
