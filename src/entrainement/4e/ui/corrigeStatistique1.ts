import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { q } from "./corrigeChapitre3";
import { nombreFr, nombreFrLatex } from "./nombreFr";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 4 de 4e (« Statistique
 * descriptive à une variable »), première moitié : gen30 (tableau de fréquences), gen31
 * (histogramme), gen32 (moyenne pondérée), gen33 (paramètres de position), gen34 (dispersion), gen35
 * (synthèse), gen36 (boîte à moustaches) — règle `.claude/rules/feuilles-evaluations.md`, section
 * « Corrigé détaillé — comme au tableau ». Virgule décimale `{,}`, « − » typographique dans les
 * textes, sommes longues coupées en plusieurs lignes (jamais une formule coupée en plein milieu).
 * Aucune dépendance à `docx` : importé par les générateurs interactifs.
 */

export type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées de `content/chapters/4e/statistique-descriptive.ts`). */
export const COURS_FREQUENCES = "(cours, § 1)";
export const COURS_HISTOGRAMME = "(cours, § 2)";
export const COURS_MOYENNE = "(cours, § 3)";
export const COURS_POSITION = "(cours, § 4)";
export const COURS_BOITE = "(cours, § 5)";
export const COURS_DISPERSION = "(cours, § 6)";
export const COURS_BT = "(cours, § 7)";

/** Nombre sans bruit flottant (somme de décimaux : 0,1 + 0,2). */
export function net(v: number): number {
  const r = Number(v.toFixed(10));
  return Object.is(r, -0) ? 0 : r;
}

/** Nombre en LaTeX, virgule décimale. */
export function nb(v: number): string {
  return nombreFrLatex(net(v));
}
const nbBrut = nb;

/** Même nombre, entre parenthèses s'il est négatif (facteur, base d'un carré). */
export function nbp(v: number): string {
  return net(v) < 0 ? `(${nb(v)})` : nb(v);
}

/** Nombre dans un texte (justification, résultat) : virgule et vrai signe « − ». */
export function nbt(v: number): string {
  return nombreFr(net(v)).replace(/^-/, "−");
}

/** Valeur exacte : décimal fini (au plus 4 décimales), sinon fraction irréductible. */
export function exact(v: number): string {
  const r = net(v);
  return Math.abs(r * 1e4 - Math.round(r * 1e4)) < 1e-6 ? nb(r) : q(r);
}

/** « = » si la valeur écrite est la valeur exacte, « \approx » sinon. */
export function egalOuEnviron(ecrite: number, exacte: number): string {
  return Math.abs(ecrite - exacte) < 1e-9 ? "=" : "\\approx";
}

/** Largeur visible approximative d'une formule (en caractères) — pour couper une somme trop longue
 * en plusieurs lignes avant qu'elle ne passe à la ligne dans sa cellule. */
export function largeurVisible(l: string): number {
  let s = l;
  for (let i = 0; i < 3; i++) s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_t, a: string, b: string) => (a.length >= b.length ? a : b));
  s = s
    .replace(/\{,\}/g, ",")
    .replace(/\\(cdot|times|Sigma|sigma|bar|leq|geq|approx|varphi|in|to)\b/g, "x")
    .replace(/_\{[^{}]*\}|_[a-z0-9]/g, "i")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/\\./g, "")
    .replace(/[{}^]/g, "");
  return s.length;
}

/** Largeurs maximales (caractères visibles) : membre de DROITE d'une ligne de somme (la colonne du
 * milieu de la grille du corrigé papier ne fait qu'environ 230 px à l'impression), et membre de gauche
 * d'une ligne « paquet » (au-delà, la colonne de gauche écrase celle du milieu — mesuré à 680 px). */
const DROITE_MAX = 26;
const PAQUET_MAX = 18;

/** « a+b+c » (termes déjà en LaTeX). */
function joindreSomme(termes: string[]): string {
  return termes.join("+").replace(/\+-/g, "-");
}

/**
 * Somme `gauche = t₁ + t₂ + … = total`, une transformation par ligne : « gauche=t₁+…+tₖ » puis
 * « =total ». Trop longue pour une ligne : on additionne d'abord les termes par paquets (une ligne
 * par paquet, « t₁+t₂+t₃=P₁ »), puis « gauche=P₁+P₂ » et « =total ».
 */
