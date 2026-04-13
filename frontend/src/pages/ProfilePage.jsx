// frontend/src/pages/ProfilePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import styles from '../styles/ProfilePage.module.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [pic, setPic] = useState(null);
    const [picPreview, setPicPreview] = useState(null);
    const [curPw, setCurPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [updating, setUpdating] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [imageError, setImageError] = useState(false);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const response = await API.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(response.data);
            setName(response.data.name || '');
            setBio(response.data.bio || '');
            setImageError(false);
        } catch (err) {
            console.error('Error fetching user:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            setMsg({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const getProfileImageUrl = () => {
        if (!user) return null;
        if (picPreview) return picPreview;
        if (imageError) return null;
        
        if (user.profilePic) {
            if (user.profilePic.startsWith('http')) return user.profilePic;
            return `${BACKEND_URL}/uploads/${user.profilePic}`;
        }
        if (user.avatar) {
            if (user.avatar.startsWith('http')) return user.avatar;
            return `${BACKEND_URL}/uploads/${user.avatar}`;
        }
        return null;
    };

    const handleImageLoadError = () => {
        setImageError(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPic(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMsg({ type: 'error', text: 'Please select an image file' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMsg({ type: 'error', text: 'File size must be less than 5MB' });
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setUploadingAvatar(true);
        setMsg({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await API.post('/uploads/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setUser(prev => ({ 
                    ...prev, 
                    profilePic: response.data.user?.profilePic || response.data.avatarUrl,
                    avatar: response.data.user?.avatar || response.data.avatarUrl
                }));
                setImageError(false);
                setMsg({ type: 'success', text: 'Profile picture uploaded successfully! ✨' });
                e.target.value = '';
                await fetchUserData();
                window.dispatchEvent(new Event('userDataUpdated'));
            }
        } catch (err) {
            console.error('Avatar upload error:', err);
            setMsg({ 
                type: 'error', 
                text: err.response?.data?.error || 'Error uploading profile picture' 
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await API.delete('/uploads/avatar', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(prev => ({ ...prev, profilePic: '', avatar: '' }));
            setImageError(false);
            setMsg({ type: 'success', text: 'Profile picture removed successfully' });
            await fetchUserData();
            window.dispatchEvent(new Event('userDataUpdated'));
        } catch (err) {
            console.error('Avatar removal error:', err);
            setMsg({ type: 'error', text: 'Failed to remove profile picture' });
        } finally {
            setUpdating(false);
        }
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        setUpdating(true);
        
        const fd = new FormData();
        fd.append('name', name);
        fd.append('bio', bio);
        if (pic) {
            fd.append('profilePic', pic);
        }

        try {
            const token = localStorage.getItem('token');
            const { data } = await API.put('/auth/profile', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });
            
            setUser(prev => ({ ...prev, ...data.user, name: name, bio: bio }));
            setMsg({ type: 'success', text: 'Profile updated successfully! ✨' });
            setPicPreview(null);
            setPic(null);
            await fetchUserData();
            window.dispatchEvent(new Event('userDataUpdated'));
            
        } catch (err) {
            console.error('Profile update error:', err);
            setMsg({ 
                type: 'error', 
                text: err.response?.data?.message || 'Error updating profile' 
            });
        } finally {
            setUpdating(false);
        }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        setUpdating(true);
        
        try {
            const token = localStorage.getItem('token');
            await API.put('/auth/change-password', { 
                currentPassword: curPw, 
                newPassword: newPw 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg({ type: 'success', text: 'Password changed successfully! 🔐' });
            setCurPw('');
            setNewPw('');
        } catch (err) {
            console.error('Password change error:', err);
            setMsg({ 
                type: 'error', 
                text: err.response?.data?.message || 'Error changing password' 
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.loadingContainer}>
                <p>Please log in to view your profile.</p>
                <button onClick={() => navigate('/login')} className={styles.button}>
                    Go to Login
                </button>
            </div>
        );
    }

    const profileImageUrl = getProfileImageUrl();

    return (
        <div className={styles.profilePage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>My Profile</h1>
                    <p className={styles.subtitle}>Manage your account settings and profile information</p>
                </div>

                {msg.text && (
                    <div className={`${styles.alert} ${styles[msg.type]}`}>
                        <span>{msg.type === 'success' ? '✓' : '✗'}</span>
                        <span>{msg.text}</span>
                    </div>
                )}

                <div className={styles.profileLayout}>
                    {/* Sidebar */}
                    <div className={styles.sidebar}>
                        <div className={styles.profileCard}>
                            <div className={styles.avatarSection}>
                                <div className={styles.avatarWrapper}>
                                    {profileImageUrl ? (
                                        <img 
                                            src={profileImageUrl} 
                                            alt={user.name} 
                                            className={styles.avatar}
                                            onError={handleImageLoadError}
                                        />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                
                                <div className={styles.avatarActions}>
                                    <label htmlFor="avatarUpload" className={styles.avatarBtn}>
                                        📷 Upload
                                    </label>
                                    <input
                                        id="avatarUpload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                        style={{ display: 'none' }}
                                    />
                                    {(user.profilePic || user.avatar) && !imageError && (
                                        <button 
                                            onClick={handleRemoveAvatar}
                                            className={styles.removeAvatarBtn}
                                            disabled={updating}
                                        >
                                            🗑️ Remove
                                        </button>
                                    )}
                                </div>
                                <p className={styles.avatarHint}>JPG, PNG or GIF. Max 5MB</p>
                            </div>

                            <div className={styles.userInfo}>
                                <h2 className={styles.userName}>{user.name}</h2>
                                <p className={styles.userEmail}>{user.email}</p>
                                <div className={styles.userRole}>
                                    {user.role === 'admin' ? '👑 Administrator' : '👤 Member'}
                                </div>
                                {user.bio && (
                                    <div className={styles.userBio}>
                                        <p>{user.bio}</p>
                                    </div>
                                )}
                                <div className={styles.joinDate}>
                                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={styles.mainContent}>
                        <div className={styles.tabs}>
                            <button 
                                className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                ✏️ Edit Profile
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'password' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                🔒 Change Password
                            </button>
                        </div>

                        {activeTab === 'profile' && (
                            <div className={styles.formCard}>
                                <form onSubmit={handleProfile} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Display Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Bio</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell us about yourself..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Profile Picture (Optional)</label>
                                        <div className={styles.fileInputWrapper}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className={styles.fileInput}
                                                id="profilePicInput"
                                            />
                                            <label htmlFor="profilePicInput" className={styles.fileLabel}>
                                                Choose File
                                            </label>
                                            <span className={styles.fileName}>
                                                {pic ? pic.name : 'No file chosen'}
                                            </span>
                                        </div>
                                        {picPreview && (
                                            <div className={styles.previewImage}>
                                                <img src={picPreview} alt="Preview" />
                                            </div>
                                        )}
                                        <small className={styles.hint}>
                                            Square image recommended. Max 5MB
                                        </small>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={styles.submitBtn}
                                        disabled={updating}
                                    >
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className={styles.formCard}>
                                <form onSubmit={handlePassword} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Current Password</label>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            value={curPw}
                                            onChange={(e) => setCurPw(e.target.value)}
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>New Password</label>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            value={newPw}
                                            onChange={(e) => setNewPw(e.target.value)}
                                            placeholder="Enter new password (min 6 characters)"
                                            required
                                        />
                                        <small className={styles.hint}>
                                            Password must be at least 6 characters
                                        </small>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={styles.submitBtn}
                                        disabled={updating}
                                    >
                                        {updating ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;