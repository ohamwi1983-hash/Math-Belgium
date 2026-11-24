import type { ExerciceGraphiqueDerivee } from "../core5e/graphiqueDerivee";
import { ensembleConcave, ensembleConvexe, ensembleNegatif, ensemblePositif, extremums } from "../core5e/graphiqueDerivee";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseGraphiqueDerivee } from "../ui5e/formatGraphiqueDerivee";
import { listeL } from "../ui5e/formatGraphiqueDerivee";
import type { Ensemble } from "./ensemblesReels";
import { egaux, lireEnsemble, memesBornes } from "./ensemblesReels";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { lireNombre } from "./lectureApplicationsDerivees";

/**
 * Vérification de `5gen74`. Saisies LUES avant le verdict (illisible → `parse_error`, aucune
 * tentative) : ensembles par `lireEnsemble` (5e ch. 1 : « ]−∞ ; 2[ ∪ ]5 ; +∞[ », « ℝ \ {1} », « ∅ »,
 * « aucun »), listes d'abscisses par `lireListe` (« −1 ; 3 », « −1 et 3 », « x = 2 », « aucun »).
 * Signe de f′ : crochets OUVERTS exigés aux zéros (sinon `aReprendre`, sans tentative) ; concavité :
 * crochets libres aux bornes finies ; ∞ fermé = `aReprendre`.
 * Messages ciblés : zéro double gardé dans « f′ > 0 », f′ lue comme f, palier pris pour un extremum,
 * maximum et minimum échangés, extremum de f′ pris pour un extremum de f, concavité lue sur le signe
 * de f′, convexe / concave échangés, zéros de f′ donnés pour les points d'inflexion.
 */

type E = ExerciceGraphiqueDerivee;

const AUCUN = /^(aucun.*|rien|néant|neant|∅|ø|vide|ensemble vide|pas\s+d.*|il n'y en a pas|n'existe pas|non)$/i;

