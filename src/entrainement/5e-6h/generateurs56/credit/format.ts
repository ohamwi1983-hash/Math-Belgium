import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { auCentime, centL, centT, decimalL, eurT, pronom, lireNombre, MESSAGE_MONTANT, MESSAGE_TAUX, montantL, nL, pourcentFixeL, pourcentL, pourcentT, statutMontant, statutTaux, TOL_CENTIME, tropArrondi } from "../finance/commun";
import type { ExerciceCredit, LigneTableau, PhaseCredit } from "./index";
import { amortissementConstant, capitalDe, capitalEmpruntable, iMensuel, iMensuelArrondi, interetRang, ligneDepuis, mensualiteDe, mensualiteExacte, mensualiteRang, restantDuDonne, totalInterets } from "./index";

/**
 * Couche texte de `56gen28` « Crédit et tableau d'amortissement » : situation, tableau, consignes,
 * champs, options (option 0 = la bonne), aides à deux niveaux, réponses, messages ciblés et
 * vérification. Montants à un centime près ; sont aussi admis les montants calculés avec le taux
 * mensuel arrondi au millième de % (« 0,286 % ») et le coût calculé avec la mensualité exacte ou
 * arrondie.
 */

type E = ExerciceCredit;
type P = PhaseCredit;

const OBJETS = ["une voiture d'occasion", "un scooter", "des travaux d'isolation", "du matériel informatique"];
export const iL = (e: E) => nL(iMensuel(e), 7, true);
const IM = "i_{\\text{mens}}";

/* ----------------------------------------------------------------------------------------------
 * Énoncé
 * -------------------------------------------------------------------------------------------- */

export function situation(e: E): Frag[] {
  const p = e.prenom;
  switch (e.variante) {
    case "mensualite":
      return [tx(`Pour financer ${OBJETS[e.objet]}, ${p} emprunte ${eurT(e.C)} au TAEG de ${pourcentT(e.taeg)}, remboursables en ${e.n} mensualités constantes (la première un mois après l'emprunt).`)];
    case "montantEmprunte":
      return [tx(`Pour financer ${OBJETS[e.objet]}, ${p} peut rembourser ${eurT(e.m)} par mois pendant ${e.n} mois. Un organisme lui propose un prêt à tempérament au TAEG de ${pourcentT(e.taeg)}.`)];
    case "tableau":
      return [tx(`${p} emprunte ${eurT(e.C)} au TAEG de ${pourcentT(e.taeg)}, remboursables en ${e.n} mensualités de ${eurT(e.m)}. Le tableau ci-dessous est le début (ou un extrait) de son tableau d'amortissement.`)];
    case "amortissementConstant":
      return [tx(`Un jeune artisan emprunte ${eurT(e.C)} à ses parents pour s'installer. Il rembourse en ${e.n} mois : chaque mois, la même part du capital (amortissement constant), plus un intérêt de ${pourcentT(e.r)} sur la partie du capital qui n'est pas encore remboursée.`)];
  }
}

export function question(e: E): Frag[] {
  switch (e.variante) {
    case "mensualite":
      return [tx("Calcule le taux mensuel équivalent au TAEG, la mensualité (au centime) et le coût du crédit.")];
    case "montantEmprunte":
      return [tx(`Quel montant peut-${pronom(e.prenom)} emprunter ? Quel sera le coût du crédit ?`)];
    case "tableau":
      return [tx(`Complète les lignes ${e.k} et ${e.k + 1} du tableau d'amortissement (au centime).`)];
    case "amortissementConstant":
      return [tx(`Calcule l'amortissement mensuel et l'intérêt du premier mois. Quelle est la nature de la suite des intérêts mensuels ? Calcule la mensualité du mois ${e.rang} et le total des intérêts payés.`)];
  }
}

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), tx(" "), ...question(e)];
}

