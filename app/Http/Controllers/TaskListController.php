<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TaskListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Team $team)
    {
        Gate::authorize('viewAny',Auth::user(),$team);
        $lists = $team->taskLists()->get();

        return Inertia::render('/tasks',['lists'=>$lists]);

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
    public function store(Team $team, Request $request)
    {
        Gate::authorize('create', Auth::user(),$team);

        $validated = $request->validate([ 'title' => 'required|string|max:50']);

        TaskList::create(['title' => $validated['title'], 'team_id' => $team->id]);

        return back()->with(['success'=> 'tasklist created successfully']);
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskList $list)
    {
        Gate::authorize('view',Auth::user(),$list);

        return Inertia::render('tasklists/tasklist',['data' => $list]);
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
    public function update(Request $request, TaskList $list)
    {
        Gate::authorize('update', Auth::user(),$list);

        $validated = $request->validate(['title' => 'required|string|max:50']);

        $list->update(['title'=> $validated['title']]);

        return back()->with(['success'=>'tasklist title changed successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskList $list)
    {

        Gate::authorize('delete',Auth::user(),$list);
        $list->delete();

        return back()->with(['success'=> 'list deleted successfully']);


    }
}
