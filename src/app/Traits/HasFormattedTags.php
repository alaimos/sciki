<?php


namespace App\Traits;


use Illuminate\Support\Collection;

trait HasFormattedTags
{

    public function getFormattedTagsAttribute(): Collection
    {
        return $this->tags()->get()->pluck('formatted_name');
    }

    public function syncFormattedTags(array $formattedTags): self
    {
        $this->syncTags([]);
        $tagsByCategory = [];
        foreach ($formattedTags as $tag) {
            $tag = strtolower($tag);
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

}
