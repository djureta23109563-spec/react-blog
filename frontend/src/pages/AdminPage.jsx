// frontend/src/pages/AdminPage.js

import { useState, useEffect } from 'react';
import API from '../api/axios';
import styles from '../styles/AdminPage.module.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [removedPosts, setRemovedPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Message detail state
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all');
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    publishedPosts: 0,
    totalMessages: 0,
    unreadMessages: 0,
    recentActivity: []
  });

  // For Vite, use import.meta.env for backend URL
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let usersData = [];
      let postsData = [];
      let messagesData = [];
      
      try {
        const usersRes = await API.get('/admin/users');
        usersData = usersRes.data || [];
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
      
      try {
        const postsRes = await API.get('/admin/posts');
        postsData = postsRes.data || [];
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
      
      try {
        const messagesRes = await API.get('/messages/admin');
        messagesData = messagesRes.data || [];
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
      
      setUsers(usersData);
      setPosts(postsData);
      setMessages(messagesData);
      
      const removed = postsData.filter(post => post.status === 'removed');
      setRemovedPosts(removed);
      
      // Calculate analytics
      const activeUsers = usersData.filter(u => u.status === 'active').length;
      const publishedPosts = postsData.filter(p => p.status === 'published').length;
      const unreadMessages = messagesData.filter(m => m.status === 'unread').length;
      
      setAnalytics({
        totalUsers: usersData.length,
        activeUsers,
        totalPosts: postsData.length,
        publishedPosts,
        totalMessages: messagesData.length,
        unreadMessages,
        recentActivity: [
          ...usersData.slice(0, 3).map(u => ({ type: 'user', data: u, date: u.createdAt })),
          ...postsData.slice(0, 3).map(p => ({ type: 'post', data: p, date: p.createdAt })),
          ...messagesData.slice(0, 3).map(m => ({ type: 'message', data: m, date: m.createdAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      });
      
    } catch (err) {
      setError('Failed to load some data. Please refresh the page.');
      console.error('Error fetching data:', err);
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
      const updatedPosts = posts.map(p => p._id === id ? { ...p, status: 'removed' } : p);
      setPosts(updatedPosts);
      const removed = updatedPosts.filter(p => p.status === 'removed');
      setRemovedPosts(removed);
    } catch (err) {
      setError('Failed to remove post');
    }
  };

  const restorePost = async (id) => {
    try {
      await API.put(`/deleted-posts/${id}/restore`);
      const updatedPosts = posts.map(p => p._id === id ? { ...p, status: 'published' } : p);
      setPosts(updatedPosts);
      const removed = updatedPosts.filter(p => p.status === 'removed');
      setRemovedPosts(removed);
    } catch (err) {
      setError('Failed to restore post');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/messages/admin/${id}/status`, { status });
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, status } : msg
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await API.delete(`/messages/admin/${id}`);
      setMessages(messages.filter(msg => msg._id !== id));
      if (selectedMessage?._id === id) setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    
    setSendingReply(true);
    try {
      await API.put(`/messages/admin/${id}/reply`, { replyMessage: replyText });
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, status: 'replied', replyMessage: replyText, repliedAt: new Date() } : msg
      ));
      setReplyText('');
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter(msg => {
    if (messageFilter === 'all') return true;
    return msg.status === messageFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#9e9e9e';
      case 'published': return '#2196F3';
      case 'removed': return '#f44336';
      case 'unread': return '#ff9800';
      case 'read': return '#2196F3';
      case 'replied': return '#4CAF50';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            {!sidebarCollapsed && <span>AdminPanel</span>}
          </div>
          <button 
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className={styles.navIcon}>📊</span>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className={styles.navIcon}>👥</span>
            {!sidebarCollapsed && <span>Members</span>}
            {!sidebarCollapsed && (
              <span className={styles.navBadge}>{users.length}</span>
            )}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <span className={styles.navIcon}>📝</span>
            {!sidebarCollapsed && <span>All Posts</span>}
            {!sidebarCollapsed && (
              <span className={styles.navBadge}>{posts.length}</span>
            )}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'removed' ? styles.active : ''}`}
            onClick={() => setActiveTab('removed')}
          >
            <span className={styles.navIcon}>🗑️</span>
            {!sidebarCollapsed && <span>Removed</span>}
            {!sidebarCollapsed && removedPosts.length > 0 && (
              <span className={`${styles.navBadge} ${styles.warningBadge}`}>
                {removedPosts.length}
              </span>
            )}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'messages' ? styles.active : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span className={styles.navIcon}>📧</span>
            {!sidebarCollapsed && <span>Messages</span>}
            {!sidebarCollapsed && analytics.unreadMessages > 0 && (
              <span className={`${styles.navBadge} ${styles.unreadBadge}`}>
                {analytics.unreadMessages}
              </span>
            )}
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span className={styles.userAvatar}>👑</span>
            {!sidebarCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>Administrator</span>
                <span className={styles.userRole}>Super Admin</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.contentHeader}>
          <h1 className={styles.pageTitle}>
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'users' && 'Member Management'}
            {activeTab === 'posts' && 'Post Management'}
            {activeTab === 'removed' && 'Removed Content'}
            {activeTab === 'messages' && 'Message Center'}
          </h1>
          <div className={styles.headerActions}>
            <button className={styles.refreshBtn} onClick={fetchData}>
              🔄 Refresh
            </button>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className={styles.dashboardContent}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Members</span>
                  <span className={styles.statValue}>{analytics.totalUsers}</span>
                </div>
                <div className={styles.statTrend}>
                  <span className={styles.trendUp}>↑ {analytics.activeUsers} active</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>📝</div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Posts</span>
                  <span className={styles.statValue}>{analytics.totalPosts}</span>
                </div>
                <div className={styles.statTrend}>
                  <span className={styles.trendUp}>📄 {analytics.publishedPosts} published</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🗑️</div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Removed Posts</span>
                  <span className={styles.statValue}>{removedPosts.length}</span>
                </div>
                <div className={styles.statTrend}>
                  <span className={styles.trendDown}>⚠️ Needs attention</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>📧</div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Messages</span>
                  <span className={styles.statValue}>{analytics.totalMessages}</span>
                </div>
                <div className={styles.statTrend}>
                  <span className={styles.trendUp}>📫 {analytics.unreadMessages} unread</span>
                </div>
              </div>
            </div>

            <div className={styles.quickActions}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionGrid}>
                <button className={styles.actionCard} onClick={() => setActiveTab('users')}>
                  <span className={styles.actionIcon}>👥</span>
                  <span className={styles.actionText}>Manage Members</span>
                </button>
                <button className={styles.actionCard} onClick={() => setActiveTab('posts')}>
                  <span className={styles.actionIcon}>📝</span>
                  <span className={styles.actionText}>View All Posts</span>
                </button>
                <button className={styles.actionCard} onClick={() => setActiveTab('removed')}>
                  <span className={styles.actionIcon}>🗑️</span>
                  <span className={styles.actionText}>Check Removed</span>
                </button>
                <button className={styles.actionCard} onClick={() => setActiveTab('messages')}>
                  <span className={styles.actionIcon}>📧</span>
                  <span className={styles.actionText}>Read Messages</span>
                </button>
              </div>
            </div>

            <div className={styles.recentActivity}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              <div className={styles.activityList}>
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <span className={styles.activityIcon}>
                      {activity.type === 'user' && '👤'}
                      {activity.type === 'post' && '📄'}
                      {activity.type === 'message' && '💬'}
                    </span>
                    <div className={styles.activityDetails}>
                      <span className={styles.activityText}>
                        {activity.type === 'user' && `New member joined: ${activity.data.name}`}
                        {activity.type === 'post' && `New post created: ${activity.data.title}`}
                        {activity.type === 'message' && `New message from: ${activity.data.name}`}
                      </span>
                      <span className={styles.activityTime}>{formatDate(activity.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={styles.tabContent}>
            <div className={styles.contentHeader}>
              <input
                type="text"
                placeholder="Search members..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className={styles.resultCount}>{filteredUsers.length} members found</span>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td className={styles.userCell}>
                          <div className={styles.userAvatar}>{user.name?.charAt(0)}</div>
                          <span className={styles.userName}>{user.name}</span>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(user.status) }}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleStatus(user._id)}
                            className={`${styles.actionBtn} ${user.status === 'active' ? styles.warningBtn : styles.successBtn}`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
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
          </div>
        )}

        {/* Posts Tab - WITH SAME TAB NAVIGATION */}
        {activeTab === 'posts' && (
          <div className={styles.tabContent}>
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
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
                        <td className={styles.postTitleCell}>{post.title}</td>
                        <td>{post.author?.name || 'Unknown'}</td>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(post.status) }}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              onClick={() => {
                                console.log('🔍 Opening post with ID:', post._id);
                                console.log('📝 Post title:', post.title);
                                console.log('🔗 URL:', `/posts/${post._id}`);
                                // Open in same tab
                                window.location.href = `/posts/${post._id}`;
                              }}
                              className={`${styles.actionBtn} ${styles.infoBtn}`}
                              title="View post"
                            >
                              👁️ View
                            </button>
                            {post.status === 'published' && (
                              <button
                                onClick={() => removePost(post._id)}
                                className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                title="Remove post"
                              >
                                🗑️ Remove
                              </button>
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
          </div>
        )}

        {/* Removed Posts Tab */}
        {activeTab === 'removed' && (
          <div className={styles.tabContent}>
            <div className={styles.tableContainer}>
              {removedPosts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No removed posts found</p>
                </div>
              ) : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Removed Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {removedPosts.map(post => (
                      <tr key={post._id}>
                        <td className={styles.postTitleCell}>{post.title}</td>
                        <td>{post.author?.name || 'Unknown'}</td>
                        <td>{formatDate(post.updatedAt)}</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              onClick={() => window.open(`/deleted-post/${post._id}`, '_blank')}
                              className={`${styles.actionBtn} ${styles.infoBtn}`}
                              title="View deleted post"
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => restorePost(post._id)}
                              className={`${styles.actionBtn} ${styles.successBtn}`}
                              title="Restore post"
                            >
                              ↩️ Restore
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className={styles.tabContent}>
            {selectedMessage ? (
              <div className={styles.messageDetail}>
                <button 
                  className={styles.backBtn}
                  onClick={() => setSelectedMessage(null)}
                >
                  ← Back
                </button>
                
                <div className={styles.messageCard}>
                  <div className={styles.messageHeader}>
                    <h3>{selectedMessage.subject}</h3>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(selectedMessage.status) }}
                    >
                      {selectedMessage.status}
                    </span>
                  </div>
                  
                  <div className={styles.messageMeta}>
                    <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                    <p><strong>Received:</strong> {formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  
                  <div className={styles.messageBody}>
                    <p>{selectedMessage.message}</p>
                  </div>
                  
                  {selectedMessage.replyMessage && (
                    <div className={styles.replySection}>
                      <h4>Your Reply:</h4>
                      <div className={styles.replyMessage}>
                        <p>{selectedMessage.replyMessage}</p>
                        <small>{formatDate(selectedMessage.repliedAt)}</small>
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.messageActions}>
                    <div className={styles.statusButtons}>
                      <button
                        className={`${styles.statusBtn} ${selectedMessage.status === 'unread' ? styles.active : ''}`}
                        onClick={() => handleStatusChange(selectedMessage._id, 'unread')}
                      >
                        Unread
                      </button>
                      <button
                        className={`${styles.statusBtn} ${selectedMessage.status === 'read' ? styles.active : ''}`}
                        onClick={() => handleStatusChange(selectedMessage._id, 'read')}
                      >
                        Read
                      </button>
                      <button
                        className={`${styles.statusBtn} ${selectedMessage.status === 'replied' ? styles.active : ''}`}
                        onClick={() => handleStatusChange(selectedMessage._id, 'replied')}
                      >
                        Replied
                      </button>
                    </div>
                    
                    <button
                      className={`${styles.actionBtn} ${styles.dangerBtn}`}
                      onClick={() => handleDeleteMessage(selectedMessage._id)}
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className={styles.replyForm}>
                    <h4>Reply to this message:</h4>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                    />
                    <button
                      className={styles.sendReplyBtn}
                      onClick={() => handleReply(selectedMessage._id)}
                      disabled={sendingReply || !replyText.trim()}
                    >
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.contentHeader}>
                  <div className={styles.filterGroup}>
                    <button
                      className={`${styles.filterBtn} ${messageFilter === 'all' ? styles.active : ''}`}
                      onClick={() => setMessageFilter('all')}
                    >
                      All ({messages.length})
                    </button>
                    <button
                      className={`${styles.filterBtn} ${messageFilter === 'unread' ? styles.active : ''}`}
                      onClick={() => setMessageFilter('unread')}
                    >
                      Unread ({messages.filter(m => m.status === 'unread').length})
                    </button>
                    <button
                      className={`${styles.filterBtn} ${messageFilter === 'read' ? styles.active : ''}`}
                      onClick={() => setMessageFilter('read')}
                    >
                      Read ({messages.filter(m => m.status === 'read').length})
                    </button>
                    <button
                      className={`${styles.filterBtn} ${messageFilter === 'replied' ? styles.active : ''}`}
                      onClick={() => setMessageFilter('replied')}
                    >
                      Replied ({messages.filter(m => m.status === 'replied').length})
                    </button>
                  </div>
                </div>

                <div className={styles.messageGrid}>
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map(message => (
                      <div
                        key={message._id}
                        className={`${styles.messageCard} ${styles[message.status]}`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className={styles.messageCardHeader}>
                          <span 
                            className={styles.messageStatusDot}
                            style={{ backgroundColor: getStatusColor(message.status) }}
                          ></span>
                          <span className={styles.messageDate}>{formatDate(message.createdAt)}</span>
                        </div>
                        <h4 className={styles.messageSubject}>{message.subject}</h4>
                        <p className={styles.messagePreview}>
                          {message.message.substring(0, 100)}...
                        </p>
                        <div className={styles.messageSender}>
                          From: {message.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No messages found</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;