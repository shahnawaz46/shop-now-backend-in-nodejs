// here i am using recursive approach to get all categories in the array
const getAllCategory = (categories, parentId = null, targetAudience = null) => {
  const categoryList = [];
  let filterCategory;

  if (parentId === null) {
    filterCategory =
      targetAudience === null
        ? categories.filter((value) => value.parentCategoryId === undefined)
        : categories.filter(
            (value) =>
              value.parentCategoryId === undefined &&
              value.slug === targetAudience
          );
  } else {
    filterCategory = categories.filter(
      (value) => value.parentCategoryId == parentId
    );
  }

  for (let item of filterCategory) {
    categoryList.push({
      _id: item._id,
      categoryName: item.categoryName,
      slug: item.slug,
      parentCategoryId: item.parentCategoryId,
      children: getAllCategory(categories, item._id),
    });
  }

  return categoryList;
};

export default getAllCategory;
