/**
 * Veterans Elite Contractors - Main JavaScript
 * Modern, accessible, performance-optimized
 */

(function() {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================

    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    const contactForm = document.getElementById('contact-form');

    // ========================================
    // Mobile Navigation
    // ========================================

    function initMobileNav() {
        if (!navToggle || !nav) return;

        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);

        function openMenu() {
            nav.classList.add('mobile-open');
            overlay.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            nav.classList.remove('mobile-open');
            overlay.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        function toggleMenu() {
            const isOpen = nav.classList.contains('mobile-open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        navToggle.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', closeMenu);

        // Close menu when clicking nav links
        nav.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
                closeMenu();
                navToggle.focus();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                closeMenu();
            }
        });
    }

    // ========================================
    // Sticky Header with Scroll Effect
    // ========================================

    function initStickyHeader() {
        if (!header) return;

        let lastScroll = 0;
        let ticking = false;

        function updateHeader() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL hash without jumping
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    // ========================================
    // Scroll Animations (Intersection Observer)
    // ========================================

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.service-card, .testimonial-card, .feature, .stat, .area, .section-header'
        );

        if (!animatedElements.length) return;

        // Add initial class
        animatedElements.forEach(el => {
            el.classList.add('fade-in');
        });

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animation
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 50);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // ========================================
    // Contact Form Handling (Formspree Integration)
    // ========================================

    function initContactForm() {
        if (!contactForm) return;

        // Set up reply-to field to match email input
        const emailInput = contactForm.querySelector('#email');
        const replyToField = contactForm.querySelector('#replyto');

        if (emailInput && replyToField) {
            emailInput.addEventListener('input', function() {
                replyToField.value = this.value;
            });
        }

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="spinner" viewBox="0 0 24 24" width="20" height="20">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="60" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" dur="1s" from="0 12 12" to="360 12 12" repeatCount="indefinite"/>
                    </circle>
                </svg>
                Sending...
            `;

            // Gather form data
            const formData = new FormData(contactForm);

            // Submit to Formspree
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success state
                    submitBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        Message Sent!
                    `;
                    submitBtn.style.background = '#10B981';

                    // Show success message
                    showFormMessage('success', 'Thank you! We\'ll respond within 30 minutes.');

                    // Reset form
                    contactForm.reset();

                    // Reset button after delay
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.background = '';
                    }, 3000);
                } else {
                    throw new Error('Form submission failed');
                }

            } catch (error) {
                // Error state
                submitBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Error - Try Again
                `;
                submitBtn.style.background = '#DC2626';

                showFormMessage('error', 'Something went wrong. Please call us at (858) 555-0123.');

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                }, 3000);
            }
        });

        // Form validation styles
        contactForm.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.required && !this.value.trim()) {
                    this.style.borderColor = '#DC2626';
                } else {
                    this.style.borderColor = '';
                }
            });

            input.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(220, 38, 38)') {
                    this.style.borderColor = '';
                }
            });
        });
    }

    // Show form feedback message
    function showFormMessage(type, message) {
        // Remove any existing message
        const existingMsg = document.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();

        const msgEl = document.createElement('div');
        msgEl.className = `form-message form-message--${type}`;
        msgEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success'
                    ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>'
                    : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
                }
            </svg>
            <span>${message}</span>
        `;

        contactForm.insertAdjacentElement('beforebegin', msgEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => msgEl.remove(), 300);
        }, 5000);
    }

    // ========================================
    // Phone Number Formatting
    // ========================================

    function initPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formatted = '';

            if (value.length > 0) {
                formatted = '(' + value.substring(0, 3);
            }
            if (value.length > 3) {
                formatted += ') ' + value.substring(3, 6);
            }
            if (value.length > 6) {
                formatted += '-' + value.substring(6, 10);
            }

            e.target.value = formatted;
        });
    }

    // ========================================
    // Animated Counter for Stats
    // ========================================

    function initCounterAnimation() {
        const counters = document.querySelectorAll('.stat__number[data-count]');
        if (!counters.length) return;

        const observerOptions = {
            root: null,
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    }

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'), 10);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }

    // ========================================
    // Active Navigation Highlighting
    // ========================================

    function initActiveNavHighlight() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav__link');

        if (!sections.length || !navLinks.length) return;

        function updateActiveLink() {
            const scrollY = window.pageYOffset;
            const headerHeight = header ? header.offsetHeight : 0;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 100;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ========================================
    // Emergency CTA Show/Hide on Scroll
    // ========================================

    function initEmergencyCTA() {
        const emergencyCTA = document.getElementById('emergency-cta');
        const hero = document.querySelector('.hero');

        if (!emergencyCTA || !hero) return;

        const observerOptions = {
            root: null,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    emergencyCTA.style.transform = 'translateY(100%)';
                } else {
                    emergencyCTA.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        observer.observe(hero);

        // Add transition
        emergencyCTA.style.transition = 'transform 0.3s ease';
    }

    // ========================================
    // Prefers Reduced Motion Check
    // ========================================

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // ========================================
    // Initialize All Features
    // ========================================

    function init() {
        initMobileNav();
        initStickyHeader();
        initSmoothScroll();
        initContactForm();
        initPhoneFormatting();
        initActiveNavHighlight();
        initEmergencyCTA();

        // Only init animations if user doesn't prefer reduced motion
        if (!prefersReducedMotion()) {
            initScrollAnimations();
            initCounterAnimation();
        }

        // Log initialization
        console.log('Veterans Elite Contractors website initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========================================
    // Service Worker Registration (PWA Ready)
    // ========================================

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Uncomment when you have a service worker file
            // navigator.serviceWorker.register('/sw.js')
            //     .then(reg => console.log('Service Worker registered'))
            //     .catch(err => console.log('Service Worker registration failed:', err));
        });
    }

})();
