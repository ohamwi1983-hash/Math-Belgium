import type {
  BrancheAngle,
  BrancheX,
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
  ValeurPiOuDecimale,
} from "../../core5e/equationsTrigonometriques.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatArgumentLatex, formatValeurLatex, latexAideArgumentNiveau2, texteAideArgumentNiveau1 } from "../../ui5e/formatEquationTrig";
import {
  formatAidePrefacteurNiveau2Latex,
  formatAideSepararFacteursNiveau2Latex,
  formatEnonceEquationTrigonometriqueLatex,
  formatEquationConvertieEgaliteLatex,
  formatPolynomeCibleLatex,
  LATEX_AIDE_PREFACTEUR_NIVEAU1,
  LATEX_AIDE_SEPARER_FACTEURS_NIVEAU1,
  latexAideConversionEgaliteNiveau1,
  latexAideConversionNiveau1,
  latexAideResoudreEgaliteNiveau1,
  OPTIONS_FAMILLE,
  produitContientTangente,
  texteAideConversionEgaliteNiveau1,
  texteAideResoudreEgaliteNiveau1,
} from "../../ui5e/formatEquationTrigonometrique";
import { CATALOGUE_FAMILLES_EQUATION_TRIG, construireEquationTrigAvecFamille, genererExerciceEquationTrigonometrique } from "./index";
import { solutionsDistinctes, unionSolutions } from "./solveur";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationTrigonometrique>` pour 5gen10 (Équations
 * trigonométriques) — les 4 familles du générateur, toutes enseignées par le cours (section
 * « Équations trigonométriques ») : application directe, produit de facteurs, substitution
 * pythagoricienne, égalité avec conversion. Catalogue de variantes = les 4 familles, dans l'ordre
 * du sélecteur de l'appli (`CATALOGUE_FAMILLES_EQUATION_TRIG`, partagé avec le `?code=` de
 * `App5gen10.tsx`).
 *
 * Papier (`.claude/rules/feuilles-evaluations.md`) : l'énoncé imprimé ne garde que l'équation et la
 * consigne globale (« Résous dans ℝ, puis dans [0 ; 2π[ ») ; les écrans du générateur (technique,
 * argument, isoler x, solutions…) sont les ÉTAPES du corrigé (`construireEnonce` + lettres
 * `sousQuestion`). Valeurs exactes en fractions de π ; sinon arrondies au centième, virgule décimale.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

// ============================================================================
// Formatage papier des valeurs (fractions de π, sinon centième avec virgule).
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** v = (n/d)·π avec d ≤ 48, réduit — `null` si v n'est pas une fraction simple de π. */
function fractionDePi(v: number): { n: number; d: number } | null {
  for (let d = 1; d <= 48; d++) {
    const n = Math.round((v / Math.PI) * d);
    if (Math.abs(v - (n * Math.PI) / d) < 1e-9) {
      const g = pgcd(n, d);
      return { n: n / g, d: d / g };
    }
  }
  return null;
}

function decimalLatex(v: number): string {
  const r = Math.round(v * 100) / 100;
  const s = (Object.is(r, -0) ? 0 : r).toString();
  return s.replace(".", "{,}");
}

/** Valeur seule (solution dans [0 ; 2π[, constante d'une série). */
function valeurLatex(v: number): string {
  if (Math.abs(v) < 1e-12) return "0";
  const f = fractionDePi(v);
  if (f === null) return decimalLatex(v);
  const signe = f.n < 0 ? "-" : "";
  const n = Math.abs(f.n);
  const num = n === 1 ? "\\pi" : `${n}\\pi`;
  return f.d === 1 ? `${signe}${num}` : `${signe}\\frac{${num}}{${f.d}}`;
}

/** Terme « k·période » (période > 0), en fraction de π quand c'en est une. */
function termePeriodeLatex(periode: number): string {
  const f = fractionDePi(periode);
  if (f === null) return `${decimalLatex(periode)}k`;
  const num = f.n === 1 ? "k\\pi" : `${f.n}k\\pi`;
  return f.d === 1 ? num : `\\frac{${num}}{${f.d}}`;
}

function estDecimale(v: ValeurPiOuDecimale): boolean {
  return v.exact === null && fractionDePi(v.decimal) === null;
}

/** « constante + k·période » — la constante omise si nulle. */
function serieLatex(branche: { constante: ValeurPiOuDecimale; periode: ValeurPiOuDecimale }): string {
  const c = branche.constante.exact !== null ? formatValeurLatex(branche.constante) : valeurLatex(branche.constante.decimal);
  const p = termePeriodeLatex(branche.periode.decimal);
  return c === "0" ? p : `${c} + ${p}`;
}

/** « x = … » ou « x ≈ … » selon que la constante est exacte ou arrondie. */
function egaliteX(branche: BrancheX): string {
  return `x ${estDecimale(branche.constante) ? "\\approx" : "="} ${serieLatex(branche)}`;
}

function ensembleLatex(solutions: number[]): string {
  if (solutions.length === 0) return "S = \\varnothing";
  return `S = \\left\\{ ${solutions.map(valeurLatex).join(" \\,;\\, ")} \\right\\}`;
}

function contientDecimale(solutions: number[]): boolean {
  return solutions.some((v) => Math.abs(v) > 1e-12 && fractionDePi(v) === null);
}

/** Liste « A ou B ou C » de formules LaTeX, en fragments. */
function ouLatex(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((f, i) => (i === 0 ? [latex(f)] : [texte(" ou "), latex(f)]));
}

/** Solutions retirées parce qu'une tangente n'y est pas définie (point 32 de l'audit). */
function valeursEcartees(candidats: number[], gardees: number[]): number[] {
  return candidats.filter((x) => !gardees.some((g) => Math.abs(g - x) < 1e-6));
}

// ============================================================================
// Énoncé, étapes, énoncé papier.
// ============================================================================

const LIBELLE_TECHNIQUE: Record<ExerciceEquationTrigonometrique["famille"], string> = Object.fromEntries(OPTIONS_FAMILLE.map((o) => [o.id, o.label])) as Record<
  ExerciceEquationTrigonometrique["famille"],
  string
>;

function nomFonction(f: "sin" | "cos" | "tan"): string {
  return f === "sin" ? "\\sin" : f === "cos" ? "\\cos" : "\\tan";
}

/** Étapes de résolution — une par écran du générateur, dans le même ordre (`moteur5e/typesEquationTrig.ts`). */
function etapes(exercice: ExerciceEquationTrigonometrique): FragmentConsigne[][] {
  const technique = [texte("Reconnais la technique de résolution.")];
  const solutions = [texte("Donne les solutions dans [0 ; 2π[, chaque valeur une seule fois.")];
  switch (exercice.famille) {
    case "directe":
      if (exercice.exercice.aucuneSolution) return [technique, [texte("Résous l'équation, ou justifie qu'elle n'a pas de solution.")]];
      return [technique, [texte("Résous l'équation pour l'argument (séries de solutions, k entier).")], [texte("Isole x dans chaque série.")], solutions];
    case "produit":
      return [
        technique,
        ...(exercice.sousCas === "nonFactoree" ? [[texte("Factorise l'équation.")]] : []),
        [texte("Écris les deux équations données par le produit nul.")],
        [texte("Résous chaque équation pour l'argument (séries, k entier).")],
        [texte("Isole x dans chaque série.")],
        [texte(`Donne les solutions dans [0 ; 2π[ : réunis celles des deux équations${produitContientTangente(exercice) ? ", sans les valeurs où une tangente n'est pas définie" : ""}.`)],
      ];
    case "pythagoricienne":
      return [
        technique,
        [texte(`Grâce à sin²(x) + cos²(x) = 1, réécris l'équation avec ${exercice.fonctionCible}(x) seulement.`)],
        [texte(`Pose t = ${exercice.fonctionCible}(x) et résous l'équation du second degré en t.`)],
        [texte(`Pour chaque racine, résous ${exercice.fonctionCible}(x) = t, ou rejette-la.`)],
        solutions,
      ];
    case "egalite":
      return [
        technique,
        [texte("Convertis un membre pour avoir la même fonction trigonométrique des deux côtés.")],
        [texte("Égale les arguments (une ou deux séries, k entier), puis isole x.")],
        exercice.identite === "tanVersTan" ? [texte("Donne les solutions dans [0 ; 2π[, sans les valeurs où une tangente n'est pas définie.")] : solutions,
      ];
  }
}

