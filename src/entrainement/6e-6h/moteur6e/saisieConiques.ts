import type { StatutVerification } from "../moteur/statutVerification";
import type { VerificationChamp } from "./attentesCombinatoire";
import { ErreurLecture, evaluerNoeud, lireEquation, lireMembres, lirePoint, noeudDecimal, noeudVersPoly, polyDegre, polyEstConstant, polyVariables, proportionnels } from "./algebreLieux";
import type { NoeudLecture, Poly } from "./algebreLieux";
import { MESSAGES_LIEUX, champEquation, textePoly } from "./saisieLieux";

/**
 * Champs propres au 6e ch. 10 « Les coniques » (6gen58–6gen63, audit, lots B et C), en plus de ceux du
 * ch. 9 (`saisieLieux.ts`, réutilisés tels quels) :
 * - équation sous une FORME imposée (« deux carrés » après complétion, « v² = k·w » pour une
 *   parabole) : juste mais pas sous la forme demandée → refusée SANS tentative (audit G10, G11 : les
 *   coefficients fractionnaires « 4/9(x − 2)² » et la forme réduite « (x + 4)²/25 + … = 1 » sont
 *   acceptés) ;
 * - relation entre a, b, c, e (6gen60) : jugée par la valeur de e qu'elle impose (toute relation
 *   équivalente acceptée, audit G16) ;
 * - couple (λ ; μ) défini à un facteur près (6gen61 B).
 */

const SANS = " Cette saisie ne compte pas comme une tentative.";

export const MESSAGES_CONIQUES = {
  formeDeuxCarres: `Ton équation est juste, mais elle n'est pas sous la forme demandée : écris une somme de deux carrés, comme 4(x − 1)² + 9(y + 2)² = 36 ou (x − 1)²/9 + (y + 2)²/4 = 1.${SANS}`,
  formeParabole: `Ton équation est juste, mais elle n'est pas sous la forme demandée : isole le carré, comme (y − 1)² = 6(x + 2).${SANS}`,
  formeSansRacine: `Écris une équation sans racine : élève les deux membres au carré.${SANS}`,
  relation: `Relation non reconnue : écris une égalité entre a, b, c ou e, par exemple 2c = a ou e = 1/2 (« = » obligatoire).${SANS}`,
  couple: `Couple non reconnu : écris λ et μ séparés par « ; », par exemple (2 ; −3).${SANS}`,
  coupleNul: `λ et μ ne peuvent pas être nuls tous les deux.${SANS}`,
};

// ---------------------------------------------------------------------------
// Forme d'une équation (lecture de l'arbre, sans développer)
// ---------------------------------------------------------------------------

type Terme = { sorte: "const" } | { sorte: "carre"; v: string } | { sorte: "lin"; v: string } | { sorte: "autre" };

function polySur(n: NoeudLecture): Poly | null {
  try {
    return noeudVersPoly(n);
  } catch {
    return null;
  }
}
const estConst = (n: NoeudLecture) => {
  const p = polySur(n);
  return !!p && polyEstConstant(p);
};

/** Termes additifs d'un membre (les facteurs constants sont distribués : « 4/9((x − 2)² + 3) »). */
function termes(n: NoeudLecture): NoeudLecture[] {
  switch (n.k) {
    case "add":
    case "sub":
      return [...termes(n.a), ...termes(n.b)];
    case "neg":
    case "par":
      return termes(n.a);
    case "mul":
      if (estConst(n.a)) return termes(n.b);
      if (estConst(n.b)) return termes(n.a);
      return [n];
    case "div":
      return estConst(n.b) ? termes(n.a) : [n];
    default:
      return [n];
  }
}

