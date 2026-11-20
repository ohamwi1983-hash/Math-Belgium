import type { Arcfonction } from "../core6e/cyclometrique.types";
import type {
  CandidatA,
  CandidatB,
  CandidatC,
  CandidatD,
  CandidatE,
  CandidatF,
  ExerciceGraphiquesCyclometriques,
  ParticulariteParite,
} from "../core6e/graphiquesCyclometriques.types";
import { assurerAxesVisibles } from "../ui/mafsTransformation";
import { fusionnerOperateurSigne } from "./formatOperateurSigne";
import { piL, q } from "./corrigeIntegrales1";

/**
 * Couche présentation (6e) — formatage LaTeX, évaluation des 4 candidats (pour le rendu Mafs) et
 * textes de consigne/aide pour `6gen5`.
 *
 * **REFONTE — écran unique** : la consigne couvre désormais à la fois le choix du graphique ET la
 * justification par les 6 propriétés de f ; les anciens textes d'aide séparés "calcul"/"sélection"
 * fusionnent en une seule paire de niveaux (`texteAideNiveau1`/`texteAideNiveau2`).
 */
export const CONSIGNE_GENERALE = "Voici l'expression d'une fonction f. Sélectionne le graphique qui lui correspond, puis justifie ton choix.";
export const CONSIGNE_JUSTIFICATION = "Pourquoi as-tu sélectionné {LETTRE} ?";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };

interface TermeAffiche {
  signe: 1 | -1;
  corps: string;
}

function formatSomme(termes: TermeAffiche[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => (i === 0 ? (t.signe < 0 ? `-${t.corps}` : t.corps) : `${t.signe < 0 ? "-" : "+"} ${t.corps}`)).join(" ");
}

function formatAffineLatex(a: number, b: number, variable = "x"): string {
  const termeA: TermeAffiche = { signe: a >= 0 ? 1 : -1, corps: Math.abs(a) === 1 ? variable : `${Math.abs(a)}${variable}` };
  if (b === 0) return formatSomme([termeA]);
  return formatSomme([termeA, { signe: b >= 0 ? 1 : -1, corps: String(Math.abs(b)).replace(".", "{,}") }]);
}

/** `corps` est toujours ici une arcfonction (`\arcsin(...)`/`\arccos(...)`/`\arctan(...)`) — jamais
 * de `\cdot` entre le coefficient et elle (juxtaposition directe, sans ambiguïté vu la parenthèse
 * qui suit immédiatement), contrairement à un `\cdot` entre 2 groupes parenthésés/crochetés. */
function formatCoefFois(k: number, corps: string): string {
  const abs = Math.abs(k);
  return abs === 1 ? corps : `${abs}${corps}`;
}

/** `corpsSuivant` peut lui-même porter un signe négatif en tête (ex. `formatCoefFoisSigne` avec un
 * `k` négatif, familles A/B) — la concaténation `"${c} + ${corpsSuivant}"` produirait alors un
 * double signe visuel (`"5 + -arcsin(x-4)"` au lieu de `"5 - arcsin(x-4)"`, bug transversal
 * documenté dans CLAUDE.md). Corrigé via l'utilitaire partagé `fusionnerOperateurSigne`
 * (`ui6e/formatOperateurSigne.ts`) plutôt que de réimplémenter cette logique ici. */
function formatPlusConstante(c: number, corpsSuivant: string): string {
  if (c === 0) return corpsSuivant;
  return `${c} ${fusionnerOperateurSigne("+", corpsSuivant)}`;
}

function formatCorpsPlusConstante(corps: string, c: number): string {
  if (c === 0) return corps;
  // Virgule décimale (famille E : constante au centième), jamais « 1.37 ».
  const abs = String(Math.abs(c)).replace(".", "{,}");
  return c > 0 ? `${corps} + ${abs}` : `${corps} - ${abs}`;
}

// ============================================================================
// Expression f(x) affichée (bloc de données, redondant sur chaque écran).
// ============================================================================

