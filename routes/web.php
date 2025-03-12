<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TaskController;

Route::get('/', function () {
    return view('welcome'); // or 'dashboard'
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';


Route::get('/tasks/index', [TaskController::class, 'index']);
Route::get('/tasks/json', [TaskController::class, 'getTasks']); // API for calendar
Route::post('/tasks/store', [TaskController::class, 'store'])->name('tasks.store');
Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
Route::put('/tasks/{id}', [TaskController::class, 'update'])->name('tasks.update');

Route::get('/event/index', [CalendarController::class, 'index']);
Route::get('/event/json', [CalendarController::class, 'getTasks']); // API for calendar
Route::post('/event/store', [CalendarController::class, 'store'])->name('event.store');
Route::delete('/event/{id}', [CalendarController::class, 'destroy'])->name('event.destroy');
Route::put('/event/{id}', [CalendarController::class, 'update'])->name('event.update');

