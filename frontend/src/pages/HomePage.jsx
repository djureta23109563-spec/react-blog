// frontend/src/pages/HomePage.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import styles from '../styles/HomePage.module.css';

// Import your photo
import adminPhoto from '../assets/me.jpg';

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageErrors, setImageErrors] = useState({});
    const { user } = useAuth();

    // Backend URL from environment or hardcoded
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://react-blog-7yna.onrender.com';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await API.get('/posts');
            console.log('Fetched posts:', res.data);
            setPosts(res.data);
            setError('');
        } catch (err) {
            setError('Failed to load posts. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getAuthorInitial = (name) => {
        return name?.charAt(0).toUpperCase() || 'U';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper function to get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // If it's already a full URL (Cloudinary)
        if (imagePath.startsWith('http')) return imagePath;
        // If it's a local file path
        if (imagePath.startsWith('/uploads')) return `${BACKEND_URL}${imagePath}`;
        // Default: assume it's a filename in uploads folder
        return `${BACKEND_URL}/uploads/${imagePath}`;
    };

    const handleImageError = (postId) => {
        setImageErrors(prev => ({ ...prev, [postId]: true }));
        console.log(`Image failed to load for post: ${postId}`);
    };

    if (loading) {
        return (
            <div className={styles.homePage}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading dance stories...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.homePage}>
                <div className={styles.errorContainer}>
                    <p>❌ {error}</p>
                    <button onClick={fetchPosts} className={styles.retryButton}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.homePage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.heroGrid}>
                        <div className={styles.heroContent}>
                            <p className={styles.heroTagline}>DANCE PORTFOLIO</p>
                            <h1 className={styles.heroTitle}>
                                My Dance Journey
                            </h1>
                            <p className={styles.heroDescription}>
                                Join me as I share my passion for dance through stories, tutorials, and performances. 
                                From beginner steps to advanced techniques, explore the world of movement.
                            </p>
                            <div className={styles.heroButtons}>
                                <Link to="/about" className={styles.secondaryButton}>
                                    About Me →
                                </Link>
                            </div>
                        </div>
                        
                        <div className={styles.heroImageWrapper}>
                            <div className={styles.photoFrame}>
                                <img 
                                    src={adminPhoto} 
                                    alt="Donato G. Ureta Jr." 
                                    className={styles.heroPhoto}
                                />
                            </div>
                            <div className={styles.photoBadge}>
                                <span>💃</span> Dancer
                            </div>
                        </div>
                    </div>

                    <div className={styles.heroStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>{posts.length}+</span>
                            <span className={styles.statLabel}>DANCE STORIES</span>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>10+</span>
                            <span className={styles.statLabel}>TUTORIALS</span>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>5+</span>
                            <span className={styles.statLabel}>YEARS DANCING</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Posts Section */}
            <section className={styles.blogSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <p className={styles.blogTagline}>FROM THE DANCE FLOOR</p>
                        <h2 className={styles.blogTitle}>Recent Stories</h2>
                        <p className={styles.blogSubtitle}>
                            Discover insights, experiences, and inspiration from my dance journey
                        </p>
                    </div>

                    {posts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}>💃</div>
                            <p>No dance stories yet. Be the first to share!</p>
                            {user ? (
                                <Link to="/create-post" className={styles.createFirstButton}>
                                    Share Your Story
                                </Link>
                            ) : (
                                <Link to="/login" className={styles.createFirstButton}>
                                    Login to Share
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className={styles.postsGrid}>
                            {posts.map((post) => (
                                <article key={post._id} className={styles.postCard}>
                                    <div className={styles.postImageWrapper}>
                                        {post.image && !imageErrors[post._id] ? (
                                            <img
                                                src={getImageUrl(post.image)}
                                                alt={post.title}
                                                className={styles.postImage}
                                                onError={() => handleImageError(post._id)}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className={styles.postImagePlaceholder}>
                                                <span>💃</span>
                                            </div>
                                        )}
                                        <div className={styles.postCategory}>
                                            DANCE STORY
                                        </div>
                                    </div>
                                    <div className={styles.postContent}>
                                        <div className={styles.postMeta}>
                                            <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
                                        </div>
                                        <h3 className={styles.postTitle}>
                                            <Link to={`/posts/${post._id}`}>{post.title}</Link>
                                        </h3>
                                        <p className={styles.postExcerpt}>
                                            {post.body?.substring(0, 100) || ''}
                                            {post.body?.length > 100 && '...'}
                                        </p>
                                        <div className={styles.postFooter}>
                                            <div className={styles.postAuthor}>
                                                <div className={styles.authorAvatar}>
                                                    {post.author?.profilePic ? (
                                                        <img 
                                                            src={`${BACKEND_URL}/uploads/${post.author.profilePic}`}
                                                            alt={post.author.name}
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <span>{getAuthorInitial(post.author?.name)}</span>
                                                    )}
                                                </div>
                                                <span className={styles.authorName}>
                                                    {post.author?.name || 'Dancer'}
                                                </span>
                                            </div>
                                            <Link 
                                                to={`/posts/${post._id}`} 
                                                className={styles.readMoreLink}
                                            >
                                                Read full story →
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Signup Section */}
            <section className={styles.signupSection}>
                <div className={styles.container}>
                    <div className={styles.signupGrid}>
                        <div className={styles.signupContent}>
                            <h2 className={styles.signupTitle}>
                                Join the Dance Community
                            </h2>
                            <p className={styles.signupDescription}>
                                Get weekly dance tips, behind-the-scenes content, and 
                                exclusive stories delivered to your inbox.
                            </p>
                        </div>
                        <div className={styles.signupFormWrapper}>
                            <form className={styles.signupForm} onSubmit={(e) => e.preventDefault()}>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className={styles.signupInput}
                                />
                                <button type="submit" className={styles.signupButton}>
                                    Subscribe
                                </button>
                            </form>
                            <p className={styles.signupNote}>
                                No spam, just dance. Unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;