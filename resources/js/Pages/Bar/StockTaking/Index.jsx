import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n || 0).toFixed(2)}`;
const xsrf = () => decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '');

export default function BarStockTakingIndex({ workers, blocks, grouped }) {
    const today = new Date().toISOString().split('T')[0];
    const [showForm, setShowForm] = useState(false);

    // Form state — step 1
    const [workerId, setWorkerId] = useState(workers[0]?.id || '');
    const [block, setBlock]       = useState(workers[0]?.block || blocks[0] || 'Block A');
    const [stockDate, setStockDate] = useState(today);
    const [notes, setNotes]       = useState('');

    // Step 2 — loaded data
    const [loading, setLoading]         = useState(false);
    const [loaded, setLoaded]           = useState(false);
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd]     = useState('');
    const [drinks, setDrinks]           = useState([]);
    const [totalCollected, setTotalCollected] = useState(0);
    const [closingDaysCount, setClosingDaysCount] = useState(0);
    const [prepareWarning, setPrepareWarning]     = useState(null);

    // Closing stocks typed by admin — keyed by drink_id
    const [closingStocks, setClosingStocks] = useState({});

    // Wastage entries — separate section, list of { id, drink_id, qty }
    const [wastageEntries, setWastageEntries] = useState([]);

    const addWastageEntry   = () => setWastageEntries(prev => [...prev, { id: Date.now(), drink_id: '', qty: '' }]);
    const removeWastageEntry = (id) => setWastageEntries(prev => prev.filter(e => e.id !== id));
    const updateWastageEntry = (id, field, val) =>
        setWastageEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));

    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(null);

    const loadDrinks = async () => {
        if (!workerId || !block || !stockDate) return;
        setLoading(true);
        setLoaded(false);
        setDrinks([]);
        setPrepareWarning(null);
        try {
            const url = route('bar.stocktaking.prepare')
                + `?worker_id=${workerId}&block=${encodeURIComponent(block)}&date=${stockDate}`;
            const res = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': xsrf() },
                credentials: 'include',
            });
            const data = await res.json();
            setPeriodStart(data.period_start);
            setPeriodEnd(data.period_end);
            setDrinks(data.drinks || []);
            setTotalCollected(data.total_collected || 0);
            setClosingDaysCount(data.closing_days_count || 0);
            setPrepareWarning(data.warning || null);
            // Reset closing stocks
            const initial = {};
            (data.drinks || []).forEach(d => { initial[d.drink_id] = ''; });
            setClosingStocks(initial);
            setWastageEntries([]);
            setLoaded(true);
        } catch (e) {
            alert('Failed to load data: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const updateClosing = (drinkId, val) => {
        setClosingStocks(prev => ({ ...prev, [drinkId]: val }));
    };

    // Aggregate wastage by drink_id
    const wastageMap = {};
    wastageEntries.forEach(e => {
        if (e.drink_id) {
            wastageMap[String(e.drink_id)] = (wastageMap[String(e.drink_id)] || 0) + (parseInt(e.qty) || 0);
        }
    });

    // Live calculations
    const computedDrinks = drinks.map(d => {
        const closing  = parseInt(closingStocks[d.drink_id] ?? 0) || 0;
        const wastage  = wastageMap[String(d.drink_id)] || 0;
        const qtySold  = Math.max(0, d.opening_stock + d.issued_during_period - closing - wastage);
        const expected = qtySold * d.bottle_revenue;
        const wastageVal = wastage * d.bottle_revenue;
        return { ...d, closing_stock: closing, wastage, wastage_value: wastageVal, qty_sold: qtySold, expected_revenue: expected };
    });

    const totalExpected      = computedDrinks.reduce((s, d) => s + d.expected_revenue, 0);
    const totalWastageBottles = computedDrinks.reduce((s, d) => s + (d.wastage || 0), 0);
    const totalWastageValue  = computedDrinks.reduce((s, d) => s + (d.wastage_value || 0), 0);
    const shortfall = totalExpected - totalCollected;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const items = computedDrinks.map(d => ({
            drink_id:             d.drink_id,
            opening_stock:        d.opening_stock,
            issued_during_period: d.issued_during_period,
            closing_stock:        d.closing_stock,
            wastage:              d.wastage || 0,
        }));
        router.post(route('bar.stocktaking.store'), {
            worker_id:    workerId,
            block,
            stock_date:   stockDate,
            period_start: periodStart,
            period_end:   periodEnd,
            notes,
            items,
        }, {
            onSuccess: () => {
                setShowForm(false);
                setLoaded(false);
                setDrinks([]);
                setNotes('');
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    const downloadReport = async (id) => {
        setDownloading(id);
        try {
            const res = await fetch(route('bar.stocktaking.report', id), {
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': xsrf() },
                credentials: 'include',
            });
            if (!res.ok) { alert('Could not generate report.'); return; }
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url; a.download = `stocktaking-${id}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch (err) {
            alert('Download failed: ' + err.message);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <AppLayout title="Bar Stock Taking">
            <Head title="Bar - Stock Taking" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">📋 Bar Stock Taking</h2>
                    <p className="text-sm text-gray-500">Record and verify bar keeper's stock accountability</p>
                </div>
                <button onClick={() => { setShowForm(true); setLoaded(false); setDrinks([]); }}
                    className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
                    + Record Stock Taking
                </button>
            </div>

            {/* History grouped by worker */}
            {Object.keys(grouped).length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 py-12 text-center text-gray-400">
                    No stock takings recorded yet.
                </div>
            ) : (
                Object.entries(grouped).map(([workerName, records]) => (
                    <div key={workerName} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold">
                                {workerName[0]}
                            </div>
                            <h3 className="font-bold text-gray-700 text-base">{workerName}</h3>
                            <span className="text-xs text-gray-400">{records.length} record{records.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>{['Date', 'Block', 'Period', 'Drinks', 'Expected', 'Collected', 'Result', ''].map(h =>
                                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {records.map(r => {
                                        const sf = parseFloat(r.shortfall);
                                        return (
                                            <tr key={r.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-600 text-xs">{r.stock_date}</td>
                                                <td className="px-4 py-3 text-gray-700">{r.block}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{r.period_start} → {r.period_end}</td>
                                                <td className="px-4 py-3 text-gray-600">{r.items?.length ?? 0} drink{r.items?.length !== 1 ? 's' : ''}</td>
                                                <td className="px-4 py-3 text-gray-700 font-medium">{fmt(r.total_expected_revenue)}</td>
                                                <td className="px-4 py-3 text-gray-700">{fmt(r.total_collected)}</td>
                                                <td className="px-4 py-3">
                                                    {sf > 0 ? (
                                                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">⚠️ Loss &minus;{fmt(sf)}</span>
                                                    ) : sf < 0 ? (
                                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">📈 Profit +{fmt(Math.abs(sf))}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">✅ Balanced</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => downloadReport(r.id)}
                                                        disabled={downloading === r.id}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50">
                                                        {downloading === r.id ? 'Downloading...' : '⬇ PDF'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="font-bold text-gray-800 text-lg">📋 Record Stock Taking</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Step 1: Select worker/block/date */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bar Keeper *</label>
                                    <select value={workerId} onChange={e => {
                                        const w = workers.find(w => String(w.id) === e.target.value);
                                        setWorkerId(e.target.value);
                                        setBlock(w?.block || block);
                                        setLoaded(false);
                                    }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500">
                                        {workers.map(w => <option key={w.id} value={w.id}>{w.name} — {w.block}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Block <span className="text-gray-400 font-normal">(auto-filled)</span></label>
                                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-semibold">
                                        {block || <span className="text-gray-400 font-normal">—</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Stock Taking Date *</label>
                                    <input type="date" value={stockDate} onChange={e => { setStockDate(e.target.value); setLoaded(false); }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                            </div>

                            <button onClick={loadDrinks} disabled={loading || !workerId || !block || !stockDate}
                                className="mb-5 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                                {loading ? '⏳ Loading...' : '🔍 Load Drinks for This Period'}
                            </button>

                            {/* Warnings */}
                            {prepareWarning && (
                                <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 text-sm text-yellow-800">
                                    ⚠ {prepareWarning}
                                </div>
                            )}

                            {/* Step 2: Period info + drinks table */}
                            {loaded && (
                                <form onSubmit={handleSubmit}>
                                    {/* Period banner */}
                                    <div className="flex gap-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-800">
                                        <span>📅 <strong>Period:</strong> {periodStart} → {periodEnd}</span>
                                        <span className="ml-auto text-blue-600 font-semibold">
                                            {closingDaysCount} daily closing{closingDaysCount !== 1 ? 's' : ''} found
                                        </span>
                                    </div>

                                    {drinks.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">No drinks were issued in this period.</div>
                                    ) : (
                                        <>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200 mb-5">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        {['Drink', 'Opening', 'Issued', 'Closing Stock ✏️', 'Qty Sold', 'Expected Rev.'].map(h =>
                                                            <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-600 text-xs">{h}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {computedDrinks.map(d => (
                                                        <tr key={d.drink_id} className="hover:bg-gray-50">
                                                            <td className="px-3 py-2 font-semibold text-gray-800">{d.drink_name}</td>
                                                            <td className="px-3 py-2 text-gray-500">{d.opening_stock} btl</td>
                                                            <td className="px-3 py-2 text-gray-500">{d.issued_during_period} btl</td>
                                                            <td className="px-3 py-2">
                                                                <input type="number" min="0"
                                                                    value={closingStocks[d.drink_id] ?? ''}
                                                                    onChange={e => updateClosing(d.drink_id, e.target.value)}
                                                                    placeholder="Count..."
                                                                    className="w-24 px-2 py-1 border border-green-400 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 text-center font-bold" />
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-800 font-bold">{d.qty_sold} btl</td>
                                                            <td className="px-3 py-2 text-green-700 font-bold">{fmt(d.expected_revenue)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Wastage / Written-Off Section */}
                                        <div className="mb-5 border border-red-200 rounded-xl overflow-hidden">
                                            <div className="flex items-center justify-between bg-red-50 px-4 py-2.5 border-b border-red-200">
                                                <span className="text-sm font-bold text-red-700">🗑 Wastage / Written-Off Bottles</span>
                                                <button type="button" onClick={addWastageEntry}
                                                    className="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg font-semibold">
                                                    + Add Entry
                                                </button>
                                            </div>
                                            {wastageEntries.length === 0 ? (
                                                <div className="px-4 py-3 text-xs text-gray-400 text-center">
                                                    No wastage recorded. Click "+ Add Entry" to log broken/damaged/expired bottles.
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-red-100">
                                                    {wastageEntries.map(e => (
                                                        <div key={e.id} className="flex items-center gap-3 px-4 py-2">
                                                            <select
                                                                value={e.drink_id}
                                                                onChange={ev => updateWastageEntry(e.id, 'drink_id', ev.target.value)}
                                                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400">
                                                                <option value="">— Select Drink —</option>
                                                                {drinks.map(d => (
                                                                    <option key={d.drink_id} value={d.drink_id}>{d.drink_name}</option>
                                                                ))}
                                                            </select>
                                                            <input type="number" min="0" placeholder="Qty"
                                                                value={e.qty}
                                                                onChange={ev => updateWastageEntry(e.id, 'qty', ev.target.value)}
                                                                className="w-20 px-2 py-1.5 border border-red-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 text-center font-bold" />
                                                            <span className="text-xs text-gray-400">btl</span>
                                                            <button type="button" onClick={() => removeWastageEntry(e.id)}
                                                                className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Financial summary */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Expected Revenue</span>
                                                <span className="font-bold text-gray-800">{fmt(totalExpected)}</span>
                                            </div>
                                            {totalWastageBottles > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-600">🗑 Wastage ({totalWastageBottles} btl written off)</span>
                                                    <span className="font-bold text-red-600">-{fmt(totalWastageValue)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Collected (Daily Closings)</span>
                                                <span className="font-bold text-gray-800">{fmt(totalCollected)}</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-bold">
                                                {shortfall > 0 ? (
                                                    <>
                                                        <span className="flex items-center gap-1.5 text-red-600"><span className="text-base">⚠️</span> Shortfall (Loss)</span>
                                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">&minus; {fmt(shortfall)}</span>
                                                    </>
                                                ) : shortfall < 0 ? (
                                                    <>
                                                        <span className="flex items-center gap-1.5 text-green-700"><span className="text-base">📈</span> Profit (Surplus)</span>
                                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">+ {fmt(Math.abs(shortfall))}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="flex items-center gap-1.5 text-green-600"><span className="text-base">✅</span> Balanced</span>
                                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">GHS 0.00</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        </>
                                    )}

                                    {/* Notes */}
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                                            placeholder="Any remarks..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowForm(false)}
                                            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={submitting || drinks.length === 0}
                                            className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold">
                                            {submitting ? 'Saving...' : '✓ Save Stock Taking'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
