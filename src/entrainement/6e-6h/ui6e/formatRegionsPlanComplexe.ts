import type { ConditionRegion, ExerciceRegions, NatureFrontiere, PointEntier } from "../core6e/regionsPlanComplexe.types";
import { conditionEnO, natureDe, ouverture, partieInutile, partieUtile, pointTest, valeurFrontiere, verifie } from "../moteur6e/modeleRegionsPlanComplexe";
import type { PhaseRegions } from "../moteur6e/typesRegionsPlanComplexe";
import { decoupage } from "../moteur6e/verificationRegionsPlanComplexe";
import { affixeLatex } from "./formatLirePlacerPlanComplexe";

/**
 * Couche ui (6e) — textes, aides, options et réponses attendues de `6gen98` « Régions du plan
 * complexe ». Source UNIQUE de ce qu'affichent l'écran, le récapitulatif et l'adaptateur d'export
 * (énoncé papier, corrigé, barème) : les nombres viennent de `moteur6e/modeleRegionsPlanComplexe.ts`.
 *
 * Écriture : signe « − » (KaTeX), `\mathrm{Re}`, `\mathrm{Im}`, `\arg`, arguments en radians ; aides
 * = phrase terminée par « : » puis la formule ; une aide ne donne jamais le résultat final.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface ChampRegions {
  label: FragmentConsigne[];
  placeholder: string;
}

export interface GroupeChamps {
  /** Titre du groupe (la condition) quand l'exercice en a deux, `null` sinon. */
  titre: FragmentConsigne[] | null;
  champs: ChampRegions[];
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ---------------------------------------------------------------------------------------------
// Écriture des conditions.
// ---------------------------------------------------------------------------------------------

/** « z − a » développé : z − 2 + i pour a = 2 − i, z + 3 pour a = −3, z pour a = 0. */
export function zMoinsLatex(p: PointEntier): string {
  let s = "z";
  if (p.x !== 0) s += `${p.x > 0 ? "-" : "+"}${Math.abs(p.x)}`;
  if (p.y !== 0) s += `${p.y > 0 ? "-" : "+"}${Math.abs(p.y) === 1 ? "" : Math.abs(p.y)}i`;
  return s;
}

/** « z − (affixe) » : parenthèses seulement si l'affixe a deux parties ou est négative. */
function differenceLatex(p: PointEntier): string {
  if (p.x === 0 && p.y === 0) return "z-0";
  const a = affixeLatex(p);
  const deuxParties = p.x !== 0 && p.y !== 0;
  return deuxParties || a.startsWith("-") ? `z-(${a})` : `z-${a}`;
}

/** Réécriture « |z − 2 + i| = |z − (2 − i)| » (enveloppe `g` : module ou argument) ; une seule
 * écriture quand les deux coïncident (|z − 1|). */
function reecriture(p: PointEntier, g: (s: string) => string): string {
  const avant = g(zMoinsLatex(p));
  const apres = g(differenceLatex(p));
  return avant === apres ? avant : `${avant}=${apres}`;
}

const enModule = (s: string) => `|${s}|`;
const enArgument = (s: string) => (s === "z" ? "\\arg z" : `\\arg(${s})`);

/** Angle k·π/4 en LaTeX (k entier, de −8 à 8). */
export function angleLatex(k: number): string {
  if (k === 0) return "0";
  const signe = k < 0 ? "-" : "";
  const n = Math.abs(k);
  const table: Record<number, string> = {
    1: "\\frac{\\pi}{4}",
    2: "\\frac{\\pi}{2}",
    3: "\\frac{3\\pi}{4}",
    4: "\\pi",
    5: "\\frac{5\\pi}{4}",
    6: "\\frac{3\\pi}{2}",
    7: "\\frac{7\\pi}{4}",
    8: "2\\pi",
  };
  return signe + table[n];
}

/** θ₂ − θ₁ avec les angles du secteur (« θ₂ − θ₁ » si θ₁ = 0, pour éviter « − 0 »). */
function differenceAngles(c: Extract<ConditionRegion, { type: "secteur" }>): string {
  return c.t1 === 0 ? "\\theta_2-\\theta_1" : `${angleLatex(c.t2)}-${angleParenthese(c.t1)}`;
}

/** Angle entre parenthèses s'il est négatif (dans une différence). */
function angleParenthese(k: number): string {
  return k < 0 ? `\\left(${angleLatex(k)}\\right)` : angleLatex(k);
}

function symbole(superieur: boolean, large: boolean): string {
  if (superieur) return large ? "\\geq" : ">";
  return large ? "\\leq" : "<";
}

function argLatex(s: PointEntier): string {
  return s.x === 0 && s.y === 0 ? "\\arg z" : `\\arg(${zMoinsLatex(s)})`;
}

function partieLatex(axe: "re" | "im"): string {
  return axe === "re" ? "\\mathrm{Re}" : "\\mathrm{Im}";
}

