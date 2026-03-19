import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function ProfileIndex() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('info');

    const { data: infoData, setData: setInfo, put: putInfo, processing: infoProc, errors: infoErr } = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    const { data: pwData, setData: setPw, put: putPw, processing: pwProc, errors: pwErr, reset: resetPw } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [infoSuccess, setInfoSuccess] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    const submitInfo = (e) => {
        e.preventDefault();
        putInfo(route('profile.update'), {
            onSuccess: () => { setInfoSuccess('Profile updated successfully! ✅'); setTimeout(() => setInfoSuccess(''), 4000); }
        });
    };

    const submitPw = (e) => {
        e.preventDefault();
        putPw(route('profile.password'), {
            onSuccess: () => { resetPw(); setPwSuccess('Password changed successfully! ✅'); setTimeout(() => setPwSuccess(''), 4000); }
        });
    };

    const tabStyle = (active) => ({
        padding: '10px 20px', borderRadius: '10px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        border: 'none', transition: 'all 0.18s',
        background: active ? '#059669' : 'transparent',
        color: active ? '#fff' : '#6b7280',
    });

    return (
        <AppLayout title="My Profile">
            <Head title="My Profile" />

            <div className="max-w-2xl mx-auto">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-2xl p-6 mb-6 flex items-center gap-5">
                    <div style={{
                        width: 70, height: 70, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#34d399,#059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 900, fontSize: 28,
                        boxShadow: '0 4px 16px rgba(52,211,153,0.4)',
                        border: '3px solid rgba(255,255,255,0.3)',
                    }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-2xl">{user.name}</h2>
                        <p className="text-green-300 text-sm">{user.email}</p>
                        <span className="inline-block mt-1 px-3 py-0.5 bg-green-500 bg-opacity-30 text-green-200 text-xs font-semibold rounded-full">Administrator</span>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#f3f4f6', borderRadius: 14, padding: 6 }}>
                    <button style={tabStyle(activeTab === 'info')} onClick={() => setActiveTab('info')}>👤 Profile Info</button>
                    <button style={tabStyle(activeTab === 'password')} onClick={() => setActiveTab('password')}>🔐 Change Password</button>
                </div>

                {/* Profile Info Tab */}
                {activeTab === 'info' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-5">Update Profile Information</h3>
                        {infoSuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm font-medium">{infoSuccess}</div>}
                        <form onSubmit={submitInfo} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                                <input type="text" value={infoData.name} onChange={e => setInfo('name', e.target.value)} required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                {infoErr.name && <p className="text-red-500 text-xs mt-1">{infoErr.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                                <input type="email" value={infoData.email} onChange={e => setInfo('email', e.target.value)} required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                {infoErr.email && <p className="text-red-500 text-xs mt-1">{infoErr.email}</p>}
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={infoProc}
                                    className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-xl text-sm font-bold transition-all">
                                    {infoProc ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-5">Change Password</h3>
                        {pwSuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm font-medium">{pwSuccess}</div>}
                        <form onSubmit={submitPw} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password *</label>
                                <input type="password" value={pwData.current_password} onChange={e => setPw('current_password', e.target.value)} required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                {pwErr.current_password && <p className="text-red-500 text-xs mt-1">{pwErr.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password *</label>
                                <input type="password" value={pwData.password} onChange={e => setPw('password', e.target.value)} required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                {pwErr.password && <p className="text-red-500 text-xs mt-1">{pwErr.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password *</label>
                                <input type="password" value={pwData.password_confirmation} onChange={e => setPw('password_confirmation', e.target.value)} required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                                ⚠️ Password must be at least 8 characters. You will remain logged in after changing your password.
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={pwProc}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl text-sm font-bold transition-all">
                                    {pwProc ? 'Changing...' : '🔐 Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
