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

        return Storage::download($validated['path']);
    
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
        
        // Rename the file on disk
        $newPath = $disk->move($validated['path'], $validated['new_name']);
        // Update the file name in the database
        // $file->name = $validated['new_name'];
        // $file->save();

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
        Gate::authorize('delete', $Team);

        $validated = $request->validate([
            'path' => 'required|string'
        ]);
        
         // Rebuild the team-specific disk
    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $team->id),
        'visibility' => 'public'
    ]);

    // Check if file exists in storage
    if ($disk->exists($validated['path'])) {
        // Delete the physical file
        $disk->delete($validated['path']);
    }
    

    $deletedFromStorage = false;
    $error = null;

    try {
        // Check if file exists in storage
        if ($disk->exists($file->path)) {
            // Delete the physical file
            $deletedFromStorage = $disk->delete($file->path);
            
            if (!$deletedFromStorage) {
                Log::error("File deletion failed for: {$file->path}");
                $error = 'File found but could not be deleted from storage';
            }
        }
    } catch (\Exception $e) {
        Log::error("Storage deletion error: {$e->getMessage()}");
        $error = 'Error deleting from storage: ' . $e->getMessage();
    }

    // Always delete the database record even if storage deletion fails
    // $file->delete();

    if ($error) {
        return response()->json([
            'warning' => 'Database record removed but storage cleanup failed',
            'error' => $error
        ], 202);
    }

    return response()->json([
        'success' => 'File and record deleted successfully',
        'deleted' => [
            'id' => $file->id,
            'name' => $file->name,
            'storage_success' => $deletedFromStorage
        ]
    ]);


    }
}
