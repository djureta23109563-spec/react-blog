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

  const journeyCards = [
    {
      id: 1,
      title: 'My Story',
      description: 'My name is Donato G. Ureta Jr., also known as DJ. I am from San Eugenio, Aringay, La Union.',
      images: [
        { src: meImg, caption: "This is me, DJ! Dancing has been my passion since I was young." }
      ],
    },
    {
      id: 2,
      title: 'First Dance',
      description: 'Participating in school festivals gradually sparked my passion for dance.',
      images: [
        { src: elem1, caption: "My first school festival performance. This is where it all began." },
        { src: elem2, caption: "Practicing with my classmates after school." }
      ],
    },
    {
      id: 3,
      title: 'High School',
      description: 'Joined competitions and school performances, improving my skills and confidence.',
      images: [
        { src: spa1, caption: "Our dance crew after winning 2nd place in regional competition." },
        { src: spa2, caption: "Backstage before our biggest performance." },
        { src: spa3, caption: "Teaching younger students some basic moves." }
      ],
    },
    {
      id: 4,
      title: 'Competitions',
      description: 'Intensive training and performances that shaped my dance journey.',
      images: [
        { src: spa4, caption: "Intensive training session - worth every moment." },
        { src: spa5, caption: "Our dance team after year-end showcase." }
      ],
    },
    {
      id: 5,
      title: 'Inspiration',
      description: 'Drew inspiration from professional dancers to express my personal style.',
      images: [
        { src: inspo, caption: "Watching professional dancers perform opened my eyes." },
        { src: sl1, caption: "My first solo performance." },
        { src: sl2, caption: "Exploring contemporary dance." }
      ],
    },
    {
      id: 6,
      title: 'Solo Journey',
      description: 'Creating my own choreography and expressing through solo performances.',
      images: [
        { src: sl3, caption: "After a successful solo performance at city festival." },
        { src: sl4, caption: "Creating my own choreography." },
        { src: sl5, caption: "The final bow - excited for the next one!" }
      ],
    },
  ];

  const funFacts = [
    "The waltz originated in Austria in the late 18th century.",
    "Ballet dancers can perform on pointe after years of training.",
    "Hip Hop dance culture began in the 1970s in New York City.",
    "Salsa has roots in Cuba and Puerto Rico.",
    "Flamenco involves intricate footwork and hand movements."
  ];

  const openModal = (img, caption) => {
    setModalImage(img);
    setModalCaption(caption);
  };

  return (
    <div className={`${styles.page} ${theme === 'dark' ? styles.darkMode : ''}`}>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Dancing Through Life
            <span>Donato G. Ureta Jr.</span>
          </h1>
          <div className={styles.titleDecoration}>
            <span className={styles.line}></span>
            <span className={styles.danceIcons}>💃 🕺 💃</span>
            <span className={styles.line}></span>
          </div>
        </div>

        {/* Journey Grid - 3x2 Landscape Layout */}
        <div className={styles.journeyGrid}>
          {journeyCards.map((card) => (
            <div key={card.id} className={styles.journeyCard}>
              <div className={styles.cardHeader}>
                <h2>{card.title}</h2>
                <span className={styles.cardNumber}>0{card.id}</span>
              </div>
              <p className={styles.cardDescription}>{card.description}</p>
              
              <div className={styles.imageStrip}>
                {card.images.map((item, i) => (
                  <div
                    key={i}
                    className={styles.stripItem}
                    onClick={() => openModal(item.src, item.caption)}
                    title={item.caption}
                  >
                    <img
                      src={item.src}
                      alt={`${card.title} ${i + 1}`}
                      className={styles.stripImage}
                    />
                    <div className={styles.stripOverlay}>
                      <span>🔍</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Facts & Quote Bar - Horizontal Layout */}
        <div className={styles.infoBar}>
          <div className={styles.factsSection}>
            <h3>Fun Facts</h3>
            <ul className={styles.factsList}>
              {funFacts.map((fact, index) => (
                <li key={index}>{fact}</li>
              ))}
            </ul>
          </div>
          
          <div className={styles.quoteSection}>
            <div className={styles.quoteIcon}>"</div>
            <p className={styles.quoteText}>
              Dance is not just movement, it is the story of my journey.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Contact: dxxxxxxxxxxx@gmail.com | Phone: 09xxxxxxx8</p>
          <p>&copy; 2026 My Dance Journey. All rights reserved.</p>
        </div>
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