<?php

namespace App\Http\Requests\Editor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditPageRequest extends FormRequest
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
            'title'             => ['required', 'string'],
            'content'           => ['required', 'string'],
            'featured_image_id' => ['nullable', Rule::exists('media', 'id')],
            'tags'              => ['array'],
            'tags.*'            => ['string'],
            'deletedMedia'      => ['array'],
            'deletedMedia.*'    => ['uuid'],
        ];
    }
}
