import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceLTP, PhaseLTP } from "../core6e/lectureTablePhi";
import { bonneEcriture, cible, ligneColonne, probaExacte, probaTable, valeurEcriture } from "../core6e/lectureTablePhi";
import { phiTable } from "../core6e/tablePhi";
import { lireValeurVA } from "./lectureVariablesAleatoires";
import { piegeDesigne, proche, statutValeur, tropArrondie } from "./verificationLoisLotH2";
import { dL, p4L, zL } from "../ui6e/textesLoisLotH2";

/**
 * Vérification de `6gen116`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative). Lecture de Φ : valeur de la table OU valeur exacte (calculatrice), à 0,00005 près ;
 * case la plus proche : la valeur de la case ; z : arrondi au centième égal à celui de la case
 * (« 1,2816 » de la calculatrice est accepté pour 1,28). Moins de quatre décimales et proche : message,
 * aucune tentative. Messages ciblés : case voisine (ligne ou colonne), 1 − Φ oublié ou en trop,
 * Φ(−a) = Φ(a), probabilité prise pour z, signe de z oublié.
 */

type E = ExerciceLTP;
type P = PhaseLTP;
const t = tx;
const l = lx;
const TOL_P = 0.00005;

export function messageIllisible(_e: E, p: P): string {
  if (p === "z") return "Valeur non reconnue : écris un nombre décimal, par exemple 1,28 ou −0,52. Cette saisie ne compte pas comme une tentative.";
  if (p === "case") return "Valeur non reconnue : écris un nombre décimal, par exemple 0,7 ou 0,8907. Cette saisie ne compte pas comme une tentative.";
  return "Probabilité non reconnue : écris un nombre décimal à quatre décimales, par exemple 0,8907. Cette saisie ne compte pas comme une tentative.";
}

/** Références d'une probabilité : lecture de la table et valeur exacte. */
function refsValeur(e: E): number[] {
  return [probaTable(e), probaExacte(e)];
}

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "ecriture") return [valeurs[0] === bonneEcriture(e) ? "correct" : "not_equivalent"];
  if (p === "case") {
    if (e.variante === "directe") {
      const { ligne, colonne } = ligneColonne(e.a);
      return [statutValeur(valeurs[0] ?? "", [ligne], { tol: 1e-9 }), statutValeur(valeurs[1] ?? "", [colonne], { tol: 1e-9 })];
    }
    return [statutValeur(valeurs[0] ?? "", [phiTable(e.z)], { tol: 1e-6 })];
  }
  if (p === "valeur") return [statutValeur(valeurs[0] ?? "", refsValeur(e), { tol: TOL_P })];
  if (p === "cible") return [statutValeur(valeurs[0] ?? "", [cible(e)], { tol: 1e-6 })];
  return [statutValeur(valeurs[0] ?? "", [e.z], { tol: 0.005 - 1e-9 })];
}

export function approchee(e: E, p: P, valeurs: string[]): string | null {
  const v = valeurs[0] ?? "";
  if (p === "case" && e.variante === "directe") {
    const lu = lireValeurVA(valeurs[1] ?? "");
    const { colonne } = ligneColonne(e.a);
    if (lu && Math.abs(lu.v - colonne * 100) < 1e-9 && colonne > 0) return "La colonne s'écrit comme un nombre de centièmes : 0,0… (par exemple 0,05). Cette saisie ne compte pas comme une tentative.";
    return null;
  }
  const message = "Valeur trop arrondie : donne les quatre décimales de la table. Cette saisie ne compte pas comme une tentative.";
  if (p === "valeur") return tropArrondie(v, refsValeur(e), { tol: TOL_P, decMin: 4, ecart: 0.01, message });
  if (p === "cible" || p === "case") return tropArrondie(v, [p === "cible" ? cible(e) : phiTable(e.z)], { tol: 1e-6, decMin: 4, ecart: 0.01, message });
  return null;
}

