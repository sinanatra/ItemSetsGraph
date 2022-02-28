<?php
return [
    'block_layouts' => [
        'invokables' => [
            'itemSetsGraph' => 'ItemSetsGraph\Site\BlockLayout\ItemSetsGraph'
        ],
    ],
    'view_manager' => [
        'template_path_stack' => [
            OMEKA_PATH . '/modules/ItemSetsGraph/view',
        ],
    ],
];
