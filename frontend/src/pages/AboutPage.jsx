// frontend/src/pages/AboutPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/AboutPage.module.css';

// Import all your images
import meImg from '../assets/me.jpg';
import elem1 from '../assets/elem1.jpg';
import elem2 from '../assets/elem2.jpg';
import spa1 from '../assets/spa1.jpg';
import spa2 from '../assets/spa2.jpg';
import spa3 from '../assets/spa3.jpg';
import spa4 from '../assets/spa4.jpg';
import spa5 from '../assets/spa5.jpg';
import inspo from '../assets/inspo.jpg';
import sl1 from '../assets/sl1.jpg';
import sl2 from '../assets/sl2.jpg';
import sl3 from '../assets/sl3.jpg';
import sl4 from '../assets/sl4.jpg';
import sl5 from '../assets/sl5.jpg';

function AboutPage() {
  const [modalImage, setModalImage] = useState(null);
  const [modalCaption, setModalCaption] = useState('');
  const { theme } = useTheme();

  const sections = [
    {
      title: 'My Story Through Dance',
      text: (
        <>
          My name is <strong>Donato G. Ureta Jr.</strong>, also known as <strong>DJ</strong>.
          I am from San Eugenio, Aringay, La Union. This webpage shares my personal
          journey in discovering my passion for dance and how it became an important part of my life.
        </>
      ),
      images: [
        {
          src: meImg,
          caption: "This is me, DJ! Dancing has been my passion since I was young. Every step tells a story, every movement expresses emotion."
        }
      ],
    },
    {
      title: 'My First Dance Experience',
      text: 'At first, I was not really interested in dancing, but participating in school festivals gradually sparked my passion.',
      images: [
        {
          src: elem1,
          caption: "My first school festival performance. I was nervous but excited! This is where it all began."
        },
        {
          src: elem2,
          caption: "Practicing with my classmates after school. We spent hours perfecting our routine, not knowing this would become my lifelong passion."
        }
      ],
    },
    {
      title: 'High School & Special Performances',
      text: 'During high school, I joined competitions and school performances, which improved my skills and confidence.',
      images: [
        {
          src: spa1,
          caption: "Our dance crew after winning 2nd place in the regional competition. The feeling of achievement was unforgettable!"
        },
        {
          src: spa2,
          caption: "Backstage before our biggest performance. The energy and anticipation backstage is always electric."
        },
        {
          src: spa3,
          caption: "Teaching younger students some basic moves. Sharing my passion with others brought me so much joy."
        },
        {
          src: spa4,
          caption: "Intensive training session - we practiced until our feet hurt, but it was worth every moment."
        },
        {
          src: spa5,
          caption: "Our dance team after the year-end showcase. We gave it our all and the audience loved it!"
        }
      ],
    },
    {
      title: 'Inspiration & Solo Performances',
      text: 'I drew inspiration from professional dancers and explored solo performances to express my personal style.',
      images: [
        {
          src: inspo,
          caption: "Watching professional dancers perform opened my eyes to what's possible. They inspired me to push my limits."
        },
        {
          src: sl1,
          caption: "My first solo performance - I was terrified but the moment I stepped on stage, everything felt right."
        },
        {
          src: sl2,
          caption: "Exploring contemporary dance. This style allows me to express emotions that words cannot capture."
        },
        {
          src: sl3,
          caption: "After a successful solo performance at the city festival. The crowd's applause was overwhelming."
        },
        {
          src: sl4,
          caption: "Creating my own choreography. This piece tells the story of my journey as a dancer."
        },
        {
          src: sl5,
          caption: "The final bow. Every performance ends, but the passion never fades. Already excited for the next one!"
        }
      ],
    },
  ];

  const openModal = (img, caption) => {
    setModalImage(img);
    setModalCaption(caption);
  };

  return (
    <div className={`${styles.page} ${theme === 'dark' ? styles.darkMode : ''}`}>
      {/* Main Content */}
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Dancing Through Life
            <span>Donato G. Ureta Jr.</span>
          </h1>
          <div className={styles.heroDance}>
            <span>💃</span>
            <span>🕺</span>
            <span>💃</span>
          </div>
        </div>

        {/* Timeline Journey */}
        <div className={styles.timeline}>
          {sections.map((section, idx) => (
            <div key={idx} className={styles.timelineSection}>
              <div className={styles.timelineMarker}>
                <span>{idx + 1}</span>
              </div>
              
              <div className={styles.timelineContent}>
                <h2 className={styles.sectionTitle}>
                  <span>{section.title.split(' ')[0]}</span> {section.title.split(' ').slice(1).join(' ')}
                </h2>
                <p className={styles.sectionText}>{section.text}</p>
                
                {section.images.length > 0 && (
                  <div className={styles.imageGrid}>
                    {section.images.map((item, i) => (
                      <div
                        key={i}
                        className={styles.imageCard}
                        onClick={() => openModal(item.src, item.caption)}
                      >
                        <div className={styles.imageWrapper}>
                          <img
                            src={item.src}
                            alt={`${section.title} ${i + 1}`}
                            className={styles.clickableImage}
                          />
                          <div className={styles.imageOverlay}>
                            <span className={styles.zoomIcon}>🔍</span>
                          </div>
                        </div>
                        <div className={styles.imageCaption}>
                          <p>{item.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Fun Dance Facts */}
        <section className={styles.funFacts}>
          <h2><span>Fun</span> Dance Facts</h2>
          <ul>
            <li>The waltz originated in Austria in the late 18th century.</li>
            <li>Ballet dancers can perform on pointe after years of training.</li>
            <li>Hip Hop dance culture began in the 1970s in New York City.</li>
            <li>Salsa has roots in Cuba and Puerto Rico.</li>
            <li>Flamenco involves intricate footwork and hand movements.</li>
          </ul>
        </section>

        {/* Inspirational Quote */}
        <div className={styles.blockquote}>
          “Dance is not just movement, it is the story of my journey.”
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Contact: dxxxxxxxxxxx@gmail.com | Phone: 09xxxxxxx8</p>
        <p>&copy; 2026 My Dance Journey. All rights reserved.</p>
      </footer>

      {/* Image Modal */}
      {modalImage && (
        <div className={styles.modalOverlay} onClick={() => setModalImage(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <img src={modalImage} alt="Enlarged view" />
            {modalCaption && (
              <div className={styles.modalCaption}>
                <p>{modalCaption}</p>
              </div>
            )}
            <button className={styles.closeButton} onClick={() => setModalImage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AboutPage;