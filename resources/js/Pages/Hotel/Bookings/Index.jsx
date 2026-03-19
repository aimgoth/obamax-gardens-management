import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n||0).toFixed(2)}`;
const METHODS = ['Cash', 'MoMo', 'Both'];

export default function BookingsIndex({ rooms, bookings, today, todayRevenue, todayCount }) {
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        room_id: rooms[0]?.id || '',
        booking_date: today,
        number_of_nights: 1,
        payment_method: 'Cash',
        amount_paid: '',
    });

    const selectedRoom = rooms.find(r => r.id == form.room_id);
    const nights = parseInt(form.number_of_nights) || 1;
    const totalBill = nights * parseFloat(selectedRoom?.price_per_night || 0);

    const onRoomChange = (id) => {
        const room = rooms.find(r => r.id == id);
        const newTotal = nights * parseFloat(room?.price_per_night || 0);
        setForm(f => ({ ...f, room_id: id, amount_paid: newTotal.toFixed(2) }));
    };

    const onNightsChange = (n) => {
        const v = parseInt(n) || 1;
        const newTotal = v * parseFloat(selectedRoom?.price_per_night || 0);
        setForm(f => ({ ...f, number_of_nights: v, amount_paid: newTotal.toFixed(2) }));
    };

    const submit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('hotel.bookings.store'), {
            room_id: form.room_id,
            booking_date: form.booking_date,
            number_of_nights: form.number_of_nights,
            payment_method: form.payment_method,
            amount_paid: form.amount_paid || totalBill,
        }, {
            onSuccess: () => { setShowForm(false); setSubmitting(false); },
            onError: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout title="Hotel Bookings">
            <Head title="Hotel - Bookings" />
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">🏨 Hotel Bookings</h2>
                    <p className="text-sm text-gray-500">Record room bookings — prices auto-fill from room setup</p>
                </div>
                <button onClick={() => {
                    const room = rooms[0];
                    setForm({ room_id: room?.id||'', booking_date: today, number_of_nights: 1, payment_method: 'Cash', amount_paid: parseFloat(room?.price_per_night||0).toFixed(2) });
                    setShowForm(true);
                }} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">+ New Booking</button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-sm text-gray-500">Today's Revenue</div>
                    <div className="text-2xl font-bold text-green-700">{fmt(todayRevenue)}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-sm text-gray-500">Today's Bookings</div>
                    <div className="text-2xl font-bold text-blue-700">{todayCount}</div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>{['Date','Room','Check-in','Check-out','Nights','Price/Night','Total','Paid','Method'].map(h =>
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">{h}</th>
                        )}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {bookings.map(b => (
                            <tr key={b.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-500 text-xs">{b.date_recorded}</td>
                                <td className="px-4 py-2.5 font-semibold text-gray-800">Room #{b.room?.room_number} <span className="text-xs text-gray-400">({b.room?.room_type})</span></td>
                                <td className="px-4 py-2.5 text-gray-600 text-xs">{b.check_in_date}</td>
                                <td className="px-4 py-2.5 text-gray-600 text-xs">{b.check_out_date}</td>
                                <td className="px-4 py-2.5 text-gray-700 font-medium">{b.number_of_nights}</td>
                                <td className="px-4 py-2.5 text-gray-600">{fmt(b.price_per_night)}</td>
                                <td className="px-4 py-2.5 text-gray-700 font-medium">{fmt(b.total_bill)}</td>
                                <td className="px-4 py-2.5 font-bold text-green-700">{fmt(b.amount_paid)}</td>
                                <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{b.payment_method}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🏨</div>No bookings recorded yet.</div>}
            </div>

            {/* Booking Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="font-bold text-gray-800 text-lg">🏨 New Booking</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-5">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
                                <input type="date" value={form.booking_date}
                                    onChange={e => setForm(f => ({ ...f, booking_date: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            {/* Room */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Room *</label>
                                <select value={form.room_id} onChange={e => onRoomChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500">
                                    {rooms.map(r => <option key={r.id} value={r.id}>Room #{r.room_number} — {r.room_type} · {fmt(r.price_per_night)}/night</option>)}
                                </select>
                            </div>
                            {/* Nights */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Nights *</label>
                                <input type="number" min="1" value={form.number_of_nights}
                                    onChange={e => onNightsChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            {/* Auto-calc total */}
                            {selectedRoom && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="text-blue-800 font-bold text-base">💰 Total: {fmt(totalBill)}</div>
                                    <div className="text-blue-600 text-xs mt-1">{nights} night(s) × {fmt(selectedRoom.price_per_night)}</div>
                                </div>
                            )}
                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method *</label>
                                <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500">
                                    {METHODS.map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            {/* Amount paid (editable override) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount Paid (GHS)</label>
                                <input type="number" step="0.01" min="0" value={form.amount_paid}
                                    onChange={e => setForm(f => ({ ...f, amount_paid: e.target.value }))}
                                    placeholder={totalBill.toFixed(2)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
                                <p className="text-xs text-gray-400 mt-1">Leave blank to use total bill amount</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-xl text-sm font-semibold">
                                    {submitting ? 'Saving...' : 'Record Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
