import type { ExerciceInjectiviteFonctions } from "../../core6e/injectiviteFonctions.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { CoteBranche } from "../../moteur6e/typesInjectiviteFonctions";
import { ORDRE_PHASES_INJECTIVITE, type PhaseInjectiviteFonctions } from "../../moteur6e/typesInjectiviteFonctions";
import {
  MAX_DENOMINATEUR_IMAGE_QUADRATIQUE,
  formatFLatexAffichage,
  formatReciproqueLatex,
  racineIndice,
  reciproqueDiviserParA,
  reciproqueMoinsConstante,
  reciproqueMoinsConstanteFraction,
} from "../../ui6e/formatInjectiviteFonctions";
import { approxFractionLatex } from "../../ui6e/formatFraction";
import { substituer } from "../../ui6e/corrigeIntegrales1";
import { COURS_RECIPROQUE, affine, ensembleL, finaliser, justif, ligne, lignesPropres, nb, parN, sommeTermes, terme } from "../../ui6e/corrigeReciproques";
import { formatAffineLatex } from "./formatFLatex";

/**
 * Corrigé détaillé « comme au tableau » de `6gen1` (domaine, injectivité, réciproque, image,
 * bijection) — règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : adaptateur papier ET
 * appli (`App6gen1.tsx`). Une lettre par ÉCRAN (séquence fixe de 5 écrans,
 * `ORDRE_PHASES_INJECTIVITE`). Quand f n'est pas injective, la réciproque est écrite sur la moitié
 * `cote` (papier : « droite » par convention ; appli : la moitié choisie par l'élève à l'écran b).
 */

type Fragments = FragmentConsigne[];
type E = ExerciceInjectiviteFonctions;

export function sequenceInjectiviteFonctions(): PhaseInjectiviteFonctions[] {
  return [...ORDRE_PHASES_INJECTIVITE];
}

/** Membre de droite de f(x) À L'ÉCRAN (forme affichée), avec la variable `v`. */
function rhs(e: E, v = "x"): string {
  const s = formatFLatexAffichage(e).replace(/^f\(x\)\s*=\s*/, "");
  return v === "x" ? s : s.replace(/x/g, v);
}

/** « x − p » (« x + 3 », « x − \dfrac{1}{2} »). */
function moinsP(v: string, p: number): string {
  return affine(1, -p, v);
}

/** a·v (produit écrit : « 3\cdot(−2) », « −(−2) », « 4 »). */
function produit(a: number, v: number): string {
  if (a === 1) return nb(v);
  if (a === -1) return `-${parN(v)}`;
  return `${a}\\cdot ${parN(v)}`;
}

/** Coefficient devant une parenthèse : « », « - », « 3 ». */
function coefDevant(a: number): string {
  return a === 1 ? "" : a === -1 ? "-" : `${a}`;
}

/** Entier écrit dans un texte (« − » typographique). */
function nt(n: number): string {
  return String(n).replace("-", "−");
}

function pivotL(p: number): string {
  return approxFractionLatex(p, MAX_DENOMINATEUR_IMAGE_QUADRATIQUE);
}

/** Forme canonique de la famille « quadratique » : p (pivot) et k (sommet). */
function canonique(e: E): { a: number; b: number; c: number; p: number; k: number } {
  const pr = e.parametres as Extract<E["parametres"], { famille: "quadratique" }>;
  const p = e.pivot as number;
  const k = pr.c - (pr.b * pr.b) / (4 * pr.a);
  return { a: pr.a, b: pr.b, c: pr.c, p, k };
}

/** Écriture « a(x − p)² + k » (variable `v`). */
function canoniqueL(e: E, v = "x"): string {
  const { a, p, k } = canonique(e);
  return `${coefDevant(a)}\\left(${moinsP(v, p)}\\right)^{2}${terme(k, "")}`;
}

// ============================================================================
// Étape a — domaine.
// ============================================================================

/** a·x + b = 0 résolue ligne à ligne. */
function lignesNonNul(a: number, b: number, justification: string): LigneCalcul[] {
  const l: LigneCalcul[] = [ligne(`${affine(a, b)}=0`, justification)];
  if (b !== 0) l.push(ligne(`${terme(a, "x", true)}=${nb(-b)}`, b > 0 ? `on soustrait ${b}` : `on ajoute ${-b}`));
  if (a !== 1) l.push(ligne(`x=${nb(-b / a)}`, `on divise par ${a}`));
  return lignesPropres(l);
}

/** a·x + b ≥ 0 (ou > 0) résolue ligne à ligne. */
function lignesSigne(a: number, b: number, strict: boolean, justification: string): LigneCalcul[] {
  const rel = strict ? ">" : "\\geq ";
  const relInv = strict ? "<" : "\\leq ";
  const l: LigneCalcul[] = [ligne(`${affine(a, b)}${rel}0`, justification)];
  if (b !== 0) l.push(ligne(`${terme(a, "x", true)}${rel}${nb(-b)}`, b > 0 ? `on soustrait ${b}` : `on ajoute ${-b}`));
  if (a !== 1) l.push(ligne(`x${a > 0 ? rel : relInv}${nb(-b / a)}`, a > 0 ? `on divise par ${a}` : `on divise par ${a} < 0 : le sens change`));
  return lignesPropres(l);
}

