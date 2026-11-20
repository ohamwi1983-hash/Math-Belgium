import type { ExerciceTangenteExpo } from "../core6e/tangenteExponentielle";
import { aVal, image, lnA, ordonneeOrigine, pente, signeAttendu } from "../core6e/tangenteExponentielle";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseTangenteExpo } from "../ui6e/formatTangenteExponentielle";
import { lireDroite, lireValeur, statutProche } from "./lectureExpoLotG";

/**
 * Vérification de `6gen149` (statut à 3 valeurs). Toute écriture juste est acceptée : valeur exacte
 * (« 18ln3 », « 18·ln(3) », « −ln 2 » pour ln(0,5), « 2e^2 », « 2/e »…) ou arrondie au centième
 * (tolérance : demi-centième + 0,1 % — un ln a arrondi à 0,69 AVANT de multiplier est refusé) ;
 * tangente sous n'importe quelle forme d'équation de droite (pente et ordonnée à l'origine comparées
 * avec la tolérance propagée).
 */

type E = ExerciceTangenteExpo;
export const tolValeur = (v: number) => 0.0051 + 0.001 * Math.abs(v);
export const tolOrdonnee = (e: E) => tolValeur(ordonneeOrigine(e)) + Math.abs(e.x0) * tolValeur(pente(e));

export function diagnostiquer(e: E, phase: PhaseTangenteExpo, v: string[]): StatutVerification[] {
  switch (phase) {
    case "signe":
      return [v[0] === signeAttendu(e) ? "correct" : "not_equivalent"];
    case "image":
      return [statutProche(v[0], image(e), e.base ? 1e-6 * Math.max(1, Math.abs(image(e))) : tolValeur(image(e)))];
    case "pente":
      return [statutProche(v[0], pente(e), tolValeur(pente(e)))];
    case "tangente": {
      const d = lireDroite(v[0]);
      if (d === "illisible") return ["parse_error"];
      if (d === "pas-une-droite") return ["not_equivalent"];
      return [Math.abs(d.m - pente(e)) <= tolValeur(pente(e)) && Math.abs(d.p - ordonneeOrigine(e)) <= tolOrdonnee(e) ? "correct" : "not_equivalent"];
    }
  }
}

