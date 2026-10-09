import type { BaseExpo, ExerciceEquationExponentielle, ValeurExacteExpo } from "../../core6e/equationsExponentielles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { CONSIGNE_GENERALE, formatEnonceLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEquationsExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationExponentielle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationExponentielle>` pour `6gen9` (Résoudre une
 * équation exponentielle) — feuille d'évaluation.
 *
 * Une seule consigne ouverte par instance (« Résous l'équation »), suivie d'une résolution rédigée
 * et entièrement justifiée dans le corrigé — jamais de sous-questions guidées a)/b)/c)/d) comme les
 * écrans interactifs (1 à 3 selon la famille, voir `core6e/equationsExponentielles.types.ts`), même
 * principe que les 6 générateurs du chapitre 2 de 4e (équations/inéquations du second degré).
 *
 * Chaque paragraphe combine un principe mathématique général (injectivité de l'exponentielle,
 * radical nul ⟺ radicande nul, changement de variable t=baseˣ, positivité stricte d'une
 * exponentielle) avec l'ÉQUATION EXPLICITE de l'étape (jamais seulement sa conclusion en mots) —
 * substitution numérique complète (discriminant, formule quadratique) partout où elle a un sens,
 * même exigence que `secondDegre/exportEvaluation.ts` (chapitre 2 de 4e). Les valeurs numériques
 * utilisées (p, d, c, racines, t1/t2...) sont toujours celles déjà connues sur l'instance — jamais
 * recalculées indépendamment, seule la mise en forme de l'équation est reconstruite ici.
 */

/** Dupliqué fidèlement de `ui6e/formatEquationsExponentielles.ts::baseLatex` (non exportée) —
 * jamais réinventé indépendamment. */
function baseLatex(base: BaseExpo): string {
  if (base.estE) return "e";
  if (base.den === 1) return String(base.num);
  return `\\frac{${base.num}}{${base.den}}`;
}

/** Dupliqué fidèlement de `ui6e/formatEquationsExponentielles.ts::baseLatexPourExposant` (non
 * exportée) — parenthèses nécessaires quand la base est une fraction immédiatement suivie d'un
 * exposant (`base^{...}`), sinon rendu KaTeX ambigu (piège documenté dans le fichier source :
 * `\frac{5}{2}^{-4x}` attache visuellement l'exposant au seul dénominateur). */
function baseLatexPourExposant(base: BaseExpo): string {
  if (base.estE || base.den === 1) return baseLatex(base);
  return `\\left(${baseLatex(base)}\\right)`;
}

/** Dupliqué fidèlement de `ui6e/formatEquationsExponentielles.ts::formatValeurExacteLatex` (non
 * exportée) — jamais "base^p" littéralement, toujours la valeur décodée. */
function formatValeurExacteLatex(v: ValeurExacteExpo): string {
  if (v.den === 1) return String(v.num);
  return `\\frac{${v.num}}{${v.den}}`;
}

/** "{m}x + {n}" (ou "{m}x - {|n|}"), jamais de coefficient ±1 littéral ("x"/"-x", pas "1x"/"-1x"),
 * jamais de terme constant nul affiché. Dupliqué du même principe que `formatSommeTermes` (non
 * exportée). */
function formatExposantLineaireLatex(m: number, n: number): string {
  const coeffX = Math.abs(m) === 1 ? (m === 1 ? "x" : "-x") : `${m}x`;
  if (n === 0) return coeffX;
  return `${coeffX} ${n > 0 ? "+" : "-"} ${Math.abs(n)}`;
}

/** "{a}x² + {b}x + {c}" (termes nuls omis, coefficients ±1 jamais littéraux) — forme générique
 * d'un trinôme du second degré, réutilisée pour l'équation en x de la famille A3. */
