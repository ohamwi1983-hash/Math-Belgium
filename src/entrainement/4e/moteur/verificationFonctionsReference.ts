import type {
  ExerciceFonctionReference,
  FamilleReference,
  ReponseCurseursFonctionReference,
} from "../core/fonctionsReference.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";

/**
 * Les 6 familles se ramènent toutes à une seule formule (spec-fonctions-reference.md section 1,
 * réorganisée par prompt-nouvel-ordre-transformations.md selon l'ordre exact des transformations
 * géométriques appliquées) :
 *
 *   f(x) = SOX · (EV/CV) · g(SOY · (CH/EH) · (x - TH)) + TV
 *
 * où g dépend uniquement de la famille. L'ordre est désormais : (1) TH soustrait directement à x
 * (translation pure), (2) CH/EH met le résultat à l'échelle, (3) SOY réfléchit le résultat
 * (horizontalement), (4) g s'applique, (5) SOX réfléchit le résultat (verticalement), (6) EV/CV met
 * le résultat à l'échelle, (7) TV est ajouté en tout dernier. Une restructuration antérieure
 * (`prompt-restructuration-formule-th-ch.md`) avait déjà découplé le point caractéristique de
 * CH/EH en soustrayant TH avant leur mise à l'échelle, mais gardait SOY combiné à `x` AVANT cette
 * soustraction (`CH/EH·(SOY·x-TH)`) — ce qui faisait encore dépendre la position du point
 * caractéristique du signe de SOY (le pivot valait `TH·SOY`, pas `TH`). Cette réorganisation
 * applique SOY comme une PURE réflexion du résultat déjà translaté-et-mis-à-l'échelle
 * (`SOY·((CH/EH)·(x-TH))`), donc le point caractéristique tombe désormais toujours exactement en
 * `x=TH`, indépendamment de CH, EH **et** SOY (voir `pivotX` plus bas). Reste algébriquement
 * valable pour "inverse" (g(u)=1/u, EV/(CV·u) = (EV/CV)·(1/u)) sans branche spéciale. Type d'entrée
 * volontairement structurel (comme `calculerA` de verificationTransformationsGraphiques.ts) :
 * accepte aussi bien l'exercice que `ReponseCurseursFonctionReference` (mêmes champs, `famille` en
 * moins pour la réponse curseurs — elle n'en a pas besoin, seule
 * `evaluerFonctionReference`/`pivotX` l'utilisent).
 */
export interface ParametresFonctionReference {
  th: number;
  tv: number;
  ch: number;
  eh: number;
  ev: number;
  cv: number;
  sox: boolean;
  soy: boolean;
}

/** g(u) par famille — sqrt/cbrt/1/u renvoient NaN hors domaine (u<0 pour racine_carree, u=0 pour
 * inverse), jamais une exception : la vérification par échantillonnage (plus bas) et le tracé Mafs
 * (src/ui/mafsFonctionsReference.ts) filtrent ces valeurs via Number.isFinite. cbrt est signé
 * (Math.sign(u)*|u|^(1/3)) — spec section 1 : ne jamais utiliser une exponentiation naïve, qui
 * échouerait pour u<0.
 */
function appliquerG(famille: FamilleReference, u: number): number {
  switch (famille) {
    case "carre":
      return u * u;
    case "cube":
      return u * u * u;
    case "racine_carree":
      return u < 0 ? NaN : Math.sqrt(u);
    case "racine_cubique":
      return Math.sign(u) * Math.pow(Math.abs(u), 1 / 3);
    case "inverse":
      return Math.abs(u) < 1e-9 ? NaN : 1 / u;
    case "valeur_absolue":
      return Math.abs(u);
  }
}

/** L'argument u = SOY · (CH/EH) · (x - TH), commun à toute la formule — TH est toujours soustrait à
 * x EN PREMIER (translation pure), puis CH/EH met à l'échelle, puis SOY réfléchit le résultat déjà
 * translaté-et-mis-à-l'échelle (jamais combiné à x avant la soustraction de TH, contrairement à
 * l'ancienne formule `CH/EH·(SOY·x-TH)`). */
export function calculerArgument(parametres: ParametresFonctionReference, x: number): number {
  const signeSoy = parametres.soy ? -1 : 1;
  return signeSoy * (parametres.ch / parametres.eh) * (x - parametres.th);
}

/** f(x) pour l'exercice (ou pour la courbe manipulée en direct par les curseurs) — NaN si x est
 * hors du domaine de la famille (racine_carree, inverse). */
export function evaluerFonctionReference(parametres: ParametresFonctionReference & { famille: FamilleReference }, x: number): number {
  const signeSox = parametres.sox ? -1 : 1;
  const u = calculerArgument(parametres, x);
  const gu = appliquerG(parametres.famille, u);
  if (!Number.isFinite(gu)) return NaN;
  return signeSox * (parametres.ev / parametres.cv) * gu + parametres.tv;
}

