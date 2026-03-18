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
    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await API.get('/posts');
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
            {/* Hero Section with Photo */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroLeft}>
                        <p className={styles.heroTagline}>DANCE PORTFOLIO</p>
                        <h1 className={styles.heroTitle}>
                            My Dance<br />
                            Journey
                        </h1>
                        <p className={styles.heroDescription}>
                            Join me as I share my passion for dance through stories, tutorials, and performances. 
                            From beginner steps to advanced techniques, explore the world of movement.
                        </p>
                        <div className={styles.heroButtons}>
                            {/* REMOVED: Read Stories button */}
                            <Link to="/about" className={styles.secondaryButton}>
                                About Me →
                            </Link>
                        </div>
                        <div className={styles.heroStats}>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>{posts.length}+</span>
                                <span className={styles.statLabel}>DANCE STORIES</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>10+</span>
                                <span className={styles.statLabel}>TUTORIALS</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>5+</span>
                                <span className={styles.statLabel}>YEARS DANCING</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.heroRight}>
                        <div className={styles.photoFrame}>
                            <img 
                                src={adminPhoto} 
                                alt="Donato G. Ureta Jr." 
                                className={styles.heroPhoto}
                            />
                            <div className={styles.photoBadge}>
                                <span>💃</span> Dancer
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Posts Section */}
            <section className={styles.blogSection}>
                <div className={styles.blogHeader}>
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
                                    {post.image ? (
                                        <img
                                            src={`http://localhost:5000/uploads/${post.image}`}
                                            alt={post.title}
                                            className={styles.postImage}
                                        />
                                    ) : (
                                        <div className={styles.postImagePlaceholder}>
                                            <span>💃</span>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.postContent}>
                                    <div className={styles.postMeta}>
                                        <span className={styles.postCategory}>DANCE STORY</span>
                                        <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
                                    </div>
                                    <h3 className={styles.postTitle}>
                                        <Link to={`/posts/${post._id}`}>{post.title}</Link>
                                    </h3>
                                    <p className={styles.postExcerpt}>
                                        {post.body.substring(0, 100)}
                                        {post.body.length > 100 && '...'}
                                    </p>
                                    <div className={styles.postFooter}>
                                        <div className={styles.postAuthor}>
                                            <div className={styles.authorAvatar}>
                                                {post.author?.profilePic ? (
                                                    <img 
                                                        src={`http://localhost:5000/uploads/${post.author.profilePic}`}
                                                        alt={post.author.name}
                                                    />
                                                ) : (
                                                    getAuthorInitial(post.author?.name)
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
            </section>

            {/* Newsletter Signup Section */}
            <section className={styles.signupSection}>
                <div className={styles.signupContent}>
                    <h2 className={styles.signupTitle}>
                        Join the <span>Dance Community</span>
                    </h2>
                    <p className={styles.signupDescription}>
                        Get weekly dance tips, behind-the-scenes content, and 
                        exclusive stories delivered to your inbox.
                    </p>
                    <form className={styles.signupForm}>
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
            </section>
        </div>
    );
};

export default HomePage;