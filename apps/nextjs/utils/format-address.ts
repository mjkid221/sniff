/**
 * Format an address to a more readable format
 * @param address - The address to format
 * @param leadLength - The length of the leading characters to display
 * @param trailLength - The length of the trailing characters to display
 */
export const formatAddress = (
  address?: string,
  leadLength = 8,
  trailLength = 5,
): string | null => {
  if (!address) {
    return null;
  }
  return `${address.slice(0, leadLength)}...${address.slice(
    address.length - trailLength,
    address.length,
  )}`;
};
