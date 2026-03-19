<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; padding: 30px; }

  .header { display: table; width: 100%; margin-bottom: 20px; }
  .header-logo { display: table-cell; width: 70px; vertical-align: middle; }
  .header-logo img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #15803d; }
  .header-text { display: table-cell; vertical-align: middle; padding-left: 14px; }
  .header-text h1 { font-size: 18px; font-weight: bold; color: #14532d; letter-spacing: 0.3px; }
  .header-text p { font-size: 10px; color: #6b7280; margin-top: 2px; }

  .divider { border: none; border-top: 2px solid #15803d; margin: 14px 0; }

  .report-title { font-size: 14px; font-weight: bold; color: #14532d; margin-bottom: 12px; }

  .meta-grid { display: table; width: 100%; margin-bottom: 16px; border: 1px solid #d1fae5; border-radius: 6px; background: #f0fdf4; }
  .meta-row { display: table-row; }
  .meta-cell { display: table-cell; padding: 7px 12px; font-size: 10px; width: 33%; }
  .meta-label { color: #6b7280; font-weight: bold; text-transform: uppercase; font-size: 8.5px; letter-spacing: 0.5px; }
  .meta-value { color: #111827; font-weight: bold; font-size: 11px; margin-top: 2px; }

  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  thead tr { background: #14532d; color: white; }
  thead th { padding: 8px 10px; text-align: left; font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; }
  tbody tr { border-bottom: 1px solid #e5e7eb; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  tbody td { padding: 7px 10px; font-size: 10.5px; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }

  .tfoot-row td { background: #f0fdf4; font-weight: bold; font-size: 11px; padding: 9px 10px; border-top: 2px solid #15803d; }

  .summary-box { margin-top: 18px; border: 1px solid #d1fae5; border-radius: 6px; padding: 12px 16px; background: #f0fdf4; }
  .summary-row { display: table; width: 100%; margin-bottom: 4px; }
  .summary-label { display: table-cell; color: #374151; font-size: 10.5px; }
  .summary-value { display: table-cell; text-align: right; font-weight: bold; font-size: 11px; }
  .shortfall { color: #dc2626; }
  .surplus { color: #15803d; }
  .balanced { color: #15803d; }

  .warning-box { margin-top: 10px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 4px; padding: 6px 10px; font-size: 9.5px; color: #92400e; }

  .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
</style>
</head>
<body>

{{-- Header --}}
<div class="header">
  <div class="header-logo">
    @if($logoBase64)
      <img src="{{ $logoBase64 }}" alt="Logo">
    @endif
  </div>
  <div class="header-text">
    <h1>Obamax Gardens Management</h1>
    <p>Bar Stock Taking Report</p>
  </div>
</div>
<hr class="divider">

<div class="report-title">Stock Taking Summary</div>

{{-- Meta info --}}
<div class="meta-grid">
  <div class="meta-row">
    <div class="meta-cell">
      <div class="meta-label">Bar Keeper</div>
      <div class="meta-value">{{ $stockTaking->worker?->name ?? 'N/A' }}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Block</div>
      <div class="meta-value">{{ $stockTaking->block }}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Stock Taking Date</div>
      <div class="meta-value">{{ $stockTaking->stock_date->format('d M Y') }}</div>
    </div>
  </div>
  <div class="meta-row">
    <div class="meta-cell">
      <div class="meta-label">Period Start</div>
      <div class="meta-value">{{ $stockTaking->period_start->format('d M Y') }}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Period End</div>
      <div class="meta-value">{{ $stockTaking->period_end->format('d M Y') }}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Generated</div>
      <div class="meta-value">{{ now()->format('d M Y, H:i') }}</div>
    </div>
  </div>
</div>

{{-- Drink breakdown table --}}
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Drink</th>
      <th class="text-right">Opening Stock</th>
      <th class="text-right">Issued</th>
      <th class="text-right">Closing Stock</th>
      <th class="text-right">Wastage</th>
      <th class="text-right">Qty Sold</th>
      <th class="text-right">Expected Revenue</th>
    </tr>
  </thead>
  <tbody>
    @foreach($stockTaking->items as $i => $item)
    <tr>
      <td class="text-center">{{ $i + 1 }}</td>
      <td>{{ $item->drink?->name ?? 'Unknown' }}</td>
      <td class="text-right">{{ $item->opening_stock }} btl</td>
      <td class="text-right">{{ $item->issued_during_period }} btl</td>
      <td class="text-right">{{ $item->closing_stock }} btl</td>
      <td class="text-right" style="color: #dc2626;">{{ $item->wastage > 0 ? $item->wastage . ' btl' : '-' }}</td>
      <td class="text-right"><strong>{{ $item->qty_sold }} btl</strong></td>
      <td class="text-right">GHS {{ number_format($item->expected_revenue, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr class="tfoot-row">
      <td colspan="7" class="text-right">Total Expected Revenue</td>
      <td class="text-right">GHS {{ number_format($stockTaking->total_expected_revenue, 2) }}</td>
    </tr>
  </tfoot>
</table>

{{-- Summary box --}}
<div class="summary-box">
  <div class="summary-row">
    <span class="summary-label">Total Expected Revenue</span>
    <span class="summary-value">GHS {{ number_format($stockTaking->total_expected_revenue, 2) }}</span>
  </div>
  @if($stockTaking->total_wastage_bottles > 0)
  <div class="summary-row">
    <span class="summary-label" style="color: #dc2626;">&#x1F5D1; Wastage ({{ $stockTaking->total_wastage_bottles }} btl written off)</span>
    <span class="summary-value" style="color: #dc2626;">-GHS {{ number_format($stockTaking->total_wastage_value, 2) }}</span>
  </div>
  @endif
  <div class="summary-row">
    <span class="summary-label">Total Collected (from Daily Closings)</span>
    <span class="summary-value">GHS {{ number_format($stockTaking->total_collected, 2) }}</span>
  </div>
  <div class="summary-row" style="margin-top: 6px; border-top: 1px solid #bbf7d0; padding-top: 6px;">
    @php $shortfall = $stockTaking->shortfall; @endphp
    @if($shortfall > 0)
      <span class="summary-label" style="color: #dc2626; font-weight: bold;">⚠ Shortfall</span>
      <span class="summary-value shortfall">GHS {{ number_format($shortfall, 2) }}</span>
    @elseif($shortfall < 0)
      <span class="summary-label" style="color: #15803d; font-weight: bold;">✓ Surplus</span>
      <span class="summary-value surplus">GHS {{ number_format(abs($shortfall), 2) }}</span>
    @else
      <span class="summary-label" style="color: #15803d; font-weight: bold;">✓ Balanced</span>
      <span class="summary-value balanced">GHS 0.00</span>
    @endif
  </div>
</div>

@if($stockTaking->total_collected == 0)
<div class="warning-box">
  ⚠ No daily closing records were found for this period. Total collected shown as GHS 0.00.
</div>
@endif

@if($stockTaking->notes)
<div style="margin-top: 12px; font-size: 10px; color: #374151;"><strong>Notes:</strong> {{ $stockTaking->notes }}</div>
@endif

<div class="footer">
  Obamax Gardens Management System &nbsp;|&nbsp; Generated {{ now()->format('d M Y H:i') }}
</div>

</body>
</html>
