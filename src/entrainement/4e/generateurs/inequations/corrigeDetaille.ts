import type { Exercice } from "../../core/generateur.types";
import type { Borne, Enonce, ExerciceInequation, Morceau, SolutionEnsemble, Symbole } from "../../core/inequation.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { enonceSimplifie, facteurCommun, necessiteSimplification } from "../../moteur/simplificationInequation";
import { formatEquationAssocieeLatex, formatInequationLatex, SYMBOLE_LATEX } from "../../ui/formatInequation";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../../ui/formatEquation";
import { q } from "../../ui/corrigeChapitre3";
import {
  categorieTrinome,
  COURS_RESOUDRE,
  COURS_SIGNE,
  lignesDelta,
  lignesFactorisation,
  lignesProduitNul,
  lignesRacinesFormule,
  lignesValeurTrinome,
  NOM_METHODE,
  pgcdListe,
  polynomeTexte,
  rac,
  trinomeDe,
  utiliseDelta,
  utiliseFactorisation,
  finaliserCorrige,
} from "../../ui/corrigeSecondDegre1";

/**
 * Corrigé détaillé « comme au tableau » de gen2 (tableau de signes d'un trinôme, `AppInequation.tsx`)
 * — règle `.claude/rules/feuilles-evaluations.md`. Une étape par écran
 * (`moteur/sessionInequation.ts`) : [simplification] → racines de l'équation associée → signe de a →
 * ensemble des solutions (figure : allure de la parabole et tableau de signes, racines marquées).
 * Après la simplification, tout se fait sur l'inéquation réduite (`exerciceCourant` de l'écran) :
 * l'appli peut donc appeler ce corrigé sur l'exercice courant (`phasesInequation`). Partagé par
 * l'adaptateur papier et l'appli.
 */

export type PhaseInequationCorrige = "simplification" | "racines" | "signe_a" | "intervalle";

/** Écrans de l'exercice, dans l'ordre (la simplification n'existe que si pgcd(|a|,|b|,|c|) > 1). */
export function phasesInequation(instance: ExerciceInequation): PhaseInequationCorrige[] {
  return [...(necessiteSimplification(instance) ? (["simplification"] as const) : []), "racines", "signe_a", "intervalle"];
}

export function lettrePhaseInequation(instance: ExerciceInequation, phase: PhaseInequationCorrige): string {
  return "abcd"[phasesInequation(instance).indexOf(phase)] ?? "a";
}

// ---------------------------------------------------------------------------------------------
// Écritures de l'ensemble des solutions (mêmes que l'adaptateur historique)
// ---------------------------------------------------------------------------------------------

function nombreLatex(valeur: number): string {
  return q(valeur);
}

function borneLatex(borne: Borne): string {
  if (borne === "-inf") return "-\\infty";
  if (borne === "+inf") return "+\\infty";
  return nombreLatex(borne);
}

function morceauLatex(m: Morceau): string {
  // Crochets à la belge : « ] » ouvrant et « [ » fermant marqués \mathopen / \mathclose (sinon KaTeX
  // espace « ]−∞ » comme une soustraction).
  const g = m.crochetGauche === "]" ? "\\mathopen{]}" : "[";
  const d = m.crochetDroit === "[" ? "\\mathclose{[}" : "]";
  return `${g}${borneLatex(m.borneGauche)}\\,;\\,${borneLatex(m.borneDroite)}${d}`;
}

/** Ensemble-solution en LaTeX (accolades littérales, ∅, ℝ, intervalles à la belge). */
export function ensembleLatex(solution: SolutionEnsemble): string {
  switch (solution.forme) {
    case "vide":
      return "\\varnothing";
    case "reel":
      return "\\mathbb{R}";
    case "point":
      return `\\left\\{${nombreLatex(solution.valeur)}\\right\\}`;
    case "reel_sauf_point":
      return `\\mathbb{R}\\setminus\\left\\{${nombreLatex(solution.valeur)}\\right\\}`;
    case "intervalle":
      return morceauLatex(solution.morceau);
    case "union":
      return `${morceauLatex(solution.morceau1)}\\cup${morceauLatex(solution.morceau2)}`;
  }
}

