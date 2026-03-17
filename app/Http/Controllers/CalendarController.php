<?php

namespace App\Http\Controllers;

// use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\Calendar;
use App\Models\Event;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;


class CalendarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('Calendar');

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(team $team)
    {
        //
        return Inertia::render('teams/{team}/calendar/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Team $team)
    {
        $validated = $request->validate([

            'name' => 'string',
            'color' => 'hex_color',

        ]);

        Calendar::create([
            'name' => $validated['name'],
            'color' => $validated['color']

        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
