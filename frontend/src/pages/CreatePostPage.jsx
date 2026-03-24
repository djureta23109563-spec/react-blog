// frontend/src/pages/CreatePostPage.js

import { useState, useEffect } from 'react';
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
    const [wordCount, setWordCount] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [category, setCategory] = useState('dance-story');

    const { user } = useAuth();
    const navigate = useNavigate();

    // Calculate word count and reading time
    useEffect(() => {
        const words = body.trim().split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(words);
        const minutes = Math.ceil(words / 200);
        setReadingTime(minutes);
    }, [body]);

    // Auto-save draft
    useEffect(() => {
        if (title || body) {
            const draft = { title, body, imagePreview, tags, category };
            localStorage.setItem('postDraft', JSON.stringify(draft));
        }
    }, [title, body, imagePreview, tags, category]);

    // Load draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('postDraft');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (window.confirm('You have an unsaved draft. Do you want to restore it?')) {
                setTitle(draft.title || '');
                setBody(draft.body || '');
                setImagePreview(draft.imagePreview || null);
                setTags(draft.tags || []);
                setCategory(draft.category || 'dance-story');
            }
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, PNG, GIF, and WEBP images are allowed');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        document.getElementById('imageInput').value = '';
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (tags.length < 5) {
                setTags([...tags, tagInput.trim().toLowerCase()]);
                setTagInput('');
            } else {
                setError('Maximum 5 tags allowed');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const clearDraft = () => {
        localStorage.removeItem('postDraft');
        setTitle('');
        setBody('');
        setImagePreview(null);
        setTags([]);
        setCategory('dance-story');
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
        fd.append('category', category);
        fd.append('tags', tags.join(','));

        try {
            const { data } = await API.post('/posts', fd);
            localStorage.removeItem('postDraft');
            setSuccess('Post published successfully! Redirecting...');
            setTimeout(() => {
                navigate(`/posts/${data._id}`);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish post');
            setLoading(false);
        }
    };

    const canUploadImage = user && (user.role === 'admin' || user.role === 'member');

    return (
        <div className={styles.createPostPage}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>
                        Write a <span>New Post</span>
                    </h1>
                    <p className={styles.subtitle}>Share your dance journey with the community</p>
                    <div className={styles.headerLine}></div>
                </div>

                {/* Stats Bar */}
                <div className={styles.statsBar}>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>📝</span>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{wordCount}</span>
                            <span className={styles.statLabel}>words</span>
                        </div>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>⏱️</span>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{readingTime}</span>
                            <span className={styles.statLabel}>min read</span>
                        </div>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>🏷️</span>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{tags.length}</span>
                            <span className={styles.statLabel}>tags</span>
                        </div>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>💾</span>
                        <div className={styles.statInfo}>
                            <button 
                                type="button" 
                                onClick={clearDraft}
                                className={styles.clearDraftBtn}
                                title="Clear saved draft"
                            >
                                Clear Draft
                            </button>
                        </div>
                    </div>
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

                {/* Main Content Grid */}
                <div className={styles.contentGrid}>
                    {/* Left Column - Form */}
                    <div className={styles.formColumn}>
                        <div className={styles.formCard}>
                            <form onSubmit={handleSubmit}>
                                {/* Title */}
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

                                {/* Category Selector */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span className={styles.labelIcon}>📂</span>
                                        Category
                                    </label>
                                    <select 
                                        className={styles.select}
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="dance-story">Dance Story</option>
                                        <option value="tutorial">Tutorial</option>
                                        <option value="tips">Tips & Advice</option>
                                        <option value="inspiration">Inspiration</option>
                                        <option value="performance">Performance</option>
                                    </select>
                                </div>

                                {/* Content */}
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

                                {/* Tags */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span className={styles.labelIcon}>🏷️</span>
                                        Tags (max 5)
                                    </label>
                                    <div className={styles.tagsInputWrapper}>
                                        <input
                                            type="text"
                                            className={styles.tagInput}
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            placeholder="Type tag and press Enter"
                                            disabled={tags.length >= 5}
                                        />
                                        <div className={styles.tagsContainer}>
                                            {tags.map((tag, index) => (
                                                <span key={index} className={styles.tag}>
                                                    #{tag}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeTag(tag)}
                                                        className={styles.removeTag}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                {canUploadImage && (
                                    <div className={styles.imageUploadSection}>
                                        <div className={styles.imageUploadHeader}>
                                            <h4>
                                                <span className={styles.labelIcon}>🖼️</span>
                                                Cover Image
                                            </h4>
                                            <span className={styles.badge}>
                                                {user?.role === 'admin' ? 'Admin' : 'Member'}
                                            </span>
                                        </div>
                                        
                                        <div className={styles.fileInputWrapper}>
                                            <input
                                                id="imageInput"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className={styles.fileInput}
                                            />
                                            <label htmlFor="imageInput" className={styles.fileInputLabel}>
                                                Choose Image
                                            </label>
                                            <span className={styles.fileName}>
                                                {image ? image.name : 'No file chosen'}
                                            </span>
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
                                        
                                        <div className={styles.imageRequirements}>
                                            <small>📷 Recommended: 1200×630px · Max 5MB</small>
                                            <small>✨ Supported: JPG, PNG, GIF, WEBP</small>
                                        </div>
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
                                            <span className={styles.buttonIcon}>🚀</span>
                                            Publish Post
                                            <span className={styles.buttonIcon}>✨</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Writing Tips */}
                    <div className={styles.tipsColumn}>
                        <div className={styles.tipsCard}>
                            <div className={styles.tipsHeader}>
                                <span>💡</span>
                                <h3>Writing Tips</h3>
                            </div>
                            <ul className={styles.tipsList}>
                                <li>Use a catchy title that grabs attention</li>
                                <li>Break long text into paragraphs</li>
                                <li>Add images to make your post engaging</li>
                                <li>Proofread before publishing</li>
                                <li>Add relevant tags for better discovery</li>
                                <li>Share your authentic dance story</li>
                            </ul>
                        </div>

                        {/* Preview Section - Optional */}
                        {imagePreview && (
                            <div className={styles.previewCard}>
                                <div className={styles.previewHeader}>
                                    <h3>Image Preview</h3>
                                </div>
                                <div className={styles.previewImage}>
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;