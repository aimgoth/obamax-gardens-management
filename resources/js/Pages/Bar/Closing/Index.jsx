import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const BLOCKS = ['Block A', 'Block B', 'Block C'];
const fmt = (n) => `GHS ${parseFloat(n||0).toFixed(2)}`;

export default function BarClosingIndex({ workers, closings, todaySummary, today }) {
    const [showForm, setShowForm] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Report filters
    const [rptDateFrom, setRptDateFrom] = useState(today);
    const [rptDateTo, setRptDateTo]     = useState(today);
    const [rptBlock, setRptBlock]       = useState('');
    const [rptWorker, setRptWorker]     = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        worker_id: workers[0]?.id||'', block: workers[0]?.block||'', closing_date: today,
        cash_collected: '', momo_collected: '', notes: '',
    });
    const total = parseFloat(data.cash_collected||0) + parseFloat(data.momo_collected||0);
    const submit = (e) => { e.preventDefault(); post(route('bar.closing.store'), { onSuccess: () => { setShowForm(false); reset(); setData('closing_date', today); }}); };

    const del = (id) => {
        if (confirm('Remove this closing record?')) router.delete(route('bar.closing.destroy', id));
    };

    const downloadReport = async () => {
        if (!rptDateFrom || !rptDateTo) { alert('Please select a date range.'); return; }
        setDownloading(true);
        try {
            let url = route('bar.closing.report')
                + '?date_from=' + rptDateFrom
                + '&date_to=' + rptDateTo;
            if (rptBlock)  url += '&block='     + encodeURIComponent(rptBlock);
            if (rptWorker) url += '&worker_id=' + rptWorker;

            const res = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to generate report');
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `closing-report-${rptDateFrom}-to-${rptDateTo}.pdf`;
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

    return (
        <AppLayout title="Bar Daily Closing">
            <Head title="Bar - Daily Closing" />
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Bar Daily Closing</h2>
                <div className="flex gap-2">
                    <button onClick={() => setShowReport(r => !r)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">📄 Report</button>
                    <button onClick={() => setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Record Closing</button>
                </div>
            </div>

            {/* Report Panel */}
            {showReport && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                    <p className="text-sm font-semibold text-blue-800 mb-1">📋 Bar Closing Report</p>
                    <p className="text-xs text-blue-600 mb-3">Select a date range and optional filters to download a PDF of bar closing records.</p>
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">From Date</label>
                            <input type="date" value={rptDateFrom} onChange={e => setRptDateFrom(e.target.value)}
                                className="px-3 py-2 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">To Date</label>
                            <input type="date" value={rptDateTo} onChange={e => setRptDateTo(e.target.value)}
                                className="px-3 py-2 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">Block (optional)</label>
                            <select value={rptBlock} onChange={e => setRptBlock(e.target.value)}
                                className="px-3 py-2 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="">All Blocks</option>
                                {BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">Bar Keeper (optional)</label>
                            <select value={rptWorker} onChange={e => setRptWorker(e.target.value)}
                                className="px-3 py-2 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="">All Bar Keepers</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <button onClick={downloadReport} disabled={downloading}
                            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white rounded-lg text-sm font-semibold">
                            {downloading ? 'Generating...' : '⬇ Download PDF'}
                        </button>
                        <button onClick={() => setShowReport(false)} className="ml-auto text-blue-400 hover:text-blue-600 text-xs self-start">✕ Close</button>
                    </div>
                </div>
            )}

            {/* Today Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {BLOCKS.map(block => {
                    const entries = (todaySummary[block] || []);
                    const total = entries.reduce((s,c) => s + parseFloat(c.cash_collected||0) + parseFloat(c.momo_collected||0), 0);
                    return (
                        <div key={block} className={`bg-white rounded-xl p-4 border ${entries.length===0?'border-amber-200 bg-amber-50':'border-green-200 bg-green-50'}`}>
                            <div className="font-semibold text-gray-700">{block}</div>
                            {entries.length > 0 ? <>
                                <div className="text-2xl font-bold text-green-700">{fmt(total)}</div>
                                <div className="text-xs text-gray-500">{entries.map(e=>e.worker?.name||'').join(', ')}</div>
                            </> : <div className="text-sm text-amber-600 mt-1">⏳ Not closed yet</div>}
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b"><tr>{['Date','Worker','Block','Cash','MoMo','Total','Notes',''].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {closings.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-500">{c.closing_date}</td>
                                <td className="px-4 py-2 font-medium text-gray-800">{c.worker?.name}</td>
                                <td className="px-4 py-2 text-gray-600">{c.block}</td>
                                <td className="px-4 py-2 text-gray-700">{fmt(c.cash_collected)}</td>
                                <td className="px-4 py-2 text-gray-700">{fmt(c.momo_collected)}</td>
                                <td className="px-4 py-2 font-semibold text-green-700">{fmt(c.total_collected)}</td>
                                <td className="px-4 py-2 text-gray-400 text-xs">{c.notes||'—'}</td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => del(c.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {closings.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No closings recorded yet.</div>}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-semibold text-gray-800">Record Daily Closing</h3><button onClick={() => setShowForm(false)}>✕</button></div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bar Keeper *</label>
                                    <select value={data.worker_id} onChange={e => {
                                        const w = workers.find(w => String(w.id) === e.target.value);
                                        setData('worker_id', e.target.value);
                                        setData('block', w?.block || '');
                                    }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500">
                                        {workers.map(w=><option key={w.id} value={w.id}>{w.name} — {w.block}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Block <span className="text-xs text-gray-400 font-normal">(auto-filled)</span></label>
                                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-semibold">
                                        {data.block || <span className="text-gray-400 font-normal">—</span>}
                                    </div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cash (GHS) *</label><input type="number" min="0" step="0.01" value={data.cash_collected} onChange={e=>setData('cash_collected',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">MoMo (GHS) *</label><input type="number" min="0" step="0.01" value={data.momo_collected} onChange={e=>setData('momo_collected',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={data.closing_date} onChange={e=>setData('closing_date',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>{errors.closing_date&&<p className="text-red-500 text-xs">{errors.closing_date}</p>}</div>
                                <div className="flex items-end"><div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full"><div className="text-xs text-gray-500">Total</div><div className="text-xl font-bold text-green-700">{fmt(total)}</div></div></div>
                                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input type="text" value={data.notes} onChange={e=>setData('notes',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/></div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium">{processing ? 'Saving...' : 'Submit Closing'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
