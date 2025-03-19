<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class FileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Team $team)
    {
        Gate::authorize('create', Team::class);

        $validated = $request->validate([
            'file' => 'required|file',
            'path' => 'required',
        ]);

        // Create a dedicated disk configuration for the team
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $team->id), // Fixed path
            'visibility' => 'public'
        ]);

        $file = $request->file('file');

        // Clean and prepare the target directory path
        $targetPath = ltrim($validated['path'], '/');  // Remove leading slashes

        // Store the file using the custom disk
        $path = $disk->putFileAs(
            $targetPath,
            $file,
            $file->getClientOriginalName()
        );

        // Create file record with proper relationships
        // File::create([
        //     'name' => $file->getClientOriginalName(),
        //     'path' => $path,
        //     'user_id' => auth()->id(),
        //     'team_id' => $team->id, // Associate with the team
        // ]);

        return response()->json($path);
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team , Request $request)
    {

        Gate::authorize('view', $team);

        $validated = $request->validate([
            'path' => 'required|string'
        ]);

    // Rebuild the team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $team->id),
            'visibility' => 'public'
        ]);

        // Verify file exists
        if (!$disk->exists($validated['path'])) {
            abort(404, 'File not found');
        }

        try {
            // Get file contents and metadata
            $content = $disk->get($validated['path']);
            $mimeType = $disk->mimeType($validated['path']);
            $fileSize = $disk->size($validated['path']);

            return response($content)
                ->header('Content-Type', $mimeType)
                ->header('Content-Length', $fileSize)
                ->header('Content-Disposition', 'inline; filename="' . $validated['path'] . '"');

        } catch (\Exception $e) {
            Log::error("File content retrieval failed: {$e->getMessage()}");
            abort(500, 'Could not retrieve file content');
        }
    }

    public function download(team $team, Request $request)
    {

        Gate::authorize('view', $team);

        $validated = $request->validate([
            'path' => 'required|string'
        ]);

        // Rebuild the team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $team->id),
            'visibility' => 'public'
        ]);

        // Verify file exists in storage
        if (!$disk->exists($validated['path'])) {
            abort(404, 'File not found');
        }

        return response()->download($disk->path($validated['path']));

        // Create download response with original filename
        // return $disk->response(
        //     $validated['path'] , // Use original filename from database
        //     [
        //         'Content-Type' => $disk->mimeType($validated['path']),
        //         'Content-Disposition' => 'attachment; filename="' . $validated['path']  . '"'
        //     ]
        // );
    }



    /**
     * Show the form for editing the specified resource.
     */
    public function edit(File $file)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Team $team)
    {
        Gate::authorize('update', $team);

        $validated = $request->validate([
            'new_name' => 'required|string|max:255|regex:/^[a-zA-Z0-9-_ .]+$/',
            'path' => 'required|string'
        ]);

        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $team->id),
            'visibility' => 'public'
        ]);

        // Ensure the file exists before renaming
        if (!$disk->exists($validated['path'])) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // Extract directory path and construct the new full path
        $directory = dirname($validated['path']);  // Get the directory
        $newPath = $directory . '/' . $validated['new_name'];

        // Check if a file with the new name already exists
        if ($disk->exists($newPath)) {
            return response()->json(['error' => 'A file with this name already exists'], 400);
        }

        // Rename the file
        $disk->move($validated['path'], $newPath);

        return response()->json([
            'message' => 'File updated successfully',
            'new_path' => $newPath,
        ]);

    }

    /**
     * Remove the specified resource from storage.
     */
        public function destroy(Team $team , Request $request )
        {
            Gate::authorize('delete', $team);

            $validated = $request->validate([
                'path' => 'required|string'
            ]);

            // Rebuild the team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $team->id),
            'visibility' => 'public'
        ]);

        // Check if the file exists in storage
        if (!$disk->exists($validated['path'])) {
            return response()->json(['error' => 'File not found'], 404);
        }

        try {
            $deleted = $disk->delete($validated['path']);

            if (!$deleted) {
                Log::error("File deletion failed: {$validated['path']}");
                return response()->json(['error' => 'File could not be deleted'], 500);
            }

            Log::info("File deleted: {$validated['path']} by user " . auth()->id());

            return response()->json([
                'message' => 'File deleted successfully',
                'deleted_path' => $validated['path']
            ]);

        } catch (\Exception $e) {
            Log::error("Error deleting file: {$e->getMessage()}");
            return response()->json(['error' => 'Server error while deleting file'], 500);
        }
    }

    public function createFileWithGemini(Request $request, Team $team)
{
    Gate::authorize('create', Team::class);

    $validated = $request->validate([
        'filename' => 'required|string',
        'path' => 'required|string',
        'prompt' => 'required|string',
    ]);

    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $team->id),
        'visibility' => 'public'
    ]);

    $content = sendtogemini($validated['prompt']);

    $targetPath = ltrim($validated['path'], '/') . '/' . $validated['filename'];

    $disk->put($targetPath, $content);

    return response()->json(['message' => 'File created successfully', 'path' => $targetPath]);
}

public function editFileWithGemini(Request $request, Team $team)
{
    Gate::authorize('update', Team::class);

    $validated = $request->validate([
        'filename' => 'required|string',
        'path' => 'required|string',
        'prompt' => 'required|string',
    ]);

    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $team->id),
        'visibility' => 'public'
    ]);

    $targetPath = ltrim($validated['path'], '/') . '/' . $validated['filename'];

    if (!$disk->exists($targetPath)) {
        return response()->json(['error' => 'File not found'], 404);
    }

    $existingContent = $disk->get($targetPath);

    // Send request to Gemini with both the content and the prompt
    $newContent = $this->sendtogemini($validated['prompt'], $existingContent);

    if (is_array($newContent)) {
        return response()->json($newContent, 500); // If Gemini returns an error
    }

    $disk->put($targetPath, $newContent);

    return response()->json(['message' => 'File updated successfully', 'path' => $targetPath]);
}

public function sendtogemini($prompt, $content = null)
{
    // Prepare the message for Gemini
    $inputText = $content ? "Modify the following content:\n\n" . $content . "\n\nInstructions: " . $prompt : $prompt;

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

        // Check for errors or missing responses
        if ($response->failed() || !isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
            return response()->json(['error' => 'Failed to retrieve response from Gemini'], 500);
        }

        return $responseData['candidates'][0]['content']['parts'][0]['text'];
    } catch (\Exception $e) {
        return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
    }
}

public function getFileUrl(Request $request, Team $team)
{
    Gate::authorize('view', $team);

    $validated = $request->validate([
        'filename' => 'required|string',
        'path' => 'required|string',
    ]);

    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $team->id),
        'visibility' => 'public'
    ]);

    $targetPath = ltrim($validated['path'], '/') . '/' . $validated['filename'];

    if (!$disk->exists($targetPath)) {
        return response()->json(['error' => 'File not found'], 404);
    }

    // Generate the public URL
    $url = asset("storage/teams/{$team->id}/" . $targetPath);

    return response()->json(['url' => $url]);
}

}
