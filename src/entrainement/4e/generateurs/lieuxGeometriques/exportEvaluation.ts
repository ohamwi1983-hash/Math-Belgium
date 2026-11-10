import type { ExerciceLieuxGeometriques, Lieu } from "../../core/lieuxGeometriques.types";
import type { Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, ErreurFrequente, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_GENERALE_EQUATIONS,
  CONSIGNE_GENERALE_RESOLUTION,
  formatEquationLieuLatex,
  formatEtatActuelSystemeLatex,
  formatPointLatex,
  formatQuadratiqueSubstitutionLatex,
  libelleChampEquation,
  segmentsDescriptionLieu,
  segmentsEnonce,
  substitutionResolution,
} from "../../ui/formatLieuxGeometriques";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriques } from "./index";
import { profilLieuxGeometriques } from "../profilsEvaluation4eCh7Coniques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLieuxGeometriques>` pour gen54 (Intersection de
 * deux lieux géométriques — chapitre "Géométrie analytique plane" (4e), `AppLieuxGeometriques.tsx`)
 * — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question, IDENTIQUE pour les 6 variantes** (`moteur/typesLieuxGeometriques.ts` :
 * `PhaseLieuxGeometriques = "identification" | "equations" | "resolution"`, 3 phases fixes,
 * toujours dans le même ordre, jamais de saut conditionnel — voir son commentaire de tête). Les 2
 * grandes variantes (`paire` : cercle-droite, droite-parabole) × les 3 sous-cas
 * (`nombrePoints` : 0, 1 tangence, 2) partagent donc EXACTEMENT la même structure papier, jamais de
 * dispatch par variante contrairement à `orthogonalite/exportEvaluation.ts` :
 * - **Écran "identification"** (`EtapeIdentificationLieuxGeometriques.tsx`,
 *   `CONSIGNE_GENERALE_IDENTIFICATION`) → **question a)** : reconnaître le type de chacun des 2
 *   lieux puis en extraire les caractéristiques — même consigne générale, réutilisée telle quelle.
 * - **Écran "equations"** (`EtapeEquationsLieuxGeometriques.tsx`, `CONSIGNE_GENERALE_EQUATIONS`) →
 *   **question b)** : écrire l'équation de chacun des 2 lieux.
 * - **Écran "resolution"** (`EtapeResolutionLieuxGeometriques.tsx`, `CONSIGNE_GENERALE_RESOLUTION`)
 *   → **question c)** : résoudre le système (élimination d'une variable), dénombrer puis donner
 *   le(s) point(s) d'intersection.
 *
 * **PAS `regroupable`** — la doc de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) exige un générateur qui produit TOUJOURS une seule question
 * par instance. C'est déjà faux structurellement ici : chaque instance produit 3 questions a/b/c
 * (une par écran), jamais 1 seule — peu importe que les 3 consignes soient chacune GÉNÉRIQUES
 * (`CONSIGNE_GENERALE_*`, indépendantes des valeurs tirées) : `regroupable` suppose une consigne
 * UNIQUE par instance, pas 3.
 *
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier est la question (les deux
 * lieux définis en mots) et la consigne globale « détermine les coordonnées de ces points, s'il y en
 * a » ; les 3 écrans deviennent les étapes 1 à 3 du corrigé détaillé (discriminant compris). Aucune
 * place de réponse. Le nombre de points est un VERDICT : jamais un cas particulier du tirage
 * (`profilsEvaluation4eCh7Coniques.ts` ne fixe que la forme, orientation de la parabole).
 *
 * **Aucun graphique** — contrairement à ce qu'un générateur combinant droites/cercles/paraboles
 * pourrait laisser supposer, `AppLieuxGeometriques.tsx` et ses 4 composants d'écran
 * (`Etape*LieuxGeometriques.tsx`, `ResultatPanelLieuxGeometriques.tsx`) ne contiennent AUCUN SVG/
 * Mafs/canvas (vérifié par recherche exhaustive) : chaque lieu est décrit et manipulé purement
 * VERBALEMENT/ALGÉBRIQUEMENT (voir la convention d'énoncé documentée en tête de
 * `ui/formatLieuxGeometriques.ts` — jamais d'équation ni de croquis dans l'énoncé, l'élève déduit
 * le type de chaque lieu de sa définition littérale). `enteteHtml`/SVG n'a donc pas sa place ici ;
 * `enteteFragments` (texte + LaTeX inline) suffit, exactement le même contrat que l'écran.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`lieu1`/`lieu2`/`points`/`nombrePoints`), en réutilisant directement les formateurs déjà utilisés
 * côté écran interactif (`ui/formatLieuxGeometriques.ts` — `segmentsEnonce`/`segmentsDescriptionLieu`/
 * `libelleChampEquation`/`formatEquationLieuLatex`/`formatEtatActuelSystemeLatex`/
 * `segmentsAideResolutionNiveau1`/`formatQuadratiqueSubstitutionLatex`/`substitutionResolution`/
 * `texteNombrePointsAttendu`/`formatPointLatex`) plutôt que d'en resynthétiser de nouveaux. Seule
 * addition propre à ce fichier : la question c) va plus loin que l'écran (qui s'arrête à poser
 * l'équation du second degré, aide niveau 2 — voir `EtapeResolutionLieuxGeometriques.tsx`, jamais
 * résolue à l'écran) en énonçant aussi ses solutions, extraites directement de `instance.points`
 * (jamais recalculées via le discriminant : la variable réellement éliminée par la méthode décrite
 * — `x` ou `y`, donnée par `substitutionResolution(instance).variable` — est une fonction injective
 * des points d'intersection ici (droite toujours résoluble en l'autre variable), donc
 * trier `instance.points` selon cette variable EST trier les racines de l'équation quadratique,
 * sans jamais raisoner indépendamment sur `instance.quadratique`/discriminant).
 */

