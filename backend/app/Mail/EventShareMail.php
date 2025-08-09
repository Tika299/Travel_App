<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventShareMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $event;
    public $sender;

    /**
     * Create a new message instance.
     */
    public function __construct($event, $sender)
    {
        $this->event = $event;
        $this->sender = $sender;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Chia sẻ lịch trình: ' . $this->event['title'])
                    ->view('emails.event-share')
                    ->with([
                        'event' => $this->event,
                        'sender' => $this->sender
                    ]);
    }
}
