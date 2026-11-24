import type { AtomeDerivable, ExerciceFonctionDerivee, TypeDerivee } from "../../core5e/fonctionDerivee.types";
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
import { consigneEcran, formatFDeXLatex, formatReponseAttendueCalculerLatex } from "../../ui5e/formatFonctionDerivee";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceFonctionDerivee } from "./index";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeFonctionDerivee } from "./corrigeDetaille";
import { profilFonctionDerivee } from "../profilsEvaluationDerivees25-27";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionDerivee>` pour 5gen27 (Fonction dérivée) —
 * feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale « Calcule f'(x) ». Les écrans du générateur
 * (reconnaître la structure, décomposer — sauté pour une somme de termes —, calculer) passent dans
 * le corrigé « Étape n — consigne » (`consigneEcran`, mêmes consignes que l'écran).
 *
 * Valeurs : `texteReponseAttendueReconnaissance`, `formatTermesReponseAttendueDecomposerLatex`,
 * `formatReponseAttendueCalculerLatex` (réponses attendues de l'écran), `formatDeriveeAtomeLatex`
 * (dérivées de u et v, même formateur que la dérivée affichée), `texteAideNiveau1` (règles) —
 * jamais une dérivation recalculée ici.
 *
 * `regroupable` : non — le chemin regroupé du pipeline n'utilise pas `enoncePapier` (il prendrait la
 * première étape, « Quel type de dérivée est-ce ? », comme consigne commune).
 */


function fonctionLatex(exercice: ExerciceFonctionDerivee): string {
  return formatFDeXLatex(exercice);
}

function entete(exercice: ExerciceFonctionDerivee): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(fonctionLatex(exercice)), texte(".")];
}

/** Type retenu pour les étapes (le premier type accepté — la seconde lecture éventuelle figure
 * aussi au corrigé). */
function typePrincipal(exercice: ExerciceFonctionDerivee): TypeDerivee {
  return exercice.typesAcceptes[0];
}

function aDecomposition(exercice: ExerciceFonctionDerivee): boolean {
  return exercice.famille !== "reglebase";
}

function construireEnonceFonctionDerivee(exercice: ExerciceFonctionDerivee): SectionExercice {
  const type = typePrincipal(exercice);
  const questions = [
    { consigne: [texte("Reconnais la structure de f(x) : somme de termes (règle de base), produit, quotient ou composée.")] },
    ...(aDecomposition(exercice) ? [{ consigne: [texte(consigneEcran("decomposer", type))] }] : []),
    { consigne: [texte(consigneEcran("calculer", type))] },
  ];
  return { enteteFragments: entete(exercice), questions };
}

function enoncePapierFonctionDerivee(exercice: ExerciceFonctionDerivee): EnoncePapier {
  return { section: { enteteFragments: [...entete(exercice), texte(" Calcule sa dérivée f'(x).")], questions: [] } };
}

function reponseBreveFonctionDerivee(exercice: ExerciceFonctionDerivee): FragmentConsigne[] {
  return [latex(formatReponseAttendueCalculerLatex(exercice))];
}

function piege(exercice: ExerciceFonctionDerivee): string {
  switch (typePrincipal(exercice)) {
    case "reglebase":
      return "La dérivée de cos x est −sin x (et celle de sin x est cos x) : attention au signe ; la constante éventuelle disparaît.";
    case "produit":
      return "La dérivée d'un produit n'est pas le produit des dérivées : (uv)' = u'v + uv', jamais u'v'.";
    case "quotient":
      return "Au numérateur, l'ordre compte (u'v − uv', pas uv' − u'v) et le dénominateur est v².";
    case "composee":
      return "Ne pas oublier de multiplier par la dérivée de l'intérieure (le coefficient de x dans ax + b).";
  }
}

function baremeFonctionDerivee(exercice: ExerciceFonctionDerivee): BaremeExercice {
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  let criteres: CritereBareme[];
  switch (typePrincipal(exercice)) {
    case "reglebase":
      criteres = [c("a", "Structure reconnue (somme de termes)", 0.5), c("b", "Dérivée correcte de chaque terme", 2.5), c("b", "f'(x) complète, signes justes", 1)];
      break;
    case "produit":
    case "quotient":
      criteres = [
        c("a", "Structure reconnue", 0.5),
        c("b", "u(x) et v(x) identifiés", 1),
        c("c", "u'(x) et v'(x) corrects", 1),
        c("c", typePrincipal(exercice) === "produit" ? "Formule u'v + uv' appliquée, f'(x) correcte" : "Formule (u'v − uv')/v² appliquée, f'(x) correcte", 1.5),
      ];
      break;
    case "composee":
      criteres = [
        c("a", "Structure reconnue (composée)", 0.5),
        c("b", "Fonction intérieure et fonction extérieure identifiées", 1),
        c("c", "Dérivée de l'extérieure, évaluée en l'intérieure", 1.5),
        c("c", "Multiplication par la dérivée de l'intérieure", 1),
      ];
      break;
  }
  return {
    reponseFinale: reponseBreveFonctionDerivee(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte(piege(exercice))], cout: "−1" },
      { description: [texte("Résultat juste sans aucune étape (structure, décomposition) visible")], cout: "0 pt sur la structure et la décomposition" },
    ],
    reponsesAcceptees: [[texte("Toute écriture équivalente de f'(x) (développée, factorisée, termes dans un autre ordre)")]],
  };
}

/** Niveau 1–7 : la reconnaissance est une décision (une étape), la décomposition (b) une lecture des
 * facteurs / de l'intérieure ; méthode 0 pour une somme de termes (règles de base imposées), 1 sinon
 * (choisir la règle) ; piège dans les DONNÉES : facteur trigonométrique d'argument ax + b caché dans un
 * produit ou un quotient (règle de la chaîne en plus), ou double lecture quotient / composée. */
function criteresDifficulteFonctionDerivee(exercice: ExerciceFonctionDerivee): CriteresDifficulte {
  const lecture = exercice.famille === "reglebase" ? [] : ["b"];
  const argument = (at: AtomeDerivable) => at.noyau.type === "trig" && !(at.interieurA === 1 && at.interieurB === 0);
  const cache = (exercice.famille === "produit" || (exercice.famille === "quotient" && !exercice.ambigu)) && (argument(exercice.atome1) || argument(exercice.atome2));
  const piegeDonnees = cache || (exercice.famille === "quotient" && exercice.ambigu) ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeFonctionDerivee(exercice), lecture), methode: exercice.famille === "reglebase" ? 0 : 1, piege: piegeDonnees };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionFonctionDerivee(exercice: ExerciceFonctionDerivee): BlocCorrection[] {
  return correctionDetailleeFonctionDerivee(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationFonctionDerivee: AdaptateurFeuilleExercices<ExerciceFonctionDerivee> = {
  titreDocument: "Fonction dérivée — Évaluation",
  nomFichierBase: "fonction-derivee",
  genererInstance: genererExerciceFonctionDerivee,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceFonctionDerivee,
  construireCorrection: construireCorrectionFonctionDerivee,
  criteresDifficulte: criteresDifficulteFonctionDerivee,
  reponseBreve: reponseBreveFonctionDerivee,
  correctionDetaillee: correctionDetailleeFonctionDerivee,
  bareme: baremeFonctionDerivee,
  enoncePapier: enoncePapierFonctionDerivee,
  profilInstance: profilFonctionDerivee,
};