function etapeDomaine(e: E): EtapeCorrection[] {
  const p = e.parametres;
  const sq = "a";
  const res = resultat(sq, [latex(`\\text{dom}(f)=${ensembleL(e.domaine)}`)]);
  let ut: Fragments;
  let lignes: LigneCalcul[];
  let pg: Fragments | null = null;
  const reel = (j: string): LigneCalcul[] => [ligne("\\text{dom}(f)=\\mathbb{R}", j)];
  switch (p.famille) {
    case "puissanceAffine": {
      if (p.n > 0) {
        ut = [texte(`Une puissance d'exposant naturel est définie pour tout réel ${COURS_RECIPROQUE}.`)];
        lignes = reel("aucun dénominateur, aucune racine");
      } else {
        ut = [texte("Un exposant négatif est un quotient : "), latex(`(${affine(p.a, p.b)})^{${p.n}}=\\dfrac{1}{(${affine(p.a, p.b)})^{${-p.n}}}`), texte(`, dont le dénominateur doit être non nul ${COURS_RECIPROQUE}.`)];
        lignes = lignesNonNul(p.a, p.b, "valeur où le dénominateur s'annule");
        pg = [texte("Le domaine est ℝ privé d'une valeur : on écrit "), latex(`\\mathbb{R}\\setminus\\{${nb(-p.b / p.a)}\\}`), texte(", pas seulement la valeur interdite.")];
      }
      break;
    }
    case "racineNieme": {
      const pair = p.n % 2 === 0;
      if (!pair && p.n > 0) {
        ut = [texte(`Une racine d'indice impair est définie pour tout réel ${COURS_RECIPROQUE}.`)];
        lignes = reel("racine d'indice impair");
      } else if (!pair) {
        ut = [texte("La racine (indice impair) existe toujours, mais elle est au dénominateur : elle doit être non nulle, donc "), latex(`${affine(p.a, p.b)}\\neq 0`), texte(` ${COURS_RECIPROQUE}.`)];
        lignes = lignesNonNul(p.a, p.b, "valeur où le dénominateur s'annule");
      } else {
        const strict = p.n < 0;
        ut = strict
          ? [texte("Racine d'indice pair au dénominateur : son radicande doit être strictement positif, "), latex(`${affine(p.a, p.b)}>0`), texte(` ${COURS_RECIPROQUE}.`)]
          : [texte("Racine d'indice pair : son radicande doit être positif ou nul, "), latex(`${affine(p.a, p.b)}\\geq 0`), texte(` ${COURS_RECIPROQUE}.`)];
        lignes = lignesSigne(p.a, p.b, strict, strict ? "radicande strictement positif" : "radicande positif ou nul");
        pg = p.a < 0 ? [texte("On divise par un nombre négatif : le sens de l'inégalité change.")] : strict ? [texte("La racine est au dénominateur : l'inégalité est stricte, la borne est exclue.")] : null;
      }
      break;
    }
    case "puissanceMonome": {
      if (p.n > 0) {
        ut = [texte(`Un polynôme est défini pour tout réel ${COURS_RECIPROQUE}.`)];
        lignes = reel("aucun dénominateur, aucune racine");
      } else {
        const m = -p.n;
        ut = [texte("Un exposant négatif est un quotient : "), latex(`x^{${p.n}}=\\dfrac{1}{x^{${m}}}`), texte(`, dont le dénominateur doit être non nul ${COURS_RECIPROQUE}.`)];
        lignes = [ligne(`x^{${m}}=0`, "valeur où le dénominateur s'annule"), ligne("x=0", `seul nombre dont la puissance ${m} est nulle`)];
      }
      break;
    }
    case "racinePlusConstante": {
      ut = [texte("Racine carrée : son radicande doit être positif ou nul, "), latex(`${affine(p.a, p.b)}\\geq 0`), texte(` ${COURS_RECIPROQUE}.`)];
      lignes = lignesSigne(p.a, p.b, false, "radicande positif ou nul");
      if (p.a < 0) pg = [texte("On divise par un nombre négatif : le sens de l'inégalité change.")];
      break;
    }
    case "homographique": {
      ut = [texte("Quotient : le dénominateur doit être non nul, "), latex(`${affine(p.c, p.d)}\\neq 0`), texte(` ${COURS_RECIPROQUE}.`)];
      lignes = lignesNonNul(p.c, p.d, "valeur où le dénominateur s'annule");
      pg = [texte("Le domaine est ℝ privé d'une valeur : on écrit "), latex(`\\mathbb{R}\\setminus\\{${nb(-p.d / p.c)}\\}`), texte(", pas seulement la valeur interdite.")];
      break;
    }
    case "quadratique": {
      ut = [texte(`Un polynôme est défini pour tout réel ${COURS_RECIPROQUE}.`)];
      lignes = reel("aucun dénominateur, aucune racine");
      break;
    }
  }
  return [utilise(sq, ut), calcul(sq, lignes), res, ...(pg ? [piege(sq, pg)] : [])];
}

// ============================================================================
// Étape b — injectivité (ou plus grand intervalle d'injectivité).
// ============================================================================

/** Lignes « a·x₁ + b = a·x₂ + b » → « x₁ = x₂ ». */
function lignesAffineEgales(a: number, b: number): LigneCalcul[] {
  const l: LigneCalcul[] = [];
  if (b !== 0) l.push(ligne(`${terme(a, "x_{1}", true)}=${terme(a, "x_{2}", true)}`, b > 0 ? `on soustrait ${b}` : `on ajoute ${-b}`));
  if (a !== 1) l.push(ligne("x_{1}=x_{2}", `on divise par ${a}`));
  return l;
}