function descriptionSymbole(symbole: Symbole): string {
  switch (symbole) {
    case "<":
      return "strictement négatif";
    case ">":
      return "strictement positif";
    case "≤":
      return "négatif ou nul";
    case "≥":
      return "positif ou nul";
  }
}

const large = (s: Symbole) => s === "≤" || s === "≥";

// ---------------------------------------------------------------------------------------------
// Données de travail (après simplification éventuelle)
// ---------------------------------------------------------------------------------------------

interface Travail {
  enonce: Enonce;
  delta: number;
  racines: number[];
  symbole: Symbole;
  solution: SolutionEnsemble;
}

function travailDe(instance: ExerciceInequation): Travail {
  const enonce = necessiteSimplification(instance) ? enonceSimplifie(instance.enonce) : instance.enonce;
  const delta = enonce.b * enonce.b - 4 * enonce.a * enonce.c;
  const racines = delta < 0 || !instance.racines ? [] : [...new Set([...instance.racines])].sort((x, y) => x - y);
  return { enonce, delta, racines, symbole: instance.symbole, solution: instance.solution };
}

/** Le trinôme vu comme un `Exercice` du chapitre (méthode la plus rapide), pour les briques communes. */
function exerciceTrinome(t: Travail): Exercice {
  const categorie = categorieTrinome(t.enonce.a, t.enonce.b, t.enonce.c);
  const racines: [number, number] = t.racines.length === 2 ? [t.racines[0]!, t.racines[1]!] : t.racines.length === 1 ? [t.racines[0]!, t.racines[0]!] : [NaN, NaN];
  const forme = t.racines.length > 0 ? formatFormeFactoriseeDepuisRacines(t.enonce, racines) : undefined;
  return { categorie, enonce: t.enonce, solution: { racines, racinesExactes: true, ...(forme ? { formeFactorisee: forme } : {}), delta: t.delta }, formeAffichage: "canonique" };
}

// ---------------------------------------------------------------------------------------------
// Figure : allure de la parabole (racines marquées, solutions en gras) + tableau de signes
// ---------------------------------------------------------------------------------------------

const ENCRE = "#1f2933";
const BLEU = "#1971c2";
const POLICE = 'font-family="Arial, sans-serif"';

function texteNombre(v: number): string {
  return q(v).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2").replace(/^-/, "−");
}

/** Texte du trinôme (« −2x² + 3x − 1 »). */
function trinomeTexte(e: Enonce): string {
  return polynomeTexte(formatMembreGauche(e));
}

