<?php
namespace App\DAV\Auth;

use Sabre\DAV\Auth\Backend\AbstractBasic;
use Illuminate\Support\Facades\Auth;

class LaravelAuthBackend extends AbstractBasic
{
    protected function validateUserPass($username, $password): bool
    {
        return Auth::attempt([
            'email' => $username,
            'password' => $password,
        ]);
    }

    public function getCurrentPrincipal(): ?string
    {
        $user = Auth::user();
        return $user ? 'principals/' . $user->id : null;
    }
}
