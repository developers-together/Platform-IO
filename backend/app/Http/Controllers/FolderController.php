<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\Request;

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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|regex:/^[a-zA-Z0-9-_ ]+$/',
            'path' => 'nullable|string'
        ]);
    
        // Build team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $team->id),
        ]);
    
        // Sanitize and prepare paths
        $folderName = trim($validated['name']);
        $basePath = isset($validated['path']) ? 
            str_replace(['..', '//'], '', trim($validated['path'], '/')) : 
            '';
        
        $fullPath = implode('/', array_filter([$basePath, $folderName]));
    
        try {
            // Check if folder already exists
            if ($disk->exists($fullPath) && $disk->getMetadata($fullPath)['type'] === 'dir') {
                return response()->json([
                    'error' => 'Folder already exists at this location'
                ], 409);
            }
    
            // Create directory and parent directories if needed
            $created = $disk->makeDirectory($fullPath);
    
            if (!$created) {
                throw new \Exception("Failed to create directory");
            }
    
            // Store folder record in database
            $folder = Folder::create([
                'name' => $folderName,
                'path' => $fullPath,
                'team_id' => $team->id,
                'user_id' => auth()->id(),
            ]);
    
            return response()->json([
                'success' => 'Folder created successfully',
                'folder' => $folder,
                'path' => $fullPath
            ]);
    
        } catch (\Exception $e) {
            Log::error("Folder creation failed: {$e->getMessage()}");
            return response()->json([
                'error' => 'Folder creation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Folder $folder)
    {
           // Get requested path from query parameter
    $path = $request->query('path', '');

    // Build team-specific storage
    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $team->id),
    ]);

    // Sanitize path input
    $cleanPath = str_replace(['..', '//'], '', trim($path, '/'));

    try {
        // Verify directory exists
        if ($cleanPath !== '' && !$disk->exists($cleanPath)) {
            return response()->json(['error' => 'Directory not found'], 404);
        }

        // Get directory contents
        $contents = collect($disk->listContents($cleanPath, false))
            ->map(function ($item) use ($disk) {
                return [
                    'name' => basename($item['path']),
                    'path' => $item['path'],
                    'type' => $item['type'],
                    'size' => $item['type'] === 'file' ? $item['size'] : null,
                    'last_modified' => date('Y-m-d H:i:s', $item['timestamp']),
                    'mime_type' => $item['type'] === 'file' ? $disk->mimeType($item['path']) : null,
                ];
            });

        return response()->json([
            'path' => $cleanPath ?: '/',
            'contents' => $contents,
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to retrieve contents: ' . $e->getMessage()
        ], 500);
    }
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
        $validated = $request->validate([
            'new_name' => 'required|string|max:255|regex:/^[a-zA-Z0-9-_ ]+$/',
        ]);
    
        // Get path components
        $currentPath = $folder->path;
        $parentDirectory = pathinfo($currentPath, PATHINFO_DIRNAME);
        $newPath = ($parentDirectory !== '.' ? $parentDirectory . '/' : '') . $validated['new_name'];
    
        // Build team-specific disk
        $disk = Storage::build([
            'driver' => 'local',
            'root' => storage_path('app/public/teams/' . $folder->team_id),
        ]);
    
        // Check for existing directory
        if ($disk->exists($newPath)) {
            return response()->json(['error' => 'Directory name already exists'], 409);
        }
    
        try {
            // Storage directory rename (create new, move contents, delete old)
            $disk->makeDirectory($newPath);
            
            foreach ($disk->allFiles($currentPath) as $file) {
                $newFilePath = str_replace($currentPath, $newPath, $file);
                $disk->move($file, $newFilePath);
            }
            
            $disk->deleteDirectory($currentPath);
    
            // Update database records
            DB::transaction(function () use ($folder, $currentPath, $newPath) {
                // Update the folder itself
                $folder->update([
                    'name' => $validated['new_name'],
                    'path' => $newPath
                ]);
    
                // Update all nested files
                File::where('team_id', $folder->team_id)
                    ->where('path', 'like', $currentPath . '/%')
                    ->update([
                        'path' => DB::raw("REPLACE(path, '" . $currentPath . "', '" . $newPath . "')")
                    ]);
    
                // Update all nested folders
                Folder::where('team_id', $folder->team_id)
                    ->where('path', 'like', $currentPath . '/%')
                    ->update([
                        'path' => DB::raw("REPLACE(path, '" . $currentPath . "', '" . $newPath . "')")
                    ]);
            });
    
            return response()->json([
                'success' => 'Directory renamed successfully',
                'new_path' => $newPath
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Directory rename failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Folder $folder)
    {
        
    $path = $request->validate(['path' => 'required|string'])['path'];

    // Build team-specific storage
    $disk = Storage::build([
        'driver' => 'local',
        'root' => storage_path('app/public/teams/' . $team->id),
    ]);

    // Sanitize path and get absolute system path
    $cleanPath = str_replace(['..', '//'], '', trim($path, '/'));

    try {
        // Verify item exists
        if (!$disk->exists($cleanPath)) {
            return response()->json(['error' => 'Path not found'], 404);
        }

        // Determine if it's a file or directory
        $isDirectory = $disk->getMetadata($cleanPath)['type'] === 'dir';

        // Perform deletion
        if ($isDirectory) {
            $disk->deleteDirectory($cleanPath);
        } else {
            $disk->delete($cleanPath);
        }

        return response()->json([
            'success' => true,
            'message' => $isDirectory ? 'Directory deleted' : 'File deleted',
            'deleted_path' => $cleanPath
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Deletion failed: ' . $e->getMessage()
        ], 500);
    }
    }
}
