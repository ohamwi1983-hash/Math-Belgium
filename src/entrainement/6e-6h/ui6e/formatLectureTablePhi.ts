import type { ExerciceLTP, PhaseLTP } from "../core6e/lectureTablePhi";
import { bonneEcriture, cible, ligneColonne, phases, probaTable } from "../core6e/lectureTablePhi";
import { phiTable } from "../core6e/tablePhi";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { dL, p4L, phiL, zL } from "./textesLoisLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationLectureTablePhi";
import { correctionDetailleeLTP } from "../generateurs6e/lectureTablePhi/corrigeDetaille";

/**
 * Couche C — textes de `6gen116` « Lire la table de Φ » : énoncé, consignes, options, champs, aides à
 * deux niveaux (règle du cours, puis posée pour l'instance — jamais la valeur lue), réponses. Source
 * unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceLTP;
type P = PhaseLTP;
const t = tx;
const l = lx;

/** « P(Z\ge 1{,}23) », « P(-0{,}85\le Z\le 1{,}40) ». */
export function evenementL(e: E): string {
  switch (e.variante) {
    case "directe":
      return `P(Z\\le ${zL(e.a)})`;
    case "complement":
      return `P(Z${e.strict ? ">" : "\\ge"} ${zL(e.a)})`;
    case "symetrie":
      return `P(Z\\le ${zL(-e.a)})`;
    case "intervalle":
      return `P(${zL(e.aNeg ? -e.a : e.a)}\\le Z\\le ${zL(e.b)})`;
    case "inverse":
      return `P(Z\\le z)=${p4L(e.p)}`;
    case "inverseSymetrie":
      return `P(Z${e.sens === "sup" ? "\\ge" : "\\le"} z)=${p4L(e.p)}`;
  }
}

export const sensInverse = (e: E) => e.variante === "inverse" || e.variante === "inverseSymetrie";

export const PRECISION_PROBA = "Donne le résultat à quatre décimales.";


export function question(e: E): Frag[] {
  return sensInverse(e)
    ? [t("À l'aide de la table de "), l("\\Phi"), t(", détermine le réel "), l("z"), t(" tel que "), l(evenementL(e)), t(". Donne "), l("z"), t(" au centième (case de la table la plus proche).")]
    : [t("À l'aide de la table de "), l("\\Phi"), t(", calcule "), l(evenementL(e)), t(". "), t(PRECISION_PROBA)];
}

export const SITUATION: Frag[] = [t("La variable "), l("Z"), t(" suit la loi normale centrée réduite "), l("\\mathcal{N}(0\\,;1)"), t(".")];

export const consigneGenerale = (e: E): Frag[] => [...SITUATION, t(" "), ...question(e)];

export function libelle(e: E, p: P): string {
  if (p === "case") return e.variante === "directe" ? "Case" : "Case la plus proche";
  if (p === "ecriture") return "Écriture avec Φ";
  if (p === "cible") return "Valeur à chercher";
  if (p === "z") return "Valeur de z";
  return "Probabilité";
}

/** Écriture d'une option (« 1-\Phi(1{,}23) »). */
export function ecritureL(e: E, id: string): string {
  const A = phiL(e.a);
  const B = phiL(e.b);
  switch (id) {
    case "unMoins":
      return `1-${A}`;
    case "phi":
      return A;
    case "phiMoinsDemi":
      return `${A}-0{,}5`;
    case "demiMoins":
      return `0{,}5-${A}`;
    case "moinsPhi":
      return `-${A}`;
    case "diff":
      return `${B}-${A}`;
    case "somme":
      return `${B}+${A}`;
    case "diffInv":
      return `${A}-${B}`;
    case "unMoinsSomme":
      return `1-${B}-${A}`;
    case "sommeMoinsUn":
      return `${B}+${A}-1`;
    case "unMoinsDiff":
      return `1-${B}+${A}`;
  }
  return "";
}