function formatCoefFoisSigne(k: number, corps: string): string {
  return k < 0 ? `-${formatCoefFois(-k, corps)}` : formatCoefFois(k, corps);
}

/** `f(x) =` OMIS volontairement — l'énoncé au-dessus du bloc de données précise déjà "une fonction
 * f", le préfixe serait redondant (`prompt-retrait-prefixe-fx.md`). */
export function formatExpressionLatex(exercice: ExerciceGraphiquesCyclometriques): string {
  switch (exercice.famille) {
    case "A": {
      const r = exercice.reel;
      const arg = formatAffineLatex(r.m, r.n);
      const corps = formatCoefFoisSigne(r.k, `${NOM_LATEX[r.arcfonction]}\\left(${arg}\\right)`);
      return formatPlusConstante(r.c, corps);
    }
    case "B": {
      const r = exercice.reel;
      const arg = formatAffineLatex(r.m, r.n);
      const corps = formatCoefFoisSigne(r.k, `\\arctan\\left(${arg}\\right)`);
      return formatPlusConstante(r.c, corps);
    }
    case "C": {
      const r = exercice.reel;
      const arg = formatAffineLatex(r.a, r.b, "x^2");
      return `${NOM_LATEX[r.arcfonction]}\\left(${arg}\\right)`;
    }
    case "D": {
      const r = exercice.reel;
      const denominateur = r.p === 0 ? "x" : `x ${r.p >= 0 ? "-" : "+"} ${Math.abs(r.p)}`;
      const fraction = `\\dfrac{${r.k}}{${denominateur}}`;
      return formatPlusConstante(r.c, `\\arctan\\left(${fraction}\\right)`);
    }
    case "E": {
      const r = exercice.reel;
      const corps = formatCoefFoisSigne(r.k, `${NOM_LATEX[r.arcfonction]}(x)`);
      // Constante EXACTE, multiple de π (décision de l'utilisateur, audit du 6e ch. 1, E11) :
      // « \sqrt{2\arcsin(x) - \dfrac{\pi}{3}} », plus jamais un décimal au centième.
      const cTex = piL(q(r.cPi.n, r.cPi.d));
      return `\\sqrt{${corps} ${cTex.startsWith("-") ? `- ${cTex.slice(1)}` : `+ ${cTex}`}}`;
    }
    case "F": {
      const r = exercice.reel;
      const arg = formatAffineLatex(r.m, r.n);
      return formatCorpsPlusConstante(`\\left(${NOM_LATEX[r.arcfonction]}\\left(${arg}\\right)\\right)^2`, r.c);
    }
  }
}

// ============================================================================
// Évaluation des candidats — utilisée pour le tracé Mafs de chacune des 4 options.
// ============================================================================

function evalArcfonction(arcfonction: Arcfonction, u: number): number | null {
  if (arcfonction === "arctan") return Math.atan(u);
  if (u < -1 || u > 1) return null;
  return arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
}

export function evaluerA(c: CandidatA, x: number): number | null {
  const u = c.m * x + c.n;
  if (u < -1 || u > 1) return null;
  const w = c.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
  return c.c + c.k * w;
}

export function evaluerB(c: CandidatB, x: number): number {
  return c.c + c.k * Math.atan(c.m * x + c.n);
}

export function evaluerC(c: CandidatC, x: number): number | null {
  if (c.domaineTraceForce && (x < -1 || x > 1)) return null;
  const u = c.argumentLineaire ? c.a * x + c.b : c.a * x * x + c.b;
  const w = evalArcfonction(c.arcfonction, u);
  if (w === null) return null;
  return w + c.decalageAffichage;
}

export function evaluerD(c: CandidatD, x: number): number | null {
  if (!c.continu && Math.abs(x - c.p) < 1e-9) return null;
  const inner = c.continu ? c.k * (x - c.p) : c.k / (x - c.p);
  return c.c + Math.atan(inner);
}

