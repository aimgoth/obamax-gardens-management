import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { logoUrl, desktopApp } = usePage().props;
    const safeLogoUrl = logoUrl || '/logo.png';
    const desktopZipUrl = desktopApp?.zip || '/downloads/Obamax_Gardens_App.zip';
    const desktopExeUrl = desktopApp?.exe || '/downloads/Obamax_Gardens_Setup.exe';
    const handleLogoError = (e) => {
        const img = e.currentTarget;

        if (!img.dataset.fallback) {
            img.dataset.fallback = '1';
            img.src = '/logo.png';
            return;
        }

        if (img.dataset.fallback === '1') {
            img.dataset.fallback = '2';
            img.src = '/logo.jpg';
            return;
        }

        img.style.display = 'none';
    };
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });
    const [showPass, setShowPass] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

    const submit = (e) => { e.preventDefault(); post(route('login')); };

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Figtree', sans-serif" }}>
            <Head title="Login" />

            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeLeft { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
                @keyframes floatLogo { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-12px) scale(1.02);} }
                @keyframes shimmer { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
                @keyframes rotateBadge { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
                @keyframes typewriter { from{width:0;} to{width:100%;} }
                .anim-fadeup-1 { animation: fadeUp 0.7s 0.1s ease both; }
                .anim-fadeup-2 { animation: fadeUp 0.7s 0.3s ease both; }
                .anim-fadeup-3 { animation: fadeUp 0.7s 0.5s ease both; }
                .anim-fadeup-4 { animation: fadeUp 0.7s 0.7s ease both; }
                .anim-fadeup-5 { animation: fadeUp 0.7s 0.9s ease both; }
                .anim-fadeup-6 { animation: fadeUp 0.7s 1.1s ease both; }
                .anim-fadeleft { animation: fadeLeft 0.8s 0.2s ease both; }
                .logo-float { animation: floatLogo 4s ease-in-out infinite; }
                .badge-shimmer { animation: shimmer 2s ease-in-out infinite; }
                .form-f1 { animation: fadeUp 0.6s 0.3s ease both; }
                .form-f2 { animation: fadeUp 0.6s 0.45s ease both; }
                .form-f3 { animation: fadeUp 0.6s 0.6s ease both; }
                .form-f4 { animation: fadeUp 0.6s 0.75s ease both; }
                .form-title { animation: fadeLeft 0.7s 0.1s ease both; }
                @keyframes btnPulse { 0%,100%{box-shadow:0 8px 30px rgba(34,197,94,0.35);} 50%{box-shadow:0 8px 40px rgba(34,197,94,0.6);} }
                .btn-pulse:not(:disabled) { animation: btnPulse 2.5s ease-in-out infinite; }
            `}</style>

            {/* ===== LEFT PANEL ===== */}
            <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #051a0c 0%, #0a3520 30%, #0f4d2e 60%, #063318 100%)' }}>

                {/* Background logo — large, blurred, beautiful */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img src={safeLogoUrl} alt=""
                        onError={handleLogoError}
                        style={{ width: '70%', maxWidth: 520, opacity: 0.08, filter: 'blur(2px) saturate(0.5)', objectFit: 'cover', borderRadius: '50%' }}
                    />
                </div>

                {/* Decorative circles */}
                <div style={{ position:'absolute', top:'-80px', right:'-80px', width:320, height:320, borderRadius:'50%', background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.1)' }}/>
                <div style={{ position:'absolute', bottom:'-100px', left:'-60px', width:400, height:400, borderRadius:'50%', background:'rgba(52,211,153,0.04)', border:'1px solid rgba(52,211,153,0.08)' }}/>
                <div style={{ position:'absolute', top:'40%', left:'-40px', width:200, height:200, borderRadius:'50%', background:'rgba(16,185,129,0.05)' }}/>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center px-14 max-w-lg">
                    {/* Logo */}
                    <div className="logo-float mb-8">
                        <div style={{ width: 160, height: 160, borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(52,211,153,0.5)', boxShadow: '0 0 60px rgba(52,211,153,0.25), 0 20px 60px rgba(0,0,0,0.4)' }}>
                            <img src={safeLogoUrl} alt="Obamax Gardens" onError={handleLogoError} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                    </div>

                    {/* Brand Name */}
                    <h1 className="anim-fadeup-1" style={{ color:'#fff', fontSize: 38, fontWeight: 900, letterSpacing: 1, marginBottom: 8, lineHeight: 1.1 }}>
                        Obamax Gardens
                    </h1>
                    <p className="anim-fadeup-2 badge-shimmer" style={{ color: '#34d399', fontSize: 15, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>
                        ✦ Management System ✦
                    </p>

                    {/* Slogan */}
                    <div className="anim-fadeup-3" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16, padding: '18px 24px', marginBottom: 28 }}>
                        <p style={{ color: '#a7f3d0', fontSize: 18, fontWeight: 600, fontStyle: 'italic', lineHeight: 1.5 }}>
                            "Where Every Day Blooms<br/>with Excellence"
                        </p>
                    </div>

                    {/* Description */}
                    <p className="anim-fadeup-4" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                        Your all-in-one platform for managing bar operations, restaurant services, hotel bookings, and staff — all in one beautiful dashboard.
                    </p>

                    {/* Feature pills */}
                    <div className="anim-fadeup-5" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                        {[['🍺','Bar System'],['🍽️','Restaurant'],['🏨','Hotel'],['👷','Workers'],['📊','Analytics']].map(([icon, label]) => (
                            <span key={label} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 14px', borderRadius: 999,
                                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                                color: '#6ee7b7', fontSize: 13, fontWeight: 600,
                            }}>
                                {icon} {label}
                            </span>
                        ))}
                    </div>

                    {/* Version */}
                    <p className="anim-fadeup-6" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 32 }}>
                        v1.0.0 — Obamax Gardens Ltd. © {new Date().getFullYear()}
                    </p>
                </div>
            </div>

            {/* ===== RIGHT PANEL ===== */}
            <div className="flex-1 flex items-center justify-center p-8 relative"
                style={{ background: 'linear-gradient(160deg, #0f1f14 0%, #111827 50%, #0d1f1a 100%)' }}>

                {/* Subtle grid pattern */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(52,211,153,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

                <div className={`anim-fadeleft relative w-full max-w-md`}>
                    {/* Mobile logo */}
                    <div className="flex flex-col items-center mb-8 lg:hidden">
                        <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(52,211,153,0.5)', marginBottom: 12, boxShadow: '0 0 30px rgba(52,211,153,0.2)' }}>
                            <img src={safeLogoUrl} alt="Obamax Gardens" onError={handleLogoError} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Obamax Gardens</h1>
                        <p style={{ color: '#34d399', fontSize: 13 }}>Management System</p>
                    </div>

                    {/* Form Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 28,
                        padding: '44px 40px',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                    }}>
                        <h2 className="form-title" style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Welcome Back 👋</h2>
                        <p className="form-f1" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32 }}>Sign in to your management account</p>

                        {status && (
                            <div style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: '12px 16px', color: '#6ee7b7', fontSize: 14, marginBottom: 20 }}>
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Email */}
                            <div className="form-f2">
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
                                <input type="email" autoComplete="email" required
                                    value={data.email} onChange={e => setData('email', e.target.value)}
                                    placeholder="manager@obamaxgardens.com"
                                    style={{
                                        width: '100%', padding: '14px 18px', borderRadius: 14, fontSize: 15,
                                        background: 'rgba(255,255,255,0.07)', border: errors.email ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.12)',
                                        color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.6)'}
                                    onBlur={e => e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}
                                />
                                {errors.email && <p style={{ color: '#fca5a5', fontSize: 13, marginTop: 6 }}>{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="form-f3">
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPass ? 'text' : 'password'} autoComplete="current-password" required
                                        value={data.password} onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%', padding: '14px 50px 14px 18px', borderRadius: 14, fontSize: 15,
                                            background: 'rgba(255,255,255,0.07)', border: errors.password ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.12)',
                                            color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.6)'}
                                        onBlur={e => e.target.style.borderColor = errors.password ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, opacity: 0.5 }}>
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && <p style={{ color: '#fca5a5', fontSize: 13, marginTop: 6 }}>{errors.password}</p>}
                            </div>

                            {/* Remember + Forgot */}
                            <div className="form-f4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)}
                                        style={{ width: 16, height: 16, accentColor: '#34d399', cursor: 'pointer' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>Remember me</span>
                                </label>
                                {canResetPassword && (
                                    <a href={route('password.request')} style={{ color: '#34d399', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                                        Forgot password?
                                    </a>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button type="submit" disabled={processing}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: 14, fontSize: 16, fontWeight: 800,
                                    background: processing ? 'rgba(52,211,153,0.4)' : 'linear-gradient(135deg, #22c55e, #059669)',
                                    color: '#fff', border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: processing ? 'none' : '0 8px 30px rgba(34,197,94,0.35)',
                                    transition: 'all 0.2s', letterSpacing: 0.5,
                                }}
                                onMouseEnter={e => { if (!processing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {processing ? (
                                    <>
                                        <svg style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                                            <style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style>
                                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                                            <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : <><span>🔐</span> Sign In to Dashboard</>}
                            </button>

                            <a
                                href={desktopZipUrl}
                                style={{
                                    width: '100%', padding: '13px 14px', borderRadius: 14,
                                    fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none',
                                    color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.35)',
                                    background: 'rgba(52,211,153,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                <span>⬇️</span> Download Desktop App (ZIP)
                            </a>

                            <a
                                href={desktopExeUrl}
                                style={{
                                    width: '100%', padding: '11px 14px', borderRadius: 14,
                                    fontSize: 12, fontWeight: 600, textAlign: 'center', textDecoration: 'none',
                                    color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.18)',
                                    background: 'rgba(255,255,255,0.04)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                <span>🪟</span> Windows Installer (.exe)
                            </a>
                        </form>

                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 28 }}>
                            Obamax Gardens Management System © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
