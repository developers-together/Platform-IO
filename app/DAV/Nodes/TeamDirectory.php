<?php
namespace App\DAV\Nodes;

use App\Models\Team;
use Sabre\DAV\SimpleCollection;
use Sabre\DAV\Exception\Forbidden;
use Sabre\DAV\Exception\NotFound;
use Sabre\DAV\FSExt\Directory;
use Illuminate\Support\Facades\Auth;

class TeamDirectory extends SimpleCollection
{
    protected Team $team;
    protected string $storagePath;

    public function __construct(Team $team)
    {
        $this->team = $team;
        $this->storagePath = storage_path("teams/{$team->id}");

        // Ensure the directory exists on disk
        if (! is_dir($this->storagePath)) {
            mkdir($this->storagePath, 0755, true);
        }

        parent::__construct("team-{$team->id}");
    }

    public function getName(): string
    {
        return $this->team->slug; // e.g. "engineering", "design"
    }

    // -- Access Guard --
    private function authorizeCurrentUser(): void
    {
        $user = Auth::user();

        if (! $user) {
            throw new Forbidden('Unauthenticated.');
        }

        // Check team membership (adjust to your Team/User relationship)
        if (! $this->team->members()->where('user_id', $user->id)->exists()) {
            throw new Forbidden("You are not a member of team [{$this->team->name}].");
        }

        $role = $this->team->members()
        ->where('user_id', $user->id)
        ->value('role'); // from pivot

        if ($role === 'viewer') {
        throw new Forbidden('You have read-only access to this team directory.');
        }

    }

    // -- Delegating to real FS directory after auth check --
    private function getFsDirectory(): Directory
    {
        return new Directory($this->storagePath);
    }

    public function getChildren(): array
    {
        $this->authorizeCurrentUser();
        return $this->getFsDirectory()->getChildren();
    }

    public function getChild($name): \Sabre\DAV\INode
    {
        $this->authorizeCurrentUser();
        return $this->getFsDirectory()->getChild($name);
    }

    public function childExists($name): bool
    {
        $this->authorizeCurrentUser();
        return $this->getFsDirectory()->childExists($name);
    }

    public function createFile($name, $data = null)
    {
        $this->authorizeCurrentUser();
        return $this->getFsDirectory()->createFile($name, $data);
    }

    public function createDirectory($name): void
    {
        $this->authorizeCurrentUser();
        $this->getFsDirectory()->createDirectory($name);
    }

    public function delete(): void
    {
        $this->authorizeCurrentUser();
        // Optionally forbid deleting the root team dir entirely
        throw new Forbidden('Cannot delete team root directory.');
    }
}
