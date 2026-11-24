/**
 * 5gen25 — JUSTIFICATION d'une association (lot C, décision de l'utilisateur du 24/11, modèle 6gen5) :
 * après l'association (choix fermés, une tentative), l'élève justifie UNE association, choisie par le
 * générateur (la plus confondable : une fonction à deux extremums de préférence, une singularité de
 * catégorie 1 en famille avancée). Champs vérifiés (3 tentatives ; un choix fermé faux clôt l'écran) :
 * - famille A (f ↔ f′) : abscisses des extremums de f_k = zéros de f′ (ou abscisse du point d'inflexion
 *   d'une cubique monotone = extremum de f′) ; « sur ]α ; β[, f est croissante / décroissante » et
 *   « donc f′ y est positive / négative » (deux choix fermés) ;
 * - famille B (f ↔ description) : mêmes lectures, puis f(0) positif / négatif / nul (choix fermé) ;
 * - famille C (symbolique) : dériver f_k (champ f′(x), équivalence numérique) ;
 * - famille avancée : « en x = a, f′ … » (choix fermé : saute, tend vers l'infini, n'existe pas car f
 *   n'est pas continue / pas définie, existe).
 * Fonction PURE de l'exercice : l'écran, le papier, le corrigé et la grille lisent la même spécification.
 */
import type { ExerciceAssociation, FonctionVarieeAssociation, PolynomeAssociation } from "../core5e/association.types";
import { estCategorie1, lettreCorrecte } from "../core5e/association.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { lireNombreDerivees } from "./saisieDerivees";
import { evaluerVariee, extremumsVariee, intervalleApresPremierExtremum } from "../generateurs5e/association/fonctionsVariees";

function diagnostiquerNombreTolerance(texte: string, cible: number, tol: number): StatutVerification {
  const v = lireNombreDerivees(texte.replace(/^[^=]*=/, ""));
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= tol ? "correct" : "not_equivalent";
}

export type ChampJustification =
  | { kind: "nombre"; id: string; label: string; cible: number; groupe?: string }
  | { kind: "expression"; id: string; label: string; cible: (x: number) => number }
  | { kind: "choix"; id: string; label: string; options: { id: string; label: string }[]; bonne: string };

export interface SpecJustification {
  /** Index (0-based) de l'élément numéroté dont on justifie l'association. */
  item: number;
  famille: ExerciceAssociation["famille"];
  champs: ChampJustification[];
}

/** Lecture sur le quadrillage : les extremums sont au demi-carreau près. */
export const TOLERANCE_LECTURE_JUSTIFICATION = 0.26;

function evaluerPoly(c: PolynomeAssociation, x: number): number {
  return c.reduce((s, a, i) => s + a * x ** i, 0);
}

function forme(c: PolynomeAssociation): { signe: 1 | -1; extremums?: [number, number]; inflexion: number; f0: number } {
  const [d, cc, b, a] = c;
  const A = 3 * a;
  const B = 2 * b;
  const disc = B * B - 4 * A * cc;
  const inflexion = -b / (3 * a);
  if (disc <= 1e-9) return { signe: a > 0 ? 1 : -1, inflexion, f0: d };
  const s = Math.sqrt(disc);
  const r = [(-B - s) / (2 * A), (-B + s) / (2 * A)].sort((x, y) => x - y) as [number, number];
  return { signe: a > 0 ? 1 : -1, extremums: r, inflexion, f0: d };
}

function nombreL(x: number): string {
  const r = Math.round(x * 100) / 100;
  return `${r}`.replace(".", "{,}");
}

const SENS = [
  { id: "croissante", label: "croissante" },
  { id: "decroissante", label: "décroissante" },
];
const SIGNE = [
  { id: "positive", label: "positive" },
  { id: "negative", label: "négative" },
];
const OPTIONS_F0 = [
  { id: "dessus", label: "au-dessus de l'origine" },
  { id: "origine", label: "à l'origine" },
  { id: "dessous", label: "en dessous de l'origine" },
];

