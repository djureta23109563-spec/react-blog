import React, { useState } from 'react';
import axios from 'axios';

const AvatarUpload = ({ userId, currentAvatar, userName, userRole, onAvatarUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentAvatar);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        // Preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setError('');
        setUploading(true);

        // Upload to backend
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/uploads/upload-avatar',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                onAvatarUpdate(response.data.url);
                alert('Avatar uploaded successfully!');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            URL.revokeObjectURL(previewUrl);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your avatar?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete('/api/uploads/remove-avatar', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            onAvatarUpdate('');
            alert('Avatar removed successfully');
        } catch (err) {
            console.error('Remove error:', err);
            setError('Failed to remove avatar');
        }
    };

    return (
        <div className="avatar-upload-container" style={styles.container}>
            <div className="avatar-preview" style={styles.previewContainer}>
                <img 
                    src={preview || '/default-avatar.png'} 
                    alt={`${userName || 'User'}'s avatar`}
                    style={styles.avatar}
                />
                {userRole && (
                    <span style={styles.roleBadge}>{userRole}</span>
                )}
            </div>
            
            <div className="upload-controls" style={styles.controls}>
                <input 
                    type="file" 
                    id="avatar-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
                <label 
                    htmlFor="avatar-upload" 
                    style={styles.uploadButton}
                >
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                </label>
                
                {currentAvatar && (
                    <button 
                        onClick={handleRemoveAvatar}
                        style={styles.removeButton}
                        disabled={uploading}
                    >
                        Remove Avatar
                    </button>
                )}
            </div>
            
            {error && <div style={styles.error}>{error}</div>}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '20px'
    },
    previewContainer: {
        position: 'relative',
        display: 'inline-block'
    },
    avatar: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #0070f3'
    },
    roleBadge: {
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        backgroundColor: '#0070f3',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        textTransform: 'capitalize'
    },
    controls: {
        display: 'flex',
        gap: '10px'
    },
    uploadButton: {
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: 'white',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        border: 'none'
    },
    removeButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        border: 'none'
    },
    error: {
        color: '#dc3545',
        fontSize: '14px',
        marginTop: '10px'
    }
};

export default AvatarUpload;