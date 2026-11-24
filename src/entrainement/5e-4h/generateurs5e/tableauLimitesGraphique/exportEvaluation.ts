import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceTableauLimites } from "../../core5e/tableauLimitesGraphique";
import { consigne, domaineL, figurePapier, PHASES, reponse, tableauHtml } from "../../ui5e/formatTableauLimites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTableauLimites } from "./index";
import { correctionDetailleeTableauLimites } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen66` « Du tableau de limites au graphique ». Énoncé papier = tableau des
 * limites (KaTeX) + les quatre graphiques A–D (un SVG, même échelle, quadrillage d'une unité) + la
 * consigne globale « lequel peut représenter f ? justifie, puis donne les équations des
 * asymptotes ». Corrigé : chaque intrus éliminé par LA limite qui le contredit, puis les asymptotes,
 * figure annotée. La place du bon graphique est le verdict (tirée uniformément, jamais dans
 * `forme`). Non regroupé a), b), c) : un exercice = un tableau + quatre graphiques.
 */

type E = ExerciceTableauLimites;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const figureEnonce = (e: E) => `${tableauHtml(e)}<div style="max-width:12.5cm;margin:6px auto">${figurePapier(e).replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: [t("Voici le tableau des limites d'une fonction f définie sur "), f(domaineL(e.sit)), t(", et quatre graphiques complets (asymptotes en pointillés).")], enteteHtml: figureEnonce(e), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [...fr(reponse(e, "graphique")), t(" ; asymptotes : "), ...fr(reponse(e, "av")), t(" ; "), ...fr(reponse(e, "horiz")), t(".")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [t("Voici le tableau des limites d'une fonction f définie sur "), f(domaineL(e.sit)), t(". Lequel des graphiques complets A, B, C et D (asymptotes en pointillés) peut représenter f ? Justifie en éliminant les trois autres, puis donne les équations des asymptotes de f.")],
      enteteHtml: figureEnonce(e),
      questions: [],
    },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Écran 1 = raisonnement (confronter chaque limite à chaque graphique) ; écrans 2 et 3 = lectures
 * dans le tableau. Méthode 0 ; piège CONSTANT 1 (les intrus portent toujours une erreur classique) ;
 * niveau et durée identiques quelle que soit la place du bon graphique. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeTableauLimites(e), ["b", "c"]), methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Bon graphique ("), ...fr(reponse(e, "graphique")), t("), chacun des trois autres éliminé par une limite qui le contredit")], points: 2 },
      { sousQuestion: "b", critere: [t("Asymptote(s) verticale(s) : "), ...fr(reponse(e, "av"))], points: 1 },
      { sousQuestion: "c", critere: [t("Asymptote(s) horizontale(s) ou oblique : "), ...fr(reponse(e, "horiz"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Bon graphique sans justification (aucun intrus éliminé)")], cout: "moitié des points du choix" },
      { description: [t("Asymptote horizontale confondue avec une valeur atteinte par la courbe")], cout: "0 pt sur le choix" },
      { description: [t("Côtés de l'asymptote verticale inversés ("), f("p^-"), t(" lu à droite)")], cout: "0 pt sur le choix" },
    ],
    reponsesAcceptees: [[t("Toute élimination juste (une limite contredite suffit par graphique)")]],
  };
}

/** `forme` = variante ; la place du bon graphique est le verdict (jamais dans `forme`, jamais un cas
 * particulier) ; tout est exact. */
export function profilTableauLimites(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationTableauLimites: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Du tableau de limites au graphique — Évaluation",
  nomFichierBase: "tableau-limites-graphique",
  genererInstance: genererExerciceTableauLimites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTableauLimites,
  bareme,
  enoncePapier,
  profilInstance: profilTableauLimites,
};
