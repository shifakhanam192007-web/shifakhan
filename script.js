/**
 * Portfolio JavaScript
 * Vertical Pixel Navigation, Retro Audio FX, Active Scrollspy,
 * Night Mode Toggle & Interactive Chat Terminal
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. RETRO 8-BIT AUDIO SYNTHESIZER (WEB AUDIO API)
    // -------------------------------------------------------------------------
    let soundEnabled = localStorage.getItem('pixel_sfx') !== 'false';
    const soundToggleBtn = document.getElementById('pixel-sound-toggle');
    const soundToggleText = document.getElementById('sound-toggle-text');
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function play8BitBlip(freq = 520, type = 'square', duration = 0.08) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio policy or unsupported
        }
    }

    function play8BitChime() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const notes = [440, 554.37, 659.25];
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    gain.gain.setValueAtTime(0.06, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.12);
                }, idx * 60);
            });
        } catch (e) {
            // Audio fallback
        }
    }

    function updateSoundBtnUI() {
        if (soundToggleBtn && soundToggleText) {
            soundToggleBtn.setAttribute('aria-pressed', String(soundEnabled));
            soundToggleText.textContent = soundEnabled ? 'SFX: ON' : 'SFX: OFF';
            const icon = soundToggleBtn.querySelector('.pixel-sound-icon');
            if (icon) {
                icon.textContent = soundEnabled ? '🔊' : '🔇';
            }
        }
    }

    if (soundToggleBtn) {
        updateSoundBtnUI();
        soundToggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('pixel_sfx', String(soundEnabled));
            updateSoundBtnUI();
            if (soundEnabled) {
                play8BitBlip(640, 'square', 0.1);
            }
        });
    }

    // -------------------------------------------------------------------------
    // 2. NIGHT MODE / THEME TOGGLE LOGIC
    // -------------------------------------------------------------------------
    const themeButtons = [
        document.getElementById('theme-toggle'),
        document.getElementById('mobile-theme-toggle')
    ].filter(Boolean);

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
        play8BitBlip(targetTheme === 'dark' ? 380 : 720, 'square', 0.1);
    }

    themeButtons.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });

    // -------------------------------------------------------------------------
    // 3. VERTICAL SIDEBAR DRAWER & ACCESSIBLE MOBILE NAVIGATION
    // -------------------------------------------------------------------------
    const pixelSidebar = document.getElementById('pixel-sidebar');
    const pixelNavToggle = document.getElementById('pixel-nav-toggle');
    const pixelSidebarClose = document.getElementById('pixel-sidebar-close');
    const pixelOverlay = document.getElementById('pixel-sidebar-overlay');
    const navLinks = document.querySelectorAll('.pixel-nav-link');

    function openMobileSidebar() {
        if (!pixelSidebar) return;
        pixelSidebar.classList.add('open');
        if (pixelOverlay) pixelOverlay.classList.add('active');
        if (pixelNavToggle) pixelNavToggle.setAttribute('aria-expanded', 'true');
        play8BitBlip(480, 'square', 0.08);
    }

    function closeMobileSidebar() {
        if (!pixelSidebar) return;
        pixelSidebar.classList.remove('open');
        if (pixelOverlay) pixelOverlay.classList.remove('active');
        if (pixelNavToggle) pixelNavToggle.setAttribute('aria-expanded', 'false');
    }

    if (pixelNavToggle) {
        pixelNavToggle.addEventListener('click', () => {
            const isOpen = pixelSidebar && pixelSidebar.classList.contains('open');
            if (isOpen) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });
    }

    if (pixelSidebarClose) {
        pixelSidebarClose.addEventListener('click', () => {
            closeMobileSidebar();
            play8BitBlip(320, 'square', 0.06);
        });
    }

    if (pixelOverlay) {
        pixelOverlay.addEventListener('click', closeMobileSidebar);
    }

    // Keyboard support: Escape key closes mobile drawer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pixelSidebar && pixelSidebar.classList.contains('open')) {
            closeMobileSidebar();
        }
    });

    // Close mobile drawer when clicking a navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            play8BitBlip(580, 'square', 0.06);
            if (window.innerWidth < 992) {
                closeMobileSidebar();
            }
        });
    });

    // -------------------------------------------------------------------------
    // 4. SCROLLSPY WITH INTERSECTION OBSERVER FOR ACTIVE LINK
    // -------------------------------------------------------------------------
    const sectionIds = ['hero', 'about', 'skills', 'timeline', 'projects', 'testimonials', 'chat', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        const targetSection = link.getAttribute('data-section');
                        if (targetSection === currentId) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        } else {
                            link.classList.remove('active');
                            link.removeAttribute('aria-current');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => sectionObserver.observe(section));
    }

    // -------------------------------------------------------------------------
    // 5. INTERACTIVE TERMINAL / CHAT SECTION LOGIC
    // -------------------------------------------------------------------------
    const chatContainer = document.getElementById('chat-messages-container');
    const chatForm = document.getElementById('pixel-chat-form');
    const chatInput = document.getElementById('pixel-chat-input');
    const promptButtons = document.querySelectorAll('.pixel-prompt-btn');

    const botKnowledge = {
        skills: "My technical arsenal includes C, C++, Python, Java, JavaScript, Data Structures & Algorithms, Database Management Systems (SQL/MySQL), and Modern Web Development architecture.",
        projects: "Featured projects include: 1) Academic Capstone System with algorithmic optimization, 2) Interactive Responsive Web Applications with RESTful APIs, and 3) Relational Database Management tools.",
        background: "I'm a dedicated Software Engineer specializing in CS fundamentals, computational logic, and clean software systems with a passion for high performance.",
        availability: "Yes! I am actively open to Software Engineering roles, collaborative projects, and tech internships. Let's build something remarkable!",
        contact: "You can reach me directly via email at example@domain.com or via the contact form right below in Section 08!",
        default: "That's a great question! Explore the sections on the left or send me a direct note using the contact form below!"
    };

    function appendMessage(sender, text, isUser = false) {
        if (!chatContainer) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;

        const senderTag = document.createElement('div');
        senderTag.className = 'chat-sender-tag';
        senderTag.innerHTML = isUser 
            ? `<strong>YOU:</strong> <span class="sender-avatar">👤</span>` 
            : `<span class="sender-avatar">👾</span> <strong>SHIFA_BOT:</strong>`;

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.textContent = text;

        const time = document.createElement('time');
        time.className = 'chat-timestamp';
        const now = new Date();
        time.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        msgDiv.appendChild(senderTag);
        msgDiv.appendChild(bubble);
        msgDiv.appendChild(time);

        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function handleUserInput(query) {
        if (!query.trim()) return;
        appendMessage('YOU', query, true);
        play8BitBlip(700, 'square', 0.05);

        // Find best match response
        const lower = query.toLowerCase();
        let reply = botKnowledge.default;

        if (lower.includes('skill') || lower.includes('stack') || lower.includes('language') || lower.includes('tech')) {
            reply = botKnowledge.skills;
        } else if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio') || lower.includes('code')) {
            reply = botKnowledge.projects;
        } else if (lower.includes('background') || lower.includes('about') || lower.includes('timeline') || lower.includes('education')) {
            reply = botKnowledge.background;
        } else if (lower.includes('available') || lower.includes('hire') || lower.includes('role') || lower.includes('opportunity')) {
            reply = botKnowledge.availability;
        } else if (lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('message')) {
            reply = botKnowledge.contact;
        }

        // Simulate retro thinking delay
        setTimeout(() => {
            appendMessage('SHIFA_BOT', reply, false);
            play8BitChime();
        }, 320);
    }

    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (text) {
                handleUserInput(text);
                chatInput.value = '';
            }
        });
    }

    promptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question') || btn.textContent.trim();
            handleUserInput(question);
        });
    });

    // -------------------------------------------------------------------------
    // 6. SKILL CATEGORY FILTER & INTERACTIVE PROGRESS BAR ANIMATIONS
    // -------------------------------------------------------------------------
    const skillFilterButtons = document.querySelectorAll('.pixel-filter-btn');
    const skillCards = document.querySelectorAll('.pixel-skill-card');

    skillFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            
            // Update active states
            skillFilterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            play8BitBlip(600, 'square', 0.05);

            // Filter skill cards
            skillCards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                if (filterValue === 'all' || cardCat === filterValue) {
                    card.classList.remove('hidden');
                    // Retrigger progress bar fill animation
                    const fills = card.querySelectorAll('.pixel-progress-fill');
                    fills.forEach(fill => {
                        const targetW = fill.style.getPropertyValue('--target-width') || '80%';
                        fill.style.width = '0%';
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                fill.style.width = targetW;
                            }, 50);
                        });
                    });
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Subtle audio feedback when hovering skill item rows and timeline cards
    const interactiveCards = document.querySelectorAll('.skill-item-row, .timeline-card');
    interactiveCards.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (soundEnabled) {
                play8BitBlip(720, 'triangle', 0.025);
            }
        });
    });
});