/** Liste d'abscisses saisie, `null` si illisible ; « aucun » → []. */
export function lireListe(brut: string): number[] | null {
  let s = normaliserSigneMoins(brut).trim().replace(/[’`]/g, "'");
  s = s.replace(/\.\s*$/, "").trim();
  if (s === "") return null;
  if (AUCUN.test(s)) return [];
  s = s.replace(/^\{(.*)\}$/, "$1");
  let morceaux: string[];
  if (/;|\bet\b/.test(s)) morceaux = s.split(/\s*(?:;|\bet\b)\s*/);
  else if (/,/.test(s) && !/\d,\d/.test(s)) morceaux = s.split(",");
  else if (/\d\s*,\s+\S/.test(s)) morceaux = s.split(/,\s+/);
  else morceaux = [s];
  const res: number[] = [];
  for (const m of morceaux) {
    if (m.trim() === "") continue;
    const v = lireNombre(m.replace(/^\s*x\s*=\s*/i, ""));
    if (v === null) return null;
    res.push(v);
  }
  return res.length === 0 ? null : res.sort((a, b) => a - b);
}

function lireEns(brut: string): { ensemble: Ensemble; defauts: string[] } | null {
  const s = normaliserSigneMoins(brut).trim();
  if (AUCUN.test(s)) return { ensemble: [], defauts: [] };
  return lireEnsemble(s);
}

const memeListe = (a: number[], b: number[]): boolean => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]!) < 1e-9);

function cibles(e: E, p: PhaseGraphiqueDerivee): Ensemble[] {
  return p === "signe" ? [ensemblePositif(e), ensembleNegatif(e)] : [ensembleConvexe(e), ensembleConcave(e)];
}

export function diagnostiquer(e: E, p: PhaseGraphiqueDerivee, valeurs: string[]): StatutVerification[] {
  if (p === "signe" || p === "concavite") {
    return cibles(e, p).map((c, i) => {
      const l = lireEns(valeurs[i] ?? "");
      if (!l) return "parse_error";
      const ok = p === "signe" ? egaux(l.ensemble, c) : memesBornes(l.ensemble, c);
      return ok && l.defauts.length === 0 ? "correct" : "not_equivalent";
    });
  }
  if (p === "extremums") {
    const { maxima, minima } = extremums(e);
    return [maxima, minima].map((c, i) => {
      const l = lireListe(valeurs[i] ?? "");
      return l === null ? "parse_error" : memeListe(l, c) ? "correct" : "not_equivalent";
    });
  }
  const l = lireListe(valeurs[0] ?? "");
  return [l === null ? "parse_error" : memeListe(l, e.inflexions) ? "correct" : "not_equivalent"];
}

/** Écriture juste en valeur, mais crochet fermé sur un zéro de f′ ou sur un infini : sans tentative. */
export function aReprendre(e: E, p: PhaseGraphiqueDerivee, valeurs: string[]): Frag[] | null {
  if (p !== "signe" && p !== "concavite") return null;
  const c = cibles(e, p);
  for (let i = 0; i < 2; i++) {
    const l = lireEns(valeurs[i] ?? "");
    if (!l) continue;
    if (l.defauts.includes("infiniFerme") && memesBornes(l.ensemble, c[i]!)) return [tx("Crochet à revoir : du côté de "), lx("\\pm\\infty"), tx(", le crochet est toujours ouvert. Cette saisie ne compte pas comme une tentative.")];
    if (p === "signe" && !egaux(l.ensemble, c[i]!) && memesBornes(l.ensemble, c[i]!)) return [tx("Crochet à revoir : en un zéro de "), lx("f'"), tx(", on n'a ni "), lx("f'(x)>0"), tx(" ni "), lx("f'(x)<0"), tx(" — crochet ouvert. Cette saisie ne compte pas comme une tentative.")];
  }
  return null;
}

export function piege(e: E, p: PhaseGraphiqueDerivee, valeurs: string[]): Frag[] | null {
  const doubles = e.zeros.filter((z) => z.double).map((z) => z.x);
  const simples = e.zeros.filter((z) => !z.double).map((z) => z.x);
  if (p === "signe") {
    const l = lireEns(valeurs[0] ?? "");
    const pos = ensemblePositif(e);
    if (l && doubles.length > 0 && pos.length > 0 && !egaux(l.ensemble, pos)) {
      const sans = l.ensemble.some((i) => doubles.some((d) => i.g < d && d < i.d));
      if (sans) return [tx("f′ s'annule en "), ...listeL(doubles), tx(" : ce point n'est ni dans l'ensemble où "), lx("f'(x)>0"), tx(" ni dans celui où "), lx("f'(x)<0"), tx(", même si le signe ne change pas.")];
    }
    const lc = [lireEns(valeurs[0] ?? ""), lireEns(valeurs[1] ?? "")];
    if (lc[0] && lc[1] && memesBornes(lc[0].ensemble, ensembleNegatif(e)) && memesBornes(lc[1].ensemble, pos)) return [tx("Les deux ensembles sont échangés : "), lx("f'(x)>0"), tx(" là où la courbe est AU-DESSUS de l'axe.")];
    return [tx("Lis la position de la courbe de f′ par rapport à l'axe des abscisses — pas si elle monte ou descend (ce graphique n'est pas celui de f).")];
  }
  if (p === "extremums") {
    const l = [lireListe(valeurs[0] ?? ""), lireListe(valeurs[1] ?? "")];
    const tous = [...(l[0] ?? []), ...(l[1] ?? [])];
    if (doubles.some((d) => tous.some((x) => Math.abs(x - d) < 1e-9))) return [tx("En "), ...listeL(doubles), tx(", f′ s'annule SANS changer de signe : c'est un palier, pas un extremum.")];
    if (e.inflexions.some((d) => tous.some((x) => Math.abs(x - d) < 1e-9)) && !simples.some((s) => e.inflexions.includes(s))) return [tx("Tu as lu un sommet de la courbe de f′ : c'est un extremum de f′ (il donne un point d'inflexion de f). Les extremums de f sont aux ZÉROS de f′ qui changent de signe.")];
    const { maxima, minima } = extremums(e);
    if (l[0] && l[1] && memeListe(l[0], minima) && memeListe(l[1], maxima) && (maxima.length + minima.length > 0)) return [tx("Maximum et minimum échangés : f′ passe de + à − en un maximum, de − à + en un minimum.")];
    if (simples.length === 0 && tous.length > 0) return [tx("f′ ne change jamais de signe : f est monotone, elle n'a aucun extremum local.")];
    return null;
  }
  if (p === "concavite") {
    const l = [lireEns(valeurs[0] ?? ""), lireEns(valeurs[1] ?? "")];
    if (l[0] && l[1] && memesBornes(l[0].ensemble, ensembleConcave(e)) && memesBornes(l[1].ensemble, ensembleConvexe(e))) return [tx("Convexe et concave échangés : f convexe là où f′ CROÎT ("), lx("f''>0"), tx(").")];
    if (l[0] && (memesBornes(l[0].ensemble, ensemblePositif(e)) || memesBornes(l[0].ensemble, ensembleNegatif(e))) && !memesBornes(l[0].ensemble, ensembleConvexe(e))) return [tx("Tu as lu le SIGNE de f′ (il donne les variations de f). La concavité se lit sur les variations de f′ : monte-t-elle ou descend-elle ?")];
    return null;
  }
  const l = lireListe(valeurs[0] ?? "");
  if (l && l.length > 0 && l.every((x) => e.zeros.some((z) => Math.abs(z.x - x) < 1e-9)) && !memeListe(l, e.inflexions)) return [tx("Tu as donné des zéros de f′ (extremums ou paliers de f). Les points d'inflexion sont aux EXTREMUMS de f′ (ses sommets).")];
  return null;
}
