import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceLectureSolide } from "../../core/lectureSolide.types";
import { CONSIGNE_POSITIONS, LIBELLES_POSITIONS, enonceTexte, figureEnonce, nombreFr, nomArete, nomDroite, nomFaceLue, nomPlanLu, questionsPapier } from "../../ui/formatLectureSolide";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureSolide } from "./index";
import { correctionDetailleeLectureSolide } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen133 « Lire un solide en perspective :
 * vocabulaire et positions » (Connaître). Énoncé papier = le solide (texte), sa figure en cavalière
 * (« dessin » : toutes les arêtes en trait plein, puisqu'on demande lesquelles sont cachées) et de
 * VRAIES questions distinctes — « dessin » : a) faces, b) arêtes cachées, c) vraie longueur ;
 * « appartenance » : un plan par question ; « positions » : une paire par question sous la consigne
 * commune. Jamais regroupé (vraies questions).
 */

type E = ExerciceLectureSolide;

/**
 * Profil (tirage équilibré) : `forme` = variante + solide (cube, pavé, prisme, tétraèdre). Les réponses
 * (faces, arêtes cachées, fuyante ou arête de face, points du plan, positions des paires) restent tirées
 * au hasard dans chaque série. Aucun cas particulier, pas de `calcul`.
 */
export function profilLectureSolide(e: E): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}|${e.genre}` };
}

function enteteHtml(e: E): string {
  return figureEnonce(e, "papier");
}

function construireEnonce(e: E): SectionExercice {
  const consignes = e.variante === "positions" ? questionsPapier(e).map((q) => `${q} : sécantes, parallèles ou gauches ?`) : questionsPapier(e);
  return { enteteFragments: [texte(enonceTexte(e))], enteteHtml: enteteHtml(e), questions: consignes.map((c) => ({ consigne: [texte(c)] })) };
}

function enoncePapier(e: E): EnoncePapier {
  const questions = questionsPapier(e).map((q) => ({ consigne: [texte(q)] }));
  return {
    section: {
      enteteFragments: [texte(e.variante === "positions" ? `${enonceTexte(e)} ${CONSIGNE_POSITIONS}` : enonceTexte(e))],
      enteteHtml: enteteHtml(e),
      questions,
    },
    etapesParQuestion: questions.map((_, i) => ["abcd"[i]!]),
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "dessin") {
    const vraies = e.faces.filter((f) => f.vraieGrandeur).map((f) => nomFaceLue(f.sommets));
    const cachees = e.aretes.filter((a) => a.cachee).map((a) => nomArete(a.sommets));
    return [texte(`a) Vraie grandeur : ${vraies.join(", ")} ; les autres faces sont déformées. b) ${cachees.join(", ")}. c) ${nomArete(e.longueur.arete)} mesure ${nombreFr(e.longueur.vraie)} cm.`)];
  }
  if (e.variante === "appartenance") return [texte(e.plans.map((p, i) => `${"abc"[i]}) ${p.dans.join(", ")}`).join(" ; ") + ".")];
  return [texte(e.paires.map((p, i) => `${"abcd"[i]}) ${LIBELLES_POSITIONS[p.position]}`).join(" ; ") + ".")];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  if (e.variante === "dessin")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [c("a", "Faces en vraie grandeur (avant et arrière) et faces déformées reconnues", 1.5), c("b", "Toutes les arêtes cachées, et seulement elles", 1.5), c("c", `Vraie longueur de ${nomArete(e.longueur.arete)} : ${nombreFr(e.longueur.vraie)} cm`, 1)],
      erreursFrequentes: [
        { description: [texte("Face arrière oubliée parmi les faces en vraie grandeur")], cout: "moitié des points sur a)" },
        { description: [texte("Longueur d'une fuyante lue directement sur le dessin (sans doubler)")], cout: "0 pt sur c)" },
        { description: [texte("Arête de la face arrière bordée par une face vue mise en pointillés")], cout: "moitié des points sur b)" },
      ],
      reponsesAcceptees: [[texte("« Parallélogramme » ou « déformée » pour une face qui contient une fuyante.")]],
    };
  if (e.variante === "appartenance")
    return {
      reponseFinale: reponseBreve(e),
      criteres: e.plans.map((p, i) => c("abc"[i]!, `Points du plan ${nomPlanLu(p)} : ${p.dans.join(", ")} (tous, et seulement eux)`, i === 0 ? 1.5 : 1.25)),
      erreursFrequentes: [
        { description: [texte("Point retenu parce qu'il semble dans le triangle sur le dessin")], cout: "moitié des points de la question" },
        { description: [texte("Quatrième sommet d'un plan diagonal oublié")], cout: "moitié des points de la question" },
      ],
      reponsesAcceptees: [],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: e.paires.map((p, i) => c("abcd"[i]!, `${nomDroite(p.d1)} et ${nomDroite(p.d2)} : ${LIBELLES_POSITIONS[p.position]}`, 1)),
    erreursFrequentes: [
      { description: [texte("Droites gauches déclarées sécantes parce qu'elles se croisent sur le dessin")], cout: "0 pt sur la paire" },
      { description: [texte("Parallèles de deux faces différentes déclarées gauches")], cout: "0 pt sur la paire" },
    ],
    reponsesAcceptees: [],
  };
}

/** Niveau : écrans de pure LECTURE (Connaître) ; méthode 0 ; piège dans les données toujours présent
 * en « dessin » (face arrière, fuyante réduite, arête de l'arrière visible) et en « positions » (une
 * paire gauche qui se croise sur le dessin, toujours tirée) ; aucun en « appartenance ». Niveau et durée
 * constants par variante : dessin 2 (5 min), appartenance 1 (5 min), positions 2 (6 min). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeLectureSolide(e), ["a", "b", "c", "d"]), methode: 0, piege: e.variante === "appartenance" ? 0 : 1, nombres: 0 };
}

const TITRES_PAPIER = {
  dessin: { titre: "Perspective cavalière", sectionId: "cavaliere" },
  appartenance: { titre: "Déterminer un plan", sectionId: "determiner-plan" },
  positions: { titre: "Positions de deux droites", sectionId: "deux-droites" },
} as const;

export const adaptateurEvaluationLectureSolide: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilLectureSolide,
  titreDocument: "Lire un solide en perspective — Évaluation",
  nomFichierBase: "lire-solide-perspective",
  genererInstance: genererExerciceLectureSolide,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLectureSolide,
  bareme,
  enoncePapier,
  titrePapier: (e) => ({ ...TITRES_PAPIER[e.variante] }),
};
