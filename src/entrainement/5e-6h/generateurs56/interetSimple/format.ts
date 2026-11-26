import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import {
  centL,
  dateT,
  decompositionJours,
  decimalL,
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
import type { ExerciceInteretSimple, PhaseInteretSimple } from "./index";
import { dureeAnnees, interet, interetDepuisDonnee, interetDonne, tauxDecimal, tauxRetrouve, valeurAcquise, valeurDonnee } from "./index";

/**
 * Couche texte de `56gen24` « Intérêt simple » : situation, consignes, champs, options, aides à deux
 * niveaux (propriété du cours, puis posée pour l'instance — jamais la réponse), réponses, messages
 * ciblés et vérification. Source unique de l'écran, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceInteretSimple;
type P = PhaseInteretSimple;

const uniteT = (e: E) => (e.unite === "jours" ? "jours" : e.unite === "mois" ? "mois" : "quinzaines");
const dureeT = (e: E) => (e.unite === "jours" && e.debut && e.fin ? `du ${dateT(e.debut)} au ${dateT(e.fin)}` : `pendant ${e.nb} ${uniteT(e)}`);
/** t en années, LaTeX : « \dfrac{68}{365} ». */
export const tL = (e: E) => `\\dfrac{${e.nb}}{${e.unite === "jours" ? 365 : e.unite === "mois" ? 12 : 24}}`;
const tauxL = (e: E) => decimalL(tauxDecimal(e));

/* ----------------------------------------------------------------------------------------------
 * Énoncé
 * -------------------------------------------------------------------------------------------- */

export function situation(e: E): Frag[] {
  const p = e.prenom;
  switch (e.variante) {
    case "jours":
    case "mois":
    case "quinzaines":
      return [tx(`${p} place ${eurT(e.C0)} sur un compte d'épargne à intérêt simple, au taux annuel de ${pourcentT(e.tauxPct)}, ${dureeT(e)}.`)];
    case "capital":
      return e.donnee === "interet"
        ? [tx(`Il y a ${e.nb} mois, ${p} a placé une somme d'argent à intérêt simple, au taux annuel de ${pourcentT(e.tauxPct)}. Aujourd'hui, ce placement lui a rapporté un intérêt de ${eurT(interetDonne(e))}.`)]
        : [tx(`Il y a ${e.nb} mois, ${p} a placé une somme d'argent à intérêt simple, au taux annuel de ${pourcentT(e.tauxPct)}. Aujourd'hui, la banque lui remet ${eurT(valeurDonnee(e))}.`)];
    case "taux":
      return [tx(`${p} a placé ${eurT(e.C0)} à intérêt simple ${dureeT(e)}. À la fin du placement, la banque lui remet ${eurT(valeurDonnee(e))}.`)];
    case "duree":
      return [tx(`${p} a placé ${eurT(e.C0)} à intérêt simple, au taux annuel de ${pourcentT(e.tauxPct)}. À la fin du placement, la banque lui remet ${eurT(valeurDonnee(e))}.`)];
  }
}

/** Question globale (écran et papier). */
export function question(e: E): Frag[] {
  switch (e.variante) {
    case "jours":
    case "mois":
    case "quinzaines":
      return [tx("Calcule l'intérêt produit et la valeur acquise au terme du placement.")];
    case "capital":
      return [tx("Quel capital avait été placé ?")];
    case "taux":
      return [tx("Quel est le taux annuel de ce placement (en %, au centième) ?")];
    case "duree":
      return [tx("Pendant combien de mois l'argent a-t-il été placé ?")];
  }
}

export function consigneGenerale(e: E): Frag[] {
  const conv = e.unite === "jours" ? " Année de 365 jours, jours exacts." : e.unite === "quinzaines" ? " Une année compte 24 quinzaines." : "";
  return [...situation(e), tx(" "), ...question(e), tx(conv)];
}

export function libelle(e: E, p: P): string {
  switch (p) {
    case "jours":
      return "Nombre de jours";
    case "duree":
      return "Durée en années";
    case "interet":
      return "Intérêt";
    case "valeur":
      return "Valeur acquise";
    case "formule":
      return "Formule transformée";
    case "capital":
      return "Capital placé";
    case "taux":
      return "Taux annuel";
    case "dureeMois":
      return e.variante === "duree" ? "Durée en mois" : "Durée";
  }
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "jours":
      return [tx(`Combien de jours le placement a-t-il duré, ${dureeT(e)} ?`)];
    case "duree":
      return [tx(`Exprime la durée du placement en années : `), lx("t"), tx(` (fraction ou décimal au millième).`)];
    case "interet":
      return e.variante === "jours" || e.variante === "mois" || e.variante === "quinzaines"
        ? [tx("Calcule l'intérêt "), lx("I"), tx(" produit par le placement (au centime).")]
        : [tx("Quel intérêt "), lx("I"), tx(" le placement a-t-il rapporté ?")];
    case "valeur":
      return [tx("Calcule la valeur acquise "), lx("C_t"), tx(" au terme du placement (au centime).")];
    case "formule":
      return e.variante === "capital"
        ? [tx("Quelle égalité donne le capital placé "), lx("C_0"), tx(" ?")]
        : e.variante === "taux"
          ? [tx("Quelle égalité donne le taux annuel "), lx("i"), tx(" ?")]
          : [tx("Quelle égalité donne la durée "), lx("t"), tx(" en années ?")];
    case "capital":
      return [tx("Calcule le capital placé "), lx("C_0"), tx(" (au centime).")];
    case "taux":
      return [tx("Calcule le taux annuel du placement, en %, au centième.")];
    case "dureeMois":
      return [tx("Combien de mois l'argent a-t-il été placé ?")];
  }
}

