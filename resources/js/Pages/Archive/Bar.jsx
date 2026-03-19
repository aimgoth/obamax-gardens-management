import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n || 0).toFixed(2)}`;

function ClosingDetail({ record }) {
    const cashPct  = record.total > 0 ? (record.cash_collected / record.total) * 100 : 0;
    const momoPct  = record.total > 0 ? (record.momo_collected / record.total) * 100 : 0;

    return (
        <div className="border-t-4 border-amber-50 bg-gradient-to-b from-slate-50 to-white px-6 py-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-5">
                    <div className="text-xs text-gray-400 font-medium mb-1">💵 Cash Collected</div>
                    <div className="text-2xl font-bold text-green-700">{fmt(record.cash_collected)}</div>
                    {record.total > 0 && (
                        <div className="mt-2">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${cashPct}%` }} />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{cashPct.toFixed(0)}% of total</div>
                        </div>
                    )}
                </div>
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-5">
                    <div className="text-xs text-gray-400 font-medium mb-1">📱 MoMo Collected</div>
                    <div className="text-2xl font-bold text-yellow-600">{fmt(record.momo_collected)}</div>
                    {record.total > 0 && (
                        <div className="mt-2">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${momoPct}%` }} />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{momoPct.toFixed(0)}% of total</div>
                        </div>
                    )}
                </div>
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-5">
                    <div className="text-xs text-gray-400 font-medium mb-1">💰 Total Revenue</div>
                    <div className="text-2xl font-bold text-green-700">{fmt(record.total)}</div>
                    <div className="text-xs text-gray-400 mt-2">Cash + MoMo</div>
                </div>
            </div>

            <div className="bg-gray-950 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-green-400 rounded-full" />
                    <h4 className="text-lg font-bold text-white uppercase tracking-wide">Closing Summary</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="text-gray-400 text-xs">Submitted by</div>
                        <div className="font-semibold text-white mt-0.5">{record.worker || '—'}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs">Block / Section</div>
                        <div className="font-semibold text-white mt-0.5">{record.block || '—'}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs">Cash</div>
                        <div className="font-bold text-green-400 mt-0.5">{fmt(record.cash_collected)}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs">MoMo</div>
                        <div className="font-bold text-yellow-400 mt-0.5">{fmt(record.momo_collected)}</div>
                    </div>
                </div>
                {record.notes && (
                    <div className="border-t border-gray-800 pt-3 mt-3 text-sm text-gray-300">
                        📝 {record.notes}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ArchiveBar({ records }) {
    const [expanded, setExpanded] = useState(null);

    const grouped = records.reduce((acc, r) => {
        const month = r.date.slice(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(r);
        return acc;
    }, {});

    const monthLabel = (key) => {
        const [y, m] = key.split('-');
        return new Date(y, m - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    };

    return (
        <AppLayout title="Archive — Bar Closings">
            <Head title="Archive — Bar Closings" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h2 className="text-3xl font-black text-gray-800">Bar Closings Archive</h2>
                    <p className="text-base text-gray-500 mt-1">
                        {records.length} closing{records.length !== 1 ? 's' : ''} recorded — click any row to expand full details
                    </p>
                </div>

                {records.length === 0 && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-20 text-center">
                        <p className="text-gray-600 font-semibold text-xl">No bar closings recorded yet.</p>
                        <p className="text-base text-gray-400 mt-2">Closings appear here after submitting from the Bar Daily Closing page.</p>
                    </div>
                )}

                {Object.entries(grouped).map(([month, monthRecords]) => {
                    const monthCash  = monthRecords.reduce((s, r) => s + r.cash_collected, 0);
                    const monthMomo  = monthRecords.reduce((s, r) => s + r.momo_collected, 0);
                    const monthTotal = monthRecords.reduce((s, r) => s + r.total, 0);

                    return (
                        <div key={month}>
                            {/* Month header - amber */}
                            <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-2xl px-6 py-4 mb-4 flex flex-wrap items-center gap-6 shadow">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Month</div>
                                    <div className="text-xl font-black">{monthLabel(month)}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Closings</div>
                                    <div className="text-xl font-black">{monthRecords.length}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Cash</div>
                                    <div className="text-xl font-black">{fmt(monthCash)}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">MoMo</div>
                                    <div className="text-xl font-black">{fmt(monthMomo)}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div className="ml-auto">
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Total</div>
                                    <div className="text-2xl font-black">{fmt(monthTotal)}</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                                {monthRecords.map((record, idx) => {
                                    const isOpen = expanded === record.id;

                                    return (
                                        <div key={record.id} className={idx > 0 ? 'border-t-2 border-gray-100' : ''}>
                                            <div
                                                onClick={() => setExpanded(isOpen ? null : record.id)}
                                                className="w-full flex items-center gap-5 px-6 py-5 hover:bg-green-50/50 transition-colors cursor-pointer group"
                                            >
                                                {/* Toggle */}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm transition-all ${isOpen ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-700'}`}>
                                                    {isOpen ? '▲' : '▼'}
                                                </div>

                                                {/* Date + worker/block */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-lg font-bold text-gray-800">
                                                        {new Date(record.date + 'T12:00:00').toLocaleDateString('en-GB', {
                                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-gray-400 mt-0.5">
                                                        {record.worker && <span>{record.worker}</span>}
                                                        {record.worker && record.block && <span> · </span>}
                                                        {record.block && <span>{record.block}</span>}
                                                    </div>
                                                </div>

                                                {/* Cash / MoMo chips */}
                                                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                                                    {record.cash_collected > 0 && (
                                                        <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 text-center">
                                                            <div className="text-xs text-gray-400 font-medium leading-none mb-0.5">Cash</div>
                                                            <div className="text-sm font-black text-green-700">{fmt(record.cash_collected)}</div>
                                                        </div>
                                                    )}
                                                    {record.momo_collected > 0 && (
                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1.5 text-center">
                                                            <div className="text-xs text-gray-400 font-medium leading-none mb-0.5">MoMo</div>
                                                            <div className="text-sm font-black text-yellow-600">{fmt(record.momo_collected)}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Total */}
                                                <div className="text-right flex-shrink-0 ml-2">
                                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Revenue</div>
                                                    <div className="text-2xl font-black text-green-700">{fmt(record.total)}</div>
                                                </div>
                                            </div>

                                            {isOpen && <ClosingDetail record={record} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AppLayout>
    );
}
