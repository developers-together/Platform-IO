<?php

namespace App\DAV\Nodes;
use App\Models\Team;
use Sabre\DAV\SimpleCollection;
use Sabre\DAV\Exception\NotFound;
use Illuminate\Support\Facades\Auth;

class TeamsRootCollection extends SimpleCollection
{
    public function __construct()
    {
        parent::__construct('teams');
    }

    public function getChildren(): array
    {
        $user = Auth::user();
        if (! $user) return [];

        // Only return teams the user belongs to
        return $user->teams->map(fn(Team $team) => new TeamDirectory($team))->all();
    }

    public function getChild($name): \Sabre\DAV\INode
    {
        $user = Auth::user();

        $team = $user?->teams()->where('slug', $name)->first();

        if (! $team) {
            throw new NotFound("Team '{$name}' not found or access denied.");
        }

        return new TeamDirectory($team);
    }

    public function childExists($name): bool
    {
        $user = Auth::user();
        return (bool) $user?->teams()->where('slug', $name)->exists();
    }
}
