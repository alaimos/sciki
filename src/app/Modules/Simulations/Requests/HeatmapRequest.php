<?php

namespace App\Modules\Simulations\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HeatmapRequest extends FormRequest
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
            'type'                 => ['sometimes', Rule::in(['pathways', 'nodes'])],
            'mode'                 => ['sometimes', Rule::in(['top', 'selected'])],
            'selection'            => ['required_if:mode,selected', 'array'],
            'selection.*'          => ['string'],
            'sort_by'              => ['sometimes', Rule::in(['perturbation', 'activity'])],
            'n'                    => ['sometimes', 'integer', 'min:0'],
            'absolute'             => ['sometimes', 'boolean'],
            'limit'                => ['sometimes', Rule::in(['none', 'positive', 'negative'])],
            'attach'               => ['sometimes', 'array'],
            'attach.tags'          => ['sometimes', 'array'],
            'attach.tags.*'        => ['string'],
            'attach.mode'          => ['sometimes', Rule::in(['all', 'any'])],
            'attach.simulations'   => ['sometimes', 'array'],
            'attach.simulations.*' => ['numeric', Rule::exists('simulations', 'id')],
        ];
    }
}
