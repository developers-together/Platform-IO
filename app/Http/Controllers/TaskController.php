<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    // Display all tasks
    public function index()
    {
        return view('tasks.index');
    }

    // Fetch tasks for FullCalendar
    public function getTasks()
    {
        $tasks = Task::select('id', 'title', 'due_date as start')->get();
        return response()->json($tasks);
    }

     // Store a new task in the database
    public function store(Request $request)
    {
       $validated= $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'date' => 'nullable|date',
            'colour' => 'nullable|string',
            'completed' => 'nullable|boolean',
            'team_id' => 'required'
        ]);

        $team = Team::findOrFail($validated['team_id']);

        Gate::authorize('update', $team);

      $task = Task::create([
      'title'=> $validated['title'],
      'description' => $validated['description'],
      'due_date' => $validated['due_date'],
      'date' => $validated['date'],
      'colour' => $validated['colour'],
      'completed' => $validated['completed']
      ]);
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Update an existing task in the database
    public function update(Request $request)
    {
       $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'completed' => 'nullable|boolean',
            'team_id' => 'required',
            'task_id' => 'required'
        ]);

        $team = Team::findOrFail($validated['team_id']);

        Gate::authorize('update', $team);

        $task = Task::where('id', $validated['task_id'])
        ->update([
            'title'=> $validated['title'],
            'description' => $validated['description'],
            'date' => $validated['date'],
            'colour' => $validated['colour'],
            'due_date' => $validated['due_date'],
            'completed' => $validated['completed']
        ]);

        return response()->json(['success' => true, 'task' => $task]);
    }

    // Delete a task from the database
    public function destroy(Task $task, Request $request)
    {
        $validated = $request->validate(['team_id' => 'required']);

        $team = Team::findOrFail($validated['team_id']);

        Gate::authorize('update', $team);

        $task->delete();
        return response()->json(['success' => true]);
    }


}
