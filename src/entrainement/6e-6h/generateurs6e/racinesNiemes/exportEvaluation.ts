import type { ExerciceRacinesB, ExerciceRacinesNiemes, RacineExacte } from "../../core6e/racinesNiemes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { COULEURS, etiquetteNombre } from "../../ui6e/figureRepereIntegrales";
import { LIBELLE_RELATION_C, aideNiveau1, aideNiveau2, assembleRacineLatex, blocDonnees, formatReponseAttenduePhaseLatex } from "../../ui6e/formatRacinesNiemes";
import { phasesPourExercice } from "../../moteur6e/typesRacinesNiemes";
import type { PhaseRacinesNiemes } from "../../moteur6e/typesRacinesNiemes";
import { pgcd } from "../calculPrimitives/aleatoire";
import { LIBELLE_CAS_RACINES_NIEMES, profilRacinesNiemes } from "../profilsEvaluationComplexes37-39";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRacinesNiemes } from "./index";
import type { IdVarianteRacinesNiemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRacinesNiemes>` pour `6gen39` (Racines n-ièmes
 * d'un nombre complexe) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la donnée et la consigne globale (« Détermine les racines cubiques de w… »,
 *   « Résous zⁿ = wⁿ… ») ; les écrans du générateur deviennent les étapes du corrigé.
 * - Corrigé : r substitué, valeurs exactes (familles A et C) ou arrondies au centième avec virgule
 *   (famille B), et le polygone régulier des racines sur leur cercle (`figureHtml`).
 * - `planComplexeSvg` (exporté) dessine aussi le point de 6gen37.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

// ============================================================================
// Figure : plan complexe (cercle, polygone des racines, ou point avec module et argument).
// ============================================================================

export interface PointPlanComplexe {
  x: number;
  y: number;
  etiquette?: string;
}

export interface OptionsPlanComplexe {
  points: PointPlanComplexe[];
  /** Cercle centré à l'origine (rayon en unités), en pointillés, avec sa graduation sur l'axe réel. */
  rayonCercle?: number;
  /** Relie les points dans l'ordre (polygone régulier des racines). */
  polygone?: boolean;
  /** Point unique : segment [O ; z] (module r) et arc de l'argument θ (en radians). */
  moduleArgument?: { r: string; theta: number };
  libelle: string;
}

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;
const INDICES = "₀₁₂₃₄₅₆₇₈₉";
let compteurFigures = 0;

function f1(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "0";
}
function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/-/g, "−");
}
export function indice(k: number): string {
  return String(k)
    .split("")
    .map((c) => INDICES[Number(c)])
    .join("");
}

/** Chaîne SVG autonome (couleurs du thème avec repli imprimable, comme `figureRepereIntegrales`). */
export function planComplexeSvg(o: OptionsPlanComplexe): string {
  const id = `pc${++compteurFigures}`;
  const L = 250;
  const c = L / 2;
  const etendue = Math.max(o.rayonCercle ?? 0, ...o.points.map((p) => Math.hypot(p.x, p.y)), 1e-6);
  const s = 82 / etendue;
  const X = (x: number) => c + x * s;
  const Y = (y: number) => c - y * s;
  const m: string[] = [];
  m.push(`<defs><marker id="${id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.doux}"/></marker><marker id="${id}arc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.ciel}"/></marker></defs>`);
  m.push(
    `<line x1="12" y1="${c}" x2="${L - 8}" y2="${c}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<line x1="${c}" y1="${L - 12}" x2="${c}" y2="8" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<text x="${L - 22}" y="${c + 16}" font-size="12" font-style="italic" fill="${COULEURS.doux}" ${POLICE}>Re</text>`,
    `<text x="${c + 6}" y="18" font-size="12" font-style="italic" fill="${COULEURS.doux}" ${POLICE}>Im</text>`,
  );
  // « O » à l'écart de l'arc de l'argument (sous l'axe, sauf si l'arc y passe déjà).
  const oEnHaut = (o.moduleArgument?.theta ?? 0) < -Math.PI / 2;
  m.push(`<text x="${c - 5}" y="${oEnHaut ? c - 6 : c + 14}" font-size="11" text-anchor="end" fill="${COULEURS.doux}" ${POLICE}>O</text>`);
  const etiquettes: string[] = [];
  if (o.rayonCercle !== undefined) {
    const R = o.rayonCercle * s;
    m.push(`<circle cx="${c}" cy="${c}" r="${f1(R)}" fill="none" stroke="${COULEURS.pale}" stroke-width="1.1" stroke-dasharray="4 3"/>`);
    m.push(`<line x1="${f1(c + R)}" y1="${c - 3}" x2="${f1(c + R)}" y2="${c + 3}" stroke="${COULEURS.doux}" stroke-width="1"/>`);
    etiquettes.push(`<text x="${f1(c + R + 3)}" y="${c - 5}" font-size="10.5" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${echapper(etiquetteNombre(o.rayonCercle))}</text>`);
  }
  if (o.polygone && o.points.length >= 2) {
    const pts = o.points.map((p) => `${f1(X(p.x))},${f1(Y(p.y))}`).join(" ");
    m.push(
      o.points.length === 2
        ? `<polyline points="${pts}" fill="none" stroke="${COULEURS.accent}" stroke-width="1.6"/>`
        : `<polygon points="${pts}" fill="${COULEURS.accentDoux}" fill-opacity="0.45" stroke="${COULEURS.accent}" stroke-width="1.6" stroke-linejoin="round"/>`,
    );
  }
  if (o.moduleArgument && o.points[0]) {
    const p = o.points[0];
    const th = o.moduleArgument.theta;
    m.push(`<line x1="${c}" y1="${c}" x2="${f1(X(p.x))}" y2="${f1(Y(p.y))}" stroke="${COULEURS.accent}" stroke-width="1.6"/>`);
    // Projections sur les axes (lecture de a et b).
    m.push(
      `<line x1="${f1(X(p.x))}" y1="${f1(Y(p.y))}" x2="${f1(X(p.x))}" y2="${c}" stroke="${COULEURS.pale}" stroke-width="1" stroke-dasharray="3 3"/>`,
      `<line x1="${f1(X(p.x))}" y1="${f1(Y(p.y))}" x2="${c}" y2="${f1(Y(p.y))}" stroke="${COULEURS.pale}" stroke-width="1" stroke-dasharray="3 3"/>`,
    );
    if (Math.abs(th) > 1e-9) {
      const rho = 24;
      const xa = c + rho * Math.cos(th);
      const ya = c - rho * Math.sin(th);
      const grand = Math.abs(th) > Math.PI + 1e-9 ? 1 : 0;
      const sens = th > 0 ? 0 : 1;
      m.push(`<path d="M${f1(c + rho)},${c} A${rho},${rho} 0 ${grand} ${sens} ${f1(xa)},${f1(ya)}" fill="none" stroke="${COULEURS.ciel}" stroke-width="1.5" marker-end="url(#${id}arc)"/>`);
      etiquettes.push(
        `<text x="${f1(c + 38 * Math.cos(th / 2))}" y="${f1(c - 38 * Math.sin(th / 2) + 4)}" font-size="12" font-style="italic" text-anchor="middle" fill="${COULEURS.ciel}" ${HALO} ${POLICE}>θ</text>`,
      );
    }
    const mx = (X(p.x) + c) / 2;
    const my = (Y(p.y) + c) / 2;
    const ang = Math.atan2(p.y, p.x);
    etiquettes.push(
      `<text x="${f1(mx - 11 * Math.sin(ang))}" y="${f1(my - 11 * Math.cos(ang) + 4)}" font-size="12" font-style="italic" text-anchor="middle" fill="${COULEURS.accent}" ${HALO} ${POLICE}>${echapper(o.moduleArgument.r)}</text>`,
    );
  }
  for (const p of o.points) {
    const px = X(p.x);
    const py = Y(p.y);
    m.push(`<circle cx="${f1(px)}" cy="${f1(py)}" r="3.4" fill="${COULEURS.accent}"/>`);
    if (p.etiquette) {
      const ang = Math.atan2(p.y, p.x);
      const lx = px + 15 * Math.cos(ang);
      const ly = py - 15 * Math.sin(ang) + 4;
      const ancre = Math.cos(ang) > 0.35 ? "start" : Math.cos(ang) < -0.35 ? "end" : "middle";
      etiquettes.push(`<text x="${f1(lx)}" y="${f1(ly)}" font-size="12" font-style="italic" text-anchor="${ancre}" fill="${COULEURS.encre}" ${HALO} ${POLICE}>${echapper(p.etiquette)}</text>`);
    }
  }
  m.push(...etiquettes);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${L}" width="${L}" height="${L}" style="max-width:100%;height:auto" role="img" aria-label="${echapper(o.libelle)}">${m.join("")}</svg>`;
}