/** Cœur d'un terme, débarrassé de ses facteurs constants. */
function coeur(n: NoeudLecture): NoeudLecture {
  switch (n.k) {
    case "neg":
    case "par":
      return coeur(n.a);
    case "mul":
      if (estConst(n.a)) return coeur(n.b);
      if (estConst(n.b)) return coeur(n.a);
      return n;
    case "div":
      return estConst(n.b) ? coeur(n.a) : n;
    default:
      return n;
  }
}

function univariee(p: Poly): string | null {
  const vs = [...polyVariables(p)];
  return vs.length === 1 ? vs[0] : null;
}

function classer(n: NoeudLecture): Terme {
  const p = polySur(n);
  if (!p) return { sorte: "autre" };
  if (polyEstConstant(p)) return { sorte: "const" };
  const c = coeur(n);
  if (c.k === "pow" && c.e === 2) {
    const base = polySur(c.a);
    if (base && polyDegre(base) === 1) {
      const v = univariee(base);
      if (v) return { sorte: "carre", v };
    }
  }
  const v = univariee(p);
  if (v && polyDegre(p) === 1) return { sorte: "lin", v };
  return { sorte: "autre" };
}

export type FormeEquation = "deuxCarres" | "parabole";

/** Le membre « carrés » et le membre constant (ou linéaire) ont-ils la forme demandée ? */
export function aLaForme(texte: string, forme: FormeEquation, variables: readonly string[] = ["x", "y"]): boolean {
  let m;
  try {
    m = lireMembres(texte, variables);
  } catch {
    return false;
  }
  if (!m.droite) return false;
  const essai = (cote: NoeudLecture, autre: NoeudLecture) => {
    const t = termes(cote).map(classer);
    const u = termes(autre).map(classer);
    if (forme === "deuxCarres") {
      if (!u.every((x) => x.sorte === "const")) return false;
      if (!t.every((x) => x.sorte === "const" || x.sorte === "carre")) return false;
      const carres = t.filter((x): x is { sorte: "carre"; v: string } => x.sorte === "carre").map((x) => x.v);
      return carres.length === 2 && new Set(carres).size === 2;
    }
    // Parabole : un seul terme, un carré ; l'autre membre est du premier degré dans l'autre variable.
    if (t.length !== 1 || t[0].sorte !== "carre") return false;
    const v = t[0].v;
    return u.every((x) => x.sorte === "const" || (x.sorte === "lin" && x.v !== v)) && u.some((x) => x.sorte === "lin");
  };
  return essai(m.gauche, m.droite) || essai(m.droite, m.gauche);
}

/** Équation juste ET sous la forme demandée ; juste mais d'une autre forme : refus sans tentative. */
export function champEquationForme(attendu: Poly, forme: FormeEquation, reference?: string): VerificationChamp {
  const base = champEquation(attendu, { reference });
  const juste = (v: string) => {
    try {
      return proportionnels(lireEquation(v, ["x", "y"]).poly, attendu);
    } catch {
      return false;
    }
  };
  return {
    refus: (v) => {
      const m = base.refus(v);
      if (m) return m;
      if (juste(v) && !aLaForme(v, forme)) return forme === "deuxCarres" ? MESSAGES_CONIQUES.formeDeuxCarres : MESSAGES_CONIQUES.formeParabole;
      return null;
    },
    statut: (v): StatutVerification => {
      const s = base.statut(v);
      if (s !== "correct") return s;
      return aLaForme(v, forme) ? "correct" : "not_equivalent";
    },
    reference: reference ?? textePoly(attendu),
  };
}

// ---------------------------------------------------------------------------
// Relation entre a, b, c, e (ellipse) — jugée par la valeur de e qu'elle impose
// ---------------------------------------------------------------------------

const VARIABLES_RELATION = ["a", "b", "c", "e"] as const;

