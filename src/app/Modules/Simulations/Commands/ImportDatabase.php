<?php

namespace App\Modules\Simulations\Commands;

use App\Modules\Simulations\Models\Organism;
use App\Services\Utils;
use DB;
use Illuminate\Console\Command;

class ImportDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import MITHrIL 2 organisms/nodes database.';

    /**
     * Read nodes exported from MITHrIL2 database
     *
     * @param  string  $file
     * @param  \App\Modules\Simulations\Models\Organism  $organism
     *
     * @return bool
     */
    private function readNodes(string $file, Organism $organism): bool
    {
        if (!file_exists($file)) {
            return false;
        }
        $fp = fopen($file, 'rb');
        if (!$fp) {
            return false;
        }
        $lines = Utils::countLines($file) - 1;
        $this->output->progressStart($lines);
        $data = [];
        while (($line = fgetcsv($fp, 0, "\t")) !== false) {
            $this->output->progressAdvance();
            if (count($line) < 4 || str_starts_with($line[0], '#')) {
                continue;
            }
            $data[] = ['accession' => $line[0], 'name' => $line[1], 'aliases' => $line[3], 'organism_id' => $organism->id];
            if (count($data) === 100) {
                DB::table('nodes')->insertOrIgnore($data);
                $data = [];
            }
        }
        $this->output->progressFinish();

        return true;
    }

    /**
     * Read organisms index
     *
     * @return array
     */
    private function readOrganismsIndex(): array
    {
        $index = [];
        $fp = gzopen('https://alpha.dmi.unict.it/mithril/data/index.txt.gz', 'rb');
        if (!$fp) {
            return $index;
        }
        while (($line = fgetcsv($fp, 0, "\t")) !== false) {
            if (count($line) >= 2) {
                $index[$line[0]] = $line[1];
            }
        }

        return $index;
    }

    /**
     * Export nodes from MITHrIL2
     *
     * @param  \App\Modules\Simulations\Models\Organism  $organism
     *
     * @return string|null
     */
    private function exportNodes(Organism $organism): ?string
    {
        $file = tempnam(storage_path('app/'), 'nodes_');
        $cmd = [
            config('sciki.java_executable'),
            '-jar',
            config('modules.simulations.phensim_executable'),
            'exportgraph',
            '-enrichment-evidence-type',
            'WEAK',
            '-verbose',
            '-reactome',
            '-organism',
            $organism->accession,
            '-no',
            $file,
        ];
        Utils::runCommand(
            $cmd,
            callback: function ($type, $buffer) {
            $this->output->write($buffer);
        }
        );
        if (!file_exists($file)) {
            $this->error('Unable to find output file ' . $file);

            return null;
        }

        return $file;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $organismsIndex = $this->readOrganismsIndex();
        foreach ($organismsIndex as $accession => $name) {
            if ($accession !== "hsa") { //@todo remove this in production
                continue;
            }
            $this->info('Importing ' . $name);
            $organism = Organism::create(
                [
                    'name'      => $name,
                    'accession' => $accession,
                ]
            );
            $this->info('Exporting nodes...');
            if (($file = $this->exportNodes($organism)) !== null) {
                $this->info('Processing nodes...');
                $this->readNodes($file, $organism);
                @unlink($file);
            }
        }

        return 0;
    }
}
