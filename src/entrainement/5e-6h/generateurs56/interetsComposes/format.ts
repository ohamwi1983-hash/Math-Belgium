import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import {
  centL,
  decimalL,
  eurCentT,
  eurT,
  lireNombre,
  MESSAGE_ENTIER,
  MESSAGE_MONTANT,
  MESSAGE_TAUX,
  montantL,
  nL,
  pourcentFixeL,
  pourcentL,
  pourcentT,
  statutEntier,
  statutMontant,
  statutTaux,
  TOL_CENTIME,
  tropArrondi,
} from "../finance/commun";
import type { ExerciceInteretsComposes, PhaseInteretsComposes } from "./index";
import { facteur, interetMixte, premiereAnnee, tauxDecimal, tauxRetrouve, totalMixte, valeurAcquise, valeurActuelle, valeurDonnee } from "./index";

/**
 * Couche texte de `56gen25` « Intérêts composés » : situation, consignes, champs, options des choix
 * fermés (l'option 0 est la bonne, ordre mélangé stocké dans l'instance), aides à deux niveaux,
 * réponses, messages ciblés et vérification. Source unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceInteretsComposes;
type P = PhaseInteretsComposes;

export const fL = (e: E) => decimalL(facteur(e));
export const iL = (e: E) => decimalL(tauxDecimal(e));
const ans = (n: number) => (n === 1 ? "1 an" : `${n} ans`);
const cibleT = (e: E) => eurT(e.cible);

/* ----------------------------------------------------------------------------------------------
 * Énoncé
 * -------------------------------------------------------------------------------------------- */

function projet(e: E): string {
  const p = e.prenom;
  return [
    `Pour financer ses études dans ${ans(e.n)}, ${p} voudrait disposer de ${cibleT(e)}.`,
    `${p} voudrait disposer de ${cibleT(e)} dans ${ans(e.n)} pour acheter une voiture.`,
    `Une artisane veut renouveler sa machine dans ${ans(e.n)} ; elle aura besoin de ${cibleT(e)}.`,
  ][e.contexte]!;
}

export function situation(e: E): Frag[] {
  const p = e.prenom;
  switch (e.variante) {
    case "valeurAcquise":
      return [tx(`${p} place ${eurT(e.C0)} à intérêts composés, au taux annuel de ${pourcentT(e.tauxPct)}, pendant ${ans(e.n)} (les intérêts sont capitalisés chaque année).`)];
    case "valeurActuelle":
      return [tx(`${projet(e)} Un placement à intérêts composés rapporte ${pourcentT(e.tauxPct)} par an.`)];
    case "taux":
      return [tx(`Il y a ${ans(e.n)}, ${p} a placé ${eurT(e.C0)} à intérêts composés (taux annuel fixe, capitalisation annuelle). Aujourd'hui, la banque lui remet ${eurCentT(valeurDonnee(e))}.`)];
    case "duree":
      return [tx(`${p} place ${eurT(e.C0)} à intérêts composés, au taux annuel de ${pourcentT(e.tauxPct)} (capitalisation annuelle).`)];
    case "doublement":
      return [tx(`Un capital est placé à intérêts composés, au taux annuel de ${pourcentT(e.tauxPct)} (capitalisation annuelle).`)];
    case "dureeMixte":
      return [tx(`${p} place ${eurT(e.C0)} sur un compte d'épargne au taux annuel de ${pourcentT(e.tauxPct)}, pendant ${ans(e.n)} et ${e.mois} mois. Pour les années entières, les intérêts sont composés ; pour la fraction d'année, la banque calcule un intérêt simple.`)];
  }
}

export function question(e: E): Frag[] {
  switch (e.variante) {
    case "valeurAcquise":
      return [tx("Calcule la valeur acquise au terme du placement et le montant des intérêts produits.")];
    case "valeurActuelle":
      return [tx("Quel montant faut-il placer aujourd'hui pour disposer de cette somme au moment voulu ?")];
    case "taux":
      return [tx("Quel a été le taux annuel de ce placement (en %, au centième) ?")];
    case "duree":
      return [tx(`Au bout de combien d'années entières le capital atteindra-t-il au moins ${cibleT(e)} ? Quel sera alors le capital ?`)];
    case "doublement":
      return [tx("Au bout de combien d'années entières ce capital aura-t-il au moins doublé ?")];
    case "dureeMixte":
      return [tx("Calcule la valeur acquise au terme du placement.")];
  }
}

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), tx(" "), ...question(e)];
}

