import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import type { AideEcran, Frag, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceQuelleFormule, Famille, Grandeur, PhaseQuelleFormule } from "./index";
import { FAMILLE_DU_TYPE } from "./index";

/**
 * Couche texte de `56gen23` « Quelle formule ? » : trois choix fermés (famille, grandeur cherchée,
 * formule), aides à deux niveaux (critère du cours, puis indice posé sur l'énoncé — jamais la réponse),
 * réponses, explications. Source unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceQuelleFormule;
type P = PhaseQuelleFormule;

export const PHASES: P[] = ["famille", "grandeur", "formule"];

export const LIBELLE_FAMILLE: Record<Famille, string> = {
  simple: "Intérêt simple : un seul capital, placé au plus un an",
  composes: "Intérêts composés : un seul capital, les intérêts s'ajoutent au capital",
  equivalent: "Taux équivalents : changer la période d'un taux",
  annuites: "Annuités : plusieurs versements égaux et réguliers",
};
const COURT_FAMILLE: Record<Famille, string> = { simple: "Intérêt simple", composes: "Intérêts composés", equivalent: "Taux équivalents", annuites: "Annuités" };
export const LIBELLE_GRANDEUR: Record<Grandeur, string> = {
  capital: "Le capital placé au départ (ou à placer aujourd'hui)",
  valeurAcquise: "La valeur acquise (le capital obtenu à la fin)",
  taux: "Un taux",
  duree: "Une durée",
  versement: "Le montant de chaque versement (annuité, mensualité)",
  valeurActuelle: "La valeur actuelle d'une suite de versements (montant empruntable)",
};
const ORDRE_FAMILLES: Famille[] = ["simple", "composes", "equivalent", "annuites"];
const ORDRE_GRANDEURS: Grandeur[] = ["capital", "valeurAcquise", "taux", "duree", "versement", "valeurActuelle"];

export const famille = (e: E) => FAMILLE_DU_TYPE[e.type];

export const situation = (e: E): Frag[] => [tx(e.modele.enonce)];
export const CONSIGNE_PAPIER = "Reconnais le type de problème, la grandeur cherchée et la formule à utiliser (transformée si nécessaire). Ne fais pas le calcul.";

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), tx(" Sans faire le calcul : quel type de problème, quelle grandeur cherchée, quelle formule ?")];
}

export function libelle(_e: E, p: P): string {
  return { famille: "Type de problème", grandeur: "Grandeur cherchée", formule: "Formule à utiliser" }[p];
}

export function consigne(_e: E, p: P): Frag[] {
  switch (p) {
    case "famille":
      return [tx("De quel type de problème s'agit-il ?")];
    case "grandeur":
      return [tx("Quelle grandeur cherche-t-on ?")];
    case "formule":
      return [tx("Quelle formule faut-il utiliser (déjà transformée pour isoler la grandeur cherchée) ?")];
  }
}

function formulesOptions(e: E): string[] {
  return [e.modele.formule, ...e.leurres];
}

export function options(e: E, p: P): OptionEcran[] {
  if (p === "famille") return ORDRE_FAMILLES.map((f) => ({ id: f, fragments: [tx(LIBELLE_FAMILLE[f])] }));
  if (p === "grandeur") return ORDRE_GRANDEURS.map((g) => ({ id: g, fragments: [tx(LIBELLE_GRANDEUR[g])] }));
  const f = formulesOptions(e);
  return e.ordre.map((k) => ({ id: `f${k}`, fragments: [lx(f[k]!)] }));
}

export function bonneOption(e: E, p: P): string {
  if (p === "famille") return famille(e);
  if (p === "grandeur") return e.modele.grandeur;
  return "f0";
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "famille") return [tx(COURT_FAMILLE[famille(e)])];
  if (p === "grandeur") return [tx(LIBELLE_GRANDEUR[e.modele.grandeur])];
  return [lx(e.modele.formule)];
}
export const recap = reponse;

export function aide1(_e: E, p: P): AideEcran {
  switch (p) {
    case "famille":
      return { texte: [tx("Compte les versements : un seul capital ou plusieurs versements égaux ? Pour un seul capital, regarde la durée et ce que deviennent les intérêts (simple : au plus un an ; composés : les intérêts s'ajoutent au capital). Un changement de période d'un taux relève des taux équivalents.")] };
    case "grandeur":
      return { texte: [tx("Relis la question : que demande-t-on de calculer ? Les autres nombres de l'énoncé sont des données.")] };
    case "formule":
      return { texte: [tx("Écris la formule du cours qui relie toutes les données à la grandeur cherchée, puis isole cette grandeur.")] };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  switch (p) {
    case "famille":
      return {
        texte: [
          tx(
            famille(e) === "annuites"
              ? "Ici, l'argent n'est pas versé (ou remboursé) en une fois : compte les versements, et regarde s'ils ont tous le même montant."
              : famille(e) === "equivalent"
                ? "Ici, l'énoncé parle de deux taux qui ne portent pas sur la même période."
                : "Ici, il n'y a qu'un seul capital : regarde la durée du placement et ce que l'énoncé dit des intérêts.",
          ),
        ],
      };
    case "grandeur":
      return { texte: [tx("Les données sont : ")], latex: e.modele.donnees.map(([l]) => l).join("\\qquad ") };
    case "formule":
      return e.modele.depart ? { texte: [tx("Formule du cours à transformer :")], latex: e.modele.depart } : { texte: [tx("La formule du cours donne directement la grandeur cherchée : aucune transformation n'est nécessaire.")] };
  }
}

export function explicationChoix(e: E, p: P): string {
  if (p === "famille") return `Ici : ${e.modele.indice}.`;
  if (p === "grandeur") return "C'est ce que demande la question ; les autres nombres sont des données.";
  return e.modele.depart ? "On part de la formule du cours et on isole la grandeur cherchée." : "C'est la formule du cours, qui donne directement la grandeur cherchée.";
}

export function diagnostiquer(e: E, p: P, v: string[]): StatutVerification[] {
  return [v[0] === bonneOption(e, p) ? "correct" : "not_equivalent"];
}

/** Message ciblé sur un choix fermé faux (affiché avec la réponse révélée). */
export function piege(e: E, p: P, v: string[]): Frag[] | null {
  const s = v[0] ?? "";
  if (s === bonneOption(e, p)) return null;
  if (p === "famille") {
    if (s === "simple" && famille(e) === "composes") return [tx("Sur plusieurs années, les intérêts sont capitalisés : on est en intérêts composés.")];
    if (s === "composes" && famille(e) === "simple") return [tx("Le capital est placé au plus un an (ou l'énoncé dit « intérêt simple ») : c'est un intérêt simple.")];
    if (s === "composes" && famille(e) === "annuites") return [tx("Il y a plusieurs versements égaux : chacun est capitalisé, et on additionne une suite géométrique — ce sont des annuités.")];
    return null;
  }
  if (p === "grandeur" && s === "capital" && e.modele.grandeur === "valeurActuelle") return [tx("On cherche bien un capital d'aujourd'hui, mais il équivaut à une suite de versements : c'est la valeur actuelle d'annuités.")];
  return null;
}
