import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExercicePuissances } from "../../core6e/puissancesSansCalculatrice.types";
import { consigne, consigneGenerale, exposantInverseL, expressionInverseL, expressionSimplifierL, phases, puissanceComparerL, puissanceExacte, reponse, valeurInverse } from "../../ui6e/formatPuissancesSansCalculatrice";
import { qL } from "../../ui6e/nombresExp";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePuissances } from "./index";
import { correctionDetailleePuissances } from "./corrigeDetaille";

/**
 * Adaptateur papier de 6gen146 « Puissances à exposant réel : calculer et comparer sans
 * calculatrice ». Énoncé papier = l'expression et la consigne globale ; seule la variante `inverse`
 * garde deux vraies questions (l'écriture en une puissance, puis la valeur en x₀). Les écrans
 * d'apprentissage passent dans le corrigé (une lettre par écran). Tout est exact : pas de `calcul`
 * « calculatrice », aucun cas particulier ; la conclusion de `comparer` (<, =, >) est un verdict,
 * jamais une `forme`.
 */

type E = ExercicePuissances;
const t = texte;
const f = latex;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "simplifier") return [f(`E=${e.a}^{${e.n}}=${qL(puissanceExacte(e.a, e.n))}`)];
  if (e.variante === "comparer") return reponse(e, "conclusion");
  return [t("a) "), f(`f(x)=${e.a}^{${exposantInverseL(e)}}`), t(" ; b) "), f(`f(${e.x0})=${qL(valeurInverse(e))}`)];
}

function enoncePapier(e: E): EnoncePapier {
  if (e.variante === "simplifier") {
    return { section: { enteteFragments: [t("Sans calculatrice, écris "), f(`E=${expressionSimplifierL(e)}`), t(" comme une seule puissance de "), f(`${e.a}`), t(", puis donne sa valeur exacte.")], questions: [] }, reponseBreve: reponseBreve(e) };
  }
  if (e.variante === "comparer") {
    return { section: { enteteFragments: [t("Sans calculatrice, compare "), f(`A=${puissanceComparerL(e, "gauche")}`), t(" et "), f(`B=${puissanceComparerL(e, "droite")}`), t(". Justifie ta réponse.")], questions: [] }, reponseBreve: reponseBreve(e) };
  }
  return {
    section: {
      enteteFragments: [t("On donne "), f(`f(x)=${expressionInverseL(e)}`), t(", pour tout réel "), f("x"), t(".")],
      questions: [{ consigne: [t("Écris "), f("f(x)"), t(" comme une seule puissance de "), f(`${e.a}`), t(".")] }, { consigne: [t("Calcule "), f(`f(${e.x0})`), t(" sans calculatrice (valeur exacte).")] }],
    },
    etapesParQuestion: [["a"], ["b"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${"abc"[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Règles du cours imposées (Connaître) : méthode 0. Piège dans les DONNÉES : base entre 0 et 1
  // (comparer : l'ordre s'inverse) ; base 1/a ou décimale 0,5… (inverse : signe de a⁻¹).
  // L'écran « sens de variation » de comparer est une lecture (base comparée à 1).
  const lecture = e.variante === "comparer" ? ["b"] : [];
  const piege: 0 | 1 = e.variante === "comparer" ? (e.croissante ? 0 : 1) : e.variante === "inverse" && e.sousType !== "quotient" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleePuissances(e), lecture), methode: 0, piege, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const erreurs: ErreurFrequente[] = [];
  if (e.variante === "simplifier") {
    erreurs.push({ description: [t("Exposants multipliés au lieu d'additionnés (ou l'inverse)")], cout: "0 pt sur l'exposant, valeur notée sans double pénalité" });
    if (e.n < 0) erreurs.push({ description: [t("Exposant négatif lu comme un signe : "), f(`-${e.a ** -e.n}`), t(" au lieu de "), f(qL(puissanceExacte(e.a, e.n)))], cout: "−1" });
    erreurs.push({ description: [t("Valeur approchée obtenue à la calculatrice")], cout: "0 pt sur la valeur" });
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Règle des puissances appliquée, termes en "), f(`\\sqrt{${e.k}}`), t(" simplifiés : "), ...reponse(e, "exposant")], points: 2.5 },
        { sousQuestion: "b", critere: [t("Valeur exacte : "), ...reponse(e, "valeur")], points: 1.5 },
      ],
      erreursFrequentes: erreurs,
      reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction, "), f("a^{-n}"), t(")")]],
    };
  }
  if (e.variante === "comparer") {
    if (!e.croissante) erreurs.push({ description: [t("Ordre des exposants conservé alors que la base est comprise entre 0 et 1")], cout: "0 pt sur la conclusion" });
    erreurs.push({ description: [t("Comparaison obtenue à la calculatrice, sans justification")], cout: "1 pt au plus" });
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Exposants comparés sans calculatrice : "), ...reponse(e, "exposants")], points: 1.5 },
        { sousQuestion: "b", critere: [t("Sens de variation justifié par la base : "), ...reponse(e, "sens")], points: 1 },
        { sousQuestion: "c", critere: [t("Conclusion : "), ...reponse(e, "conclusion")], points: 1.5 },
      ],
      erreursFrequentes: erreurs,
      reponsesAcceptees: [[t("Toute justification équivalente de l'ordre des exposants (carrés, encadrement)")]],
    };
  }
  if (e.sousType !== "quotient") erreurs.push({ description: [t("Signe oublié : "), f(`\\dfrac{1}{${e.a}}`), t(" écrit "), f(`${e.a}`), t(" au lieu de "), f(`${e.a}^{-1}`)], cout: "0 pt sur l'écriture en une puissance, valeur notée sans double pénalité" });
  if (e.sousType !== "inverse") erreurs.push({ description: [t("Base "), f(e.sousType === "decimale" ? `${e.a ** e.j}` : `${e.a ** e.j}`), t(" non réécrite comme une puissance de "), f(`${e.a}`)], cout: "0 pt sur l'écriture en une puissance" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Une seule puissance : "), ...reponse(e, "exposant")], points: 2.5 },
      { sousQuestion: "b", critere: [t("Valeur exacte : "), ...reponse(e, "valeur")], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Tout exposant égal (ordre des termes indifférent)")]],
  };
}

/** Tirage équilibré : aucun cas particulier, valeurs toujours exactes ; `forme` = sous-type (ou sens de
 * variation de la base pour `comparer` — la conclusion <, =, > reste libre d'une série à l'autre). */
export function profilPuissances(e: E): ProfilInstance {
  const forme = e.variante === "comparer" ? `comparer|${e.croissante ? "croissante" : "decroissante"}` : `${e.variante}|${e.sousType}`;
  return { casParticulier: null, calcul: "exacte", forme };
}

export const adaptateurEvaluationPuissancesSansCalculatrice: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Puissances à exposant réel sans calculatrice — Évaluation",
  nomFichierBase: "puissances-sans-calculatrice",
  genererInstance: genererExercicePuissances,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleePuissances,
  bareme,
  enoncePapier,
  profilInstance: profilPuissances,
};