export function libelle(_e: E, p: P): string {
  return {
    suite: "Suite des valeurs acquises",
    valeur: "Valeur acquise",
    interets: "Intérêts produits",
    formule: "Formule",
    capital: "Capital à placer",
    taux: "Taux annuel",
    inequation: "Inéquation",
    annees: "Nombre d'années",
    montant: "Capital atteint",
    composes: "Années entières",
    simple: "Fraction d'année",
    total: "Valeur acquise",
  }[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "suite":
      return [tx("D'une année à l'autre, les valeurs acquises successives forment une suite. Laquelle ?")];
    case "valeur":
      return [tx(`Calcule la valeur acquise `), lx(`C_{${e.n}}`), tx(" au terme du placement (au centime).")];
    case "interets":
      return [tx("Calcule le montant total des intérêts produits (au centime).")];
    case "formule":
      return e.variante === "taux" ? [tx("Quelle égalité donne le taux annuel "), lx("i"), tx(" ?")] : [tx("Quelle égalité donne le montant "), lx("C_0"), tx(" à placer aujourd'hui ?")];
    case "capital":
      return [tx("Calcule le montant à placer aujourd'hui (au centime).")];
    case "taux":
      return [tx("Calcule le taux annuel, en %, au centième.")];
    case "inequation":
      return e.variante === "doublement" ? [tx("Le capital a doublé quand sa valeur acquise atteint deux fois le capital de départ. Quelle inéquation faut-il résoudre ?")] : [tx("Quelle inéquation traduit la question ?")];
    case "annees":
      return [tx("Avec la table de la calculatrice, détermine le plus petit nombre entier d'années qui convient.")];
    case "montant":
      return [tx("Quel sera le capital à ce moment-là (au centime) ?")];
    case "composes":
      return [tx(`Calcule la valeur acquise au bout des ${ans(e.n)} entiers (intérêts composés), au centime.`)];
    case "simple":
      return [tx(`Calcule l'intérêt simple produit par ce capital pendant les ${e.mois} mois restants (au centime).`)];
    case "total":
      return [tx("Calcule la valeur acquise au terme du placement (au centime).")];
  }
}

export function champs(e: E, p: P): ChampEcran[] {
  switch (p) {
    case "valeur":
      return [{ label: "valeur acquise", labelLatex: `C_{${e.n}}=`, unite: "€", placeholder: "ex. : 59 384,31" }];
    case "interets":
      return [{ label: "intérêts", labelLatex: "I=", unite: "€", placeholder: "ex. : 9 384,31" }];
    case "capital":
      return [{ label: "montant à placer", labelLatex: "C_0=", unite: "€", placeholder: "ex. : 12 516,26" }];
    case "taux":
      return [{ label: "taux annuel", labelLatex: "i=", unite: "%", placeholder: "ex. : 2,45" }];
    case "annees":
      return [{ label: "nombre d'années", labelLatex: "n=", unite: "ans", placeholder: "ex. : 12" }];
    case "montant":
      return [{ label: "capital atteint", labelLatex: "", unite: "€", placeholder: "ex. : 1 506,39" }];
    case "composes":
      return [{ label: "valeur acquise après les années entières", labelLatex: `C_{${e.n}}=`, unite: "€", placeholder: "ex. : 2 121,80" }];
    case "simple":
      return [{ label: "intérêt simple", labelLatex: "I=", unite: "€", placeholder: "ex. : 15,91" }];
    case "total":
      return [{ label: "valeur acquise", labelLatex: "C=", unite: "€", placeholder: "ex. : 2 137,71" }];
    default:
      return [];
  }
}

/* ----------------------------------------------------------------------------------------------
 * Choix fermés (option 0 = la bonne)
 * -------------------------------------------------------------------------------------------- */

