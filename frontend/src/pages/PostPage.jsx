// frontend/src/pages/PostPage.js

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import styles from '../styles/PostPage.module.css';

const PostPage = () => {
  const { id } = useParams(); // Get post ID from URL
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      console.log('Fetching post with ID:', id);
      const { data } = await API.get(`/posts/${id}`);
      console.log('Post data:', data);
      setPost(data);
      setError('');
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/comments/${id}`);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      // Don't show error for comments, just set empty array
      setComments([]);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!commentBody.trim()) return;

    try {
      setSubmittingComment(true);
      const { data } = await API.post(`/comments/${id}`, { body: commentBody });
      setComments([data, ...comments]); // Add new comment to top
      setCommentBody('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await API.delete(`/posts/${id}`);
      navigate('/home');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  // Check if current user can edit/delete post
  const canModifyPost = () => {
    if (!user || !post) return false;
    return user.role === 'admin' || post.author?._id === user._id;
  };

  // Check if current user can delete comment
  const canDeleteComment = (comment) => {
    if (!user || !comment) return false;
    return user.role === 'admin' || comment.author?._id === user._id;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.errorContainer}>
        <h2>❌ Oops!</h2>
        <p>{error || 'Post not found'}</p>
        <Link to="/home" className={styles.backButton}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.postPage}>
      <article className={styles.postCard}>
        {/* Post Header */}
        <div className={styles.postHeader}>
          <h1 className={styles.postTitle}>{post.title}</h1>
          
          <div className={styles.postMeta}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>
                {post.author?.profilePic ? (
                  <img 
                    src={`http://localhost:5000/uploads/${post.author.profilePic}`}
                    alt={post.author.name}
                  />
                ) : (
                  <span>{post.author?.name?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
              <div>
                <span className={styles.authorName}>{post.author?.name || 'Unknown'}</span>
                <span className={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {canModifyPost() && (
              <div className={styles.postActions}>
                <button 
                  onClick={() => navigate(`/edit-post/${post._id}`)}
                  className={styles.editButton}
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={handleDeletePost}
                  className={styles.deleteButton}
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className={styles.postImageContainer}>
            <img 
              src={`http://localhost:5000/uploads/${post.image}`}
              alt={post.title}
              className={styles.postImage}
            />
          </div>
        )}

        {/* Post Content */}
        <div className={styles.postContent}>
          {post.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {/* Comments Section */}
      <section className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>
          💬 Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea
              placeholder="Write a comment..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
              required
            />
            <button 
              type="submit" 
              disabled={submittingComment || !commentBody.trim()}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className={styles.loginPrompt}>
            <Link to="/login">Login</Link> to leave a comment
          </p>
        )}

        {/* Comments List */}
        <div className={styles.commentsList}>
          {comments.length === 0 ? (
            <p className={styles.noComments}>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className={styles.commentCard}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAuthor}>
                    <div className={styles.commentAvatar}>
                      {comment.author?.profilePic ? (
                        <img 
                          src={`http://localhost:5000/uploads/${comment.author.profilePic}`}
                          alt={comment.author.name}
                        />
                      ) : (
                        <span>{comment.author?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <span className={styles.commentAuthorName}>
                        {comment.author?.name || 'Unknown'}
                      </span>
                      <span className={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {canDeleteComment(comment) && (
                    <button 
                      onClick={() => handleDeleteComment(comment._id)}
                      className={styles.deleteCommentButton}
                      title="Delete comment"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <p className={styles.commentBody}>{comment.body}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PostPage;