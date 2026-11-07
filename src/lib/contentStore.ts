import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { auth, db, ADMIN_EMAIL } from './firebase';
import type { BlogPost, BranchNode } from '../types/content';

export interface LiveContent {
  branches: BranchNode[] | null;
  posts: BlogPost[] | null;
}

/**
 * Real-time subscription to the public Firestore content.
 * Returns null arrays until the first snapshot arrives, so callers can
 * fall back to the bundled seed data while loading (or if Firestore is
 * unreachable, e.g. on the GitHub Pages mirror).
 */
export function subscribeContent(onData: (c: LiveContent) => void): () => void {
  let branches: BranchNode[] | null = null;
  let posts: BlogPost[] | null = null;
  let unsubs = 0;

  const emit = () => {
    if (branches !== null && posts !== null) onData({ branches, posts });
  };

  const done = () => {
    if (++unsubs === 2) emit();
  };

  const unsubB = onSnapshot(collection(db, 'branches'), (snap) => {
    branches = snap.docs
      .map((d) => d.data() as BranchNode)
      .sort((a, b) => a.id.localeCompare(b.id));
    done();
  });

  const unsubP = onSnapshot(query(collection(db, 'posts'), orderBy('date', 'desc')), (snap) => {
    posts = snap.docs.map((d) => d.data() as BlogPost);
    done();
  });

  return () => {
    unsubB();
    unsubP();
  };
}

/* ── auth ─────────────────────────────────────────────────── */

export async function adminSignIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  // hard gate: even if another user somehow exists, only the admin email passes
  if (cred.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await fbSignOut(auth);
    throw new Error('unauthorized');
  }
  return cred.user;
}

export function adminSignOut() {
  return fbSignOut(auth);
}

/* ── CRUD (Firestore rules enforce the admin email) ───────── */

export async function saveBranch(branch: BranchNode) {
  await setDoc(doc(db, 'branches', branch.id), branch);
}

export async function deleteBranch(id: string) {
  await deleteDoc(doc(db, 'branches', id));
}

export async function savePost(post: BlogPost) {
  await setDoc(doc(db, 'posts', post.id), post);
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, 'posts', id));
}