// ============================================================================
// Écriture des valeurs.
// ============================================================================

/** `\frac{-1}{2}` (forme produite par `combinerModuleAngle`) réécrit `-\frac{1}{2}` dans toutes les
 * valeurs exactes de l'exercice : sur papier, « z = −½ + … » et non « z = (−1)/2 + … ». Copie
 * profonde, l'exercice d'origine n'est pas modifié. */
export function normaliserFractions<T>(valeur: T): T {
  if (Array.isArray(valeur)) return valeur.map((v) => normaliserFractions(v)) as T;
  if (valeur && typeof valeur === "object") {
    const sortie: Record<string, unknown> = {};
    for (const [cle, v] of Object.entries(valeur)) {
      sortie[cle] = cle === "latex" && typeof v === "string" ? v.replace(/^\\frac\{-(.*)\}\{(\d+)\}$/, "-\\frac{$1}{$2}") : normaliserFractions(v);
    }
    return sortie as T;
  }
  return valeur;
}

/** Applique `normaliserFractions` à l'exercice avant chaque fonction de l'adaptateur. */
export function avecFractionsNormalisees<E, R>(fn: (e: E) => R): (e: E) => R {
  return (e) => fn(normaliserFractions(e));
}

/** Angle kπ/d NON réduit modulo 2π (fraction simplifiée seulement) — pour écrire θₖ tel que la formule
 * le donne, avant toute réduction. */
