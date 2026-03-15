<?php

use App\Models\User;

it('can create a user using the factory', function () {
    $user = User::factory()->create();

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->id)->toBeGreaterThan(0);
});

it('can create multiple users', function () {
    User::factory(5)->create();

    expect(User::count())->toBe(5);
});

it('hashes the password', function () {
    $user = User::factory()->create(['password' => 'secret123']);

    expect($user->password)->not->toBe('secret123');
});

it('has fillable attributes', function () {
    $user = User::factory()->create([
        'name'   => 'John Doe',
        'email'  => 'john@example.com',
        'job'    => 'Developer',
        'phone'  => '1234567890',
        'gender' => 'Male',
    ]);

    expect($user->name)->toBe('John Doe')
        ->and($user->email)->toBe('john@example.com')
        ->and($user->job)->toBe('Developer')
        ->and($user->phone)->toBe('1234567890')
        ->and($user->gender)->toBe('Male');
});

it('can belong to many teams', function () {
    $user = User::factory()->create();

    expect($user->teams())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class);
});
