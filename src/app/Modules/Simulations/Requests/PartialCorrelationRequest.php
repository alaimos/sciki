<?php

namespace App\Modules\Simulations\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PartialCorrelationRequest extends FormRequest
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
            'compareWith'     => ['required', Rule::exists('simulations', 'id')],
            'fn'              => ['sometimes', Rule::in(['pearson', 'spearman'])],
            'top'             => ['sometimes', 'boolean'],
            'n'               => ['sometimes', 'integer', 'min:0'],
            'direction'       => ['sometimes', Rule::in(['both', 'positive', 'negative'])],
            'useEndpoints'    => ['sometimes', 'boolean'],
            'usePerturbation' => ['sometimes', 'boolean'],
        ];
    }
}
