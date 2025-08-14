import './BaseManagementPage.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = `http://${window.location.hostname}:8001`;

function BaseManagementPage() {
  const [activeTab, setActiveTab] = useState('status');
  const [bases, setBases] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showBaseModal, setShowBaseModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);

  useEffect(() => {
    loadBases();
    loadRoutes();
  }, []);

  async function loadBases() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bases/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`GET /bases/ failed: ${res.status}`);
      const data = await res.json();
      setBases(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bases:', err);
      setError('Failed to load bases');
      setBases([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRoutes() {
    try {
      const res = await fetch(`${API_BASE}/bases/routes/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`GET /routes/ failed: ${res.status}`);
      const data = await res.json();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setRoutes([]);
    }
  }

  // Simple function to color code litter capacity
  const getCapacityColor = (value) => {
    if (value >= 90) return '#dc3545';
    if (value >= 50) return '#ffc107';
    return '#28a745';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return '#28a745';
      case 'maintenance': return '#ffc107';
      case 'full': return '#dc3545';
      case 'offline': return '#6c757d';
      default: return '#000';
    }
  };

  const handleEditBase = (base) => {
    setSelectedBase(base);
    setShowBaseModal(true);
  };

  const handleAddBase = () => {
    setSelectedBase(null);
    setShowBaseModal(true);
  };

  const handleDeleteBase = async (baseId) => {
    if (!window.confirm('Are you sure you want to delete this base?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/bases/${baseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        await loadBases();
        alert('Base deleted successfully');
      } else {
        throw new Error('Failed to delete base');
      }
    } catch (err) {
      console.error('Error deleting base:', err);
      alert('Failed to delete base');
    }
  };

  const handleSubmitBase = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const baseData = {
      name: formData.get('name'),
      servicing_address: formData.get('servicing_address'),
      what3words: formData.get('what3words'),
      drones_assigned: formData.get('drones_assigned')?.split(',').map(s => s.trim()).filter(s => s) || [],
      routes_assigned: formData.get('routes_assigned')?.split(',').map(s => s.trim()).filter(s => s) || [],
      litter_capacity_percent: parseInt(formData.get('litter_capacity_percent')) || 0,
      status: formData.get('status') || 'Available'
    };

    try {
      const url = selectedBase 
        ? `${API_BASE}/bases/${selectedBase.id}`
        : `${API_BASE}/bases/`;
        
      const response = await fetch(url, {
        method: selectedBase ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(baseData)
      });

      if (response.ok) {
        setShowBaseModal(false);
        setSelectedBase(null);
        await loadBases();
        alert(`Base ${selectedBase ? 'updated' : 'created'} successfully`);
      } else {
        throw new Error('Failed to save base');
      }
    } catch (err) {
      console.error('Error saving base:', err);
      alert('Failed to save base');
    }
  };

  const handleEditRoute = (route) => {
    setSelectedRoute(route);
    setShowRouteModal(true);
  };

  const handleAddRoute = () => {
    setSelectedRoute(null);
    setShowRouteModal(true);
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/bases/routes/${routeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        await loadRoutes();
        alert('Route deleted successfully');
      } else {
        throw new Error('Failed to delete route');
      }
    } catch (err) {
      console.error('Error deleting route:', err);
      alert('Failed to delete route');
    }
  };

  const handleSubmitRoute = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const routeData = {
      name: formData.get('name'),
      distance: formData.get('distance'),
      base_assigned: formData.get('base_assigned'),
      drone_assigned: formData.get('drone_assigned') || null,
      mission_frequency: formData.get('mission_frequency') || 'Daily',
      litter_capacity: formData.get('litter_capacity') || '15 litres',
      status: formData.get('status') || 'Active'
    };

    try {
      const url = selectedRoute 
        ? `${API_BASE}/bases/routes/${selectedRoute.id}`
        : `${API_BASE}/bases/routes/`;
        
      const response = await fetch(url, {
        method: selectedRoute ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(routeData)
      });

      if (response.ok) {
        setShowRouteModal(false);
        setSelectedRoute(null);
        await loadRoutes();
        alert(`Route ${selectedRoute ? 'updated' : 'created'} successfully`);
      } else {
        throw new Error('Failed to save route');
      }
    } catch (err) {
      console.error('Error saving route:', err);
      alert('Failed to save route');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (loading) return <div>Loading bases...</div>;

  return (
    <div className="base-page">
      <aside className="sidebar">
        <h2>Aero Waste</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/drones">Drone Management</Link></li>
          <li className="active"><Link to="/bases">Base Management</Link></li>
          <li><Link to="/ai">AI Settings</Link></li>
          <li><Link to="/users">Manage Users</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>Base Management</h1>

        {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

        <div className="tabs">
          <button 
            onClick={() => setActiveTab('status')}
            className={activeTab === 'status' ? 'active' : ''}
          >
            Base Status
          </button>
          <button 
            onClick={() => setActiveTab('bases')}
            className={activeTab === 'bases' ? 'active' : ''}
          >
            Manage Bases
          </button>
          <button 
            onClick={() => setActiveTab('routes')}
            className={activeTab === 'routes' ? 'active' : ''}
          >
            Manage Routes
          </button>
        </div>

        {activeTab === 'status' && (
          <table>
            <thead>
              <tr>
                <th>Base ID</th>
                <th>Base Name</th>
                <th>Status</th>
                <th>Routes Assigned</th>
                <th>Litter Capacity</th>
                <th>Drones Assigned</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {bases.map(base => (
                <tr key={base.id}>
                  <td>{base.id}</td>
                  <td>{base.name}</td>
                  <td style={{ color: getStatusColor(base.status) }}>
                    {base.status}
                  </td>
                  <td>{base.routes_assigned.join(', ') || '—'}</td>
                  <td style={{ color: getCapacityColor(base.litter_capacity_percent) }}>
                    {base.litter_capacity_percent}%
                  </td>
                  <td>{base.drones_assigned.join(', ') || '—'}</td>
                  <td>{base.servicing_address}</td>
                </tr>
              ))}
              {bases.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    No bases found
                  </td>
                </tr>
              )}
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
              {bases.map(base => (
                <tr key={base.id}>
                  <td>{base.id}</td>
                  <td>{base.name}</td>
                  <td>{base.servicing_address}</td>
                  <td>{base.what3words}</td>
                  <td>{base.drones_assigned.join(', ') || '—'}</td>
                  <td>{base.routes_assigned.join(', ') || '—'}</td>
                  <td>
                    <button onClick={() => handleEditBase(base)}>Edit</button>
                    <button 
                      onClick={() => handleDeleteBase(base.id)}
                      style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  <button onClick={handleAddBase}>Add Base</button>
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
                <th>Name</th>
                <th>Distance</th>
                <th>Base Assigned</th>
                <th>Drone Assigned</th>
                <th>Mission Frequency</th>
                <th>Litter Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id}>
                  <td>{route.id}</td>
                  <td>{route.name}</td>
                  <td>{route.distance}</td>
                  <td>{route.base_assigned}</td>
                  <td>{route.drone_assigned || '—'}</td>
                  <td>{route.mission_frequency}</td>
                  <td>{route.litter_capacity}</td>
                  <td style={{ color: route.status === 'Active' ? '#28a745' : '#6c757d' }}>
                    {route.status}
                  </td>
                  <td>
                    <button onClick={() => handleEditRoute(route)}>Edit</button>
                    <button 
                      onClick={() => handleDeleteRoute(route.id)}
                      style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>
                  <button onClick={handleAddRoute}>Create Route</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Base Modal */}
        {showBaseModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{selectedBase ? 'Edit Base' : 'Add New Base'}</h2>
              <form onSubmit={handleSubmitBase}>
                <div className="form-group">
                  <label>Base Name:</label>
                  <input 
                    name="name" 
                    defaultValue={selectedBase?.name || ''} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Servicing Address:</label>
                  <input 
                    name="servicing_address" 
                    defaultValue={selectedBase?.servicing_address || ''} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>What3Words:</label>
                  <input 
                    name="what3words" 
                    defaultValue={selectedBase?.what3words || ''} 
                    placeholder="///example.words.here"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Drones Assigned (comma separated):</label>
                  <input 
                    name="drones_assigned" 
                    defaultValue={selectedBase?.drones_assigned?.join(', ') || ''} 
                    placeholder="D001, D002"
                  />
                </div>
                
                <div className="form-group">
                  <label>Routes Assigned (comma separated):</label>
                  <input 
                    name="routes_assigned" 
                    defaultValue={selectedBase?.routes_assigned?.join(', ') || ''} 
                    placeholder="R_001_N, R_001_S"
                  />
                </div>
                
                <div className="form-group">
                  <label>Litter Capacity (%):</label>
                  <input 
                    name="litter_capacity_percent" 
                    type="number" 
                    min="0" 
                    max="100" 
                    defaultValue={selectedBase?.litter_capacity_percent || 0} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Status:</label>
                  <select name="status" defaultValue={selectedBase?.status || 'Available'}>
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Full">Full</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="submit">
                    {selectedBase ? 'Update Base' : 'Add Base'}
                  </button>
                  <button type="button" onClick={() => {
                    setShowBaseModal(false);
                    setSelectedBase(null);
                  }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Route Modal */}
        {showRouteModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{selectedRoute ? 'Edit Route' : 'Create New Route'}</h2>
              <form onSubmit={handleSubmitRoute}>
                <div className="form-group">
                  <label>Route Name:</label>
                  <input 
                    name="name" 
                    defaultValue={selectedRoute?.name || ''} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Distance:</label>
                  <input 
                    name="distance" 
                    defaultValue={selectedRoute?.distance || ''} 
                    placeholder="e.g., 750m"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Base Assigned:</label>
                  <select name="base_assigned" defaultValue={selectedRoute?.base_assigned || ''} required>
                    <option value="">Select Base</option>
                    {bases.map(base => (
                      <option key={base.id} value={base.id}>{base.name} ({base.id})</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Drone Assigned:</label>
                  <input 
                    name="drone_assigned" 
                    defaultValue={selectedRoute?.drone_assigned || ''} 
                    placeholder="e.g., D001 (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Mission Frequency:</label>
                  <select name="mission_frequency" defaultValue={selectedRoute?.mission_frequency || 'Daily'}>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Litter Capacity:</label>
                  <select name="litter_capacity" defaultValue={selectedRoute?.litter_capacity || '15 litres'}>
                    <option value="15 litres">15 litres</option>
                    <option value="50 litres">50 litres</option>
                    <option value="75 litres">75 litres</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status:</label>
                  <select name="status" defaultValue={selectedRoute?.status || 'Active'}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="submit">
                    {selectedRoute ? 'Update Route' : 'Create Route'}
                  </button>
                  <button type="button" onClick={() => {
                    setShowRouteModal(false);
                    setSelectedRoute(null);
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

export default BaseManagementPage;