import type { EnsembleReelGuide } from "../../core5e/domaineDefinition.types";
import type { CompositionDirigee, ConditionSurG, DonneeFonction, ExerciceComposerFonctions, FonctionComposable } from "../../core5e/composerFonctions.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import { ordreComplet, type PhaseComposerFonctions } from "../../moteur5e/typesComposerFonctions";
import { formatPolynomeLatex } from "../domaineDefinition/polynome";
import { formatConditionLatex, formatTermesConditionsLatex } from "../../ui5e/formatComposerFonctions";
import { formatEnsembleReelLatex } from "../../ui5e/formatDomaineDefinition";
import { finaliserCorrige, sansDoublons } from "../../ui5e/corrigeTrigonometrie1";
import {
  COURS_COMPOSER,
  ensembleDepuisPredicat,
  etudeTrinome,
  ensFacteur,
  etListe,
  jf,
  lignesCondition,
  lignesPremierDegre,
  nb,
  polyQLatex,
  racinesReelles,
  relLatex,
  t,
  f,
  valeurPoly,
  type Fragments,
  type Rel,
} from "../../ui5e/corrigeFonctions1";
import { conditionsExterieurSurG } from "./composition";
import { intersecterEnsembles } from "./intervalles";

/**
 * Corrigé détaillé « comme au tableau » de 5gen3 (composer f et g : expression et domaine) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN, dans l'ordre du moteur
 * (`ordreComplet`) : par composée, « formule », puis (intérieure à racine) « conditions », « c1 »,
 * « c2 », puis « domaine ».
 * - Expression : définition f(g(x)), substitution « x → g(x) », puis chaque partie affine a·g(x) + b
 *   calculée À PART (même dénominateur, développement : une substitution trop longue se coupe),
 *   assemblage, simplification jusqu'à la forme de l'écran (`dir.latex`).
 * - Domaine : double condition écrite ligne à ligne — x ∈ dom(intérieure) ; intérieure(x) ∈
 *   dom(extérieure), résolue en chaîne « ⟺ » (quotient par tableau de signes, racine élevée au
 *   carré, racine sur fraction zone par zone selon le signe du dénominateur) ; intersection.
 * « Résultat » = la réponse de l'écran (`dir.latex`, `formatTermesConditionsLatex`,
 * `dir.interieure.domaine`, `dir.domaineApresCarre`, `dir.domaine`). SANS `docx` : importé par
 * l'adaptateur ET par `App5gen3.tsx`.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const P = formatPolynomeLatex;
type Lin = number[]; // [b, a]

export function lettrePhaseComposer(e: ExerciceComposerFonctions, phase: PhaseComposerFonctions): string {
  return LETTRES[ordreComplet(e).indexOf(phase)] ?? "a";
}

/** Facteur entre parenthèses, sauf la variable seule (« 3x », jamais « 3(x) »). */
const grp = (v: string | number): string => (v === "x" ? "x" : `(${v})`);

const nomExt = (dir: CompositionDirigee): "f" | "g" => (dir.nomInterieure === "f" ? "g" : "f");
const ens = (e: EnsembleReelGuide) => formatEnsembleReelLatex(e);
const sansEspaces = (s: string) => s.replace(/\s+/g, "").replace(/\\left|\\right/g, "");

export function composeeLatex(dir: CompositionDirigee): string {
  return `(${nomExt(dir)}\\circ ${dir.nomInterieure})(x)`;
}

/** « \dfrac{-8}{…} » → « −\dfrac{8}{…} » (numérateur à un seul terme). */
export function signeDevantFraction(l: string): string {
  return l.replace(/\+\s*\\dfrac\{-([^{}+-]+)\}/g, "-\\dfrac{$1}").replace(/\\dfrac\{-([^{}+-]+)\}/g, "-\\dfrac{$1}");
}

/** Réponse de l'écran « formule ». */
export function expressionLatex(dir: CompositionDirigee): string {
  return `${composeeLatex(dir)}=${signeDevantFraction(dir.latex)}`;
}

// ============================================================================
// Outils : fonctions composables.
// ============================================================================

function valeur(fn: FonctionComposable, x: number): number | null {
  if (fn.type === "rationnelle") {
    const d = valeurPoly(fn.denominateur, x);
    return Math.abs(d) < 1e-12 ? null : valeurPoly(fn.numerateur, x) / d;
  }
  if (fn.type === "irrationnelleSimple") {
    const r = valeurPoly(fn.radicande, x);
    return r < -1e-12 ? null : Math.sqrt(Math.max(0, r));
  }
  if (fn.type === "racineSurFraction") {
    const r = valeurPoly(fn.radicande, x);
    const d = valeurPoly(fn.denominateur, x);
    return r < -1e-12 || Math.abs(d) < 1e-12 ? null : Math.sqrt(Math.max(0, r)) / d;
  }
  const n = valeurPoly(fn.numerateur, x);
  const d = valeurPoly(fn.denominateur, x);
  if (Math.abs(d) < 1e-12 || n / d < -1e-12) return null;
  return Math.sqrt(Math.max(0, n / d));
}

function comparer(v: number, rel: Rel, s: number): boolean {
  const e = 1e-9;
  switch (rel) {
    case "≥":
      return v >= s - e;
    case ">":
      return v > s + e;
    case "≤":
      return v <= s + e;
    case "<":
      return v < s - e;
    case "≠":
      return Math.abs(v - s) > e;
    case "=":
      return Math.abs(v - s) <= e;
  }
}

