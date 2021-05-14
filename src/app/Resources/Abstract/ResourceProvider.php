<?php


namespace App\Resources\Abstract;


abstract class ResourceProvider
{

    public function policies(): array
    {
        return [];
    }

}
