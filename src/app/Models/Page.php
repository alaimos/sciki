<?php

namespace App\Models;

use App\Traits\Commentable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Tags\HasTags;
use Venturecraft\Revisionable\RevisionableTrait;

class Page extends Model implements HasMedia
{

    use Commentable;
    use HasSlug;
    use HasTags;
    use InteractsWithMedia;
    use RevisionableTrait;
    use SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'simulation_id',
        'user_id',
        'draft',
    ];

    protected $casts = [
        'draft' => 'boolean',
    ];

    /**
     * Get the options for generating the slug.
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
                          ->generateSlugsFrom('title')
                          ->saveSlugsTo('slug')
                          ->slugsShouldBeNoLongerThan(200);
    }

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function simulation(): HasOne
    {
        return $this->hasOne(Simulation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
