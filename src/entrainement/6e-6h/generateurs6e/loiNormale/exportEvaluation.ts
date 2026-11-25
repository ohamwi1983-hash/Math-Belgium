import type { ExerciceLoiNormale } from "../../core6e/loiNormale.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN51, NORMALE, aArrondis, equationLatex, evenementDirect, latexForme, zL } from "../../ui6e/formatLoiNormale";
import { donneesEnLigne } from "../../ui6e/fragmentsCombinatoire";
import { phasesPourExercice } from "../../moteur6e/typesLoiNormale";
import type { PhaseLoiNormale } from "../../moteur6e/typesLoiNormale";
import { effectifReference, equationJusteDe, probabilitesAcceptees, zAcceptes } from "../../moteur6e/verificationLoiNormale";
import { dl, frag } from "../../ui6e/corrigeVariablesAleatoires";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { arrondir, bornesZ, formeAttendue } from "./calculs";
import { correctionDetailleeLoiNormale } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiNormale } from "./index";

/**
 * Adaptateur papier de `6gen51` (loi normale, 6e ch. 8, § 6) — refonte du lot E de l'audit : situation en
 * prose + consigne globale (plus de « standardise puis lis la table », « lis à l'envers ») ; les écrans
 * deviennent les étapes du corrigé, calculé par la MÉTHODE DE LA TABLE (z au centième, Φ à 4 décimales).
 * **Table de Φ** (décision de l'utilisateur du 18/11/2026) : `besoinTablePhi` pour A–D → UNE table
 * complète en annexe du document (`evaluationLocal.ts::annexesDuDocument`), jamais d'extrait dans
 * l'énoncé ; la consigne y renvoie (« table de Φ en annexe »). E (règle empirique) n'en a pas besoin.
 * B et E avec un groupe : DEUX vraies questions (probabilité ou proportion, puis effectif).
 *
 * Profil (règle du 24/11, Casio Graph Math+ : `NormCD`, `InvNormCD` à queue gauche, droite ou centrale) :
 * `exacte` quand la calculatrice donne directement la réponse — A et B, C et D « ≤ », « ≥ », « centrée » ;
 * C et D « depuis 0 » (la transformation reste à faire) et E : pas de `calcul`. Cas particuliers (audit,
 * mesurés) : « lectureDirecte » (A, B à une borne : aucune symétrie à faire), « sansEffectif » (B, E sans
 * groupe : une étape de moins), joints par « + ».
 */

type E = ExerciceLoiNormale;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const LIBELLE_CAS_PARTICULIER_6GEN51 = "Inclure un cas particulier (lecture directe dans la table, ou sans estimation d'effectif)";

/** « d'ampoules », « de pommes ». */
function de(mot: string): string {
  return /^[aeiouéèêh]/i.test(mot) ? `d'${mot}` : `de ${mot}`;
}

export function situationPapier51(e: E): FragmentConsigne[] {
  const donnees = donneesEnLigne(FORMAT_6GEN51.donnees(e));
  if (e.famille === "A" || e.famille === "C") return [l("Z"), t(" suit la loi normale centrée réduite "), l(NORMALE(0, 1)), t(". "), ...donnees];
  return donnees;
}

export const CONSIGNE_PROBA_51 = "Calcule cette probabilité, arrondie à $10^{-4}$ (table de $\\Phi$ en annexe).";
export const CONSIGNE_T_51 = "Détermine $t$ au centième (table de $\\Phi$ en annexe).";
export const CONSIGNE_A_51 = "Détermine $a$ au dixième (table de $\\Phi$ en annexe).";