/** Lignes de la démonstration « f(x₁) = f(x₂) ⟹ x₁ = x₂ » d'une famille injective. */
function lignesInjective(e: E): LigneCalcul[] {
  const p = e.parametres;
  const depart = ligne(`${rhs(e, "x_{1}")}=${rhs(e, "x_{2}")}`, justif("on suppose ", { l: "f(x_{1})=f(x_{2})" }));
  const l: LigneCalcul[] = [depart];
  switch (p.famille) {
    case "puissanceAffine": {
      const A1 = affine(p.a, p.b, "x_{1}");
      const A2 = affine(p.a, p.b, "x_{2}");
      const m = Math.abs(p.n);
      if (p.n < 0) l.push(ligne(`(${A1})^{${m}}=(${A2})^{${m}}`, "on inverse les deux membres"));
      l.push(ligne(`${A1}=${A2}`, `exposant impair : deux nombres de même puissance ${m} sont égaux`));
      l.push(...lignesAffineEgales(p.a, p.b));
      break;
    }
    case "racineNieme": {
      const A1 = affine(p.a, p.b, "x_{1}");
      const A2 = affine(p.a, p.b, "x_{2}");
      const m = Math.abs(p.n);
      if (p.n < 0) l.push(ligne(`${racineIndice(m, A1)}=${racineIndice(m, A2)}`, "on inverse les deux membres"));
      l.push(ligne(`${A1}=${A2}`, m === 2 ? "on élève au carré" : `on élève à la puissance ${m}`));
      l.push(...lignesAffineEgales(p.a, p.b));
      break;
    }
    case "puissanceMonome": {
      const m = Math.abs(p.n);
      if (p.n > 0) {
        l.push(ligne(`${terme(p.a, "x_{1}^{" + m + "}", true)}=${terme(p.a, "x_{2}^{" + m + "}", true)}`, p.b > 0 ? `on soustrait ${p.b}` : `on ajoute ${-p.b}`));
        if (p.a !== 1) l.push(ligne(`x_{1}^{${m}}=x_{2}^{${m}}`, `on divise par ${p.a}`));
      } else {
        const q = (v: string) => (p.a < 0 ? `-\\dfrac{${-p.a}}{${v}^{${m}}}` : `\\dfrac{${p.a}}{${v}^{${m}}}`);
        l.push(ligne(`${q("x_{1}")}=${q("x_{2}")}`, p.b > 0 ? `on soustrait ${p.b}` : `on ajoute ${-p.b}`));
        l.push(ligne(`x_{1}^{${m}}=x_{2}^{${m}}`, `on divise par ${p.a}, puis on inverse`));
      }
      l.push(ligne("x_{1}=x_{2}", `exposant impair : deux nombres de même puissance ${m} sont égaux`));
      break;
    }
    case "racinePlusConstante": {
      const A1 = affine(p.a, p.b, "x_{1}");
      const A2 = affine(p.a, p.b, "x_{2}");
      l.push(ligne(`\\sqrt{${A1}}=\\sqrt{${A2}}`, p.c > 0 ? `on soustrait ${p.c}` : `on ajoute ${-p.c}`));
      l.push(ligne(`${A1}=${A2}`, "on élève au carré"));
      l.push(...lignesAffineEgales(p.a, p.b));
      break;
    }
    case "homographique": {
      const { a, b, c, d } = p;
      const A = (v: string) => affine(a, b, v);
      const C = (v: string) => affine(c, d, v);
      l.push(ligne(`(${A("x_{1}")})(${C("x_{2}")})=(${A("x_{2}")})(${C("x_{1}")})`, "produit en croix"));
      l.push(
        ligne(
          `${sommeTermes([[a * c, "x_{1}x_{2}"], [a * d, "x_{1}"], [b * c, "x_{2}"], [b * d, ""]])}=${sommeTermes([[a * c, "x_{1}x_{2}"], [a * d, "x_{2}"], [b * c, "x_{1}"], [b * d, ""]])}`,
          "on distribue",
        ),
      );
      l.push(ligne(`${sommeTermes([[a * d, "x_{1}"], [b * c, "x_{2}"]])}=${sommeTermes([[a * d, "x_{2}"], [b * c, "x_{1}"]])}`, justif("on retire ", { l: `${terme(a * c, "x_{1}x_{2}", true)}` }, " et ", { l: nb(b * d) }, " des deux membres")));
      l.push(ligne(`${terme(a * d - b * c, "x_{1}", true)}=${terme(a * d - b * c, "x_{2}", true)}`, "on regroupe"));
      l.push(ligne("x_{1}=x_{2}", justif("on divise par ", { l: `ad-bc=${a * d - b * c}\\neq 0` })));
      break;
    }
    case "quadratique":
      break;
  }
  return lignesPropres(l);
}