/** La condition, telle qu'écrite dans l'énoncé. */
export function conditionLatex(c: ConditionRegion): string {
  switch (c.type) {
    case "cercle":
      return `|${zMoinsLatex(c.centre)}|${symbole(!c.interieur, c.large)}${c.rayon}`;
    case "demiPlan":
      return `${partieLatex(c.axe)}(${zMoinsLatex(c.w)})${symbole(c.superieur, c.large)}${c.m}`;
    case "mediatrice":
      return `|${zMoinsLatex(c.a)}|${symbole(!c.procheA, c.large)}|${zMoinsLatex(c.b)}|`;
    case "secteur": {
      const s = symbole(false, c.large);
      return `${angleLatex(c.t1)}${s}${argLatex(c.sommet)}${s}${angleLatex(c.t2)}`;
    }
  }
}

/** Les conditions de l'exercice, reliées par « et ». */
export function conditionsFragments(e: ExerciceRegions): FragmentConsigne[] {
  return e.conditions.flatMap((c, i) => [...(i > 0 ? [t(" et ")] : []), l(conditionLatex(c))]);
}

/** La condition où l'inégalité devient une égalité (équation de la frontière). */
export function egaliteLatex(c: ConditionRegion): string {
  switch (c.type) {
    case "cercle":
      return `|${zMoinsLatex(c.centre)}|=${c.rayon}`;
    case "demiPlan":
      return `${partieLatex(c.axe)}(${zMoinsLatex(c.w)})=${c.m}`;
    case "mediatrice":
      return `|${zMoinsLatex(c.a)}|=|${zMoinsLatex(c.b)}|`;
    case "secteur":
      return `${argLatex(c.sommet)}=${angleLatex(c.t1)},\\quad ${argLatex(c.sommet)}=${angleLatex(c.t2)}`;
  }
}

function pointNomme(nom: string, p: PointEntier): string {
  return `${nom}(${affixeLatex(p)})`;
}

/** Variable de frontière : x pour Re, y pour Im. */
function variable(axe: "re" | "im"): string {
  return axe === "re" ? "x" : "y";
}

// ---------------------------------------------------------------------------------------------
// Natures, bord : options des choix fermés.
// ---------------------------------------------------------------------------------------------

export const NATURE_FRAGMENTS: Record<NatureFrontiere, FragmentConsigne[]> = {
  cercle: [t("Un cercle")],
  verticale: [t("Une droite verticale (parallèle à l'axe imaginaire)")],
  horizontale: [t("Une droite horizontale (parallèle à l'axe réel)")],
  mediatrice: [t("La médiatrice d'un segment")],
  demiDroites: [t("Deux demi-droites de même origine")],
};

export const NATURE_COURTE: Record<NatureFrontiere, string> = {
  cercle: "cercle",
  verticale: "droite verticale",
  horizontale: "droite horizontale",
  mediatrice: "médiatrice d'un segment",
  demiDroites: "deux demi-droites de même origine",
};

const ORDRE_NATURES: NatureFrontiere[] = ["cercle", "verticale", "horizontale", "mediatrice", "demiDroites"];

export function optionsNature(): OptionChoix[] {
  return ORDRE_NATURES.map((id) => ({ id, fragments: NATURE_FRAGMENTS[id] }));
}

export const BORD_FRAGMENTS: Record<"inclus" | "exclu", FragmentConsigne[]> = {
  inclus: [t("Oui : la frontière fait partie de E (bord inclus, trait plein)")],
  exclu: [t("Non : la frontière ne fait pas partie de E (bord exclu, trait pointillé)")],
};

export function optionsBord(): OptionChoix[] {
  return (["inclus", "exclu"] as const).map((id) => ({ id, fragments: BORD_FRAGMENTS[id] }));
}

/** Titre d'un groupe (une condition) quand l'exercice en a deux. */
export function titresGroupes(e: ExerciceRegions): FragmentConsigne[][] | null {
  if (e.conditions.length < 2) return null;
  return e.conditions.map((c, i) => [t(`Condition ${i + 1} : `), l(conditionLatex(c))]);
}

// ---------------------------------------------------------------------------------------------
// Libellés, consignes, champs.
// ---------------------------------------------------------------------------------------------

export const LIBELLE_PHASE: Record<PhaseRegions, string> = {
  nature: "Nature de la frontière",
  elements: "Éléments de la frontière",
  bord: "Bord inclus ?",
  region: "Région E",
};

export function consigneGenerale(e: ExerciceRegions): FragmentConsigne[] {
  return [t("On considère l'ensemble E des points M du plan complexe dont l'affixe "), l("z"), t(" vérifie "), ...conditionsFragments(e), t(".")];
}

function consigneElementsCondition(c: ConditionRegion): FragmentConsigne[] {
  switch (c.type) {
    case "cercle":
      return [t("donne l'affixe du centre Ω (forme "), l("a+bi"), t(") et le rayon du cercle")];
    case "demiPlan":
      return [t(`donne l'équation de la droite (valeur de ${variable(c.axe)})`)];
    case "mediatrice":
      return [t("écris la condition sous la forme "), l("|z-a|\\ \\square\\ |z-b|"), t(" : donne l'affixe "), l("a"), t(" de A et l'affixe "), l("b"), t(" de B")];
    case "secteur":
      return [t("donne l'affixe du sommet S (forme "), l("a+bi"), t(") et l'angle formé par les deux demi-droites (en radians)")];
  }
}

