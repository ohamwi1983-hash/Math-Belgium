import type { ExerciceChemins, PhaseChemins } from "../core6e/cheminsQuadrillage";
import { apresP, avantP, parP, phasesChemins, reponseFinale, totalAB } from "../core6e/cheminsQuadrillage";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { cL, entL } from "./nombresCombinatoireLotH2";
import { figureChemins } from "./figureCheminsQuadrillage";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationCheminsQuadrillage";
import { correctionDetailleeChemins } from "../generateurs6e/cheminsQuadrillage/corrigeDetaille";

/**
 * Couche C — textes de `6gen106` « Chemins dans un quadrillage » : situation, question, consignes,
 * champs, aides à deux niveaux (règle du cours, puis posée pour l'instance — jamais le résultat),
 * réponses. Source unique de l'écran, du papier et du corrigé. Notation du cours : Cₙᵏ.
 */

type E = ExerciceChemins;
type P = PhaseChemins;
const t = tx;
const l = lx;

/** Nœud / carrefour selon le contexte. */
const noeud = (e: E) => (e.ctx === 0 ? "nœud" : "carrefour");

export function situation(e: E): Frag[] {
  const base: Frag[] =
    e.ctx === 0
      ? [t("Un robot se déplace sur les lignes du quadrillage ci-dessous, de nœud en nœud, uniquement vers la droite ("), l("\\rightarrow"), t(") ou vers le haut ("), l("\\uparrow"), t("). Il part du nœud "), l("A"), t(" et doit atteindre le nœud "), l("B"), t(".")]
      : [t("Dans un quartier aux rues en damier (plan ci-dessous), un livreur va du carrefour "), l("A"), t(" au carrefour "), l("B"), t(" par un chemin le plus court : il roule uniquement vers l'est ("), l("\\rightarrow"), t(") ou vers le nord ("), l("\\uparrow"), t(").")];
  if (e.variante === "passage") base.push(t(e.ctx === 0 ? " Il doit passer par le nœud " : " Il doit passer par le carrefour "), l("P"), t(e.ctx === 0 ? " (une borne de recharge)." : " (un client à livrer en chemin)."));
  if (e.variante === "eviter") base.push(t(e.ctx === 0 ? " Le nœud " : " Le carrefour "), l("P"), t(e.ctx === 0 ? " est en panne : le robot ne peut pas y passer." : " est fermé pour travaux : le livreur ne peut pas y passer."));
  return base;
}

export function question(e: E): Frag[] {
  if (e.variante === "total") return [t("Combien de chemins différents mènent de "), l("A"), t(" à "), l("B"), t(" ?")];
  if (e.variante === "passage") return [t("Combien de chemins différents mènent de "), l("A"), t(" à "), l("B"), t(" en passant par "), l("P"), t(" ?")];
  return [t("Combien de chemins différents mènent de "), l("A"), t(" à "), l("B"), t(" sans passer par "), l("P"), t(" ?")];
}

export const CONSIGNE_PAPIER = "Justifie ton dénombrement.";

export const consigneGenerale = (e: E): Frag[] => [...situation(e), t(" "), ...question(e)];
export const phases = (e: E): P[] => phasesChemins(e);

export function libelle(_e: E, p: P): string {
  switch (p) {
    case "pas":
      return "Déplacements";
    case "avantP":
      return "De A à P";
    case "apresP":
      return "De P à B";
    case "total":
      return "De A à B";
    case "parP":
      return "Par P";
    case "chemins":
      return "Résultat";
  }
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "pas":
      return [t("Combien de déplacements compte chaque chemin le plus court de "), l("A"), t(" à "), l("B"), t(", et combien d'entre eux vont vers le haut ("), l("\\uparrow"), t(") ?")];
    case "avantP":
      return [t("Combien de chemins les plus courts mènent de "), l("A"), t(" à "), l("P"), t(" ?")];
    case "apresP":
      return [t("Combien de chemins les plus courts mènent de "), l("P"), t(" à "), l("B"), t(" ?")];
    case "total":
      return [t("Sans tenir compte de "), l("P"), t(", combien de chemins les plus courts mènent de "), l("A"), t(" à "), l("B"), t(" ?")];
    case "parP":
      return [t("Combien de ces chemins passent par "), l("P"), t(" ?")];
    case "chemins":
      return e.variante === "eviter" ? [t("Déduis-en le nombre de chemins de "), l("A"), t(" à "), l("B"), t(" qui ne passent pas par "), l("P"), t(".")] : e.variante === "passage" ? [t("Déduis-en le nombre de chemins de "), l("A"), t(" à "), l("B"), t(" qui passent par "), l("P"), t(".")] : [t("Combien de chemins différents mènent de "), l("A"), t(" à "), l("B"), t(" ?")];
  }
}

const PLACEHOLDER = "un nombre, ou C(n, k)";

export function champs(_e: E, p: P): ChampEcran[] {
  if (p === "pas")
    return [
      { label: "Déplacements en tout", placeholder: "nombre" },
      { label: "Déplacements vers le haut", placeholder: "nombre" },
    ];
  return [{ label: "Nombre de chemins", placeholder: PLACEHOLDER }];
}

