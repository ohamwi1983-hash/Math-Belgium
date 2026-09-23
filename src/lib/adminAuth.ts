// Garde-fou léger côté client pour /admin — pas une vraie authentification : le site est 100%
// statique (aucun backend), donc n'importe qui peut lire ce fichier sur GitHub et retrouver le
// mot de passe en clair. Ça décourage un visiteur qui tomberait sur l'URL par hasard, rien de plus.
const PASSWORD_HASH_HEX = '1bbd174404efbce95f1af489ef93f4aa0f4d55718f24c3504682216afa7b7fb1'
const SESSION_KEY = 'math-belgium-admin-authed'

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkAdminPassword(candidate: string): Promise<boolean> {
  return (await sha256Hex(candidate)) === PASSWORD_HASH_HEX
}

export function isAdminSessionAuthed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markAdminSessionAuthed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // sessionStorage indisponible (navigation privée stricte, etc.) — la session redemandera
    // simplement le mot de passe à la prochaine visite, pas grave pour un usage admin.
  }
}
