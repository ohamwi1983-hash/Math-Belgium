import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceFonctionAsymptotes } from "../../core5e/fonctionAsymptotes";
import { estGraphique, estOblique } from "../../core5e/fonctionAsymptotes";
import { avL, consigne, consigneGenerale, figurePapier, formeL, horizL, nomHoriz, PHASES, pointL, reponse } from "../../ui5e/formatFonctionAsymptotes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionAsymptotes } from "./index";
import { correctionDetailleeFonctionAsymptotes } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen65` « Retrouver une fonction à partir de ses asymptotes ». Énoncé papier
 * = la forme de f, les asymptotes et le point (ou le graphique complet, sans aucune valeur écrite)
 * + la consigne globale « détermine f(x) et vérifie l'asymptote verticale » ; les cinq écrans sont les
 * étapes a–e du corrigé. Figure papier : même échelle, carreaux d'une unité, asymptotes et A sur les
 * lignes de la grille ; figure annotée dans le corrigé (étape d).
 */

type E = ExerciceFonctionAsymptotes;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const figureEnonce = (e: E) => `<div style="max-width:7cm;margin:6px auto">${figurePapier(e).replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), ...(estGraphique(e) ? { enteteHtml: figureEnonce(e) } : {}), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, "fonction"));
}

function enoncePapier(e: E): EnoncePapier {
  const inconnues = estOblique(e) ? "a, b, c et p" : "a, b et d";
  if (estGraphique(e))
    return {
      section: { enteteFragments: [t("Le graphique ci-dessous représente une fonction f de la forme "), f(formeL(e)), t(" (graphe complet ; asymptotes en pointillés ; le point A est sur un nœud du quadrillage). Détermine f(x), puis vérifie par une limite l'asymptote verticale.")], enteteHtml: figureEnonce(e), questions: [] },
      reponseBreve: reponseBreve(e),
    };
  return {
    section: {
      enteteFragments: [
        t("Une fonction f de la forme "),
        f(formeL(e)),
        t(" admet l'asymptote verticale d'équation "),
        f(avL(e)),
        t(`, l'asymptote ${nomHoriz(e)} d'équation `),
        f(horizL(e)),
        t(", et son graphe passe par le point "),
        f(pointL(e)),
        t(`. Détermine ${inconnues}, écris f(x), puis vérifie par une limite l'asymptote verticale.`),
      ],
      questions: [],
    },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Cinq étapes qui transforment (une lecture sur le graphique sert une traduction : comptée avec
 * elle) ; méthode 1 (forme donnée) ; piège dans les données : p < 0 (le dénominateur s'écrit x + |p|). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { etapesTransformation: 5, etapesLecture: 0, methode: 1, piege: e.d.p < 0 ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ob = estOblique(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Asymptote verticale traduite : "), ...fr(reponse(e, "av"))], points: 0.5 },
      { sousQuestion: "b", critere: [t(`Asymptote ${nomHoriz(e)} traduite : `), ...fr(reponse(e, "horiz"))], points: ob ? 1 : 0.5 },
      { sousQuestion: "c", critere: [t("Point utilisé, inconnue isolée : "), ...fr(reponse(e, "point"))], points: ob ? 1 : 1.5 },
      { sousQuestion: "d", critere: [t("f(x) écrite : "), ...fr(reponse(e, "fonction"))], points: 0.5 },
      { sousQuestion: "e", critere: [t("Limite à droite de p (signe justifié) : "), ...fr(reponse(e, "verifier"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: ob ? [t("Signe de p faux (dénominateur qui s'annule en −p)")] : [t("Signe de d faux ("), f("x+d"), t(" s'annule en "), f("-d"), t(")")], cout: "0 pt sur l'asymptote verticale, suite notée sans double pénalité" },
      { description: [t("Point substitué sans multiplier par le dénominateur")], cout: "moitié des points du point" },
      { description: [t("Limite infinie de signe faux, ou numérateur non testé en p")], cout: "moitié des points de la vérification" },
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente de f(x) (forme développée, "), f("k+\\dfrac{n}{x-p}"), t(") ; limite à gauche correctement justifiée à la place de la limite à droite")]],
  };
}

/** `forme` = variante : même structure d'une série à l'autre ; aucun cas particulier ni verdict. */
export function profilFonctionAsymptotes(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationFonctionAsymptotes: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Retrouver une fonction à partir de ses asymptotes — Évaluation",
  nomFichierBase: "fonction-depuis-asymptotes",
  genererInstance: genererExerciceFonctionAsymptotes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeFonctionAsymptotes,
  bareme,
  enoncePapier,
  profilInstance: profilFonctionAsymptotes,
};
