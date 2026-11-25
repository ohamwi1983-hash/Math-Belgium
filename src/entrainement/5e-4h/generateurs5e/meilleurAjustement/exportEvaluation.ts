import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceMeilleurAjustement } from "../../core5e/meilleurAjustement";
import { consigne, contexteAberrant, phases, reponse, situation, tableau } from "../../ui5e/formatMeilleurAjustement";
import { tableauHtml } from "../../ui5e/definitionRelevesSinusoide";
import { precisionTexte } from "../../ui5e/nombresStatLotH2";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMeilleurAjustement } from "./index";
import { correctionDetailleeMeilleurAjustement } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen79` « Quel est le meilleur ajustement ? ». deuxDroites et mayerMoindres :
 * situation (les deux droites) + tableau + UNE consigne (les écrans deviennent les étapes du corrigé) ;
 * aberrant : trois VRAIES questions (le point, r avec et sans lui, la droite sans lui et la prévision).
 * Nuage et droites dans le corrigé. Le verdict (droite gagnante, place de la droite des moindres
 * carrés, rang du point aberrant) est tiré dans chaque série, jamais dans la `forme` (= la variante).
 * Profils : aberrant `calculatrice` (huit relevés réels) ; les deux autres se font à la main (données
 * entières, coefficients courts) et sont tirés dans les deux modes. Regroupement écarté (données propres
 * à l'instance).
 */

type E = ExerciceMeilleurAjustement;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), enteteHtml: tableauHtml(tableau(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "aberrant") return [t("a) "), ...fr(reponse(e, "repere")), t(" ; b) "), ...fr(reponse(e, "correlations")), t(" ; c) "), ...fr(reponse(e, "droite")), t(", "), ...fr(reponse(e, "prevision")), t(".")];
  return [...fr(reponse(e, "somme1")), t(" ; "), ...fr(reponse(e, "somme2")), t(" ; "), f(e.gagnante === 0 ? "d_1" : "d_2"), t(e.variante === "deuxDroites" ? " est le meilleur ajustement." : " est la droite des moindres carrés.")];
}

function enoncePapier(e: E): EnoncePapier {
  if (e.variante === "aberrant") {
    const ca = contexteAberrant(e);
    return {
      section: {
        enteteFragments: [...fr(situation(e)), t(" Utilise ta calculatrice.")],
        enteteHtml: tableauHtml(tableau(e)),
        questions: [
          { consigne: [t("Quel point semble aberrant ? Explique pourquoi.")] },
          { consigne: [t("Calcule le coefficient de corrélation "), f("r"), t(" avec les huit points, puis sans le point aberrant (au millième). Commente.")] },
          { consigne: [t("Détermine la droite des moindres carrés des sept autres points "), f("y=ax+b"), t(` (a ${precisionTexte(ca.da)}, b ${precisionTexte(ca.db)}). `), ...fr(consigne(e, "prevision"))] },
        ],
      },
      etapesParQuestion: [["a"], ["b"], ["c", "d"]],
      reponseBreve: reponseBreve(e),
    };
  }
  const q: FragmentConsigne[] = e.variante === "deuxDroites"
    ? [t("Laquelle de ces deux droites ajuste le mieux le nuage, au sens des moindres carrés ? Justifie par la somme des carrés des écarts verticaux.")]
    : [t("Laquelle de ces deux droites est la droite des moindres carrés ? Justifie par un calcul.")];
  return { section: { enteteFragments: fr(situation(e)), enteteHtml: tableauHtml(tableau(e)), questions: [{ consigne: q }] }, etapesParQuestion: [["a", "b", "c", "d"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  const c = correctionDetailleeMeilleurAjustement(e);
  if (e.variante === "aberrant") return { ...etapesDuCorrige(c, ["a"]), methode: 1, piege: 0, nombres: 1 };
  // deuxDroites : méthode donnée par la consigne ; mayerMoindres : l'élève doit penser à comparer S.
  return { ...etapesDuCorrige(c), methode: e.variante === "deuxDroites" ? 0 : 1, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "aberrant")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Point aberrant repéré et expliqué par le contexte : "), ...fr(reponse(e, "repere"))], points: 1 },
        { sousQuestion: "b", critere: [t("Coefficients : "), ...fr(reponse(e, "correlations")), t(" ; |r| augmente sans le point")], points: 1 },
        { sousQuestion: "c", critere: [t("Droite des sept autres points : "), ...fr(reponse(e, "droite"))], points: 1 },
        { sousQuestion: "d", critere: [t("Prévision avec cette droite : "), ...fr(reponse(e, "prevision"))], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Point aberrant gardé dans les calculs de la droite")], cout: "0 pt sur la droite, prévision notée sans double pénalité" },
        { description: [t("R² donné à la place de r")], cout: "−0,5" },
      ],
      reponsesAcceptees: [[t("Prévision calculée avec a et b arrondis ou non arrondis")]],
    };
  const premier = e.variante === "deuxDroites" ? 0.5 : 0.5;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: e.variante === "deuxDroites" ? [t("Écart vertical d'un point : "), ...fr(reponse(e, "ecart"))] : [t("Point moyen : "), ...fr(reponse(e, "pointMoyen"))], points: premier },
      { sousQuestion: "b", critere: [t("Somme des carrés des écarts à d₁ : "), ...fr(reponse(e, "somme1"))], points: 1.25 },
      { sousQuestion: "c", critere: [t("Somme des carrés des écarts à d₂ : "), ...fr(reponse(e, "somme2"))], points: 1.25 },
      { sousQuestion: "d", critere: [t("Conclusion justifiée par la plus petite somme")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Écarts additionnés sans être élevés au carré")], cout: "0 pt sur les sommes" },
      { description: [t(e.variante === "deuxDroites" ? "Droite choisie parce qu'elle passe par plus de points" : "« Celle qui passe par G » (les deux y passent)")], cout: "0 pt sur la conclusion" },
    ],
    reponsesAcceptees: [[t("Sommes calculées dans un tableau des écarts ; écart d'une unité sur le dernier chiffre dû aux arrondis")]],
  };
}

export function profilMeilleurAjustement(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante, ...(e.variante === "aberrant" ? { calcul: "calculatrice" as const } : {}) };
}

export const adaptateurEvaluationMeilleurAjustement: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Quel est le meilleur ajustement ? — Évaluation",
  nomFichierBase: "meilleur-ajustement",
  genererInstance: genererExerciceMeilleurAjustement,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeMeilleurAjustement,
  bareme,
  enoncePapier,
  profilInstance: profilMeilleurAjustement,
  calculatriceIndispensable: ["aberrant"],
};
