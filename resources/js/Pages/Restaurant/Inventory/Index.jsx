import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt  = (n) => n ? `GHS ${parseFloat(n).toFixed(2)}` : '—';
const fmtQ = (n, unit) => n != null ? `${parseFloat(n).toFixed(1)} ${unit || ''}` : '—';

function SizeBreakdownModal({ item, onClose }) {
    const breakdown = item.size_breakdown || [];
    const sizeColors = {
        Small:  { bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-400' },
        Medium: { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-400' },
        Large:  { bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' },
    };
    const allSizes = ['Small', 'Medium', 'Large'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h3 className="font-bold text-gray-800 text-xl">{item.name}</h3>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{item.item_type}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                </div>
                <div className="p-6 space-y-3">
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-4">Stock by Size</p>

                    {allSizes.map(size => {
                        const entry = breakdown.find(b => b.size === size);
                        const rec  = entry?.received  || 0;
                        const sold = entry?.sold      || 0;
                        const rem  = entry?.remaining || 0;
                        const c    = sizeColors[size];
                        const pct  = rec > 0 ? Math.round((rem / rec) * 100) : 0;
                        const isLow = rem > 0 && rem <= 3;

                        return (
                            <div key={size} className={`rounded-xl p-4 border ${rec === 0 ? 'bg-gray-50 border-gray-100 opacity-60' : c.bg + ' border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${c.badge}`}>{size}</span>
                                    {rec === 0
                                        ? <span className="text-sm text-gray-400">No stock received</span>
                                        : <span className={`text-sm font-semibold ${rem === 0 ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-green-600'}`}>
                                            {rem === 0 ? '❌ Out of stock' : isLow ? `⚠️ Low — ${rem} left` : `✅ ${rem} in stock`}
                                          </span>
                                    }
                                </div>
                                {rec > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm text-gray-500 mb-1.5">
                                            <span>Received: <span className="font-semibold text-gray-700">{rec} pcs</span></span>
                                            <span>Sold: <span className="font-semibold text-gray-700">{sold} pcs</span></span>
                                            <span>Left: <span className="font-bold text-gray-800">{rem} pcs</span></span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className={`${c.bar} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-right text-sm text-gray-400 mt-0.5">{pct}% remaining</div>
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {breakdown.length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-base">No stock data yet for any size.</div>
                    )}

                    <div className="pt-2 border-t">
                        <div className="flex justify-between text-base font-semibold text-gray-700">
                            <span>Total in stock</span>
                            <span className="text-green-700">{parseFloat(item.current_stock).toFixed(0)} pcs</span>
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-5">
                    <button onClick={onClose} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base font-medium">Close</button>
                </div>
            </div>
        </div>
    );
}

function StockForm({ items, onClose, today }) {
    const [bags, setBags]     = useState('');
    const [pieces, setPieces] = useState('');

    const form = useForm({
        tracked_item_id: items[0]?.id || '',
        quantity_received: '', unit: 'kg', size: '', cost: '', date_received: today, notes: '',
    });

    const selectedItem   = items.find(i => i.id == form.data.tracked_item_id);
    const isRice         = selectedItem?.item_type === 'Rice';
    const kilosPerBag    = parseFloat(selectedItem?.kilos_per_bag || 0);
    const platesPerBag   = parseInt(selectedItem?.plates_per_bag || 0);
    const bagCount       = parseFloat(bags || 0);
    const totalKg        = bagCount > 0 && kilosPerBag > 0 ? bagCount * kilosPerBag : 0;
    const expectedPlates = bagCount > 0 && platesPerBag > 0 ? Math.round(bagCount * platesPerBag) : 0;

    const handleItemChange = (id) => {
        const item = items.find(i => i.id == id);
        setBags(''); setPieces('');
        form.setData({ ...form.data, tracked_item_id: id, quantity_received: '', size: '', unit: item?.item_type === 'Rice' ? 'kg' : 'pieces' });
    };

    const handleBagsChange = (val) => {
        setBags(val);
        const kg = parseFloat(val || 0) * kilosPerBag;
        form.setData('quantity_received', kg > 0 ? kg : '');
    };

    const handlePiecesChange = (val) => {
        setPieces(val);
        form.setData('quantity_received', val);
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('restaurant.inventory.store'), {
            onSuccess: () => { onClose(); form.reset(); setBags(''); setPieces(''); form.setData('date_received', today); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="font-bold text-gray-800 text-lg">📦 Receive Stock</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Food Item *</label>
                        <select
                            value={form.data.tracked_item_id}
                            onChange={e => handleItemChange(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.item_type})</option>
                            ))}
                        </select>
                    </div>

                    {isRice ? (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Bags *</label>
                            <input
                                type="number" min="1" step="1"
                                value={bags}
                                onChange={e => handleBagsChange(e.target.value)}
                                placeholder="e.g. 2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {bagCount > 0 && kilosPerBag > 0 && (
                                <div className="mt-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                                    <span className="text-yellow-800 font-semibold">{bagCount} bag{bagCount !== 1 ? 's' : ''} = {totalKg.toFixed(1)} kg</span>
                                    {expectedPlates > 0 && <span className="text-yellow-600 ml-2">→ ~{expectedPlates} plates</span>}
                                </div>
                            )}
                            {form.errors.quantity_received && <p className="text-red-500 text-xs mt-1">{form.errors.quantity_received}</p>}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Pieces *</label>
                            <input
                                type="number" min="1" step="1"
                                value={pieces}
                                onChange={e => handlePiecesChange(e.target.value)}
                                placeholder="e.g. 5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {form.errors.quantity_received && <p className="text-red-500 text-xs mt-1">{form.errors.quantity_received}</p>}
                        </div>
                    )}

                    {/* Size selector for non-Rice items */}
                    {!isRice && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Size *</label>
                            <div className="flex space-x-2">
                                {['Small', 'Medium', 'Large'].map(s => (
                                    <button
                                        key={s} type="button"
                                        onClick={() => form.setData('size', s)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                            form.data.size === s
                                                ? 'bg-green-700 text-white border-green-700'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
                                        }`}
                                    >{s}</button>
                                ))}
                            </div>
                            {form.errors.size && <p className="text-red-500 text-xs mt-1">{form.errors.size}</p>}
                        </div>
                    )}

                    <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cost (GHS)</label>
                            <input
                                type="number" step="0.01" min="0"
                                value={form.data.cost}
                                onChange={e => form.setData('cost', e.target.value)}
                                placeholder="Optional"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
                            <input
                                type="date"
                                value={form.data.date_received}
                                onChange={e => form.setData('date_received', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
                            <input
                                type="text"
                                value={form.data.notes}
                                onChange={e => form.setData('notes', e.target.value)}
                                placeholder="Optional"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium">Cancel</button>
                        <button
                            type="submit" disabled={form.processing}
                            className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-semibold"
                        >
                            {form.processing ? 'Saving...' : 'Receive Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function RestaurantInventoryIndex({ items, receipts }) {
    const [showForm, setShowForm] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const today = new Date().toISOString().split('T')[0];

    return (
        <AppLayout title="Restaurant Inventory">
            <Head title="Restaurant - Inventory" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">🏪 Restaurant Inventory</h2>
                    <p className="text-sm text-gray-500">Track all stock received into the restaurant</p>
                </div>
                <button onClick={() => setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">📦 Receive Stock</button>
            </div>

            {/* Stock Balance Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {items.map(item => {
                    const isLow = item.current_stock < 5;
                    return (
                        <div key={item.id} className={`rounded-xl p-4 border ${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-800 text-sm truncate">{item.name}</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{item.item_type}</span>
                            </div>
                            <div className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-green-700'}`}>
                                {parseFloat(item.current_stock).toFixed(1)}
                                <span className="text-sm font-normal text-gray-500 ml-1">{item.item_type === 'Rice' ? 'kg' : 'pcs'} in stock</span>
                            </div>
                            {item.expected_plates_in_stock != null && (
                                <div className="text-xs text-yellow-700 font-semibold mt-1">~{item.expected_plates_in_stock} plates worth</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                                {parseFloat(item.total_received).toFixed(1)} received — {item.total_sold} sold
                            </div>
                            {isLow && <div className="text-xs text-red-600 font-semibold mt-1">⚠️ Low stock</div>}
                            {item.item_type !== 'Rice' && (
                                <button
                                    onClick={() => setViewItem(item)}
                                    className="mt-2 w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                                >
                                    👁 Review
                                </button>
                            )}
                        </div>
                    );
                })}
                {items.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-400 text-sm">No food items set up yet. Add items in Food Item Setup first.</div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>{['Date','Item','Qty Received','Size','Cost','Notes',''].map(h=>(
                                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {receipts.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-500">{r.date_received}</td>
                                    <td className="px-4 py-2">
                                        <div className="font-semibold text-gray-800">{r.tracked_item?.name}</div>
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{r.tracked_item?.item_type}</span>
                                    </td>
                                    <td className="px-4 py-2 font-semibold text-green-700">{fmtQ(r.quantity_received, r.unit)}</td>
                                    <td className="px-4 py-2">{r.size ? <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">{r.size}</span> : <span className="text-gray-300">—</span>}</td>
                                    <td className="px-4 py-2 text-gray-600">{fmt(r.cost)}</td>
                                    <td className="px-4 py-2 text-gray-400 text-xs">{r.notes || '—'}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => { if (confirm('Remove this entry?')) router.delete(route('restaurant.inventory.destroy', r.id)); }} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {receipts.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No stock received yet.</div>}
                </div>

            {showForm && (
                <StockForm items={items} today={today} onClose={() => setShowForm(false)} />
            )}

            {viewItem && (
                <SizeBreakdownModal item={viewItem} onClose={() => setViewItem(null)} />
            )}
        </AppLayout>
    );
}

