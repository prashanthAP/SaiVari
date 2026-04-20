/**
 * SaiVari Finance - Main JavaScript
 * Mobile-first responsive loan services web application
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===== PRELOADER =====
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 800);
    });

    // Safety fallback — hide preloader after 3s no matter what
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 3000);

    // ===== MOBILE NAVIGATION =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';

            // Update active state
            navLinkItems.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ===== HEADER SCROLL EFFECT =====
    const header = document.getElementById('header');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Header background
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back to top button
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== ACTIVE NAV LINK ON SCROLL =====
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ===== ANIMATED COUNTER =====
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            element.textContent = current.toLocaleString('en-IN');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Observe counters
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        counterObserver.observe(el);
    });

    // ===== SCROLL REVEAL ANIMATION =====
    const revealElements = document.querySelectorAll(
        '.about-feature, .loan-card, .process-step, .info-card, .section-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ===== EMI CALCULATOR =====
    const loanAmountSlider = document.getElementById('loanAmount');
    const interestRateSlider = document.getElementById('interestRate');
    const loanTenureSlider = document.getElementById('loanTenure');
    const loanAmountValueEl = document.getElementById('loanAmountValue');
    const interestRateValueEl = document.getElementById('interestRateValue');
    const loanTenureValueEl = document.getElementById('loanTenureValue');
    const emiAmountEl = document.getElementById('emiAmount');
    const principalAmountEl = document.getElementById('principalAmount');
    const totalInterestEl = document.getElementById('totalInterest');
    const totalAmountEl = document.getElementById('totalAmount');

    function formatINR(num) {
        return '₹' + Number(num).toLocaleString('en-IN');
    }

    function calculateEMI() {
        const P = parseFloat(loanAmountSlider.value);
        const annualRate = parseFloat(interestRateSlider.value);
        const N = parseInt(loanTenureSlider.value) * 12; // months

        // Update display values
        loanAmountValueEl.textContent = formatINR(P);
        interestRateValueEl.textContent = annualRate + '%';
        loanTenureValueEl.textContent = loanTenureSlider.value + (loanTenureSlider.value == 1 ? ' Year' : ' Years');

        // Update slider track color
        updateSliderTrack(loanAmountSlider);
        updateSliderTrack(interestRateSlider);
        updateSliderTrack(loanTenureSlider);

        const R = annualRate / 12 / 100; // monthly interest rate

        let EMI;
        if (R === 0) {
            EMI = P / N;
        } else {
            EMI = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
        }

        const totalPayable = EMI * N;
        const totalInterest = totalPayable - P;

        emiAmountEl.textContent = formatINR(Math.round(EMI));
        principalAmountEl.textContent = formatINR(Math.round(P));
        totalInterestEl.textContent = formatINR(Math.round(totalInterest));
        totalAmountEl.textContent = formatINR(Math.round(totalPayable));

        // Draw donut chart
        drawDonutChart(P, totalInterest);
    }

    function updateSliderTrack(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const percentage = ((val - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, #1a56db 0%, #7c3aed ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
    }

    function drawDonutChart(principal, interest) {
        const canvas = document.getElementById('emiChart');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = 220 * dpr;
        canvas.height = 220 * dpr;
        canvas.style.width = '220px';
        canvas.style.height = '220px';
        ctx.scale(dpr, dpr);

        const total = principal + interest;
        const principalAngle = (principal / total) * (2 * Math.PI);
        const centerX = 110;
        const centerY = 110;
        const radius = 90;
        const lineWidth = 28;

        ctx.clearRect(0, 0, 220, 220);

        // Draw principal arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + principalAngle);
        ctx.strokeStyle = '#1a56db';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw interest arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2 + principalAngle, -Math.PI / 2 + 2 * Math.PI);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // Initialize calculator
    if (loanAmountSlider) {
        loanAmountSlider.addEventListener('input', calculateEMI);
        interestRateSlider.addEventListener('input', calculateEMI);
        loanTenureSlider.addEventListener('input', calculateEMI);
        calculateEMI();
    }

    // ===== TESTIMONIAL SLIDER =====
    const track = document.getElementById('testimonialTrack');
    const cards = track ? track.querySelectorAll('.testimonial-card') : [];
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    let currentSlide = 0;
    let autoSlideTimer;

    function initSlider() {
        if (!track || cards.length === 0) return;

        // Create dots
        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        startAutoSlide();
    }

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });

        resetAutoSlide();
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % cards.length);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + cards.length) % cards.length);
    }

    function startAutoSlide() {
        autoSlideTimer = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    initSlider();

    // Touch/swipe support for testimonials
    let touchStartX = 0;
    let touchEndX = 0;

    if (track) {
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });
    }

    // ===== LEAD FORM VALIDATION & SUBMISSION =====
    const leadForm = document.getElementById('leadForm');
    const formSuccess = document.getElementById('formSuccess');

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (validateForm()) {
                submitForm();
            }
        });

        // Real-time validation
        const requiredFields = leadForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                validateField(field);
            });
            field.addEventListener('input', () => {
                clearError(field);
            });
        });
    }

    function validateForm() {
        let isValid = true;

        // Full Name
        const fullName = document.getElementById('fullName');
        if (!fullName.value.trim()) {
            showError(fullName, 'fullNameError', 'Please enter your full name');
            isValid = false;
        } else if (fullName.value.trim().length < 2) {
            showError(fullName, 'fullNameError', 'Name must be at least 2 characters');
            isValid = false;
        }

        // Phone
        const phone = document.getElementById('phone');
        const phoneRegex = /^[\+]?[0-9]{10,13}$/;
        const phoneValue = phone.value.replace(/[\s-]/g, '');
        if (!phoneValue) {
            showError(phone, 'phoneError', 'Please enter your mobile number');
            isValid = false;
        } else if (!phoneRegex.test(phoneValue)) {
            showError(phone, 'phoneError', 'Please enter a valid mobile number');
            isValid = false;
        }

        // Email
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError(email, 'emailError', 'Please enter your email address');
            isValid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            showError(email, 'emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Loan Type
        const loanType = document.getElementById('loanType');
        if (!loanType.value) {
            showError(loanType, 'loanTypeError', 'Please select a loan type');
            isValid = false;
        }

        // Consent
        const consent = document.getElementById('consent');
        if (!consent.checked) {
            document.getElementById('consentError').textContent = 'Please agree to the terms & conditions';
            isValid = false;
        } else {
            document.getElementById('consentError').textContent = '';
        }

        return isValid;
    }

    function validateField(field) {
        const name = field.name;
        const value = field.value.trim();

        switch (name) {
            case 'fullName':
                if (!value) showError(field, 'fullNameError', 'Please enter your full name');
                else clearError(field);
                break;
            case 'phone':
                const phoneRegex = /^[\+]?[0-9]{10,13}$/;
                if (!value) showError(field, 'phoneError', 'Please enter your mobile number');
                else if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) showError(field, 'phoneError', 'Please enter a valid number');
                else clearError(field);
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) showError(field, 'emailError', 'Please enter your email');
                else if (!emailRegex.test(value)) showError(field, 'emailError', 'Please enter a valid email');
                else clearError(field);
                break;
            case 'loanType':
                if (!value) showError(field, 'loanTypeError', 'Please select a loan type');
                else clearError(field);
                break;
        }
    }

    function showError(field, errorId, message) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.textContent = message;
        field.closest('.input-wrapper')?.classList.add('error');
    }

    function clearError(field) {
        const name = field.name;
        const errorEl = document.getElementById(name + 'Error');
        if (errorEl) errorEl.textContent = '';
        field.closest('.input-wrapper')?.classList.remove('error');
    }

    function submitForm() {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Show loading
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        submitBtn.disabled = true;

        // Simulate form submission (replace with real API call)
        setTimeout(() => {
            leadForm.style.display = 'none';
            formSuccess.style.display = 'block';

            // Reset button
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }, 2000);
    }

    // Reset form function (global)
    window.resetForm = function () {
        leadForm.reset();
        leadForm.style.display = 'block';
        formSuccess.style.display = 'none';

        // Clear all errors
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        document.querySelectorAll('.input-wrapper.error').forEach(el => el.classList.remove('error'));
    };

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== LOAN CARD CTA → PREFILL FORM =====
    document.querySelectorAll('.loan-card .btn-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const loanType = btn.closest('.loan-card').getAttribute('data-loan');
            const loanTypeSelect = document.getElementById('loanType');
            if (loanTypeSelect) {
                loanTypeSelect.value = loanType;
            }
        });
    });

    // ===== WHATSAPP TOOLTIP ANIMATION ON FIRST LOAD =====
    const whatsappFloat = document.getElementById('whatsappFloat');
    if (whatsappFloat) {
        setTimeout(() => {
            whatsappFloat.querySelector('.whatsapp-tooltip').style.opacity = '1';
            whatsappFloat.querySelector('.whatsapp-tooltip').style.visibility = 'visible';
            setTimeout(() => {
                whatsappFloat.querySelector('.whatsapp-tooltip').style.opacity = '';
                whatsappFloat.querySelector('.whatsapp-tooltip').style.visibility = '';
            }, 3000);
        }, 4000);
    }
});
