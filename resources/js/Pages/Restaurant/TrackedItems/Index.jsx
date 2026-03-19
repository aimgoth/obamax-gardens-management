import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const CATEGORIES = ['Rice', 'Fish', 'Meat', 'Chicken', 'Stew', 'Other'];
const fmt = (n) => n ? `GHS ${parseFloat(n).toFixed(2)}` : '—';
const isRice = (type) => type === 'Rice';

// Bag sizes based on kg
const BAG_SIZE_LABEL = (kg) => {
    const k = parseFloat(kg);
    if (!k) return '';
    if (k <= 5) return 'Small Bag';
    if (k <= 15) return 'Medium Bag';
    if (k <= 30) return 'Large Bag';
    return 'Extra Large Bag';
};

export default function TrackedItemsIndex({ items }) {
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '', item_type: 'Rice', kilos_per_bag: '', plates_per_bag: '',
        price_small: '', price_medium: '', price_large: '',
    });

    const openCreate = () => {
        reset();
        setData({ name: '', item_type: 'Rice', kilos_per_bag: '', plates_per_bag: '', price_per_plate: '', price_small: '', price_medium: '', price_large: '' });
        setEditItem(null);
        setShowForm(true);
    };
    const openEdit = (i) => {
        setData({
            name: i.name, item_type: i.item_type,
            kilos_per_bag: i.kilos_per_bag || '', plates_per_bag: i.plates_per_bag || '',
            price_small: i.price_small || '',
            price_medium: i.price_medium || '', price_large: i.price_large || '',
        });
        setEditItem(i);
        setShowForm(true);
    };
    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setShowForm(false); reset(); } };
        editItem ? put(route('restaurant.items.update', editItem.id), opts) : post(route('restaurant.items.store'), opts);
    };

    // Split items by category for display
    const riceItems = items.filter(i => i.item_type === 'Rice');
    const portionItems = items.filter(i => i.item_type !== 'Rice');

    return (
        <AppLayout title="Restaurant Items">
            <Head title="Restaurant - Food Item Setup" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">🍽️ Food Item Setup</h2>
                    <p className="text-sm text-gray-500">Set default prices — they stay until you update them</p>
                </div>
                <button onClick={openCreate} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">+ Add Food Item</button>
            </div>

            {/* Rice / Bag Items */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">🍚 Rice / Bag Items</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>{['Food Name','Category','Bag Size (kg)','Bag Label','Plates / Bag','Plates per kg','Status',''].map(h=>(
                                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {riceItems.map(i => (
                                <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-800">{i.name}</td>
                                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{i.item_type}</span></td>
                                    <td className="px-4 py-3 text-gray-600">{i.kilos_per_bag ? `${i.kilos_per_bag} kg` : '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{BAG_SIZE_LABEL(i.kilos_per_bag)}</td>
                                    <td className="px-4 py-3 text-gray-600">{i.plates_per_bag || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{i.kilos_per_bag && i.plates_per_bag ? `${(i.plates_per_bag / i.kilos_per_bag).toFixed(1)}/kg` : '—'}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${i.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{i.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        <button onClick={() => openEdit(i)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                        {i.is_active && <button onClick={() => { if (confirm('Deactivate this item?')) router.delete(route('restaurant.items.destroy', i.id)); }} className="text-red-500 hover:text-red-700 text-xs font-medium">Deactivate</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {riceItems.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No rice/bag items added yet.</div>}
                </div>
            </div>

            {/* Portion Items (Fish / Meat / Chicken etc.) */}
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">🐟 Portion Items (Fish / Meat / Chicken)</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>{['Food Name','Category','Small Price','Medium Price','Large Price','Status',''].map(h=>(
                                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {portionItems.map(i => (
                                <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-800">{i.name}</td>
                                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{i.item_type}</span></td>
                                    <td className="px-4 py-3 text-gray-600">{fmt(i.price_small)}</td>
                                    <td className="px-4 py-3 text-gray-600">{fmt(i.price_medium)}</td>
                                    <td className="px-4 py-3 text-gray-600">{fmt(i.price_large)}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${i.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{i.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        <button onClick={() => openEdit(i)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                        {i.is_active && <button onClick={() => { if (confirm('Deactivate this item?')) router.delete(route('restaurant.items.destroy', i.id)); }} className="text-red-500 hover:text-red-700 text-xs font-medium">Deactivate</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {portionItems.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No portion items added yet.</div>}
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
                            <h3 className="font-bold text-gray-800 text-lg">{editItem ? '✏️ Edit Food Item' : '🍽️ Add Food Item'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-5">
                            {/* Food Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Food Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Jollof Rice, Tilapia, Chicken..."
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                                <select
                                    value={data.item_type}
                                    onChange={e => setData('item_type', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* ── RICE section ── */}
                            {isRice(data.item_type) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-4">
                                    <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">🍚 Bag / Plate Setup</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bag Size (kg) *</label>
                                            <input
                                                type="number" step="0.1" min="0"
                                                value={data.kilos_per_bag}
                                                onChange={e => setData('kilos_per_bag', e.target.value)}
                                                placeholder="e.g. 25"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                            {data.kilos_per_bag && (
                                                <p className="text-xs text-yellow-600 mt-1 font-medium">{BAG_SIZE_LABEL(data.kilos_per_bag)}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Plates per Bag *</label>
                                            <input
                                                type="number" min="0"
                                                value={data.plates_per_bag}
                                                onChange={e => setData('plates_per_bag', e.target.value)}
                                                placeholder="e.g. 100"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>
                                    </div>
                                    {/* Preview */}
                                    {data.kilos_per_bag && data.plates_per_bag && (
                                        <div className="bg-white border border-yellow-300 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                                            <p className="font-semibold text-gray-700">💡 Summary</p>
                                            <p>1 bag ({data.kilos_per_bag} kg) → <span className="font-bold text-yellow-700">{data.plates_per_bag} plates</span> ({(data.plates_per_bag / data.kilos_per_bag).toFixed(1)} plates/kg)</p>
                                            <p className="text-gray-400">Price per plate is recorded at daily closing — it varies by dish.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── PORTION section (Fish / Meat / Chicken etc.) ── */}
                            {!isRice(data.item_type) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
                                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">🍖 Price per Size (set defaults — stays until you change)</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Small (GHS)</label>
                                            <input
                                                type="number" step="0.01" min="0"
                                                value={data.price_small}
                                                onChange={e => setData('price_small', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Medium (GHS)</label>
                                            <input
                                                type="number" step="0.01" min="0"
                                                value={data.price_medium}
                                                onChange={e => setData('price_medium', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Large (GHS)</label>
                                            <input
                                                type="number" step="0.01" min="0"
                                                value={data.price_large}
                                                onChange={e => setData('price_large', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                    </div>
                                    {(data.price_small || data.price_medium || data.price_large) && (
                                        <div className="bg-white border border-blue-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                                            <p className="font-semibold text-gray-700">💡 Price Summary</p>
                                            {data.price_small && <p>Small → <span className="font-bold text-green-700">GHS {parseFloat(data.price_small).toFixed(2)}</span></p>}
                                            {data.price_medium && <p>Medium → <span className="font-bold text-green-700">GHS {parseFloat(data.price_medium).toFixed(2)}</span></p>}
                                            {data.price_large && <p>Large → <span className="font-bold text-green-700">GHS {parseFloat(data.price_large).toFixed(2)}</span></p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium">Cancel</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-semibold">
                                    {processing ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
