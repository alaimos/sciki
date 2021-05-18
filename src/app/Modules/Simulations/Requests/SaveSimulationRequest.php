<?php

namespace App\Modules\Simulations\Requests;

use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Rules\ValidSimulation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveSimulationRequest extends FormRequest
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
            'name'      => ['required', 'string'],
            'existing'  => ['required', 'boolean'],
            'remote_id' => ['required_if:existing,true', 'integer', new ValidSimulation()],
            'organism'  => ['required_unless:existing,true', 'integer'],
            'tags'      => ['array'],
            'tags.*'    => ['string'],
            'nodes'     => ['array'],
            'nodes.*'   => [Rule::in(Simulation::VALID_NODE_STATES)],
        ];
    }
}
