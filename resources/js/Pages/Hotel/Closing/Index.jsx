import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n||0).toFixed(2)}`;

export default function HotelClosingIndex({ closings, bookingsByDate, today }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        closing_date: today, cash_collected: '', notes: '',
    });

    // Look up bookings for the currently selected date
    const dayData   = bookingsByDate.find(d => d.date === data.closing_date);
    const expected  = dayData?.total || 0;
    const cash      = parseFloat(data.cash_collected || 0);
    const shortfall = Math.max(0, expected - cash);
    const surplus   = Math.max(0, cash - expected);

    const alreadyClosed = closings.some(c => c.closing_date === data.closing_date);

    const submit = (e) => {
        e.preventDefault();
        post(route('hotel.closing.store'), {
            onSuccess: () => { setShowForm(false); reset(); setData('closing_date', today); },
        });
    };

    return (
        <AppLayout title="Hotel Closing">
            <Head title="Hotel - Daily Closing" />

            {flash?.success && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
                    ✅ {flash.success}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">🏨 Hotel Daily Closing</h2>
                <button onClick={()=>setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Record Closing</button>
            </div>

            {/* Past Closings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto mb-6">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>{['Date','Expected (from Bookings)','Cash Handed Over','Shortfall','Notes'].map(h=>(
                            <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {closings.map(c=>(
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-500 font-medium">{c.closing_date}</td>
                                <td className="px-4 py-2 text-gray-700 font-semibold">{fmt(c.expected_revenue)}</td>
                                <td className="px-4 py-2 font-bold text-green-700">{fmt(c.cash_collected)}</td>
                                <td className="px-4 py-2">
                                    <span className={`font-semibold ${parseFloat(c.shortfall)>0?'text-red-600':'text-green-600'}`}>
                                        {parseFloat(c.shortfall)>0 ? `- ${fmt(c.shortfall)}` : '✅ Full'}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-gray-400 text-xs">{c.notes||'—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {closings.length===0&&<div className="text-center py-8 text-gray-400 text-sm">No closings recorded yet.</div>}
            </div>

            {/* Closing Form Modal */}
            {showForm&&(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <h3 className="font-bold text-gray-800">Record Hotel Daily Closing</h3>
                            <button onClick={()=>setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Date picker */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
                                <input type="date" value={data.closing_date} onChange={e=>setData('closing_date',e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>
                                {errors.closing_date&&<p className="text-red-500 text-xs mt-1">{errors.closing_date}</p>}
                                {alreadyClosed && <p className="text-orange-500 text-xs mt-1">⚠️ A closing already exists for this date.</p>}
                            </div>

                            {/* Auto-computed Expected Revenue from bookings */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-blue-800">Expected Revenue</span>
                                    <span className="text-sm text-blue-500">(from bookings)</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-700">{fmt(expected)}</div>
                                {dayData ? (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-blue-500 font-medium">{dayData.count} booking{dayData.count!==1?'s':''} recorded for this date:</p>
                                        {dayData.bookings.map((b,i)=>(
                                            <div key={i} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-1.5 border border-blue-100">
                                                <span className="text-gray-700">Room <strong>{b.room}</strong> · {b.nights} night{b.nights!==1?'s':''} · <span className="text-blue-600">{b.method}</span></span>
                                                <span className="font-bold text-gray-800">{fmt(b.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-blue-400 mt-1">No bookings found for this date.</p>
                                )}
                            </div>

                            {/* Only field to type: cash handed over */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cash Handed Over (GHS) *</label>
                                <input
                                    type="number" step="0.01" min="0"
                                    value={data.cash_collected}
                                    onChange={e=>setData('cash_collected',e.target.value)}
                                    placeholder="Amount given to admin"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                                />
                                {errors.cash_collected&&<p className="text-red-500 text-xs mt-1">{errors.cash_collected}</p>}
                            </div>

                            {/* Live shortfall / surplus preview */}
                            {data.cash_collected !== '' && (
                                <div className={`rounded-lg p-3 text-sm font-semibold ${
                                    shortfall > 0 ? 'bg-red-50 border border-red-200 text-red-700'
                                    : surplus > 0 ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                                    : 'bg-green-50 border border-green-200 text-green-700'
                                }`}>
                                    {shortfall > 0
                                        ? `⚠️ Shortfall: ${fmt(shortfall)} (GHS ${fmt(cash)} handed over vs GHS ${fmt(expected)} expected)`
                                        : surplus > 0
                                        ? `ℹ️ Surplus: ${fmt(surplus)} over expected`
                                        : `✅ Exact match — ${fmt(cash)}`
                                    }
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
                                <input type="text" value={data.notes} onChange={e=>setData('notes',e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Cancel</button>
                                <button onClick={submit} disabled={processing || alreadyClosed || !data.cash_collected} className="px-5 py-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold">
                                    {processing ? 'Saving...' : 'Submit Closing'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