function champsLecture(c: PolynomeAssociation, k: number, avecSigneDerivee: boolean): ChampJustification[] {
  const fo = forme(c);
  const champs: ChampJustification[] = [];
  let intervalle: string;
  let croissante: boolean;
  if (fo.extremums) {
    const [r1, r2] = fo.extremums;
    champs.push({ kind: "nombre", id: "x1", label: `x_1=`, cible: r1, groupe: "extremums" }, { kind: "nombre", id: "x2", label: `x_2=`, cible: r2, groupe: "extremums" });
    intervalle = `\\left]${nombreL(r1)}\\,;\\,${nombreL(r2)}\\right[`;
    croissante = fo.signe < 0; // a > 0 : maximum puis minimum, f décroît entre les deux
  } else {
    champs.push({ kind: "nombre", id: "inflexion", label: `x_{\\text{inflexion}}=`, cible: fo.inflexion });
    intervalle = `\\left]-4\\,;\\,4\\right[`;
    croissante = fo.signe > 0;
  }
  champs.push({ kind: "choix", id: "sens", label: `Sur $${intervalle}$, $f_${k + 1}$ est :`, options: SENS, bonne: croissante ? "croissante" : "decroissante" });
  if (avecSigneDerivee) champs.push({ kind: "choix", id: "signe", label: "donc $f'$ y est :", options: SIGNE, bonne: croissante ? "positive" : "negative" });
  else {
    const f0 = fo.f0;
    champs.push({
      kind: "choix",
      id: "f0",
      label: `La courbe de $f_${k + 1}$ coupe l'axe des ordonnées :`,
      options: OPTIONS_F0,
      bonne: Math.abs(f0) < 1e-9 ? "origine" : f0 > 0 ? "dessus" : "dessous",
    });
  }
  return champs;
}

/** Fonctions « variées » (lot C, G18) : MÊMES champs que les cubiques — abscisses des sommets (entières,
 * sur les nœuds), sens de variation sur l'intervalle qui suit le premier sommet (jusqu'au sommet
 * suivant, à l'asymptote ou au bord du graphique), puis signe de f′ (A) ou position de f(0) (B). */
function champsLectureVariee(f: FonctionVarieeAssociation, k: number, avecSigneDerivee: boolean): ChampJustification[] {
  const ex = extremumsVariee(f);
  const champs: ChampJustification[] =
    ex.length === 2
      ? [
          { kind: "nombre", id: "x1", label: `x_1=`, cible: ex[0].x, groupe: "extremums" },
          { kind: "nombre", id: "x2", label: `x_2=`, cible: ex[1].x, groupe: "extremums" },
        ]
      : [{ kind: "nombre", id: "x1", label: `x_{\\text{sommet}}=`, cible: ex[0].x, groupe: "extremums" }];
  const { de, a, croissante } = intervalleApresPremierExtremum(f);
  champs.push({ kind: "choix", id: "sens", label: `Sur $\\left]${nombreL(de)}\\,;\\,${nombreL(a)}\\right[$, $f_${k + 1}$ est :`, options: SENS, bonne: croissante ? "croissante" : "decroissante" });
  if (avecSigneDerivee) champs.push({ kind: "choix", id: "signe", label: "donc $f'$ y est :", options: SIGNE, bonne: croissante ? "positive" : "negative" });
  else {
    const f0 = evaluerVariee(f, 0) ?? 0;
    champs.push({ kind: "choix", id: "f0", label: `La courbe de $f_${k + 1}$ coupe l'axe des ordonnées :`, options: OPTIONS_F0, bonne: Math.abs(f0) < 1e-9 ? "origine" : f0 > 0 ? "dessus" : "dessous" });
  }
  return champs;
}

/** LaTeX simple (polynômes, (ax+b)^n, produits) → expression lisible par `evaluerExpressionGenerale`. */
export function latexVersExpression(l: string): string {
  return l.replace(/\\left|\\right/g, "").replace(/\\cdot/g, "*").replace(/\{/g, "(").replace(/\}/g, ")");
}

export function itemJustifie(e: ExerciceAssociation): number {
  if (e.famille === "grapheDerivee" || e.famille === "grapheVerbal") {
    const i = e.fonctions.findIndex((c) => forme(c).extremums !== undefined);
    return i >= 0 ? i : 0;
  }
  if (e.famille === "grapheDeriveeVariee" || e.famille === "grapheVerbalVarie") {
    const i = e.fonctions.findIndex((f) => extremumsVariee(f).length === 2);
    return i >= 0 ? i : 0;
  }
  if (e.famille === "grapheDeriveeAvancee") {
    const cat1 = e.fonctions.findIndex((f) => f.caracteristique !== undefined && estCategorie1(f.caracteristique.type));
    if (cat1 >= 0) return cat1;
    const special = e.fonctions.findIndex((f) => f.caracteristique !== undefined);
    return special >= 0 ? special : 0;
  }
  return 0;
}

export const OPTIONS_SINGULARITE = [
  { id: "saute", label: "f′ saute : pentes à gauche et à droite différentes (point anguleux)" },
  { id: "infini", label: "f′ tend vers l'infini : tangente verticale (ou rebroussement)" },
  { id: "discontinue", label: "f′ n'existe pas : f n'est pas continue (ou pas définie) en ce point" },
  { id: "existe", label: "f′ existe en ce point" },
];

