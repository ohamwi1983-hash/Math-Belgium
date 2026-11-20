import { arbreExpressionGenerale, type NoeudExpression } from "./expressionGenerale";

/**
 * FORME d'une écriture d'un polynôme du second degré en x (gen126 « Trois écritures d'une
 * parabole ») — jamais sa valeur : la valeur est jugée à part (`lirePolynome`, comparaison des
 * coefficients). Une écriture juste mais dans une autre forme que celle demandée (une forme
 * développée là où l'on attend la forme canonique) reçoit un message SANS perte de tentative.
 *
 * Formes reconnues (toute écriture équivalente du même type est acceptée) :
 * - `developpee` : somme de monômes (constantes, x, x²), sans parenthèse qui contienne x, RÉDUITE
 *   (au plus un terme par degré) — 2x² − 12x + 10, 10 − 12x + 2x², x²/2 − 3 ;
 * - `canonique` : UN terme k·(x − h)² (coefficient de x égal à ±1 dans la parenthèse, k et le
 *   diviseur constants), plus au plus UNE constante — 2(x − 3)² − 8, −8 + 2(x−3)², (x+1)²/2 + 3 ;
 * - `factorisee` : UN produit de constantes et de facteurs du premier degré (au total le degré 2),
 *   sans terme ajouté — 2(x − 1)(x − 5), −x(x + 4), (2x − 2)(x − 5), 3(x − 2)² ;
 * - `evidence` : a mis en évidence sur les termes en x² et en x — k·(x² + px) (parenthèse sans
 *   constante, coefficient de x² égal à 1), plus au plus UNE constante — −2(x² − 6x) + 5.
 */

export type FormeEcriture = "developpee" | "canonique" | "factorisee" | "evidence";

type N = NoeudExpression;

function contientX(n: N): boolean {
  switch (n.type) {
    case "x":
      return true;
    case "nombre":
      return false;
    case "negation":
      return contientX(n.operande);
    case "somme":
    case "produit":
      return contientX(n.gauche) || contientX(n.droite);
    case "puissance":
      return contientX(n.base) || contientX(n.exposant);
    case "groupe":
      return contientX(n.interieur);
    case "appel":
      return contientX(n.argument);
  }
}

function valeur(n: N, x: number): number {
  switch (n.type) {
    case "x":
      return x;
    case "nombre":
      return n.valeur;
    case "negation":
      return -valeur(n.operande, x);
    case "somme":
      return n.operateur === "+" ? valeur(n.gauche, x) + valeur(n.droite, x) : valeur(n.gauche, x) - valeur(n.droite, x);
    case "produit":
      return n.operateur === "*" ? valeur(n.gauche, x) * valeur(n.droite, x) : valeur(n.gauche, x) / valeur(n.droite, x);
    case "puissance":
      return Math.pow(valeur(n.base, x), valeur(n.exposant, x));
    case "groupe":
      return valeur(n.interieur, x);
    case "appel":
      return n.nom === "sqrt" ? Math.sqrt(valeur(n.argument, x)) : n.nom === "abs" ? Math.abs(valeur(n.argument, x)) : NaN;
  }
}

/** Coefficients [a, b, c] d'un nœud de degré ≤ 2 (interpolation en 0, 1, −1, contrôle en 2 et −3). */
function coefficients(n: N): [number, number, number] | null {
  const f0 = valeur(n, 0);
  const f1 = valeur(n, 1);
  const fm1 = valeur(n, -1);
  const c = f0;
  const a = (f1 + fm1) / 2 - c;
  const b = (f1 - fm1) / 2;
  for (const x of [2, -3, 0.5]) {
    const y = valeur(n, x);
    if (!Number.isFinite(y) || Math.abs(y - (a * x * x + b * x + c)) > 1e-7 * Math.max(1, Math.abs(y))) return null;
  }
  return [a, b, c];
}

const nul = (v: number) => Math.abs(v) < 1e-9;

function sansGroupe(n: N): N {
  return n.type === "groupe" ? sansGroupe(n.interieur) : n;
}

