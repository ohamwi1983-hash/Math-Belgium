import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceMoindresCarres } from "../../core5e/moindresCarres";
import { avantTableau, nT } from "../../ui5e/ecrituresStat2vLotH1";
import { nomPrecision } from "../../ui5e/formatDroiteMayer";
import { consigne, consigneGenerale, contexte, phases, reponse, tableauPapier } from "../../ui5e/formatMoindresCarres";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMoindresCarres } from "./index";
import { correctionDetailleeMoindresCarres } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen37` « Droite des moindres carrés ». Énoncé papier : contexte + tableau (KaTeX
 * affiché, aussi en Word), puis de VRAIES questions — `main` : a) l'équation par la méthode des moindres
 * carrés, à la main [étapes a à d], b) la prévision [e] ; `calculatrice` : a) l'équation à la calculatrice
 * [a], b) prévision de y [b], c) prévision de x [c]. Le tableau des écarts est une étape du corrigé. Pas de
 * regroupement (série propre à chaque instance).
 */

type E = ExerciceMoindresCarres;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "main") return [t("a) "), ...fr(reponse(e, "equation")).slice(2), t(" ; b) "), ...fr(reponse(e, "prevision"))];
  return [t("a) "), ...fr(reponse(e, "coefs")).slice(4), t(" ; b) "), ...fr(reponse(e, "prevY")), t(" ; c) "), ...fr(reponse(e, "prevX"))];
}

function enoncePapier(e: E): EnoncePapier {
  const entete = [...avantTableau([t(contexte(e).phrase)]), f(tableauPapier(e))];
  if (e.variante === "main")
    return {
      section: {
        enteteFragments: entete,
        questions: [
          { consigne: [t("Sans calculatrice, détermine une équation de la droite des moindres carrés (droite de régression de y en x) de cette série.")] },
          { consigne: [t(`${contexte(e).questionY(nT(e.x0)).replace(/\.$/, "")} (valeur exacte).`)] },
        ],
      },
      etapesParQuestion: [["a", "b", "c", "d"], ["e"]],
      reponseBreve: reponseBreve(e),
    };
  return {
    section: {
      enteteFragments: entete,
      questions: [
        { consigne: [t(`À l'aide de ta calculatrice, donne une équation de la droite des moindres carrés de cette série (a arrondie ${nomPrecision(e.da)}, b arrondi ${nomPrecision(e.db)}).`)] },
        { consigne: [t(`${contexte(e).questionY(nT(e.x0, e.dx))} Arrondis ${nomPrecision(e.dp)}.`)] },
        { consigne: [t(`${contexte(e).questionX!(nT(e.y0!, e.dy))} Arrondis ${nomPrecision(e.dpx)}.`)] },
      ],
    },
    etapesParQuestion: [["a"], ["b"], ["c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** `main` : cinq étapes, méthode imposée ; `calculatrice` : trois étapes, nombres arrondis. Aucun piège dans
 * les données. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeMoindresCarres(e)), methode: 0, piege: 0, nombres: e.variante === "main" ? 0 : 1 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "main")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Point moyen : "), ...fr(reponse(e, "g"))], points: 0.5 },
        { sousQuestion: "b", critere: [t("Tableau des écarts : "), ...fr(reponse(e, "ecarts"))], points: 1.5 },
        { sousQuestion: "c", critere: [t("Pente : "), ...fr(reponse(e, "pente"))], points: 0.5 },
        { sousQuestion: "d", critere: [t("b et équation : "), ...fr(reponse(e, "equation"))], points: 1 },
        { sousQuestion: "e", critere: [t("Prévision : "), ...fr(reponse(e, "prevision"))], points: 0.5 },
      ],
      erreursFrequentes: [
        { description: [t("Division par "), f("\\sum Y_i^2"), t(" ou produits "), f("x_iy_i"), t(" non centrés")], cout: "0 pt sur l'étape 3, suite notée sans double pénalité" },
        { description: [f("b=\\bar{x}-a\\,\\bar{y}")], cout: "0 pt sur l'étape 4" },
      ],
      reponsesAcceptees: [[t("Calcul de "), f("\\sum X_iY_i"), t(" par "), f("\\sum x_iy_i-n\\,\\bar{x}\\,\\bar{y}"), t(" ; valeurs sous forme de fraction")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Équation de la droite des moindres carrés : "), ...fr(reponse(e, "coefs")).slice(4)], points: 2 },
      { sousQuestion: "b", critere: [t("Prévision de y : "), ...fr(reponse(e, "prevY"))], points: 1 },
      { sousQuestion: "c", critere: [t("Prévision de x : "), ...fr(reponse(e, "prevX"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("a et b échangés (« y = bx + a »)")], cout: "0 pt sur l'étape 1, suite notée sans double pénalité" },
      { description: [t("x remplacé par l'ordonnée donnée dans la dernière question")], cout: "0 pt sur l'étape 3" },
    ],
    reponsesAcceptees: [[t("Prévisions faites avec l'équation arrondie (écart d'une unité sur la dernière décimale)")]],
  };
}

/** `main` : la TI-30XB donne directement a et b → `exacte` (petites séries, tirées seulement « calculatrice
 * interdite ») ; `calculatrice` : série réelle → `calculatrice` (et `calculatriceIndispensable`). */
export function profilMoindresCarres(e: E): ProfilInstance {
  return { casParticulier: null, calcul: e.variante === "main" ? "exacte" : "calculatrice" };
}

export const adaptateurEvaluationMoindresCarres: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Droite des moindres carrés — Évaluation",
  nomFichierBase: "droite-moindres-carres",
  genererInstance: genererExerciceMoindresCarres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeMoindresCarres,
  bareme,
  enoncePapier,
  profilInstance: profilMoindresCarres,
  calculatriceIndispensable: ["calculatrice"],
};
