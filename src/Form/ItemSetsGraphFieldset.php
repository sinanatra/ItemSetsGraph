<?php declare(strict_types=1);

namespace ItemSetsGraph\Form;

use Laminas\Form\Element;
use Laminas\Form\Fieldset;
use Omeka\Form\Element as OmekaElement;

class ItemSetsGraphFieldset extends Fieldset
{
    public function init(): void
    {
        $this
            ->add([
                'name' => 'o:block[__blockIndex__][o:data][heading]',
                'type' => Element\Text::class,
                'options' => [
                    'label' => 'Block title', // @translate
                ],
                'attributes' => [
                    'id' => 'item-sets-graph-heading',
                ],
            ])
            ->add([
                'name' => 'o:block[__blockIndex__][o:data][json]',
                'type' => OmekaElement\ArrayTextarea::class,
                'options' => [
                    'label' => 'Item sets and hex colors', // @translate
                    'info' => 'Follow the structure: item set id = Hex color', // @translate
                    'as_key_value' => true,
                    'key_value_separator' => '=',
                ],
                'attributes' => [
                    'id' => 'item-sets-graph-json',
                    'required' => true,
                    'rows' => 5,
                ],
            ])
            ->add([
                'name' => 'o:block[__blockIndex__][o:data][imgCheck]',
                'type' => Element\Checkbox::class,
                'options' => [
                    'label' => 'Display Images as nodes', // @translate
                ],
                'attributes' => [
                    'id' => 'item-sets-graph-img-check',
                ],
            ])
            ->add([
                'name' => 'o:block[__blockIndex__][o:data][openNodes]',
                'type' => Element\Checkbox::class,
                'options' => [
                    'label' => 'Load all nodes (Slows down performance)', // @translate
                ],
                'attributes' => [
                    'id' => 'item-sets-graph-open-nodes',
                ],
            ])
        ;
    }
}
