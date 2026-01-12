/* Atelier Scrollytelling Logic */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.atelier-scroll-track');
  const hero = document.querySelector('.atelier-hero');
  // CHANGED: Target generic class for ITB compatibility
  const textGroup = document.querySelector('.reveal-on-scroll');
  const manifesto = document.querySelector('.atelier-manifesto');
  const scrollHint = document.querySelector('.scroll-hint');
  const heroBg = document.querySelector('.hero-bg');

  if (!track || !hero) return;

  const onScroll = () => {
    const rect = track.getBoundingClientRect();
    const trackHeight = rect.height;
    const windowHeight = window.innerHeight;

    // progress: 0 (start) -> 1 (end of hero scroll)
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / (trackHeight - windowHeight)));

    // 1. Image Parallax (Slow move down)
    if (heroBg) {
      heroBg.style.transform = `scale(${1 + progress * 0.1})`;
    }

    // 2. Text Reveal (Instant on Scroll)
    if (scrollHint) {
      if (progress > 0.1) scrollHint.style.opacity = 0;
      else scrollHint.style.opacity = 1;
    }


    // 2. Text Reveal & Fade Out logic
    if (textGroup) {
      // FORCE VISIBLE at start (opacity 1)
      textGroup.classList.add('active');

      // Phase 2: Fade Out (End)
      // Mimic L'Atelier: Keep title visible longer (until ~70%), then fade out
      // This creates the "2nd Notch" where Title + Text are visible together
      if (progress > 0.70) {
        const fadeOut = 1 - ((progress - 0.70) / 0.20);
        textGroup.style.opacity = Math.max(0, fadeOut);
        textGroup.style.transform = `translateY(${- (progress - 0.70) * 150}px)`;
      } else {
        textGroup.style.opacity = 1;
        textGroup.style.transform = 'translateY(0)';
      }
    }

    // Start appearance at 50% (Distinct 2nd Notch)
    if (progress > 0.50) {
      manifesto.classList.add('active');

      // FADE OUT MANIFESTO (Added logic)
      // Fade out at 85% to clear space for social hub
      if (progress > 0.85) {
        const fadeOut = 1 - ((progress - 0.85) / 0.15);
        manifesto.style.opacity = Math.max(0, fadeOut);
        manifesto.style.transform = `translateY(${- (progress - 0.85) * 100}px)`;
      } else {
        manifesto.style.opacity = 1;
        manifesto.style.transform = 'translateY(0)';
      }

    } else {
      manifesto.classList.remove('active');
      manifesto.style.opacity = '';
      manifesto.style.transform = '';
    }
  };

  window.addEventListener('scroll', () => requestAnimationFrame(onScroll));
  onScroll(); // Initial check

  /* =========================================
     SOCIAL HUB LOGIC
     ========================================= */

  // Data Mock (Simulation of API response)
  const MOCK_DATA = {
    insta: [
      { src: 'assets/raffaello.jpg', caption: 'Douceur infinie... le Raffaello Framboise 🌸' },
      { src: 'assets/pistache.jpg', caption: 'Pistache d’Iran & Croustillant praliné. Un classique.' },
      { src: 'assets/choco.jpg', caption: 'Obsédé par le glaçage parfait. 🍫 #chocolate #pastry' },
      { src: 'assets/citron.jpg', caption: 'Citron Silk : l’acidité maîtrisée.' }
    ],
    youtube: [
      { src: 'assets/atelier-hero.png', caption: 'Masterclass : Le Glaçage Miroir (Tutoriel Complet)' },
      { src: 'assets/placeholder_cake.png', caption: 'VLOG : Une journée à l’Atelier' },
      { src: 'assets/choco.jpg', caption: 'Recette : Entremets Chocolat en 3 façon' }
    ],
    tiktok: [
      { src: 'assets/video_thumb1.jpg', caption: 'Pochage ASMR 🤤 #pastry #satisfying' },
      { src: 'assets/video_thumb2.jpg', caption: 'Behind the scenes... 🤫' },
      { src: 'assets/video_thumb3.jpg', caption: 'Crash test nouvelle recette !' },
      { src: 'assets/video_thumb4.jpg', caption: 'L’équipe du matin 💪' }
    ]
  };

  const renderSocialCard = (item, container, isVertical = false) => {
    const card = document.createElement('a');
    card.href = "#"; // Link to post
    card.target = "_blank";
    card.className = 'social-card reveal';

    card.innerHTML = `
      <img src="${item.src}" alt="Post" loading="lazy">
      <div class="social-overlay">
        <p class="social-caption">${item.caption}</p>
      </div>
    `;
    container.appendChild(card);
  };

  // Render Insta
  const instaGrid = document.getElementById('insta-grid');
  if (instaGrid && MOCK_DATA.insta) {
    MOCK_DATA.insta.forEach(item => renderSocialCard(item, instaGrid));
  }

  // Render YouTube
  const ytGrid = document.getElementById('youtube-grid');
  if (ytGrid && MOCK_DATA.youtube) {
    MOCK_DATA.youtube.forEach(item => renderSocialCard(item, ytGrid));
  }

  // Render TikTok
  const ttGrid = document.getElementById('tiktok-grid');
  if (ttGrid && MOCK_DATA.tiktok) {
    MOCK_DATA.tiktok.forEach(item => renderSocialCard(item, ttGrid, true));
  }
});
