<?php

namespace App\DAV\CalDAV;

use App\Models\User;
use Sabre\DAVACL\PrincipalBackend\AbstractBackend;

class PrincipalBackend extends AbstractBackend
{
    public function getPrincipalsByPrefix(string $prefixPath): array
    {
        return User::all()->map(function (User $user) use ($prefixPath) {
            return [
                'uri'          => $prefixPath . '/' . $user->id,
                '{DAV:}displayname' => $user->name,
                '{http://sabredav.org/ns}email-address' => $user->email,
            ];
        })->all();
    }

    public function getPrincipalByPath(string $path): ?array
    {
        $id = last(explode('/', $path));
        $user = User::find($id);

        if (! $user) return null;

        return [
            'uri'          => $path,
            '{DAV:}displayname' => $user->name,
            '{http://sabredav.org/ns}email-address' => $user->email,
        ];
    }

    public function getGroupMemberSet(string $principal): array  { return []; }
    public function getGroupMembership(string $principal): array { return []; }
    public function setGroupMemberSet(string $principal, array $members): void {}
    public function updatePrincipal(string $path, \Sabre\DAV\PropPatch $propPatch): int { return 0; }
    public function searchPrincipals(string $prefixPath, array $searchProperties, string $test = 'allof'): array { return []; }
}
