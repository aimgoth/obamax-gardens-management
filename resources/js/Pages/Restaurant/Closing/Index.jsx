import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt  = (n) => `GHS ${parseFloat(n||0).toFixed(2)}`;
const SIZES = ['', 'Small', 'Medium', 'Large'];
const sizeColor = { Small: 'bg-blue-100 text-blue-700', Medium: 'bg-purple-100 text-purple-700', Large: 'bg-orange-100 text-orange-700' };

export default function RestaurantClosingIndex({ items, closings, ingredients, today, todayCount, todayIngredients, daySummary, reports, todayReport }) {
    const { flash } = usePage().props;
    const [tab, setTab] = useState('closing');
    const [showForm, setShowForm] = useState(false);

    // Closing form
    const { data, setData, post, processing, errors, reset } = useForm({
        tracked_item_id: items[0]?.id||'', size_category:'', closing_date: today, plates_sold:'', notes:'',
    });
    // Ingredient form
    const { data: iData, setData: setIData, post: iPost, processing: iProcessing, reset: iReset } = useForm({
        expense_date: today, amount:'', description:'',
    });
    // Daily report form
    const { data: rData, setData: setRData, post: rPost, processing: rProcessing, reset: rReset } = useForm({
        report_date: today, total_cash: todayReport?.total_cash || '', notes: todayReport?.notes || '',
    });

    const submit = (e) => { e.preventDefault(); post(route('restaurant.closing.store'), {onSuccess:()=>{setShowForm(false);reset();}}); };
    const submitIngredients = (e) => { e.preventDefault(); iPost(route('restaurant.ingredients.store'), {onSuccess:()=>iReset()}); };
    const submitReport = (e) => {
        e.preventDefault();
        rPost(route('restaurant.report.store'), { onSuccess: () => {} });
    };

    const selectedItem = items.find(i => i.id == data.tracked_item_id);

    // Compute totals from daySummary
    const riceRevenue = daySummary.rice_items.reduce((s, i) => s + (i.revenue || 0), 0);
    const portionRevenue = daySummary.portion_items.reduce((s, i) => s + (i.total_revenue || 0), 0);
    const calcTotal = riceRevenue + portionRevenue;
    const totalCashEntered = parseFloat(rData.total_cash || 0);
    const net = totalCashEntered - daySummary.ingredient_cost;

    return (
        <AppLayout title="Restaurant Closing">
            <Head title="Restaurant - Daily Closing" />

            {flash?.success && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
                    ✅ {flash.success}
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Restaurant Daily Closing</h2>
                <button onClick={()=>setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Record Closing</button>
            </div>

            {/* Today Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-0.5">Items Recorded Today</div>
                    <div className="text-2xl font-bold text-green-700">{todayCount}</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-0.5">Today's Ingredients Cost</div>
                    <div className="text-2xl font-bold text-amber-700">{fmt(todayIngredients)}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-0.5">Calculated Revenue</div>
                    <div className="text-2xl font-bold text-blue-700">{calcTotal > 0 ? fmt(calcTotal) : '—'}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-0.5">Report Submitted</div>
                    <div className="text-lg font-bold text-purple-700">{todayReport ? '✅ Yes' : '⏳ Pending'}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit flex-wrap gap-y-1">
                {[['closing','📋 Sales Closings'],['ingredients','🧾 Ingredients'],['report','📊 Daily Report']].map(([k,l])=>(
                    <button key={k} onClick={()=>setTab(k)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab===k?'bg-white text-gray-800 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{l}</button>
                ))}
            </div>

            {/* ── SALES CLOSINGS TAB ── */}
            {tab==='closing' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b"><tr>{['Date','Item','Size','Qty Sold','Notes'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-50">
                            {closings.map(c=>(
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-500">{c.closing_date}</td>
                                    <td className="px-4 py-2 font-medium text-gray-800">{c.tracked_item?.name}</td>
                                    <td className="px-4 py-2 text-gray-600">{c.size_category||'Standard'}</td>
                                    <td className="px-4 py-2">{c.plates_sold != null ? <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{c.plates_sold} {c.tracked_item?.item_type === 'Rice' ? 'plates' : 'pcs'}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                                    <td className="px-4 py-2 text-gray-400 text-xs">{c.notes||'—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {closings.length===0&&<div className="text-center py-8 text-gray-400 text-sm">No closings recorded yet.</div>}
                </div>
            )}

            {/* ── INGREDIENTS TAB ── */}
            {tab==='ingredients' && (
                <div>
                    <form onSubmit={submitIngredients} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                        <div className="font-semibold text-gray-700 mb-3">Record Ingredient Expenses</div>
                        <div className="flex gap-3 flex-wrap">
                            <input type="date" value={iData.expense_date} onChange={e=>setIData('expense_date',e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>
                            <input type="number" step="0.01" min="0" value={iData.amount} onChange={e=>setIData('amount',e.target.value)} placeholder="Amount (GHS)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 w-36"/>
                            <input type="text" value={iData.description} onChange={e=>setIData('description',e.target.value)} placeholder="Description (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 flex-1"/>
                            <button type="submit" disabled={iProcessing} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium">{iProcessing?'Saving...':'Save'}</button>
                        </div>
                    </form>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr>{['Date','Amount','Description'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {ingredients.map(i=><tr key={i.id} className="hover:bg-gray-50"><td className="px-4 py-2 text-gray-500">{i.expense_date}</td><td className="px-4 py-2 font-semibold text-amber-700">{fmt(i.amount)}</td><td className="px-4 py-2 text-gray-600">{i.description||'—'}</td></tr>)}
                            </tbody>
                        </table>
                        {ingredients.length===0&&<div className="text-center py-8 text-gray-400 text-sm">No ingredient expenses recorded.</div>}
                    </div>
                </div>
            )}

            {/* ── DAILY REPORT TAB ── */}
            {tab==='report' && (
                <div className="space-y-5">
                    {/* Report Date & Cash Input */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="font-bold text-gray-800 mb-4">📊 Daily Report — {daySummary.date}</h3>
                        <form onSubmit={submitReport}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Report Date</label>
                                    <input type="date" value={rData.report_date} onChange={e=>setRData('report_date',e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Cash Received (GHS) *</label>
                                    <input type="number" step="0.01" min="0" value={rData.total_cash} onChange={e=>setRData('total_cash',e.target.value)} placeholder="e.g. 1500.00" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 font-semibold"/>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
                                <input type="text" value={rData.notes} onChange={e=>setRData('notes',e.target.value)} placeholder="Any remarks for the day..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>
                            </div>
                            <button type="submit" disabled={rProcessing || !rData.total_cash} className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded-xl text-base font-bold">
                                {rProcessing ? 'Submitting...' : todayReport ? '✅ Update Daily Report' : '📤 Submit Daily Report'}
                            </button>
                        </form>
                    </div>

                    {/* Day Summary - Rice Items */}
                    {daySummary.rice_items.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">🍚 Rice / Plates Sold</h4>
                            <div className="space-y-2">
                                {daySummary.rice_items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                        <div>
                                            <span className="font-semibold text-gray-800">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-yellow-700">{item.plates_sold} plates sold</div>
                                            {item.revenue > 0 && <div className="text-sm text-green-700 font-semibold">{fmt(item.revenue)}</div>}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 font-bold text-gray-800">
                                    <span>Rice Subtotal</span>
                                    {riceRevenue > 0 && <span className="text-green-700">{fmt(riceRevenue)}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Day Summary - Portion Items (Fish / Meat / Chicken) */}
                    {daySummary.portion_items.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h4 className="font-bold text-gray-700 mb-3">🐟 Fish / Meat / Chicken — Size Breakdown</h4>
                            <div className="space-y-4">
                                {daySummary.portion_items.map(item => (
                                    <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="font-bold text-gray-800 text-base">{item.name}</span>
                                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{item.item_type}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-700">{item.total_sold} pcs sold</div>
                                                {item.total_revenue > 0 && <div className="text-sm font-bold text-green-700">{fmt(item.total_revenue)}</div>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {item.sizes.map(s => (
                                                <div key={s.size} className={`rounded-lg p-3 ${s.sold === 0 && s.remaining === 0 ? 'bg-gray-50 opacity-50' : 'bg-gray-50'}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sizeColor[s.size]}`}>{s.size}</span>
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-700 mt-1">{s.sold} sold</div>
                                                    {s.price > 0 && <div className="text-xs text-green-700">{fmt(s.revenue)}</div>}
                                                    <div className={`text-xs font-semibold mt-1 ${s.remaining === 0 ? 'text-red-500' : s.remaining <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                                                        {s.remaining} left
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 font-bold text-gray-800 border-t">
                                    <span>Portion Subtotal</span>
                                    {portionRevenue > 0 && <span className="text-green-700">{fmt(portionRevenue)}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {daySummary.rice_items.length === 0 && daySummary.portion_items.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                            No sales recorded for this date yet. Use "+ Record Closing" to enter today's sales first.
                        </div>
                    )}

                    {/* Financial Summary */}
                    <div className="bg-gray-900 text-white rounded-xl p-5 space-y-3">
                        <h4 className="font-bold text-white text-base mb-3">💰 Financial Summary — {daySummary.date}</h4>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Calculated Revenue (from prices)</span>
                            <span className="font-semibold">{calcTotal > 0 ? fmt(calcTotal) : '—'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Ingredient / Kitchen Expenses</span>
                            <span className="font-semibold text-red-400">- {fmt(daySummary.ingredient_cost)}</span>
                        </div>
                        <div className="border-t border-gray-700 pt-3 flex justify-between">
                            <span className="text-gray-200 font-semibold">Total Cash Received (entered)</span>
                            <span className="font-bold text-green-400 text-lg">{totalCashEntered > 0 ? fmt(totalCashEntered) : '—'}</span>
                        </div>
                        {totalCashEntered > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-200 font-semibold">Net (Cash − Expenses)</span>
                                <span className={`font-bold text-lg ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(net)}</span>
                            </div>
                        )}
                    </div>

                    {/* Past Reports */}
                    {reports.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-5 py-4 border-b font-bold text-gray-700">📁 Past Daily Reports</div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>{['Date','Total Cash','Net (Cash − Ingredients)','Notes'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reports.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-gray-600 font-medium">{r.report_date}</td>
                                            <td className="px-4 py-2 font-bold text-green-700">{fmt(r.total_cash)}</td>
                                            <td className="px-4 py-2 text-gray-500">—</td>
                                            <td className="px-4 py-2 text-gray-400 text-xs">{r.notes||'—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── RECORD CLOSING MODAL ── */}
            {showForm&&(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-semibold text-gray-800">Record Restaurant Closing</h3><button onClick={()=>setShowForm(false)}>✕</button></div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                                <select value={data.tracked_item_id} onChange={e=>setData('tracked_item_id',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500">
                                    {items.map(i=><option key={i.id} value={i.id}>{i.name} ({i.item_type})</option>)}
                                </select>
                            </div>
                            {selectedItem?.price_small && (
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Size Category</label>
                                    <select value={data.size_category} onChange={e=>setData('size_category',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500">
                                        {SIZES.map(s=><option key={s} value={s}>{s||'Standard'}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">{selectedItem?.item_type === 'Rice' ? 'Plates Sold' : 'Pieces Sold'} *</label><input type="number" min="0" value={data.plates_sold} onChange={e=>setData('plates_sold',e.target.value)} placeholder="e.g. 50" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>{errors.plates_sold&&<p className="text-red-500 text-xs">{errors.plates_sold}</p>}</div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={data.closing_date} onChange={e=>setData('closing_date',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input type="text" value={data.notes} onChange={e=>setData('notes',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/></div>
                            {errors.closing_date&&<p className="text-red-500 text-xs">{errors.closing_date}</p>}
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium">{processing?'Saving...':'Record Closing'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
