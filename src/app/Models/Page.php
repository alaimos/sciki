<?php

namespace App\Models;

use App\Traits\Commentable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Laravel\Scout\Searchable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Tags\HasTags;
use Spatie\Tags\Tag;
use Venturecraft\Revisionable\RevisionableTrait;

class Page extends Model implements HasMedia
{

    use Commentable;
    use HasSlug;
    use HasTags;
    use InteractsWithMedia;
    use RevisionableTrait;
    use Searchable;
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

    /**
     * Get the name of the index associated with the model.
     *
     * @return string
     */
    public function searchableAs(): string
    {
        return 'pages_index';
    }

//    /**
//     * Get the indexable data array for the model.
//     *
//     * @return array
//     */
//    public function toSearchableArray(): array
//    {
//        $array = $this->toArray();
//
//
//        return $array;
//    }

    public function simulation(): BelongsTo
    {
        return $this->belongsTo(Simulation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedTagsAttribute(): Collection
    {
        return $this->tags()->get()->map(fn(Tag $tag) => $tag->type . ': ' . $tag->name);
    }

    public function syncFormattedTags(array $formattedTags): self
    {
        $tagsByCategory = [];
        foreach ($formattedTags as $tag) {
            $tagAndCategory = preg_split('/:\s*/', $tag, 2);
            if (count($tagAndCategory) === 2) {
                [$category, $realTag] = $tagAndCategory;
                if (!isset($tagsByCategory[$category])) {
                    $tagsByCategory[$category] = [];
                }
                $tagsByCategory[$category][] = $realTag;
            }
        }
        foreach ($tagsByCategory as $category => $tags) {
            $this->syncTagsWithType($tags, $category);
        }

        return $this;
    }

    public function deleteMediaByUuid(array $deletedMedia): self
    {
        $this->media()->whereIn('uuid', $deletedMedia)->delete();

        return $this;
    }

    public function formatMedia(Media $media): array
    {
        return [
            'id'     => $media->id,
            'uuid'   => $media->uuid,
            'title'  => $media->getCustomProperty('title', $media->name),
            'legend' => $media->getCustomProperty('legend', $media->name),
            'url'    => $media->getUrl(),
            'thumbs' => [
                'small' => $media->getUrl('thumb-small'),
                'large' => $media->getUrl('thumb-large'),
            ],
            'srcset' => $media->getSrcset(),
        ];
    }

    public function getFormattedMediaAttribute(): Collection
    {
        return $this->media->map([$this, 'formatMedia'])->keyBy('uuid');
    }

    /**
     * @param  \Spatie\MediaLibrary\MediaCollections\Models\Media|null  $media
     *
     * @throws \Spatie\Image\Exceptions\InvalidManipulation
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb-small')
             ->width(64)
             ->height(64)
             ->sharpen(10);
        $this->addMediaConversion('thumb-large')
             ->width(256)
             ->height(256)
             ->sharpen(10);
    }
}
