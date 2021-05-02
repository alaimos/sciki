<?php

namespace Database\Seeders;

use App\Models\Organism;
use Illuminate\Database\Seeder;

class OrganismsAndNodesTableSeeder extends Seeder
{

    private const TEST_ORGANISMS = [
        'hsa' => 'Homo Sapiens',
    ];

    private const MAX_NODES = 100;

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        foreach (self::TEST_ORGANISMS as $accession => $name) {
            $organism = Organism::create(
                [
                    'accession' => $accession,
                    'name'      => $name,
                ]
            );
            for ($i = 1; $i <= self::MAX_NODES; $i++) {
                $organism->nodes()->create(
                    [
                        'accession' => 'G' . $i,
                        'name'      => 'GENE' . $i,
                        'aliases'   => [],
                    ]
                );
            }
        }
    }
}
