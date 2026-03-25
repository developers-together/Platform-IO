<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatPerm;
use App\Models\chat;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ChatPermController extends Controller
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Chat $chat)
    {
        Inertia::render('chat/chat',['data' => $chat]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Chat $chat)
    {
        Gate::authorize('update',Auth::user(), $chat);

        $validated = $request->validate([
            'write' => 'required|boolean',
            'read' => 'required|boolean',
            'modify'=> 'required|boolean',
            'notify'=> 'required|boolean',
            'delete' => 'required|boolean',
            'allow_ai' => 'required|boolean',

        ]);

        $chat->ChatPerm()->update([
            'write' => $validated['write'],
            'read' => $validated['read'],
            'modify' => $validated['modify'],
            'notify' => $validated['notify'],
            'delete' => $validated['delete'],
            'allow_ai' => $validated['allow_ai'],

        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
