<?php


namespace App\CommonMark\SciKiExtension;


use App\Exceptions\SciKiMarkdownRendererException;
use App\Models\Page;
use Illuminate\Support\Str;
use League\CommonMark\Block\Element\AbstractBlock;
use League\CommonMark\Block\Element\FencedCode;
use League\CommonMark\Block\Renderer\BlockRendererInterface;
use League\CommonMark\ElementRendererInterface;
use League\CommonMark\HtmlElement;
use League\CommonMark\Util\ConfigurationAwareInterface;
use League\CommonMark\Util\ConfigurationInterface;

class ScikiFencedCodeRenderer implements BlockRendererInterface, ConfigurationAwareInterface
{

    public static array $detectedBlocks = [];

    public const SCIKI_BLOCK_SEPARATOR = '{{SCIKI_BLOCK_%s}}';
    public const SCIKI_BLOCK_REGEXP = '/{{SCIKI_BLOCK_([a-z0-9\-]+)}}/ixu';

    public const SCIKI = 'SciKi';
    public const SCIKI_MEDIA = 'SciKiMedia';
    public const KATEX = 'KaTeX';
    public const MERMAID = 'mermaid';

    public const SUPPORTED_INFO = [
        self::SCIKI,
        self::SCIKI_MEDIA,
        self::KATEX,
        self::MERMAID,
    ];

    public static function getDetectedBlock(string $id): ?array
    {
        return self::$detectedBlocks[$id] ?? null;
    }

    public static function clearDetectedBlocks(): void
    {
        self::$detectedBlocks = [];
    }

    private static function resolvePlugin(string $pluginName): string
    {
        if (str_starts_with($pluginName, '@')) {
            return $pluginName;
        }

        return '#' . ucfirst($pluginName);
    }

    private static function addDetectedBlock(string $pluginName, array $config): string
    {
        $id = Str::uuid()->toString();
        self::$detectedBlocks[$id] = [
            'component' => self::resolvePlugin($pluginName),
            'props'     => $config,
        ];

        return $id;
    }

    /** @var ConfigurationInterface */
    private $config;

    public function setConfiguration(ConfigurationInterface $configuration): void
    {
        $this->config = $configuration;
    }

    public function render(AbstractBlock $block, ElementRendererInterface $htmlRenderer, bool $inTightList = false)
    {
        if (!($block instanceof FencedCode)) {
            throw new \InvalidArgumentException('Incompatible block type: ' . \get_class($block));
        }

        $info = $block->getInfo();

        try {
            return match ($info) {
                self::SCIKI_MEDIA => $this->prepareSciKiMedia($block),
                self::SCIKI => $this->prepareSciki($block),
                self::MERMAID => $this->prepareMermaid($block),
                self::KATEX => $this->prepareKatex($block),
                default => $this->prepareHighlightedCode($block),
            };
        } catch (\Exception $e) {
            return new HtmlElement(
                'code',
                ['class' => 'text-danger'],
                'Error: ' . $e->getMessage()
            );
        }
    }

    /**
     * @param \League\CommonMark\Block\Element\FencedCode $code
     *
     * @return \League\CommonMark\HtmlElement|null
     * @throws \App\Exceptions\SciKiMarkdownRendererException
     * @throws \JsonException
     */
    public function prepareSciKiMedia(FencedCode $code): ?HtmlElement
    {
        $content = json_decode($code->getStringContent(), true, 512, JSON_THROW_ON_ERROR);
        if (!isset($content['media'])) {
            throw new SciKiMarkdownRendererException('Media parameter is required');
        }
        $currentPage = $this->config->get('sciki/current_page');
        if (!$currentPage instanceof Page) {
            return null;
        }
        $media = $currentPage->media()->whereUuid($content['media'])->first();
        if ($media === null) {
            throw new SciKiMarkdownRendererException(sprintf('Media %s not found', $content['media']));
        }
        $position = $content['position'] ?? 'left';
        $caption = $content['caption'] ?? $media->getCustomProperty('title');

        return new HtmlElement(
            'div',
            [
                'class' => 'figure ' . (($position === 'right') ? 'fig_right' : 'fig_left'),
            ],
            new HtmlElement(
                'div',
                ['class' => 'fig_container'],
                [
                    new HtmlElement(
                        'a',
                        ['href' => route('page.media.show', $media), 'class' => 'fig', 'target' => '_blank'],
                        $media('thumb-large')
                    ),
                    new HtmlElement(
                        'div',
                        ['class' => 'fig_caption'],
                        $caption
                    ),
                ]
            )
        );
    }

    public function prepareMermaid(FencedCode $code): string
    {
        return sprintf(
            self::SCIKI_BLOCK_SEPARATOR,
            self::addDetectedBlock(
                'Mermaid',
                [
                    'content' => $code->getStringContent(),
                ]
            )
        );
    }

    public function prepareKatex(FencedCode $code): string
    {
        return sprintf(
            self::SCIKI_BLOCK_SEPARATOR,
            self::addDetectedBlock(
                'Katex',
                [
                    'content' => $code->getStringContent(),
                ]
            )
        );
    }

    /**
     * @throws \JsonException
     */
    public function prepareSciki(FencedCode $code): string
    {
        $pluginData = json_decode($code->getStringContent(), true, 512, JSON_THROW_ON_ERROR);
        if (!isset($pluginData['plugin']) || empty($pluginData['plugin'])) {
            return sprintf(
                self::SCIKI_BLOCK_SEPARATOR,
                self::addDetectedBlock(
                    'Error',
                    [
                        'message' => 'Invalid SciKi Block configuration: the "plugin" parameter is required.',
                    ]
                )
            );
        }

        return sprintf(
            self::SCIKI_BLOCK_SEPARATOR,
            self::addDetectedBlock(
                $pluginData['plugin'],
                $pluginData
            )
        );
    }

    public function prepareHighlightedCode(FencedCode $code): string
    {
        return sprintf(
            self::SCIKI_BLOCK_SEPARATOR,
            self::addDetectedBlock(
                'HighlightedCode',
                [
                    'lang'    => $code->getInfo(),
                    'content' => $code->getStringContent(),
                ]
            )
        );
    }

}
