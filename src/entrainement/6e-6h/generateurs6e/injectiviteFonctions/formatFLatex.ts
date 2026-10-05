/**
 * Formatage LaTeX de f(x) pour les 6 familles — Couche A, réimplémenté ICI plutôt qu'importé
 * depuis `src/ui/` (`src/generateurs6e/` ne peut jamais importer `src/ui/`, règle d'architecture
 * non négociable). Réplique le principe de `formatSommeTermes` (jamais de coefficient ±1
 * littéral, jamais de double signe, jamais de terme nul affiché).
 */
interface TermeSigne {
  valeur: number;
  suffixe: string;
}

function formatSommeTermesLocal(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

export function formatAffineLatex(a: number, b: number): string {
  return formatSommeTermesLocal([
    { valeur: a, suffixe: "x" },
    { valeur: b, suffixe: "" },
  ]);
}

/** a) (ax+b)^n — parenthèses toujours présentes (n peut être négatif ou pair, jamais simplifiable
 * visuellement sans risque d'ambiguïté). */
export function formatPuissanceAffineLatex(a: number, b: number, n: number): string {
  return `(${formatAffineLatex(a, b)})^{${n}}`;
}

/** b) (ax+b)^(1/n) */
export function formatRacineNiemeLatex(a: number, b: number, n: number): string {
  return `(${formatAffineLatex(a, b)})^{\\frac{1}{${n}}}`;
}

/** c) a·x^n + b */
export function formatPuissanceMonomeLatex(a: number, b: number, n: number): string {
  return formatSommeTermesLocal([
    { valeur: a, suffixe: `x^{${n}}` },
    { valeur: b, suffixe: "" },
  ]);
}

/** d) √(ax+b) + c */
export function formatRacinePlusConstanteLatex(a: number, b: number, c: number): string {
  const racine = `\\sqrt{${formatAffineLatex(a, b)}}`;
  if (c === 0) return racine;
  return c > 0 ? `${racine} + ${c}` : `${racine} - ${Math.abs(c)}`;
}

/** e) (ax+b)/(cx+d) */
export function formatHomographiqueLatex(a: number, b: number, c: number, d: number): string {
  return `\\dfrac{${formatAffineLatex(a, b)}}{${formatAffineLatex(c, d)}}`;
}

/** f) ax² + bx + c */
export function formatQuadratiqueLatex(a: number, b: number, c: number): string {
  return formatSommeTermesLocal([
    { valeur: a, suffixe: "x^{2}" },
    { valeur: b, suffixe: "x" },
    { valeur: c, suffixe: "" },
  ]);
}
