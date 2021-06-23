<?php

namespace App\Modules\Simulations\Requests;

use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Rules\IsArrayOfNodes;
use App\Modules\Simulations\Rules\ValidSimulation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncTagsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'tags'      => ['array'],
            'tags.*'    => ['string'],
        ];
    }
}
