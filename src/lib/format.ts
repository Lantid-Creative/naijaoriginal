/**
 * Format a number as Nigerian Naira
 */
export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
