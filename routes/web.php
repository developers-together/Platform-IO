<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\UserController;

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
Route::redirect('/home', '/dashboard');

Route::middleware('guest')->group(function () {
    Route::get('/login', fn (Request $request) => Inertia::render('auth/Login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'canRegister' => Features::enabled(Features::registration()),
        'status' => $request->session()->get('status'),
    ]))->name('login');

    Route::get('/register', fn () => Inertia::render('auth/Register'))->name('register');

    Route::get('/forgot-password', fn (Request $request) => Inertia::render('auth/ForgotPassword', [
        'status' => $request->session()->get('status'),
    ]))->name('password.request');

    Route::get('/reset-password/{token}', fn (Request $request, string $token) => Inertia::render('auth/ResetPassword', [
        'email' => $request->string('email')->toString(),
        'token' => $token,
    ]))->name('password.reset');

    Route::get('/two-factor-challenge', fn () => Inertia::render('auth/TwoFactorChallenge'))
        ->name('two-factor.login');
});

Route::middleware('auth')->group(function () {
    Route::get('/email/verify', fn (Request $request) => Inertia::render('auth/VerifyEmail', [
        'status' => $request->session()->get('status'),
    ]))->name('verification.notice');

    Route::get('/user/confirm-password', fn () => Inertia::render('auth/ConfirmPassword'))
        ->name('password.confirm');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/dashboard', 'Dashboard')->name('dashboard');
    Route::inertia('/workspace/teams', 'workspace/Teams')->name('workspace.teams');
    Route::inertia('/workspace/tasks', 'workspace/Tasks')->name('workspace.tasks');
    Route::inertia('/workspace/calendar', 'workspace/Calendar')->name('workspace.calendar');
    Route::inertia('/workspace/chat', 'workspace/Chat')->name('workspace.chat');
    Route::inertia('/workspace/files', 'workspace/Files')->name('workspace.files');
    Route::inertia('/workspace/ai', 'workspace/Ai')->name('workspace.ai');
    Route::redirect('/workspace', '/workspace/chat');
});

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
