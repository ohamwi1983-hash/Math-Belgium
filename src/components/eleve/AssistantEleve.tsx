import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LEVELS, findChapter } from '../../content/chaptersIndex'
import type { ChapterContent } from '../../content/types'
import { useCompte } from '../../lib/compteContexte'
import { estChapitreFonctionnel } from '../../lib/chapitresFonctionnels'
import { genererDocumentsDepuisPlan, type DocumentGenere } from '../../lib/evaluationLocal'
import { declencherTelechargement } from '../../entrainement/export/telechargerBlob'
import type { Processus } from '../../lib/evaluationPayload'
import { CATEGORIES_NIVEAU, LIBELLE_CATEGORIE, PLAGE_CATEGORIE, rangCategorie, type CategorieNiveau } from '../../entrainement/export/niveauDifficulte'
import {
  COMPETENCES_ELEVE,
  DUREES_ELEVE,
  LIBELLE_COMPETENCE,
  composer,
  construirePlanEleve,
  disponibilite,
  notionsDuChapitre,
  preparerCandidats,
  texteCategories,
  texteSeulement,
  type Candidat,
  type PlanEleve,
  type ReglagesEleve,
  type TypeEleve,
} from '../../lib/compositionEleve'

/**
 * Assistant « Préparer mon évaluation » — parcours ÉLÈVE des pages publiques `/exercice` et
 * `/{niveau}/{chapitre}/exercices` (visiteur non connecté ; un professeur connecté voit le panneau
 * professeur). Trois blocs (maquettes validées « EleveAssistant » / « EleveTelephone ») : que veux-tu
 * faire (feuille d'exercices ou évaluation blanche), sur quoi (chapitre, notions, compétences annoncées),
 * combien de temps et quels niveaux (cases à cocher, tous par défaut ; un niveau sans exercice pour
 * ces notions et compétences est grisé avec sa raison) ; puis un récapitulatif EXACT (le plan est
 * préparé à l'avance : questions imprimées, durée, points, niveaux et compétences réellement obtenus)
 * et le bouton de génération. Chaque clic produit un nouveau tirage.
 * Aucune donnée d'élève : rien n'est enregistré.
 */

/** Numéros 1–7 d'une catégorie, tels qu'imprimés sur les feuilles (« 5–7 » pour très difficile). */
function numerosCategorie(c: CategorieNiveau): string {
  const [a, b] = PLAGE_CATEGORIE[c]
  return a === b ? String(a) : `${a}–${b}`
}

