<?php

namespace App\Modules\Simulations\Rules;

use App\Modules\Simulations\Models\Node;
use Illuminate\Contracts\Validation\Rule;

class IsArrayOfNodes implements Rule
{

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     *
     * @return bool
     */
    public function passes($attribute, $value): bool
    {
        if (request()->get('existing')) {
            return true;
        }
        if (!is_array($value)) {
            return false;
        }

        $nodeIds = array_keys($value);
        $dbCount = Node::whereIn('id', $nodeIds)->count();

        return $dbCount === count($nodeIds);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return 'Some of the nodes you entered are not in our database.';
    }
}
