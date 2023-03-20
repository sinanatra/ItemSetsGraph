<?php declare(strict_types=1);

namespace ItemSetsGraph;

use Omeka\Stdlib\Message;

/**
 * @var Module $this
 * @var \Laminas\ServiceManager\ServiceLocatorInterface $services
 * @var string $newVersion
 * @var string $oldVersion
 *
 * @var \Omeka\Api\Manager $api
 * @var \Omeka\Settings\Settings $settings
 * @var \Doctrine\DBAL\Connection $connection
 * @var \Doctrine\ORM\EntityManager $entityManager
 * @var \Omeka\Mvc\Controller\Plugin\Messenger $messenger
 */
$plugins = $services->get('ControllerPluginManager');
$api = $plugins->get('api');
$settings = $services->get('Omeka\Settings');
$connection = $services->get('Omeka\Connection');
$messenger = $plugins->get('messenger');
$entityManager = $services->get('Omeka\EntityManager');

if (version_compare($oldVersion, '1.1', '<')) {
    // Update blocks.
    /** @var \Omeka\View\Helper\Hyperlink $hyperlink */
    $hyperlink = $services->get('ViewHelperManager')->get('hyperlink');
    $pages = [];
    $qb = $connection->createQueryBuilder();
    $qb
        ->select(
            'id',
            'data',
            'page_id',
        )
        ->from('site_page_block', 'site_page_block')
        ->orderBy('site_page_block.id', 'asc')
        ->where('site_page_block.layout = "itemSetsGraph"')
    ;
    $blockDatas = $connection->executeQuery($qb)->fetchAllAssociativeIndexed();
    foreach ($blockDatas as $id => $blockData) {
        $block = [];
        $pageId = (int) $blockData['page_id'];
        $blockData = json_decode($blockData['data'], true);
        $block = [
            'heading' => '',
            'json' => [],
            'imgCheck' => !empty($blockData['item_sets_graph_imgCheck']),
            'openNodes' => !empty($blockData['item_sets_graph_openNodes']),
        ];
        $json = empty($blockData['item_sets_graph_json']) ? '' : $blockData['item_sets_graph_json'];
        foreach (array_filter(array_map('trim', explode("\n", $json))) as $row) {
            $splitJson = explode(',', $row, 2);
            $block['json'][intval($splitJson[0])] = $splitJson[1] ?? '0';
        }

        $sql = <<<SQL
UPDATE `site_page_block`
SET
    `layout` = "itemSetsGraph",
    `data` = :data
WHERE `id` = :id;
SQL;
        $bind = [
            'data' => json_encode($block),
            'id' => $id,
        ];
        $connection->executeStatement($sql, $bind);

        if (!isset($pages[$pageId])) {
            try {
                /** @var \Omeka\Api\Representation\SitePageRepresentation $page */
                $page = $api->read('site_pages', ['id' => $pageId])->getContent();
                $pages[$pageId] = $hyperlink->raw($page->title(), $page->siteUrl());
            } catch (\Omeka\Api\Exception\NotFoundException $e) {
            }
        }
    }

    if ($pages) {
        $message = new Message(
            'The form has been improved and the template has been renamed. Check your pages and your theme if needed in pages: %s', // @translate
            '<ul><li>' . implode('</li><li>', $pages) . '</li></ul>'
        );
        $message->setEscapeHtml(false);
        $messenger->addWarning($message);
    }
}
