import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceLireCourbeExpo, VarianteLireCourbeExpo } from "../../core6e/lireCourbeExponentielle";
import { estCroissanteBase } from "../../core6e/lireCourbeExponentielle";
import { PHASES_LIRE_COURBE_EXPO, consigne, consigneGenerale, figure, reponse } from "../../ui6e/formatLireCourbeExponentielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireCourbeExpo } from "./index";
import { correctionDetailleeLireCourbeExpo } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen148` « Lire une courbe exponentielle y = k·aˣ + c ». Énoncé papier : la
 * COURBE seule avec son asymptote en pointillés (aucun point marqué, aucune coordonnée — décision de
 * l'utilisateur, comme gen8/gen10/6gen85), quadrillage d'une unité : les points d'abscisses 0 et ±1
 * tombent sur des nœuds, ce que l'énoncé dit. Une consigne globale ; les quatre écrans passent dans
 * le corrigé (étapes a–d).
 */

type E = ExerciceLireCourbeExpo;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: figure(e, "papier"), questions: PHASES_LIRE_COURBE_EXPO.map((p) => ({ consigne: consigne(e, p) })) };
}

function enoncePapier(e: E): EnoncePapier {
  const abs = e.xAutre === 1 ? "0 et 1" : "−1 et 0";
  return {
    section: {
      enteteFragments: [
        t("La courbe ci-dessous représente la fonction "),
        f("f(x)=k\\cdot a^{x}+c"),
        t(", où "),
        f("k\\neq 0"),
        t(", "),
        f("a>0"),
        t(" ("),
        f("a\\neq 1"),
        t(") et "),
        f("c"),
        t(` sont des nombres réels ; la droite en pointillés est son asymptote. Les points de la courbe d'abscisses ${abs} sont sur des nœuds du quadrillage. Donne l'équation de l'asymptote, puis détermine `),
        f("k"),
        t(", "),
        f("a"),
        t(" et l'expression de "),
        f("f(x)"),
        t(" en justifiant chaque valeur."),
      ],
      enteteHtml: figure(e, "papier"),
      questions: [],
    },
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [...reponse(e, "asymptote"), t(" ; "), ...reponse(e, "k"), t(" ; "), ...reponse(e, "a"), t(" ; "), ...reponse(e, "expression")];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "html", html: figure(e, "corrige") }, ...PHASES_LIRE_COURBE_EXPO.map((p, i): BlocCorrection => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }))];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // a) lecture de l'asymptote ; b), c), d) transforment. Méthode 1 (f(0) puis rapport des écarts,
  // à choisir) ; piège dans les données : courbe sous son asymptote (k < 0) ou base inférieure à 1.
  return { ...etapesDuCorrige(correctionDetailleeLireCourbeExpo(e), ["a"]), methode: 1, piege: e.k < 0 || !estCroissanteBase(e.base) ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Asymptote horizontale : "), ...reponse(e, "asymptote")], points: 0.5 },
      { sousQuestion: "b", critere: [f("f(0)=k+c"), t(" lu sur l'axe des ordonnées, d'où "), ...reponse(e, "k")], points: 1 },
      { sousQuestion: "c", critere: [t("Rapport des écarts à l'asymptote sur une unité : "), ...reponse(e, "a")], points: 1.5 },
      { sousQuestion: "d", critere: [t("Expression complète : "), ...reponse(e, "expression")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [f("k=f(0)"), t(" (c oublié)")], cout: "0 pt sur k, suite notée sans double pénalité" },
      { description: [t("Rapport des ordonnées au lieu du rapport des écarts à l'asymptote")], cout: "0 pt sur la base" },
      { description: [f("(k\\cdot a)^{x}"), t(" au lieu de "), f("k\\cdot a^{x}")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente de l'expression (base en fraction ou en décimal, "), f("a^{-x}"), t(" avec la base inverse)")]],
  };
}

export function profilLireCourbeExpo(e: E): ProfilInstance {
  return { casParticulier: e.c === 0 ? "asymptote-axe" : null, forme: e.variante };
}

export const adaptateurEvaluationLireCourbeExpo: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lire une courbe exponentielle — Évaluation",
  nomFichierBase: "lire-courbe-exponentielle",
  genererInstance: genererExerciceLireCourbeExpo,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteLireCourbeExpo),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLireCourbeExpo,
  bareme,
  enoncePapier,
  profilInstance: profilLireCourbeExpo,
  libelleCasParticulier: "Asymptote confondue avec l'axe des abscisses (c = 0)",
};
