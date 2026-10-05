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
  return formatSomme([termeA, { signe: b >= 0 ? 1 : -1, corps: String(Math.abs(b)) }]);
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
  return c > 0 ? `${corps} + ${c}` : `${corps} - ${Math.abs(c)}`;
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
      // `c` est DÉRIVÉ d'un seuil `w0` tiré en continu (génériquement irrationnel, voir
      // `generateurs6e/graphiquesCyclometriques/familles/E.ts`) — arrondi à 2 décimales pour
      // l'AFFICHAGE uniquement (jamais la valeur stockée dans `reel`/`domaineInf`/`domaineSup`,
      // qui reste exacte pour la vérification et le tracé) : la précision flottante brute produit
      // une chaîne bien plus large que le bloc de données à 375px (`.equation-box`, filet de
      // sécurité `overflow-x:auto` sinon sollicité pour une simple constante). Même convention
      // `.toFixed(2)` déjà utilisée pour les aides niveau 2 de cette famille.
      const cAffiche = Math.round(r.c * 100) / 100;
      return `\\sqrt{${formatCorpsPlusConstante(corps, cAffiche)}}`;
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
  if (radicande < 0) return null;
  return Math.sqrt(radicande) + c.decalageAffichage;
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
// Aides — 2 niveaux, communs à l'écran unique (choix du graphique + justification).
// ============================================================================

export function texteAideNiveau1(exercice: ExerciceGraphiquesCyclometriques): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Calcule le domaine et les deux valeurs extrêmes de l'image avant de regarder les graphiques.", latex: null };
    case "B":
      return { texte: "arctan a un domaine ℝ tout entier et deux asymptotes horizontales — jamais de cassure nette. Repère cette signature.", latex: null };
    case "C":
      return { texte: "La fonction est PAIRE (symétrique par rapport à l'axe des ordonnées) : pose -1 ≤ a·x²+b ≤ 1 pour trouver le domaine.", latex: null };
    case "D":
      return { texte: "Le graphique doit présenter DEUX branches séparées, jamais une courbe continue — cherche où le dénominateur s'annule.", latex: null };
    case "E":
      return {
        texte: "Il y a DEUX contraintes à croiser pour le domaine : le domaine propre de l'arcfonction, ET l'inéquation posée par la racine.",
        latex: null,
      };
    case "F":
      return {
        texte: "La mise au carré transforme une courbe monotone en une courbe qui change de sens — le minimum est atteint là où l'intérieur vaut 0.",
        latex: null,
      };
  }
}

export function texteAideNiveau2(exercice: ExerciceGraphiquesCyclometriques): AideAvecLatex {
  switch (exercice.famille) {
    case "A": {
      const r = exercice.reel;
      const bornes = [(-1 - r.n) / r.m, (1 - r.n) / r.m].sort((a, b) => a - b);
      const base = r.arcfonction === "arcsin" ? [-Math.PI / 2, Math.PI / 2] : [0, Math.PI];
      const image = [r.c + r.k * base[0], r.c + r.k * base[1]].sort((a, b) => a - b);
      return {
        texte: "Domaine et image de f :",
        latex: `x \\in \\left[${bornes[0].toFixed(2)}\\,;\\,${bornes[1].toFixed(2)}\\right], \\quad f(x) \\in \\left[${image[0].toFixed(2)}\\,;\\,${image[1].toFixed(2)}\\right]`,
      };
    }
    case "B": {
      const r = exercice.reel;
      const signe = Math.sign(r.m);
      const l1 = r.c + r.k * signe * (Math.PI / 2);
      const l2 = r.c - r.k * signe * (Math.PI / 2);
      return { texte: "Valeurs des deux asymptotes horizontales :", latex: `y \\to ${l1.toFixed(2)} \\text{ et } y \\to ${l2.toFixed(2)}` };
    }
    case "C":
      return { texte: "Valeur au sommet (x=0), sans dire si c'est un minimum ou un maximum :", latex: `f(0) = ${formatExpressionSommetC(exercice.reel)}` };
    case "D": {
      const r = exercice.reel;
      const gauche = r.k > 0 ? r.c - Math.PI / 2 : r.c + Math.PI / 2;
      const droite = r.k > 0 ? r.c + Math.PI / 2 : r.c - Math.PI / 2;
      return { texte: "Valeurs d'approche à gauche et à droite du point exclu :", latex: `x\\to p^-:\\ y\\to ${gauche.toFixed(2)} \\quad x\\to p^+:\\ y\\to ${droite.toFixed(2)}` };
    }
    case "E": {
      const r = exercice.reel;
      const yInf = evaluerE(r, exercice.domaineInf);
      return { texte: "Valeur de f à l'une des extrémités du domaine :", latex: `f(${exercice.domaineInf.toFixed(2)}) = ${(yInf ?? 0).toFixed(2)}` };
    }
    case "F":
      return { texte: "Valeur de f à l'extremum :", latex: `f(${exercice.positionExtremum}) = ${exercice.reel.c}` };
  }
}

function formatExpressionSommetC(r: CandidatC): string {
  const val = evalArcfonction(r.arcfonction, r.b);
  return val === null ? "\\text{indéfini}" : `${NOM_LATEX[r.arcfonction]}(${r.b}) \\approx ${val.toFixed(2)}`;
}

// ============================================================================
// Formatage du bloc de justification et du récapitulatif final — valeurs génériquement
// irrationnelles (arcsin/arccos/racine) affichées à 2 décimales, jamais la précision flottante
// brute ; valeurs entières affichées telles quelles.
// ============================================================================

export function formatNombreAffiche(v: number): string {
  return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2);
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
  return ordonnee.existe ? `f(0) = ${formatNombreAffiche(ordonnee.valeur as number)}` : "\\text{n'existe pas}";
}

export function formatExtremumLatex(extremum: { existe: boolean; valeur: number | null }): string {
  return extremum.existe ? `\\text{valeur } ${formatNombreAffiche(extremum.valeur as number)}` : "\\text{n'existe pas}";
}