export function consigneEcran(e: ExerciceRegions, phase: PhaseRegions): FragmentConsigne[] {
  const deux = e.conditions.length > 1;
  switch (phase) {
    case "nature":
      return deux
        ? [t("Pour chacune des deux conditions, quelle est la nature de sa frontière (les points où l'inégalité devient une égalité) ?")]
        : [t("Quelle est la nature de la frontière de E (les points où l'inégalité devient une égalité) ?")];
    case "elements": {
      if (deux) return [t("Donne les éléments de chaque frontière (centre et rayon du cercle, équation de la droite).")];
      const corps = consigneElementsCondition(e.conditions[0]);
      const premier = corps[0];
      return [t(`Pour cette frontière, ${premier.valeur}`), ...corps.slice(1), t(".")];
    }
    case "bord":
      return deux ? [t("Pour chaque condition, sa frontière fait-elle partie de E ?")] : [t("La frontière fait-elle partie de E ?")];
    case "region":
      return [t("Laquelle de ces quatre figures représente l'ensemble E (région colorée) ?")];
  }
}

function champsCondition(c: ConditionRegion): ChampRegions[] {
  switch (c.type) {
    case "cercle":
      return [
        { label: [t("affixe du centre Ω : ")], placeholder: "ex : −1+4i" },
        { label: [t("rayon : ")], placeholder: "ex : 5" },
      ];
    case "demiPlan":
      return [{ label: [t("frontière : droite d'équation "), l(`${variable(c.axe)}=`)], placeholder: "ex : −4" }];
    case "mediatrice":
      return [
        { label: [t("affixe de A : "), l("a=")], placeholder: "ex : 4−i" },
        { label: [t("affixe de B : "), l("b=")], placeholder: "ex : −2i" },
      ];
    case "secteur":
      return [
        { label: [t("affixe du sommet S : ")], placeholder: "ex : −2+i" },
        { label: [t("angle entre les deux demi-droites : ")], placeholder: "ex : 7π/4" },
      ];
  }
}

