// frontend/src/pages/AdminPage.js

import { useState, useEffect } from 'react';
import API from '../api/axios';
import styles from '../styles/AdminPage.module.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, postsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/posts')
      ]);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      setUsers(users.map(u => u._id === id ? data.user : u));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const removePost = async (id) => {
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setPosts(posts.map(p => p._id === id ? { ...p, status: 'removed' } : p));
    } catch (err) {
      setError('Failed to remove post');
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <h2>Admin Dashboard</h2>
        <p className={styles.subtitle}>Manage members and moderate posts</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <h3>Total Members</h3>
          <p className={styles.statValue}>{users.length}</p>
          <p className={styles.statChange}>
            ↑ {users.filter(u => u.status === 'active').length} active
          </p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <h3>Total Posts</h3>
          <p className={styles.statValue}>{posts.length}</p>
          <p className={styles.statChange}>
            {posts.filter(p => p.status === 'published').length} published
          </p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🕒</div>
          <h3>Pending</h3>
          <p className={styles.statValue}>
            {posts.filter(p => p.status === 'removed').length}
          </p>
          <p className={styles.statChange}>removed posts</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <h3>Active Members</h3>
          <p className={styles.statValue}>
            {users.filter(u => u.status === 'active').length}
          </p>
          <p className={styles.statChange}>
            {users.filter(u => u.status === 'inactive').length} inactive
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${tab === 'users' ? styles.active : ''}`}
          onClick={() => setTab('users')}
        >
          👥 Members
          <span className={styles.tabCount}>{users.length}</span>
        </button>
        <button 
          className={`${styles.tabButton} ${tab === 'posts' ? styles.active : ''}`}
          onClick={() => setTab('posts')}
        >
          📝 All Posts
          <span className={styles.tabCount}>{posts.length}</span>
        </button>
      </div>

      {/* Users Table */}
      {tab === 'users' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h3>Members Management</h3>
            <input
              type="text"
              placeholder="Search members..."
              className={styles.searchBox}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => toggleStatus(user._id)}
                          className={`${styles.actionButton} ${user.status === 'active' ? styles.danger : styles.success}`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.emptyState}>
                    <p>No members found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Posts Table */}
      {tab === 'posts' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h3>Posts Management</h3>
          </div>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map(post => (
                  <tr key={post._id}>
                    <td>
                      <strong>{post.title}</strong>
                    </td>
                    <td>{post.author?.name || 'Unknown'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[post.status]}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {post.status === 'published' && (
                          <button
                            onClick={() => removePost(post._id)}
                            className={`${styles.actionButton} ${styles.danger}`}
                          >
                            Remove
                          </button>
                        )}
                        {post.status === 'removed' && (
                          <span style={{ color: '#999', fontSize: '0.9rem' }}>
                            Already removed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.emptyState}>
                    <p>No posts found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;