/** Termes d'une somme (le signe n'importe pas pour la forme). */
function termes(n: N): N[] {
  const m = sansGroupe(n);
  if (m.type === "somme") return [...termes(m.gauche), ...termes(m.droite)];
  if (m.type === "negation") {
    const t = termes(m.operande);
    return t.length === 1 ? [m] : t;
  }
  return [m];
}

/** Facteurs d'un produit ; un diviseur doit être constant (sinon `null`). */
function facteurs(n: N): N[] | null {
  if (n.type === "negation") return facteurs(n.operande);
  if (n.type === "produit") {
    const g = facteurs(n.gauche);
    if (!g) return null;
    if (n.operateur === "/") return contientX(n.droite) ? null : g;
    const d = facteurs(n.droite);
    return d ? [...g, ...d] : null;
  }
  if (n.type === "groupe" && !contientX(n)) return [];
  if (n.type === "groupe") {
    // Un groupe qui ne contient qu'un produit (« (2(x−1)) ») se lit comme ce produit.
    const t = termes(n.interieur);
    if (t.length === 1 && sansGroupe(n.interieur).type !== "somme") return facteurs(sansGroupe(n.interieur));
  }
  return [n];
}

function exposantEntier(n: N): number | null {
  if (contientX(n)) return null;
  const v = valeur(n, 0);
  return Number.isInteger(v) ? v : null;
}

/** Degré d'un monôme (produit de constantes, de x et de puissances entières de x), `null` sinon. */
function degreMonome(n: N): number | null {
  const fs = facteurs(n);
  if (!fs) return null;
  let d = 0;
  for (const f of fs) {
    if (!contientX(f)) continue;
    if (f.type === "x") d += 1;
    else if (f.type === "groupe" && termes(f.interieur).length === 1 && sansGroupe(f.interieur).type !== "somme") {
      const di = degreMonome(sansGroupe(f.interieur));
      if (di === null) return null;
      d += di;
    } else if (f.type === "puissance" && sansGroupe(f.base).type === "x") {
      const e = exposantEntier(f.exposant);
      if (e === null || e < 0) return null;
      d += e;
    } else return null;
  }
  return d;
}

/** Somme de monômes (aucune parenthèse contenant x), réduite ou non. */
function estSommeDeMonomes(n: N): { degres: number[] } | null {
  const degres: number[] = [];
  for (const t of termes(n)) {
    const d = degreMonome(t);
    if (d === null) return null;
    degres.push(d);
  }
  return { degres };
}

/** Degré (1) d'un facteur du premier degré : x, (ax + b), ou une puissance entière d'un tel facteur. */
function degreFacteurLineaire(f: N): number | null {
  if (f.type === "x") return 1;
  if (f.type === "groupe") {
    const c = coefficients(f.interieur);
    if (!c || !nul(c[0]) || nul(c[1])) return null;
    return estSommeDeMonomes(f.interieur) ? 1 : null;
  }
  if (f.type === "puissance") {
    const e = exposantEntier(f.exposant);
    const d = degreFacteurLineaire(f.base);
    if (e === null || e < 1 || d === null) return null;
    return d * e;
  }
  return null;
}

function estFactorisee(n: N): boolean {
  const t = termes(n);
  if (t.length !== 1) return false;
  const fs = facteurs(t[0]!);
  if (!fs) return false;
  let degre = 0;
  for (const f of fs) {
    if (!contientX(f)) continue;
    const d = degreFacteurLineaire(f);
    if (d === null) return false;
    degre += d;
  }
  return degre === 2;
}

/** k·(x − h)² : un seul facteur contenant x, puissance 2 d'un groupe linéaire de coefficient ±1. */
function estTermeCarre(t: N): "ok" | "coefficient" | null {
  const fs = facteurs(t);
  if (!fs) return null;
  const avecX = fs.filter(contientX);
  if (avecX.length !== 1) return null;
  const f = avecX[0]!;
  if (f.type !== "puissance" || exposantEntier(f.exposant) !== 2) return null;
  const base = f.base;
  if (base.type === "x") return "ok";
  if (base.type !== "groupe" || !estSommeDeMonomes(base.interieur)) return null;
  const c = coefficients(base.interieur);
  if (!c || !nul(c[0]) || nul(c[1])) return null;
  return Math.abs(Math.abs(c[1]) - 1) < 1e-9 ? "ok" : "coefficient";
}

