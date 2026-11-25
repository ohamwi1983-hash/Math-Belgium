import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice102, Variante102 } from "../../core6e/trianglePascal";
import { phases102 } from "../../core6e/trianglePascal";
import { consigne102, consigneGlobale102, figurePascal, recap102, reponse102, situation102 } from "../../ui6e/formatTrianglePascal";
import { CATALOGUE_102, construireAvecVariante102, genererExercice102 } from "./index";
import { correctionDetaillee102 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen102` « Triangle de Pascal et propriétés ». Énoncé papier = situation
 * (+ figure des deux lignes, « ? » aux cases cherchées) + question ; les écrans deviennent les étapes
 * du corrigé (figure complétée sous l'étape « symétrique »). Profil `calcul: 'exacte'` pour
 * « ligne », « symétrie » et « identité » (touche nCr : la calculatrice donnerait la réponse ; la
 * consigne dit « sans calculatrice ») ; « parties » sans `calcul` (modéliser 2ⁿ − 1). Verdict de
 * « identité » (vrai / faux) tiré à 50 % dans la variante, jamais dans `forme` (= variante) ; niveau
 * et durée constants (deux écrans de décision). Regroupement a), b), c) : variante « identité »
 * (entrée `6gen102` de `REGROUPEMENTS`, ligne = l'égalité).
 */

type E = Exercice102;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  const fig = figurePascal(e);
  return { enteteFragments: fr(situation102(e)), ...(fig ? { enteteHtml: fig } : {}), questions: phases102(e).map((p) => ({ consigne: fr(consigne102(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const ph = phases102(e);
  if (e.variante === "parties" || e.variante === "identite") return fr(reponse102(e, ph.at(-1)!));
  return ph.flatMap((p, i) => [t(i > 0 ? " ; " : ""), ...fr(reponse102(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  const fig = figurePascal(e);
  return {
    section: { enteteFragments: fr(situation102(e)), ...(fig ? { enteteHtml: fig } : {}), questions: [{ consigne: fr(consigneGlobale102(e)) }] },
    etapesParQuestion: [phases102(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: phases102(e).flatMap((p, i) => [t(i > 0 ? " ; " : ""), ...fr(recap102(e, p))]) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Connaître : méthode 0 (propriété imposée par la question) sauf « identité » (choisir la
  // propriété : 1). Piège dans les DONNÉES : la partie vide (ou les parties à un élément) à retirer
  // dans « parties ». Niveau constant dans un verdict (identité : deux décisions sans charge).
  return { ...etapesDuCorrige(correctionDetaillee102(e), []), methode: e.variante === "identite" ? 1 : 0, piege: e.variante === "parties" ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases102(e);
  const poids = ph.length === 3 ? [1.5, 1, 1.5] : e.variante === "identite" ? [1.5, 2.5] : [2, 2];
  const intitule: Record<string, string> = {
    pascal: "Relation de Pascal appliquée",
    symetrique: "Symétrie appliquée",
    somme: "Somme de la ligne",
    partenaire: "Symétrie citée et appliquée",
    suivant: "Relation de Pascal citée et appliquée",
    toutes: "Nombre total de parties",
    contrainte: "Complément",
    propriete: "Propriété citée",
    verdict: "Verdict justifié",
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(`${intitule[p]} : `), ...fr(reponse102(e, p))], points: poids[i]! })),
    erreursFrequentes: [
      ...(e.variante === "ligne" || e.variante === "symetrie" ? [{ description: [t("Mauvais partenaire de symétrie (indices dont la somme n'est pas n)")], cout: "0 pt sur l'étape concernée" }] : []),
      ...(e.variante === "parties" ? [{ description: [t("Partie vide oubliée (ou comptée à tort)")], cout: "0 pt sur l'étape 2" }] : []),
      ...(e.variante === "identite" ? [{ description: [t("Verdict sans propriété citée")], cout: "moitié des points de l'étape 2" }] : []),
    ],
    reponsesAcceptees: [[t("Toute écriture exacte (somme, puissance de 2)")]],
  };
}

export function profil102(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante, ...(e.variante === "parties" ? {} : { calcul: "exacte" as const }) };
}

export const adaptateurEvaluation102: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Triangle de Pascal — Évaluation",
  nomFichierBase: "triangle-de-pascal",
  genererInstance: genererExercice102,
  catalogueVariantes: CATALOGUE_102,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante102(id as Variante102),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee102,
  bareme,
  enoncePapier,
  profilInstance: profil102,
};
