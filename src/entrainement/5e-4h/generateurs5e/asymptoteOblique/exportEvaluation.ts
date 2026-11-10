import type { ExerciceAsymptoteOblique } from "../../core5e/asymptoteOblique.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consignePhase, formatFormulePhaseLatex, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex, texteAideNiveau1 } from "../../ui5e/formatAsymptoteOblique";
import { ordreComplet, type PhaseAsymptoteOblique } from "../../moteur5e/typesAsymptoteOblique";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceAsymptoteOblique } from "./index";
import { LIBELLE_CAS_ASYMPTOTE_OBLIQUE, PARAMETRES_ASYMPTOTE_OBLIQUE, profilAsymptoteOblique } from "../profilsEvaluationLimites20-21";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAsymptoteOblique>` pour 5gen21 (Asymptote
 * oblique) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale « Détermine l'équation de l'asymptote oblique
 * de f », qui précise la technique de la variante (division euclidienne, ou calcul de a et b par
 * les limites) — la variante est le choix du professeur. Les 3 écrans du générateur (division /
 * forme développée / conclusion, ou a / b / conclusion) passent dans le corrigé (« Étape n —
 * consigne », phases de `ordreComplet`, mêmes consignes que l'écran).
 *
 * Valeurs : `formatReponseAttenduePhaseLatex` (réponses attendues de l'écran), `formatFormulePhaseLatex`
 * et `texteAideNiveau1` (méthodes) — jamais recalculées ici.
 *
 * `regroupable` : non — l'énoncé papier porte une consigne propre à la variante, et le chemin
 * regroupé du pipeline n'utilise pas `enoncePapier` (il prendrait la première étape comme consigne).
 */

const LETTRES = "abcdefgh";

function fragmentsRiches(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau)))
    .filter((f) => f.valeur !== "");
}

function fonctionLatex(exercice: ExerciceAsymptoteOblique): string {
  return `f(x) = ${formatTermesDonneesLatex(exercice)[0]}`;
}

/** Consigne d'étape = celle de l'écran, avec le vrai signe moins et sans formule tapée au clavier. */
function consigneEtape(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): FragmentConsigne[] {
  if (phase === "ecrireFormeDeveloppee") return [texte("Écris f(x) sous la forme "), latex("Q(x)+\\dfrac{R(x)}{D(x)}"), texte(".")];
  return [texte(consignePhase(exercice, phase).replace(/-/g, "−"))];
}

function construireEnonceAsymptoteOblique(exercice: ExerciceAsymptoteOblique): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(fonctionLatex(exercice)), texte(".")],
    questions: ordreComplet(exercice).map((phase) => ({ consigne: consigneEtape(exercice, phase) })),
  };
}

function enoncePapierAsymptoteOblique(exercice: ExerciceAsymptoteOblique): EnoncePapier {
  const consigne: FragmentConsigne[] =
    exercice.variante === "divisionEuclidienne"
      ? [texte("À l'aide de la division euclidienne, détermine l'équation de l'asymptote oblique de f. Justifie ta démarche.")]
      : [
          texte("En calculant "),
          latex("a=\\lim_{x\\to\\pm\\infty}\\dfrac{f(x)}{x}"),
          texte(" puis "),
          latex("b=\\lim_{x\\to\\pm\\infty}\\left[f(x)-ax\\right]"),
          texte(", détermine l'équation de l'asymptote oblique de f. Justifie ta démarche."),
        ];
  return {
    section: { enteteFragments: [texte("On considère la fonction "), latex(fonctionLatex(exercice)), texte(".")], questions: [{ consigne }] },
    etapesParQuestion: [ordreComplet(exercice).map((_, i) => LETTRES[i])],
  };
}

function equationLatex(exercice: ExerciceAsymptoteOblique): string {
  return formatReponseAttenduePhaseLatex(exercice, "conclureEquationAsymptote")[0];
}

function reponseBreveAsymptoteOblique(exercice: ExerciceAsymptoteOblique): FragmentConsigne[] {
  return [latex(equationLatex(exercice))];
}

function methode(phase: PhaseAsymptoteOblique): FragmentConsigne[] {
  const aide = texteAideNiveau1(phase);
  return [...fragmentsRiches(aide.texte), ...(aide.latex ? [texte(" "), latex(aide.latex)] : [])];
}

function correctionDetailleeAsymptoteOblique(exercice: ExerciceAsymptoteOblique): EtapeCorrection[] {
  const division = exercice.variante === "divisionEuclidienne";
  const conclusion: EtapeCorrection[] = [
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: division
        ? [texte("Quand x tend vers ±∞, le reste divisé par le dénominateur tend vers 0 : la courbe se rapproche de la droite "), latex(equationLatex(exercice)), texte(".")]
        : [texte("Avec a et b trouvés, l'asymptote oblique est la droite "), latex(equationLatex(exercice)), texte(".")],
    },
    {
      label: "Piège",
      sousQuestion: division ? "c" : "b",
      fragments: division
        ? [texte("L'asymptote est le quotient seul : le reste disparaît à la limite, il ne figure jamais dans l'équation.")]
        : [texte("b se calcule avec "), latex("f(x)-ax"), texte(", pas avec f(x) seule : sinon la limite est infinie.")],
    },
  ];
  if (exercice.variante === "divisionEuclidienne") {
    const [quotient, reste] = formatReponseAttenduePhaseLatex(exercice, "diviserEuclidienne");
    return [
      { label: "Méthode", sousQuestion: "a", fragments: methode("diviserEuclidienne") },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(quotient), texte(" et "), latex(reste), texte(".")] },
      { label: "Calcul", sousQuestion: "b", fragments: [latex(`f(x)${formatReponseAttenduePhaseLatex(exercice, "ecrireFormeDeveloppee")[0]}`), texte(".")] },
      ...conclusion,
    ];
  }
  return parEtape([
    { label: "Méthode", sousQuestion: "a", fragments: [latex(formatFormulePhaseLatex("calculerCoefficientA")), texte(" : rapport des coefficients dominants du numérateur et de x fois le dénominateur.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(formatReponseAttenduePhaseLatex(exercice, "calculerCoefficientA")[0]), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [latex(formatFormulePhaseLatex("calculerCoefficientB")), texte(" : on réduit au même dénominateur, puis on compare les termes dominants.")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(formatReponseAttenduePhaseLatex(exercice, "calculerCoefficientB")[0]), texte(".")] },
    ...conclusion,
  ]);
}

/** Lignes dans l'ordre des étapes (une ligne « Piège » se lit sous l'étape qu'elle concerne). */
function parEtape(lignes: EtapeCorrection[]): EtapeCorrection[] {
  return lignes.map((l, i) => ({ l, i })).sort((x, y) => (x.l.sousQuestion ?? "a").localeCompare(y.l.sousQuestion ?? "a") || x.i - y.i).map(({ l }) => l);
}

function baremeAsymptoteOblique(exercice: ExerciceAsymptoteOblique): BaremeExercice {
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  const criteres =
    exercice.variante === "divisionEuclidienne"
      ? [c("a", "Division euclidienne : quotient et reste corrects", 2), c("b", "f(x) écrite comme quotient + reste / dénominateur", 1), c("c", "Équation de l'asymptote oblique (le quotient seul)", 1)]
      : [c("a", "Coefficient a (limite de f(x)/x)", 1.5), c("b", "Coefficient b (limite de f(x) − ax)", 1.5), c("c", "Équation de l'asymptote oblique", 1)];
  return {
    reponseFinale: reponseBreveAsymptoteOblique(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte("Inclure le reste dans l'équation de l'asymptote")], cout: "0 pt sur l'équation" },
      exercice.variante === "divisionEuclidienne"
        ? { description: [texte("Erreur de signe pendant la division (soustraction d'un terme négatif)")], cout: "−1" }
        : { description: [texte("Calculer b comme la limite de f(x) au lieu de f(x) − ax")], cout: "0 pt sur b" },
    ],
    reponsesAcceptees: [[texte("Équation écrite y = ax + b sous une forme équivalente (termes dans un autre ordre)")]],
  };
}

function difficulteAsymptoteOblique(exercice: ExerciceAsymptoteOblique): 1 | 2 | 3 {
  return exercice.coeffsD.length - 1 === 2 ? 3 : 2;
}

/** Ancien corrigé (repli, documents Word) : les étapes du corrigé détaillé, en paragraphes. */
function construireCorrectionAsymptoteOblique(exercice: ExerciceAsymptoteOblique): BlocCorrection[] {
  return correctionDetailleeAsymptoteOblique(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationAsymptoteOblique: AdaptateurFeuilleExercices<ExerciceAsymptoteOblique> = {
  titreDocument: "Asymptote oblique — Évaluation",
  nomFichierBase: "asymptote-oblique",
  genererInstance: genererExerciceAsymptoteOblique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceAsymptoteOblique,
  construireCorrection: construireCorrectionAsymptoteOblique,
  difficulte: difficulteAsymptoteOblique,
  reponseBreve: reponseBreveAsymptoteOblique,
  correctionDetaillee: correctionDetailleeAsymptoteOblique,
  bareme: baremeAsymptoteOblique,
  enoncePapier: enoncePapierAsymptoteOblique,
  dureeMinutes: 8,
  profilInstance: profilAsymptoteOblique,
  parametresAuChoix: PARAMETRES_ASYMPTOTE_OBLIQUE,
  libelleCasParticulier: LIBELLE_CAS_ASYMPTOTE_OBLIQUE,
};
