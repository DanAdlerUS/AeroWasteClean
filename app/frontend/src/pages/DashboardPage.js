import './DashboardPage.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = `http://${window.location.hostname}:8001`;

function DashboardPage() {
  const [drones, setDrones] = useState([]);
  const [bases, setBases] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [dronesRes, basesRes, routesRes] = await Promise.all([
        fetch(`${API_BASE}/drones/`, { credentials: 'include' }),
        fetch(`${API_BASE}/bases/`, { credentials: 'include' }),
        fetch(`${API_BASE}/bases/routes/`, { credentials: 'include' })
      ]);

      if (dronesRes.ok) {
        const dronesData = await dronesRes.json();
        setDrones(Array.isArray(dronesData) ? dronesData : []);
      }

      if (basesRes.ok) {
        const basesData = await basesRes.json();
        setBases(Array.isArray(basesData) ? basesData : []);
      }

      if (routesRes.ok) {
        const routesData = await routesRes.json();
        setRoutes(Array.isArray(routesData) ? routesData : []);
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  // Calculate system statistics
  const stats = {
    totalDrones: drones.length,
    activeDrones: drones.filter(d => d.status === 'On Mission' || d.status === 'Active').length,
    totalBases: bases.length,
    fullBases: bases.filter(b => b.litter_capacity_percent >= 90).length,
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'Active').length
  };

  // Generate system alerts
  const generateAlerts = () => {
    const alerts = [];

    // Low battery alerts
    drones.forEach(drone => {
      if (drone.battery <= 20) {
        alerts.push({
          type: 'Low Battery',
          id: drone.id,
          status: `${drone.battery}%`,
          reason: drone.battery <= 10 ? 'Critical - RTB' : 'Warning - Monitor',
          severity: drone.battery <= 10 ? 'critical' : 'warning',
          item: drone.name
        });
      }
    });

    // Camera errors
    drones.forEach(drone => {
      if (drone.camera_status !== 'OK') {
        alerts.push({
          type: 'Camera Error',
          id: drone.id,
          status: drone.camera_status,
          reason: 'Equipment malfunction',
          severity: 'warning',
          item: drone.name
        });
      }
    });

    // Offline drones
    drones.forEach(drone => {
      if (drone.status === 'Offline' || drone.signal_strength === 'Offline') {
        alerts.push({
          type: 'Offline',
          id: drone.id,
          status: 'Inactive',
          reason: 'Connection lost',
          severity: 'critical',
          item: drone.name
        });
      }
    });

    // Maintenance alerts
    drones.forEach(drone => {
      if (drone.status === 'Maintenance') {
        alerts.push({
          type: 'Maintenance',
          id: drone.id,
          status: 'In Service',
          reason: 'Scheduled maintenance',
          severity: 'info',
          item: drone.name
        });
      }
    });

    // Full bases
    bases.forEach(base => {
      if (base.litter_capacity_percent >= 90) {
        alerts.push({
          type: 'Base Full',
          id: base.id,
          status: `${base.litter_capacity_percent}%`,
          reason: 'Collection required',
          severity: base.litter_capacity_percent >= 95 ? 'critical' : 'warning',
          item: base.name
        });
      }
    });

    // Base maintenance
    bases.forEach(base => {
      if (base.status === 'Maintenance' || base.status === 'Offline') {
        alerts.push({
          type: 'Base Status',
          id: base.id,
          status: base.status,
          reason: base.status === 'Maintenance' ? 'Service required' : 'Base offline',
          severity: 'warning',
          item: base.name
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const alerts = generateAlerts();

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#000';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && drones.length === 0) {
    return (
      <div className="dashboard-container">
        <aside className="sidebar">
          <h2>Aero Waste</h2>
          <ul>
            <li className="active"><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/drones">Drone Management</Link></li>
            <li><Link to="/bases">Base Management</Link></li>
            <li><Link to="/ai">AI Settings</Link></li>
            <li><Link to="/users">Manage Users</Link></li>
          </ul>
        </aside>
        <main className="main-content">
          <h1>Loading Dashboard...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Aero Waste</h2>
        <ul>
          <li className="active"><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/drones">Drone Management</Link></li>
          <li><Link to="/bases">Base Management</Link></li>
          <li><Link to="/ai">AI Settings</Link></li>
          <li><Link to="/users">Manage Users</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="dashboard-header">
          <h1>System Dashboard</h1>
          <div className="last-update">
            Last updated: {formatTime(lastUpdate)}
            {loading && <span className="loading-indicator"> (Refreshing...)</span>}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error} - <button onClick={loadAllData}>Retry</button>
          </div>
        )}

        {/* System Overview Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalDrones}</div>
            <div className="stat-label">Total Drones</div>
            <div className="stat-detail">{stats.activeDrones} active</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.totalBases}</div>
            <div className="stat-label">Base Stations</div>
            <div className="stat-detail">{stats.fullBases} need collection</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.totalRoutes}</div>
            <div className="stat-label">Routes</div>
            <div className="stat-detail">{stats.activeRoutes} active</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{alerts.length}</div>
            <div className="stat-label">Active Alerts</div>
            <div className="stat-detail">
              {alerts.filter(a => a.severity === 'critical').length} critical
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="alerts-section">
          <h2>System Alerts</h2>
          {alerts.length === 0 ? (
            <div className="no-alerts">
              ✅ All systems operating normally
            </div>
          ) : (
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Alert Type</th>
                  <th>Asset</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, index) => (
                  <tr key={index}>
                    <td>
                      <span 
                        className="alert-type"
                        style={{ color: getAlertColor(alert.severity) }}
                      >
                        {alert.type}
                      </span>
                    </td>
                    <td>{alert.item}</td>
                    <td>{alert.id}</td>
                    <td style={{ color: getAlertColor(alert.severity) }}>
                      {alert.status}
                    </td>
                    <td>{alert.reason}</td>
                    <td>
                      <Link 
                        to={alert.id.startsWith('D') ? '/drones' : '/bases'}
                        className="action-link"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Fleet Status Overview */}
        <div className="fleet-overview">
          <div className="fleet-section">
            <h3>Drone Fleet Status</h3>
            <div className="status-grid">
              {drones.map(drone => (
                <div key={drone.id} className="status-item">
                  <div className="status-header">
                    <strong>{drone.name}</strong>
                    <span className="status-id">({drone.id})</span>
                  </div>
                  <div className="status-details">
                    <div className={`status-badge ${drone.status.toLowerCase().replace(' ', '-')}`}>
                      {drone.status}
                    </div>
                    <div className="battery-indicator">
                      🔋 {drone.battery}%
                    </div>
                    <div className="route-info">
                      📍 {drone.route_assigned || 'No route'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fleet-section">
            <h3>Base Station Status</h3>
            <div className="status-grid">
              {bases.map(base => (
                <div key={base.id} className="status-item">
                  <div className="status-header">
                    <strong>{base.name}</strong>
                    <span className="status-id">({base.id})</span>
                  </div>
                  <div className="status-details">
                    <div className={`status-badge ${base.status.toLowerCase()}`}>
                      {base.status}
                    </div>
                    <div className="capacity-indicator">
                      🗂️ {base.litter_capacity_percent}% full
                    </div>
                    <div className="drone-count">
                      🤖 {base.drones_assigned.length} drones
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;