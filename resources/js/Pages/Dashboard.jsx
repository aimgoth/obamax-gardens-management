import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cards = [
    { key: 'todayBar',        label: 'Bar Revenue',          icon: '🍺', from: 'from-green-500',  to: 'to-emerald-600' },
    { key: 'todayRestaurant', label: 'Restaurant Revenue',   icon: '🍽️', from: 'from-orange-400', to: 'to-amber-500'   },
    { key: 'todayHotel',      label: 'Hotel Revenue',        icon: '🏨', from: 'from-blue-500',   to: 'to-cyan-600'    },
    { key: 'todayTotal',      label: 'Total Revenue Today',  icon: '💰', from: 'from-purple-500', to: 'to-violet-600'  },
];

const monthCards = [
    { key: 'monthlyBar',        label: 'Bar',        icon: '🍺', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
    { key: 'monthlyRestaurant', label: 'Restaurant', icon: '🍽️', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { key: 'monthlyHotel',      label: 'Hotel',      icon: '🏨', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
    { key: 'monthlyTotal',      label: 'Total',      icon: '💰', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

const quickLinks = [
    { label: 'Bar Closing',   href: () => route('bar.closing.index'),         icon: '🍺', color: 'hover:bg-green-50  hover:border-green-200' },
    { label: 'Issue to Bar',  href: () => route('bar.issuance.index'),        icon: '📦', color: 'hover:bg-blue-50   hover:border-blue-200'  },
    { label: 'Restaurant',    href: () => route('restaurant.closing.index'),  icon: '🍽️', color: 'hover:bg-orange-50 hover:border-orange-200'},
    { label: 'Bookings',      href: () => route('hotel.bookings.index'),      icon: '🏨', color: 'hover:bg-cyan-50   hover:border-cyan-200'  },
    { label: 'Workers',       href: () => route('workers.index'),             icon: '👷', color: 'hover:bg-yellow-50 hover:border-yellow-200'},
    { label: 'Depot',         href: () => route('bar.depot.index'),           icon: '🏭', color: 'hover:bg-gray-50   hover:border-gray-200'  },
];

export default function Dashboard({ stats, lowStockDrinks, lowSellingDrinks, today }) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 p-7 mb-8 shadow-xl">
                <div className="relative z-10">
                    <p className="text-green-200 text-base font-medium mb-1">Welcome back 👋</p>
                    <h2 className="text-white text-3xl font-extrabold mb-1">Obamax Gardens</h2>
                    <p className="text-green-200 text-base">{today && new Date(today).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <img src="/logo.png" alt="" className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full object-cover opacity-20 blur-sm" />
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute -right-4 -top-8 w-32 h-32 bg-white/5 rounded-full" />
            </div>

            {/* Today Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {cards.map(({ key, label, icon, from, to }) => (
                    <div key={key} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${to} p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
                        <div className="text-3xl mb-3">{icon}</div>
                        <div className="text-2xl font-extrabold mb-1">{fmt(stats[key])}</div>
                        <div className="text-sm font-medium text-white/80">{label}</div>
                        <div className="absolute -right-3 -bottom-3 text-5xl opacity-10">{icon}</div>
                    </div>
                ))}
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-5">📅 This Month's Revenue</h3>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {monthCards.map(({ key, label, icon, color, bg, border }) => (
                        <div key={key} className={`rounded-xl ${bg} border ${border} p-5 text-center`}>
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className={`text-xl font-extrabold ${color} mb-1`}>{fmt(stats[key])}</div>
                            <div className="text-sm text-gray-500 font-medium">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                    <h3 className="text-lg font-bold text-gray-800 mb-5">⚡ Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">👷</span>
                                <span className="text-base font-semibold text-gray-700">Active Workers</span>
                            </div>
                            <span className="text-2xl font-extrabold text-green-700">{stats.activeWorkers}</span>
                        </div>
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${stats.lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <span className="text-base font-semibold text-gray-700">Low Stock Drinks</span>
                            </div>
                            <span className={`text-2xl font-extrabold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.lowStockCount}</span>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-800">🚨 Low Stock Alerts</h3>
                        <Link href={route('bar.depot.index')} className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">View Depot →</Link>
                    </div>
                    {lowStockDrinks && lowStockDrinks.length > 0 ? (
                        <div className="space-y-3">
                            {lowStockDrinks.map(d => (
                                <div key={d.id} className="rounded-xl bg-red-50 border border-red-100 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-base font-bold text-gray-800">{d.name}</span>
                                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Low Stock</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm mb-2">
                                        <span className="text-red-700 font-semibold">
                                            {d.current_stock_bottles} btl left
                                            <span className="text-red-400 font-normal ml-1">({d.current_stock_crates} crates)</span>
                                        </span>
                                    </div>
                                    <div className="bg-white border border-red-100 rounded-lg px-3 py-2 text-xs text-gray-600 space-y-0.5">
                                        <div>💡 <span className="font-semibold">Suggested restock:</span> <span className="text-green-700 font-bold">{d.suggested_add} bottles</span> <span className="text-gray-400">(~2 months supply)</span></div>
                                        <div>📦 <span className="font-semibold">Max to add:</span> <span className="text-blue-700 font-bold">{d.max_add} bottles</span> <span className="text-gray-400">(~3 months supply)</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <span className="text-4xl mb-2">✅</span>
                            <p className="text-base font-semibold text-green-600">All drinks well-stocked!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Low Selling Drinks */}
            {lowSellingDrinks && lowSellingDrinks.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-7 mb-8">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-800">📉 Slow-Moving Drinks This Month</h3>
                        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">{lowSellingDrinks.length} drink{lowSellingDrinks.length !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-5">These drinks are being issued significantly less than their monthly average — consider running a promotion or reviewing your order.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {lowSellingDrinks.map(d => (
                            <div key={d.id} className="rounded-xl bg-orange-50 border border-orange-100 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-base font-bold text-gray-800">{d.name}</span>
                                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">Low Sales</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">This month issued</span>
                                        <span className={`font-bold ${d.this_month_issued === 0 ? 'text-red-600' : 'text-orange-600'}`}>{d.this_month_issued} btl</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Avg monthly (3mo)</span>
                                        <span className="font-semibold text-gray-700">{d.avg_prev_monthly} btl</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full font-semibold">🎯 Consider Promotion</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">⛔ Review Reorder</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <h3 className="text-lg font-bold text-gray-800 mb-5">🚀 Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                    {quickLinks.map(item => (
                        <Link key={item.label} href={item.href()} className={`group flex flex-col items-center gap-2 p-5 rounded-2xl border border-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${item.color}`}>
                            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                            <span className="text-sm font-semibold text-gray-600 text-center leading-tight">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
