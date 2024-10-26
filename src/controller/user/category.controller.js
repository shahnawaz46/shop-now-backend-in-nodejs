// internal
import { Category } from '../../model/category.model.js';
import { generateURL } from '../../utils/GenerateURL.js';
import getAllCategory from '../../utils/getAllCategory.js';
import { errorTemplate } from '../../utils/MailTemplate.js';
import { sendMail } from '../../utils/SendMail.js';

export const getCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const allCategory = await Category.find({});
    if (allCategory) {
      const categoryList = getAllCategory(allCategory, null, slug);

      return res.status(200).json({ categories: categoryList });
    }

    return res.status(404).json({ error: 'No Category Found' });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Category',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const searchCategory = async (req, res) => {
  const { search } = req.query;
  try {
    // .*: Matches any characters zero or more times (wildcard)
    // $options: 'i': Enables case-insensitive matching
    const category = await Category.find({
      $and: [
        { categoryName: { $regex: `${search}.*`, $options: 'i' } },
        { categoryName: { $nin: ["Men's Wardrobe", "Women's Wardrobe"] } }, // Exclude documents with name "Nothing"
      ],
    }).select('categoryName slug');

    return res.status(200).json({ result: category });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Search Category',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
