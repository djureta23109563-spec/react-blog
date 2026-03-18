// frontend/src/pages/CreatePostPage.js

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import styles from '../styles/CreatePostPage.module.css';

const CreatePostPage = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        document.getElementById('imageInput').value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const fd = new FormData();
        fd.append('title', title);
        fd.append('body', body);
        if (image) fd.append('image', image);

        try {
            const { data } = await API.post('/posts', fd);
            setSuccess('Post published successfully! Redirecting...');
            setTimeout(() => {
                navigate(`/posts/${data._id}`);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish post');
            setLoading(false);
        }
    };

    return (
        <div className={styles.createPostPage}>
            <div className={styles.header}>
                <h2>
                    <span>Write</span> a New Post
                </h2>
                <p className={styles.subtitle}>Share your dance journey with the community</p>
            </div>

            {error && (
                <div className={styles.errorMsg}>
                    <span>❌</span>
                    {error}
                </div>
            )}

            {success && (
                <div className={styles.successMsg}>
                    <span>✅</span>
                    {success}
                </div>
            )}

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <span className={styles.labelIcon}>📝</span>
                            Post Title
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter an engaging title..."
                            required
                            maxLength={100}
                        />
                        <div className={styles.charCount}>
                            <span>{title.length}</span>/100
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <span className={styles.labelIcon}>✍️</span>
                            Content
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your post content here... Share your dance story, tips, or experiences..."
                            rows={12}
                            required
                        />
                        <div className={styles.charCount}>
                            <span>{body.length}</span> characters
                        </div>
                    </div>

                    {user?.role === 'admin' && (
                        <div className={styles.imageUploadSection}>
                            <div className={styles.imageUploadHeader}>
                                <h4>
                                    <span className={styles.labelIcon}>🖼️</span>
                                    Cover Image
                                </h4>
                                <span className={styles.adminBadge}>Admin Only</span>
                            </div>
                            
                            <div className={styles.fileInputWrapper}>
                                <input
                                    id="imageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={styles.fileInput}
                                />
                            </div>

                            {imagePreview && (
                                <div className={styles.imagePreview}>
                                    <img src={imagePreview} alt="Preview" />
                                    <button 
                                        type="button" 
                                        onClick={removeImage}
                                        className={styles.removeImage}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            
                            <small className={styles.fileHint}>
                                Recommended: 1200×630px · Max 5MB
                            </small>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={styles.publishButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Publishing...
                            </>
                        ) : (
                            <>
                                <span className={styles.buttonIcon}>💃</span>
                                Publish Post
                                <span className={styles.buttonIcon}>🕺</span>
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.tipsSection}>
                    <div className={styles.tipsTitle}>
                        <span>💡</span> Writing Tips
                    </div>
                    <ul className={styles.tipsList}>
                        <li>Use a catchy title</li>
                        <li>Break text into paragraphs</li>
                        <li>Add images for engagement</li>
                        <li>Proofread before publishing</li>
                        <li>Be authentic and original</li>
                        <li>Share your dance story</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;