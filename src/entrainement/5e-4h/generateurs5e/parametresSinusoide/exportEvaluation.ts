import type { ExerciceParametresSinusoide, FormeAffichageSinusoide } from "../../core5e/parametresSinusoide.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consignePhase, formatAmplitudeAbsolueLatex, formatChampParametreLatex, formatFormuleLatex, formatFrequenceLatex, formatRationnelPiLatex } from "../../ui5e/formatParametresSinusoide";
import { ORDRE_PHASES_SINUSOIDE, type PhaseParametresSinusoide } from "../../moteur5e/typesParametresSinusoide";
import { CATALOGUE_FORMES, construireAvecFormeId, genererExerciceParametresSinusoide } from "./index";
import { profilParametresSinusoide, PARAMETRES_SINUSOIDE } from "../profilsEvaluationTrigonometrie";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParametresSinusoide>` pour 5gen8 (Paramètres d'une
 * fonction sinusoïdale). Méthode des feuilles : `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : les 7 étapes de l'écran interactif (une par paramètre, ordre du cours
 *   `ORDRE_PHASES_SINUSOIDE`, lettres a → g) — sur papier, elles ne servent qu'aux titres du corrigé.
 * - `enoncePapier` : la formule et UNE consigne globale qui liste les 7 paramètres.
 * Toutes les valeurs viennent de `formatChampParametreLatex` (celles du récapitulatif de l'écran) et
 * des champs exacts de l'instance (`B` = ω, `C` = φ, `phi` = Φ, noms historiques).
 */

const PRECISION = " (valeur exacte, ou arrondie au centième)";
const LETTRE: Record<PhaseParametresSinusoide, string> = { amplitude: "a", pulsation: "b", periode: "c", frequence: "d", dephasage: "e", phi: "f", decalage: "g" };

/** Consigne d'une étape, sans la précision d'arrondi (rappelée une fois dans la consigne globale). */
function consigneEtape(phase: PhaseParametresSinusoide): FragmentConsigne[] {
  return [texte(consignePhase(phase).replace(PRECISION, ""))];
}

function construireEnonceParametresSinusoide(exercice: ExerciceParametresSinusoide): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction sinusoïdale "), latex(formatFormuleLatex(exercice)), texte(".")],
    questions: ORDRE_PHASES_SINUSOIDE.map((phase) => ({ consigne: consigneEtape(phase) })),
  };
}

const CONSIGNE_GLOBALE =
  "Détermine l'amplitude, la pulsation ω, la période T, la fréquence, le déphasage φ, le décalage horizontal Φ et le décalage vertical b de cette fonction (valeurs exactes, ou arrondies au centième).";

function enoncePapierParametresSinusoide(exercice: ExerciceParametresSinusoide): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("On considère la fonction sinusoïdale "), latex(formatFormuleLatex(exercice)), texte(".")],
      questions: [{ consigne: [texte(CONSIGNE_GLOBALE)] }],
    },
    etapesParQuestion: [ORDRE_PHASES_SINUSOIDE.map((phase) => LETTRE[phase])],
  };
}

function construireCorrectionParametresSinusoide(exercice: ExerciceParametresSinusoide): BlocCorrection[] {
  return ORDRE_PHASES_SINUSOIDE.map((champ) => ({ type: "paragraphe", fragments: [latex(formatChampParametreLatex(exercice, champ))] }));
}

/** Les 7 paramètres, « label = valeur », séparés par « ; ». */
function listeParametres(exercice: ExerciceParametresSinusoide): FragmentConsigne[] {
  return ORDRE_PHASES_SINUSOIDE.flatMap((champ, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(formatChampParametreLatex(exercice, champ))]);
}

function reponseBreveParametresSinusoide(exercice: ExerciceParametresSinusoide): FragmentConsigne[] {
  return listeParametres(exercice);
}

/** A signé, tel qu'il multiplie le sinus (le « 1 » écrit en clair). */
function amplitudeSigneeLatex(exercice: ExerciceParametresSinusoide): string {
  return `${exercice.A.signe < 0 ? "-" : ""}${formatAmplitudeAbsolueLatex(exercice.A)}`;
}

