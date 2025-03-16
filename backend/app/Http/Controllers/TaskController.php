<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;


class TaskController extends Controller
{
    use AuthorizesRequests;
    // Display all team tasks
    public function index(Team $team)
    {
        $tasks = Task::where('team_id', $team->id)
                    ->paginate(10);

        return response()->json($tasks);
    }


    public function show(Task $task)
    {

        return $task->toJson();
    }

     // Store a new task in the database
     public function store(Request $request, Team $team)
     {
         Gate::authorize('create', Task::class);

         $validated = $request->validate([
             'title' => 'required|string|max:255',
             'description' => 'nullable|string',
             'stared'=> 'nullable|boolean',
             'end' => 'nullable|date',
             'start' => 'nullable|date',
             'completed' => 'nullable|boolean',
             'category' => 'nullable|string|max:255',
         ]);

         $user = auth()->user();

         // Check if the user belongs to this team
         if (!$team->users()->where('user_id', $user->id)->exists()) {
             return response()->json(['error' => 'Unauthorized: not a member of this team'], 403);
         }

         // Create the task with the team_id from route
         $task = Task::create([
             'title' => $validated['title'],
             'description' => $validated['description'] ?? null,
             'stared' => $validated['stared'] ?? false,
             'end' => $validated['end'] ?? null,
             'start' => $validated['start'] ?? null,
             'category' => $validated['category'] ?? null,
             'completed' => $validated['completed'] ?? false,
             'team_id' => $team->id, // ← from route!
         ]);

         return $task->toJson();
     }


    // Update an existing task in the database
    public function update(Request $request , Task $task)
    {
        Gate::authorize('update', $task);

        $user = AUTH::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'nullable|boolean',
            'stared'=> 'nullable|boolean',
            'end' => 'nullable|date',
            'start' => 'nullable|date',
            'category' => 'nullable|string|max:255',
        ]);

        if($task->team->users()->where('user_id', $user->id)){

        $task
        ->update([
            'title'=> $validated['title'],
            'description' => $validated['description'] ?? null,
            'stared' => $validated['stared']?? false,
            'end' => $validated['end'] ?? null,
            'start' => $validated['start'] ?? null,
            'category' => $validated['category'] ?? null,
            'completed' => $validated['completed'] ?? false
        ]);

    }

        return $task->toJson();
    }

    // Delete a task from the database
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        // $validated = $request->validate([
        //     'task_id' => 'required|exists:tasks,id',
        // ]);

        // $task = Task::find($validated['task_id']);

        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $task->delete();

        return response()->json(['success' => true, 'message' => 'Task deleted successfully']);
    }



}
