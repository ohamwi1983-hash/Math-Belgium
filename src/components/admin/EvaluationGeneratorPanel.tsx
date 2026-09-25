import { useMemo, useState } from 'react'
import { LEVELS } from '../../content/chaptersIndex'
import type { ChapterContent } from '../../content/types'
import {
  CHAPITRE_FONCTIONNEL_SLUG,
  HEURES_PAR_NIVEAU,
  HEURES_SEMAINE_DEFAUT,
  NIVEAU_NUMERO,
  buildEvaluationUrl,
  catalogueVariantesExercice,
  deriveQuestionsComprehension,
  deriveQuestionsOuvertes,
  estChapitreFonctionnel,
  resoudreLevelSlug,
  sommeParVariante,
  type LigneSelection,
  type NiveauCode,
  type Processus,
  type TypeQuestionEvaluation,
} from '../../lib/evaluationPayload'

const NIVEAUX: NiveauCode[] = ['4e', '5e', '6e']

const LABEL_PROCESSUS: Record<Processus, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }

const LABEL_TYPE: Record<TypeQuestionEvaluation, string> = {
  demonstration: 'Questions ouvertes — formules / démonstrations',
  comprehension: 'Questions ouvertes — compréhension',
  vraiFaux: 'Vrai / Faux (avec justification)',
  exercice: 'Exercice généré',
}

const POINTS_DEFAUT: Record<TypeQuestionEvaluation, number> = { demonstration: 3, comprehension: 2, vraiFaux: 1, exercice: 4 }
const MAX_VRAI_FAUX = 35
const MAX_EXERCICE = 10

function lignesInitiales(chapitre: ChapterContent | undefined): LigneSelection[] {
  if (!chapitre) return []
  const lignes: LigneSelection[] = []
  for (const section of chapitre.sections) {
    lignes.push({ sectionId: section.id, processus: 1, type: 'demonstration', nombre: 0, points: POINTS_DEFAUT.demonstration })
    lignes.push({ sectionId: section.id, processus: 1, type: 'comprehension', nombre: 0, points: POINTS_DEFAUT.comprehension })
    lignes.push({ sectionId: section.id, processus: 1, type: 'vraiFaux', nombre: 0, points: POINTS_DEFAUT.vraiFaux })
    lignes.push({ sectionId: section.id, processus: 2, type: 'exercice', nombre: 0, parVariante: {}, points: POINTS_DEFAUT.exercice })
  }
  return lignes
}

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10)
}

