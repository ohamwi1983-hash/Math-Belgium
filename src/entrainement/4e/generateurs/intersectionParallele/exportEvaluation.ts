import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceIntersectionParallele } from "../../core/intersectionParallele.types";
import { consigneGlobaleIP, consignesEtapesPapier, droite, enonceTexteIP, face, figureIP, plan, seg } from "../../ui/formatIntersectionParallele";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceIntersectionParallele } from "./index";
import { correctionDetailleeIntersectionParallele } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen134 « Intersection de deux plans par
 * parallélisme » (Appliquer). Énoncé papier = le texte (solide, points, plans), la figure (plan (PQR)
 * et [PQ], ou les deux plans en couleur — jamais la droite cherchée) et UNE consigne globale ; les trois
 * écrans (point connu, droite, point d'arrivée — ou point commun, direction, droite) deviennent les
 * étapes a, b, c du corrigé. Jamais regroupé : solides et espace, données et figure propres à
 * l'instance (comme gen39–41, gen100–107).
 */

type E = ExerciceIntersectionParallele;

/**
 * Profil (tirage équilibré) : `forme` = variante + axe des faces étudiées (dessus / dessous, avant /
 * arrière, gauche / droite : la profondeur fuyante change la lecture). Le solide, les points, la
 * réponse (S, K, K′) et les leurres restent tirés au hasard. Aucun cas particulier, pas de `calcul`.
 */
export function profilIntersectionParallele(e: E): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}|${e.axe}` };
}

const enteteHtml = (e: E) => figureIP(e, "papier", 0);

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: [texte(enonceTexteIP(e))], enteteHtml: enteteHtml(e), questions: consignesEtapesPapier(e).map((c) => ({ consigne: [texte(c)] })) };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [texte(enonceTexteIP(e))], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(consigneGlobaleIP(e))] }] }, etapesParQuestion: [["a", "b", "c"]] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "faces-paralleles") return [texte(`[RS], où S est le point de ${seg(e.faces!.areteS)} tel que (RS) est parallèle à (PQ).`)];
  const d = e.direction!;
  return [texte(`La droite (KK′) : K = ${droite(d.traces0[0])} ∩ ${droite(d.traces0[1])} dans la face ${face(e.face0)}, et (KK′) parallèle à ${droite(d.direction)}.`)];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  if (e.variante === "faces-paralleles") {
    const F1 = face(e.face1);
    return {
      reponseFinale: reponseBreve(e),
      criteres: [c("a", `R reconnu comme point du plan (PQR) et de la face ${F1}`, 1), c("b", "Parallèle à (PQ) menée par R, justifiée par la propriété 1 (faces opposées parallèles)", 1.5), c("c", `S placé sur l'arête ${seg(e.faces!.areteS)} et segment [RS] tracé`, 1.5)],
      erreursFrequentes: [
        err("Côté [RQ] ou [RP] tracé à travers le solide", "0 pt sur les étapes 2 et 3"),
        err("Parallèle à une arête au lieu de la parallèle à (PQ)", "0 pt sur les étapes 2 et 3"),
        err("Parallèle juste sans citer la propriété des plans parallèles", "moitié des points sur l'étape 2"),
      ],
      reponsesAcceptees: [[texte("Toute construction exacte de S, par exemple avec un point auxiliaire, pourvu qu'elle soit justifiée.")]],
    };
  }
  const d = e.direction!;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c("a", `Point commun K construit dans une même face (${face(e.face0)}), justifié par une droite de chaque plan`, 1.5),
      c("b", `Direction parallèle à ${droite(d.direction)}, justifiée par deux droites parallèles, une dans chaque plan (théorème du toit)`, 1.5),
      c("c", "Droite d'intersection (KK′) tracée par K avec cette direction", 1),
    ],
    erreursFrequentes: [
      err("Point « commun » pris au croisement de deux droites qui ne sont pas dans une même face", "0 pt sur l'étape 1"),
      err(`Direction d'une droite d'un seul des plans (par exemple ${droite(d.traces0[0])})`, "0 pt sur les étapes 2 et 3"),
    ],
    reponsesAcceptees: [[texte(`Deux points communs (K dans la face ${face(e.face0)}, K′ dans la face ${face(e.face1)}) au lieu de la direction : la droite (KK′) est juste ; les plans ${plan(d.plans[0])} et ${plan(d.plans[1])} étant nommés, tout point commun justifié convient.`)]],
  };
}

/** Niveau : deux étapes qui raisonnent (le point, la droite ou la direction) et une lecture (placer le
 * point d'arrivée) ; méthode 1 (choisir la propriété des plans parallèles ou le théorème du toit parmi
 * les méthodes du cours) ; aucun piège dans les données → niveau 2, 7 min, constants. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeIntersectionParallele(e), ["c"]), methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

export const adaptateurEvaluationIntersectionParallele: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilIntersectionParallele,
  titreDocument: "Intersection de deux plans par parallélisme — Évaluation",
  nomFichierBase: "intersection-plans-parallelisme",
  genererInstance: genererExerciceIntersectionParallele,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeIntersectionParallele,
  bareme,
  enoncePapier,
  titrePapier: (e) => (e.variante === "faces-paralleles" ? { titre: "Positions de deux plans", sectionId: "deux-plans" } : { titre: "Intersection de deux plans", sectionId: "percee" }),
};
