import type { User, Session, UserRole } from '@/types';
import { db, DB_PREFIX } from './firebase';
import { ref, get, set, update, remove } from 'firebase/database';

const SESSION_KEY = 'whhc_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
const USERS_REF = `${DB_PREFIX}/users`;

// SHA-256 hash for passwords
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Sanitize username for use as Firebase key (Firebase keys cannot contain . $ # [ ] /)
function sanitizeKey(username: string): string {
  return username.toLowerCase().replace(/[.#$\[\]/]/g, '_');
}

// Default users - seeded on first load
const DEFAULT_USERS: Record<string, { displayName: string; password: string; role: UserRole }> = {
  'naqvi@htxheart.com': { displayName: 'Humayun Naqvi, MD', password: 'Whhc1140!!', role: 'admin' },
  'admin@htxheart.com': { displayName: 'Mariam Rizvi', password: 'Whhc1140!!', role: 'admin' },
  'whhcpatientcare@htxheart.com': { displayName: 'Marie Londo', password: 'Whhc1140!!', role: 'clinical' },
};

async function getUsers(): Promise<Record<string, any>> {
  try {
    const snapshot = await get(ref(db, USERS_REF));
    return snapshot.exists() ? snapshot.val() : {};
  } catch {
    return {};
  }
}

export async function seedDefaultUsers(): Promise<void> {
  const existing = await getUsers();

  // Remove duplicate 'hnaqvi' account (naqvi@htxheart.com is the master)
  if (existing['hnaqvi']) {
    delete existing['hnaqvi'];
    await remove(ref(db, `${USERS_REF}/hnaqvi`));
  }

  // Migrate old roles (tracker → admin, clinic_staff → clinical)
  if (Object.keys(existing).length > 0) {
    let changed = false;
    for (const key of Object.keys(existing)) {
      const user = existing[key];
      if (user.role === 'tracker') {
        user.role = 'admin';
        changed = true;
      } else if (user.role === 'clinic_staff') {
        user.role = 'clinical';
        changed = true;
      }
    }
    // Add any missing default users and sync displayNames and roles
    for (const [username, info] of Object.entries(DEFAULT_USERS)) {
      const key = sanitizeKey(username);
      if (!existing[key]) {
        existing[key] = {
          id: username.toLowerCase(),
          username: username.toLowerCase(),
          displayName: info.displayName,
          passwordHash: await hashPassword(info.password),
          role: info.role,
          createdAt: new Date().toISOString(),
        };
        changed = true;
      } else {
        if (existing[key].displayName !== info.displayName) {
          existing[key].displayName = info.displayName;
          changed = true;
        }
        if (existing[key].role !== info.role) {
          existing[key].role = info.role;
          changed = true;
        }
      }
    }
    if (changed) {
      await set(ref(db, USERS_REF), existing);
    }
    return;
  }

  const users: Record<string, object> = {};
  for (const [username, info] of Object.entries(DEFAULT_USERS)) {
    const key = sanitizeKey(username);
    users[key] = {
      id: username,
      username,
      displayName: info.displayName,
      passwordHash: await hashPassword(info.password),
      role: info.role,
      createdAt: new Date().toISOString(),
    };
  }
  await set(ref(db, USERS_REF), users);
}

export async function login(username: string, password: string): Promise<Session | null> {
  const users = await getUsers();
  const key = sanitizeKey(username);
  const user = users[key];
  if (!user) return null;

  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return null;

  const now = Date.now();
  const session: Session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    loginTime: now,
    expiresAt: now + SESSION_DURATION,
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  // Update last login
  await update(ref(db, `${USERS_REF}/${key}`), {
    lastLogin: new Date().toISOString(),
  });

  return session;
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function addUser(
  username: string,
  displayName: string,
  password: string,
  role: UserRole
): Promise<boolean> {
  try {
    const hash = await hashPassword(password);
    const key = sanitizeKey(username);
    await set(ref(db, `${USERS_REF}/${key}`), {
      id: username.toLowerCase(),
      username: username.toLowerCase(),
      displayName,
      passwordHash: hash,
      role,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteUser(username: string): Promise<boolean> {
  try {
    const key = sanitizeKey(username);
    await remove(ref(db, `${USERS_REF}/${key}`));
    return true;
  } catch {
    return false;
  }
}

export async function getAllUsers(): Promise<User[]> {
  const users = await getUsers();
  return Object.values(users).map((u: any) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    phone: u.phone,
    dateOfBirth: u.dateOfBirth,
    yearsExperience: u.yearsExperience,
    ptoBalance: u.ptoBalance,
    ptoUsed: u.ptoUsed,
    ptoYear: u.ptoYear,
  }));
}

export async function changePassword(username: string, newPassword: string): Promise<boolean> {
  try {
    const hash = await hashPassword(newPassword);
    const key = sanitizeKey(username);
    const snapshot = await get(ref(db, `${USERS_REF}/${key}`));
    if (!snapshot.exists()) return false;
    await update(ref(db, `${USERS_REF}/${key}`), { passwordHash: hash });
    return true;
  } catch {
    return false;
  }
}

export async function updateUser(
  username: string,
  updates: {
    displayName?: string;
    role?: UserRole;
    phone?: string;
    dateOfBirth?: string;
    yearsExperience?: number;
    ptoBalance?: number;
    ptoUsed?: number;
    ptoYear?: number;
  }
): Promise<boolean> {
  try {
    const key = sanitizeKey(username);
    const snapshot = await get(ref(db, `${USERS_REF}/${key}`));
    if (!snapshot.exists()) return false;
    // Remove undefined values before updating
    const cleanUpdates: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) cleanUpdates[k] = v;
    }
    await update(ref(db, `${USERS_REF}/${key}`), cleanUpdates);
    return true;
  } catch {
    return false;
  }
}

export async function getUserData(username: string): Promise<any | null> {
  try {
    const key = sanitizeKey(username);
    const snapshot = await get(ref(db, `${USERS_REF}/${key}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch {
    return null;
  }
}
