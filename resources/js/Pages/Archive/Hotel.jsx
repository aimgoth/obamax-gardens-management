import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const METHOD_COLORS = {
    cash:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
    momo:  'bg-amber-100 text-amber-700 border border-amber-200',
    card:  'bg-green-100 text-green-700 border border-green-200',
};

function StatusBadge({ shortfall }) {
    if (shortfall > 0) return (
        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Shortfall
        </span>
    );
    if (shortfall < 0) return (
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Surplus
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Exact
        </span>
    );
}

function ClosingDetail({ record }) {
    const shortfall = record.shortfall;
    return (
        <div className="border-t-4 border-blue-100 bg-gradient-to-b from-slate-50 to-white px-6 py-8 space-y-8">

                {/* Bookings table */}
                {record.bookings.length > 0 ? (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-6 bg-green-400 rounded-full" />
                            <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Bookings on this Date</h4>
                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                                {record.bookings.length} booking{record.bookings.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-100 text-left text-xs text-gray-400 font-bold uppercase tracking-wide">
                                        <th className="px-5 py-3">Guest</th>
                                        <th className="px-5 py-3">Room</th>
                                        <th className="px-5 py-3">Check-in</th>
                                        <th className="px-5 py-3">Nights</th>
                                        <th className="px-5 py-3">Method</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {record.bookings.map((b, i) => (
                                        <tr key={i} className="hover:bg-green-50/40 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-gray-800">{b.guest || 'Walk-in Guest'}</td>
                                            <td className="px-5 py-3 text-gray-600">Room {b.room || '—'}</td>
                                            <td className="px-5 py-3 text-gray-500">{b.checkin || '—'}</td>
                                            <td className="px-5 py-3 text-gray-700">{b.nights} night{b.nights !== 1 ? 's' : ''}</td>
                                            <td className="px-5 py-3">
                                                {b.method && (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${METHOD_COLORS[b.method?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                                                        {b.method}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right font-black text-green-700 text-base">{fmt(b.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-green-50 border-t-2 border-green-100">
                                        <td colSpan={5} className="px-5 py-3 font-bold text-gray-700">Total from Bookings</td>
                                        <td className="px-5 py-3 text-right font-black text-green-800 text-base">{fmt(record.expected_revenue)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 italic">No individual booking records for this date.</div>
                )}

                {/* Closing summary */}
                <div className="bg-gray-950 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-1 h-6 bg-green-400 rounded-full" />
                        <h4 className="text-lg font-bold text-white uppercase tracking-wide">Closing Summary</h4>
                    </div>
                    <div className="space-y-3 text-sm mb-5">
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400 font-medium">Expected (from Bookings)</span>
                            <span className="font-bold text-white text-base">{fmt(record.expected_revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400 font-medium">Cash Handed Over</span>
                            <span className="font-black text-green-400 text-lg">{fmt(record.cash_collected)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-white font-bold text-base">Status</span>
                            <div className="flex items-center gap-3">
                                <StatusBadge shortfall={shortfall} />
                                <span className={`font-black text-xl ${shortfall > 0 ? 'text-red-400' : shortfall < 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {shortfall > 0 ? `− ${fmt(shortfall)}` : shortfall < 0 ? `+ ${fmt(Math.abs(shortfall))}` : '✅ Exact'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {record.notes && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-4 text-base text-amber-800">
                        <span className="font-bold">Notes:</span> {record.notes}
                    </div>
                )}
        </div>
    );
}

export default function ArchiveHotel({ records }) {
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
        <AppLayout title="Archive — Hotel Closings">
            <Head title="Archive — Hotel Closings" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h2 className="text-3xl font-black text-gray-800">Hotel Closings Archive</h2>
                    <p className="text-base text-gray-500 mt-1">
                        {records.length} closing{records.length !== 1 ? 's' : ''} recorded — click any row to expand full details
                    </p>
                </div>

                {records.length === 0 && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-20 text-center">
                        <p className="text-gray-600 font-semibold text-xl">No hotel closings recorded yet.</p>
                        <p className="text-base text-gray-400 mt-2">Closings appear here after submitting from the Hotel Closing page.</p>
                    </div>
                )}

                {Object.entries(grouped).map(([month, monthRecords]) => {
                    const monthCash     = monthRecords.reduce((s, r) => s + r.cash_collected, 0);
                    const monthExpected = monthRecords.reduce((s, r) => s + r.expected_revenue, 0);
                    const monthDiff     = monthCash - monthExpected;

                    return (
                        <div key={month}>
                            {/* Month header */}
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
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Expected</div>
                                    <div className="text-xl font-black">{fmt(monthExpected)}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div className="ml-auto">
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Cash Collected</div>
                                    <div className={`text-2xl font-black ${monthDiff < 0 ? 'text-red-300' : 'text-white'}`}>{fmt(monthCash)}</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                                {monthRecords.map((record, idx) => {
                                    const isOpen    = expanded === record.id;
                                    const shortfall = record.shortfall;

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

                                                {/* Date + bookings count */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-lg font-bold text-gray-800">
                                                        {new Date(record.date + 'T12:00:00').toLocaleDateString('en-GB', {
                                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-gray-400 mt-0.5">
                                                        {record.bookings.length} booking{record.bookings.length !== 1 ? 's' : ''}
                                                    </div>
                                                </div>

                                                {/* Chips */}
                                                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                                                    <StatusBadge shortfall={shortfall} />
                                                    <div className="border border-gray-200 rounded-xl px-3 py-1.5 text-center bg-gray-50">
                                                        <div className="text-xs text-gray-400 font-medium leading-none mb-0.5">Expected</div>
                                                        <div className="text-sm font-black text-gray-700">{fmt(record.expected_revenue)}</div>
                                                    </div>
                                                    {shortfall !== 0 && (
                                                        <div className={`border rounded-xl px-3 py-1.5 text-center ${shortfall > 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                                            <div className="text-xs text-gray-400 font-medium leading-none mb-0.5">{shortfall > 0 ? 'Shortfall' : 'Surplus'}</div>
                                                            <div className={`text-sm font-black ${shortfall > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                                                {shortfall > 0 ? `− ${fmt(shortfall)}` : `+ ${fmt(Math.abs(shortfall))}`}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Cash */}
                                                <div className="text-right flex-shrink-0 ml-2">
                                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cash Received</div>
                                                    <div className="text-2xl font-black text-green-700">{fmt(record.cash_collected)}</div>
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