export function champs(_e: E, p: P): ChampEcran[] {
  switch (p) {
    case "jours":
      return [{ label: "nombre de jours", labelLatex: "n=", unite: "jours", placeholder: "ex. : 68" }];
    case "duree":
      return [{ label: "t", labelLatex: "t=", unite: "an", placeholder: "ex. : 5/12" }];
    case "interet":
      return [{ label: "intérêt", labelLatex: "I=", unite: "€", placeholder: "ex. : 7,39" }];
    case "valeur":
      return [{ label: "valeur acquise", labelLatex: "C_t=", unite: "€", placeholder: "ex. : 1 307,39" }];
    case "capital":
      return [{ label: "capital placé", labelLatex: "C_0=", unite: "€", placeholder: "ex. : 2 340" }];
    case "taux":
      return [{ label: "taux annuel", labelLatex: "i=", unite: "%", placeholder: "ex. : 3,05" }];
    case "dureeMois":
      return [{ label: "durée en mois", labelLatex: "", unite: "mois", placeholder: "ex. : 7" }];
    default:
      return [];
  }
}

/* ----------------------------------------------------------------------------------------------
 * Écran « formule » (choix fermé, une tentative) — l'option 0 est la bonne
 * -------------------------------------------------------------------------------------------- */

function formules(e: E): string[] {
  if (e.variante === "capital")
    return e.donnee === "interet"
      ? ["C_0=\\dfrac{I}{i\\cdot t}", "C_0=I\\cdot i\\cdot t", "C_0=\\dfrac{i\\cdot t}{I}", "C_0=I-i\\cdot t"]
      : ["C_0=\\dfrac{C_t}{1+i\\cdot t}", "C_0=C_t\\,(1-i\\cdot t)", "C_0=C_t-i\\cdot t", "C_0=C_t\\,(1+i\\cdot t)"];
  if (e.variante === "taux") return ["i=\\dfrac{I}{C_0\\cdot t}", "i=I\\cdot C_0\\cdot t", "i=\\dfrac{C_0\\cdot t}{I}", "i=\\dfrac{I}{C_0}"];
  return ["t=\\dfrac{I}{C_0\\cdot i}", "t=I\\cdot C_0\\cdot i", "t=\\dfrac{C_0\\cdot i}{I}", "t=\\dfrac{I}{C_0}"];
}

