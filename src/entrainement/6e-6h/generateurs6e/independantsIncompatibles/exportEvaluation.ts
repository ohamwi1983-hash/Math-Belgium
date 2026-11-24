import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice160 } from "../../core6e/independantsIncompatibles";
import { verdictCalcule } from "../../core6e/independantsIncompatibles";
import { consigne, consigneGenerale, consignePapier, figure160, phases160, reponse, syntheseVerdict } from "../../ui6e/format160";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercice160 } from "./index";
import { correctionDetaillee160 } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de `6gen160` « Indépendants ou incompatibles ? ».
 * Énoncé papier = données (texte, et Venn ou tableau en figure SVG) + UNE consigne globale « …
 * indépendants, incompatibles, ou ni l'un ni l'autre ? Justifie par un calcul. » ; les écrans
 * (probabilités, intersection, produit, verdict) deviennent les étapes du corrigé. Tout est exact
 * (fractions, décimaux exacts) et c'est la démarche qui est évaluée : aucun `calcul` (tiré
 * calculatrice interdite ET autorisée). Le verdict, tiré au tiers dans la variante, n'est jamais un
 * cas particulier ni dans la `forme` ; niveau et durée constants dans la variante (critères fixes,
 * `sansCharge`).
 */

type E = Exercice160;
const t = texte;
const f = latex;
const fr = (x: unknown): FragmentConsigne[] => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  const fig = figure160(e);
  return { enteteFragments: fr(consigneGenerale(e)), ...(fig ? { enteteHtml: fig } : {}), questions: phases160(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(syntheseVerdict(e));
}

function enoncePapier(e: E): EnoncePapier {
  const fig = figure160(e);
  return {
    section: { enteteFragments: fr(consigneGenerale(e)), ...(fig ? { enteteHtml: fig } : {}), questions: [{ consigne: fr(consignePapier()) }] },
    etapesParQuestion: [phases160(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Écrans de pure lecture : P(A), P(B) et P(A ∩ B) lus dans le tableau (totaux, case) ; P(A ∩ B)
 * lue dans le Venn (partie commune). Méthode 1 (choisir les deux tests du cours), piège 1 constant
 * (la confusion incompatibles / indépendants est dans toutes les données : jamais selon le verdict). */
export function lecturesDe(e: E): string[] {
  const ph = phases160(e);
  const lettre = (p: string) => lettreEtape(ph.indexOf(p as never));
  if (e.variante === "tableau") return [lettre("probas"), lettre("inter")];
  if (e.variante === "venn") return [lettre("inter")];
  return [];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee160(e), lecturesDe(e)), methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases160(e);
  const poids: Record<string, number> =
    ph.length === 4 ? { probas: 1, inter: 1, produit: 0.5, verdict: 1.5 } : ph.length === 3 ? { inter: 1, produit: 1, verdict: 2 } : { produit: 1.5, verdict: 2.5 };
  const critere = (p: string): FragmentConsigne[] => {
    if (p === "probas") return [t("Probabilités de "), f("A"), t(" et de "), f("B"), t(" : "), ...fr(reponse(e, "probas"))];
    if (p === "inter") return [t(e.variante === "valeurs" ? "Formule d'addition retournée : " : "Intersection lue ou comptée, sur l'effectif total : "), ...fr(reponse(e, "inter"))];
    if (p === "produit") return [t("Produit calculé : "), ...fr(reponse(e, "produit"))];
    return [t("Les deux tests comparés et conclusion : "), ...fr(reponse(e, "verdict"))];
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: critere(p), points: poids[p] })),
    erreursFrequentes: [
      { description: [t("« Incompatibles, donc indépendants » (ou l'inverse)")], cout: "0 pt sur la conclusion" },
      { description: [t("Conclusion sans comparer "), f("P(A\\cap B)"), t(" et "), f("P(A)\\times P(B)")], cout: "moitié des points de la conclusion" },
      { description: [t("Indépendance conclue sur deux valeurs seulement proches")], cout: "0 pt sur la conclusion" },
      ...(e.variante === "venn" ? [{ description: [t("Région « A seulement » prise pour "), f("A")], cout: "0 pt sur les probabilités" }] : []),
    ],
    reponsesAcceptees: [[t("Toute écriture exacte (fraction non réduite, décimal exact, pourcentage)")]],
  };
}

/** Même variante (et, pour « valeurs », même donnée : P(A ∩ B) ou P(A ∪ B)) dans toutes les séries ;
 * le verdict reste tiré au hasard. */
export function profil160(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante === "valeurs" ? `valeurs|${e.donnee}` : e.variante };
}

export const adaptateurEvaluation160: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Indépendants ou incompatibles ? — Évaluation",
  nomFichierBase: "independants-incompatibles",
  genererInstance: genererExercice160,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee160,
  bareme,
  enoncePapier,
  profilInstance: profil160,
};

/** Verdict recalculé (contrôles des outils de vérification). */
export const verdict160 = verdictCalcule;