/** x tel que u=0 — le point de référence (sommet pour carre/cube, coin pour valeur_absolue, borne
 * de domaine pour racine_carree, pôle pour inverse) autour duquel centrer le tracé et
 * l'échantillonnage. Depuis la réorganisation de la formule selon l'ordre exact des
 * transformations (voir calculerArgument), u=0 ssi `(x-TH)=0` — SOY et CH/EH ne sont que des
 * facteurs multiplicatifs non nuls (SOY=±1, CH,EH≥1), ils ne changent jamais la racine d'un
 * produit — le pivot vaut donc exactement `TH`, **indépendamment de CH, EH et désormais SOY aussi**
 * (`prompt-nouvel-ordre-transformations.md` : SOY combiné à x AVANT la soustraction de TH dans
 * l'ancienne formule faisait dépendre le pivot du signe de SOY — `TH·SOY` — ce que cette
 * réorganisation élimine). La pente `du/dx` reste, elle, inchangée en valeur (`SOY·(CH/EH)`, jamais
 * nulle) — c'est elle qu'utilise src/ui/mafsFonctionsReference.ts (xDepuisU) pour retrouver x à
 * partir d'un écart en u donné, autour de ce pivot désormais totalement stable. */
export function pivotX(parametres: ParametresFonctionReference): number {
  return parametres.th;
}

/**
 * Second point marqué sur le graphe (`prompt-canal-unique-et-second-point.md`, point 2), en plus
 * du point caractéristique (`pivotX`, où u=0) — le point où l'argument de la fonction de base vaut
 * exactement u=1. Calculable EXACTEMENT pour les 6 familles, puisque g(1)=1 pour toutes
 * (1²=1, 1³=1, √1=1, ∛1=1, 1/1=1, |1|=1) : résout directement
 * `u = SOY·(CH/EH)·(x-TH) = 1` pour x (1/SOY = SOY puisque SOY=±1, 1/(CH/EH) = EH/CH) —
 * `x = TH + SOY·(EH/CH)` — puis évalue `y = f(x) = SOX·(EV/CV)·g(1) + TV = TV + SOX·(EV/CV)`
 * (g(1)=1, aucune branche spéciale par famille nécessaire). Donne à l'élève un second point exact
 * et étiquetable, sans dépendre de l'alignement de la courbe sur la grille, pour déterminer le
 * coefficient global de l'équation à partir de deux points connus (voir `MafsGraphFonctionsReference.tsx`).
 */
export function pointUnitaire(parametres: ParametresFonctionReference): { x: number; y: number } {
  const signeSoy = parametres.soy ? -1 : 1;
  const signeSox = parametres.sox ? -1 : 1;
  const x = parametres.th + signeSoy * (parametres.eh / parametres.ch);
  const y = parametres.tv + signeSox * (parametres.ev / parametres.cv);
  return { x, y };
}

const DECALAGES_ECHANTILLON = [0.4, 0.7, 1.1, 1.6, 2.3, 3.1, 4.2, 5.6, 7.4, 9.8];
const POINTS_MINIMUM = 6;
const TOLERANCE_EQUATION = 1e-4;

/** Points d'échantillonnage relatifs au pivot (jamais un intervalle absolu fixe) : quelle que soit
 * l'amplitude de la translation TH (jusqu'à 5) combinée au rapport CH/EH (jusqu'à 5), le pivot peut
 * s'éloigner fortement de l'origine — des décalages ancrés sur le pivot restent toujours pertinents
 * pour sonder la forme de la courbe, contrairement à une plage [-N,N] fixe qui pourrait entièrement
 * manquer la zone intéressante. Décalages non ronds (0.4, 0.7...) pour éviter qu'une erreur de
 * signe symétrique passe inaperçue par coïncidence.
 */
function pointsEchantillon(pivot: number): number[] {
  return [...DECALAGES_ECHANTILLON, ...DECALAGES_ECHANTILLON.map((d) => -d)].map((d) => pivot + d);
}

/**
 * Vérification par échantillonnage numérique (section 4 de la spec) : évalue la fonction cible et
 * l'expression saisie par l'élève en plusieurs points, ne compare que les points dans le domaine
 * commun aux deux (Number.isFinite), exige un nombre minimum de points comparables (rejette une
 * expression dont le domaine ne recouvre pas du tout la cible, qui sinon "réussirait" par absence
 * de point à comparer) et accepte toute formulation algébriquement équivalente — jamais de
 * comparaison symbolique, motivé par l'incertitude sur d'éventuelles équivalences de paramètres
 * sur des fonctions non polynomiales (section 0 de la spec).
 */
export function diagnostiquerEquationFonctionReference(
  exercice: ExerciceFonctionReference,
  expressionSaisie: string,
): StatutVerification {
  const points = pointsEchantillon(pivotX(exercice));
  let comparaisons = 0;
  for (const x of points) {
    const cible = evaluerFonctionReference(exercice, x);
    if (!Number.isFinite(cible)) continue;

    let candidat: number;
    try {
      candidat = evaluerExpressionGenerale(expressionSaisie, x);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(candidat)) return "not_equivalent";
    if (Math.abs(candidat - cible) > TOLERANCE_EQUATION) return "not_equivalent";
    comparaisons++;
  }
  return comparaisons >= POINTS_MINIMUM ? "correct" : "not_equivalent";
}

