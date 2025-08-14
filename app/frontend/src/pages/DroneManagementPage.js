import './DroneManagementPage.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Keep FE & API on the same host (localhost OR 127.0.0.1) so cookies are sent
const API_BASE = `http://${window.location.hostname}:8001`;

function DroneManagementPage() {
  const [activeTab, setActiveTab] = useState('status');
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadDrones();
  }, []);

  async function loadDrones() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/drones/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`GET /drones/ failed: ${res.status}`);
      const data = await res.json();
      setDrones(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching drones:', err);
      setError('Failed to load drones');
      setDrones([]);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (drone) => {
    setSelectedDrone(drone);
    setShowAddModal(true);
  };

  const handleAddDrone = () => {
    setSelectedDrone(null);
    setShowAddModal(true);
  };

  const handleDelete = async (droneId) => {
    if (!window.confirm('Are you sure you want to delete this drone?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/drones/${droneId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        await loadDrones(); // Reload the list
        alert('Drone deleted successfully');
      } else {
        throw new Error('Failed to delete drone');
      }
    } catch (err) {
      console.error('Error deleting drone:', err);
      alert('Failed to delete drone');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const droneData = {
      name: formData.get('name'),
      model: formData.get('model') || 'DJI Mini 4 Pro',
      base_assigned: formData.get('base_assigned'),
      route_assigned: formData.get('route_assigned') || null,
      status: formData.get('status') || 'Inactive',
      battery: parseInt(formData.get('battery')) || 100,
      litter_capacity: parseInt(formData.get('litter_capacity')) || 0,
      camera_status: formData.get('camera_status') || 'OK',
      signal_strength: formData.get('signal_strength') || 'Strong'
    };

    try {
      const url = selectedDrone 
        ? `${API_BASE}/drones/${selectedDrone.id}`
        : `${API_BASE}/drones/`;
        
      const response = await fetch(url, {
        method: selectedDrone ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(droneData)
      });

      if (response.ok) {
        setShowAddModal(false);
        setSelectedDrone(null);
        await loadDrones(); // Reload the list
        alert(`Drone ${selectedDrone ? 'updated' : 'created'} successfully`);
      } else {
        throw new Error('Failed to save drone');
      }
    } catch (err) {
      console.error('Error saving drone:', err);
      alert('Failed to save drone');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on mission': return '#28a745';
      case 'active': return '#007bff';
      case 'charging': return '#ffc107';
      case 'maintenance': return '#dc3545';
      case 'offline': case 'inactive': return '#6c757d';
      default: return '#000';
    }
  };

  const getBatteryColor = (battery) => {
    if (battery > 50) return '#28a745';
    if (battery > 20) return '#ffc107';
    return '#dc3545';
  };

  if (loading) return <div>Loading drones...</div>;

  return (
    <div className="drone-page">
      <aside className="sidebar">
        <h2>Aero Waste</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li className="active"><Link to="/drones">Drone Management</Link></li>
          <li><Link to="/bases">Base Management</Link></li>
          <li><Link to="/ai">AI Settings</Link></li>
          <li><Link to="/users">Manage Users</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>Drone Management</h1>

        {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

        <div className="tabs">
          <button 
            onClick={() => setActiveTab('status')}
            className={activeTab === 'status' ? 'active' : ''}
          >
            Drone Status
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={activeTab === 'reports' ? 'active' : ''}
          >
            Recent Mission Reports
          </button>
          <button 
            onClick={() => setActiveTab('edit')}
            className={activeTab === 'edit' ? 'active' : ''}
          >
            Edit Drone Details
          </button>
        </div>

        {activeTab === 'status' && (
          <table>
            <thead>
              <tr>
                <th>Drone ID</th>
                <th>Name</th>
                <th>Model</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Route Assigned</th>
                <th>Litter Capacity</th>
                <th>Camera</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {drones.map(drone => (
                <tr key={drone.id}>
                  <td>{drone.id}</td>
                  <td>{drone.name}</td>
                  <td>{drone.model}</td>
                  <td style={{ color: getStatusColor(drone.status) }}>
                    {drone.status}
                  </td>
                  <td style={{ color: getBatteryColor(drone.battery) }}>
                    {drone.battery}%
                  </td>
                  <td>{drone.route_assigned || '—'}</td>
                  <td>{drone.litter_capacity}%</td>
                  <td>{drone.camera_status}</td>
                  <td>{drone.signal_strength}</td>
                </tr>
              ))}
              {drones.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    No drones found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'reports' && (
          <table>
            <thead>
              <tr>
                <th>Drone ID</th>
                <th>Name</th>
                <th>Total Missions</th>
                <th>Total Litter Collected</th>
                <th>Last Maintenance</th>
                <th>Base Assigned</th>
              </tr>
            </thead>
            <tbody>
              {drones.map(drone => (
                <tr key={drone.id}>
                  <td>{drone.id}</td>
                  <td>{drone.name}</td>
                  <td>{drone.total_missions || 0}</td>
                  <td>{drone.total_litter_collected || 0}kg</td>
                  <td>{formatDate(drone.last_maintenance)}</td>
                  <td>{drone.base_assigned}</td>
                </tr>
              ))}
              {drones.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    No drones found
                  </td>
                </tr>
              )}
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
                  <th>Model</th>
                  <th>Base Assigned</th>
                  <th>Route Assigned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drones.map(drone => (
                  <tr key={drone.id}>
                    <td>{drone.id}</td>
                    <td>{drone.name}</td>
                    <td>{drone.model}</td>
                    <td>{drone.base_assigned}</td>
                    <td>{drone.route_assigned || '—'}</td>
                    <td>{drone.status}</td>
                    <td>
                      <button onClick={() => handleEdit(drone)}>Edit</button>
                      <button 
                        onClick={() => handleDelete(drone.id)}
                        style={{ backgroundColor: '#dc3545', color: 'white' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    <button onClick={handleAddDrone}>Add Drone</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{selectedDrone ? 'Edit Drone' : 'Add New Drone'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name:</label>
                  <input 
                    name="name" 
                    defaultValue={selectedDrone?.name || ''} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Model:</label>
                  <select name="model" defaultValue={selectedDrone?.model || 'DJI Mini 4 Pro'}>
                    <option value="DJI Mini 4 Pro">DJI Mini 4 Pro</option>
                    <option value="DJI Air 3">DJI Air 3</option>
                    <option value="DJI Mavic 3">DJI Mavic 3</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Base Assigned:</label>
                  <input 
                    name="base_assigned" 
                    defaultValue={selectedDrone?.base_assigned || ''} 
                    placeholder="e.g., B_001"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Route Assigned:</label>
                  <input 
                    name="route_assigned" 
                    defaultValue={selectedDrone?.route_assigned || ''} 
                    placeholder="e.g., R_001_N (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Status:</label>
                  <select name="status" defaultValue={selectedDrone?.status || 'Inactive'}>
                    <option value="Inactive">Inactive</option>
                    <option value="Active">Active</option>
                    <option value="On Mission">On Mission</option>
                    <option value="Charging">Charging</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Battery (%):</label>
                  <input 
                    name="battery" 
                    type="number" 
                    min="0" 
                    max="100" 
                    defaultValue={selectedDrone?.battery || 100} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Litter Capacity (%):</label>
                  <input 
                    name="litter_capacity" 
                    type="number" 
                    min="0" 
                    max="100" 
                    defaultValue={selectedDrone?.litter_capacity || 0} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Camera Status:</label>
                  <select name="camera_status" defaultValue={selectedDrone?.camera_status || 'OK'}>
                    <option value="OK">OK</option>
                    <option value="Warning">Warning</option>
                    <option value="Error">Error</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Signal Strength:</label>
                  <select name="signal_strength" defaultValue={selectedDrone?.signal_strength || 'Strong'}>
                    <option value="Strong">Strong</option>
                    <option value="Medium">Medium</option>
                    <option value="Weak">Weak</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="submit">
                    {selectedDrone ? 'Update Drone' : 'Add Drone'}
                  </button>
                  <button type="button" onClick={() => {
                    setShowAddModal(false);
                    setSelectedDrone(null);
                  }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DroneManagementPage;