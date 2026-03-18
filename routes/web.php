<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Ai_chatController;
use App\Http\Controllers\Ai_messagesController;

/*
|--------------------------------------------------------------------------
| Inertia Page Routes
|--------------------------------------------------------------------------
|
| Fortify automatically registers auth routes (login, register, logout,
| password reset, email verification, two-factor challenge).
| Views are configured in FortifyServiceProvider.
| Settings routes live in routes/settings.php.
|
*/

// Landing / Welcome page (public)
Route::inertia('/', 'Welcome')->name('home');

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    // View own profile
    Route::get('/user/profile', [UserController::class, 'profile'])->name('user.profile');

    // View another user's profile
    Route::get('/user/{user}/show', [UserController::class, 'show'])->name('user.show');

    // Update user profile
    Route::put('/user/{user}/update', [UserController::class, 'update'])->name('user.update');

    // Get current user's teams
    Route::get('/user/teams', [UserController::class, 'teams'])->name('user.teams');

    // Delete own account
    Route::delete('/user/delete', [UserController::class, 'delete'])->name('user.delete');
});
