import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceCorrelation } from "../../core5e/covarianceCorrelation";
import { avantTableau } from "../../ui5e/ecrituresStat2vLotH1";
import { consigne, consigneGenerale, contexte, phases, reponse, tableauPapier } from "../../ui5e/formatCovarianceCorrelation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCorrelation } from "./index";
import { correctionDetailleeCorrelation } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen38` « Covariance et coefficient de corrélation ». Énoncé papier : contexte +
 * tableau (KaTeX affiché, aussi en Word), puis UNE consigne (covariance par les deux formules, σ, r et
 * interprétation ; à la calculatrice : σ, r, covariance et interprétation) — les écrans sont des étapes du
 * corrigé. Pas de regroupement (série propre à chaque instance).
 */

type E = ExerciceCorrelation;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const lettres = (e: E) => phases(e).map((_, i) => "abcdef"[i]!);

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const cov = e.variante === "main" ? fr(reponse(e, "covEcarts")) : fr(reponse(e, "cov"));
  return [...cov, t(" ; "), ...fr(reponse(e, "sigmas")), t(" ; "), ...fr(reponse(e, "r")), t(" : "), ...fr(reponse(e, "sens")), t(", "), ...fr(reponse(e, "intensite")).map((x) => (x.type === "texte" ? { ...x, valeur: x.valeur.replace(/^corrélation /, "") } : x))];
}

function enoncePapier(e: E): EnoncePapier {
  const q =
    e.variante === "main"
      ? [t("Sans calculatrice, calcule la covariance de x et y par les deux formules du cours, puis les écarts-types "), f("\\sigma_x"), t(" et "), f("\\sigma_y"), t(" (au centième) et le coefficient de corrélation r (au centième). Interprète r : sens et intensité de la corrélation.")]
      : [t("À l'aide de ta calculatrice, donne les écarts-types "), f("\\sigma_x"), t(" et "), f("\\sigma_y"), t(" (au centième) et le coefficient de corrélation r (au millième), puis déduis-en la covariance de x et y (au centième). Interprète r : sens et intensité de la corrélation.")];
  return {
    section: { enteteFragments: [...avantTableau([t(contexte(e).phrase)]), f(tableauPapier(e))], questions: [{ consigne: q }] },
    etapesParQuestion: [lettres(e)],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Sens et intensité : lectures (signe, tableau du cours) ; `calculatrice` : σ et r aussi (lus sur la
 * TI-30XB). Méthode imposée ; aucun piège dans les données. */
function criteresDifficulte(e: E): CriteresDifficulte {
  const lecture = e.variante === "main" ? ["e", "f"] : ["a", "b", "d", "e"];
  return { ...etapesDuCorrige(correctionDetailleeCorrelation(e), lecture), methode: 0, piege: 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  const interp = [
    { sousQuestion: e.variante === "main" ? "e" : "d", critere: [t("Sens (signe de la covariance) : "), ...fr(reponse(e, "sens"))], points: 0.5 },
    { sousQuestion: e.variante === "main" ? "f" : "e", critere: [t("Intensité (tableau du cours) : "), ...fr(reponse(e, "intensite"))], points: 0.5 },
  ];
  if (e.variante === "main")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Covariance par les écarts : "), ...fr(reponse(e, "covEcarts"))], points: 1 },
        { sousQuestion: "b", critere: [t("Covariance par la seconde formule : "), ...fr(reponse(e, "covProduits"))], points: 0.5 },
        { sousQuestion: "c", critere: [t("Écarts-types (division par n) : "), ...fr(reponse(e, "sigmas"))], points: 1 },
        { sousQuestion: "d", critere: [t("Coefficient de corrélation : "), ...fr(reponse(e, "r"))], points: 0.5 },
        ...interp,
      ],
      erreursFrequentes: [
        { description: [f("S_x"), t(" (division par n − 1) au lieu de "), f("\\sigma_x")], cout: "−0,5, suite notée sans double pénalité" },
        { description: [t("Produit des moyennes "), f("\\bar{x}\\,\\bar{y}"), t(" oublié dans la seconde formule")], cout: "0 pt sur l'étape 2" },
      ],
      reponsesAcceptees: [[t("Écarts-types en valeur exacte (racines) ; r calculé avec des écarts-types arrondis au centième")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Écarts-types σ (et non S) : "), ...fr(reponse(e, "sigmas"))], points: 1 },
      { sousQuestion: "b", critere: [t("Coefficient de corrélation : "), ...fr(reponse(e, "r"))], points: 1 },
      { sousQuestion: "c", critere: [t("Covariance "), f("r\\,\\sigma_x\\,\\sigma_y"), t(" : "), ...fr(reponse(e, "cov"))], points: 1 },
      ...interp,
    ],
    erreursFrequentes: [{ description: [f("S_x"), t(", "), f("S_y"), t(" recopiés à la place de "), f("\\sigma_x"), t(", "), f("\\sigma_y")], cout: "0 pt sur l'étape 1, suite notée sans double pénalité" }],
    reponsesAcceptees: [[t("Covariance par "), f("\\dfrac{1}{n}\\sum x_iy_i-\\bar{x}\\,\\bar{y}"), t(" ; écart d'une unité sur la dernière décimale dû aux arrondis")]],
  };
}

/** `main` : la TI-30XB affiche σ et r → `exacte` (petites séries, « calculatrice interdite » seulement) ;
 * `calculatrice` → `calculatrice` (et `calculatriceIndispensable`). La classe de r et le sens sont tirés
 * DANS la variante : jamais dans `forme`. */
export function profilCorrelation(e: E): ProfilInstance {
  return { casParticulier: null, calcul: e.variante === "main" ? "exacte" : "calculatrice" };
}

export const adaptateurEvaluationCorrelation: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Covariance et coefficient de corrélation — Évaluation",
  nomFichierBase: "covariance-correlation",
  genererInstance: genererExerciceCorrelation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCorrelation,
  bareme,
  enoncePapier,
  profilInstance: profilCorrelation,
  calculatriceIndispensable: ["calculatrice"],
};