function textesOptions(e: E, p: P): Frag[][] {
  const f = fL(e);
  const i = iL(e);
  const C = montantL(e.C0);
  switch (p) {
    case "suite":
      return [
        [tx("Une suite géométrique de raison "), lx(f)],
        [tx("Une suite arithmétique de raison "), lx(`C_0\\cdot i=${centL(e.C0 * tauxDecimal(e))}`)],
        [tx("Une suite géométrique de raison "), lx(i)],
        [tx("Une suite arithmétique de raison "), lx(f)],
      ];
    case "formule":
      return e.variante === "taux"
        ? [[lx("i=\\sqrt[n]{\\dfrac{C_n}{C_0}}-1")], [lx("i=\\sqrt[n]{\\dfrac{C_n}{C_0}}")], [lx("i=\\dfrac{C_n-C_0}{n\\cdot C_0}")], [lx("i=\\left(\\dfrac{C_n}{C_0}\\right)^{n}-1")]]
        : [[lx("C_0=C_n\\,(1+i)^{-n}")], [lx("C_0=C_n\\,(1-i)^{n}")], [lx("C_0=\\dfrac{C_n}{1+n\\cdot i}")], [lx("C_0=C_n\\,(1+i)^{n}")]];
    case "inequation":
      return e.variante === "doublement"
        ? [[lx(`${f}^{\\,n}\\geq 2`)], [lx(`1+${i}\\,n\\geq 2`)], [lx(`${f}\\cdot n\\geq 2`)], [lx(`${i}^{\\,n}\\geq 2`)]]
        : [[lx(`${C}\\cdot ${f}^{\\,n}\\geq ${montantL(e.cible)}`)], [lx(`${C}\\,(1+${i}\\,n)\\geq ${montantL(e.cible)}`)], [lx(`${C}\\cdot ${i}^{\\,n}\\geq ${montantL(e.cible)}`)], [lx(`${C}\\cdot ${f}\\cdot n\\geq ${montantL(e.cible)}`)]];
    default:
      return [];
  }
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

export const cibleAnnees = (e: E) => premiereAnnee(e);
export const montantAtteint = (e: E) => valeurAcquise(e, premiereAnnee(e));

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "suite":
    case "formule":
    case "inequation":
      return optionJuste(e, p);
    case "valeur":
      return [lx(`C_{${e.n}}\\approx ${centL(valeurAcquise(e))}`), tx(" €")];
    case "interets":
      return [lx(`I\\approx ${centL(valeurAcquise(e) - e.C0)}`), tx(" €")];
    case "capital":
      return [lx(`C_0\\approx ${centL(valeurActuelle(e))}`), tx(" €")];
    case "taux":
      return [lx(`i\\approx ${pourcentFixeL(tauxRetrouve(e), 2)}`)];
    case "annees":
      return [tx(`${cibleAnnees(e)} ans`)];
    case "montant":
      return [lx(`C_{${cibleAnnees(e)}}\\approx ${centL(montantAtteint(e))}`), tx(" €")];
    case "composes":
      return [lx(`C_{${e.n}}\\approx ${centL(valeurAcquise(e))}`), tx(" €")];
    case "simple":
      return [lx(`I\\approx ${centL(interetMixte(e))}`), tx(" €")];
    case "total":
      return [lx(`C\\approx ${centL(totalMixte(e))}`), tx(" €")];
  }
}

export const recap = reponse;

