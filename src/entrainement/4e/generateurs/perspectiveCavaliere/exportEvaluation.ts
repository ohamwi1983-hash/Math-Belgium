import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleePerspectiveCavaliere } from "./corrigeDetaille";
import type { ExercicePerspectiveCavaliere } from "../../core/perspectiveCavaliere.types";
import {
  aretesCacheesTexte,
  consigneEtapePapier,
  consigneGlobale,
  enonce,
  figurePapierEnonce,
  nombre,
} from "../../ui/formatCavaliere";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePerspectiveCavaliere } from "./index";
import { profilPerspectiveCavaliere } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen104 (« Dessiner en perspective cavalière »).
 *
 * Énoncé papier = le texte (dimensions réelles), la figure de départ (quadrillage de 1 cm imprimé à
 * l'ÉCHELLE RÉELLE, face avant en vraie grandeur — arête [AB] pour la pyramide) et la consigne
 * globale : l'élève termine le dessin à la règle et à l'équerre. Les trois écrans d'apprentissage
 * (première fuyante, autres sommets ou sommet S, arêtes cachées) deviennent les étapes a, b, c du
 * corrigé ; le dessin complet (réponse = un DESSIN) va dans le corrigé (`figureHtml`), jamais dans
 * l'énoncé.
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatCavaliere.ts`). Séries
 * équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function enteteHtml(e: ExercicePerspectiveCavaliere): string {
  return `<p class="paragraphe">${echapper(enonce(e))}</p>${figurePapierEnonce(e)}`;
}

function construireEnonce(e: ExercicePerspectiveCavaliere): SectionExercice {
  return {
    enteteFragments: [texte(enonce(e))],
    enteteHtml: enteteHtml(e),
    questions: [0, 1, 2].map((i) => ({ consigne: [texte(consigneEtapePapier(e, i))] })),
  };
}

function enoncePapier(e: ExercicePerspectiveCavaliere): EnoncePapier {
  return {
    section: { enteteFragments: [], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExercicePerspectiveCavaliere): FragmentConsigne[] {
  const hauteur = e.variante === "pyramide" ? ` ; S à la verticale du centre de la base, OS = ${nombre(e.hauteur)} cm` : "";
  return [texte(`Fuyantes à 45°, de ${nombre(e.profondeur / 2)} cm sur le dessin${hauteur} ; arêtes cachées en pointillés : ${aretesCacheesTexte(e)}.`)];
}

function correctionDetaillee(e: ExercicePerspectiveCavaliere): EtapeCorrection[] {
  return correctionDetailleePerspectiveCavaliere(e);
}

function construireCorrection(e: ExercicePerspectiveCavaliere): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExercicePerspectiveCavaliere): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  const erreurs = [
    err("Fuyante non réduite (longueur réelle de la profondeur)", "0 pt sur a)"),
    err("Fuyante mesurée « un carreau en diagonale » par centimètre (coefficient 0,71 au lieu de 0,5)", "−1 pt"),
    err("Fuyante horizontale, verticale ou dans le mauvais sens", "0 pt sur a)"),
    err("Arête cachée tracée en trait plein (ou arête vue en pointillés)", "−0,5 pt par arête"),
  ];
  if (e.variante === "pyramide") erreurs.push(err("Sommet S à la verticale du milieu de [AB] au lieu du centre de la base", "0 pt sur b)"));
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c("a", "Première fuyante à 45°, vers la droite et vers le haut, de longueur la moitié de la profondeur", 1.5),
      c("b", e.variante === "pyramide" ? "Quatrième sommet de la base, centre de la base construit, S à la verticale du centre à la hauteur réelle" : "Autres fuyantes parallèles et de même longueur, solide complet", 1.5),
      c("c", "Arêtes cachées en pointillés, et elles seules", 1),
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Tolérance de 2 mm sur la position des sommets construits.")]],
  };
}

/** Niveau (grille commune) : a) première fuyante (calcul de la longueur dessinée) et c) arêtes
 * cachées (décision) transforment ; b) répète la même construction pour le pavé et le prisme (écran
 * de lecture), construit O et S pour la pyramide. Méthode 0 (convention imposée par la consigne) ;
 * piège 1 pour le prisme et la pyramide (face de gauche vue ou non : une ou trois arêtes cachées), le
 * même dans les deux cas ; nombres 0 (la longueur se mesure exactement, le décalage ≈ n'est qu'un
 * contrôle). Constant dans chaque variante. */
function criteresDifficulte(e: ExercicePerspectiveCavaliere): CriteresDifficulte {
  const lecture = e.variante === "pyramide" ? [] : ["b"];
  return { ...etapesDuCorrige(correctionDetaillee(e), lecture), methode: 0, piege: e.variante === "pave" ? 0 : 1, nombres: 0 };
}

export const adaptateurEvaluationPerspectiveCavaliere: AdaptateurFeuilleExercices<ExercicePerspectiveCavaliere> = {
  profilInstance: profilPerspectiveCavaliere,
  titreDocument: "Dessiner en perspective cavalière — Évaluation",
  nomFichierBase: "perspective-cavaliere",
  genererInstance: genererExercicePerspectiveCavaliere,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
