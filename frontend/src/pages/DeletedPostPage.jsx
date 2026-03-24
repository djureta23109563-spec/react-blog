// frontend/src/pages/DeletedPostPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import styles from '../styles/DeletedPostPage.module.css';

const DeletedPostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeletedPost();
    }
  }, [id]);

  const fetchDeletedPost = async () => {
    try {
      setLoading(true);
      console.log('Fetching deleted post with ID:', id);
      const { data } = await API.get(`/deleted-posts/${id}`);
      console.log('Deleted post data:', data);
      setPost(data);
      setError('');
    } catch (err) {
      console.error('Error fetching deleted post:', err);
      setError(err.response?.data?.message || 'Failed to load deleted post');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Are you sure you want to restore this post?')) return;
    
    setRestoring(true);
    try {
      await API.put(`/deleted-posts/${id}/restore`);
      alert('Post restored successfully!');
      navigate('/admin?tab=removed');
    } catch (err) {
      console.error('Error restoring post:', err);
      alert('Failed to restore post');
    } finally {
      setRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete the post. This action cannot be undone!')) return;
    
    if (!window.confirm('Are you absolutely sure? This post will be gone forever!')) return;
    
    try {
      await API.delete(`/deleted-posts/${id}`);
      alert('Post permanently deleted');
      navigate('/admin?tab=removed');
    } catch (err) {
      console.error('Error permanently deleting post:', err);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading deleted post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>❌ Post Not Found</h2>
          <p>{error || 'The deleted post could not be found'}</p>
          <Link to="/admin" className={styles.backButton}>
            ← Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link to="/admin?tab=removed" className={styles.backLink}>
            ← Back to Removed Posts
          </Link>
          <div className={styles.warningBadge}>⚠️ DELETED POST</div>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <div className={styles.author}>
            <span className={styles.authorLabel}>Author:</span>
            <span className={styles.authorName}>{post.author?.name || 'Unknown'}</span>
            {post.author?.email && (
              <span className={styles.authorEmail}>({post.author.email})</span>
            )}
          </div>
          <div className={styles.dates}>
            <div>Created: {new Date(post.createdAt).toLocaleString()}</div>
            <div>Removed: {new Date(post.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {post.image && (
        <div className={styles.imageContainer}>
          <img 
            src={`http://localhost:5000/uploads/${post.image}`}
            alt={post.title}
            className={styles.image}
          />
        </div>
      )}

      <div className={styles.content}>
        {post.body.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className={styles.actions}>
        <button 
          onClick={handleRestore} 
          className={styles.restoreButton}
          disabled={restoring}
        >
          {restoring ? 'Restoring...' : '↩️ Restore Post'}
        </button>
        <button 
          onClick={handlePermanentDelete} 
          className={styles.deleteButton}
        >
          🗑️ Permanently Delete
        </button>
      </div>
    </div>
  );
};

export default DeletedPostPage;