export function anglePiLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(Math.abs(num), den);
  const n = num / g;
  const d = den / g;
  const signe = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (d === 1) return a === 1 ? `${signe}\\pi` : `${signe}${a}\\pi`;
  return a === 1 ? `${signe}\\frac{\\pi}{${d}}` : `${signe}\\frac{${a}\\pi}{${d}}`;
}

function virgule(v: number, decimales = 2): string {
  const r = Number(v.toFixed(decimales));
  return (Object.is(r, -0) ? 0 : r).toFixed(decimales).replace(".", "{,}");
}

/** Retire la ponctuation finale « \text{ ;} » des lignes de récapitulatif de l'écran. */
function ligne(s: string): string {
  return s.replace(/\\text\{ ;\}$/, "").replace(/\\sqrt\[2\]\{/g, "\\sqrt{").replace(/\\frac\{0\+/g, "\\frac{");
}

/** Plusieurs formules séparées par « ; » (texte) : elles passent à la ligne entre elles. */
function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function reponse(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): FragmentConsigne[] {
  return liste(formatReponseAttenduePhaseLatex(e, phase).map(ligne));
}

const NOMS_RACINES: Record<number, string> = { 2: "racines carrées", 3: "racines cubiques", 4: "racines quatrièmes", 5: "racines cinquièmes", 6: "racines sixièmes" };
const NOMS_RACINE_UNITE: Record<number, string> = { 2: "racine carrée", 3: "racine cubique", 4: "racine quatrième", 5: "racine cinquième", 6: "racine sixième" };

function listeK(n: number): string {
  return `k=${Array.from({ length: n }, (_, k) => k).join(",\\,")}`;
}

function fractionLatex(num: number, den: number): string {
  const signe = num * den < 0 ? "-" : "";
  return `${signe}\\frac{${Math.abs(num)}}{${Math.abs(den)}}`;
}

/** Argument de w = a + bi (famille B), avec la correction de quadrant. */
function calculArgumentB(e: ExerciceRacinesB): FragmentConsigne[] {
  const egalite = ligne(formatReponseAttenduePhaseLatex(e, "bEcran1")[1]);
  if (e.angle.q !== 1e6) {
    return [t("Le point (a ; b) est sur un axe ou sur une bissectrice : l'argument est remarquable, "), f(egalite), t(".")];
  }
  const quotient = e.b % e.a === 0 ? `${e.b / e.a}` : fractionLatex(e.b, e.a);
  const arct = `\\arctan\\left(${quotient}\\right)`;
  if (e.a > 0) return [t("a > 0 : la calculatrice donne directement l'argument, "), f(`\\theta=${arct}${egalite.slice("\\theta".length)}`), t(".")];
  const correction = e.b >= 0 ? "+\\pi" : "-\\pi";
  const quadrant = e.b >= 0 ? "2" : "3";
  return [t(`a < 0 (quadrant ${quadrant}) : on corrige l'angle donné par la calculatrice, `), f(`\\theta=${arct}${correction}${egalite.slice("\\theta".length)}`), t(".")];
}

function racineTrigLatex(module: string, num: number, den: number, r: RacineExacte, nom: string, k: number): string {
  const brut = anglePiLatex(num, den);
  const ang = brut.startsWith("-") ? `\\left(${brut}\\right)` : brut;
  const trig = `\\cos ${ang}+i\\sin ${ang}`;
  return `${nom}_{${k}}=${module === "" ? trig : `${module}\\left(${trig}\\right)`}=${assembleRacineLatex(r.re, r.im)}`;
}

function figureRacines(rayon: number, points: { x: number; y: number }[], nom: string, libelle: string): string {
  return planComplexeSvg({ rayonCercle: rayon, polygone: true, points: points.map((p, k) => ({ ...p, etiquette: `${nom}${indice(k)}` })), libelle });
}

function figure(e: ExerciceRacinesNiemes): string {
  if (e.famille === "B") {
    const rho = Math.pow(e.r, 1 / e.n);
    const pts = Array.from({ length: e.n }, (_, k) => {
      const a = (e.angle.numerique + 2 * k * Math.PI) / e.n;
      return { x: rho * Math.cos(a), y: rho * Math.sin(a) };
    });
    return figureRacines(rho, pts, "z", `Les ${e.n} racines de w, sommets d'un polygone régulier inscrit dans le cercle de rayon ${etiquetteNombre(rho)}`);
  }
  const rayon = e.famille === "A" ? e.kModule : e.r;
  const pts = e.racines.map((r) => ({ x: r.re.numerique, y: r.im.numerique }));
  return figureRacines(rayon, pts, "z", `Les ${e.n} ${e.famille === "A" ? "racines de w" : "solutions"}, sommets d'un polygone régulier inscrit dans le cercle de rayon ${rayon}`);
}

// ============================================================================
// Énoncé papier et étapes.
// ============================================================================

function entetePapier(e: ExerciceRacinesNiemes): FragmentConsigne[] {
  const w = blocDonnees(e)[0];
  if (e.famille === "A") {
    return [t("Soit "), f(w), t(`. Détermine les ${NOMS_RACINES[e.n]} de w et écris-les sous la forme `), f("a+bi"), t(" (valeurs exactes). Les arguments sont exprimés en radians.")];
  }
  if (e.famille === "B") {
    return [
      t("Soit "),
      f(w),
      t(`. Détermine les ${NOMS_RACINES[e.n]} de w : donne leur module commun et leur argument `),
      f("\\theta_k"),
      t(" en fonction de l'entier k, pour "),
      f(listeK(e.n)),
      t(". Arguments en radians ; valeurs exactes ou arrondies au centième (calculatrice)."),
    ];
  }
  return [
    t("Soit "),
    f(w),
    t(". Résous dans ℂ l'équation "),
    f(`z^{${e.n}}=w^{${e.n}}`),
    t(` sans calculer `),
    f(`w^{${e.n}}`),
    t(` : remarque que `),
    f("\\dfrac{z}{w}"),
    t(` est alors une ${NOMS_RACINE_UNITE[e.n]} de l'unité. Donne les solutions sous la forme `),
    f("a+bi"),
    t(" (valeurs exactes). Les arguments sont exprimés en radians."),
  ];
}

/** Titres d'étapes du corrigé (« Étape n — … ») : consignes d'écran réécrites pour le papier. */
function titreEtape(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
    case "bEcran1":
      return [t("Détermine le module r et un argument θ de w, en radians.")];
    case "aEcran2":
      return [t("Calcule le module commun des racines, "), f("\\sqrt[n]{r}"), t(", et écris leur argument "), f("\\theta_k"), t(" en fonction de k, pour "), f(listeK(e.n)), t(".")];
    case "aEcran3":
      return [t("Écris chaque racine sous la forme "), f("a+bi"), t(".")];
    case "bEcran2":
      return [t("Donne le module commun des racines et leur argument "), f("\\theta_k"), t(" en fonction de k, pour "), f(listeK(e.n)), t(".")];
    case "cEcran1":
      return [t("Exprime z en fonction de w et d'une racine n-ième de l'unité "), f("\\zeta_k"), t(".")];
    case "cEcran2":
      return [t("Écris les racines n-ièmes de l'unité "), f("\\zeta_k"), t(" sous la forme "), f("a+bi"), t(".")];
    case "cEcran3":
      return [t("Calcule les solutions "), f("z_k=w\\cdot\\zeta_k"), t(" sous la forme "), f("a+bi"), t(".")];
  }
}

function construireEnonce(e: ExerciceRacinesNiemes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceRacinesNiemes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceRacinesNiemes): PhaseRacinesNiemes {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

function reponseBreve(e: ExerciceRacinesNiemes): FragmentConsigne[] {
  return reponse(e, phaseFinale(e));
}

function enoncePapier(e: ExerciceRacinesNiemes): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function piege(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): string | null {
  switch (phase) {
    case "aEcran2":
      return "Diviser seulement θ par n et oublier le terme 2kπ/n : on n'obtiendrait qu'une seule racine.";
    case "aEcran3":
      return `Oublier des racines : il y en a exactement ${e.n}, régulièrement espacées de 2π/${e.n} sur le cercle.`;
    case "bEcran1":
      return e.famille === "B" && e.a < 0
        ? "Garder l'angle donné par la calculatrice : arctan(b/a) ne convient que si a > 0 ; ici a < 0, il faut ajouter ou retirer π."
        : "Confondre le module r = √(a² + b²) avec a² + b².";
    case "bEcran2":
      return "Prendre la racine n-ième de θ, ou diviser seulement θ par n et oublier le terme 2kπ/n.";
    case "cEcran1":
      return "Écrire z = w + ζₖ, ou calculer wⁿ puis ses racines n-ièmes (calcul bien plus long).";
    case "cEcran3":
      return "Multiplier les arguments au lieu de les additionner : multiplier par ζₖ ajoute 2kπ/n à l'argument de w.";
    default:
      return null;
  }
}

function lignesEtape(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes, sq: string): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  const conclusion = (avecFigure = false): EtapeCorrection => ({ label: "Conclusion", sousQuestion: sq, fragments: reponse(e, phase), ...(avecFigure ? { figureHtml: figure(e) } : {}) });
  switch (phase) {
    case "aEcran1":
    case "cEcran1": {
      if (phase === "aEcran1") {
        lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("w est déjà écrit sous forme trigonométrique "), f("r\\left(\\cos\\theta+i\\sin\\theta\\right)"), t(" : on lit directement r et θ.")] });
        lignes.push(conclusion());
        break;
      }
      const a1 = aideNiveau1(e, phase);
      lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t(`${a1.texte} `), ...(a1.latex ? [f(a1.latex)] : [])] });
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [t("Le quotient z/w a pour puissance n-ième 1 : c'est une racine n-ième de l'unité, "), f("\\dfrac{z}{w}=\\zeta_k"), t(", d'où "), f(LIBELLE_RELATION_C.correct), t(".")] });
      lignes.push(conclusion());
      break;
    }
    case "aEcran2": {
      const a2 = aideNiveau2(e, phase);
      lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Les n racines ont toutes le même module et leurs arguments sont espacés de 2π/n : "), f("|z_k|=\\sqrt[n]{r}\\qquad\\theta_k=\\dfrac{\\theta+2k\\pi}{n}")] });
      if (a2.latex) lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [t("Module des racines : "), f(ligne(a2.latex)), t(".")] });
      lignes.push(conclusion());
      break;
    }
    case "aEcran3": {
      if (e.famille !== "A") break;
      const module = e.kModule === 1 ? "" : `${e.kModule}`;
      const calculs = e.racines.map((r, k) => racineTrigLatex(module, e.angle.p + 2 * k * e.angle.q, e.angle.q * e.n, r, "z", k));
      lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Pour chaque k, on remplace θₖ dans "), f(`z_k=${module}\\left(\\cos\\theta_k+i\\sin\\theta_k\\right)`), t(" et on utilise les valeurs remarquables du cosinus et du sinus.")] });
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: liste(calculs) });
      lignes.push(conclusion(true));
      break;
    }
    case "bEcran1": {
      if (e.famille !== "B") break;
      const rLatex = ligne(formatReponseAttenduePhaseLatex(e, "bEcran1")[0]).replace(/^r=/, "");
      const carre = e.a * e.a + e.b * e.b;
      const par = (v: number) => (v < 0 ? `(${v})` : `${v}`);
      const rCalc = `r=\\sqrt{${par(e.a)}^2+${par(e.b)}^2}=\\sqrt{${carre}}${rLatex === `\\sqrt{${carre}}` ? "" : `=${rLatex}`}${Number.isInteger(e.r) ? "" : `\\approx ${virgule(e.r)}`}`;
      lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [f("r=\\sqrt{a^2+b^2}"), t(" ; pour l'argument, attention au quadrant du point (a ; b).")] });
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(rCalc), t(". "), ...calculArgumentB(e)] });
      lignes.push(conclusion());
      break;
    }
    case "bEcran2": {
      if (e.famille !== "B") break;
      const a2 = aideNiveau2(e, phase);
      const thetas = Array.from({ length: e.n }, (_, k) => `\\theta_{${k}}\\approx ${virgule((e.angle.numerique + 2 * k * Math.PI) / e.n)}`);
      lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Les n racines ont toutes le même module et leurs arguments sont espacés de 2π/n : "), f("|z_k|=\\sqrt[n]{r}\\qquad\\theta_k=\\dfrac{\\theta+2k\\pi}{n}")] });
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [t("Module et écart entre deux arguments : "), ...(a2.latex ? [f(a2.latex)] : []), t(". Valeurs de θₖ : "), ...liste(thetas)] });
      lignes.push(conclusion(true));
      break;
    }
    case "cEcran2": {
      if (e.famille !== "C") break;
      const formule = `\\zeta_k=\\cos\\dfrac{2k\\pi}{${e.n}}+i\\sin\\dfrac{2k\\pi}{${e.n}}`;
      lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Les racines n-ièmes de l'unité sont "), f(formule), t(", pour "), f(listeK(e.n)), t(".")] });
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: liste(e.zetas.map((z, k) => racineTrigLatex("", 2 * k, e.n, z, "\\zeta", k))) });
      lignes.push(conclusion());
      break;
    }
    case "cEcran3": {
      if (e.famille !== "C") break;
      const module = e.r === 1 ? "" : `${e.r}`;
      const calculs = e.racines.map((r, k) => racineTrigLatex(module, e.angle.p * e.n + 2 * k * e.angle.q, e.angle.q * e.n, r, "z", k));
      lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Multiplier w par ζₖ (de module 1) garde le module r et ajoute 2kπ/n à l'argument : "), f(`z_k=${module}\\left(\\cos\\left(\\theta+\\dfrac{2k\\pi}{${e.n}}\\right)+i\\sin\\left(\\theta+\\dfrac{2k\\pi}{${e.n}}\\right)\\right)`), t(".")] });
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: liste(calculs) });
      lignes.push(conclusion(true));
      break;
    }
  }
  const p = piege(e, phase);
  if (p) lignes.push({ label: "Piège", sousQuestion: sq, fragments: [t(p)] });
  return lignes;
}