const REL_DE: Record<ConditionSurG["comparateur"], Rel> = { eq: "=", ne: "≠", ge: "≥", gt: ">", le: "≤", lt: "<" };

/** Parties affines (a·X + b) de l'extérieure, avec leur rôle. */
function partiesAffines(fn: FonctionComposable): Lin[] {
  if (fn.type === "rationnelle") return [fn.denominateur];
  if (fn.type === "irrationnelleSimple") return [fn.radicande];
  if (fn.type === "racineSurFraction") return [fn.radicande, fn.denominateur];
  return [fn.numerateur, fn.denominateur];
}

/** « 4g(x) - 6 » : la partie affine écrite avec l'argument `arg` (comme `corpsLatex` où x → arg). */
function affineAvec(p: Lin, arg: string): string {
  return P(p).replace(/x/g, arg);
}

/** Corps de l'extérieure avec x remplacé par `arg` (mêmes règles que l'aide de l'écran). */
function corpsAvec(fn: DonneeFonction, arg: string): string {
  return fn.corpsLatex.replace(/x/g, arg);
}

/** Interne avec dénominateur : numérateur (constante ou racine) et dénominateur (droite). */
function fractionInterieure(fn: FonctionComposable): { k: number | null; racine: string | null; den: Lin } | null {
  if (fn.type === "rationnelle") return { k: fn.numerateur[0] ?? 0, racine: null, den: fn.denominateur };
  if (fn.type === "racineSurFraction") return { k: null, racine: `\\sqrt{${P(fn.radicande)}}`, den: fn.denominateur };
  return null;
}

/** a·N + b·D (N constante k ou racine) développé : « 4x - 20 - 4\sqrt{2-2x} » écrit « -4\sqrt{…} + 4x - 20 ». */
function numerateurCombine(a: number, b: number, fr: { k: number | null; racine: string | null; den: Lin }): { brut: string; developpe: string } {
  const D = P(fr.den);
  const bD = b === 0 ? "" : `${b < 0 ? "-" : "+"}${Math.abs(b) === 1 ? "" : Math.abs(b)}${grp(D)}`;
  const bDdev = fr.den.map((c) => b * c);
  if (fr.k !== null) {
    const aN = a * fr.k;
    const developpe = polyQLatex([bDdev[0]! + aN, bDdev[1]!]);
    return { brut: `${aN}${bD}`, developpe };
  }
  const aN = a === 1 ? fr.racine! : a === -1 ? `-${fr.racine}` : `${a}${fr.racine}`;
  if (b === 0) return { brut: aN, developpe: aN };
  const s = polyQLatex(bDdev);
  return { brut: `${aN}${bD}`, developpe: s.startsWith("-") ? `${aN} - ${s.slice(1)}` : `${aN} + ${s}` };
}

// ============================================================================
// Étape « formule ».
// ============================================================================

