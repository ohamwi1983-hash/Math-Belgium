import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from '../entrainement/export/genererFeuilleExercices'
import { texte } from '../entrainement/export/fragmentsDocx'
import { genererEvaluationHtml, type EnteteEvaluation as EnteteEvaluationSerie, type ItemEvaluation } from '../entrainement/export/assemblerEvaluationHtml'
import { EVALUATION_ADAPTER_REGISTRY } from './evaluationAdapterRegistry'
import { LEVELSLUG_FONCTIONNEL_4E, LEVELSLUG_FONCTIONNEL_5E, LEVELSLUG_FONCTIONNEL_6E, type EnTeteEvaluation, type ItemPayload } from './evaluationPayload'

/**
 * Génération locale (SANS passer par plateforme-maths) des deux documents HTML d'une évaluation/
 * feuille d'exercices — pendant de `AppEvaluation4e.tsx`/`AppEvaluation5e.tsx` côté plateforme-
 * maths, mais consommant directement un `ItemPayload[]` déjà construit en mémoire
 * (`construireItemsPayload`, voir `evaluationPayload.ts`) plutôt qu'un payload décodé depuis l'URL :
 * aucun encode/decode base64, aucune redirection de page, le tout reste dans l'onglet de
 * Math-Belgium.
 *
 * Portée actuelle : 4e (chapitres 1 à 8, 55 générateurs), 5e (chapitres 1 à 5, 35 générateurs) et,
 * pour 6e, uniquement le chapitre « Fonctions logarithmes » (`6gen13`-`6gen22`) — voir
 * `EVALUATION_ADAPTER_REGISTRY`. Les autres chapitres de 6e (fonctions réciproques &
 * cyclométriques, fonctions exponentielles) continuent de passer par l'URL vers plateforme-maths
 * (`buildEvaluationUrl`) tant que leurs adaptateurs n'ont pas été portés ici à leur tour — `items`
 * mélangeant plusieurs chapitres de 6e retombe donc sur l'URL dès qu'UN item vient d'un chapitre
 * non encore porté (`peutGenererLocalement` vérifie CHAQUE item, jamais seulement `levelSlug`).
 * Les questions `vraiFaux` restent elles aussi hors périmètre pour tous les niveaux (les banques
 * `BANQUE_QUIZ_*` n'ont pas été portées) — `peutGenererLocalement` renvoie `false` dès qu'une ligne
 * vrai/faux est sélectionnée, pour que l'appelant retombe sur `buildEvaluationUrl` dans ce cas.
 */

const LEVELSLUGS_GENERATION_LOCALE = new Set([LEVELSLUG_FONCTIONNEL_4E, LEVELSLUG_FONCTIONNEL_5E, LEVELSLUG_FONCTIONNEL_6E])

/** `true` si TOUS les items peuvent être construits localement (voir portée ci-dessus) — sinon
 * l'appelant (`EvaluationGeneratorPanel.tsx`) doit retomber sur `buildEvaluationUrl` (redirection
 * vers plateforme-maths), jamais générer un sous-ensemble en silence. */
export function peutGenererLocalement(levelSlug: string, items: ItemPayload[]): boolean {
  if (!LEVELSLUGS_GENERATION_LOCALE.has(levelSlug)) return false
  if (items.length === 0) return false
  return items.every((item) => {
    if (item.vraiFaux) return false
    if (item.exercice) return item.exercice.generatorId in EVALUATION_ADAPTER_REGISTRY
    return true
  })
}

const LETTRES_SERIE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LETTRES_REGROUPEMENT = 'abcdefghijklmnopqrstuvwxyz'

/** Préfixe la lettre ("a) ") au premier fragment du premier bloc de correction d'une instance
 * regroupée — miroir de `AppEvaluation4e.tsx::prefixerLettreBlocs` (plateforme-maths). */
function prefixerLettreBlocs(blocs: BlocCorrection[], lettre: string): BlocCorrection[] {
  const [premier, ...reste] = blocs
  if (!premier) return blocs
  if (premier.type === 'paragraphe') {
    return [{ ...premier, fragments: [texte(`${lettre}) `), ...premier.fragments] }, ...reste]
  }
  return [{ type: 'paragraphe', fragments: [texte(`${lettre})`)] }, premier, ...reste]
}

/** Fusionne `instances` sous une seule question quand l'adaptateur le permet (`regroupable`) —
 * miroir de `AppEvaluation4e.tsx::construireItemRegroupe` (plateforme-maths). */
function construireItemRegroupe<T>(
  adaptateur: AdaptateurFeuilleExercices<T>,
  instances: { instance: T; points: number }[],
  item: ItemPayload & { exercice: NonNullable<ItemPayload['exercice']> },
): ItemEvaluation {
  const consigneGroupee = adaptateur.construireEnonce(instances[0].instance).questions[0]?.consigne ?? []
  const section: SectionExercice = {
    enteteFragments: consigneGroupee,
    questions: instances.map(({ instance }): QuestionExercice => ({ consigne: adaptateur.construireEnonce(instance).enteteFragments ?? [] })),
    disposeEnTableau: true,
  }
  const correction: BlocCorrection[] = instances.flatMap(({ instance }, i) => prefixerLettreBlocs(adaptateur.construireCorrection(instance), LETTRES_REGROUPEMENT[i] ?? String(i + 1)))
  const points = instances.reduce((total, { points }) => total + points, 0)
  return { processus: item.processus, titreSection: item.titreSection, points, section, correction }
}

