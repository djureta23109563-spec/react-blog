// frontend/src/pages/SplashPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SplashPage.module.css';

function SplashPage() {
  const [fadeOut, setFadeOut] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const navigate = useNavigate();

  // Single inspiring quote
  const quote = {
    text: "Dance is the hidden language of the soul.",
    author: "Martha Graham"
  };

  // Log to console to verify component is rendering
  console.log("SplashPage rendering, quote:", quote);

  useEffect(() => {
    console.log("SplashPage mounted");
    
    // Animation sequence
    const stage1 = setTimeout(() => {
      console.log("Stage 1 reached");
      setAnimationStage(1);
    }, 500);
    
    const stage2 = setTimeout(() => {
      console.log("Stage 2 reached");
      setAnimationStage(2);
    }, 1500);
    
    const stage3 = setTimeout(() => {
      console.log("Stage 3 reached");
      setAnimationStage(3);
    }, 2500);
    
    // Redirect after 5 seconds
    const timeout = setTimeout(() => {
      console.log("Fading out and redirecting");
      setFadeOut(true);
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    }, 5000);

    return () => {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className={`${styles.splashPage} ${fadeOut ? styles.fadeOut : ''}`}>
      {/* Animated background gradients */}
      <div className={styles.background}>
        <div className={styles.gradient1}></div>
        <div className={styles.gradient2}></div>
        <div className={styles.gradient3}></div>
      </div>

      {/* Floating geometric shapes */}
      <div className={styles.shapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
        <div className={styles.shape4}></div>
        <div className={styles.shape5}></div>
      </div>

      {/* Main content */}
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left side - Text */}
          <div className={styles.textContent}>
            <div className={`${styles.tagline} ${animationStage >= 1 ? styles.visible : ''}`}>
              DANCE PORTFOLIO
            </div>
            
            <h1 className={`${styles.title} ${animationStage >= 2 ? styles.visible : ''}`}>
              <span className={styles.titleLine}>My Dance</span>
              <span className={styles.titleLine}>Journey</span>
            </h1>
            
            <div className={`${styles.description} ${animationStage >= 2 ? styles.visible : ''}`}>
              <p>Where movement meets expression — a collection of moments, stories, and the art of dance.</p>
            </div>

            {/* Quote - ALWAYS RENDERED, no condition */}
            <div className={styles.quoteContainer}>
              <div className={styles.quoteMark}>"</div>
              <p className={styles.quoteText}>{quote.text}</p>
              <p className={styles.quoteAuthor}>— {quote.author}</p>
            </div>

            {/* Loading indicator */}
            <div className={`${styles.loaderContainer} ${animationStage >= 3 ? styles.visible : ''}`}>
              <div className={styles.loaderBar}>
                <div className={styles.loaderProgress}></div>
              </div>
              <div className={styles.loaderText}>
                <span>ENTERING</span>
                <span className={styles.loaderDots}>
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Abstract art */}
          <div className={`${styles.artContent} ${animationStage >= 1 ? styles.visible : ''}`}>
            <div className={styles.artPiece}>
              <div className={styles.circle}></div>
              <div className={styles.line1}></div>
              <div className={styles.line2}></div>
              <div className={styles.line3}></div>
              <div className={styles.dot1}></div>
              <div className={styles.dot2}></div>
              <div className={styles.dot3}></div>
            </div>
            
            <div className={`${styles.artBadge} ${animationStage >= 2 ? styles.visible : ''}`}>
              <span className={styles.badgeLine}></span>
              <span className={styles.badgeText}>MOVEMENT • RHYTHM • FLOW</span>
              <span className={styles.badgeLine}></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`${styles.footer} ${animationStage >= 3 ? styles.visible : ''}`}>
          <div className={styles.footerLine}></div>
          <p>© 2026 · THE DANCE FOLIO</p>
          <div className={styles.footerLine}></div>
        </div>
      </div>
    </div>
  );
}

export default SplashPage;