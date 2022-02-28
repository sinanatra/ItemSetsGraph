<?php
namespace ItemSetsGraph\Form;

use Omeka\Form\Element\HtmlTextarea;
use Laminas\Form\Form;

class ConfigForm extends Form
{
    protected $itemSetsGraphIsActive;

    public function init()
    {
        $this->add([
            'name' => 'item_sets_graph_json',
            'type' => HtmlTextarea::class,
            'options' => [
                'label' => 'JSON Data', // @translate
                'empty_option' => '', // @translate
            ],
        ]);

        $inputFilter = $this->getInputFilter();
        $inputFilter->add([
            'name' => 'item_sets_graph_json',
            'required' => false,
        ]);
    }

    /**
     * @param bool $itemSetsGraphIsActive
     */
    public function setItemSetsGraphIsActive($itemSetsGraphIsActive)
    {
        $this->itemSetsGraphIsActive = $itemSetsGraphIsActive;
    }

    /**
     * @return bool
     */
    public function getItemSetsGraphIsActive()
    {
        return $this->itemSetsGraphIsActive;
    }
}