/* ----------------------------------------------------------------------------------------------
 * Aides
 * -------------------------------------------------------------------------------------------- */

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "suite":
      return { texte: [tx("Chaque année, le capital est augmenté de ses intérêts : on le multiplie par le même nombre.")], latex: "C_{n+1}=C_n+C_n\\cdot i=C_n\\,(1+i)" };
    case "valeur":
      return { texte: [tx("Valeur acquise d'un capital placé à intérêts composés pendant n périodes, au taux i par période (écriture décimale) :")], latex: "C_n=C_0\\,(1+i)^n" };
    case "interets":
      return { texte: [tx("Les intérêts produits sont ce que le placement a rapporté : la valeur acquise moins le capital placé.")] };
    case "formule":
      return e.variante === "taux"
        ? { texte: [tx("Pars de "), lx("C_n=C_0\\,(1+i)^n"), tx(" : isole "), lx("(1+i)^n"), tx(", puis prends la racine n-ième des deux membres.")] }
        : { texte: [tx("Pars de "), lx("C_n=C_0\\,(1+i)^n"), tx(" et divise les deux membres par "), lx("(1+i)^n"), tx(" : c'est la valeur actuelle de "), lx("C_n"), tx(".")] };
    case "capital":
      return { texte: [tx("Valeur actuelle d'un montant disponible dans n années :")], latex: "C_0=C_n\\,(1+i)^{-n}" };
    case "taux":
      return { texte: [tx("Utilise "), lx("i=\\sqrt[n]{\\dfrac{C_n}{C_0}}-1"), tx(" (touche racine n-ième, ou puissance "), lx("\\frac{1}{n}"), tx(") ; multiplie par 100 pour l'avoir en %.")] };
    case "inequation":
      return { texte: [tx("En intérêts composés, la valeur acquise après n années est "), lx("C_0\\,(1+i)^n"), tx(" ; on veut qu'elle atteigne au moins le montant visé.")] };
    case "annees":
      return { texte: [tx("L'inconnue est en exposant : on ne sait pas encore l'isoler. Menu Table de la calculatrice : entre la fonction de X, début 1, pas 1, et cherche la première valeur de X qui convient.")] };
    case "montant":
      return { texte: [tx("Calcule la valeur acquise pour le nombre d'années trouvé :")], latex: "C_n=C_0\\,(1+i)^n" };
    case "composes":
      return { texte: [tx("Pour les années entières, on applique la formule des intérêts composés :")], latex: "C_n=C_0\\,(1+i)^n" };
    case "simple":
      return { texte: [tx("Pour la fraction d'année, l'intérêt est simple et calculé sur le capital atteint ; la durée est en années :")], latex: "I=C_n\\cdot i\\cdot t" };
    case "total":
      return { texte: [tx("La valeur acquise finale est le capital atteint après les années entières, augmenté de l'intérêt simple de la fraction d'année.")] };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  const f = fL(e);
  const C = montantL(e.C0);
  switch (p) {
    case "suite":
      return { texte: [tx(`Ici, multiplier par ${nL(facteur(e), 6).replace("{,}", ",")}, c'est ajouter ${pourcentT(e.tauxPct)} au capital.`)] };
    case "valeur":
      return { texte: [tx("Ici :")], latex: `C_{${e.n}}=${C}\\cdot ${f}^{${e.n}}` };
    case "interets":
      return { texte: [tx("Ici, avec la valeur acquise de l'écran précédent :")], latex: `I=C_{${e.n}}-${C}` };
    case "formule":
      return e.variante === "taux"
        ? { texte: [tx("Après division par "), lx("C_0"), tx(" :")], latex: "(1+i)^n=\\dfrac{C_n}{C_0}" }
        : { texte: [tx("On cherche "), lx("C_0"), tx(" tel que "), lx("C_0\\,(1+i)^n=C_n"), tx(".")] };
    case "capital":
      return { texte: [tx("Ici :")], latex: `C_0=${montantL(e.cible)}\\cdot ${f}^{-${e.n}}` };
    case "taux":
      return { texte: [tx("Ici :")], latex: `i=\\sqrt[${e.n}]{\\dfrac{${centL(valeurDonnee(e))}}{${C}}}-1` };
    case "inequation":
      return e.variante === "doublement"
        ? { texte: [tx("Si le capital de départ est "), lx("C_0"), tx(", on veut "), lx(`C_0\\cdot ${f}^{\\,n}\\geq 2\\,C_0`), tx(" : simplifie par "), lx("C_0"), tx(".")] }
        : { texte: [tx("Ici, "), lx(`C_0=${C}`), tx(" et "), lx(`1+i=${f}`), tx(".")] };
    case "annees":
      return e.variante === "doublement"
        ? { texte: [tx("Ici : table de "), lx(`Y_1=${f}^{X}`), tx(" ; cherche la première valeur de X pour laquelle "), lx("Y_1\\geq 2"), tx(".")] }
        : { texte: [tx("Ici : table de "), lx(`Y_1=${C}\\cdot ${f}^{X}`), tx(" ; cherche la première valeur de X pour laquelle "), lx(`Y_1\\geq ${montantL(e.cible)}`), tx(".")] };
    case "montant":
      return { texte: [tx("C'est la valeur de "), lx("Y_1"), tx(" pour le nombre d'années trouvé, que la table affiche déjà.")] };
    case "composes":
      return { texte: [tx("Ici :")], latex: `C_{${e.n}}=${C}\\cdot ${f}^{${e.n}}` };
    case "simple":
      return { texte: [tx("Ici, avec le capital de l'écran précédent :")], latex: `I=C_{${e.n}}\\cdot ${iL(e)}\\cdot\\dfrac{${e.mois}}{12}` };
    case "total":
      return { texte: [tx("Ici :")], latex: `C=C_{${e.n}}+I` };
  }
}

