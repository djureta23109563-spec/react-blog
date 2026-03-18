// frontend/src/pages/ProfilePage.js

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import styles from '../styles/ProfilePage.module.css';

const ProfilePage = () => {
    const { user, setUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [pic, setPic] = useState(null);
    const [picPreview, setPicPreview] = useState(null);
    const [curPw, setCurPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPic(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        setLoading(true);
        
        const fd = new FormData();
        fd.append('name', name);
        fd.append('bio', bio);
        if (pic) {
            fd.append('profilePic', pic);
            console.log('Uploading image:', pic.name);
        }

        try {
            console.log('Sending profile update...');
            const { data } = await API.put('/auth/profile', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Profile updated:', data);
            setUser(data);
            setMsg({ type: 'success', text: 'Profile updated successfully! ✨' });
            setPicPreview(null);
            setPic(null);
        } catch (err) {
            console.error('Profile update error:', err);
            console.error('Error response:', err.response?.data);
            setMsg({ 
                type: 'error', 
                text: err.response?.data?.message || 'Error updating profile' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        setLoading(true);
        
        try {
            await API.put('/auth/change-password', { 
                currentPassword: curPw, 
                newPassword: newPw 
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
            setLoading(false);
        }
    };

    const picSrc = user?.profilePic
        ? `http://localhost:5000/uploads/${user.profilePic}`
        : null;

    if (!user) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
            <div className={styles.header}>
                <h2>My Profile</h2>
                <p className={styles.subtitle}>Manage your personal information and account settings</p>
            </div>

            {msg.text && (
                <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
                    <span>{msg.type === 'success' ? '✅' : '❌'}</span>
                    {msg.text}
                </div>
            )}

            <div className={styles.profileGrid}>
                {/* Left Column - Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.avatarContainer}>
                        {picPreview ? (
                            <img src={picPreview} alt="Preview" className={styles.avatar} />
                        ) : picSrc ? (
                            <img src={picSrc} alt={user.name} className={styles.avatar} />
                        ) : (
                            <div className={styles.defaultAvatar}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label htmlFor="profilePicInput" className={styles.avatarOverlay} title="Change photo">
                            📷
                        </label>
                        <input
                            id="profilePicInput"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <h3 className={styles.profileName}>{user.name}</h3>
                    
                    <div className={styles.profileEmail}>
                        <span>📧</span> {user.email}
                    </div>
                    
                    <span className={`${styles.profileRole} ${user.role === 'admin' ? styles.admin : ''}`}>
                        {user.role === 'admin' ? '👑 Administrator' : '👤 Member'}
                    </span>

                    {user.bio && (
                        <div className={styles.profileBio}>
                            {user.bio}
                        </div>
                    )}

                    <div className={styles.statBadge}>
                        <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Right Column - Forms */}
                <div className={styles.formsContainer}>
                    {/* Edit Profile Form */}
                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <span className={styles.formIcon}>✏️</span>
                            <h3>Edit Profile</h3>
                        </div>

                        <form onSubmit={handleProfile}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Display Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Bio</label>
                                <textarea
                                    className={styles.textarea}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about your dance journey..."
                                    rows={4}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={styles.fileInput}
                                />
                                {picPreview && (
                                    <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                                        New image selected: {pic?.name}
                                    </small>
                                )}
                                <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                                    Square image recommended · Max 5MB
                                </small>
                            </div>

                            <button 
                                type="submit" 
                                className={styles.button}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <span className={styles.formIcon}>🔒</span>
                            <h3>Change Password</h3>
                        </div>

                        <form onSubmit={handlePassword}>
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
                                    placeholder="Enter new password (min 6 chars)"
                                    required
                                    minLength={6}
                                />
                                <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                                    Minimum 6 characters
                                </small>
                            </div>

                            <button 
                                type="submit" 
                                className={styles.button}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;