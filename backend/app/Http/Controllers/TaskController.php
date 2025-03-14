<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    // Display all tasks
    public function index(Team $team)
    {

        $task = Task::where('team_id',$team['id']);

        return response()->json($task);
    }


     // Store a new task in the database
    public function store(Request $request)
    {
       $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'completed' => 'nullable|boolean',
            'team_id' => 'required',
            'category' => 'nullable|string|max:255',
        ]);

        $team = Team::findOrFail($validated['team_id']);

        Gate::authorize('update', $team);

      $task = Task::create([
      'title'=> $validated['title'],
      'description' => $validated['description'],
      'deadline' => $validated['deadline'],
      'category' => $validated['category'],
      'completed' => $validated['completed'],
      'team_id' => $validated['team_id']
      ]);
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Update an existing task in the database
    public function update(Request $request , Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'nullable|boolean',
            'deadline' => 'nullable|date',
            'category' => 'nullable|string|max:255',
        ]);


        $team = Task::findOrFail(['team_id']);

        Gate::authorize('update', $team);

        $task
        ->update([
            'title'=> $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'],
            'category' => $validated['category'],
            'completed' => $validated['completed']
        ]);

        // $task = Task::find($validated['task_id']);
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Delete a task from the database
    public function destroy(Task $task, Request $request)
    {


        $team = Team::findOrFail($task['team_id']);

        Gate::authorize('update', $team);

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