function construireEnonce(exercice: ExerciceEquationTrigonometrique): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceEquationTrigonometriqueLatex(exercice))],
    questions: etapes(exercice).map((consigne): QuestionExercice => ({ consigne })),
  };
}

/** Annonce d'arrondi quand une valeur attendue n'est pas une fraction de π. */
function annoncePrecision(exercice: ExerciceEquationTrigonometrique): string {
  switch (exercice.famille) {
    case "directe":
      return exercice.exercice.regime === "decimal" ? " Arrondis au centième les valeurs qui ne sont pas exactes." : "";
    case "produit":
      return exercice.facteur1.regime === "decimal" || exercice.facteur2.regime === "decimal" ? " Arrondis au centième les valeurs qui ne sont pas des angles remarquables." : "";
    default:
      return "";
  }
}

function enoncePapier(exercice: ExerciceEquationTrigonometrique): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Résous l'équation "),
        latex(formatEnonceEquationTrigonometriqueLatex(exercice)),
        texte(` d'abord dans ℝ (k désigne un entier), puis dans [0 ; 2π[.${annoncePrecision(exercice)}`),
      ],
      questions: [],
    },
  };
}

// ============================================================================
// Solutions (réponse brève, corrigé, barème).
// ============================================================================

function seriesX(exercice: ExerciceEquationTrigonometrique): BrancheX[] {
  switch (exercice.famille) {
    case "directe":
      return exercice.exercice.branchesX;
    case "produit":
      return [...exercice.facteur1.branchesX, ...exercice.facteur2.branchesX];
    case "pythagoricienne":
      return [exercice.racine1, exercice.racine2].flatMap((r) => (r.resolution ? r.resolution.branchesX : []));
    case "egalite":
      return exercice.branches;
  }
}

