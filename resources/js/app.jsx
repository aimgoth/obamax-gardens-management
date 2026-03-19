import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useState, useEffect } from 'react';

// Read logo URL from blade-injected meta tag
const LOGO_URL = document.querySelector('meta[name="logo-url"]')?.content || '/logo.png';

let loadingTimer = null;

function AppLoadingBar() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const startLoading = () => {
            setLoading(true); setProgress(0);
            let p = 0;
            loadingTimer = setInterval(() => { p += Math.random() * 15; if (p > 90) p = 90; setProgress(p); }, 150);
        };
        const stopLoading = () => {
            clearInterval(loadingTimer); setProgress(100);
            setTimeout(() => { setLoading(false); setProgress(0); }, 400);
        };
        const r1 = router.on('start', startLoading);
        const r2 = router.on('finish', stopLoading);
        return () => { r1(); r2(); clearInterval(loadingTimer); };
    }, []);
    if (!loading && progress === 0) return null;
    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(52,211,153,0.8)' }} />
        </div>
    );
}

function AppSplashScreen({ onDone }) {
    const [fade, setFade] = useState(false);
    useEffect(() => {
        const t1 = setTimeout(() => setFade(true), 3600);
        const t2 = setTimeout(() => onDone(), 4200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a3d20 0%, #0f5030 50%, #0a3d20 100%)',
            transition: 'opacity 0.6s ease', opacity: fade ? 0 : 1, pointerEvents: fade ? 'none' : 'all',
        }}>
            <style>{`
                @keyframes splashPulse { 0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(52,211,153,0.3);} 50%{transform:scale(1.05);box-shadow:0 0 60px rgba(52,211,153,0.7);} }
                @keyframes splashBounce { 0%,80%,100%{transform:translateY(0);opacity:0.5;} 40%{transform:translateY(-14px);opacity:1;} }
                @keyframes splashFadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
                .splash-logo { animation: splashPulse 2s ease-in-out infinite; }
                .splash-title { animation: splashFadeUp 0.7s ease forwards; }
                .splash-sub { animation: splashFadeUp 0.7s 0.2s ease both; }
                .splash-dot1 { animation: splashBounce 1.2s 0s infinite; }
                .splash-dot2 { animation: splashBounce 1.2s 0.2s infinite; }
                .splash-dot3 { animation: splashBounce 1.2s 0.4s infinite; }
            `}</style>
            <img src={LOGO_URL} alt="Logo" className="splash-logo"
                style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)', marginBottom: 24 }} />
            <h1 className="splash-title" style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>Obamax Gardens</h1>
            <p className="splash-sub" style={{ color: '#6ee7b7', fontSize: 15, fontWeight: 500, marginBottom: 32 }}>Management System</p>
            <div style={{ display: 'flex', gap: 10 }}>
                <div className="splash-dot1" style={{ width: 13, height: 13, borderRadius: '50%', background: '#34d399' }}></div>
                <div className="splash-dot2" style={{ width: 13, height: 13, borderRadius: '50%', background: '#6ee7b7' }}></div>
                <div className="splash-dot3" style={{ width: 13, height: 13, borderRadius: '50%', background: '#a7f3d0' }}></div>
            </div>
        </div>
    );
}

function App({ children }) {
    const [splashDone, setSplashDone] = useState(false);
    return (
        <>
            {!splashDone && <AppSplashScreen onDone={() => setSplashDone(true)} />}
            <AppLoadingBar />
            {children}
        </>
    );
}

createInertiaApp({
    title: (title) => `${title} — Obamax Gardens`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App: InertiaApp, props }) {
        const root = createRoot(el);
        root.render(<App><InertiaApp {...props} /></App>);
    },
    progress: false,
});