export function consigne(e: E, p: P): Frag[] {
  if (p === "case")
    return e.variante === "directe"
      ? [t("Dans quelle ligne et quelle colonne de la table lis-tu "), l(phiL(e.a)), t(" ?")]
      : [t("Cherche "), l(p4L(e.p)), t(" dans le corps de la table : quelle valeur de la table en est la plus proche ?")];
  if (p === "ecriture") return [t("Écris "), l(evenementL(e)), t(" à l'aide de valeurs de "), l("\\Phi"), t(" en des nombres positifs (la table ne donne "), l("\\Phi(t)"), t(" que pour "), l("t\\ge 0"), t(").")];
  if (p === "valeur") return e.variante === "directe" ? [t("Lis "), l(phiL(e.a)), t(" dans la table (quatre décimales).")] : [t("Calcule "), l(evenementL(e)), t(" avec les valeurs de la table (quatre décimales).")];
  if (p === "cible") return [t("La table ne contient que des valeurs "), l("\\Phi(t)\\ge 0{,}5"), t(". Quelle probabilité dois-tu chercher dans le corps de la table ?")];
  return [t("Donne "), l("z"), t(" au centième (case de la table la plus proche), avec son signe.")];
}

export function options(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: [l(`${evenementL(e)}=${ecritureL(e, id)}`)] }));
}

export function champs(e: E, p: P): ChampEcran[] {
  if (p === "case")
    return e.variante === "directe"
      ? [
          { label: "Ligne (unité et dixième)", labelLatex: "\\text{ligne}", placeholder: "par exemple 0,7" },
          { label: "Colonne (centième)", labelLatex: "\\text{colonne}", placeholder: "par exemple 0,05" },
        ]
      : [{ label: "Valeur de la table la plus proche", labelLatex: "\\text{case}", placeholder: "quatre décimales" }];
  if (p === "valeur") return [{ label: e.variante === "directe" ? `Φ(${zL(e.a).replace("{,}", ",")})` : "Probabilité", labelLatex: e.variante === "directe" ? `${phiL(e.a)}=` : "P=", placeholder: "quatre décimales" }];
  if (p === "cible") return [{ label: "Probabilité à chercher dans la table", labelLatex: "\\Phi(t)=", placeholder: "quatre décimales" }];
  return [{ label: "z", labelLatex: "z=", placeholder: "au centième" }];
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "case") {
    if (e.variante === "directe") {
      const { ligne, colonne } = ligneColonne(e.a);
      return [t("Ligne "), l(dL(ligne, 1)), t(", colonne "), l(dL(colonne, 2))];
    }
    return [l(p4L(phiTable(e.z)))];
  }
  if (p === "ecriture") return [l(`${evenementL(e)}=${ecritureL(e, bonneEcriture(e))}`)];
  if (p === "valeur") return e.variante === "directe" ? [l(`${phiL(e.a)}=${p4L(phiTable(e.a))}`)] : [l(`${evenementL(e)}\\approx ${p4L(probaTable(e))}`)];
  if (p === "cible") return [l(`${e.sens === "sup" ? "\\Phi(z)" : "\\Phi(-z)"}=1-${p4L(e.p)}=${p4L(cible(e))}`)];
  return [l(`z=${zL(e.z)}`)];
}

export const recap = reponse;

export function aide1(e: E, p: P): AideEcran {
  if (p === "case")
    return e.variante === "directe"
      ? { texte: [t("Dans la table (cours, § 6), la ligne donne l'unité et le dixième de "), l("z"), t(", la colonne son centième.")] }
      : { texte: [t("Sens inverse : on cherche la probabilité dans le corps de la table (les valeurs de "), l("\\Phi"), t("), pas dans les marges ; on garde la case dont l'écart avec elle est le plus petit.")] };
  if (p === "ecriture") {
    if (e.variante === "complement") return { texte: [t("L'aire totale sous la courbe vaut 1, et "), l("P(Z=a)=0"), t(" pour une variable continue :")], latex: "P(Z\\ge a)=1-P(Z\\le a)" };
    if (e.variante === "symetrie") return { texte: [t("La courbe est symétrique par rapport à 0 : l'aire à gauche de "), l("-a"), t(" est égale à l'aire à droite de "), l("a"), t(" :")], latex: "\\Phi(-a)=1-\\Phi(a)" };
    return e.aNeg
      ? { texte: [t("Aire entre deux bornes, puis symétrie pour la borne négative :")], latex: "P(a\\le Z\\le b)=\\Phi(b)-\\Phi(a)\\qquad \\Phi(-t)=1-\\Phi(t)" }
      : { texte: [t("Aire entre deux bornes : aire à gauche de la plus grande moins aire à gauche de la plus petite :")], latex: "P(a\\le Z\\le b)=\\Phi(b)-\\Phi(a)" };
  }
  if (p === "valeur")
    return e.variante === "directe"
      ? { texte: [t("La valeur est au croisement de la ligne et de la colonne trouvées.")] }
      : { texte: [t("Lis chaque valeur de "), l("\\Phi"), t(" dans la table, puis applique l'écriture de l'écran précédent.")] };
  if (p === "cible") return { texte: [t("Passe par l'événement contraire (et la symétrie si "), l("z<0"), t(") :")], latex: "P(Z\\ge z)=1-\\Phi(z)\\qquad \\Phi(-t)=1-\\Phi(t)" };
  return { texte: [t("Le réel "), l("z"), t(" est la somme de l'en-tête de la ligne (unité et dixième) et de celui de la colonne (centième) de la case trouvée.")] };
}

