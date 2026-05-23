import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Key, Zap, Shield, Sparkles, Cpu, Layers } from 'lucide-react';

const features = [
  {
    icon: '🔑',
    title: 'License Management',
    description: 'Generate secure license keys, control activation limits, and manage licenses across all your customers.',
  },
  {
    icon: '⚡',
    title: 'Automatic Updates',
    description: 'WordPress plugins built on PluginVault receive updates directly from your hosted files — no manual uploads.',
  },
  {
    icon: '🔒',
    title: 'Secure Delivery',
    description: 'Plugin ZIPs are stored in private storage with time-limited signed URLs. No public access.',
  },
  {
    icon: '✅',
    title: 'Admin Moderation',
    description: 'Every plugin goes through approval before appearing in the marketplace. Quality guaranteed.',
  },
  {
    icon: '📊',
    title: 'Developer Analytics',
    description: 'Track downloads, activations, and revenue for each plugin with detailed charts.',
  },
  {
    icon: '🛍️',
    title: 'Customer Portal',
    description: 'Customers get a unified dashboard to manage all their plugin licenses and activations.',
  },
];

const stats = [
  { label: 'Plugins Available', value: '200+' },
  { label: 'Active Developers', value: '80+' },
  { label: 'Licenses Issued', value: '2K+' },
];

const typewriterWords = ['WordPress Plugins.', 'SaaS Products.', 'Secure Licenses.', 'Automatic Updates.'];

function TypewriterHeadline() {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === typewriterWords[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2200);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % typewriterWords.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : 90);

    return () => clearTimeout(timeout);
  }, [subIndex, reverse, index]);

  return (
    <span style={{
      background: 'linear-gradient(135deg, #f59e0b 0%, #fde68a 50%, #06b6d4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      display: 'inline-block',
      position: 'relative',
    }}>
      {typewriterWords[index].substring(0, subIndex)}
      <span className="typing-cursor" />
    </span>
  );
}

