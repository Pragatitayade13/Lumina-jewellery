/**
 * Validates a coupon locally before sending it to the backend.
 * @param {Object} coupon - The coupon object from Firestore.
 * @param {string} customerId - The ID of the current user.
 * @param {Array} cartItems - The current items in the cart.
 * @param {number} subtotal - The current subtotal of the cart.
 * @param {string} storeId - The current active store ID.
 * @returns {Object} { isValid: boolean, message: string, discountAmount: number }
 */
export const validateCouponLocally = (coupon, customerId, cartItems, subtotal, storeId) => {
  const now = new Date();

  // 1. Check if coupon exists and is active
  if (!coupon || coupon.status !== 'active') {
    return { isValid: false, message: 'This coupon is invalid or inactive.' };
  }

  // 2. Check Expiry Date
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return { isValid: false, message: 'This coupon has expired.' };
  }

  // 3. Check Start Date
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { isValid: false, message: 'This coupon is not active yet.' };
  }

  // 4. Check Minimum Order Amount
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return { isValid: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} is required.` };
  }

  // 5. Check Total Usage Limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { isValid: false, message: 'This coupon has reached its maximum usage limit.' };
  }

  // Calculate Discount
  let discountAmount = 0;
  if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    // Apply max discount constraint
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  }

  // Ensure discount doesn't exceed subtotal
  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  return { isValid: true, message: 'Coupon applied successfully!', discountAmount };
};
