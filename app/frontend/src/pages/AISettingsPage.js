import { useState } from 'react';
import './AISettingsPage.css';
import { Link } from 'react-router-dom';
import LitterValidation from '../components/ai/LitterValidation';
import InitiationManagement from '../components/ai/InitiationManagement';
import ImageReview from '../components/ai/ImageReview';
import ImageUpload from '../components/ai/ImageUpload';

export default function AISettingsPage() {
  const [tab, setTab] = useState('upload');

  return (
    <div className="ai-page">
      <aside className="sidebar">
        <h2>Aero Waste</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/drones">Drone Management</Link></li>
          <li><Link to="/bases">Base Management</Link></li>
          <li className="active"><Link to="/ai">AI Settings</Link></li>
          <li><Link to="/users">Manage Users</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>AI Settings</h1>
        <div className="tabs">
          <button onClick={() => setTab('upload')}>Upload Images</button>
          <button onClick={() => setTab('validation')}>Litter Image Validation</button>
          <button onClick={() => setTab('initiation')}>Initiation Management</button>
          <button onClick={() => setTab('review')}>Image Review</button>
        </div>

        {tab === 'upload' && <ImageUpload />}
        {tab === 'validation' && <LitterValidation />}
        {tab === 'initiation' && <InitiationManagement />}
        {tab === 'review' && <ImageReview />}
      </main>
    </div>
  );
}
