import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { centL, decimalL, eurT, pronom, lireNombre, MESSAGE_MONTANT, MESSAGE_TAUX, montantL, pourcentFixeL, pourcentT, statutMontant, statutTaux, TOL_CENTIME, tropArrondi } from "../finance/commun";
import type { ExerciceAnnuites, PhaseAnnuites } from "./index";
import { facteurVn, iDe, iPeriode, nbVersements, V0, Vn, VnApres, versementCherche } from "./index";

/**
 * Couche texte de `56gen27` « Annuités : placement et remboursement » : situation, consignes, options
 * (option 0 = la bonne, ordre mélangé stocké dans l'instance), aides à deux niveaux, réponses, messages
 * ciblés et vérification. Source unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceAnnuites;
type P = PhaseAnnuites;

const ans = (n: number) => `${n} ans`;
export const fL = (e: E) => decimalL(1 + iDe(e));
export const iL = (e: E) => decimalL(iDe(e));
/** Taux mensuel équivalent arrondi au millième de % (ce que l'élève a pu garder) et valeur acquise correspondante. */
export const iMensuelArrondi = (e: E) => Math.round(100000 * iPeriode(e)) / 100000;
const VnAvecArrondi = (e: E) => e.a * facteurVn(iMensuelArrondi(e), nbVersements(e));

/* ----------------------------------------------------------------------------------------------
 * Énoncé
 * -------------------------------------------------------------------------------------------- */

export function situation(e: E): Frag[] {
  const p = e.prenom;
  const fin = e.annee + e.n - 1;
  switch (e.variante) {
    case "placementDernier":
      return [tx(`${p} verse ${eurT(e.a)} sur un compte d'épargne le 31 décembre de chaque année, de ${e.annee} à ${fin} (${e.n} versements). Le compte rapporte ${pourcentT(e.tauxPct)} par an, à intérêts composés.`)];
    case "placementApres":
      return [tx(`${p} dépose ${eurT(e.a)} sur un compte d'épargne le 1er janvier de chaque année, de ${e.annee} à ${fin} (${e.n} versements). Le compte rapporte ${pourcentT(e.tauxPct)} par an, à intérêts composés, capitalisés le 31 décembre.`)];
    case "valeurActuelle":
      return [tx(`Pour financer des travaux, ${p} peut rembourser ${eurT(e.a)} par an pendant ${ans(e.n)}, le premier remboursement ayant lieu un an après la remise des fonds. Le taux est de ${pourcentT(e.tauxPct)} par an (intérêts composés).`)];
    case "versement":
      return e.apres
        ? [tx(`${p} veut disposer de ${eurT(e.cible)} un an après son dernier versement. Pour cela, ${pronom(p)} versera la même somme chaque année pendant ${ans(e.n)} sur un compte rémunéré à ${pourcentT(e.tauxPct)} par an (intérêts composés).`)]
        : [tx(`${p} veut disposer de ${eurT(e.cible)} au moment de son dernier versement. Pour cela, ${pronom(p)} versera la même somme chaque année pendant ${ans(e.n)} sur un compte rémunéré à ${pourcentT(e.tauxPct)} par an (intérêts composés).`)];
    case "mensuel":
      return [tx(`${p} verse ${eurT(e.a)} à la fin de chaque mois, pendant ${ans(e.n)}, sur un compte rémunéré à ${pourcentT(e.tauxPct)} par an. Les intérêts sont capitalisés chaque mois, au taux mensuel équivalent.`)];
  }
}

export function question(e: E): Frag[] {
  switch (e.variante) {
    case "placementDernier":
      return [tx(`De quel capital disposera-t-${pronom(e.prenom)} juste après son dernier versement ? Quels intérêts ses versements auront-ils rapportés ?`)];
    case "placementApres":
      return [tx(`De quel capital disposera-t-${pronom(e.prenom)} le 31 décembre ${e.annee + e.n - 1} ?`)];
    case "valeurActuelle":
      return [tx(`Quel montant peut-${pronom(e.prenom)} emprunter aujourd'hui ? Combien d'intérêts paiera-t-${pronom(e.prenom)} en tout ?`)];
    case "versement":
      return [tx(`Quel montant doit-${pronom(e.prenom)} verser chaque année ?`)];
    case "mensuel":
      return [tx(`De quel capital disposera-t-${pronom(e.prenom)} juste après le dernier versement ? Quels intérêts ses versements auront-ils rapportés ?`)];
  }
}

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), tx(" "), ...question(e)];
}