export function figureSigneTrinome(t: Travail): string {
  const a = t.enonce.a;
  const dir = a > 0 ? 1 : -1;
  const AXE = 60;
  const XC = 170;
  const yv = t.racines.length === 2 ? AXE + dir * 40 : t.racines.length === 1 ? AXE : AXE - dir * 22;
  const yFin = dir > 0 ? 8 : 112;
  const K = Math.abs(yv - yFin) / (95 * 95);
  const y = (x: number) => yv - dir * K * (x - XC) ** 2;
  const pts: string[] = [];
  for (let x = XC - 95; x <= XC + 95; x += 2) pts.push(`${x},${y(x).toFixed(1)}`);
  const ecart = t.racines.length === 2 ? Math.sqrt(Math.abs(yv - AXE) / K) : 0;
  const xr = t.racines.length === 2 ? [XC - ecart, XC + ecart] : t.racines.length === 1 ? [XC] : [];
  // Zones où l'inégalité est vraie (positions sur l'axe), d'après le signe du trinôme.
  const bornes = [20, ...xr, 320];
  const segments: string[] = [];
  const signes: ("+" | "−")[] = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const signe = t.racines.length === 2 && i === 1 ? -dir : dir;
    signes.push(signe > 0 ? "+" : "−");
    const vrai = t.symbole === ">" || t.symbole === "≥" ? signe > 0 : signe < 0;
    if (vrai) segments.push(`<line x1="${bornes[i]}" y1="${AXE}" x2="${bornes[i + 1]}" y2="${AXE}" stroke="${BLEU}" stroke-width="5" stroke-linecap="butt"/>`);
  }
  const points = xr
    .map((x, i) => {
      const plein = large(t.symbole);
      return (
        `<circle cx="${x.toFixed(1)}" cy="${AXE}" r="4.5" fill="${plein ? BLEU : "#ffffff"}" stroke="${BLEU}" stroke-width="2"/>` +
        // Nombre placé du côté où la courbe ne passe pas : sous l'axe et vers l'extérieur si a > 0
        // (courbe au-dessus à l'extérieur des racines), au-dessus si a < 0.
        `<text x="${(x + (xr.length === 2 ? (i === 0 ? -9 : 9) : 0)).toFixed(1)}" y="${a > 0 ? AXE + 18 : AXE - 9}" ${POLICE} font-size="13" fill="${ENCRE}" text-anchor="${xr.length === 2 ? (i === 0 ? "end" : "start") : "middle"}">${texteNombre(t.racines[i]!)}</text>`
      );
    })
    .join("");
  // Tableau de signes.
  const T = 132;
  const H = 28;
  const G = 128;
  const xs = (k: number, n: number) => G + 18 + ((330 - G - 36) * k) / n;
  const nCol = 2 * t.racines.length + 2;
  const tete = ["−∞", ...t.racines.flatMap((r) => ["", texteNombre(r)]), "", "+∞"];
  const ligneSignes = ["", ...t.racines.flatMap((_, i) => [signes[i]!, "0"]), signes[signes.length - 1]!, ""];
  const cellules = (vals: string[], yy: number) =>
    vals
      .map((v, k) => (v === "" ? "" : `<text x="${xs(k, nCol).toFixed(1)}" y="${yy}" ${POLICE} font-size="13" fill="${ENCRE}" text-anchor="middle">${v}</text>`))
      .join("");
  const label = trinomeTexte(t.enonce);
  const contenu =
    `<line x1="14" y1="${AXE}" x2="326" y2="${AXE}" stroke="${ENCRE}" stroke-width="1.2"/>` +
    `<path d="M326 ${AXE} l-7 -4 v8 z" fill="${ENCRE}"/>` +
    `<text x="322" y="${AXE - 8}" ${POLICE} font-size="13" font-style="italic" fill="${ENCRE}">x</text>` +
    segments.join("") +
    `<polyline points="${pts.join(" ")}" fill="none" stroke="${ENCRE}" stroke-width="2"/>` +
    points +
    `<rect x="10" y="${T}" width="320" height="${2 * H}" fill="none" stroke="${ENCRE}" stroke-width="1"/>` +
    `<line x1="10" y1="${T + H}" x2="330" y2="${T + H}" stroke="${ENCRE}" stroke-width="1"/>` +
    `<line x1="${G}" y1="${T}" x2="${G}" y2="${T + 2 * H}" stroke="${ENCRE}" stroke-width="1"/>` +
    `<text x="${(10 + G) / 2}" y="${T + 19}" ${POLICE} font-size="13" font-style="italic" fill="${ENCRE}" text-anchor="middle">x</text>` +
    `<text x="${(10 + G) / 2}" y="${T + H + 19}" ${POLICE} font-size="${label.length > 15 ? 11 : 12.5}" fill="${ENCRE}" text-anchor="middle">${label}</text>` +
    cellules(tete, T + 19) +
    cellules(ligneSignes, T + H + 19);
  const description = `Allure de la parabole et tableau de signes de ${label}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 ${T + 2 * H + 6}" width="340" height="${T + 2 * H + 6}" role="img" aria-label="${description}" class="figure-corrige" style="display:block;margin:6px auto;max-width:100%">${contenu}</svg>`;
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

