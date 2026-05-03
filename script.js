// ContextHub Landing — Interactions
(function () {
  'use strict';

  // Sticky nav
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile menu
  const toggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const desktopBP = window.matchMedia('(min-width: 769px)');
  const authModal = document.getElementById('auth-modal');
  const authTriggers = document.querySelectorAll('[data-auth-trigger]');
  const authFocusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let lastAuthFocus = null;

  const updatePageLock = () => {
    const menuOpen = mobileMenu.classList.contains('open');
    const authOpen = authModal && authModal.classList.contains('open');
    document.body.style.overflow = menuOpen || authOpen ? 'hidden' : '';
    document.body.classList.toggle('modal-open', !!authOpen);
  };

  const setMenu = (open) => {
    toggle.classList.toggle('active', open);
    mobileMenu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    updatePageLock();
  };

  const closeAuth = () => {
    if (!authModal || !authModal.classList.contains('open')) return;
    authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', 'true');
    authModal.hidden = true;
    updatePageLock();
    if (lastAuthFocus) lastAuthFocus.focus();
    lastAuthFocus = null;
  };

  const openAuth = () => {
    if (!authModal) return;
    lastAuthFocus = document.activeElement;
    setMenu(false);
    authModal.hidden = false;
    authModal.classList.add('open');
    authModal.setAttribute('aria-hidden', 'false');
    updatePageLock();
    const firstFocus = authModal.querySelector('.provider-btn') || authModal.querySelector('[data-auth-close]');
    if (firstFocus) firstFocus.focus();
  };

  toggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal && authModal.classList.contains('open')) { closeAuth(); return; }
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false);
    if (e.key !== 'Tab' || !authModal || !authModal.classList.contains('open')) return;
    const focusable = [...authModal.querySelectorAll(authFocusable)].filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  desktopBP.addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  authTriggers.forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      openAuth();
    });
  });
  if (authModal) {
    authModal.querySelectorAll('[data-auth-close]').forEach(el => {
      el.addEventListener('click', closeAuth);
    });
  }

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      window.scrollTo({ top: target.offsetTop - 56, behavior: 'smooth' });
    });
  });

  // Scroll reveal
  const targets = document.querySelectorAll('.reveal, .feature-item, .step, .pricing-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    targets.forEach(el => observer.observe(el));
  } else {
    targets.forEach(el => el.classList.add('visible'));
  }

  // Run an animation only while its container is visible in the viewport
  const gateOnVisible = (el, run) => {
    if (!('IntersectionObserver' in window)) { run(); return; }
    let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          io.disconnect();
          run();
        }
      });
    }, { threshold: 0.15 });
    io.observe(el);
  };

  // Animated web editor
  const docMock = document.getElementById('mock-web');
  if (docMock) {
    const reducedDoc = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sleepDoc = (ms) => new Promise(r => setTimeout(r, reducedDoc ? 0 : ms));

    const typingEl = document.getElementById('doc-typing');
    const remote = document.getElementById('doc-remote');
    const ai = document.getElementById('doc-ai');
    const page = docMock.querySelector('.docapp-page');

    const typeText = async (text, perChar = 65) => {
      typingEl.textContent = '';
      for (const ch of text) {
        typingEl.textContent += ch;
        await sleepDoc(perChar + Math.random() * 50);
      }
    };

    const clearText = async (perChar = 30) => {
      while (typingEl.textContent.length > 0) {
        typingEl.textContent = typingEl.textContent.slice(0, -1);
        await sleepDoc(perChar);
      }
    };

    const placeRemoteAt = (targetEl, offsetX = 0, offsetY = 0) => {
      if (!targetEl) return;
      const pageRect = page.getBoundingClientRect();
      const r = targetEl.getBoundingClientRect();
      remote.style.left = (r.left - pageRect.left + offsetX) + 'px';
      remote.style.top = (r.top - pageRect.top + offsetY) + 'px';
    };

    const runDocSequence = async () => {
      while (true) {
        typingEl.textContent = '';
        ai.classList.remove('show');
        remote.classList.remove('show');

        await sleepDoc(600);
        placeRemoteAt(typingEl, 0, -4);
        remote.classList.add('show');
        await sleepDoc(500);

        await typeText('at home');
        await sleepDoc(800);
        await clearText();
        await sleepDoc(200);
        await typeText('3–4 times a week');
        await sleepDoc(900);

        ai.classList.add('show');
        await sleepDoc(4200);

        ai.classList.remove('show');
        remote.classList.remove('show');
        await sleepDoc(700);
      }
    };

    gateOnVisible(docMock, runDocSequence);
  }

  // Animated terminal
  const term = document.getElementById('terminal-body');
  const termMock = document.getElementById('mock-cli');
  if (term && termMock) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sleep = (ms) => new Promise(r => setTimeout(r, reduced ? 0 : ms));
    const waitVisible = () => new Promise(r => {
      if (!document.hidden) return r();
      const on = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', on); r(); } };
      document.addEventListener('visibilitychange', on);
    });

    const cursor = document.createElement('span');
    cursor.className = 'term-cursor';

    const makeLine = (cls = '') => {
      const line = document.createElement('div');
      line.className = 'term-line' + (cls ? ' ' + cls : '');
      term.appendChild(line);
      term.scrollTop = term.scrollHeight;
      return line;
    };

    const addSpan = (line, text, cls = '') => {
      const s = document.createElement('span');
      if (cls) s.className = cls;
      s.textContent = text;
      line.appendChild(s);
      return s;
    };

    const typeInto = async (line, text, perChar = 55) => {
      for (const ch of text) {
        await waitVisible();
        const s = document.createElement('span');
        s.textContent = ch;
        line.insertBefore(s, cursor);
        term.scrollTop = term.scrollHeight;
        await sleep(perChar + Math.random() * 40);
      }
    };

    const runCmd = async (text) => {
      const line = makeLine();
      addSpan(line, '$ ', 'term-prompt');
      line.appendChild(cursor);
      await sleep(350);
      await typeInto(line, text);
      cursor.remove();
      await sleep(220);
    };

    const runOut = async (text, cls) => {
      await waitVisible();
      const line = makeLine();
      addSpan(line, text, cls ? 'term-' + cls : '');
      await sleep(80);
    };

    const runBlank = async () => { makeLine(); await sleep(30); };

    const runChoose = async (options, pick) => {
      const rows = options.map(opt => {
        const l = makeLine();
        const pointer = addSpan(l, '   ', 'term-pointer');
        const label = addSpan(l, opt, 'term-option');
        return { l, pointer, label };
      });
      const last = options.length - 1;
      const path = [];
      for (let i = 0; i <= last; i++) path.push(i);
      for (let i = last - 1; i >= 0; i--) path.push(i);
      path.push(pick);
      for (const idx of path) {
        rows.forEach((r, i) => {
          r.pointer.textContent = i === idx ? ' ❯ ' : '   ';
          r.label.classList.toggle('term-option-active', i === idx);
        });
        await sleep(340);
      }
      await sleep(260);
      rows.forEach(r => r.l.remove());
      const line = makeLine();
      addSpan(line, '✓ ', 'term-ok');
      addSpan(line, 'Agent · ');
      addSpan(line, options[pick], 'term-ok');
      await sleep(120);
    };

    const runInput = async (label, text) => {
      const line = makeLine();
      addSpan(line, label, 'term-prompt-q');
      line.appendChild(cursor);
      await sleep(260);
      await typeInto(line, text, 50);
      cursor.remove();
      await sleep(160);
    };

    const runProgress = async (label, duration) => {
      const line = makeLine();
      const spinner = addSpan(line, '⠋ ', 'term-spin');
      addSpan(line, label + '  ');
      const barFilled = addSpan(line, '', 'term-bar');
      const barEmpty = addSpan(line, '', 'term-bar-empty');
      const pct = addSpan(line, '', 'term-pct');
      const width = 22;
      const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
      const start = performance.now();
      let i = 0;
      while (true) {
        await waitVisible();
        const t = Math.min(1, (performance.now() - start) / duration);
        const filled = Math.floor(t * width);
        barFilled.textContent = '[' + '█'.repeat(filled);
        barEmpty.textContent = '░'.repeat(width - filled) + '] ';
        pct.textContent = Math.floor(t * 100) + '%';
        spinner.textContent = frames[i++ % frames.length] + ' ';
        if (t >= 1) break;
        await sleep(70);
      }
      spinner.textContent = '✓ ';
      spinner.className = 'term-ok';
      await sleep(160);
    };

    const STEPS = [
      { type: 'cmd', text: 'ch init' },
      { type: 'wait', ms: 340 },
      { type: 'out', text: '→ Opening contexthub.one/auth in your browser…', cls: 'dim' },
      { type: 'wait', ms: 800 },
      { type: 'out', text: '✓ Authenticated', cls: 'ok' },
      { type: 'wait', ms: 280 },
      { type: 'blank' },
      { type: 'input', label: '? Project name  ', text: 'cooking-assistant' },
      { type: 'wait', ms: 280 },
      { type: 'blank' },
      { type: 'progress', label: 'Building graph (148 nodes, 412 edges)', duration: 1200 },
      { type: 'out', text: '✓ Linked "cooking-assistant"', cls: 'ok' },
      { type: 'wait', ms: 700 },
      { type: 'blank' },

      { type: 'cmd', text: 'ch sync' },
      { type: 'wait', ms: 260 },
      { type: 'progress', label: 'Pushing graph → pulling Claude files', duration: 1200 },
      { type: 'out', text: '✓ Downloaded 3 files for claude_code', cls: 'ok' },
      { type: 'out', text: '    CLAUDE.md', cls: 'dim' },
      { type: 'out', text: '    .claude/commands/refresh-context.md', cls: 'dim' },
      { type: 'out', text: '    .claude/skills/context-hub/SKILL.md', cls: 'dim' },
      { type: 'wait', ms: 900 },
      { type: 'blank' },

      { type: 'cmd', text: 'ch agent codex' },
      { type: 'wait', ms: 260 },
      { type: 'out', text: '✓ Removed 3 Claude files', cls: 'ok' },
      { type: 'progress', label: 'Pushing graph → pulling Codex files', duration: 1100 },
      { type: 'out', text: '✓ Downloaded 2 files for codex', cls: 'ok' },
      { type: 'out', text: '    AGENTS.md', cls: 'dim' },
      { type: 'out', text: '    .agents/skills/context-hub/SKILL.md', cls: 'dim' },
      { type: 'wait', ms: 2600 },
    ];

    const runSequence = async () => {
      while (true) {
        for (const step of STEPS) {
          switch (step.type) {
            case 'cmd': await runCmd(step.text); break;
            case 'out': await runOut(step.text, step.cls); break;
            case 'blank': await runBlank(); break;
            case 'choose': await runChoose(step.options, step.pick); break;
            case 'input': await runInput(step.label, step.text); break;
            case 'progress': await runProgress(step.label, step.duration); break;
            case 'wait': await sleep(step.ms); break;
          }
        }
        const idle = makeLine();
        addSpan(idle, '$ ', 'term-prompt');
        idle.appendChild(cursor);
        await sleep(reduced ? 2000 : 3200);
        cursor.remove();
        term.innerHTML = '';
        await sleep(400);
      }
    };

    gateOnVisible(termMock, runSequence);
  }
})();
