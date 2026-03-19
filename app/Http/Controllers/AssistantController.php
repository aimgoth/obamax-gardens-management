<?php

namespace App\Http\Controllers;

use App\Services\ProjectAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssistantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Assistant/Index', [
            'sampleQuestions' => [
                'What is today total revenue?',
                'Show monthly revenue breakdown.',
                'How many active workers do we have?',
                'Any low stock drinks right now?',
                'What are the latest updates today?',
            ],
        ]);
    }

    public function ask(Request $request, ProjectAssistantService $assistant): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
        ]);

        $result = $assistant->answer($validated['question']);

        return response()->json([
            'ok' => true,
            'question' => $validated['question'],
            'answer' => $result['answer'],
            'scope' => $result['scope'],
            'generated_at' => $result['snapshot']['generated_at'] ?? now()->toDateTimeString(),
            'snapshot' => $result['snapshot'],
        ]);
    }
}