export function tableau(e: E): TableauDonnees | null {
  if (e.variante !== "tableau") return null;
  const k = e.k;
  return {
    horizontal: true,
    entetes: [[tx("Période")], [tx("Mensualité (€)")], [tx("Intérêts (€)")], [tx("Amortissement (€)")], [tx("Capital restant dû (€)")]],
    lignes: [
      [String(k - 1), k - 1 === 0 ? "" : centT(e.m), k - 1 === 0 ? "" : "…", k - 1 === 0 ? "" : "…", centT(restantDuDonne(e))],
      [String(k), centT(e.m), "?", "?", "?"],
      [String(k + 1), centT(e.m), "?", "?", "?"],
    ],
  };
}

export function libelle(e: E, p: P): string {
  return {
    tauxMensuel: "Taux mensuel équivalent",
    mensualite: "Mensualité",
    capital: "Montant empruntable",
    cout: "Coût du crédit",
    ligne1: `Ligne ${e.k}`,
    ligne2: `Ligne ${e.k + 1}`,
    amortissement: "Amortissement mensuel",
    interet1: "Intérêt du premier mois",
    nature: "Suite des intérêts",
    mensualiteK: `Mensualité du mois ${e.rang}`,
    totalInterets: "Total des intérêts",
  }[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "tauxMensuel":
      return [tx("Calcule le taux mensuel équivalent au TAEG, en %, au millième.")];
    case "mensualite":
      return [tx("Calcule la mensualité (au centime).")];
    case "capital":
      return [tx("Calcule le montant qu'il est possible d'emprunter (au centime).")];
    case "cout":
      return [tx("Calcule le coût du crédit (avec la mensualité arrondie au centime, comme la banque).")];
    case "ligne1":
    case "ligne2":
      return [tx(`Complète la ligne ${p === "ligne1" ? e.k : e.k + 1} : intérêts, amortissement et capital restant dû (au centime).`)];
    case "amortissement":
      return [tx("Calcule l'amortissement mensuel (la part du capital remboursée chaque mois).")];
    case "interet1":
      return [tx("Calcule l'intérêt payé le premier mois.")];
    case "nature":
      return [tx("D'un mois au suivant, comment évoluent les intérêts payés ?")];
    case "mensualiteK":
      return [tx(`Calcule la mensualité du mois ${e.rang} (amortissement + intérêt), au centime.`)];
    case "totalInterets":
      return [tx(`Calcule le total des intérêts payés sur les ${e.n} mois.`)];
  }
}

export function champs(e: E, p: P): ChampEcran[] {
  switch (p) {
    case "tauxMensuel":
      return [{ label: "taux mensuel", labelLatex: `${IM}=`, unite: "%", placeholder: "ex. : 0,286" }];
    case "mensualite":
      return [{ label: "mensualité", labelLatex: "m=", unite: "€", placeholder: "ex. : 861,67" }];
    case "capital":
      return [{ label: "montant empruntable", labelLatex: "C=", unite: "€", placeholder: "ex. : 4 517,32" }];
    case "cout":
      return [{ label: "coût du crédit", labelLatex: "", unite: "€", placeholder: "ex. : 340,04" }];
    case "ligne1":
    case "ligne2":
      return [
        { label: "intérêts", labelLatex: "I=", unite: "€", placeholder: "ex. : 4,98" },
        { label: "amortissement", labelLatex: "A=", unite: "€", placeholder: "ex. : 70,02" },
        { label: "capital restant dû", labelLatex: "R=", unite: "€", placeholder: "ex. : 1 669,98" },
      ];
    case "amortissement":
      return [{ label: "amortissement", labelLatex: "A=", unite: "€", placeholder: "ex. : 200" }];
    case "interet1":
      return [{ label: "intérêt du premier mois", labelLatex: "I_1=", unite: "€", placeholder: "ex. : 48" }];
    case "mensualiteK":
      return [{ label: "mensualité", labelLatex: `m_{${e.rang}}=`, unite: "€", placeholder: "ex. : 230,40" }];
    case "totalInterets":
      return [{ label: "total des intérêts", labelLatex: "", unite: "€", placeholder: "ex. : 1 464" }];
    default:
      return [];
  }
}

