import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExercicePointMoyen } from "../../core5e/pointMoyenStat";
import { avantTableau, nL, pointL } from "../../ui5e/ecrituresStat2vLotH1";
import { consigne, consigneGenerale, contexte, figureMayer, phases, reponse, tableauPapier } from "../../ui5e/formatPointMoyenStat";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointMoyen } from "./index";
import { correctionDetailleePointMoyen } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen77` « Point moyen et valeurs manquantes ». Énoncé papier : la phrase de contexte
 * et le tableau (KaTeX affiché, aussi dans la copie Word ; « ? » pour une valeur effacée), puis UNE consigne
 * (G de la série ; valeurs manquantes connaissant G) — les écrans sont dans le corrigé. `mayerG1G2` : trois
 * VRAIES questions (équation [a, b], ordonnée [c], abscisse [d]), comme l'exercice 3 du document. Pas de
 * regroupement (tableau ou points propres à chaque instance).
 */

type E = ExercicePointMoyen;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const lettres = (e: E) => phases(e).map((_, i) => "abcd"[i]!);

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const ph = phases(e);
  if (e.variante === "mayerG1G2") return [t("a) "), ...fr(reponse(e, "equation")), t(" ; b) "), ...fr(reponse(e, "prevY")), t(" ; c) "), ...fr(reponse(e, "prevX"))];
  if (e.variante === "uneValeur") return fr(reponse(e, "valeur"));
  return ph.flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  if (e.variante === "mayerG1G2")
    return {
      section: {
        enteteFragments: [t("On donne les deux points moyens "), f(pointL("G_1", e.G1!)), t(" et "), f(pointL("G_2", e.G2!)), t(" d'un nuage de points.")],
        questions: [
          { consigne: [t("Écris l'équation de la droite de Mayer de ce nuage.")] },
          { consigne: [t("Calcule l'ordonnée du point de la droite de Mayer d'abscisse "), f(nL(e.x0!)), t(".")] },
          { consigne: [t("Calcule l'abscisse du point de la droite de Mayer d'ordonnée "), f(nL(e.y0!)), t(" (au centième).")] },
        ],
      },
      etapesParQuestion: [["a", "b"], ["c"], ["d"]],
      reponseBreve: reponseBreve(e),
    };
  const tab = f(tableauPapier(e));
  if (e.variante === "pointMoyen")
    return {
      section: { enteteFragments: [...avantTableau([t(contexte(e).phrase)]), tab], questions: [{ consigne: [t("Calcule les coordonnées du point moyen G de cette série.")] }] },
      etapesParQuestion: [lettres(e)],
      reponseBreve: reponseBreve(e),
    };
  const une = e.variante === "uneValeur";
  return {
    section: {
      enteteFragments: [t(`Dans la série statistique suivante, ${une ? "une valeur a été effacée" : "deux valeurs ont été effacées"} :`), tab],
      questions: [{ consigne: [t("Sachant que le point moyen du nuage est "), f(pointL("G", e.G)), t(une ? ", retrouve la valeur manquante." : ", retrouve les valeurs manquantes.")] }],
    },
    etapesParQuestion: [lettres(e)],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** pointMoyen : une étape (méthode imposée) ; valeurs manquantes : deux étapes, méthode 1 (moyenne
 * « à l'envers », n·x̄) ; mayerG1G2 : quatre étapes ; aucun piège dans les données ; nombres détectés sur
 * le corrigé (arrondi de la prévision inverse). */
function criteresDifficulte(e: E): CriteresDifficulte {
  const methode = e.variante === "uneValeur" || e.variante === "deuxValeurs" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleePointMoyen(e)), methode, piege: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "pointMoyen")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Moyenne des x : "), f(`\\bar{x}=${nL(e.G.x)}`)], points: 2 },
        { sousQuestion: "a", critere: [t("Moyenne des y : "), f(`\\bar{y}=${nL(e.G.y)}`)], points: 2 },
      ],
      erreursFrequentes: [{ description: [t("Médiane ou milieu des valeurs extrêmes au lieu de la moyenne")], cout: "0 pt sur la coordonnée" }],
      reponsesAcceptees: [[t("Valeurs exactes sous forme de fraction")]],
    };
  if (e.variante === "mayerG1G2")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Pente : "), ...fr(reponse(e, "pente"))], points: 1 },
        { sousQuestion: "b", critere: [t("Ordonnée à l'origine et équation : "), ...fr(reponse(e, "equation"))], points: 1 },
        { sousQuestion: "c", critere: [t("Ordonnée du point d'abscisse donnée : "), ...fr(reponse(e, "prevY"))], points: 1 },
        { sousQuestion: "d", critere: [t("Abscisse du point d'ordonnée donnée : "), ...fr(reponse(e, "prevX"))], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Pente calculée par "), f("\\Delta x/\\Delta y")], cout: "0 pt sur l'étape 1, suite notée sans double pénalité" },
        { description: [t("x remplacé par l'ordonnée donnée dans la dernière question")], cout: "0 pt sur l'étape 4" },
      ],
      reponsesAcceptees: [[t("Équation sous une autre forme équivalente ; abscisse arrondie au centième")]],
    };
  const crit = phases(e).map((p, i) => ({ sousQuestion: "ab"[i]!, critere: fr(reponse(e, p)), points: 2 }));
  return {
    reponseFinale: reponseBreve(e),
    criteres: e.variante === "uneValeur" ? [{ ...crit[0]!, critere: [t("Somme totale "), f("n\\cdot\\bar{x}"), t(" : "), ...crit[0]!.critere] }, { ...crit[1]!, critere: [t("Valeur effacée : "), ...crit[1]!.critere] }] : crit,
    erreursFrequentes: [{ description: [t("Moyenne des valeurs connues au lieu de la somme totale "), f("n\\cdot\\bar{x}")], cout: "0 pt sur la valeur" }],
    reponsesAcceptees: [[t("Toute démarche équivalente (équation "), f("\\dfrac{\\ldots+x}{n}=\\bar{x}"), t(")")]],
  };
}

/** pointMoyen : la TI-30XB (« 2-Var Stats ») donne directement x̄ et ȳ → `exacte` (petites séries, tirée
 * seulement « calculatrice interdite ») ; valeurs manquantes et Mayer : démarche évaluée, tirées dans les
 * deux modes. Aucun cas particulier ; `forme` sans objet (la variante est choisie). */
export function profilPointMoyen(e: E): ProfilInstance {
  return e.variante === "pointMoyen" ? { casParticulier: null, calcul: "exacte" } : { casParticulier: null };
}

export const adaptateurEvaluationPointMoyen: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Point moyen et valeurs manquantes — Évaluation",
  nomFichierBase: "point-moyen-valeurs-manquantes",
  genererInstance: genererExercicePointMoyen,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleePointMoyen,
  bareme,
  enoncePapier,
  profilInstance: profilPointMoyen,
};

/** Figure du corrigé (réutilisée par les outils de contrôle). */
export const figurePapierMayer = (e: E) => figureMayer(e, true);
