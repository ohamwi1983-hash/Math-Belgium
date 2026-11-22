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
import { correctionDetailleePointFuite } from "./corrigeDetaille";
import type { ExercicePointFuite, VariantePointFuite } from "../../core/pointFuite.types";
import { figurePointFuiteSvg, sceneComplete } from "../../ui/figurePointFuite";
import { CONSIGNE_AFFIRMATIONS, indexAffirmationVraie, reponseConstruction, texteAffirmation } from "../../ui/formatPointFuite";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePointFuite } from "./index";
import { profilPointFuite } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen105 (« Perspective centrale : point de fuite »).
 *
 * Énoncé papier = le texte de la scène, la FIGURE DE DÉPART (vitre quadrillée, ligne d'horizon,
 * points donnés tous sur des nœuds du quadrillage, aucun point à construire) et deux vraies
 * questions : a) la construction (les deux points, puis compléter l'objet — étapes 1 et 2 du
 * générateur), b) l'affirmation vraie parmi trois (étape 3). La construction complète (points
 * construits, prolongements, droites qui portent les points) va dans le corrigé (`figureHtml`),
 * jamais dans l'énoncé.
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatPointFuite.ts`,
 * `ui/figurePointFuite.ts`). Séries équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function figureDepart(e: ExercicePointFuite): string {
  return figurePointFuiteSvg({ mode: "papier", horizon: e.horizon, scene: e.base, sceneEtiquettes: sceneComplete(e, 2) });
}

function enteteHtml(e: ExercicePointFuite): string {
  return `<p class="paragraphe">${echapper(e.contexte)}</p>${figureDepart(e)}`;
}

function consigneAffirmations(e: ExercicePointFuite): string {
  return `${CONSIGNE_AFFIRMATIONS} ${e.affirmations.map((_, i) => texteAffirmation(e, i)).join(" ")}`;
}

function construireEnonce(e: ExercicePointFuite): SectionExercice {
  return {
    enteteFragments: [texte(e.contexte)],
    enteteHtml: enteteHtml(e),
    questions: [...e.etapes.map((et) => ({ consigne: [texte(et.consigne)] })), { consigne: [texte(consigneAffirmations(e))] }],
  };
}

function enoncePapier(e: ExercicePointFuite): EnoncePapier {
  return {
    section: {
      enteteFragments: [],
      enteteHtml: enteteHtml(e),
      questions: [{ consigne: [texte(e.consigneConstruction)] }, { consigne: [texte(consigneAffirmations(e))] }],
    },
    etapesParQuestion: [["a", "b"], ["c"]],
  };
}

function reponseBreve(e: ExercicePointFuite): FragmentConsigne[] {
  const [a, b] = e.etapes;
  return [texte(`a) ${reponseConstruction(a)} ${reponseConstruction(b)} b) L'affirmation ${indexAffirmationVraie(e) + 1} est vraie.`)];
}

const PIEGES: Record<VariantePointFuite, string> = {
  boite: "Faire passer une arête parallèle à la vitre (comme [A′B′]) par le point de fuite : elle n'a pas de point de fuite, elle reste horizontale ou verticale sur le dessin.",
  carrelage: "Reporter la profondeur du 1er rang pour dessiner le 2e : les longueurs ne sont pas conservées, le 2e rang est dessiné moins profond. On le construit avec la diagonale.",
  poteaux: "Reporter au compas l'écart dessiné entre les deux premiers pieds : sur le dessin, les écarts diminuent en s'éloignant. On construit le pied suivant avec le milieu du poteau.",
  panneaux: "Dessiner le second panneau de la même taille que le premier, comme en perspective cavalière : en perspective centrale, il est plus petit, ses coins sont sur les fuyantes.",
};

function correctionDetaillee(e: ExercicePointFuite): EtapeCorrection[] {
  return correctionDetailleePointFuite(e);
}

function construireCorrection(e: ExercicePointFuite): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExercicePointFuite): BaremeExercice {
  const [a, b] = e.etapes;
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c("a", `${a.cible} construit à l'intersection de ${a.supports[0].description} et de ${a.supports[1].description} (tracés visibles)`, 1.5),
      c("b", `${b.cible} construit à l'intersection de ${b.supports[0].description} et de ${b.supports[1].description}, objet complété`, 1.5),
      c("c", "Affirmation vraie identifiée", 1),
    ],
    erreursFrequentes: [
      err(PIEGES[e.variante], "0 pt sur l'étape concernée"),
      err("Point placé « à l'œil », sans les tracés qui le construisent", "moitié des points de l'étape"),
    ],
    reponsesAcceptees: [[texte("Toute autre construction exacte du même point (par exemple avec une autre fuyante ou une autre droite parallèle à la vitre), pourvu que les tracés soient visibles.")]],
  };
}

/** Niveau (grille commune) : trois étapes qui raisonnent (deux constructions, l'affirmation vraie) ;
 * méthode 1 quand la construction demande une idée du cours non dite par la consigne (diagonale du
 * carrelage, milieu du poteau), 0 sinon (fuyantes et droites parallèles à la vitre) ; aucun piège dans
 * les données, aucun nombre. Constant dans chaque variante (l'affirmation vraie n'y change rien). */
function criteresDifficulte(e: ExercicePointFuite): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: e.variante === "carrelage" || e.variante === "poteaux" ? 1 : 0, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationPointFuite: AdaptateurFeuilleExercices<ExercicePointFuite> = {
  profilInstance: profilPointFuite,
  titreDocument: "Perspective centrale : point de fuite — Évaluation",
  nomFichierBase: "point-de-fuite",
  genererInstance: genererExercicePointFuite,
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
