<?php

namespace App\Models;

use App\Traits\Commentable;
use App\Traits\HasFormattedTags;
use App\Traits\HasReadableDates;
use App\Traits\Voteable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use JetBrains\PhpStorm\ArrayShape;
use Laravel\Scout\Searchable;
use Spatie\Image\Exceptions\InvalidManipulation;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Tags\HasTags;
use Venturecraft\Revisionable\RevisionableTrait;

class Page extends Model implements HasMedia
{

    use Commentable;
    use HasFormattedTags;
    use HasReadableDates;
    use HasSlug;
    use HasTags;
    use InteractsWithMedia;
    use RevisionableTrait;
    use Searchable;
    use SoftDeletes;
    use Voteable;

    protected $fillable = [
        'title',
        'content',
        'user_id',
        'featured_image_id',
        'draft',
    ];

    protected $casts = [
        'draft' => 'boolean',
    ];

    protected $keepRevisionOf = ['title', 'content'];

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

    public function toSearchableArray(): array
    {
//        todo: ENABLE IN PRODUCTION
//        if ($this->draft) {
//            return [];
//        }

        return [
            'id'             => $this->id,
            'slug'           => $this->slug,
            'title'          => $this->title,
            'content'        => $this->content,
            'formatted_tags' => $this->formatted_tags,
            'media'          => $this->media()->get()->map(
                fn(Media $m) => [
                    'uuid'   => $m->uuid,
                    'title'  => $m->getCustomProperty('title', $m->name),
                    'legend' => $m->getCustomProperty('legend', $m->name),
                ]
            ),
            'updated_at'     => $this->updated_at,
            'created_at'     => $this->created_at,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function deleteMediaByUuid(array $deletedMedia): self
    {
        $this->media()->whereIn('uuid', $deletedMedia)->delete();

        return $this;
    }

    public function formattedFeaturedImage(): ?array
    {
        if (!$this->featuredImage) {
            return null;
        }
        return $this->formatMedia($this->featuredImage);
    }

    #[ArrayShape([
        'id'     => "int|mixed",
        'uuid'   => "mixed|null|string",
        'title'  => "mixed",
        'legend' => "mixed",
        'url'    => "string",
        'thumbs' => "array",
        'srcset' => "string"
    ])] public function formatMedia(
        Media $media
    ): array {
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
     * @param Media|null $media
     *
     * @throws InvalidManipulation
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
