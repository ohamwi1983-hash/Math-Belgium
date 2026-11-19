import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceEquationParametre } from "../../core/equationParametre.types";
import { deltaLatex, discussionJuste, equationLatex } from "../../ui/formatEquationParametre";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquationParametre, racineDouble } from "./index";
import { profilEquationParametre } from "./profil";
import { correctionDetailleeEquationParametre } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { nombreLatex } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen115 (équation à paramètre m). Énoncé papier :
 * l'équation et la consigne de discussion ; les quatre écrans (Δ(m), racine double, signe de Δ(m),
 * discussion) sont des étapes d'apprentissage, qui vont dans le corrigé.
 */

type E = ExerciceEquationParametre;

const CONSIGNE_PAPIER = "m est un nombre réel. Discute, selon les valeurs de m, le nombre de solutions de l'équation (E), d'inconnue x. Pour chaque valeur de m qui donne une racine double, calcule cette racine.";

function entete(e: E): FragmentConsigne[] {
  return [texte(CONSIGNE_PAPIER + " "), latex(`{(E)\\ :\\ ${equationLatex(e)}}`)];
}

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: entete(e),
    questions: [
      [texte("Calcule le discriminant "), latex("\\Delta(m)"), texte(" de (E).")],
      [texte("Résous "), latex("\\Delta(m)=0"), texte(" et donne la racine double de (E) pour chaque valeur de m trouvée.")],
      [texte("Étudie le signe de "), latex("\\Delta(m)"), texte(".")],
      [texte("Discute le nombre de solutions de (E) selon m.")],
    ].map((consigne) => ({ consigne: consigne as FragmentConsigne[] })),
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [latex(`\\Delta(m)=${deltaLatex(e)}`), texte(" ; racine double "), latex(`x=${nombreLatex(racineDouble(e, e.m1))}`), texte(" pour "), latex(`m=${nombreLatex(e.m1)}`), texte(", "), latex(`x=${nombreLatex(racineDouble(e, e.m2))}`), texte(" pour "), latex(`m=${nombreLatex(e.m2)}`), texte(" ; "), ...discussionJuste(e)];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: entete(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Δ(m) correctement développé et réduit")], points: 1 },
      { sousQuestion: "b", critere: [texte("Valeurs de m annulant Δ(m) et racines doubles")], points: 1.25 },
      { sousQuestion: "c", critere: [texte("Signe de Δ(m) selon m")], points: 0.75 },
      { sousQuestion: "d", critere: [texte(e.variante === "a-egal-m" ? "Discussion complète, cas m = 0 compris" : "Discussion complète (trois cas)")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Carré de b(m) sans double produit, ou 4ac non soustrait en entier")], cout: "0 pt sur l'étape 1" },
      { description: [texte("Zones « deux solutions » et « aucune solution » inversées")], cout: "−1" },
      ...(e.variante === "a-egal-m" ? [{ description: [texte("Cas m = 0 (équation du premier degré) oublié")], cout: "−0,5" }] : []),
    ],
    reponsesAcceptees: [[texte("Δ(m) laissé sous forme factorisée, s'il est juste ; tableau de signes de Δ(m) à la place de la phrase")]],
  };
}

/** Niveau : quatre étapes ; méthode 1 (procédure du cours, discriminant puis signe) ; piège dans les
 * données : a = m (le cas m = 0 sort du second degré). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeEquationParametre(e)), methode: 1, piege: e.variante === "a-egal-m" ? 1 : 0 };
}

export const adaptateurEvaluationEquationParametre: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilEquationParametre,
  titreDocument: "Équation à paramètre m — Évaluation",
  nomFichierBase: "equation-parametre",
  genererInstance: genererExerciceEquationParametre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeEquationParametre,
  bareme,
  enoncePapier,
};