function correctionDetaillee(e: ExerciceRacinesNiemes): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i]));
}

function difficulte(e: ExerciceRacinesNiemes): 1 | 2 | 3 {
  return e.famille === "C" ? 3 : 2;
}

/** Poids par critère (somme 4, aucun critère sous 0,5). */
function criteres(e: ExerciceRacinesNiemes): { sq: string; critere: FragmentConsigne[]; points: number }[] {
  const L = (phase: PhaseRacinesNiemes) => formatReponseAttenduePhaseLatex(e, phase).map(ligne);
  switch (e.famille) {
    case "A":
      return [
        { sq: "a", critere: [t("Module et argument de w : "), ...liste(L("aEcran1"))], points: 1 },
        { sq: "b", critere: [t("Module des racines : "), f(L("aEcran2")[0])], points: 0.5 },
        { sq: "b", critere: [t("Argument en fonction de k : "), f(L("aEcran2")[1])], points: 1 },
        { sq: "c", critere: [t(`Les ${e.n} racines sous la forme a + bi (proportionnel au nombre de racines correctes)`)], points: 1.5 },
      ];
    case "B":
      return [
        { sq: "a", critere: [t("Module de w : "), f(L("bEcran1")[0])], points: 1 },
        { sq: "a", critere: [t("Argument de w, quadrant pris en compte : "), f(L("bEcran1")[1])], points: 1 },
        { sq: "b", critere: [t("Module commun des racines : "), f(L("bEcran2")[0])], points: 1 },
        { sq: "b", critere: [t("Argument en fonction de k : "), f(L("bEcran2")[1])], points: 1 },
      ];
    case "C":
      return [
        { sq: "a", critere: [t("Relation "), f(LIBELLE_RELATION_C.correct), t(" justifiée par "), f("\\left(\\dfrac{z}{w}\\right)^n=1")], points: 1 },
        { sq: "b", critere: [t(`Les ${e.n} racines de l'unité (proportionnel au nombre de valeurs correctes)`)], points: 1.5 },
        { sq: "c", critere: [t(`Les ${e.n} solutions sous la forme a + bi (proportionnel au nombre de solutions correctes)`)], points: 1.5 },
      ];
  }
}