function solutionsFinales(exercice: ExerciceEquationTrigonometrique): number[] {
  switch (exercice.famille) {
    case "directe":
      return exercice.exercice.solutions;
    case "produit":
    case "pythagoricienne":
      return exercice.solutionsUnion;
    case "egalite":
      return exercice.solutions;
  }
}

/** Valeurs de [0 ; 2π[ données par les séries mais écartées (tangente non définie). */
function ecarteesTangente(exercice: ExerciceEquationTrigonometrique): number[] {
  if (exercice.famille === "produit") return valeursEcartees(unionSolutions(exercice.facteur1.solutions, exercice.facteur2.solutions), exercice.solutionsUnion);
  if (exercice.famille === "egalite") return valeursEcartees(solutionsDistinctes(exercice.branches), exercice.solutions);
  return [];
}

function reponseBreve(exercice: ExerciceEquationTrigonometrique): FragmentConsigne[] {
  if (exercice.famille === "directe" && exercice.exercice.aucuneSolution) return [texte("Aucune solution : "), latex("S = \\varnothing")];
  const series = seriesX(exercice);
  const solutions = solutionsFinales(exercice);
  const ecartees = ecarteesTangente(exercice);
  return [
    texte("Dans ℝ : "),
    ...ouLatex(series.map(egaliteX)),
    ...(ecartees.length > 0 ? [texte(" (sauf là où une tangente n'est pas définie)")] : []),
    texte(" ; dans [0 ; 2π[ : "),
    latex(ensembleLatex(solutions)),
  ];
}

// ============================================================================
// Corrigé détaillé — une ou plusieurs lignes par étape (lettre = étape de `construireEnonce`).
// ============================================================================

const METHODE_ISOLER_X: FragmentConsigne[] = [texte("Dans chaque série, on retranche la constante de l'argument puis on divise TOUT par le coefficient de x — la période aussi.")];
const METHODE_SOLUTIONS: FragmentConsigne[] = [texte("On donne à k des valeurs entières successives (…, −1, 0, 1, 2, …) et on garde les x de [0 ; 2π[.")];

