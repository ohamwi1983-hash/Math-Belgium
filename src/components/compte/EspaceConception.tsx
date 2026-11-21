import { useId, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import '../carnet/carnet.css'
import { BandeauEspace } from './BandeauEspace'
import { IconeEvaluation, IconeFeuille, MenuEspace } from './MenuEspace'
import './profil.css'

/** Ce que le panneau de conception publie pour le bandeau (`EvaluationGeneratorPanel.onResume`). */
export interface ResumeConception {
  ecole: string | null
  niveau: string | null
  nombre: number
  unite: string
}

/** Petit magasin : le panneau publie, seules les pastilles du bandeau se re-rendent (pas le panneau). */
function creerMagasin() {
  let valeur: ResumeConception | null = null
  const abonnes = new Set<() => void>()
  return {
    lire: () => valeur,
    abonner: (f: () => void) => {
      abonnes.add(f)
      return () => abonnes.delete(f)
    },
    publier: (r: ResumeConception) => {
      if (valeur && valeur.ecole === r.ecole && valeur.niveau === r.niveau && valeur.nombre === r.nombre && valeur.unite === r.unite) return
      valeur = r
      abonnes.forEach((f) => f())
    },
  }
}
type Magasin = ReturnType<typeof creerMagasin>

/**
 * Pages de conception d'un professeur CONNECTÉ (`/exercice`, `/{niveau}/{chapitre}/exercices`,
 * `/evaluation`) : menu « Mon espace » (`compact` : colonne d'icônes sous 1 360 px, barre du bas
 * sur téléphone) et bandeau sombre (icône, « ESPACE PROFESSEUR », titre, pastilles école · niveau ·
 * nombre d'exercices choisis, lien « Voir comme un élève »). Le panneau lui-même est inchangé :
 * `panneau(publier)` le rend avec `onResume={publier}`. Visiteur, élève et « vue élève » : jamais
 * ce cadre (l'assistant reste tel quel).
 */
export function EspaceConception({
  type,
  titre,
  sousTitre,
  lienEleve,
  sansNiveau = false,
  panneau,
}: {
  type: 'feuille' | 'evaluation'
  titre: ReactNode
  sousTitre?: ReactNode
  lienEleve?: string
  sansNiveau?: boolean
  panneau: (publier: (r: ResumeConception) => void) => ReactNode
}) {
  const id = useId()
  const magasin = useMemo(creerMagasin, [])
  return (
    <div className="espace-conception">
      <MenuEspace compact>
        <div className="espace-conception-contenu">
          <BandeauEspace
            titreId={`${id}-titre`}
            titre={titre}
            classe="espace-bandeau-conception"
            classeIcone="espace-bandeau-icone"
            icone={type === 'feuille' ? <IconeFeuille mode="bandeau" /> : <IconeEvaluation mode="bandeau" />}
            apresTitre={sousTitre ? <p className="espace-bandeau-sous-titre">{sousTitre}</p> : undefined}
            fin={
              <>
                <PastillesConception magasin={magasin} sansNiveau={sansNiveau} />
                {lienEleve && (
                  <Link className="espace-bandeau-lien" to={lienEleve}>
                    Voir comme un élève
                  </Link>
                )}
              </>
            }
          />
          {panneau(magasin.publier)}
        </div>
      </MenuEspace>
    </div>
  )
}

function PastillesConception({ magasin, sansNiveau }: { magasin: Magasin; sansNiveau: boolean }) {
  const r = useSyncExternalStore(magasin.abonner, magasin.lire, magasin.lire)
  if (!r) return null
  const pastilles = [
    r.ecole ? { cle: 'ecole', texte: r.ecole } : null,
    !sansNiveau && r.niveau ? { cle: 'niveau', texte: r.niveau } : null,
    r.nombre > 0 ? { cle: 'nombre', texte: `${r.nombre} ${r.unite}${r.nombre > 1 ? 's' : ''} choisi${r.unite === 'question' ? 'e' : ''}${r.nombre > 1 ? 's' : ''}` } : null,
  ].filter((p): p is { cle: string; texte: string } => p !== null)
  if (pastilles.length === 0) return null
  return (
    <ul className="profil-bandeau-ecoles" aria-label="Document en cours">
      {pastilles.map((p) => (
        <li key={p.cle} className="profil-bandeau-ecole">
          {p.texte}
        </li>
      ))}
    </ul>
  )
}
