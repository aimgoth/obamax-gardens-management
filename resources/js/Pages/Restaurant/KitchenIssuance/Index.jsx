import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function KitchenIssuanceIndex({ items, issuances }) {
    const [showForm, setShowForm] = useState(false);
    const [bags, setBags] = useState('');
    const [pieces, setPieces] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, errors, reset } = useForm({
        tracked_item_id: items[0]?.id || '', quantity_issued: '', unit: 'kg',
        issued_date: today, notes: '',
    });

    const selectedItem = items.find(i => i.id == data.tracked_item_id);
    const isRice = selectedItem?.item_type === 'Rice';
    const kilosPerBag  = parseFloat(selectedItem?.kilos_per_bag || 0);
    const platesPerBag = parseInt(selectedItem?.plates_per_bag || 0);
    const bagCount     = parseFloat(bags || 0);
    const totalKg      = bagCount > 0 && kilosPerBag > 0 ? bagCount * kilosPerBag : 0;
    const expectedPlates = bagCount > 0 && platesPerBag > 0 ? Math.round(bagCount * platesPerBag) : 0;

    const handleItemChange = (id) => {
        const item = items.find(i => i.id == id);
        setBags(''); setPieces('');
        setData({ ...data, tracked_item_id: id, quantity_issued: '', unit: item?.item_type === 'Rice' ? 'kg' : 'pieces' });
    };

    const handleBagsChange = (val) => {
        setBags(val);
        const kg = parseFloat(val || 0) * kilosPerBag;
        setData('quantity_issued', kg > 0 ? kg : '');
    };

    const handlePiecesChange = (val) => {
        setPieces(val);
        setData('quantity_issued', val);
    };

    const submit = (e) => { e.preventDefault(); post(route('restaurant.issuance.store'), { onSuccess: () => { setShowForm(false); reset(); setBags(''); setPieces(''); setData('issued_date', today); } }); };

    return (
        <AppLayout title="Kitchen Issuance">
            <Head title="Restaurant - Kitchen Issuance" />
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Issue Items to Kitchen</h2>
                <button onClick={() => setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Issue to Kitchen</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b"><tr>{['Date','Item','Qty Issued','Unit','Expected Plates','Notes',''].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {issuances.map(i=>(
                            <tr key={i.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-500">{i.issued_date}</td>
                                <td className="px-4 py-2 font-medium text-gray-800">{i.tracked_item?.name}</td>
                                <td className="px-4 py-2 text-gray-700 font-semibold">{i.quantity_issued} {i.unit}</td>
                                <td className="px-4 py-2 text-gray-500">{i.unit}</td>
                                <td className="px-4 py-2">
                                    {i.expected_plates
                                        ? <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">~{i.expected_plates} plates</span>
                                        : <span className="text-gray-300 text-xs">—</span>}
                                </td>
                                <td className="px-4 py-2 text-gray-400 text-xs">{i.notes||'—'}</td>
                                <td className="px-4 py-2 text-right"><button onClick={()=>{if(confirm('Remove?'))router.delete(route('restaurant.issuance.destroy',i.id));}} className="text-red-400 hover:text-red-600 text-xs">Remove</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {issuances.length===0&&<div className="text-center py-8 text-gray-400 text-sm">No kitchen issuances recorded yet.</div>}
            </div>

            {showForm&&(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b"><h3 className="font-semibold text-gray-800">Issue to Kitchen</h3><button onClick={()=>setShowForm(false)}>✕</button></div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                                <select value={data.tracked_item_id} onChange={e=>setData('tracked_item_id',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500">
                                    {items.map(i=><option key={i.id} value={i.id}>{i.name} ({i.item_type})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Rice: ask for bags, auto-convert to kg */}
                                {isRice ? (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bags *</label>
                                        <input type="number" min="1" step="1" value={bags} onChange={e=>handleBagsChange(e.target.value)} placeholder="e.g. 2" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>
                                        {bagCount > 0 && kilosPerBag > 0 && (
                                            <div className="mt-1.5 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                                                <span className="text-yellow-800 font-semibold">{bagCount} bag{bagCount!==1?'s':''} = {totalKg.toFixed(1)} kg</span>
                                                {expectedPlates > 0 && <span className="text-yellow-600 ml-2">→ ~{expectedPlates} plates expected</span>}
                                            </div>
                                        )}
                                        {errors.quantity_issued&&<p className="text-red-500 text-xs mt-1">{errors.quantity_issued}</p>}
                                    </div>
                                ) : (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Pieces *</label>
                                        <input type="number" min="1" step="1" value={pieces} onChange={e=>handlePiecesChange(e.target.value)} placeholder="e.g. 5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/>
                                        {errors.quantity_issued&&<p className="text-red-500 text-xs mt-1">{errors.quantity_issued}</p>}
                                    </div>
                                )}
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={data.issued_date} onChange={e=>setData('issued_date',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input type="text" value={data.notes} onChange={e=>setData('notes',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"/></div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium">{processing?'Saving...':'Issue to Kitchen'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
