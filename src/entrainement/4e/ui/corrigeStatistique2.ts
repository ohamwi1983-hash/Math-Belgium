import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 4 de 4e (« Statistique
 * descriptive »), seconde moitié : gen37, gen38, gen108–112 — règle `.claude/rules/feuilles-evaluations.md`,
 * section « Corrigé détaillé — comme au tableau ». Aucune dépendance à `docx` : importé par les
 * générateurs interactifs (étape ratée) ET par les adaptateurs papier.
 *
 * Écritures : virgule décimale `{,}`, espace fine des milliers dès 10 000, « − » typographique
 * (LaTeX « - »), pourcentages `\,\%`.
 */

export type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées de `content/chapters/4e/statistique-descriptive.ts`). */
export const COURS_FREQUENCES = "(cours, § 1)";
export const COURS_MOYENNE = "(cours, § 3)";
export const COURS_POSITION = "(cours, § 4)";
export const COURS_DISPERSION = "(cours, § 6)";
export const COURS_BT = "(cours, § 7)";
export const COURS_COMPARER = "(cours, § 8)";

function net(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return Object.is(r, -0) || r === 0 ? 0 : r;
}

/** Arrondi à `d` décimales (bruit flottant neutralisé). */
export function arrondiA(v: number, d: number): number {
  const p = 10 ** d;
  return net(Math.round(v * p + Math.sign(v) * 1e-6) / p);
}

/** Le nombre a-t-il au plus `d` décimales ? */
export function auPlus(v: number, d: number): boolean {
  return Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
}

/** Nombre en LaTeX : « 12{,}5 », « -3 », « 12\,000 » (au plus 9 décimales, bruit retiré). */
export function nb(valeur: number): string {
  const v = net(valeur);
  const [ent, dec] = String(Math.abs(v)).split(".");
  const groupe = ent!.length > 4 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent!;
  return `${v < 0 ? "-" : ""}${groupe}${dec ? `{,}${dec}` : ""}`;
}

/** Même nombre, entre parenthèses s'il est négatif (facteur). */
export function nbp(valeur: number): string {
  return net(valeur) < 0 ? `(${nb(valeur)})` : nb(valeur);
}

/** Nombre en texte : « 12,5 », « −3 », « 12 000 ». */
export function nbTexte(valeur: number): string {
  return nb(valeur).replace("{,}", ",").replace(/\\,/g, " ").replace(/^-/, "−");
}

/** Valeur approchée à `d` décimales : « = valeur » si elle est exacte à `d` décimales, sinon
 * « \approx valeur arrondie ». */
export function egalOuEnviron(valeur: number, d: number): string {
  return auPlus(valeur, d) ? `=${nb(arrondiA(valeur, d))}` : `\\approx ${nb(arrondiA(valeur, d))}`;
}

/** Largeur VISIBLE approchée d'une formule (≈ nombre de caractères affichés). */
export function largeurVisible(latex: string): number {
  return latex
    .replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => (a.length > b.length ? a : b))
    .replace(/\\(times|cdot|leq|geq|approx|le|ge|neq)/g, "x")
    .replace(/\{,\}/g, ",")
    .replace(/\\[,;!]/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "").length;
}

/** Largeur VISIBLE maximale du membre de droite d’une ligne de calcul (ce qui suit « = ») : la grille du
 * corrigé partage la ligne entre membre de gauche, suite et justification — au-delà de ≈ 26 caractères, la
 * formule passait à la ligne dans sa cellule (mesuré à 680, 820 et 1 280 px). */
export const LARGEUR_LIGNE = 26;

/**
 * Somme de termes (déjà écrits en LaTeX, de valeurs `valeurs`) en lignes de calcul : si
 * « gauche = t₁ + … + tₖ » tient sur une ligne, une ligne puis « = total » ; sinon, la somme se fait
 * par paquets nommés (« S_1 = t₁ + … + tⱼ = P₁ », « S_2 = … »), puis « gauche = S_1 + S_2 = P₁ + P₂ =
 * total » — chaque ligne est une égalité vraie, jamais une ligne coupée au milieu.
 */