function argumentEgalSerie(e: ExerciceEquationTrig, u: BrancheAngle): string {
  return `${formatArgumentLatex(e.a, e.b)} ${estDecimale(u.constante) ? "\\approx" : "="} ${serieLatex(u)}`;
}

function lignesArgument(e: ExerciceEquationTrig, sousQuestion: string, nom?: string): EtapeCorrection[] {
  const prefixe = nom ? `${nom} : ` : "";
  if (e.aucuneSolution) {
    return [
      {
        label: "Conclusion",
        sousQuestion,
        fragments: [texte(`${prefixe}aucune solution, car un ${e.fonction === "sin" ? "sinus" : "cosinus"} est toujours compris entre −1 et 1, or `), latex(`${e.k.latex}`), texte(" n'est pas dans [−1 ; 1].")],
      },
    ];
  }
  return [{ label: "Calcul", sousQuestion, fragments: [texte(prefixe), ...ouLatex(e.branchesU.map((u) => argumentEgalSerie(e, u)))] }];
}

function lignesSolutions(exercice: ExerciceEquationTrigonometrique, sousQuestion: string): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion, fragments: METHODE_SOLUTIONS }];
  const ecartees = ecarteesTangente(exercice);
  if (ecartees.length > 0) {
    lignes.push({ label: "Condition", sousQuestion, fragments: [texte("Valeurs écartées (une tangente n'y est pas définie) : "), latex(ecartees.map(valeurLatex).join(" \\,;\\, "))] });
  }
  const solutions = solutionsFinales(exercice);
  lignes.push({
    label: "Conclusion",
    sousQuestion,
    fragments: [latex(ensembleLatex(solutions)), ...(contientDecimale(solutions) ? [texte(" (valeurs arrondies au centième)")] : [])],
  });
  return lignes;
}

function correctionDirecte(e: ExerciceEquationTrig): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [
    { label: "Technique", sousQuestion: "a", fragments: [texte(`${LIBELLE_TECHNIQUE.directe} : une seule fonction trigonométrique, égale à une constante.`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte(`${texteAideArgumentNiveau1(e.fonction)} Formule du cours : `), latex(latexAideArgumentNiveau2(e.fonction))] },
    ...lignesArgument(e, "b"),
  ];
  if (e.aucuneSolution) return lignes;
  return [
    ...lignes,
    { label: "Méthode", sousQuestion: "c", fragments: METHODE_ISOLER_X },
    { label: "Calcul", sousQuestion: "c", fragments: ouLatex(e.branchesX.map(egaliteX)) },
    ...lignesSolutions({ famille: "directe", exercice: e }, "d"),
    {
      label: "Piège",
      sousQuestion: "c",
      fragments: [
        texte(
          e.fonction === "tan"
            ? "Une seule série pour la tangente, de période π — et la période se divise aussi par le coefficient de x."
            : e.casSpecial
              ? "Valeur ±1 : une seule série (les deux angles de la formule sont confondus) — et la période se divise aussi par le coefficient de x."
              : "Deux séries pour le sinus et le cosinus — et la période se divise aussi par le coefficient de x.",
        ),
      ],
    },
  ];
}