/** Contre-exemple (deux antécédents distincts de même image) d'une famille non injective. */
function lignesContreExemple(e: E): { lignes: LigneCalcul[]; x1: number; x2: number } {
  const p = e.parametres;
  if (p.famille === "quadratique") {
    const { a, p: piv, k } = canonique(e);
    const x1 = piv - 1;
    const x2 = piv + 1;
    const ca = coefDevant(a);
    return {
      x1,
      x2,
      lignes: [
        ligne(`f\\left(${nb(x1)}\\right)=${ca}(-1)^{2}${terme(k, "")}`, justif("forme canonique, ", { l: `${nb(x1)}${terme(-piv, "")}=-1` })),
        ligne(`=${nb(a + k)}`),
        ligne(`f\\left(${nb(x2)}\\right)=${ca === "" || ca === "-" ? ca : `${ca}\\cdot `}1^{2}${terme(k, "")}`, justif("car ", { l: `${nb(x2)}${terme(-piv, "")}=1` })),
        ligne(`=${nb(a + k)}`),
      ],
    };
  }
  if (p.famille === "puissanceAffine") {
    const x1 = (-1 - p.b) / p.a;
    const x2 = (1 - p.b) / p.a;
    const m = Math.abs(p.n);
    const val = (x: number, s: number) =>
      p.n > 0
        ? [ligne(`f\\left(${nb(x)}\\right)=\\left(${produit(p.a, x)}${terme(p.b, "")}\\right)^{${p.n}}`), ligne(`=(${s})^{${p.n}}`), ligne("=1")]
        : [ligne(`f\\left(${nb(x)}\\right)=\\dfrac{1}{\\left(${produit(p.a, x)}${terme(p.b, "")}\\right)^{${m}}}`), ligne(`=\\dfrac{1}{(${s})^{${m}}}`), ligne("=1")];
    return { x1: Math.min(x1, x2), x2: Math.max(x1, x2), lignes: [...val(x1, -1), ...val(x2, 1)] };
  }
  // puissanceMonome, n pair
  const pm = p as Extract<E["parametres"], { famille: "puissanceMonome" }>;
  const m = Math.abs(pm.n);
  const val = (x: number) =>
    pm.n > 0
      ? [ligne(`f(${x})=${pm.a === 1 ? "" : pm.a === -1 ? "-" : `${pm.a}\\cdot `}${x < 0 ? `(${x})` : x}^{${m}}${terme(pm.b, "")}`), ligne(`=${nb(pm.a + pm.b)}`)]
      : [ligne(`f(${x})=${pm.a < 0 ? "-" : ""}\\dfrac{${Math.abs(pm.a)}}{${x < 0 ? `(${x})` : x}^{${m}}}${terme(pm.b, "")}`), ligne(`=${nb(pm.a + pm.b)}`)];
  return { x1: -1, x2: 1, lignes: [...val(-1), ...val(1)] };
}

/** Démonstration de l'injectivité sur la moitié `cote`. */
function lignesInjectiveMoitie(e: E, cote: CoteBranche): LigneCalcul[] {
  const p = e.parametres;
  const droite = cote === "droite";
  if (p.famille === "quadratique") {
    const { a, p: piv, k } = canonique(e);
    const morceaux: (string | { l: string })[] = ["si ", { l: "f(x_{1})=f(x_{2})" }, " (forme canonique)"];
    if (k !== 0) morceaux.push(k > 0 ? " : on soustrait " : " : on ajoute ", { l: nb(Math.abs(k)) });
    if (a !== 1) morceaux.push(`${k !== 0 ? "," : " :"} on divise par ${String(a).replace("-", "−")}`);
    return [
      ligne(`\\left(${moinsP("x_{1}", piv)}\\right)^{2}=\\left(${moinsP("x_{2}", piv)}\\right)^{2}`, justif(...morceaux)),
      ligne(`${moinsP("x_{1}", piv)}=${moinsP("x_{2}", piv)}`, justif("sur l'intervalle retenu, ", { l: moinsP("x_{1}", piv) }, " et ", { l: moinsP("x_{2}", piv) }, droite ? " sont positifs : même carré, même nombre" : " sont négatifs : même carré, même nombre")),
      ligne("x_{1}=x_{2}", piv > 0 ? justif("on ajoute ", { l: pivotL(piv) }) : justif("on soustrait ", { l: pivotL(-piv) })),
    ];
  }
  if (p.famille === "puissanceAffine") {
    const A1 = affine(p.a, p.b, "x_{1}");
    const A2 = affine(p.a, p.b, "x_{2}");
    const m = Math.abs(p.n);
    const signe = (droite ? p.a > 0 : p.a < 0) ? "positif" : "négatif";
    return lignesPropres([
      ligne(`(${A1})^{${m}}=(${A2})^{${m}}`, justif("si ", { l: "f(x_{1})=f(x_{2})" }, p.n < 0 ? " (on inverse)" : "")),
      ligne(`${A1}=${A2}`, justif("sur cet intervalle, ", { l: affine(p.a, p.b) }, ` est ${signe} : même puissance paire, même nombre`)),
      ...lignesAffineEgales(p.a, p.b),
    ]);
  }
  const pm = p as Extract<E["parametres"], { famille: "puissanceMonome" }>;
  const m = Math.abs(pm.n);
  return [
    ligne(`x_{1}^{${m}}=x_{2}^{${m}}`, justif("si ", { l: "f(x_{1})=f(x_{2})" }, ` : ${pm.b > 0 ? `on soustrait ${pm.b}` : `on ajoute ${-pm.b}`}, ${pm.n < 0 ? `on divise par ${nt(pm.a)} puis on inverse` : `on divise par ${nt(pm.a)}`}`)),
    ligne("x_{1}=x_{2}", droite ? "x₁ et x₂ sont positifs : même puissance paire, même nombre" : "x₁ et x₂ sont négatifs : même puissance paire, même nombre"),
  ];
}

function intervalleCote(e: E, cote: CoteBranche) {
  return cote === "droite" ? e.intervalleDroite : e.intervalleGauche;
}