export function messageIllisible(_e: E, p: P): string {
  if (p === "annees") return MESSAGE_ENTIER;
  if (p === "taux") return MESSAGE_TAUX;
  return MESSAGE_MONTANT;
}

export function explicationChoix(e: E, p: P): string {
  if (p === "suite") return "Chaque année, le capital est multiplié par 1 + i : c'est une suite géométrique.";
  if (p === "inequation") return "La valeur acquise après n années est C₀(1 + i)ⁿ ; elle doit atteindre au moins le montant visé.";
  return e.variante === "taux" ? "De Cₙ = C₀(1 + i)ⁿ : on divise par C₀, puis 1 + i est la racine n-ième du quotient de Cₙ par C₀." : "On divise Cₙ par (1 + i)ⁿ, c'est-à-dire qu'on le multiplie par (1 + i)⁻ⁿ.";
}

/* ----------------------------------------------------------------------------------------------
 * Vérification
 * -------------------------------------------------------------------------------------------- */

function attendu(e: E, p: P): number {
  switch (p) {
    case "valeur":
    case "composes":
      return valeurAcquise(e);
    case "interets":
      return valeurAcquise(e) - e.C0;
    case "capital":
      return valeurActuelle(e);
    case "montant":
      return montantAtteint(e);
    case "simple":
      return interetMixte(e);
    case "total":
      return totalMixte(e);
    default:
      return NaN;
  }
}

/** Total de la convention mixte calculé avec le capital ARRONDI au centime (comme une banque) : admis. */
const totalAvecArrondi = (e: E) => {
  const c = Math.round(valeurAcquise(e) * 100) / 100;
  return c + c * tauxDecimal(e) * (e.mois / 12);
};

export function diagnostiquer(e: E, p: P, v: string[]): StatutVerification[] {
  const s = v[0] ?? "";
  switch (p) {
    case "suite":
    case "formule":
    case "inequation":
      return [s === BONNE ? "correct" : "not_equivalent"];
    case "taux":
      return [statutTaux(s, [tauxRetrouve(e)], 0.01)];
    case "annees":
      return [statutEntier(s, cibleAnnees(e))];
    case "total":
      return [statutMontant(s, [totalMixte(e), totalAvecArrondi(e)])];
    default:
      return [statutMontant(s, [attendu(e, p)])];
  }
}

export function approchee(e: E, p: P, v: string[]): string | null {
  const s = v[0] ?? "";
  if (p === "taux") return tropArrondi(s, [tauxRetrouve(e)], 2, 0.01, "au centième (en %)");
  if (p === "suite" || p === "formule" || p === "inequation" || p === "annees") return null;
  return tropArrondi(s, [attendu(e, p)], 2, TOL_CENTIME, "au centime");
}

