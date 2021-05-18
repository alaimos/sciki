<?php

namespace App\Modules\Simulations\Models;

use App\Models\User;
use App\Traits\HasFormattedTags;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Spatie\Tags\HasTags;

class Simulation extends Model
{
    use SoftDeletes;
    use HasFormattedTags;
    use HasTags;
    use Searchable;

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
    public const OVER_EXPRESSED        = 2;
    public const UNDER_EXPRESSED       = 1;
    public const NON_EXPRESSED         = 0;
    public const KNOCKOUT              = -1;
    public const VALID_NODE_STATES     = [
        self::OVER_EXPRESSED,
        self::UNDER_EXPRESSED,
        self::NON_EXPRESSED,
        self::KNOCKOUT,
    ];

    protected $fillable = [
        'name',
        'remote_id',
        'status',
        'organism_id',
        'output_file',
        'pathway_output_file',
        'nodes_output_file',
    ];

    public function organism(): BelongsTo
    {
        return $this->belongsTo(Organism::class);
    }

    public function nodes(): BelongsToMany
    {
        return $this->belongsToMany(Node::class)->withPivot(['type']);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function searchableAs(): string
    {
        return 'simulations_index';
    }

    public function toSearchableArray(): array
    {
        if ($this->status !== self::COMPLETED) {
            return [];
        }

        return [
            'id'             => $this->id,
            'organism'       => $this->organism->name,
            'name'           => $this->name,
            'formatted_tags' => $this->formatted_tags,
        ];
    }

}