function etapeInjectivite(e: E, cote: CoteBranche): EtapeCorrection[] {
  const sq = "b";
  if (e.injective) {
    return [
      utilise(sq, [texte("f est injective si deux images égales ont forcément le même antécédent : "), latex("f(x_{1})=f(x_{2})\\Rightarrow x_{1}=x_{2}"), texte(` ${COURS_RECIPROQUE}.`)]),
      calcul(sq, lignesInjective(e)),
      resultat(sq, [texte("Oui : f est injective sur "), latex(`\\text{dom}(f)=${ensembleL(e.domaine)}`), texte(".")]),
    ];
  }
  const piv = e.pivot as number;
  const ce = lignesContreExemple(e);
  const lignes: LigneCalcul[] = [];
  if (e.parametres.famille === "quadratique") {
    const { a, b, c, p } = canonique(e);
    const ca = coefDevant(a);
    const brut: LigneCalcul[] = [ligne(`f(x)=${sommeTermes([[a, "x^{2}"], [b, "x"], [c, ""]])}`)];
    if (a !== 1) brut.push(ligne(`=${ca}\\left(${sommeTermes([[1, "x^{2}"], [b / a, "x"]])}\\right)${terme(c, "")}`, `on met ${a} en évidence`));
    brut.push(ligne(`=${ca}\\left[\\left(${moinsP("x", p)}\\right)^{2}${terme(-p * p, "")}\\right]${terme(c, "")}`, justif("on complète le carré, ", { l: `\\left(${moinsP("x", p)}\\right)^{2}=${sommeTermes([[1, "x^{2}"], [-2 * p, "x"], [p * p, ""]])}` })));
    brut.push(ligne(`=${ca}\\left(${moinsP("x", p)}\\right)^{2}${terme(-a * p * p, "")}${terme(c, "")}`, `on distribue ${a}`));
    brut.push(ligne(`=${canoniqueL(e)}`, "on réduit"));
    lignes.push(...lignesPropres(brut));
  }
  lignes.push(...ce.lignes);
  lignes.push(ligne(`${nb(ce.x1)}\\neq ${nb(ce.x2)}`, justif("deux antécédents distincts de même image, symétriques par rapport à ", { l: `x=${pivotL(piv)}` })));
  lignes.push(...lignesInjectiveMoitie(e, cote));
  const autre = cote === "droite" ? "gauche" : "droite";
  return [
    utilise(sq, [
      texte("Pour montrer que f n'est pas injective, un contre-exemple suffit : deux réels distincts de même image. Sur une moitié du domaine limitée par l'axe de symétrie, f redevient injective "),
      texte(`${COURS_RECIPROQUE}.`),
    ]),
    calcul(sq, lignes),
    resultat(sq, [
      texte("Non : f n'est pas injective sur dom(f). Plus grand intervalle d'injectivité : "),
      latex(ensembleL(intervalleCote(e, cote))),
      texte(" (ou "),
      latex(ensembleL(intervalleCote(e, autre))),
      texte(")."),
    ]),
    piege(sq, [texte("Les deux moitiés conviennent, mais la réciproque dépend de la moitié retenue : le signe devant la racine change.")]),
  ];
}

// ============================================================================
// Étape c — réciproque (méthode : on pose y = f(x), on échange x et y, on isole y).
// ============================================================================

/** Signe de la quantité « intérieure » sur la moitié retenue (familles non injectives). */
function signeInterieur(e: E, cote: CoteBranche): 1 | -1 {
  const p = e.parametres;
  const droite = cote === "droite";
  if (p.famille === "puissanceAffine") return (droite ? p.a > 0 : p.a < 0) ? 1 : -1;
  return droite ? 1 : -1;
}

