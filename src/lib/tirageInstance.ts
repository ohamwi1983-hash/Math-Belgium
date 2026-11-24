import type { AdaptateurFeuilleExercices } from '../entrainement/export/genererFeuilleExercices'
import { genererAvecCode, tirerGraine } from '../entrainement/export/codeExercice'
import { groupeVerdict, variantesDe } from '../entrainement/export/groupesVerdict'
import { EVALUATION_ADAPTER_REGISTRY } from './evaluationAdapterRegistry'

/**
 * Tirage d'une instance d'adaptateur (le même que l'appli interactive à partir d'un `?code=`) et
 * détection des variantes « toujours exactes ». Module sans dépendance vers `evaluationPayload` ni
 * `evaluationLocal` : les deux l'importent (`tirerInstance` est réexporté par `evaluationLocal`).
 */

export type Adaptateur = AdaptateurFeuilleExercices<never>

export function indexVariante(adaptateur: Adaptateur, varianteId: string): number | null {
  if (!adaptateur.catalogueVariantes || !adaptateur.genererInstanceAvecVariante) return null
  const i = adaptateur.catalogueVariantes.findIndex((v) => v.id === varianteId)
  return i >= 0 ? i : null
}

/** Instance reproductible — EXACTEMENT le tirage que fait l'appli interactive à partir du code
 * (`genererAvecCode`), pour que le QR code rouvre le même exercice. */
export function tirerInstance(adaptateur: Adaptateur, varianteId: string, graine: number): never {
  // Un plan porte toujours la variante RÉELLE ; un id de groupe « à verdict » n'arrive ici que pour
  // une sonde (`varianteAdmetCasParticulier`) : membre choisi par la graine, reproductible.
  const groupe = groupeVerdict(adaptateur, varianteId)
  if (groupe) varianteId = groupe.variantes[graine % groupe.variantes.length]!
  const varianteIndex = indexVariante(adaptateur, varianteId)
  return genererAvecCode(
    { graine, varianteIndex },
    adaptateur.catalogueVariantes,
    () => adaptateur.genererInstance(),
    adaptateur.genererInstanceAvecVariante ? (id) => adaptateur.genererInstanceAvecVariante!(id) : undefined,
  )
}

/** Recherche d'une instance qui ne soit PAS `calcul: 'exacte'` : au plus 100 tirages, 25 ms, au moins
 * 60 tirages. Mesuré (24/11/2026, 1 368 variantes profilées, 3 000 tirages chacune) : une variante qui a
 * des instances non exactes en a au moins 15,7 % (5gen15 « principal ») — la probabilité de la
 * déclarer « toujours exacte » à tort est alors < 4·10⁻⁸ ; une variante toujours exacte coûte ≤ 25 ms,
 * une seule fois (cache). */
const ESSAIS_EXACTE = 100
const ESSAIS_MIN_EXACTE = 60
const BUDGET_EXACTE_MS = 25
const cacheToujoursExacte = new Map<string, boolean>()

function membreToujoursExact(generatorId: string, adaptateur: Adaptateur, varianteId: string): boolean {
  const cle = `${generatorId}::${varianteId}`
  const connu = cacheToujoursExacte.get(cle)
  if (connu !== undefined) return connu
  let toujours = true
  let tirages = 0
  const fin = Date.now() + BUDGET_EXACTE_MS
  for (let essai = 0; essai < ESSAIS_EXACTE && (essai < ESSAIS_MIN_EXACTE || Date.now() < fin); essai++) {
    try {
      tirages++
      // `calculatriceDirecte` (la calculatrice donne directement la réponse) n'est pas tirée « autorisée »
      // non plus : comptée comme `exacte` ici (gen34 « valeurs », revue des profils du 24/11/2026).
      const calcul = adaptateur.profilInstance!(tirerInstance(adaptateur, varianteId, tirerGraine())).calcul
      if (calcul !== 'exacte' && calcul !== 'calculatriceDirecte') {
        toujours = false
        break
      }
    } catch {
      break
    }
  }
  if (tirages === 0) toujours = false
  cacheToujoursExacte.set(cle, toujours)
  return toujours
}

/** `true` si CETTE variante n'a AUCUN tirage qui ne soit pas `calcul: 'exacte'` (décision de
 * l'utilisateur, 24/11/2026 — symétrique de `varianteExigeCalculatrice`) : en évaluation « calculatrice
 * autorisée », elle est EXCLUE (rangée grisée « se fait sans calculatrice » dans le panneau, retirée des
 * items par `construireItemsPayload`, jamais ressortie par un palier de repli). Générateur sans profil
 * (`profilInstance` absent) : jamais. Groupe « à verdict » : exclu seulement si TOUS ses membres le sont.
 * Variante absente du catalogue (générateur sans variantes : « defaut ») : tirage libre. */
export function varianteToujoursExacte(generatorId: string, varianteId: string): boolean {
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[generatorId] as Adaptateur | undefined
  if (!adaptateur?.profilInstance) return false
  return variantesDe(adaptateur, varianteId).every((v) => membreToujoursExact(generatorId, adaptateur, v))
}