export function optionsFormule(e: E): OptionEcran[] {
  const f = formules(e);
  return e.ordreFormule.map((k) => ({ id: `f${k}`, fragments: [lx(f[k]!)] }));
}
export const BONNE_FORMULE = "f0";
export const formuleJusteL = (e: E) => formules(e)[0]!;

/* ----------------------------------------------------------------------------------------------
 * Valeurs attendues
 * -------------------------------------------------------------------------------------------- */

export const capitalAttendu = (e: E) => (e.donnee === "interet" ? interetDonne(e) / (tauxDecimal(e) * dureeAnnees(e)) : valeurDonnee(e) / (1 + tauxDecimal(e) * dureeAnnees(e)));
/** Intérêt attendu à l'écran « interet » : calculé (valeur acquise) ou tiré des données (retrouver). */
export const interetAttendu = (e: E) => (e.variante === "taux" || e.variante === "duree" ? interetDepuisDonnee(e) : interet(e));
export const moisAttendus = (e: E) => Math.round((12 * interetDepuisDonnee(e)) / (e.C0 * tauxDecimal(e)));

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "jours":
      return [lx(`n=${e.nb}`), tx(" jours")];
    case "duree":
      return [lx(`t=${tL(e)}`), tx(" an"), ...(Number.isInteger(dureeAnnees(e) * 1000) ? [] : [tx(" ("), lx(`\\approx ${nL(dureeAnnees(e), 4, true)}`), tx(")")])];
    case "interet":
      return [lx(`I${e.variante === "taux" || e.variante === "duree" ? "=" : "\\approx "}${centL(interetAttendu(e))}`), tx(" €")];
    case "valeur":
      return [lx(`C_t\\approx ${centL(valeurAcquise(e))}`), tx(" €")];
    case "formule":
      return [lx(formuleJusteL(e))];
    case "capital":
      return [lx(`C_0=${montantL(capitalAttendu(e))}`), tx(" €")];
    case "taux":
      return [lx(`i\\approx ${pourcentFixeL(tauxRetrouve(e), 2)}`)];
    case "dureeMois":
      return [tx(`${moisAttendus(e)} mois`)];
  }
}

export function recap(e: E, p: P): Frag[] {
  return reponse(e, p);
}

