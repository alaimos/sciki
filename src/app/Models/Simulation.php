<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Tags\HasTags;

class Simulation extends Model
{
    use SoftDeletes;
    use HasTags;

    public const READY                 = 0;
    public const QUEUED                = 1;
    public const PROCESSING            = 2;
    public const COMPLETED             = 3;
    public const FAILED                = 4;
    public const VALID_STATES          = [self::READY, self::QUEUED, self::PROCESSING, self::COMPLETED, self::FAILED];
    public const HUMAN_READABLE_STATES = [
        self::READY      => 'Ready',
        self::QUEUED     => 'Queued',
        self::PROCESSING => 'Processing',
        self::COMPLETED  => 'Completed',
        self::FAILED     => 'Failed',
    ];
    public const OVER_EXPRESSED        = 1;
    public const UNDER_EXPRESSED       = 2;
    public const NON_EXPRESSED         = 0;

    protected $fillable = [
        'name',
        'remote_id',
        'status',
        'organism_id',
        'output_file',
        'pathway_output_file',
        'nodes_output_file',
    ];

    public function nodes(): BelongsToMany
    {
        return $this->belongsToMany(Node::class)->withPivot(['type']);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
