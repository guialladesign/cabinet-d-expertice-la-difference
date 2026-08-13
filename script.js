/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — SCRIPT.JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Barre de progression de défilement ---------- */
  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Navbar sticky avec effet au scroll ---------- */
  const nav = document.getElementById('mainNav');
  const onNavScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // Fermer le menu mobile après un clic sur un lien
  document.querySelectorAll('#navMenu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('navMenu');
      if (menu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  // Mise en surbrillance du lien actif selon la section visible
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('#navMenu .nav-link');
  const highlightNav = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  /* ---------- Révélation au défilement (data-aos maison) ---------- */
  const revealTargets = document.querySelectorAll('[data-aos]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ld-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('ld-visible'));
  }

  /* ---------- Anneau de progression du hero ---------- */
  const heroRings = document.querySelectorAll('.ring-fill');
  const CIRC_HERO = 2 * Math.PI * 0; // placeholder, calculé par rayon réel ci-dessous
  const animateHeroRings = () => {
    heroRings.forEach(ring => {
      const radius = parseFloat(ring.getAttribute('r'));
      const circumference = 2 * Math.PI * radius;
      const finalPct = parseFloat(ring.dataset.final) / 100;
      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = circumference * (1 - finalPct);
    });
  };
  // Léger délai pour laisser le layout se stabiliser puis déclencher la transition CSS
  setTimeout(animateHeroRings, 400);

  /* ---------- Compteurs animés + anneaux statistiques ---------- */
  const statSection = document.querySelector('.ld-stats-section');
  let statsAnimated = false;

  const animateStats = () => {
    if (statsAnimated) return;
    statsAnimated = true;

    document.querySelectorAll('.ld-stat-number').forEach(numEl => {
      const target = parseInt(numEl.dataset.count, 10);
      const duration = 1800;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        numEl.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    document.querySelectorAll('.stat-fill').forEach(ring => {
      const radius = parseFloat(ring.getAttribute('r'));
      const circumference = 2 * Math.PI * radius;
      const target = parseFloat(ring.dataset.target);
      const max = parseFloat(ring.dataset.max);
      const pct = target / max;
      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = circumference * (1 - pct);
    });
  };

  if (statSection) {
    if ('IntersectionObserver' in window) {
      const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateStats();
            statObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });
      statObserver.observe(statSection);
    } else {
      animateStats();
    }
  }

  /* ---------- Filtres de la galerie ---------- */
  const filterButtons = document.querySelectorAll('.ld-filter-btn');
  const galleryItems = document.querySelectorAll('.ld-gallery-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---------- Modale vidéo de la galerie ---------- */
  const videoModal = document.getElementById('videoModal');
  const videoPlayer = document.getElementById('videoModalPlayer');
  const videoCards = document.querySelectorAll('[data-type="video"]');

  const openVideoModal = (src) => {
    videoPlayer.setAttribute('src', src);
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    videoPlayer.play().catch(() => {
      /* La lecture automatique peut être bloquée : l'utilisateur clique sur play manuellement. */
    });
  };

  const closeVideoModal = () => {
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.video;
      if (src) openVideoModal(src);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeVideoModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('open')) closeVideoModal();
  });

  /* ---------- Slider de témoignages ---------- */
  const testimonials = document.querySelectorAll('.ld-testimonial');
  const dots = document.querySelectorAll('.ld-dot');
  let currentSlide = 0;
  let sliderTimer = null;

  const showSlide = (index) => {
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % testimonials.length;
    showSlide(next);
  };

  const startAutoSlide = () => {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(nextSlide, 6000);
  };

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showSlide(parseInt(dot.dataset.slide, 10));
      startAutoSlide();
    });
  });

  if (testimonials.length) startAutoSlide();

  /* ---------- Formulaire de contact ---------- */
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        feedback.textContent = 'Merci de renseigner tous les champs correctement.';
        feedback.classList.remove('success');
        return;
      }

      const nom = document.getElementById('nom').value.trim();

      feedback.textContent = `Merci ${nom} ! Votre message a bien été enregistré. Notre équipe vous recontactera très vite.`;
      feedback.classList.add('success');
      form.reset();
      form.classList.remove('was-validated');
    });
  }

});
