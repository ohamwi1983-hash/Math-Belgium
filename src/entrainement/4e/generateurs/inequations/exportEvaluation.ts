import type { ExerciceInequation } from "../../core/inequation.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEquationAssocieeLatex, formatInequationLatex } from "../../ui/formatInequation";
import { formatSolutionEnsemble } from "../../ui/formatSolutionEnsemble";
import { enonceSimplifie, facteurCommun, necessiteSimplification } from "../../moteur/simplificationInequation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequation, type VarianteInequationId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequation>` pour gen2 (Tableau de signes d'un
 * trinôme du second degré) — feuille d'évaluation, voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * Mirroir fidèle des étapes écran (`AppInequation.tsx`, `moteur/sessionInequation.ts`), PAS une
 * condensation en une seule question comme pour d'autres générateurs (ex.
 * `generateurs6e/inequationsExponentielles/exportEvaluation.ts`) : les 4 étapes interactives
 * (simplification conditionnelle → racines → signe de a → ensemble-solution) sont vraiment 4
 * moments de raisonnement distincts, chacun noté séparément côté écran
 * (`ResultatPanelInequation.tsx`), donc chacun devient sa propre question lettrée sur la copie.
 *
 * La question "simplification" n'existe QUE si `necessiteSimplification(instance.enonce)` est
 * vraie — exactement la même condition que côté écran (`phaseInitiale`, sessionInequation.ts) : le
 * nombre de questions (3 ou 4) varie donc d'une instance à l'autre, ce qui est fidèle au
 * comportement interactif (l'étape n'est simplement jamais montrée à l'élève quand le trinôme est
 * déjà réduit). C'est aussi pourquoi `regroupable` reste absent ci-dessous : ni un nombre fixe de
 * questions, ni une consigne indépendante de l'instance (l'énoncé du trinôme figure dans chaque
 * consigne via `latex(...)`).
 *
 * Les 3 dernières questions travaillent toujours sur les coefficients ORIGINAUX de l'instance
 * (`instance.enonce`, jamais la forme simplifiée) : diviser par le pgcd POSITIF (la forme
 * resynthétisée en correction a)) ne change ni le signe de a, ni Δ, ni les racines, ni
 * l'ensemble-solution (voir simplificationInequation.ts::exerciceSimplifie) — utiliser la forme
 * d'origine partout ailleurs que dans la question de simplification elle-même est donc
 * mathématiquement équivalent à ce qui se passe côté écran (où `exerciceCourant` bascule sur la
 * forme réduite), sans avoir à dupliquer une seconde forme d'énoncé dans chaque question.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance (`delta`, `racines`,
 * `enonce.a`, `solution`) — jamais re-dérivée indépendamment (voir classification.ts, "ne pas
 * re-dériver cette logique de tête"). `formatSolutionEnsemble` est la même fonction que celle
 * utilisée par `ResultatPanelInequation.tsx` pour révéler la réponse attendue après un échec.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Ce que l'on cherche concrètement selon le symbole de l'inéquation — jamais une redérivation de
 * l'ensemble-solution lui-même (toujours `formatSolutionEnsemble(instance.solution)`, trusted),
 * seulement la façon de le présenter dans la phrase de conclusion. */
function descriptionSymbole(symbole: ExerciceInequation["symbole"]): string {
  switch (symbole) {
    case "<":
      return "strictement négatif";
    case ">":
      return "strictement positif";
    case "≤":
      return "négatif ou nul";
    case "≥":
      return "positif ou nul";
  }
}

/** Nombre de lignes laissées à l'élève — assez généreux pour une résolution rédigée complète. */
function nombreLignesReponse(nombreParagraphes: number): number {
  return Math.max(10, nombreParagraphes * 2 + 2);
}

function construireEnonceInequations(instance: ExerciceInequation): SectionExercice {
  const { enonce, symbole } = instance;
  const nombreParagraphes = construireParagraphesResolution(instance).length;
  return {
    enteteFragments: [
      texte("Résous l'inéquation suivante. Indique et justifie toutes les étapes de ta démarche : "),
      latex(formatInequationLatex(enonce, symbole)),
    ],
    questions: [
      {
        consigne: [texte("Développe ici ta résolution complète, étape par étape.")],
        reponse: { type: "lignes", nombre: nombreLignesReponse(nombreParagraphes) },
      },
    ],
  };
}

/**
 * Résolution rédigée et justifiée, un seul exercice ouvert sur la copie — jamais de sous-questions
 * a)/b)/c)/d) comme avant : chaque paragraphe reprend le même enchaînement logique (simplification
 * éventuelle → étude du signe via l'équation associée → conclusion), mais justifié comme un manuel
 * scolaire le ferait plutôt qu'une suite de réponses brèves à des questions fermées. Toutes les
 * valeurs utilisées (delta, racines, a, solution) sont déjà connues sur l'instance — jamais
 * recalculées indépendamment, voir le commentaire de tête.
 */
function construireParagraphesResolution(instance: ExerciceInequation): FragmentConsigne[][] {
  const { enonce, symbole, delta, racines, solution } = instance;
  const besoinSimplification = necessiteSimplification(instance);
  const paragraphes: FragmentConsigne[][] = [];

  // Équation/discriminant effectivement utilisés pour la suite de la résolution — la forme
  // SIMPLIFIÉE une fois la simplification faite (jamais un retour silencieux aux coefficients
  // d'origine, qui serait mathématiquement correct — a, Δ, racines et S sont invariants par
  // multiplication par un réel positif — mais illisible dans une résolution rédigée continue).
  // Racines inchangées par construction ; Δ divisé par g² (même mise à l'échelle que a, b, c).
  let enonceEffectif = enonce;
  let deltaEffectif = delta;
  if (besoinSimplification) {
    const g = facteurCommun(enonce);
    const simplifiee = enonceSimplifie(enonce);
    paragraphes.push([
      texte(
        `Le plus grand commun diviseur de |a|, |b| et |c| vaut ${g}. En divisant les deux membres par ${g} (un nombre positif, le sens de l'inégalité ne change donc pas), on obtient l'inéquation équivalente `,
      ),
      latex(formatInequationLatex(simplifiee, symbole)),
      texte("."),
    ]);
    enonceEffectif = simplifiee;
    deltaEffectif = delta / (g * g);
  }

  paragraphes.push([
    texte("Pour étudier le signe du trinôme, on résout d'abord l'équation associée "),
    latex(formatEquationAssocieeLatex(enonceEffectif)),
    texte(" : "),
  ]);

  const aPositif = enonceEffectif.a > 0;
  const signeA = aPositif ? "positif" : "négatif";

  if (deltaEffectif < 0) {
    paragraphes.push([
      texte(
        `son discriminant vaut Δ = ${formatNombre(deltaEffectif)} < 0, donc elle n'a aucune solution réelle. Le trinôme garde alors un signe constant sur ℝ tout entier : celui de a. Comme a = ${formatNombre(enonceEffectif.a)} est ${signeA}, le trinôme est toujours ${signeA}.`,
      ),
    ]);
  } else {
    // Racines toujours inchangées par la simplification (diviser l'équation par un réel positif
    // ne déplace aucun zéro) — jamais recalculées, toujours `instance.racines`.
    const [r1, r2] = [...(racines as [number, number])].sort((x, y) => x - y);
    if (r1 === r2) {
      paragraphes.push([
        texte(
          `son discriminant vaut Δ = 0, donc elle admet une solution double x = ${formatNombre(r1)}. Le trinôme s'annule uniquement en ce point et garde, partout ailleurs, le signe de a. Comme a = ${formatNombre(enonceEffectif.a)} est ${signeA}, le trinôme est ${signeA} sur ℝ \\ {${formatNombre(r1)}}, et nul en x = ${formatNombre(r1)}.`,
        ),
      ]);
    } else {
      paragraphes.push([
        texte(
          `son discriminant vaut Δ = ${formatNombre(deltaEffectif)} > 0, donc elle admet deux solutions distinctes, x = ${formatNombre(r1)} et x = ${formatNombre(r2)}. Un trinôme du second degré est du signe de a à l'extérieur de ses racines, et du signe opposé à a entre ses racines. Comme a = ${formatNombre(enonceEffectif.a)} est ${signeA}, le trinôme est donc ${signeA} pour x < ${formatNombre(r1)} ou x > ${formatNombre(r2)}, et ${aPositif ? "négatif" : "positif"} pour ${formatNombre(r1)} < x < ${formatNombre(r2)}.`,
        ),
      ]);
    }
  }

  paragraphes.push([
    texte(
      `On cherche les valeurs de x pour lesquelles le trinôme est ${descriptionSymbole(symbole)}. L'ensemble des solutions de l'inéquation est donc `,
    ),
    latex(`S = ${formatSolutionEnsemble(solution)}`),
    texte("."),
  ]);

  return paragraphes;
}

function construireCorrectionInequations(instance: ExerciceInequation): BlocCorrection[] {
  return construireParagraphesResolution(instance).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationInequations: AdaptateurFeuilleExercices<ExerciceInequation> = {
  titreDocument: "Tableau de signes d'un trinôme du second degré — Évaluation",
  nomFichierBase: "tableau-signes-trinome",
  genererInstance: genererExerciceInequation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteInequationId),
  construireEnonce: construireEnonceInequations,
  construireCorrection: construireCorrectionInequations,
};
