<?php


namespace App\Services;


use App\Models\Page;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class HomepageService
{

    private function getPreviewText(Page $page): string
    {
        $parserService = new PageParserService($page);
        $preview = $parserService->extractSummaryBlock();
        $parserService->cleanup();
        return Str::limit($preview, 1000);
    }

    private function getFeaturedPage(): Page
    {
        $maxVote = (int)DB::query()
                          ->from(Page::withSum("votes", "vote"), 'mv')
                          ->max('mv.votes_sum_vote');
        return Page::with('featuredImage')
                   ->withSum('votes', 'vote')
                   ->having('votes_sum_vote', $maxVote)->first();
    }

    private function getLastCreatedPage(): Page
    {
        return Page::with('featuredImage')->latest('created_at')->first();
    }

    private function getLastUpdatedPage(): Page
    {
        return Page::with('featuredImage')->latest('updated_at')->first();
    }

    public function render(): InertiaResponse
    {
        $featuredPage = $this->getFeaturedPage();
        $lastCreatedPage = $this->getLastCreatedPage();
        $lastUpdatedPage = $this->getLastUpdatedPage();
        return Inertia::render(
            'Wiki/Index',
            [
                'featuredPage'           => $featuredPage,
                'featuredPageImage'      => $featuredPage->formattedFeaturedImage(),
                'featuredPagePreview'    => $this->getPreviewText($featuredPage),
                'lastCreatedPage'        => $lastCreatedPage,
                'lastCreatedPageImage'   => $lastCreatedPage->formattedFeaturedImage(),
                'lastCreatedPagePreview' => $this->getPreviewText($lastCreatedPage),
                'lastUpdatedPage'        => $lastUpdatedPage,
                'lastUpdatedPageImage'   => $lastUpdatedPage->formattedFeaturedImage(),
                'lastUpdatedPagePreview' => $this->getPreviewText($lastUpdatedPage),
            ]
        );
    }

}
