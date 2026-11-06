import type { BranchNode } from '../types/content';

/**
 * Admin-added branches live in localStorage so the static site needs no
 * backend. NOTE: they persist only in the browser where they were added —
 * use "Copy publish snippet" in the admin panel to paste them into
 * src/data/siteData.ts for a permanent, everyone-can-see version.
 */
const KEY = 'mus-site-custom-branches';
const AUTH_KEY = 'mus-site-admin-auth';

export function loadCustomBranches(): BranchNode[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BranchNode[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomBranches(branches: BranchNode[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(branches));
    window.dispatchEvent(new Event('mus-branches-changed'));
  } catch {
    /* storage full or unavailable */
  }
}

export function addCustomBranch(branch: BranchNode): void {
  saveCustomBranches([...loadCustomBranches(), branch]);
}

export function deleteCustomBranch(id: string): void {
  saveCustomBranches(loadCustomBranches().filter((b) => b.id !== id));
}

export function isAdminAuthed(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminAuthed(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(AUTH_KEY, '1');
    else sessionStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}
