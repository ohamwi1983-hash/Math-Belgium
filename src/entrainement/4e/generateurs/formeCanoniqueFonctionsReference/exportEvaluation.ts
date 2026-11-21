import type { ExerciceFormeCanoniqueFonctionReference, FamilleReference } from "../../core/formeCanoniqueFonctionsReference.types";
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
import { cibleFinale } from "../../moteur/verificationFormeCanoniqueFonctionsReference";
import {
  formatCibleLatex,
  formatFormeDepartLatex,
} from "../../ui/formatFormeCanoniqueFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecFamille, genererExerciceFormeCanoniqueFonctionReference } from "./index";
import { correctionDetailleeFormeCanoniqueFonctionsReference } from "./corrigeDetaille";
import { profilFormeCanonique, PARAMETRES_FORME_CANONIQUE } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormeCanoniqueFonctionReference>` pour gen11
 * (Transformer une fonction de référence — forme canonique et transformations, chapitre 3,
 * `AppFormeCanoniqueFonctionsReference.tsx`) — feuille d'exercices et évaluation.
 *
 * Énoncé papier = l'énoncé (la forme de départ) et la consigne globale de l'appli (« détermine la
 * forme canonique ») — voir `.claude/rules/feuilles-evaluations.md`. Les 6 écrans du générateur
 * (reconnaissance de la famille → forme canonique → EH/CH/SOY → TH → EV/CV/SOX → TV) sont des
 * étapes d'apprentissage : la reconnaissance et la simplification passent dans le corrigé, et les
 * transformations (curseurs) y sont données comme UNE décomposition possible — sur papier elles
 * ne sont pas demandées, parce qu'elles ne sont pas uniques (pour le carré ou la valeur absolue, un
 * étirement vertical et une compression horizontale donnent la même courbe).
 *
 * Une seule question par instance et consigne GÉNÉRIQUE (aucune valeur tirée), sans `enteteHtml` :
 * regroupable a), b), c) (`export/regroupementsPapier.ts` : plusieurs fonctions sous une même question a) b) c) en évaluation).
 *
 * Toutes les valeurs viennent des fonctions de l'écran : `cibleFinale`/`formatCibleLatex`
 * (réponse attendue), `formatFormeDepartLatex` (énoncé), `formatGabaritLatex` (décomposition en
 * transformations) ; seuls les calculs intermédiaires du corrigé (p, quotient/reste) sont
 * recalculés depuis `formeDepart`, par les mêmes formules que `cibleEtape1`.
 */

const CONSIGNE_GENERALE = "Détermine la forme canonique de la fonction (fonction de référence transformée).";

/** Formule en `\\displaystyle` : sur papier, une fraction en ligne (`\\frac` en style texte) est
 * illisible, surtout imbriquée (forme de départ de l'inverse). */
function formule(expression: string): FragmentConsigne {
  return latex(`\\displaystyle ${expression}`);
}

// ---------------------------------------------------------------------------------------------
// Briques LaTeX du corrigé
// ---------------------------------------------------------------------------------------------

/** Méthode de simplification de la famille (corrigé). */
function methode(exercice: ExerciceFormeCanoniqueFonctionReference): FragmentConsigne[] {
  switch (exercice.formeDepart.type) {
    case "carre":
      return [texte("Compléter le carré : mettre le coefficient de x² en évidence dans les termes en x, puis utiliser "), latex("x^2 + 2kx = (x + k)^2 - k^2"), texte(".")];
    case "inverse":
      return [texte("Diviser : écrire le numérateur à l'aide du dénominateur, séparer la fraction en deux termes, puis mettre le coefficient de x en évidence au dénominateur.")];
    case "cube":
      return [texte("Mettre le coefficient de x en évidence à l'intérieur du cube, puis le faire sortir au cube : "), latex("(b\\cdot u)^3 = b^3\\cdot u^3"), texte(".")];
    case "racine_carree":
    case "racine_cubique":
      return [texte("Mettre le coefficient de x en évidence sous la racine pour faire apparaître x − p ; ce coefficient reste sous la racine.")];
    case "valeur_absolue":
      return [texte("Mettre le coefficient de x en évidence dans la valeur absolue, puis le faire sortir en valeur absolue : "), latex("|a\\cdot u| = |a|\\cdot|u|"), texte(".")];
  }
}

function formeCanoniqueLatex(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  return formatCibleLatex(exercice.famille, cibleFinale(exercice));
}

// ---------------------------------------------------------------------------------------------
// Champs de l'adaptateur
// ---------------------------------------------------------------------------------------------

function construireEnonceFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), formule(formatFormeDepartLatex(exercice)), texte(".")],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
  };
}

/** Énoncé papier : déjà l'énoncé et la consigne globale (une seule question, sans étape). */
function enoncePapierFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): EnoncePapier {
  return { section: construireEnonceFormeCanoniqueFonctionsReference(exercice), etapesParQuestion: [["a"]] };
}

function construireCorrectionFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): BlocCorrection[] {
  const libelleFamille = CATALOGUE_VARIANTES.find((variante) => variante.id === exercice.famille)?.label ?? exercice.famille;
  return [
    { type: "paragraphe", fragments: [texte(`Fonction de référence reconnue : ${libelleFamille}.`)] },
    { type: "paragraphe", fragments: [texte("Forme canonique : "), formule(formeCanoniqueLatex(exercice))] },
  ];
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceFormeCanoniqueFonctionReference): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeFormeCanoniqueFonctionsReference(e)), methode: 0, piege: 1 };
}

function reponseBreveFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): FragmentConsigne[] {
  return [formule(formeCanoniqueLatex(exercice))];
}

function erreursFrequentes(exercice: ExerciceFormeCanoniqueFonctionReference): ErreurFrequente[] {
  const erreurs: ErreurFrequente[] = [{ description: [texte("Signe de p inversé (x + p au lieu de x − p)")], cout: "−1" }];
  switch (exercice.formeDepart.type) {
    case "carre":
      erreurs.push({ description: [texte("Terme −p² non multiplié par le coefficient mis en évidence")], cout: "−1" });
      break;
    case "inverse":
      erreurs.push({ description: [texte("Quotient et reste de la division confondus")], cout: "−2" });
      break;
    case "cube":
      erreurs.push({ description: [texte("Coefficient sorti du cube sans être élevé au cube")], cout: "−1" });
      break;
    case "racine_carree":
    case "racine_cubique":
      erreurs.push({ description: [texte("Coefficient sorti de la racine")], cout: "−1" });
      break;
    case "valeur_absolue":
      erreurs.push({ description: [texte("Coefficient négatif sorti de la valeur absolue avec son signe")], cout: "−1" });
      break;
  }
  return erreurs;
}

function baremeFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): BaremeExercice {
  return {
    reponseFinale: [formule(formeCanoniqueLatex(exercice))],
    criteres: [
      { critere: [texte("Reconnaît la fonction de référence")], points: 0.5 },
      { critere: methode(exercice), points: 1 },
      { critere: [texte("Valeur de p correcte, signe compris (point caractéristique en x = p)")], points: 1 },
      { critere: [texte("Coefficient et terme constant corrects")], points: 1 },
      { critere: [texte("Forme canonique finale correctement écrite")], points: 0.5 },
    ],
    erreursFrequentes: erreursFrequentes(exercice),
    reponsesAcceptees: [[texte("Coefficient écrit sous une autre forme exacte (fraction non réduite, décimal exact)")], [texte("Transformations correctes décrites en plus (non exigées)")]],
  };
}

export const adaptateurEvaluationFormeCanoniqueFonctionsReference: AdaptateurFeuilleExercices<ExerciceFormeCanoniqueFonctionReference> = {
  profilInstance: profilFormeCanonique,
  parametresAuChoix: PARAMETRES_FORME_CANONIQUE,
  titreDocument: "Transformer une fonction de référence — forme canonique — Évaluation",
  nomFichierBase: "forme-canonique-fonctions-reference",
  genererInstance: genererExerciceFormeCanoniqueFonctionReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecFamille(id as FamilleReference),
  construireEnonce: construireEnonceFormeCanoniqueFonctionsReference,
  construireCorrection: construireCorrectionFormeCanoniqueFonctionsReference,
  criteresDifficulte,
  reponseBreve: reponseBreveFormeCanoniqueFonctionsReference,
  correctionDetaillee: correctionDetailleeFormeCanoniqueFonctionsReference,
  bareme: baremeFormeCanoniqueFonctionsReference,
  enoncePapier: enoncePapierFormeCanoniqueFonctionsReference,
};
