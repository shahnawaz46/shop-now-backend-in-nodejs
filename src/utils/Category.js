// here i am using recursive approach to get all categories in the array

export const getAllCategoryRecursive = (
  categories,
  parentId = null,
  slug = null
) => {
  const categoryList = [];
  let filterCategory;

  if (parentId === null) {
    filterCategory =
      slug === null
        ? categories.filter((value) => value.parentCategoryId === undefined)
        : categories.filter(
            (value) =>
              value.parentCategoryId === undefined && value.slug === slug
          );
  } else {
    filterCategory = categories.filter(
      (value) => value.parentCategoryId == parentId
    );
  }

  // console.log(filterCategory);
  for (let item of filterCategory) {
    categoryList.push({
      _id: item._id,
      categoryName: item.categoryName,
      slug: item.slug,
      parentCategoryId: item.parentCategoryId,
      children: getAllCategoryRecursive(categories, item._id),
    });
  }

  return categoryList;
};

export const getAllCategory = (categories, slug = null) => {
  const parentCategory = categories.find(
    (category) =>
      category.parentCategoryId === undefined && category.slug === slug
  );

  const childCategories = categories.filter((category) => {
    const parentId = category.parentCategoryId;
    if (parentId !== undefined && parentCategory._id.equals(parentId)) {
      return category;
    }
  });

  return childCategories;
};

const CategoryType = {
  "Men's Wardrobe": "Men Products",
  "Men's-Wardrobe": "Men",
  "Women's Wardrobe": "Women Products",
  "Women's-Wardrobe": "Women",
};

export const getParentCategory = (categories) => {
  const filterCategory = categories.filter(
    (category) => category.parentCategoryId === undefined
  );

  const updatedCategory = filterCategory.map((category) => ({
    _id: category._id,
    categoryName: CategoryType[category.categoryName],
    slug: CategoryType[category.slug],
  }));

  return updatedCategory;
};
