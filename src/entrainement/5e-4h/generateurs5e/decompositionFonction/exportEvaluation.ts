import type { CoucheGeneree, ExerciceDecompositionFonction, TypeCoucheCatalogue } from "../../core5e/decompositionFonction.types";
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
import { labelLigne } from "../../ui5e/formatDecompositionFonction";
import { CATALOGUE_VARIANTES_DECOMPOSITION, construireAvecVariante, genererExerciceDecompositionFonction } from "./index";
import { profilDecompositionFonction } from "../profilsEvaluationFonctions1-2";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDecompositionFonction>` pour 5gen2 (décomposer une
 * fonction composée) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale (composée de fonctions de référence, de la plus
 * intérieure à la plus extérieure) ; le nombre de couches n'est PAS imposé (décision B de l'audit :
 * toute décomposition en fonctions de référence qui reconstitue f est acceptée). Le corrigé justifie
 * chaque couche de l'intérieur vers l'extérieur (`couches[].propreLatex`, la même décomposition que
 * la révélation de l'écran), puis recompose f.
 *
 * Catalogue = `CATALOGUE_VARIANTES_DECOMPOSITION`, le MÊME que le sélecteur de l'appli (le QR code de
 * la feuille rouvre la même instance).
 */

const LETTRES = ["g", "h", "i", "j", "k", "l", "m", "n"];

function nomCouche(couche: CoucheGeneree): string {
  if (couche.estAffineFinale) return "on multiplie le résultat précédent par un nombre puis on ajoute une constante (fonction affine)";
  const noms: Record<TypeCoucheCatalogue, string> = {
    affine: "une fonction affine",
    carre: "on élève au carré",
    cube: "on élève au cube",
    racineCarree: "on prend la racine carrée",
    racineCubique: "on prend la racine cubique",
    inverse: "on prend l'inverse",
    valeurAbsolue: "on prend la valeur absolue",
    brute: "un polynôme, gardé en une seule couche",
  };
  return noms[couche.type];
}

function entete(exercice: ExerciceDecompositionFonction): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(exercice.fLatex), texte(".")];
}

const CONSIGNE_ECRAN = "Décompose f(x) en fonctions intermédiaires, de la plus intérieure (appliquée en premier) à la plus extérieure.";

function construireEnonceDecompositionFonction(exercice: ExerciceDecompositionFonction): SectionExercice {
  return { enteteFragments: entete(exercice), questions: [{ consigne: [texte(CONSIGNE_ECRAN)] }] };
}

function enoncePapierDecompositionFonction(exercice: ExerciceDecompositionFonction): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        ...entete(exercice),
        texte(" Écris f comme une composée de fonctions simples (fonction affine, polynôme simple, puissance, racine, inverse, valeur absolue), de la plus intérieure à la plus extérieure."),
      ],
      questions: [],
    },
  };
}

function chaineComposee(n: number): string {
  return Array.from({ length: n }, (_, i) => LETTRES[n - 1 - i] ?? `f_{${n - 1 - i}}`).join(" \\circ ");
}

function reponseBreveDecompositionFonction(exercice: ExerciceDecompositionFonction): FragmentConsigne[] {
  const fr: FragmentConsigne[] = [];
  exercice.couches.forEach((couche, i) => {
    if (i > 0) fr.push(texte(" ; "));
    fr.push(latex(`${labelLigne(i)} ${couche.propreLatex}`));
  });
  fr.push(texte(" ; "), latex(`f = ${chaineComposee(exercice.couches.length)}`));
  return fr;
}

function piege(exercice: ExerciceDecompositionFonction): string {
  const derniere = exercice.couches[exercice.couches.length - 1];
  if (derniere.estAffineFinale) return "La dernière couche affine s'applique au résultat de la couche précédente, pas directement à x.";
  if (exercice.couches[0].type === "brute") return "Le polynôme intérieur forme une seule couche : il est appliqué en premier, on ne le découpe pas.";
  return "L'ordre compte : la fonction la plus intérieure est appliquée en premier, et f = h ∘ g se lit « h après g ».";
}

function correctionDetailleeDecompositionFonction(exercice: ExerciceDecompositionFonction): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("On suit le calcul de f(x) pour un x donné : chaque opération, de la première à la dernière, est une couche. Une décomposition possible :")],
    },
  ];
  exercice.couches.forEach((couche, i) => {
    lignes.push({
      label: `Couche ${i + 1}`,
      sousQuestion: "a",
      fragments: [
        texte(i === 0 ? "Appliquée en premier, à x : " : "Appliquée ensuite, au résultat précédent : "),
        texte(nomCouche(couche)),
        texte(" — "),
        latex(`${labelLigne(i)} ${couche.propreLatex}`),
        texte("."),
      ],
    });
  });
  lignes.push({
    label: "Vérification",
    sousQuestion: "a",
    fragments: [texte("En remplaçant à chaque fois x par la couche précédente, on retrouve "), latex(exercice.fLatex), texte(", donc "), latex(`f = ${chaineComposee(exercice.couches.length)}`), texte(".")],
  });
  lignes.push({ label: "Piège", sousQuestion: "a", fragments: [texte(piege(exercice))] });
  return lignes;
}

function baremeDecompositionFonction(exercice: ExerciceDecompositionFonction): BaremeExercice {
  const n = exercice.couches.length;
  const c = (texteCritere: string, points: number): CritereBareme => ({ sousQuestion: "a", critere: [texte(texteCritere)], points });
  const criteres =
    n === 2
      ? [c("Couche intérieure correcte", 1.5), c("Couche extérieure correcte", 1.5), c("La composée, dans cet ordre, reconstitue f", 1)]
      : [c("Couche la plus intérieure correcte", 1), c("Couches suivantes correctes", 2), c("Ordre d'application respecté : la composée reconstitue f", 1)];
  return {
    reponseFinale: reponseBreveDecompositionFonction(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte(piege(exercice))], cout: "−1" },
      { description: [texte("Une seule « couche » égale à f, ou une couche « x » : rien n'est décomposé")], cout: "0 pt" },
    ],
    reponsesAcceptees: [[texte("Toute décomposition en fonctions simples (affine, polynôme simple, puissance, racine, inverse, valeur absolue) qui reconstitue f, même avec un autre nombre de couches")]],
  };
}

function difficulteDecompositionFonction(exercice: ExerciceDecompositionFonction): 1 | 2 | 3 {
  const n = exercice.couches.length;
  return n <= 2 ? 1 : n === 3 ? 2 : 3;
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionDecompositionFonction(exercice: ExerciceDecompositionFonction): BlocCorrection[] {
  return correctionDetailleeDecompositionFonction(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationDecompositionFonction: AdaptateurFeuilleExercices<ExerciceDecompositionFonction> = {
  titreDocument: "Décomposer une fonction composée — Évaluation",
  nomFichierBase: "decomposition-fonction",
  genererInstance: genererExerciceDecompositionFonction,
  catalogueVariantes: CATALOGUE_VARIANTES_DECOMPOSITION,
  genererInstanceAvecVariante: (id) => construireAvecVariante(id),
  construireEnonce: construireEnonceDecompositionFonction,
  construireCorrection: construireCorrectionDecompositionFonction,
  difficulte: difficulteDecompositionFonction,
  reponseBreve: reponseBreveDecompositionFonction,
  correctionDetaillee: correctionDetailleeDecompositionFonction,
  bareme: baremeDecompositionFonction,
  enoncePapier: enoncePapierDecompositionFonction,
  dureeMinutes: 4,
  profilInstance: profilDecompositionFonction,
  regroupable: false,
};