function correctionProduit(e: ExerciceProduitFacteurs): EtapeCorrection[] {
  const l = (i: number) => LETTRES[i];
  let i = 0;
  const lignes: EtapeCorrection[] = [{ label: "Technique", sousQuestion: l(i++), fragments: [texte(`${LIBELLE_TECHNIQUE.produit} : un produit est nul si et seulement si l'un de ses facteurs est nul.`)] }];
  if (e.sousCas === "nonFactoree") {
    const s = l(i++);
    lignes.push(
      { label: "Méthode", sousQuestion: s, fragments: [texte("On met en évidence le facteur commun, comme pour un polynôme : "), latex(LATEX_AIDE_PREFACTEUR_NIVEAU1)] },
      { label: "Calcul", sousQuestion: s, fragments: [latex(formatAidePrefacteurNiveau2Latex(e))] },
    );
  }
  const sSep = l(i++);
  lignes.push(
    { label: "Méthode", sousQuestion: sSep, fragments: [latex(LATEX_AIDE_SEPARER_FACTEURS_NIVEAU1)] },
    { label: "Calcul", sousQuestion: sSep, fragments: ouLatex(formatAideSepararFacteursNiveau2Latex(e)) },
  );
  const sArg = l(i++);
  lignes.push(
    { label: "Méthode", sousQuestion: sArg, fragments: [texte("Pour chaque équation, la formule du cours (deux séries pour sin et cos, une seule pour tan).")] },
    ...lignesArgument(e.facteur1, sArg, "Première équation"),
    ...lignesArgument(e.facteur2, sArg, "Seconde équation"),
  );
  const sX = l(i++);
  lignes.push({ label: "Méthode", sousQuestion: sX, fragments: METHODE_ISOLER_X });
  const xs = [...e.facteur1.branchesX, ...e.facteur2.branchesX];
  if (xs.length > 0) lignes.push({ label: "Calcul", sousQuestion: sX, fragments: ouLatex(xs.map(egaliteX)) });
  lignes.push(...lignesSolutions(e, l(i++)));
  lignes.push({
    label: "Piège",
    sousQuestion: e.sousCas === "nonFactoree" ? "b" : sSep,
    fragments: [texte(e.sousCas === "nonFactoree" ? "Ne jamais diviser par le facteur commun : on perdrait toutes les solutions où il s'annule." : "Un produit nul donne DEUX équations à résoudre séparément, puis on réunit leurs solutions.")],
  });
  return lignes;
}

function correctionPythagoricienne(e: ExercicePythagoricienne): EtapeCorrection[] {
  const f = e.fonctionCible;
  const lignes: EtapeCorrection[] = [
    { label: "Technique", sousQuestion: "a", fragments: [texte(`${LIBELLE_TECHNIQUE.pythagoricienne} : l'équation mélange sin et cos, dont un au carré.`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("On remplace le carré de l'autre fonction grâce à la relation fondamentale : "), latex(latexAideConversionNiveau1(e))] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(formatPolynomeCibleLatex(e))] },
    {
      label: "Méthode",
      sousQuestion: "c",
      fragments: [texte(`On pose t = ${f}(x) : `), latex(polynomeEnT(e)), texte(" — équation du second degré (discriminant ou factorisation).")],
    },
    { label: "Calcul", sousQuestion: "c", fragments: ouLatex([e.racine1, e.racine2].map((r, i) => `t_${i + 1} = ${valeurT(r.t)}`)) },
  ];
  for (const r of [e.racine1, e.racine2]) {
    if (r.invalide || r.resolution === null) {
      lignes.push({ label: "Condition", sousQuestion: "d", fragments: [latex(`t = ${valeurT(r.t)}`), texte(` est rejetée : ${f}(x) est toujours compris entre −1 et 1.`)] });
    } else {
      lignes.push({
        label: "Calcul",
        sousQuestion: "d",
        fragments: [latex(`${nomFonction(f)}(x) = ${valeurT(r.t)}`), texte(" : "), ...ouLatex(r.resolution.branchesX.map(egaliteX))],
      });
    }
  }
  lignes.push(...lignesSolutions(e, "e"));
  lignes.push({ label: "Piège", sousQuestion: "d", fragments: [texte(`Une racine t hors de [−1 ; 1] ne donne aucune solution : ${f}(x) ne peut pas valoir t. Elle est rejetée, pas résolue.`)] });
  return lignes;
}

function valeurT(t: number): string {
  if (Number.isInteger(t)) return String(t);
  return `${t < 0 ? "-" : ""}\\frac{${Math.round(Math.abs(t) * 2)}}{2}`;
}

function polynomeEnT(e: ExercicePythagoricienne): string {
  return formatPolynomeCibleLatex(e).replace(/\\(cos|sin)\(x\)/g, "t");
}