function messageValeur(e: E, brut: string): Frag[] | null {
  const pieges: { x: number; message: Frag[] }[] = [];
  if (e.variante === "directe") {
    pieges.push({ x: 1 - phiTable(e.a), message: [t("C'est "), l(`1-\\Phi(${zL(e.a)})`), t(" : la table donne directement "), l(`P(Z\\le ${zL(e.a)})`), t(".")] });
    for (const d of [-0.01, 0.01]) if (e.a + d > 0 && e.a + d < 3.5) pieges.push({ x: phiTable(e.a + d), message: [t("C'est la valeur d'une case voisine (colonne "), l(dL(ligneColonne(e.a + d).colonne, 2)), t(") : vérifie la colonne.")] });
    for (const d of [-0.1, 0.1]) if (e.a + d > 0 && e.a + d < 3.5) pieges.push({ x: phiTable(e.a + d), message: [t("C'est la valeur de la ligne voisine ("), l(dL(ligneColonne(e.a + d).ligne, 1)), t(") : vérifie la ligne.")] });
  } else {
    const juste = bonneEcriture(e);
    const autres = e.options.filter((id) => id !== juste);
    const messages: Record<string, Frag[]> = {
      phi: e.variante === "symetrie" ? [t("La fonction "), l("\\Phi"), t(" n'est pas paire : "), l(`\\Phi(${zL(-e.a)})`), t(" n'est pas égal à "), l(`\\Phi(${zL(e.a)})`), t(".")] : [t("C'est "), l(`P(Z\\le ${zL(e.a)})`), t(", l'aire à gauche ; on demande l'aire à droite.")],
      diff: e.aNeg ? [t("La borne inférieure est négative : "), l(`\\Phi(${zL(-e.a)})=1-\\Phi(${zL(e.a)})`), t(", pas "), l(`\\Phi(${zL(e.a)})`), t(".")] : [],
      somme: [t("Pour une aire entre deux bornes, on soustrait deux valeurs de "), l("\\Phi"), t(", on ne les additionne pas.")],
    };
    for (const id of autres) pieges.push({ x: valeurEcriture(e, id), message: messages[id] ?? [t("Cette écriture ne donne pas l'aire demandée : relis l'écran précédent.")] });
  }
  return piegeDesigne(brut, refsValeur(e), pieges, { tol: TOL_P });
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (p === "ecriture") {
    const id = valeurs[0] ?? "";
    if (id === bonneEcriture(e)) return null;
    if (id === "phi" && e.variante === "symetrie") return [t("La fonction "), l("\\Phi"), t(" n'est pas paire : "), l(`\\Phi(${zL(-e.a)})=1-\\Phi(${zL(e.a)})`), t(".")];
    if (id === "phi") return [l(`\\Phi(${zL(e.a)})`), t(" est l'aire à gauche de "), l(zL(e.a)), t(" ; l'aire à droite est son complément à 1.")];
    if (id === "diff" && e.aNeg) return [t("La table ne donne pas "), l(`\\Phi(${zL(-e.a)})`), t(" : remplace-le par "), l(`1-\\Phi(${zL(e.a)})`), t(".")];
    if (id === "somme") return [t("Une aire entre deux bornes est la différence de deux aires à gauche.")];
    return null;
  }
  if (p === "case") {
    if (e.variante === "directe") {
      const { ligne } = ligneColonne(e.a);
      const lu = lireValeurVA(valeurs[0] ?? "");
      if (lu && Math.abs(lu.v - e.a) < 1e-9 && Math.abs(e.a - ligne) > 1e-9) return [t("La ligne ne porte que l'unité et le dixième ; le centième se lit en colonne.")];
      return null;
    }
    const lu = lireValeurVA(v);
    if (!lu || proche(v, [phiTable(e.z)], { tol: 1e-6 })) return null;
    const zc = Math.abs(e.z);
    for (const d of [-0.01, 0.01]) if (proche(v, [phiTable(zc + d)], { tol: 1e-6 })) return [t("Cette case encadre bien "), l(p4L(e.p)), t(", mais sa voisine en est plus proche : compare les deux écarts.")];
    if (Math.abs(lu.v - e.p) < 1e-9) return [l(p4L(e.p)), t(" n'est pas dans la table : donne la valeur de la case la plus proche.")];
    return null;
  }
  if (p === "valeur") return messageValeur(e, v);
  if (p === "cible") {
    if (proche(v, [e.p], { tol: 1e-6 })) return e.sens === "sup" ? [t("C'est l'aire à droite de "), l("z"), t(" ; la table donne l'aire à gauche, "), l("\\Phi(z)=1-P(Z\\ge z)"), t(".")] : [t("Cette probabilité est inférieure à "), l("0{,}5"), t(" : elle n'est pas dans la table. Utilise "), l("\\Phi(-z)=1-\\Phi(z)"), t(".")];
    return null;
  }
  // p === "z"
  if (proche(v, [e.z], { tol: 0.005 - 1e-9 })) return null;
  if (proche(v, [-e.z], { tol: 0.005 - 1e-9 })) return e.z < 0 ? [t("Le signe manque : la probabilité donnée est inférieure à "), l("0{,}5"), t(", donc "), l("z"), t(" est négatif.")] : [t("Le signe est faux : "), l("P(Z\\ge z)<0{,}5"), t(", donc "), l("z"), t(" est positif.")];
  if (proche(v, [e.p, cible(e)], { tol: 1e-6 })) return [t("C'est une probabilité ; "), l("z"), t(" se lit dans les marges de la table (ligne + colonne).")];
  for (const d of [-0.01, 0.01]) if (proche(v, [e.z + d], { tol: 0.001 })) return [t("C'est le "), l("z"), t(" d'une case voisine : garde la case dont la valeur est la plus proche de "), l(p4L(cible(e))), t(".")];
  return null;
}
