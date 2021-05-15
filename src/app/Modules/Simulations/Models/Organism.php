<?php

namespace App\Modules\Simulations\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organism extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'accession',
        'name',
    ];


    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Organism-to-nodes relationship
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(Node::class);
    }
}
