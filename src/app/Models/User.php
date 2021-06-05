<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use JetBrains\PhpStorm\ArrayShape;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Returns the content of the avatar attribute (computed on the fly by laravel magic)
     *
     * @return array
     */
    #[ArrayShape(['small' => "string", 'medium' => "string", 'large' => "string"])] public function getAvatarAttribute(
    ): array
    {
        return [
            'small'  => Gravatar::src($this->email, 40),
            'medium' => Gravatar::src($this->email, 800),
            'large'  => Gravatar::src($this->email, 1920),
        ];
    }

    /**
     * Returns the human readable version of the created_at attribute
     *
     * @return string
     */
    public function getReadableCreatedAtAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }
}