function lignesIsolerY(e: E, cote: CoteBranche): LigneCalcul[] {
  const p = e.parametres;
  const depart = ligne(`x=${p.famille === "quadratique" ? canoniqueL(e, "y") : rhs(e, "y")}`, p.famille === "quadratique" ? "forme canonique de l'étape b, x et y échangés" : "on pose y = f(x), puis on échange x et y");
  const l: LigneCalcul[] = [depart];
  const s = e.injective ? 1 : signeInterieur(e, cote);
  const sgn = s < 0 ? "-" : "";
  const jRacine = e.injective ? "" : s > 0 ? " : sur l'intervalle retenu, cette quantité est positive" : " : sur l'intervalle retenu, cette quantité est négative";
  const lignesFin = (num: string, a: number, b: number) => {
    if (b !== 0) l.push(ligne(`${terme(a, "y", true)}=${num}`, b > 0 ? `on soustrait ${b}` : `on ajoute ${-b}`));
    if (a !== 1) l.push(ligne(`y=${reciproqueDiviserParA(num, a)}`, `on divise par ${a}`));
  };
  switch (p.famille) {
    case "puissanceAffine": {
      const Y = affine(p.a, p.b, "y");
      const m = Math.abs(p.n);
      if (p.n < 0) l.push(ligne(`(${Y})^{${m}}=\\dfrac{1}{x}`, "on inverse les deux membres"));
      const R = p.n > 0 ? racineIndice(p.n, "x") : `\\dfrac{1}{${racineIndice(m, "x")}}`;
      l.push(ligne(`${Y}=${sgn}${R}`, m % 2 === 1 ? `racine d'indice ${m} (indice impair)` : `racine d'indice ${m}${jRacine}`));
      lignesFin(reciproqueMoinsConstante(`${sgn}${R}`, p.b), p.a, p.b);
      break;
    }
    case "racineNieme": {
      const Y = affine(p.a, p.b, "y");
      const m = Math.abs(p.n);
      if (p.n < 0) l.push(ligne(`${racineIndice(m, Y)}=\\dfrac{1}{x}`, "on inverse les deux membres"));
      const P = p.n > 0 ? `x^{${p.n}}` : `\\dfrac{1}{x^{${m}}}`;
      l.push(ligne(`${Y}=${P}`, m === 2 ? "on élève au carré" : `on élève à la puissance ${m}`));
      lignesFin(reciproqueMoinsConstante(P, p.b), p.a, p.b);
      break;
    }
    case "puissanceMonome": {
      const m = Math.abs(p.n);
      const xMoinsB = formatAffineLatex(1, -p.b);
      const u = reciproqueDiviserParA(xMoinsB, p.a);
      if (p.n > 0) {
        l.push(ligne(`${terme(p.a, `y^{${m}}`, true)}=${xMoinsB}`, p.b > 0 ? `on soustrait ${p.b}` : `on ajoute ${-p.b}`));
        if (p.a !== 1) l.push(ligne(`y^{${m}}=${u}`, `on divise par ${p.a}`));
        l.push(ligne(`y=${sgn}${racineIndice(m, u)}`, m % 2 === 1 ? `racine d'indice ${m} (indice impair)` : `racine d'indice ${m}${jRacine}`));
      } else {
        const q = p.a < 0 ? `-\\dfrac{${-p.a}}{y^{${m}}}` : `\\dfrac{${p.a}}{y^{${m}}}`;
        l.push(ligne(`${q}=${xMoinsB}`, p.b > 0 ? `on soustrait ${p.b}` : `on ajoute ${-p.b}`));
        if (p.a !== 1) l.push(ligne(`\\dfrac{1}{y^{${m}}}=${u}`, `on divise par ${p.a}`));
        l.push(ligne(`\\dfrac{1}{y}=${sgn}${racineIndice(m, u)}`, m % 2 === 1 ? `racine d'indice ${m} (indice impair)` : `racine d'indice ${m}${jRacine}`));
        l.push(ligne(`y=\\dfrac{1}{${sgn}${racineIndice(m, u)}}`, "on inverse les deux membres"));
      }
      break;
    }
    case "racinePlusConstante": {
      const Y = affine(p.a, p.b, "y");
      const xMoinsC = formatAffineLatex(1, -p.c);
      l.push(ligne(`\\sqrt{${Y}}=${xMoinsC}`, p.c > 0 ? `on soustrait ${p.c}` : `on ajoute ${-p.c}`));
      const carre = `\\left(${xMoinsC}\\right)^{2}`;
      l.push(ligne(`${Y}=${carre}`, "on élève au carré"));
      lignesFin(reciproqueMoinsConstante(carre, p.b), p.a, p.b);
      break;
    }
    case "homographique": {
      const { a, b, c, d } = p;
      l.push(ligne(`x\\left(${affine(c, d, "y")}\\right)=${affine(a, b, "y")}`, "produit en croix"));
      l.push(ligne(`${sommeTermes([[c, "xy"], [d, "x"]])}=${affine(a, b, "y")}`, "on distribue"));
      l.push(ligne(`${sommeTermes([[c, "xy"], [-a, "y"]])}=${sommeTermes([[-d, "x"], [b, ""]])}`, "on regroupe les termes en y"));
      l.push(ligne(`y\\left(${affine(c, -a)}\\right)=${affine(-d, b)}`, "on met y en évidence"));
      l.push(ligne(`y=\\dfrac{${formatAffineLatex(-d, b)}}{${formatAffineLatex(c, -a)}}`, justif("on divise par ", { l: affine(c, -a) })));
      break;
    }
    case "quadratique": {
      const { a, p: piv, k } = canonique(e);
      const xMoinsK = reciproqueMoinsConstanteFraction("x", k);
      l.push(ligne(`${coefDevant(a)}\\left(${moinsP("y", piv)}\\right)^{2}=${xMoinsK}`, k === 0 ? "" : k > 0 ? justif("on soustrait ", { l: nb(k) }) : justif("on ajoute ", { l: nb(-k) })));
      const U = reciproqueDiviserParA(xMoinsK, a);
      if (a !== 1) l.push(ligne(`\\left(${moinsP("y", piv)}\\right)^{2}=${U}`, `on divise par ${a}`));
      l.push(ligne(`${moinsP("y", piv)}=${sgn}\\sqrt{${U}}`, `racine carrée${s > 0 ? " : y − p est positif sur l'intervalle retenu" : " : y − p est négatif sur l'intervalle retenu"}`));
      l.push(ligne(`y=${pivotL(piv)}${s > 0 ? "+" : "-"}\\sqrt{${U}}`, piv > 0 ? justif("on ajoute ", { l: pivotL(piv) }) : justif("on soustrait ", { l: pivotL(-piv) })));
      break;
    }
  }
  l.push(ligne(`y=${formatReciproqueLatex(e, cote)}`, "le signe est écrit devant la fraction"));
  return lignesPropres(l);
}

/** Point de vérification (x₀ de l'intervalle retenu, y₀ = f(x₀) exact). */
function pointVerification(e: E, cote: CoteBranche): { x0: number; y0: number } {
  const p = e.parametres;
  const s = e.injective ? 1 : signeInterieur(e, cote);
  switch (p.famille) {
    case "puissanceAffine":
      return { x0: (s - p.b) / p.a, y0: 1 };
    case "racineNieme":
      return { x0: (1 - p.b) / p.a, y0: 1 };
    case "puissanceMonome":
      return { x0: s, y0: p.a + p.b };
    case "racinePlusConstante":
      return { x0: (1 - p.b) / p.a, y0: 1 + p.c };
    case "homographique":
      return { x0: 0, y0: p.b / p.d };
    case "quadratique": {
      const { a, p: piv, k } = canonique(e);
      return { x0: piv + s, y0: a + k };
    }
  }
}

