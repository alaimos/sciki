<?php

namespace App\CommonMark\SciKiExtension;

use App\Models\Page;
use Illuminate\Support\Str;
use League\CommonMark\Event\DocumentParsedEvent;
use League\CommonMark\Inline\Element\HtmlInline;
use League\CommonMark\Inline\Element\Image;
use League\CommonMark\Inline\Element\Link;
use League\CommonMark\Inline\Element\Text;
use League\CommonMark\Util\ConfigurationAwareInterface;
use League\CommonMark\Util\ConfigurationInterface;

final class SciKiUrlProcessor implements ConfigurationAwareInterface
{
    private const REGEX = '/<@([A-Za-z0-9_-]+)>/ixu';

    /** @var ConfigurationInterface */
    private $config;

    public function setConfiguration(ConfigurationInterface $configuration): void
    {
        $this->config = $configuration;
    }

    /**
     * @param  DocumentParsedEvent  $e
     *
     * @return void
     */
    public function __invoke(DocumentParsedEvent $e)
    {
        $walker = $e->getDocument()->walker();

        while ($event = $walker->next()) {
            $node = $event->getNode();
            if ($node instanceof Text && !($node->parent() instanceof Link)) {
                self::processAutolinks($node, self::REGEX);
            }

            if ($node instanceof Link) {
                self::processExistingLink($node);
            }

            $currentPage = $this->config->get('sciki/current_page');
            if (($currentPage instanceof Page) && $node instanceof Image) {
                self::processExistingImage($node, $currentPage);
            }
        }
    }

    private static function getTitleFromSlug(string $slug): string
    {
        return Str::title(str_replace(['-', '_'], ' ', $slug));
    }

    private static function processExistingImage(Image $image, Page $currentPage): void
    {
        $imageUrl = $image->getUrl();
        if (!str_starts_with($imageUrl, '#') || !str_ends_with($imageUrl, '#')) {
            return;
        }
        $imageUuid = trim($imageUrl, '#');
        if (($media = $currentPage->media->where('uuid', $imageUuid)->first()) !== null) {
            $image->insertBefore(new HtmlInline($media()));
        }
        $image->detach();
    }

    private static function processExistingLink(Link $link): void
    {
        $url = $link->getUrl();
        if (!str_starts_with($url, '@')) {
            return;
        }

        $pageSlug = ltrim($url, '@');
        $page = Page::whereSlug($pageSlug)->first();
        $pageNotExists = $page === null;
        $title = $pageNotExists ? self::getTitleFromSlug($pageSlug) : $page->title;

        $link->setUrl(route('wiki.show', $pageSlug));
        if ($pageNotExists) {
            $link->prependChild(new HtmlInline('<span class="text-red">'));
            $link->appendChild(new HtmlInline('</span>'));
        }
    }

    private static function processAutolinks(Text $node, string $regex): void
    {
        $contents = preg_split($regex, $node->getContent(), -1, PREG_SPLIT_DELIM_CAPTURE);

        if ($contents === false || count($contents) === 1) {
            return;
        }

        $leftovers = '';
        foreach ($contents as $i => $content) {
            // Even-indexed elements are things before/after the URLs
            if ($i % 2 === 0) {
                // Insert any left-over characters here as well
                $text = $leftovers . $content;
                if ($text !== '') {
                    $node->insertBefore(new Text($leftovers . $content));
                }

                $leftovers = '';
                continue;
            }


            $leftovers = '';

            $page = Page::whereSlug($content)->first();
            $pageNotExists = $page === null;
            $title = $pageNotExists ? self::getTitleFromSlug($content) : $page->title;

            $link = new Link(route('wiki.show', $content));
            if ($pageNotExists) {
                $link->appendChild(new HtmlInline('<span class="text-red">' . $title . '</span>'));
            } else {
                $link->appendChild(new Text($title));
            }
            $node->insertBefore($link);
        }

        $node->detach();
    }

}