export function lignesSomme(gauche: string, termes: number[], justification?: string | Fragments, suffixe = ""): LigneCalcul[] {
  const nb = (v: number) => `${nbBrut(v)}${suffixe}`;
  const total = net(termes.reduce((a, b) => a + b, 0));
  const ecrits = termes.map(nb);
  if (termes.length === 1) return [ligne(`${gauche}=${nb(total)}`, justification)];
  if (largeurVisible(`=${joindreSomme(ecrits)}`) <= DROITE_MAX) return [ligne(`${gauche}=${joindreSomme(ecrits)}`, justification), ligne(`=${nb(total)}`)];
  // Paquets de termes dont la somme écrite tient dans la colonne de gauche.
  const paquets: number[][] = [];
  let courant: number[] = [];
  for (const t of termes) {
    const essai = [...courant, t];
    if (courant.length > 0 && largeurVisible(joindreSomme(essai.map(nb))) > PAQUET_MAX) {
      paquets.push(courant);
      courant = [t];
    } else courant = essai;
  }
  if (courant.length) paquets.push(courant);
  const lignes: LigneCalcul[] = [];
  let rang = 1;
  const partielles: number[] = [];
  for (const p of paquets) {
    const somme = net(p.reduce((a, b) => a + b, 0));
    partielles.push(somme);
    const fin = rang + p.length - 1;
    if (p.length > 1) lignes.push(ligne(`${joindreSomme(p.map(nb))}=${nb(somme)}`, `termes ${rang} à ${fin}`));
    rang = fin + 1;
  }
  // Sommes partielles encore trop longues pour une ligne : on les regroupe à leur tour.
  if (paquets.length > 1 && paquets.length < termes.length && largeurVisible(`=${joindreSomme(partielles.map(nb))}`) > DROITE_MAX) {
    return [...lignes, ...lignesSomme(gauche, partielles, justification ?? "somme des paquets", suffixe)];
  }
  lignes.push(ligne(`${gauche}=${joindreSomme(partielles.map(nb))}`, justification ?? "somme des paquets"));
  lignes.push(ligne(`=${nb(total)}`));
  return lignes;
}

/**
 * Somme de produits `gauche = a₁·b₁ + a₂·b₂ + …` : « gauche=a₁\cdot b₁+… », « =p₁+p₂+… »,
 * « =total » si chaque ligne tient ; sinon un produit par ligne (« a₁\cdot b₁=p₁ »), puis la somme
 * des produits (`lignesSomme`).
 */
export function lignesSommeProduits(gauche: string, paires: [number, number][], justification?: string | Fragments): LigneCalcul[] {
  const produits = paires.map(([a, b]) => net(a * b));
  const facteurs = `=${paires.map(([a, b]) => `${nbp(a)}\\cdot ${nbp(b)}`).join("+")}`;
  const sommeProduits = `=${joindreSomme(produits.map(nb))}`;
  const total = net(produits.reduce((a, b) => a + b, 0));
  if (largeurVisible(facteurs) <= DROITE_MAX && largeurVisible(sommeProduits) <= DROITE_MAX) {
    return [ligne(`${gauche}${facteurs}`, justification), ligne(sommeProduits, "on effectue les produits"), ligne(`=${nb(total)}`)];
  }
  const lignes = paires.map(([a, b], i) => ligne(`${nbp(a)}\\cdot ${nbp(b)}=${nb(produits[i])}`, i === 0 ? "un produit par ligne" : undefined));
  return [...lignes, ...lignesSomme(gauche, produits, justification ?? "somme des produits")];
}

/** Résultat à plusieurs valeurs : une formule par valeur (jamais une liste qui passe à la ligne dans
 * une formule), séparées par « ; ». `prefixes[i]` : texte devant la i-ième formule. */
export function listeResultat(formules: string[], prefixes: string[] = [], fin = ""): Fragments {
  const out: Fragments = [];
  formules.forEach((f, i) => {
    if (i > 0) out.push(texte(" ; "));
    if (prefixes[i]) out.push(texte(prefixes[i]));
    out.push(latex(f));
  });
  if (fin) out.push(texte(fin));
  return out;
}

/** Seuil d'un paramètre de position : « \dfrac{n}{2}=\dfrac{20}{2}=10 » (n/4, 3n/4). */
export type ParametrePosition = "mediane" | "q1" | "q3";

export const SYMBOLE_PARAMETRE: Record<ParametrePosition, string> = { q1: "Q_1", mediane: "Q_2", q3: "Q_3" };
export const NOM_PARAMETRE: Record<ParametrePosition, string> = { q1: "premier quartile", mediane: "médiane", q3: "troisième quartile" };
export const FORMULE_SEUIL_LATEX: Record<ParametrePosition, string> = { q1: "\\dfrac{n}{4}", mediane: "\\dfrac{n}{2}", q3: "\\dfrac{3n}{4}" };

