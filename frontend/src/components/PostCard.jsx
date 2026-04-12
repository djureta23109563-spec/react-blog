// src/components/PostCard.js
import { Link } from 'react-router-dom';
import styles from "../styles/PostCard.module.css";

function PostCard({ id, title, excerpt, date, tag, readTime, image, backendUrl }) {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${backendUrl}/uploads/${imagePath}`;
  };

  return (
    <div className={styles.postCard}>
      {image && (
        <div className={styles.postImage}>
          <img 
            src={getImageUrl(image)} 
            alt={title}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <span className={styles.tag}>{tag}</span>
      <h2>
        <Link to={`/posts/${id}`}>{title}</Link>
      </h2>
      <p>{excerpt}</p>
      <div className={styles.meta}>
        <span>{date}</span>
        <span>{readTime} min read</span>
      </div>
    </div>
  );
}

export default PostCard;