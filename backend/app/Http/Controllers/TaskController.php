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


//     public function sendtogemini( Team $team)
// {
//     // Prepare the message for Gemini
//     $inputText = "use the following json to suggest an improved more detailed tasks to help a team work more clearly:\n\n" . $this->index($team);

//     try {
//         // Call Gemini API
//         $response = Http::withHeaders([
//             'Content-Type' => 'application/json',
//         ])->post('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
//             'contents' => [
//                 [
//                     'parts' => [
//                         ['text' => $inputText],
//                     ]
//                 ]
//             ]
//         ]);

//         $responseData = $response->json();

//         // Check for errors or missing responses
//         if ($response->failed() || !isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
//             return response()->json(['error' => 'Failed to retrieve response from Gemini'], 500);
//         }

//         return $responseData['candidates'][0]['content']['parts'][0]['text'];
//     } catch (\Exception $e) {
//         return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
//     }
// }


public function sendToGemini(Team $team)
{
    // Prepare the message for Gemini
    $inputText = "Use the following JSON to suggest improved, more detailed tasks to help a team work more clearly:\n\n" . $this->index($team);

    try {
        // Call Gemini API
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $inputText],
                    ]
                ]
            ]
        ]);

        $responseData = $response->json();

        // Validate response
        if ($response->failed() || !isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
            return response()->json(['error' => 'Failed to retrieve response from Gemini'], 500);
        }

        // Parse the JSON response from Gemini
        $geminiTasks = json_decode($responseData['candidates'][0]['content']['parts'][0]['text'], true);

        if (!is_array($geminiTasks)) {
            return response()->json(['error' => 'Invalid response format from Gemini'], 500);
        }

        // Format the response with pagination
        $currentPage = 1;
        $perPage = 10;
        $total = count($geminiTasks);
        $paginatedData = array_slice($geminiTasks, 0, $perPage);

        return response()->json([
            "current_page" => $currentPage,
            "data" => $paginatedData,
            "first_page_url" => url()->current() . "?page=1",
            "from" => 1,
            "last_page" => ceil($total / $perPage),
            "last_page_url" => url()->current() . "?page=" . ceil($total / $perPage),
            "links" => [
                ["url" => null, "label" => "&laquo; Previous", "active" => false],
                ["url" => url()->current() . "?page=1", "label" => "1", "active" => true],
                ["url" => null, "label" => "Next &raquo;", "active" => false]
            ],
            "next_page_url" => null,
            "path" => url()->current(),
            "per_page" => $perPage,
            "prev_page_url" => null,
            "to" => count($paginatedData),
            "total" => $total
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
    }
}

}
