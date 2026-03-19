<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }

    .header { background: #14532d; color: #fff; padding: 18px 30px; display: table; width: 100%; }
    .header-logo { display: table-cell; vertical-align: middle; width: 70px; }
    .header-logo img { width: 58px; height: 58px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.4); }
    .header-text { display: table-cell; vertical-align: middle; padding-left: 16px; }
    .header-text h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header-text .subtitle { font-size: 12px; opacity: 0.8; margin-top: 2px; }
    .header-text .report-title { font-size: 13px; font-weight: 600; margin-top: 8px; background: rgba(255,255,255,0.18); display: inline-block; padding: 3px 12px; border-radius: 4px; }

    .meta { background: #f0fdf4; border-bottom: 1px solid #bbf7d0; display: table; width: 100%; }
    .meta-item { display: table-cell; padding: 14px 20px; border-right: 1px solid #bbf7d0; }
    .meta-item:last-child { border-right: none; }
    .meta-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; display: block; }
    .meta-item p { font-size: 13px; font-weight: 700; color: #166534; margin-top: 2px; }

    .content { padding: 20px 30px; }

    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #fff; padding: 7px 12px; margin-bottom: 0; }
    .section-title.yellow { background: #92400e; }
    .section-title.blue   { background: #1e3a5f; }
    .section-title.teal   { background: #065f46; }
    .section-title.dark   { background: #111827; }

    .item-header { display: table; width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; }
    .item-header-left  { display: table-cell; padding: 10px 14px; vertical-align: middle; }
    .item-header-right { display: table-cell; padding: 10px 14px; text-align: right; vertical-align: middle; }
    .item-name  { font-size: 15px; font-weight: 700; color: #111; }
    .item-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .badge-rice    { background: #fef9c3; color: #92400e; }
    .badge-fish    { background: #dbeafe; color: #1e40af; }
    .badge-meat    { background: #fee2e2; color: #991b1b; }
    .badge-chicken { background: #ede9fe; color: #5b21b6; }

    .inline-stats { display: table; }
    .inline-stat  { display: table-cell; padding: 0 10px; border-right: 1px solid #e5e7eb; text-align: center; vertical-align: middle; }
    .inline-stat:last-child { border-right: none; }
    .inline-stat .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; }
    .inline-stat .val { font-size: 14px; font-weight: 700; color: #111; }
    .inline-stat .val.green  { color: #166534; }
    .inline-stat .val.red    { color: #dc2626; }
    .inline-stat .val.indigo { color: #4338ca; }
    .inline-stat .val.orange { color: #c2410c; }

    .stat-wrap { display: table; width: 100%; border: 1px solid #e5e7eb; border-top: none; margin-bottom: 14px; }
    .stat-cell { display: table-cell; padding: 10px 14px; border-right: 1px solid #e5e7eb; }
    .stat-cell:last-child { border-right: none; }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 3px; }
    .stat-value { font-size: 16px; font-weight: 700; color: #111; }
    .stat-value.green { color: #166534; }
    .stat-value.red   { color: #dc2626; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    thead tr { background: #1e3a5f; color: #fff; }
    thead tr.yellow-head { background: #92400e; }
    thead tr.teal-head   { background: #065f46; }
    thead th { padding: 9px 12px; text-align: left; font-size: 11px; font-weight: 600; }
    thead th.right { text-align: right; }
    tbody tr { border-bottom: 1px solid #e5e7eb; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td { padding: 9px 12px; font-size: 12px; }
    tbody td.right { text-align: right; }
    .subtotal-row td { font-weight: 700; background: #dcfce7 !important; color: #166534; border-top: 1px solid #86efac; }

    .fin-panel { background: #111827; color: #fff; display: table; width: 100%; margin-top: 4px; margin-bottom: 14px; }
    .fin-cell  { display: table-cell; padding: 16px 20px; border-right: 1px solid #374151; text-align: center; vertical-align: middle; }
    .fin-cell:last-child { border-right: none; }
    .fin-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; display: block; margin-bottom: 4px; }
    .fin-value { font-size: 20px; font-weight: 700; }
    .fin-green { color: #4ade80; }
    .fin-red   { color: #f87171; }

    .footer { margin-top: 30px; padding: 12px 30px; border-top: 1px solid #e5e7eb; display: table; width: 100%; font-size: 10px; color: #9ca3af; }
    .footer-left  { display: table-cell; }
    .footer-right { display: table-cell; text-align: right; }
</style>
</head>
<body>

<div class="header">
    @if($logoBase64)
    <div class="header-logo"><img src="{{ $logoBase64 }}" alt="Logo"></div>
    @endif
    <div class="header-text">
        <h1>OBAMAX GARDENS</h1>
        <div class="subtitle">Management System &mdash; Restaurant Department</div>
        <div class="report-title">Daily Restaurant Report</div>
    </div>
</div>

@php
    $net = $report->total_cash - $summary['ingredient_cost'];
@endphp
<div class="meta">
    <div class="meta-item">
        <label>Report Date</label>
        <p>{{ \Carbon\Carbon::parse($date)->format('l, d F Y') }}</p>
    </div>
    <div class="meta-item">
        <label>Cash to Admin</label>
        <p>GHS {{ number_format($report->total_cash, 2) }}</p>
    </div>
    <div class="meta-item">
        <label>Ingredient Cost</label>
        <p>GHS {{ number_format($summary['ingredient_cost'], 2) }}</p>
    </div>
    <div class="meta-item">
        <label>Net</label>
        <p>GHS {{ number_format($net, 2) }}</p>
    </div>
</div>

<div class="content">

@if(count($summary['inventory_additions']) > 0)
<div class="section-title teal">Stock Added on This Day &mdash; {{ count($summary['inventory_additions']) }} addition{{ count($summary['inventory_additions']) !== 1 ? 's' : '' }}</div>
<table>
    <thead>
        <tr class="teal-head">
            <th>#</th>
            <th>Item</th>
            <th>Type</th>
            <th>Size</th>
            <th class="right">Qty Added</th>
            <th class="right">Cost</th>
            <th>Notes</th>
        </tr>
    </thead>
    <tbody>
        @foreach($summary['inventory_additions'] as $i => $inv)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td><strong>{{ $inv['item_name'] }}</strong></td>
            <td>{{ $inv['item_type'] }}</td>
            <td>{{ $inv['size'] ?: '-' }}</td>
            <td class="right"><strong>{{ $inv['quantity'] }} {{ $inv['unit'] ?: ($inv['item_type'] === 'Rice' ? 'kg' : 'pcs') }}</strong></td>
            <td class="right">{{ $inv['cost'] > 0 ? 'GHS '.number_format($inv['cost'], 2) : '-' }}</td>
            <td>{{ $inv['notes'] ?: '-' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

@if(count($summary['rice_items']) > 0)
<div class="section-title yellow">Rice &amp; Plates</div>
@foreach($summary['rice_items'] as $item)
<div class="item-header">
    <div class="item-header-left">
        <span class="item-name">{{ $item['name'] }}</span>
        <span class="item-badge badge-rice">Rice</span>
    </div>
    <div class="item-header-right">
        <div class="inline-stats">
            @if($item['bags_this_month'] !== null)
            <div class="inline-stat">
                <span class="lbl">Received This Month</span>
                <span class="val">{{ $item['bags_this_month'] }} bags</span>
            </div>
            @endif
            <div class="inline-stat">
                <span class="lbl">Sold Today</span>
                <span class="val">{{ $item['plates_sold'] }}</span>
            </div>
            <div class="inline-stat">
                <span class="lbl">Sold This Month</span>
                <span class="val indigo">{{ $item['plates_this_month'] }}</span>
            </div>
            @php $rc = $item['remaining_plates'] == 0 ? 'red' : ($item['remaining_plates'] <= 10 ? 'orange' : 'green'); @endphp
            <div class="inline-stat">
                <span class="lbl">Left Over</span>
                <span class="val {{ $rc }}">{{ $item['remaining_plates'] }} plates{{ $item['remaining_kg'] > 0 ? ' (~'.$item['remaining_kg'].' kg)' : '' }}</span>
            </div>
            @if($item['revenue'])
            <div class="inline-stat">
                <span class="lbl">Revenue</span>
                <span class="val green">GHS {{ number_format($item['revenue'], 2) }}</span>
            </div>
            @endif
        </div>
    </div>
</div>
<div class="stat-wrap">
    <div class="stat-cell">
        <div class="stat-label">Price per Plate</div>
        <div class="stat-value">{{ $item['price_per_plate'] > 0 ? 'GHS '.number_format($item['price_per_plate'], 2) : '-' }}</div>
    </div>
    <div class="stat-cell">
        <div class="stat-label">Conversion Rate</div>
        <div class="stat-value">{{ $item['plates_per_kg'] > 0 ? $item['plates_per_kg'].' plates / kg' : '-' }}</div>
    </div>
</div>
@endforeach
@endif

@if(count($summary['portion_items']) > 0)
<div class="section-title blue">Fish / Meat / Chicken &mdash; Stock &amp; Sales</div>
@foreach($summary['portion_items'] as $item)
@php
    $totalRemaining = array_sum(array_column($item['sizes'], 'remaining'));
    $badgeClass = match(strtolower((string)($item['item_type'] ?? ''))) {
        'fish'    => 'badge-fish',
        'meat'    => 'badge-meat',
        'chicken' => 'badge-chicken',
        default   => 'badge-fish',
    };
@endphp
<div class="item-header">
    <div class="item-header-left">
        <span class="item-name">{{ $item['name'] }}</span>
        <span class="item-badge {{ $badgeClass }}">{{ $item['item_type'] }}</span>
    </div>
    <div class="item-header-right">
        <div class="inline-stats">
            <div class="inline-stat">
                <span class="lbl">Sold Today</span>
                <span class="val">{{ $item['total_sold'] }}</span>
            </div>
            <div class="inline-stat">
                <span class="lbl">Left Over</span>
                <span class="val {{ $totalRemaining == 0 ? 'red' : 'green' }}">{{ $totalRemaining }}</span>
            </div>
            @if($item['total_revenue'])
            <div class="inline-stat">
                <span class="lbl">Revenue</span>
                <span class="val green">GHS {{ number_format($item['total_revenue'], 2) }}</span>
            </div>
            @endif
        </div>
    </div>
</div>
<table>
    <thead>
        <tr>
            <th>Size</th>
            <th class="right">Price</th>
            <th class="right">Received</th>
            <th class="right">Sold Today</th>
            <th class="right">Left Over</th>
            <th class="right">Revenue</th>
        </tr>
    </thead>
    <tbody>
        @foreach($item['sizes'] as $sz)
        @php $rc2 = $sz['remaining'] == 0 ? '#dc2626' : '#166534'; @endphp
        <tr>
            <td><strong>{{ $sz['size'] }}</strong></td>
            <td class="right">{{ $sz['price'] ? 'GHS '.number_format($sz['price'], 2) : '-' }}</td>
            <td class="right">{{ $sz['received'] }}</td>
            <td class="right">{{ $sz['sold'] }}</td>
            <td class="right" style="font-weight:700;color:<?php echo $rc2; ?>;">{{ $sz['remaining'] }}</td>
            <td class="right">{{ $sz['revenue'] ? 'GHS '.number_format($sz['revenue'], 2) : '-' }}</td>
        </tr>
        @endforeach
        <tr class="subtotal-row">
            <td colspan="3"><strong>Totals</strong></td>
            <td class="right"><strong>{{ $item['total_sold'] }}</strong></td>
            <td class="right"><strong>{{ $totalRemaining }}</strong></td>
            <td class="right"><strong>{{ $item['total_revenue'] ? 'GHS '.number_format($item['total_revenue'], 2) : '-' }}</strong></td>
        </tr>
    </tbody>
</table>
@endforeach
@endif

<div class="section-title dark">Financial Summary</div>
<div class="fin-panel">
    <div class="fin-cell">
        <span class="fin-label">Cash to Admin</span>
        <span class="fin-value fin-green">GHS {{ number_format($report->total_cash, 2) }}</span>
    </div>
    <div class="fin-cell">
        <span class="fin-label">Ingredient Cost</span>
        <span class="fin-value fin-red">GHS {{ number_format($summary['ingredient_cost'], 2) }}</span>
    </div>
    <div class="fin-cell">
        <span class="fin-label">Net</span>
        <span class="fin-value {{ $net >= 0 ? 'fin-green' : 'fin-red' }}">GHS {{ number_format($net, 2) }}</span>
    </div>
</div>

@if($report->notes)
<div style="background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;font-size:12px;color:#92400e;">
    <strong>Notes:</strong> {{ $report->notes }}
</div>
@endif

</div>

<div class="footer">
    <div class="footer-left">Obamax Gardens Management System</div>
    <div class="footer-right">Printed: {{ now()->format('d M Y, H:i') }}</div>
</div>

</body>
</html>