/** Virgule décimale, jamais de point (racines toujours entières par construction, filet de
 * sécurité seulement). */
function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

/** Points triés selon la composante `variable` (celle de l'équation du second degré obtenue). */
function trierPointsParVariable(points: Point[], variable: "x" | "y"): Point[] {
  return [...points].sort((p1, p2) => (variable === "x" ? p1.x - p2.x : p1.y - p2.y));
}

function construireEnonceLieuxGeometriques(instance: ExerciceLieuxGeometriques): SectionExercice {
  return {
    enteteFragments: segmentsEnonce(instance),
    questions: [
      // Version papier de `CONSIGNE_GENERALE_IDENTIFICATION` (« complète » visait les champs de l'écran).
      { consigne: [texte("Identifie la nature de chacun des deux lieux géométriques et ses caractéristiques.")] },
      { consigne: [texte(CONSIGNE_GENERALE_EQUATIONS)] },
      { consigne: [texte(CONSIGNE_GENERALE_RESOLUTION)] },
    ],
  };
}

/** Énoncé papier : la question (les deux lieux définis en mots) et la consigne globale — les 3
 * écrans (identification, équations, résolution) deviennent les étapes du corrigé. La consigne ne
 * dit jamais combien il y a de points (verdict de l'exercice). */
function enoncePapierLieuxGeometriques(instance: ExerciceLieuxGeometriques): EnoncePapier {
  return {
    section: {
      enteteFragments: [...segmentsEnonce(instance), texte(" Détermine les coordonnées de ces points, s'il y en a, en justifiant par le calcul.")],
      questions: [],
    },
  };
}

function construireCorrectionLieuxGeometriques(instance: ExerciceLieuxGeometriques): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Système : "), latex(formatEtatActuelSystemeLatex(instance)), texte(".")] },
    { type: "paragraphe", fragments: [texte("Équation obtenue par substitution : "), latex(formatQuadratiqueSubstitutionLatex(instance)), texte(".")] },
    { type: "paragraphe", fragments: conclusion(instance) },
  ];
}

// ---------------------------------------------------------------------------------------------
// Équation du second degré à coefficients entiers et discriminant (corrigé détaillé).
// ---------------------------------------------------------------------------------------------

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

function denominateur(valeur: number): number {
  const brut = formatFractionIrreductible(Math.abs(valeur), 10000);
  const m = /\/(\d+)$/.exec(brut);
  return m ? Number(m[1]) : 1;
}

/** Mêmes coefficients entiers que la forme affichée par `formatQuadratiqueSubstitutionLatex`
 * (premiers entre eux, premier coefficient positif). */
