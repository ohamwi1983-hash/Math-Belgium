import { useId, useState, type InputHTMLAttributes } from 'react'

/**
 * Champ de formulaire des pages de compte : label, aide, message d'erreur relié
 * (`aria-describedby`, `aria-invalid`). Règle CLAUDE.md : la frappe n'est JAMAIS filtrée ni
 * bloquée (aucun `onKeyDown`, aucun `inputMode` numérique) — la saisie est jugée à l'envoi.
 * `type="password"` : icône œil DANS le champ (« Afficher le mot de passe », `aria-pressed`) — utile sur
 * téléphone, évite un champ de confirmation.
 */
export function Champ({
  label,
  valeur,
  onChange,
  erreur,
  aide,
  type = 'text',
  ...reste
}: {
  label: string
  valeur: string
  onChange: (v: string) => void
  erreur?: string | null
  aide?: string
  type?: 'text' | 'email' | 'password' | 'date'
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const idAide = aide ? `${id}-aide` : undefined
  const idErreur = erreur ? `${id}-erreur` : undefined
  const decrit = [idAide, idErreur].filter(Boolean).join(' ') || undefined
  return (
    <div className="compte-champ">
      <label htmlFor={id}>{label}</label>
      <div className={type === 'password' ? 'compte-champ-mdp' : undefined}>
        <input
          id={id}
          type={type === 'password' && visible ? 'text' : type}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={decrit}
          {...reste}
        />
        {type === 'password' && (
          <button type="button" className="compte-champ-oeil" aria-label="Afficher le mot de passe" aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {visible && <path d="M4 4l16 16" />}
            </svg>
          </button>
        )}
      </div>
      {aide && (
        <p className="compte-aide" id={idAide}>
          {aide}
        </p>
      )}
      {erreur && (
        <p className="compte-erreur-champ" id={idErreur}>
          {erreur}
        </p>
      )}
    </div>
  )
}
