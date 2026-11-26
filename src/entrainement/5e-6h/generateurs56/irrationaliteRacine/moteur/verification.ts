import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { normaliserSigneMoins } from "../../../../../lib/normaliserSaisie";
import { estPremier, lireDecomposition } from "../../communReels/outilsReels";
import type { ExerciceIrrationalite, PhaseIrrationalite } from "../core/types";
import { bonneOptionId, estChoix, IDS_OPTIONS, nkL, racineNL } from "../ui/format";

/**
 * Couche B — vérification de `56gen15`. Choix fermés : une tentative. « Élever » : un naturel (lu
 * après coup, champ jamais filtré). « Facteurs » : produit lu par `lireDecomposition` ; un produit
 * JUSTE en valeur mais dont un facteur n'est pas premier (« 8 · 9 ») est à reprendre SANS tentative.
 */

type E = ExerciceIrrationalite;
type P = PhaseIrrationalite;

/** Naturel saisi (espaces de milliers tolérés) ; `null` = illisible. */
export function lireNaturel(texte: string): number | null {
  const s = normaliserSigneMoins(texte).replace(/\s+/g, "");
  if (!/^-?\d+$/.test(s)) return null;
  return Number(s);
}

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (estChoix(e, p)) {
    if (!(IDS_OPTIONS as readonly string[]).includes(valeurs[0])) return ["parse_error"];
    return [valeurs[0] === bonneOptionId(e, p) ? "correct" : "not_equivalent"];
  }
  if (p === "elever") {
    const n = lireNaturel(valeurs[0] ?? "");
    if (n === null) return ["parse_error"];
    return [n === e.N ? "correct" : "not_equivalent"];
  }
  const d = lireDecomposition(valeurs[0] ?? "");
  if (!d) return ["parse_error"];
  return [d.valeur === e.N && d.tousPremiers ? "correct" : "not_equivalent"];
}

export function aReprendre(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p !== "facteurs") return null;
  const d = lireDecomposition(valeurs[0] ?? "");
  if (!d || d.valeur !== e.N || d.tousPremiers) return null;
  const pasPremier = d.facteurs.find(([b]) => !estPremier(b));
  return [tx("Le produit vaut bien "), lx(`${e.N}`), tx(", mais "), lx(`${pasPremier ? pasPremier[0] : ""}`), tx(" n'est pas un nombre premier : décompose-le encore. Cette saisie ne compte pas comme une tentative.")];
}

export function bonneOption(e: E, p: P): string {
  return bonneOptionId(e, p);
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (diagnostiquer(e, p, valeurs)[0] === "correct") return null;
  switch (p) {
    case "hypothese":
      if (v === "B") return [tx("C'est ce qu'on veut savoir : on ne peut pas le supposer au départ. On suppose le contraire, "), lx(`${racineNL(e)}=\\dfrac{m}{n}`), tx(", et on cherche une contradiction.")];
      if (v === "C") return [tx("Rien n'oblige m et n à être pairs : l'hypothèse doit couvrir toutes les fractions.")];
      if (v === "D") return [tx("Un naturel est une fraction particulière ; l'hypothèse doit couvrir toutes les fractions "), lx("\\dfrac{m}{n}"), tx(".")];
      return null;
    case "elever": {
      const n = lireNaturel(v);
      if (n === null) return null;
      if (n === e.N ** e.k) return [tx("On élève "), lx(racineNL(e)), tx(" à la puissance "), lx(`${e.k}`), tx(" : on obtient "), lx(`${e.N}`), tx(", pas "), lx(`${e.N}^{${e.k}}`), tx(".")];
      if (Math.abs(n - e.N ** (1 / e.k)) < 1) return [tx("Il faut élever "), lx(racineNL(e)), tx(` au ${e.k === 2 ? "carré" : "cube"} : la racine disparaît.`)];
      return [tx("Multiplie les deux membres de "), lx(`${e.N}=\\dfrac{m^{${e.k}}}{${nkL(e)}}`), tx(" par "), lx(nkL(e)), tx(".")];
    }
    case "facteurs": {
      const d = lireDecomposition(v);
      if (!d) return null;
      return [tx("Ce produit vaut "), lx(`${d.valeur}`), tx(", pas "), lx(`${e.N}`), tx(" : vérifie tes divisions.")];
    }
    case "exposants":
      if (v === "C") return [tx("Les exposants de "), lx(nkL(e)), tx(e.k === 2 ? " sont tous pairs, quel que soit n : seuls ceux de " : " sont tous des multiples de 3, quel que soit n : seuls ceux de "), lx(`${e.N}`), tx(" décident.")];
      return e.verdict === "naturel"
        ? [tx("Regarde la décomposition de "), lx(`${e.N}`), tx(e.k === 2 ? " : tous ses exposants sont pairs." : " : tous ses exposants sont des multiples de 3.")]
        : [tx("Regarde l'exposant de "), lx(`${e.premierTemoin}`), tx(" dans la décomposition de "), lx(`${e.N}`), tx(".")];
    case "conclusion":
      if (v === "C") return [tx("La racine d'un naturel est soit un naturel, soit un irrationnel (cours, étape 1) : jamais un rationnel non entier.")];
      if (v === "D") return [tx("La comparaison des exposants permet toujours de conclure.")];
      return e.verdict === "naturel"
        ? [tx("Il n'y a pas de contradiction : "), lx(`${e.N}`), tx(e.k === 2 ? " est un carré parfait." : " est un cube parfait.")]
        : [tx("Les deux membres n'auraient pas la même décomposition : l'hypothèse est fausse.")];
  }
}