function differenceRelation(texte: string): ((e: number, s: number) => [number, number]) & { decimal: boolean } {
  const m = lireMembres(texte, VARIABLES_RELATION);
  if (!m.droite) throw new ErreurLecture("egal");
  const g = m.gauche;
  const d = m.droite;
  const fn = (e: number, s: number) => {
    const val = { a: s, c: s * e, b: s * Math.sqrt(1 - e * e), e };
    return [evaluerNoeud(g, val), evaluerNoeud(d, val)] as [number, number];
  };
  return Object.assign(fn, { decimal: noeudDecimal(g) || noeudDecimal(d) });
}

/** Racines de la relation sur ]0 ; 1[ (changements de signe) et valeur en e*. */
function analyser(brut: (e: number, s: number) => [number, number], eCible: number): { auCible: number; autres: boolean; identite: boolean } {
  let auCible = 0;
  let autres = false;
  let identite = true;
  for (const s of [1, 2.7]) {
    // Échelle : taille des deux membres sur ]0 ; 1[ (une différence nulle en e* reste petite devant elle).
    let echelle = 1e-12;
    for (let i = 1; i < 400; i++) {
      const [L, R] = brut(i / 400, s);
      if (Number.isFinite(L) && Number.isFinite(R)) echelle = Math.max(echelle, Math.abs(L) + Math.abs(R));
    }
    const h = (e: number) => {
      const [L, R] = brut(e, s);
      return (L - R) / echelle;
    };
    auCible = Math.max(auCible, Math.abs(h(eCible)));
    let prec: number | null = null;
    let ePrec = 0;
    for (let i = 1; i < 400; i++) {
      const e = i / 400;
      const v = h(e);
      if (!Number.isFinite(v)) {
        prec = null;
        continue;
      }
      if (Math.abs(v) > 1e-9) identite = false;
      if (prec !== null && Math.sign(v) !== Math.sign(prec) && v !== 0 && prec !== 0) {
        const milieu = (e + ePrec) / 2;
        if (Math.abs(milieu - eCible) > 0.006) autres = true;
      }
      prec = v;
      ePrec = e;
    }
  }
  return { auCible, autres, identite };
}

/** Relation (équation en a, b, c, e) qui impose e = eCible pour l'ellipse (a > b > 0, c = ae). */
export function champRelationExcentricite(eCible: number, reference: string): VerificationChamp {
  return {
    refus: (v) => {
      try {
        const h = differenceRelation(v);
        const r = analyser(h, eCible);
        if (h.decimal && r.auCible > 1e-9 && r.auCible < 2e-3 && !r.autres) return MESSAGES_LIEUX.coefficients;
        return null;
      } catch (err) {
        if (err instanceof ErreurLecture && err.raison === "inequation") return MESSAGES_LIEUX.inequation;
        return MESSAGES_CONIQUES.relation;
      }
    },
    statut: (v) => {
      try {
        const r = analyser(differenceRelation(v), eCible);
        return !r.identite && r.auCible < 1e-9 && !r.autres ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference,
  };
}

/** La relation saisie est-elle toujours vraie (elle ne traduit aucune condition) ? */
export function relationToujoursVraie(v: string): boolean {
  try {
    return analyser(differenceRelation(v), 0.5).identite;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Couple (λ ; μ) à un facteur près
// ---------------------------------------------------------------------------

export function champCoupleProportionnel(lambda: number, mu: number): VerificationChamp {
  const lire = (v: string) => {
    const p = lirePoint(v);
    return { l: p.x.valeur, m: p.y.valeur };
  };
  return {
    refus: (v) => {
      try {
        const { l, m } = lire(v);
        return l === 0 && m === 0 ? MESSAGES_CONIQUES.coupleNul : null;
      } catch {
        return MESSAGES_CONIQUES.couple;
      }
    },
    statut: (v) => {
      try {
        const { l, m } = lire(v);
        return Math.abs(l * mu - m * lambda) < 1e-9 * Math.max(1, Math.abs(l), Math.abs(m)) ? "correct" : "not_equivalent";
      } catch {
        return "parse_error";
      }
    },
    reference: `(${lambda} ; ${mu})`,
  };
}
