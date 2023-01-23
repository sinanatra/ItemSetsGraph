<?php declare(strict_types=1);

return [
    'block_layouts' => [
        'invokables' => [
            'itemSetsGraph' => 'ItemSetsGraph\Site\BlockLayout\ItemSetsGraph',
        ],
    ],
    'view_manager' => [
        'template_path_stack' => [
            OMEKA_PATH . '/modules/ItemSetsGraph/view',
        ],
    ],
    'itemsetsgraph' => [
        'block_settings' => [
            'itemSetsGraph' => [
                'heading' => '',
                'json' => [],
                'imgCheck' => false,
                'openNodes' => false,
            ],
        ],
    ],
];