/* ----------------------------------------------------------------------------------------------
 * Aides (deux niveaux)
 * -------------------------------------------------------------------------------------------- */

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "jours":
      return { texte: [tx("On compte les jours exacts, mois par mois : les jours qui restent dans le premier mois (le jour du dépôt n'est pas compté), les mois entiers (31, 30 ou 28 jours), puis les jours du dernier mois (le jour du retrait est compté).")] };
    case "duree":
      return { texte: [tx("Dans la formule de l'intérêt simple, la durée "), lx("t"), tx(" s'exprime en années :")], latex: "1\\text{ mois}=\\dfrac{1}{12}\\text{ an}\\qquad 1\\text{ quinzaine}=\\dfrac{1}{24}\\text{ an}" };
    case "interet":
      return e.variante === "taux" || e.variante === "duree"
        ? { texte: [tx("L'intérêt est ce que le placement a rapporté : la valeur acquise moins le capital placé.")], latex: "I=C_t-C_0" }
        : { texte: [tx("Un capital placé à intérêt simple produit un intérêt proportionnel au capital, au taux et à la durée (en années), avec le taux en écriture décimale :")], latex: "I=C_0\\cdot i\\cdot t" };
    case "valeur":
      return { texte: [tx("La valeur acquise est le capital augmenté de l'intérêt :")], latex: "C_t=C_0+I=C_0\\,(1+i\\cdot t)" };
    case "formule":
      return e.variante === "capital" && e.donnee === "valeur"
        ? { texte: [tx("Pars de la valeur acquise "), lx("C_t=C_0\\,(1+i\\cdot t)"), tx(" et isole "), lx("C_0"), tx(".")] }
        : { texte: [tx("Pars de "), lx("I=C_0\\cdot i\\cdot t"), tx(" et isole la grandeur cherchée : on divise les deux membres par le produit des deux autres facteurs.")] };
    case "capital":
      return { texte: [tx("Utilise l'égalité de l'écran précédent, avec le taux en écriture décimale et la durée en années.")], latex: formuleJusteL(e) };
    case "taux":
      return { texte: [tx("Utilise "), lx("i=\\dfrac{I}{C_0\\cdot t}"), tx(", avec la durée en années ; le résultat est un taux en écriture décimale : multiplie-le par 100 pour l'avoir en %.")] };
    case "dureeMois":
      return { texte: [tx("Calcule d'abord "), lx("t=\\dfrac{I}{C_0\\cdot i}"), tx(" (en années), puis convertis en mois : un an compte 12 mois.")] };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  const i = tauxL(e);
  switch (p) {
    case "jours": {
      if (!e.debut || !e.fin) return null;
      const d = decompositionJours(e.debut, e.fin);
      const premier = d[0]!;
      return { texte: [tx(`Ici : en ${premier.mois}, il reste ${premier.detail} jours ; ajoute ensuite ${d.length > 2 ? "les mois entiers, puis " : ""}les ${d[d.length - 1]!.jours} jours de ${d[d.length - 1]!.mois}.`)] };
    }
    case "duree":
      return { texte: [tx(`Ici, la durée est de ${e.nb} ${uniteT(e)} : écris-la comme une fraction d'année.`)] };
    case "interet":
      return e.variante === "taux" || e.variante === "duree"
        ? { texte: [tx("Ici :")], latex: `I=${montantL(valeurDonnee(e))}-${montantL(e.C0)}` }
        : { texte: [tx("Ici :")], latex: `I=${montantL(e.C0)}\\cdot ${i}\\cdot ${tL(e)}` };
    case "valeur":
      return { texte: [tx("Ici, avec l'intérêt de l'écran précédent :")], latex: `C_t=${montantL(e.C0)}+I` };
    case "formule":
      return e.variante === "capital" && e.donnee === "valeur"
        ? { texte: [tx("On divise les deux membres de "), lx("C_t=C_0\\,(1+i\\cdot t)"), tx(" par le facteur "), lx("1+i\\cdot t"), tx(".")] }
        : { texte: [tx("Écris "), lx("I=C_0\\cdot i\\cdot t"), tx(" et divise les deux membres par le produit des deux facteurs connus.")] };
    case "capital":
      return e.donnee === "interet"
        ? { texte: [tx("Ici :")], latex: `C_0=\\dfrac{${montantL(interetDonne(e))}}{${i}\\cdot ${tL(e)}}` }
        : { texte: [tx("Ici :")], latex: `C_0=\\dfrac{${montantL(valeurDonnee(e))}}{1+${i}\\cdot ${tL(e)}}` };
    case "taux":
      return { texte: [tx("Ici :")], latex: `i=\\dfrac{${montantL(interetDepuisDonnee(e))}}{${montantL(e.C0)}\\cdot ${tL(e)}}` };
    case "dureeMois":
      return { texte: [tx("Ici :")], latex: `t=\\dfrac{${montantL(interetDepuisDonnee(e))}}{${montantL(e.C0)}\\cdot ${i}}` };
  }
}