function etapeFormule(dir: CompositionDirigee, l: string): EtapeCorrection[] {
  const ext = nomExt(dir);
  const int = dir.nomInterieure;
  const gx = `${int}(x)`;
  const gxLatex = `${int}(x)`;
  const enG = corpsAvec(dir.exterieure, gxLatex);
  const debut: LigneCalcul[] = [
    ligne(`${composeeLatex(dir)}=${ext}\\big(${gx}\\big)`, "définition de la composée"),
    ligne(`=${enG}`, jf("dans ", { l: `${ext}(x)` }, ", on remplace chaque x par ", { l: gx })),
  ];
  const ref = signeDevantFraction(dir.latex);
  const blocs: EtapeCorrection[] = [];
  const fr = fractionInterieure(dir.interieure.fonction);
  if (fr === null) {
    // Intérieure sans dénominateur (racine) : la substitution donne directement l'expression.
    const subst = corpsAvec(dir.exterieure, dir.interieure.corpsLatex);
    const lignes = sansDoublons([...debut, ligne(`=${subst}`, jf("on remplace ", { l: gx }, " par son expression"))]);
    if (sansEspaces(subst) !== sansEspaces(ref)) lignes.push(ligne(`=${ref}`, "on simplifie l'écriture"));
    blocs.push(calcul(l, lignes));
  } else {
    blocs.push(calcul(l, debut));
    const D = P(fr.den);
    const N = fr.k !== null ? `${fr.k}` : fr.racine!;
    const gFrac = `\\dfrac{${N}}{${D}}`;
    const parties = partiesAffines(dir.exterieure.fonction);
    const combines = parties.map((p) => {
      const [b, a] = [p[0] ?? 0, p[1] ?? 0];
      const c = numerateurCombine(a, b, fr);
      const facteur = a === 1 ? "" : a === -1 ? "-" : `${a}\\cdot `;
      const lignes = sansDoublons([
        ligne(`${affineAvec(p, gxLatex)}=${facteur}${gFrac}${b === 0 ? "" : b > 0 ? `+${b}` : `${b}`}`, jf("on remplace ", { l: gx })),
        ...(b === 0 ? [] : [ligne(`=\\dfrac{${c.brut}}{${D}}`, "on réduit au même dénominateur")]),
        ...(c.brut !== c.developpe || b === 0 ? [ligne(`=\\dfrac{${c.developpe}}{${D}}`, b === 0 ? "on calcule le numérateur" : "on développe")] : []),
      ]);
      return { p, frac: `\\dfrac{${c.developpe}}{${D}}`, num: c.developpe, lignes };
    });
    const vus = new Set<string>();
    combines.forEach((c) => {
      const cle = P(c.p);
      if (vus.has(cle)) return;
      vus.add(cle);
      blocs.push(calcul(l, c.lignes, [], "À part"));
    });
    // Assemblage selon la famille de l'extérieure.
    const e = dir.exterieure.fonction;
    const assemble: LigneCalcul[] = [];
    if (e.type === "rationnelle") {
      const ke = e.numerateur[0] ?? 0;
      const numDev = polyQLatex(fr.den.map((c) => c * ke));
      assemble.push(ligne(`${composeeLatex(dir)}=\\dfrac{${ke}}{${combines[0]!.frac}}`, "on remplace la partie calculée"));
      const frac = (a: string, b: string) => (b === "1" ? a : `\\dfrac{${a}}{${b}}`);
      assemble.push(ligne(`=${frac(ke === 1 ? D : `${ke}${grp(D)}`, combines[0]!.num)}`, "diviser par une fraction, c'est multiplier par son inverse"));
      if (ke !== 1) assemble.push(ligne(`=${frac(numDev, combines[0]!.num)}`, "on développe"));
    } else if (e.type === "irrationnelleSimple") {
      assemble.push(ligne(`${composeeLatex(dir)}=\\sqrt{${combines[0]!.frac}}`, "on remplace la partie calculée"));
    } else if (e.type === "racineSurFraction") {
      assemble.push(ligne(`${composeeLatex(dir)}=\\dfrac{\\sqrt{${combines[0]!.frac}}}{${combines[1]!.frac}}`, "on remplace les parties calculées"));
      assemble.push(ligne(`=\\dfrac{${grp(D)}\\sqrt{${combines[0]!.frac}}}{${combines[1]!.num}}`, "diviser par une fraction, c'est multiplier par son inverse"));
    } else {
      assemble.push(ligne(`${composeeLatex(dir)}=\\sqrt{\\dfrac{${combines[0]!.frac}}{${combines[1]!.frac}}}`, "on remplace les parties calculées"));
      assemble.push(ligne(`=\\sqrt{\\dfrac{${combines[0]!.num}}{${combines[1]!.num}}}`, jf("on simplifie par ", { l: D })));
    }
    if (sansEspaces(assemble[assemble.length - 1]!.latex.replace(/^.*?=/, "")) !== sansEspaces(ref)) assemble.push(ligne(`=${ref}`, "on simplifie (forme de l'écran)"));
    blocs.push(calcul(l, assemble, [], "Assemblage"));
  }
  return [
    utilise(l, [f(`${composeeLatex(dir)}=${ext}\\big(${gx}\\big)`), t(" : dans "), f(`${ext}(x)`), t(", on remplace chaque "), f("x"), t(" par l'expression de "), f(gx), t(`, puis on simplifie ${COURS_COMPOSER}.`)]),
    ...blocs,
    resultat(l, [f(expressionLatex(dir))]),
    piege(l, [t("Ne pas confondre "), f(`${ext}\\big(${int}(x)\\big)`), t(" et "), f(`${int}\\big(${ext}(x)\\big)`), t(" : la fonction écrite à droite ("), f(int), t(") est appliquée en premier.")]),
  ];
}

// ============================================================================
// Domaine d'une fonction composable (conditions d'existence résolues).
// ============================================================================

interface Bloc {
  intro: Fragments;
  lignes: LigneCalcul[];
  label?: string;
}

/** Quotient (num/den) REL 0, num de degré ≤ 1, den du 1er degré : racines puis tableau de signes. */
function quotientSigne(num: number[], den: Lin, numLatex: string, denLatex: string, rel: Rel): { blocs: Bloc[]; ensemble: EnsembleReelGuide } {
  const blocs: Bloc[] = [];
  const rN = racinesReelles(num);
  const rD = racinesReelles(den);
  const racinesLignes: LigneCalcul[] = [];
  if (rN.length) racinesLignes.push(...lignesCondition(num, numLatex, "=", "le numérateur s'annule").lignes);
  racinesLignes.push(...lignesCondition(den, denLatex, "=", "le dénominateur s'annule : valeur exclue").lignes);
  blocs.push({ intro: [t("Valeurs remarquables :")], lignes: racinesLignes });
  const pred = (x: number): boolean | null => {
    const d = valeurPoly(den, x);
    if (Math.abs(d) < 1e-12) return null;
    return comparer(valeurPoly(num, x) / d, rel, 0);
  };
  const ensemble = ensembleDepuisPredicat(pred, [...rN, ...rD]);
  const j = rN.length
    ? jf("tableau de signes : le numérateur s'annule en ", { l: nb(rN[0]!) }, rel === "≥" || rel === "≤" ? " (inclus)" : " (exclu)", ", le dénominateur en ", { l: nb(rD[0]!) }, " (exclu)")
    : jf("numérateur constant : le signe du quotient est celui du dénominateur, nul en ", { l: nb(rD[0]!) }, " (exclu)");
  blocs.push({ intro: [], lignes: [ligne(`\\dfrac{${numLatex}}{${denLatex}}${relLatex(rel)} 0\\iff x\\in ${ens(ensemble)}`, j)] });
  return { blocs, ensemble };
}

