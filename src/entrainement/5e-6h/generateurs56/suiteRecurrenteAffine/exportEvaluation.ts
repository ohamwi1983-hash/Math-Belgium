// Copie 5e (6h) de `5e-4h/generateurs5e/suiteRecurrenteAffine/exportEvaluation.ts` (56gen12 ← 5gen19, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceSuiteRecurrenteAffine, RegimeSuiteRecurrenteAffine } from "../../../5e-4h/core5e/suiteRecurrenteAffine.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fractionQVersNombre } from "../../../5e-4h/generateurs5e/suitesGeometriques/fraction";
import {
  aLatex,
  consignePoserRecurrence,
  consigneRegimePermanent,
  consigneTermesSuccessifs,
  formatRegimeConfirmeLatex,
  formatReponseAttenduePhaseLatex,
} from "./ui/formatSuiteRecurrenteAffine";
import { correctionDetailleeSuiteRecurrenteAffine } from "./corrigeDetaille";
import { CATALOGUE_REGIMES_SUITE_RECURRENTE_AFFINE, construireAvecRegime, genererExerciceSuiteRecurrenteAffine } from "./";
import { profilSuiteRecurrenteAffine } from "../profilsEvaluationSuites56";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteRecurrenteAffine>` pour 5gen19 (Suite
 * récurrente affine et régime permanent) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Les 3 écrans du générateur (`poserRecurrence` → `regimePermanent` → `termesSuccessifs`) sont ici
 * trois VRAIES questions d'un problème (modéliser, étudier le comportement à long terme, calculer
 * des valeurs), pas des étapes de pur guidage : l'énoncé papier les garde en a) b) c), dans l'ordre
 * de l'écran, avec les consignes de l'écran débarrassées de leurs tournures de saisie
 * (« tape Q ou x pour Qₙ »). La notation (Q₁ valeur initiale, Qₙ₊₁ une étape après Qₙ) passe dans
 * l'énoncé.
 *
 * Catalogue de variantes : les 2 RÉGIMES (mêmes ids que le sélecteur de l'appli,
 * `construireAvecRegime`) — jamais les 60 contextes, dont le catalogue ferait exploser l'URL du
 * payload `/admin` (constaté : 431 « Request Header Fields Too Large »).
 *
 * Valeurs : mêmes fonctions que l'écran (`aLatex`, `formatRegimeConfirmeLatex`,
 * `formatReponseAttenduePhaseLatex` — décimal à la virgule, fraction exacte seulement si lisible).
 */


/** Nombre décimal en LaTeX, virgule belge, au plus `decimales` décimales. */
function decimalLatex(valeur: number, decimales = 2): string {
  const arrondi = Math.round(valeur * 10 ** decimales) / 10 ** decimales;
  return (arrondi === 0 ? 0 : arrondi).toFixed(decimales).replace(/\.?0+$/, "").replace(".", "{,}");
}

/** Indice Unicode (Q₁, Qₙ₊₁) pour le texte brut des consignes. */
function indiceTexte(lettre: string, indice: string): string {
  const sub: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", n: "ₙ", "+": "₊" };
  return lettre + [...indice].map((c) => sub[c] ?? c).join("");
}

/** Consigne de l'écran « poser la récurrence » coupée en deux : la phrase de notation (énoncé) et
 * la question, sans la tournure de saisie « (tape Q ou x pour Qₙ) ». */
function decouperConsignePoser(exercice: ExerciceSuiteRecurrenteAffine): { notation: string; question: string } {
  const brut = consignePoserRecurrence(exercice).replace(/\s*\(tape [^)]*\)/, "");
  const i = brut.indexOf("Exprime");
  return i < 0 ? { notation: "", question: brut } : { notation: brut.slice(0, i).trim(), question: brut.slice(i).trim() };
}

/** Consigne des termes sans la parenthèse de saisie (« tu peux réutiliser… », réservée à l'écran). */
function consigneTermesPapier(exercice: ExerciceSuiteRecurrenteAffine): string {
  return consigneTermesSuccessifs(exercice).replace(/\s*\(tu peux [^)]*\)/, "");
}

function pourcentage(exercice: ExerciceSuiteRecurrenteAffine): number {
  return Math.round(Math.abs(fractionQVersNombre(exercice.a) - 1) * 100);
}

function relationLatex(exercice: ExerciceSuiteRecurrenteAffine): string {
  return formatReponseAttenduePhaseLatex(exercice, "poserRecurrence")[0];
}

function construireEnonceSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): SectionExercice {
  const { notation, question } = decouperConsignePoser(exercice);
  return {
    enteteFragments: [texte(notation ? `${exercice.phraseEnonce} ${notation}` : exercice.phraseEnonce)],
    questions: [{ consigne: [texte(question)] }, { consigne: [texte(consigneRegimePermanent(exercice))] }, { consigne: [texte(consigneTermesPapier(exercice))] }],
  };
}

/** Énoncé papier : le même (trois vraies questions, une par étape). */
function enoncePapierSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): EnoncePapier {
  return { section: construireEnonceSuiteRecurrenteAffine(exercice), etapesParQuestion: [["a"], ["b"], ["c"]] };
}

function construireCorrectionSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("a) "), latex(relationLatex(exercice))] },
    { type: "paragraphe", fragments: [texte("b) "), latex(formatRegimeConfirmeLatex(exercice))] },
    { type: "paragraphe", fragments: [texte("c) "), ...formatReponseAttenduePhaseLatex(exercice, "termesSuccessifs").flatMap((t, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(t)])] },
  ];
}

function reponseBreveSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): FragmentConsigne[] {
  const termes = formatReponseAttenduePhaseLatex(exercice, "termesSuccessifs");
  return [
    texte("a) "),
    latex(relationLatex(exercice)),
    texte(" ; b) "),
    ...(exercice.regime === "divergent" ? [texte("pas de régime permanent")] : [latex(formatRegimeConfirmeLatex(exercice))]),
    texte(" ; c) "),
    ...termes.flatMap((t, i) => [...(i === 0 ? [] : [texte(", ")]), latex(t)]),
  ];
}

function baremeSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): BaremeExercice {
  const convergent = exercice.regime === "convergent";
  const p = pourcentage(exercice);
  const erreurs: ErreurFrequente[] = [
    {
      description: [texte(convergent ? `a = ${decimalLatex(p / 100).replace("{,}", ",")} (la part retirée) au lieu de ${aLatex(exercice).replace("{,}", ",")}` : `a = ${decimalLatex(p / 100).replace("{,}", ",")} au lieu de ${aLatex(exercice).replace("{,}", ",")}`)],
      cout: "0 pt sur a), suite notée sans double pénalité",
    },
  ];
  if (!convergent) erreurs.push({ description: [texte("Régime permanent annoncé alors que |a| ≥ 1 (valeur de b/(1 − a) donnée comme limite)")], cout: "0 pt sur la conclusion de b)" });
  erreurs.push({ description: [texte(`Terme suivant calculé comme a × (${indiceTexte(exercice.variableGrandeur, "n")} + b)`)], cout: "−0,5 sur c)" });
  return {
    reponseFinale: reponseBreveSuiteRecurrenteAffine(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Relation de récurrence : "), latex(relationLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: [texte("Critère "), latex("|a|<1"), texte(" appliqué")], points: 0.5 },
      convergent
        ? { sousQuestion: "b", critere: [texte("Régime permanent : "), latex(formatRegimeConfirmeLatex(exercice))], points: 1 }
        : { sousQuestion: "b", critere: [texte("Conclusion : pas de régime permanent")], points: 1 },
      { sousQuestion: "c", critere: [texte("Trois termes arrondis au centième : "), ...formatReponseAttenduePhaseLatex(exercice, "termesSuccessifs").flatMap((t, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(t)])], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Relation écrite avec une autre lettre (x, u…) pour " + indiceTexte(exercice.variableGrandeur, "n"))],
      [texte("Termes calculés à partir des valeurs déjà arrondies (écart d'un centième)")],
      ...(convergent ? [[texte("Régime permanent donné en fraction exacte")]] : []),
    ],
  };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceSuiteRecurrenteAffine): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeSuiteRecurrenteAffine(e)), methode: 2, piege: 1 };
}

export const adaptateurEvaluationSuiteRecurrenteAffine: AdaptateurFeuilleExercices<ExerciceSuiteRecurrenteAffine> = {
  profilInstance: profilSuiteRecurrenteAffine,
  titreDocument: "Suite récurrente affine et régime permanent — Évaluation",
  nomFichierBase: "suite-recurrente-affine",
  genererInstance: genererExerciceSuiteRecurrenteAffine,
  catalogueVariantes: CATALOGUE_REGIMES_SUITE_RECURRENTE_AFFINE,
  genererInstanceAvecVariante: (id) => construireAvecRegime(id as RegimeSuiteRecurrenteAffine),
  construireEnonce: construireEnonceSuiteRecurrenteAffine,
  construireCorrection: construireCorrectionSuiteRecurrenteAffine,
  criteresDifficulte,
  reponseBreve: reponseBreveSuiteRecurrenteAffine,
  correctionDetaillee: correctionDetailleeSuiteRecurrenteAffine,
  bareme: baremeSuiteRecurrenteAffine,
  enoncePapier: enoncePapierSuiteRecurrenteAffine,
};
