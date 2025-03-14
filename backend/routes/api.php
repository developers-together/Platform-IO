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

    Route::get('/user/{user}', [UserController::class, 'show']);
    
    Route::put('/user/{user}', [UserController::class, 'update']);
    Route::patch('/user/{user}', [UserController::class, 'update']);
    Route::delete('/user/{user}', [UserController::class, 'destroy']);


    Route::get('/tasks/index', [TaskController::class, 'index']);
    Route::post('/tasks/store', [TaskController::class, 'store'])->name('tasks.store');
    Route::delete('/tasks/destroy', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::put('/tasks', [TaskController::class, 'update'])->name('tasks.update');

    Route::post('/chats', [ChatController::class, 'create']);
    Route::post('/chats/join', [ChatController::class, 'joinChat']);
    Route::post('/messages', [MessageController::class, 'sendMessage']);
    Route::get('/messages/{groupId}', [MessageController::class, 'getMessages']);

   
    Route::post('/team/create',[TeamController::class,'store']);
    Route::get('/team/{team}/show',[TeamController::class,'show']);
    Route::put('/team/{team}/update',[TeamController::class,'update']);
    Route::delete('/team/{team}/delete',[TeamController::class,'destroy']);

    Route::post('/team/{team}/addmembers',[TeamController::class,'addMembers']);
    Route::put('/team/{team}/changeroles',[TeamController::class,'changeRoles']);
    Route::put('/team/{team}/changeleader',[TeamController::class,'changeLeader']);
    Route::delete('/team/{team}/removemembers',[TeamController::class,'removeMembers']);

});




Route::get('/user', [UserController::class, 'index']);

Route::post('/user', [UserController::class, 'store']);

Route::get('/team',[TeamController::class,'index']);

Route::post('/login', [AuthController::class, 'login'])->name('login');