export function groupesChamps(e: ExerciceRegions): GroupeChamps[] {
  const titres = titresGroupes(e);
  return e.conditions.map((c, i) => ({ titre: titres ? titres[i] : null, champs: champsCondition(c) }));
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux sur l'écran de saisie, un seul sur les choix fermés).
// ---------------------------------------------------------------------------------------------

/** Point test de l'écran « région » (et du corrigé). Secteur : un point sur la demi-droite d'angle
 * t1 + π/4 (dans le secteur) — ou t2 + π/4 si l'ouverture vaut π/4 —, pour un argument exact. */
export function pointTestRegion(e: ExerciceRegions): PointEntier {
  const c = e.conditions[0];
  if (e.conditions.length === 1 && c.type === "secteur") {
    const k = ouverture(c) >= 2 ? c.t1 + 1 : c.t2 + 1;
    const a = (k * Math.PI) / 4;
    return { x: c.sommet.x + Math.round(Math.cos(a)), y: c.sommet.y + Math.round(Math.sin(a)) };
  }
  return pointTest(e);
}

export function aideNiveau1(e: ExerciceRegions, phase: PhaseRegions): AideAvecLatex {
  switch (phase) {
    case "nature":
      return {
        texte:
          "Remplace l'inégalité par une égalité, puis traduis-la en géométrie : le module d'une différence est une distance entre deux points, la partie réelle est l'abscisse de M, la partie imaginaire son ordonnée, l'argument d'une différence est l'angle d'une demi-droite avec l'axe réel. Frontière :",
        latex: e.conditions.map(egaliteLatex).join(",\\qquad "),
      };
    case "elements": {
      const types = new Set(e.conditions.map((c) => c.type));
      if (types.has("demiPlan") && !types.has("cercle")) {
        const c = e.conditions.find((x) => x.type === "demiPlan") as Extract<ConditionRegion, { type: "demiPlan" }>;
        return estOrigineW(c)
          ? { texte: "La partie réelle de z est l'abscisse de M, sa partie imaginaire son ordonnée :", latex: "z=x+yi,\\quad \\mathrm{Re}(z)=x,\\quad \\mathrm{Im}(z)=y" }
          : { texte: "Écris z sous la forme x + yi, puis calcule la partie demandée de la différence : seule la partie correspondante de w intervient :", latex: "z-(c+di)=(x-c)+(y-d)i" };
      }
      if (types.has("secteur")) return { texte: "Fais apparaître, dans l'argument, la différence entre z et l'affixe du sommet ; l'angle entre les deux demi-droites est la différence des deux angles :", latex: "z-c-di=z-(c+di),\\qquad \\theta_2-\\theta_1" };
      if (types.has("mediatrice")) return { texte: "Dans chaque module, fais apparaître la différence entre z et l'affixe d'un point (attention aux signes) : chaque module est la distance de M à ce point :", latex: "z-c-di=z-(c+di),\\qquad z+c+di=z-(-c-di)" };
      return { texte: "Dans le module, fais apparaître la différence entre z et l'affixe du centre (attention aux signes) ; le nombre auquel on compare le module est le rayon :", latex: "z-c-di=z-(c+di),\\qquad z+c+di=z-(-c-di)" };
    }
    case "bord":
      return {
        texte: `Une inégalité large (≤ ou ≥) contient le cas d'égalité : les points de la frontière vérifient alors la condition. Une inégalité stricte (< ou >) les exclut.${e.conditions.some((c) => c.type === "secteur") ? " Le sommet d'un secteur est toujours exclu : l'argument de 0 n'existe pas." : ""}`,
        latex: null,
      };
    case "region": {
      const p = pointTestRegion(e);
      return {
        texte: `Teste un point qui n'est sur aucune frontière, par exemple T(${nombreTexte(p.x)} ; ${nombreTexte(p.y)}) : remplace z par son affixe dans ${e.conditions.length > 1 ? "chaque condition" : "la condition"}, puis garde le côté qui contient T s'il la vérifie (l'autre côté sinon) :`,
        latex: [`z_T=${affixeLatex(p)}`, ...e.conditions.map(conditionLatex)].join(",\\qquad "),
      };
    }
  }
}

/** Entier en texte brut avec le signe moins typographique. */
function nombreTexte(v: number): string {
  return String(v).replace("-", "−");
}

function estOrigineW(c: Extract<ConditionRegion, { type: "demiPlan" }>): boolean {
  return c.w.x === 0 && c.w.y === 0;
}

/** Réécriture d'une condition faisant apparaître ses éléments, sans les donner (aide 2). */
function aide2Condition(c: ConditionRegion): string {
  switch (c.type) {
    case "cercle":
      return conditionEnO(c) ? `|z|=|z-0|` : `|${zMoinsLatex(c.centre)}|=|z-(\\ \\ldots\\ )|`;
    case "demiPlan":
      if (estOrigineW(c)) return `${partieLatex(c.axe)}(z)=${variable(c.axe)}`;
      return `${partieLatex(c.axe)}(${zMoinsLatex(c.w)})=${variable(c.axe)}${partieUtile(c) > 0 ? "-" : "+"}${Math.abs(partieUtile(c))}`;
    case "mediatrice":
      return `|${zMoinsLatex(c.a)}|=|z-(\\ \\ldots\\ )|,\\quad |${zMoinsLatex(c.b)}|=|z-(\\ \\ldots\\ )|`;
    case "secteur":
      return `${argLatex(c.sommet)}=\\arg(z-(\\ \\ldots\\ )),\\quad ${differenceAngles(c)}=\\ \\ldots`;
  }
}

export function aideNiveau2(e: ExerciceRegions, phase: PhaseRegions): AideAvecLatex {
  if (phase !== "elements") return { texte: "", latex: null };
  const c0 = e.conditions[0];
  const texte =
    e.conditions.length > 1
      ? "Réécris chaque condition avec l'abscisse, l'ordonnée ou la distance au centre (le nombre dans une parenthèse est l'affixe du centre), puis lis les éléments :"
      : c0.type === "demiPlan"
        ? estOrigineW(c0)
          ? "La condition porte directement sur une coordonnée de M ; lis la valeur qui la borne :"
          : "Voici la partie utile de la différence ; écris l'inégalité correspondante, puis isole la variable pour obtenir l'équation de la frontière :"
        : "Complète la réécriture (le nombre dans la parenthèse est l'affixe cherchée), puis calcule ce qui reste :";
  return { texte, latex: e.conditions.map(aide2Condition).join(",\\qquad ") };
}

// ---------------------------------------------------------------------------------------------
// Descriptions (réponses attendues, corrigé, récapitulatif).
// ---------------------------------------------------------------------------------------------

export function descriptionFrontiere(c: ConditionRegion): FragmentConsigne[] {
  switch (c.type) {
    case "cercle":
      return [t("le cercle de centre "), l(pointNomme("\\Omega", c.centre)), t(" et de rayon "), l(String(c.rayon))];
    case "demiPlan":
      return [t(`la droite ${c.axe === "re" ? "verticale" : "horizontale"} d'équation `), l(`${variable(c.axe)}=${valeurFrontiere(c)}`)];
    case "mediatrice":
      return [t("la médiatrice du segment [AB], avec "), l(pointNomme("A", c.a)), t(" et "), l(pointNomme("B", c.b))];
    case "secteur":
      return [
        t("les deux demi-droites d'origine "),
        l(pointNomme("S", c.sommet)),
        t(" d'angles "),
        l(angleLatex(c.t1)),
        t(" et "),
        l(angleLatex(c.t2)),
        t(" avec l'axe réel, qui forment un angle de "),
        l(angleLatex(ouverture(c))),
      ];
  }
}

function positionDemiPlan(c: Extract<ConditionRegion, { type: "demiPlan" }>): string {
  if (c.axe === "re") return c.superieur ? "à droite" : "à gauche";
  return c.superieur ? "au-dessus" : "en dessous";
}

export function descriptionRegionCondition(c: ConditionRegion): FragmentConsigne[] {
  switch (c.type) {
    case "cercle":
      return [
        t(c.interieur ? (c.large ? "le disque fermé de centre " : "le disque ouvert de centre ") : "l'extérieur du disque de centre "),
        l(pointNomme("\\Omega", c.centre)),
        t(" et de rayon "),
        l(String(c.rayon)),
        t(c.large ? " (cercle compris)" : " (cercle exclu)"),
      ];
    case "demiPlan":
      return [t(`le demi-plan situé ${positionDemiPlan(c)} de la droite d'équation `), l(`${variable(c.axe)}=${valeurFrontiere(c)}`), t(c.large ? " (droite comprise)" : " (droite exclue)")];
    case "mediatrice":
      return [
        t("le demi-plan des points plus proches de "),
        l(c.procheA ? pointNomme("A", c.a) : pointNomme("B", c.b)),
        t(" que de "),
        l(c.procheA ? pointNomme("B", c.b) : pointNomme("A", c.a)),
        t(", limité par la médiatrice de [AB] "),
        t(c.large ? "(comprise)" : "(exclue)"),
      ];
    case "secteur":
      return [
        t("le secteur angulaire de sommet "),
        l(pointNomme("S", c.sommet)),
        t(" balayé de "),
        l(angleLatex(c.t1)),
        t(" à "),
        l(angleLatex(c.t2)),
        t(" dans le sens trigonométrique (ouverture "),
        l(angleLatex(ouverture(c))),
        t(c.large ? "), demi-droites comprises, sommet S exclu" : "), demi-droites et sommet S exclus"),
      ];
  }
}

export function descriptionRegion(e: ExerciceRegions): FragmentConsigne[] {
  if (e.conditions.length === 1) return descriptionRegionCondition(e.conditions[0]);
  return [t("la partie commune aux deux régions : "), ...descriptionRegionCondition(e.conditions[0]), t(" ; "), ...descriptionRegionCondition(e.conditions[1])];
}

function majuscule(fr: FragmentConsigne[]): FragmentConsigne[] {
  return fr.map((f, i) => (i === 0 && f.type === "texte" ? t(f.valeur.charAt(0).toUpperCase() + f.valeur.slice(1)) : f));
}

/** Éléments d'une condition en LaTeX (réponse de l'écran « éléments »). */
export function elementsLatex(c: ConditionRegion): string {
  switch (c.type) {
    case "cercle":
      return `z_\\Omega=${affixeLatex(c.centre)},\\quad r=${c.rayon}`;
    case "demiPlan":
      return `${variable(c.axe)}=${valeurFrontiere(c)}`;
    case "mediatrice":
      return `a=${affixeLatex(c.a)},\\quad b=${affixeLatex(c.b)}`;
    case "secteur":
      return `z_S=${affixeLatex(c.sommet)},\\quad \\theta_2-\\theta_1=${angleLatex(ouverture(c))}`;
  }
}

/** Réponse d'un écran sous forme de fragments (écran, corrigé, barème). */
export function reponseFragments(e: ExerciceRegions, phase: PhaseRegions): FragmentConsigne[] {
  const deux = e.conditions.length > 1;
  const parCondition = (f: (c: ConditionRegion) => FragmentConsigne[]): FragmentConsigne[] =>
    e.conditions.flatMap((c, i) => [...(i > 0 ? [t(" ; ")] : []), ...(deux ? [t(`(${i + 1}) `)] : []), ...f(c)]);
  switch (phase) {
    case "nature":
      return parCondition((c) => [t(NATURE_COURTE[natureDe(c)])]);
    case "elements":
      return parCondition((c) => descriptionFrontiere(c));
    case "bord":
      return parCondition((c) => [t(c.large ? "bord inclus (inégalité large, trait plein)" : "bord exclu (inégalité stricte, trait pointillé)")]);
    case "region":
      return majuscule(descriptionRegion(e));
  }
}

/** Ligne du récapitulatif « Ce qu'on sait déjà ». */
export function valeurRecapitulatif(e: ExerciceRegions, phase: PhaseRegions): { valeur: string; estLatex: boolean } {
  const deux = e.conditions.length > 1;
  const prefixe = (i: number) => (deux ? `(${i + 1}) ` : "");
  switch (phase) {
    case "nature":
      return { valeur: e.conditions.map((c, i) => prefixe(i) + NATURE_COURTE[natureDe(c)]).join(" ; "), estLatex: false };
    case "elements":
      return { valeur: e.conditions.map(elementsLatex).join(";\\qquad "), estLatex: true };
    case "bord":
      return { valeur: e.conditions.map((c, i) => prefixe(i) + (c.large ? "bord inclus" : "bord exclu")).join(" ; "), estLatex: false };
    case "region":
      return { valeur: "figure choisie", estLatex: false };
  }
}

// ---------------------------------------------------------------------------------------------
// Diagnostics (message ciblé après une tentative fausse — jamais la réponse).
// ---------------------------------------------------------------------------------------------

const MESSAGES_ELEMENTS: Record<string, FragmentConsigne[]> = {
  "centre:signe": [t("Centre : attention aux signes — "), l("|z-a|"), t(" est la distance au point d'affixe "), l("a"), t(", donc "), l("|z+c|=|z-(-c)|"), t(".")],
  "centre:partiel": [t("Centre : une seule des deux parties a le bon signe. Réécris la condition sous la forme "), l("|z-(\\ldots)|"), t(".")],
  "centre:autre": [t("Centre incorrect : réécris la condition sous la forme "), l("|z-a|"), t(" ; le centre a pour affixe "), l("a"), t(".")],
  "rayon:carre": [t("Rayon : la condition porte sur la distance elle-même, pas sur son carré.")],
  "rayon:autre": [t("Rayon incorrect : c'est le nombre réel comparé au module.")],
  "k:signe": [t("Tu as retranché la partie de w au lieu de l'ajouter : de "), l("x-c\\geq m"), t(" on tire "), l("x\\geq m+c"), t(" (même règle pour y).")],
  "k:oubli": [t("La partie de w intervient : "), l("\\mathrm{Re}(z-w)=x-\\mathrm{Re}(w)"), t(", il faut la faire passer de l'autre côté.")],
  "k:partie": [t("Tu as utilisé la mauvaise partie de w : dans "), l("\\mathrm{Re}(z-w)"), t(" seule la partie réelle de w compte (et seule la partie imaginaire dans "), l("\\mathrm{Im}(z-w)"), t(").")],
  "k:autre": [t("Équation incorrecte : écris "), l("z=x+yi"), t(", calcule la partie demandée, puis isole la variable.")],
  "ab:echange": [t("Tu as échangé A et B : a est dans le module de gauche, b dans celui de droite.")],
  "A:signe": [t("Affixe de A : attention aux signes — "), l("|z+c|=|z-(-c)|"), t(".")],
  "A:partiel": [t("Affixe de A : une seule des deux parties a le bon signe.")],
  "A:autre": [t("Affixe de A incorrecte : réécris le module de gauche sous la forme "), l("|z-a|"), t(".")],
  "B:signe": [t("Affixe de B : attention aux signes — "), l("|z+c|=|z-(-c)|"), t(" (et "), l("|z|=|z-0|"), t(").")],
  "B:partiel": [t("Affixe de B : une seule des deux parties a le bon signe.")],
  "B:autre": [t("Affixe de B incorrecte : réécris le module de droite sous la forme "), l("|z-b|"), t(" (si c'est "), l("|z|"), t(", alors "), l("b=0"), t(").")],
  "sommet:signe": [t("Sommet : attention aux signes — "), l("\\arg(z+c)=\\arg(z-(-c))"), t(".")],
  "sommet:partiel": [t("Sommet : une seule des deux parties a le bon signe.")],
  "sommet:autre": [t("Sommet incorrect : réécris l'argument sous la forme "), l("\\arg(z-a)"), t(" ; le sommet a pour affixe "), l("a"), t(".")],
  "ouverture:complement": [t("Tu as donné l'angle de l'autre secteur : l'angle cherché va de "), l("\\theta_1"), t(" à "), l("\\theta_2"), t(" dans le sens trigonométrique.")],
  "ouverture:somme": [t("Tu as additionné les deux angles : l'angle entre les demi-droites est leur différence.")],
  "ouverture:autre": [t("Angle incorrect : c'est la différence entre le plus grand et le plus petit des deux angles.")],
};

export function messageDiagnostic(e: ExerciceRegions, phase: PhaseRegions, id: string): FragmentConsigne[] {
  if (phase === "nature") return [t(e.conditions.length > 1 ? "Au moins une nature ne convient pas." : "Ce n'est pas la bonne nature de frontière.")];
  if (phase === "bord") return [t("Ce n'est pas le bon choix.")];
  if (phase === "region") return [t("Ce n'est pas la bonne figure.")];
  const [num, cle] = id.split("|");
  const message = MESSAGES_ELEMENTS[cle] ?? [t("Élément incorrect.")];
  return e.conditions.length > 1 ? [t(`Condition ${num} — `), ...message] : message;
}

// ---------------------------------------------------------------------------------------------
// Corrigé : méthode, calculs, pièges.
// ---------------------------------------------------------------------------------------------

const TRADUCTION: Record<NatureFrontiere, FragmentConsigne[]> = {
  cercle: [l("|z-a|=r"), t(" : la distance AM vaut r, M décrit le cercle de centre A et de rayon r.")],
  verticale: [l("\\mathrm{Re}(z)=x"), t(" : une condition « x = k » décrit une droite verticale.")],
  horizontale: [l("\\mathrm{Im}(z)=y"), t(" : une condition « y = k » décrit une droite horizontale.")],
  mediatrice: [l("|z-a|=|z-b|"), t(" : AM = BM, M est à égale distance de A et de B, il décrit la médiatrice de [AB].")],
  demiDroites: [l("\\arg(z-a)=\\theta"), t(" : la demi-droite [AM) fait l'angle θ avec l'axe réel, M décrit une demi-droite d'origine A (A exclu).")],
};

export function methodeFragments(e: ExerciceRegions, phase: PhaseRegions): FragmentConsigne[] {
  switch (phase) {
    case "nature":
      return [t("La frontière est l'ensemble des points où l'inégalité devient une égalité. "), ...e.conditions.flatMap((c, i) => [...(i > 0 ? [t(" ")] : []), ...TRADUCTION[natureDe(c)]])];
    case "elements":
      return [t("On réécrit chaque module sous la forme "), l("|z-a|"), t(" (distance au point d'affixe a), ou on écrit "), l("z=x+yi"), t(" pour une partie réelle ou imaginaire.")];
    case "bord":
      return [t("Inégalité large (≤, ≥) : le cas d'égalité est permis, la frontière fait partie de E (trait plein). Inégalité stricte (<, >) : elle en est exclue (pointillés).")];
    case "region":
      return [t("On teste un point qui n'est sur aucune frontière : s'il vérifie la condition, la région est le côté qui le contient ; sinon, c'est l'autre côté.")];
  }
}

function racineLatex(n: number): string {
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? String(r) : `\\sqrt{${n}}`;
}

function carreSigne(v: number): string {
  return v < 0 ? `(${v})^2` : `${v}^2`;
}

/** Calcul d'appartenance du point test T à une condition (corrigé, étape « région »). */
function calculTest(c: ConditionRegion, p: PointEntier): string {
  switch (c.type) {
    case "cercle": {
      const dx = p.x - c.centre.x;
      const dy = p.y - c.centre.y;
      const n = dx * dx + dy * dy;
      return `T\\Omega=\\sqrt{${carreSigne(dx)}+${carreSigne(dy)}}=${racineLatex(n)}${symboleTest(Math.sqrt(n), c.rayon)}${c.rayon}`;
    }
    case "demiPlan":
      return `${variable(c.axe)}_T=${c.axe === "re" ? p.x : p.y}${symboleTest(c.axe === "re" ? p.x : p.y, valeurFrontiere(c))}${valeurFrontiere(c)}`;
    case "mediatrice": {
      const na = (p.x - c.a.x) ** 2 + (p.y - c.a.y) ** 2;
      const nb = (p.x - c.b.x) ** 2 + (p.y - c.b.y) ** 2;
      return `TA=${racineLatex(na)},\\quad TB=${racineLatex(nb)},\\quad TA${symboleTest(Math.sqrt(na), Math.sqrt(nb))}TB`;
    }
    case "secteur": {
      const d = { x: p.x - c.sommet.x, y: p.y - c.sommet.y };
      const k = Math.round((Math.atan2(d.y, d.x) / Math.PI) * 4);
      const kk = k === -4 ? 4 : k;
      return `\\arg(z_T-z_S)=\\arg(${affixeLatex(d)})=${angleLatex(kk)}`;
    }
  }
}

function symboleTest(a: number, b: number): string {
  if (Math.abs(a - b) < 1e-9) return "=";
  return a < b ? "<" : ">";
}

export function calculEtape(e: ExerciceRegions, phase: PhaseRegions): string[] {
  switch (phase) {
    case "nature":
      return e.conditions.map(egaliteLatex);
    case "elements":
      return e.conditions.map((c) => {
        switch (c.type) {
          case "cercle":
            return conditionEnO(c) ? `|z|=|z-0|=\\Omega M\\ \\Rightarrow\\ z_\\Omega=0,\\quad r=${c.rayon}` : `${reecriture(c.centre, enModule)}=\\Omega M\\ \\Rightarrow\\ ${elementsLatex(c)}`;
          case "demiPlan": {
            const v = variable(c.axe);
            if (estOrigineW(c)) return `${partieLatex(c.axe)}(z)=${v}\\ \\Rightarrow\\ ${v}=${c.m}`;
            const u = partieUtile(c);
            return `${partieLatex(c.axe)}(${zMoinsLatex(c.w)})=${v}${u > 0 ? "-" : "+"}${Math.abs(u)}\\ \\Rightarrow\\ ${v}${u > 0 ? "-" : "+"}${Math.abs(u)}=${c.m}\\iff ${v}=${valeurFrontiere(c)}`;
          }
          case "mediatrice":
            return `${reecriture(c.a, enModule)}=AM,\\quad ${reecriture(c.b, enModule)}=BM`;
          case "secteur":
            return `${reecriture(c.sommet, enArgument)},\\quad ${differenceAngles(c)}=${angleLatex(ouverture(c))}`;
        }
      });
    case "bord":
      return [];
    case "region": {
      const p = pointTestRegion(e);
      return [`z_T=${affixeLatex(p)}`, ...e.conditions.map((c) => calculTest(c, p))];
    }
  }
}

/** Conclusion du test (corrigé, étape « région »). */
export function conclusionTest(e: ExerciceRegions): FragmentConsigne[] {
  const p = pointTestRegion(e);
  return e.conditions.flatMap((c, i) => {
    const ok = verifie(c, p.x, p.y);
    const qui = e.conditions.length > 1 ? `la condition ${i + 1}` : "la condition";
    return [...(i > 0 ? [t(" ")] : []), t(`T ${ok ? "vérifie" : "ne vérifie pas"} ${qui} : la région est ${ok ? "le côté qui contient T" : "le côté opposé à T"}.`)];
  });
}

function piegeElements(c: ConditionRegion): FragmentConsigne[] {
  switch (c.type) {
    case "cercle":
      return conditionEnO(c)
        ? [t("Prendre "), l(`${c.rayon * c.rayon}`), t(" ou "), l(`\\sqrt{${c.rayon}}`), t(" pour rayon : le rayon est le nombre comparé à la distance, ici "), l(String(c.rayon)), t(".")]
        : [t("Lire le centre avec le mauvais signe : "), l(reecriture(c.centre, enModule)), t(", le centre est "), l(affixeLatex(c.centre)), t(", pas "), l(affixeLatex({ x: -c.centre.x, y: -c.centre.y })), t(".")];
    case "demiPlan":
      if (estOrigineW(c)) return [t("Confondre "), l("\\mathrm{Re}(z)=k"), t(" (droite verticale) et "), l("\\mathrm{Im}(z)=k"), t(" (droite horizontale).")];
      {
        const v = variable(c.axe);
        const u = partieUtile(c);
        return [
          t("Retrancher au lieu d'ajouter en isolant "),
          l(v),
          t(" : "),
          l(`${v}${u > 0 ? "-" : "+"}${Math.abs(u)}=${c.m}`),
          t(" donne "),
          l(`${v}=${valeurFrontiere(c)}`),
          t(", pas "),
          l(`${v}=${c.m - u}`),
          t(partieInutile(c) !== 0 ? `. La partie ${c.axe === "re" ? "imaginaire" : "réelle"} de w n'intervient pas.` : "."),
        ];
      }
    case "mediatrice":
      return [t("Prendre la droite (AB) au lieu de la médiatrice de [AB], ou lire A et B avec le mauvais signe.")];
    case "secteur":
      return [t("Donner l'angle de l'autre secteur ("), l(angleLatex(8 - ouverture(c))), t(") ou lire le sommet avec le mauvais signe.")];
  }
}

export function piegeEtape(e: ExerciceRegions, phase: PhaseRegions): FragmentConsigne[] {
  const c = e.conditions[0];
  switch (phase) {
    case "nature":
      if (e.conditions.length > 1) return [t("Confondre la droite verticale "), l("\\mathrm{Re}(z)=k"), t(" et la droite horizontale "), l("\\mathrm{Im}(z)=k"), t(".")];
      switch (c.type) {
        case "cercle":
          return [t("Un module "), l("|z-a|"), t(" est une distance : la frontière est un cercle, jamais une droite.")];
        case "demiPlan":
          return [l("\\mathrm{Re}(z)"), t(" est l'abscisse : "), l("\\mathrm{Re}(z)=k"), t(" donne une droite verticale, "), l("\\mathrm{Im}(z)=k"), t(" une droite horizontale — ne pas les échanger.")];
        case "mediatrice":
          return [l("|z-a|=|z-b|"), t(" n'est pas un cercle : c'est l'égalité de deux distances AM = BM.")];
        case "secteur":
          return [l("\\arg(z-a)=\\theta"), t(" décrit une DEMI-droite d'origine A, pas une droite entière.")];
      }
      break;
    case "elements": {
      const vus = new Set<string>();
      return e.conditions.flatMap((x) => {
        const fr = piegeElements(x);
        const cle = JSON.stringify(fr);
        if (vus.has(cle)) return [];
        const debut = vus.size > 0;
        vus.add(cle);
        return [...(debut ? [t(" ")] : []), ...fr];
      });
    }
    case "bord":
      return c.type === "secteur"
        ? [t("Oublier que le sommet S est toujours exclu (l'argument de 0 n'existe pas), même quand les demi-droites sont comprises.")]
        : [t("Tracer en trait plein une frontière exclue (inégalité stricte), ou en pointillés une frontière incluse (inégalité large).")];
    case "region":
      if (e.conditions.length > 1) return [t("Prendre la réunion (une condition OU l'autre) au lieu de la partie commune : « et » demande les DEUX conditions.")];
      switch (c.type) {
        case "cercle":
          return [t("Inverser intérieur et extérieur : « ≤ r » veut dire à distance AU PLUS r du centre (intérieur), « ≥ r » AU MOINS r (extérieur).")];
        case "demiPlan":
          return [t("Choisir le mauvais côté : « x ≥ k » est à droite de la droite x = k, « y ≥ k » au-dessus de y = k.")];
        case "mediatrice":
          return c.procheA
            ? [l("|z-a|<|z-b|"), t(" signifie AM < BM : M est plus proche de A, donc du côté de A (et non de B).")]
            : [l("|z-a|>|z-b|"), t(" signifie AM > BM : M est plus loin de A, donc plus proche de B — du côté de B (et non de A).")];
        case "secteur":
          return [t("Prendre l'autre secteur : on tourne de "), l("\\theta_1"), t(" à "), l("\\theta_2"), t(" dans le sens trigonométrique (contraire des aiguilles d'une montre).")];
      }
  }
  return [];
}

/** Champs de l'écran « éléments » à plat (pour le composant). */
export function nombreChamps(e: ExerciceRegions): number {
  return decoupage(e).reduce((s, d) => s + d.types.length, 0);
}
