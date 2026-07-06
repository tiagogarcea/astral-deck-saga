// ============ ESTADO SALVO (localStorage) ============
import { MAX_LEVEL, XP_TO_LEVEL, LEVEL_GOLD } from "./data";

export interface SaveState {
  name:string; mail:string; password:string; avatar:string;
  gold:number; level:number; xp:number;
  owned:string[]; deck:string[];
  storyDone:boolean[]; created:boolean;
}

// Guarda lista de todas as contas + qual está logada
const ACCOUNTS_KEY = "arcanum_accounts_v1";
const ACTIVE_KEY   = "arcanum_active_v1";
const AUTH_KEY     = "arcanum_authed";

function getAllAccounts(): SaveState[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}
function saveAllAccounts(accounts: SaveState[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

/** Retorna a conta ativa (logada) ou null */
export function loadSave(): SaveState | null {
  try {
    const mail = localStorage.getItem(ACTIVE_KEY);
    if (!mail) return null;
    const all = getAllAccounts();
    return all.find(a => a.mail === mail) ?? null;
  } catch { return null; }
}

/** Persiste alterações na conta ativa */
export function saveState(s: SaveState) {
  const all = getAllAccounts();
  const idx = all.findIndex(a => a.mail === s.mail);
  if (idx >= 0) all[idx] = s; else all.push(s);
  saveAllAccounts(all);
  localStorage.setItem(ACTIVE_KEY, s.mail);
}

export function clearSave() {
  localStorage.removeItem(ACTIVE_KEY);
  logout();
}

/** Verifica se e-mail já está cadastrado */
export function emailExists(mail: string): boolean {
  return getAllAccounts().some(a => a.mail.toLowerCase() === mail.toLowerCase().trim());
}

/** Tenta logar — retorna a conta se senha correta, null se não */
export function tryLogin(mail: string, password: string): SaveState | null {
  const all = getAllAccounts();
  const acc = all.find(a => a.mail.toLowerCase() === mail.toLowerCase().trim());
  if (!acc) return null;
  if (acc.password !== password) return null;
  localStorage.setItem(ACTIVE_KEY, acc.mail);
  login();
  return acc;
}

export function isAuthed(): boolean { return sessionStorage.getItem(AUTH_KEY) === "1"; }
export function login()  { sessionStorage.setItem(AUTH_KEY, "1"); }
export function logout() { sessionStorage.removeItem(AUTH_KEY); }

export function newSave(name: string, mail: string, password: string, avatar: string = "Guerreiro"): SaveState {
  return { name, mail, password, avatar, gold: 0, level: 1, xp: 0,
           owned: [], deck: [], storyDone: [false,false,false,false,false], created: false };
}

export interface LevelUp { level: number; gold: number; }
export function grantXp(s: SaveState, xp: number): LevelUp[] {
  const ups: LevelUp[] = [];
  if (s.level >= MAX_LEVEL) return ups;
  s.xp += xp;
  while (s.level < MAX_LEVEL && s.xp >= XP_TO_LEVEL(s.level)) {
    s.xp -= XP_TO_LEVEL(s.level);
    s.level++;
    const g = LEVEL_GOLD(s.level);
    s.gold += g;
    ups.push({ level: s.level, gold: g });
  }
  if (s.level >= MAX_LEVEL) s.xp = 0;
  return ups;
}

export const AVATAR_PATHS: Record<string, string> = {
  Guerreiro:  "M12 2l3 3v3h2l1 3-3 1v3l2 6h-4l-1-5h-1l-1 5H6l2-6v-3l-3-1 1-3h2V5l3-3z",
  Mago:       "M12 1l2 6h5l-4 4 2 6-5-3-5 3 2-6-4-4h5l2-6zM7 19h10l1 3H6l1-3z",
  Assassino:  "M12 2C8 4 6 7 6 11v5l2 6h8l2-6v-5c0-4-2-7-6-9zm-2 9l2-4 2 4-2 5-2-5z",
  Fera:       "M4 4l4 3 4-2 4 2 4-3-1 6 1 4-4 8h-8L4 14l1-4-1-6zm5 8l1 2h4l1-2-3-2-3 2z",
  "Demônio":  "M5 2l3 4c1-1 2.5-1.5 4-1.5S15 5 16 6l3-4 1 7-2 3 1 4-7 6-7-6 1-4-2-3 1-7zm4 9l1.5 2h3L15 11l-3-1-3 1z",
};