function correctionEgalite(e: ExerciceEgaliteExpressions): EtapeCorrection[] {
  const ecartees = ecarteesTangente(e);
  return [
    { label: "Technique", sousQuestion: "a", fragments: [texte(`${LIBELLE_TECHNIQUE.egalite} : deux fonctions trigonométriques différentes, égales.`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte(`${texteAideConversionEgaliteNiveau1(e)} `), latex(latexAideConversionEgaliteNiveau1(e))] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(formatEquationConvertieEgaliteLatex(e))] },
    { label: "Méthode", sousQuestion: "c", fragments: [texte(`${texteAideResoudreEgaliteNiveau1(e)} `), latex(latexAideResoudreEgaliteNiveau1(e))] },
    { label: "Calcul", sousQuestion: "c", fragments: ouLatex(e.branches.map(egaliteX)) },
    ...lignesSolutions(e, "d"),
    {
      label: "Piège",
      sousQuestion: ecartees.length > 0 || e.identite === "tanVersTan" ? "d" : "c",
      fragments: [
        texte(
          e.identite === "tanVersTan"
            ? "Les valeurs où l'une des tangentes n'est pas définie ne sont pas solutions, même si elles apparaissent dans la série."
            : "Deux séries : A = B + 2kπ ET l'autre série de la formule du cours — en oublier une fait perdre des solutions.",
        ),
      ],
    },
  ];
}

function correctionDetaillee(exercice: ExerciceEquationTrigonometrique): EtapeCorrection[] {
  switch (exercice.famille) {
    case "directe":
      return correctionDirecte(exercice.exercice);
    case "produit":
      return correctionProduit(exercice);
    case "pythagoricienne":
      return correctionPythagoricienne(exercice);
    case "egalite":
      return correctionEgalite(exercice);
  }
}

/** Corrigé historique (pipeline Word/PDF) : la réponse de chaque étape, en paragraphes. */
function construireCorrection(exercice: ExerciceEquationTrigonometrique): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(exercice) }];
}

// ============================================================================
// Barème (poids, somme 4), difficulté.
// ============================================================================

function critere(sousQuestion: string, texteCritere: string, points: number): CritereBareme {
  return { sousQuestion, critere: [texte(texteCritere)], points };
}

