import type { ExerciceSuiteRecurrenteAffine, RegimeSuiteRecurrenteAffine } from "../../core5e/suiteRecurrenteAffine.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fractionQVersNombre } from "../suitesGeometriques/fraction";
import {
  aLatex,
  consignePoserRecurrence,
  consigneRegimePermanent,
  consigneTermesSuccessifs,
  formatRegimeConfirmeLatex,
  formatReponseAttenduePhaseLatex,
} from "../../ui5e/formatSuiteRecurrenteAffine";
import { CATALOGUE_REGIMES_SUITE_RECURRENTE_AFFINE, construireAvecRegime, genererExerciceSuiteRecurrenteAffine } from "./index";
import { profilSuiteRecurrenteAffine } from "../profilsEvaluationSuites";

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

function correctionDetailleeSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): EtapeCorrection[] {
  const V = exercice.variableGrandeur;
  const a = fractionQVersNombre(exercice.a);
  const p = pourcentage(exercice);
  const convergent = exercice.regime === "convergent";
  const u2 = fractionQVersNombre(exercice.u2);
  const u3 = fractionQVersNombre(exercice.u3);
  const b = exercice.b;
  const plusB = b < 0 ? `-${-b}` : `+${b}`;
  const termes = formatReponseAttenduePhaseLatex(exercice, "termesSuccessifs");
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: convergent
        ? [texte(`Retirer ${p} % revient à garder ${100 - p} %, donc à multiplier par `), latex(`a=1-${decimalLatex(p / 100)}=${aLatex(exercice)}`), texte(" ; la quantité fixe ajoutée ou retirée à chaque étape est "), latex(`b=${b}`), texte(".")]
        : [texte(`Augmenter de ${p} % revient à multiplier par `), latex(`a=1+${decimalLatex(p / 100)}=${aLatex(exercice)}`), texte(" ; la quantité fixe ajoutée ou retirée à chaque étape est "), latex(`b=${b}`), texte(".")],
    },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(relationLatex(exercice))] },
    {
      label: "Piège",
      sousQuestion: "a",
      fragments: convergent
        ? [texte(`Multiplier par ${decimalLatex(p / 100).replace("{,}", ",")} (la part retirée) au lieu de ${aLatex(exercice).replace("{,}", ",")} (la part qui reste).`)]
        : [texte(`Multiplier par ${decimalLatex(p / 100).replace("{,}", ",")} au lieu de ${aLatex(exercice).replace("{,}", ",")} : une hausse de ${p} % multiplie par 1 + ${p}/100.`)],
    },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Un régime permanent existe seulement si "), latex("|a|<1"), texte(" ; on le trouve en résolvant "), latex("L=a\\times L+b"), texte(".")] },
  ];
  if (convergent) {
    etapes.push({
      label: "Calcul",
      sousQuestion: "b",
      fragments: [latex(`|a|=${aLatex(exercice)}<1`), texte(" ; "), latex(`L=\\dfrac{b}{1-a}=\\dfrac{${b}}{1-${aLatex(exercice)}}=\\dfrac{${b}}{${decimalLatex(1 - a)}}`)],
    });
    etapes.push({ label: "Conclusion", sousQuestion: "b", fragments: [latex(formatRegimeConfirmeLatex(exercice)), texte(" : à long terme, la grandeur se stabilise vers cette valeur.")] });
  } else {
    etapes.push({ label: "Calcul", sousQuestion: "b", fragments: [latex(`|a|=${aLatex(exercice)}\\geq 1`)] });
    etapes.push({ label: "Conclusion", sousQuestion: "b", fragments: [texte("Pas de régime permanent : la suite s'éloigne de toute valeur fixe (elle croît sans limite).")] });
    etapes.push({
      label: "Piège",
      sousQuestion: "b",
      fragments: [texte("La formule donne pourtant un nombre, "), latex(`\\dfrac{b}{1-a}\\approx ${decimalLatex(b / (1 - a))}`), texte(" : ce n'est pas un régime permanent, puisque "), latex("|a|\\geq 1"), texte(".")],
    });
  }
  etapes.push({ label: "Méthode", sousQuestion: "c", fragments: [texte("On applique la relation à partir de la valeur initiale ; on peut réutiliser les valeurs arrondies au centième.")] });
  etapes.push({
    label: "Calcul",
    sousQuestion: "c",
    fragments: [
      latex(`${V}_2=${aLatex(exercice)}\\times ${exercice.u1}${plusB}`),
      texte(" ; "),
      latex(`${V}_3=${aLatex(exercice)}\\times ${decimalLatex(u2)}${plusB}`),
      texte(" ; "),
      latex(`${V}_4=${aLatex(exercice)}\\times ${decimalLatex(u3)}${plusB}`),
    ],
  });
  etapes.push({ label: "Conclusion", sousQuestion: "c", fragments: termes.flatMap((t, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(t)]) });
  etapes.push({ label: "Piège", sousQuestion: "c", fragments: [latex(`${V}_2=a\\times ${V}_1+b`), texte(", et non "), latex(`a\\times(${V}_1+b)`), texte(" : on multiplie d'abord, puis on ajoute b.")] });
  return etapes;
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

function difficulteSuiteRecurrenteAffine(exercice: ExerciceSuiteRecurrenteAffine): 1 | 2 | 3 {
  return exercice.regime === "divergent" ? 3 : 2;
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
  difficulte: difficulteSuiteRecurrenteAffine,
  reponseBreve: reponseBreveSuiteRecurrenteAffine,
  correctionDetaillee: correctionDetailleeSuiteRecurrenteAffine,
  bareme: baremeSuiteRecurrenteAffine,
  enoncePapier: enoncePapierSuiteRecurrenteAffine,
  dureeMinutes: 10,
};
