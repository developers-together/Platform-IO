<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GeminiService;
use Carbon\Carbon;

class GeminiController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    public function chat(Request $request)
    {
        $query = $request->input('query');

        // Get today's date
        $currentDate = Carbon::now()->format('l, F j, Y');

        // Append the date to the query
        $query .= "\n(Today's date is: $currentDate)";

        // Send request to Gemini
        $response = $this->geminiService->sendRequest($query);

        return response()->json($response);
    }
}