function bareme(exercice: ExerciceEquationTrigonometrique): BaremeExercice {
  const reponseFinale = reponseBreve(exercice);
  const reponsesAcceptees: FragmentConsigne[][] = [
    [texte("Toute écriture équivalente d'une série : k parcouru dans l'autre sens, constante décalée d'une période, "), latex("k\\pi"), texte(" écrit « "), latex("2k\\pi"), texte(" ou "), latex("\\pi + 2k\\pi"), texte(" »")],
  ];
  const erreursFrequentes: ErreurFrequente[] = [];
  let criteres: CritereBareme[];
  switch (exercice.famille) {
    case "directe": {
      const e = exercice.exercice;
      if (e.aucuneSolution) {
        criteres = [critere("a", "Technique reconnue (application directe)", 1), critere("b", "Conclut « aucune solution » en justifiant par −1 ≤ sin, cos ≤ 1", 3)];
        erreursFrequentes.push({ description: [texte("Calculer un arcsin ou un arccos d'une valeur hors de [−1 ; 1]")], cout: "0 pt sur b)" });
        break;
      }
      criteres = [
        critere("a", "Technique reconnue (application directe)", 0.5),
        critere("b", e.fonction === "tan" ? "Série de l'argument, période π" : "Séries de l'argument (formule du cours)", 1.5),
        critere("c", "x isolé, période divisée par le coefficient de x", 1),
        critere("d", "Solutions dans [0 ; 2π[, toutes et une seule fois", 1),
      ];
      if (e.fonction !== "tan" && !e.casSpecial) erreursFrequentes.push({ description: [texte("Une seule série au lieu de deux")], cout: "−1" });
      if (e.fonction === "tan") erreursFrequentes.push({ description: [texte("Période 2π au lieu de π pour la tangente")], cout: "−0,5" });
      erreursFrequentes.push({ description: [texte("Constante divisée par le coefficient de x, mais pas la période")], cout: "0 pt sur c)" });
      break;
    }
    case "produit": {
      const nonFact = exercice.sousCas === "nonFactoree";
      const l = (i: number) => LETTRES[i];
      let i = 0;
      criteres = [critere(l(i++), "Technique reconnue (produit nul)", 0.5)];
      if (nonFact) criteres.push(critere(l(i++), "Mise en évidence du facteur commun", 0.5));
      criteres.push(critere(l(i++), "Les deux équations du produit nul", 0.5));
      criteres.push(critere(l(i++), "Séries de l'argument pour chaque équation", nonFact ? 1 : 1.25));
      criteres.push(critere(l(i++), "x isolé dans chaque série", nonFact ? 0.5 : 0.75));
      criteres.push(critere(l(i++), "Réunion des solutions dans [0 ; 2π[", 1));
      if (nonFact) erreursFrequentes.push({ description: [texte("Diviser par le facteur commun au lieu de factoriser (solutions perdues)")], cout: "0 pt sur b) et c)" });
      if (produitContientTangente(exercice)) erreursFrequentes.push({ description: [texte("Garder une valeur où une tangente n'est pas définie")], cout: "−0,5" });
      erreursFrequentes.push({ description: [texte("Oublier les solutions de l'une des deux équations")], cout: "−1" });
      break;
    }
    case "pythagoricienne":
      criteres = [
        critere("a", "Technique reconnue (substitution pythagoricienne)", 0.5),
        critere("b", "Équation réécrite avec une seule fonction", 1),
        critere("c", "Racines t de l'équation du second degré", 1),
        critere("d", "Racine hors de [−1 ; 1] rejetée, les autres résolues", 1),
        critere("e", "Solutions dans [0 ; 2π[", 0.5),
      ];
      erreursFrequentes.push(
        { description: [texte("Remplacer un carré par « 1 + » l'autre carré (signe)")], cout: "0 pt sur b)" },
        { description: [texte("Chercher des x pour une racine t hors de [−1 ; 1]")], cout: "−1" },
      );
      break;
    case "egalite":
      criteres = [
        critere("a", "Technique reconnue (égalité avec conversion)", 0.5),
        critere("b", "Conversion correcte (angles complémentaires, ou tangente impaire)", 1),
        critere("c", exercice.identite === "tanVersTan" ? "Une série, période π, x isolé" : "Deux séries, x isolé dans chacune", 1.5),
        critere("d", "Solutions dans [0 ; 2π[", 1),
      ];
      erreursFrequentes.push({ description: [texte("Égaler les arguments sans convertir (fonctions différentes)")], cout: "0 pt sur b) et c)" });
      if (exercice.identite !== "tanVersTan") erreursFrequentes.push({ description: [texte("Une seule des deux séries")], cout: "−1" });
      else erreursFrequentes.push({ description: [texte("Garder une valeur où une tangente n'est pas définie")], cout: "−0,5" });
      break;
  }
  if (contientDecimale(solutionsFinales(exercice))) reponsesAcceptees.push([texte("Valeurs approchées au centième")]);
  return { reponseFinale, criteres, erreursFrequentes, reponsesAcceptees };
}

function difficulte(exercice: ExerciceEquationTrigonometrique): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "directe": {
      const e = exercice.exercice;
      if (e.aucuneSolution) return 1;
      const simple = e.a.numerateur === e.a.denominateur && e.b.decimal === 0 && e.regime === "exact";
      return simple ? 1 : 2;
    }
    case "produit":
      return exercice.sousCas === "nonFactoree" ? 3 : 2;
    default:
      return 3;
  }
}

export const adaptateurEvaluationEquationTrig: AdaptateurFeuilleExercices<ExerciceEquationTrigonometrique> = {
  titreDocument: "Équations trigonométriques — Évaluation",
  nomFichierBase: "equations-trigonometriques",
  genererInstance: genererExerciceEquationTrigonometrique,
  catalogueVariantes: CATALOGUE_FAMILLES_EQUATION_TRIG,
  genererInstanceAvecVariante: construireEquationTrigAvecFamille,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};

