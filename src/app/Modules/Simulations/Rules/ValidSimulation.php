<?php

namespace App\Modules\Simulations\Rules;

use App\Modules\Simulations\Services\SimulationService;
use Illuminate\Contracts\Validation\Rule;

class ValidSimulation implements Rule
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
        return (new SimulationService())->checkValidRemoteSimulation((int)$value);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return 'The simulation you entered does not exist or is not completed.';
    }
}
