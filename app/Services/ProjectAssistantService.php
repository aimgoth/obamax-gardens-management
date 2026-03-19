<?php

namespace App\Services;

use App\Models\BarDailyClosing;
use App\Models\BarIssuance;
use App\Models\Booking;
use App\Models\DepotInventory;
use App\Models\Drink;
use App\Models\RestaurantDailyReport;
use App\Models\Room;
use App\Models\Worker;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProjectAssistantService
{
    public function answer(string $question): array
    {
        try {
            $snapshot = $this->buildSnapshot();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Assistant snapshot error: ' . $e->getMessage());
            $snapshot = ['generated_at' => now()->toDateTimeString(), 'error' => 'Could not load live data.'];
        }

        try {
            $context = json_encode($snapshot, JSON_PRETTY_PRINT);

            $prompt = "You are the AI Assistant directly integrated into the Obamax Gardens Management System software. "
                . "You are helping the hotel/bar/restaurant manager answer strictly operational questions using the live data block provided below. "
                . "Rule 1: Always speak politely, concisely, and directly. "
                . "Rule 2: Base your numbers and facts ONLY on the live data provided below. Do not guess any financial figures. "
                . "Rule 3: Give short and easy-to-read answers. "
                . "Rule 4: If the user asks how to use the software (guide/training), calmly explain they should navigate the sidebar links. "
                . "\n\n### LIVE DATA SNAPSHOT:\n" . $context
                . "\n\n### QUESTION FROM MANAGER:\n" . $question;

            $apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');

            $response = Http::timeout(30)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                    [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]],
                        ],
                    ]
                );

            if (!$response->successful()) {
                Log::error('Gemini HTTP error: ' . $response->status() . ' - ' . $response->body());
                throw new \RuntimeException('Gemini API returned HTTP ' . $response->status());
            }

            $text = data_get($response->json(), 'candidates.0.content.parts.0.text', '');

            if (empty($text)) {
                Log::error('Gemini empty response: ' . $response->body());
                throw new \RuntimeException('Gemini returned an empty response.');
            }

            return [
                'scope' => 'ai_response',
                'answer' => $text,
                'snapshot' => $snapshot,
            ];
        } catch (\Throwable $e) {
            Log::error('Gemini API Error: ' . $e->getMessage());

            return [
                'scope' => 'fallback',
                'answer' => "Sorry, I could not get a response from Gemini right now. Error: " . $e->getMessage(),
                'snapshot' => $snapshot,
            ];
        }
    }

    private function buildSnapshot(): array
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();

        $todayBar = (float) (BarDailyClosing::whereDate('closing_date', $today)
            ->selectRaw('SUM(cash_collected + momo_collected) as total')
            ->value('total') ?? 0);

        $todayRestaurant = (float) RestaurantDailyReport::whereDate('report_date', $today)->sum('total_cash');
        $todayHotel = (float) Booking::whereDate('date_recorded', $today)->sum('amount_paid');

        $monthlyBar = (float) (BarDailyClosing::where('closing_date', '>=', $monthStart)
            ->selectRaw('SUM(cash_collected + momo_collected) as total')
            ->value('total') ?? 0);

        $monthlyRestaurant = (float) RestaurantDailyReport::where('report_date', '>=', $monthStart)->sum('total_cash');
        $monthlyHotel = (float) Booking::where('date_recorded', '>=', $monthStart)->sum('amount_paid');

        $activeWorkers = Worker::active()->count();
        $totalWorkers = Worker::count();
        $activeRooms = Room::active()->count();
        $totalRooms = Room::count();

        $todayBookings = Booking::whereDate('date_recorded', $today)->count();
        $monthBookings = Booking::where('date_recorded', '>=', $monthStart)->count();

        $lowStockDrinks = $this->lowStockDrinks();

        return [
            'generated_at' => now()->toDateTimeString(),
            'today' => $today->toDateString(),
            'month' => $monthStart->format('Y-m'),
            'revenue' => [
                'today' => [
                    'bar' => round($todayBar, 2),
                    'restaurant' => round($todayRestaurant, 2),
                    'hotel' => round($todayHotel, 2),
                    'total' => round($todayBar + $todayRestaurant + $todayHotel, 2),
                ],
                'month' => [
                    'bar' => round($monthlyBar, 2),
                    'restaurant' => round($monthlyRestaurant, 2),
                    'hotel' => round($monthlyHotel, 2),
                    'total' => round($monthlyBar + $monthlyRestaurant + $monthlyHotel, 2),
                ],
            ],
            'operations' => [
                'workers' => ['active' => $activeWorkers, 'total' => $totalWorkers],
                'rooms' => ['active' => $activeRooms, 'total' => $totalRooms],
                'bookings' => ['today' => $todayBookings, 'month' => $monthBookings],
                'drinks' => ['active' => Drink::active()->count()],
                'low_stock_count' => count($lowStockDrinks),
            ],
            'low_stock_drinks' => $lowStockDrinks,
            'recent_updates' => $this->recentUpdates(),
        ];
    }

    private function lowStockDrinks(): array
    {
        $items = [];

        foreach (Drink::active()->get(['id', 'name', 'bottles_per_crate']) as $drink) {
            $received = (int) DepotInventory::where('drink_id', $drink->id)->sum('bottles_received');
            $issued = (int) BarIssuance::where('drink_id', $drink->id)->sum('bottles_issued');
            $current = $received - $issued;

            if ($current < 24) {
                $items[] = [
                    'id' => $drink->id,
                    'name' => $drink->name,
                    'bottles_left' => $current,
                    'crates_left' => round($current / max(1, (int) $drink->bottles_per_crate), 1),
                ];
            }
        }

        usort($items, fn(array $a, array $b) => $a['bottles_left'] <=> $b['bottles_left']);

        return array_slice($items, 0, 10);
    }

    private function recentUpdates(): array
    {
        $updates = [];

        foreach (Booking::with('room:id,room_number')->latest('id')->take(3)->get() as $booking) {
            $updates[] = [
                'type' => 'hotel_booking',
                'when' => optional($booking->created_at)->toDateTimeString(),
                'text' => sprintf(
                    'Booking #%d recorded for room %s (%d night(s), GHS %.2f)',
                    $booking->id,
                    $booking->room?->room_number ?? 'N/A',
                    (int) $booking->number_of_nights,
                    (float) $booking->amount_paid
                ),
            ];
        }

        foreach (BarDailyClosing::latest('id')->take(3)->get() as $closing) {
            $updates[] = [
                'type' => 'bar_closing',
                'when' => optional($closing->created_at)->toDateTimeString(),
                'text' => sprintf(
                    'Bar closing on %s: GHS %.2f total',
                    optional($closing->closing_date)->toDateString(),
                    (float) $closing->cash_collected + (float) $closing->momo_collected
                ),
            ];
        }

        foreach (RestaurantDailyReport::latest('id')->take(3)->get() as $report) {
            $updates[] = [
                'type' => 'restaurant_report',
                'when' => optional($report->created_at)->toDateTimeString(),
                'text' => sprintf(
                    'Restaurant report %s: GHS %.2f',
                    optional($report->report_date)->toDateString(),
                    (float) $report->total_cash
                ),
            ];
        }

        usort($updates, function (array $a, array $b) {
            return strcmp($b['when'] ?? '', $a['when'] ?? '');
        });

        return array_slice($updates, 0, 10);
    }

    private function formatTodayRevenue(array $snapshot): string
    {
        $r = $snapshot['revenue']['today'];

        return sprintf(
            "Today (%s) revenue is GHS %s total. Breakdown: Bar GHS %s, Restaurant GHS %s, Hotel GHS %s.",
            $snapshot['today'],
            $this->money($r['total']),
            $this->money($r['bar']),
            $this->money($r['restaurant']),
            $this->money($r['hotel'])
        );
    }

    private function formatMonthlyRevenue(array $snapshot): string
    {
        $r = $snapshot['revenue']['month'];

        return sprintf(
            "Month %s revenue so far is GHS %s total. Breakdown: Bar GHS %s, Restaurant GHS %s, Hotel GHS %s.",
            $snapshot['month'],
            $this->money($r['total']),
            $this->money($r['bar']),
            $this->money($r['restaurant']),
            $this->money($r['hotel'])
        );
    }

    private function formatWorkerStatus(array $snapshot): string
    {
        $workers = $snapshot['operations']['workers'];

        return sprintf(
            "Workers status: %d active out of %d total workers.",
            (int) $workers['active'],
            (int) $workers['total']
        );
    }

    private function formatHotelStatus(array $snapshot): string
    {
        $rooms = $snapshot['operations']['rooms'];
        $bookings = $snapshot['operations']['bookings'];

        return sprintf(
            "Hotel status: %d active rooms out of %d. Bookings: %d today, %d this month.",
            (int) $rooms['active'],
            (int) $rooms['total'],
            (int) $bookings['today'],
            (int) $bookings['month']
        );
    }

    private function formatStockStatus(array $snapshot): string
    {
        $count = (int) $snapshot['operations']['low_stock_count'];

        if ($count === 0) {
            return 'Stock status: no drinks are currently below the low-stock threshold.';
        }

        $top = array_slice($snapshot['low_stock_drinks'], 0, 3);
        $items = array_map(
            fn(array $d) => sprintf('%s (%d bottles left)', $d['name'], (int) $d['bottles_left']),
            $top
        );

        return sprintf(
            'Stock alert: %d low-stock drink(s). Most urgent: %s.',
            $count,
            implode(', ', $items)
        );
    }

    private function formatSystemSummary(array $snapshot): string
    {
        $today = $snapshot['revenue']['today'];
        $updates = array_slice($snapshot['recent_updates'], 0, 3);
        $updatesText = empty($updates)
            ? 'No recent updates found.'
            : implode(' | ', array_map(fn(array $u) => $u['text'], $updates));

        return sprintf(
            "Current system summary: today's total revenue is GHS %s, active workers are %d, low-stock drinks are %d. Latest updates: %s",
            $this->money($today['total']),
            (int) $snapshot['operations']['workers']['active'],
            (int) $snapshot['operations']['low_stock_count'],
            $updatesText
        );
    }

    private function formatUsageGuide(array $snapshot): string
    {
        return sprintf(
            "How to use Obamax Gardens Management Software:\n"
            . "1. Dashboard: open Dashboard first to monitor live today and monthly revenue. Today total is GHS %s.\n"
            . "2. Workers: add workers and keep active workers enabled for operations.\n"
            . "3. Bar workflow: create drinks -> add depot inventory -> issue to bar workers -> do stock taking -> submit daily closing.\n"
            . "4. Restaurant workflow: create food items -> update inventory -> submit daily closing and report.\n"
            . "5. Hotel workflow: add rooms -> record bookings -> submit daily closing.\n"
            . "6. Archive: review restaurant reports, bar closings, hotel closings, and monthly revenue history.\n"
            . "7. Profile: update your account and password from profile.\n"
            . "8. Assistant usage: ask exact operational questions like 'today revenue', 'low stock drinks', 'how to use bar module', or 'latest updates'.",
            $this->money($snapshot['revenue']['today']['total'])
        );
    }

    private function formatBarGuide(array $snapshot): string
    {
        return sprintf(
            "Bar module guide:\n"
            . "1. Drink Setup: add all drinks with bottles-per-crate and selling prices.\n"
            . "2. Depot Inventory: record every new stock arrival.\n"
            . "3. Issue to Bar: issue bottles to workers by block.\n"
            . "4. Stock Taking: run stock taking before closing to reconcile movement.\n"
            . "5. Daily Closing: submit cash and momo collections each day.\n"
            . "Live status now: %d low-stock drink(s), month bar revenue GHS %s.",
            (int) $snapshot['operations']['low_stock_count'],
            $this->money($snapshot['revenue']['month']['bar'])
        );
    }

    private function formatRestaurantGuide(array $snapshot): string
    {
        return sprintf(
            "Restaurant module guide:\n"
            . "1. Food Item Setup: create and maintain tracked food items.\n"
            . "2. Inventory: record incoming inventory and usage support data.\n"
            . "3. Daily Closing: submit closing entries and daily cash report.\n"
            . "Live status now: month restaurant revenue GHS %s.",
            $this->money($snapshot['revenue']['month']['restaurant'])
        );
    }

    private function formatHotelGuide(array $snapshot): string
    {
        return sprintf(
            "Hotel module guide:\n"
            . "1. Room Setup: add room number, room type, price, and room image.\n"
            . "2. Bookings: record booking date, nights, payment method, and amount paid.\n"
            . "3. Daily Closing: close each day and reconcile against booking totals.\n"
            . "Live status now: %d bookings today, month hotel revenue GHS %s.",
            (int) $snapshot['operations']['bookings']['today'],
            $this->money($snapshot['revenue']['month']['hotel'])
        );
    }

    private function formatDashboardGuide(array $snapshot): string
    {
        return sprintf(
            "Dashboard guide: use it as command center. It shows today's revenue, monthly revenue, active workers, and low-stock alerts. Current today total is GHS %s and active workers are %d.",
            $this->money($snapshot['revenue']['today']['total']),
            (int) $snapshot['operations']['workers']['active']
        );
    }

    private function formatArchiveGuide(array $snapshot): string
    {
        return sprintf(
            "Archive guide: use Archive to review historical restaurant reports, bar closings, hotel closings, and monthly summaries. Current month total revenue so far is GHS %s.",
            $this->money($snapshot['revenue']['month']['total'])
        );
    }

    private function helpText(): string
    {
        return "I can answer using live Obamax data and software guidance. Try: 'how to use this software', 'how to use bar module', 'today revenue', 'monthly revenue', 'hotel bookings today', 'low stock drinks', or 'latest updates'.";
    }

    private function containsAny(string $input, array $terms): bool
    {
        $inputWords = preg_split('/[^a-z0-9]/', strtolower($input), -1, PREG_SPLIT_NO_EMPTY);
        
        foreach ($terms as $term) {
            $term = strtolower($term);
            
            // Check exact phrase match first
            if (str_contains($input, $term)) {
                return true;
            }

            // Check fuzzy match for the term
            $termWords = preg_split('/[^a-z0-9]/', $term, -1, PREG_SPLIT_NO_EMPTY);
            $matchedWords = 0;

            foreach ($termWords as $tWord) {
                // Find best match in input
                $bestMatch = false;
                foreach ($inputWords as $iWord) {
                    if ($iWord === $tWord) {
                        $bestMatch = true;
                        break;
                    }
                    
                    $lenT = strlen($tWord);
                    if ($lenT >= 4) {
                        $dist = levenshtein($iWord, $tWord);
                        // Allow 1 typo for 4-5 letter words, 2 typos for 6+ letter words
                        $allowedTypos = ($lenT >= 6) ? 2 : 1;
                        if ($dist <= $allowedTypos) {
                            $bestMatch = true;
                            break;
                        }
                    } elseif ($lenT >= 3 && levenshtein($iWord, $tWord) <= 1) {
                        $bestMatch = true;
                        break;
                    }
                }

                if ($bestMatch) {
                    $matchedWords++;
                }
            }

            // If all words in the term were fuzzy-matched in the input
            if (count($termWords) > 0 && $matchedWords === count($termWords)) {
                return true;
            }
        }

        return false;
    }

    private function money(float $value): string
    {
        return number_format($value, 2);
    }
}
