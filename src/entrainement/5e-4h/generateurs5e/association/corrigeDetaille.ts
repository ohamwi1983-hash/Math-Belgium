import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import { construireSvgFonction, type OptionsSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { lettreCorrecte, nombreElementsAssociation, type ExerciceAssociation, type FonctionVarieeAssociation, type PolynomeAssociation } from "../../core5e/association.types";
import { cadrageVariee, deriveeVariee, domaineVariee, evaluerVariee, exclusionVariee, extremumsVariee, nombreTexte, X_MAX_VARIEE, X_MIN_VARIEE } from "./fonctionsVariees";
import { monomesDe } from "../../ui5e/corrigeLimites";
import { COURS_DERIVEE, COURS_SIGNE, dixiemeL, dixiemeT, f, finaliser, jf, par, sansDoublons, somme, t } from "../../ui5e/corrigeDerivees1";
import { evaluerPolynome } from "../domaineDefinition/polynome";
import { derivee, formeCubique } from "./index";
import { specJustification, OPTIONS_SINGULARITE } from "../../moteur5e/justificationAssociation";
import { consigneJustificationAssociation } from "../../ui5e/retoursAssociation";
import { fragmentsRiches5e } from "../../ui5e/retoursDerivees";

/**
 * Corrigé détaillé « comme au tableau » de 5gen25 (association graphique/mots ↔ signe de f′/f″) —
 * règle `.claude/rules/feuilles-evaluations.md`, « Lectures graphiques et décisions ». Un seul écran
 * (lettre a) : un bloc par élément numéroté. Familles A et B : une relation par chose lue sur le
 * graphique (signe de f′ zone par zone, abscisses des sommets, f(0)), puis la lettre choisie ; figure
 * des graphiques annotés (A : f et f′ superposées, droites verticales aux sommets ; B : sommets et
 * point (0 ; f(0)) marqués). Famille C : chaque fonction dérivée (règle écrite, puis simplifiée), la
 * dernière ligne étant l'expression lettrée. SANS `docx` : importé par l'adaptateur ET par `App5gen25.tsx`.
 */

const LETTRES = "ABCDEFGH";

function lettreDe(e: ExerciceAssociation, i: number): string {
  return LETTRES[lettreCorrecte(e.ordreLettres, i)] ?? "?";
}

function signeTxt(v: number): -1 | 0 | 1 {
  if (Math.abs(v) < 1e-9) return 0;
  return v > 0 ? 1 : -1;
}

// ============================================================================
// Familles A et B (graphiques).
// ============================================================================

function lignesGraphe(coeffs: PolynomeAssociation, i: number, lettre: string, famille: "grapheDerivee" | "grapheVerbal"): LigneCalcul[] {
  const forme = formeCubique(coeffs);
  const n = `${i + 1}`;
  const fp = `f_{${n}}'`;
  const lignes: LigneCalcul[] = [];
  if (forme.extremums) {
    const [r1, r2] = forme.extremums;
    const monte = forme.signe > 0;
    lignes.push(ligne(`${fp}${monte ? ">" : "<"}0\\text{ puis }${monte ? "<" : ">"}0\\text{ puis }${monte ? ">" : "<"}0`, `graphique ${n} : la courbe ${monte ? "monte, descend puis remonte" : "descend, monte puis redescend"}`));
    if (famille === "grapheDerivee") {
      lignes.push(ligne(`${fp}(x)=0\\text{ pour }x\\approx ${dixiemeL(r1)}\\text{ et }x\\approx ${dixiemeL(r2)}`, "tangentes horizontales aux deux sommets"));
      lignes.push(ligne(`\\Rightarrow ${fp}\\text{ : graphique }${lettre}`, `${lettre} coupe l'axe des x en ${dixiemeT(r1)} et ${dixiemeT(r2)} : ${monte ? "au-dessus" : "en dessous"} avant et après, ${monte ? "en dessous" : "au-dessus"} entre les deux`));
    } else {
      const xmax = monte ? "x_{\\max}" : "x_{\\min}";
      const xmin = monte ? "x_{\\min}" : "x_{\\max}";
      const s1 = signeTxt(r1);
      const s2 = signeTxt(r2);
      const pos = s1 < 0 && s2 < 0 ? `${xmax}<${xmin}<0` : s1 > 0 && s2 > 0 ? `0<${xmax}<${xmin}` : `${xmax}<0<${xmin}`;
      lignes.push(ligne(pos, `sommets du graphique ${n} (x ≈ ${dixiemeT(r1)} et x ≈ ${dixiemeT(r2)}) par rapport à l'axe des ordonnées`));
    }
  } else {
    const croit = forme.signe > 0;
    lignes.push(ligne(`${fp}${croit ? ">" : "<"}0\\text{ sur tout le graphique}`, `graphique ${n} : la courbe ${croit ? "monte" : "descend"} partout`));
    if (famille === "grapheDerivee") {
      lignes.push(ligne(`${fp}(x)${croit ? "\\geq" : "\\leq"} ${fp}(${dixiemeL(forme.inflexion)})`, `${croit ? "montée" : "descente"} la plus douce au point d'inflexion x ≈ ${dixiemeT(forme.inflexion)}`));
      lignes.push(ligne(`\\Rightarrow ${fp}\\text{ : graphique }${lettre}`, `${lettre} reste ${croit ? "au-dessus" : "en dessous"} de l'axe des x, ${croit ? "minimum" : "maximum"} en x ≈ ${dixiemeT(forme.inflexion)}`));
    } else {
      const s = signeTxt(forme.inflexion);
      lignes.push(ligne(`x_{\\text{PI}}${s < 0 ? "<" : s > 0 ? ">" : "="}0`, `point d'inflexion du graphique ${n} (x ≈ ${dixiemeT(forme.inflexion)}) par rapport à l'axe des ordonnées`));
    }
  }
  if (famille === "grapheVerbal") {
    const s0 = signeTxt(forme.f0);
    lignes.push(ligne(`f_{${n}}(0)${s0 > 0 ? ">" : s0 < 0 ? "<" : "="}0`, s0 > 0 ? "la courbe coupe l'axe des ordonnées au-dessus de l'origine" : s0 < 0 ? "la courbe coupe l'axe des ordonnées en dessous de l'origine" : "la courbe passe par l'origine"));
    lignes.push(ligne(`\\Rightarrow \\text{énoncé }${lettre}`, "le seul énoncé qui dit ces trois choses"));
  }
  return lignes;
}

/** Même cadrage que l'énoncé (fenêtre [−4 ; 4], 15 % de marge). */
function viewBox(fs: ((x: number) => number)[]): ViewBoxSvg {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const fn of fs)
    for (let k = 0; k <= 80; k++) {
      const y = fn(-4 + (8 * k) / 80);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  const marge = Math.max(1, (yMax - yMin) * 0.15);
  return { xMin: -4, xMax: 4, yMin: yMin - marge, yMax: yMax + marge };
}

function figureGraphes(e: ExerciceAssociation & { fonctions: PolynomeAssociation[] }, famille: "grapheDerivee" | "grapheVerbal"): string {
  const svgs = e.fonctions.map((coeffs, i) => {
    const forme = formeCubique(coeffs);
    const fn = (x: number) => evaluerPolynome(coeffs, x);
    const fpn = (x: number) => evaluerPolynome(derivee(coeffs), x);
    const sommets = forme.extremums ?? [];
    const etiquette = `${i + 1} → ${lettreDe(e, i)}`;
    if (famille === "grapheDerivee") {
      return construireSvgFonction(fn, viewBox([fn, fpn]), {
        largeur: 210,
        hauteur: 150,
        classe: "graphe-cyclo",
        lettre: etiquette,
        courbesSecondaires: [{ evaluer: fpn, couleur: "#c2410c", pointilles: true }],
        verticales: sommets.map((x) => ({ x, couleur: "#868e96", pointilles: true })),
        points: sommets.map((x) => ({ x, y: 0, couleur: "#c2410c" })),
      });
    }
    const points = [...sommets.map((x) => ({ x, y: fn(x), couleur: "#9a3b12" })), { x: 0, y: fn(0), couleur: "#2b8a3e", forme: "croix" as const }];
    if (!forme.extremums) points.unshift({ x: forme.inflexion, y: fn(forme.inflexion), couleur: "#9a3b12" });
    return construireSvgFonction(fn, viewBox([fn]), { largeur: 210, hauteur: 150, classe: "graphe-cyclo", lettre: etiquette, points });
  });
  const legende =
    famille === "grapheDerivee"
      ? `<p style="margin:0.2em 0;font-size:0.85em;text-align:center">Trait plein : f ; pointillés orange : f′ (elle s'annule sous chaque sommet de f).</p>`
      : `<p style="margin:0.2em 0;font-size:0.85em;text-align:center">Points : sommets (ou point d'inflexion) ; croix verte : (0 ; f(0)).</p>`;
  return `<div class="figure-corrige-association" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;justify-items:center;margin:0.4em 0;break-inside:avoid">${svgs.join("")}</div>${legende}`;
}

// ============================================================================
// Familles A et B « variées » (lot C, G18) : rationnelles, racines, sinus — lues sur le graphique,
// abscisses entières (nœuds du quadrillage).
// ============================================================================

const nL = (x: number) => `${x}`;
const nT = (x: number) => nombreTexte(x);

/** Graphique papier (énoncé ET corrigé) d'une fonction variée ou de sa dérivée : même cadrage que
 * l'écran (`cadrageVariee`), quadrillage d'une unité en x, courbe coupée à l'asymptote verticale. */
export function svgFonctionVariee(fo: FonctionVarieeAssociation, deriveeDe: boolean, etiquette: string, options: Partial<OptionsSvgFonction> = {}): string {
  const { yMin, yMax } = cadrageVariee(fo, deriveeDe);
  const ev = evaluateurVariee(fo, deriveeDe, yMin, yMax);
  return construireSvgFonction(ev, { xMin: X_MIN_VARIEE, xMax: X_MAX_VARIEE, yMin, yMax }, { largeur: 210, hauteur: 150, classe: "graphe-cyclo", lettre: etiquette, divisionsX: 8, ...options });
}

function evaluateurVariee(fo: FonctionVarieeAssociation, deriveeDe: boolean, yMin: number, yMax: number): (x: number) => number | null {
  const excl = exclusionVariee(fo);
  return (x: number) => {
    if (excl !== null && Math.abs(x - excl) < 0.03) return null;
    if (deriveeDe && fo.type === "racine" && x - fo.p < 0.004) return null;
    const y = deriveeDe ? deriveeVariee(fo, x) : evaluerVariee(fo, x);
    if (y === null || !Number.isFinite(y)) return null;
    return y < yMin - (yMax - yMin) || y > yMax + (yMax - yMin) ? null : y;
  };
}

/** Signe de f′ morceau par morceau (de gauche à droite), coupé à l'asymptote d'une rationnelle. */
function morceauxSigne(fo: FonctionVarieeAssociation): { de: number; a: number; signes: ("+" | "-")[] }[] {
  const ex = extremumsVariee(fo);
  const [d0, d1] = domaineVariee(fo);
  const signes: ("+" | "-")[] = [ex[0].nature === "max" ? "+" : "-"];
  for (const e of ex) signes.push(e.nature === "max" ? "-" : "+");
  if (fo.type === "rationnelle") return [{ de: d0, a: fo.c, signes: signes.slice(0, 2) }, { de: fo.c, a: d1, signes: signes.slice(1) }];
  return [{ de: d0, a: d1, signes }];
}

function texteSignes(signes: ("+" | "-")[]): string {
  return signes.map((s, i) => `${i ? "\\text{ puis }" : ""}${s === "+" ? ">" : "<"}0`).join("");
}

function motsSignes(signes: ("+" | "-")[]): string {
  return signes.map((s) => (s === "+" ? "monte" : "descend")).join(", puis ");
}

function lignesGrapheVariee(fo: FonctionVarieeAssociation, i: number, lettre: string, famille: "grapheDeriveeVariee" | "grapheVerbalVarie"): LigneCalcul[] {
  const n = `${i + 1}`;
  const fp = `f_{${n}}'`;
  const ex = extremumsVariee(fo);
  const lignes: LigneCalcul[] = [];
  const morceaux = morceauxSigne(fo);
  if (fo.type === "racine") lignes.push(ligne(`x\\geq ${nL(fo.p)}`, `graphique ${n} : la courbe commence en x = ${nT(fo.p)} (domaine de f)`));
  if (fo.type === "rationnelle") lignes.push(ligne(`x\\neq ${nL(fo.c)}`, `graphique ${n} : asymptote verticale x = ${nT(fo.c)}, f n'y est pas définie`));
  for (const m of morceaux) {
    const sur = morceaux.length > 1 ? `\\text{ sur }\\left]${nL(m.de)}\\,;${nL(m.a)}\\right[` : "";
    lignes.push(ligne(`${fp}${texteSignes(m.signes)}${sur}`, `${morceaux.length > 1 ? (m.de < (fo.type === "rationnelle" ? fo.c : 0) ? "à gauche de l'asymptote" : "à droite de l'asymptote") : `graphique ${n}`} : la courbe ${motsSignes(m.signes)}`));
  }
  if (famille === "grapheDeriveeVariee") {
    const zeros = ex.map((e) => `x=${nL(e.x)}`).join("\\text{ et }");
    lignes.push(ligne(`${fp}(x)=0\\text{ pour }${zeros}`, ex.length === 2 ? "tangentes horizontales aux deux sommets" : "tangente horizontale au sommet"));
    const coupe = ex.map((e) => nT(e.x)).join(" et ");
    const extra = fo.type === "rationnelle" ? `, coupé en x = ${nT(fo.c)}` : fo.type === "racine" ? `, commence en x = ${nT(fo.p)}` : "";
    lignes.push(ligne(`\\Rightarrow ${fp}\\text{ : graphique }${lettre}`, `${lettre} coupe l'axe des x en ${coupe}${extra}, au-dessus là où f monte, en dessous là où elle descend`));
  } else {
    const nom = (e: { nature: "max" | "min" }) => (e.nature === "max" ? "x_{\\max}" : "x_{\\min}");
    const rel = (x: number) => (x < 0 ? "<" : x > 0 ? ">" : "=");
    const pos =
      ex.length === 1
        ? `${nom(ex[0])}${rel(ex[0].x)}0`
        : ex[0].x < 0 && ex[1].x < 0
          ? `${nom(ex[0])}<${nom(ex[1])}<0`
          : ex[0].x > 0 && ex[1].x > 0
            ? `0<${nom(ex[0])}<${nom(ex[1])}`
            : `${nom(ex[0])}${ex[0].x === 0 ? "=" : "<"}0${ex[1].x === 0 ? "=" : "<"}${nom(ex[1])}`;
    lignes.push(ligne(pos, `sommet${ex.length > 1 ? "s" : ""} du graphique ${n} (x = ${ex.map((e) => nT(e.x)).join(" et x = ")}) par rapport à l'axe des ordonnées`));
    const f0 = evaluerVariee(fo, 0) ?? 0;
    const s0 = Math.abs(f0) < 1e-9 ? 0 : f0 > 0 ? 1 : -1;
    lignes.push(ligne(`f_{${n}}(0)${s0 > 0 ? ">" : s0 < 0 ? "<" : "="}0`, s0 > 0 ? "la courbe coupe l'axe des ordonnées au-dessus de l'origine" : s0 < 0 ? "la courbe coupe l'axe des ordonnées en dessous de l'origine" : "la courbe passe par l'origine"));
    lignes.push(ligne(`\\Rightarrow \\text{énoncé }${lettre}`, "le seul énoncé qui dit toutes ces choses"));
  }
  return lignes;
}

function figureGraphesVariees(e: ExerciceAssociation & { fonctions: FonctionVarieeAssociation[] }, famille: "grapheDeriveeVariee" | "grapheVerbalVarie"): string {
  const svgs = e.fonctions.map((fo, i) => {
    const ex = extremumsVariee(fo);
    const etiquette = `${i + 1} → ${lettreDe(e, i)}`;
    if (famille === "grapheDeriveeVariee") {
      const cf = cadrageVariee(fo, false);
      const cd = cadrageVariee(fo, true);
      const yMin = Math.min(cf.yMin, cd.yMin);
      const yMax = Math.max(cf.yMax, cd.yMax);
      return construireSvgFonction(evaluateurVariee(fo, false, yMin, yMax), { xMin: X_MIN_VARIEE, xMax: X_MAX_VARIEE, yMin, yMax }, {
        largeur: 210,
        hauteur: 150,
        classe: "graphe-cyclo",
        lettre: etiquette,
        divisionsX: 8,
        courbesSecondaires: [{ evaluer: evaluateurVariee(fo, true, yMin, yMax), couleur: "#c2410c", pointilles: true }],
        verticales: ex.map((x) => ({ x: x.x, couleur: "#868e96", pointilles: true })),
        points: ex.map((x) => ({ x: x.x, y: 0, couleur: "#c2410c" })),
      });
    }
    const points = [...ex.map((x) => ({ x: x.x, y: evaluerVariee(fo, x.x) ?? 0, couleur: "#9a3b12" })), { x: 0, y: evaluerVariee(fo, 0) ?? 0, couleur: "#2b8a3e", forme: "croix" as const }];
    return svgFonctionVariee(fo, false, etiquette, { points });
  });
  const legende =
    famille === "grapheDeriveeVariee"
      ? `<p style="margin:0.2em 0;font-size:0.85em;text-align:center">Trait plein : f ; pointillés orange : f′ (elle s'annule sous chaque sommet de f).</p>`
      : `<p style="margin:0.2em 0;font-size:0.85em;text-align:center">Points : sommets ; croix verte : (0 ; f(0)).</p>`;
  return `<div class="figure-corrige-association" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;justify-items:center;margin:0.4em 0;break-inside:avoid">${svgs.join("")}</div>${legende}`;
}

// ============================================================================
// Famille C (symbolique).
// ============================================================================

interface Lin {
  a: number;
  b: number;
  latex: string;
}

function lireLin(l: string): Lin | null {
  const m = monomesDe(l);
  if (!m) return null;
  let a = 0;
  let b = 0;
  for (const x of m) {
    if (x.d === 1) a += x.c;
    else if (x.d === 0) b += x.c;
    else return null;
  }
  return { a, b, latex: l };
}

function nu(l: string): string {
  return l.startsWith("(") && l.endsWith(")") ? l.slice(1, -1) : l;
}

/** Lignes de la dérivée d'une fonction de la famille C (la dernière ligne = expression lettrée). */
function lignesSymbolique(fLatex: string, gLatex: string, i: number, lettre: string): LigneCalcul[] {
  const g = `f_{${i + 1}}'(x)`;
  const fin = ligne(`=${gLatex}`, `on réduit : c'est l'expression ${lettre}`);
  const puissance = /^\(([^()]*)\)\^\{?(\d)\}?$/.exec(fLatex);
  if (puissance) {
    const lin = lireLin(puissance[1]);
    const n = Number(puissance[2]);
    if (lin) {
      const interieur = `(${puissance[1]})`;
      const ext = n === 2 ? `2${interieur}` : `${n}${interieur}^{${n - 1}}`;
      return sansDoublons([ligne(`${g}=${ext}\\cdot ${par(lin.a)}`, jf("règle de la chaîne ", { l: `(u^${n})'=${n}u^{${n - 1}}\\cdot u'` }, `, u′ = ${lin.a < 0 ? "−" + -lin.a : lin.a}`)), fin]);
    }
  }
  const produit = /^(\([^()]*\)|x)(\([^()]*\)|x)$/.exec(fLatex);
  if (produit) {
    const u = lireLin(nu(produit[1]));
    const v = lireLin(nu(produit[2]));
    if (u && v) {
      const U = nu(produit[1]);
      const V = nu(produit[2]);
      const terme1 = V === "x" ? monoX(u.a) : `${u.a === 1 ? "" : u.a === -1 ? "-" : u.a}(${V})`;
      const terme2 = U === "x" ? `x\\cdot ${par(v.a)}` : `(${U})\\cdot ${par(v.a)}`;
      const developpe = somme([monoX(u.a * v.a), `${u.a * v.b}`, monoX(u.a * v.a), `${u.b * v.a}`]);
      return sansDoublons([ligne(`${g}=${terme1}+${terme2}`, jf("dérivée d'un produit ", { l: "(uv)'=u'v+uv'" }, `, u′ = ${dixiemeT(u.a)}, v′ = ${dixiemeT(v.a)}`)), ligne(`=${developpe}`, "on distribue"), fin]);
    }
  }
  // Monôme c·xⁿ (la puissance d'un x seul en fait partie).
  const m = monomesDe(fLatex);
  if (m && m.length === 1) {
    const { c, d } = m[0];
    return sansDoublons([ligne(`${g}=${c === 1 ? `${d}` : c === -1 ? `-${d}` : `${d}\\cdot ${par(c)}`}x${d - 1 === 1 ? "" : `^{${d - 1}}`}`, jf("règle ", { l: "(x^n)'=n\\,x^{n-1}" })), fin]);
  }
  return [ligne(`${g}=${gLatex}`, `expression ${lettre}`)];
}

function monoX(c: number): string {
  if (c === 0) return "";
  return c === 1 ? "x" : c === -1 ? "-x" : `${c}x`;
}

// ============================================================================
// Assemblage.
// ============================================================================

function utiliseFamille(e: ExerciceAssociation): EtapeCorrection {
  switch (e.famille) {
    case "grapheDerivee":
      return utilise("a", [t(`Là où f croît, f′ > 0 (graphique de f′ au-dessus de l'axe des x) ; là où f décroît, f′ < 0 ; en un sommet de f, f′ s'annule en changeant de signe ${COURS_SIGNE}.`)]);
    case "grapheVerbal":
      return utilise("a", [t(`Sur chaque graphique, on lit le sens de variation (signe de f′), la position des sommets — ou du point d'inflexion — par rapport à l'axe des ordonnées, et f(0), là où la courbe coupe cet axe ${COURS_SIGNE}.`)]);
    case "grapheDeriveeVariee":
      return utilise("a", [t(`Là où f croît, f′ > 0 (graphique de f′ au-dessus de l'axe des x) ; là où f décroît, f′ < 0 ; en un sommet de f, f′ s'annule en changeant de signe ; là où f n'est pas définie (asymptote verticale), f′ ne l'est pas non plus ${COURS_SIGNE}.`)]);
    case "grapheVerbalVarie":
      return utilise("a", [t(`Sur chaque graphique, on lit où f est définie (asymptote verticale, début de la courbe), le sens de variation (signe de f′), la position des sommets par rapport à l'axe des ordonnées, et f(0), là où la courbe coupe cet axe ${COURS_SIGNE}.`)]);
    default:
      return utilise("a", [t("On dérive chaque fonction : "), f("(x^n)'=n\\,x^{n-1}"), t(", "), f("(uv)'=u'v+uv'"), t(", et pour une puissance de ax + b la règle de la chaîne "), f("(u^n)'=n\\,u^{n-1}\\cdot u'"), t(` ${COURS_DERIVEE}.`)]);
  }
}

function texteParPiege(e: ExerciceAssociation): string {
  switch (e.famille) {
    case "grapheDerivee":
      return "Le signe de f′ se lit sur la pente de f, pas sur le signe de f : f′ est positive là où f monte, même si f est négative.";
    case "grapheVerbal":
      return "Deux énoncés peuvent décrire les mêmes variations : on les départage par la position des sommets et de f(0).";
    case "grapheDeriveeVariee":
      return "Le signe de f′ se lit sur la pente de f, pas sur le signe de f ; à une asymptote verticale de f, le graphique de f′ est coupé lui aussi.";
    case "grapheVerbalVarie":
      return "Deux énoncés peuvent décrire les mêmes variations : on les départage par l'asymptote ou le début de la courbe, la position des sommets et celle de f(0).";
    default:
      return "Pour une puissance de ax + b, ne pas oublier de multiplier par a (la dérivée de l'intérieure).";
  }
}

const RESUME_SINGULARITE: Record<string, string> = {
  saute: "f'_g(a)\\neq f'_d(a)",
  infini: "|f'(x)|\\to+\\infty",
  discontinue: "f\\text{ non continue en }a",
  existe: "f'(a)\\text{ existe}",
};

/** Lot C : étape « b » — justification de l'association choisie par le générateur (même spécification
 * que l'écran : `moteur5e/justificationAssociation.ts`). */
function etapesJustification(e: ExerciceAssociation): EtapeCorrection[] {
  const spec = specJustification(e);
  const k = spec.item + 1;
  const lettre = e.famille === "grapheDeriveeAvancee" && e.singulier[spec.item] ? null : lettreDe(e, spec.item);
  const lignes: LigneCalcul[] = [];
  const nb = (v: number) => `${Math.round(v * 100) / 100}`.replace(".", "{,}");
  for (const c of spec.champs) {
    if (c.kind === "nombre") lignes.push(ligne(`${c.label}${nb(c.cible)}`, c.groupe === "extremums" ? `sommet du graphique n° ${k} : zéro de f′` : `changement de courbure du graphique n° ${k} : extremum de f′`));
    else if (c.kind === "expression") {
      const g = e.famille === "symbolique" ? e.gLatex[lettreCorrecte(e.ordreLettres, spec.item)] : "";
      lignes.push(ligne(`${c.label}${g}`, "règles de dérivation du cours"));
    } else {
      const o = c.options.find((x) => x.id === c.bonne);
      // Les options « singularité » sont des phrases : la cellule de formule reçoit leur forme courte
      // (le texte KaTeX, insécable, sortait de la chaîne en A4) et la phrase passe à droite.
      const court = RESUME_SINGULARITE[o?.id ?? ""];
      if (court) lignes.push(ligne(court, [...fragmentsRiches5e(c.label), t(` ${o?.label ?? ""}.`)]));
      else lignes.push(ligne(`\\text{${(o?.label ?? "").replace(/′/g, "'")}}`, fragmentsRiches5e(c.label)));
    }
  }
  const conclusion = lettre ? [t("donc "), f(`${k}\\to ${lettre}`), t(".")] : [t("donc "), f(`f_{${k}}'`), t(" n'existe pas en ce point : aucune lettre.")];
  return [
    utilise("b", fragmentsRiches5e(consigneJustificationAssociation(e))),
    calcul("b", lignes, [], "Justification"),
    resultat("b", conclusion),
  ];
}

export function correctionDetailleeAssociation(e: ExerciceAssociation): EtapeCorrection[] {
  if (e.famille === "grapheDeriveeAvancee") {
    const lignes: LigneCalcul[] = e.fonctions.map((fo, i) => {
      if (e.singulier[i]) {
        const car = fo.caracteristique;
        const opt = OPTIONS_SINGULARITE.find((o) => o.id === (car?.type === "angulaire" ? "saute" : car?.type === "cuspide" || car?.type === "tangenteVerticale" ? "infini" : "discontinue"));
        return ligne(`${i + 1}\\to\\ f'\\text{ n'existe pas ici}`, opt ? opt.label : "");
      }
      return ligne(`${i + 1}\\to ${lettreDe(e, i)}`, "pente de f lue sur le graphique : signe de f′ zone par zone");
    });
    return finaliser([
      utilise("a", [t("Là où f monte, f′ > 0 ; là où elle descend, f′ < 0. En un coin, une tangente verticale, un rebroussement, un saut ou un trou, f′ n'existe pas "), t(COURS_DERIVEE), t(".")]),
      calcul("a", lignes, [], "Association"),
      resultat("a", [f(lignes.map((l) => l.latex).join(",\\ "))]),
      ...etapesJustification(e),
    ]);
  }
  const n = nombreElementsAssociation(e);
  const etapes: EtapeCorrection[] = [utiliseFamille(e)];
  for (let i = 0; i < n; i++) {
    const lettre = lettreDe(e, i);
    if (e.famille === "symbolique") {
      const j = lettreCorrecte(e.ordreLettres, i);
      etapes.push(calcul("a", lignesSymbolique(e.fLatex[i], e.gLatex[j], i, lettre), [t("Fonction "), f(`f_{${i + 1}}(x)=${e.fLatex[i]}`)], `${i + 1} → ${lettre}`));
    } else if (e.famille === "grapheDeriveeVariee" || e.famille === "grapheVerbalVarie") {
      etapes.push(calcul("a", lignesGrapheVariee(e.fonctions[i], i, lettre, e.famille), [], `${i + 1} → ${lettre}`));
    } else {
      etapes.push(calcul("a", lignesGraphe(e.fonctions[i], i, lettre, e.famille), [], `${i + 1} → ${lettre}`));
    }
  }
  const correspondance = Array.from({ length: n }, (_, i) => `${i + 1}\\to ${lettreDe(e, i)}`).join(",\\ ");
  const res = resultat("a", [f(correspondance)]);
  const figure = e.famille === "symbolique" ? null : e.famille === "grapheDeriveeVariee" || e.famille === "grapheVerbalVarie" ? figureGraphesVariees(e, e.famille) : figureGraphes(e, e.famille);
  etapes.push(figure === null ? res : { ...res, figureHtml: figure });
  etapes.push(piege("a", [t(texteParPiege(e))]));
  etapes.push(...etapesJustification(e));
  return finaliser(etapes);
}

/** Piège dans les DONNÉES (famille C) : une puissance de ax + b avec a ≠ 1 (facteur a à ne pas oublier). */
export function piegeSymboliqueAssociation(e: ExerciceAssociation): boolean {
  if (e.famille !== "symbolique") return false;
  return e.fLatex.some((l) => {
    const p = /^\(([^()]*)\)\^\{?(\d)\}?$/.exec(l);
    const lin = p ? lireLin(p[1]) : null;
    return !!lin && lin.a !== 1;
  });
}
