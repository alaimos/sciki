<?php
/** @noinspection NestedTernaryOperatorInspection */

namespace App\Models;

use App\Traits\HasReadableDates;
use App\Traits\Voteable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{

    use HasReadableDates;
    use Voteable;

    protected $fillable = [
        'user_id',
        'comment',
        'ip_address',
        'user_agent',
    ];

    protected $appends = [
        'readable_created_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
