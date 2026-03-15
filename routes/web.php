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
| These routes render Svelte pages via Inertia. Each entry maps a URL
| to a component under resources/js/pages/.
|
*/

// Landing / Welcome page (public)
Route::inertia('/', 'Welcome')->name('home');

// Authenticated page routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/dashboard', 'Dashboard')->name('dashboard');

    // Workspace pages
    Route::inertia('/workspace/teams', 'workspace/Teams')->name('workspace.teams');
    Route::inertia('/workspace/tasks', 'workspace/Tasks')->name('workspace.tasks');
    Route::inertia('/workspace/calendar', 'workspace/Calendar')->name('workspace.calendar');
    Route::inertia('/workspace/chat', 'workspace/Chat')->name('workspace.chat');
    Route::inertia('/workspace/files', 'workspace/Files')->name('workspace.files');
    Route::inertia('/workspace/ai', 'workspace/Ai')->name('workspace.ai');
});

// Legacy redirect
Route::redirect('/home', '/dashboard');

/*
|--------------------------------------------------------------------------
| Backend API Routes (Web)
|--------------------------------------------------------------------------
|
| These routes handle data operations and are called by the Svelte frontend.
| They use the web middleware stack (session/cookie auth).
|
*/

// User routes
Route::delete('/user/delete', [UserController::class, 'delete']);
Route::post('user/logout', [UserController::class, 'logout']);
Route::get('/user/teams', [UserController::class, 'teams']);
Route::post('user/store', [UserController::class, 'store']);

// Team routes
Route::post('/team/store', [TeamController::class, 'store']);
Route::get('/team/{team}/show', [TeamController::class, 'show']);
Route::put('/team/{team}/update', [TeamController::class, 'update']);
Route::delete('/team/{team}/delete', [TeamController::class, 'destroy']);
Route::delete('/team/{team}/leave', [TeamController::class, 'leaveTeam']);
Route::get('/teams/getTeamById/{id}', [TeamController::class, 'getTeamById']);
Route::post('/team/{team}/addmembers', [TeamController::class, 'addMembers']);
Route::put('/team/{team}/changeroles', [TeamController::class, 'changeRoles']);
Route::put('/team/{team}/changeAdmin', [TeamController::class, 'changeAdmin']);
Route::delete('/team/{team}/removemembers', [TeamController::class, 'removeMembers']);
Route::get('/joinTeam/{team}', [TeamController::class, 'joinTeam']);
Route::get('/team/{team}/joinLink', [TeamController::class, 'generateURL']);

// Task routes
Route::get('/tasks/{team}/index', [TaskController::class, 'index']);
Route::get('/tasks/{team}/suggestions', [TaskController::class, 'sendtogemini']);
Route::get('/tasks/{task}/show', [TaskController::class, 'show']);
Route::post('/tasks/{team}/store', [TaskController::class, 'store'])->name('tasks.store');
Route::delete('/tasks/{task}/delete', [TaskController::class, 'destroy'])->name('tasks.destroy');
Route::put('/tasks/{task}/update', [TaskController::class, 'update'])->name('tasks.update');

// Chat routes
Route::get('/chats/{team}/index', [ChatController::class, 'index']);
Route::get('/chats/{chat}/show', [ChatController::class, 'show']);
Route::post('/chats/{team}/store', [ChatController::class, 'store']);
Route::delete('/chats/{chat}', [ChatController::class, 'destroy']);
Route::put('/chats/{chat}', [ChatController::class, 'update']);

// Message routes
Route::post('/chats/{chat}/sendMessages', [MessageController::class, 'sendMessage']);
Route::post('/chats/{chat}/ask', [MessageController::class, 'askgemini']);
Route::get('/chats/{chat}/getMessages', [MessageController::class, 'getMessages']);
Route::delete('chats/{message}/deleteMessage', [MessageController::class, 'destroy']);

// AI Chat routes
Route::get('/ai_chats/{team}/index', [Ai_chatController::class, 'index']);
Route::get('/ai_chats/{ai_chat}/show', [Ai_chatController::class, 'show']);
Route::post('/ai_chats/{team}/store', [Ai_chatController::class, 'store']);
Route::delete('/ai_chats/{ai_chat}', [Ai_chatController::class, 'destroy']);
Route::put('/ai_chats/{ai_chat}/update', [Ai_chatController::class, 'update']);

// AI Message routes
Route::post('/ai_chats/{chat}/send', [Ai_messagesController::class, 'sendPrompt']);
Route::get('/ai_chats/{chat}/history', [Ai_messagesController::class, 'getHistory']);
Route::post('/ai_chats/{chat}/websearch', [Ai_messagesController::class, 'websearch']);
