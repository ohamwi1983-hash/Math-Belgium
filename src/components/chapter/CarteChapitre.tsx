import { useRef } from 'react'
import type { AnchorHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import type { ChapterContent, ChapterSection } from '../../content/types'
import type { EtatParcours } from '../../lib/parcoursChapitre'
import { titreCourt } from '../../lib/parcoursChapitre'
import { Icone } from './Icones'
import '../eleve/guideEleve.css'

/** Vue du parcours, lue dans le fragment de l'URL : rien → carte, `#<sectionId>` → étape,
 * `#reviser`, `#entrainer` → onglets Réviser / S'entraîner, `#projeter` → lanceur du mode
 * projection (professeur connecté). */
export type Vue = 'carte' | 'etape' | 'reviser' | 'entrainer' | 'projeter'

/** Navigation interne : `cible` = fragment sans « # » (null → carte). */
export type Aller = (cible: string | null) => void

/** Lien vers une vue du parcours : un vrai lien (`href`, clic milieu, lecteur d'écran), intercepté
 * pour passer par React Router (historique du navigateur : « retour » = vue précédente). */
export function LienVue({
  cible,
  aller,
  className,
  children,
  ...reste
}: { cible: string | null; aller: Aller; className?: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  return (
    <a
      {...reste}
      className={className}
      href={cible ? `#${cible}` : '#'}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        aller(cible)
      }}
    >
      {children}
    </a>
  )
}

/** Onglets sous-titrés (maquette « chapitre » du 27/11/2026) : « Le cours · point par point », « Réviser ·
 * teste-toi », « Exercices · corrigés ». Identifiants inchangés (`apprendre` / `reviser` / `entrainer`). */
const ONGLETS: { id: 'apprendre' | 'reviser' | 'entrainer'; label: string; sous: string; cible: string | null }[] = [
  { id: 'apprendre', label: 'Le cours', sous: 'point par point', cible: null },
  { id: 'reviser', label: 'Réviser', sous: 'teste-toi', cible: 'reviser' },
  { id: 'entrainer', label: 'Exercices', sous: 'corrigés', cible: 'entrainer' },
]