export function evaluerE(c: CandidatE, x: number): number | null {
  if (x < -1 || x > 1) return null;
  const w = c.arcfonction === "arcsin" ? Math.asin(x) : Math.acos(x);
  let radicande = c.k * w + c.c;
  if (c.ignorerContrainteRacine) radicande = Math.max(0, radicande);
  if (radicande < -1e-9) return null;
  return Math.sqrt(Math.max(0, radicande)) + c.decalageAffichage;
}

export function evaluerF(c: CandidatF, x: number): number | null {
  const u = c.m * x + c.n;
  if (u < -1 || u > 1) return null;
  const w = c.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u);
  return c.carre ? w * w + c.c : w + c.c;
}

export function evaluerCandidat(exercice: ExerciceGraphiquesCyclometriques, index: number, x: number): number | null {
  switch (exercice.famille) {
    case "A":
      return evaluerA(exercice.candidats[index], x);
    case "B":
      return evaluerB(exercice.candidats[index], x);
    case "C":
      return evaluerC(exercice.candidats[index], x);
    case "D":
      return evaluerD(exercice.candidats[index], x);
    case "E":
      return evaluerE(exercice.candidats[index], x);
    case "F":
      return evaluerF(exercice.candidats[index], x);
  }
}

// ============================================================================
// Fenêtre d'affichage commune aux 4 options — MÊME échelle sur les 4 (contrainte impérative de la
// spec) : bornée par famille (jamais dérivée du domaine du seul candidat réel, qui peut différer
// d'un distracteur à l'autre), puis l'étendue verticale est déterminée en échantillonnant TOUS les
// candidats sur cette fenêtre commune.
// ============================================================================

export interface ViewBoxGraphiqueCyclo {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function fenetreX(exercice: ExerciceGraphiquesCyclometriques): [number, number] {
  switch (exercice.famille) {
    case "A": {
      const bornes = exercice.candidats.map((c) => [(-1 - c.n) / c.m, (1 - c.n) / c.m]).flat();
      return [Math.min(...bornes) - 0.6, Math.max(...bornes) + 0.6];
    }
    case "B":
      return [-10, 10];
    case "C":
      return exercice.reel.arcfonction === "arctan" ? [-4, 4] : [(exercice.domaineInf as number) - 0.6, (exercice.domaineSup as number) + 0.6];
    case "D": {
      const ps = exercice.candidats.map((c) => c.p);
      return [Math.min(...ps) - 4, Math.max(...ps) + 4];
    }
    case "E":
      return [-1.15, 1.15];
    case "F": {
      const x0s = exercice.candidats.map((c) => -c.n / c.m);
      return [Math.min(...x0s) - 2.5, Math.max(...x0s) + 2.5];
    }
  }
}

/**
 * Densité de grille cible, partagée avec `GrapheOptionCyclo.tsx` (`GrilleAdaptative`) — DOIT rester
 * la même valeur des deux côtés (voir le "7ᵉ piège" documenté sur `etendreViewBoxPourEtiquettes`,
 * `ui/mafsTransformation.ts` : un pas de clairance calculé avec une cible différente de celle
 * RÉELLEMENT rendue invaliderait la marge anti-rognage ci-dessous) — exportée pour que le composant
 * l'importe telle quelle plutôt que de dupliquer le nombre.
 */
export const CIBLE_NOMBRE_LIGNES_QCM = 6;

/** Composition finale du viewBox — voir `assurerAxesVisibles`/`etendreViewBoxPourEtiquettes`
 * (`ui/mafsTransformation.ts`) pour la justification de chaque étape : la 1ʳᵉ garantit que les 2
 * axes (x=0/y=0) restent dans le cadre, la 2ᵉ garantit la clairance des étiquettes de graduation au
 * bord (jamais un chiffre à moitié rogné) tout en forçant le ratio EXACT du conteneur — `ratio=1`
 * ici, jamais `RATIO_GRAPHE` (1,5) : ces 4 graphiques sont CARRÉS (`largeur===hauteur`,
 * `EtapeSelectionGraphiqueQCM.tsx`), pas le ratio 3:2 des graphes 4e/5e usuels — un ratio erroné
 * réintroduirait précisément la déformation que `preserveAspectRatio={false}` sert à éviter sur ces
 * 5 générateurs (voir la doc de `GrapheOptionCyclo.tsx`). */
function finaliserViewBox(x: [number, number], y: [number, number]): ViewBoxGraphiqueCyclo {
  const { x: xFinal, y: yFinal } = assurerAxesVisibles({ x, y });
  return { xMin: xFinal[0], xMax: xFinal[1], yMin: yFinal[0], yMax: yFinal[1] };
}

/** Calcule la fenêtre d'affichage commune aux 4 candidats d'une instance — même échelle imposée
 * (contrainte de la spec). */
export function calculerViewBoxGraphique(exercice: ExerciceGraphiquesCyclometriques): ViewBoxGraphiqueCyclo {
  const [xMin, xMax] = fenetreX(exercice);
  const valeurs: number[] = [];
  for (let index = 0; index < exercice.candidats.length; index++) {
    for (let i = 0; i <= 80; i++) {
      const x = xMin + ((xMax - xMin) * i) / 80;
      const y = evaluerCandidat(exercice, index, x);
      if (y !== null && Number.isFinite(y)) valeurs.push(y);
    }
  }
  if (valeurs.length === 0) return finaliserViewBox([xMin, xMax], [-1, 1]);
  const yMinBrut = Math.min(...valeurs);
  const yMaxBrut = Math.max(...valeurs);
  const marge = Math.max(0.4, (yMaxBrut - yMinBrut) * 0.15);
  return finaliserViewBox([xMin, xMax], [yMinBrut - marge, yMaxBrut + marge]);
}

// ============================================================================
// Formatage du bloc de justification et du récapitulatif final — valeurs génériquement
// irrationnelles (arcsin/arccos/racine) affichées à 2 décimales, jamais la précision flottante
// brute ; valeurs entières affichées telles quelles.
// ============================================================================

export function formatNombreAffiche(v: number): string {
  // Virgule décimale `{,}` et « − » de KaTeX (jamais « 1.57 »).
  return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2).replace(".", "{,}");
}

