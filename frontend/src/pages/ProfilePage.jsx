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

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // Fetch user data on mount
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

    // Get the best available profile image URL
    const getProfileImageUrl = () => {
        if (!user) return null;
        if (user?.avatar && user.avatar.startsWith('http')) {
            return user.avatar;
        }
        if (user?.avatar) {
            return `${BACKEND_URL}${user.avatar}`;
        }
        if (user?.profilePic) {
            if (user.profilePic.startsWith('http')) {
                return user.profilePic;
            }
            return `${BACKEND_URL}/uploads/${user.profilePic}`;
        }
        return null;
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

    // Handle Cloudinary avatar upload
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
                setUser(prev => ({ ...prev, avatar: response.data.avatarUrl }));
                setMsg({ type: 'success', text: 'Avatar uploaded successfully! ✨' });
                e.target.value = '';
                // Refresh user data
                await fetchUserData();
            }
        } catch (err) {
            console.error('Avatar upload error:', err);
            setMsg({ 
                type: 'error', 
                text: err.response?.data?.error || 'Error uploading avatar' 
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Handle avatar removal
    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your avatar?')) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await API.delete('/uploads/avatar', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(prev => ({ ...prev, avatar: '' }));
            setMsg({ type: 'success', text: 'Avatar removed successfully' });
            await fetchUserData();
        } catch (err) {
            console.error('Avatar removal error:', err);
            setMsg({ type: 'error', text: 'Failed to remove avatar' });
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
            
            // Refresh user data
            await fetchUserData();
            
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
                    <h2>My Profile</h2>
                    <p className={styles.subtitle}>Manage your personal information and account settings</p>
                    <div className={styles.headerLine}></div>
                </div>

                {msg.text && (
                    <div className={`${styles.messageBox} ${styles[msg.type]}`}>
                        <span>{msg.type === 'success' ? '✅' : '❌'}</span>
                        <span>{msg.text}</span>
                    </div>
                )}

                <div className={styles.profileContent}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarWrapper}>
                            <div className={styles.avatarContainer}>
                                {picPreview ? (
                                    <img src={picPreview} alt="Preview" className={styles.avatar} />
                                ) : profileImageUrl ? (
                                    <img 
                                        src={profileImageUrl} 
                                        alt={user.name} 
                                        className={styles.avatar}
                                        onError={(e) => {
                                            console.error('Image failed to load:', profileImageUrl);
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<div class="${styles.defaultAvatar}">${user.name?.charAt(0).toUpperCase()}</div>`;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className={styles.defaultAvatar}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            
                            {/* Cloudinary Avatar Upload Section */}
                            <div className={styles.cloudinaryUpload}>
                                <label htmlFor="cloudinaryAvatarInput" className={styles.avatarButton}>
                                    {uploadingAvatar ? '⏳ Uploading...' : '📷 Upload New Avatar'}
                                </label>
                                <input
                                    id="cloudinaryAvatarInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                    style={{ display: 'none' }}
                                />
                                
                                {user.avatar && (
                                    <button 
                                        onClick={handleRemoveAvatar}
                                        className={styles.removeAvatarButton}
                                        disabled={updating}
                                    >
                                        🗑️ Remove Avatar
                                    </button>
                                )}
                            </div>
                            
                            <div className={styles.uploadDivider}>
                                <span>or</span>
                            </div>
                            
                            <label htmlFor="profilePicInput" className={styles.avatarOverlay} title="Change local photo">
                                <span>📁</span>
                                <span className={styles.overlayText}>Upload Local Photo</span>
                            </label>
                            <input
                                id="profilePicInput"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className={styles.userInfo}>
                            <h3 className={styles.profileName}>{user.name}</h3>
                            <div className={styles.profileEmail}>
                                <span>📧</span>
                                <span>{user.email}</span>
                            </div>
                            <div className={styles.roleBadge}>
                                {user.role === 'admin' ? '👑 Administrator' : '👤 Member'}
                            </div>
                            {user.avatar && (
                                <div className={styles.avatarBadge}>
                                    ✅ Avatar uploaded successfully
                                </div>
                            )}
                            {user.bio && (
                                <div className={styles.bioBox}>
                                    <p>{user.bio}</p>
                                </div>
                            )}
                            <div className={styles.joinDate}>
                                <span>📅</span>
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formsStack}>
                        <div className={styles.formCard}>
                            <div className={styles.formHeader}>
                                <span className={styles.formIcon}>✏️</span>
                                <h3>Edit Profile</h3>
                            </div>

                            <form onSubmit={handleProfile} className={styles.form}>
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
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Local Profile Picture (Fallback)</label>
                                    <div className={styles.fileInputWrapper}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className={styles.fileInput}
                                            id="fileInput"
                                        />
                                        <label htmlFor="fileInput" className={styles.fileInputLabel}>
                                            Choose File
                                        </label>
                                        <span className={styles.fileName}>
                                            {pic ? pic.name : 'No file chosen'}
                                        </span>
                                    </div>
                                    {picPreview && (
                                        <small className={styles.fileHint}>
                                            New image selected: {pic?.name}
                                        </small>
                                    )}
                                    <small className={styles.fileHint}>
                                        Square image recommended · Max 5MB
                                    </small>
                                </div>

                                <button 
                                    type="submit" 
                                    className={styles.button}
                                    disabled={updating}
                                >
                                    {updating ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        </div>

                        <div className={styles.formCard}>
                            <div className={styles.formHeader}>
                                <span className={styles.formIcon}>🔒</span>
                                <h3>Change Password</h3>
                            </div>

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
                                        placeholder="Enter new password (min 6 chars)"
                                        required
                                        minLength={6}
                                    />
                                    <small className={styles.passwordHint}>
                                        Minimum 6 characters
                                    </small>
                                </div>

                                <button 
                                    type="submit" 
                                    className={styles.button}
                                    disabled={updating}
                                >
                                    {updating ? 'Updating...' : 'Change Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;