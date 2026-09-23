import { useState, type FormEvent } from 'react'
import { SiteHeader } from '../components/SiteHeader'
import { checkAdminPassword, isAdminSessionAuthed, markAdminSessionAuthed } from '../lib/adminAuth'

export function AdminPage() {
  const [authed, setAuthed] = useState(() => isAdminSessionAuthed())
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setChecking(true)
    setError(false)
    const ok = await checkAdminPassword(password)
    setChecking(false)
    if (ok) {
      markAdminSessionAuthed()
      setAuthed(true)
    } else {
      setError(true)
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="page">
        <header className="chapter-head">
          <p className="eyebrow">Math-Belgium</p>
          <h1 className="chapter-title">Administration</h1>
        </header>

        {!authed ? (
          <form className="admin-gate" onSubmit={handleSubmit}>
            <label className="admin-gate-label" htmlFor="admin-password">
              Mot de passe
            </label>
            <input
              id="admin-password"
              className="admin-gate-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
            <button className="admin-gate-submit" type="submit" disabled={checking}>
              {checking ? 'Vérification…' : 'Entrer'}
            </button>
            {error && <p className="admin-gate-error">Mot de passe incorrect.</p>}
          </form>
        ) : (
          <div className="admin-panel-empty">
            <p>Aucune option pour l’instant.</p>
            <p>Dis-moi ce que tu veux ajouter ici, et ça apparaîtra à cet endroit.</p>
          </div>
        )}
      </div>
    </>
  )
}
