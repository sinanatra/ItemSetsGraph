<?php declare(strict_types=1);

namespace ItemSetsGraph;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Omeka\Module\AbstractModule;

class Module extends AbstractModule
{
    public function getConfig()
    {
        return include __DIR__ . '/config/module.config.php';
    }

    public function upgrade($oldVersion, $newVersion, ServiceLocatorInterface $services)
    {
        require_once __DIR__ . '/data/scripts/upgrade.php';
    }
}
