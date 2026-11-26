import { competencesGenerateur, NOM_COMPETENCE } from '../lib/competencesGenerateur'

/** Pastilles « 1 · Connaître », « 2 · Appliquer », « 3 · Transférer » d'un générateur (couleurs `--procN`,
 * numéro ET nom toujours écrits). Rien si la compétence est inconnue. */
export function PastillesCompetences({ generatorId, titre, className = '' }: { generatorId: string; titre?: string; className?: string }) {
  const liste = competencesGenerateur(generatorId, titre)
  if (!liste.length) return null
  return (
    <span className={`pastilles-competences ${className}`.trim()} aria-label={`Compétence${liste.length > 1 ? 's' : ''} : ${liste.map((c) => NOM_COMPETENCE[c]).join(', ')}`}>
      {liste.map((c) => (
        <span key={c} className={`pastille-competence pastille-competence-${c}`} aria-hidden="true">
          <span className="pastille-competence-num">{c}</span>
          {NOM_COMPETENCE[c]}
        </span>
      ))}
    </span>
  )
}