function etapeSimplification(instance: ExerciceInequation, l: string): EtapeCorrection[] {
  const g = facteurCommun(instance.enonce);
  const reduit = enonceSimplifie(instance.enonce);
  const { a, b, c } = instance.enonce;
  return [
    utilise(l, [texte("Diviser les deux membres d'une inéquation par un même nombre strictement positif ne change ni ses solutions ni le sens de l'inégalité : on divise par le plus grand diviseur commun des coefficients.")]),
    calcul(l, [
      ligne(`\\operatorname{PGCD}(${[a, b, c].filter((v) => v !== 0).map((v) => Math.abs(v)).join("\\,;\\,")})=${pgcdListe([a, b, c])}`, "plus grand diviseur commun des coefficients"),
      ligne(formatInequationLatex(instance.enonce, instance.symbole).replace(/\s+/g, "")),
      ligne(formatInequationLatex(reduit, instance.symbole).replace(/\s+/g, ""), `on divise les deux membres par ${g} > 0 : le sens ne change pas`),
    ]),
    resultat(l, [texte("Inéquation simplifiée : "), latex(formatInequationLatex(reduit, instance.symbole))]),
  ];
}

function etapeRacines(t: Travail, l: string): EtapeCorrection[] {
  const ex = exerciceTrinome(t);
  const tri = trinomeDe(ex);
  const eq = formatEquationAssocieeLatex(t.enonce);
  const usage: FragmentConsigne[] = [
    texte("Les racines de l'équation associée "),
    latex(eq),
    texte(` sont les seules valeurs où le trinôme peut changer de signe ${COURS_SIGNE} ; on la résout par la méthode la plus rapide ${COURS_RESOUDRE} : ${NOM_METHODE[ex.categorie]}.`),
  ];
  const r = t.racines.map((v) => latex(`x=${q(v)}`));
  const res =
    t.racines.length === 0
      ? resultat(l, [texte("Aucune racine réelle : le trinôme ne s'annule jamais.")])
      : t.racines.length === 1
        ? resultat(l, [texte("Une racine double : "), r[0]!])
        : resultat(l, [texte("Deux racines : "), r[0]!, texte(" et "), r[1]!]);
  if (ex.categorie === "cas_general") {
    const lignesD = lignesDelta(tri);
    if (t.delta <= 0) {
      const dernier = lignesD[lignesD.length - 1]!;
      lignesD[lignesD.length - 1] = { ...dernier, justification: t.delta < 0 ? "Δ < 0 : aucune racine réelle" : "Δ = 0 : une racine double" };
      return [utilise(l, [...usage, texte(" "), ...utiliseDelta()]), calcul(l, lignesD, [], "Discriminant"), res];
    }
    const { lignes } = lignesRacinesFormule(tri);
    return [utilise(l, [...usage, texte(" "), ...utiliseDelta()]), calcul(l, lignesD, [], "Discriminant"), calcul(l, lignes, [latex(`\\Delta=${q(t.delta)}>0`), texte(" : deux racines distinctes.")], "Racines"), res];
  }
  if (t.enonce.b === 0 && t.enonce.c === 0) {
    const lignes: LigneCalcul[] = [ligne(`${formatMembreGauche(t.enonce).replace(/\s+/g, "")}=0`)];
    if (t.enonce.a !== 1) lignes.push(ligne("x^2=0", `on divise les deux membres par ${q(t.enonce.a).replace(/^-/, "−")}`));
    lignes.push(ligne("x=0", "un carré est nul si et seulement si sa base est nulle : racine double"));
    return [utilise(l, usage), calcul(l, lignes), res];
  }
  const forme = (ex.solution.formeFactorisee ?? "").replace(/\s+/g, "");
  return [
    utilise(l, [...usage, texte(" "), ...utiliseFactorisation(ex.categorie)]),
    calcul(l, lignesFactorisation(ex, {}, forme), [], "Factorisation"),
    calcul(l, lignesProduitNul(forme), [texte("Produit nul :")], "Racines"),
    res,
  ];
}