/** Onglets Le cours · Réviser · Exercices (`tablist`, flèches gauche/droite, Début/Fin). */
export function OngletsChapitre({ vue, aller, prefixe, className }: { vue: Vue; aller: Aller; prefixe: string; className?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const actif = vue === 'reviser' ? 'reviser' : vue === 'entrainer' ? 'entrainer' : 'apprendre'
  function clavier(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = ONGLETS.length
    const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (j < 0) return
    e.preventDefault()
    refs.current[j]?.focus()
    aller(ONGLETS[j].cible)
  }
  return (
    <div className={`onglets-chapitre no-export${className ? ` ${className}` : ''}`} role="tablist" aria-label="Le chapitre">
      {ONGLETS.map((o, i) => (
        <button
          key={o.id}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
          role="tab"
          id={`${prefixe}-onglet-${o.id}`}
          aria-selected={actif === o.id}
          aria-controls={`panneau-${o.id}`}
          tabIndex={actif === o.id ? 0 : -1}
          className={`onglet onglet-double${actif === o.id ? ' actif' : ''}`}
          onClick={() => aller(o.cible)}
          onKeyDown={(e) => clavier(e, i)}
        >
          <span className="onglet-titre">{o.label}</span>
          <span className="onglet-sous">
            <span className="sr-only"> : </span>
            {o.sous}
          </span>
        </button>
      ))}
    </div>
  )
}

/** Barre « 3 / 18 points ». */
export function BarreProgression({ lues, total }: { lues: number; total: number }) {
  return (
    <div className="parcours-progression">
      <div className="barre" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={lues} aria-label="Points compris">
        <span style={{ width: `${total ? (100 * lues) / total : 0}%` }} />
      </div>
      <span className="parcours-compte">
        {lues} / {total} points
      </span>
    </div>
  )
}

/**
 * Haut de la carte (maquette « chapitre » du 27/11/2026) : « Tu en es au point n sur N » (dernier point
 * ouverte), sa durée, la barre de position et « Continuer : titre › » ; jamais ouvert : « Commencer ». Le
 * nombre de points compris reste dit en petit (et par les ✓ de la liste).
 */
export function BlocReprendre({ chapter, etat, aller, durees }: { chapter: ChapterContent; etat: EtatParcours; aller: Aller; durees: Record<string, number> }) {
  const sections = chapter.sections
  if (!sections.length) return null
  const derniere = sections.find((s) => s.id === etat.derniere)
  const cible = derniere ?? sections[0]
  const rang = sections.indexOf(cible) + 1
  const total = sections.length
  return (
    <div className="parcours-tete ge-reprendre no-export">
      <div className="ge-reprendre-tete">
        <p className="ge-reprendre-titre">{derniere ? `Tu en es au point ${rang} sur ${total}` : `${total} points à lire, un par écran`}</p>
        <p className="ge-reprendre-duree">
          ≈ {durees[cible.id] ?? 1} min<span className="sr-only"> pour ce point</span>
        </p>
      </div>
      <div className="barre" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={derniere ? rang : 0} aria-label={derniere ? `Point ${rang} sur ${total}` : 'Pas encore commencé'}>
        <span style={{ width: `${derniere ? (100 * rang) / total : 0}%` }} />
      </div>
      <LienVue cible={cible.id} aller={aller} className="btn-reprendre">
        {derniere ? 'Continuer' : 'Commencer'} : {titreCourt(cible)} ›
      </LienVue>
      {etat.lues.length > 0 && (
        <p className="ge-reprendre-lues">
          {etat.lues.length} / {total} points compris
        </p>
      )}
    </div>
  )
}

/** Groupes de sections consécutives de même `partie`. */
function groupes(sections: ChapterSection[]): { partie?: string; sections: ChapterSection[] }[] {
  const res: { partie?: string; sections: ChapterSection[] }[] = []
  for (const s of sections) {
    const dernier = res[res.length - 1]
    if (dernier && dernier.partie === s.partie) dernier.sections.push(s)
    else res.push({ partie: s.partie, sections: [s] })
  }
  return res
}

/**
 * Liste des étapes, groupées en parties : pastille (lue ✓ / en cours / numéro), titre court, durée.
 * `variante="carte"` : la carte du chapitre (téléphone et ordinateur) ; `"cote"` : colonne de
 * gauche d'une étape sur ordinateur (sans durée).
 */
export function ListeEtapes({
  chapter,
  etat,
  courante,
  durees,
  aller,
  variante,
  aRevoir,
}: {
  chapter: ChapterContent
  etat: EtatParcours
  /** Étapes « à revoir » d'après les essais et les cartes (règle de Ma progression, `suiviChapitres.ts`). */
  aRevoir?: ReadonlySet<string>
  /** Étape en cours : étape affichée, ou dernière ouverte sur la carte. */
  courante: string | null
  durees: Record<string, number>
  aller: Aller
  variante: 'carte' | 'cote'
}) {
  return (
    <nav className={`liste-etapes liste-${variante}`} aria-label="Points du chapitre">
      {groupes(chapter.sections).map((g, i) => (
        <div key={i} className="liste-groupe">
          {g.partie && <p className="liste-partie">{g.partie}</p>}
          <ol>
            {g.sections.map((s) => {
              const lue = etat.lues.includes(s.id)
              const enCours = s.id === courante
              const revoir = !!aRevoir?.has(s.id)
              return (
                <li key={s.id}>
                  <LienVue
                    cible={s.id}
                    aller={aller}
                    className={`etape-lien${lue ? ' lue' : ''}${enCours ? ' en-cours' : ''}${revoir ? ' a-revoir' : ''}`}
                    aria-current={enCours ? 'step' : undefined}
                  >
                    <span className="pastille" aria-hidden="true">
                      {lue ? <Icone nom="coche" taille={15} /> : s.number}
                    </span>
                    <span className="etape-nom">
                      <span className="sr-only">Point {s.number} : </span>
                      {titreCourt(s)}
                      {lue && <span className="sr-only"> (compris)</span>}
                    </span>
                    {revoir ? <span className="ge-pill ge-pill-revoir">à revoir</span> : enCours && variante === 'carte' ? <span className="ge-pill ge-pill-encours">en cours</span> : null}
                    {variante === 'carte' && <span className="etape-duree">{durees[s.id]} min</span>}
                  </LienVue>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </nav>
  )
}
