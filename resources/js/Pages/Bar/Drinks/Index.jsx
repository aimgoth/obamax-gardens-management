import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const today = new Date().toISOString().split('T')[0];

export default function DrinksIndex({ drinks }) {
    const [showForm, setShowForm] = useState(false);
    const [editDrink, setEditDrink] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '', sell_by: 'bottle', bottles_per_crate: 24, price_per_bottle: '',
        tots_per_bottle: '', price_per_tot: '', date_added: today,
    });

    const isTot = data.sell_by === 'tot';

    const openCreate = () => {
        reset();
        setData({ name: '', sell_by: 'bottle', bottles_per_crate: 24, price_per_bottle: '', tots_per_bottle: '', price_per_tot: '', date_added: today });
        setEditDrink(null);
        setShowForm(true);
    };
    const openEdit = (d) => {
        setData({
            name: d.name, sell_by: d.sell_by || 'bottle', bottles_per_crate: d.bottles_per_crate,
            price_per_bottle: d.price_per_bottle, tots_per_bottle: d.tots_per_bottle || '',
            price_per_tot: d.price_per_tot || '', date_added: today,
        });
        setEditDrink(d);
        setShowForm(true);
    };
    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setShowForm(false); reset(); } };
        editDrink ? put(route('bar.drinks.update', editDrink.id), opts) : post(route('bar.drinks.store'), opts);
    };
    const deactivate = (d) => { if (confirm(`Deactivate ${d.name}?`)) router.delete(route('bar.drinks.destroy', d.id)); };

    // Price preview calculations
    const bottlePrice = parseFloat(data.price_per_bottle || 0);
    const crateValue = parseFloat(data.bottles_per_crate || 0) * bottlePrice;
    const totPrice = parseFloat(data.price_per_tot || 0);
    const totsCount = parseInt(data.tots_per_bottle || 0);
    const bottleRevenue = totsCount * totPrice;

    return (
        <AppLayout title="Drink Setup">
            <Head title="Bar - Drinks" />
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">🥃 Drink Catalogue</h2>
                    <p className="text-sm text-gray-500">{drinks.filter(d => d.is_active).length} active drinks in the system</p>
                </div>
                <button onClick={openCreate} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">+ Add Drink</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {['Drink Name', 'Type', 'Bottles / Crate', 'Selling Price', 'Depot Stock', 'Status', ''].map(h => (
                                <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-600 text-sm">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {drinks.map(d => {
                            const isTotDrink = d.sell_by === 'tot';
                            return (
                                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-gray-800">{d.name}</td>
                                    <td className="px-5 py-3">
                                        {isTotDrink ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">🥃 Tot</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">🍺 Bottle</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {d.bottles_per_crate} bottles
                                        {isTotDrink && <span className="text-xs text-green-500 ml-1">({d.tots_per_bottle} tots/bottle)</span>}
                                    </td>
                                    <td className="px-5 py-3">
                                        {isTotDrink ? (
                                            <span className="font-medium text-green-700">GHS {parseFloat(d.price_per_tot).toFixed(2)}/tot</span>
                                        ) : (
                                            <span className="font-medium text-green-700">GHS {parseFloat(d.price_per_bottle).toFixed(2)}/bottle</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`font-semibold ${d.current_depot_stock < d.bottles_per_crate ? 'text-red-600' : 'text-gray-800'}`}>
                                            {d.current_depot_stock} btl
                                            {d.bottles_per_crate > 0 && <span className="text-xs text-gray-400 ml-1">({Math.floor(d.current_depot_stock / d.bottles_per_crate)} crates)</span>}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {d.is_active ? '● Active' : '○ Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <button onClick={() => openEdit(d)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                        {d.is_active && <button onClick={() => deactivate(d)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {drinks.length === 0 && <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-2">🍺</div><div>No drinks added yet. Click <strong>+ Add Drink</strong> to get started.</div></div>}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
                            <h3 className="font-bold text-gray-800 text-lg">{editDrink ? '✏️ Edit Drink' : '🍺 Add New Drink'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-5">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                                <input type="date" value={data.date_added} onChange={e => setData('date_added', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50" />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name of Drink *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Star Beer, Alomo Bitters, Club Ice..." required autoFocus
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Sell By Toggle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">How is this drink sold? *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setData('sell_by', 'bottle')}
                                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                                            !isTot ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}>
                                        <span className="text-2xl mb-1">🍺</span>
                                        <span className={`text-sm font-semibold ${!isTot ? 'text-green-700' : 'text-gray-600'}`}>Per Bottle</span>
                                        <span className="text-xs text-gray-400 mt-0.5">e.g. Star Beer, Coca Cola</span>
                                    </button>
                                    <button type="button" onClick={() => setData('sell_by', 'tot')}
                                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                                            isTot ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}>
                                        <span className="text-2xl mb-1">🥃</span>
                                        <span className={`text-sm font-semibold ${isTot ? 'text-green-700' : 'text-gray-600'}`}>Per Tot</span>
                                        <span className="text-xs text-gray-400 mt-0.5">e.g. Alomo Bitters, Whisky</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bottles per crate */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Number of Bottles per Crate *
                                </label>
                                <input type="number" value={data.bottles_per_crate} onChange={e => setData('bottles_per_crate', e.target.value)} min="1" required
                                    placeholder="e.g. 24"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                {errors.bottles_per_crate && <p className="text-red-500 text-xs mt-1">{errors.bottles_per_crate}</p>}
                            </div>

                            {/* Tot-specific fields */}
                            {isTot && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                                        <span>🥃</span> Tot Selling Configuration
                                    </div>
                                    {/* Tots per bottle */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Tots per Bottle *</label>
                                        <input type="number" value={data.tots_per_bottle} onChange={e => setData('tots_per_bottle', e.target.value)} min="1" required
                                            placeholder="e.g. 20"
                                            className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white" />
                                        {errors.tots_per_bottle && <p className="text-red-500 text-xs mt-1">{errors.tots_per_bottle}</p>}
                                    </div>
                                    {/* Price per tot */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price per Tot (GHS) *</label>
                                        <input type="number" value={data.price_per_tot} onChange={e => setData('price_per_tot', e.target.value)} step="0.01" min="0" required
                                            placeholder="e.g. 3.00"
                                            className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white" />
                                        {errors.price_per_tot && <p className="text-red-500 text-xs mt-1">{errors.price_per_tot}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Price per bottle - only show for bottle mode */}
                            {!isTot && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Price per Bottle (GHS) *
                                </label>
                                <input type="number" value={data.price_per_bottle} onChange={e => setData('price_per_bottle', e.target.value)} step="0.01" min="0" required
                                    placeholder="e.g. 5.00"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                                {errors.price_per_bottle && <p className="text-red-500 text-xs mt-1">{errors.price_per_bottle}</p>}
                            </div>
                            )}

                            {/* Price preview - Bottle mode */}
                            {!isTot && data.bottles_per_crate && data.price_per_bottle && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                                    <div className="text-green-800 font-semibold">💰 Crate value: GHS {crateValue.toFixed(2)}</div>
                                    <div className="text-green-600 text-xs mt-0.5">{data.bottles_per_crate} bottles × GHS {bottlePrice.toFixed(2)}</div>
                                </div>
                            )}

                            {/* Price preview - Tot mode */}
                            {isTot && data.tots_per_bottle && data.price_per_tot && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm space-y-1">
                                    <div className="text-green-800 font-semibold">💰 Revenue per bottle: GHS {bottleRevenue.toFixed(2)}</div>
                                    <div className="text-green-600 text-xs">{totsCount} tots × GHS {totPrice.toFixed(2)} per tot</div>
                                    {data.bottles_per_crate && (
                                        <div className="text-xs text-green-500">
                                            Crate: {data.bottles_per_crate} bottles × GHS {bottleRevenue.toFixed(2)} = GHS {(parseFloat(data.bottles_per_crate) * bottleRevenue).toFixed(2)} revenue
                                        </div>
                                    )}
                                </div>
                            )}

                            {editDrink && <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">⚠️ Changing the price will record a price history entry.</p>}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={processing}
                                    className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold bg-green-700 hover:bg-green-800 disabled:bg-green-400">
                                    {processing ? 'Saving...' : editDrink ? 'Update Drink' : 'Add Drink'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