/** Conditions d'existence d'une fonction composable résolues : blocs de calcul + domaine. */
function domaineFonction(d: DonneeFonction, nom: string): { blocs: Bloc[]; ensemble: EnsembleReelGuide } {
  const fn = d.fonction;
  if (fn.type === "rationnelle") {
    const r = lignesCondition(fn.denominateur, P(fn.denominateur), "≠", "dénominateur non nul");
    return { blocs: [{ intro: [], lignes: [...r.lignes, ligne(`\\operatorname{dom}${nom}=${ens(d.domaine)}`)] }], ensemble: d.domaine };
  }
  if (fn.type === "irrationnelleSimple") {
    const r = lignesCondition(fn.radicande, P(fn.radicande), "≥", "radicande positif ou nul");
    return { blocs: [{ intro: [], lignes: [...r.lignes, ligne(`\\operatorname{dom}${nom}=${ens(d.domaine)}`)] }], ensemble: d.domaine };
  }
  if (fn.type === "racineSurFraction") {
    const r1 = lignesCondition(fn.radicande, P(fn.radicande), "≥", "radicande positif ou nul");
    const r2 = lignesCondition(fn.denominateur, P(fn.denominateur), "≠", "dénominateur non nul");
    const inter = [ligne(`\\operatorname{dom}${nom}=${ensFacteur(r1.ensemble)}\\cap${ensFacteur(r2.ensemble)}`, "les deux conditions à la fois"), ligne(`=${ens(d.domaine)}`)];
    return { blocs: [{ intro: [], lignes: r1.lignes, label: "Radicande" }, { intro: [], lignes: r2.lignes, label: "Dénominateur" }, { intro: [], lignes: sansDoublons(inter) }], ensemble: d.domaine };
  }
  const q = quotientSigne(fn.numerateur, fn.denominateur, P(fn.numerateur), P(fn.denominateur), "≥");
  return {
    blocs: [
      { intro: [t("Le quotient sous la racine doit être positif ou nul (son dénominateur, non nul) :")], lignes: q.blocs[0]!.lignes },
      { intro: [], lignes: [...q.blocs[1]!.lignes, ligne(`\\operatorname{dom}${nom}=${ens(d.domaine)}`)] },
    ],
    ensemble: d.domaine,
  };
}

// ============================================================================
// Condition « intérieure(x) REL s », résolue ligne à ligne.
// ============================================================================

/**
 * « N/D REL s » ramené à « num/D REL 0 », numérateur à coefficients ENTIERS : on passe s dans le
 * premier membre, même dénominateur (q·D si s = p/q), on développe, puis on multiplie par q > 0.
 * `N` : numérateur (constante k ou droite), écrit `Nlatex`.
 */
function lignesMoinsSeuil(Nlatex: string, Np: number[], Dlatex: string, Dp: Lin, s: number, rel: Rel, gauche: string): { lignes: LigneCalcul[]; num: number[] } {
  const R = relLatex(rel);
  const qd = denominateurCommun(Math.abs(s));
  const p = Math.round(s * qd);
  const terme = (c: number, x: string) => `${c > 0 ? "-" : "+"}${Math.abs(c) === 1 ? "" : Math.abs(c)}${grp(x)}`;
  const num = [qd * (Np[0] ?? 0) - p * (Dp[0] ?? 0), qd * (Np[1] ?? 0) - p * (Dp[1] ?? 0)];
  const numLatex = polyQLatex(num);
  const lignes: LigneCalcul[] = [ligne(`\\iff ${gauche}${s > 0 ? "-" : "+"}${nb(Math.abs(s))}${R} 0`, "on passe tout dans le premier membre")];
  const constant = Np.length < 2 || Math.abs(Np[1] ?? 0) < 1e-12;
  if (qd === 1) {
    lignes.push(ligne(`\\iff \\dfrac{${Nlatex}${terme(p, Dlatex)}}{${Dlatex}}${R} 0`, "on réduit au même dénominateur"));
    lignes.push(ligne(`\\iff \\dfrac{${numLatex}}{${Dlatex}}${R} 0`, "on développe le numérateur"));
  } else {
    const qN = constant ? `${qd * (Np[0] ?? 0)}` : `${qd}${grp(Nlatex)}`;
    lignes.push(ligne(`\\iff \\dfrac{${qN}${terme(p, Dlatex)}}{${qd}${grp(Dlatex)}}${R} 0`, jf("on réduit au même dénominateur ", { l: `${qd}${grp(Dlatex)}` })));
    lignes.push(ligne(`\\iff \\dfrac{${numLatex}}{${qd}${grp(Dlatex)}}${R} 0`, "on développe le numérateur"));
    lignes.push(ligne(`\\iff \\dfrac{${numLatex}}{${Dlatex}}${R} 0`, jf("on multiplie par ", { l: `${qd}` }, ", positif : le sens ne change pas")));
  }
  return { lignes, num };
}

