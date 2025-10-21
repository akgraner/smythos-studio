/**
 * Vault Key Resolver Utilities
 *
 * Provides utilities for detecting and resolving vault key placeholders in OAuth connections.
 * Vault keys follow the pattern: {{KEY(keyName)}}
 */

/**
 * Regular expression pattern to match vault key placeholders
 * Matches: {{KEY(keyName)}}
 */
const VAULT_KEY_PATTERN = /{{KEY\((.*?)\)}}/;

/**
 * Checks if a string contains a vault key placeholder
 * @param value - The value to check
 * @returns True if the value contains a vault key placeholder
 */
export function isVaultKey(value: string | undefined): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return VAULT_KEY_PATTERN.test(value);
}

/**
 * Extracts the key name from a vault key placeholder
 * @param value - The vault key placeholder string
 * @returns The extracted key name, or null if no match
 */
export function extractVaultKeyName(value: string): string | null {
  const match = value.match(VAULT_KEY_PATTERN);
  return match ? match[1] : null;
}

/**
 * Fetches a vault key value from the backend
 * @param keyName - The name of the vault key to fetch
 * @returns The vault key data
 */
export async function fetchVaultKey(keyName: string): Promise<string | undefined> {
  try {
    const response = await fetch(`/api/page/vault/keys/name/${encodeURIComponent(keyName)}`);

    if (!response.ok) {
      console.error(`Failed to fetch vault key ${keyName}:`, response.statusText);
      return undefined;
    }

    const result = await response.json();

    if (result.success && result.data?.data) {
      // The backend returns the key value in result.data.data
      return result.data.data.key;
    }

    return undefined;
  } catch (error) {
    console.error(`Error fetching vault key ${keyName}:`, error);
    return undefined;
  }
}

/**
 * OAuth connection fields that may contain vault keys
 */
export const VAULT_PROTECTED_FIELDS = [
  'clientID',
  'clientSecret',
  'consumerKey',
  'consumerSecret',
] as const;

export type VaultProtectedField = (typeof VAULT_PROTECTED_FIELDS)[number];

/**
 * Checks if an OAuth connection has any vault keys
 * @param oauthInfo - The OAuth connection info object
 * @returns True if any field contains a vault key
 */
export function hasVaultKeys(oauthInfo: Record<string, any>): boolean {
  return VAULT_PROTECTED_FIELDS.some((field) => {
    const value = oauthInfo[field];
    return isVaultKey(value);
  });
}

/**
 * Resolves all vault keys in an OAuth connection
 * @param oauthInfo - The OAuth connection info object
 * @returns A new object with resolved vault keys
 */
export async function resolveVaultKeys(
  oauthInfo: Record<string, any>,
): Promise<Record<string, any>> {
  const resolved = { ...oauthInfo };

  // Create an array of promises to resolve all vault keys in parallel
  const resolutionPromises = VAULT_PROTECTED_FIELDS.map(async (field) => {
    const value = oauthInfo[field];

    if (isVaultKey(value)) {
      const keyName = extractVaultKeyName(value);

      if (keyName) {
        try {
          const resolvedValue = await fetchVaultKey(keyName);

          if (resolvedValue !== undefined) {
            resolved[field] = resolvedValue;
          } else {
            // Keep the placeholder if we couldn't resolve it
            console.warn(`Could not resolve vault key for field ${field}: ${keyName}`);
          }
        } catch (error) {
          console.error(`Error resolving vault key for field ${field}:`, error);
        }
      }
    }
  });

  // Wait for all resolutions to complete
  await Promise.all(resolutionPromises);

  return resolved;
}

/**
 * Type guard to check if a field is a vault-protected field
 * @param field - The field name to check
 * @returns True if the field is vault-protected
 */
export function isVaultProtectedField(field: string): field is VaultProtectedField {
  return VAULT_PROTECTED_FIELDS.includes(field as VaultProtectedField);
}