export function aide2(e: E, p: P): AideEcran | null {
  if (p === "case")
    return e.variante === "directe"
      ? { texte: [t("Écris "), l(zL(e.a)), t(" comme la somme d'un nombre à une décimale (la ligne) et d'un nombre de centièmes (la colonne).")] }
      : { texte: [t("Repère les deux cases consécutives qui encadrent "), l(p4L(e.p)), t(" et calcule les deux écarts.")] };
  if (p === "ecriture") {
    if (e.variante === "intervalle")
      return e.aNeg
        ? { texte: [t("Ici, remplace "), l(phiL(-e.a)), t(" par une valeur de "), l("\\Phi"), t(" en "), l(zL(e.a)), t(".")] }
        : { texte: [t("Dessine la cloche et colorie l'aire entre "), l(zL(e.a)), t(" et "), l(zL(e.b)), t(" : quelle aire à gauche faut-il retirer ?")] };
    return e.variante === "symetrie"
      ? { texte: [t("Colorie l'aire à gauche de "), l(zL(-e.a)), t(" : par symétrie, à quelle aire du côté positif est-elle égale ?")] }
      : { texte: [t("Colorie l'aire à droite de "), l(zL(e.a)), t(" : quelle aire à gauche la complète pour faire 1 ?")] };
  }
  if (p === "valeur") {
    if (e.variante === "directe") {
      const { ligne, colonne } = ligneColonne(e.a);
      return { texte: [t("Ligne "), l(dL(ligne, 1)), t(", colonne "), l(dL(colonne, 2)), t(".")] };
    }
    return { texte: [t("Ici :")], latex: `${evenementL(e)}=${ecritureL(e, bonneEcriture(e))}` };
  }
  if (p === "cible")
    return e.sens === "sup"
      ? { texte: [t("Ici, "), l(`1-\\Phi(z)=${p4L(e.p)}`), t(" : isole "), l("\\Phi(z)"), t(".")] }
      : { texte: [t("Ici, la probabilité "), l(p4L(e.p)), t(" est inférieure à "), l("0{,}5"), t(" : "), l("z"), t(" est négatif. Pose "), l("z=-t"), t(" et écris "), l(`1-\\Phi(t)=${p4L(e.p)}`), t(".")] };
  if (e.variante === "inverseSymetrie") return e.sens === "inf" ? { texte: [t("La table donne "), l("t"), t(" positif ; ici "), l("z=-t"), t(".")] } : { texte: [t("Ici, "), l("z"), t(" est positif : c'est le "), l("t"), t(" de la case trouvée.")] };
  return { texte: [t("Lis les en-têtes de la ligne et de la colonne de la case "), l(p4L(phiTable(e.z))), t(".")] };
}

export function explicationChoix(e: E, p: P): string {
  if (p !== "ecriture") return "";
  if (e.variante === "complement") return "L'aire à droite de a est 1 moins l'aire à gauche, qui est Φ(a).";
  if (e.variante === "symetrie") return "Par symétrie de la courbe, l'aire à gauche de −a est l'aire à droite de a, soit 1 − Φ(a).";
  return e.aNeg ? "Φ(b) − Φ(−a), avec Φ(−a) = 1 − Φ(a), donne Φ(b) + Φ(a) − 1." : "L'aire entre a et b est l'aire à gauche de b moins l'aire à gauche de a.";
}

/** `6gen116` sur le socle d'écrans partagé : deux écrans par variante (lecture, écriture avec Φ, sens
 * inverse) ; choix fermé jugé ✗ / ✓ (une tentative), champs à trois tentatives. */
export const DEFINITION_LTP: DefinitionEcrans<E, P> = {
  phases,
  estChoix: (_e, p) => p === "ecriture",
  mode: (e, p) => (p === "ecriture" ? { type: "choix", options: options(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e) => bonneEcriture(e),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeLTP,
  apercuEnonce: (e) => [l(evenementL(e))],
};
