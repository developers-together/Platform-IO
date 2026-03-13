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





// Route::get('/user/show', [UserController::class, 'show']);
Route::delete('/user/delete', [UserController::class, 'delete']);
Route::post('user/logout', [UserController::class, 'logout']);
Route::get('/user/teams', [UserController::class, 'teams']);
Route::post('user/store', [UserController::class, 'store']);
// Route::get('user/{user}/profile',UserController::class,'profile');
// Route::post('user/{user}/update',UserController::class,'update');
// Route::post('/login', [AuthController::class, 'login'])->name('login');


Route::post('/team/store',[TeamController::class,'store']);
Route::get('/team/{team}/show',[TeamController::class,'show']);
Route::put('/team/{team}/update',[TeamController::class,'update']);
Route::delete('/team/{team}/delete',[TeamController::class,'destroy']);
Route::delete('/team/{team}/leave', [TeamController::class,'leaveTeam']);
Route::get('/teams/getTeamById/{id}', [TeamController::class, 'getTeamById']);
Route::post('/team/{team}/addmembers',[TeamController::class,'addMembers']);
Route::put('/team/{team}/changeroles',[TeamController::class,'changeRoles']);
Route::put('/team/{team}/changeAdmin',[TeamController::class,'changeAdmin']);
Route::delete('/team/{team}/removemembers',[TeamController::class,'removeMembers']);
// Route::post('/team/joinTeam', [TeamController::class, 'joinTeam']);
Route::get('/joinTeam/{team}', [TeamController::class,'joinTeam']);
Route::get('/team/{team}/joinLink',[TeamController::class,'generateURL']);


Route::get('/tasks/{team}/index', [TaskController::class, 'index']);
Route::get('/tasks/{team}/suggestions', [TaskController::class, 'sendtogemini']);
Route::get('/tasks/{task}/show', [TaskController::class, 'show']);
Route::post('/tasks/{team}/store', [TaskController::class, 'store'])->name('tasks.store');
Route::delete('/tasks/{task}/delete',[TaskController::class, 'destroy'])->name('tasks.destroy');
Route::put('/tasks/{task}/update', [TaskController::class, 'update'])->name('tasks.update');

Route::get('/chats/{team}/index', [ChatController::class, 'index']);
Route::get('/chats/{chat}/show', [ChatController::class, 'show']);
Route::post('/chats/{team}/store', [ChatController::class, 'store']);
Route::delete('/chats/{chat}', [ChatController::class, 'destroy']);
Route::put('/chats/{chat}', [ChatController::class, 'update']);

Route::post('/chats/{chat}/sendMessages', [MessageController::class, 'sendMessage']);
Route::post('/chats/{chat}/ask', [MessageController::class, 'askgemini']);
Route::get('/chats/{chat}/getMessages', [MessageController::class, 'getMessages']);
Route::delete('chats/{message}/deleteMessage', [MessageController::class, 'destroy']);



Route::get('/ai_chats/{team}/index', [Ai_chatController::class, 'index']);
Route::get('/ai_chats/{ai_chat}/show', [Ai_chatController::class, 'show']);
Route::post('/ai_chats/{team}/store', [Ai_chatController::class, 'store']);
Route::delete('/ai_chats/{ai_chat}', [Ai_chatController::class, 'destroy']);
Route::put('/ai_chats/{ai_chat}/update', [Ai_chatController::class, 'update']);

Route::post('/ai_chats/{chat}/send', [Ai_messagesController::class, 'sendPrompt']);
Route::get('/ai_chats/{chat}/history', [Ai_messagesController::class, 'getHistory']);
Route::post('/ai_chats/{chat}/websearch', [Ai_messagesController::class, 'websearch']);