function etapeSigneA(t: Travail, l: string): EtapeCorrection[] {
  const a = t.enonce.a;
  return [
    utilise(l, [texte(`Le signe de a, coefficient de x², est le signe du trinôme à l'extérieur des racines (partout s'il n'y a pas de racine) ${COURS_SIGNE}.`)]),
    calcul(l, [ligne(`a=${q(a)}${a > 0 ? ">" : "<"}0`, [texte("coefficient de "), latex("x^2"), texte(" dans "), latex(formatMembreGauche(t.enonce))])]),
    resultat(l, [texte("Signe de a : "), latex(a > 0 ? "a>0" : "a<0")]),
  ];
}

function etapeIntervalle(t: Travail, l: string): EtapeCorrection[] {
  const P = formatMembreGauche(t.enonce).replace(/\s+/g, "");
  const a = t.enonce.a;
  const sym = SYMBOLE_LATEX[t.symbole];
  const signeA = a > 0 ? ">" : "<";
  const oppose = a > 0 ? "<" : ">";
  const motA = a > 0 ? "positif" : "négatif";
  const tri = trinomeDe(exerciceTrinome(t));
  const lignes: LigneCalcul[] = [];
  let piegeTexte: FragmentConsigne[];
  let test: number;
  const [r1, r2] = t.racines;
  if (t.racines.length === 2) {
    lignes.push(ligne(`${P}${signeA}0`, [texte("pour "), latex(`x<${q(r1!)}`), texte(" et pour "), latex(`x>${q(r2!)}`), texte(` : signe de a à l'extérieur des racines`)]));
    lignes.push(ligne(`${P}${oppose}0`, [texte("pour "), latex(`${q(r1!)}<x<${q(r2!)}`), texte(" : signe opposé entre les racines")]));
    lignes.push(ligne(`${P}=0`, [texte("en "), latex(`x=${q(r1!)}`), texte(" et en "), latex(`x=${q(r2!)}`)]));
    const exterieur = (t.symbole === ">" || t.symbole === "≥") === a > 0;
    const inclus = large(t.symbole);
    const cond = exterieur
      ? `x${inclus ? "\\leq" : "<"}${q(r1!)}\\ \\text{ou}\\ x${inclus ? "\\geq" : ">"}${q(r2!)}`
      : `${q(r1!)}${inclus ? "\\leq " : "<"}x${inclus ? "\\leq" : "<"}${q(r2!)}`;
    lignes.push(ligne(cond, `${exterieur ? "à l'extérieur des racines" : "entre les racines"}, ${inclus ? "racines comprises (inégalité large)" : "racines exclues (inégalité stricte)"}`));
    piegeTexte = inclus ? [texte("Inégalité large : les racines font partie de l'ensemble des solutions (crochets fermés).")] : [texte("Inégalité stricte : les racines sont exclues (crochets ouverts).")];
    test = r2! - r1! >= 2 ? r1! + 1 : r2! + 1;
  } else if (t.racines.length === 1) {
    lignes.push(ligne(`${P}=0`, [texte("seulement en "), latex(`x=${q(r1!)}`), texte(" (racine double)")]));
    lignes.push(ligne(`${P}${signeA}0`, [texte("pour tout "), latex(`x\\neq ${q(r1!)}`), texte(` : signe de a, le trinôme ne change pas de signe`)]));
    const sol = t.solution.forme;
    if (sol === "reel") lignes.push(ligne("x\\in\\mathbb{R}", [texte(`le trinôme est ${motA} ou nul pour tout réel x : l'inégalité est toujours vraie`)]));
    else if (sol === "vide") lignes.push(ligne(`${P}${sym}0`, [texte(`vrai pour aucun réel x : le trinôme est ${motA} ou nul`)]));
    else if (sol === "point") lignes.push(ligne(`x=${q(r1!)}`, [texte("seule valeur qui convient : le trinôme y est nul")]));
    else lignes.push(ligne(`x\\neq ${q(r1!)}`, [texte(`le trinôme est ${descriptionSymbole(t.symbole)} partout sauf en sa racine, où il est nul`)]));
    piegeTexte = [texte("Racine double : le trinôme ne change pas de signe. Avec une inégalité large, la racine elle-même est solution ; avec une inégalité stricte, elle est exclue.")];
    test = r1! + 1;
  } else {
    lignes.push(ligne(`${P}${signeA}0`, [texte("pour tout réel x : sans racine, le trinôme garde le signe de a")]));
    if (t.solution.forme === "reel") lignes.push(ligne("x\\in\\mathbb{R}", [texte("l'inégalité "), latex(`${P}${sym}0`), texte(" est vraie pour tout réel x")]));
    else lignes.push(ligne(`${P}${sym}0`, [texte(`vrai pour aucun réel x : le trinôme est toujours ${motA}`)]));
    piegeTexte = [texte("Δ < 0 ne veut pas dire « pas de solution » : selon le signe de a et le symbole, S est ℝ tout entier ou vide.")];
    test = 0;
  }
  const v = tri.a * test * test + tri.b.c * test + tri.c;
  const zone = t.racines.length === 2 && test < r2! ? "entre les racines" : t.racines.length === 0 ? "sans racine" : "à l'extérieur des racines";
  return [
    utilise(l, [texte(`Signe du trinôme ${COURS_SIGNE} : avec deux racines, signe de a à l'extérieur des racines et signe opposé entre elles ; avec une racine double, signe de a sauf en la racine (nul) ; sans racine, toujours le signe de a. On garde les x pour lesquels le trinôme est ${descriptionSymbole(t.symbole)}.`)]),
    { ...calcul(l, lignes, [texte("Lecture du tableau de signes :")]), figureHtml: figureSigneTrinome(t) },
    resultat(l, [latex(`S=${ensembleLatex(t.solution)}`)]),
    verification(l, [texte("Valeur test "), latex(`x=${q(test)}`), texte(` (${zone}) :`)], lignesValeurTrinome(tri, rac(test), `${v > 0 ? "positif" : "négatif"}, comme le dit le tableau de signes ✓`)),
    piege(l, piegeTexte),
  ];
}

