export const filterCartItems = (cartItems) => {
  const cartItem = cartItems.map((item) => {
    return {
      productId: item.productId._id,
      qty: item.qty,
      size: item.size,
      productName: item.productId.productName,
      sellingPrice: item.productId.sellingPrice,
      productImage: item.productId.productPictures[0]?.img,
    };
  });

  return cartItem;
};
