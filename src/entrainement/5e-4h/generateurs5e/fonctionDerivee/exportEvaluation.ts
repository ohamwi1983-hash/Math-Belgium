import type { AtomeDerivable, ExerciceFonctionDerivee, TypeDerivee } from "../../core5e/fonctionDerivee.types";
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
import {
  consigneEcran,
  formatFDeXLatex,
  formatReponseAttendueCalculerLatex,
  formatTermesReponseAttendueDecomposerLatex,
  LIBELLE_TYPE,
  texteAideNiveau1,
  texteReponseAttendueReconnaissance,
} from "../../ui5e/formatFonctionDerivee";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, formatDeriveeAtomeLatex, genererExerciceFonctionDerivee } from "./index";
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

function lettreCalcul(exercice: ExerciceFonctionDerivee): string {
  return aDecomposition(exercice) ? "c" : "b";
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

const JUSTIFICATION_TYPE: Record<TypeDerivee, string> = {
  reglebase: "f(x) est une somme de termes en x seul : chaque terme se dérive séparément.",
  produit: "f(x) est le produit de deux expressions en x.",
  quotient: "f(x) est le quotient de deux expressions en x.",
  composee: "f(x) est une seule expression appliquée à autre chose que x (une puissance, une racine ou un sinus/cosinus de ax + b).",
};

function lignesReconnaissance(exercice: ExerciceFonctionDerivee): EtapeCorrection[] {
  const ambigu = exercice.typesAcceptes.length > 1;
  return [
    {
      label: "Structure",
      sousQuestion: "a",
      fragments: [
        texte(`${texteReponseAttendueReconnaissance(exercice)}. `),
        texte(ambigu ? "Les deux lectures sont correctes ; on détaille la première." : JUSTIFICATION_TYPE[typePrincipal(exercice)]),
      ],
    },
  ];
}

function lignesDecomposition(exercice: ExerciceFonctionDerivee): EtapeCorrection[] {
  if (!aDecomposition(exercice)) return [];
  const plusieurs = exercice.typesAcceptes.length > 1;
  return exercice.typesAcceptes
    .map((type): EtapeCorrection | null => {
      const termes = formatTermesReponseAttendueDecomposerLatex(exercice, type);
      if (termes.length === 0) return null;
      return {
        label: "Décomposition",
        sousQuestion: "b",
        fragments: [...(plusieurs ? [texte(`Lecture « ${LIBELLE_TYPE[type]} » : `)] : []), latex(termes.join(" \\quad "))],
      };
    })
    .filter((l): l is EtapeCorrection => l !== null);
}

function deriveesFacteurs(exercice: ExerciceFonctionDerivee): [AtomeDerivable, AtomeDerivable] | null {
  if (exercice.famille === "produit") return [exercice.atome1, exercice.atome2];
  if (exercice.famille === "quotient" && !exercice.ambigu) return [exercice.atome1, exercice.atome2];
  return null;
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

function lignesCalcul(exercice: ExerciceFonctionDerivee): EtapeCorrection[] {
  const l = lettreCalcul(exercice);
  const regle = texteAideNiveau1("calculer", typePrincipal(exercice));
  const lignes: EtapeCorrection[] = [{ label: "Règle", sousQuestion: l, fragments: [texte(regle.texte), ...(regle.latex ? [texte(" "), latex(regle.latex)] : [])] }];
  const facteurs = deriveesFacteurs(exercice);
  if (facteurs) {
    lignes.push({
      label: "Calcul",
      sousQuestion: l,
      fragments: [latex(`u'(x)=${formatDeriveeAtomeLatex(facteurs[0])} \\quad v'(x)=${formatDeriveeAtomeLatex(facteurs[1])}`)],
    });
  }
  if (exercice.famille === "composee") {
    lignes.push({ label: "Calcul", sousQuestion: l, fragments: [texte("Dérivée de l'intérieure : "), latex(`u'(x)=${exercice.atome.interieurA}`), texte(".")] });
  }
  lignes.push({ label: "Piège", sousQuestion: l, fragments: [texte(piege(exercice))] });
  lignes.push({ label: "Conclusion", sousQuestion: l, fragments: [latex(formatReponseAttendueCalculerLatex(exercice))] });
  return lignes;
}

function correctionDetailleeFonctionDerivee(exercice: ExerciceFonctionDerivee): EtapeCorrection[] {
  return [...lignesReconnaissance(exercice), ...lignesDecomposition(exercice), ...lignesCalcul(exercice)];
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

function difficulteFonctionDerivee(exercice: ExerciceFonctionDerivee): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "reglebase":
      return 1;
    case "produit":
    case "composee":
      return 2;
    case "quotient":
      return 3;
  }
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
  difficulte: difficulteFonctionDerivee,
  reponseBreve: reponseBreveFonctionDerivee,
  correctionDetaillee: correctionDetailleeFonctionDerivee,
  bareme: baremeFonctionDerivee,
  enoncePapier: enoncePapierFonctionDerivee,
  dureeMinutes: 5,
  profilInstance: profilFonctionDerivee,
  regroupable: false,
};
