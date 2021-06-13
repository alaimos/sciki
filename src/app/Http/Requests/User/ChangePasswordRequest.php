<?php

namespace App\Http\Requests\User;

use App\Rules\CurrentPasswordRule;
use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'current_password' => ['required', new CurrentPasswordRule()],
            'password'         => [
                'required',
                'string',
                'min:8', // TODO remove this line and uncomment the following line
                // (new Password(8))->mixedCase()->numbers()->symbols()->uncompromised(),
                'confirmed'
            ],
        ];
    }
}