function conditionSurInterieure(dir: CompositionDirigee, c: ConditionSurG): { blocs: Bloc[]; ensemble: EnsembleReelGuide; facteur?: string } {
  const fn = dir.interieure.fonction;
  const rel = REL_DE[c.comparateur];
  const s = c.seuil;
  const cond = formatConditionLatex(dir, c).replace(/\s+/g, " ");
  const S = nb(s);
  const blocs: Bloc[] = [];
  let ensemble: EnsembleReelGuide;
  if (fn.type === "rationnelle") {
    const k = fn.numerateur[0] ?? 0;
    const D = P(fn.denominateur);
    const [d0, c1] = [fn.denominateur[0] ?? 0, fn.denominateur[1] ?? 0];
    const lignes: LigneCalcul[] = [ligne(cond), ligne(`\\iff \\dfrac{${k}}{${D}}${relLatex(rel)} ${S}`, "on remplace par l'expression")];
    if (rel === "≠" || rel === "=") {
      if (s === 0) {
        lignes.push(ligne(`\\iff ${D}\\neq 0`, "un quotient de numérateur non nul n'est jamais nul"));
        const r = lignesPremierDegre(c1, d0, "≠");
        lignes.push(...r.lignes);
        ensemble = { forme: "prive_points", points: [r.borne], morceaux: [] };
      } else {
        lignes.push(ligne(`\\iff ${D}${relLatex(rel)} ${nb(k / s)}`, "les deux membres sont non nuls : on prend les inverses"));
        const r = lignesPremierDegre(c1, d0, rel, k / s);
        lignes.push(...r.lignes);
        ensemble = rel === "≠" ? { forme: "prive_points", points: [r.borne], morceaux: [] } : { forme: "intervalles", points: [], morceaux: [{ inf: r.borne, sup: r.borne, infInclus: true, supInclus: true }] };
      }
      blocs.push({ intro: [], lignes });
      return { blocs, ensemble };
    }
    let num = [k, 0];
    if (s !== 0) {
      const m = lignesMoinsSeuil(`${k}`, [k], D, fn.denominateur, s, rel, `\\dfrac{${k}}{${D}}`);
      lignes.push(...m.lignes);
      num = m.num;
    }
    const numLatex = polyQLatex(num);
    blocs.push({ intro: [], lignes: sansDoublons(lignes) });
    const q = quotientSigne(num, fn.denominateur, numLatex, D, rel);
    blocs.push(...q.blocs);
    return { blocs, ensemble: q.ensemble };
  }
  if (fn.type === "irrationnelleSimple") {
    const U = P(fn.radicande);
    const [b, a] = [fn.radicande[0] ?? 0, fn.radicande[1] ?? 0];
    const lignes: LigneCalcul[] = [
      ligne(cond),
      ligne(`\\iff \\sqrt{${U}}${relLatex(rel)} ${S}`, "on remplace par l'expression"),
      ligne(`\\iff ${U}${relLatex(rel)} ${nb(s * s)}`, jf("les deux membres sont positifs : on élève au carré (", { l: `${carre(s)}=${nb(s * s)}` }, ")")),
    ];
    const r = lignesPremierDegre(a, b, rel, s * s);
    lignes.push(...r.lignes);
    const pred = (x: number) => comparer(valeurPoly(fn.radicande, x), rel, s * s);
    ensemble = ensembleDepuisPredicat(pred, [r.borne]);
    if (rel !== "≠") lignes.push(ligne(`\\iff x\\in ${ens(ensemble)}`));
    blocs.push({ intro: [], lignes });
    return { blocs, ensemble };
  }
  if (fn.type === "fractionSousRacine") {
    const N = P(fn.numerateur);
    const D = P(fn.denominateur);
    const s2 = s * s;
    const lignes: LigneCalcul[] = [
      ligne(cond),
      ligne(`\\iff \\sqrt{\\dfrac{${N}}{${D}}}${relLatex(rel)} ${S}`, "on remplace par l'expression"),
      ligne(`\\iff \\dfrac{${N}}{${D}}${relLatex(rel)} ${nb(s2)}`, jf("les deux membres sont positifs : on élève au carré (", { l: `${carre(s)}=${nb(s2)}` }, ")")),
    ];
    if (rel === "≠") {
      // N/D ≠ p/q ⟺ q·N ≠ p·D (D non nul) : coefficients entiers.
      const qd = denominateurCommun(s2);
      const p = Math.round(s2 * qd);
      const num = [qd * (fn.numerateur[0] ?? 0) - p * (fn.denominateur[0] ?? 0), qd * (fn.numerateur[1] ?? 0) - p * (fn.denominateur[1] ?? 0)];
      lignes.push(ligne(`\\iff ${qd === 1 ? "" : qd}${qd === 1 ? N : `${grp(N)}`}\\neq ${p === 1 ? "" : p}${grp(D)}`, qd === 1 ? "on multiplie par le dénominateur, non nul" : jf("on multiplie par ", { l: `${qd}${grp(D)}` }, ", non nul")));
      lignes.push(ligne(`\\iff ${polyQLatex(num)}\\neq 0`, "on développe et on regroupe"));
      const r = lignesPremierDegre(num[1]!, num[0]!, "≠");
      lignes.push(...r.lignes);
      blocs.push({ intro: [], lignes: sansDoublons(lignes) });
      return { blocs, ensemble: { forme: "prive_points", points: [r.borne], morceaux: [] } };
    }
    const m = lignesMoinsSeuil(N, fn.numerateur, D, fn.denominateur, s2, rel, `\\dfrac{${N}}{${D}}`);
    lignes.push(...m.lignes);
    const numI = m.num;
    blocs.push({ intro: [], lignes: sansDoublons(lignes) });
    const q = quotientSigne(numI, fn.denominateur, polyQLatex(numI), D, rel);
    blocs.push(...q.blocs);
    return { blocs, ensemble: q.ensemble };
  }
  // Racine sur fraction √U / V : zone par zone selon le signe de V.
  const U = P(fn.radicande);
  const V = P(fn.denominateur);
  const rV = racinesReelles(fn.denominateur)[0]!;
  const signeV = lignesCondition(fn.denominateur, V, ">", "dénominateur positif");
  blocs.push({ intro: [t("Le signe de "), f(`${int(dir)}(x)`), t(" est celui de son dénominateur :")], lignes: signeV.lignes, label: "Signe" });
  // Zone V > 0 : √U REL s·V ⟺ U REL s²V² (deux membres positifs) ⟺ W REL 0.
  const s2 = s * s;
  const V2 = [(fn.denominateur[0] ?? 0) ** 2, 2 * (fn.denominateur[0] ?? 0) * (fn.denominateur[1] ?? 0), (fn.denominateur[1] ?? 0) ** 2];
  const Wq = [(fn.radicande[0] ?? 0) - s2 * V2[0]!, (fn.radicande[1] ?? 0) - s2 * V2[1]!, -s2 * V2[2]!];
  const den = denominateurCommun(s2);
  const W = Wq.map((c) => Math.round(c * den * 1e9) / 1e9);
  const lignesPos: LigneCalcul[] = [
    ligne(cond),
    ligne(`\\iff \\dfrac{\\sqrt{${U}}}{${V}}${relLatex(rel)} ${S}`, "on remplace par l'expression"),
    ligne(`\\iff \\sqrt{${U}}${relLatex(rel)} ${S === "1" ? "" : S}${grp(V)}`, "on multiplie par le dénominateur, positif ici : le sens ne change pas"),
    ligne(`\\iff ${U}${relLatex(rel)} ${nb(s2) === "1" ? "" : nb(s2)}${grp(V)}^2`, "les deux membres sont positifs : on élève au carré"),
    ...(den === 1
      ? [ligne(`\\iff ${polyQLatex(W)}${relLatex(rel)} 0`, "on développe et on regroupe")]
      : [ligne(`\\iff ${polyQLatex(Wq)}${relLatex(rel)} 0`, "on développe et on regroupe"), ligne(`\\iff ${polyQLatex(W)}${relLatex(rel)} 0`, jf("on multiplie par ", { l: `${den}` }))]),
  ];
  // Trinôme W : Δ et racines (valeurs approchées si irrationnelles), puis l'ensemble DANS la zone
  // V > 0 (bornes exactes : une racine irrationnelle tombe toujours hors de la zone utile).
  const etude = etudeTrinome(W);
  // Racine irrationnelle de W : écrite par son nom (x₁, x₂ des lignes de Δ), jamais en décimal.
  const nomme = (latex: string) =>
    latex.replace(/-?\d+\.\d+/g, (m) => {
      const v = Number(m);
      let i = 0;
      etude.racines.forEach((r, j) => {
        if (Math.abs(r - v) < Math.abs(etude.racines[i]! - v)) i = j;
      });
      return etude.racines.length === 1 ? "x_0" : `x_${i + 1}`;
    });
  const zoneV = `${V}>0`;
  const posV = (x: number) => valeurPoly(fn.denominateur, x) > 1e-12;
  const Z = ensembleDepuisPredicat((x) => posV(x) && comparer(valeurPoly(W, x), rel, 0), [rV, ...racinesReelles(W)]);
  const horsZone = etude.racines.filter((r) => !posV(r));
  const lignesW = [
    ...etude.lignes,
    ligne(`${polyQLatex(W)}${relLatex(rel)} 0\\iff x\\in ${nomme(ens(Z))}`, horsZone.length ? "signe du trinôme, restreint à la zone (racine hors de la zone écartée)" : "signe du trinôme, restreint à la zone"),
  ];
  blocs.push({ intro: [t("Là où "), f(zoneV), t(" :")], lignes: sansDoublons(lignesPos) });
  blocs.push({ intro: [t("Là où "), f(zoneV), t(", on résout :")], lignes: lignesW });
  const toujours = rel === "≤" || rel === "<" || rel === "≠";
  blocs.push({
    intro: [t("Là où "), f(`${V}<0`), t(" :")],
    lignes: [ligne(`\\dfrac{\\sqrt{${U}}}{${V}}\\leq 0`, toujours ? jf("racine positive sur un nombre négatif : la condition est toujours vraie là (", { l: `0<${S}` }, ")") : jf("racine positive sur un nombre négatif : la condition est impossible là (", { l: `0<${S}` }, ")"))],
  });
  // Ensemble : même convention que le solveur de l'écran (zones strictes ; « ≠ » ne retire que les
  // racines de W situées dans la zone V > 0).
  const predW = (x: number) => comparer(valeurPoly(W, x), rel, 0);
  const pred = (x: number): boolean | null => {
    const v = valeurPoly(fn.denominateur, x);
    if (rel === "≠") return v > 1e-12 ? predW(x) : true;
    if (v > 1e-12) return predW(x);
    if (v < -1e-12) return toujours;
    return false;
  };
  ensemble = ensembleDepuisPredicat(pred, [rV, ...racinesReelles(W)]);
  blocs.push({ intro: [], lignes: [ligne(`${cond}\\iff x\\in ${nomme(ens(ensemble))}`, "on réunit les deux zones")], label: "Conclusion" });
  return { blocs, ensemble, facteur: nomme(ensFacteur(ensemble)) };
}

