import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExercicePerspectiveCavaliere } from "../../core/perspectiveCavaliere.types";
import { origineMesure } from "../../moteur/verificationPerspectiveCavaliere";
import {
  aretesCacheesTexte,
  consigneEtapePapier,
  consigneGlobale,
  enonce,
  figurePapierCorrige,
  figurePapierEnonce,
  longueurFuyante,
  nombre,
  raisonAretes,
  segment,
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

function decalage(e: ExercicePerspectiveCavaliere): string {
  return (Math.round(e.fuyante.x * 100) / 100).toString().replace(".", ",");
}

function reponseBreve(e: ExercicePerspectiveCavaliere): FragmentConsigne[] {
  const hauteur = e.variante === "pyramide" ? ` ; S à la verticale du centre de la base, OS = ${nombre(e.hauteur)} cm` : "";
  return [texte(`Fuyantes à 45°, de ${nombre(e.profondeur / 2)} cm sur le dessin${hauteur} ; arêtes cachées en pointillés : ${aretesCacheesTexte(e)}.`)];
}

function etapeAutresSommets(e: ExercicePerspectiveCavaliere): string {
  const o = origineMesure(e, e.premier).nom;
  if (e.variante === "pyramide") {
    const c = e.completes[0]!;
    return `${c} se place de la même façon, au bout de la fuyante issue de ${origineMesure(e, c).nom}. La perspective cavalière conserve les milieux : le centre O de la base est le point de rencontre des diagonales [AC] et [BD] du parallélogramme ABCD dessiné. La hauteur est verticale, donc en vraie grandeur : S est à la verticale de O, avec OS = ${nombre(e.hauteur)} cm.`;
  }
  const suivants = e.suivants.map((n) => `${n} au bout de la fuyante issue de ${origineMesure(e, n).nom}`).join(", ");
  return `Toutes les fuyantes sont parallèles et ont la même longueur sur le dessin que ${segment(o, e.premier)} : on place ${suivants}. La face arrière, reliée par ces fuyantes, est superposable à la face avant.`;
}

function correctionDetaillee(e: ExercicePerspectiveCavaliere): EtapeCorrection[] {
  const o = origineMesure(e, e.premier).nom;
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("En perspective cavalière, la face avant reste en vraie grandeur. Une arête en profondeur (fuyante) se dessine à 45° de l'horizontale, vers la droite et vers le haut, et réduite de moitié.")],
    },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [
        texte(
          `Profondeur réelle : ${nombre(e.profondeur)} cm, donc sur le dessin ${segment(o, e.premier)} mesure ${longueurFuyante(e)}. On la trace à l'équerre (45°) et on mesure cette longueur à la règle, le long de la fuyante : ${e.premier} ne tombe pas sur un nœud du quadrillage (environ ${decalage(e)} cm vers la droite et ${decalage(e)} cm vers le haut depuis ${o}).`,
        ),
      ],
    },
    { label: e.variante === "pyramide" ? "Sommet S" : "Construction", sousQuestion: "b", fragments: [texte(etapeAutresSommets(e))] },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [texte(`Une arête est cachée quand toutes les faces qui la bordent sont cachées. ${raisonAretes(e)}`)],
      figureHtml: figurePapierCorrige(e),
    },
    {
      label: "Piège",
      sousQuestion: "c",
      fragments: [texte("Compter « un carreau en diagonale » par centimètre ne réduit pas de moitié (la diagonale d'un carreau mesure environ 1,4 cm) ; une fuyante non réduite étire le solide vers l'arrière ; une arête cachée se trace en pointillés, jamais en trait plein.")],
    },
  ];
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

function difficulte(e: ExercicePerspectiveCavaliere): 1 | 2 | 3 {
  return e.variante === "pyramide" ? 3 : 2;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