export function specJustification(e: ExerciceAssociation): SpecJustification {
  const k = itemJustifie(e);
  if (e.famille === "grapheDerivee") return { item: k, famille: e.famille, champs: champsLecture(e.fonctions[k], k, true) };
  if (e.famille === "grapheVerbal") return { item: k, famille: e.famille, champs: champsLecture(e.fonctions[k], k, false) };
  if (e.famille === "grapheDeriveeVariee") return { item: k, famille: e.famille, champs: champsLectureVariee(e.fonctions[k], k, true) };
  if (e.famille === "grapheVerbalVarie") return { item: k, famille: e.famille, champs: champsLectureVariee(e.fonctions[k], k, false) };
  if (e.famille === "symbolique") {
    const g = e.gLatex[lettreCorrecte(e.ordreLettres, k)] ?? "0";
    const expr = latexVersExpression(g);
    return { item: k, famille: e.famille, champs: [{ kind: "expression", id: "fp", label: `f_${k + 1}'(x)=`, cible: (x) => evaluerExpressionGenerale(expr, x) }] };
  }
  const car = e.fonctions[k]?.caracteristique;
  const bonne = !car ? "existe" : car.type === "angulaire" ? "saute" : car.type === "cuspide" || car.type === "tangenteVerticale" ? "infini" : "discontinue";
  const a = car ? car.position : 0;
  return { item: k, famille: e.famille, champs: [{ kind: "choix", id: "singularite", label: `En $x=${nombreL(a)}$, que se passe-t-il pour la dérivée de $f_${k + 1}$ ?`, options: OPTIONS_SINGULARITE, bonne }] };
}

export function diagnostiquerJustification(spec: SpecJustification, r: Record<string, string>): Record<string, StatutVerification> {
  const out: Record<string, StatutVerification> = {};
  const extremums = spec.champs.filter((c) => c.kind === "nombre" && c.groupe === "extremums") as Extract<ChampJustification, { kind: "nombre" }>[];
  for (const c of spec.champs) {
    const v = r[c.id] ?? "";
    if (c.kind === "choix") out[c.id] = v === c.bonne ? "correct" : "not_equivalent";
    else if (c.kind === "nombre") {
      // Deux extremums : ordre indifférent.
      if (c.groupe === "extremums") {
        const st = extremums.map((o) => diagnostiquerNombreTolerance(v, o.cible, TOLERANCE_LECTURE_JUSTIFICATION));
        out[c.id] = st.includes("parse_error") ? "parse_error" : st.includes("correct") ? "correct" : "not_equivalent";
      } else out[c.id] = diagnostiquerNombreTolerance(v, c.cible, TOLERANCE_LECTURE_JUSTIFICATION);
    } else {
      try {
        const xs = [0.37, 1.3, -0.8, 2.1];
        let st: StatutVerification = "correct";
        for (const x of xs) {
          const saisie = evaluerExpressionGenerale(v.replace(/[−–—]/g, "-").replace(/^[^=]*=/, ""), x);
          if (!Number.isFinite(saisie)) {
            st = "parse_error";
            break;
          }
          const cible = c.cible(x);
          if (Math.abs(saisie - cible) > 1e-6 * Math.max(1, Math.abs(cible))) st = "not_equivalent";
        }
        out[c.id] = st;
      } catch {
        out[c.id] = "parse_error";
      }
    }
  }
  if (extremums.length === 2) {
    const a = r[extremums[0].id] ?? "";
    const b = r[extremums[1].id] ?? "";
    // Les deux champs ne peuvent pas désigner le même extremum.
    if (out[extremums[0].id] === "correct" && out[extremums[1].id] === "correct") {
      const va = Number(a.replace(",", ".").replace(/[−–—]/g, "-"));
      const vb = Number(b.replace(",", ".").replace(/[−–—]/g, "-"));
      if (Number.isFinite(va) && Number.isFinite(vb) && Math.abs(va - vb) < 0.3) out[extremums[1].id] = "not_equivalent";
    }
  }
  return out;
}

export function choixJustificationErrone(spec: SpecJustification, r: Record<string, string>): boolean {
  const st = diagnostiquerJustification(spec, r);
  return spec.champs.some((c) => c.kind === "choix" && st[c.id] !== "correct");
}

export function saisieJustificationIllisible(spec: SpecJustification, r: Record<string, string>): boolean {
  const st = diagnostiquerJustification(spec, r);
  return spec.champs.some((c) => c.kind !== "choix" && (r[c.id] ?? "").trim() !== "" && st[c.id] === "parse_error");
}

export { evaluerPoly };
