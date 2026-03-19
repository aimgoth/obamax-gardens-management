import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const fmt = (n) => `GHS ${parseFloat(n || 0).toFixed(2)}`;

const SIZE_STYLE = {
    Small:  { badge: 'bg-sky-100 text-sky-700 border-sky-300',     bar: 'bg-sky-500',    ring: 'ring-sky-200'    },
    Medium: { badge: 'bg-violet-100 text-violet-700 border-violet-300', bar: 'bg-violet-500', ring: 'ring-violet-200' },
    Large:  { badge: 'bg-amber-100 text-amber-700 border-amber-300',  bar: 'bg-amber-500',  ring: 'ring-amber-200'  },
};

function StockBar({ sold, remaining, barClass }) {
    const total   = sold + remaining;
    const soldPct = total > 0 ? Math.round((sold / total) * 100) : 0;
    return (
        <div className="mt-3">
            <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
                <div className={`${barClass}`} style={{ width: `${soldPct}%`, transition: 'width 0.4s' }} />
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-1 font-medium">
                <span>{soldPct}% sold</span>
                <span>{100 - soldPct}% remaining</span>
            </div>
        </div>
    );
}

function SizeCard({ s }) {
    const st = SIZE_STYLE[s.size];
    const total = s.sold + s.remaining;
    const inactive = s.received === 0;
    return (
        <div className={`rounded-2xl border-2 p-5 flex flex-col gap-3 ${inactive ? 'opacity-40 border-gray-100 bg-gray-50' : `bg-white border-gray-100 ring-1 ${st.ring}`}`}>
            <div className="flex items-center justify-between">
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${st.badge}`}>{s.size}</span>
                {s.price > 0 && <span className="text-base text-gray-500 font-semibold">{fmt(s.price)}</span>}
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-base text-gray-500">Received</span>
                    <span className="text-lg font-bold text-gray-700">{s.received}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-base text-gray-500">Sold today</span>
                    <span className="text-lg font-bold text-gray-900">{s.sold}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-2 mt-1">
                    <span className="text-base font-semibold text-gray-600">Left over</span>
                    <span className={`text-xl font-black ${s.remaining === 0 ? 'text-red-500' : s.remaining <= 3 ? 'text-orange-500' : 'text-green-700'}`}>
                        {s.remaining}
                    </span>
                </div>
                {s.revenue > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Revenue</span>
                        <span className="text-base font-bold text-green-700">{fmt(s.revenue)}</span>
                    </div>
                )}
            </div>
            {total > 0 && <StockBar sold={s.sold} remaining={s.remaining} barClass={st.bar} />}
        </div>
    );
}

function ReportDetail({ report }) {
    const { summary } = report;

    return (
        <div className="border-t-4 border-green-100 bg-gradient-to-b from-slate-50 to-white px-6 py-8 space-y-8">

            {/* ---- Quick stat cards ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { label: 'Cash to Admin',   value: fmt(report.total_cash),       color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
                    { label: 'Ingredient Cost', value: fmt(summary.ingredient_cost), color: 'text-red-600',   bg: 'bg-red-50   border-red-200'   },
                ].map(c => (
                    <div key={c.label} className={`border-2 rounded-2xl p-4 text-center ${c.bg}`}>
                        <div className={`font-black text-3xl ${c.color}`}>{c.value}</div>
                        <div className="text-sm text-gray-500 font-medium mt-1">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* ---- Rice Section ---- */}
            {summary.rice_items.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-yellow-400 rounded-full" />
                        <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Rice &amp; Plates</h4>
                    </div>
                    <div className="space-y-3">
                        {summary.rice_items.map(item => (
                            <div key={item.id} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-gray-50 border-b-2 border-gray-100 gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-gray-800">{item.name}</span>
                                        <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">Rice</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {item.bags_this_month !== null && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400 font-medium uppercase">Received this month</div>
                                                <div className="text-2xl font-black text-gray-600">
                                                    {item.bags_this_month} <span className="text-base font-semibold">bags</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400 font-medium uppercase">Plates sold today</div>
                                            <div className="text-2xl font-black text-gray-800">{item.plates_sold}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400 font-medium uppercase">Plates sold this month</div>
                                            <div className="text-2xl font-black text-indigo-700">{item.plates_this_month}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400 font-medium uppercase">Left over</div>
                                            <div className={`text-2xl font-black ${item.remaining_plates === 0 ? 'text-red-600' : item.remaining_plates <= 10 ? 'text-orange-500' : 'text-green-700'}`}>
                                                {item.remaining_plates} plates
                                            </div>
                                            {item.remaining_kg > 0 && (
                                                <div className="text-xs text-gray-400 mt-0.5">~{item.remaining_kg} kg</div>
                                            )}
                                        </div>
                                        {item.revenue > 0 && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400 font-medium uppercase">Revenue</div>
                                                <div className="text-xl font-black text-green-700">{fmt(item.revenue)}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {item.price_per_plate > 0 && (
                                    <div className="px-6 py-3 flex flex-wrap gap-6 text-sm text-gray-500 border-t border-dashed border-gray-100">
                                        <span>Price: <strong className="text-gray-700">{fmt(item.price_per_plate)} / plate</strong></span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ---- Fish / Meat / Chicken section ---- */}
            {summary.portion_items.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-blue-400 rounded-full" />
                        <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Fish / Meat / Chicken — Stock &amp; Sales</h4>
                    </div>

                    {summary.portion_items.map(item => {
                        const totalRemaining = item.sizes.reduce((s, sz) => s + sz.remaining, 0);
                        return (
                            <div key={item.id} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                {/* item header */}
                                <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-gray-50 border-b-2 border-gray-100 gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-gray-800">{item.name}</span>
                                        <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold">{item.item_type}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400 font-medium uppercase">Sold today</div>
                                            <div className="text-2xl font-black text-gray-800">{item.total_sold}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400 font-medium uppercase">Left over</div>
                                            <div className={`text-2xl font-black ${totalRemaining === 0 ? 'text-red-600' : totalRemaining <= 5 ? 'text-orange-500' : 'text-green-700'}`}>
                                                {totalRemaining}
                                            </div>
                                        </div>
                                        {item.total_revenue > 0 && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400 font-medium uppercase">Revenue</div>
                                                <div className="text-xl font-black text-green-700">{fmt(item.total_revenue)}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* size cards */}
                                <div className="grid grid-cols-3 gap-4 p-5">
                                    {item.sizes.map(s => <SizeCard key={s.size} s={s} />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {summary.rice_items.length === 0 && summary.portion_items.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-base italic">
                    No sales data was recorded for this date.
                </div>
            )}

            {/* ---- Financial Summary ---- */}
            {/* ---- Stock Added Today ---- */}
            {summary.inventory_additions?.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                        <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Stock Added on This Day</h4>
                        <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                            {summary.inventory_additions.length} addition{summary.inventory_additions.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {summary.inventory_additions.map((inv, idx) => (
                            <div key={idx} className="bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 flex flex-wrap items-center gap-6">
                                <div>
                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Item</div>
                                    <div className="text-lg font-black text-gray-800">{inv.item_name}</div>
                                </div>
                                {inv.size && (
                                    <div>
                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Size</div>
                                        <div className="text-lg font-bold text-gray-700">{inv.size}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Qty Added</div>
                                    <div className="text-2xl font-black text-emerald-700">
                                        {inv.quantity} <span className="text-base font-semibold">{inv.unit || (inv.item_type === 'Rice' ? 'kg' : 'pcs')}</span>
                                    </div>
                                </div>
                                {inv.cost > 0 && (
                                    <div>
                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cost</div>
                                        <div className="text-lg font-bold text-gray-700">{fmt(inv.cost)}</div>
                                    </div>
                                )}
                                {inv.notes && (
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Notes</div>
                                        <div className="text-sm text-gray-600 truncate">{inv.notes}</div>
                                    </div>
                                )}
                                <div className="ml-auto">
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                                        inv.item_type === 'Rice' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                    }`}>{inv.item_type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gray-950 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-green-400 rounded-full" />
                    <h4 className="text-lg font-bold text-white uppercase tracking-wide">Financial Summary</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-xl p-5 text-center">
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Cash to Admin</div>
                        <div className="text-3xl font-black text-green-400">{fmt(report.total_cash)}</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-5 text-center">
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Ingredient Cost</div>
                        <div className="text-3xl font-black text-red-400">- {fmt(summary.ingredient_cost)}</div>
                    </div>
                </div>
            </div>

            {report.notes && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-4 text-base text-amber-800">
                    <span className="font-bold">Notes:</span> {report.notes}
                </div>
            )}
        </div>
    );
}

