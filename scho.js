const API = '/api';

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 300);

  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 100;
  sections.forEach(section => {
    if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`));
    }
  });
});

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(link => link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('click', event => {
    if (navbar && !navbar.contains(event.target)) {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

if (scrollTopBtn) scrollTopBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold:0.1, rootMargin:'0px 0px -100px 0px' });

document.querySelectorAll('.stat-card, .program-card, .info-card').forEach(card => {
  card.style.opacity='0'; card.style.transform='translateY(20px)';
  card.style.transition='opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});

const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = parseInt(entry.target.dataset.target || '0', 10);
    const duration = 1500, start = performance.now();
    const tick = now => {
      const progress = Math.min((now-start)/duration, 1);
      entry.target.textContent = Math.floor(target * progress);
      if(progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    statsObserver.unobserve(entry.target);
  });
}, {threshold:0.5});
statNumbers.forEach(stat => statsObserver.observe(stat));

async function submitForm(form, endpoint, successMessage) {
  const button = form.querySelector('button[type="submit"]');
  const original = button ? button.textContent : '';
  if(button) { button.disabled = true; button.textContent = 'Sending...'; }
  try {
    const data = Object.fromEntries(new FormData(form).entries());
    const response = await fetch(`${API}/${endpoint}`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
    });
    const result = await response.json();
    if(!response.ok) throw new Error(result.message || 'Submission failed.');
    alert(successMessage);
    form.reset();
  } catch(error) {
    alert(error.message || 'Unable to send your request. Please try again.');
  } finally {
    if(button) { button.disabled=false; button.textContent=original; }
  }
}

const inquiryForm = document.getElementById('inquiryForm');
const contactForm = document.getElementById('contactForm');
if(inquiryForm) inquiryForm.addEventListener('submit', e => {
  e.preventDefault();
  submitForm(inquiryForm, 'inquiries', 'Thank you for your inquiry! We will contact you soon.');
});
if(contactForm) contactForm.addEventListener('submit', e => {
  e.preventDefault();
  submitForm(contactForm, 'contact', 'Thank you for your message! We will get back to you shortly.');
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', function(e) {
  const target = document.querySelector(this.getAttribute('href'));
  if(target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
}));

async function loadStats() {
  try {
    const response = await fetch(`${API}/stats`);
    const result = await response.json();
    if(!response.ok || !result.data) return;
    const values = [result.data.students, result.data.success_rate, result.data.faculty, result.data.years_excellence];
    statNumbers.forEach((el,i) => { if(values[i] != null) el.dataset.target = values[i]; });
  } catch { /* Backend may be unavailable while viewing a static copy. */ }
}
loadStats();
