---
description: How to write backend feature tests for a Laravel module
---

# Writing Backend Feature Tests

Write Pest feature tests that thoroughly cover a module's backend logic. Focus on what matters: models, relationships, policies, data integrity, and controller business logic. Skip frontend/Inertia assertions and route-level tests entirely.

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
Model & Factory → Relationships → Data Integrity → Policy Authorization → Controller Logic
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
For **every** policy method, test all authorization boundaries:
- **Allowed**: the authorized role can perform the action
- **Denied (wrong permission)**: a team member whose permissions don't grant access is rejected
- **Denied (non-member)**: a user who is **not on the team at all** is rejected, even if permissions (e.g. ChatPerm) would otherwise allow it

> **Why non-member tests matter**: If your policy checks both team membership AND a permission flag, you must verify that non-members can't bypass membership checks via the permission flag alone.

For policies with role-based bypass (e.g. admin/owner always allowed):
- Test that admin/owner is allowed even when the permission flag is false
- Test that a regular member is denied when the permission flag is false
- Test that a non-member is denied when the permission flag is true

Test policies **directly** by instantiating the Policy class:

```php
$policy = new SomePolicy();
expect($policy->methodName($user, $model))->toBeTrue();
// or ->toBeFalse();
```

### Controller Logic
Test controller methods **directly** — instantiate the controller, build a fake `Request`, and call the method. This tests business logic without routes, middleware, or a frontend.

For each controller method with business logic, test:
- **Valid input** → correct records created/updated/deleted in DB
- **Database side effects** → assert DB state, not just response content
- **Edge cases** → optional/nullable fields, empty input, boundary values

How to call controller methods directly:

```php
use Illuminate\Http\Request;

it('creates a record with valid input', function () {
    $controller = new SomeController();
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->users()->attach($user->id, ['role' => 'admin', 'profile' => '']);

    // actingAs so Auth::user() works inside the controller
    $this->actingAs($user);

    // Build a fake Request — no real route needed
    $request = Request::create('/fake', 'POST', [
        'name' => 'Test',
        'type' => 'text',
    ]);

    $response = $controller->store($request, $team);

    expect(SomeModel::where('name', 'Test')->exists())->toBeTrue();
});
```

**Rules for controller tests:**
- Use `$this->actingAs($user)` so `Auth::user()` works inside the controller
- Use `Request::create('/fake', 'POST', [...])` to build fake requests
- For file uploads, use `UploadedFile::fake()->image('photo.jpg')`
- Assert **database state** (`Model::where(...)->exists()`) not just response content
- If a controller calls `Gate::authorize()`, set up correct roles/permissions first
- Skip testing `Gate::authorize()` itself — covered by Policy tests
- Skip testing validation rules unless they have custom/non-obvious logic

### What to Skip
- **Trivial getters/setters** — Don't test that `$model->name` returns a string
- **Framework behavior** — Don't test that `->create()` returns a model or that timestamps exist
- **Frontend/Inertia responses** — No `assertInertia`, no component assertions
- **Validation rules** — Only test if the validation has non-obvious custom logic
- **Route existence** — Tests should not depend on routes being registered
- **Middleware** — Don't test auth middleware; use `actingAs()` and test logic directly

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

### Controller methods that call Gate::authorize()
If a controller calls `Gate::authorize()`, your test user must satisfy the policy. Set up the correct team membership and roles before calling the controller method. Don't catch the `AuthorizationException` — if auth fails, the test should fail (it means your setup is wrong).

## 5. Template

```php
<?php

use App\Models\{Model};
use App\Models\User;
use App\Policies\{Model}Policy;
use App\Http\Controllers\{Model}Controller;
use Illuminate\Http\Request;

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

it('denies non-member from {action} even with permissions', function () {
    $policy = new {Model}Policy();
    // setup outsider + model with permissions granted
    expect($policy->action($outsider, $model))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Controller Logic
|--------------------------------------------------------------------------
*/

it('creates a {model} with valid input', function () {
    $controller = new {Model}Controller();
    $user = User::factory()->create();
    // setup team, roles, permissions as needed

    $this->actingAs($user);

    $request = Request::create('/fake', 'POST', [
        'field' => 'value',
    ]);

    $response = $controller->store($request, $team);

    expect({Model}::where('field', 'value')->exists())->toBeTrue();
});
```

## 6. Run & Verify

```bash
php artisan test --filter={Model}Test
```

All tests must pass. If a test fails due to SQLite FK limitations, add a comment and adjust the assertion — don't remove the test.

## 7. Coverage Targets

Run coverage to check how well your tests cover the module:

```bash
php artisan test --coverage --filter={Model}Test
```

> Requires Xdebug or PCOV. Install PCOV for faster coverage: `pecl install pcov`

**Targets by layer:**

| Layer | Target | Notes |
|-------|--------|-------|
| Models & Policies | 90%+ | Core logic — bugs here = security holes |
| Controllers | 70-80% | Test business logic paths, skip trivial CRUD wrappers |
| Events & Notifications | 70%+ | Verify correct data and recipients |
| **Overall module** | **~80%** | Diminishing returns above this |

**Do NOT chase 100%.** Skip coverage for:
- Framework boilerplate (constructors, `$fillable` declarations)
- Simple getters that just proxy Eloquent
- Error paths that only the framework can trigger (e.g. missing DB connection)

