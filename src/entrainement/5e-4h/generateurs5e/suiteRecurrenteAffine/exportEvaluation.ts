import type { ExerciceSuiteRecurrenteAffine } from "../../core5e/suiteRecurrenteAffine.types";
import type { FractionQ } from "../../core5e/suitesGeometriques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fractionQVersNombre } from "../suitesGeometriques/fraction";
import { consignePoserRecurrence, consigneRegimePermanent, consigneTermesSuccessifs } from "../../ui5e/formatSuiteRecurrenteAffine";
import { genererExerciceSuiteRecurrenteAffine } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteRecurrenteAffine>` pour 5gen19 (Suite
 * récurrente affine et régime permanent) — feuille d'évaluation. L'écran interactif enchaîne 3
 * phases FIXES (`App5gen19.tsx` → `moteur5e/sessionSuiteRecurrenteAffine.ts` :
 * poserRecurrence → regimePermanent → termesSuccessifs, voir aussi `ui5e/formatSuiteRecurrenteAffine.ts`),
 * reprises ici telles quelles comme 3 questions écrites a)/b)/c) — jamais un exercice reformulé :
 * les consignes réutilisent directement `consignePoserRecurrence`/`consigneRegimePermanent`/
 * `consigneTermesSuccessifs`, déjà utilisées côté écran.
 *
 * Le générateur expose 2 axes de variantes indépendants (`construireAvecRegime`/`construireAvecContexteId`,
 * voir `index.ts`) — NI L'UN NI L'AUTRE n'est câblé ici (`catalogueVariantes`/
 * `genererInstanceAvecVariante` volontairement absents, même convention que gen8/gen9/gen12 côté
 * 4e) : le contexte a 60 valeurs, un catalogue de cette taille ferait exploser la taille de l'URL
 * du payload `/admin` (constaté : 431 "Request Header Fields Too Large" dès qu'on force plusieurs
 * instances par contexte) et produirait 60 lignes dans le formulaire pour un seul générateur.
 * `genererInstance` (tirage uniforme parmi les 60 contextes) reste donc la seule voie — un
 * professeur qui demande N exercices obtient N contextes différents tirés au hasard, ce qui reste
 * l'usage réel recherché (varier le scénario concret) sans le problème de taille.
 *
 * `a` est TOUJOURS positif dans ce générateur (`1∓pct/100`, `pct>0` dans les deux branches, voir
 * `index.ts`/`contextes.ts`) : `|a|=a`, jamais besoin de gérer un `a` négatif dans le corrigé.
 */

/** Fraction irréductible en LaTeX — entier si `den===1`, sinon fraction (signe porté par `num`) —
 * jamais un décimal (`prompt-chapitre-suites-audit-formatage.md`, même bug que 5gen15/16). Duplique
 * volontairement `ui5e/formatSuiteRecurrenteAffine.ts::fractionQVersLatex` (non exporté), même
 * convention de petite duplication déjà établie sur ce chantier. */
function fractionQVersLatex(f: FractionQ): string {
  if (f.den === 1) return `${f.num}`;
  return f.num < 0 ? `-\\dfrac{${-f.num}}{${f.den}}` : `\\dfrac{${f.num}}{${f.den}}`;
}

/** Arrondi au centième — même tolérance que `moteur5e/verificationSuiteRecurrenteAffine.ts::TOLERANCE_PRECISE`
 * (0.01), affiché à côté de la valeur exacte plutôt qu'à sa place. */
function arrondiCentieme(f: FractionQ): string {
  const arrondi = Math.round(fractionQVersNombre(f) * 100) / 100;
  return (arrondi === 0 ? 0 : arrondi).toFixed(2);
}

/** Terme `b` signé — porte son propre signe plutôt que d'être juxtaposé à un `+` littéral du
 * template (sinon double-signe `+-5` quand `b<0`, cas des contextes divergents). Duplique
 * `formatTermeB` de `ui5e/formatSuiteRecurrenteAffine.ts` (non exporté). */
function formatTermeB(b: number): string {
  return b < 0 ? `-${-b}` : `+${b}`;
}

function formatRecurrenceLatex(exercice: ExerciceSuiteRecurrenteAffine): string {
  return `${exercice.variableGrandeur}_{n+1}=${fractionQVersLatex(exercice.a)}\\times ${exercice.variableGrandeur}_n${formatTermeB(exercice.b)}`;
}

function construireEnonceSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): SectionExercice {
  return {
    enteteFragments: [texte(exercice.phraseEnonce)],
    questions: [
      { consigne: [texte(consignePoserRecurrence(exercice))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneRegimePermanent(exercice))], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte(consigneTermesSuccessifs(exercice))], reponse: { type: "lignes", nombre: 4 } },
    ],
  };
}

function construireCorrectionSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): BlocCorrection[] {
  const { variableGrandeur, u1, u2, u3, u4, regime, L, a, b } = exercice;

  const correctionA: BlocCorrection = {
    type: "paragraphe",
    fragments: [texte("a) "), latex(formatRecurrenceLatex(exercice))],
  };

  const correctionB: BlocCorrection =
    regime === "divergent"
      ? {
          type: "paragraphe",
          fragments: [texte("b) "), latex(`|a|=${fractionQVersLatex(a)}\\geq 1`), texte(" ⟹ il n'existe pas de régime permanent.")],
        }
      : {
          type: "paragraphe",
          fragments: [
            texte("b) "),
            latex(`|a|=${fractionQVersLatex(a)}<1`),
            texte(" ⟹ le régime permanent existe. "),
            latex(`L=a\\times L+b \\Rightarrow L=\\dfrac{b}{1-a}=\\dfrac{${b}}{1-\\left(${fractionQVersLatex(a)}\\right)}=${fractionQVersLatex(L as FractionQ)}\\approx ${arrondiCentieme(L as FractionQ)}`),
          ],
        };

  const correctionC: BlocCorrection = {
    type: "paragraphe",
    fragments: [
      texte("c) "),
      latex(`${variableGrandeur}_2=${fractionQVersLatex(a)}\\times ${u1}${formatTermeB(b)}=${fractionQVersLatex(u2)}\\approx ${arrondiCentieme(u2)}`),
      texte(" ; "),
      latex(`${variableGrandeur}_3=${fractionQVersLatex(a)}\\times \\left(${fractionQVersLatex(u2)}\\right)${formatTermeB(b)}=${fractionQVersLatex(u3)}\\approx ${arrondiCentieme(u3)}`),
      texte(" ; "),
      latex(`${variableGrandeur}_4=${fractionQVersLatex(a)}\\times \\left(${fractionQVersLatex(u3)}\\right)${formatTermeB(b)}=${fractionQVersLatex(u4)}\\approx ${arrondiCentieme(u4)}`),
    ],
  };

  return [correctionA, correctionB, correctionC];
}

export const adaptateurEvaluationSuiteRecurrenteAffine: AdaptateurFeuilleExercices<ExerciceSuiteRecurrenteAffine> = {
  titreDocument: "Suite récurrente affine et régime permanent — Évaluation",
  nomFichierBase: "suite-recurrente-affine",
  genererInstance: genererExerciceSuiteRecurrenteAffine,
  construireEnonce: construireEnonceSuiteRecurrenteAffine,
  construireCorrection: construireCorrectionSuiteRecurrenteAffine,
  // 3 questions par instance (poserRecurrence/regimePermanent/termesSuccessifs) — jamais
  // `regroupable` (réservé aux adaptateurs à 1 seule question, voir `AdaptateurFeuilleExercices.regroupable`).
};
