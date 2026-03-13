<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        $contacts = Contact::where('user_id',$user->id);

        return Inertia::render('/users/{user}/contacts',[
            'contacts' => $contacts
        ]);
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
        $user = Auth::user();

        $validated = $request->valideate([
            'contacts' => 'array'
        ]);

        foreach($validated['contacts'] as $contact){
            Contact::create([
                'user_id' => $user->id,
                'contact' => $contact
            ]);

        }

        return Inertia::render('users/{$user}/profile');

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
    public function update(Request $request, Contact $contact)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'contact' => 'string'
        ]);

        if($contact->user_id == $user->id){
            $contact->contact = $validated['contact'];
            $contact->save();
        }

        return Inertia::render('users/{$user}/profile');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contact $contact)
    {
        $user = Auth::user();
        if($contact->user_id == $user->id){
            $contact->delete();
        }

        return Inertia::render('/users/{$user}/profile');
    }
}