export function piege(e: E, p: P, v: string[]): Frag[] | null {
  const s = v[0] ?? "";
  if (p !== "suite" && p !== "formule" && p !== "inequation" && diagnostiquer(e, p, v).every((x) => x === "correct")) return null;
  const x = lireNombre(s);
  const i = tauxDecimal(e);
  const proche = (c: number, tol = 0.011) => x !== null && Math.abs(x - c) <= tol + 1e-9 * Math.abs(c);
  switch (p) {
    case "valeur":
    case "composes":
      if (proche(e.C0 * (1 + i * e.n))) return [tx("C'est la valeur acquise à intérêt simple : en intérêts composés, les intérêts rapportent à leur tour.")];
      if (proche(e.C0 * Math.pow(1 + e.tauxPct, e.n), 1e-6 * e.C0 * Math.pow(1 + e.tauxPct, e.n))) return [tx("Le taux s'écrit en écriture décimale : "), lx(`${pourcentL(e.tauxPct)}=${iL(e)}`), tx(".")];
      if (proche(e.C0 * Math.pow(facteur(e), e.n - 1)) || proche(e.C0 * Math.pow(facteur(e), e.n + 1))) return [tx("Vérifie l'exposant : il est égal au nombre d'années de placement.")];
      if (proche(e.C0 * Math.pow(i, e.n), 1)) return [tx("On multiplie chaque année par "), lx("1+i"), tx(", pas par "), lx("i"), tx(".")];
      return null;
    case "interets":
      if (proche(valeurAcquise(e))) return [tx("C'est la valeur acquise : les intérêts sont ce qu'elle a en plus du capital placé.")];
      if (proche(e.C0 * i * e.n)) return [tx("Ce sont les intérêts d'un placement à intérêt simple.")];
      return null;
    case "capital":
      if (proche(e.cible * Math.pow(1 - i, e.n))) return [tx("Retirer "), lx(`${pourcentL(e.tauxPct)}`), tx(" chaque année ne compense pas un ajout de "), lx(`${pourcentL(e.tauxPct)}`), tx(" : il faut diviser par "), lx("(1+i)^n"), tx(".")];
      if (proche(e.cible / (1 + i * e.n))) return [tx("C'est l'actualisation à intérêt simple : en intérêts composés, on divise par "), lx("(1+i)^n"), tx(".")];
      if (proche(e.cible * Math.pow(facteur(e), e.n))) return [tx("On cherche le capital de départ : l'exposant est négatif.")];
      return null;
    case "taux": {
      if (x === null) return null;
      const r = tauxRetrouve(e);
      const q = valeurDonnee(e) / e.C0;
      if (Math.abs(x - 100 * Math.pow(q, 1 / e.n)) <= 0.02 || Math.abs(x - Math.pow(q, 1 / e.n)) <= 0.0002) return [tx("Retire 1 : la racine n-ième donne le facteur "), lx("1+i"), tx(", pas le taux.")];
      const simple = (100 * (q - 1)) / e.n;
      if (Math.abs(simple - r) > 0.02 && Math.abs(x - simple) <= 0.011) return [tx("Diviser le gain total par le nombre d'années, c'est raisonner en intérêt simple : en intérêts composés, on prend la racine n-ième.")];
      if (Math.abs(x - 100 * (q - 1)) <= 0.011) return [tx("C'est le taux sur toute la durée du placement : on demande un taux annuel.")];
      return null;
    }
    case "annees": {
      if (x === null) return null;
      const n = cibleAnnees(e);
      if (x === n - 1) return [tx("Vérifie : au bout de ce nombre d'années, le capital n'a pas encore atteint le montant visé.")];
      if (x === n + 1) return [tx("Un an plus tôt, le montant visé est déjà atteint : on cherche le plus petit nombre d'années qui convient.")];
      const c = e.variante === "doublement" ? 2 * e.C0 : e.cible;
      const nSimple = Math.ceil((c / e.C0 - 1) / i - 1e-9);
      if (nSimple !== n && x === nSimple) return [tx("Ce serait le nombre d'années à intérêt simple : en intérêts composés, le capital grandit plus vite.")];
      return null;
    }
    case "montant":
      if (proche(valeurAcquise(e, cibleAnnees(e) - 1))) return [tx("C'est le capital un an trop tôt : il n'atteint pas encore le montant visé.")];
      if (proche(e.cible)) return [tx("C'est le montant visé : le capital réellement atteint le dépasse un peu.")];
      return null;
    case "simple":
      if (proche(e.C0 * i * (e.mois / 12))) return [tx("L'intérêt de la fraction d'année est calculé sur le capital atteint après les années entières, pas sur le capital de départ.")];
      if (proche(valeurAcquise(e) * i * e.mois)) return [tx("La durée s'exprime en années : "), lx(`\\dfrac{${e.mois}}{12}`), tx(".")];
      if (proche(valeurAcquise(e) * (Math.pow(facteur(e), e.mois / 12) - 1))) return [tx("Pour la fraction d'année, la convention de la banque est l'intérêt simple, pas une puissance fractionnaire.")];
      return null;
    case "total":
      if (proche(interetMixte(e))) return [tx("C'est l'intérêt de la fraction d'année : ajoute-le au capital atteint.")];
      if (proche(e.C0 * Math.pow(facteur(e), e.n + e.mois / 12))) return [tx("Pour la fraction d'année, la convention de la banque est l'intérêt simple, pas une puissance fractionnaire.")];
      return null;
    default:
      return null;
  }
}
