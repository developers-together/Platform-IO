<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

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
        Gate::authorize('create', File::class);

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
        File::create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'user_id' => auth()->id(),
            'team_id' => $team->id, // Associate with the team
        ]);
    
        return response()->json($path);
    }

    /**
     * Display the specified resource.
     */
    public function show(File $file)
    {

        Gate::authorize('view', $file);
       
    // Rebuild the team-specific disk
    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $file->team_id),
        'visibility' => 'public'
    ]);

    // Verify file exists
    if (!$disk->exists($file->path)) {
        abort(404, 'File not found');
    }

    try {
        // Get file contents and metadata
        $content = $disk->get($file->path);
        $mimeType = $disk->mimeType($file->path);
        $fileSize = $disk->size($file->path);

        return response($content)
            ->header('Content-Type', $mimeType)
            ->header('Content-Length', $fileSize)
            ->header('Content-Disposition', 'inline; filename="' . $file->name . '"');

    } catch (\Exception $e) {
        Log::error("File content retrieval failed: {$e->getMessage()}");
        abort(500, 'Could not retrieve file content');
    }
    }

    public function download(File $file)
    {

        Gate::authorize('view', $file);


    
        // Rebuild the team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $file->team_id),
            'visibility' => 'public'
        ]);
    
        // Verify file exists in storage
        if (!$disk->exists($file->path)) {
            abort(404, 'File not found');
        }
    
        // Create download response with original filename
        return $disk->response(
            $file->path,
            $file->name, // Use original filename from database
            [
                'Content-Type' => $disk->mimeType($file->path),
                'Content-Disposition' => 'attachment; filename="' . $file->name . '"'
            ]
        );
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
    public function update(Request $request, File $file)
    {
        Gate::authorize('update', $file);

        $validated = $request->validate([
            'new_name' => 'required|string|max:255|regex:/^[a-zA-Z0-9-_ .]+$/',
        ]);
    
        // Get original extension
        $extension = pathinfo($file->name, PATHINFO_EXTENSION);
        $newName = pathinfo($validated['new_name'], PATHINFO_FILENAME);
        $newFileName = $newName . ($extension ? ".$extension" : '');
    
        // Get current path components
        $currentPath = $file->path;
        $directory = pathinfo($currentPath, PATHINFO_DIRNAME);
        $newPath = ($directory !== '.' ? $directory . '/' : '') . $newFileName;
    
        // Build the team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $file->team_id),
        ]);
    
        // Check for existing file
        if ($disk->exists($newPath)) {
            return response()->json(['error' => 'File name already exists'], 409);
        }
    
        try {
            // Perform storage rename
            $disk->move($currentPath, $newPath);
    
            // Update database record
            $file->update([
                'name' => $newFileName,
                'path' => $newPath
            ]);
    
            return response()->json([
                'success' => 'File renamed successfully',
                'new_path' => $newPath
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'File rename failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(File $file , Team $team)
    {
        Gate::authorize('delete', $file);

         // Rebuild the team-specific disk
    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $file->team_id),
        'visibility' => 'public'
    ]);

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
    $file->delete();

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