function constantes(ts: N[]): number {
  return ts.filter((t) => !contientX(t)).length;
}

export interface VerdictForme {
  ok: boolean;
  /** Message (LaTeX entre `$…$`) quand l'écriture, juste, n'a pas la forme demandée. */
  message?: string;
}

const MESSAGES: Record<FormeEcriture, string> = {
  developpee: "Ton expression est juste, mais ce n'est pas la forme développée : développe et réduis pour obtenir $ax^2+bx+c$, sans parenthèses.",
  canonique: "Ton expression est juste, mais ce n'est pas la forme canonique $a(x-x_S)^2+y_S$.",
  factorisee: "Ton expression est juste, mais ce n'est pas une forme factorisée $a(x-x_1)(x-x_2)$ : un seul produit, sans terme ajouté.",
  evidence: "Ton expression est juste, mais a n'est pas mis en évidence sur les deux premiers termes : écris-la sous la forme $a\\left(x^2+\\ldots x\\right)+c$.",
};

/** La saisie (déjà normalisée, préfixe « f(x) = » retiré) a-t-elle la forme demandée ? Une saisie
 * illisible renvoie `ok: true` : c'est la lecture de la valeur qui la signale. */
export function controlerForme(saisie: string, forme: FormeEcriture): VerdictForme {
  let n: N;
  try {
    n = arbreExpressionGenerale(saisie);
  } catch {
    return { ok: true };
  }
  const ts = termes(n);
  switch (forme) {
    case "developpee": {
      const s = estSommeDeMonomes(n);
      if (!s) return { ok: false, message: MESSAGES.developpee };
      if (new Set(s.degres).size !== s.degres.length) return { ok: false, message: "Ton expression est juste, mais elle n'est pas réduite : regroupe les termes de même degré (un seul terme en $x^2$, un seul en $x$, une seule constante)." };
      return { ok: true };
    }
    case "canonique": {
      const avecX = ts.filter(contientX);
      if (avecX.length === 1) {
        const carre = estTermeCarre(avecX[0]!);
        if (carre === "coefficient") return { ok: false, message: "Ton expression est juste, mais dans la parenthèse le coefficient de x doit être 1 : écris-la sous la forme $a(x-x_S)^2+y_S$." };
        if (carre === "ok") return constantes(ts) <= 1 ? { ok: true } : { ok: false, message: "Ton expression est juste, mais réduis les constantes : $a(x-x_S)^2+y_S$ a une seule constante $y_S$." };
      }
      return { ok: false, message: MESSAGES.canonique };
    }
    case "factorisee":
      return estFactorisee(n) ? { ok: true } : { ok: false, message: MESSAGES.factorisee };
    case "evidence": {
      const avecX = ts.filter(contientX);
      if (avecX.length === 1 && constantes(ts) <= 1) {
        const fs = facteurs(avecX[0]!);
        const groupes = (fs ?? []).filter(contientX);
        if (groupes.length === 1 && groupes[0]!.type === "groupe") {
          const g = groupes[0] as Extract<N, { type: "groupe" }>;
          const c = coefficients(g.interieur);
          const s = estSommeDeMonomes(g.interieur);
          if (c && s && nul(c[2]) && !s.degres.includes(0) && !nul(c[1])) {
            if (Math.abs(c[0] - 1) < 1e-9) return { ok: true };
            return { ok: false, message: "Ton expression est juste, mais dans la parenthèse le terme en $x^2$ doit être $x^2$ seul : divise les deux termes par a." };
          }
        }
      }
      return { ok: false, message: MESSAGES.evidence };
    }
  }
}

/** Retire un préfixe recopié : « f(x) = », « y = ». */
export function sansPrefixeFonction(saisie: string): string {
  return saisie.replace(/^\s*(?:[a-zA-Z]\s*\(\s*x\s*\)|y)\s*=\s*/, "");
}
