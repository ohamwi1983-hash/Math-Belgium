import { useEffect, useRef, useState } from 'react'
import {
  LIBELLE_CATEGORIE,
  categorieDuNiveau,
  estimationEnCache,
  estimationVariante,
  rangCategorie,
  type EstimationVariante,
  type OptionsEstimation,
} from '../../entrainement/export/niveauDifficulte'
import type { AdaptateurFeuilleExercices } from '../../entrainement/export/genererFeuilleExercices'

/**
 * Repère discret « niv. 2–3 · ≈ 7 min » d'une rangée de variante (page de conception : feuille
 * d'exercices et évaluation). Valeurs du code réel : `estimationVariante` (= `niveauEtDuree` sur
 * quelques tirages de la variante, même cache que la durée estimée de l'en-tête).
 *
 * Calcul PARESSEUX : rien n'est tiré à l'ouverture du chapitre. Une estimation déjà en cache
 * s'affiche tout de suite ; sinon la rangée attend d'être (presque) à l'écran (IntersectionObserver),
 * puis son calcul passe dans une file traitée une variante à la fois pendant les temps morts du
 * navigateur (`requestIdleCallback`) — l'ouverture et le défilement ne sont pas ralentis.
 */

type Tache = () => void
const file: Tache[] = []
let planifie = false

function planifier() {
  if (planifie || file.length === 0) return
  planifie = true
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  const traiter = () => {
    planifie = false
    file.shift()?.()
    planifier()
  }
  if (w.requestIdleCallback) w.requestIdleCallback(traiter, { timeout: 500 })
  else window.setTimeout(traiter, 16)
}

function enFile(tache: Tache) {
  file.push(tache)
  planifier()
}

/** Abonnés prévenus quand une estimation vient d'être calculée (points pré-remplis d'une rangée pas
 * encore choisie, `ChampPoints` : sa valeur automatique dépend de la même estimation). */
const abonnes = new Set<() => void>()
let notificationPrevue = false
function notifierEstimation() {
  if (notificationPrevue) return
  notificationPrevue = true
  window.setTimeout(() => {
    notificationPrevue = false
    for (const f of [...abonnes]) f()
  }, 0)
}

/** Re-rend le composant appelant à chaque nouvelle estimation en cache (regroupées par tâche). */
export function useEstimationsCalculees(): void {
  const [, rafraichir] = useState(0)
  useEffect(() => {
    const f = () => rafraichir((n) => n + 1)
    abonnes.add(f)
    return () => {
      abonnes.delete(f)
    }
  }, [])
}

function texteNiveau(e: EstimationVariante): string | null {
  if (e.niveauMin === undefined || e.niveauMax === undefined) return null
  return e.niveauMin === e.niveauMax ? `${e.niveauMin}` : `${e.niveauMin}–${e.niveauMax}`
}

function texteDuree(minutes: number): string {
  return `≈ ${Math.max(1, Math.round(minutes))} min`
}

/** Infobulle : ce que le repère résume et sur quels tirages. */
function infobulle(e: EstimationVariante, reglages: string): string {
  const morceaux: string[] = []
  if (e.niveauMin !== undefined && e.niveauMax !== undefined) {
    const pMin = LIBELLE_CATEGORIE[categorieDuNiveau(e.niveauMin)]
    const pMax = LIBELLE_CATEGORIE[categorieDuNiveau(e.niveauMax)]
    morceaux.push(
      e.niveauMin === e.niveauMax
        ? `Niveau ${e.niveauMin} · ${pMin}`
        : `Niveaux ${e.niveauMin} à ${e.niveauMax} · ${pMin === pMax ? pMin : `${pMin} à ${pMax}`}`,
    )
  }
  if (e.dureeMinutes !== undefined) morceaux.push(`${texteDuree(e.dureeMinutes)} par exercice`)
  let texte = `${morceaux.join(', ')}.`
  if (e.provisoire) {
    texte += ' Provisoire : chapitre pas encore noté — niveau converti des anciennes étoiles, durée = constante du générateur.'
  } else {
    texte += ` Estimé sur ${e.tirages} tirage${e.tirages > 1 ? 's' : ''} de la variante (grille commune des feuilles).`
  }
  if (!e.filtreRespecte) texte += ' Aucun tirage ne respectait les réglages de la rangée : estimation sur des tirages libres de la variante.'
  else if (reglages) texte += ` ${reglages}`
  return texte
}

export function RepereNiveauDuree<T>({
  adaptateur,
  varianteId,
  options,
  reglages,
}: {
  adaptateur: AdaptateurFeuilleExercices<T>
  varianteId: string
  /** Réglages de la rangée (filtre + clé de cache) ; absent = tirages libres de la variante. */
  options?: OptionsEstimation<T>
  /** Phrase de l'infobulle qui dit quels réglages sont respectés. */
  reglages: string
}) {
  const cleFiltre = options?.filtre ? options.cleFiltre : undefined
  const enCache = estimationEnCache(adaptateur, varianteId, cleFiltre)
  const [, rafraichir] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  // Options courantes (le filtre est une fermeture recréée à chaque rendu) : la tâche lit la dernière.
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    if (enCache !== null) return
    const el = ref.current
    if (!el) return
    let actif = true
    let demande = false
    const lancer = () => {
      if (demande) return
      demande = true
      enFile(() => {
        if (!actif) return
        estimationVariante(adaptateur, varianteId, optionsRef.current)
        rafraichir((n) => n + 1)
        notifierEstimation()
      })
    }
    if (typeof IntersectionObserver === 'undefined') {
      lancer()
      return () => {
        actif = false
      }
    }
    const obs = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          obs.disconnect()
          lancer()
        }
      },
      { rootMargin: '200px 0px' },
    )
    obs.observe(el)
    return () => {
      actif = false
      obs.disconnect()
    }
  }, [adaptateur, varianteId, cleFiltre, enCache])

  if (enCache === null) {
    return (
      <span ref={ref} className="admin-eval-repere" data-etat="attente" aria-hidden="true">
        niv. …
      </span>
    )
  }
  if (enCache === undefined) return null
  const niveau = texteNiveau(enCache)
  const categorieMin = enCache.niveauMin !== undefined ? categorieDuNiveau(enCache.niveauMin) : null
  const categorieMax = enCache.niveauMax !== undefined ? categorieDuNiveau(enCache.niveauMax) : null
  const titre = infobulle(enCache, reglages)
  return (
    <span ref={ref} className="admin-eval-repere" data-etat="pret" title={titre}>
      {niveau !== null && (
        <>
          niv.{' '}
          {enCache.niveauMin === enCache.niveauMax ? (
            <b className={`admin-eval-repere-n niv-c${rangCategorie(categorieMin!)}`}>{enCache.niveauMin}</b>
          ) : (
            <>
              <b className={`admin-eval-repere-n niv-c${rangCategorie(categorieMin!)}`}>{enCache.niveauMin}</b>–
              <b className={`admin-eval-repere-n niv-c${rangCategorie(categorieMax!)}`}>{enCache.niveauMax}</b>
            </>
          )}
          {enCache.provisoire && <span className="admin-eval-repere-provisoire">*</span>}
          {categorieMin && categorieMin === categorieMax && <span className="admin-eval-repere-palier"> · {LIBELLE_CATEGORIE[categorieMin]}</span>}
        </>
      )}
      {niveau !== null && enCache.dureeMinutes !== undefined && ' · '}
      {enCache.dureeMinutes !== undefined && texteDuree(enCache.dureeMinutes)}
    </span>
  )
}
