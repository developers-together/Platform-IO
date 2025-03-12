<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Calendar;

class CalendarController extends Controller {

    public function index() {
        return view('event.index');
    }

    public function getEvent()
    {
        $event = Calendar::select('id', 'title', 'date')->get();
        return response()->json($event);
    }

    public function store(Request $request) {
        $request->validate(['title' => 'required', 'date' => 'required|date']);
        $event = Calendar::create($request->all());
        return response()->json(['success' => true, 'event' => $event]);
    }

    public function update(Request $request, $id) {
        $request->validate([
            'title' => 'required',
            'date' => 'required|date']);

        $event = Calendar::findOrFail($id);
        $event->update($request->all());
        return response()->json(['success' => true, 'event' => $event]);
    }

    public function destroy($id)
    {
        $event = Calendar::findOrFail($id);
        $event->delete();
        return response()->json(['success' => true]);
    }
}


