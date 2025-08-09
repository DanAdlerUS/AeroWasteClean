import './DroneManagementPage.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function DroneManagementPage() {
  const [activeTab, setActiveTab] = useState('status');

  return (
    <div className="drone-page">
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
        <h1>Drone Management</h1>

        <div className="tabs">
          <button onClick={() => setActiveTab('status')}>Drone Status</button>
          <button onClick={() => setActiveTab('reports')}>Recent Mission Reports</button>
          <button onClick={() => setActiveTab('edit')}>Edit Drone Details</button>
        </div>

        {activeTab === 'status' && (
          <table>
            <thead>
              <tr>
                <th>Drone ID</th>
                <th>Current Operation</th>
                <th>Battery</th>
                <th>Route Assigned</th>
                <th>Litter Capacity</th>
                <th>Camera</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>On Mission</td>
                <td>67%</td>
                <td>R_678_N</td>
                <td>12%</td>
                <td>OK</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Offline</td>
                <td>100%</td>
                <td>–</td>
                <td>0%</td>
                <td>Offline</td>
              </tr>
              <tr>
                <td>3</td>
                <td>On Mission</td>
                <td>24%</td>
                <td>R_340_S</td>
                <td>65%</td>
                <td>OK</td>
              </tr>
            </tbody>
          </table>
        )}

{activeTab === 'reports' && (
  <table>
    <thead>
      <tr>
        <th>Mission ID</th>
        <th>Drone ID</th>
        <th>Start</th>
        <th>End</th>
        <th>Litter Collected</th>
        <th>Route</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><Link to="/mission-report/M_1">M_1</Link></td>
        <td>1</td>
        <td>01/08/25 09:00</td>
        <td>01/08/25 09:25</td>
        <td>2.1kg</td>
        <td>R_001_N</td>
      </tr>
      <tr>
        <td><Link to="/mission-report/M_2">M_1</Link></td>
        <td>2</td>
        <td>01/08/25 10:00</td>
        <td>01/08/25 10:45</td>
        <td>3.4kg</td>
        <td>R_112_S</td>
      </tr>
      <tr>
        <td><Link to="/mission-report/M_3">M_3</Link></td>
        <td>3</td>
        <td>02/08/25 08:10</td>
        <td>02/08/25 08:40</td>
        <td>1.6kg</td>
        <td>R_340_S</td>
      </tr>
    </tbody>
  </table>
)}
{activeTab === 'edit' && (
  <div>
    <table>
      <thead>
        <tr>
          <th>Drone ID</th>
          <th>Name</th>
          <th>Base Assigned</th>
          <th>Route Assigned</th>
          <th>Status</th>
          <th>Reason</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Drone Alpha</td>
          <td>B_001</td>
          <td>R_001_N</td>
          <td>On Mission</td>
          <td>
            <select>
              <option value="">Select</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Battery Low">Battery Low</option>
              <option value="Signal Lost">Signal Lost</option>
              <option value="Camera Error">Camera Error</option>
              <option value="Other">Other</option>
            </select>
          </td>
          <td>
            <button>Edit</button>
            <button>Delete</button>
          </td>
        </tr>
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>
            <button>Add Drone</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}
      </main>
    </div>
  );
}

export default DroneManagementPage;
