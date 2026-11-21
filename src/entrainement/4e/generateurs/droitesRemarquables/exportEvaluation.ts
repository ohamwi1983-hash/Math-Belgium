import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceDroitesRemarquables } from "../../core/droitesRemarquables.types";
import { consigneGlobale, ecrans, enonceFragments, reponseBreveFragments } from "../../ui/formatDroitesRemarquables";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDroitesRemarquables } from "./index";
import { correctionDetailleeDroitesRemarquables } from "./corrigeDetaille";
import { profilDroitesRemarquables } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen94 « Droites remarquables d'un triangle ».
 * Énoncé papier = le triangle + la consigne globale (qui nomme les droites demandées : ce sont les
 * étapes du raisonnement, détaillées dans le corrigé). Mêmes fonctions que l'appli.
 */

type E = ExerciceDroitesRemarquables;

const LETTRES = "abcdefgh";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: ecrans(e).map((ec) => ({ consigne: ec.consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [LETTRES.slice(0, ecrans(e).length).split("")],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

const ACCEPTE = [[texte("Toute équation équivalente (multipliée par une constante non nulle, forme explicite si elle existe)")]];

function bareme(e: E): BaremeExercice {
  if (e.variante === "mediatrices") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Médiatrice de [AB] : milieu et vecteur normal "), latex("\\vec{AB}")], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Médiatrice de [BC]")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Centre O par résolution du système")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Vecteur du côté pris comme vecteur directeur")], cout: "0 pt sur a) et b)" },
        { description: [texte("Médiatrice qui passe par un sommet au lieu du milieu")], cout: "moitié des points sur a) et b)" },
      ],
      reponsesAcceptees: ACCEPTE,
    };
  }
  if (e.variante === "hauteurs") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Hauteur issue de A : par A, vecteur normal "), latex("\\vec{BC}")], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Hauteur issue de B : par B, vecteur normal "), latex("\\vec{CA}")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Orthocentre H par résolution du système")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Côté opposé pris comme vecteur directeur")], cout: "0 pt sur a) et b)" },
        { description: [texte("Hauteur confondue avec la médiatrice (par le milieu du côté)")], cout: "0 pt sur a) et b)" },
      ],
      reponsesAcceptees: ACCEPTE,
    };
  }
  if (e.variante === "medianes") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Médiane issue de A : milieu de [BC] puis droite par A")], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Médiane issue de B")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Centre de gravité G (système, contrôlé par la moyenne des coordonnées)")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Médiane tracée vers un sommet (côté) au lieu du milieu du côté opposé")], cout: "0 pt sur a) et b)" },
        { description: [texte("G donné sans justification par les médianes (moyenne seule)")], cout: "moitié des points sur c)" },
      ],
      reponsesAcceptees: ACCEPTE,
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Longueur BC exacte")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Équation de (BC)")], points: 1 },
      { sousQuestion: "c", critere: [texte("Pied H (perpendiculaire par A, intersection)")], points: 1 },
      { sousQuestion: "d", critere: [texte("Hauteur AH exacte")], points: 0.5 },
      { sousQuestion: "e", critere: [texte("Aire = BC · AH / 2, simplifiée")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Oubli de la division par 2")], cout: "−0,5" },
      { description: [texte("Hauteur prise égale à AB ou AC")], cout: "0 pt sur c) et d)" },
    ],
    reponsesAcceptees: [...ACCEPTE, [texte("Aire obtenue par une autre base, si la démarche (distance à une droite) est complète")]],
  };
}

/** Niveau : l'élève choisit la construction de chaque droite remarquable parmi celles du cours
 * (milieu / sommet, vecteur normal / directeur) → méthode 1 ; aire : distance par la perpendiculaire,
 * méthode 1. Aucun piège dans les données. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDroitesRemarquables(e)), methode: 1, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationDroitesRemarquables: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilDroitesRemarquables,
  titreDocument: "Droites remarquables d'un triangle — Évaluation",
  nomFichierBase: "droites-remarquables-triangle",
  genererInstance: genererExerciceDroitesRemarquables,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDroitesRemarquables,
  bareme,
  enoncePapier,
};