function etapeReciproque(e: E, cote: CoteBranche): EtapeCorrection[] {
  const sq = "c";
  const recip = formatReciproqueLatex(e, cote);
  const X = intervalleCote(e, cote);
  const { x0, y0 } = pointVerification(e, cote);
  const subst = substituer(recip, nb(y0));
  return [
    utilise(sq, [
      texte("Méthode : sur "),
      latex(ensembleL(X)),
      texte(", on pose "),
      latex("y=f(x)"),
      texte(", on échange les rôles de x et de y, puis on isole y "),
      texte(`${COURS_RECIPROQUE}.`),
    ]),
    calcul(sq, lignesIsolerY(e, cote)),
    resultat(sq, [latex(`f^{-1}(x)=${recip}`)]),
    verification(sq, [texte("On revient au point de départ : "), latex(`f\\left(f^{-1}(y_{0})\\right)=y_{0}`), texte(".")], lignesPropres([
      ligne(`f\\left(${nb(x0)}\\right)=${nb(y0)}`, "image d'un point de l'intervalle"),
      ligne(`f^{-1}\\left(${nb(y0)}\\right)=${subst}`),
      ligne(`=${nb(x0)}`, "on retrouve le point de départ"),
    ])),
    piege(sq, e.injective ? [texte("On isole y en défaisant les opérations dans l'ordre inverse : d'abord la dernière appliquée à x.")] : [texte("Le signe devant la racine vient de l'intervalle retenu : sur l'autre moitié, la réciproque change de signe.")]),
  ];
}

// ============================================================================
// Étape d — image.
// ============================================================================

function lignesImage(e: E): LigneCalcul[] {
  const p = e.parametres;
  const toutR = (j: string) => [ligne("\\text{Im}(f)=\\mathbb{R}", j)];
  switch (p.famille) {
    case "puissanceAffine": {
      const A = affine(p.a, p.b);
      const m = Math.abs(p.n);
      if (p.n % 2 !== 0 && p.n > 0) return toutR(`exposant impair : ${A === "x" ? "x" : "ax + b"} et sa puissance ${m} prennent toutes les valeurs réelles`);
      if (p.n % 2 !== 0) return [ligne(`(${A})^{${m}}\\neq 0`, "sur dom(f)"), ligne(`\\dfrac{1}{(${A})^{${m}}}\\neq 0`, "un quotient de numérateur 1 n'est jamais nul ; toute autre valeur est atteinte")];
      if (p.n > 0) return [ligne(`(${A})^{${m}}\\geq 0`, justif("puissance paire ; elle vaut 0 en ", { l: `x=${nb(-p.b / p.a)}` }))];
      return [ligne(`(${A})^{${m}}>0`, "puissance paire d'un nombre non nul"), ligne(`\\dfrac{1}{(${A})^{${m}}}>0`, "un quotient de deux positifs est positif ; il prend toutes les valeurs positives")];
    }
    case "racineNieme": {
      const A = affine(p.a, p.b);
      const m = Math.abs(p.n);
      if (p.n % 2 !== 0 && p.n > 0) return toutR("racine d'indice impair : elle prend toutes les valeurs réelles");
      if (p.n % 2 !== 0) return [ligne(`${racineIndice(m, A)}\\neq 0`, "sur dom(f)"), ligne(`\\dfrac{1}{${racineIndice(m, A)}}\\neq 0`, "un quotient de numérateur 1 n'est jamais nul ; toute autre valeur est atteinte")];
      if (p.n > 0) return [ligne(`${racineIndice(m, A)}\\geq 0`, justif("une racine d'indice pair est positive ; elle vaut 0 en ", { l: `x=${nb(-p.b / p.a)}` }))];
      return [ligne(`${racineIndice(m, A)}>0`, "radicande strictement positif"), ligne(`\\dfrac{1}{${racineIndice(m, A)}}>0`, "il prend toutes les valeurs positives")];
    }
    case "puissanceMonome": {
      const m = Math.abs(p.n);
      if (p.n % 2 !== 0 && p.n > 0) return toutR(`exposant impair : x puissance ${m} prend toutes les valeurs réelles`);
      const fracX = p.a < 0 ? `-\\dfrac{${-p.a}}{x^{${m}}}` : `\\dfrac{${p.a}}{x^{${m}}}`;
      const ajout = p.b > 0 ? `on ajoute ${p.b}` : `on soustrait ${-p.b}`;
      if (p.n % 2 !== 0) return [ligne(`\\dfrac{1}{x^{${m}}}\\neq 0`, "sur dom(f)"), ligne(`${fracX}\\neq 0`, `on multiplie par ${p.a}`), ligne(`f(x)\\neq ${p.b}`, ajout)];
      const rel = p.n > 0 ? (p.a > 0 ? "\\geq " : "\\leq ") : p.a > 0 ? ">" : "<";
      if (p.n > 0)
        return [
          ligne(`x^{${m}}\\geq 0`, "puissance paire ; elle vaut 0 en x = 0"),
          ligne(`${terme(p.a, `x^{${m}}`, true)}${rel}0`, p.a > 0 ? `on multiplie par ${p.a}` : `on multiplie par ${p.a} < 0 : le sens change`),
          ligne(`f(x)${rel}${p.b}`, ajout),
        ];
      return [
        ligne(`\\dfrac{1}{x^{${m}}}>0`, "puissance paire d'un nombre non nul"),
        ligne(`${fracX}${rel}0`, p.a > 0 ? `on multiplie par ${p.a}` : `on multiplie par ${p.a} < 0 : le sens change`),
        ligne(`f(x)${rel}${p.b}`, ajout),
      ];
    }
    case "racinePlusConstante": {
      const A = affine(p.a, p.b);
      return [
        ligne(`\\sqrt{${A}}\\geq 0`, justif("une racine carrée est positive ; elle vaut 0 en ", { l: `x=${nb(-p.b / p.a)}` })),
        ligne(`\\sqrt{${A}}${terme(p.c, "")}\\geq ${p.c}`, p.c > 0 ? `on ajoute ${p.c}` : `on soustrait ${-p.c}`),
        ligne(`f(x)\\geq ${p.c}`, `toute valeur à partir de ${p.c} est atteinte`),
      ];
    }
    case "homographique": {
      const { a, c } = p;
      return lignesPropres([
        ligne(`${affine(c, -a)}=0`, "valeur où le dénominateur de la réciproque s'annule"),
        ligne(`${terme(c, "x", true)}=${a}`, a > 0 ? `on ajoute ${a}` : `on soustrait ${-a}`),
        ligne(`x=${nb(a / c)}`, `on divise par ${c}`),
      ]);
    }
    case "quadratique": {
      const { a, p: piv, k } = canonique(e);
      const rel = a > 0 ? "\\geq " : "\\leq ";
      return [
        ligne(`\\left(${moinsP("x", piv)}\\right)^{2}\\geq 0`, justif("un carré est positif ; il vaut 0 en ", { l: `x=${pivotL(piv)}` })),
        ligne(`${coefDevant(a)}\\left(${moinsP("x", piv)}\\right)^{2}${rel}0`, a > 0 ? `on multiplie par ${a}` : `on multiplie par ${a} < 0 : le sens change`),
        ligne(`f(x)${rel}${nb(k)}`, k >= 0 ? justif("on ajoute ", { l: nb(k) }) : justif("on soustrait ", { l: nb(-k) })),
      ];
    }
  }
}

