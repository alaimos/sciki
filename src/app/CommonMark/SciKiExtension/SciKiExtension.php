<?php

namespace App\CommonMark\SciKiExtension;

use League\CommonMark\Block\Element\FencedCode;
use League\CommonMark\ConfigurableEnvironmentInterface;
use League\CommonMark\Event\DocumentParsedEvent;
use League\CommonMark\Extension\ExtensionInterface;

final class SciKiExtension implements ExtensionInterface
{
    public function register(ConfigurableEnvironmentInterface $environment): void
    {
        //$environment->addBlockParser(new SciKiCodeBlockParser(), 99);
        $environment->addBlockRenderer(FencedCode::class, new ScikiFencedCodeRenderer(), 99);
        $environment->addEventListener(DocumentParsedEvent::class, new SciKiUrlProcessor());
    }
}
