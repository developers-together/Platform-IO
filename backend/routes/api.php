<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user/show', [UserController::class, 'show']);
    Route::delete('/user/delete', [UserController::class, 'delete']);
    Route::post('user/logout', [UserController::class, 'logout']);
    Route::get('/user/teams', [UserController::class, 'teams']);

    Route::get('/tasks/{team}/index', [TaskController::class, 'index']);
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
    Route::get('/chats/{chat}/getMessages', [MessageController::class, 'getMessages']);
    Route::delete('chats/{message}/deleteMessage', [MessageController::class, 'destroy']);


    Route::post('/team/create',[TeamController::class,'store']);
    Route::get('/team/{team}/show',[TeamController::class,'show']);
    Route::put('/team/{team}/update',[TeamController::class,'update']);
    Route::delete('/team/{team}/delete',[TeamController::class,'destroy']);
    Route::delete('/team/{team}/leave', [TeamController::class,'leaveTeam']);
//t
    Route::post('/team/{team}/addmembers',[TeamController::class,'addMembers']);
    Route::put('/team/{team}/changeroles',[TeamController::class,'changeRoles']);
    Route::put('/team/{team}/changeleader',[TeamController::class,'changeLeader']);
    Route::delete('/team/{team}/removemembers',[TeamController::class,'removeMembers']);
    Route::post('/team/joinTeam', [TeamController::class, 'joinTeam']);

});

Route::post('/register', [UserController::class, 'store']);

Route::post('/login', [AuthController::class, 'login'])->name('login');