export function ligneSeuil(parametre: ParametrePosition, n: number, seuil: number): LigneCalcul {
  const just = `seuil ${parametre === "mediane" ? "de la médiane" : parametre === "q1" ? "de Q₁" : "de Q₃"}`;
  if (parametre === "q3") return ligne(`\\dfrac{3n}{4}=\\dfrac{3\\cdot ${n}}{4}=${nb(seuil)}`, just);
  return ligne(`\\dfrac{n}{${parametre === "mediane" ? 2 : 4}}=\\dfrac{${n}}{${parametre === "mediane" ? 2 : 4}}=${nb(seuil)}`, just);
}

/** Classe `[a ; b[` (dernière : `[a ; b]`) en LaTeX. */
export function classeLatex(borneInf: number, borneSup: number, derniere: boolean): string {
  return `[${nb(borneInf)}\\,;\\,${nb(borneSup)}${derniere ? "]" : "\\mathclose{[}"}`;
}

/** Même classe dans un texte. */
export function classeTexte(borneInf: number, borneSup: number, derniere: boolean): string {
  return `[${nbt(borneInf)} ; ${nbt(borneSup)}${derniere ? "]" : "["}`;
}

/** Centre d'une classe : « x_1=\dfrac{0+4}{2}=2 ». */
export function ligneCentre(nom: string, borneInf: number, borneSup: number, justification?: string | Fragments): LigneCalcul {
  return ligne(`${nom}=\\dfrac{${nb(borneInf)}+${nbp(borneSup)}}{2}=${nb((borneInf + borneSup) / 2)}`, justification);
}

/** Pourcentage en LaTeX : « 20\,\% ». */
export function pc(v: number): string {
  return `${nb(v)}\\,\\%`;
}

/** Fréquence en % : « f_1=\dfrac{4}{20}\times 100\,\%=20\,\% ». */
export function ligneFrequence(nom: string, effectif: number, n: number, frequence: number, justification?: string | Fragments): LigneCalcul {
  return ligne(`${nom}=\\dfrac{${nb(effectif)}}{${nb(n)}}\\times 100\\,\\%=${pc(frequence)}`, justification);
}

/** Chaîne d'ordre « a \leq b \leq c … » (vérification min ≤ Q₁ ≤ Q₂ ≤ Q₃ ≤ max). */
export function ligneOrdre(valeurs: number[]): LigneCalcul {
  return ligne(valeurs.map(nb).join("\\leq "));
}

/** Formule déjà entourée d'une seule paire d'accolades englobante. */
function dejaGroupee(l: string): boolean {
  if (!l.startsWith("{") || !l.endsWith("}")) return false;
  let prof = 0;
  for (let i = 0; i < l.length; i++) {
    if (l[i] === "\\") {
      i++;
      continue;
    }
    if (l[i] === "{") prof++;
    else if (l[i] === "}") {
      prof--;
      if (prof === 0 && i < l.length - 1) return false;
    }
  }
  return true;
}

/**
 * Formules des lignes de texte (Ce qu'on utilise, Résultat, Vérification, Piège) rendues INSÉCABLES
 * (groupe `{…}`) : KaTeX en ligne passe à la ligne après un « = » de niveau 0, et une formule en fin
 * de ligne d'un résultat (« h₁ = 32 % », « x₅ = 12 : n₅ = 2 ») était coupée en deux (mesuré à
 * 680 px). Les chaînes de calcul (`calcul`) ne sont pas touchées : elles sont alignées sur « = ».
 */
export function formulesInsecables(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => ({
    ...e,
    fragments: e.fragments.map((f) => (f.type === "latex" && /[=<>]|\\(leq|geq|approx|in)\b/.test(f.valeur) && !dejaGroupee(f.valeur) ? { ...f, valeur: `{${f.valeur}}` } : f)),
  }));
}

/** Ligne de calcul trop longue pour sa cellule (au-delà de `largeur` caractères visibles) : coupée
 * à son DERNIER « = » en deux lignes alignées (« A=B », « =C »). */
export function couperSiLongue(l: LigneCalcul, largeur = DROITE_MAX): LigneCalcul[] {
  const i0 = l.latex.indexOf("=");
  if (i0 < 0 || largeurVisible(l.latex.slice(i0)) <= largeur) return [l];
  let prof = 0;
  let dernier = -1;
  let premier = -1;
  for (let i = 0; i < l.latex.length; i++) {
    const c = l.latex[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "{") prof++;
    else if (c === "}") prof--;
    else if (c === "=" && prof === 0) {
      if (premier < 0) premier = i;
      dernier = i;
    }
  }
  if (dernier <= premier) return [l];
  return [{ ...l, latex: l.latex.slice(0, dernier) }, { latex: l.latex.slice(dernier) }];
}
