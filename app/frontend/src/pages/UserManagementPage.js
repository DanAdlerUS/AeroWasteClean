import './UserManagementPage.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Fetch users and roles when component mounts
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/users/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      access_rights: formData.get('access_rights'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      password: formData.get('password')
    };

    try {
      const url = selectedUser 
        ? `http://127.0.0.1:8001/users/${selectedUser.id}`
        : 'http://127.0.0.1:8001/users';
        
      const response = await fetch(url, {
        method: selectedUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Failed to save user');
        
      setShowAddModal(false);
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8001/users/${userId}`, {
        method: 'DELETE'
      });
        
      if (!response.ok) throw new Error('Failed to delete user');
        
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowAddModal(true);
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
                  <td>{user.name}</td>
                  <td>{user.access_rights}</td>
                  <td>{user.start_date}</td>
                  <td>{user.end_date}</td>
                  <td>{user.last_login || 'Never'}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
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
                <th>Role Name</th>
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
                  <td>{role.permissions}</td>
                  <td>
                    <button>Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  <button>Add Role</button>
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
                  <input type="password" name="password" />
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