function formatTrinomeLatex(a: number, b: number, c: number): string {
  const termes: { valeur: number; suffixe: string }[] = [
    { valeur: a, suffixe: "x^2" },
    { valeur: b, suffixe: "x" },
    { valeur: c, suffixe: "" },
  ];
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

function formatValeur(solutions: string[]): string {
  return solutions.join(" \\text{ ou } ");
}

/** Résolution rédigée et justifiée, un seul exercice ouvert — voir le commentaire de tête. */
function construireParagraphesResolution(exercice: ExerciceEquationExponentielle): FragmentConsigne[][] {
  const paragraphes: FragmentConsigne[][] = [];

  switch (exercice.famille) {
    case "A": {
      if (exercice.sousType === "A2") {
        paragraphes.push([
          texte("Un radical est nul si et seulement si son radicande est nul (une racine carrée est toujours positive ou nulle) : l'équation devient "),
          latex(formatValeur(formatReponseAttenduePhaseLatex(exercice, "aEcran1"))),
          texte("."),
        ]);
        paragraphes.push([
          texte("On réécrit la valeur numérique comme une puissance de la même base : "),
          latex(`${formatValeurExacteLatex(exercice.valeurNumerique)} = ${baseLatexPourExposant(exercice.base)}^{${exercice.c}}`),
          texte(". Deux puissances de même base sont égales si et seulement si leurs exposants le sont (injectivité de l'exponentielle) : "),
          latex(`${formatExposantLineaireLatex(exercice.m, exercice.n)} = ${exercice.c}`),
          texte(", d'où "),
          latex(formatValeur(formatReponseAttenduePhaseLatex(exercice, "aEcran2"))),
          texte("."),
        ]);
      } else if (exercice.sousType === "A3") {
        paragraphes.push([
          texte("On réécrit le second membre comme une puissance de la même base que le premier membre : "),
          latex(`${formatValeurExacteLatex(exercice.valeurNumerique)} = ${baseLatexPourExposant(exercice.base)}^{${exercice.d}}`),
          texte(", donc l'exposant cherché vaut "),
          latex(String(exercice.d)),
          texte("."),
        ]);
        paragraphes.push([
          texte("Deux puissances de même base sont égales si et seulement si leurs exposants le sont (injectivité de l'exponentielle) : "),
          latex(`${formatTrinomeLatex(exercice.a, exercice.b, exercice.c)} = ${exercice.d}`),
          ...(exercice.c !== exercice.d
            ? [texte(", soit "), latex(`${formatTrinomeLatex(exercice.a, exercice.b, exercice.c - exercice.d)} = 0`)]
            : []),
          texte(". En résolvant cette équation du second degré (discriminant, formule quadratique), on obtient "),
          latex(formatValeur(formatReponseAttenduePhaseLatex(exercice, "aEcran2"))),
          texte("."),
        ]);
      } else {
        paragraphes.push([
          texte("On réécrit le second membre comme une puissance de la même base que le premier membre : "),
          latex(`${formatValeurExacteLatex(exercice.valeurNumerique)} = ${baseLatexPourExposant(exercice.base)}^{${exercice.p}}`),
          texte(", donc l'exposant cherché vaut "),
          latex(String(exercice.p)),
          texte("."),
        ]);
        paragraphes.push([
          texte("Deux puissances de même base sont égales si et seulement si leurs exposants le sont (injectivité de l'exponentielle) : "),
          latex(`${formatExposantLineaireLatex(exercice.m, exercice.n)} = ${exercice.p}`),
          texte(", ce qui donne "),
          latex(formatValeur(formatReponseAttenduePhaseLatex(exercice, "aEcran2"))),
          texte("."),
        ]);
      }
      break;
    }
    case "B": {
      const exposantSimplifie = formatValeur(formatReponseAttenduePhaseLatex(exercice, "bEcran1"));
      paragraphes.push([
        texte("Une puissance de base strictement positive reste toujours strictement positive, donc la racine carrée du membre de gauche est toujours définie : "),
        latex(`\\sqrt{${baseLatexPourExposant(exercice.base)}^{${formatExposantLineaireLatex(exercice.m1, exercice.n1)}}} = ${baseLatexPourExposant(exercice.base)}^{${exposantSimplifie}}`),
        texte(" (on divise l'exposant par 2)."),
      ]);
      if (exercice.contradictoire) {
        const diffN = exercice.n2 - exercice.n1 / 2;
        paragraphes.push([
          texte("En identifiant les exposants (injectivité de l'exponentielle) : "),
          latex(`${exposantSimplifie} = ${formatExposantLineaireLatex(exercice.m2, exercice.n2)}`),
          texte(". Comme le coefficient de x est identique des deux côtés, il se simplifie, et il reste "),
          latex(`0 = ${diffN}`),
          texte(", une égalité FAUSSE, indépendante de x : cette équation n'admet donc aucune solution."),
        ]);
      } else {
        paragraphes.push([
          texte("En identifiant les exposants (injectivité de l'exponentielle) : "),
          latex(`${exposantSimplifie} = ${formatExposantLineaireLatex(exercice.m2, exercice.n2)}`),
          texte(", ce qui donne "),
          latex(formatValeur(formatReponseAttenduePhaseLatex(exercice, "bEcran2"))),
          texte("."),
        ]);
      }
      break;
    }
    case "C": {
      const { A, B, C } = exercice;
      paragraphes.push([
        texte("On pose "),
        latex(`t = ${baseLatexPourExposant(exercice.base)}^x`),
        texte(" (toujours strictement positif), ce qui ramène l'équation à une équation du second degré en t : "),
        latex(formatValeur(formatReponseAttenduePhaseLatex(exercice, "cEcran1"))),
        texte("."),
      ]);
      const deltaT = B * B - 4 * A * C;
      const [t1, t2] = [...exercice.solutionsT].sort((a, b) => a - b);
      paragraphes.push([
        texte("On résout cette équation du second degré ORDINAIRE en t, sans restriction de signe à ce stade. Discriminant : "),
        latex(`\\Delta = B^2-4AC = (${B})^2 - 4 \\cdot (${A}) \\cdot (${C}) = ${deltaT}`),
        texte(". D'où "),
        latex(
          `t_1 = \\dfrac{-B-\\sqrt{\\Delta}}{2A} = \\dfrac{-(${B})-\\sqrt{${deltaT}}}{2\\cdot(${A})} = ${t1} \\quad \\text{et} \\quad t_2 = \\dfrac{-B+\\sqrt{\\Delta}}{2A} = \\dfrac{-(${B})+\\sqrt{${deltaT}}}{2\\cdot(${A})} = ${t2}`,
        ),
        texte("."),
      ]);
      const positifs = [t1, t2].filter((t) => t > 0).sort((a, b) => a - b);
      const xVides = positifs.length === 0;
      const conversions: FragmentConsigne[] = xVides
        ? [texte("Aucune des deux valeurs de t n'est strictement positive : cette équation n'admet donc aucune solution.")]
        : positifs.flatMap((t, i): FragmentConsigne[] => [
            latex(`x = ${exercice.base.estE ? `\\ln(${t})` : `\\log_{${baseLatex(exercice.base)}}(${t})`}`),
            texte(i < positifs.length - 1 ? " ou " : ""),
          ]);
      paragraphes.push([
        texte("Comme "),
        latex(`${baseLatexPourExposant(exercice.base)}^x`),
        texte(" est TOUJOURS strictement positif, on rejette toute valeur de t négative ou nulle, puis on convertit chaque valeur positive restante en x via le logarithme : "),
        ...conversions,
        ...(xVides ? [] : [texte(", soit "), latex(formatValeur(formatReponseAttenduePhaseLatex(exercice, "cEcran3"))), texte(".")]),
      ]);
      break;
    }
    case "D": {
      if (exercice.sousType === "D1") {
        paragraphes.push([
          texte("Une puissance de base strictement positive (et différente de 1) reste TOUJOURS strictement positive, quel que soit l'exposant : "),
          latex(`${baseLatexPourExposant(exercice.base)}^{${formatExposantLineaireLatex(exercice.m, exercice.n)}} > 0`),
          texte(" pour tout x. Un produit d'un nombre non nul "),
          latex(`(${exercice.c} \\neq 0)`),
          texte(" par un terme toujours strictement positif ne peut donc jamais être nul : cette équation n'admet aucune solution."),
        ]);
      } else {
        paragraphes.push([
          texte("Une puissance de base strictement positive (et différente de 1) reste TOUJOURS strictement positive, quel que soit l'exposant : "),
          latex(`${baseLatexPourExposant(exercice.base1)}^{${formatExposantLineaireLatex(exercice.m1, exercice.n1)}} > 0 \\quad \\text{et} \\quad ${baseLatexPourExposant(exercice.base2)}^{${formatExposantLineaireLatex(exercice.m2, exercice.n2)}} > 0`),
          texte(" pour tout x. Une somme de deux termes strictement positifs et d'une constante positive ou nulle "),
          latex(`(k = ${exercice.k} \\geq 0)`),
          texte(" ne peut donc jamais être nulle : cette équation n'admet aucune solution."),
        ]);
      }
      break;
    }
  }

  paragraphes.push([
    texte("L'ensemble des solutions de l'équation est donc "),
    latex(`S = ${formatEnsembleSolutions(exercice)}`),
    texte("."),
  ]);

  return paragraphes;
}

const DERNIER_ECRAN = { A: "aEcran2", B: "bEcran2", C: "cEcran3", D: "dEcran" } as const;

function formatEnsembleSolutions(exercice: ExerciceEquationExponentielle): string {
  const solutions = formatReponseAttenduePhaseLatex(exercice, DERNIER_ECRAN[exercice.famille]);
  // Chaque élément peut déjà porter un préfixe "x = " — retiré avant le regroupement en ensemble,
  // même convention que `equationsCyclometriques/exportEvaluation.ts` (6gen3), pour ne jamais
  // afficher "S = {x = ...}".
  const valeurs = solutions.map((s) => s.replace(/^x\s*=\s*/, ""));
  return valeurs.length === 1 && valeurs[0] === "\\varnothing" ? "\\varnothing" : `\\{${valeurs.join("\\,;\\,")}\\}`;
}

/** Nombre de lignes laissées à l'élève — assez généreux pour une résolution rédigée complète. */
function nombreLignesReponse(nombreParagraphes: number): number {
  return Math.max(10, nombreParagraphes * 2 + 2);
}

function construireEnonceEquationsExponentielles(exercice: ExerciceEquationExponentielle): SectionExercice {
  const nombreParagraphes = construireParagraphesResolution(exercice).length;
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE), latex(formatEnonceLatex(exercice))],
    questions: [
      {
        consigne: [texte("Développe ici ta résolution complète, étape par étape.")],
        reponse: { type: "lignes", nombre: nombreLignesReponse(nombreParagraphes) },
      },
    ],
  };
}

function construireCorrectionEquationsExponentielles(exercice: ExerciceEquationExponentielle): BlocCorrection[] {
  return construireParagraphesResolution(exercice).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationEquationsExponentielles: AdaptateurFeuilleExercices<ExerciceEquationExponentielle> = {
  titreDocument: "Résoudre une équation exponentielle — Évaluation",
  nomFichierBase: "equations-exponentielles",
  genererInstance: genererExerciceEquationExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceEquationsExponentielles,
  construireCorrection: construireCorrectionEquationsExponentielles,
  // Une seule question ouverte par instance (voir commentaire de tête) : pas de sous-questions
  // lettrées, mais `regroupable` reste exclu car la consigne mentionne l'équation tirée
  // (`latex(...)` dans `enteteFragments`), jamais une consigne générique indépendante de l'instance.
};
