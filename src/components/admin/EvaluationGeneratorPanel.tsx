import { useMemo, useState } from 'react'
import { fonctionsReciproquesCyclometriques } from '../../content/chapters/6e-6h/fonctions-reciproques-cyclometriques'
import {
  buildEvaluationUrl,
  deriveQuestionOuverte,
  SECTIONS_EVALUATION_PILOTE,
  type LigneSelection,
  type TypeQuestionEvaluation,
} from '../../lib/evaluationPayload'

const LABEL_TYPE: Record<TypeQuestionEvaluation, string> = {
  exercice: 'Exercice généré (plateforme-maths)',
  vraiFaux: 'Vrai / Faux',
  ouverte: 'Question ouverte',
}

const POINTS_DEFAUT: Record<TypeQuestionEvaluation, number> = { exercice: 4, vraiFaux: 3, ouverte: 3 }

function ligneInitiale(sectionId: string, type: TypeQuestionEvaluation): LigneSelection {
  return {
    sectionId,
    type,
    active: false,
    points: POINTS_DEFAUT[type],
    nombreVraiFaux: type === 'vraiFaux' ? 3 : undefined,
  }
}

export function EvaluationGeneratorPanel() {
  const sections = SECTIONS_EVALUATION_PILOTE.map((config) => {
    const section = fonctionsReciproquesCyclometriques.sections.find((s) => s.id === config.sectionId)
    return section ? { config, section } : null
  }).filter((s): s is NonNullable<typeof s> => s !== null)

  const [titre, setTitre] = useState(`Évaluation — ${fonctionsReciproquesCyclometriques.title}`)
  const [lignes, setLignes] = useState<LigneSelection[]>(() =>
    sections.flatMap(({ config }) => (['exercice', 'vraiFaux', 'ouverte'] as const).map((type) => ligneInitiale(config.sectionId, type))),
  )
  const [erreur, setErreur] = useState(false)
  const [urlGeneree, setUrlGeneree] = useState<string | null>(null)

  const apercusOuvertes = useMemo(() => {
    const map = new Map<string, string | null>()
    for (const { section } of sections) {
      const question = deriveQuestionOuverte(section)
      map.set(section.id, question ? question.enonce : null)
    }
    return map
  }, [sections])

  function mettreAJourLigne(sectionId: string, type: TypeQuestionEvaluation, patch: Partial<LigneSelection>) {
    setLignes((prev) => prev.map((l) => (l.sectionId === sectionId && l.type === type ? { ...l, ...patch } : l)))
    setUrlGeneree(null)
  }

  const totalPoints = lignes.filter((l) => l.active).reduce((total, l) => total + l.points, 0)

  function genererEvaluation() {
    const url = buildEvaluationUrl(
      titre,
      lignes,
      sections.map((s) => s.section),
    )
    if (!url) {
      setErreur(true)
      setUrlGeneree(null)
      return
    }
    setErreur(false)
    setUrlGeneree(url)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="admin-eval">
      <p className="admin-eval-intro">
        Pilote sur un seul chapitre pour l'instant — les autres niveaux/chapitres suivront au fil des prochains lots.
      </p>

      <div className="admin-eval-field">
        <label htmlFor="eval-titre">Titre de l'évaluation</label>
        <input id="eval-titre" type="text" value={titre} onChange={(e) => setTitre(e.target.value)} />
      </div>

      {sections.map(({ config, section }) => (
        <fieldset className="admin-eval-section" key={config.sectionId}>
          <legend>
            {section.number}. {section.title}
          </legend>
          {(['exercice', 'vraiFaux', 'ouverte'] as const).map((type) => {
            const ligne = lignes.find((l) => l.sectionId === config.sectionId && l.type === type)!
            const apercuOuverte = type === 'ouverte' ? apercusOuvertes.get(config.sectionId) : null
            const indisponibleOuverte = type === 'ouverte' && !apercuOuverte
            return (
              <div className="admin-eval-ligne" key={type}>
                <label className="admin-eval-checkbox">
                  <input
                    type="checkbox"
                    checked={ligne.active}
                    disabled={indisponibleOuverte}
                    onChange={(e) => mettreAJourLigne(config.sectionId, type, { active: e.target.checked })}
                  />
                  {LABEL_TYPE[type]}
                  {indisponibleOuverte && ' (aucun exemple exploitable dans cette section)'}
                </label>
                {ligne.active && (
                  <div className="admin-eval-options">
                    <label>
                      Points
                      <input
                        type="number"
                        min={1}
                        value={ligne.points}
                        onChange={(e) => mettreAJourLigne(config.sectionId, type, { points: Number(e.target.value) || 1 })}
                      />
                    </label>
                    {type === 'vraiFaux' && (
                      <label>
                        Nombre de questions
                        <input
                          type="number"
                          min={1}
                          max={35}
                          value={ligne.nombreVraiFaux}
                          onChange={(e) => mettreAJourLigne(config.sectionId, type, { nombreVraiFaux: Number(e.target.value) || 1 })}
                        />
                      </label>
                    )}
                    {type === 'ouverte' && apercuOuverte && <p className="admin-eval-apercu">« {apercuOuverte} »</p>}
                  </div>
                )}
              </div>
            )
          })}
        </fieldset>
      ))}

      <p className="admin-eval-total">Total : {totalPoints} point{totalPoints > 1 ? 's' : ''}</p>

      <button type="button" className="admin-gate-submit" onClick={genererEvaluation}>
        Générer l'évaluation (énoncé + corrigé)
      </button>
      {erreur && <p className="admin-gate-error">Coche au moins une question avant de générer.</p>}
      {urlGeneree && (
        <p className="admin-eval-lien">
          Ouvert dans un nouvel onglet.{' '}
          <a href={urlGeneree} target="_blank" rel="noopener noreferrer">
            Rouvrir le lien
          </a>
          .
        </p>
      )}
    </div>
  )
}