export function messageIllisible(_e: E, p: P): string {
  if (p === "jours" || p === "dureeMois") return MESSAGE_ENTIER;
  if (p === "taux") return MESSAGE_TAUX;
  if (p === "duree") return "Durée non reconnue : écris une fraction comme 5/12 ou un décimal comme 0,417. Cette saisie ne compte pas comme une tentative.";
  return MESSAGE_MONTANT;
}

export function explicationChoix(e: E, _p: P): string {
  if (e.variante === "capital" && e.donnee === "valeur") return "L'intérêt est calculé sur C₀ : Cₜ = C₀(1 + i·t), donc on divise Cₜ par 1 + i·t.";
  return "On isole la grandeur cherchée dans I = C₀·i·t en divisant par le produit des deux autres facteurs.";
}

/* ----------------------------------------------------------------------------------------------
 * Vérification
 * -------------------------------------------------------------------------------------------- */

const TOL_T = 0.0005 + 1e-9;

export function diagnostiquer(e: E, p: P, v: string[]): StatutVerification[] {
  const s = v[0] ?? "";
  switch (p) {
    case "jours":
      return [statutEntier(s, e.nb)];
    case "duree": {
      const x = lireNombre(s);
      if (x === null) return ["parse_error"];
      return [Math.abs(x - dureeAnnees(e)) <= TOL_T ? "correct" : "not_equivalent"];
    }
    case "interet":
      return [statutMontant(s, [interetAttendu(e)])];
    case "valeur":
      return [statutMontant(s, [valeurAcquise(e)])];
    case "formule":
      return [s === BONNE_FORMULE ? "correct" : "not_equivalent"];
    case "capital":
      return [statutMontant(s, [capitalAttendu(e)])];
    case "taux":
      return [statutTaux(s, [tauxRetrouve(e)], 0.01)];
    case "dureeMois":
      return [statutEntier(s, moisAttendus(e))];
  }
}

export function approchee(e: E, p: P, v: string[]): string | null {
  const s = v[0] ?? "";
  switch (p) {
    case "duree":
      return tropArrondi(s, [dureeAnnees(e)], 3, TOL_T, "au millième (ou en fraction)");
    case "interet":
      return tropArrondi(s, [interetAttendu(e)], 2, TOL_CENTIME, "au centime");
    case "valeur":
      return tropArrondi(s, [valeurAcquise(e)], 2, TOL_CENTIME, "au centime");
    case "capital":
      return tropArrondi(s, [capitalAttendu(e)], 2, TOL_CENTIME, "au centime");
    case "taux":
      return tropArrondi(s, [tauxRetrouve(e)], 2, 0.01, "au centième (en %)");
    default:
      return null;
  }
}

/** Jours comptés avec des mois de 30 jours (erreur classique). */
function joursMois30(e: E): number | null {
  if (!e.debut || !e.fin) return null;
  return (e.fin.annee - e.debut.annee) * 360 + (e.fin.mois - e.debut.mois) * 30 + (e.fin.jour - e.debut.jour);
}

