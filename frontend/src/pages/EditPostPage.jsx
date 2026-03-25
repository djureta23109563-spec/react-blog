// frontend/src/pages/EditPostPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/EditPostPage.module.css";
import api from "../api/axios";

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Add this!
  const [post, setPost] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (id) {
      console.log("Fetching post with ID:", id);
      fetchPost();
    } else {
      setError("No post ID provided");
      setLoading(false);
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      console.log("Fetching post with ID:", id);
      const res = await api.get(`/posts/${id}`);
      console.log("Post data:", res.data);
      setPost(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching post:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 404) {
        setError("Post not found. It may have been deleted.");
      } else {
        setError(err.response?.data?.message || "Failed to load post. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      console.log("Updating post with ID:", id);
      console.log("Update data:", post);
      
      const response = await api.put(`/posts/${id}`, post);
      console.log("Update response:", response.data);
      
      setMessage({ 
        text: "Post updated successfully! ✨", 
        type: "success" 
      });
      
      setTimeout(() => {
        navigate(`/posts/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Error updating post:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        setMessage({ 
          text: "You need to login again. Redirecting...", 
          type: "error" 
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        setMessage({ 
          text: "You don't have permission to edit this post.", 
          type: "error" 
        });
      } else {
        setMessage({ 
          text: err.response?.data?.message || "Failed to update post.", 
          type: "error" 
        });
      }
      setSaving(false);
    }
  };

  // ✅ Add permission check
  const canEdit = () => {
    if (!user || !post) return false;
    return user.role === 'admin' || post.author?._id === user._id;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>❌ {error}</p>
          <button onClick={fetchPost}>Try Again</button>
        </div>
      </div>
    );
  }

  // ✅ Show permission error if user can't edit
  if (!canEdit()) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>❌ You don't have permission to edit this post.</p>
          <button onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>
            <span>Edit</span> Post
          </h1>
          <p className={styles.subtitle}>Refine your dance story</p>
        </div>

        <div className={styles.formCard}>
          <form className={styles.postForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>📝</span>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={post.title}
                onChange={handleChange}
                required
                className={styles.input}
                maxLength={100}
              />
              <div className={styles.charCount}>
                <span>{post.title.length}</span>/100
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>📄</span>
                Content
              </label>
              <textarea
                name="body"
                value={post.body}
                onChange={handleChange}
                required
                className={styles.textarea}
                rows={12}
              />
              <div className={styles.charCount}>
                <span>{post.body.length}</span> characters
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.button}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className={styles.spinner}></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <span className={styles.buttonIcon}>💃</span>
                  Save Changes
                  <span className={styles.buttonIcon}>🕺</span>
                </>
              )}
            </button>
          </form>
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === "success" ? "✅" : "❌"} {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default EditPostPage;