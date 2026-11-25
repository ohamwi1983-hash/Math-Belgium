import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceDVA } from "../core6e/detectiveVariablesAleatoires";
import type { PhaseDVA } from "../ui6e/formatDetectiveVariablesAleatoires";
import { numeroLigneFausse } from "../ui6e/formatDetectiveVariablesAleatoires";
import { copie } from "./modeleDetectiveVariablesAleatoires";
import type { OptionsValeur } from "./verificationLoisLotH2";
import { piegeDesigne, statutValeur, tropArrondie } from "./verificationLoisLotH2";

/**
 * Vérification de `6gen122`. Ligne et description comparées à leur identifiant (choix fermés, une
 * tentative) ; écran 3 LU avant tout verdict (illisible → `parse_error`, aucune tentative). Valeur
 * exacte à 1e-9 près (fraction, décimal, calcul) ; quatre décimales : table ou valeur exacte, à 0,0001
 * près ; pourcentage : « 2,3 », « 2,3 % » ou « 0,023 », règle empirique ou valeur exacte, à 0,05 point
 * près ; au centième : à 0,005 près. Valeur trop arrondie : message, aucune tentative. Messages ciblés :
 * résultat de la copie repris, et les confusions propres au scénario.
 */

type E = ExerciceDVA;
const t = tx;

function options(e: E): OptionsValeur {
  switch (copie(e).precision) {
    case "exacte":
      return { tol: 1e-9 };
    case "dec4":
      return { tol: 0.0001 };
    case "pourcent":
      return { tol: 0.05 + 1e-9, pourcent: true };
    case "centieme":
      return { tol: 0.005 + 1e-9 };
  }
}

export function messageIllisible(e: E): string {
  const c = copie(e);
  if (c.precision === "pourcent") return "Pourcentage non reconnu : écris un nombre, par exemple 2,3 ou 2,3 %. Cette saisie ne compte pas comme une tentative.";
  return "Valeur non reconnue : écris un nombre, une fraction (3/8) ou un calcul (e^(-2)·2^3/6, √2,25). Cette saisie ne compte pas comme une tentative.";
}

export function diagnostiquer(e: E, p: PhaseDVA, valeurs: string[]): StatutVerification[] {
  if (p === "ligne") return [valeurs[0] === `L${numeroLigneFausse(e)}` ? "correct" : "not_equivalent"];
  if (p === "erreur") return [valeurs[0] === e.variante ? "correct" : "not_equivalent"];
  return [statutValeur(valeurs[0] ?? "", copie(e).refs, options(e))];
}

export function approchee(e: E, p: PhaseDVA, valeurs: string[]): string | null {
  if (p !== "correction") return null;
  const c = copie(e);
  const o = options(e);
  if (c.precision === "dec4") return tropArrondie(valeurs[0] ?? "", c.refs, { ...o, decMin: 4, ecart: 0.01, message: "Valeur trop arrondie : donne quatre décimales. Cette saisie ne compte pas comme une tentative." });
  if (c.precision === "centieme") return tropArrondie(valeurs[0] ?? "", c.refs, { ...o, decMin: 2, ecart: 0.1, message: "Valeur trop arrondie : donne-la au centième. Cette saisie ne compte pas comme une tentative." });
  if (c.precision === "exacte") return tropArrondie(valeurs[0] ?? "", c.refs, { ...o, decMin: 6, ecart: 0.01, message: "C'est une valeur approchée : donne la valeur exacte. Cette saisie ne compte pas comme une tentative." });
  return null;
}

export function piege(e: E, p: PhaseDVA, valeurs: string[]): Frag[] | null {
  const c = copie(e);
  if (p === "ligne") {
    const k = Number((valeurs[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [t(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [t(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (p === "erreur") return null;
  const pieges = [{ x: c.valeurCopie, message: c.piege }, ...c.autres.map((a) => ({ x: a.valeur, message: a.message }))];
  const m = piegeDesigne(valeurs[0] ?? "", c.refs, pieges, options(e));
  if (m) return m;
  return null;
}
