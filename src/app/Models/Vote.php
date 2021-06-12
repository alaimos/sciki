<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vote extends Model
{

    protected $fillable = [
        'voteable_id',
        'voteable_type',
        'user_id',
        'vote',
    ];

    protected $casts = [
        'vote' => 'integer',
    ];



    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
