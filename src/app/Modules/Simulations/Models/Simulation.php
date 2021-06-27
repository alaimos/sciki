<?php

namespace App\Modules\Simulations\Models;

use App\Models\Role;
use App\Models\User;
use App\Modules\Simulations\Services\AccessControlService;
use App\Services\Utils;
use App\Traits\HasFormattedTags;
use App\Traits\HasReadableDates;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use JetBrains\PhpStorm\Pure;
use Laravel\Scout\Searchable;
use Spatie\Tags\HasTags;

class Simulation extends Model
{
    use SoftDeletes {
        forceDelete as originalForceDelete;
    }
    use HasFormattedTags;
    use HasReadableDates;
    use HasTags;
    use Searchable;

    public const READY                 = 0;
    public const QUEUED                = 1;
    public const PROCESSING            = 2;
    public const COMPLETED             = 3;
    public const FAILED                = 4;
    public const VALID_STATES          = [self::READY, self::QUEUED, self::PROCESSING, self::COMPLETED, self::FAILED];
    public const HUMAN_READABLE_STATES = [
        self::READY      => [
            'value' => self::READY,
            'label' => 'Ready',
        ],
        self::QUEUED     => [
            'value' => self::QUEUED,
            'label' => 'Queued',
        ],
        self::PROCESSING => [
            'value' => self::PROCESSING,
            'label' => 'Processing',
        ],
        self::COMPLETED  => [
            'value' => self::COMPLETED,
            'label' => 'Completed',
        ],
        self::FAILED     => [
            'value' => self::FAILED,
            'label' => 'Failed',
        ],
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
        'short_name',
        'remote_id',
        'status',
        'public',
        'organism_id',
        'output_file',
        'pathway_output_file',
        'nodes_output_file',
        'user_id',
    ];

    protected $casts = [
        'public' => 'bool',
    ];

    /**
     * Shows all simulations that are visible by the current user.
     * A simulation is visible by the current user if:
     *  - The user has a "USER" role and the simulation is public
     *  - The user has a "EDITOR" role and owns the simulation or the simulation is public
     *  - The user has an "ADMIN" role and owns the simulation or the simulation is public
     *
     * An admin can also view all simulations (without any check) by setting the $showAll parameter
     *
     * An anonymous user can view only public simulations.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  bool  $showAll
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVisibleByUser(Builder $query, bool $showAll = false): Builder
    {
        $currentUser = auth()->user();
        $isLoggedIn = auth()->check() && $currentUser !== null;
        if (!$isLoggedIn || $currentUser->role_id === Role::USER) {
            return $query->where('public', 1);
        }
        if ($currentUser->role_id === Role::ADMIN && $showAll) {
            return $query;
        }

        return $query->where(
            function (Builder $query) use ($currentUser) {
                return $query->where('public', 1)
                             ->orWhere('user_id', $currentUser->id);
            }
        );
    }

    /**
     * Returns the human readable status of this job
     *
     * @return string
     */
    public function getReadableStatusAttribute(): string
    {
        return self::HUMAN_READABLE_STATES[$this->status]['label'] ?? '';
    }

    #[Pure] public function getShortNameAttribute($value): string
    {
        if (empty($value)) {
            return Str::limit($this->name, 50);
        }

        return $value;
    }

    /**
     * Returns an array of capabilities for the current user
     *
     * @return array
     */
    public function getCanAttribute(): array
    {
        return (new AccessControlService())->getCapabilities($this);
    }

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

    public function outputDirectoryAbsolutePath(): string
    {
        $directory = storage_path('app/public/simulations/' . $this->id);
        if (!file_exists($directory) && !mkdir($directory, 0777, true) && !is_dir($directory)) {
            throw new \RuntimeException(sprintf('Directory "%s" was not created', $directory));
        }

        return $directory;
    }

    public function fileAbsolutePath($name): string
    {
        return $this->outputDirectoryAbsolutePath() . '/' . $name;
    }

    public function forceDelete(): ?bool
    {
        if (file_exists($this->outputDirectoryAbsolutePath())) {
            Utils::delete($this->outputDirectoryAbsolutePath());
        }

        return $this->originalForceDelete();
    }

    public function canBeViewed(): bool
    {
        if ($this->public) {
            return true;
        }
        if (!auth()->check()) {
            return false;
        }
        if (auth()->id() === $this->user_id) {
            return true;
        }

        return auth()->user()->role_id === Role::ADMIN;
    }

}
