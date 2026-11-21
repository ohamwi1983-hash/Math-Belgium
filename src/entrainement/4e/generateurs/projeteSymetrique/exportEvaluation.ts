import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceProjeteSymetrique } from "../../core/projeteSymetrique.types";
import { consignesEcrans, enonceFragments, figureEnonce, questionsPapier, reponseAp, reponseH, reponseI, reponseLongueur } from "../../ui/formatProjeteSymetrique";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceProjeteSymetrique } from "./index";
import { profilProjeteSymetrique } from "./profil";
import { correctionDetailleeProjeteSymetrique } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen96 « Projeté orthogonal, symétrique et
 * réflexion ». Symétrique : énoncé papier = A, d et une consigne globale (H puis A′) ; les trois
 * écrans (perpendiculaire, projeté, symétrique) deviennent les étapes a, b, c du corrigé.
 * Réflexion : contexte + figure (d, A, B — jamais A′ ni I) et DEUX vraies questions (où viser ?
 * longueur du trajet), étapes a–c sous la première, d sous la seconde.
 */

type E = ExerciceProjeteSymetrique;

function figureHtml(e: E): string | undefined {
  return e.variante === "reflexion" ? `<div class="paragraphe" style="text-align:center">${figureEnonce(e)}</div>` : undefined;
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  const qs = questionsPapier(e);
  return {
    section: { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: qs.map((consigne) => ({ consigne })) },
    etapesParQuestion: e.variante === "symetrique" ? [["a", "b", "c"]] : [["a", "b", "c"], ["d"]],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "symetrique") return [...reponseH(e), texte(" et "), ...reponseAp(e)];
  return [texte("a) "), ...reponseI(e), texte(" ; b) "), ...reponseLongueur(e)];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Niveau : une étape par écran (charge mesurée sur le corrigé : l'étape « A′ » de la réflexion
 * enchaîne perpendiculaire, pied et symétrique) ; méthode 1 (choisir les outils du cours :
 * perpendiculaire, intersection, milieu ; la loi de la réflexion est donnée dans l'énoncé) ; aucun
 * piège dans les données. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeProjeteSymetrique(e)), methode: 1, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "symetrique") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Perpendiculaire à d par A : vecteur directeur "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}"), texte(", équation")], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Projeté H : intersection de la perpendiculaire et de d")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Symétrique A′ : H milieu de [AA′]")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Vecteur directeur de d pris pour la perpendiculaire (on obtient la parallèle à d)")], cout: "0 pt sur a) ; suite corrigée sans double sanction" },
        { description: [texte("Équations paramétriques substituées dans l'équation de la perpendiculaire au lieu de celle de d")], cout: "0 pt sur b)" },
        { description: [latex("A'=2A-H"), texte(" au lieu de "), latex("A'=2H-A")], cout: "0 pt sur c)" },
      ],
      reponsesAcceptees: [[texte("Toute équation équivalente de la perpendiculaire (paramétrique, cartésienne ou explicite)")], [texte("H obtenu par résolution d'un système (combinaison ou substitution)")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Symétrique A′ de A par rapport à d (perpendiculaire, pied H, milieu)")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Équation de la droite (A′B)")], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Point d'impact I = (A′B) ∩ d")], points: 1 },
      { sousQuestion: "d", critere: [texte("Longueur du trajet : "), latex("AI+IB=A'B"), texte(", valeur exacte et unité")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Point d'impact pris égal au projeté H de A")], cout: "0 pt sur le point d'impact" },
      { description: [texte("Droite (AB) au lieu de (A′B)")], cout: "0 pt sur le point d'impact" },
      { description: [latex("A'=2A-H"), texte(" au lieu de "), latex("A'=2H-A")], cout: "−0,5 pt ; suite corrigée sans double sanction" },
      { description: [texte("Longueur AB (en ligne droite) au lieu de AI + IB")], cout: "0 pt sur la longueur" },
    ],
    reponsesAcceptees: [
      [texte("Point d'impact obtenu en visant depuis A le symétrique B′ de B (même point I)")],
      [texte("Longueur obtenue en additionnant AI et IB calculés séparément")],
    ],
  };
}

export const adaptateurEvaluationProjeteSymetrique: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilProjeteSymetrique,
  titreDocument: "Projeté orthogonal, symétrique et réflexion — Évaluation",
  nomFichierBase: "projete-symetrique-reflexion",
  genererInstance: genererExerciceProjeteSymetrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeProjeteSymetrique,
  bareme,
  enoncePapier,
};
