import type {
  BaseIneq,
  Comparateur,
  ExerciceIneqA,
  ExerciceIneqB,
  ExerciceIneqC,
  ExerciceIneqD,
  ExerciceIneqE,
  ExerciceInequationExponentielle,
  FacteurUnZero,
  PremierFacteurD,
  SecondFacteurDConstant,
  ValeurExacteIneq,
} from "../../core6e/inequationsExponentielles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { inverserComparateur } from "./comparateur";
import { CONSIGNE_GENERALE, contenuRecapPhase, formatEnonceLatex } from "../../ui6e/formatInequationsExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationExponentielle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequationExponentielle>` pour `6gen10` (Résoudre
 * une inéquation exponentielle) — feuille d'évaluation.
 *
 * Une seule consigne ouverte par instance (« Résous l'inéquation »), suivie d'une résolution
 * rédigée et entièrement justifiée dans le corrigé — jamais de sous-questions guidées comme les
 * écrans interactifs (1 à 3 selon la famille/le sous-type, voir
 * `core6e/inequationsExponentielles.types.ts`), même principe que les 6 générateurs du chapitre 2
 * de 4e et que `equationsExponentielles/exportEvaluation.ts` (6gen9, même chapitre).
 *
 * Chaque paragraphe combine un principe mathématique général (le piège central de chaque famille,
 * documenté en tête de `core6e/inequationsExponentielles.types.ts` : sens préservé/inversé selon
 * la base, positivité stricte d'une exponentielle, signe constant d'un polynôme sans racine réelle)
 * avec la valeur CONFIRMÉE de l'étape correspondante, toujours lue via `contenuRecapPhase` — la
 * même fonction qui alimente déjà le récapitulatif final interactif, jamais recalculée ici.
 */

// Petites primitives de mise en forme dupliquées fidèlement de `ui6e/formatInequationsExponentielles.ts`
// (non exportées depuis ce fichier) — jamais réinventées indépendamment, même convention que
// `equationsExponentielles/exportEvaluation.ts`.

function baseLatex(base: BaseIneq): string {
  if (base.estE) return "e";
  if (base.den === 1) return String(base.num);
  return `\\frac{${base.num}}{${base.den}}`;
}

function baseLatexPourExposant(base: BaseIneq): string {
  if (base.estE || base.den === 1) return baseLatex(base);
  return `\\left(${baseLatex(base)}\\right)`;
}

function symboleComparateurLatex(cmp: Comparateur): string {
  switch (cmp) {
    case ">":
      return ">";
    case "<":
      return "<";
    case ">=":
      return "\\geq";
    case "<=":
      return "\\leq";
  }
}

function denominateurDecimalFini(den: number): boolean {
  let d = den;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

function formatValeurExacteLatex(v: ValeurExacteIneq): string {
  if (v.den === 1) return String(v.num);
  if (denominateurDecimalFini(v.den)) return String(v.num / v.den).replace(".", "{,}");
  return `\\frac{${v.num}}{${v.den}}`;
}

/** "{m}x + {n}" (ou "{m}x - {|n|}"), jamais de coefficient ±1 littéral, jamais de terme constant
 * nul affiché — même convention que `equationsExponentielles/exportEvaluation.ts` (6gen9). */
function formatExposantLineaireLatex(m: number, n: number): string {
  const coeffX = Math.abs(m) === 1 ? (m === 1 ? "x" : "-x") : `${m}x`;
  if (n === 0) return coeffX;
  return `${coeffX} ${n > 0 ? "+" : "-"} ${Math.abs(n)}`;
}

/** Dupliqué fidèlement de `ui6e/formatInequationsExponentielles.ts::formatSommeTermesAvecCdot`
 * (non exportée) — `\cdot` explicite entre coefficient et suffixe non polynomial. */
function formatSommeTermesAvecCdot(termes: { valeur: number; suffixe: string }[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}\\cdot ${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

/** Dupliqué fidèlement de `ui6e/formatInequationsExponentielles.ts::formatXMoinsZero` (non
 * exportée). */
function formatXMoinsZero(zero: number): string {
  if (zero === 0) return "x";
  return zero > 0 ? `x-${zero}` : `x+${-zero}`;
}

/** Dupliqué fidèlement de `ui6e/formatInequationsExponentielles.ts::formatPremierFacteurLatex`
 * (non exportée). */
function formatPremierFacteurLatex(pf: PremierFacteurD): string {
  const bl = baseLatexPourExposant(pf.base);
  const puissance = `${bl}^{${formatExposantLineaireLatex(pf.m, pf.n)}}`;
  if (pf.positif) return formatSommeTermesAvecCdot([{ valeur: pf.c, suffixe: puissance }]);
  return `-${formatSommeTermesAvecCdot([{ valeur: pf.c, suffixe: puissance }])}-${pf.d}`;
}

/** Dupliqué fidèlement de `ui6e/formatInequationsExponentielles.ts::formatSecondFacteurConstantLatex`
 * (non exportée). */
function formatSecondFacteurConstantLatex(sf: SecondFacteurDConstant): string {
  if (sf.type === "quadratique") return `${formatSommeTermesAvecCdot([{ valeur: sf.d, suffixe: "x^2" }])}-${sf.e}`;
  const bl = baseLatexPourExposant(sf.base);
  return `${bl}^{x}-${sf.k}`;
}

/** Dupliqué fidèlement de `ui6e/formatInequationsExponentielles.ts::formatFacteurUnZeroLatex`
 * (non exportée). */
function formatFacteurUnZeroLatex(f: FacteurUnZero): string {
  if (f.type === "lineaire") return f.pente === 1 ? formatXMoinsZero(f.zero) : `${f.zero}-x`;
  const bl = baseLatexPourExposant(f.base);
  const argExpo = f.sgn === 1 ? formatXMoinsZero(f.zero) : `-\\left(${formatXMoinsZero(f.zero)}\\right)`;
  return `${formatSommeTermesAvecCdot([{ valeur: f.c, suffixe: `${bl}^{${argExpo}}` }])}-${f.c}`;
}

function latexRecap(exercice: ExerciceInequationExponentielle, phase: Parameters<typeof contenuRecapPhase>[1]): FragmentConsigne[] {
  const { texte: t, latex: l } = contenuRecapPhase(exercice, phase);
  if (l !== null) return t !== null ? [texte(`${t} : `), latex(l)] : [latex(l)];
  return [texte(t ?? "")];
}

/** Résolution rédigée et justifiée, un seul exercice ouvert — voir le commentaire de tête. */
function construireParagraphesResolution(exercice: ExerciceInequationExponentielle): FragmentConsigne[][] {
  const paragraphes: FragmentConsigne[][] = [];

  switch (exercice.famille) {
    case "A": {
      const a = exercice as ExerciceIneqA;
      paragraphes.push([
        texte("On réécrit la valeur numérique comme une puissance de la même base que le premier membre : "),
        latex(`${baseLatexPourExposant(a.base)}^{${a.p}} = ${formatValeurExacteLatex(a.valeurNumerique)}`),
        texte(", donc l'exposant cherché vaut "),
        latex(String(a.p)),
        texte("."),
      ]);
      const comparateurExposants = a.baseSuperieureA1 ? a.comparateur : inverserComparateur(a.comparateur);
      paragraphes.push([
        texte(
          `Comme la base est ${a.baseSuperieureA1 ? "supérieure" : "inférieure"} à 1, la fonction exponentielle correspondante est ${a.baseSuperieureA1 ? "croissante" : "décroissante"} : le sens de l'inégalité est donc ${a.baseSuperieureA1 ? "conservé" : "inversé"} en passant aux exposants. On résout `,
        ),
        latex(`${formatExposantLineaireLatex(a.m, a.n)} ${symboleComparateurLatex(comparateurExposants)} ${a.p}`),
        texte(", ce qui donne "),
        ...latexRecap(exercice, "aResoudre"),
        texte("."),
      ]);
      break;
    }
    case "B": {
      const b = exercice as ExerciceIneqB;
      paragraphes.push([
        texte(
          `Une puissance de base strictement positive reste toujours strictement positive, quel que soit l'exposant : le membre de gauche (un multiple positif de cette puissance, ${b.c}>0) est donc toujours strictement positif, tandis que le membre de droite vaut ${-b.k} < 0. Un nombre strictement positif ne peut jamais être `,
        ),
        latex(symboleComparateurLatex(b.comparateur)),
        texte(" un nombre strictement négatif : cette inéquation n'admet donc aucune solution."),
      ]);
      break;
    }
    case "C": {
      const c = exercice as ExerciceIneqC;
      if (c.sousType === "f") {
        paragraphes.push([
          texte(
            "On étudie le signe du produit selon celui de x, sachant que la base est supérieure à 1 : pour x<0, baseˣ<1 donc (baseˣ−1)<0, et le produit de deux facteurs négatifs est positif. Pour x>0, les deux facteurs sont positifs, donc leur produit l'est aussi. En x=0, le produit vaut exactement 0, inclus puisque l'inégalité est large (≥). Cette expression est donc toujours positive ou nulle : elle est vraie pour tout x réel.",
          ),
        ]);
      } else {
        paragraphes.push([
          texte("On regroupe l'inéquation en divisant les deux membres par "),
          latex(`${baseLatexPourExposant(c.base2)}^{2g(x)}`),
          texte(" (toujours strictement positif, ce qui ne change jamais le sens de l'inégalité) : "),
          ...latexRecap(exercice, "ckRegrouper"),
          texte("."),
        ]);
        paragraphes.push([
          texte(
            `Comme ${baseLatex(c.base1)} < ${baseLatex(c.base2)}^2, le rapport des bases est strictement inférieur à 1 : la fonction exponentielle correspondante est décroissante, donc le sens de l'inégalité s'inverse en passant à g(x). Or g(x) = ${c.a}x²+${c.b}x+${c.c} est un polynôme du second degré à coefficient dominant positif et à discriminant négatif (Δ = ${c.b}² − 4·${c.a}·${c.c} < 0) : il est donc TOUJOURS strictement positif, quel que soit x. L'inégalité inversée sur g(x) est donc vraie pour tout x réel.`,
          ),
        ]);
      }
      break;
    }
    case "D": {
      const d = exercice as ExerciceIneqD;
      if (d.sousType === "constant") {
        paragraphes.push([
          texte(
            "Le premier facteur a un signe constant, quel que soit x (une puissance de base strictement positive reste toujours strictement positive) : ",
          ),
          latex(`${formatPremierFacteurLatex(d.premierFacteur)} ${d.premierFacteur.positif ? "> 0" : "< 0"}`),
          texte(" pour tout x."),
        ]);
        const sensCorrige = d.premierFacteur.positif ? d.comparateur : inverserComparateur(d.comparateur);
        paragraphes.push([
          texte(
            `Le sens de l'inéquation sur le second facteur est donc ${d.premierFacteur.positif ? "conservé" : "inversé"} (sens de l'inégalité sur le produit ${d.premierFacteur.positif ? "préservé" : "inversé"} car on divise par un facteur ${d.premierFacteur.positif ? "positif" : "négatif"}) : on résout le second facteur seul, `,
          ),
          latex(`${formatSecondFacteurConstantLatex(d.secondFacteur)} ${symboleComparateurLatex(sensCorrige)} 0`),
          texte(", ce qui donne "),
          ...latexRecap(exercice, "dConstantResoudre"),
          texte("."),
        ]);
      } else {
        paragraphes.push([
          texte("On résout "),
          latex(`${formatFacteurUnZeroLatex(d.facteur1)} = 0`),
          texte(" pour trouver le zéro du premier facteur, puis on teste son signe juste avant et juste après : "),
          ...latexRecap(exercice, "dVariableSigne1"),
          texte("."),
        ]);
        paragraphes.push([
          texte("On fait de même pour le second facteur, "),
          latex(`${formatFacteurUnZeroLatex(d.facteur2)} = 0`),
          texte(" : "),
          ...latexRecap(exercice, "dVariableSigne2"),
          texte("."),
        ]);
        paragraphes.push([
          texte(
            "On combine les deux signes dans un tableau (règle des signes d'un produit : (+)×(+)=+, (−)×(−)=+, (+)×(−)=(−)×(+)=−), ce qui donne l'ensemble des solutions de l'inéquation : ",
          ),
          ...latexRecap(exercice, "dVariableTableau"),
          texte("."),
        ]);
      }
      break;
    }
    case "E": {
      const e = exercice as ExerciceIneqE;
      paragraphes.push([
        texte("On regroupe l'inéquation en divisant les deux membres par "),
        latex(`${baseLatexPourExposant(e.base2)}^{${formatExposantLineaireLatex(e.m, e.n)}}`),
        texte(" (toujours strictement positif, ce qui ne change jamais le sens de l'inégalité) : "),
        ...latexRecap(exercice, "eRegrouper"),
        texte("."),
      ]);
      const comparateurExposants = e.ratioSuperieurA1 ? e.comparateur : inverserComparateur(e.comparateur);
      paragraphes.push([
        texte(
          `Comme le rapport des bases ${baseLatex(e.base1)}/${baseLatex(e.base2)} est ${e.ratioSuperieurA1 ? "supérieur" : "inférieur"} à 1, la fonction exponentielle correspondante est ${e.ratioSuperieurA1 ? "croissante" : "décroissante"} : le sens de l'inégalité est donc ${e.ratioSuperieurA1 ? "conservé" : "inversé"} en passant aux exposants. On résout `,
        ),
        latex(`${formatExposantLineaireLatex(e.m, e.n)} ${symboleComparateurLatex(comparateurExposants)} 0`),
        texte(", ce qui donne "),
        ...latexRecap(exercice, "eResoudre"),
        texte("."),
      ]);
      break;
    }
  }

  return paragraphes;
}

/** Nombre de lignes laissées à l'élève — assez généreux pour une résolution rédigée complète. */
function nombreLignesReponse(nombreParagraphes: number): number {
  return Math.max(10, nombreParagraphes * 2 + 2);
}

function construireEnonceInequationsExponentielles(exercice: ExerciceInequationExponentielle): SectionExercice {
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

function construireCorrectionInequationsExponentielles(exercice: ExerciceInequationExponentielle): BlocCorrection[] {
  return construireParagraphesResolution(exercice).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationInequationsExponentielles: AdaptateurFeuilleExercices<ExerciceInequationExponentielle> = {
  titreDocument: "Résoudre une inéquation exponentielle — Évaluation",
  nomFichierBase: "inequations-exponentielles",
  genererInstance: genererExerciceInequationExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceInequationsExponentielles,
  construireCorrection: construireCorrectionInequationsExponentielles,
  // Une seule question ouverte par instance (voir commentaire de tête) : pas de sous-questions
  // lettrées, mais `regroupable` reste exclu car la consigne mentionne l'inéquation tirée
  // (`latex(...)` dans `enteteFragments`), jamais une consigne générique indépendante de l'instance.
};
