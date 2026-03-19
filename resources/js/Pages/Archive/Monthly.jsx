import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const monthLabel = (key) => {
    const [y, m] = key.split('-');
    return new Date(y, m - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

function RevenueRow({ label, value, color, icon }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{icon}</span>
                <span>{label}</span>
            </div>
            <span className={`text-base font-black ${color}`}>{fmt(value)}</span>
        </div>
    );
}

function MonthCard({ data, isCurrent }) {
    return (
        <div className={`bg-white rounded-2xl border-2 ${isCurrent ? 'border-green-200 shadow-lg' : 'border-gray-100'} overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${isCurrent ? 'bg-gradient-to-r from-green-700 to-emerald-600 text-white' : 'bg-gray-50 border-b-2 border-gray-100'}`}>
                <div>
                    <div className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${isCurrent ? 'text-green-200' : 'text-gray-400'}`}>
                        {isCurrent ? '🟢 Current Month (Live)' : '📁 Archived'}
                    </div>
                    <div className={`text-xl font-black ${isCurrent ? 'text-white' : 'text-gray-800'}`}>{monthLabel(data.month)}</div>
                </div>
                <div className="text-right">
                    <div className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${isCurrent ? 'text-green-200' : 'text-gray-400'}`}>Total Revenue</div>
                    <div className={`text-2xl font-black ${isCurrent ? 'text-white' : 'text-green-700'}`}>{fmt(data.total_revenue)}</div>
                </div>
            </div>

            {/* Revenue rows */}
            <div className="px-6 py-2">
                <RevenueRow icon="🍺" label="Bar Revenue"         value={data.bar_revenue}        color="text-green-700" />
                <RevenueRow icon="🍽️" label="Restaurant Revenue" value={data.restaurant_revenue}  color="text-orange-600" />
                <RevenueRow icon="🏨" label="Hotel Revenue"       value={data.hotel_revenue}       color="text-blue-600" />
            </div>

            {/* Footer stats */}
            <div className="px-6 py-3 bg-gray-50 border-t-2 border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                <span>🔒 <strong className="text-gray-700">{data.bar_closings}</strong> bar closing{data.bar_closings !== 1 ? 's' : ''}</span>
                <span>📋 <strong className="text-gray-700">{data.restaurant_reports}</strong> restaurant report{data.restaurant_reports !== 1 ? 's' : ''}</span>
                <span>🏨 <strong className="text-gray-700">{data.hotel_closings}</strong> hotel closing{data.hotel_closings !== 1 ? 's' : ''}</span>
            </div>
        </div>
    );
}

export default function MonthlyArchive({ currentMonth, archived }) {
    return (
        <AppLayout title="Monthly Revenue Archive">
            <Head title="Archive - Monthly Revenue" />

            <div className="max-w-3xl mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h2 className="text-3xl font-black text-gray-800">Monthly Revenue Archive</h2>
                    <p className="text-base text-gray-500 mt-1">
                        Live view of the current month + automatically archived past months
                    </p>
                </div>

                {/* Current month — always at top */}
                <MonthCard data={currentMonth} isCurrent={true} />

                {/* Archived months */}
                {archived.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-green-400 rounded-full" />
                            <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Past Months</h3>
                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">{archived.length} month{archived.length !== 1 ? 's' : ''}</span>
                        </div>
                        {archived.map(m => (
                            <MonthCard key={m.month} data={m} isCurrent={false} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-16 text-center">
                        <div className="text-5xl mb-3">📅</div>
                        <p className="text-gray-600 font-semibold text-lg">No past months archived yet</p>
                        <p className="text-gray-400 text-sm mt-1">Completed months will appear here automatically when the month ends.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
