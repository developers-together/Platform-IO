<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'name' => 'required|max:255',
            'password' => $this->passwordRules(),
            'gender' => 'nullable|string',
            'job' => 'nullable|string',
            'phone' => 'nullable|string',
            'timezone' => 'nullable|string|max:50',
            'profile' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'

        ])->validate();

        $profilePath = null;

        if (! empty($input['profile'])) {
            $profilePath = $input['profile']->store('user_profiles', 'public');
        }

        return User::create([
            'name'     => $input['name'],
            'email'    => $input['email'],
            'password' => $input['password'],
            'gender'   => $input['gender'] ?? null,
            'job'      => $input['job'] ?? null,
            'phone'    => $input['phone'] ?? null,
            'timezone' => $input['timezone'] ?? 'UTC',
            'profile'  => $profilePath,
        ]);
    }
}