export function EvaluationGeneratorPanel() {
  const [numero, setNumero] = useState('1')
  const [date, setDate] = useState(aujourdhui)
  const [niveau, setNiveau] = useState<NiveauCode>('6e')
  const [heures, setHeures] = useState('6H')
  const [chapitreSlug, setChapitreSlug] = useState(CHAPITRE_FONCTIONNEL_SLUG)
  const [titre, setTitre] = useState('')
  const [heuresSemaine, setHeuresSemaine] = useState(HEURES_SEMAINE_DEFAUT['6e'])
  const [calculatrice, setCalculatrice] = useState<'interdite' | 'autorisee'>('interdite')
  const [nombreSeries, setNombreSeries] = useState(1)
  const [processusActifs, setProcessusActifs] = useState<Record<Processus, boolean>>({ 1: false, 2: false, 3: false })
  const [erreur, setErreur] = useState(false)
  const [urlGeneree, setUrlGeneree] = useState<string | null>(null)

  const levelSlug = resoudreLevelSlug(niveau, heures)
  const niveauEntry = levelSlug ? LEVELS.find((l) => l.slug === levelSlug) : undefined

  const chapitre = niveauEntry?.chapters.find((c) => c.slug === chapitreSlug)
  const chapitreFonctionnel = estChapitreFonctionnel(levelSlug, chapitreSlug)

  const [lignes, setLignes] = useState<LigneSelection[]>(() => lignesInitiales(chapitre))

  const apercusDemonstration = useMemo(() => {
    const map = new Map<string, number>()
    if (chapitreFonctionnel && chapitre) {
      for (const section of chapitre.sections) map.set(section.id, deriveQuestionsOuvertes(chapitreSlug, section).length)
    }
    return map
  }, [chapitre, chapitreFonctionnel, chapitreSlug])

  const apercusComprehension = useMemo(() => {
    const map = new Map<string, number>()
    if (chapitreFonctionnel && chapitre) {
      for (const section of chapitre.sections) map.set(section.id, deriveQuestionsComprehension(chapitreSlug, section.id).length)
    }
    return map
  }, [chapitre, chapitreFonctionnel, chapitreSlug])

  function reglerNiveauHeures(prochainNiveau: NiveauCode, prochainesHeures: string) {
    setNiveau(prochainNiveau)
    setHeures(prochainesHeures)
    setHeuresSemaine(HEURES_SEMAINE_DEFAUT[prochainNiveau])
    const prochainLevelSlug = resoudreLevelSlug(prochainNiveau, prochainesHeures)
    const prochainNiveauEntry = prochainLevelSlug ? LEVELS.find((l) => l.slug === prochainLevelSlug) : undefined
    const prochainChapitre = prochainNiveauEntry?.chapters[0]
    setChapitreSlug(prochainChapitre?.slug ?? '')
    setLignes(lignesInitiales(prochainChapitre))
    setUrlGeneree(null)
  }

  function changerNiveau(prochain: NiveauCode) {
    reglerNiveauHeures(prochain, HEURES_PAR_NIVEAU[prochain][0] ?? '')
  }

  function changerChapitre(slug: string) {
    setChapitreSlug(slug)
    const prochainChapitre = niveauEntry?.chapters.find((c) => c.slug === slug)
    setLignes(lignesInitiales(prochainChapitre))
    setUrlGeneree(null)
  }

  function toggleProcessus(processus: Processus) {
    setProcessusActifs((prev) => ({ ...prev, [processus]: !prev[processus] }))
  }

  function mettreAJourLigne(sectionId: string, type: TypeQuestionEvaluation, patch: Partial<LigneSelection>) {
    setLignes((prev) => prev.map((l) => (l.sectionId === sectionId && l.type === type ? { ...l, ...patch } : l)))
    setUrlGeneree(null)
  }

  /** Met à jour le nombre d'exercices d'UNE famille/variante précise (ligne `type==='exercice'`
   * uniquement) — `nombre` de la ligne reste toujours la somme de `parVariante` (voir
   * `sommeParVariante`), jamais éditable directement pour ce type. */
  function mettreAJourVariante(sectionId: string, varianteId: string, nombre: number) {
    setLignes((prev) =>
      prev.map((l) => {
        if (l.sectionId !== sectionId || l.type !== 'exercice') return l
        const parVariante = { ...l.parVariante, [varianteId]: nombre }
        return { ...l, parVariante, nombre: sommeParVariante(parVariante) }
      }),
    )
    setUrlGeneree(null)
  }

  const totalPoints = lignes.reduce((total, l) => total + l.points * l.nombre, 0)

  function genererEvaluation() {
    if (!chapitre) return
    const titreFinal = titre || `Évaluation — ${chapitre.title}`
    const niveauLabel = niveauEntry?.label ?? niveau
    const url = buildEvaluationUrl(
      chapitreSlug,
      { numero, date, titre: titreFinal, niveauLabel, niveauNumero: NIVEAU_NUMERO[niveau], heuresSemaine, calculatrice, nombreSeries },
      lignes,
      chapitre.sections,
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
        Seuls les chapitres 1 et 2 de 6e (6h) — Fonctions réciproques &amp; cyclométriques, et Fonctions exponentielles — sont fonctionnels pour
        l'instant. Les autres niveaux/chapitres apparaissent ci-dessous mais restent désactivés (« bientôt ») — l'extension se fera lot par lot.
      </p>

      <div className="admin-eval-entete">
        <div className="admin-eval-field">
          <label htmlFor="eval-numero">N° de l'évaluation</label>
          <input id="eval-numero" type="text" value={numero} onChange={(e) => setNumero(e.target.value)} />
        </div>
        <div className="admin-eval-field">
          <label htmlFor="eval-date">Date</label>
          <input id="eval-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="admin-eval-field admin-eval-field-large">
          <label htmlFor="eval-titre">Titre de l'évaluation</label>
          <input
            id="eval-titre"
            type="text"
            placeholder={chapitre ? `Évaluation — ${chapitre.title}` : 'Titre'}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-eval-entete">
        <div className="admin-eval-field">
          <label htmlFor="eval-niveau">Niveau</label>
          <select id="eval-niveau" value={niveau} onChange={(e) => changerNiveau(e.target.value as NiveauCode)}>
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-eval-field">
          <label htmlFor="eval-heures">Nombre d'heures</label>
          <select
            id="eval-heures"
            value={heures}
            onChange={(e) => reglerNiveauHeures(niveau, e.target.value)}
            disabled={HEURES_PAR_NIVEAU[niveau].length === 0}
          >
            {HEURES_PAR_NIVEAU[niveau].length === 0 ? (
              <option value="">— (non applicable)</option>
            ) : (
              HEURES_PAR_NIVEAU[niveau].map((h) => (
                <option key={h} value={h} disabled={resoudreLevelSlug(niveau, h) === null}>
                  {h}
                  {resoudreLevelSlug(niveau, h) === null ? ' (bientôt)' : ''}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="admin-eval-field admin-eval-field-large">
          <label htmlFor="eval-chapitre">Chapitre</label>
          <select id="eval-chapitre" value={chapitreSlug} onChange={(e) => changerChapitre(e.target.value)} disabled={!niveauEntry}>
            {!niveauEntry && <option value="">Aucun chapitre disponible pour l'instant</option>}
            {niveauEntry?.chapters.map((c) => (
              <option key={c.slug} value={c.slug} disabled={!estChapitreFonctionnel(levelSlug, c.slug)}>
                {c.chapterNumber}. {c.title}
                {estChapitreFonctionnel(levelSlug, c.slug) ? '' : ' (bientôt)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-eval-entete">
        <div className="admin-eval-field">
          <label htmlFor="eval-heures-semaine">Volume horaire/sem</label>
          <input id="eval-heures-semaine" type="text" value={heuresSemaine} onChange={(e) => setHeuresSemaine(e.target.value)} />
        </div>
        <div className="admin-eval-field">
          <label htmlFor="eval-calculatrice">Calculatrice</label>
          <select id="eval-calculatrice" value={calculatrice} onChange={(e) => setCalculatrice(e.target.value as 'interdite' | 'autorisee')}>
            <option value="interdite">Interdite</option>
            <option value="autorisee">Autorisée</option>
          </select>
        </div>
        <div className="admin-eval-field">
          <label htmlFor="eval-series">Nombre de séries</label>
          <input
            id="eval-series"
            type="number"
            min={1}
            max={26}
            value={nombreSeries}
            onChange={(e) => setNombreSeries(Math.min(26, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>
      </div>
      {nombreSeries > 1 && (
        <p className="admin-eval-indisponible">
          {nombreSeries} versions anti-triche (A à {String.fromCharCode(64 + nombreSeries)}) seront générées — mêmes questions, exercices/vrai-faux/questions
          ouvertes indépendamment randomisés par série quand c'est possible.
        </p>
      )}

      {!chapitreFonctionnel && (
        <p className="admin-eval-indisponible">Ce chapitre n'est pas encore câblé côté plateforme-maths — reviens sur le chapitre pilote ci-dessus.</p>
      )}

      {chapitreFonctionnel && chapitre && (
        <>
          {([1, 2, 3] as const).map((processus) => (
            <div className="admin-eval-processus" key={processus}>
              <label className="admin-eval-processus-toggle">
                <input type="checkbox" checked={processusActifs[processus]} onChange={() => toggleProcessus(processus)} />
                <strong>Processus {processus}</strong> — {LABEL_PROCESSUS[processus]}
              </label>

              {processusActifs[processus] && processus === 3 && (
                <p className="admin-eval-indisponible">Aucun exercice de ce type dans ce chapitre pour l'instant.</p>
              )}

              {processusActifs[processus] && processus !== 3 && (
                <div className="admin-eval-arbre">
                  {chapitre.sections.map((section) => {
                    const lignesSection = lignes.filter((l) => l.sectionId === section.id && l.processus === processus)
                    if (lignesSection.length === 0) return null
                    return (
                      <details className="admin-eval-point" key={section.id}>
                        <summary>
                          {section.number}. {section.title}
                        </summary>
                        {lignesSection.map((ligne) => {
                          if (ligne.type === 'exercice') {
                            const catalogue = catalogueVariantesExercice(chapitreSlug, section.id)
                            return (
                              <div className="admin-eval-exercice" key={ligne.type}>
                                <span className="admin-eval-ligne-label">{LABEL_TYPE.exercice}</span>
                                {catalogue.map((variante) => (
                                  <div className="admin-eval-ligne" key={variante.id}>
                                    <span className="admin-eval-ligne-label admin-eval-ligne-label-variante">{variante.label}</span>
                                    <label>
                                      Nombre
                                      <input
                                        type="number"
                                        min={0}
                                        max={MAX_EXERCICE}
                                        value={ligne.parVariante?.[variante.id] ?? 0}
                                        onChange={(e) =>
                                          mettreAJourVariante(section.id, variante.id, Math.min(MAX_EXERCICE, Math.max(0, Number(e.target.value) || 0)))
                                        }
                                      />
                                    </label>
                                  </div>
                                ))}
                                <div className="admin-eval-ligne">
                                  <span className="admin-eval-ligne-label">Points / question (toutes variantes)</span>
                                  <label>
                                    Points
                                    <input
                                      type="number"
                                      min={1}
                                      value={ligne.points}
                                      onChange={(e) => mettreAJourLigne(section.id, ligne.type, { points: Number(e.target.value) || 1 })}
                                    />
                                  </label>
                                </div>
                              </div>
                            )
                          }

                          const estBanqueFixe = ligne.type === 'demonstration' || ligne.type === 'comprehension'
                          const disponibles = estBanqueFixe
                            ? (ligne.type === 'demonstration' ? apercusDemonstration : apercusComprehension).get(section.id) ?? 0
                            : MAX_VRAI_FAUX
                          const indisponible = estBanqueFixe && disponibles === 0
                          return (
                            <div className="admin-eval-ligne" key={ligne.type}>
                              <span className="admin-eval-ligne-label">
                                {LABEL_TYPE[ligne.type]}
                                {estBanqueFixe && ` (${disponibles} disponible${disponibles > 1 ? 's' : ''})`}
                                {indisponible &&
                                  (ligne.type === 'demonstration'
                                    ? ' — aucune formule/démonstration dans ce point'
                                    : ' — aucune question de compréhension pour ce point')}
                              </span>
                              <label>
                                Nombre
                                <input
                                  type="number"
                                  min={0}
                                  max={disponibles}
                                  value={ligne.nombre}
                                  disabled={indisponible}
                                  onChange={(e) =>
                                    mettreAJourLigne(section.id, ligne.type, { nombre: Math.min(disponibles, Math.max(0, Number(e.target.value) || 0)) })
                                  }
                                />
                              </label>
                              <label>
                                Points / question
                                <input
                                  type="number"
                                  min={1}
                                  value={ligne.points}
                                  disabled={indisponible}
                                  onChange={(e) => mettreAJourLigne(section.id, ligne.type, { points: Number(e.target.value) || 1 })}
                                />
                              </label>
                            </div>
                          )
                        })}
                      </details>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          <p className="admin-eval-total">Total : {totalPoints} point{totalPoints > 1 ? 's' : ''}</p>

          <button type="button" className="admin-gate-submit" onClick={genererEvaluation}>
            {nombreSeries > 1 ? `Générer les ${nombreSeries} séries` : "Générer l'évaluation"} (HTML A4, énoncé + corrigé)
          </button>
          {erreur && <p className="admin-gate-error">Coche au moins une question (nombre &gt; 0) avant de générer.</p>}
          {urlGeneree && (
            <p className="admin-eval-lien">
              Ouvert dans un nouvel onglet.{' '}
              <a href={urlGeneree} target="_blank" rel="noopener noreferrer">
                Rouvrir le lien
              </a>
              .
            </p>
          )}
        </>
      )}
    </div>
  )
}