export function libelle(e: E, p: P): string {
  return {
    formule: "Formule",
    moment: "Moment de la valeur cherchée",
    valeur: e.variante === "placementApres" ? "Valeur au dernier versement" : "Valeur acquise",
    cherchee: "Capital au 31 décembre",
    interets: e.variante === "valeurActuelle" ? "Intérêts payés" : "Intérêts",
    capital: "Montant empruntable",
    versement: "Versement annuel",
    tauxMensuel: "Taux mensuel équivalent",
  }[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "formule":
      return e.variante === "valeurActuelle"
        ? [tx("Le montant empruntable est la valeur actuelle des remboursements (un an avant le premier). Quelle formule la donne ?")]
        : e.variante === "versement"
          ? [tx("Quelle égalité donne le versement annuel "), lx("a"), tx(" ?")]
          : [tx("Quelle formule donne la valeur acquise au moment du dernier versement ?")];
    case "moment":
      return [tx(`Le dernier versement a lieu le 1er janvier ${e.annee + e.n - 1}. Avec `), lx("V_n"), tx(" la valeur acquise juste après ce versement, que vaut le capital le 31 décembre ?")];
    case "valeur":
      return e.variante === "placementApres"
        ? [tx(`Calcule `), lx("V_n"), tx(", la valeur acquise juste après le dernier versement (au centime).")]
        : [tx("Calcule la valeur acquise juste après le dernier versement (au centime).")];
    case "cherchee":
      return [tx(`Calcule le capital disponible le 31 décembre ${e.annee + e.n - 1} (au centime).`)];
    case "interets":
      return e.variante === "valeurActuelle"
        ? [tx(`Combien d'intérêts paiera-t-${pronom(e.prenom)} en tout (total des remboursements moins le montant emprunté) ?`)]
        : e.variante === "versement"
          ? [tx("Quelle part du capital visé proviendra des intérêts (au centime) ?")]
          : [tx("Calcule le montant des intérêts rapportés (au centime).")];
    case "capital":
      return [tx("Calcule le montant qu'il peut emprunter aujourd'hui (au centime).")];
    case "versement":
      return [tx("Calcule le versement annuel (au centime).")];
    case "tauxMensuel":
      return [tx("Calcule le taux mensuel équivalent, en %, au millième.")];
  }
}

export function champs(e: E, p: P): ChampEcran[] {
  switch (p) {
    case "valeur":
      return [{ label: "valeur acquise", labelLatex: `V_{${nbVersements(e)}}=`, unite: "€", placeholder: "ex. : 6 370,96" }];
    case "cherchee":
      return [{ label: "capital au 31 décembre", labelLatex: "", unite: "€", placeholder: "ex. : 6 562,09" }];
    case "interets":
      return [{ label: "intérêts", labelLatex: "", unite: "€", placeholder: "ex. : 370,96" }];
    case "capital":
      return [{ label: "montant empruntable", labelLatex: "V_0=", unite: "€", placeholder: "ex. : 7 259,79" }];
    case "versement":
      return [{ label: "versement annuel", labelLatex: "a=", unite: "€", placeholder: "ex. : 1 884,57" }];
    case "tauxMensuel":
      return [{ label: "taux mensuel", labelLatex: "i_{\\text{mensuel}}=", unite: "%", placeholder: "ex. : 0,247" }];
    default:
      return [];
  }
}

/* ----------------------------------------------------------------------------------------------
 * Choix fermés (option 0 = la bonne)
 * -------------------------------------------------------------------------------------------- */

function textesOptions(e: E, p: P): Frag[][] {
  if (p === "moment")
    return [
      [lx("V_n\\,(1+i)"), tx(" : une année de plus d'intérêts après le dernier versement")],
      [lx("V_n"), tx(" : le capital ne change plus après le dernier versement")],
      [lx("V_n\\,(1+i)^{-1}"), tx(" : on actualise d'une année")],
      [lx("V_n\\,(1+i)^{n}"), tx(" : chaque versement rapporte encore n années d'intérêts")],
    ];
  if (e.variante === "valeurActuelle")
    return [[lx("V_0=a\\,\\dfrac{1-(1+i)^{-n}}{i}")], [lx("V_0=a\\,\\dfrac{(1+i)^{n}-1}{i}")], [lx("V_0=n\\,a\\,(1+i)^{-n}")], [lx("V_0=\\dfrac{n\\,a}{1+i}")]];
  if (e.variante === "versement")
    return e.apres
      ? [[lx("a=\\dfrac{S\\cdot i}{\\left((1+i)^{n}-1\\right)(1+i)}")], [lx("a=\\dfrac{S\\cdot i}{(1+i)^{n}-1}")], [lx("a=\\dfrac{S}{n}")], [lx("a=\\dfrac{S\\cdot i\\,(1+i)}{(1+i)^{n}-1}")]]
      : [[lx("a=\\dfrac{S\\cdot i}{(1+i)^{n}-1}")], [lx("a=\\dfrac{S}{n}")], [lx("a=\\dfrac{S\\cdot i}{1-(1+i)^{-n}}")], [lx("a=S\\,\\dfrac{(1+i)^{n}-1}{i}")]];
  return [[lx("V_n=a\\,\\dfrac{(1+i)^{n}-1}{i}")], [lx("V_n=a\\,\\dfrac{1-(1+i)^{-n}}{i}")], [lx("V_n=n\\,a\\,(1+i)")], [lx("V_n=a\\,(1+i)^{n}")]];
}

