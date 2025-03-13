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
        return response()->json(Task::all());
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
            'team_id' => 'required',
        ]);

        // $team = Team::findOrFail($validated['team_id']);

        // Gate::authorize('update', $team);

      $task = Task::create([
      'title'=> $validated['title'],
      'description' => $validated['description'],
      'due_date' => $validated['due_date'],
      'date' => $validated['date'],
      'colour' => $validated['colour'],
      'completed' => $validated['completed'],
      'team_id' => $validated['team_id']
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
            'task_id' => 'required|exists:tasks,id',
            'team_id' => 'required',
            'date' => 'nullable|date',
            'colour' => 'nullable|string|max:255',
        ]);


        // $team = Team::findOrFail($validated['team_id']);

        // Gate::authorize('update', $team);

        $task = Task::where('id', $validated['task_id'])
        ->update([
            'title'=> $validated['title'],
            'description' => $validated['description'],
            'date' => $validated['date'],
            'colour' => $validated['colour'],
            'due_date' => $validated['due_date'],
            'completed' => $validated['completed']
        ]);

        $task = Task::find($validated['task_id']);
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Delete a task from the database
    public function destroy(Task $task, Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
        ]);

        $task = Task::find($validated['task_id']);

        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $task->delete();
        return response()->json(['success' => true]);

        // $validated = $request->validate(['team_id' => 'required']);

        // $team = Team::findOrFail($validated['team_id']);

        // // Gate::authorize('update', $team);

        // $task->delete();
        // return response()->json(['success' => true]);
    }


}