/** Vrai si la valeur s'écrit exactement avec deux décimales au plus (sinon on écrit « ≈ »). */
function estExacteAuCentieme(v: number): boolean {
  return Math.abs(Math.round(v * 100) / 100 - v) < 1e-9;
}

export const LIBELLE_PARITE: Record<ParticulariteParite, string> = { paire: "Paire", impaire: "Impaire", aucune: "Aucune parité" };

export function formatEnsembleReelApproxLatex(ensemble: { forme: string; points: number[]; morceaux: { inf: number | null; sup: number | null; infInclus: boolean; supInclus: boolean }[] }): string {
  if (ensemble.forme === "reel") return "\\mathbb{R}";
  if (ensemble.forme === "prive_points") return `\\mathbb{R} \\setminus \\{${ensemble.points.map(formatNombreAffiche).join("\\,;\\,")}\\}`;
  return ensemble.morceaux
    .map((m) => {
      const g = m.infInclus ? "[" : "]";
      const d = m.supInclus ? "]" : "[";
      const inf = m.inf === null ? "-\\infty" : formatNombreAffiche(m.inf);
      const sup = m.sup === null ? "+\\infty" : formatNombreAffiche(m.sup);
      return `${g}${inf}\\,;\\,${sup}${d}`;
    })
    .join(" \\cup ");
}

export function formatOrdonneeLatex(ordonnee: { existe: boolean; valeur: number | null }): string {
  if (!ordonnee.existe) return "\\text{n'existe pas}";
  const v = ordonnee.valeur as number;
  return `f(0) ${estExacteAuCentieme(v) ? "=" : "\\approx"} ${formatNombreAffiche(v)}`;
}

export function formatExtremumLatex(extremum: { existe: boolean; valeur: number | null }): string {
  if (!extremum.existe) return "\\text{n'existe pas}";
  const v = extremum.valeur as number;
  return `\\text{valeur } ${estExacteAuCentieme(v) ? "" : "\\approx "}${formatNombreAffiche(v)}`;
}