function etapeImage(e: E): EtapeCorrection[] {
  const sq = "d";
  const p = e.parametres;
  const ut: Fragments =
    p.famille === "homographique"
      ? [texte("L'image de f est le domaine de sa réciproque : "), latex("\\text{Im}(f)=\\text{dom}(f^{-1})"), texte(`, avec la réciproque de l'étape c ${COURS_RECIPROQUE}.`)]
      : [texte("On encadre f(x) à partir de la fonction de référence qui la compose, puis on vérifie que toutes les valeurs de l'encadrement sont atteintes "), texte(`${COURS_RECIPROQUE}.`)];
  const pg: Fragments | null =
    p.famille === "quadratique" && canonique(e).a < 0
      ? [texte("Ici a < 0 : la parabole est tournée vers le bas, l'image est limitée vers le haut.")]
      : p.famille === "racineNieme" && p.n % 2 === 0
        ? [texte("La formule de la réciproque est définie sur ℝ, mais son domaine est l'image de f : seulement les valeurs positives.")]
        : p.famille === "puissanceMonome" && p.n % 2 !== 0 && p.n < 0
          ? [texte("La valeur b n'est jamais atteinte (asymptote horizontale) : l'image est ℝ privé de b.")]
          : null;
  return [utilise(sq, ut), calcul(sq, lignesImage(e)), resultat(sq, [latex(`\\text{Im}(f)=${ensembleL(e.image)}`)]), ...(pg ? [piege(sq, pg)] : [])];
}

// ============================================================================
// Étape e — bijection.
// ============================================================================

function etapeBijection(e: E, cote: CoteBranche): EtapeCorrection[] {
  const sq = "e";
  const X = ensembleL(intervalleCote(e, cote));
  const Y = ensembleL(e.image);
  return [
    utilise(sq, [texte("Une fonction injective sur X est une bijection de X sur son image "), latex("Y=f(X)"), texte(` ${COURS_RECIPROQUE}.`)]),
    calcul(sq, [ligne(`X=${X}`, e.injective ? "f est injective sur tout son domaine (étape b)" : "intervalle d'injectivité retenu (étape b)"), ligne(`Y=${Y}`, "image (étape d)")]),
    resultat(sq, [texte("f est une bijection de "), latex(X), texte(" sur "), latex(Y), texte(".")]),
    piege(sq, e.injective ? [texte("L'ensemble d'arrivée est l'image de f, pas ℝ : sinon f ne serait pas surjective.")] : [texte("X est la moitié retenue à l'étape b (celle de la réciproque), et l'arrivée est l'image, pas ℝ.")]),
  ];
}

/** Corrigé complet ; `cote` = moitié retenue quand f n'est pas injective. */
export function correctionDetailleeInjectiviteFonctions(e: E, cote: CoteBranche = "droite"): EtapeCorrection[] {
  return finaliser([...etapeDomaine(e), ...etapeInjectivite(e, cote), ...etapeReciproque(e, cote), ...etapeImage(e), ...etapeBijection(e, cote)]);
}

/** Lettres des écrans de pure lecture : domaine ℝ (a), image ℝ (d), bijection (e : recopie de b et d). */
export function lettresLectureInjectivite(e: E): string[] {
  const l: string[] = [];
  if (e.domaine.forme === "reel") l.push("a");
  if (e.image.forme === "reel") l.push("d");
  l.push("e");
  return l;
}
