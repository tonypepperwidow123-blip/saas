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

const tickerTechs = [
  { name: 'WordPress', icon: '🌐' },
  { name: 'React.js', icon: '⚛️' },
  { name: 'PHP Engine', icon: '🐘' },
  { name: 'JavaScript', icon: '🟨' },
  { name: 'GitHub Sync', icon: '🐙' },
  { name: 'Vite.js', icon: '⚡' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'npm packages', icon: '📦' },
  { name: 'Supabase DB', icon: '⚡' },
  { name: 'Secure Stripe', icon: '💳' },
];

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

function InteractiveLicensingShowcase() {
  const [activeKeys, setActiveKeys] = useState(1284);
  const [validationsCount, setValidationsCount] = useState(42.5);
  const [recentRequests, setRecentRequests] = useState([
    { id: 1, domain: 'alpha-wp.org', type: 'OK', color: '#10b981' },
    { id: 2, domain: 'sandbox-site.net', type: 'OK', color: '#10b981' },
    { id: 3, domain: 'staging-client.co', type: 'OK', color: '#10b981' },
  ]);
  const [flashKey, setFlashKey] = useState(false);
  const [flashVal, setFlashVal] = useState(false);

  const domainPool = [
    'mystore.io',
    'test-install.org',
    'dev-env.local',
    'premium-shop.com',
    'api-node.net',
    'client-portal.co',
    'my-wp-blog.com',
    'cart-checkout.info',
    'plugin-test.io'
  ];

  useEffect(() => {
    let idCounter = 4;
    const interval = setInterval(() => {
      const randomDomain = domainPool[Math.floor(Math.random() * domainPool.length)];
      const isRevoked = Math.random() < 0.15;
      const newRequest = {
        id: idCounter++,
        domain: randomDomain,
        type: isRevoked ? 'REVOKED' : 'OK',
        color: isRevoked ? '#f43f5e' : '#10b981'
      };

      setRecentRequests(prev => {
        const updated = [newRequest, ...prev];
        if (updated.length > 3) updated.pop();
        return updated;
      });

      if (!isRevoked) {
        setActiveKeys(prev => prev + (Math.random() > 0.7 ? 1 : 0));
        setFlashKey(true);
        setTimeout(() => setFlashKey(false), 800);
      }
      
      setValidationsCount(prev => parseFloat((prev + 0.1).toFixed(1)));
      setFlashVal(true);
      setTimeout(() => setFlashVal(false), 800);

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="showcase-panel" style={{ width: '100%', maxWidth: '460px', padding: '24px', position: 'relative', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>[ ENGINE // 01 ]</span>
          <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'Syne, sans-serif' }}>Licensing Dashboard</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.8)', animation: 'glow-pulse 2s infinite' }} />
          <span style={{
            fontSize: '9px', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '2px 8px', height: 'max-content', fontFamily: "'Space Mono', monospace"
          }}>
            LIVE MONITOR
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', textAlign: 'left' }}>
        <div style={{
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.04)',
          padding: '12px',
          borderRadius: '10px',
          transition: 'all 0.4s ease',
          boxShadow: flashKey ? '0 0 15px rgba(245, 158, 11, 0.15)' : 'none',
          borderColor: flashKey ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.04)'
        }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: "'Space Mono', monospace" }}>ACTIVE KEYS</span>
          <p style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#f59e0b',
            marginTop: '2px',
            fontFamily: 'Syne, sans-serif',
            transform: flashKey ? 'scale(1.05)' : 'none',
            transition: 'all 0.2s ease',
          }}>{activeKeys}</p>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
            <div className="progress-bar-shimmer" style={{ width: '65%', height: '100%' }} />
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.04)',
          padding: '12px',
          borderRadius: '10px',
          transition: 'all 0.4s ease',
          boxShadow: flashVal ? '0 0 15px rgba(6, 182, 212, 0.15)' : 'none',
          borderColor: flashVal ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255,255,255,0.04)'
        }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: "'Space Mono', monospace" }}>VALIDATIONS</span>
          <p style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#06b6d4',
            marginTop: '2px',
            fontFamily: 'Syne, sans-serif',
            transform: flashVal ? 'scale(1.05)' : 'none',
            transition: 'all 0.2s ease',
          }}>{validationsCount}K</p>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
            <div className="progress-bar-shimmer-cyan" style={{ width: '80%', height: '100%' }} />
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '90px', background: 'rgba(255,255,255,0.005)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '8px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 300 80" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 60 Q 50 30 100 50 T 200 20 T 300 10 L 300 80 L 0 80 Z" fill="url(#chartGrad)" />
          <path d="M 0 60 Q 50 30 100 50 T 200 20 T 300 10" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" />
          <path d="M 0 60 Q 50 30 100 50 T 200 20 T 300 10" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="14 120" className="animate-pulse-dash" style={{ filter: 'drop-shadow(0 0 4px #06b6d4)' }} />
          
          <g className="scanner-sweep-group">
            <line x1="150" y1="5" x2="150" y2="75" stroke="rgba(245, 158, 11, 0.45)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="35" r="4.5" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }} />
          </g>
        </svg>
      </div>

      <div className="showcase-panel" style={{
        position: 'absolute', bottom: '-20px', right: '-20px', width: '210px', padding: '14px',
        background: 'rgba(10,10,15,0.92)', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        zIndex: 5,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span className="status-dot active" />
          <span style={{ fontSize: '9px', fontWeight: '800', fontFamily: "'Space Mono', monospace", color: 'var(--text-primary)' }}>DOMAIN REQUESTS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9.5px', textAlign: 'left', fontFamily: 'monospace' }}>
          {recentRequests.map((req) => (
            <div key={req.id} className="domain-row-enter" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', padding: '2px 4px', borderRadius: '4px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{req.domain}</span>
              <span style={{ color: req.color, fontWeight: '700' }}>{req.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteractiveDeployerShowcase() {
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployState, setDeployState] = useState('PUSHING'); 
  const [version, setVersion] = useState('v2.4.1');
  const [upgradedCount, setUpgradedCount] = useState(1250);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const versionsList = ['v2.4.1', 'v2.4.2', 'v2.4.3', 'v2.5.0'];

  const broadcastLogs = [
    'Connection to endpoint beta-client.org success',
    'Delivering cryptographic signed payload...',
    `Upgraded sandbox-site.net to ${version} [OK]`,
    'Active push on dev-env.local complete',
    'Notified server cluster #12... ok',
    'Package integrity validated at client node',
    `Upgraded alpha-wp.org to ${version} [OK]`,
    `Propagating release ${version} to cluster #3`
  ];

  useEffect(() => {
    let timer;
    let logTimer;
    
    if (deployState === 'PUSHING') {
      timer = setInterval(() => {
        setDeployProgress(prev => {
          const next = prev + Math.floor(Math.random() * 4) + 2;
          if (next >= 100) {
            clearInterval(timer);
            setDeployState('VERIFYING');
            return 100;
          }
          setUpgradedCount(Math.floor(1250 + (next / 100) * 170));
          return next;
        });
      }, 150);

      logTimer = setInterval(() => {
        setActiveLogIndex(prev => (prev + 1) % broadcastLogs.length);
      }, 1300);
    } else if (deployState === 'VERIFYING') {
      timer = setTimeout(() => {
        setDeployState('COMPLETED');
      }, 2000);
    } else if (deployState === 'COMPLETED') {
      timer = setTimeout(() => {
        setDeployState('PUSHING');
        setDeployProgress(0);
        setUpgradedCount(1250);
        setVersion(prev => {
          const currIdx = versionsList.indexOf(prev);
          return versionsList[(currIdx + 1) % versionsList.length];
        });
      }, 3500);
    }

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
      clearTimeout(timer);
    };
  }, [deployState, version]);

  return (
    <div className="showcase-panel" style={{ width: '100%', maxWidth: '460px', padding: '24px', position: 'relative', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>📦</span>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>DEPLOY TARGET</span>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>wp-seo-pro.zip</h4>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: deployState === 'PUSHING' ? '#f59e0b' : deployState === 'VERIFYING' ? '#06b6d4' : '#10b981',
            boxShadow: deployState === 'PUSHING' ? '0 0 6px #f59e0b' : deployState === 'VERIFYING' ? '0 0 6px #06b6d4' : '0 0 6px #10b981',
            animation: 'glow-pulse 2s infinite'
          }} />
          <span style={{
            fontSize: '9px',
            fontWeight: '800',
            fontFamily: "'Space Mono', monospace",
            color: deployState === 'PUSHING' ? '#f59e0b' : deployState === 'VERIFYING' ? '#06b6d4' : '#10b981',
            textTransform: 'uppercase'
          }}>
            {version} {deployState === 'PUSHING' ? 'PUSHING' : deployState === 'VERIFYING' ? 'VERIFYING' : 'RELEASED'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '15px 0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={deployState === 'PUSHING' ? 'animate-float-fast' : ''} style={{ fontSize: '24px' }}>📦</div>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: '700', fontFamily: 'monospace' }}>VAULT</span>
        </div>
        
        <div style={{ flex: 1, height: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '9px', left: 0, right: 0, height: '1.5px', borderTop: '1.5px dashed rgba(255,255,255,0.08)' }} />
          {deployState === 'PUSHING' && (
            <>
              <div className="flow-particle" style={{ animationDelay: '0s' }} />
              <div className="flow-particle" style={{ animationDelay: '0.6s' }} />
              <div className="flow-particle" style={{ animationDelay: '1.2s' }} />
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={deployState === 'COMPLETED' ? 'animate-pulse-glow-cyan' : ''} style={{ fontSize: '24px', filter: deployState === 'COMPLETED' ? 'drop-shadow(0 0 6px #10b981)' : 'none', transition: 'all 0.5s' }}>🌐</div>
          <span style={{ fontSize: '8px', color: deployState === 'COMPLETED' ? '#10b981' : 'var(--text-muted)', fontWeight: '700', fontFamily: 'monospace', transition: 'all 0.3s' }}>CLIENTS</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px', textAlign: 'left' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: "'Space Mono', monospace" }}>
            <span>{deployState === 'PUSHING' ? 'Syncing to clients...' : deployState === 'VERIFYING' ? 'Running integrity check...' : '100% propagated successfully'}</span>
            <span>{deployProgress}%</span>
          </div>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              className={deployState === 'VERIFYING' ? "progress-bar-shimmer-cyan" : "progress-bar-shimmer"}
              style={{
                width: `${deployProgress}%`,
                height: '100%',
                transition: deployState === 'PUSHING' ? 'width 0.15s ease' : 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'left' }}>
        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px', transition: 'all 0.3s ease' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: "'Space Mono', monospace" }}>PROPAGATED</span>
          <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'Syne, sans-serif' }}>
            {deployState === 'COMPLETED' ? '1,420' : upgradedCount}
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: "'Space Mono', monospace" }}>FAILED</span>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#f43f5e', marginTop: '2px', fontFamily: 'Syne, sans-serif' }}>0</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: "'Space Mono', monospace" }}>SUCC. RATE</span>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#10b981', marginTop: '2px', fontFamily: 'Syne, sans-serif' }}>100%</p>
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '8px',
        padding: '10px 14px',
        height: '62px',
        fontFamily: "'Space Mono', 'DM Mono', monospace",
        fontSize: '9px',
        color: 'var(--text-secondary)',
        overflow: 'hidden',
        marginTop: '16px',
        textAlign: 'left',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent2)', fontWeight: 'bold', fontSize: '8px', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase' }}>
          <span>Broadcast Log Stream</span>
          <span style={{ color: deployState === 'PUSHING' ? '#f59e0b' : '#10b981' }}>{deployState}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', transition: 'all 0.3s' }}>
            &gt; {broadcastLogs[activeLogIndex]}
          </div>
          <div style={{ opacity: 0.4 }}>
            &gt; {broadcastLogs[(activeLogIndex + 1) % broadcastLogs.length]}
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractivePipelineShowcase() {
  const [pipelineState, setPipelineState] = useState(0); 
  const [activePlugin, setActivePlugin] = useState('wp-seo-pro.zip');
  const [binaryCode, setBinaryCode] = useState('1 0 1 1 0 0 1 0 1 1');

  const pluginsPool = ['wp-seo-pro.zip', 'woo-cart-booster.zip', 'elementor-ext.zip'];

  useEffect(() => {
    let timer;
    const runPipeline = () => {
      timer = setInterval(() => {
        setPipelineState(prev => {
          if (prev >= 5) {
            clearInterval(timer);
            setTimeout(() => {
              setPipelineState(0);
              setActivePlugin(p => {
                const nextIdx = (pluginsPool.indexOf(p) + 1) % pluginsPool.length;
                return pluginsPool[nextIdx];
              });
            }, 4500);
            return 5;
          }
          return prev + 1;
        });
      }, 2200);
    };

    runPipeline();

    return () => {
      clearInterval(timer);
    };
  }, [activePlugin]);

  useEffect(() => {
    let bTimer;
    if (pipelineState === 2) {
      bTimer = setInterval(() => {
        const next = Array.from({ length: 14 }).map(() => Math.round(Math.random())).join(' ');
        setBinaryCode(next);
      }, 150);
    }
    return () => clearInterval(bTimer);
  }, [pipelineState]);

  return (
    <div className="showcase-panel" style={{ width: '100%', maxWidth: '460px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: "'Space Mono', monospace", color: 'var(--text-secondary)' }}>
          WP-Developer agentic pipeline
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#06b6d4', animation: 'glow-pulse 1.5s infinite' }} />
          <span style={{ fontSize: '8px', fontWeight: '700', color: 'var(--accent2)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>
            AGENT ACTIVE
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', fontSize: '11px', fontFamily: 'monospace', position: 'relative' }}>
        
        {/* Floating animated elements */}
        {pipelineState >= 5 && (
          <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 10, overflow: 'visible' }}>
            <span className="animate-float-coin" style={{ position: 'absolute', right: '30px', bottom: '20px', color: '#10b981', fontSize: '9px', fontWeight: 'bold', fontFamily: "'Space Mono', monospace", animationDelay: '0s' }}>+$49.00</span>
            <span className="animate-float-coin" style={{ position: 'absolute', right: '80px', bottom: '15px', color: '#f59e0b', fontSize: '12px', animationDelay: '0.7s' }}>💰</span>
            <span className="animate-float-coin" style={{ position: 'absolute', right: '140px', bottom: '25px', color: '#10b981', fontSize: '8px', fontWeight: 'bold', fontFamily: "'Space Mono', monospace", animationDelay: '1.4s' }}>+$49.00</span>
          </div>
        )}

        <div style={{
          background: pipelineState >= 1 ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.002)',
          border: '1px solid',
          borderColor: pipelineState >= 1 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
          padding: '10px',
          borderRadius: '8px',
          opacity: pipelineState >= 0 ? 1 : 0.25,
          transition: 'all 0.4s ease',
          transform: pipelineState === 1 ? 'translateY(-2px)' : 'none',
          boxShadow: pipelineState === 1 ? '0 4px 12px rgba(6, 182, 212, 0.08)' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#06b6d4', fontWeight: '700' }}>[AGENT]</span>
            <span style={{
              color: pipelineState >= 1 ? '#10b981' : '#f59e0b',
              fontWeight: '700',
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px'
            }}>
              {pipelineState >= 1 ? 'DISPATCHED' : 'INITIALIZING'}
            </span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
            Bound file {activePlugin} to verification pipeline...
          </span>
        </div>

        <div style={{
          background: pipelineState >= 3 ? 'rgba(255, 255, 255, 0.015)' : pipelineState === 2 ? 'rgba(245, 158, 11, 0.03)' : 'rgba(255, 255, 255, 0.002)',
          border: '1px solid',
          borderColor: pipelineState >= 3 ? 'rgba(16, 185, 129, 0.15)' : pipelineState === 2 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.02)',
          padding: '10px',
          borderRadius: '8px',
          opacity: pipelineState >= 2 ? 1 : 0.25,
          transition: 'all 0.4s ease',
          transform: pipelineState === 2 ? 'translateY(-2px)' : 'none',
          boxShadow: pipelineState === 2 ? '0 4px 12px rgba(245, 158, 11, 0.08)' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#f59e0b', fontWeight: '700' }}>[AUDITOR]</span>
            <span style={{
              color: pipelineState >= 3 ? '#10b981' : '#f59e0b',
              fontWeight: '700',
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px'
            }}>
              {pipelineState >= 3 ? 'PASSED' : pipelineState === 2 ? 'SCANNING' : 'QUEUED'}
            </span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
            {pipelineState >= 3 ? 'Vulnerability scan completed. 0 issues flagged.' : pipelineState === 2 ? 'Analyzing classes, dependencies & PHP code AST...' : 'Awaiting code audit...'}
          </span>
          
          {pipelineState === 2 && (
            <div style={{
              marginTop: '8px',
              fontSize: '8.5px',
              color: '#f59e0b',
              background: 'rgba(0,0,0,0.35)',
              padding: '5px 8px',
              borderRadius: '4px',
              borderLeft: '2px solid #f59e0b',
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.05em',
              transition: 'all 0.15s ease',
              textShadow: '0 0 4px rgba(245, 158, 11, 0.4)'
            }}>
              [SCAN MATRIX]: {binaryCode}
            </div>
          )}
        </div>

        <div style={{
          background: pipelineState >= 5 ? 'rgba(255, 255, 255, 0.015)' : pipelineState === 4 ? 'rgba(6, 182, 212, 0.03)' : 'rgba(255, 255, 255, 0.002)',
          border: '1px solid',
          borderColor: pipelineState >= 5 ? 'rgba(16, 185, 129, 0.15)' : pipelineState === 4 ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.02)',
          padding: '10px',
          borderRadius: '8px',
          opacity: pipelineState >= 4 ? 1 : 0.25,
          transition: 'all 0.4s ease',
          transform: pipelineState === 4 ? 'translateY(-2px)' : 'none',
          boxShadow: pipelineState === 4 ? '0 4px 12px rgba(6, 182, 212, 0.08)' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#06b6d4', fontWeight: '700' }}>[VAULT-PUSH]</span>
            <span style={{
              color: pipelineState >= 5 ? '#10b981' : '#06b6d4',
              fontWeight: '700',
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px'
            }}>
              {pipelineState >= 5 ? 'COMPLETED' : pipelineState === 4 ? 'SYNCING' : 'QUEUED'}
            </span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
            {pipelineState >= 5 ? 'Release live on production vaults.' : pipelineState === 4 ? 'Propagating cryptographically signed zip globally...' : 'Awaiting distribution push...'}
          </span>
          
          {pipelineState === 4 && (
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div className="progress-bar-shimmer-cyan" style={{ width: '100%', height: '100%' }} />
            </div>
          )}
        </div>

        <div style={{
          maxHeight: pipelineState >= 5 ? '100px' : '0px',
          opacity: pipelineState >= 5 ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: pipelineState >= 5 ? '1px solid rgba(245, 158, 11, 0.2)' : 'none',
          padding: pipelineState >= 5 ? '10px' : '0px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
          marginTop: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>💰</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '7.5px', color: '#f59e0b', fontFamily: "'Space Mono', monospace", fontWeight: '700' }}>REVENUE GAINED</span>
              <p style={{ fontSize: '11px', color: '#10b981', fontWeight: '800', margin: 0 }}>Validated node client transaction: +$49.00</p>
            </div>
          </div>
        </div>

      </div>
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

      {/* ── SHOWCASE SECTION 1: LICENSING ──────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.055)', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
            
            {/* Left Column: Copy */}
            <div style={{ textAlign: 'left' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', marginBottom: '20px'
              }}>
                🔑
              </div>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: '800',
                fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: '1.15',
                letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '16px'
              }}>
                Scale with automated license tracking and domain restrictions
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7', marginBottom: '32px' }}>
                Generate cryptographic license keys, bind them to customer domains, and verify active site limits dynamically on all WooCommerce integrations.
              </p>
              <Link to="/register" style={{
                fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700',
                color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Learn How to License
              </Link>
            </div>

            {/* Right Column: Interactive Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <InteractiveLicensingShowcase />
            </div>

          </div>
        </div>
      </section>

      {/* ── SHOWCASE SECTION 2: AUTO-UPDATES ───────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.055)', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
            
            {/* Left Column: Interactive Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <InteractiveDeployerShowcase />
            </div>

            {/* Right Column: Copy */}
            <div style={{ textAlign: 'left' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', marginBottom: '20px'
              }}>
                ⚡
              </div>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: '800',
                fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: '1.15',
                letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '16px'
              }}>
                Push automated updates straight to WordPress dashboards
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7', marginBottom: '32px' }}>
                No manual ZIP uploads required. Once you push a release package, PluginVault handles secure delivery and triggers automated update prompts seamlessly on customer sites.
              </p>
              <Link to="/register" style={{
                fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700',
                color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Learn How to Deploy
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SHOWCASE SECTION 3: DEVELOPER ANALYTICS ────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.055)', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
            
            {/* Left Column: Copy */}
            <div style={{ textAlign: 'left' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', marginBottom: '20px'
              }}>
                📊
              </div>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: '800',
                fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: '1.15',
                letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '16px'
              }}>
                Manage plugins, approvals, and daily revenues with ease
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7', marginBottom: '32px' }}>
                Submit plugins to the admin review pipeline, monitor approval states, and review complete downloads, activations, and earnings records.
              </p>
              <Link to="/register" style={{
                fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700',
                color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Learn How to Build
              </Link>
            </div>

            {/* Right Column: Interactive Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <InteractivePipelineShowcase />
            </div>

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