export function options(e: E, p: P): OptionEcran[] {
  const t = textesOptions(e, p);
  return e.ordre.map((k) => ({ id: `o${k}`, fragments: t[k]! }));
}
export const BONNE = "o0";
export const optionJuste = (e: E, p: P) => textesOptions(e, p)[0]!;

/* ----------------------------------------------------------------------------------------------
 * Valeurs attendues et réponses
 * -------------------------------------------------------------------------------------------- */

export function interetsAttendus(e: E): number {
  if (e.variante === "valeurActuelle") return e.n * e.a - V0(e);
  if (e.variante === "versement") return e.cible - e.n * versementCherche(e);
  return Vn(e) - nbVersements(e) * e.a;
}

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "formule":
    case "moment":
      return optionJuste(e, p);
    case "valeur":
      return [lx(`V_{${nbVersements(e)}}\\approx ${centL(Vn(e))}`), tx(" €")];
    case "cherchee":
      return [lx(`V_{${e.n}}\\,(1+i)\\approx ${centL(VnApres(e))}`), tx(" €")];
    case "interets":
      return [lx(`\\approx ${centL(interetsAttendus(e))}`), tx(" €")];
    case "capital":
      return [lx(`V_0\\approx ${centL(V0(e))}`), tx(" €")];
    case "versement":
      return [lx(`a\\approx ${centL(versementCherche(e))}`), tx(" €")];
    case "tauxMensuel":
      return [lx(`i_{\\text{mensuel}}\\approx ${pourcentFixeL(100 * iPeriode(e), 3)}`)];
  }
}

export function recap(e: E, p: P): Frag[] {
  if (p === "moment") return [lx("V_n\\,(1+i)")];
  return reponse(e, p);
}

