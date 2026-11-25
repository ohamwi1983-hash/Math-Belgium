import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceLireNuage } from "../../core5e/lireNuage";
import { consigne, consigneGenerale, figureEnonce, phases, recap } from "../../ui5e/formatLireNuage";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireNuage } from "./index";
import { correctionDetailleeLireNuage } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen76` « Lire un nuage de points » (Connaître). Énoncé papier = consigne globale +
 * figure (le nuage, ou les quatre nuages numérotés), UNE consigne : les écrans (forme puis sens ; sens puis
 * intensité ; un nuage par écran) sont dans le corrigé. Regroupement a), b), c) : `forme` et `intensite`
 * (même consigne, la figure est la ligne) ; `associer` reste seul (coefficients dans la consigne).
 */

type E = ExerciceLireNuage;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), enteteHtml: figureEnonce(e), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function consignePapier(e: E): FragmentConsigne[] {
  if (e.variante === "forme") return [t("Y a-t-il une relation entre x et y ? Si oui, quelle fonction pourrait ajuster ce nuage (affine, du second degré ou exponentielle), et comment y varie-t-il quand x augmente ? Justifie.")];
  if (e.variante === "intensite") return [t("Donne le sens (positive ou négative) et l'intensité (forte, moyenne, faible ou nulle) de la corrélation entre x et y. Justifie.")];
  return [t("Associe chaque nuage à son coefficient de corrélation. Justifie.")];
}

function enonceEntete(e: E): FragmentConsigne[] {
  if (e.variante === "forme") return [t("Observe le nuage de points ci-dessous.")];
  if (e.variante === "intensite") return [t("Observe le nuage de points ci-dessous : il justifie un ajustement affine.")];
  return fr(consigneGenerale(e));
}

function reponseBreve(e: E): FragmentConsigne[] {
  const ph = phases(e);
  if (e.variante === "associer") return ph.flatMap((p, i) => [t(`${i > 0 ? " ; " : ""}nuage ${i + 1} : `), ...fr(recap(e, p))]);
  if (e.variante === "forme") return [...fr(recap(e, "forme")), t(" ; "), ...fr(recap(e, "sens"))];
  return [t("corrélation "), ...fr(recap(e, "sensCorr")), t(" et "), ...fr(recap(e, "intensite"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enonceEntete(e), enteteHtml: figureEnonce(e), questions: [{ consigne: consignePapier(e) }] },
    etapesParQuestion: [phases(e).map((_, i) => "abcd"[i]!)],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Tous les écrans sont des lectures du nuage (Connaître) ; méthode imposée, aucun piège dans les données,
 * aucun calcul. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeLireNuage(e), phases(e).map((_, i) => "abcd"[i]!)), methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "associer")
    return {
      reponseFinale: reponseBreve(e),
      criteres: phases(e).map((p, i) => ({ sousQuestion: "abcd"[i]!, critere: [t(`Nuage ${i + 1} : `), ...fr(recap(e, p)), t(" (sens et intensité justifiés)")], points: 1 })),
      erreursFrequentes: [{ description: [t("Coefficients associés d'après la pente de la droite et non d'après l'écart des points")], cout: "0 pt sur les nuages concernés" }],
      reponsesAcceptees: [[t("Justification par le sens (signe de r) et la dispersion des points (valeur de |r|)")]],
    };
  if (e.variante === "forme")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Forme du nuage et fonction d'ajustement : "), ...fr(recap(e, "forme"))], points: 2 },
        { sousQuestion: "b", critere: [t("Sens de variation : "), ...fr(recap(e, "sens"))], points: 2 },
      ],
      erreursFrequentes: [{ description: [t("Droite forcée dans un nuage en arc ou qui décolle")], cout: "0 pt sur l'étape 1" }],
      reponsesAcceptees: [[t("Toute description équivalente de l'allure (parabole, courbe exponentielle…)")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Sens : corrélation "), ...fr(recap(e, "sensCorr"))], points: 2 },
      { sousQuestion: "b", critere: [t("Intensité : "), ...fr(recap(e, "intensite")), t(" (écart des points à la droite)")], points: 2 },
    ],
    erreursFrequentes: [{ description: [t("Intensité jugée sur la pente de la droite")], cout: "0 pt sur l'étape 2" }],
    reponsesAcceptees: [[t("Une intensité voisine (classe adjacente) si la justification est cohérente avec le nuage : moitié des points de l'étape 2")]],
  };
}

/** Verdicts (forme, sens, intensité) tirés DANS la variante : jamais dans `forme`. Aucun calcul. */
export function profilLireNuage(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationLireNuage: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lire un nuage de points — Évaluation",
  nomFichierBase: "lire-nuage-points",
  genererInstance: genererExerciceLireNuage,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLireNuage,
  bareme,
  enoncePapier,
  profilInstance: profilLireNuage,
};