/** Écritures LaTeX des nombres de chemins (« C_{8}^{3}=56 »). */
export const totalL = (e: E) => `${cL(e.m + e.n, e.n)}=${entL(totalAB(e))}`;
export const avantPL = (e: E) => `${cL(e.px + e.py, e.py)}=${entL(avantP(e))}`;
export const apresPL = (e: E) => `${cL(e.m - e.px + e.n - e.py, e.n - e.py)}=${entL(apresP(e))}`;

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "pas":
      return [l(`${e.m + e.n}`), t(" déplacements, dont "), l(`${e.n}`), t(" vers le haut")];
    case "avantP":
      return [l(avantPL(e))];
    case "apresP":
      return [l(apresPL(e))];
    case "total":
      return [l(totalL(e))];
    case "parP":
      return [l(`${entL(avantP(e))}\\times ${entL(apresP(e))}=${entL(parP(e))}`)];
    case "chemins":
      return e.variante === "total" ? [l(totalL(e)), t(" chemins")] : [l(entL(reponseFinale(e))), t(" chemins")];
  }
}

export const recap = reponse;

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "pas":
      return { texte: [t("Un chemin le plus court ne revient jamais en arrière : compte les carreaux à franchir horizontalement, puis verticalement, sur la figure.")] };
    case "avantP":
    case "apresP":
    case "total":
      return { texte: [t("Chemins dans un quadrillage (cours, point 4) : un chemin le plus court qui fait "), l("a"), t(" pas vers la droite et "), l("b"), t(" vers le haut est un mot de "), l("a+b"), t(" lettres ; il suffit de choisir les places des "), l("b"), t(" flèches vers le haut, soit "), l("C_{a+b}^{b}"), t(" chemins.")] };
    case "parP":
      return { texte: [t("Principe de multiplication (cours, point 1) : un chemin par "), l("P"), t(" est un chemin de "), l("A"), t(" à "), l("P"), t(" suivi d'un chemin de "), l("P"), t(" à "), l("B"), t(".")] };
    case "chemins":
      if (e.variante === "eviter") return { texte: [t("Complément (cours, point 2) : les chemins qui évitent "), l("P"), t(" sont tous les chemins, moins ceux qui passent par "), l("P"), t(".")] };
      if (e.variante === "passage") return { texte: [t("Principe de multiplication : chaque chemin de "), l("A"), t(" à "), l("P"), t(" se prolonge par chacun des chemins de "), l("P"), t(" à "), l("B"), t(".")] };
      return { texte: [t("Un chemin est un mot formé de flèches "), l("\\rightarrow"), t(" et "), l("\\uparrow"), t(" : choisir les places des flèches vers le haut parmi tous les déplacements (combinaison, l'ordre des places choisies ne compte pas).")] };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  switch (p) {
    case "pas":
      return { texte: [t(`Le quadrillage compte ${e.m} carreaux de large et ${e.n} de haut : additionne les déplacements des deux sortes.`)] };
    case "avantP":
      return { texte: [t("De "), l("A"), t(" à "), l("P"), t(" : "), l(`${e.px}`), t(" pas vers la droite et "), l(`${e.py}`), t(" vers le haut ; choisis les places des flèches vers le haut parmi les "), l(`${e.px + e.py}`), t(" déplacements.")] };
    case "apresP":
      return { texte: [t("De "), l("P"), t(" à "), l("B"), t(" : "), l(`${e.m - e.px}`), t(" pas vers la droite et "), l(`${e.n - e.py}`), t(" vers le haut ; choisis les places des flèches vers le haut parmi les "), l(`${e.m - e.px + e.n - e.py}`), t(" déplacements.")] };
    case "total":
      return { texte: [t("De "), l("A"), t(" à "), l("B"), t(" : "), l(`${e.m}`), t(" pas vers la droite et "), l(`${e.n}`), t(" vers le haut, soit "), l(`${e.m + e.n}`), t(" déplacements dont on choisit les places des flèches vers le haut.")] };
    case "parP":
      return { texte: [t("Calcule d'abord les chemins de "), l("A"), t(" à "), l("P"), t(" ("), l(`${e.px}`), t(" à droite, "), l(`${e.py}`), t(" en haut), puis ceux de "), l("P"), t(" à "), l("B"), t(" ("), l(`${e.m - e.px}`), t(" à droite, "), l(`${e.n - e.py}`), t(" en haut), et multiplie.")] };
    case "chemins":
      if (e.variante === "eviter") return { texte: [t("Retire le nombre de chemins par "), l("P"), t(" (écran précédent) du nombre total de chemins de "), l("A"), t(" à "), l("B"), t(".")] };
      if (e.variante === "passage") return { texte: [t("Multiplie les deux nombres de chemins trouvés aux écrans précédents.")] };
      return { texte: [t("Parmi les "), l(`${e.m + e.n}`), t(" déplacements, choisis les places des "), l(`${e.n}`), t(" flèches vers le haut.")] };
  }
}

/** Résumé du bandeau replié, assez court pour tenir sur une ligne à 390 px : « 7 × 4 : A → B, sans P ». */
export function apercuEnonce(e: E): Frag[] {
  const fin: Frag[] = e.variante === "passage" ? [t(", par "), l("P")] : e.variante === "eviter" ? [t(", sans "), l("P")] : [];
  return [l(`${e.m}\\times ${e.n}`), t(" : "), l("A\\to B"), ...fin];
}

/** `6gen106` sur le socle d'écrans partagé : deux ou trois écrans à champs (trois tentatives) ; la
 * figure reste sous l'énoncé à chaque écran. */
export const DEFINITION_CHEMINS: DefinitionEcrans<E, P> = {
  phases,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureChemins(e),
  apercuEnonce,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeChemins,
};

export { noeud };