/** Chaîne d'égalités sans membre répété (« 1/(3π) = 1/(3π) » quand le calcul ne simplifie rien). */
function egaliteSansRepetition(membres: string[]): string {
  return membres.filter((m, i) => i === 0 || m !== membres[i - 1]).join(" = ");
}

/** Parenthèses autour d'une valeur négative, pour l'écrire dans un produit ou une fraction. */
function entreParentheses(valeurLatex: string): string {
  return valeurLatex.startsWith("-") ? `\\left(${valeurLatex}\\right)` : valeurLatex;
}

function correctionDetailleeParametresSinusoide(exercice: ExerciceParametresSinusoide): EtapeCorrection[] {
  const developpee = exercice.forme === "developpee";
  const omega = formatRationnelPiLatex(exercice.B);
  const T = formatRationnelPiLatex(exercice.T);
  const phase = formatRationnelPiLatex(exercice.C);
  const Phi = formatRationnelPiLatex(exercice.phi);
  const conclusion = (champ: PhaseParametresSinusoide): EtapeCorrection => ({ label: "Conclusion", sousQuestion: LETTRE[champ], fragments: [latex(formatChampParametreLatex(exercice, champ))] });
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("L'amplitude est la valeur absolue du coefficient placé devant le sinus :")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`\\text{amplitude} = \\left|${amplitudeSigneeLatex(exercice)}\\right| = ${formatAmplitudeAbsolueLatex(exercice.A)}`)] },
    ...(exercice.A.signe < 0
      ? [{ label: "Piège", sousQuestion: "a", fragments: [texte("Le coefficient devant le sinus est négatif, mais l'amplitude est toujours positive : c'est sa valeur absolue.")] }]
      : []),
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: developpee
        ? [texte("Dans l'argument écrit "), latex("\\omega x + \\varphi"), texte(", la pulsation ω est le coefficient de x.")]
        : [texte("Dans l'argument écrit "), latex("\\omega(x - \\Phi)"), texte(", la pulsation ω est le facteur placé devant la parenthèse.")],
    },
    conclusion("pulsation"),
    { label: "Méthode", sousQuestion: "c", fragments: [texte("La période se déduit de la pulsation :")] },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(`T = \\dfrac{2\\pi}{\\omega} = \\dfrac{2\\pi}{${omega}} = ${T}`)] },
    { label: "Méthode", sousQuestion: "d", fragments: [texte("La fréquence est l'inverse de la période :")] },
    { label: "Calcul", sousQuestion: "d", fragments: [latex(egaliteSansRepetition([`f_{req} = \\dfrac{1}{T}`, `\\dfrac{1}{${T}}`, formatFrequenceLatex(exercice)]))] },
    developpee
      ? { label: "Méthode", sousQuestion: "e", fragments: [texte("Le déphasage φ est la constante ajoutée dans l'argument écrit "), latex("\\omega x + \\varphi"), texte(".")] }
      : { label: "Méthode", sousQuestion: "e", fragments: [texte("On développe l'argument : "), latex("\\omega(x - \\Phi) = \\omega x - \\omega\\Phi"), texte(", donc "), latex("\\varphi = -\\omega\\cdot\\Phi"), texte(" :")] },
    ...(developpee ? [] : [{ label: "Calcul", sousQuestion: "e", fragments: [latex(`\\varphi = -${entreParentheses(omega)}\\cdot ${entreParentheses(Phi)} = ${phase}`)] }]),
    conclusion("dephasage"),
    developpee
      ? { label: "Méthode", sousQuestion: "f", fragments: [texte("Le décalage horizontal se déduit du déphasage et de la pulsation :")] }
      : { label: "Méthode", sousQuestion: "f", fragments: [texte("Le décalage horizontal Φ est la valeur soustraite à x dans l'argument écrit "), latex("\\omega(x - \\Phi)"), texte(".")] },
    ...(developpee ? [{ label: "Calcul", sousQuestion: "f", fragments: [latex(`\\Phi = -\\dfrac{\\varphi}{\\omega} = -\\dfrac{${phase}}{${omega}} = ${Phi}`)] }] : []),
    conclusion("phi"),
    developpee
      ? { label: "Piège", sousQuestion: "f", fragments: [texte("Ne pas confondre le déphasage φ (constante de l'argument) et le décalage horizontal Φ : pour passer de l'un à l'autre, on divise par ω ET on change le signe.")] }
      : { label: "Piège", sousQuestion: "f", fragments: [texte("Le signe se lit dans l'écriture x − Φ : une parenthèse « x + k » correspond à Φ = −k.")] },
    { label: "Méthode", sousQuestion: "g", fragments: [texte("Le décalage vertical est le terme constant ajouté après le sinus, avec son signe.")] },
    conclusion("decalage"),
  ];
  return etapes;
}

