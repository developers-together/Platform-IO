---
description: How to write backend feature tests for a Laravel module
---

# Writing Backend Feature Tests

Write Pest feature tests that thoroughly cover a module's backend logic. Focus on what matters: models, relationships, policies, and data integrity. Skip frontend/Inertia assertions entirely.

## 1. Understand the Module

Before writing any test, read these files for the module under test:

- **Model** (`app/Models/`) — `$fillable`, `$casts`, relationships, traits
- **Migration** (`database/migrations/`) — column types, constraints, NOT NULL fields, foreign keys, cascade rules
- **Factory** (`database/factories/`) — ensure all NOT NULL columns are covered (especially `timezone` on users, `profile` on `team_user` pivot)
- **Policy** (`app/Policies/`) — who can do what (owner-only vs member vs any user)
- **Controller** (`app/Http/Controllers/`) — public methods, validation rules, business logic

## 2. Test Structure

Place tests in `tests/Feature/{ModuleName}Test.php`. Group tests into sections using block comments:

```
Model & Factory → Relationships → Data Integrity → Policy Authorization
```

## 3. What to Test

### Model & Factory
- Factory creates a valid record
- Factory creates multiple records
- Fillable attributes are set correctly with explicit values

### Relationships
- Each relationship method returns the correct type (`BelongsTo`, `HasMany`, `BelongsToMany`, etc.)
- Attaching/detaching related records works with pivot data
- Multiple related records with different pivot values (e.g. roles)

### Data Integrity
- Cascade deletes propagate correctly (note: SQLite doesn't enforce FK cascades — only test the parent deletion, add a comment about MariaDB handling pivot cleanup)
- Deleting a related record cleans up from the other side if cascade is defined

### Policy Authorization
For **every** policy method, write two tests:
- **Allowed**: the authorized role (usually `owner`) can perform the action
- **Denied**: an unauthorized role (`member`, `admin`, or non-member) is rejected

Test policies **directly** by instantiating the Policy class:

```php
$policy = new SomePolicy();
expect($policy->methodName($user, $model))->toBeTrue();
// or ->toBeFalse();
```

This avoids route/middleware dependencies and tests pure authorization logic.

### What to Skip
- **Trivial getters/setters** — Don't test that `$model->name` returns a string
- **Framework behavior** — Don't test that `->create()` returns a model or that timestamps exist
- **Frontend/Inertia responses** — No `assertInertia`, no component assertions
- **Validation rules** — Only test if the validation has non-obvious custom logic
- **Route existence** — Tests should not depend on routes being registered

## 4. Common Pitfalls

### NOT NULL columns
The `UserFactory` must include **every** NOT NULL column from the migration. Check for:
- `timezone` on `users`
- `profile` on `team_user` pivot (always pass `'profile' => ''` when attaching)

### Pivot attach calls
Always include all required pivot fields:
```php
$team->users()->attach($user->id, ['role' => 'owner', 'profile' => '']);
```

### SQLite limitations
SQLite `:memory:` DB doesn't reliably enforce FK cascade deletes. Don't assert on pivot row cleanup — add a comment and only verify the parent record is deleted.

## 5. Template

```php
<?php

use App\Models\{Model};
use App\Models\User;
use App\Policies\{Model}Policy;

/*
|--------------------------------------------------------------------------
| Model & Factory
|--------------------------------------------------------------------------
*/

it('can create a {model} using the factory', function () {
    $record = {Model}::factory()->create();
    expect($record)->toBeInstanceOf({Model}::class)
        ->and($record->id)->toBeGreaterThan(0);
});

it('has fillable attributes', function () {
    $record = {Model}::factory()->create([/* explicit values */]);
    expect($record->field)->toBe('value');
});

/*
|--------------------------------------------------------------------------
| Relationships
|--------------------------------------------------------------------------
*/

it('belongs to / has many {related}', function () {
    $record = {Model}::factory()->create();
    expect($record->relatedMethod())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\{Type}::class);
});

/*
|--------------------------------------------------------------------------
| Policy
|--------------------------------------------------------------------------
*/

it('allows {role} to {action}', function () {
    $policy = new {Model}Policy();
    // setup user + model with correct role
    expect($policy->action($user, $model))->toBeTrue();
});

it('denies {role} from {action}', function () {
    $policy = new {Model}Policy();
    // setup user + model with wrong role
    expect($policy->action($user, $model))->toBeFalse();
});
```

## 6. Run & Verify

```bash
php artisan test --filter={Model}Test
```

All tests must pass. If a test fails due to SQLite FK limitations, add a comment and adjust the assertion — don't remove the test.
