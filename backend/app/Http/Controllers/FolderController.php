<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\Request;
use App\Models\Team;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;


class FolderController extends Controller
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
        // Authorization check
        $this->authorize('create', [Folder::class, $team]);
    
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9-_ \p{L}]+$/u', // Allow Unicode characters
                function ($attribute, $value, $fail) {
                    $trimmed = trim($value);
                    if ($trimmed === '') {
                        $fail('Folder name cannot be empty.');
                    }
                    if (Str::endsWith($trimmed, ['.', ' '])) {
                        $fail('Folder name cannot end with a dot or space.');
                    }
                }
            ],
            'path' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if (Str::contains($value, ['../', '..'])) {
                        $fail('Invalid path format.');
                    }
                }
            ]
        ]);
    
        // Build team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/'.$team->id),
            'throw' => true, // Throw exceptions on errors
        ]);
    
        // Sanitize and prepare paths
        $folderName = trim($validated['name']);
        $basePath = isset($validated['path']) ? 
            str_replace(['../', '..'], '', trim($validated['path'], '/')) : 
            '';
    
        $fullPath = implode('/', array_filter([$basePath, $folderName]));
    
        try {
            // Check for existing directory
            if ($disk->directoryExists($fullPath)) {
                return response()->json([
                    'error' => 'Folder already exists at this location'
                ], 409);
            }
    
            // Create directory with parent directories
            $disk->makeDirectory($fullPath);
    
            // Create folder record
            $folder = Folder::create([
                'name' => $folderName,
                'path' => $fullPath,
                'team_id' => $team->id,
                'user_id' => auth()->id(),
                'uuid' => Str::uuid(), // Add unique identifier
            ]);
    
            // Set proper permissions
            $disk->setVisibility($fullPath, 'public');
    
            return response()->json([
                'message' => 'Folder created successfully',
                'data' => $folder,
                'links' => [
                    'self' => route('folders.show', [$team, $folder])
                ]
            ], 201);
    
        } catch (\Exception $e) {
            Log::error('Folder creation failed', [
                'team' => $team->id,
                'user' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Folder creation failed',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Folder $folder)
    {
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $folder->team_id),
            'visibility' => 'public'
        ]);
        if (!$disk->exists($folder->path)) {
            abort(404, 'Folder not found');
        }
        return response()->json([
            'success' => true,
            'folder' => $folder,
            'files' => $disk->allFiles($folder->path)
        ]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Folder $folder)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Folder $folder)
{
    // Authorization check
    $this->authorize('update', $folder);

}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Folder $folder)
    {
        $this->authorize('delete', $folder);

        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $folder->team_id),
        ]);

        try {
            // Delete the directory on the file system
            $disk->deleteDirectory($folder->path);

            // Soft delete the folder from the database
            $folder->delete();

            // Return a successful response with the deleted folder data (optional)
            return response()->json([
                'message' => 'Folder deleted successfully',
                'data' => $folder,
            ]);

        } catch (\Exception $e) {
            // Handle errors, e.g., log them or return an error message
            return response()->json(['error' => 'Failed to delete folder'], 500);
        }
    }
}
