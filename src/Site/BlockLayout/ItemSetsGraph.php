<?php declare(strict_types=1);

namespace ItemSetsGraph\Site\BlockLayout;

use Laminas\View\Renderer\PhpRenderer;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Api\Representation\SitePageRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\SitePageBlock;
use Omeka\Site\BlockLayout\AbstractBlockLayout;
use Omeka\Stdlib\ErrorStore;

class ItemSetsGraph extends AbstractBlockLayout
{
    /**
     * The default partial view script.
     */
    const PARTIAL_NAME = 'common/block-layout/item-sets-graph';

    public function getLabel()
    {
        return 'Item Sets Graph'; // @translate
    }

    public function onHydrate(SitePageBlock $block, ErrorStore $errorStore): void
    {
        // TODO ArrayTextarea is not yet filtered here.
        $data = $block->getData();
        if (empty($data['json'])) {
            $data['json'] = [];
        } elseif (!is_array($data['json'])) {
            $result = [];
            foreach (array_filter(array_map('trim', explode("\n", trim($data['json'])))) as $keyValue) {
                if (strpos($keyValue, '=') === false) {
                    $result[trim($keyValue)] = '';
                } else {
                    [$key, $value] = array_map('trim', explode('=', $keyValue, 2));
                    $result[$key] = $value;
                }
            }
            $data['json'] = $result;
        }
        $block->setData($data);
    }

    public function form(
        PhpRenderer $view,
        SiteRepresentation $site,
        SitePageRepresentation $page = null,
        SitePageBlockRepresentation $block = null
    ) {
        // Factory is not used to make rendering simpler.
        $services = $site->getServiceLocator();
        $formElementManager = $services->get('FormElementManager');
        $defaultSettings = $services->get('Config')['itemsetsgraph']['block_settings']['itemSetsGraph'];
        $blockFieldset = \ItemSetsGraph\Form\ItemSetsGraphFieldset::class;

        $data = $block ? $block->data() + $defaultSettings : $defaultSettings;

        $dataForm = [];
        foreach ($data as $key => $value) {
            $dataForm['o:block[__blockIndex__][o:data][' . $key . ']'] = $value;
        }

        $fieldset = $formElementManager->get($blockFieldset);
        $fieldset->populateValues($dataForm);

        return $view->formCollection($fieldset, false);
    }

    public function prepareRender(PhpRenderer $view): void
    {
        $view->headLink()->appendStylesheet($view->assetUrl('css/style.css', 'ItemSetsGraph'));
        $view->headScript()->appendFile($view->assetUrl('js/style.js', 'ItemSetsGraph'), 'text/javascript');
    }

    public function render(PhpRenderer $view, SitePageBlockRepresentation $block)
    {
        $vars = ['block' => $block] + $block->data();
        return $view->partial(self::PARTIAL_NAME, $vars);
    }
}