function questions(e: E): { consigne: FragmentConsigne[]; etapes: string[] }[] {
  const lettres = lettresEcrans(phasesPourExercice, e);
  switch (e.famille) {
    case "A":
      return [{ consigne: frag(CONSIGNE_PROBA_51), etapes: lettres }];
    case "B":
      return e.population === null
        ? [{ consigne: frag(CONSIGNE_PROBA_51), etapes: lettres }]
        : [
            { consigne: frag(CONSIGNE_PROBA_51), etapes: ["a", "b", "c"] },
            { consigne: [t(`Combien ${de(e.contexte.individus)} du groupe peut-on s'attendre à trouver ? Arrondis à l'unité.`)], etapes: ["d"] },
          ];
    case "C":
      return [{ consigne: frag(CONSIGNE_T_51), etapes: lettres }];
    case "D":
      return [{ consigne: frag(CONSIGNE_A_51), etapes: lettres }];
    case "E": {
      const q1 = [t("À l'aide de la règle empirique du cours, estime la probabilité de cet événement.")];
      return e.population === null
        ? [{ consigne: q1, etapes: lettres }]
        : [
            { consigne: q1, etapes: ["a", "b"] },
            { consigne: [t(`Combien ${de(e.contexte.individus)} du groupe environ ? Arrondis à l'unité.`)], etapes: ["c"] },
          ];
    }
  }
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
    case "B": {
      const pt = probabilitesAcceptees(e)[0];
      const r: FragmentConsigne[] = [l(`${evenementDirect(e)}\\approx ${dl(arrondir(pt, 4))}`)];
      if (e.famille === "B" && e.population !== null) r.push(t(` ; environ ${effectifReference(e)} ${e.contexte.individus}`));
      return r;
    }
    case "C":
      return [l(`t\\approx ${zAcceptes(e).exactes.map(zL).join("\\ \\text{ou}\\ ")}`)];
    case "D":
      return [l(`a\\approx ${aArrondis(e).map((x) => dl(x)).join("\\ \\text{ou}\\ ")}`)];
    case "E": {
      const r: FragmentConsigne[] = [t("Environ "), l(dl(probabilitesAcceptees(e)[0]))];
      if (e.population !== null) r.push(t(` ; environ ${effectifReference(e)} ${e.contexte.individus}`));
      return r;
    }
  }
}

function criteres(e: E): CriteresDifficulte {
  // Méthode 1 partout (choisir l'écriture avec Φ, l'égalité de table ou la règle parmi celles du cours).
  // Piège dans les DONNÉES : une borne négative (symétrie à faire). Lecture inverse de la table (C, D :
  // écran b) = pure lecture.
  const corr = correctionDetailleeLoiNormale(e);
  switch (e.famille) {
    case "A":
    case "B": {
      const { z1, z2 } = bornesZ(e);
      return { ...etapesDuCorrige(corr, []), methode: 1, piege: z1 < 0 || (z2 !== null && z2 < 0) ? 1 : 0, nombres: 1 };
    }
    case "C":
    case "D":
      return { ...etapesDuCorrige(corr, ["b"]), methode: 1, piege: equationJusteDe(e).oppose ? 1 : 0, nombres: 1 };
    case "E":
      return { ...etapesDuCorrige(corr, []), methode: 1, piege: 0, nombres: 1 };
  }
}

