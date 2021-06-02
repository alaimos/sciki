<?php

namespace App\Modules\Simulations\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CorrelationRequest extends FormRequest
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
            'fn'              => ['sometimes', Rule::in(['pearson', 'spearman'])],
            'top'             => ['sometimes', 'boolean'],
            'n'               => ['sometimes', 'integer', 'min:0'],
            'direction'       => ['sometimes', Rule::in(['positive', 'negative'])],
            'useEndpoints'    => ['sometimes', 'boolean'],
            'usePerturbation' => ['sometimes', 'boolean'],
            'findByTags'      => ['required', 'array'],
            'findByTags.*'    => ['string'],
            'searchMode'      => ['sometimes', Rule::in(['all', 'any'])],
        ];
    }
}
