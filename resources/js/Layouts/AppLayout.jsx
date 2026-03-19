import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

/* ── Animated nav button base styles ── */
const navBtnBase = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12,
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    border: 'none', whiteSpace: 'nowrap',
    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    position: 'relative', letterSpacing: 0.2,
};

function DropdownMenu({ item, isOpen, onToggle, animIdx }) {
    const ref = useRef(null);
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        const handler = (e) => {
            if (isOpen && ref.current && !ref.current.contains(e.target)) onToggle(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const isChildActive = item.children?.some(c => {
        try { return currentUrl === new URL(c.href()).pathname; } catch { return false; }
    });

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => onToggle(item.key)}
                style={{
                    ...navBtnBase,
                    background: isOpen || isChildActive ? 'rgba(52,211,153,0.18)' : 'transparent',
                    color: isOpen || isChildActive ? '#34d399' : 'rgba(255,255,255,0.9)',
                    transform: 'scale(1)',
                    animation: `navIn 0.4s ${animIdx * 0.08}s ease both`,
                    boxShadow: isOpen || isChildActive ? '0 4px 16px rgba(52,211,153,0.15)' : 'none',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.07) translateY(-1px)';
                    if (!isOpen && !isChildActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.background = isOpen || isChildActive ? 'rgba(52,211,153,0.18)' : 'transparent';
                    e.currentTarget.style.boxShadow = isOpen || isChildActive ? '0 4px 16px rgba(52,211,153,0.15)' : 'none';
                }}
            >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
                <span style={{
                    fontSize: 11, marginLeft: 2,
                    transition: 'transform 0.25s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: 210, zIndex: 1000,
                    background: 'linear-gradient(135deg, #0a2d18, #0d3d22)',
                    border: '1px solid rgba(52,211,153,0.25)', borderRadius: 16,
                    boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                    animation: 'ddIn 0.2s ease',
                }}>
                    <div style={{ padding: 8 }}>
                        {item.children.map((child, i) => {
                            let isActive = false;
                            try { isActive = currentUrl === new URL(child.href()).pathname; } catch {}
                            return (
                                <a key={i}
                                    href={child.href()}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(null); window.location.assign(child.href()); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '11px 16px', borderRadius: 11, fontSize: 15, fontWeight: 600,
                                        color: isActive ? '#34d399' : 'rgba(255,255,255,0.85)',
                                        background: isActive ? 'rgba(52,211,153,0.14)' : 'transparent',
                                        textDecoration: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.paddingLeft = '20px'; } }}
                                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '16px'; } }}
                                >
                                    <span style={{ fontSize: 17 }}>{child.icon}</span>
                                    <span>{child.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AppLayout({ title, children }) {
    const { auth, logoUrl } = usePage().props;
    const safeLogoUrl = logoUrl || '/logo.png';
    const [openMenu, setOpenMenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(false);
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantQuestion, setAssistantQuestion] = useState('');
    const [assistantMessages, setAssistantMessages] = useState([
        {
            role: 'assistant',
            text: 'I am your live Obamax assistant. Ask about revenue, stock, workers, bookings, updates, or how to use any module.',
            meta: null,
        },
    ]);

    const navItems = [
        { key: 'workers', label: 'Workers', icon: '👷', href: () => route('workers.index') },
        {
            key: 'bar', label: 'Bar', icon: '🍺',
            children: [
                { label: 'Drink Setup',     icon: '🥃', href: () => route('bar.drinks.index') },
                { label: 'Depot Inventory', icon: '🏭', href: () => route('bar.depot.index') },
                { label: 'Issue to Bar',    icon: '📦', href: () => route('bar.issuance.index') },
                { label: 'Stock Taking',    icon: '📋', href: () => route('bar.stocktaking.index') },
                { label: 'Daily Closing',   icon: '🔒', href: () => route('bar.closing.index') },
            ],
        },
        {
            key: 'restaurant', label: 'Restaurant', icon: '🍽️',
            children: [
                { label: 'Food Item Setup',  icon: '🥘', href: () => route('restaurant.items.index') },
                { label: 'Inventory',        icon: '🏪', href: () => route('restaurant.inventory.index') },
                
                { label: 'Daily Closing',    icon: '🔒', href: () => route('restaurant.closing.index') },
            ],
        },
        {
            key: 'hotel', label: 'Hotel', icon: '🏨',
            children: [
                { label: 'Room Setup',    icon: '🛏️', href: () => route('hotel.rooms.index') },
                { label: 'Bookings',      icon: '📅', href: () => route('hotel.bookings.index') },
                { label: 'Daily Closing', icon: '🔒', href: () => route('hotel.closing.index') },
            ],
        },
        {
            key: 'archive', label: 'Archive', icon: '🗂️',
            children: [
                { label: 'Restaurant Reports', icon: '🍽️', href: () => route('archive.restaurant') },
                { label: 'Hotel Closings',     icon: '🏨', href: () => route('archive.hotel') },
                { label: 'Bar Closings',       icon: '🍺', href: () => route('archive.bar') },
                { label: 'Monthly Revenue',    icon: '📅', href: () => route('archive.monthly') },
            ],
        },
    ];
    const userRef = useRef(null);
    const assistantRef = useRef(null);
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    const assistantQuickPrompts = [
        'How to use this software?',
        'Today total revenue?',
        'Any low stock drinks?',
        'Latest updates now?',
    ];

    useEffect(() => {
        const handler = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (assistantOpen && assistantRef.current && !assistantRef.current.contains(e.target)) {
                setAssistantOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [assistantOpen]);

    const isActive = (href) => {
        try { return currentUrl === new URL(href()).pathname; } catch { return false; }
    };

    const userName = auth?.user?.name || 'Manager';
    const userInitial = userName.charAt(0).toUpperCase();

    const askAssistant = async (rawQuestion) => {
        const q = (rawQuestion ?? assistantQuestion).trim();
        if (!q || assistantLoading) return;

        setAssistantMessages((prev) => [...prev, { role: 'user', text: q, meta: null }]);
        setAssistantQuestion('');
        setAssistantLoading(true);

        try {
            const response = await window.axios.post(route('assistant.ask'), { question: q });
            const payload = response.data;

            setAssistantMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: payload.answer,
                    meta: `Scope: ${payload.scope} | Updated: ${payload.generated_at}`,
                },
            ]);
        } catch (error) {
            const message = error?.response?.data?.message || 'Assistant request failed. Please try again.';
            setAssistantMessages((prev) => [
                ...prev,
                { role: 'assistant', text: message, meta: 'Error' },
            ]);
        } finally {
            setAssistantLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#f9fafb' }}>

            <style>{`
                @keyframes navIn { from { opacity:0; transform:translateY(-12px) scale(0.92); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes ddIn  { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
            `}</style>

            {/* ===== TOP NAVBAR ===== */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'linear-gradient(90deg, #041610 0%, #083020 40%, #0a3a22 70%, #061e10 100%)',
                borderBottom: '1px solid rgba(52,211,153,0.18)',
                boxShadow: '0 6px 30px rgba(0,0,0,0.4)',
                height: 72,
                display: 'flex', alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 24px' }}>

                    {/* ── LEFT: Brand ── */}
                    <Link href={route('dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0, minWidth: 200 }}>
                        <img src={safeLogoUrl} alt="Obamax"
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid rgba(52,211,153,0.55)', boxShadow: '0 0 16px rgba(52,211,153,0.25)' }}
                            onError={(e) => {
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
                            }}
                        />
                        <div>
                            <div style={{ color: '#fff', fontWeight: 900, fontSize: 17, lineHeight: 1.1 }}>Obamax Gardens</div>
                            <div style={{ color: '#34d399', fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>MANAGEMENT SYSTEM</div>
                        </div>
                    </Link>

                    {/* ── CENTER: Nav Items ── */}
                    <div className="hidden lg:flex" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                        {navItems.map((item, idx) => item.children ? (
                            <DropdownMenu key={item.key} item={item} isOpen={openMenu === item.key} onToggle={setOpenMenu} animIdx={idx} />
                        ) : (
                            <Link key={item.key} href={item.href()}
                                style={{
                                    ...navBtnBase,
                                    background: isActive(item.href) ? 'rgba(52,211,153,0.18)' : 'transparent',
                                    color: isActive(item.href) ? '#34d399' : 'rgba(255,255,255,0.9)',
                                    textDecoration: 'none',
                                    animation: `navIn 0.4s ${idx * 0.08}s ease both`,
                                    boxShadow: isActive(item.href) ? '0 4px 16px rgba(52,211,153,0.15)' : 'none',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.07) translateY(-1px)';
                                    if (!isActive(item.href)) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                    e.currentTarget.style.background = isActive(item.href) ? 'rgba(52,211,153,0.18)' : 'transparent';
                                    e.currentTarget.style.boxShadow = isActive(item.href) ? '0 4px 16px rgba(52,211,153,0.15)' : 'none';
                                }}
                            >
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* ── RIGHT: User ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, minWidth: 200, justifyContent: 'flex-end' }}>
                        {/* Date */}
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 500 }} className="hidden xl:block">
                            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>

                        {/* User Menu */}
                        <div ref={userRef} style={{ position: 'relative' }}>
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 8px',
                                    borderRadius: 14, border: '1.5px solid rgba(52,211,153,0.25)',
                                    background: 'rgba(52,211,153,0.08)', cursor: 'pointer',
                                    transition: 'all 0.18s', animation: 'navIn 0.5s 0.3s ease both',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.16)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                <div style={{
                                    width: 34, height: 34, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#34d399,#059669)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 900, fontSize: 15,
                                    boxShadow: '0 2px 8px rgba(52,211,153,0.4)',
                                }}>
                                    {userInitial}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{userName}</div>
                                    <div style={{ color: '#34d399', fontSize: 11, fontWeight: 600 }}>Administrator</div>
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
                            </button>

                            {userMenuOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 200, zIndex: 1000,
                                    background: 'linear-gradient(135deg, #0a2d18, #0d3d22)',
                                    border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16,
                                    boxShadow: '0 24px 60px rgba(0,0,0,0.55)', padding: 8,
                                    animation: 'navIn 0.2s ease both',
                                }}>
                                    <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 6 }}>
                                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{userName}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{auth?.user?.email}</div>
                                    </div>
                                    <button
                                        onClick={() => { setUserMenuOpen(false); router.visit(route('profile.index')); }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '11px 14px', borderRadius: 11, fontSize: 15, fontWeight: 700,
                                            color: 'rgba(255,255,255,0.85)', background: 'transparent',
                                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.paddingLeft = '18px'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '14px'; }}
                                    >
                                        <span>👤</span><span>My Profile</span>
                                    </button>
                                    <Link href={route('logout')} method="post" as="button"
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '11px 14px', borderRadius: 11, fontSize: 15, fontWeight: 700,
                                            color: '#fca5a5', background: 'transparent',
                                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.paddingLeft = '18px'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '14px'; }}
                                    >
                                        <span>🚪</span><span>Sign Out</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden"
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 24 }}>
                            {mobileOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div style={{ background: 'linear-gradient(135deg,#072d17,#0a3520)', borderBottom: '1px solid rgba(52,211,153,0.15)', padding: '12px 16px' }} className="lg:hidden">
                    {navItems.map(item => (
                        <div key={item.key}>
                            {item.children ? (
                                <div>
                                    <button onClick={() => setOpenMenu(openMenu === item.key ? null : item.key)}
                                        style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:12, background:'transparent', border:'none', color:'rgba(255,255,255,0.9)', fontSize:16, fontWeight:700, cursor:'pointer', textAlign:'left' }}>
                                        <span style={{ fontSize: 18 }}>{item.icon}</span><span>{item.label}</span>
                                        <span style={{ marginLeft:'auto', fontSize:11 }}>{openMenu === item.key ? '▲' : '▼'}</span>
                                    </button>
                                    {openMenu === item.key && (
                                        <div style={{ paddingLeft: 28 }}>
                                            {item.children.map((c, i) => (
                                                <Link key={i} href={c.href()} onClick={() => setMobileOpen(false)}
                                                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, color:'rgba(255,255,255,0.75)', fontSize:15, textDecoration:'none' }}>
                                                    <span style={{ fontSize: 16 }}>{c.icon}</span><span>{c.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href={item.href()} onClick={() => setMobileOpen(false)}
                                    style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:12, color:'rgba(255,255,255,0.9)', fontSize:16, fontWeight:700, textDecoration:'none' }}>
                                    <span style={{ fontSize: 18 }}>{item.icon}</span><span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Page Greeting / Title Bar */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                        👋 Welcome back, <span style={{ color: '#059669' }}>{userName}</span>
                    </h1>
                    {title && title !== 'Dashboard' && (
                        <p style={{ fontSize: 14, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>📍 {title}</p>
                    )}
                </div>
                <div style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '28px', background: '#f9fafb' }}>
                {children}
            </main>

            {/* Floating Assistant (right-middle corner) */}
            <div
                ref={assistantRef}
                style={{
                    position: 'fixed',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                {assistantOpen && (
                    <div
                        style={{
                            width: 'min(380px, calc(100vw - 90px))',
                            height: 'min(560px, 82vh)',
                            background: '#ffffff',
                            border: '1px solid #d1d5db',
                            borderRadius: 16,
                            boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            style={{
                                background: 'linear-gradient(135deg,#0b3f2a,#0d5d3d)',
                                color: '#fff',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800 }}>Obamax Assistant</div>
                                <div style={{ fontSize: 11, color: '#a7f3d0', marginTop: 1 }}>Live data + full software guide</div>
                            </div>
                            <button
                                onClick={() => setAssistantOpen(false)}
                                style={{
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.12)',
                                    color: '#fff',
                                    borderRadius: 10,
                                    width: 30,
                                    height: 30,
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                }}
                            >
                                X
                            </button>
                        </div>

                        <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {assistantQuickPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => askAssistant(prompt)}
                                    style={{
                                        border: '1px solid #a7f3d0',
                                        background: '#ecfdf5',
                                        color: '#065f46',
                                        borderRadius: 999,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: '#f8fafc' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {assistantMessages.map((msg, idx) => (
                                    <div
                                        key={`${msg.role}-${idx}`}
                                        style={{
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '92%',
                                            borderRadius: 12,
                                            padding: '9px 11px',
                                            fontSize: 12,
                                            lineHeight: 1.45,
                                            whiteSpace: 'pre-wrap',
                                            background: msg.role === 'user' ? '#047857' : '#e5e7eb',
                                            color: msg.role === 'user' ? '#ffffff' : '#111827',
                                        }}
                                    >
                                        <div>{msg.text}</div>
                                        {msg.meta && (
                                            <div style={{ marginTop: 5, fontSize: 10, opacity: 0.82 }}>{msg.meta}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                askAssistant();
                            }}
                            style={{ borderTop: '1px solid #e5e7eb', padding: 10, display: 'flex', gap: 8 }}
                        >
                            <input
                                value={assistantQuestion}
                                onChange={(e) => setAssistantQuestion(e.target.value)}
                                placeholder="Ask anything about this software..."
                                style={{
                                    flex: 1,
                                    border: '1px solid #d1d5db',
                                    borderRadius: 10,
                                    padding: '9px 10px',
                                    fontSize: 12,
                                    outline: 'none',
                                }}
                            />
                            <button
                                type="submit"
                                disabled={assistantLoading}
                                style={{
                                    border: 'none',
                                    borderRadius: 10,
                                    background: assistantLoading ? '#6ee7b7' : '#059669',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: 12,
                                    padding: '0 12px',
                                    cursor: assistantLoading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {assistantLoading ? '...' : 'Ask'}
                            </button>
                        </form>
                    </div>
                )}

                <button
                    onClick={() => setAssistantOpen((s) => !s)}
                    title="Open Assistant"
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        border: '3px solid #d1fae5',
                        background: 'linear-gradient(135deg,#065f46,#10b981)',
                        color: '#fff',
                        fontSize: 34,
                        cursor: 'pointer',
                        boxShadow: '0 14px 38px rgba(5,150,105,0.55)',
                    }}
                >
                    🤖
                </button>
            </div>
        </div>
    );
}
