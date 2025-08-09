import './BaseManagementPage.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function BaseManagementPage() {
  const [activeTab, setActiveTab] = useState('status');

  // Simple function to color code litter capacity
  const getCapacityColor = (value) => {
    if (value >= 90) return 'red';
    if (value >= 50) return 'orange';
    return 'green';
  };

  return (
    <div className="base-page">
      <aside className="sidebar">
        <h2>Aero Waste</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li className="active"><Link to="/drones">Drone Management</Link></li>
          <li><Link to="/bases">Base Management</Link></li>
          <li><Link to="/AI">AI Settings</Link></li>
          <li><Link to="#">Manage Users</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>Base Management</h1>

        <div className="tabs">
          <button onClick={() => setActiveTab('status')}>Base Status</button>
          <button onClick={() => setActiveTab('bases')}>Manage Bases</button>
          <button onClick={() => setActiveTab('routes')}>Manage Routes</button>
        </div>

        {activeTab === 'status' && (
          <table>
            <thead>
              <tr>
                <th>Base ID</th>
                <th>Current Operation</th>
                <th>Servicing Frequency</th>
                <th>Routes Assigned</th>
                <th>Litter Capacity</th>
                <th>Next Collection</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>B_001</td>
                <td>On Mission</td>
                <td>Weekly</td>
                <td>R_678_N, R_678_S</td>
                <td style={{ color: getCapacityColor(12) }}>12%</td>
                <td>08/08/25</td>
              </tr>
              <tr>
                <td>B_003</td>
                <td>On Mission</td>
                <td>Daily</td>
                <td>R_340_S</td>
                <td style={{ color: getCapacityColor(65) }}>65%</td>
                <td>07/08/25</td>
              </tr>
              <tr>
                <td>B_004</td>
                <td>On Mission</td>
                <td>Daily</td>
                <td>R_013_N</td>
                <td style={{ color: getCapacityColor(93) }}>93%</td>
                <td>07/08/25</td>
              </tr>
            </tbody>
          </table>
        )}

{activeTab === 'bases' && (
  <table>
    <thead>
      <tr>
        <th>Base ID</th>
        <th>Base Name</th>
        <th>Servicing Address</th>
        <th>What3Words</th>
        <th>Drones Assigned</th>
        <th>Routes Assigned</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>B_001</td>
        <td>North Point</td>
        <td>123 Main Rd</td>
        <td>///track.rapid.giant</td>
        <td>1, 3</td>
        <td>R_001_N, R_001_S</td>
        <td>
          <button>Edit</button>
          <button>Delete</button>
        </td>
      </tr>
      <tr>
        <td>B_002</td>
        <td>East Hub</td>
        <td>48 East Lane</td>
        <td>///scan.path.fence</td>
        <td>2</td>
        <td>R_112_S</td>
        <td>
          <button>Edit</button>
          <button>Delete</button>
        </td>
      </tr>
      <tr>
        <td colSpan="7" style={{ textAlign: 'center' }}>
          <button>Add Base</button>
        </td>
      </tr>
    </tbody>
  </table>
)}
{activeTab === 'routes' && (
  <table>
    <thead>
      <tr>
        <th>Route ID</th>
        <th>Distance</th>
        <th>Base Assigned</th>
        <th>Drone Assigned</th>
        <th>Mission Frequency</th>
        <th>Litter Capacity</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>R_001_N</td>
        <td>750m</td>
        <td>B_001</td>
        <td>1</td>
        <td>
          <select>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Bi-weekly</option>
          </select>
        </td>
        <td>
          <select>
            <option>15 litres</option>
            <option>50 litres</option>
            <option>75 litres</option>
          </select>
        </td>
        <td>
          <button>Edit</button>
          <button>Delete</button>
        </td>
      </tr>
      <tr>
        <td colSpan="7" style={{ textAlign: 'center' }}>
          <button>Create Route</button>
        </td>
      </tr>
    </tbody>
  </table>
)}
      </main>
    </div>
  );
}

export default BaseManagementPage;