export function piege(e: E, p: P, v: string[]): Frag[] | null {
  const s = v[0] ?? "";
  if (p !== "formule" && diagnostiquer(e, p, v).every((x) => x === "correct")) return null;
  const x = lireNombre(s);
  const i = tauxDecimal(e);
  const t = dureeAnnees(e);
  const proche = (c: number, tol = 0.011) => x !== null && Math.abs(x - c) <= tol + 1e-9 * Math.abs(c);
  switch (p) {
    case "jours": {
      if (x === null) return null;
      if (x === e.nb + 1) return [tx("Tu as compté à la fois le jour du dépôt et celui du retrait : on n'en compte qu'un (le jour du dépôt ne rapporte pas d'intérêt).")];
      if (x === e.nb - 1) return [tx("Il manque un jour : le jour du retrait est compté (seul le jour du dépôt ne l'est pas).")];
      const m30 = joursMois30(e);
      if (m30 !== null && m30 !== e.nb && x === m30) return [tx("Les mois n'ont pas tous 30 jours : compte les jours exacts (31, 30 ou 28 selon le mois).")];
      return null;
    }
    case "duree":
      if (proche(e.nb, 1e-9)) return [tx(`La durée s'exprime en années : ${e.nb} ${uniteT(e)}, c'est une fraction d'année.`)];
      if (e.unite === "quinzaines" && proche(e.nb / 12, TOL_T)) return [tx("Une quinzaine dure un demi-mois : il y a 24 quinzaines dans une année, pas 12.")];
      if (e.unite === "mois" && proche(e.nb / 365, TOL_T)) return [tx("Un mois correspond à un douzième d'année : divise par 12.")];
      return null;
    case "interet":
      if (e.variante === "taux" || e.variante === "duree") {
        if (proche(valeurDonnee(e))) return [tx("C'est la valeur acquise : l'intérêt est ce que le placement a rapporté en plus du capital.")];
        return null;
      }
      if (proche(e.C0 * e.tauxPct * t)) return [tx("Le taux s'écrit en écriture décimale : "), lx(`${pourcentL(e.tauxPct)}=${decimalL(i)}`), tx(".")];
      if (proche(e.C0 * i * e.nb)) return [tx("La durée doit être exprimée en années, pas en "), tx(uniteT(e)), tx(".")];
      if (e.unite === "jours" && proche((e.C0 * i * e.nb) / 360)) return [tx("L'année compte 365 jours.")];
      if (proche(valeurAcquise(e))) return [tx("C'est la valeur acquise : l'intérêt est seulement ce que le capital a rapporté.")];
      return null;
    case "valeur":
      if (proche(interet(e))) return [tx("C'est l'intérêt : la valeur acquise est le capital augmenté de l'intérêt.")];
      if (proche(e.C0 * (1 + e.tauxPct * t))) return [tx("Le taux s'écrit en écriture décimale : "), lx(`${pourcentL(e.tauxPct)}=${decimalL(i)}`), tx(".")];
      return null;
    case "capital":
      if (e.donnee === "valeur") {
        if (proche(valeurDonnee(e) * (1 - i * t))) return [tx("Retirer "), lx("C_t\\cdot i\\cdot t"), tx(" ne redonne pas "), lx("C_0"), tx(" : l'intérêt a été calculé sur "), lx("C_0"), tx(", pas sur "), lx("C_t"), tx(". Divise "), lx("C_t"), tx(" par "), lx("1+i\\cdot t"), tx(".")];
        if (proche(valeurDonnee(e) / (1 + i * e.nb))) return [tx("La durée doit être exprimée en années.")];
      } else if (proche(interetDonne(e) / (i * e.nb))) return [tx("La durée doit être exprimée en années.")];
      if (proche(capitalAttendu(e) / 100)) return [tx("Le taux s'écrit en écriture décimale : "), lx(`${pourcentL(e.tauxPct)}=${decimalL(i)}`), tx(".")];
      return null;
    case "taux": {
      if (x === null) return null;
      const r = tauxRetrouve(e);
      if (Math.abs(x - r * t) <= 0.011 || Math.abs(100 * x - r * t) <= 0.011) return [tx("Divise aussi par la durée "), lx("t"), tx(" : "), lx("i=\\dfrac{I}{C_0\\cdot t}"), tx(".")];
      if (Math.abs(x - (r * 365) / 360) <= 0.011 && Math.abs(r * 365 / 360 - r) > 0.011) return [tx("L'année compte 365 jours.")];
      return null;
    }
    case "dureeMois": {
      if (x === null) return null;
      const tAns = moisAttendus(e) / 12;
      if (Math.abs(x - tAns) <= 0.0051) return [tx("C'est la durée en années : convertis-la en mois.")];
      if (Math.abs(x - moisAttendus(e) * 30.4) <= 20) return [tx("On demande un nombre de mois, pas de jours.")];
      return null;
    }
    default:
      return null;
  }
}