/* ----------------------------------------------------------------------------------------------
 * Aides
 * -------------------------------------------------------------------------------------------- */

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "formule":
      if (e.variante === "valeurActuelle") return { texte: [tx("Chaque remboursement est actualisé à la date de l'emprunt ; la somme de ces valeurs actuelles est une somme géométrique :")], latex: "V_0=V_n\\,(1+i)^{-n}" };
      if (e.variante === "versement") return { texte: [tx("Pars de la formule de la valeur acquise et isole "), lx("a"), tx(e.apres ? " (la valeur cherchée est une période après le dernier versement : un facteur 1 + i en plus)." : ".")] };
      return { texte: [tx("Le premier versement est capitalisé n − 1 fois, le dernier pas du tout : on additionne les termes d'une suite géométrique de raison 1 + i.")], latex: "V_n=a\\,\\bigl(1+(1+i)+\\dots+(1+i)^{n-1}\\bigr)" };
    case "moment":
      return { texte: [tx("Entre le dernier versement (1er janvier) et le 31 décembre, le capital reste placé pendant une année entière.")] };
    case "valeur":
      return { texte: [tx("Valeur acquise au moment du dernier versement, avec le taux par période :")], latex: "V_n=a\\,\\dfrac{(1+i)^n-1}{i}" };
    case "cherchee":
      return { texte: [tx("Capitalise "), lx("V_n"), tx(" pendant une période de plus.")] };
    case "interets":
      return e.variante === "valeurActuelle"
        ? { texte: [tx("Les intérêts payés sont la différence entre tout ce qui est remboursé et ce qui a été emprunté.")] }
        : { texte: [tx("Les intérêts sont la différence entre le capital obtenu et la somme de tous les versements.")] };
    case "capital":
      return { texte: [tx("Valeur actuelle d'une suite de versements (une période avant le premier) :")], latex: "V_0=a\\,\\dfrac{1-(1+i)^{-n}}{i}" };
    case "versement":
      return { texte: [tx("Utilise l'égalité de l'écran précédent, avec le taux en écriture décimale.")] };
    case "tauxMensuel":
      return { texte: [tx("Le taux mensuel équivalent donne la même valeur acquise sur un an que le taux annuel :")], latex: "(1+i_{\\text{mensuel}})^{12}=1+i_{\\text{annuel}}" };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  const n = nbVersements(e);
  switch (p) {
    case "formule":
      return e.variante === "versement"
        ? { texte: [tx("Ici, la valeur acquise des versements doit valoir "), lx("S"), tx(e.apres ? " une année après le dernier versement :" : " au dernier versement :")], latex: e.apres ? "a\\,\\dfrac{(1+i)^n-1}{i}\\,(1+i)=S" : "a\\,\\dfrac{(1+i)^n-1}{i}=S" }
        : { texte: [tx(e.variante === "valeurActuelle" ? "On ramène chaque versement à la date 0 en le multipliant par (1 + i)⁻ᵏ ; la somme est géométrique de raison (1 + i)⁻¹." : "On ramène chaque versement à la date du dernier en le multipliant par (1 + i)ᵏ ; la somme est géométrique de raison 1 + i.")] };
    case "moment":
      return { texte: [tx("Un placement à intérêts composés pendant un an multiplie le capital par "), lx(`1+i=${fL(e)}`), tx(".")] };
    case "valeur":
      return e.variante === "mensuel"
        ? { texte: [tx("Ici, avec le taux mensuel de l'écran précédent (gardé en mémoire) et "), lx(`n=${n}`), tx(" versements :")], latex: `V_{${n}}=${montantL(e.a)}\\cdot\\dfrac{(1+i_{\\text{mensuel}})^{${n}}-1}{i_{\\text{mensuel}}}` }
        : { texte: [tx("Ici :")], latex: `V_{${n}}=${montantL(e.a)}\\cdot\\dfrac{${fL(e)}^{${n}}-1}{${iL(e)}}` };
    case "cherchee":
      return { texte: [tx("Ici, avec la valeur de l'écran précédent :")], latex: `V_{${e.n}}\\cdot ${fL(e)}` };
    case "interets":
      return e.variante === "valeurActuelle"
        ? { texte: [tx("Ici :")], latex: `I=${e.n}\\cdot ${montantL(e.a)}-V_0` }
        : e.variante === "versement"
          ? { texte: [tx("Ici :")], latex: `I=${montantL(e.cible)}-${e.n}\\cdot a` }
          : { texte: [tx("Ici :")], latex: `I=V_{${n}}-${n}\\cdot ${montantL(e.a)}` };
    case "capital":
      return { texte: [tx("Ici :")], latex: `V_0=${montantL(e.a)}\\cdot\\dfrac{1-${fL(e)}^{-${e.n}}}{${iL(e)}}` };
    case "versement":
      return { texte: [tx("Ici :")], latex: e.apres ? `a=\\dfrac{${montantL(e.cible)}\\cdot ${iL(e)}}{\\left(${fL(e)}^{${e.n}}-1\\right)\\cdot ${fL(e)}}` : `a=\\dfrac{${montantL(e.cible)}\\cdot ${iL(e)}}{${fL(e)}^{${e.n}}-1}` };
    case "tauxMensuel":
      return { texte: [tx("Ici :")], latex: `1+i_{\\text{mensuel}}=\\sqrt[12]{${fL(e)}}` };
  }
}

export function messageIllisible(_e: E, p: P): string {
  return p === "tauxMensuel" ? MESSAGE_TAUX : MESSAGE_MONTANT;
}

export function explicationChoix(e: E, p: P): string {
  if (p === "moment") return "Après le dernier versement, le capital reste placé un an : il est multiplié par 1 + i.";
  if (e.variante === "valeurActuelle") return "La valeur actuelle est la valeur acquise Vₙ multipliée par (1 + i)⁻ⁿ : on obtient la formule de V₀ du cours.";
  if (e.variante === "versement") return e.apres ? "On écrit que la valeur acquise, multipliée encore par 1 + i (un an après le dernier versement), vaut la somme visée, puis on isole a." : "On écrit que la valeur acquise au dernier versement vaut la somme visée, puis on isole a.";
  return "C'est la somme des termes d'une suite géométrique de premier terme a et de raison 1 + i.";
}