/** « 3^2 », « \\left(\\dfrac{2}{3}\\right)^2 » (une base fractionnaire toujours entre parenthèses). */
function carre(s: number): string {
  const S = nb(s);
  return /frac|-/.test(S) ? `\\left(${S}\\right)^2` : `${S}^2`;
}

function int(dir: CompositionDirigee): string {
  return dir.nomInterieure;
}

function denominateurCommun(v: number): number {
  for (let d = 1; d <= 10000; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return d;
  return 1;
}

function blocsVersEtapes(l: string, blocs: Bloc[]): EtapeCorrection[] {
  return blocs.map((b) => calcul(l, b.lignes, b.intro, b.label ?? "Calcul"));
}

// ============================================================================
// Étapes du domaine.
// ============================================================================

const conditionsDe = (dir: CompositionDirigee): ConditionSurG[] => (dir.riche ? dir.conditions : conditionsExterieurSurG(dir.exterieure));

/** Écran « conditions » (riche) : domaine de l'extérieure, puis condition(s) sur l'intérieure. */
function etapeConditions(dir: CompositionDirigee, l: string): EtapeCorrection[] {
  const ext = nomExt(dir);
  const intN = dir.nomInterieure;
  const dExt = domaineFonction(dir.exterieure, ext);
  const conds = formatTermesConditionsLatex(dir);
  const lignes: LigneCalcul[] = [ligne(`${intN}(x)\\in ${ens(dir.exterieure.domaine)}`, jf({ l: `${intN}(x)` }, " doit appartenir au domaine de ", { l: ext }))];
  if (conds.length === 1) lignes.push(ligne(`\\iff ${conds[0]!}`));
  const blocs: Bloc[] = [...dExt.blocs.map((b) => ({ ...b, label: b.label ?? `Domaine de ${ext}` })), { intro: [], lignes, label: "Condition" }];
  if (conds.length > 1) blocs.push({ intro: [t("Les deux bornes donnent deux conditions :")], lignes: conds.map((c, i) => ligne(c, i === 0 ? "première condition" : "seconde condition")) });
  return [
    utilise(l, [t("Pour que "), f(`${ext}\\big(${intN}(x)\\big)`), t(" existe, "), f(`${intN}(x)`), t(" doit appartenir au domaine de "), f(ext), t(" : on résout d'abord les conditions d'existence de "), f(ext), t(` ${COURS_COMPOSER}.`)]),
    ...blocsVersEtapes(l, blocs),
    resultat(l, etListe(conds)),
  ];
}

/** Écran « c1 » (riche) : domaine propre de l'intérieure. */
function etapeC1(dir: CompositionDirigee, l: string): EtapeCorrection[] {
  const intN = dir.nomInterieure;
  const d = domaineFonction(dir.interieure, intN);
  return [
    utilise(l, [t("Première condition : "), f("x"), t(" appartient au domaine de "), f(intN), t(` (radicande positif ou nul, dénominateur non nul) ${COURS_COMPOSER}.`)]),
    ...blocsVersEtapes(l, d.blocs),
    resultat(l, [f(`\\operatorname{dom}${intN}=${ens(dir.interieure.domaine)}`)]),
  ];
}

/** Écran « c2 » (riche) : chaque condition élevée au carré et résolue, puis leur intersection. */
function etapeC2(dir: CompositionDirigee, l: string): EtapeCorrection[] {
  const intN = dir.nomInterieure;
  const res = dir.conditions.map((c) => conditionSurInterieure(dir, c));
  const blocs: Bloc[] = [];
  res.forEach((r, i) => blocs.push(...r.blocs.map((b, j) => ({ ...b, label: j === 0 && res.length > 1 ? `Condition ${i + 1}` : b.label }))));
  if (res.length > 1) {
    blocs.push({ intro: [t("Les deux conditions à la fois :")], lignes: sansDoublons([ligne(`S=${res[0]!.facteur ?? ensFacteur(res[0]!.ensemble)}\\cap${res[1]!.facteur ?? ensFacteur(res[1]!.ensemble)}`, "intersection"), ligne(`=${ens(dir.domaineApresCarre!)}`)]), label: "Intersection" });
  }
  const typeInt = dir.interieure.fonction.type;
  return [
    utilise(l, [
      t(
        typeInt === "racineSurFraction"
          ? `${intN}(x) est un quotient : là où son dénominateur est positif, on multiplie par lui puis on élève au carré (deux membres positifs) ; là où il est négatif, ${intN}(x) est négatif ${COURS_COMPOSER}.`
          : `${intN}(x) est une racine carrée, donc positive, et le seuil est positif : élever au carré ne change pas le sens ${COURS_COMPOSER}.`,
      ),
    ]),
    ...blocsVersEtapes(l, blocs),
    resultat(l, [f(`x\\in ${ens(dir.domaineApresCarre!)}`)]),
    piege(l, [t("Élever au carré n'est permis que si les deux membres sont positifs ; sinon, on raisonne sur le signe d'abord.")]),
  ];
}

/** Écran « domaine » : la double condition (simple : tout est résolu ici) puis l'intersection. */
function etapeDomaine(dir: CompositionDirigee, l: string, avecPiege: boolean): EtapeCorrection[] {
  const ext = nomExt(dir);
  const intN = dir.nomInterieure;
  const nomC = `${ext}\\circ ${intN}`;
  const blocs: Bloc[] = [];
  let S: EnsembleReelGuide;
  if (dir.riche) {
    S = dir.domaineApresCarre!;
  } else {
    const dInt = domaineFonction(dir.interieure, intN);
    blocs.push(...dInt.blocs.map((b, i) => ({ ...b, label: i === 0 ? `1re condition : x dans le domaine de ${intN}` : b.label })));
    const dExt = domaineFonction(dir.exterieure, ext);
    blocs.push(...dExt.blocs.map((b, i) => ({ ...b, label: i === 0 ? `Domaine de ${ext}` : b.label })));
    const conds = conditionsDe(dir);
    const res = conds.map((c) => conditionSurInterieure(dir, c));
    const lignesCond: LigneCalcul[] = [ligne(`${intN}(x)\\in ${ens(dir.exterieure.domaine)}`, jf({ l: `${intN}(x)` }, " doit appartenir au domaine de ", { l: ext }))];
    if (conds.length === 1) lignesCond.push(ligne(`\\iff ${formatConditionLatex(dir, conds[0]!)}`));
    blocs.push({ intro: [], lignes: lignesCond, label: `2e condition : ${intN}(x) dans le domaine de ${ext}` });
    res.forEach((r) => blocs.push(...r.blocs));
    S = res.map((r) => r.ensemble).reduce((a, b) => intersecterEnsembles(a, b));
    if (res.length > 1) blocs.push({ intro: [], lignes: sansDoublons([ligne(`S=${res[0]!.facteur ?? ensFacteur(res[0]!.ensemble)}\\cap${res[1]!.facteur ?? ensFacteur(res[1]!.ensemble)}`, "les deux bornes à la fois"), ligne(`=${ens(S)}`)]), label: "Intersection" });
  }
  const inter = sansDoublons([
    ligne(`\\operatorname{dom}(${nomC})=${ensFacteur(dir.interieure.domaine)}\\cap${ensFacteur(S)}`, dir.riche ? jf("résultats des deux étapes précédentes (", { l: `\\operatorname{dom}${intN}` }, " et la condition sur ", { l: `${intN}(x)` }, ")") : "les deux conditions à la fois"),
    ligne(`=${ens(dir.domaine)}`),
  ]);
  blocs.push({ intro: [], lignes: inter, label: "Intersection" });
  // Vérification : une valeur du domaine, la composée y existe.
  return [
    utilise(l, [
      f(`\\operatorname{dom}(${nomC})`),
      t(" : les "), f("x"), t(" du domaine de "), f(intN), t(" dont l'image "), f(`${intN}(x)`), t(" appartient au domaine de "), f(ext), t(` — une double condition, puis l'intersection ${COURS_COMPOSER}.`),
    ]),
    ...blocsVersEtapes(l, blocs),
    resultat(l, [f(`\\operatorname{dom}(${nomC})=${ens(dir.domaine)}`)]),
    ...verificationDomaine(dir, l),
    ...(avecPiege ? [piege(l, [t("Le domaine ne se lit pas sur l'expression simplifiée : une valeur interdite pour "), f(intN), t(` reste interdite pour la composée, même si elle disparaît après simplification.`)])] : []),
  ];
}

/** Une valeur entière exclue du domaine (proche d'une borne) : la composée n'y existe pas. */
function verificationDomaine(dir: CompositionDirigee, l: string): EtapeCorrection[] {
  const fnI = dir.interieure.fonction;
  const fnE = dir.exterieure.fonction;
  for (let x = -12; x <= 12; x++) {
    const dedans = valeur(fnI, x);
    if (dedans !== null) continue;
    // x hors du domaine de l'intérieure : la composée n'existe pas.
    const i = dir.nomInterieure;
    const e = nomExt(dir);
    return [verification(l, [t("Pour "), f(`x=${x}`), t(" : "), f(`${i}${grp(x)}`), t(" n'existe pas, donc "), f(`${e}(${i}${grp(x)})`), t(" non plus — et en effet "), f(`${x}\\notin\\operatorname{dom}(${e}\\circ ${i})`), t(".")])];
  }
  void fnE;
  return [];
}

// ============================================================================
// Corrigé complet.
// ============================================================================

function directionsActives(e: ExerciceComposerFonctions): { dir: CompositionDirigee; suffixe: "FRondG" | "GRondF" }[] {
  const out: { dir: CompositionDirigee; suffixe: "FRondG" | "GRondF" }[] = [];
  if (e.fRondG) out.push({ dir: e.fRondG, suffixe: "FRondG" });
  if (e.gRondF) out.push({ dir: e.gRondF, suffixe: "GRondF" });
  return out;
}

export function correctionDetailleeComposerFonctions(e: ExerciceComposerFonctions): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  directionsActives(e).forEach(({ dir, suffixe }, i) => {
    const l = (phase: string) => lettrePhaseComposer(e, `${phase}${suffixe}` as PhaseComposerFonctions);
    etapes.push(...etapeFormule(dir, l("formule")));
    if (dir.riche) {
      etapes.push(...etapeConditions(dir, l("conditions")));
      etapes.push(...etapeC1(dir, l("c1")));
      etapes.push(...etapeC2(dir, l("c2")));
    }
    etapes.push(...etapeDomaine(dir, l("domaine"), i === 0));
  });
  return finaliserCorrige(etapes);
}

/** Lettres des écrans « formule » et « domaine » de chaque composée (barème). */
export function lettresComposee(e: ExerciceComposerFonctions): { dir: CompositionDirigee; formule: string; domaine: string; conditions: string | null; c1: string | null; c2: string | null }[] {
  return directionsActives(e).map(({ dir, suffixe }) => {
    const l = (phase: string) => lettrePhaseComposer(e, `${phase}${suffixe}` as PhaseComposerFonctions);
    return { dir, formule: l("formule"), domaine: l("domaine"), conditions: dir.riche ? l("conditions") : null, c1: dir.riche ? l("c1") : null, c2: dir.riche ? l("c2") : null };
  });
}

export type { FragmentConsigne };