export function lignesSomme(gauche: string, termes: string[], valeurs: number[], justification?: string | Fragments, suffixe = "", max = LARGEUR_LIGNE): LigneCalcul[] {
  const total = net(valeurs.reduce((s, v) => s + v, 0));
  const joindre = (t: string[]) => t.join("+").replace(/\+-/g, "-");
  if (termes.length === 1) return [ligne(`${gauche}=${termes[0]}`, justification)];
  if (largeurVisible(joindre(termes)) <= max) return [ligne(`${gauche}=${joindre(termes)}`, justification), ligne(`=${nb(total)}${suffixe}`)];
  // Paquets : autant de termes que la ligne « S_k = … » en laisse tenir.
  const paquets: { termes: string[]; valeur: number }[] = [];
  let i = 0;
  while (i < termes.length) {
    const morceau: string[] = [];
    let j = i;
    while (j < termes.length && (morceau.length === 0 || largeurVisible(joindre([...morceau, termes[j]!])) <= max)) {
      morceau.push(termes[j]!);
      j++;
    }
    paquets.push({ termes: morceau, valeur: net(valeurs.slice(i, j).reduce((s, v) => s + v, 0)) });
    i = j;
  }
  const lignes: LigneCalcul[] = [];
  paquets.forEach((p, k) => {
    lignes.push(ligne(`S_${k + 1}=${joindre(p.termes)}`, k === 0 ? (justification ?? "on additionne par paquets") : "paquet suivant"));
    if (p.termes.length > 1) lignes.push(ligne(`=${nb(p.valeur)}${suffixe}`));
  });
  lignes.push(ligne(`${gauche}=${paquets.map((_, k) => `S_${k + 1}`).join("+")}`, "on additionne les paquets"));
  lignes.push(ligne(`=${joindre(paquets.map((p) => `${nb(p.valeur)}${suffixe}`))}`));
  lignes.push(ligne(`=${nb(total)}${suffixe}`));
  return lignes;
}

/** Produits « xᵢ × nᵢ » d'un tableau (termes et valeurs, pour `lignesSomme`). */
export function produits(valeurs: readonly number[], effectifs: readonly number[]): { termes: string[]; valeurs: number[] } {
  return {
    termes: valeurs.map((x, i) => `${nbp(x)}\\times ${effectifs[i]}`),
    valeurs: valeurs.map((x, i) => net(x * effectifs[i]!)),
  };
}

/** Effectifs cumulés d'une liste d'effectifs. */
export function cumulesDe(effectifs: readonly number[]): number[] {
  const c: number[] = [];
  effectifs.forEach((n, i) => c.push((c[i - 1] ?? 0) + n));
  return c;
}

/** Première valeur dont l'effectif cumulé dépasse STRICTEMENT le seuil (règle du seuil, cours § 4). */
export function indiceSeuil(cumules: readonly number[], seuil: number): number {
  return cumules.findIndex((c) => c > seuil + 1e-9);
}

/** « 12, 9 et 14 ». */
export function listeEt(mots: string[]): string {
  if (mots.length <= 1) return mots.join("");
  return `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`;
}

/** Aide de l'écran (phrase terminée par « : », puis la formule) reprise en « Ce qu'on utilise » :
 * une espace entre la phrase et la formule (les aides d'écran sont parfois collées). */
export function fragmentsAide(aide: Fragments): Fragments {
  return aide.flatMap((f, i) => {
    const prec = aide[i - 1];
    return i > 0 && f.type === "latex" && prec?.type === "texte" && !/\s$/.test(prec.valeur) ? [{ type: "texte" as const, valeur: " " }, f] : [f];
  });
}

/** Dans un « Résultat » ou un « Ce qu’on utilise » rédigé (phrase + formules), chaque formule qui contient une relation est
 * groupée `{…}` : KaTeX ne la coupe plus à son « = » en fin de ligne (formule coupée en deux dans le
 * cadre du résultat, mesuré à 680, 820 et 1 280 px). Résultat formé d'une seule formule : inchangé. */
export function formulesInsecables(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => {
    if ((e.type !== "resultat" && e.type !== "utilise") || !e.fragments.some((f) => f.type === "texte" && f.valeur.trim() !== "")) return e;
    return { ...e, fragments: e.fragments.map((f) => (f.type === "latex" && /[=<>]|\\approx|\\neq/.test(f.valeur) && largeurVisible(f.valeur) <= 32 && !/^\{.*\}$/.test(f.valeur) ? { ...f, valeur: `{${f.valeur}}` } : f)) };
  });
}
