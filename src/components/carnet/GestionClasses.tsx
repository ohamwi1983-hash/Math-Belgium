import { useId, useState, type FormEvent } from 'react'
import { LEVELS } from '../../content/chaptersIndex'
import { erreurNomClasse, libelleNiveau, type Classe } from '../../lib/carnet'
import { ecoleParDefaut, type Ecole } from '../../lib/compteValidation'
import { Champ } from '../compte/Champ'

export type SaisieClasse = { nom: string; ecole_id: string; niveau: string | null }

/** Ajouter / renommer / supprimer les classes ; chacune rattachée à une école du profil. */
export function GestionClasses({
  classes,
  ecoles,
  nombreSeances,
  occupe,
  onAjouter,
  onModifier,
  onSupprimer,
}: {
  classes: Classe[]
  ecoles: Ecole[]
  nombreSeances: (classeId: string) => number
  occupe: boolean
  onAjouter: (s: SaisieClasse) => Promise<boolean>
  onModifier: (id: string, s: SaisieClasse) => Promise<boolean>
  onSupprimer: (c: Classe) => void
}) {
  const [edition, setEdition] = useState<string | null>(null)
  return (
    <div className="carnet-classes">
      {classes.length > 0 && (
        <ul className="compte-liste">
          {classes.map((c) =>
            edition === c.id ? (
              <li key={c.id} className="compte-liste-item compte-liste-edition">
                <FormClasse
                  initiale={c}
                  ecoles={ecoles}
                  occupe={occupe}
                  libelle="Enregistrer"
                  onEnvoyer={async (s) => {
                    if (await onModifier(c.id, s)) setEdition(null)
                  }}
                  onAnnuler={() => setEdition(null)}
                />
              </li>
            ) : (
              <li key={c.id} className="compte-liste-item">
                <div className="compte-liste-texte">
                  <strong>{c.nom}</strong>
                  {c.niveau && <span className="compte-badge">{libelleNiveau(c.niveau)}</span>}
                  <span className="compte-detail">
                    {ecoles.find((e) => e.id === c.ecole_id)?.nom ?? 'École inconnue'} · {nombreSeances(c.id)} séance{nombreSeances(c.id) > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="compte-actions">
                  <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={() => setEdition(c.id)}>
                    Modifier
                  </button>
                  <button type="button" className="compte-bouton-secondaire compte-danger" disabled={occupe} onClick={() => onSupprimer(c)}>
                    Supprimer
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
      <div className="compte-sous-form" id="ajouter">
        <h3>Ajouter une classe</h3>
        <FormClasse initiale={null} ecoles={ecoles} occupe={occupe} libelle="Ajouter la classe" onEnvoyer={async (s) => void (await onAjouter(s))} />
      </div>
    </div>
  )
}

/** Formulaire d'une classe (nom, école, niveau) : ajout, ou modification depuis la page de la classe. */
export function FormClasse({
  initiale,
  ecoles,
  occupe,
  libelle,
  onEnvoyer,
  onAnnuler,
}: {
  initiale: Classe | null
  ecoles: Ecole[]
  occupe: boolean
  libelle: string
  onEnvoyer: (s: SaisieClasse) => Promise<void>
  onAnnuler?: () => void
}) {
  const id = useId()
  const [nom, setNom] = useState(initiale?.nom ?? '')
  const [ecoleId, setEcoleId] = useState(initiale?.ecole_id ?? ecoleParDefaut(ecoles)?.id ?? '')
  const [niveau, setNiveau] = useState(initiale?.niveau ?? '')
  const [erreur, setErreur] = useState<string | null>(null)

  async function envoyer(e: FormEvent) {
    e.preventDefault()
    const err = erreurNomClasse(nom) ?? (ecoleId ? null : 'Choisis une école.')
    setErreur(err)
    if (err) return
    await onEnvoyer({ nom, ecole_id: ecoleId, niveau: niveau || null })
    if (!initiale) setNom('')
  }

  return (
    <form className="compte-form" onSubmit={(e) => void envoyer(e)} noValidate>
      <Champ label="Nom de la classe" valeur={nom} onChange={setNom} erreur={erreur} aide="Exemple : « 5e B » — jamais de nom d'élève." autoComplete="off" />
      <div className="carnet-grille">
        <div className="compte-champ">
          <label htmlFor={`${id}-ecole`}>École</label>
          {ecoles.length === 1 ? (
            <p className="carnet-valeur-fixe" id={`${id}-ecole`}>
              {ecoles[0].nom}
            </p>
          ) : (
            <select id={`${id}-ecole`} value={ecoleId} onChange={(e) => setEcoleId(e.target.value)}>
              {ecoles.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="compte-champ">
          <label htmlFor={`${id}-niveau`}>Niveau (facultatif)</label>
          <select id={`${id}-niveau`} value={niveau} onChange={(e) => setNiveau(e.target.value)}>
            <option value="">— aucun —</option>
            {LEVELS.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="compte-actions">
        <button type="submit" className="compte-bouton" disabled={occupe}>
          {libelle}
        </button>
        {onAnnuler && (
          <button type="button" className="compte-bouton-secondaire" onClick={onAnnuler}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