export function correctionDetailleeInequations(instance: ExerciceInequation): EtapeCorrection[] {
  return finaliserCorrige(correctionDetailleeInequationsBrut(instance));
}

function correctionDetailleeInequationsBrut(instance: ExerciceInequation): EtapeCorrection[] {
  const t = travailDe(instance);
  return phasesInequation(instance).flatMap((phase) => {
    const l = lettrePhaseInequation(instance, phase);
    switch (phase) {
      case "simplification":
        return etapeSimplification(instance, l);
      case "racines":
        return etapeRacines(t, l);
      case "signe_a":
        return etapeSigneA(t, l);
      case "intervalle":
        return etapeIntervalle(t, l);
    }
  });
}

/** Consigne de chaque écran (titres « Étape n — … » du corrigé). */
export function consigneEtapeInequation(instance: ExerciceInequation, phase: PhaseInequationCorrige): FragmentConsigne[] {
  const t = travailDe(instance);
  switch (phase) {
    case "simplification":
      return [texte("Simplifie l'inéquation au maximum (coefficients entiers, sans facteur commun).")];
    case "racines":
      return [texte("Résous l'équation associée "), latex(formatEquationAssocieeLatex(t.enonce)), texte(".")];
    case "signe_a":
      return [texte("Donne le signe de a.")];
    case "intervalle":
      return [texte("Donne l'ensemble des solutions de l'inéquation.")];
  }
}
