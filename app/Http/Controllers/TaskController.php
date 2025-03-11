<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

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
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'completed' => 'nullable|boolean',
        ]);

        Task::create($request->all());
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Update an existing task in the database
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'completed' => 'nullable|boolean',
        ]);

        $task = Task::findOrFail($id);
        $task->update($request->all());
        return response()->json(['success' => true, 'task' => $task]);
    }

    // Delete a task from the database
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['success' => true]);
    }


}
