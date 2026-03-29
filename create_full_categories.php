<?php
use Magento\Framework\App\Bootstrap;

require __DIR__ . '/app/bootstrap.php';

$params = $_SERVER;
$bootstrap = Bootstrap::create(BP, $params);
$objectManager = $bootstrap->getObjectManager();

$appState = $objectManager->get(\Magento\Framework\App\State::class);
$appState->setAreaCode('adminhtml');

$categoryFactory = $objectManager->get(\Magento\Catalog\Model\CategoryFactory::class);
$categoryRepository = $objectManager->get(\Magento\Catalog\Api\CategoryRepositoryInterface::class);

// ✅ Default Category
$parentId = 2;

// ✅ Load JSON
$data = json_decode(file_get_contents('categories.json'), true);

// ✅ Create Category Function
function createCategory($categoryFactory, $categoryRepository, $name, $parentId) {
    $category = $categoryFactory->create();
    $category->setName($name);
    $category->setIsActive(true);
    $category->setParentId($parentId);
    $category->setIncludeInMenu(true);
    $category->setUrlKey(strtolower(preg_replace('/[^a-z0-9]+/', '-', $name)));

    return $categoryRepository->save($category);
}

// =========================
// 🚀 START IMPORT
// =========================

foreach ($data as $main) {

    // 🔹 Main Category
    $mainCat = createCategory(
        $categoryFactory,
        $categoryRepository,
        $main['category_name'],
        $parentId
    );

    echo "Main: {$main['category_name']}\n";

    // 🔹 Sub Categories
    foreach ($main['children'] as $sub) {

        $subCat = createCategory(
            $categoryFactory,
            $categoryRepository,
            $sub['category_name'],
            $mainCat->getId()
        );

        echo "  Sub: {$sub['category_name']}\n";

        // 🔹 Micro Categories
        foreach ($sub['children'] as $micro) {

            createCategory(
                $categoryFactory,
                $categoryRepository,
                $micro['category_name'],
                $subCat->getId()
            );

            echo "    Micro: {$micro['category_name']}\n";
        }
    }
}