import type { ExerciceTableauLimites, Intrus, Situation, TypeIntrus, VarianteTableauLimites } from "../../core5e/tableauLimitesGraphique";
import { memeSituation } from "../../core5e/tableauLimitesGraphique";

/**
 * Couche A — générateur de `5gen66` « Du tableau de limites au graphique ». `Math.random()` seul
 * (le `?code=` rejoue le tirage, intrus et ordre A–D compris). Fenêtre [−7 ; 7]² : asymptotes
 * entières, jamais sur un axe (p ≠ 0, L ≠ 0), signes des limites infinies tirés librement ; trois
 * intrus de types DIFFÉRENTS parmi ceux de la variante, chacun distinct du bon graphique et des
 * autres ; place du bon graphique uniforme sur A–D (verdict).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const nonNul = (a: number, b: number) => {
  for (;;) {
    const v = entier(a, b);
    if (v !== 0) return v;
  }
};
const signe = () => (Math.random() < 0.5 ? 1 : -1);
function melanger<T>(t: T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}
const copie = (s: Situation): Situation => JSON.parse(JSON.stringify(s));

function situation(v: VarianteTableauLimites): Situation {
  for (;;) {
    switch (v) {
      case "ahAv": {
        const L = nonNul(-3, 3);
        return { av: [nonNul(-3, 3)], cotes: [[signe(), signe()]], gauche: { type: "h", L }, droite: { type: "h", L } };
      }
      case "deuxAh": {
        const L1 = nonNul(-3, 3);
        const L2 = nonNul(-3, 3);
        if (Math.abs(L1 - L2) < 2) continue;
        return { av: [nonNul(-3, 3)], cotes: [[signe(), signe()]], gauche: { type: "h", L: L1 }, droite: { type: "h", L: L2 } };
      }
      case "aoAv": {
        const m = parmi([1, -1]);
        const q = entier(-2, 2);
        const p = nonNul(-2, 2);
        return { av: [p], cotes: [[signe(), signe()]], gauche: { type: "o", m, q }, droite: { type: "o", m, q } };
      }
      case "deuxAv": {
        const p1 = nonNul(-4, 1);
        const p2 = p1 + entier(3, 5);
        if (p2 === 0 || p2 > 4) continue;
        const L = nonNul(-3, 3);
        return { av: [p1, p2], cotes: [[signe(), signe()], [signe(), signe()]], gauche: { type: "h", L }, droite: { type: "h", L } };
      }
    }
  }
}

const TYPES: Record<VarianteTableauLimites, TypeIntrus[]> = {
  ahAv: ["coteAV", "echangeGD", "ahValeur", "avDeplacee"],
  deuxAh: ["coteAV", "echangeGD", "ahValeur", "echangeInfinis", "avDeplacee"],
  aoAv: ["coteAV", "echangeGD", "aoPente", "aoOrdonnee", "avDeplacee"],
  deuxAv: ["coteAV", "echangeGD", "ahValeur", "avDeplacee"],
};

/** Applique une erreur classique à la situation juste ; `null` si elle ne change rien. */
function intrus(s: Situation, type: TypeIntrus): Intrus | null {
  const r = copie(s);
  const iav = Math.floor(Math.random() * s.av.length);
  switch (type) {
    case "coteAV": {
      const cote = Math.random() < 0.5 ? 0 : 1;
      r.cotes[iav]![cote] = -r.cotes[iav]![cote]!;
      return { type, sit: r, iav, cote: cote as 0 | 1 };
    }
    case "echangeGD": {
      const [g, d] = r.cotes[iav]!;
      if (g === d) return null;
      r.cotes[iav] = [d, g];
      return { type, sit: r, iav };
    }
    case "ahValeur": {
      // Bout droit : la branche droite (signe sd) traverse y = L ; son asymptote est à L ∓ 2.
      if (r.droite.type !== "h") return null;
      const L = r.droite.L;
      const sd = r.cotes[r.av.length - 1]![1];
      const L2 = sd > 0 ? L - 2 : L + 2;
      if (L2 === 0 || Math.abs(L2) > 5) return null;
      r.droite = { type: "h", L: L2 };
      if (s.gauche.type === "h" && s.droite.type === "h" && s.gauche.L === s.droite.L) r.gauche = { type: "h", L: L2 };
      return { type, sit: r };
    }
    case "aoPente": {
      if (r.droite.type !== "o" || r.gauche.type !== "o") return null;
      r.gauche = { ...r.gauche, m: -r.gauche.m };
      r.droite = { ...r.droite, m: -r.droite.m };
      return { type, sit: r };
    }
    case "aoOrdonnee": {
      if (r.droite.type !== "o" || r.gauche.type !== "o") return null;
      const dq = r.droite.q + 2 <= 3 ? 2 : -2;
      r.gauche = { ...r.gauche, q: r.gauche.q + dq };
      r.droite = { ...r.droite, q: r.droite.q + dq };
      return { type, sit: r };
    }
    case "echangeInfinis": {
      if (JSON.stringify(r.gauche) === JSON.stringify(r.droite)) return null;
      [r.gauche, r.droite] = [r.droite, r.gauche];
      return { type, sit: r };
    }
    case "avDeplacee": {
      const p = r.av[iav]!;
      const np = p + parmi([1, -1, 2, -2]);
      if (np === 0 || Math.abs(np) > 4 || r.av.some((x, i) => i !== iav && Math.abs(x - np) < 2)) return null;
      r.av[iav] = np;
      r.av.sort((a, b) => a - b);
      return { type, sit: r, iav };
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteTableauLimites; label: string }[] = [
  { id: "ahAv", label: "Une asymptote verticale et une horizontale" },
  { id: "deuxAh", label: "Deux asymptotes horizontales (en −∞ et en +∞)" },
  { id: "aoAv", label: "Une asymptote verticale et une oblique" },
  { id: "deuxAv", label: "Deux asymptotes verticales et une horizontale" },
];

export function construire(variante: VarianteTableauLimites): ExerciceTableauLimites {
  for (;;) {
    const sit = situation(variante);
    const choisis: Intrus[] = [];
    for (const type of melanger(TYPES[variante])) {
      if (choisis.length === 3) break;
      const x = intrus(sit, type);
      if (!x || memeSituation(x.sit, sit) || choisis.some((c) => memeSituation(c.sit, x.sit))) continue;
      choisis.push(x);
    }
    if (choisis.length < 3) continue;
    const ordre = melanger([-1, 0, 1, 2]);
    return { variante, sit, intrus: choisis, ordre };
  }
}

export function construireAvecVarianteId(id: string): ExerciceTableauLimites {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceTableauLimites(): ExerciceTableauLimites {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
