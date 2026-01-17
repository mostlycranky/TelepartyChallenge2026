/**
 * Creates a unique nickname by prefixing it with userId
 * Format: userId::displayName
 */
export const createUniqueNickname = (displayName: string, userId: string): string => {
  return `${userId}::${displayName}`;
};

/**
 * Extracts the display name from a unique nickname
 * Format: userId::displayName -> displayName
 */
export const getDisplayName = (uniqueNickname: string): string => {
  const parts = uniqueNickname.split('::');
  return parts.length > 1 ? parts[1] : uniqueNickname;
};
