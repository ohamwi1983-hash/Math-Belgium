/**
 * Couche B (5e) — contrôles de FORME des saisies de 5gen20 (« Limites, reconnaissance et calcul ») et
 * 5gen21 (« Asymptote oblique ») : l'équivalence par échantillonnage (`verificationLimites.ts`,
 * `verificationAsymptoteOblique.ts`) ne dit pas si l'élève a FAIT le travail demandé — recopier le
 * polynôme de l'énoncé passait l'écran « factoriser » (audit 5c4a, 100 % des tirages), recopier f(x)
 * passait l'écran « forme développée ». Ces fonctions examinent la STRUCTURE de la saisie (termes au
 * plus haut niveau, groupes entre parenthèses) ; la valeur reste vérifiée par les fonctions
 * d'équivalence existantes, inchangées.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";

/** Signe moins typographique (−, –) → tiret ASCII, espaces retirés. */
function normaliser(texte: string): string {
  return texte.replace(/[−–]/g, "-").replace(/\s+/g, "");
}

/** Retire les parenthèses extérieures qui englobent TOUTE l'expression (« ((x-1)(x+2)) »). */
function retirerParenthesesExterieures(texte: string): string {
  let t = texte;
  for (;;) {
    if (!(t.startsWith("(") && t.endsWith(")"))) return t;
    let profondeur = 0;
    let englobe = true;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === "(") profondeur++;
      else if (t[i] === ")") profondeur--;
      if (profondeur === 0 && i < t.length - 1) {
        englobe = false;
        break;
      }
    }
    if (!englobe) return t;
    t = t.slice(1, -1);
  }
}

/** Termes séparés par un + ou un − BINAIRE au plus haut niveau (hors parenthèses) ; un signe en tête
 * ou juste après un opérateur est unaire et reste collé à son terme. */
export function termesHautNiveau(texte: string): string[] {
  const t = normaliser(texte);
  const termes: string[] = [];
  let profondeur = 0;
  let debut = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "(" || c === "[") profondeur++;
    else if (c === ")" || c === "]") profondeur--;
    else if ((c === "+" || c === "-") && profondeur === 0 && i > 0) {
      const precedent = t[i - 1];
      if (!"+-*/^(".includes(precedent) && !/[eE]/.test(precedent)) {
        termes.push(t.slice(debut, i));
        debut = i;
      }
    }
  }
  termes.push(t.slice(debut));
  return termes.filter((x) => x !== "" && x !== "+");
}

/** Groupes entre parenthèses du plus haut niveau (« 2(x-3)(x+5)^2 » → « x-3 », « x+5 »). */
function groupesHautNiveau(texte: string): string[] {
  const groupes: string[] = [];
  let profondeur = 0;
  let debut = -1;
  for (let i = 0; i < texte.length; i++) {
    if (texte[i] === "(") {
      if (profondeur === 0) debut = i + 1;
      profondeur++;
    } else if (texte[i] === ")") {
      profondeur--;
      if (profondeur === 0 && debut >= 0) groupes.push(texte.slice(debut, i));
    }
  }
  return groupes;
}

function valeur(texte: string, x: number): number {
  return evaluerExpressionGenerale(texte.startsWith("+") ? texte.slice(1) : texte, x);
}

/** Polynôme de degré ≤ 1 (dérivée seconde discrète nulle sur des points éloignés des racines usuelles). */
function estDeDegreAuPlusUn(texte: string): boolean {
  try {
    const xs = [0.37, 1.61, 2.83, 4.19];
    const ys = xs.map((x) => valeur(texte, x));
    if (!ys.every(Number.isFinite)) return false;
    const pente = (ys[1] - ys[0]) / (xs[1] - xs[0]);
    return ys.every((y, i) => Math.abs(y - (ys[0] + pente * (xs[i] - xs[0]))) < 1e-6 * (1 + Math.abs(y)));
  } catch {
    return false;
  }
}

/** Vrai si la saisie est un PRODUIT de facteurs du premier degré (et de constantes) : aucune somme au
 * plus haut niveau, sauf si cette somme est elle-même de degré ≤ 1 ; chaque groupe entre parenthèses
 * obéit récursivement à la même règle. « x^2-5x+6 » (recopié) → faux ; « (x-2)(x-3) »,
 * « 2(x-3)(x+5) », « -(x-2)^2 », « x(x+4) » → vrai. */
export function estFormeFactorisee(texte: string): boolean {
  const t = retirerParenthesesExterieures(normaliser(texte));
  if (t === "") return false;
  if (termesHautNiveau(t).length > 1) return estDeDegreAuPlusUn(t);
  return groupesHautNiveau(t).every((g) => estFormeFactorisee(g));
}

/** Terme qui tend vers 0 quand x → +∞ (le reste R/D d'une forme développée). */
function tendVersZero(terme: string): boolean {
  try {
    const v1 = Math.abs(valeur(terme, 1e4));
    const v2 = Math.abs(valeur(terme, 1e5));
    return Number.isFinite(v1) && Number.isFinite(v2) && v1 < 1e-2 && v2 <= v1 + 1e-12;
  } catch {
    return false;
  }
}

/** Vrai si la saisie est de la forme « quotient + reste/D(x) » : les termes du plus haut niveau qui ne
 * tendent pas vers 0 forment EXACTEMENT le quotient ax+b, et il reste au moins un terme qui tend vers 0
 * (le reste divisé par D). f(x) recopiée en une seule fraction → faux. */
export function estFormeQuotientPlusReste(texte: string, a: number, b: number): boolean {
  const termes = termesHautNiveau(texte);
  const restes = termes.filter(tendVersZero);
  if (restes.length === 0) return false;
  const partiePolynomiale = termes.filter((t) => !restes.includes(t));
  if (partiePolynomiale.length === 0) return a === 0 && b === 0;
  const expression = partiePolynomiale.map((t) => (t.startsWith("-") || t.startsWith("+") ? t : `+${t}`)).join("");
  try {
    return [0.37, 1.61, 2.83].every((x) => Math.abs(valeur(expression, x) - (a * x + b)) < 1e-6 * (1 + Math.abs(a * x + b)));
  } catch {
    return false;
  }
}

/** Retire un membre de gauche recopié (« y = », « AO : y = », « f(x) = ») : le champ affiche déjà ce
 * libellé, l'élève l'écrit souvent par réflexe (audit 5c4a, saisie « y=2x-3 » refusée). */
export function retirerMembreGauche(texte: string): string {
  return texte.replace(/^\s*(?:AO\s*[:≡]?\s*)?(?:y|[fQ]\s*\(\s*x\s*\))\s*=\s*/, "");
}
