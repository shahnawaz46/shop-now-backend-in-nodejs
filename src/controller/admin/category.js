const slugify = require('slugify');

// components
const CategoryCollection = require('../../model/category');
const getAllCategory = require('../../utils/getAllCategory');

exports.createCategory = async (req, res) => {
  try {
    const categoryObj = {
      categoryName: req.body.categoryName,
      slug: slugify(req.body.categoryName),
    };

    if (req.body.parentCategoryId) {
      categoryObj.parentCategoryId = req.body.parentCategoryId;
    }

    const category = new CategoryCollection(categoryObj);
    category.save((error, product) => {
      if (error) {
        return res
          .status(400)
          .json({ error: 'Category Already Exist Please Use Another Name' });
      }
      if (product) {
        return res
          .status(200)
          .json({ message: 'Category Created Successfully' });
      }
    });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const allCategory = await CategoryCollection.find({});
    if (allCategory) {
      const categoryList = getAllCategory(allCategory);

      return res.status(200).json({ categories: categoryList });
    }

    return res.status(404).json({ error: 'No Category Found' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await CategoryCollection.findByIdAndDelete({ _id: req.body.categoryId });
    return res.status(200).json({ message: 'Category Deleted Successfully' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

exports.editCategory = async (req, res) => {
  const { _id, categoryName, parentCategoryId } = req.body;
  try {
    const categoryObj = {
      categoryName,
      slug: slugify(categoryName),
    };
    if (parentCategoryId) {
      categoryObj.parentCategoryId = parentCategoryId;
    }
    await CategoryCollection.findByIdAndUpdate({ _id }, categoryObj, {
      new: true,
    });
    return res.status(200).json({ message: 'Category Edit Successfully' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