export function verifierEquationFonctionReference(exercice: ExerciceFonctionReference, expressionSaisie: string): boolean {
  return diagnostiquerEquationFonctionReference(exercice, expressionSaisie) === "correct";
}

/** Résultat curseur par curseur — utilisé par l'UI pour marquer en rouge les curseurs/toggles
 * qui diffèrent de la cible après une tentative (même principe que evaluerCurseurs de
 * verificationTransformationsGraphiques.ts) — un outil de FEEDBACK visuel uniquement, plus jamais
 * la note elle-même (voir `verifierCurseursFonctionReference` plus bas, holistique depuis
 * `prompt-verification-holistique-et-asymptotes.md`) : une réponse peut être marquée "correcte"
 * globalement tout en montrant certains curseurs différents de la cible pièce par pièce, si une
 * autre combinaison produit mathématiquement la même fonction (ex. `|k·u|=k·|u|` pour
 * valeur_absolue) — mais dans ce cas la note se clôt sans jamais déclencher ce marquage (il n'a
 * lieu qu'après un ÉCHEC de `verifierCurseursFonctionReference`). */
export interface EvaluationCurseursFonctionReference {
  th: boolean;
  tv: boolean;
  ch: boolean;
  eh: boolean;
  ev: boolean;
  cv: boolean;
  sox: boolean;
  soy: boolean;
}

const TOLERANCE_RAPPORT = 1e-9;

/**
 * TH/TV/SOX/SOY comparés directement à leur valeur attendue. EV/CV et CH/EH, comme dans
 * verificationTransformationsGraphiques.ts (EV/CV historique), ne sont **jamais** comparés chacun à
 * une valeur canonique fixe : seul leur RAPPORT compte (il représente respectivement |a| et la
 * pente horizontale), donc `ev`/`cv` d'une part et `ch`/`eh` d'autre part sont toujours évalués et
 * renvoyés ENSEMBLE, comme deux unités de vérification indépendantes.
 */
export function evaluerCurseursFonctionReference(
  exercice: ParametresFonctionReference,
  reponse: ReponseCurseursFonctionReference,
): EvaluationCurseursFonctionReference {
  const rapportEvCvCorrect = Math.abs(reponse.ev / reponse.cv - exercice.ev / exercice.cv) < TOLERANCE_RAPPORT;
  const rapportChEhCorrect = Math.abs(reponse.ch / reponse.eh - exercice.ch / exercice.eh) < TOLERANCE_RAPPORT;
  return {
    th: reponse.th === exercice.th,
    tv: reponse.tv === exercice.tv,
    ch: rapportChEhCorrect,
    eh: rapportChEhCorrect,
    ev: rapportEvCvCorrect,
    cv: rapportEvCvCorrect,
    sox: reponse.sox === exercice.sox,
    soy: reponse.soy === exercice.soy,
  };
}

/**
 * Note "curseurs" — vérification HOLISTIQUE par échantillonnage numérique
 * (`prompt-verification-holistique-et-asymptotes.md`, point 1), même principe et même
 * échantillonnage/tolérance que `verifierEquationFonctionReference` : évalue la fonction complète
 * induite par la position des 8 curseurs/toggles de l'élève en plusieurs points `x` autour du pivot
 * de la cible, la compare numériquement à la fonction cible. Remplace l'ancienne vérification
 * paramètre-par-paramètre (ou paire-par-paire pour `EV`/`CV`, `CH`/`EH`, toujours calculée par
 * `evaluerCurseursFonctionReference` ci-dessus, désormais réservée au marquage visuel) — celle-ci
 * ratait des équivalences n'impliquant pas qu'une seule paire de curseurs, ex. pour `valeur_absolue`
 * `|k·u|=k·|u|` rend `EH=2,EV=2` (`CH=CV=1`) strictement équivalent à `EH=1,EV=1` : le rapport
 * `EH/CH` ET le rapport `EV/CV` diffèrent tous les deux de la cible pris séparément, mais leur
 * PRODUIT (qui détermine seul la fonction résultante pour cette famille) est identique — une
 * propriété que seule une comparaison de la fonction entière peut capturer, jamais une comparaison
 * champ par champ aussi souple soit-elle. `famille` vient toujours de `exercice` (jamais de la
 * réponse, qui n'en porte pas — le choix de famille est noté séparément, à l'étape reconnaissance).
 */
export function verifierCurseursFonctionReference(
  exercice: ExerciceFonctionReference,
  reponse: ReponseCurseursFonctionReference,
): boolean {
  const parametresReponse = { ...reponse, famille: exercice.famille };
  const points = pointsEchantillon(pivotX(exercice));
  let comparaisons = 0;
  for (const x of points) {
    const cible = evaluerFonctionReference(exercice, x);
    if (!Number.isFinite(cible)) continue;
    const candidat = evaluerFonctionReference(parametresReponse, x);
    if (!Number.isFinite(candidat)) return false;
    if (Math.abs(candidat - cible) > TOLERANCE_EQUATION) return false;
    comparaisons++;
  }
  return comparaisons >= POINTS_MINIMUM;
}
