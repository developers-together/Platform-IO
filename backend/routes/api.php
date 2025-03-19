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
use App\Http\Controllers\SftpController;
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\FileController;


// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user/show', [UserController::class, 'show']);
    Route::delete('/user/delete', [UserController::class, 'delete']);
    Route::post('user/logout', [UserController::class, 'logout']);
    Route::get('/user/teams', [UserController::class, 'teams']);

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


    Route::post('/team/create',[TeamController::class,'store']);
    Route::get('/team/{team}/show',[TeamController::class,'show']);
    Route::put('/team/{team}/update',[TeamController::class,'update']);
    Route::delete('/team/{team}/delete',[TeamController::class,'destroy']);
    Route::delete('/team/{team}/leave', [TeamController::class,'leaveTeam']);
    Route::get('/teams/getTeamById/{id}', [TeamController::class, 'getTeamById']);



    Route::post('/team/{team}/addmembers',[TeamController::class,'addMembers']);
    Route::put('/team/{team}/changeroles',[TeamController::class,'changeRoles']);
    Route::put('/team/{team}/changeleader',[TeamController::class,'changeLeader']);
    Route::delete('/team/{team}/removemembers',[TeamController::class,'removeMembers']);
    Route::post('/team/joinTeam', [TeamController::class, 'joinTeam']);

    Route::get('/ai_chats/{team}/index', [Ai_chatController::class, 'index']);
    Route::get('/ai_chats/{ai_chat}/show', [Ai_chatController::class, 'show']);
    Route::post('/ai_chats/{team}/store', [Ai_chatController::class, 'store']);
    Route::delete('/ai_chats/{ai_chat}', [Ai_chatController::class, 'destroy']);
    Route::put('/ai_chats/{ai_chat}/update', [Ai_chatController::class, 'update']);

    Route::post('/ai_chats/{chat}/send', [Ai_messagesController::class, 'sendPrompt']);
    Route::get('/ai_chats/{chat}/history', [Ai_messagesController::class, 'getHistory']);
    Route::post('/ai_chats/{chat}/search', [Ai_messagesController::class, 'websearch']);

    // Route::get('/files/{team}/index', [FileController::class, 'index']);
    Route::get('/files/{team}/show', [FileController::class, 'show']);
    Route::post('/files/{team}/store', [FileController::class, 'store']);
    Route::delete('/files/{team}/delete', [FileController::class, 'destroy']);
    Route::put('/files/{team}', [FileController::class, 'update']);
    Route::get('/files/{team}/download', [FileController::class, 'download']);
    Route::put('/files/{team}/aiedit', [FileController::class, 'editFileWithGemini']);
    Route::post('/files/{team}/aicreate', [FileController::class, 'createFileWithGemini']);

    Route::get('folders/{team}/index', [FolderController::class, 'index']);
    Route::get('/folders/{team}/show/', [FolderController::class, 'show']);
    Route::post('/folders/{team}/store', [FolderController::class, 'store']);
    Route::delete('/folders/{team}/delete', [FolderController::class, 'destroy']);
    Route::put('/folders/{team}/update', [FolderController::class, 'update']);


});

Route::post('/sftp/connect', [SftpController::class, 'connect']);
Route::post('/sftp/{team}/command', [SftpController::class, 'handleSftpCommand'])
    ->middleware(['signed', 'auth:sanctum', 'sftp']);

Route::post('/register', [UserController::class, 'store']);

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/gemini/chat', [GeminiController::class, 'chat']);

