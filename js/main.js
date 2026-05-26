
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mykvnayk'; // Replace with user's Formspree endpoint ID

const BACKGROUND_MUSIC_URL = '../music.mp3';

document.addEventListener('DOMContentLoaded', () => {
  // --- Initialize AOS ---
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }

  // --- State Variables ---
  let isMusicPlaying = false;
  let audio = null;

  // --- Dom Elements ---
  const coverScreen = document.getElementById('cover-screen');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  const mainContent = document.getElementById('main-content');
  const musicWidget = document.getElementById('music-widget');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  


  // RSVP Form & Guestbook elements
  const rsvpForm = document.getElementById('rsvp-form');
  const btnSubmitRsvp = document.getElementById('btn-submit-rsvp');
  const rsvpSuccessAlert = document.getElementById('rsvp-alert-success');
  const rsvpErrorAlert = document.getElementById('rsvp-alert-error');
  const wishesContainer = document.getElementById('wishes-container');
  const wishCountBadge = document.getElementById('wish-count');

  // Modal elements
  const giftModal = document.getElementById('gift-modal');
  const btnTriggerGiftModal = document.getElementById('btn-trigger-gift-modal');
  const btnCloseGiftModal = document.getElementById('btn-close-gift-modal');

  // ==========================================
  // 1. GUEST NAME PARSER (URL PARAMETER)
  // ==========================================
  const parseGuestName = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    const placeholder = document.getElementById('guest-name-placeholder');
    
    if (guestName && placeholder) {
      placeholder.textContent = decodeURIComponent(guestName);
    }
  };
  parseGuestName();

  // ==========================================
  // 2. AUDIO MUSIC PLAYER
  // ==========================================
  const initializeAudio = () => {
    audio = new Audio(BACKGROUND_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.5;

    // Handle audio play state changes
    audio.addEventListener('play', () => {
      isMusicPlaying = true;
      musicWidget.classList.add('playing');
    });

    audio.addEventListener('pause', () => {
      isMusicPlaying = false;
      musicWidget.classList.remove('playing');
    });
  };

  const toggleMusic = () => {
    if (!audio) return;
    if (isMusicPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.log('Audio playback prevented:', err));
    }
  };

  btnMusicToggle.addEventListener('click', toggleMusic);

  // ==========================================
  // 3. COVER SCREEN GATE UNLOCKER
  // ==========================================
  btnOpenInvitation.addEventListener('click', () => {
    // 1. Initialize audio and start playback
    initializeAudio();
    audio.play().catch(err => {
      console.log('Interaction gate passed but audio failed to play automatically:', err);
    });

    // 2. Unlock scroll
    document.body.classList.remove('scroll-locked');

    // 3. Fade out cover overlay
    coverScreen.classList.add('fade-out');

    // 4. Reveal floating controls (widgets)
    musicWidget.classList.remove('hidden');

    // 5. Trigger AOS re-evaluation
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 300);
  });



  // ==========================================
  // 5. LIVE GUESTBOOK (RSVP WITH LOCAL CACHE)
  // ==========================================
const escapeHTML = (str) => {
  return String(str).replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
};