function bareme(e: ExerciceRacinesNiemes): BaremeExercice {
  const phases = phasesPourExercice(e);
  const erreurs = phases.map((phase) => piege(e, phase)).filter((p): p is string => !!p);
  return {
    reponseFinale: reponseBreve(e),
    criteres: criteres(e).map((c) => ({ sousQuestion: c.sq, critere: c.critere, points: c.points })),
    erreursFrequentes: erreurs.map((x) => ({ description: [t(x)], cout: "−1" })),
    reponsesAcceptees: [
      [t("Racines données dans n'importe quel ordre")],
      e.famille === "B" ? [t("Valeurs exactes ou arrondies au centième ; un argument égal à 2kπ près")] : [t("Forme trigonométrique correcte non convertie en a + bi : la moitié des points de l'étape")],
    ],
  };
}

export const adaptateurEvaluationRacinesNiemes: AdaptateurFeuilleExercices<ExerciceRacinesNiemes> = {
  titreDocument: "Racines n-ièmes d'un nombre complexe — Évaluation",
  nomFichierBase: "racines-niemes",
  genererInstance: genererExerciceRacinesNiemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteRacinesNiemes),
  construireEnonce: avecFractionsNormalisees(construireEnonce),
  construireCorrection: avecFractionsNormalisees(construireCorrection),
  difficulte: avecFractionsNormalisees(difficulte),
  reponseBreve: avecFractionsNormalisees(reponseBreve),
  correctionDetaillee: avecFractionsNormalisees(correctionDetaillee),
  bareme: avecFractionsNormalisees(bareme),
  enoncePapier: avecFractionsNormalisees(enoncePapier),
  dureeMinutes: 12,
  profilInstance: profilRacinesNiemes,
  libelleCasParticulier: LIBELLE_CAS_RACINES_NIEMES,
  // Famille B : racine n-ième de r et arguments arrondis — calculatrice pour toute instance complète
  // (seul w ∈ {1 ; −1 ; i ; −i}, cas particulier, s'en passe).
  calculatriceIndispensable: ["B"],
};
