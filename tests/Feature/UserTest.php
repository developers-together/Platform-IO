<?php

use App\Models\User;
use App\Models\Team;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Authentication (Fortify)
|--------------------------------------------------------------------------
*/

it('shows the login page to guests', function () {
    $this->get('/login')->assertOk();
});

it('shows the register page to guests', function () {
    $this->get('/register')->assertOk();
});

it('can register a new user', function () {
    $response = $this->post('/register', [
        'name'                  => 'Jane Doe',
        'email'                 => 'jane@example.com',
        'password'              => 'Password123!',
        'password_confirmation' => 'Password123!',
        'timezone'              => 'UTC',
    ]);

    $response->assertRedirect('/dashboard');
    expect(User::where('email', 'jane@example.com')->exists())->toBeTrue();
});

it('can register a new user with a profile picture', function () {
    Storage::fake('public');

    $response = $this->post('/register', [
        'name'                  => 'Jane Doe',
        'email'                 => 'jane@example.com',
        'password'              => 'Password123!',
        'password_confirmation' => 'Password123!',
        'timezone'              => 'UTC',
        'profile'               => UploadedFile::fake()->image('avatar.jpg'),
    ]);

    $response->assertRedirect('/dashboard');

    $user = User::where('email', 'jane@example.com')->first();
    expect($user->profile)->not->toBeNull();
    Storage::disk('public')->assertExists($user->profile);
});

it('can log in with valid credentials', function () {
    $user = User::factory()->create(['password' => 'secret123']);

    $response = $this->post('/login', [
        'email'    => $user->email,
        'password' => 'secret123',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
});

it('cannot log in with wrong password', function () {
    $user = User::factory()->create(['password' => 'secret123']);

    $this->post('/login', [
        'email'    => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

it('can log out', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/');

    $this->assertGuest();
});

/*
|--------------------------------------------------------------------------
| Guest access is blocked
|--------------------------------------------------------------------------
*/

it('redirects guests away from user profile', function () {
    $this->get('/user/profile')->assertStatus(302);
});

it('redirects guests away from user teams', function () {
    $this->get('/user/teams')->assertStatus(302);
});

/*
|--------------------------------------------------------------------------
| User Profile
|--------------------------------------------------------------------------
*/

it('can view own profile', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->get('/user/profile');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/show')
            ->has('user_data')
            ->has('contacts')
        );
});

it('can view another user profile', function () {
    $user  = User::factory()->create();
    $other = User::factory()->create(['name' => 'Other User']);

    $response = $this->actingAs($user)
        ->get("/user/{$other->id}/show");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('profile/show')
            ->where('user_data.name', 'Other User')
        );
});

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

it('can update user profile', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->put("/user/{$user->id}/update", [
            'name'  => 'Updated Name',
            'email' => 'updated@example.com',
            'phone' => '9876543210',
        ]);

    $response->assertRedirect();

    $user->refresh();
    expect($user->name)->toBe('Updated Name')
        ->and($user->email)->toBe('updated@example.com')
        ->and($user->phone)->toBe('9876543210');
});

it('can update user profile with a new profile picture', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->put("/user/{$user->id}/update", [
            'name'    => $user->name,
            'email'   => $user->email,
            'profile' => UploadedFile::fake()->image('new-avatar.png'),
        ]);

    $response->assertRedirect();

    $user->refresh();
    expect($user->profile)->not->toBeNull();
    Storage::disk('public')->assertExists($user->profile);
});

/*
|--------------------------------------------------------------------------
| User Teams
|--------------------------------------------------------------------------
*/

it('can list user teams', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $user->teams()->attach($team->id, ['role' => 'admin', 'profile' => 'member']);

    $response = $this->actingAs($user)
        ->get('/user/teams');

    $response->assertOk();
});

/*
|--------------------------------------------------------------------------
| Delete Account
|--------------------------------------------------------------------------
*/

it('can delete own account', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->delete('/user/delete');

    $response->assertOk();
    expect(User::find($user->id))->toBeNull();
});