function AnimatedCounter({ value, duration = 1200 }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const suffix = value.replace(/[0-9]/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (start === end) return;

    const incrementTime = Math.max(Math.floor(duration / end), 12);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [numericValue, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

function InteractiveParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 40;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = canvasRef.current.offsetWidth;
      height = canvasRef.current.height = canvasRef.current.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle shifting lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.08;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  );
}

const initialLogs = [
  { text: '$ pluginvault init --env=production', type: 'cmd' },
  { text: '[SYSTEM] Initializing WordPress credentials...', type: 'info' },
  { text: '[SUCCESS] Cryptographic vault bound successfully.', type: 'success' },
];

const mockLogsPool = [
  { text: '$ pluginvault keys --generate --limit=5', type: 'cmd' },
  { text: '[KEYGEN] Generating 5 activation licenses...', type: 'info' },
  { text: '[KEYGEN] Created: lic_7f8d22... [OK]', type: 'success' },
  { text: '$ pluginvault deploy --plugin=wp-seo-pro.zip', type: 'cmd' },
  { text: '[VAULT] Syncing zip file to encrypted vaults...', type: 'info' },
  { text: '[VAULT] Hashing: md5_8b72c9... [OK]', type: 'success' },
  { text: '[VAULT] Dispatching auto-update notification...', type: 'info' },
  { text: '[SUCCESS] Direct update package ready for active sites.', type: 'success' },
  { text: '$ pluginvault monitor --active-licenses', type: 'cmd' },
  { text: '[MONITOR] Connection established to WordPress API...', type: 'info' },
  { text: '[VERIFY] site.com - matched key [ACTIVE]', type: 'success' },
];

function ConsoleSimulator() {
  const [logs, setLogs] = useState(initialLogs);
  const containerRef = useRef(null);

  useEffect(() => {
    let poolIndex = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextLogs = [...prev, mockLogsPool[poolIndex]];
        if (nextLogs.length > 8) nextLogs.shift();
        return nextLogs;
      });
      poolIndex = (poolIndex + 1) % mockLogsPool.length;
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="console-container" style={{ width: '100%', minWidth: '290px', height: '280px', display: 'flex', flexDirection: 'column', fontSize: '11px', textAlign: 'left' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <span className="console-dot red" />
          <span className="console-dot yellow" />
          <span className="console-dot green" />
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: '600', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
          wp_terminal.log
        </span>
      </div>

      {/* Body */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          lineHeight: '1.8',
          scrollbarWidth: 'none',
        }}
      >
        {logs.map((log, i) => (
          <div 
            key={i} 
            style={{
              color: log.type === 'cmd' 
                ? '#f59e0b' 
                : log.type === 'success' 
                  ? '#10b981' 
                  : 'var(--text-secondary)',
              fontFamily: "'Space Mono', 'DM Mono', monospace",
              letterSpacing: '0.02em',
              animation: 'fade-in 0.2s ease-out forwards',
            }}
          >
            {log.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectionHub() {
  return (
    <div className="console-container" style={{ width: '100%', minWidth: '290px', height: '280px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg 
        viewBox="0 0 400 300" 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          inset: 0,
          zIndex: 1,
        }}
      >
        {/* Core central rings */}
        <circle cx="200" cy="150" r="48" stroke="rgba(245, 158, 11, 0.12)" strokeWidth="6" fill="none" />
        <circle cx="200" cy="150" r="40" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" fill="rgba(10, 10, 15, 0.8)" />

        {/* Lines */}
        <line x1="200" y1="110" x2="200" y2="48" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse-dash" />
        <line x1="230" y1="126" x2="310" y2="76" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse-dash" />
        <line x1="230" y1="174" x2="310" y2="224" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse-dash" />
        <line x1="200" y1="190" x2="200" y2="252" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse-dash" />
        <line x1="170" y1="174" x2="90" y2="224" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse-dash" />
        <line x1="170" y1="126" x2="90" y2="76" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse-dash" />

        {/* Nodes */}
        <circle cx="200" cy="40" r="4" fill="#f59e0b" />
        <text x="200" y="28" fill="var(--text-secondary)" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="'Space Mono', monospace">LICENSING</text>

        <circle cx="320" cy="70" r="4" fill="#06b6d4" />
        <text x="330" y="74" fill="var(--text-secondary)" fontSize="9" fontWeight="600" textAnchor="start" fontFamily="'Space Mono', monospace">UPDATES</text>

        <circle cx="320" cy="230" r="4" fill="#f59e0b" />
        <text x="330" y="234" fill="var(--text-secondary)" fontSize="9" fontWeight="600" textAnchor="start" fontFamily="'Space Mono', monospace">VAULT</text>

        <circle cx="200" cy="260" r="4" fill="#06b6d4" />
        <text x="200" y="274" fill="var(--text-secondary)" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="'Space Mono', monospace">PORTAL</text>

        <circle cx="80" cy="230" r="4" fill="#f59e0b" />
        <text x="70" y="234" fill="var(--text-secondary)" fontSize="9" fontWeight="600" textAnchor="end" fontFamily="'Space Mono', monospace">DELIVERY</text>

        <circle cx="80" cy="70" r="4" fill="#06b6d4" />
        <text x="70" y="74" fill="var(--text-secondary)" fontSize="9" fontWeight="600" textAnchor="end" fontFamily="'Space Mono', monospace">ANALYTICS</text>

        <text x="200" y="146" fill="#f59e0b" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="'Syne', sans-serif" letterSpacing="0.05em">CORE</text>
        <text x="200" y="158" fill="var(--text-primary)" fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="'Space Mono', monospace">VAULT</text>
      </svg>
    </div>
  );
}

function DeveloperInspector() {
  const [activeTab, setActiveTab] = useState('cli');

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(255, 255, 255, 0.015)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '3px',
        marginBottom: '16px',
      }}>
        <button
          onClick={() => setActiveTab('cli')}
          style={{
            padding: '6px 14px',
            borderRadius: '9px',
            border: 'none',
            background: activeTab === 'cli' ? 'var(--accent-dim)' : 'transparent',
            color: activeTab === 'cli' ? 'var(--accent)' : 'var(--text-secondary)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            border: activeTab === 'cli' ? '1px solid var(--border-accent)' : '1px solid transparent',
            transition: 'all 0.18s ease',
          }}
        >
          console.log
        </button>
        <button
          onClick={() => setActiveTab('map')}
          style={{
            padding: '6px 14px',
            borderRadius: '9px',
            border: 'none',
            background: activeTab === 'map' ? 'var(--accent-dim)' : 'transparent',
            color: activeTab === 'map' ? 'var(--accent)' : 'var(--text-secondary)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            border: activeTab === 'map' ? '1px solid var(--border-accent)' : '1px solid transparent',
            transition: 'all 0.18s ease',
          }}
        >
          vault_map.svg
        </button>
      </div>
      {activeTab === 'cli' ? <ConsoleSimulator /> : <ConnectionHub />}
    </div>
  );
}

export default function Home() {
  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '100px 24px 80px', overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%)',
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
          bottom: '-100px', right: '-100px',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Interactive canvas starfield network background */}
        <InteractiveParticles />

        {/* Decorative Floating Cyber Rings */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Cyber Ring 1 (Amber) */}
          <div className="animate-spin-slow animate-float-slow" style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(245, 158, 11, 0.08)',
            top: '8%',
            left: '-60px',
          }} />

          {/* Cyber Ring 2 (Cyan) */}
          <div className="animate-spin-slow animate-float-medium" style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            border: '1.5px solid rgba(6, 182, 212, 0.04)',
            bottom: '-80px',
            right: '-100px',
          }} />
        </div>

        {/* Floating Glass Orbs with Lucide Icons */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          {/* Orb 1: Key (Amber) */}
          <div 
            className="glass-orb animate-float-slow animate-float-x-slow"
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              top: '15%',
              left: '8%',
              '--accent-border': 'rgba(245, 158, 11, 0.4)',
              '--accent-glow-color': 'rgba(245, 158, 11, 0.25)',
              pointerEvents: 'auto',
            }}
          >
            <Key style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
          </div>

          {/* Orb 2: Zap (Cyan) */}
          <div 
            className="glass-orb animate-float-medium animate-float-x-medium"
            style={{
              position: 'absolute',
              width: '74px',
              height: '74px',
              top: '55%',
              left: '12%',
              '--accent-border': 'rgba(6, 182, 212, 0.4)',
              '--accent-glow-color': 'rgba(6, 182, 212, 0.25)',
              pointerEvents: 'auto',
            }}
          >
            <Zap style={{ width: '30px', height: '30px', color: '#06b6d4' }} />
          </div>

          {/* Orb 3: Shield (Amber) */}
          <div 
            className="glass-orb animate-float-fast animate-float-x-slow"
            style={{
              position: 'absolute',
              width: '54px',
              height: '54px',
              top: '25%',
              right: '10%',
              '--accent-border': 'rgba(245, 158, 11, 0.4)',
              '--accent-glow-color': 'rgba(245, 158, 11, 0.25)',
              pointerEvents: 'auto',
            }}
          >
            <Shield style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
          </div>

          {/* Orb 4: Cpu (Cyan) */}
          <div 
            className="glass-orb animate-float-slow animate-float-x-medium"
            style={{
              position: 'absolute',
              width: '68px',
              height: '68px',
              top: '60%',
              right: '14%',
              '--accent-border': 'rgba(6, 182, 212, 0.4)',
              '--accent-glow-color': 'rgba(6, 182, 212, 0.25)',
              pointerEvents: 'auto',
            }}
          >
            <Cpu style={{ width: '26px', height: '26px', color: '#06b6d4' }} />
          </div>

          {/* Orb 5: Sparkles (Amber) */}
          <div 
            className="glass-orb animate-float-medium"
            style={{
              position: 'absolute',
              width: '48px',
              height: '48px',
              top: '8%',
              left: '42%',
              '--accent-border': 'rgba(245, 158, 11, 0.3)',
              '--accent-glow-color': 'rgba(245, 158, 11, 0.15)',
              pointerEvents: 'auto',
            }}
          >
            <Sparkles style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
          </div>

          {/* Orb 6: Layers (Cyan) */}
          <div 
            className="glass-orb animate-float-fast"
            style={{
              position: 'absolute',
              width: '50px',
              height: '50px',
              top: '78%',
              right: '45%',
              '--accent-border': 'rgba(6, 182, 212, 0.3)',
              '--accent-glow-color': 'rgba(6, 182, 212, 0.15)',
              pointerEvents: 'auto',
            }}
          >
            <Layers style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2, padding: '0 16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '60px',
            alignItems: 'center',
            textAlign: 'left',
          }}>
            {/* Left Column: Headline and actions */}
            <div>
              {/* Eyebrow tag */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '20px',
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                marginBottom: '28px',
                animation: 'fade-in 0.5s ease forwards',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.8)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  WP AGENT OS // v2.0.0
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: '800',
                fontSize: 'clamp(36px, 5.5vw, 62px)',
                lineHeight: '1.08',
                letterSpacing: '-0.04em',
                color: 'var(--text-primary)',
                marginBottom: '24px',
                animation: 'fade-in 0.5s 0.1s ease forwards',
                opacity: 1,
              }}>
                Sell. License. Update.
                <br />
                <TypewriterHeadline />
              </h1>

              {/* Subheadline */}
              <p style={{
                maxWidth: '520px',
                fontSize: '16px',
                lineHeight: '1.7',
                color: 'var(--text-secondary)',
                fontFamily: 'DM Sans, sans-serif',
                animation: 'fade-in 0.5s 0.2s ease forwards',
                opacity: 1,
                marginBottom: '40px',
              }}>
                PluginVault gives WordPress developers a reliable, self-hosted infrastructure to sell, license, and auto-deliver plugin updates.
              </p>

              {/* CTAs */}
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                animation: 'fade-in 0.5s 0.3s ease forwards',
                opacity: 1,
              }}>
                <Link
                  to="/register"
                  style={{
                    padding: '13px 28px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: 'DM Sans, sans-serif',
                    textDecoration: 'none',
                    boxShadow: '0 0 24px rgba(245,158,11,0.35), 0 4px 16px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(245,158,11,0.5), 0 8px 24px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(245,158,11,0.35), 0 4px 16px rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'none'; }}
                >
                  Start for Free
                  <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/shop"
                  style={{
                    padding: '13px 28px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'DM Sans, sans-serif',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  Browse Plugins
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Developer Inspector */}
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'fade-in 0.5s 0.2s ease forwards' }}>
              <DeveloperInspector />
            </div>
          </div>

          {/* Centered Stats strip wrapper */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            {/* Stats strip */}
            <div style={{
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '60px',
              marginTop: '64px',
              padding: '20px 48px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.005) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              flexWrap: 'wrap',
              animation: 'fade-in 0.5s 0.4s ease forwards',
              opacity: 1,
            }}>
              {stats.map(({ label, value }, idx) => (
                <div key={label} style={{ textAlign: 'center', minWidth: '120px', position: 'relative' }}>
                  <p style={{ 
                    fontFamily: 'Syne, sans-serif', 
                    fontWeight: '800', 
                    fontSize: '34px', 
                    color: '#f59e0b', 
                    letterSpacing: '-0.04em',
                    textShadow: '0 0 16px rgba(245, 158, 11, 0.35)',
                    marginBottom: '2px',
                  }}>
                    <AnimatedCounter value={value} />
                  </p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-secondary)', 
                    fontFamily: 'DM Sans, sans-serif', 
                    fontWeight: '600',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Logo Ticker */}
      <div className="ticker-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.035)', borderBottom: '1px solid rgba(255,255,255,0.035)', background: 'rgba(255,255,255,0.005)' }}>
        <div className="ticker-track">
          {[...tickerTechs, ...tickerTechs].map((tech, i) => (
            <div key={i} className="ticker-item" style={{ fontFamily: 'Syne, sans-serif' }}>
              <span style={{ fontSize: '18px', marginRight: '6px' }}>{tech.icon}</span>
              <span style={{ 
                background: i % 2 === 0 ? 'linear-gradient(90deg, #f59e0b, #fde68a)' : 'linear-gradient(90deg, #06b6d4, #a5f3fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>


      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.055)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: '800',
              fontSize: 'clamp(28px, 4vw, 44px)',
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              marginBottom: '14px',
            }}>
              Built for developers,
              <br />
              <span style={{ color: 'var(--accent)' }}>designed for scale</span>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
              Everything you need to monetize your WordPress plugins
            </p>
          </div>

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseMove={handleCardMouseMove}
                className="inspector-card"
                style={{
                  padding: '28px',
                  background: 'radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(245, 158, 11, 0.08), transparent 75%), rgba(255, 255, 255, 0.01)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                  animationDelay: `${index * 0.07}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.28)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.45), 0 0 25px rgba(245,158,11,0.08)';
                  const icon = e.currentTarget.querySelector('.feature-icon-wrapper');
                  if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(6deg)';
                    icon.style.background = 'rgba(245,158,11,0.15)';
                    icon.style.borderColor = 'rgba(245,158,11,0.3)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  const icon = e.currentTarget.querySelector('.feature-icon-wrapper');
                  if (icon) {
                    icon.style.transform = 'none';
                    icon.style.background = 'rgba(245,158,11,0.08)';
                    icon.style.borderColor = 'rgba(245,158,11,0.15)';
                  }
                }}
              >
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '9px',
                  fontWeight: '600',
                  color: '#06b6d4',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  [ MODULE 0{index + 1} ]
                </span>
                <div 
                  className="feature-icon-wrapper"
                  style={{
                    width: '46px', height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '16px',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {feature.icon}
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.65' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.055)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: '800',
            fontSize: 'clamp(28px, 4vw, 44px)',
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>
            Ready to launch your plugin business?
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '36px' }}>
            Join hundreds of WordPress developers already selling on PluginVault.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                padding: '13px 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'none',
                boxShadow: '0 0 28px rgba(245,158,11,0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(245,158,11,0.35)'; e.currentTarget.style.transform = 'none'; }}
            >
              Create Developer Account
            </Link>
            <Link
              to="/pricing"
              style={{
                padding: '13px 28px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}