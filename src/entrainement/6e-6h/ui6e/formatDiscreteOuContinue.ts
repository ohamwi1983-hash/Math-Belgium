import type { Exercice114, Nature114, Phase114 } from "../core6e/discreteOuContinue";
import { PHASES_114, situation114 } from "../core6e/discreteOuContinue";
import type { AideEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { COURS } from "./outilsVariablesAleatoiresLotH1";

/**
 * Couche C — textes de `6gen114` « Discrète ou continue ? » : situation, trois choix fermés (nature,
 * ensemble des valeurs, outil de calcul), aides à deux niveaux (critère du cours, puis question posée
 * pour la situation — jamais la réponse), messages d'un choix faux (raison propre à la situation).
 */

type E = Exercice114;
type P = Phase114;
const t = tx;
const l = lx;
const C4 = COURS(4);

export const nomNature = (n: Nature114) => (n === "discrete" ? "discrète" : "continue");

export const situationTexte114 = (e: E): Frag[] => [t(situation114(e).texte)];

export const consigneGlobale114 = (): Frag[] => [
  t("La variable X est-elle discrète ou continue ? Donne l'ensemble de ses valeurs possibles, puis dis comment on calcule une probabilité "),
  l("P(a\\leq X\\leq b)"),
  t(" et si "),
  l("P(X=c)"),
  t(" peut être non nulle. Justifie."),
];

export const consigneGenerale114 = (e: E): Frag[] => [...situationTexte114(e), t(" "), ...consigneGlobale114()];

export function libelle114(_e: E, p: P): string {
  return p === "nature" ? "Nature" : p === "valeurs" ? "Valeurs possibles" : "Outil de calcul";
}

export function consigne114(_e: E, p: P): Frag[] {
  switch (p) {
    case "nature":
      return [t("La variable X est-elle discrète ou continue ?")];
    case "valeurs":
      return [t("Quel est l'ensemble des valeurs possibles de X ?")];
    case "outil":
      return [t("Comment calcule-t-on une probabilité "), l("P(a\\leq X\\leq b)"), t(" pour cette variable ?")];
  }
}

const OPTIONS_OUTIL: OptionEcran[] = [
  { id: "discrete", fragments: [t("On additionne les probabilités "), l("P(X=k)"), t(" des valeurs comprises entre a et b ; "), l("P(X=c)"), t(" peut être non nulle.")] },
  { id: "continue", fragments: [t("On calcule l'intégrale de la densité entre a et b (une aire) ; "), l("P(X=c)=0"), t(" pour toute valeur c.")] },
];

export function options114(e: E, p: P): OptionEcran[] {
  switch (p) {
    case "nature":
      return [
        { id: "discrete", fragments: [t("Discrète")] },
        { id: "continue", fragments: [t("Continue")] },
      ];
    case "valeurs": {
      const s = situation114(e);
      return e.ordre.map((i) => ({ id: String(i), fragments: [l(s.valeurs[i]!)] }));
    }
    case "outil":
      return OPTIONS_OUTIL;
  }
}

export function bonneOption114(e: E, p: P): string {
  return p === "valeurs" ? "0" : e.nature;
}

export function reponse114(e: E, p: P): Frag[] {
  const s = situation114(e);
  switch (p) {
    case "nature":
      return [t(`X est ${nomNature(e.nature)}. ${s.raison}`)];
    case "valeurs":
      return [l(s.valeurs[0])];
    case "outil":
      return OPTIONS_OUTIL.find((o) => o.id === e.nature)!.fragments;
  }
}

export function recap114(e: E, p: P): Frag[] {
  if (p === "nature") return [t(e.nature === "discrete" ? "Discrète" : "Continue")];
  if (p === "outil") return e.nature === "discrete" ? [t("Somme des "), l("P(X=k)")] : [t("Intégrale de la densité")];
  return reponse114(e, p);
}

export function piegeTexte114(e: E, p: P, choix: string): Frag[] | null {
  if (choix === bonneOption114(e, p)) return null;
  const s = situation114(e);
  switch (p) {
    case "nature":
      return [t(s.raison)];
    case "valeurs":
      return e.nature === "discrete"
        ? [t("X est discrète : ses valeurs sont isolées (un ensemble entre accolades), pas tout un intervalle — et il faut toutes les valeurs possibles, pas seulement certaines.")]
        : [t("X est continue : elle prend toutes les valeurs réelles d'un intervalle, pas seulement des valeurs isolées.")];
    case "outil":
      return e.nature === "discrete"
        ? [t("X est discrète : on additionne les "), l("P(X=k)"), t(" ; chaque valeur a sa propre probabilité, qui peut être non nulle.")]
        : [t("X est continue : on calcule une aire sous la densité, et la probabilité d'une valeur isolée est nulle.")];
  }
}

export function aide1_114(_e: E, p: P): AideEcran {
  switch (p) {
    case "nature":
      return { texte: [t(`Cours ${C4} : une variable discrète prend des valeurs qu'on peut énumérer une à une (en nombre fini ou non) — souvent, on compte ; une variable continue prend toutes les valeurs réelles d'un intervalle — on mesure exactement.`)] };
    case "valeurs":
      return { texte: [t("Une variable discrète a un ensemble de valeurs isolées (entre accolades) ; une variable continue a pour valeurs tout un intervalle.")] };
    case "outil":
      return { texte: [t(`Tableau du cours ${C4} : en discret, la loi donne la probabilité de chaque valeur (on additionne) ; en continu, la densité donne la probabilité d'un intervalle (on intègre).`)] };
  }
}

export function aide2_114(_e: E, p: P): AideEcran | null {
  switch (p) {
    case "nature":
      return { texte: [t("Ici, demande-toi : X compte-t-il des objets ou des événements, ou mesure-t-il une grandeur ? Si c'est une mesure, est-elle exacte ou arrondie ?")] };
    case "valeurs":
      return { texte: [t("Ici, quelle est la plus petite valeur possible, la plus grande (y en a-t-il une ?), et les valeurs intermédiaires non entières sont-elles possibles ?")] };
    case "outil":
      return { texte: [t(`Ici, reprends ta réponse au premier écran : X est-elle discrète ou continue ?`)] };
  }
}

export { PHASES_114 };