export default function ArchiveRestaurant({ reports }) {
    const [expanded, setExpanded] = useState(null);

    const grouped = reports.reduce((acc, r) => {
        const month = r.date.slice(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(r);
        return acc;
    }, {});

    const monthLabel = (key) => {
        const [y, m] = key.split('-');
        return new Date(y, m - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    };

    return (
        <AppLayout title="Archive - Restaurant Reports">
            <Head title="Archive - Restaurant Reports" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h2 className="text-3xl font-black text-gray-800">Restaurant Reports Archive</h2>
                    <p className="text-base text-gray-500 mt-1">
                        {reports.length} report{reports.length !== 1 ? 's' : ''} submitted — click any row to expand full details
                    </p>
                </div>

                {reports.length === 0 && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-20 text-center">
                        <p className="text-gray-600 font-semibold text-xl">No reports submitted yet.</p>
                        <p className="text-base text-gray-400 mt-2">Reports appear here after submitting from the Restaurant Daily Closing page.</p>
                    </div>
                )}

                {Object.entries(grouped).map(([month, monthReports]) => {
                    const monthCash = monthReports.reduce((s, r) => s + r.total_cash, 0);
                    const monthCost = monthReports.reduce((s, r) => s + r.summary.ingredient_cost, 0);
                    const monthNet  = monthCash - monthCost;
                    return (
                        <div key={month}>
                            {/* Month header */}
                            <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-2xl px-6 py-4 mb-4 flex flex-wrap items-center gap-6 shadow">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Month</div>
                                    <div className="text-xl font-black">{monthLabel(month)}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Reports Submitted</div>
                                    <div className="text-xl font-black">{monthReports.length}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Total Cash</div>
                                    <div className="text-xl font-black">{fmt(monthCash)}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Ingredient Cost</div>
                                    <div className="text-xl font-black opacity-90">- {fmt(monthCost)}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                                <div className="ml-auto">
                                    <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-0.5">Net</div>
                                    <div className={`text-2xl font-black ${monthNet >= 0 ? 'text-white' : 'text-red-300'}`}>{fmt(monthNet)}</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                                {monthReports.map((report, idx) => {
                                    const isOpen = expanded === report.id;

                                    // Per-item chips with sold today + leftover
                                    const riceChips = report.summary.rice_items.map(i => ({
                                        name: i.name,
                                        sold: i.plates_sold,
                                        leftover: `${i.remaining_plates} plates`,
                                        zero: i.remaining_plates === 0,
                                        color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                                        soldColor: 'text-yellow-600',
                                    }));
                                    const portionChips = report.summary.portion_items.map(i => {
                                        const rem = i.sizes.reduce((s, sz) => s + sz.remaining, 0);
                                        const sold = i.sizes.reduce((s, sz) => s + sz.sold, 0);
                                        return {
                                            name: i.name,
                                            sold,
                                            leftover: rem,
                                            zero: rem === 0,
                                            color: 'bg-blue-50 border-blue-200 text-blue-700',
                                            soldColor: 'text-blue-600',
                                        };
                                    });
                                    const allChips = [...riceChips, ...portionChips];
                                    return (
                                        <div key={report.id} className={idx > 0 ? 'border-t-2 border-gray-100' : ''}>
                                            <div
                                                onClick={() => setExpanded(isOpen ? null : report.id)}
                                                className="w-full flex items-center gap-5 px-6 py-5 hover:bg-green-50/50 transition-colors cursor-pointer group"
                                            >
                                                {/* Open/close indicator */}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm transition-all ${isOpen ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-700'}`}>
                                                    {isOpen ? '▲' : '▼'}
                                                </div>

                                                {/* Date */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-lg font-bold text-gray-800">
                                                        {new Date(report.date + 'T12:00:00').toLocaleDateString('en-GB', {
                                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </div>
                                                    {report.notes && (
                                                        <div className="text-sm text-gray-400 truncate max-w-sm mt-0.5">{report.notes}</div>
                                                    )}
                                                </div>

                                                {/* Per-item leftover chips */}
                                                <div className="hidden md:flex items-center gap-2 flex-wrap flex-shrink-0 max-w-lg justify-end">
                                                    {allChips.map(chip => (
                                                        <div key={chip.name} className={`border rounded-xl px-3 py-2 text-center ${chip.color} ${chip.zero ? 'opacity-50' : ''}`}>
                                                            <div className="text-xs font-bold leading-none mb-1.5">{chip.name}</div>
                                                            <div className="flex gap-3 text-xs">
                                                                <span>
                                                                    <span className="opacity-60 block leading-none mb-0.5">Sold</span>
                                                                    <span className={`font-black text-sm leading-none ${chip.soldColor}`}>{chip.sold}</span>
                                                                </span>
                                                                <span className="opacity-30 self-stretch w-px bg-current" />
                                                                <span>
                                                                    <span className="opacity-60 block leading-none mb-0.5">Left</span>
                                                                    <span className={`font-black text-sm leading-none ${chip.zero ? 'text-red-500' : ''}`}>{chip.leftover}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {report.summary.ingredient_cost > 0 && (
                                                        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 text-center">
                                                            <div className="text-xs font-medium text-gray-400 leading-none mb-0.5">Ingredients</div>
                                                            <div className="text-sm font-black text-red-500 leading-none">{fmt(report.summary.ingredient_cost)}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Cash */}
                                                <div className="text-right flex-shrink-0 ml-2">
                                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cash Reported</div>
                                                    <div className="text-2xl font-black text-green-700">{fmt(report.total_cash)}</div>
                                                </div>

                                                {/* Print / PDF button */}
                                                <a
                                                    href={route('archive.restaurant.print', { id: report.id })}
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex-shrink-0 flex flex-col items-center justify-center gap-1 bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-500 rounded-xl px-3 py-2 transition-colors ml-1"
                                                    title="Download PDF"
                                                >
                                                    <span className="text-lg leading-none">⬇</span>
                                                    <span className="text-xs font-bold leading-none">PDF</span>
                                                </a>
                                            </div>

                                            {isOpen && <ReportDetail report={report} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AppLayout>
    );
}
