// src/components/PostCard.js
import styles from "../styles/PostCard.module.css";

function PostCard({ title, excerpt, date, tag, readTime }) {
  return (
    <div className={styles.postCard}>
      <span className={styles.tag}>{tag}</span>
      <h2>{title}</h2>
      <p>{excerpt}</p>
      <div className={styles.meta}>
        <span>{date}</span>
        <span>{readTime} read</span>
      </div>
    </div>
  );
}

export default PostCard;