function listeCompetences(ps: readonly Processus[]): string {
  const mots = ps.map((p) => LIBELLE_COMPETENCE[p])
  return mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} et ${mots[mots.length - 1]}`
}

/** Chapitres proposés d'un niveau : câblés, avec au moins une notion à générateur. */
function chapitresDisponibles(levelSlug: string): ChapterContent[] {
  return (LEVELS.find((l) => l.slug === levelSlug)?.chapters ?? []).filter((c) => estChapitreFonctionnel(levelSlug, c.slug) && notionsDuChapitre(c).length > 0)
}

function useEtroit(): boolean {
  const requete = '(max-width: 600px)'
  const [etroit, setEtroit] = useState(() => typeof window !== 'undefined' && window.matchMedia(requete).matches)
  useEffect(() => {
    const mq = window.matchMedia(requete)
    const suivre = () => setEtroit(mq.matches)
    mq.addEventListener('change', suivre)
    return () => mq.removeEventListener('change', suivre)
  }, [])
  return etroit
}

function nomFichier(chapitre: ChapterContent, type: TypeEleve, doc: DocumentGenere): string {
  const base = `${type === 'blanche' ? 'Évaluation blanche' : "Feuille d'exercices"} — ${chapitre.title}`.replace(/[\\/:*?"<>|]/g, '-')
  return `${base}${doc.type === 'amenagee' ? ' — version aménagée' : ''}.html`
}

export function AssistantEleve({ verrouille }: { verrouille?: { levelSlug: string; chapitreSlug: string } }) {
  const compte = useCompte()
  const location = useLocation()
  const etroit = useEtroit()

  // `/exercice?niveau=5e-4h` : année présélectionnée (lien de la page d'accueil) ; valeur inconnue, ou
  // année sans chapitre proposé, ignorée (première année).
  const [anneeInitiale] = useState(() => {
    const demandee = new URLSearchParams(location.search).get('niveau')
    return demandee && LEVELS.some((l) => l.slug === demandee) && chapitresDisponibles(demandee).length > 0 ? demandee : LEVELS[0].slug
  })
  const [levelSlug, setLevelSlug] = useState(verrouille?.levelSlug ?? anneeInitiale)
  const [chapitreSlug, setChapitreSlug] = useState(verrouille?.chapitreSlug ?? chapitresDisponibles(anneeInitiale)[0]?.slug ?? '')
  const chapitre = findChapter(levelSlug, chapitreSlug)
  const notions = useMemo(() => (chapitre ? notionsDuChapitre(chapitre) : []), [chapitre])

  const [type, setType] = useState<TypeEleve>('blanche')
  /** `null` : tout le chapitre. */
  const [choisies, setChoisies] = useState<Set<string> | null>(null)
  const [notionsDepliees, setNotionsDepliees] = useState(false)
  const [duree, setDuree] = useState<number>(30)
  /** Niveaux cochés (intention de l'élève) : tous par défaut, niveaux mélangés. */
  const [niveauxCoches, setNiveauxCoches] = useState<Set<CategorieNiveau>>(() => new Set(CATEGORIES_NIVEAU))
  /** Compétences cochées : les trois par défaut. */
  const [competencesCochees, setCompetencesCochees] = useState<Set<Processus>>(() => new Set([1, 2, 3] as Processus[]))
  /** Petit rappel quand l'élève essaie de tout décocher. */
  const [rappelMinimum, setRappelMinimum] = useState<'niveau' | 'competence' | null>(null)
  const [amenagee, setAmenagee] = useState(false)

  const [candidats, setCandidats] = useState<Candidat[] | null>(null)
  const [progression, setProgression] = useState<{ fait: number; total: number } | null>(null)
  /** Plan préparé, avec la clé des réglages pour lesquels il a été tiré : un plan d'anciens réglages
   * (changement pas encore recalculé) n'est jamais affiché ni généré. */
  const [prepareBrut, setPrepare] = useState<(PlanEleve & { cle: string }) | null>(null)
  const [enPreparation, setEnPreparation] = useState(false)
  const [tirage, setTirage] = useState(0)
  const [genereEnCours, setGenereEnCours] = useState(false)
  const [resultat, setResultat] = useState<{ plan: PlanEleve; documents: DocumentGenere[]; type: TypeEleve; chapitre: ChapterContent } | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const urls = useRef<string[]>([])
  const blocResultat = useRef<HTMLDivElement>(null)

  const sections = useMemo(() => (choisies ? [...choisies] : []), [choisies])
  const niveaux = useMemo(() => CATEGORIES_NIVEAU.filter((c) => niveauxCoches.has(c)), [niveauxCoches])
  const competences = useMemo(() => ([1, 2, 3] as Processus[]).filter((p) => competencesCochees.has(p)), [competencesCochees])
  // Disponibilité EN DIRECT, sur les candidats déjà préparés (niveaux des tirages d'estimation).
  const dispo = useMemo(() => (candidats ? disponibilite(candidats, { sections, competences, niveaux }) : null), [candidats, sections, competences, niveaux])
  /** Niveaux cochés ET proposés : au moins un, sinon rien n'est composé. */
  const niveauxUtiles = dispo ? niveaux.filter((c) => dispo.niveaux[c]) : niveaux
  const competencesUtiles = dispo ? competences.filter((p) => dispo.parCompetence[p].total > 0) : competences
  const reglagesValides = niveauxUtiles.length > 0 && competencesUtiles.length > 0
  const cleReglages = JSON.stringify([levelSlug, chapitreSlug, sections, duree, niveaux, competences, type, amenagee, tirage])
  const prepare = prepareBrut && prepareBrut.cle === cleReglages ? prepareBrut : null

  // Candidats du chapitre (niveaux et durées estimés), calculés une variante à la fois.
  useEffect(() => {
    if (!chapitre) return
    let annule = false
    setCandidats(null)
    setPrepare(null)
    setProgression(null)
    preparerCandidats(chapitre, type, (fait, total) => {
      if (!annule) setProgression({ fait, total })
    })
      .then((c) => {
        if (!annule) setCandidats(c)
      })
      .catch(() => {
        if (!annule) setErreur('Impossible de préparer les exercices de ce chapitre.')
      })
    return () => {
      annule = true
    }
  }, [chapitre, type])

  // Plan préparé à l'avance (récapitulatif exact) ; un nouveau à chaque changement et après chaque
  // génération (`tirage`).
  useEffect(() => {
    if (!chapitre || !candidats) return
    if (!reglagesValides) {
      setPrepare(null)
      setEnPreparation(false)
      return
    }
    let annule = false
    setEnPreparation(true)
    const reglages: ReglagesEleve = { levelSlug, chapitreSlug: chapitre.slug, sections, duree, niveaux, competences, type, amenagee }
    const minuterie = window.setTimeout(() => {
      const composition = composer(candidats, reglages)
      construirePlanEleve(reglages, chapitre, composition)
        .then((p) => {
          if (!annule) {
            setPrepare({ ...p, cle: JSON.stringify([levelSlug, chapitre.slug, sections, duree, niveaux, competences, type, amenagee, tirage]) })
            setErreur(null)
          }
        })
        .catch((e) => {
          // Composition vide : rien ne convient (dit à l'élève, pas une erreur de la page).
          if (!(e instanceof Error && /vide/i.test(e.message))) console.error(e)
          if (!annule) {
            setPrepare(null)
            setErreur(sections.length > 0 ? 'Aucun exercice ne convient à ces réglages : ajoute une notion, un niveau ou une compétence.' : 'Aucun exercice ne convient à ces réglages : ajoute un niveau ou une compétence.')
          }
        })
        .finally(() => {
          if (!annule) setEnPreparation(false)
        })
    }, 150)
    return () => {
      annule = true
      window.clearTimeout(minuterie)
    }
  }, [chapitre, candidats, levelSlug, sections, duree, niveaux, competences, type, amenagee, tirage, reglagesValides])

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), [])

  function changerNiveauScolaire(slug: string) {
    setLevelSlug(slug)
    setChapitreSlug(chapitresDisponibles(slug)[0]?.slug ?? '')
    setChoisies(null)
    setResultat(null)
  }

  function changerChapitre(slug: string) {
    setChapitreSlug(slug)
    setChoisies(null)
    setResultat(null)
  }

  function basculerNotion(id: string) {
    setChoisies((actuelles) => {
      // « Tout le chapitre » coché : un clic sur une notion ne garde que celle-ci.
      if (!actuelles) return new Set([id])
      const suivantes = new Set(actuelles)
      if (suivantes.has(id)) suivantes.delete(id)
      else suivantes.add(id)
      return suivantes.size === 0 || suivantes.size === notions.length ? null : suivantes
    })
  }

  function basculerNiveau(c: CategorieNiveau) {
    if (dispo && !dispo.niveaux[c]) return
    const suivants = new Set(niveauxCoches)
    if (suivants.has(c)) suivants.delete(c)
    else suivants.add(c)
    // Au moins un niveau coché ET proposé.
    if (!CATEGORIES_NIVEAU.some((k) => suivants.has(k) && (!dispo || dispo.niveaux[k]))) {
      setRappelMinimum('niveau')
      return
    }
    setRappelMinimum(null)
    setNiveauxCoches(suivants)
  }

  function basculerCompetence(p: Processus) {
    if (dispo && dispo.parCompetence[p].total === 0) return
    const suivantes = new Set(competencesCochees)
    if (suivantes.has(p)) suivantes.delete(p)
    else suivantes.add(p)
    if (![...suivantes].some((q) => !dispo || dispo.parCompetence[q].total > 0)) {
      setRappelMinimum('competence')
      return
    }
    setRappelMinimum(null)
    setCompetencesCochees(suivantes)
  }

  async function generer() {
    if (!prepare || !chapitre) return
    setGenereEnCours(true)
    setErreur(null)
    try {
      const documents = await genererDocumentsDepuisPlan(prepare.plan)
      urls.current.forEach((u) => URL.revokeObjectURL(u))
      urls.current = []
      setResultat({ plan: prepare, documents, type, chapitre })
      setTirage((t) => t + 1)
      window.setTimeout(() => blocResultat.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (e) {
      console.error(e)
      setErreur('Erreur pendant la génération — réessaie.')
    } finally {
      setGenereEnCours(false)
    }
  }

  function ouvrir(doc: DocumentGenere, imprimer: boolean) {
    const url = URL.createObjectURL(doc.blob)
    urls.current.push(url)
    window.open(url + (imprimer ? '#imprimer' : ''), '_blank')
  }

  const blanche = type === 'blanche'
  const retour = encodeURIComponent(location.pathname + location.search)
  const lienProfesseur = compte.etat !== 'indisponible'
  const notionsVisibles = etroit && !notionsDepliees && notions.length > 4 ? notions.slice(0, 3) : notions
  const toutLeChapitre = choisies === null

  const resume = prepare?.resume
  const recap = resume
    ? blanche
      ? `${resume.questions} question${resume.questions > 1 ? 's' : ''} · ≈ ${resume.dureeConseillee} min · ${resume.points ?? 20} points`
      : `${resume.questions} exercice${resume.questions > 1 ? 's' : ''} · ≈ ${resume.dureeConseillee} min`
    : progression && !candidats
      ? `Préparation des exercices… ${Math.round((100 * progression.fait) / Math.max(1, progression.total))} %`
      : candidats && !reglagesValides
        ? 'Rien à composer avec ces réglages'
        : 'Préparation…'
  /** Niveaux et compétences réellement obtenus (récapitulatif exact). */
  const recapContenu = resume
    ? `${resume.categories.length === 1 ? 'Niveau' : 'Niveaux'} : ${texteCategories(resume.categories) || '—'} · ${listeCompetences(resume.competences)}${resume.competences.length > 1 ? ', temps partagé à parts égales' : ''}`
    : null
  const tousNiveauxCoches = niveaux.length === CATEGORIES_NIVEAU.length
  const niveauxGrises = dispo ? CATEGORIES_NIVEAU.filter((c) => !dispo.niveaux[c]) : []
  /** Pourquoi des niveaux sont grisés : ce que chaque compétence cochée offre vraiment. */
  const raisonsNiveaux =
    dispo && niveauxGrises.length > 0
      ? competences.filter((p) => dispo.parCompetence[p].total > 0).map((p) => `${LIBELLE_COMPETENCE[p]} : ${texteSeulement(dispo.parCompetence[p].categories)}`)
      : []
  /** Compétences cochées sans exercice aux niveaux cochés : signalées, leur temps va aux autres. */
  const competencesSansNiveau = dispo ? competences.filter((p) => dispo.parCompetence[p].total > 0 && !dispo.parCompetence[p].auxNiveauxCoches) : []

  return (
    <div className="eleve">
      <div className="eleve-tete">
        <div>
          <p className="eyebrow eleve-surtitre">{chapitre ? `${chapitre.level} · ${chapitre.title}` : 'Entraînement'}</p>
          <h1 className="eleve-titre">Préparer mon évaluation</h1>
        </div>
        {lienProfesseur && (
          <Link className="eleve-lien-prof" to={`/connexion?retour=${retour}`}>
            Je suis professeur : me connecter
          </Link>
        )}
      </div>

      <section className="eleve-bloc" aria-labelledby="eleve-q1">
        <div className="eleve-bloc-tete">
          <span className="eleve-num" aria-hidden="true">
            1
          </span>
          <h2 id="eleve-q1">Que veux-tu faire ?</h2>
        </div>
        <div className="eleve-cartes" role="radiogroup" aria-labelledby="eleve-q1">
          <button type="button" role="radio" aria-checked={type === 'feuille'} className="eleve-carte" onClick={() => setType('feuille')}>
            <span className="eleve-carte-titre">Une feuille d'exercices</span>
            <span className="eleve-carte-texte">T'entraîner notion par notion, à ton rythme. Corrigé à la fin, QR code pour refaire en ligne avec les aides.</span>
          </button>
          <button type="button" role="radio" aria-checked={type === 'blanche'} className="eleve-carte" onClick={() => setType('blanche')}>
            <span className="eleve-carte-titre">Une évaluation blanche</span>
            <span className="eleve-carte-texte">Comme une vraie interro : en temps limité, avec des points. Tu te corriges ensuite avec le corrigé détaillé.</span>
          </button>
        </div>
      </section>

      <section className="eleve-bloc" aria-labelledby="eleve-q2">
        <div className="eleve-bloc-tete eleve-bloc-tete-large">
          <div className="eleve-bloc-tete">
            <span className="eleve-num" aria-hidden="true">
              2
            </span>
            <h2 id="eleve-q2">Sur quoi porte ton évaluation ?</h2>
          </div>
          {verrouille && (
            <Link className="eleve-lien-discret" to="/exercice">
              Changer de chapitre
            </Link>
          )}
        </div>
        {!verrouille && (
          <div className="eleve-choix-chapitre">
            <label className="eleve-champ">
              <span>Année</span>
              <select value={levelSlug} onChange={(e) => changerNiveauScolaire(e.target.value)}>
                {LEVELS.filter((l) => chapitresDisponibles(l.slug).length > 0).map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="eleve-champ eleve-champ-large">
              <span>Chapitre</span>
              <select value={chapitreSlug} onChange={(e) => changerChapitre(e.target.value)}>
                {chapitresDisponibles(levelSlug).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.chapterNumber}. {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <p className="eleve-aide">Coche ce que ton professeur a annoncé. Pas sûr ? Prends tout le chapitre.</p>
        <div className="eleve-puces" role="group" aria-label="Notions">
          <button type="button" className="eleve-puce" aria-pressed={toutLeChapitre} onClick={() => setChoisies(null)}>
            Tout le chapitre
          </button>
          {notionsVisibles.map((n) => {
            const on = !toutLeChapitre && choisies!.has(n.sectionId)
            return (
              <button key={n.sectionId} type="button" className="eleve-puce" aria-pressed={on} onClick={() => basculerNotion(n.sectionId)}>
                {on && <span aria-hidden="true">✓ </span>}
                {n.titre}
              </button>
            )
          })}
          {notionsVisibles.length < notions.length && (
            <button type="button" className="eleve-puce eleve-puce-plus" onClick={() => setNotionsDepliees(true)} aria-label={`Afficher les ${notions.length - notionsVisibles.length} autres notions`}>
              + {notions.length - notionsVisibles.length}
            </button>
          )}
        </div>
        <div className="eleve-reglage">
          <span className="eleve-etiquette" id="eleve-competences">
            Compétences
          </span>
          <p className="eleve-aide">Coche ce que ton professeur a annoncé pour l'interrogation. Le temps est partagé à parts égales entre les compétences cochées.</p>
          <div className="eleve-coches" role="group" aria-labelledby="eleve-competences">
            {COMPETENCES_ELEVE.map(({ id, libelle }) => {
              const vide = !!dispo && dispo.parCompetence[id].total === 0
              const on = competencesCochees.has(id) && !vide
              return (
                <button
                  key={id}
                  type="button"
                  className="eleve-coche"
                  aria-pressed={on}
                  aria-disabled={vide || undefined}
                  title={vide ? `Aucun exercice « ${libelle} » dans ces notions` : undefined}
                  onClick={() => basculerCompetence(id)}
                >
                  <span className="eleve-coche-case" aria-hidden="true">
                    {on ? '✓' : ''}
                  </span>
                  <span>{libelle}</span>
                  {vide && <span className="eleve-coche-raison">aucun exercice ici</span>}
                </button>
              )
            })}
          </div>
          {rappelMinimum === 'competence' && (
            <p className="eleve-note" role="status">
              Garde au moins une compétence.
            </p>
          )}
        </div>
      </section>

      <section className="eleve-bloc" aria-labelledby="eleve-q3">
        <div className="eleve-bloc-tete">
          <span className="eleve-num" aria-hidden="true">
            3
          </span>
          <h2 id="eleve-q3">Combien de temps, et quels niveaux ?</h2>
        </div>
        <div className="eleve-reglages">
          <div className="eleve-reglage">
            <span className="eleve-etiquette" id="eleve-duree">
              Durée
            </span>
            <div className="eleve-segments" role="radiogroup" aria-labelledby="eleve-duree">
              {DUREES_ELEVE.map((d) => (
                <button key={d} type="button" role="radio" aria-checked={duree === d} onClick={() => setDuree(d)}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="eleve-reglage">
          <div className="eleve-etiquette-ligne">
            <span className="eleve-etiquette" id="eleve-niveau">
              Niveaux
            </span>
            {!tousNiveauxCoches && (
              <button type="button" className="eleve-lien-bouton" onClick={() => setNiveauxCoches(new Set(CATEGORIES_NIVEAU))}>
                Tout cocher
              </button>
            )}
          </div>
          <p className="eleve-aide" id="eleve-niveau-aide">
            Tous cochés : les niveaux sont mélangés.
          </p>
          <div className="eleve-coches" role="group" aria-labelledby="eleve-niveau" aria-describedby="eleve-niveau-aide">
            {CATEGORIES_NIVEAU.map((c) => {
              const grise = !!dispo && !dispo.niveaux[c]
              const on = niveauxCoches.has(c) && !grise
              return (
                <button
                  key={c}
                  type="button"
                  className="eleve-coche eleve-coche-niveau"
                  aria-pressed={on}
                  aria-disabled={grise || undefined}
                  aria-describedby={grise ? 'eleve-niveau-raisons' : undefined}
                  title={grise ? `Aucun exercice ${LIBELLE_CATEGORIE[c]} pour ${listeCompetences(competences)} dans ces notions` : undefined}
                  onClick={() => basculerNiveau(c)}
                >
                  <span className="eleve-coche-case" aria-hidden="true">
                    {on ? '✓' : ''}
                  </span>
                  <span className={`eleve-niv-num niv-c${rangCategorie(c)}`}>{numerosCategorie(c)}</span>
                  <span>{LIBELLE_CATEGORIE[c]}</span>
                </button>
              )
            })}
          </div>
          {rappelMinimum === 'niveau' && (
            <p className="eleve-note" role="status">
              Garde au moins un niveau.
            </p>
          )}
          {(raisonsNiveaux.length > 0 || competencesSansNiveau.length > 0) && (
            <div className="eleve-dispo" id="eleve-niveau-raisons">
              {raisonsNiveaux.length > 0 && (
                <p>
                  Grisé : aucun exercice à ce niveau dans ces notions. {raisonsNiveaux.join(' · ')}.
                </p>
              )}
              {competencesSansNiveau.map((p) => (
                <p key={p}>
                  {LIBELLE_COMPETENCE[p]} : aucun exercice aux niveaux cochés ({texteSeulement(dispo!.parCompetence[p].categories)}) — son temps va aux autres compétences cochées.
                </p>
              ))}
            </div>
          )}
        </div>
        <label className="eleve-case">
          <input type="checkbox" checked={amenagee} onChange={(e) => setAmenagee(e.target.checked)} /> Version aménagée (plus grande, plus aérée)
        </label>
        {resume?.elargi && (
          <p className="eleve-note">
            Peu d'exercices aux niveaux cochés dans ces notions : des exercices de niveau {texteCategories(resume.categoriesHorsChoix)} complètent.
          </p>
        )}
      </section>

      <section className="eleve-recap" aria-label="Récapitulatif" aria-live="polite">
        <div>
          <p className="eleve-recap-titre">{blanche ? 'Ton évaluation blanche' : "Ta feuille d'exercices"}</p>
          <p className="eleve-recap-detail">
            {recap}
            {resume && <span className="eleve-recap-fin"> · corrigé détaillé à la fin</span>}
          </p>
          {recapContenu && <p className="eleve-recap-contenu">{recapContenu}</p>}
        </div>
        <button type="button" className="eleve-generer" onClick={() => void generer()} disabled={!prepare || genereEnCours || enPreparation}>
          {genereEnCours ? 'Génération…' : blanche ? 'Générer mon évaluation blanche' : 'Générer ma feuille d’exercices'}
        </button>
      </section>
      {erreur && (
        <p className="eleve-erreur" role="alert">
          {erreur}
        </p>
      )}

      {resultat && (
        <section className="eleve-resultat" ref={blocResultat} aria-labelledby="eleve-resultat-titre">
          <h2 id="eleve-resultat-titre">{resultat.type === 'blanche' ? 'Ton évaluation blanche est prête' : 'Ta feuille d’exercices est prête'}</h2>
          <p className="eleve-aide">
            {resultat.type === 'blanche'
              ? `${resultat.plan.resume.questions} questions · ≈ ${resultat.plan.resume.dureeConseillee} min · ${resultat.plan.resume.points ?? 20} points indicatifs. Imprime-la, ou ouvre-la et enregistre-la en PDF.`
              : `${resultat.plan.resume.questions} exercices · ≈ ${resultat.plan.resume.dureeConseillee} min. Imprime-la, ou ouvre-la et enregistre-la en PDF.`}
          </p>
          <ul className="eleve-documents">
            {resultat.documents.map((doc) => (
              <li key={doc.suffixe}>
                <span className="eleve-document-nom">{doc.type === 'amenagee' ? 'Version aménagée' : resultat.type === 'blanche' ? 'Évaluation blanche + corrigé détaillé' : "Feuille d'exercices + corrigé détaillé"}</span>
                <span className="eleve-document-actions">
                  <button type="button" onClick={() => ouvrir(doc, false)}>
                    Ouvrir
                  </button>
                  <button type="button" onClick={() => ouvrir(doc, true)}>
                    Imprimer
                  </button>
                  <button type="button" onClick={() => declencherTelechargement(doc.blob, nomFichier(resultat.chapitre, resultat.type, doc))}>
                    Télécharger
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="eleve-aide">Un nouveau clic sur « Générer » tire de nouveaux exercices.</p>
        </section>
      )}

      <aside className="eleve-conseil">
        <p className="eleve-conseil-titre">Comment bien l'utiliser</p>
        <p>
          {blanche
            ? 'Fais-la sans ton cours, chronomètre lancé. Corrige-toi ensuite avec le corrigé détaillé, puis refais en ligne, avec les aides, les exercices ratés grâce à leur QR code.'
            : "Fais les exercices sur une feuille à part. Compare d'abord tes résultats aux réponses brèves, puis lis le corrigé détaillé ; refais en ligne, avec les aides, ceux que tu as ratés grâce à leur QR code."}
        </p>
      </aside>
    </div>
  )
}
