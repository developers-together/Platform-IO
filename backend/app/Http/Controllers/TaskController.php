<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    // Display all tasks
    // public function index(Task $task)
    // {
    //     Gate::authorize('view', $task);

    //     return response()->json($task);
    // }

    public function show(Task $task)
    {
        // Authorize the action (ensure the user can view the task)
        Gate::authorize('view', $task);

        // Return the task details as a JSON response
        return response()->json([
            'message' => 'Task retrieved successfully',
            'data' => $task,
        ]);
    }


     // Store a new task in the database
    public function store(Request $request)
    {

        Gate::authorize('create', Task::class);

       $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stared'=> 'nullable|boolean',
            'end' => 'nullable|date',
            'start' => 'nullable|date',
            'completed' => 'nullable|boolean',
            'team_id' => 'required',
            'category' => 'nullable|string|max:255',
        ]);

        
        

      $task = Task::create([
      'title'=> $validated['title'],
      'description' => $validated['description'],
      'stared' => $validated['stared']?? false,
      'end' => $validated['end'],
      'start' => $validated['start'],
      'category' => $validated['category'],
      'completed' => $validated['completed'],
      'team_id' => $validated['team_id']
      ]);
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Update an existing task in the database
    public function update(Request $request , Task $task)
    {
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'nullable|boolean',
            'stared'=> 'nullable|boolean',
            'end' => 'nullable|date',
            'start' => 'nullable|date',
            'category' => 'nullable|string|max:255',
        ]);

        $task
        ->update([
            'title'=> $validated['title'],
            'description' => $validated['description'],
            'stared' => $validated['stared']?? false,
            'end' => $validated['end'],
            'start' => $validated['start'],
            'category' => $validated['category'],
            'completed' => $validated['completed']
        ]);

        // $task = Task::find($validated['task_id']);
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Delete a task from the database
    public function destroy(Task $task, Request $request)
    {
        $this->authorize('delete', $task);

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
