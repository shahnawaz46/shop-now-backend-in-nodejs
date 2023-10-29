// components
const CategoryCollection = require('../../model/category');
const getAllCategory = require('../../utils/getAllCategory');

exports.getCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const allCategory = await CategoryCollection.find({});
    if (allCategory) {
      const categoryList = getAllCategory(allCategory, null, slug);

      return res.status(200).json({ categories: categoryList });
    }

    return res.status(404).json({ error: 'No Category Found' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