/** Miroir de `AppEvaluation4e.tsx`/`AppEvaluation5e.tsx::construireItemsExercice` — seule
 * différence : l'adaptateur vient de `EVALUATION_ADAPTER_REGISTRY` (Math-Belgium, fusion 4e+5e)
 * plutôt que de la table `ADAPTATEURS` locale à chaque page de plateforme-maths.
 * `peutGenererLocalement` garantit déjà que `generatorId` y figure. */
function construireItemsExercice(item: ItemPayload & { exercice: NonNullable<ItemPayload['exercice']> }): ItemEvaluation[] {
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[item.exercice.generatorId]
  if (!adaptateur) return []

  const instances = item.exercice.parVariante.flatMap(({ varianteId, nombre, points }) =>
    Array.from({ length: nombre }, () => ({
      points,
      instance: adaptateur.genererInstanceAvecVariante ? adaptateur.genererInstanceAvecVariante(varianteId) : adaptateur.genererInstance(),
    })),
  )
  if (instances.length === 0) return []

  if (adaptateur.regroupable && instances.length > 1) {
    return [construireItemRegroupe(adaptateur, instances, item)]
  }

  return instances.map(({ instance, points }) => ({
    processus: item.processus,
    titreSection: item.titreSection,
    points,
    section: adaptateur.construireEnonce(instance),
    correction: adaptateur.construireCorrection(instance),
  }))
}

/** Miroir de `AppEvaluation4e.tsx::construireItemsOuvertes` — `item.ouvertesParSerie` est déjà
 * rempli par `construireItemsPayload` (une entrée par série, voir `construireOuvertesParSerie`
 * dans `evaluationPayload.ts`), identique que la génération se fasse localement ou via l'URL. */
function construireItemsOuvertes(item: ItemPayload & { ouvertesParSerie: NonNullable<ItemPayload['ouvertesParSerie']> }, indexSerie: number): ItemEvaluation[] {
  const ouvertes = item.ouvertesParSerie[indexSerie] ?? item.ouvertesParSerie[0] ?? []
  return ouvertes.map((q) => {
    const section: SectionExercice = { questions: [{ consigne: q.enonce }] }
    const correction: BlocCorrection[] = q.corrige.map((paragraphe) => ({ type: 'paragraphe', fragments: paragraphe }))
    return { processus: item.processus, titreSection: item.titreSection, points: item.points, section, correction }
  })
}

function construireItemsEvaluation(items: ItemPayload[], indexSerie: number): ItemEvaluation[] {
  const resultat: ItemEvaluation[] = []
  for (const item of items) {
    if (item.exercice) resultat.push(...construireItemsExercice(item as ItemPayload & { exercice: NonNullable<ItemPayload['exercice']> }))
    else if (item.ouvertesParSerie) resultat.push(...construireItemsOuvertes(item as ItemPayload & { ouvertesParSerie: NonNullable<ItemPayload['ouvertesParSerie']> }, indexSerie))
  }
  return resultat
}

export interface EvaluationLocaleGeneree {
  serieLettre: string
  enonce: Blob
  corrige: Blob
}

/** Produit les deux documents HTML (énoncé + corrigé) de chaque série anti-triche — ne jamais
 * appeler sans avoir vérifié `peutGenererLocalement` au préalable (aucun garde-fou ici sur les
 * lignes `vraiFaux`/générateur non enregistré : ce serait dupliquer cette vérification à chaque
 * appel pour un cas que l'appelant a déjà les moyens d'exclure en amont). */
export async function genererEvaluationLocalement(entete: EnTeteEvaluation, items: ItemPayload[]): Promise<EvaluationLocaleGeneree[]> {
  const nombreSeries = Math.max(1, entete.nombreSeries)
  const resultats: EvaluationLocaleGeneree[] = []
  for (let s = 0; s < nombreSeries; s++) {
    const serieLettre = LETTRES_SERIE[s] ?? String(s + 1)
    const itemsEvaluation = construireItemsEvaluation(items, s)
    const enteteSerie: EnteteEvaluationSerie = {
      numero: entete.numero,
      date: entete.date,
      titre: entete.titre,
      niveauLabel: entete.niveauLabel,
      niveauNumero: entete.niveauNumero,
      heuresSemaine: entete.heuresSemaine,
      calculatrice: entete.calculatrice,
      serieLettre,
      afficherTitresSection: entete.afficherTitresSection,
      mode: entete.mode,
    }
    const { enonce, corrige } = await genererEvaluationHtml(enteteSerie, itemsEvaluation)
    resultats.push({ serieLettre, enonce, corrige })
  }
  return resultats
}
