import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const DEPARTMENTS = ['Bar', 'Restaurant', 'Hotel', 'Other'];
const BLOCKS = ['Block A', 'Block B', 'Block C'];

export default function WorkersIndex({ workers }) {
    const [showForm, setShowForm] = useState(false);
    const [editWorker, setEditWorker] = useState(null);
    const [search, setSearch] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '', role: '', department: 'Bar', block: '', phone: '', notes: '',
    });

    const openCreate = () => {
        reset();
        setEditWorker(null);
        setShowForm(true);
    };

    const openEdit = (worker) => {
        setData({
            name: worker.name, role: worker.role, department: worker.department,
            block: worker.block || '', phone: worker.phone || '', notes: worker.notes || '',
            is_active: worker.is_active,
        });
        setEditWorker(worker);
        setShowForm(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editWorker) {
            put(route('workers.update', editWorker.id), {
                onSuccess: () => { setShowForm(false); reset(); },
            });
        } else {
            post(route('workers.store'), {
                onSuccess: () => { setShowForm(false); reset(); },
            });
        }
    };

    const deactivate = (worker) => {
        const action = worker.is_active ? 'Deactivate' : 'Activate';
        if (confirm(`${action} ${worker.name}?`)) {
            router.patch(route('workers.deactivate', worker.id));
        }
    };

    const deleteWorker = (worker) => {
        if (confirm(`Permanently delete ${worker.name}? This action cannot be undone.`)) {
            router.delete(route('workers.destroy', worker.id));
        }
    };

    const filtered = workers.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.role.toLowerCase().includes(search.toLowerCase()) ||
        w.department.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = DEPARTMENTS.reduce((acc, dept) => {
        acc[dept] = filtered.filter(w => w.department === dept);
        return acc;
    }, {});

    return (
        <AppLayout title="Workers">
            <Head title="Workers" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Worker Registry</h2>
                    <p className="text-sm text-gray-500">{workers.filter(w => w.is_active).length} active staff members</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    + Register Worker
                </button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search workers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>

            {/* Workers by Department */}
            {DEPARTMENTS.map(dept => (
                grouped[dept].length > 0 && (
                    <div key={dept} className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            {dept === 'Bar' ? '🍺' : dept === 'Restaurant' ? '🍽️' : dept === 'Hotel' ? '🏨' : '👤'} {dept}
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Block</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Phone</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {grouped[dept].map(worker => (
                                        <tr key={worker.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{worker.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{worker.role}</td>
                                            <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{worker.block || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{worker.phone || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    worker.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {worker.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-3">
                                                <button
                                                    onClick={() => openEdit(worker)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                >Edit</button>
                                                <button
                                                    onClick={() => deactivate(worker)}
                                                    className={`text-xs ${worker.is_active ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                                                >{worker.is_active ? 'Deactivate' : 'Activate'}</button>
                                                <button
                                                    onClick={() => deleteWorker(worker)}
                                                    className="text-red-600 hover:text-red-800 text-xs"
                                                >Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ))}

            {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-3">👷</div>
                    <p>No workers found. Register your first worker!</p>
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800">
                                {editWorker ? 'Edit Worker' : 'Register New Worker'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text" value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g. Kwame Asante"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                    <select value={data.department} onChange={e => setData('department', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                    <input type="text" value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g. Bar Keeper, Chef"
                                    />
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>
                                {data.department === 'Bar' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                                        <select value={data.block} onChange={e => setData('block', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                            <option value="">No Block</option>
                                            {BLOCKS.map(b => <option key={b}>{b}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className={data.department === 'Bar' ? '' : 'col-span-2'}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g. 0244 000 000"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                        rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing}
                                    className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-lg text-sm font-medium">
                                    {processing ? 'Saving...' : editWorker ? 'Update Worker' : 'Register Worker'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
