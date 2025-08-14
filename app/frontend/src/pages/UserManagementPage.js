import './UserManagementPage.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Keep FE & API on the same host (localhost OR 127.0.0.1) so cookies are sent
const API_BASE = `http://${window.location.hostname}:8001`;

function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch(`${API_BASE}/users/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`GET /users/ failed: ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert('Failed to load users');
    }
  }

  async function loadRoles() {
    try {
      const res = await fetch(`${API_BASE}/roles/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`GET /roles/ failed: ${res.status}`);
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      // Fallback defaults if API is unreachable
      setRoles([
        { id: 'R001', name: 'Admin', description: 'Full system access', permissions: ['all'] },
        { id: 'R002', name: 'Operator', description: 'Drone operation access', permissions: ['view', 'execute_missions'] }
      ]);
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowAddModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Require baseline fields
    const requiredFields = ['name', 'access_rights', 'start_date', 'username'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        alert(`Please fill in the ${field.replace('_', ' ')}`);
        return;
      }
    }

    // Require password only when creating a user
    if (!selectedUser && !formData.get('password')) {
      alert('Please set an initial password');
      return;
    }

    const userData = {
      username: formData.get('username'),
      email: formData.get('email') || null,
      name: formData.get('name'),
      access_rights: formData.get('access_rights'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date') || null
    };

    const password = formData.get('password');
    if (password) userData.password = password;

    try {
      const url = selectedUser
        ? `${API_BASE}/users/${selectedUser.id}`
        : `${API_BASE}/users/`; // create hits the collection endpoint (with slash)

      const res = await fetch(url, {
        method: selectedUser ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!res.ok) {
        let message = 'Failed to save user';
        try {
          const err = await res.json();
          if (err?.detail) message = err.detail;
        } catch (_) {}
        throw new Error(message);
      }

      setShowAddModal(false);
      await loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete user');
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.message);
    }
  };

  return (
    <div className="user-page">
      <aside className="sidebar">
        <h2>Aero Waste</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/drones">Drone Management</Link></li>
          <li><Link to="/bases">Base Management</Link></li>
          <li><Link to="/ai">AI Settings</Link></li>
          <li className="active"><Link to="/users">Manage Users</Link></li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>User Management</h1>

        <div className="tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'active' : ''}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={activeTab === 'roles' ? 'active' : ''}
          >
            Access Rights
          </button>
        </div>

        {activeTab === 'users' && (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Access Rights</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username || ''}</td>
                  <td>{user.name}</td>
                  <td>{user.access_rights}</td>
                  <td>{user.start_date || ''}</td>
                  <td>{user.end_date || ''}</td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleString() : '—'}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  <button onClick={handleAddUser}>Add User</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'roles' && (
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.description}</td>
                  <td>{Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions}</td>
                  <td>
                    <button disabled>Edit</button>
                    <button disabled>Delete</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  <button disabled>Add Role</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{selectedUser ? 'Edit User' : 'Add User'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedUser?.name || ''}
                  />
                </div>
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={selectedUser?.username || ''}
                  />
                </div>
                <div className="form-group">
                  <label>Email (optional):</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser?.email || ''}
                  />
                </div>
                <div className="form-group">
                  <label>Access Rights:</label>
                  <select
                    name="access_rights"
                    defaultValue={selectedUser?.access_rights || ''}
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={selectedUser?.start_date || ''}
                  />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={selectedUser?.end_date || ''}
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input type="password" name="password" placeholder={selectedUser ? '(leave blank to keep unchanged)' : ''}/>
                </div>
                <div className="modal-buttons">
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserManagementPage;
