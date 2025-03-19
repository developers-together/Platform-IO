<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    public function sendRequest($query)
    {
        $apiKey = env('GEMINI_API_KEY');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey";

        $data = [
            "contents" => [
                [
                    "parts" => [
                        ["text" => $query]
                    ]
                ]
            ]
        ];

        $response = Http::post($url, $data);
        $responseBody = $response->json(); // Ensure it's assigned first

        // Log response safely
        Log::info('Gemini API Response:', ['response' => $responseBody]);

        if ($response->failed() || empty($responseBody)) {
            Log::error('Gemini API Error:', ['error' => $response->body()]); // Use body() for more details
            return ["error" => "Invalid response from Gemini API"];
        }

        return $responseBody;
    }
}
