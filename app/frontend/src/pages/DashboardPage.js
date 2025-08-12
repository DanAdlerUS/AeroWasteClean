import './DashboardPage.css';
import { Link } from 'react-router-dom';

function DashboardPage() {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Aero Waste</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li className="active"><Link to="/drones">Drone Management</Link></li>
          <li><Link to="/bases">Base Management</Link></li>
          <li><Link to="/AI">AI Settings</Link></li>
          <li><Link to="/users">Manage Users</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>System Alerts</h1>
        <table>
          <thead>
            <tr>
              <th>Alert Type</th>
              <th>ID</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Low Battery</td>
              <td>92</td>
              <td>9%</td>
              <td>RTB</td>
            </tr>
            <tr>
              <td>Weather</td>
              <td>B_17</td>
              <td>Locked down</td>
              <td>Heavy rain for 17 hrs</td>
            </tr>
            <tr>
              <td>Offline</td>
              <td>81</td>
              <td>Inactive</td>
              <td>Offline</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default DashboardPage;