// RSVP submit
rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  btnSubmitRsvp.disabled = true;
  btnSubmitRsvp.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengirim...';

  rsvpSuccessAlert.classList.add('hidden');
  rsvpErrorAlert.classList.add('hidden');

  const formData = new FormData(rsvpForm);

  const payload = {
    name: escapeHTML(formData.get('name')),
    attendance: escapeHTML(formData.get('attendance')),
    message: escapeHTML(formData.get('message'))
  };

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'RSVP Pernikahan Baru',
        nama_tamu: payload.name,
        kehadiran: payload.attendance,
        ucapan: payload.message
      })
    });

    if (!response.ok) {
      throw new Error('Gagal mengirim RSVP');
    }

    // sukses
    rsvpForm.reset();
    rsvpSuccessAlert.classList.remove('hidden');

    setTimeout(() => {
      rsvpSuccessAlert.classList.add('hidden');
    }, 4000);

  } catch (error) {
    console.error('RSVP Error:', error);

    rsvpErrorAlert.classList.remove('hidden');

    setTimeout(() => {
      rsvpErrorAlert.classList.add('hidden');
    }, 4000);
  }

  btnSubmitRsvp.disabled = false;
  btnSubmitRsvp.innerHTML =
    '<i class="fa-solid fa-paper-plane mr-2"></i> Kirim Ucapan & RSVP';
});
  // ==========================================
  // 6. COPY TO CLIPBOARD HELPER
  // ==========================================
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId).textContent;
      const originalIcon = e.currentTarget.innerHTML;

      navigator.clipboard.writeText(textToCopy).then(() => {
        // Change icon to checkmark temporarily
        e.currentTarget.innerHTML = '<i class="fa-solid fa-check" style="color: #27ae60;"></i>';
        e.currentTarget.setAttribute('title', 'Tersalin!');
        
        // Restore icon after 2s
        setTimeout(() => {
          e.currentTarget.innerHTML = originalIcon;
          e.currentTarget.setAttribute('title', 'Copy Rekening');
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text:', err);
      });
    });
  });

  // ==========================================
  // 7. DIALOG POPUP MODAL (DIGITAL ENVELOPE)
  // ==========================================
  btnTriggerGiftModal.addEventListener('click', () => {
    giftModal.style.display = 'flex';
    document.body.classList.add('scroll-locked');
  });

  const closeGiftModal = () => {
    giftModal.style.display = 'none';
    // Only unlock scroll if cover screen is not active
    if (coverScreen.classList.contains('fade-out')) {
      document.body.classList.remove('scroll-locked');
    }
  };

  btnCloseGiftModal.addEventListener('click', closeGiftModal);
  
  // Close modal when clicking outside modal box
  window.addEventListener('click', (e) => {
    if (e.target === giftModal) {
      closeGiftModal();
    }
  });

  // ==========================================
  // 8. LIGHTBOX MODAL FOR GALLERY
  // ==========================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.querySelector('.gallery-img').getAttribute('src');
      lightboxImg.setAttribute('src', imgSrc);
      lightboxModal.style.display = 'flex';
      document.body.classList.add('scroll-locked');
    });
  });

  const closeLightbox = () => {
    lightboxModal.style.display = 'none';
    if (coverScreen.classList.contains('fade-out')) {
      document.body.classList.remove('scroll-locked');
    }
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  // ==========================================
  // 9. SCROLL-SPY ACTIVE LINK HIGHLIGHTER
  // ==========================================
  const sections = document.querySelectorAll('main > section');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    let scrollPos = window.scrollY || document.documentElement.scrollTop;
    
    // Adjust scrollPos for offset header in desktop view
    const isDesktop = window.innerWidth >= 768;
    const offset = isDesktop ? 80 : 20;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - offset;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll);
  // Trigger on initial page display to highlight proper section
  onScroll();

  // ==========================================
  // 10. GALLERY SLIDER CONTROLS
  // ==========================================
  const slider = document.getElementById('gallery-slider');
  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');
  const dotsContainer = document.getElementById('gallery-dots');
  const items = slider ? slider.querySelectorAll('.gallery-item') : [];

  if (slider && prevBtn && nextBtn && dotsContainer && items.length > 0) {
    // Generate dots
    items.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        scrollToItem(index);
      });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    const updateActiveDot = () => {
      const scrollLeft = slider.scrollLeft;
      
      // Find which item is closest to the left edge of the slider viewport
      let activeIndex = 0;
      let minDistance = Infinity;

      items.forEach((item, index) => {
        const itemLeft = item.offsetLeft - slider.offsetLeft;
        const distance = Math.abs(itemLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    const scrollToItem = (index) => {
      const item = items[index];
      if (item) {
        slider.scrollTo({
          left: item.offsetLeft - slider.offsetLeft,
          behavior: 'smooth'
        });
      }
    };

    prevBtn.addEventListener('click', () => {
      const scrollLeft = slider.scrollLeft;
      
      // Find current active item
      let activeIndex = 0;
      let minDistance = Infinity;
      items.forEach((item, index) => {
        const itemLeft = item.offsetLeft - slider.offsetLeft;
        const distance = Math.abs(itemLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      // Go to previous item, wrap around to last if at first
      const targetIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
      scrollToItem(targetIndex);
    });

    nextBtn.addEventListener('click', () => {
      const scrollLeft = slider.scrollLeft;
      
      // Find current active item
      let activeIndex = 0;
      let minDistance = Infinity;
      items.forEach((item, index) => {
        const itemLeft = item.offsetLeft - slider.offsetLeft;
        const distance = Math.abs(itemLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      // Go to next item, wrap around to first if at last
      const targetIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
      scrollToItem(targetIndex);
    });

    // Update active dot on scroll
    let scrollTimeout;
    slider.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveDot, 100);
    });
  }
});