/* ----------------------------------------------------------------------------------------------
 * Vérification
 * -------------------------------------------------------------------------------------------- */

const CHOIX: P[] = ["formule", "moment"];

function cibles(e: E, p: P): number[] {
  switch (p) {
    case "valeur":
      return e.variante === "mensuel" ? [Vn(e), VnAvecArrondi(e)] : [Vn(e)];
    case "cherchee":
      return [VnApres(e)];
    case "interets":
      return e.variante === "mensuel" ? [interetsAttendus(e), VnAvecArrondi(e) - nbVersements(e) * e.a] : [interetsAttendus(e)];
    case "capital":
      return [V0(e)];
    case "versement":
      return [versementCherche(e)];
    default:
      return [];
  }
}

export function diagnostiquer(e: E, p: P, v: string[]): StatutVerification[] {
  const s = v[0] ?? "";
  if (CHOIX.includes(p)) return [s === BONNE ? "correct" : "not_equivalent"];
  if (p === "tauxMensuel") return [statutTaux(s, [100 * iPeriode(e)], 0.001)];
  return [statutMontant(s, cibles(e, p))];
}

export function approchee(e: E, p: P, v: string[]): string | null {
  const s = v[0] ?? "";
  if (CHOIX.includes(p)) return null;
  if (p === "tauxMensuel") return tropArrondi(s, [100 * iPeriode(e)], 3, 0.001, "au millième (en %)");
  return tropArrondi(s, cibles(e, p), 2, TOL_CENTIME, "au centime");
}

export function piege(e: E, p: P, v: string[]): Frag[] | null {
  const s = v[0] ?? "";
  if (!CHOIX.includes(p) && diagnostiquer(e, p, v).every((x) => x === "correct")) return null;
  const x = lireNombre(s);
  const pres = (c: number, t = 0.011) => x !== null && Math.abs(x - c) <= t + 1e-9 * Math.abs(c);
  const i = iPeriode(e);
  const n = nbVersements(e);
  switch (p) {
    case "valeur":
      if (pres(n * e.a)) return [tx("C'est la somme des versements, sans les intérêts.")];
      if (pres(e.a * (1 - Math.pow(1 + i, -n)) / i)) return [tx("C'est la valeur actuelle (une période avant le premier versement) ; on demande la valeur au moment du dernier.")];
      if (pres(e.a * facteurVn(i, n) * (1 + i))) return [tx("Le dernier versement ne rapporte encore rien au moment où il est fait : pas de facteur 1 + i en plus.")];
      if (e.variante === "mensuel" && pres(e.a * facteurVn(iDe(e) / 12, n), 0.5)) return [tx("Le taux mensuel équivalent n'est pas le taux annuel divisé par 12 : il se calcule par une racine douzième.")];
      return null;
    case "cherchee":
      if (pres(Vn(e))) return [tx("C'est la valeur juste après le dernier versement : le capital reste encore placé un an.")];
      return null;
    case "interets":
      if (e.variante !== "valeurActuelle" && e.variante !== "versement" && pres(Vn(e))) return [tx("C'est la valeur acquise : retire la somme des versements.")];
      if (e.variante === "valeurActuelle" && pres(V0(e))) return [tx("C'est le montant emprunté : les intérêts sont ce qu'on rembourse en plus.")];
      return null;
    case "capital":
      if (pres(e.n * e.a)) return [tx("La somme des remboursements est plus grande que le montant emprunté : chaque remboursement doit être actualisé.")];
      if (pres(Vn(e))) return [tx("C'est la valeur acquise au moment du dernier remboursement ; il faut l'actualiser à la date de l'emprunt.")];
      return null;
    case "versement":
      if (pres(e.cible / e.n)) return [tx("Diviser le montant visé par le nombre de versements, c'est oublier les intérêts.")];
      if (e.apres && pres(e.cible / facteurVn(iDe(e), e.n))) return [tx("La somme est voulue un an après le dernier versement : il y a un facteur 1 + i en plus à diviser.")];
      if (!e.apres && pres(e.cible / (facteurVn(iDe(e), e.n) * (1 + iDe(e))))) return [tx("La somme est voulue au moment du dernier versement : pas de facteur 1 + i en plus.")];
      return null;
    case "tauxMensuel":
      if (pres(e.tauxPct / 12, 0.0011)) return [tx("Diviser le taux annuel par 12 ne donne pas le taux équivalent : prends la racine douzième de "), lx(`${fL(e)}`), tx(", puis retire 1.")];
      return null;
    default:
      return null;
  }
}