/** Poids par étape (somme 4) : déphasage et décalage horizontal demandent un calcul, les autres une lecture. */
const POIDS: Record<PhaseParametresSinusoide, number> = { amplitude: 0.5, pulsation: 0.5, periode: 0.5, frequence: 0.5, dephasage: 0.75, phi: 0.75, decalage: 0.5 };

function baremeParametresSinusoide(exercice: ExerciceParametresSinusoide): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Période calculée avec la mauvaise formule ("), latex("T = \\dfrac{\\omega}{2\\pi}"), texte(" ou "), latex("T = 2\\pi\\omega"), texte(")")], cout: "0 pt sur c), suite notée sans double pénalité" },
    { description: [texte("Déphasage φ et décalage horizontal Φ confondus")], cout: "0 pt sur e) ou sur f)" },
  ];
  if (exercice.A.signe < 0) erreurs.unshift({ description: [texte("Amplitude donnée avec son signe (coefficient négatif recopié)")], cout: "0 pt sur a)" });
  if (exercice.forme === "prefactorisee") erreurs.push({ description: [texte("Signe de Φ inversé (lu tel qu'écrit dans la parenthèse)")], cout: "0 pt sur f)" });
  if (exercice.b < 0) erreurs.push({ description: [texte("Décalage vertical pris en valeur absolue")], cout: "0 pt sur g)" });
  return {
    reponseFinale: listeParametres(exercice),
    criteres: ORDRE_PHASES_SINUSOIDE.map((champ) => ({ sousQuestion: LETTRE[champ], critere: [latex(formatChampParametreLatex(exercice, champ))], points: POIDS[champ] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Décalage horizontal à une période près : "), latex("\\Phi + kT")],
      [texte("Déphasage à "), latex("2\\pi"), texte(" près : "), latex("\\varphi + 2k\\pi")],
      [texte("Valeurs arrondies au centième")],
    ],
  };
}

/** ★★ : forme développée (lecture directe de ω et φ) ; ★★★ : forme pré-factorisée (développer pour φ,
 * signe de Φ à lire dans la parenthèse). */
function difficulteParametresSinusoide(exercice: ExerciceParametresSinusoide): 1 | 2 | 3 {
  return exercice.forme === "prefactorisee" ? 3 : 2;
}

export const adaptateurEvaluationParametresSinusoide: AdaptateurFeuilleExercices<ExerciceParametresSinusoide> = {
  profilInstance: profilParametresSinusoide,
  parametresAuChoix: PARAMETRES_SINUSOIDE,
  titreDocument: "Paramètres d'une fonction sinusoïdale — Évaluation",
  nomFichierBase: "parametres-sinusoide",
  genererInstance: genererExerciceParametresSinusoide,
  catalogueVariantes: CATALOGUE_FORMES,
  genererInstanceAvecVariante: (id) => construireAvecFormeId(id as FormeAffichageSinusoide),
  construireEnonce: construireEnonceParametresSinusoide,
  construireCorrection: construireCorrectionParametresSinusoide,
  difficulte: difficulteParametresSinusoide,
  reponseBreve: reponseBreveParametresSinusoide,
  correctionDetaillee: correctionDetailleeParametresSinusoide,
  bareme: baremeParametresSinusoide,
  enoncePapier: enoncePapierParametresSinusoide,
  dureeMinutes: 6,
};
