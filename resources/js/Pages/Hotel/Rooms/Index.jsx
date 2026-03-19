import { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const TYPES = ['Standard','Deluxe','Suite','VIP'];
const fmt = (n) => `GHS ${parseFloat(n||0).toFixed(2)}`;

export default function RoomsIndex({ rooms }) {
    const [showForm, setShowForm] = useState(false);
    const [editRoom, setEditRoom] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // _method drives Laravel method-spoofing so multipart POST is used instead of PUT
    // (PHP only parses multipart/form-data on POST requests)
    const { data, setData, post, processing, errors, reset } = useForm({
        room_number: '', room_type: 'Standard', price_per_night: '', description: '', image: null, _method: '',
    });

    const openCreate = () => {
        reset();
        setImagePreview(null);
        setEditRoom(null);
        setShowForm(true);
    };

    const openEdit = (r) => {
        setData({ room_number: r.room_number, room_type: r.room_type, price_per_night: r.price_per_night, description: r.description || '', image: null, _method: 'PUT' });
        setImagePreview(r.image_url || null);
        setEditRoom(r);
        setShowForm(true);
    };

    const onImageChange = (e) => {
        const file = e.target.files[0] || null;
        setData('image', file);
        setImagePreview(file ? URL.createObjectURL(file) : (editRoom?.image_url || null));
    };

    const closeForm = () => { setShowForm(false); reset(); setImagePreview(null); };

    const submit = (e) => {
        e.preventDefault();
        const opts = { forceFormData: true, onSuccess: () => closeForm() };
        // Always POST — method spoofing via _method field handles the PUT route on edit
        const url = editRoom ? route('hotel.rooms.update', editRoom.id) : route('hotel.rooms.store');
        post(url, opts);
    };

    return (
        <AppLayout title="Hotel Rooms">
            <Head title="Hotel - Rooms" />
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Hotel Rooms</h2>
                <button onClick={openCreate} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Room</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {rooms.map(r => (
                    <div key={r.id} className={`bg-white rounded-xl overflow-hidden border cursor-pointer hover:shadow-md transition-shadow ${r.is_active ? 'border-gray-100' : 'border-red-100 bg-red-50 opacity-60'}`} onClick={() => openEdit(r)}>
                        {r.image_url
                            ? <img src={r.image_url} alt={`Room ${r.room_number}`} className="w-full h-32 object-cover" />
                            : <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-3xl text-gray-300">🛏</div>
                        }
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-gray-800">#{r.room_number}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.room_type === 'VIP' ? 'bg-purple-100 text-purple-700' : r.room_type === 'Suite' ? 'bg-blue-100 text-blue-700' : r.room_type === 'Deluxe' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{r.room_type}</span>
                            </div>
                            <div className="text-green-700 font-semibold text-sm">{fmt(r.price_per_night)}<span className="text-gray-400 font-normal text-xs">/night</span></div>
                            {r.description && <div className="text-xs text-gray-400 mt-0.5 truncate">{r.description}</div>}
                        </div>
                    </div>
                ))}
                {rooms.length === 0 && <div className="col-span-4 text-center py-8 text-gray-400">🏨 No rooms added yet.</div>}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h3 className="font-semibold text-gray-800">{editRoom ? 'Edit Room' : 'Add Room'}</h3>
                            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                                    <input type="text" value={data.room_number} onChange={e => setData('room_number', e.target.value)} placeholder="e.g. 101" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" />
                                    {errors.room_number && <p className="text-red-500 text-xs mt-1">{errors.room_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                    <select value={data.room_type} onChange={e => setData('room_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500">
                                        {TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price/Night (GHS) *</label>
                                    <input type="number" step="0.01" min="0" value={data.price_per_night} onChange={e => setData('price_per_night', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" />
                                </div>

                                {/* Image Upload */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
                                    {imagePreview && (
                                        <div className="relative mb-2">
                                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => { setData('image', null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" />
                                    {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or WebP — max 4 MB</p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={closeForm} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium">{processing ? 'Saving...' : editRoom ? 'Update' : 'Add Room'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
