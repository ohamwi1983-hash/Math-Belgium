import type { ExerciceBinomeNewton } from "../../core6e/binomeNewton.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN45, binomeLatex, polynomeLatex, questionsPapier45, situationPapier45 } from "../../ui6e/formatBinomeNewton";
import { phasesPourExercice } from "../../moteur6e/typesBinomeNewton";
import type { PhaseBinomeNewton } from "../../moteur6e/typesBinomeNewton";
import { approximationC, termeNegligeC, valeurExacteC } from "../../moteur6e/verificationBinomeNewton";
import { combinaisonBig, versNombre } from "../../moteur6e/saisieCombinatoire";
import { arrondiLatex, decimalLatex, milliers } from "../../ui6e/fragmentsCombinatoire";
import { construireAdaptateurCombinatoire } from "../adaptateurCombinatoire";
import { correctionDetailleeBinomeNewton } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomeNewton } from "./index";

/**
 * Adaptateur papier de `6gen45` (binôme de Newton) — refonte du lot E (audit 6e ch. 7) : A et B =
 * expression + consigne globale (« Développe et réduis… », « Calcule le terme de rang r »,
 * regroupables a), b), c)) ; C et D gardent de VRAIES questions (approximation, terme négligé,
 * comparaison ; nombres de la ligne suivante, somme). Corrigé « comme au tableau » partagé avec l'écran.
 *
 * Profil (Casio Graph Math+) : cas particulier « unitaire » (A, B : a ou b égal à ±1, une puissance se
 * réduit à ±1) ; C `calculatrice` (sa troisième question demande la valeur au dix-millième) ; D `exacte`
 * (touche nCr : décision du 24/11) ; A, B rien (développement évalué).
 */

type E = ExerciceBinomeNewton;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const LIBELLE_CAS_PARTICULIER_6GEN45 = "Inclure un cas particulier (a ou b égal à 1 ou à −1)";

export function profilBinomeNewton(e: E): ProfilInstance {
  switch (e.famille) {
    case "A":
    case "B":
      return { casParticulier: Math.abs(e.a) === 1 || Math.abs(e.b) === 1 ? "unitaire" : null };
    case "C":
      return { casParticulier: null, calcul: "calculatrice" };
    case "D":
      return { casParticulier: null, calcul: "exacte" };
  }
}

function polynome(e: E & { famille: "A" }): string {
  return polynomeLatex(e.termes.map((x) => ({ coefficient: x.coefficientFinal, exposant: x.exposantX })));
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [l(`${binomeLatex(e.a, e.b, e.n)}=${polynome(e)}`)];
    case "B":
      return e.sousType === "rang" ? [l(`T_{${e.rang}}=${milliers(e.coefficientFinal)}${e.p === 0 ? "" : e.p === 1 ? "x" : `x^{${e.p}}`}`)] : [t("Coefficient : "), l(milliers(e.coefficientFinal))];
    case "C":
      return [t("a) "), l(decimalLatex(versNombre(approximationC(e)), 12)), t(" ; b) "), l(decimalLatex(versNombre(termeNegligeC(e)), 12)), t(" ; c) "), l(`\\approx ${arrondiLatex(versNombre(valeurExacteC(e)), 4)}`)];
    case "D":
      return [t("a) "), l(e.positions.map((k) => `C_{${e.n + 1}}^{${k}}=${milliers(Number(combinaisonBig(e.n + 1, k)))}`).join("\\;;\\;")), t(" ; b) "), l(`2^{${e.n + 1}}=${milliers(2 ** (e.n + 1))}`)];
  }
}

function criteres(e: E): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeBinomeNewton(e), []);
  switch (e.famille) {
    case "A":
      // Méthode imposée (développer par le binôme) ; piège dans les données : un terme négatif (signes).
      return { ...base, methode: 0, piege: e.a < 0 || e.b < 0 ? 1 : 0, nombres: 0 };
    case "B":
      // Rang k + 1 (ou exposant n − k) à traduire en k, signes : piège dans les données.
      return { ...base, methode: 1, piege: e.sousType === "rang" || e.a < 0 || e.b < 0 ? 1 : 0, nombres: 0 };
    case "C":
      return { ...base, methode: 0, piege: 0 };
    case "D":
      return { ...base, methode: 0, piege: 0, nombres: 0 };
  }
}

function bareme(e: E): BaremeExercice {
  switch (e.famille) {
    case "A":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Coefficients binomiaux (ligne "), l(`${e.n}`), t(")")], points: 1 },
          { sousQuestion: "b", critere: [t("Coefficients des termes, signes compris")], points: 2 },
          { sousQuestion: "c", critere: [t("Polynôme réduit et ordonné")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [t("Signe faux d'une puissance impaire d'un nombre négatif")], cout: "−0,5 par terme" },
          { description: [t("Coefficient de x non élevé à la puissance")], cout: "moitié des points de l'étape 2" },
        ],
      };
    case "B":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Valeur de k : "), l(`k=${e.k}`)], points: 1 },
          { sousQuestion: "b", critere: [t("Les trois facteurs : "), l(`${milliers(e.coefficientBinomial)}`), t(", "), l(milliers(e.aPuissance)), t(", "), l(milliers(e.bPuissance))], points: 2 },
          { sousQuestion: "c", critere: [t("Produit : "), l(milliers(e.coefficientFinal))], points: 1 },
        ],
        erreursFrequentes: [{ description: [t(e.sousType === "rang" ? "k pris égal au rang (terme suivant calculé)" : "k pris égal à l'exposant de x")], cout: "0 pt sur l'étape 1" }],
      };
    case "C":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Approximation "), l("1+n\\varepsilon")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Terme négligé "), l("C_n^2\\,\\varepsilon^2")], points: 1.5 },
          { sousQuestion: "c", critere: [t("Valeur au dix-millième et comparaison de l'écart")], points: 1 },
        ],
        erreursFrequentes: [{ description: [l("1+\\varepsilon"), t(" au lieu de "), l("1+n\\varepsilon")], cout: "0 pt sur a)" }],
      };
    case "D":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Relation de Pascal appliquée aux trois nombres")], points: 3 },
          { sousQuestion: "b", critere: [t("Somme "), l(`2^{${e.n + 1}}`)], points: 1 },
        ],
        erreursFrequentes: [{ description: [t("Somme de la ligne donnée au lieu de la suivante")], cout: "0 pt sur b)" }],
      };
  }
}

export const adaptateurEvaluationBinomeNewton: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseBinomeNewton>({
  titreDocument: "Binôme de Newton — Évaluation",
  nomFichierBase: "binome-newton",
  genererInstance: genererExerciceBinomeNewton,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  format: FORMAT_6GEN45,
  phases: phasesPourExercice,
  situation: situationPapier45,
  questions: questionsPapier45,
  reponseBreve,
  correction: correctionDetailleeBinomeNewton,
  bareme,
  criteres,
  profil: profilBinomeNewton,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER_6GEN45,
});
