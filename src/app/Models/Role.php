<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public const USER   = 1;
    public const EDITOR = 2;
    public const ADMIN  = 3;
    public const ROLES  = [
        'admin'  => self::ADMIN,
        'editor' => self::EDITOR,
        'user'   => self::USER,
    ];

    protected $fillable = [
        'id',
        'name',
    ];

}
