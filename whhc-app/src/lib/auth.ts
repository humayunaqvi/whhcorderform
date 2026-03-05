import type { User, Session, UserRole } from '@/types';

const SESSION_KEY = 'whhc_session';
const USERS_KEY = 'whhc_users_v2';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// SHA-256 hash for passwords
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default users - seeded on first load
const DEFAULT_USERS: Record<string, { displayName: string; password: string; role: UserRole }> = {
  hnaqvi: { displayName: 'Dr. Naqvi', password: 'Whhc1140!!', role: 'physician' },
  whhcadmin: { displayName: 'WHHC Admin', password: 'Whhc11421!!', role: 'admin' },
  whhcclinical: { displayName: 'Clinical Coordinator', password: 'clinical123', role: 'clinical' },
  staff1: { displayName: 'Staff 1', password: 'staff123', role: 'staff' },
  staff2: { displayName: 'Staff 2', password: 'staff123', role: 'staff' },
};

function getUsers(): Record<string, any> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, any>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function seedDefaultUsers(): Promise<void> {
  const existing = getUsers();

  // Migrate old roles (tracker → admin, clinic_staff → clinical)
  if (Object.keys(existing).length > 0) {
    let migrated = false;
    for (const username of Object.keys(existing)) {
      const user = existing[username];
      if (user.role === 'tracker') {
        user.role = 'admin';
        migrated = true;
      } else if (user.role === 'clinic_staff') {
        user.role = 'clinical';
        migrated = true;
      }
    }
    if (migrated) saveUsers(existing);
    return; // Already seeded
  }

  const users: Record<string, object> = {};
  for (const [username, info] of Object.entries(DEFAULT_USERS)) {
    users[username] = {
      id: username,
      username,
      displayName: info.displayName,
      passwordHash: await hashPassword(info.password),
      role: info.role,
      createdAt: new Date().toISOString(),
    };
  }
  saveUsers(users);
}

export async function login(username: string, password: string): Promise<Session | null> {
  const users = getUsers();
  const user = users[username.toLowerCase()];
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
  user.lastLogin = new Date().toISOString();
  const allUsers = getUsers();
  allUsers[username.toLowerCase()] = user;
  saveUsers(allUsers);

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
    const users = getUsers();
    users[username.toLowerCase()] = {
      id: username.toLowerCase(),
      username: username.toLowerCase(),
      displayName,
      passwordHash: hash,
      role,
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);
    return true;
  } catch {
    return false;
  }
}

export async function deleteUser(username: string): Promise<boolean> {
  try {
    const users = getUsers();
    delete users[username];
    saveUsers(users);
    return true;
  } catch {
    return false;
  }
}

export async function getAllUsers(): Promise<User[]> {
  const users = getUsers();
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
    const users = getUsers();
    if (users[username]) {
      users[username].passwordHash = hash;
      saveUsers(users);
      return true;
    }
    return false;
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
    const users = getUsers();
    if (!users[username]) return false;
    users[username] = { ...users[username], ...updates };
    saveUsers(users);
    return true;
  } catch {
    return false;
  }
}

export async function getUserData(username: string): Promise<any | null> {
  const users = getUsers();
  return users[username] || null;
}
