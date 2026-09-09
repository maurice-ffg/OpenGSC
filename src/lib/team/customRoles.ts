export const BUILT_IN_ROLE_NAMES = ["Owner", "Admin", "Editor", "Viewer"] as const;
export const CUSTOM_ROLES_STORAGE_KEY = "opengsc_custom_roles";

export function readCustomRoles(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CUSTOM_ROLES_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((role): role is string => typeof role === "string" && role.trim().length > 0) : [];
  } catch {
    return [];
  }
}

export function writeCustomRoles(roles: string[]): void {
  try {
    localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(roles));
  } catch {
    // The role list remains usable for the current page when browser storage is unavailable.
  }
}