function quadratiqueEntiere(instance: ExerciceLieuxGeometriques): { variable: "x" | "y"; a: number; b: number; c: number } {
  const { variable, A, B, C } = substitutionResolution(instance);
  const ppcm = [A, B, C].map(denominateur).reduce((acc, d) => (acc * d) / pgcd(acc, d), 1);
  const entiers = [A, B, C].map((v) => Math.round(v * ppcm));
  const diviseur = entiers.reduce((acc, n) => pgcd(acc, n), 0) || 1;
  const signe = entiers[0]! < 0 ? -1 : 1;
  const [a, b, c] = entiers.map((n) => (signe * n) / diviseur) as [number, number, number];
  return { variable, a, b, c };
}

function entreParentheses(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

function discriminantLatex(instance: ExerciceLieuxGeometriques): { latex: string; valeur: number } {
  const { a, b, c } = quadratiqueEntiere(instance);
  const valeur = b * b - 4 * a * c;
  return { latex: `\\Delta = ${entreParentheses(b)}^2 - 4 \\cdot ${entreParentheses(a)} \\cdot ${entreParentheses(c)} = ${valeur}`, valeur };
}

function droiteDe(instance: ExerciceLieuxGeometriques): Extract<Lieu, { type: "droite" }> {
  return (instance.lieu1.type === "droite" ? instance.lieu1 : instance.lieu2) as Extract<Lieu, { type: "droite" }>;
}

function conclusion(instance: ExerciceLieuxGeometriques): FragmentConsigne[] {
  if (instance.nombrePoints === 0) return [texte("Aucun point n'est à la fois sur les deux lieux : l'ensemble cherché est vide.")];
  const pointsLatex = instance.points.map((p) => formatPointLatex(p));
  if (instance.nombrePoints === 1) return [texte("Un seul point commun (la droite est tangente) : "), latex(pointsLatex[0]!), texte(".")];
  return [texte("Deux points communs : "), latex(pointsLatex[0]!), texte(" et "), latex(pointsLatex[1]!), texte(".")];
}

/** Méthode de substitution, rédigée (même choix de variable que `substitutionResolution`). */
function methodeSubstitution(instance: ExerciceLieuxGeometriques): string {
  if (instance.paire === "cercleDroite") return "On remplace y par son expression tirée de l'équation de la droite dans l'équation du cercle : on obtient une équation du second degré en x.";
  if (profilLieuxGeometriques(instance).forme === "horizontal") return "On exprime x en fonction de y à l'aide de l'équation de la droite, puis on le remplace dans l'équation de la parabole : on obtient une équation du second degré en y.";
  return "On remplace y par son expression tirée de l'équation de la droite dans l'équation de la parabole : on obtient une équation du second degré en x.";
}

function difficulteLieuxGeometriques(instance: ExerciceLieuxGeometriques): 1 | 2 | 3 {
  if (instance.paire === "droiteParabole" && profilLieuxGeometriques(instance).forme === "horizontal") return 3;
  return instance.nombrePoints === 0 ? 2 : 3;
}

function reponseBreveLieuxGeometriques(instance: ExerciceLieuxGeometriques): FragmentConsigne[] {
  return conclusion(instance);
}

function correctionDetailleeLieuxGeometriques(instance: ExerciceLieuxGeometriques): EtapeCorrection[] {
  const { variable, a } = quadratiqueEntiere(instance);
  const autre = variable === "x" ? "y" : "x";
  const delta = discriminantLatex(instance);
  const droite = droiteDe(instance);
  const lignes: EtapeCorrection[] = [
    { label: "Lecture", sousQuestion: "a", fragments: [texte("Premier lieu : "), ...segmentsDescriptionLieu(instance.lieu1), texte(".")] },
    { label: "Lecture", sousQuestion: "a", fragments: [texte("Second lieu : "), ...segmentsDescriptionLieu(instance.lieu2), texte(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [texte(`${libelleChampEquation(instance.lieu1)} `), latex(formatEquationLieuLatex(instance.lieu1)), texte(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [texte(`${libelleChampEquation(instance.lieu2)} `), latex(formatEquationLieuLatex(instance.lieu2)), texte(".")] },
    { label: "Méthode", sousQuestion: "c", fragments: [texte("Les points communs vérifient le système "), latex(formatEtatActuelSystemeLatex(instance)), texte(". "), texte(methodeSubstitution(instance))] },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(formatQuadratiqueSubstitutionLatex(instance)), texte(" ; "), latex(delta.latex), texte(".")] },
  ];
  if (instance.nombrePoints === 0) {
    lignes.push({ label: "Conclusion", sousQuestion: "c", fragments: [latex("\\Delta < 0"), texte(" : l'équation n'a pas de solution réelle, aucun point n'est commun aux deux lieux.")] });
  } else {
    const tries = trierPointsParVariable(instance.points, variable);
    const racines = tries.map((p) => (variable === "x" ? p.x : p.y));
    const racinesLatex =
      instance.nombrePoints === 1
        ? `${variable} = \\dfrac{${-quadratiqueEntiere(instance).b}}{${2 * a}} = ${formatNombre(racines[0]!)}`
        : `${variable}_1 = ${formatNombre(racines[0]!)} \\text{ et } ${variable}_2 = ${formatNombre(racines[1]!)}`;
    lignes.push(
      { label: "Calcul", sousQuestion: "c", fragments: [texte(instance.nombrePoints === 1 ? "Δ = 0 : une solution double, " : "Δ > 0 : deux solutions, "), latex(racinesLatex), texte(".")] },
      {
        label: "Calcul",
        sousQuestion: "c",
        fragments: [texte(`On calcule ${autre} avec l'équation de la droite `), latex(formatEquationLieuLatex(droite)), texte(" : "), ...tries.flatMap((p, i) => [...(i > 0 ? [texte(" et ")] : []), latex(formatPointLatex(p))]), texte(".")],
      },
      { label: "Conclusion", sousQuestion: "c", fragments: conclusion(instance) },
    );
  }
  lignes.push({
    label: "Piège",
    sousQuestion: "c",
    fragments:
      instance.nombrePoints === 0
        ? [texte("Un discriminant négatif n'est pas une erreur de calcul : il signifie que les deux lieux ne se coupent pas.")]
        : [texte(`Chaque solution ne donne que ${variable} : il faut encore calculer ${autre} (avec l'équation de la droite) pour obtenir les coordonnées du point.`)],
  });
  return lignes;
}

function baremeLieuxGeometriques(instance: ExerciceLieuxGeometriques): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Équation de la parabole écrite avec la distance au foyer seule (directrice oubliée), ou rayon au lieu de son carré pour le cercle")], cout: "−0,5" },
    { description: [texte("Erreur de développement lors de la substitution")], cout: "−1" },
  ];
  if (instance.nombrePoints > 0) erreurs.push({ description: [texte("Seule la première coordonnée des points est donnée")], cout: "−0,5" });
  return {
    reponseFinale: conclusion(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte("Les deux lieux identifiés avec leurs caractéristiques")], points: 1 },
      { sousQuestion: "b", critere: [texte("Les deux équations correctes")], points: 1 },
      { sousQuestion: "c", critere: [texte("Substitution et équation du second degré "), latex(formatQuadratiqueSubstitutionLatex(instance))], points: 1 },
      { sousQuestion: "c", critere: [texte(instance.nombrePoints === 0 ? "Discriminant négatif et conclusion : aucun point commun" : "Résolution et coordonnées des points communs")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute méthode de résolution correcte (substitution de l'autre variable, formule ou factorisation)")]],
  };
}

export const adaptateurEvaluationLieuxGeometriques: AdaptateurFeuilleExercices<ExerciceLieuxGeometriques> = {
  titreDocument: "Intersection de deux lieux géométriques — Évaluation",
  nomFichierBase: "lieux-geometriques-intersection",
  genererInstance: genererExerciceLieuxGeometriques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceLieuxGeometriques,
  construireCorrection: construireCorrectionLieuxGeometriques,
  difficulte: difficulteLieuxGeometriques,
  reponseBreve: reponseBreveLieuxGeometriques,
  correctionDetaillee: correctionDetailleeLieuxGeometriques,
  bareme: baremeLieuxGeometriques,
  enoncePapier: enoncePapierLieuxGeometriques,
  dureeMinutes: 10,
  profilInstance: profilLieuxGeometriques,
};
