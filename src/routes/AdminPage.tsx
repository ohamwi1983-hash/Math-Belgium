import { useState, type FormEvent } from 'react'
import { SiteHeader } from '../components/SiteHeader'
import { EvaluationGeneratorPanel } from '../components/admin/EvaluationGeneratorPanel'
import { PageCompte, PageReservee } from '../components/compte/PageReservee'
import { checkAdminPassword, isAdminSessionAuthed, markAdminSessionAuthed } from '../lib/adminAuth'
import { supabaseConfigure } from '../lib/supabase'
import { usePageNonIndexee } from '../lib/useDocumentMeta'
import { AdminComptes } from './AdminComptes'

/**
 * `/admin`.
 * - Comptes configurés (Supabase) : administration des comptes (codes d'invitation, professeurs),
 *   réservée à `profils.est_admin` — remplace le garde-fou `lib/adminAuth.ts`. Le panneau des
 *   évaluations est sur `/evaluation` pour tous les professeurs connectés.
 * - Sans configuration : comportement historique INCHANGÉ (mot de passe local, puis panneau des
 *   évaluations), pour ne rien casser tant que Supabase n'est pas en service.
 */
export function AdminPage() {
  if (supabaseConfigure()) {
    return (
      <PageCompte titre="Administration" large>
        <PageReservee admin>
          <AdminComptes />
        </PageReservee>
      </PageCompte>
    )
  }
  return <AdminHistorique />
}

function AdminHistorique() {
  usePageNonIndexee('Administration')
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
      <div className="page-tool">
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
          <EvaluationGeneratorPanel />
        )}
      </div>
    </>
  )
}
