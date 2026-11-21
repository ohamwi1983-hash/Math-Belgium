import type { ExerciceAsymptoteOblique, ExerciceGen21, ExercicePositionAsymptote } from "../../core5e/asymptoteOblique.types";
import { estPosition } from "../../core5e/asymptoteOblique.types";
import { ORDRE_POSITION } from "../../moteur5e/sessionPositionAsymptote";
import { consignePapierFragments, consignePhaseFragments, dLatex, ecartLatex, enonceFragments, phraseCotes, phraseVerdict, pointLatex, rLatex } from "../../ui5e/formatPositionAsymptote";
import { correctionDetailleePosition, lettrePhasePosition } from "./corrigePosition";
import { fragmentsRiches } from "../../ui5e/retoursLimites";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consignePhase, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../../ui5e/formatAsymptoteOblique";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeAsymptoteOblique, lettrePhaseAsymptoteOblique } from "./corrigeDetaille";
import { ordreComplet, type PhaseAsymptoteOblique } from "../../moteur5e/typesAsymptoteOblique";
import { CATALOGUE_FAMILLES, construireGen21AvecFamilleId, genererExerciceAsymptoteOblique } from "./index";
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
 * Corrigé détaillé « comme au tableau » : `./corrigeDetaille.ts` (partagé avec `App5gen21.tsx`) ;
 * réponses attendues de l'écran (`formatReponseAttenduePhaseLatex`) pour la réponse brève et le barème.
 *
 * `regroupable` : non — l'énoncé papier porte une consigne propre à la variante, et le chemin
 * regroupé du pipeline n'utilise pas `enoncePapier` (il prendrait la première étape comme consigne).
 */

const LETTRES = "abcdefgh";

function fonctionLatex(exercice: ExerciceAsymptoteOblique): string {
  return `f(x) = ${formatTermesDonneesLatex(exercice)[0]}`;
}

/** Consigne d'étape = celle de l'écran (texte riche : polynômes en KaTeX, plus de texte brut). */
function consigneEtape(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): FragmentConsigne[] {
  return fragmentsRiches(consignePhase(exercice, phase));
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

/** Niveau 1–7 : la conclusion (le quotient, ou y = ax + b avec a et b trouvés) est un écran de
 * lecture ; la technique est imposée par la variante (méthode 0) ; aucun piège dans les données (le
 * reste à écarter est la méthode). */
function criteresDifficulteAsymptoteOblique(exercice: ExerciceAsymptoteOblique): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeAsymptoteOblique(exercice), [lettrePhaseAsymptoteOblique(exercice, "conclureEquationAsymptote")]), methode: 0, piege: 0 };
}

/** Ancien corrigé (repli, documents Word) : les étapes du corrigé détaillé, en paragraphes. */
function construireCorrectionAsymptoteOblique(exercice: ExerciceAsymptoteOblique): BlocCorrection[] {
  return correctionDetailleeAsymptoteOblique(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

// ============================================================================
// Famille « position de la courbe par rapport à son asymptote » (lots B–D).
// ============================================================================

function construireEnoncePosition(e: ExercicePositionAsymptote): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: ORDRE_POSITION.map((phase) => ({ consigne: consignePhaseFragments(e, phase) })) };
}

/** Énoncé papier : la fonction, la droite donnée, UNE consigne globale (aucune sous-question). */
function enoncePapierPosition(e: ExercicePositionAsymptote): EnoncePapier {
  return { section: { enteteFragments: enonceFragments(e), questions: [{ consigne: consignePapierFragments(e) }] }, etapesParQuestion: [ORDRE_POSITION.map((p) => lettrePhasePosition(p))] };
}

function reponseBrevePosition(e: ExercicePositionAsymptote): FragmentConsigne[] {
  const p = pointLatex(e);
  return [
    latex(`${ecartLatex(e)}=\\dfrac{${rLatex(e)}}{${dLatex(e)}}`),
    texte(" ; "),
    ...phraseVerdict(e),
    ...(p ? [texte(" Point de recoupement "), latex(p), texte(".")] : []),
    texte(" "),
    ...phraseCotes(e),
  ];
}

function baremePosition(e: ExercicePositionAsymptote): BaremeExercice {
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  return {
    reponseFinale: reponseBrevePosition(e),
    criteres: [
      c("a", "Écart f(x) − (droite) réduit au même dénominateur", 1.5),
      c("b", "Signe étudié (D(x) > 0, signe du numérateur) et position conclue", 1.5),
      c("c", "Point de recoupement (ou absence justifiée)", 0.5),
      c("d", "Côté d'approche en −∞ et en +∞", 0.5),
    ],
    erreursFrequentes: [
      { description: [texte("Oublier de distribuer le signe − sur tout le produit de la droite par D(x)")], cout: "0 pt sur a)" },
      { description: [texte("Affirmer qu'une asymptote oblique ou horizontale n'est jamais recoupée")], cout: "0 pt sur c)" },
      { description: [texte("Conclure sur le signe sans justifier que D(x) > 0 (discriminant négatif)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Numérateur écrit dans un autre ordre ; tableau de signes à la place de la rédaction")]],
  };
}

/** Niveau : écart (a), signe et verdict (b), point commun (c) sont des étapes ; le côté d'approche (d)
 * se LIT sur le signe déjà établi. Méthode 1 (l'énoncé papier ne dit pas d'étudier le signe de
 * l'écart : c'est la méthode du cours à choisir) ; aucun piège dans les données. Identique pour les
 * trois verdicts (mesuré : même niveau, même durée). */
function criteresDifficultePosition(e: ExercicePositionAsymptote): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleePosition(e), [lettrePhasePosition("cotesApproche")]), methode: 1, piege: 0 };
}

const surGen21 =
  <R,>(classique: (e: ExerciceAsymptoteOblique) => R, position: (e: ExercicePositionAsymptote) => R) =>
  (e: ExerciceGen21): R =>
    estPosition(e) ? position(e) : classique(e);

export const adaptateurEvaluationAsymptoteOblique: AdaptateurFeuilleExercices<ExerciceGen21> = {
  titreDocument: "Asymptote oblique — Évaluation",
  nomFichierBase: "asymptote-oblique",
  // Tirage libre d'AVANT les lots B–D (un ancien code libre rouvre le même exercice) ; les familles
  // « position » sont des variantes ajoutées en fin de catalogue.
  genererInstance: genererExerciceAsymptoteOblique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireGen21AvecFamilleId(id),
  construireEnonce: surGen21(construireEnonceAsymptoteOblique, construireEnoncePosition),
  construireCorrection: surGen21(construireCorrectionAsymptoteOblique, (e) => correctionDetailleePosition(e).filter((l) => l.label !== "Piège").map((l) => ({ type: "paragraphe", fragments: l.fragments }) as BlocCorrection)),
  criteresDifficulte: surGen21(criteresDifficulteAsymptoteOblique, criteresDifficultePosition),
  reponseBreve: surGen21(reponseBreveAsymptoteOblique, reponseBrevePosition),
  correctionDetaillee: surGen21(correctionDetailleeAsymptoteOblique, correctionDetailleePosition),
  bareme: surGen21(baremeAsymptoteOblique, baremePosition),
  enoncePapier: surGen21(enoncePapierAsymptoteOblique, enoncePapierPosition),
  profilInstance: profilAsymptoteOblique,
  parametresAuChoix: PARAMETRES_ASYMPTOTE_OBLIQUE,
  libelleCasParticulier: LIBELLE_CAS_ASYMPTOTE_OBLIQUE,
};