/* ----------------------------------------------------------------------------------------------
 * Choix « nature » (option 0 = la bonne)
 * -------------------------------------------------------------------------------------------- */

function textesNature(e: E): Frag[][] {
  const raison = (e.r / 100) * amortissementConstant(e);
  return [
    [tx("Ils diminuent toujours du même montant : suite arithmétique de raison "), lx(`-${nL(raison, 4)}`), tx(" €.")],
    [tx("Ils sont multipliés chaque mois par le même nombre : suite géométrique de raison "), lx(decimalL(1 - e.r / 100)), tx(".")],
    [tx("Ils diminuent chaque mois de l'amortissement : suite arithmétique de raison "), lx(`-${nL(amortissementConstant(e), 2)}`), tx(" €.")],
    [tx("Ils restent constants, comme l'amortissement.")],
  ];
}
export function options(e: E): OptionEcran[] {
  const t = textesNature(e);
  return e.ordre.map((k) => ({ id: `o${k}`, fragments: t[k]! }));
}
export const BONNE = "o0";

/* ----------------------------------------------------------------------------------------------
 * Valeurs attendues
 * -------------------------------------------------------------------------------------------- */

export const mensualiteBanque = (e: E) => auCentime(mensualiteExacte(e));
export const coutCredit = (e: E) => (e.variante === "montantEmprunte" ? e.n * e.m - capitalEmpruntable(e) : e.n * mensualiteBanque(e) - e.C);
export const coutCreditExact = (e: E) => e.n * mensualiteExacte(e) - e.C;

/** Lignes attendues (calcul exact depuis le capital restant dû imprimé). */
export function lignesAttendues(e: E, i = iMensuel(e)): [LigneTableau, LigneTableau] {
  const l1 = ligneDepuis(restantDuDonne(e), e.m, i);
  const l2 = ligneDepuis(l1.restant, e.m, i);
  return [l1, l2];
}

function ciblesLigne(e: E, p: "ligne1" | "ligne2"): LigneTableau[] {
  const out: LigneTableau[] = [];
  for (const i of [iMensuel(e), iMensuelArrondi(e)]) {
    const [l1, l2] = lignesAttendues(e, i);
    if (p === "ligne1") out.push(l1);
    else {
      out.push(l2);
      out.push(ligneDepuis(auCentime(l1.restant), e.m, i));
    }
  }
  return out;
}

function cibles(e: E, p: P): number[] {
  const iA = iMensuelArrondi(e);
  switch (p) {
    case "mensualite":
      return [mensualiteExacte(e), mensualiteDe(e.C, iA, e.n)];
    case "capital":
      return [capitalEmpruntable(e), capitalDe(e.m, iA, e.n)];
    case "cout":
      return e.variante === "montantEmprunte"
        ? [coutCredit(e), e.n * e.m - capitalDe(e.m, iA, e.n), e.n * e.m - auCentime(capitalEmpruntable(e))]
        : [coutCredit(e), coutCreditExact(e), e.n * auCentime(mensualiteDe(e.C, iA, e.n)) - e.C];
    case "amortissement":
      return [amortissementConstant(e)];
    case "interet1":
      return [interetRang(e, 1)];
    case "mensualiteK":
      return [mensualiteRang(e, e.rang)];
    case "totalInterets":
      return [totalInterets(e)];
    default:
      return [];
  }
}

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "tauxMensuel":
      return [lx(`${IM}\\approx ${pourcentFixeL(100 * iMensuel(e), 3)}`)];
    case "mensualite":
      return [lx(`m\\approx ${centL(mensualiteExacte(e))}`), tx(" €")];
    case "capital":
      return [lx(`C\\approx ${centL(capitalEmpruntable(e))}`), tx(" €")];
    case "cout":
      return [lx(`\\approx ${centL(coutCredit(e))}`), tx(" €")];
    case "ligne1":
    case "ligne2": {
      const l = lignesAttendues(e)[p === "ligne1" ? 0 : 1];
      return [lx(`I\\approx ${centL(l.interet)}`), tx(" ; "), lx(`A\\approx ${centL(l.amortissement)}`), tx(" ; "), lx(`R\\approx ${centL(l.restant)}`)];
    }
    case "amortissement":
      return [lx(`A${egal(amortissementConstant(e))}${centL(amortissementConstant(e))}`), tx(" €")];
    case "interet1":
      return [lx(`I_1${egal(interetRang(e, 1))}${centL(interetRang(e, 1))}`), tx(" €")];
    case "nature":
      return textesNature(e)[0]!;
    case "mensualiteK":
      return [lx(`m_{${e.rang}}${egal(mensualiteRang(e, e.rang))}${centL(mensualiteRang(e, e.rang))}`), tx(" €")];
    case "totalInterets":
      return [lx(`S_{${e.n}}${egal(totalInterets(e))}${centL(totalInterets(e))}`), tx(" €")];
  }
}
const egal = (x: number) => (Math.abs(x * 100 - Math.round(x * 100)) < 1e-6 ? "=" : "\\approx ");

