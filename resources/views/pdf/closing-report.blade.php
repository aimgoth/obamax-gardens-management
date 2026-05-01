<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }

    .header { background: #14532d; color: #fff; padding: 18px 30px; display: table; width: 100%; }
    .header-logo { display: table-cell; vertical-align: middle; width: 70px; }
    .header-logo img { width: 58px; height: 58px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.4); object-fit: cover; }
    .header-text { display: table-cell; vertical-align: middle; padding-left: 16px; }
    .header-text h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header-text .subtitle { font-size: 12px; opacity: 0.8; margin-top: 2px; }
    .header-text .report-title { font-size: 13px; font-weight: 600; margin-top: 8px; background: rgba(255,255,255,0.18); display: inline-block; padding: 3px 12px; border-radius: 4px; }

    .meta { padding: 0; background: #f0fdf4; border-bottom: 1px solid #bbf7d0; display: table; width: 100%; }
    .meta-item { display: table-cell; padding: 14px 24px; border-right: 1px solid #bbf7d0; }
    .meta-item:last-child { border-right: none; }
    .meta-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; display: block; }
    .meta-item p { font-size: 13px; font-weight: 600; color: #166534; margin-top: 2px; }

    .content { padding: 20px 30px; }

    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    thead tr { background: #14532d; color: #fff; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; }
    thead th.right { text-align: right; }
    tbody tr { border-bottom: 1px solid #e5e7eb; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td { padding: 9px 12px; font-size: 13px; }
    tbody td.right { text-align: right; }
    tbody td.notes { color: #6b7280; font-size: 11px; font-style: italic; }

    .no-data { text-align: center; padding: 30px 0; color: #9ca3af; font-style: italic; }

    .totals-row td { font-weight: 700; color: #fff; font-size: 14px; padding: 12px 12px; background: #14532d; }

    .footer { margin-top: 30px; padding: 14px 30px; border-top: 1px solid #e5e7eb; display: table; width: 100%; font-size: 11px; color: #9ca3af; }
    .footer-left { display: table-cell; }
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
        <div class="subtitle">Management System &mdash; Bar Department</div>
        <div class="report-title">Bar Daily Closing Report</div>
    </div>
</div>

<div class="meta">
    <div class="meta-item">
        <label>Period</label>
        <p>{{ $dateFrom }} &mdash; {{ $dateTo }}</p>
    </div>
    <div class="meta-item">
        <label>Block / Section</label>
        <p>{{ $block }}</p>
    </div>
    <div class="meta-item">
        <label>Bar Keeper</label>
        <p>{{ $workerName }}</p>
    </div>
    <div class="meta-item">
        <label>Total Closings</label>
        <p>{{ $closings->count() }}</p>
    </div>
    <div class="meta-item">
        <label>Grand Total</label>
        <p>GHS {{ number_format($grandTotal, 2) }}</p>
    </div>
</div>

<div class="content">
    <table>
        <thead>
            <tr>
                <th style="width:30px">#</th>
                <th>Date</th>
                <th>Bar Keeper</th>
                <th>Block</th>
                <th class="right" style="width:120px">Cash (GHS)</th>
                <th class="right" style="width:120px">MoMo (GHS)</th>
                <th class="right" style="width:130px">Total (GHS)</th>
                <th style="width:120px">Notes</th>
            </tr>
        </thead>
        <tbody>
            @if($closings->isEmpty())
                <tr><td colspan="8" class="no-data">No closing records found for the selected filters.</td></tr>
            @else
                @foreach($closings as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td><strong>{{ $row['date'] }}</strong></td>
                    <td>{{ $row['worker'] }}</td>
                    <td>{{ $row['block'] }}</td>
                    <td class="right">{{ number_format($row['cash_collected'], 2) }}</td>
                    <td class="right">{{ number_format($row['momo_collected'], 2) }}</td>
                    <td class="right">{{ number_format($row['total'], 2) }}</td>
                    <td class="notes">{{ $row['notes'] ?: '—' }}</td>
                </tr>
                @endforeach
                <tr class="totals-row">
                    <td colspan="4">GRAND TOTAL ({{ $closings->count() }} closings)</td>
                    <td class="right">{{ number_format($grandCash, 2) }}</td>
                    <td class="right">{{ number_format($grandMomo, 2) }}</td>
                    <td class="right">{{ number_format($grandTotal, 2) }}</td>
                    <td></td>
                </tr>
            @endif
        </tbody>
    </table>
</div>

<div class="footer">
    <div class="footer-left">Obamax Gardens Ltd &mdash; Bar Closing Report &mdash; {{ $dateFrom }} to {{ $dateTo }}</div>
    <div class="footer-right">Generated: {{ now()->format('d M Y, H:i') }}</div>
</div>

</body>
</html>
