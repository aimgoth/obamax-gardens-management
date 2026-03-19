<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkerController extends Controller
{
    public function index()
    {
        $workers = Worker::orderBy('department')->orderBy('name')->get();

        return Inertia::render('Workers/Index', [
            'workers' => $workers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'required|string|max:255',
            'department' => 'required|in:Bar,Restaurant,Hotel,Other',
            'block'      => 'nullable|string|max:100',
            'phone'      => 'nullable|string|max:30',
            'notes'      => 'nullable|string',
        ]);

        Worker::create($validated);

        return back()->with('success', 'Worker registered successfully.');
    }

    public function update(Request $request, Worker $worker)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'required|string|max:255',
            'department' => 'required|in:Bar,Restaurant,Hotel,Other',
            'block'      => 'nullable|string|max:100',
            'phone'      => 'nullable|string|max:30',
            'is_active'  => 'boolean',
            'notes'      => 'nullable|string',
        ]);

        $worker->update($validated);

        return back()->with('success', 'Worker updated successfully.');
    }

    public function deactivate(Worker $worker)
    {
        $worker->update(['is_active' => !$worker->is_active]);

        $status = $worker->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Worker {$status} successfully.");
    }

    public function destroy(Worker $worker)
    {
        $worker->delete();

        return back()->with('success', 'Worker deleted successfully.');
    }
}
