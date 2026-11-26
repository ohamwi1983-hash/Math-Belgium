import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import { PHASES_PAR_VARIANTE } from "./core/types";
import type { ExerciceDecimale } from "./core/types";
import { consigne, consigneGenerale, fracL, reponse, xL } from "./ui/format";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDecimale } from "./index";
import type { IdVarianteDecimale } from "./index";
import { correctionDetailleeDecimale } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen16`. Énoncés papier : « Écris m/n sous forme décimale et donne la
 * longueur de sa période. Sans poser la division, combien de chiffres cette période pouvait-elle
 * compter au plus ? Justifie. » ; « Écris x = … sous forme de fraction irréductible. » ; « Sans
 * effectuer la division, dis si … a une écriture décimale limitée ou illimitée périodique. Justifie. »
 * Les écrans passent dans le corrigé « comme au tableau » (partagé avec l'appli).
 */

type E = ExerciceDecimale;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES_PAR_VARIANTE[e.variante].map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "diviser":
      return [f(`${fracL(e.num, e.den)}=${xL(e)}`), t(` ; période de ${e.dev.periode.length} chiffre${e.dev.periode.length > 1 ? "s" : ""} ; au plus ${e.den - 1} chiffres`)];
    case "versFraction":
      return [f(`${xL(e)}=${fracL(e.num, e.den)}`)];
    case "critere":
      return [t(e.verdict === "limitee" ? "Limitée : " : "Illimitée périodique : "), f(`${fracL(e.numDonne, e.denDonne)}=${fracL(e.num, e.den)}`), t(" et "), f(`${e.den}`), t(e.verdict === "limitee" ? " ne contient que des facteurs 2 et 5" : " contient un facteur premier autre que 2 et 5")];
  }
}

function enoncePapier(e: E): EnoncePapier {
  let entete: FragmentConsigne[];
  switch (e.variante) {
    case "diviser":
      entete = [t("Écris "), f(fracL(e.num, e.den)), t(" sous forme décimale et donne la longueur de sa période. Sans poser la division, combien de chiffres cette période pouvait-elle compter au plus ? Justifie.")];
      break;
    case "versFraction":
      entete = [t("Écris "), f(`x=${xL(e)}`), t(" sous forme de fraction irréductible.")];
      break;
    case "critere":
      entete = [t("Sans effectuer la division, dis si "), f(fracL(e.numDonne, e.denDonne)), t(" a une écriture décimale limitée ou illimitée périodique. Justifie.")];
      break;
  }
  return { section: { enteteFragments: entete, questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_PAR_VARIANTE[e.variante].map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

/** Étapes lues sur le corrigé ; « longueur » (diviser) est une pure lecture de l'écriture trouvée.
 * Méthode imposée (0). Piège dans les données : période « 9 » (versFraction) ; critere : CONSTANT 1
 * (la fraction donnée est toujours réductible : il faut simplifier avant de juger), identique dans
 * les deux verdicts. `sansCharge` : la division posée peut compter jusqu'à dix lignes. */
function criteresDifficulte(e: E): CriteresDifficulte {
  const piege = e.variante === "critere" ? 1 : e.variante === "versFraction" && e.neuf ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeDecimale(e), e.variante === "diviser" ? ["b"] : []), methode: 0, piege, nombres: 0, sansCharge: true };
}

const LIBELLES: Record<string, string[]> = {
  diviser: ["Division posée et écriture périodique", "Longueur de la période", "Borne n − 1 justifiée par les restes"],
  versFraction: ["Multiples de x choisis", "Différence : les périodes s'éliminent", "Fraction irréductible"],
  critere: ["Fraction simplifiée", "Décomposition du dénominateur", "Conclusion par le critère des facteurs 2 et 5"],
};
const POINTS: Record<string, number[]> = { diviser: [2, 0.5, 1.5], versFraction: [1, 1.5, 1.5], critere: [1, 1, 2] };

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_PAR_VARIANTE[e.variante].map((p, i) => ({ sousQuestion: LETTRES[i], critere: [t(`${LIBELLES[e.variante][i]} : `), ...reponse(e, p)], points: POINTS[e.variante][i] })),
    erreursFrequentes:
      e.variante === "diviser"
        ? [{ description: [t("Valeur approchée donnée sans période")], cout: "−1" }, { description: [t("Borne n au lieu de n − 1 (reste nul compté)")], cout: "−0,5" }]
        : e.variante === "versFraction"
          ? [{ description: [t("Division par une puissance de 10")], cout: "0 pt sur la fraction" }, { description: [t("Fraction juste mais non simplifiée")], cout: "−0,5" }]
          : [{ description: [t("Critère appliqué à la fraction non simplifiée")], cout: "0 pt sur la conclusion" }, { description: [t("Conclusion sans référence aux facteurs 2 et 5")], cout: "−1" }],
    reponsesAcceptees: [[t(e.variante === "critere" ? "La division effectuée en vérification ; toute justification par le dénominateur irréductible" : "Toute écriture équivalente (période notée par une barre ou entre parenthèses)")]],
  };
}

/** `forme` = variante (+ période « 9 » pour versFraction, structure reproduite), jamais le verdict de
 * critere. Aucun `calcul` (règle du 24/11) : la démarche est évaluée (division posée et borne par les
 * restes, 10ᵏ⁺ᵖx − 10ᵏx, critère des facteurs 2 et 5) ; tiré « interdite » et « autorisée ». */
export function profilDecimale(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante === "versFraction" && e.neuf ? "versFraction-neuf" : e.variante };
}

export const adaptateurEvaluationDecimale: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Écriture décimale et fraction — Évaluation",
  nomFichierBase: "ecriture-decimale-fraction",
  genererInstance: genererExerciceDecimale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteDecimale),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDecimale,
  bareme,
  enoncePapier,
  profilInstance: profilDecimale,
};
