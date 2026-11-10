import type { ExerciceDistanceDroite, ExerciceDistanceParalleles, ExerciceDistancePoint } from "../../core/distanceDroite.types";
import type { DroiteImplicite } from "../../core/droite.types";
import type { Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_DISTANCE_PQ,
  consigneChoixPoint,
  consigneIntersectionQ,
  formatAideDistancePQNiveau2Latex,
  formatAideEquationBNiveau2Latex,
  formatAideIntersectionQNiveau2Latex,
  formatDistanceAttendueLatex,
  formatDroiteLatex,
  formatEnonceLatex,
  formatPointLatex,
  FORMULE_GENERALE_DISTANCE_PQ_LATEX,
  nomDroiteCible,
  segmentsAideEquationBNiveau1,
  segmentsConsigneEquationB,
  segmentsConsigneGeneraleDistanceDroite,
} from "../../ui/formatDistanceDroite";
import { implicteDepuisPointVecteur, intersectionDeuxDroites } from "../droite/geometrieDroite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDistanceDroite } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilDistanceDroite } from "../profilsEvaluation4eCh7Droites";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDistanceDroite>` pour gen47 (Distance
 * point-droite et droite-droite, `AppDistanceDroite.tsx`/`moteur/sessionDistanceDroite.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * ⚠️ gen47 est délibérément un exercice de SYNTHÈSE "SANS formule" (voir l'en-tête de
 * `core/distanceDroite.types.ts`/`generateurs/distanceDroite/index.ts`) : il ne demande JAMAIS la
 * formule directe `|a·x₀+b·y₀+c|/√(a²+b²)`, mais fait reconstruire la distance en 3 étapes
 * géométriques enchaînées — même enchaînement que l'écran interactif
 * (`sessionDistanceDroite.ts`, phases `[choixPoint] → equationB → intersectionQ → distancePQ`) :
 *   - Écran "equationB" (les deux variantes) → question "Construis l'équation cartésienne de
 *     b ⊥ d passant par P" (b = la perpendiculaire à la droite cible, passant par le point donné/
 *     choisi).
 *   - Écran "intersectionQ" (les deux variantes) → question "Résous le système {b;d} pour trouver
 *     Q = b ∩ d".
 *   - Écran "distancePQ" (les deux variantes, toujours la phase terminale) → question "Calcule la
 *     distance PQ".
 *   - Écran "choixPoint" (variante "paralleles" UNIQUEMENT, avant les 3 précédents) → question
 *     "Choisis un point à coordonnées entières sur la droite désignée". N'existe pas pour la
 *     variante "point" (le point P est déjà donné dans l'énoncé) — voir `etatInitial` dans
 *     `sessionDistanceDroite.ts`.
 * Consignes textuelles réutilisées TELLES QUELLES depuis `ui/formatDistanceDroite.ts`
 * (`segmentsConsigneEquationB`, `CONSIGNE_INTERSECTION_Q`, `CONSIGNE_DISTANCE_PQ`,
 * `consigneChoixPoint`) — jamais reformulées, pour rester fidèles à l'écran interactif.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues/construites de l'instance tirée, jamais
 * recalculée indépendamment : réutilise directement les fonctions de SUBSTITUTION déjà utilisées
 * côté écran pour l'aide de niveau 2 de chaque écran (`formatAideEquationBNiveau2Latex`,
 * `formatAideIntersectionQNiveau2Latex`, `formatAideDistancePQNiveau2Latex` —
 * `ui/formatDistanceDroite.ts`), qui substituent déjà les vraies valeurs de l'exercice sans
 * calculer le résultat final à la place de l'élève — le résultat final est ajouté ici pour
 * compléter la démonstration (la correction papier, contrairement à l'aide écran, doit montrer la
 * résolution complète).
 *
 * Variante "paralleles" — le point choisi par l'élève à l'écran "choixPoint" n'est PAS mémorisé
 * dans `ExerciceDistanceParalleles` (voir le commentaire de tête de `core/distanceDroite.types.ts` :
 * `point`/`bAttendue`/`q` sont recalculés dynamiquement en Couche B à partir du point RÉELLEMENT
 * choisi). Cette correction en choisit donc un elle-même — `pointEntierSurDroite` ci-dessous,
 * n'IMPORTE JAMAIS `moteur/verificationDroite.ts::pointEntierAleatoireImpliciteDroite` (règle
 * Couche A ↔ Couche B non négociable, CLAUDE.md), mais en DUPLIQUE la même construction
 * (Euclide étendu), sans le décalage aléatoire final : cette correction habille UNE instance déjà
 * tirée aléatoirement par `genererInstance`, un second tirage aléatoire à l'intérieur de la
 * correction n'apporterait rien de plus — un point déterministe (le plus proche de l'origine)
 * suffit et reste reproductible pour l'utilisateur qui régénère la même feuille. `b`/`Q` sont
 * ensuite reconstruits avec les MÊMES primitives Couche A que `generateurs/distanceDroite/index.ts`
 * (`implicteDepuisPointVecteur`, `intersectionDeuxDroites` de `generateurs/droite/geometrieDroite.ts`)
 * — jamais une seconde logique de construction géométrique. La distance finale affichée reste
 * `instance.distance` (jamais recalculée depuis ce point choisi ici) — propriété géométrique des
 * parallèles : elle est la même quel que soit le point choisi sur la droite source (voir le
 * commentaire de tête de `ExerciceDistanceParalleles`), exactement le principe déjà énoncé par
 * `soumettreReponseDistancePQ` (`sessionDistanceDroite.ts` : toujours comparée à `exercice.distance`,
 * jamais recalculée depuis les réponses précédentes).
 */

function estVariantePoint(instance: ExerciceDistanceDroite): instance is ExerciceDistancePoint {
  return instance.variante === "point";
}

// ============================================================================
// Point entier sur une droite implicite (a,b,c entiers) — duplication assumée de
// `moteur/verificationDroite.ts::pointEntierAleatoireImpliciteDroite`, voir le commentaire de tête.
// ============================================================================

function pgcdEtendu(a: number, b: number): { g: number; x: number; y: number } {
  let [oldR, r] = [a, b];
  let [oldS, s] = [1, 0];
  let [oldT, t] = [0, 1];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }
  return oldR < 0 ? { g: -oldR, x: -oldS, y: -oldT } : { g: oldR, x: oldS, y: oldT };
}

/** Un point ENTIER de la droite `ax+by+c=0`, le plus proche de l'origine (déterministe — voir le
 * commentaire de tête pour pourquoi jamais aléatoire ici, contrairement au repli de révélation côté
 * écran). Droite horizontale/verticale (`a=0`/`b=0`) : l'autre coordonnée vaut `0` directement. */
function pointEntierSurDroite(d: DroiteImplicite): Point {
  const { a, b, c } = d;
  if (a === 0) return { x: 0, y: -c / b };
  if (b === 0) return { x: -c / a, y: 0 };
  const { g, x: x0, y: y0 } = pgcdEtendu(a, b);
  const k = -c / g;
  const baseX = x0 * k;
  const baseY = y0 * k;
  const dirX = -b / g;
  const dirY = a / g;
  const t = Math.round(-(baseX * dirX + baseY * dirY) / (dirX * dirX + dirY * dirY));
  return { x: baseX + t * dirX, y: baseY + t * dirY };
}

// ============================================================================
// Énoncé — bloc de données (`formatEnonceLatex`, réutilisé tel quel) précédé de la consigne
// générale (`segmentsConsigneGeneraleDistanceDroite`), puis les questions écran par écran.
// ============================================================================

// Étapes du corrigé (une par écran), sans place de réponse ni tournure de saisie (« fraction
// acceptée, par exemple 7/2 »).
const QUESTION_DISTANCE_PQ = { consigne: [texte(CONSIGNE_DISTANCE_PQ.replace(", par exemple 2√5", ""))] };

function questionEquationB(instance: ExerciceDistanceDroite) {
  return { consigne: segmentsConsigneEquationB(instance) };
}

function questionIntersectionQ(instance: ExerciceDistanceDroite) {
  return { consigne: [texte(consigneIntersectionQ(instance).replace(" (fraction acceptée, par exemple 7/2)", ""))] };
}

function construireEnonceDistanceDroite(instance: ExerciceDistanceDroite): SectionExercice {
  const enteteFragments = [...segmentsConsigneGeneraleDistanceDroite(instance), texte(" "), latex(formatEnonceLatex(instance))];
  if (estVariantePoint(instance)) {
    return { enteteFragments, questions: [questionEquationB(instance), questionIntersectionQ(instance), QUESTION_DISTANCE_PQ] };
  }
  return { enteteFragments, questions: [{ consigne: [texte(consigneChoixPoint(instance))] }, questionEquationB(instance), questionIntersectionQ(instance), QUESTION_DISTANCE_PQ] };
}

// ============================================================================
// Correction — resynthétisée depuis les valeurs connues/reconstruites de l'instance (voir le
// commentaire de tête). `lettres` décale les préfixes a)/b)/c) selon la variante (4 questions pour
// "paralleles", 3 pour "point" — jamais de lettre codée en dur dans `blocsSynthese`).
// ============================================================================

function blocsSynthese(
  point: Point,
  droiteCible: DroiteImplicite,
  nomCible: string,
  bAttendue: DroiteImplicite,
  q: Point,
  distanceCarree: number,
  lettres: [string, string, string],
): BlocCorrection[] {
  const [lettreEquationB, lettreIntersection, lettreDistance] = lettres;
  const equationBLatex = formatDroiteLatex("b", bAttendue);
  const equationCibleLatex = formatDroiteLatex(nomCible, droiteCible);

  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettreEquationB}) `),
        latex(formatAideEquationBNiveau2Latex(droiteCible, nomCible)),
        texte(" — donc "),
        latex(equationBLatex),
        texte("."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettreIntersection}) Système `),
        latex(`\\begin{cases} ${equationBLatex} \\\\ ${equationCibleLatex} \\end{cases}`),
        texte(" — élimination d'une inconnue : "),
        latex(formatAideIntersectionQNiveau2Latex(bAttendue, droiteCible)),
        texte(", d'où "),
        latex(`Q${formatPointLatex(q)}`),
        texte("."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [texte(`${lettreDistance}) `), latex(`PQ = ${formatAideDistancePQNiveau2Latex(point, q)} = ${formatDistanceAttendueLatex(distanceCarree)}`), texte(".")],
    },
  ];
}

function construireCorrectionPoint(instance: ExerciceDistancePoint): BlocCorrection[] {
  return blocsSynthese(instance.point, instance.d, "d", instance.bAttendue, instance.q, instance.distanceCarree, ["a", "b", "c"]);
}

function construireCorrectionParalleles(instance: ExerciceDistanceParalleles): BlocCorrection[] {
  const droiteSource = instance.droiteSource === "d1" ? instance.d1 : instance.d2;
  const droiteCible = instance.droiteSource === "d1" ? instance.d2 : instance.d1;
  const point = pointEntierSurDroite(droiteSource);
  const bAttendue = implicteDepuisPointVecteur(point, instance.vecteurNormal);
  // b (perpendiculaire à la direction commune de d1/d2) est toujours sécante à droiteCible — jamais
  // null, même garantie géométrique que `generateurs/distanceDroite/index.ts::construireParalleles`.
  const q = intersectionDeuxDroites(bAttendue, droiteCible)!;

  const labelSource = instance.droiteSource === "d1" ? "d_1" : "d_2";
  const blocChoixPoint: BlocCorrection = {
    type: "paragraphe",
    fragments: [
      texte("a) N'importe quel point à coordonnées entières de "),
      latex(labelSource),
      texte(" convient — par exemple "),
      latex(`P${formatPointLatex(point)}`),
      texte(" (la distance obtenue ne dépend pas du point choisi sur "),
      latex(labelSource),
      texte(", voir d))."),
    ],
  };

  return [blocChoixPoint, ...blocsSynthese(point, droiteCible, nomDroiteCible(instance).latex, bAttendue, q, instance.distanceCarree, ["b", "c", "d"])];
}

function construireCorrectionDistanceDroite(instance: ExerciceDistanceDroite): BlocCorrection[] {
  return estVariantePoint(instance) ? construireCorrectionPoint(instance) : construireCorrectionParalleles(instance);
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les écrans (point de d₁ choisi, perpendiculaire b, pied Q, distance PQ) sont les étapes
// d'APPRENTISSAGE : sur papier, l'énoncé donne la (les) droite(s) et UNE consigne — la distance,
// en valeur exacte. Le corrigé reprend la méthode du cours (perpendiculaire, pied, longueur) avec
// les valeurs de l'instance, et le raccourci quand la droite est horizontale ou verticale.

function enoncePapier(instance: ExerciceDistanceDroite): EnoncePapier {
  const consigne: FragmentConsigne[] = estVariantePoint(instance)
    ? [texte("Calcule la distance du point "), latex("P"), texte(" à la droite "), latex("d"), texte(" (valeur exacte).")]
    : [texte("Les droites "), latex("d_1"), texte(" et "), latex("d_2"), texte(" sont parallèles. Calcule la distance entre ces deux droites (valeur exacte).")];
  return {
    section: { enteteFragments: [texte("On donne :"), latex(formatEnonceLatex(instance))], questions: [{ consigne }] },
    etapesParQuestion: [estVariantePoint(instance) ? ["a", "b", "c"] : ["a", "b", "c", "d"]],
  };
}

/** Données de la résolution, identiques pour les deux variantes : point P, droite cible, b, Q. */
function donneesResolution(instance: ExerciceDistanceDroite): { point: Point; cible: DroiteImplicite; nomCible: string; b: DroiteImplicite; q: Point } {
  if (estVariantePoint(instance)) return { point: instance.point, cible: instance.d, nomCible: "d", b: instance.bAttendue, q: instance.q };
  const source = instance.droiteSource === "d1" ? instance.d1 : instance.d2;
  const cible = instance.droiteSource === "d1" ? instance.d2 : instance.d1;
  const point = pointEntierSurDroite(source);
  const b = implicteDepuisPointVecteur(point, instance.vecteurNormal);
  return { point, cible, nomCible: nomDroiteCible(instance).latex, b, q: intersectionDeuxDroites(b, cible)! };
}

/** « |x_P − 3| », « |x_P + 2| », « |x_P| » — écart à la constante k, sans double signe. */
function ecartLatex(terme: string, k: number): string {
  if (k === 0) return `|${terme}|`;
  return k > 0 ? `|${terme} - ${k}|` : `|${terme} + ${-k}|`;
}

function correctionDetaillee(instance: ExerciceDistanceDroite): EtapeCorrection[] {
  const { point, cible, nomCible, b, q } = donneesResolution(instance);
  const lettres = estVariantePoint(instance) ? ["a", "b", "c"] : ["b", "c", "d"];
  const [lB, lQ, lD] = lettres;
  const lignes: EtapeCorrection[] = [];
  if (!estVariantePoint(instance)) {
    const source = instance.droiteSource === "d1" ? "d_1" : "d_2";
    lignes.push(
      { label: "Méthode", sousQuestion: "a", fragments: [texte("La distance entre deux droites parallèles est la distance d'un point quelconque de l'une à l'autre. Pour un point de "), latex(source), texte(" à coordonnées entières, on donne à x une valeur qui rend y entier.")] },
      { label: "Conclusion", sousQuestion: "a", fragments: [texte("Par exemple "), latex(`P${formatPointLatex(point)} \\in ${source}`), texte(".")] },
    );
  }
  const instancePourAide = instance;
  lignes.push(
    { label: "Méthode", sousQuestion: lB, fragments: segmentsAideEquationBNiveau1(instancePourAide) },
    { label: "Calcul", sousQuestion: lB, fragments: [latex(formatAideEquationBNiveau2Latex(cible, nomCible))] },
    { label: "Conclusion", sousQuestion: lB, fragments: [latex(formatDroiteLatex("b", b))] },
    { label: "Méthode", sousQuestion: lQ, fragments: [texte("Le pied Q de la perpendiculaire est l'intersection de b et de "), latex(nomCible), texte(" : on résout le système (substitution ou combinaison).")] },
    { label: "Calcul", sousQuestion: lQ, fragments: [latex(`\\begin{cases} ${formatDroiteLatex("b", b)} \\\\ ${formatDroiteLatex(nomCible, cible)} \\end{cases} \\Rightarrow ${formatAideIntersectionQNiveau2Latex(b, cible)}`)] },
    { label: "Conclusion", sousQuestion: lQ, fragments: [latex(`Q${formatPointLatex(q)}`)] },
    { label: "Méthode", sousQuestion: lD, fragments: [texte("La distance cherchée est la longueur PQ : "), latex(FORMULE_GENERALE_DISTANCE_PQ_LATEX), texte(".")] },
    { label: "Calcul", sousQuestion: lD, fragments: [latex(`PQ = ${formatAideDistancePQNiveau2Latex(point, q)} = ${formatDistanceAttendueLatex(instance.distanceCarree)}`)] },
  );
  if (cible.a === 0 || cible.b === 0) {
    const verticale = cible.b === 0;
    const k = verticale ? -cible.c / cible.a : -cible.c / cible.b;
    lignes.push({
      label: "Raccourci",
      sousQuestion: lD,
      fragments: [
        texte(`${verticale ? "La droite est verticale" : "La droite est horizontale"} : la distance est directement l'écart des ${verticale ? "abscisses" : "ordonnées"}, `),
        latex(`${ecartLatex(verticale ? "x_P" : "y_P", k)} = ${ecartLatex(String(verticale ? point.x : point.y), k)} = ${formatDistanceAttendueLatex(instance.distanceCarree)}`),
        texte("."),
      ],
    });
  }
  lignes.push({
    label: "Piège",
    sousQuestion: lB,
    fragments: [texte("La droite b doit être PERPENDICULAIRE à "), latex(nomCible), texte(" : avec la parallèle passant par P, on ne retrouve jamais le pied de la perpendiculaire et la « distance » obtenue est fausse.")],
  });
  return lignes;
}