function bareme(e: E): BaremeExercice {
  const acceptees = [[t("La valeur lue dans la table comme celle de la calculatrice (écart de quelques "), l("10^{-4}"), t(" dû aux arrondis)")]];
  switch (e.famille) {
    case "A":
    case "B": {
      const { z1, z2 } = bornesZ(e);
      const forme = formeAttendue(e.sousType, z1, z2);
      const [pt] = probabilitesAcceptees(e);
      const lf = e.famille === "A" ? "a" : "b";
      const lp = e.famille === "A" ? "b" : "c";
      const criteres = [
        ...(e.famille === "B" ? [{ sousQuestion: "a", critere: [t("Standardisation : "), l(z2 === null ? `z=${zL(z1)}` : `z_1=${zL(z1)},\\ z_2=${zL(z2)}`)], points: 1 }] : []),
        { sousQuestion: lf, critere: [t("Écriture avec Φ : "), l(latexForme(forme, z1, z2))], points: e.famille === "A" ? 2 : 1 },
        { sousQuestion: lp, critere: [t("Table et calcul : "), l(`${evenementDirect(e)}\\approx ${dl(arrondir(pt, 4))}`)], points: e.famille === "B" && e.population !== null ? 1 : 2 },
        ...(e.famille === "B" && e.population !== null ? [{ sousQuestion: "d", critere: [t(`Effectif : environ ${effectifReference(e)}`)], points: 1 }] : []),
      ];
      return {
        reponseFinale: reponseBreve(e),
        criteres,
        erreursFrequentes: [
          { description: [t("Φ lue pour un nombre négatif, ou complément oublié")], cout: `0 pt sur l'étape ${e.famille === "A" ? 1 : 2}` },
          ...(e.famille === "B" ? [{ description: [t("Division par la variance au lieu de l'écart-type")], cout: "0 pt sur l'étape 1, la suite notée sur cette valeur" }] : []),
        ],
        reponsesAcceptees: [...acceptees, ...(e.famille === "B" && e.population !== null ? [[t("L'effectif à une unité près (arrondi de la probabilité)")]] : [])],
      };
    }
    case "C":
    case "D": {
      const q = equationJusteDe(e);
      const lt = e.famille === "C" ? "t" : "z";
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Égalité de table : "), l(equationLatex(q, lt))], points: e.famille === "C" ? 2 : 1.5 },
          { sousQuestion: "b", critere: [t("Lecture inverse : "), l(`${lt}\\approx ${zAcceptes(e).exactes.map(zL).join("\\ \\text{ou}\\ ")}`)], points: e.famille === "C" ? 2 : 1 },
          ...(e.famille === "D" ? [{ sousQuestion: "c", critere: [t("Retour à la variable : "), l(`a\\approx ${aArrondis(e).map((x) => dl(x)).join("\\ \\text{ou}\\ ")}`)], points: 1.5 }] : []),
        ],
        erreursFrequentes: [{ description: [t("Signe de la borne oublié (probabilité à gauche plus petite que 0,5)")], cout: "moitié des points de l'étape 2" }],
        reponsesAcceptees: [[t("Les deux cases voisines quand la valeur tombe entre deux ; la valeur de la calculatrice (loi normale inverse)")]],
      };
    }
    case "E": {
      const prop = probabilitesAcceptees(e)[0];
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t(`Bornes à ${e.k} écart${e.k > 1 ? "s" : ""}-type${e.k > 1 ? "s" : ""} de la moyenne`)], points: 1 },
          { sousQuestion: "b", critere: [t("Proportion par la règle empirique : "), l(dl(prop))], points: e.population === null ? 3 : 2 },
          ...(e.population !== null ? [{ sousQuestion: "c", critere: [t(`Effectif : environ ${effectifReference(e)}`)], points: 1 }] : []),
        ],
        erreursFrequentes: [{ description: [t(e.unCote ? "Les deux côtés comptés au lieu d'un seul" : "Proportion dans l'intervalle au lieu de celle en dehors")], cout: "moitié des points de l'étape 2" }],
        reponsesAcceptees: [[t("La valeur obtenue avec la table de Φ (par exemple "), l(dl(arrondir(probabilitesAcceptees(e)[1], 4))), t(")")]],
      };
    }
  }
}

export function profilLoiNormale(e: E): ProfilInstance {
  const cas: string[] = [];
  if (e.famille === "A" || e.famille === "B") {
    const { z1 } = bornesZ(e);
    if ((e.sousType === "inferieur" && z1 >= 0) || (e.sousType === "superieur" && z1 < 0)) cas.push("lectureDirecte");
  }
  if ((e.famille === "B" || e.famille === "E") && e.population === null) cas.push("sansEffectif");
  const casParticulier = cas.length ? cas.join("+") : null;
  if (e.famille === "A" || e.famille === "B") return { casParticulier, calcul: "exacte" };
  if ((e.famille === "C" || e.famille === "D") && e.sousType !== "depuisZero") return { casParticulier, calcul: "exacte" };
  return { casParticulier };
}

export const adaptateurEvaluationLoiNormale: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseLoiNormale>({
  titreDocument: "Loi normale — Évaluation",
  nomFichierBase: "loi-normale",
  genererInstance: genererExerciceLoiNormale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN51,
  phases: phasesPourExercice,
  situation: situationPapier51,
  questions,
  reponseBreve,
  correction: correctionDetailleeLoiNormale,
  bareme,
  criteres,
  profil: profilLoiNormale,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER_6GEN51,
  besoinTablePhi: (e) => e.famille !== "E",
});
