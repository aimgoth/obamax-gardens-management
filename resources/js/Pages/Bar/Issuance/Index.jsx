import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];
const fmt = (n) => `GHS ${parseFloat(n||0).toFixed(2)}`;

export default function IssuanceIndex({ drinks, workers, issuances }) {
    const [showForm, setShowForm] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    // --- Report state ---
    const [rptDate, setRptDate] = useState(today);
    const [rptWorker, setRptWorker] = useState(workers[0]?.id || '');
    const [rptBlock, setRptBlock] = useState(workers[0]?.block || '');
    const [downloading, setDownloading] = useState(false);

    const downloadReport = async () => {
        setDownloading(true);
        try {
            const url = route('bar.issuance.report')
                + '?date=' + rptDate
                + '&worker_id=' + rptWorker
                + '&block=' + encodeURIComponent(rptBlock);
            const res = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                credentials: 'include',
            });
            if (!res.ok) { alert('Failed to generate report. Check filters and try again.'); return; }
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const workerName = workers.find(w => w.id == rptWorker)?.name || 'worker';
            a.href = blobUrl;
            a.download = `issuance-${rptDate}-${workerName}-${rptBlock}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        } catch (err) {
            alert('Could not download report: ' + err.message);
        } finally {
            setDownloading(false);
        }
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        drink_id: drinks[0]?.id || '',
        worker_id: workers[0]?.id || '',
        block: workers[0]?.block || '',
        crates_issued: '',
        issued_date: today,
    });

    const selectedDrink = drinks.find(d => d.id == data.drink_id);
    const bottlesIssued = data.crates_issued
        ? parseInt(data.crates_issued) * (selectedDrink?.bottles_per_crate || 1)
        : 0;
    const pricePerBottle = selectedDrink?.sell_by === 'tot'
        ? (parseFloat(selectedDrink?.tots_per_bottle || 0) * parseFloat(selectedDrink?.price_per_tot || 0))
        : parseFloat(selectedDrink?.price_per_bottle || 0);
    const expectedRev = bottlesIssued * pricePerBottle;
    const availableBottles = selectedDrink?.current_stock || 0;
    const availableCrates  = Math.floor(availableBottles / (selectedDrink?.bottles_per_crate || 1));
    const overStock        = bottlesIssued > 0 && bottlesIssued > availableBottles;
    const remainingAfter   = availableBottles - bottlesIssued;
    const willBeLowAfter   = !overStock && bottlesIssued > 0 && remainingAfter < 24;

    const [stockAlert, setStockAlert] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const submit = (e) => {
        e.preventDefault();
        if (overStock) return;
        const drinkName   = selectedDrink?.name;
        const afterBottles = remainingAfter;
        const afterCrates  = Math.floor(afterBottles / (selectedDrink?.bottles_per_crate || 1));
        setSubmitting(true);
        router.post(route('bar.issuance.store'), {
            drink_id: data.drink_id,
            worker_id: data.worker_id,
            block: data.block,
            bottles_issued: bottlesIssued,
            issued_date: data.issued_date,
        }, {
            onSuccess: () => {
                setShowForm(false);
                reset();
                setSubmitting(false);
                if (afterBottles < 24) {
                    setStockAlert({ drinkName, remaining: afterBottles, cratesLeft: afterCrates });
                }
            },
            onError: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout title="Issue to Bar">
            <Head title="Bar - Issuance" />
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">📦 Issue Stock to Bar</h2>
                    <p className="text-sm text-gray-500">Issue drinks from depot to bar by crate</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowReports(v => !v)} className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${showReports ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}>
                        📄 Reports
                    </button>
                    <button onClick={() => setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">+ Issue Stock</button>
                </div>
            </div>

            {/* Reports Panel */}
            {showReports && (
                <div className="bg-white border border-blue-200 rounded-xl shadow-sm mb-6">
                    <div className="px-5 py-3.5 border-b border-blue-100 font-semibold text-blue-800 text-sm">📄 Generate Issuance Report</div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                                <input type="date" value={rptDate} onChange={e => setRptDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Bar Keeper *</label>
                                <select value={rptWorker} onChange={e => {
                                    const w = workers.find(w => String(w.id) === e.target.value);
                                    setRptWorker(e.target.value);
                                    setRptBlock(w?.block || '');
                                }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400">
                                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Block</label>
                                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-semibold">
                                    {rptBlock || <span className="text-gray-400 font-normal">—</span>}
                                </div>
                            </div>
                        </div>
                        <button onClick={downloadReport} disabled={downloading || !rptDate || !rptWorker}
                            className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
                            {downloading ? '⏳ Downloading...' : '⬇ Download PDF'}
                        </button>
                    </div>
                </div>
            )}

            {/* Depot Stock Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {drinks.map(d => (
                    <div key={d.id} className={`bg-white rounded-xl p-4 border ${d.current_stock < d.bottles_per_crate ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                        <div className="font-semibold text-gray-700 truncate text-sm">{d.name}</div>
                        <div className={`text-xl font-bold mt-1 ${d.current_stock < d.bottles_per_crate ? 'text-red-600' : 'text-green-700'}`}>
                            {Math.floor(d.current_stock / (d.bottles_per_crate || 1))} crates
                        </div>
                        <div className="text-xs text-gray-400">{d.current_stock} bottles · {fmt(d.sell_by === 'tot' ? (parseFloat(d.tots_per_bottle||0) * parseFloat(d.price_per_tot||0)) : d.price_per_bottle)}/btl</div>
                    </div>
                ))}
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="px-5 py-3.5 border-b font-semibold text-gray-700">Issuance Records</div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>{['Date','Drink','Bar Keeper','Block','Crates','Bottles','Expected Rev.',''].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {issuances.map(i => {
                            const bpc = drinks.find(d => d.id === i.drink_id)?.bottles_per_crate || 1;
                            return (
                                <tr key={i.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2.5 text-gray-500">{i.issued_date}</td>
                                    <td className="px-4 py-2.5 font-semibold text-gray-800">{i.drink?.name}</td>
                                    <td className="px-4 py-2.5 text-gray-600">{i.worker?.name}</td>
                                    <td className="px-4 py-2.5 text-gray-600">{i.block}</td>
                                    <td className="px-4 py-2.5 text-gray-700 font-medium">{Math.floor(i.bottles_issued / bpc)}</td>
                                    <td className="px-4 py-2.5 text-gray-700">{i.bottles_issued}</td>
                                    <td className="px-4 py-2.5 text-green-700 font-semibold">{fmt(i.expected_revenue)}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button onClick={() => { if(confirm('Remove this issuance?')) router.delete(route('bar.issuance.destroy', i.id)); }}
                                            className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {issuances.length === 0 && <div className="text-center py-10 text-gray-400">No issuances recorded yet.</div>}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="font-bold text-gray-800 text-lg">📦 Issue Stock to Bar</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-5">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
                                <input type="date" value={data.issued_date} onChange={e => setData('issued_date', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            {/* Drink */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name of Drink *</label>
                                <select value={data.drink_id} onChange={e => setData('drink_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500">
                                    {drinks.map(d => <option key={d.id} value={d.id}>{d.name} ({d.current_stock} btl in depot)</option>)}
                                </select>
                            </div>
                            {/* Bar Keeper */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bar Keeper *</label>
                                <select value={data.worker_id} onChange={e => {
                                    const w = workers.find(w => String(w.id) === e.target.value);
                                    setData('worker_id', e.target.value);
                                    setData('block', w?.block || '');
                                }}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500">
                                    {workers.map(w => <option key={w.id} value={w.id}>{w.name} — {w.block}</option>)}
                                </select>
                            </div>
                            {/* Block — auto-filled from bar keeper */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Block <span className="text-xs text-gray-400 font-normal">(auto-filled)</span></label>
                                <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-semibold">
                                    {data.block || <span className="text-gray-400 font-normal">Select a bar keeper above</span>}
                                </div>
                            </div>
                            {/* Number of Crates */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Crates *</label>
                                <input type="number" min="1" value={data.crates_issued} onChange={e => setData('crates_issued', e.target.value)} required
                                    placeholder="e.g. 2"
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${overStock ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-green-500'}`} />
                                {data.crates_issued > 0 && (
                                    <div className="mt-1.5 text-xs text-gray-400">
                                        Available: <span className="font-semibold text-gray-600">{availableCrates} crates ({availableBottles} btl)</span>
                                    </div>
                                )}
                                {overStock && (
                                    <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
                                        <span className="text-red-500 text-base mt-0.5">🚫</span>
                                        <div>
                                            <div className="text-red-700 font-bold text-sm">Not enough stock!</div>
                                            <div className="text-red-600 text-xs mt-0.5">
                                                You entered <strong>{data.crates_issued} crates ({bottlesIssued} btl)</strong> but only <strong>{availableCrates} crates ({availableBottles} btl)</strong> available in depot.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {willBeLowAfter && (
                                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-center gap-1.5">
                                        <span>⚠️</span>
                                        <span>After issuing, only <strong>{remainingAfter} btl ({Math.floor(remainingAfter / (selectedDrink?.bottles_per_crate || 1))} crates)</strong> will remain — stock will be low.</span>
                                    </div>
                                )}
                            </div>
                            {/* Auto-calc preview */}
                            {bottlesIssued > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                                    <div className="text-green-800 font-bold text-base">💰 Expected Revenue: {fmt(expectedRev)}</div>
                                    <div className="text-green-600 text-xs mt-1">
                                        {data.crates_issued} crates × {selectedDrink?.bottles_per_crate} btl = <strong>{bottlesIssued} bottles</strong>
                                        {' '} × {fmt(pricePerBottle)}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={processing || submitting || !bottlesIssued || overStock}
                                    className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-xl text-sm font-semibold">
                                    {processing || submitting ? 'Issuing...' : 'Issue Stock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Low Stock Alert popup after successful issuance */}
            {stockAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
                            <span className="text-3xl">🚨</span>
                            <div>
                                <div className="text-white font-extrabold text-lg">Low Stock Alert!</div>
                                <div className="text-red-200 text-sm">Depot stock is critically low</div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-base mb-1">
                                After this issuance, <span className="font-bold text-gray-900">{stockAlert.drinkName}</span> has dropped to:
                            </p>
                            <div className="my-4 bg-red-50 border-2 border-red-100 rounded-xl p-4 text-center">
                                <div className="text-4xl font-extrabold text-red-600">{stockAlert.remaining} btl</div>
                                <div className="text-sm text-red-400 font-medium mt-1">{stockAlert.cratesLeft} crate{stockAlert.cratesLeft !== 1 ? 's' : ''} remaining in depot</div>
                            </div>
                            <p className="text-sm text-gray-500 mb-5">Please restock from your supplier soon to avoid running out.</p>
                            <button
                                onClick={() => setStockAlert(null)}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm">
                                Got it — I'll restock soon
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
