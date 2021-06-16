<?php


namespace App\Services;


use App\CommonMark\SciKiExtension\SciKiExtension;
use App\CommonMark\SciKiExtension\ScikiFencedCodeRenderer;
use App\Models\Page;
use Illuminate\Support\Str;
use League\CommonMark\Environment;
use League\CommonMark\Extension\Autolink\AutolinkExtension;
use League\CommonMark\Extension\Footnote\FootnoteExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\Extension\SmartPunct\SmartPunctExtension;
use League\CommonMark\Extension\TableOfContents\TableOfContentsExtension;
use League\CommonMark\MarkdownConverter;

class PageParserService
{

    private Page $page;

    public function __construct(Page $page)
    {
        $this->page = $page;
        ScikiFencedCodeRenderer::clearDetectedBlocks();
    }

    private function makeMarkdownParser(): MarkdownConverter
    {
        $environment = Environment::createCommonMarkEnvironment();
        $environment->addExtension(new GithubFlavoredMarkdownExtension());
        $environment->addExtension(new AutolinkExtension());
        $environment->addExtension(new FootnoteExtension());
        $environment->addExtension(new HeadingPermalinkExtension());
        $environment->addExtension(new TableOfContentsExtension());
        $environment->addExtension(new SmartPunctExtension());
        $environment->addExtension(new SciKiExtension());
        $environment->mergeConfig(
            [
                'sciki'             => [
                    'current_page' => $this->page,
                ],
                'heading_permalink' => [
                    'insert' => 'after',
                ],
                'table_of_contents' => [
                    'position'    => 'placeholder',
                    'style'       => 'ordered',
                    'placeholder' => '[TOC]',
                ],
            ]
        );

        return new MarkdownConverter($environment);
    }

    public function contentParser(): string
    {
        $originalContent = $this->page->content;
        $converter = $this->makeMarkdownParser();
        return $converter->convertToHtml($originalContent);
    }

    public function extractSummaryBlock(): string
    {
        $contentParts = explode("[TOC]", $this->page->content);
        $firstPart = $contentParts[0];
        $convertedContent = $this->makeMarkdownParser()->convertToHtml($firstPart);
        return preg_replace(ScikiFencedCodeRenderer::SCIKI_BLOCK_REGEXP, '', $convertedContent);
    }

    public function extractBlocks(string $parsedContent): array
    {
        $dividedBlocks = preg_split(
            ScikiFencedCodeRenderer::SCIKI_BLOCK_REGEXP,
            $parsedContent,
            -1,
            PREG_SPLIT_DELIM_CAPTURE
        );
        $reactContentArray = [];
        foreach ($dividedBlocks as $i => $content) {
            // Even-indexed elements are things before/after the SciKi plugin blocks
            if ($i % 2 === 0) {
                $reactContentArray[] = [
                    'key'       => Str::uuid()->toString(),
                    'component' => 'Html',
                    'props'     => [
                        'content' => $content,
                    ],
                ];
            } elseif (($block = ScikiFencedCodeRenderer::getDetectedBlock($content)) !== null) {
                $reactContentArray[] = [
                    'key'       => Str::uuid()->toString(),
                    'component' => $block['component'],
                    'props'     => $block['props'],
                ];
            }
        }

        return $reactContentArray;
    }

    public function cleanup(): void
    {
        ScikiFencedCodeRenderer::clearDetectedBlocks();
    }

}
