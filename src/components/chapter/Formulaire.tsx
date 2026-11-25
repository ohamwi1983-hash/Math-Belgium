import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'
import { imprimerFormulaireAmenage, imprimerFormulaireSeul } from '../../lib/imprimer'
import { numeroAffiche, useOrdreChapitres } from '../../lib/ordreChapitres'

/**
 * Formulaire de fin de chapitre ("fiche de référence") : toutes les formules nécessaires pour
 * répondre aux questions des générateurs du chapitre, groupées par thème mathématique. Rendu
 * après `RecapFinal` — voir `ChapterContent.formulaire` pour le schéma de données.
 */
export function Formulaire({ formulaire, chapter }: { formulaire: ChapterContent['formulaire']; chapter: ChapterContent }) {
  const { ordre } = useOrdreChapitres()
  if (!formulaire) return null
  const numeroImprime = numeroAffiche(chapter, ordre)
  const total = formulaire.groups.reduce((n, g) => n + g.formulas.length, 0)

  return (
    <>
      <div className="formulaire">
        <div className="formulaire-perfore" aria-hidden="true" />
        <div className="formulaire-entete">
          <h2>Formulaire — {chapter.title}</h2>
          <p className="formulaire-meta">
            <span className="ecran-seul">
              {chapter.level} · chapitre {chapter.chapterNumber}
            </span>
            <span className="impression-seule">{numeroImprime === null ? chapter.level : `${chapter.level} · chapitre ${numeroImprime}`}</span>
            <br />
            {total} formule{total > 1 ? 's' : ''}
          </p>
        </div>
        <div className="formulaire-corps">
          {formulaire.groups.map((groupe, i) => (
            <div className="formulaire-groupe" key={i}>
              <h3>{groupe.title}</h3>
              {groupe.formulas.map((formule, j) => (
                <div className="formulaire-formule" key={j}>
                  <span className="formulaire-f">
                    <RichText text={formule.text} />
                  </span>
                  {formule.condition && (
                    <span className="formulaire-cond">
                      <RichText text={formule.condition} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="formulaire-pied">
          <span>Formulaire — {chapter.title}</span>
          <span>math-belgium</span>
        </div>
      </div>
      <div className="formulaire-actions no-export">
        <button type="button" className="formulaire-print-btn" onClick={imprimerFormulaireSeul}>
          <span aria-hidden="true">🖨️</span>
          Imprimer le formulaire
        </button>
        <button type="button" className="formulaire-print-btn" onClick={imprimerFormulaireAmenage}>
          <span aria-hidden="true">🖨️</span>
          Version aménagée
        </button>
      </div>
    </>
  )
}
