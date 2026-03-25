<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;
// use App\Models\Chat;
use Illuminate\Support\Facades\Storage;

class NewMessage implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $message,)
    {
    }

    public function broadcastWith(): array
    {
        $data = $this->message->toArray();
        if ($this->message->path) {
            $data['path'] = Storage::url($this->message->path);
        }
        return $data;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('team.'. $this->message->chat->team->id .
            '.chat.' . $this->message->chat->id . '.get'),
        ];
    }
}