export function recap(e: E, p: P): Frag[] {
  if (p === "nature") return [tx("Suite arithmétique de raison "), lx(`-${nL((e.r / 100) * amortissementConstant(e), 4)}`)];
  return reponse(e, p);
}

/* ----------------------------------------------------------------------------------------------
 * Aides
 * -------------------------------------------------------------------------------------------- */

export function aide1(_e: E, p: P): AideEcran {
  switch (p) {
    case "tauxMensuel":
      return { texte: [tx("Le TAEG est un taux annuel ; le taux mensuel équivalent donne la même valeur acquise sur un an :")], latex: `(1+${IM})^{12}=1+\\text{TAEG}` };
    case "mensualite":
      return { texte: [tx("Le montant emprunté est la valeur actuelle des mensualités ; on isole la mensualité :")], latex: "m=\\dfrac{C\\cdot i}{1-(1+i)^{-n}}" };
    case "capital":
      return { texte: [tx("Le montant empruntable est la valeur actuelle des mensualités :")], latex: "C=m\\,\\dfrac{1-(1+i)^{-n}}{i}" };
    case "cout":
      return { texte: [tx("Coût du crédit = total des mensualités payées − montant emprunté.")] };
    case "ligne1":
    case "ligne2":
      return { texte: [tx("Intérêts du mois = capital restant dû au début du mois × taux mensuel ; amortissement = mensualité − intérêts ; nouveau capital restant dû = ancien − amortissement.")] };
    case "amortissement":
      return { texte: [tx("Le capital est remboursé en parts égales : divise le montant emprunté par le nombre de mois.")] };
    case "interet1":
      return { texte: [tx("Le premier mois, rien n'est encore remboursé : l'intérêt porte sur tout le capital.")] };
    case "nature":
      return { texte: [tx("Chaque mois, le capital restant dû diminue de l'amortissement, toujours le même ; l'intérêt en est un pourcentage fixe.")] };
    case "mensualiteK":
      return { texte: [tx("Les intérêts forment une suite arithmétique : utilise le terme général :")], latex: "I_k=I_1+(k-1)\\,r" };
    case "totalInterets":
      return { texte: [tx("Somme des n premiers termes d'une suite arithmétique :")], latex: "S_n=\\dfrac{n\\,(I_1+I_n)}{2}" };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  switch (p) {
    case "tauxMensuel":
      return { texte: [tx("Ici :")], latex: `1+${IM}=\\sqrt[12]{${decimalL(1 + e.taeg / 100)}}` };
    case "mensualite":
      return { texte: [tx("Ici, avec le taux mensuel gardé en mémoire et "), lx(`n=${e.n}`), tx(" :")], latex: `m=\\dfrac{${montantL(e.C)}\\cdot ${IM}}{1-(1+${IM})^{-${e.n}}}` };
    case "capital":
      return { texte: [tx("Ici, avec le taux mensuel gardé en mémoire :")], latex: `C=${montantL(e.m)}\\cdot\\dfrac{1-(1+${IM})^{-${e.n}}}{${IM}}` };
    case "cout":
      return e.variante === "montantEmprunte" ? { texte: [tx("Ici :")], latex: `${e.n}\\cdot ${montantL(e.m)}-C` } : { texte: [tx("Ici, avec la mensualité arrondie au centime :")], latex: `${e.n}\\cdot m-${montantL(e.C)}` };
    case "ligne1":
      return { texte: [tx(`Ici, le capital restant dû au début de la période ${e.k} est ${centT(restantDuDonne(e))} € :`)], latex: `I=${centL(restantDuDonne(e))}\\cdot ${IM}` };
    case "ligne2":
      return { texte: [tx("Recommence avec le capital restant dû que tu viens de trouver.")] };
    case "amortissement":
      return { texte: [tx("Ici :")], latex: `A=\\dfrac{${montantL(e.C)}}{${e.n}}` };
    case "interet1":
      return { texte: [tx("Ici :")], latex: `I_1=${montantL(e.C)}\\cdot ${decimalL(e.r / 100)}` };
    case "nature":
      return { texte: [tx("Ici, le capital restant dû baisse de "), lx(montantL(amortissementConstant(e))), tx(" € par mois ; l'intérêt baisse donc chaque mois de "), lx(`${pourcentL(e.r)}`), tx(" de ce montant.")] };
    case "mensualiteK":
      return { texte: [tx("Ici, la raison des intérêts est "), lx(`r=-${nL((e.r / 100) * amortissementConstant(e), 4)}`), tx(" et "), lx(`I_1=${centL(interetRang(e, 1))}`), tx(".")] };
    case "totalInterets":
      return { texte: [tx("Ici, calcule d'abord l'intérêt du dernier mois "), lx(`I_{${e.n}}`), tx(" avec le terme général.")] };
  }
}

export function messageIllisible(_e: E, p: P): string {
  return p === "tauxMensuel" ? MESSAGE_TAUX : MESSAGE_MONTANT;
}

export function explicationChoix(e: E): string {
  return `Le capital restant dû baisse chaque mois de ${centT(amortissementConstant(e))} € ; l'intérêt, qui en est ${nL(e.r, 2).replace("{,}", ",")} %, baisse donc chaque mois du même montant.`;
}

/* ----------------------------------------------------------------------------------------------
 * Vérification
 * -------------------------------------------------------------------------------------------- */

export function diagnostiquer(e: E, p: P, v: string[]): StatutVerification[] {
  const s = v[0] ?? "";
  if (p === "nature") return [s === BONNE ? "correct" : "not_equivalent"];
  if (p === "tauxMensuel") return [statutTaux(s, [100 * iMensuel(e)], 0.001)];
  if (p === "ligne1" || p === "ligne2") {
    const cs = ciblesLigne(e, p);
    return [
      statutMontant(v[0] ?? "", cs.map((c) => c.interet)),
      statutMontant(v[1] ?? "", cs.map((c) => c.amortissement)),
      statutMontant(v[2] ?? "", cs.map((c) => c.restant)),
    ];
  }
  return [statutMontant(s, cibles(e, p))];
}

export function approchee(e: E, p: P, v: string[]): string | null {
  if (p === "nature") return null;
  if (p === "tauxMensuel") return tropArrondi(v[0] ?? "", [100 * iMensuel(e)], 3, 0.001, "au millième (en %)");
  if (p === "ligne1" || p === "ligne2") {
    const cs = ciblesLigne(e, p);
    return (
      tropArrondi(v[0] ?? "", cs.map((c) => c.interet), 2, TOL_CENTIME, "au centime (intérêts)") ??
      tropArrondi(v[1] ?? "", cs.map((c) => c.amortissement), 2, TOL_CENTIME, "au centime (amortissement)") ??
      tropArrondi(v[2] ?? "", cs.map((c) => c.restant), 2, TOL_CENTIME, "au centime (capital restant dû)")
    );
  }
  return tropArrondi(v[0] ?? "", cibles(e, p), 2, TOL_CENTIME, "au centime");
}

export function piege(e: E, p: P, v: string[]): Frag[] | null {
  if (p !== "nature" && diagnostiquer(e, p, v).every((x) => x === "correct")) return null;
  const x = lireNombre(v[0] ?? "");
  const pres = (c: number, t = 0.011) => x !== null && Math.abs(x - c) <= t + 1e-9 * Math.abs(c);
  const i = iMensuel(e);
  switch (p) {
    case "tauxMensuel":
      if (pres(e.taeg / 12, 0.0011)) return [tx("Diviser le TAEG par 12 ne donne pas le taux équivalent : prends la racine douzième de "), lx(decimalL(1 + e.taeg / 100)), tx(", puis retire 1.")];
      return null;
    case "mensualite":
      if (pres(e.C / e.n)) return [tx("C'est le capital divisé par le nombre de mois : il manque les intérêts.")];
      if (pres(mensualiteDe(e.C, e.taeg / 1200, e.n), 0.05) && Math.abs(mensualiteDe(e.C, e.taeg / 1200, e.n) - mensualiteExacte(e)) > 0.02) return [tx("Le taux mensuel n'est pas le TAEG divisé par 12 : utilise le taux mensuel équivalent.")];
      if (pres((e.C * i) / (Math.pow(1 + i, e.n) - 1))) return [tx("Le montant emprunté est une valeur actuelle : le dénominateur est "), lx("1-(1+i)^{-n}"), tx(".")];
      return null;
    case "capital":
      if (pres(e.n * e.m)) return [tx("C'est le total des mensualités : le montant emprunté est plus petit, il faut actualiser.")];
      if (pres(e.m * (Math.pow(1 + i, e.n) - 1) / i)) return [tx("C'est la valeur acquise des mensualités au dernier versement ; le montant emprunté est leur valeur actuelle.")];
      return null;
    case "cout":
      if (e.variante !== "montantEmprunte" && pres(e.n * mensualiteBanque(e))) return [tx("C'est le total payé : le coût du crédit est ce qu'on paie en plus du montant emprunté.")];
      if (e.variante === "montantEmprunte" && pres(e.n * e.m)) return [tx("C'est le total payé : le coût du crédit est ce qu'on paie en plus du montant emprunté.")];
      if (e.variante !== "montantEmprunte" && pres((e.C * e.taeg * e.n) / 1200, 0.5)) return [tx("Le coût ne se calcule pas en appliquant le TAEG au montant emprunté : les intérêts portent sur le capital restant dû, qui diminue.")];
      return null;
    case "ligne1":
    case "ligne2": {
      const crd = p === "ligne1" ? restantDuDonne(e) : lignesAttendues(e)[0].restant;
      if (pres(crd * (e.taeg / 100))) return [tx("Les intérêts d'un mois se calculent avec le taux mensuel équivalent, pas avec le TAEG.")];
      if (pres(e.m * i)) return [tx("Les intérêts portent sur le capital restant dû, pas sur la mensualité.")];
      return null;
    }
    case "interet1":
      if (pres(amortissementConstant(e) * (e.r / 100))) return [tx("Le premier mois, l'intérêt porte sur tout le capital emprunté, pas sur l'amortissement.")];
      return null;
    case "mensualiteK":
      if (pres(interetRang(e, e.rang))) return [tx("C'est l'intérêt du mois : la mensualité est l'amortissement plus l'intérêt.")];
      if (pres(mensualiteRang(e, e.rang + 1)) || pres(mensualiteRang(e, e.rang - 1))) return [tx("Vérifie le rang : le terme général est "), lx("I_1+(k-1)\\,r"), tx(".")];
      return null;
    case "totalInterets":
      if (pres(e.n * interetRang(e, 1))) return [tx("Les intérêts diminuent chaque mois : ce n'est pas n fois l'intérêt du premier mois.")];
      return null;
    default:
      return null;
  }
}
