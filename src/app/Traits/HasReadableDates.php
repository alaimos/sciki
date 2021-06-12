<?php


namespace App\Traits;


trait HasReadableDates
{

    /**
     * Returns the human readable version of the created_at attribute
     *
     * @return string
     */
    public function getReadableCreatedAtAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Returns the human readable version of the created_at attribute
     *
     * @return string
     */
    public function getReadableUpdatedAtAttribute(): string
    {
        return $this->updated_at->diffForHumans();
    }
}
