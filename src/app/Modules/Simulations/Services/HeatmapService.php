<?php

namespace App\Modules\Simulations\Services;


use App\Modules\Simulations\Models\Simulation;
use Illuminate\Support\Collection;

class HeatmapService
{

    private Simulation $simulation;
    private string $type;
    private string $mode;
    private string $sortBy;
    private int $n;
    private array $selection;
    private bool $absolute;
    private ?string $limit;
    private array $attachTags;
    private string $searchMode;
    private array $attachSimulations;
    private array $excludeIds;

    public function __construct(Simulation $simulation, array $data)
    {
        $this->simulation = $simulation;
        $this->type = $data['type'] ?? 'pathways';
        $this->mode = $data['mode'] ?? 'top';
        $this->sortBy = $data['sort_by'] ?? 'perturbation';
        $this->n = (int)($data['n'] ?? 10);
        $this->selection = (array)($data['selection'] ?? []);
        $this->absolute = (bool)($data['absolute'] ?? false);
        $this->limit = $data['limit'] ?? null;
        $attach = $data['attach'] ?? [];
        $this->attachTags = $attach['tags'] ?? [];
        $this->attachSimulations = $attach['simulations'] ?? [];
        $this->searchMode = $attach['mode'] ?? 'all';
        $this->excludeIds = [$simulation->id];
    }

    /**
     * @param Simulation $simulation
     * @return Collection
     * @throws \App\Exceptions\FileSystemException
     * @throws \JsonException
     */
    private function getTop(Simulation $simulation): Collection
    {
        $parserService = new SimulationParserService($simulation);
        $methodName = 'top' .
            ($this->sortBy === 'perturbation' ? 'Perturbed' : 'Active') .
            ($this->type === 'pathways' ? 'Pathways' : 'Nodes');
        /** @var Collection $simulationData */
        $simulationData = $parserService->$methodName(
            $this->n,
            $this->absolute,
            $this->limit,
            [
                'simulation' => $simulation->name
            ]
        )->values();
        return $simulationData;
    }

    /**
     * @param Simulation $simulation
     * @param array $selection
     * @return Collection
     * @throws \App\Exceptions\FileSystemException
     * @throws \JsonException
     */
    private function getBySelection(Simulation $simulation, array $selection): Collection
    {
        $parserService = new SimulationParserService($simulation);
        $methodName = ($this->sortBy === 'perturbation' ? 'perturbed' : 'active') .
            ($this->type === 'pathways' ? 'Pathways' : 'Nodes');
        /** @var Collection $simulationData */
        $simulationData = $parserService->$methodName(
            $selection,
            [
                'simulation' => $simulation->name
            ]
        )->values();
        return $simulationData;
    }

    /**
     * @return Collection
     * @throws \App\Exceptions\FileSystemException
     * @throws \JsonException
     */
    private function get(): Collection
    {
        if ($this->mode === 'top') {
            return $this->getTop($this->simulation);
        }

        return $this->getBySelection($this->simulation, $this->selection);
    }

    private function getFromTags(array $selectedRows): ?Collection
    {
        if (!empty($this->attachTags)) {
            $simulationService = new SimulationService();
            $foundSimulations = $simulationService->findSimulationsByTags(
                $this->attachTags,
                $this->searchMode,
                $this->excludeIds
            );
            if ($foundSimulations->count() > 0) {
                $this->excludeIds = array_merge($this->excludeIds, $foundSimulations->pluck('id')->toArray());
                return $foundSimulations->flatMap(
                    function (Simulation $s) use ($selectedRows) {
                        return $this->getBySelection($s, $selectedRows);
                    }
                );
            }
        }
        return null;
    }

    private function getFromAttachedSimulations(array $selectedRows): ?Collection
    {
        if (!empty($this->attachSimulations)) {
            $foundSimulations = Simulation::whereIn('id', $this->attachSimulations)->whereNotIn(
                'id',
                $this->excludeIds
            );
            if ($foundSimulations->count() > 0) {
                return $foundSimulations->get()->flatMap(
                    function (Simulation $s) use ($selectedRows) {
                        return $this->getBySelection($s, $selectedRows);
                    }
                );
            }
        }
        return null;
    }

    /**
     * @return array
     * @throws \App\Exceptions\FileSystemException
     * @throws \JsonException
     */
    public function makeDataPoints(): array
    {
        $simulationData = $this->get();
        $selectedRows = $simulationData->pluck('id')->toArray();
        $dataFromTags = $this->getFromTags($selectedRows);
        if ($dataFromTags !== null) {
            $simulationData = $simulationData->merge($dataFromTags);
        }
        $dataFromAttachedSimulations = $this->getFromAttachedSimulations($selectedRows);
        if ($dataFromAttachedSimulations !== null) {
            $simulationData = $simulationData->merge($dataFromAttachedSimulations);
        }
        $simulationData = $simulationData->map(
            static function ($item) {
                return [
                    'x' => $item['id'] . ': ' . $item['name'],
                    'y' => $item['simulation'],
                    'z' => $item['value'],
                ];
            }
        )->groupBy('x');
        return [
            'x' => $simulationData->keys(),
            'y' => $simulationData->first()->pluck('y'),
            'z' => $simulationData->map->pluck('z')->values(),
        ];
    }
}