export function piege(e: E, phase: PhaseTangenteExpo, v: string[]): Frag[] | null {
  const proche = (x: number | null, c: number, tol = tolValeur(c)) => x !== null && Number.isFinite(c) && Math.abs(x - c) <= tol;
  const a = aVal(e);
  switch (phase) {
    case "signe":
      return null;
    case "image": {
      const x = lireValeur(v[0]);
      if (!e.base) {
        if (e.m !== 1 && proche(x, e.k * Math.exp(e.x0))) return [tx("L'exposant est "), lx(`${e.m}\\cdot x_0`), tx(", pas "), lx("x_0"), tx(" seul.")];
        return null;
      }
      if (proche(x, e.k * a * e.x0, 1e-6)) return [lx("a^{x_0}"), tx(" est une puissance : "), lx("a"), tx(" multiplié par lui-même, pas "), lx("a\\cdot x_0"), tx(".")];
      if (e.k !== 1 && proche(x, Math.pow(e.k * a, e.x0), 1e-6)) return [tx("Parenthèses : "), lx("k"), tx(" multiplie "), lx("a^{x_0}"), tx(", il n'est pas élevé à la puissance.")];
      if (e.x0 < 0 && proche(x, e.k * Math.pow(a, -e.x0), 1e-6)) return [tx("Exposant négatif : "), lx("a^{-n}=\\dfrac{1}{a^{n}}"), tx(".")];
      return null;
    }
    case "pente": {
      const x = lireValeur(v[0]);
      if (x === null) return null;
      if (e.variante === "en-zero") {
        if (proche(x, a, 1e-6)) return [tx("La pente en "), lx("(0\\,;1)"), tx(" n'est pas la base "), lx("a"), tx(" : c'est le facteur qui multiplie "), lx("a^{x}"), tx(" dans la dérivée.")];
        if (proche(x, 1, 1e-6)) return [tx("1 est l'ordonnée du point "), lx("(0\\,;1)"), tx(", pas la pente : seule la base "), lx("e"), tx(" a une pente 1 en 0.")];
        if (proche(x, Math.log10(a))) return [tx("C'est le logarithme décimal (touche log) : la pente est "), lx("\\ln a"), tx(" (touche ln).")];
        if (proche(x, -lnA(e))) return [tx("Signe : compare la base à 1.")];
        return null;
      }
      if (!e.base) {
        if (e.m !== 1 && proche(x, image(e))) return [tx("Règle de la chaîne : la dérivée de "), lx("e^{mx}"), tx(" est "), lx("m\\cdot e^{mx}"), tx(".")];
        if (proche(x, e.k * e.m * e.x0 * Math.exp(e.m * e.x0 - 1)) && e.x0 !== 1) return [lx("e^{x}"), tx(" n'est pas une puissance de "), lx("x"), tx(" : sa dérivée n'est pas "), lx("x\\cdot e^{x-1}"), tx(".")];
        return null;
      }
      if (proche(x, image(e))) return [tx("Il manque le facteur "), lx("\\ln a"), tx(" : "), lx("(a^{x})'=\\ln a\\cdot a^{x}"), tx(".")];
      if (proche(x, e.k * e.x0 * Math.pow(a, e.x0 - 1))) return [lx("a^{x}"), tx(" n'est pas une puissance de "), lx("x"), tx(" : sa dérivée n'est pas "), lx("x\\cdot a^{x-1}"), tx(".")];
      if (proche(x, e.k * lnA(e))) return [tx("C'est la pente en 0 : multiplie encore par "), lx("a^{x_0}"), tx(".")];
      const lnArrondi = Math.round(lnA(e) * 100) / 100;
      if (proche(x, (pente(e) / lnA(e)) * lnArrondi, 0.006)) return [tx("Tu as arrondi "), lx("\\ln a"), tx(" avant de multiplier : garde-le exact (ou toutes ses décimales) jusqu'au bout.")];
      return null;
    }
    case "tangente": {
      const d = lireDroite(v[0]);
      if (typeof d !== "object") return /x/.test(v[0]) && !/y/.test(v[0]) && d === "pas-une-droite" ? [tx("Écris une équation de droite, par exemple "), lx("y=mx+p"), tx(".")] : null;
      const tp = tolValeur(pente(e));
      if (e.base && Math.abs(d.m - a) < 1e-6) return [tx("La pente n'est pas la base "), lx("a"), tx(" : c'est "), lx(e.variante === "en-zero" ? "f'(0)=\\ln a" : "f'(x_0)"), tx(".")];
      const penteOk = Math.abs(d.m - pente(e)) <= tp;
      if (penteOk && e.x0 !== 0 && Math.abs(d.p - image(e)) <= tolValeur(image(e))) return [tx("L'ordonnée à l'origine n'est pas "), lx("f(x_0)"), tx(" : développe "), lx("f'(x_0)\\,(x-x_0)+f(x_0)"), tx(".")];
      if (penteOk && e.x0 !== 0 && Math.abs(d.p - (image(e) + pente(e) * e.x0)) <= tolOrdonnee(e)) return [tx("Signe : c'est "), lx("x-x_0"), tx(` qui apparaît, ici x ${e.x0 > 0 ? "−" : "+"} ${Math.abs(e.x0)}.`)];
      if (Math.abs(d.m - image(e)) <= tolValeur(image(e)) && Math.abs(image(e) - pente(e)) > 0.02) return [tx("La pente de la tangente est "), lx("f'(x_0)"), tx(", pas "), lx("f(x_0)"), tx(".")];
      return null;
    }
  }
}
