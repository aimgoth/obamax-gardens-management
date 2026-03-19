import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function DepotIndex({ drinks, receipts }) {
    const [showForm, setShowForm] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [downloading, setDownloading] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, errors, reset } = useForm({
        drink_id: drinks[0]?.id || '', crates_received: '', extra_bottles: '', cost_per_crate: '', date_received: today, notes: '',
    });
    const submit = (e) => { e.preventDefault(); post(route('bar.depot.store'), { onSuccess: () => { setShowForm(false); reset(); setData('date_received', today); } }); };
    const del = (id) => { if (confirm('Remove this entry?')) router.delete(route('bar.depot.destroy', id)); };

    const downloadReport = async () => {
        setDownloading(true);
        try {
            const url = route('bar.depot.report') + '?date=' + reportDate;
            const res = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to generate PDF');
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `depot-report-${reportDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        } catch (err) {
            alert('Could not download report: ' + err.message);
        } finally {
            setDownloading(false);
        }
    };

    const totalBottles = drinks.reduce((s, d) => s + (d.current_stock_bottles || 0), 0);

    return (
        <AppLayout title="Depot Inventory">
            <Head title="Bar - Depot" />
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Depot Inventory</h2>
                    <p className="text-sm text-gray-500">{totalBottles} total bottles in depot</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowReport(r => !r)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">📄 Report</button>
                    <button onClick={() => setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Receive Stock</button>
                </div>
            </div>

            {/* Report Panel */}
            {showReport && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex flex-wrap items-end gap-4">
                    <div>
                        <p className="text-sm font-semibold text-blue-800 mb-1">📦 Depot Loading Report</p>
                        <p className="text-xs text-blue-600 mb-3">Pick a date to download a PDF of all drinks loaded into the depot on that day.</p>
                        <label className="block text-xs font-medium text-blue-700 mb-1">Select Date</label>
                        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                            className="px-3 py-2 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                    <button onClick={downloadReport} disabled={downloading}
                        className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white rounded-lg text-sm font-semibold">
                        {downloading ? 'Generating...' : '⬇ Download PDF'}
                    </button>
                    <button onClick={() => setShowReport(false)} className="ml-auto text-blue-400 hover:text-blue-600 text-xs self-start">✕ Close</button>
                </div>
            )}

            {/* Current Stock */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {drinks.map(d => (
                    <div key={d.id} className={`bg-white rounded-xl p-4 border ${d.current_stock_bottles < 24 ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                        <div className="font-medium text-gray-800 text-sm truncate">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.bottle_size}</div>
                        <div className={`text-2xl font-bold mt-1 ${d.current_stock_bottles < 24 ? 'text-red-600' : 'text-green-700'}`}>{d.current_stock_bottles}</div>
                        <div className="text-xs text-gray-400">bottles ({d.current_stock_crates} crates + {d.current_stock_remainder})</div>
                    </div>
                ))}
                {drinks.length === 0 && <p className="col-span-4 text-gray-400 text-sm">No drinks set up yet.</p>}
            </div>

            {/* Recent Receipts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-700 text-sm">Recent Stock Receipts</div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{['Date','Drink','Crates','Bottles','Cost/Crate','Notes',''].map(h=><th key={h} className="text-left px-4 py-2 font-medium text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {receipts.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-600">{r.date_received}</td>
                                <td className="px-4 py-2 font-medium text-gray-800">{r.drink?.name}</td>
                                <td className="px-4 py-2 text-gray-600">{r.crates_received}</td>
                                <td className="px-4 py-2 text-gray-600">{r.bottles_received}</td>
                                <td className="px-4 py-2 text-gray-600">{r.cost_per_crate ? `GHS ${parseFloat(r.cost_per_crate).toFixed(2)}` : '—'}</td>
                                <td className="px-4 py-2 text-gray-400 max-w-xs truncate">{r.notes || '—'}</td>
                                <td className="px-4 py-2 text-right"><button onClick={() => del(r.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {receipts.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No receipts recorded yet.</div>}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-semibold text-gray-800">Receive Stock into Depot</h3><button onClick={() => setShowForm(false)}>✕</button></div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Drink *</label>
                                <select value={data.drink_id} onChange={e => setData('drink_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                    {drinks.map(d => <option key={d.id} value={d.id}>{d.name} ({d.bottle_size})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Crates *</label><input type="number" min="0" value={data.crates_received} onChange={e => setData('crates_received', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />{errors.crates_received && <p className="text-red-500 text-xs">{errors.crates_received}</p>}</div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Extra Bottles</label><input type="number" min="0" value={data.extra_bottles} onChange={e => setData('extra_bottles', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost/Crate (GHS)</label><input type="number" min="0" step="0.01" value={data.cost_per_crate} onChange={e => setData('cost_per_crate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={data.date_received} onChange={e => setData('date_received', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium">{processing ? 'Saving...' : 'Record Receipt'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