function reponseBreve(instance: ExerciceDistanceDroite): FragmentConsigne[] {
  const nom = estVariantePoint(instance) ? "\\operatorname{dist}(P, d)" : "\\operatorname{dist}(d_1, d_2)";
  return [latex(`${nom} = ${formatDistanceAttendueLatex(instance.distanceCarree)}`)];
}

function bareme(instance: ExerciceDistanceDroite): BaremeExercice {
  const { b, q, nomCible } = donneesResolution(instance);
  const point = estVariantePoint(instance);
  const [lB, lQ, lD] = point ? ["a", "b", "c"] : ["b", "c", "d"];
  const criteres = [
    ...(point ? [] : [{ sousQuestion: "a", critere: [texte("Point à coordonnées entières de la droite de départ")], points: 0.5 }]),
    { sousQuestion: lB, critere: [texte("Perpendiculaire b passant par P : "), latex(formatDroiteLatex("b", b))], points: point ? 1.5 : 1 },
    { sousQuestion: lQ, critere: [texte("Pied de la perpendiculaire : "), latex(`Q${formatPointLatex(q)}`)], points: point ? 1.5 : 1.5 },
    { sousQuestion: lD, critere: [texte("Distance exacte simplifiée : "), latex(formatDistanceAttendueLatex(instance.distanceCarree))], points: point ? 1 : 1 },
  ];
  return {
    reponseFinale: reponseBreve(instance),
    criteres,
    erreursFrequentes: [
      { description: [texte("Droite parallèle à "), latex(nomCible), texte(" au lieu de la perpendiculaire")], cout: `0 pt sur ${lB}) et ${lQ})` },
      { description: [texte("Radical non simplifié ou valeur approchée seule")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Formule de la distance d'un point à une droite, si elle a été vue au cours, appliquée correctement")]],
  };
}

/** ★ droite horizontale ou verticale ; ★★★ distance entre deux parallèles ; ★★ sinon. */
function difficulte(instance: ExerciceDistanceDroite): 1 | 2 | 3 {
  if (instance.vecteurNormal.x === 0 || instance.vecteurNormal.y === 0) return 1;
  return estVariantePoint(instance) ? 2 : 3;
}

export const adaptateurEvaluationDistanceDroite: AdaptateurFeuilleExercices<ExerciceDistanceDroite> = {
  titreDocument: "Distance point-droite et droite-droite — Évaluation",
  nomFichierBase: "distance-point-droite",
  genererInstance: genererExerciceDistanceDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceDistanceDroite,
  construireCorrection: construireCorrectionDistanceDroite,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
  profilInstance: profilDistanceDroite,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
  // PAS `regroupable` : jusqu'à 4 questions substantielles par instance (choixPoint pour
  // "paralleles", equationB, intersectionQ, distancePQ — jamais un unique écran générique par
  // instance), même raison que `simplification/exportEvaluation.ts` (voir son commentaire de tête).
};
