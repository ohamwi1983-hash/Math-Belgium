import type { ExerciceAccumulerGrandeur, ExerciceCo2, ExerciceCuve, ExercicePluieComparer, ExercicePluieSeuil, ExerciceSalle, ExerciceSolaireComparer, ExerciceSolaireSeuil, InstallationSolaire } from "../core6e/accumulerGrandeur.types";
import type { PhaseAccumulerGrandeur } from "../moteur6e/typesAccumulerGrandeur";
import { energieInstallation, modeleNumerique } from "../moteur6e/verificationAccumulerGrandeur";
import { decimalLatex, fractionDepuisValeur, fractionLatex } from "./nombresExactsIntegrales";

/**
 * Couche ui (6e) — textes, aides et réponses attendues de `6gen80` « Accumuler une grandeur ».
 * Une « fiche » par situation (`fiche(e)`) rassemble TOUT ce que l'écran, le récapitulatif et
 * l'adaptateur d'export affichent : énoncé, données, options du choix fermé, consignes, aides,
 * réponses, lignes de calcul du corrigé. Les nombres viennent de `modeleNumerique` (moteur), jamais
 * recalculés ici.
 *
 * Écriture : virgule décimale (`{,}` en LaTeX), unités en `\text{…}`, aides = phrase terminée par
 * « : » puis la formule ; une aide ne donne jamais le résultat final (il reste un calcul à faire).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface OptionModele {
  id: string;
  fragments: FragmentConsigne[];
}

export interface ChampAccumuler {
  label: string;
  placeholder: string;
  /** Champ d'expression en t (aperçu LaTeX affiché) ou valeur numérique. */
  expression: boolean;
}

/** Libellé d'un champ (« F_A(t) = », « V(20) (en L) = », « Énergie (en W·h) ≈ ») en fragments : la
 * partie formule (avant la parenthèse d'unité ou le signe =/≈) passe en KaTeX, le reste en texte. */
export function etiquetteFragments(label: string): FragmentConsigne[] {
  if (/^[A-ZÉ][a-zéè]+ /.test(label)) return [{ type: "texte", valeur: label }];
  const m = /^(.*?)( \(.*)?( [=≈])$/.exec(label);
  if (!m) return [{ type: "texte", valeur: label }];
  const formule = m[1].replace(/−/g, "-").replace(/₁/g, "_1").replace(/₂/g, "_2");
  return [{ type: "latex", valeur: formule }, { type: "texte", valeur: `${m[2] ?? ""}${m[3]}` }];
}

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Décimal LaTeX avec virgule (jusqu'à `d` décimales, zéros inutiles retirés). */
export function dl(x: number, d = 3): string {
  const brut = decimalLatex(x, d);
  // Séparateur de milliers (espace fine) à partir de 10 000 : « 12\,045 ».
  return brut.replace(/^(-?)(\d+)/, (_, signe: string, entiere: string) => signe + (entiere.length > 4 ? entiere.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : entiere));
}

/** Entier en texte brut avec espace insécable des milliers à partir de 10 000 (« 20 500 »). */
export function nt(n: number): string {
  const s = String(n);
  return s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f") : s;
}

/** Facteur numérique devant une expression : 1 → « », sinon sa valeur exacte. */
function facteur(x: number): string {
  return Math.abs(x - 1) < 1e-12 ? "" : exact(x);
}

/** Coefficient devant une variable : 1 → « », 0,5 → « 0{,}5 ». */
function coef(x: number): string {
  return x === 1 ? "" : dl(x);
}

/** Valeur exacte connue : fraction irréductible si elle est rationnelle, sinon décimal. */
function exact(x: number): string {
  const f = fractionDepuisValeur(x, 1000);
  return f ? fractionLatex(f.num, f.den) : dl(x);
}

const U = {
  L: "\\ \\text{L}",
  min: "\\ \\text{min}",
  h: "\\ \\text{h}",
  m3: "\\ \\text{m}^3",
  Wh: "\\ \\text{W}\\cdot\\text{h}",
  kWh: "\\ \\text{kW}\\cdot\\text{h}",
  mm: "\\ \\text{mm}",
  kt: "\\ \\text{kt}",
  Mt: "\\ \\text{Mt}",
  pers: "\\ \\text{personnes}",
};

const int = (a: string | number, b: string | number, f: string, v = "t") => `\\displaystyle\\int_{${a}}^{${b}} ${f}\\,d${v}`;

export interface FicheAccumuler {
  /** Nom de la quantité de l'écran « quantité » (`V(20)`, `E`, `H_1`…). */
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Options canoniques (0 = la bonne), avant mélange. */
  options: string[];
  consignes: Record<PhaseAccumulerGrandeur, FragmentConsigne[]>;
  /** Questions papier a) b) c) (écrans quantité, transfert, unité). */
  questionsPapier: FragmentConsigne[][];
  champs: Record<Exclude<PhaseAccumulerGrandeur, "modele">, ChampAccumuler>;
  aides: Record<PhaseAccumulerGrandeur, [AideAvecLatex, AideAvecLatex | null]>;
  reponses: Record<PhaseAccumulerGrandeur, string>;
  /** Lignes « Calcul » du corrigé, par écran (LaTeX), facultatives. */
  calculs: Partial<Record<PhaseAccumulerGrandeur, string>>;
  /** Ligne « Piège » ciblée du corrigé, par écran. */
  pieges: Partial<Record<PhaseAccumulerGrandeur, string>>;
  /** Libellés de la figure. */
  figure: { axeT: string; axeY: string; courbes: { nom: string; fn: (x: number) => number; de: number; a: number; secondaire?: boolean }[]; xMax: number; xMin: number; hachure: { de: number; a: number; haut: (x: number) => number; bas: (x: number) => number }; libelleAire: string };
}

const CONSIGNE_PRIMITIVE_PH = "expression en t";
const PH_NOMBRE = "nombre seul";

// ============================================================================
// Cuve.
// ============================================================================

const NOM_CUVE = { cuve: "Une cuve de récupération d'eau de pluie", bassin: "Un bassin d'arrosage", citerne: "Une citerne agricole" } as const;
const SUJET_CUVE = { cuve: "la cuve", bassin: "le bassin", citerne: "la citerne" } as const;

function ficheCuve(e: ExerciceCuve): FicheAccumuler {
  const m = modeleNumerique(e);
  const a = e.E - e.s0;
  const tMax = a / e.c;
  const T = e.T;
  const sujet = SUJET_CUVE[e.contexte];
  const net = `${a}-${coef(e.c)}t`;
  const R = `${a}t-${coef(e.c / 2)}t^2`;
  const Vt = `${e.V0}+${a}t-${coef(e.c / 2)}t^2`;
  const max = e.variante === "cuve-max";
  return {
    consigneGenerale: [
      t(`${NOM_CUVE[e.contexte]} contient ${e.V0} litres d'eau à l'instant `),
      l("t=0"),
      t(" (t en minutes). Un tuyau la remplit avec un débit d'entrée "),
      l("e(t)"),
      t(" et une vanne, ouverte de plus en plus, la vide avec un débit de sortie "),
      l("s(t)"),
      t(" (débits en litres par minute). On note "),
      l("V(t)"),
      t(` le volume d'eau dans ${sujet} (en L).`),
    ],
    blocDonnees: [`e(t)=${e.E}`, `s(t)=${e.s0}+${coef(e.c)}t`, `V(0)=${e.V0}${U.L}`],
    options: [
      `V(${T})=${e.V0}+${int(0, T, "\\big(e(t)-s(t)\\big)")}`,
      `V(${T})=${e.V0}+${int(0, T, "e(t)")}`,
      `V(${T})=${int(0, T, "\\big(e(t)-s(t)\\big)")}`,
      `V(${T})=${e.V0}+e(${T})-s(${T})`,
    ],
    consignes: {
      modele: [t(`Quelle expression donne le volume d'eau dans ${sujet} à l'instant `), l(`t=${T}`), t(" min ?")],
      primitive: [t("Détermine une primitive "), l("R(t)"), t(" du débit net "), l("r(t)=e(t)-s(t)"), t(".")],
      quantite: [t(`Calcule le volume d'eau dans ${sujet} à l'instant `), l(`t=${T}`), t(" min (en litres).")],
      transfert: max ? [t("À quel instant (en minutes) le volume d'eau est-il maximal ?")] : [t(`À quel instant (en minutes) ${sujet} sera-t-${e.contexte === "bassin" ? "il" : "elle"} vide ?`)],
      unite: max ? [t("Quel est ce volume maximal, en mètres cubes ? Donne la valeur exacte.")] : [t("Convertis cet instant en heures (valeur exacte).")],
    },
    questionsPapier: [
      [t(`Calcule le volume d'eau dans ${sujet} à l'instant `), l(`t=${T}`), t(" min.")],
      max ? [t("À quel instant le volume d'eau est-il maximal ? Justifie.")] : [t(`À quel instant ${sujet} sera-t-${e.contexte === "bassin" ? "il" : "elle"} vide ?`)],
      max ? [t("Quel est ce volume maximal, en m³ ?")] : [t("Exprime cet instant en heures.")],
    ],
    champs: {
      primitive: { label: "R(t) =", placeholder: CONSIGNE_PRIMITIVE_PH, expression: true },
      quantite: { label: `V(${T}) (en L) =`, placeholder: PH_NOMBRE, expression: false },
      transfert: { label: "t (en min) =", placeholder: PH_NOMBRE, expression: false },
      unite: max ? { label: "Volume maximal (en m³) =", placeholder: PH_NOMBRE, expression: false } : { label: "t (en h) =", placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      modele: [{ texte: "Intégrer un débit (en L/min) sur une durée (en min) donne un volume (en L). Demande-toi ensuite d'où l'on part et ce qui sort :", latex: "\\text{L/min}\\times\\text{min}=\\text{L}" }, null],
      primitive: [
        { texte: "Écris d'abord le débit net :", latex: `r(t)=${e.E}-(${e.s0}+${coef(e.c)}t)=${net}` },
        { texte: "Primitive terme à terme :", latex: "\\int (a-ct)\\,dt=at-\\dfrac{c}{2}t^2+C" },
      ],
      quantite: [
        { texte: "Le volume vaut le volume initial plus l'eau accumulée entre 0 et cet instant :", latex: `V(${T})=${e.V0}+${int(0, T, "r(t)")}` },
        { texte: "Avec ta primitive :", latex: `V(${T})=${e.V0}+R(${T})-R(0)` },
      ],
      transfert: max
        ? [
            { texte: "Le volume augmente tant que le débit net est positif, puis diminue : il est maximal quand le débit net s'annule :", latex: "r(t)=0\\iff e(t)=s(t)" },
            { texte: "Résous :", latex: `${net}=0` },
          ]
        : [
            { texte: `${sujet.charAt(0).toUpperCase()}${sujet.slice(1)} est vide quand le volume s'annule :`, latex: `V(t)=${Vt}=0` },
            { texte: "Équation du second degré, dont seule la solution positive a un sens :", latex: `\\Delta=${a}^2+4\\cdot ${dl(e.c / 2)}\\cdot ${e.V0}` },
          ],
      unite: max
        ? [
            { texte: "Calcule d'abord le volume maximal en litres :", latex: `V(${dl(tMax)})=${e.V0}+R(${dl(tMax)})-R(0)` },
            { texte: "Puis convertis :", latex: "1\\ \\text{m}^3=1000\\ \\text{L}" },
          ]
        : [{ texte: "Une heure compte soixante minutes :", latex: "1\\ \\text{h}=60\\ \\text{min}" }, null],
    },
    reponses: {
      modele: "",
      primitive: `R(t)=${R}`,
      quantite: `V(${T})=${dl(m.quantite)}${U.L}`,
      transfert: `t=${dl(m.transfert)}${U.min}`,
      unite: max ? `V_{\\max}=${dl(m.unite)}${U.m3}` : `t=${dl(m.unite)}${U.h}`,
    },
    calculs: {
      primitive: `r(t)=${net}\\quad\\Rightarrow\\quad R(t)=${R}`,
      quantite: `V(${T})=${e.V0}+\\left[${R}\\right]_0^{${T}}=${e.V0}+${dl(a * T)}-${dl((e.c / 2) * T * T)}`,
      transfert: max ? `${net}=0\\iff t=\\dfrac{${a}}{${dl(e.c)}}=${dl(tMax)}` : `${Vt}=0\\iff t=${e.tVide}\\ \\text{ou}\\ t=${dl(-(2 * e.V0) / (e.c * e.tVide))}`,
      unite: max ? `V(${dl(tMax)})=${e.V0}+${dl(a * tMax)}-${dl((e.c / 2) * tMax * tMax)}=${dl(m.unite * 1000)}${U.L}=\\dfrac{${dl(m.unite * 1000)}}{1000}${U.m3}` : `\\dfrac{${e.tVide}}{60}=${dl(m.unite)}`,
    },
    pieges: {
      modele: "Oublier le volume initial ou le débit de sortie : le volume accumule le débit NET e(t) − s(t), en partant de V(0).",
      quantite: "Donner seulement l'intégrale : il faut lui ajouter le volume initial V(0).",
      transfert: max ? "Chercher où e(t) ou s(t) est maximal : c'est le débit net qui s'annule au maximum du volume." : "Garder la solution négative de l'équation, sans signification ici.",
      unite: max ? "Oublier la conversion : 1 m³ = 1000 L." : "Diviser par 100 au lieu de 60.",
    },
    figure: {
      axeT: "t (min)",
      axeY: "débit (L/min)",
      courbes: [
        { nom: "e(t)", fn: () => e.E, de: 0, a: e.tVide },
        { nom: "s(t)", fn: (x) => e.s0 + e.c * x, de: 0, a: e.tVide },
      ],
      xMin: 0,
      xMax: e.tVide,
      hachure: { de: 0, a: T, haut: () => e.E, bas: (x) => e.s0 + e.c * x },
      libelleAire: `l'eau accumulée entre 0 et ${T} min (entre la droite de e et celle de s)`,
    },
  };
}

// ============================================================================
// Salle.
// ============================================================================

const NOM_SALLE = { concert: "Une salle de concert", stade: "Un stade", festival: "Le site d'un festival" } as const;
const SUJET_SALLE = { concert: "la salle", stade: "le stade", festival: "le site" } as const;

function ficheSalle(e: ExerciceSalle): FicheAccumuler {
  const m = modeleNumerique(e);
  const T = e.T;
  const sujet = SUJET_SALLE[e.contexte];
  const r = `${e.a}+${coef(e.b)}t`;
  const R = `${e.a}t+${coef(e.b / 2)}t^2`;
  return {
    consigneGenerale: [
      t(`${NOM_SALLE[e.contexte]} ouvre ses portes à l'instant `),
      l("t=0"),
      t(` (t en minutes) ; ${e.N0} personnes (équipe, invités) sont déjà à l'intérieur. Le public entre au rythme `),
      l("r(t)"),
      t(` (en personnes par minute), qui augmente à l'approche du spectacle. ${sujet.charAt(0).toUpperCase()}${sujet.slice(1)} peut accueillir C = ${nt(e.capacite)} personnes. On note `),
      l("N(t)"),
      t(" le nombre de personnes présentes."),
    ],
    blocDonnees: [`r(t)=${r}`, `N(0)=${e.N0}`, `C=${e.capacite}`],
    options: [
      `N(${T})=${e.N0}+${int(0, T, "r(t)")}`,
      `N(${T})=${int(0, T, "r(t)")}`,
      `N(${T})=${e.N0}+r(${T})`,
      `N(${T})=${e.N0}+${T}\\cdot r(${T})`,
    ],
    consignes: {
      modele: [t(`Quelle expression donne le nombre de personnes présentes dans ${sujet} à l'instant `), l(`t=${T}`), t(" min ?")],
      primitive: [t("Détermine une primitive "), l("R(t)"), t(" du rythme d'entrée "), l("r(t)"), t(".")],
      quantite: [t(`Combien de personnes sont présentes dans ${sujet} à l'instant `), l(`t=${T}`), t(" min ?")],
      transfert: [t(`À quel instant (en minutes) ${sujet} est-${e.contexte === "concert" ? "elle pleine" : "il plein"} ?`)],
      unite: [t("Convertis cet instant en heures (valeur exacte).")],
    },
    questionsPapier: [
      [t(`Combien de personnes sont présentes dans ${sujet} à l'instant `), l(`t=${T}`), t(" min ?")],
      [t(`À quel instant ${sujet} est-${e.contexte === "concert" ? "elle pleine" : "il plein"} ?`)],
      [t("Exprime cet instant en heures.")],
    ],
    champs: {
      primitive: { label: "R(t) =", placeholder: CONSIGNE_PRIMITIVE_PH, expression: true },
      quantite: { label: `N(${T}) =`, placeholder: PH_NOMBRE, expression: false },
      transfert: { label: "t (en min) =", placeholder: PH_NOMBRE, expression: false },
      unite: { label: "t (en h) =", placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      modele: [{ texte: "Intégrer un rythme (en personnes par minute) sur une durée (en minutes) donne un nombre de personnes entrées. Demande-toi qui était déjà là :", latex: "\\dfrac{\\text{personnes}}{\\text{min}}\\times\\text{min}=\\text{personnes}" }, null],
      primitive: [
        { texte: "Primitive terme à terme d'une fonction du premier degré :", latex: "\\int (a+bt)\\,dt=at+\\dfrac{b}{2}t^2+C" },
        { texte: "Ici :", latex: `a=${e.a}\\quad\\text{et}\\quad b=${dl(e.b)}` },
      ],
      quantite: [
        { texte: "Nombre présent = personnes déjà là + personnes entrées entre 0 et cet instant :", latex: `N(${T})=${e.N0}+${int(0, T, "r(t)")}` },
        { texte: "Avec ta primitive :", latex: `N(${T})=${e.N0}+R(${T})-R(0)` },
      ],
      transfert: [
        { texte: "C'est complet quand le nombre de personnes présentes atteint la capacité :", latex: `${e.N0}+${R}=${e.capacite}` },
        { texte: "Équation du second degré, dont seule la solution positive a un sens :", latex: `${coef(e.b / 2)}t^2+${e.a}t-${e.capacite - e.N0}=0` },
      ],
      unite: [{ texte: "Une heure compte soixante minutes :", latex: "1\\ \\text{h}=60\\ \\text{min}" }, null],
    },
    reponses: {
      modele: "",
      primitive: `R(t)=${R}`,
      quantite: `N(${T})=${dl(m.quantite)}${U.pers}`,
      transfert: `t=${e.tPlein}${U.min}`,
      unite: `t=${dl(m.unite)}${U.h}`,
    },
    calculs: {
      primitive: `R(t)=${R}`,
      quantite: `N(${T})=${e.N0}+\\left[${R}\\right]_0^{${T}}=${e.N0}+${dl(e.a * T)}+${dl((e.b / 2) * T * T)}`,
      transfert: `${coef(e.b / 2)}t^2+${e.a}t-${e.capacite - e.N0}=0\\iff t=${e.tPlein}\\ \\text{ou}\\ t=${dl(-(2 * e.a) / e.b - e.tPlein)}`,
      unite: `\\dfrac{${e.tPlein}}{60}=${dl(m.unite)}`,
    },
    pieges: {
      modele: "Oublier les personnes déjà présentes, ou multiplier le rythme par la durée alors qu'il varie.",
      quantite: "Oublier d'ajouter les personnes présentes à l'ouverture.",
      transfert: "Poser R(t) = capacité en oubliant les personnes déjà présentes.",
      unite: "Diviser par 100 au lieu de 60.",
    },
    figure: {
      axeT: "t (min)",
      axeY: "rythme (pers./min)",
      courbes: [{ nom: "r(t)", fn: (x) => e.a + e.b * x, de: 0, a: e.tPlein }],
      xMin: 0,
      xMax: e.tPlein,
      hachure: { de: 0, a: T, haut: (x) => e.a + e.b * x, bas: () => 0 },
      libelleAire: `le nombre de personnes entrées entre 0 et ${T} min`,
    },
  };
}

// ============================================================================
// Panneaux solaires — modèle sinusoïdal.
// ============================================================================

function sinusLatex(e: ExerciceSolaireSeuil): string {
  return `\\sin\\left(\\dfrac{\\pi(t-${e.lever})}{${e.D}}\\right)`;
}
function cosinusLatex(e: ExerciceSolaireSeuil, x: number | string): string {
  return `\\cos\\left(\\dfrac{\\pi(${x}-${e.lever})}{${e.D}}\\right)`;
}

function ficheSolaireSeuil(e: ExerciceSolaireSeuil): FicheAccumuler {
  const m = modeleNumerique(e);
  const fin = e.lever + e.D;
  const amp = `\\dfrac{${dl(e.Pm * e.D)}}{\\pi}`;
  const F = `-${amp}${cosinusLatex(e, "t")}`;
  return {
    consigneGenerale: [
      t("Par une journée ensoleillée, la puissance fournie par les panneaux solaires d'une maison est modélisée par "),
      l(`P(t)=${e.Pm}${sinusLatex(e)}`),
      t(" (en watts) pour "),
      l(`t\\in[${e.lever}\\,;\\,${fin}]`),
      t(` (t est l'heure de la journée, en heures : le soleil se lève à ${e.lever} h et se couche à ${fin} h). L'énergie produite s'exprime en W·h.`),
    ],
    blocDonnees: [`P(t)=${e.Pm}${sinusLatex(e)}`, `t\\in[${e.lever}\\,;\\,${fin}]`],
    options: [
      `E=${int(e.t1, e.t2, "P(t)")}`,
      `E=${int(0, e.t2 - e.t1, "P(t)")}`,
      `E=P(${e.t2})-P(${e.t1})`,
      `E=(${e.t2}-${e.t1})\\cdot P(${e.t2})`,
    ],
    consignes: {
      modele: [t(`Quelle expression donne l'énergie produite entre ${e.t1} h et ${e.t2} h ?`)],
      primitive: [t("Détermine une primitive "), l("F(t)"), t(" de "), l("P(t)"), t(".")],
      quantite: [t(`Calcule l'énergie produite entre ${e.t1} h et ${e.t2} h, en W·h (arrondie à l'unité).`)],
      transfert: [t(`La batterie de la maison est pleine dès que les panneaux ont produit ${nt(e.Ebatterie)} W·h depuis le lever du soleil. À quelle heure t est-elle pleine ? Donne t en heures, arrondi au centième.`)],
      unite: [t("Quelle énergie les panneaux produisent-ils sur toute la journée, en kW·h (arrondie au centième) ?")],
    },
    questionsPapier: [
      [t(`Calcule l'énergie produite entre ${e.t1} h et ${e.t2} h (en W·h, arrondie à l'unité).`)],
      [t(`La batterie est pleine dès que les panneaux ont produit ${nt(e.Ebatterie)} W·h depuis le lever du soleil. À quelle heure (en heures, arrondie au centième) est-elle pleine ?`)],
      [t("Quelle énergie les panneaux produisent-ils sur toute la journée, en kW·h (arrondie au centième) ?")],
    ],
    champs: {
      primitive: { label: "F(t) =", placeholder: CONSIGNE_PRIMITIVE_PH, expression: true },
      quantite: { label: "Énergie (en W·h) ≈", placeholder: PH_NOMBRE, expression: false },
      transfert: { label: "t (en h) ≈", placeholder: PH_NOMBRE, expression: false },
      unite: { label: "Énergie de la journée (en kW·h) ≈", placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      modele: [{ texte: "Intégrer une puissance (en W) sur une durée (en h) donne une énergie (en W·h). Les bornes sont des heures de la journée :", latex: "\\text{W}\\times\\text{h}=\\text{W}\\cdot\\text{h}" }, null],
      primitive: [
        { texte: "Une primitive d'un sinus de la forme sin(ωt + φ) :", latex: "\\int \\sin(\\omega t+\\varphi)\\,dt=-\\dfrac{1}{\\omega}\\cos(\\omega t+\\varphi)+C" },
        { texte: "Ici, la pulsation vaut :", latex: `\\omega=\\dfrac{\\pi}{${e.D}}` },
      ],
      quantite: [
        { texte: "Évalue ta primitive entre les deux heures :", latex: `E=F(${e.t2})-F(${e.t1})` },
        { texte: "Ce qui donne (calculatrice en radians) :", latex: `E=${amp}\\left(${cosinusLatex(e, e.t1)}-${cosinusLatex(e, e.t2)}\\right)` },
      ],
      transfert: [
        { texte: "L'énergie produite depuis le lever du soleil jusqu'à l'heure t vaut :", latex: `${int(e.lever, "t", "P(u)", "u")}=${amp}\\left(1-${cosinusLatex(e, "t")}\\right)` },
        { texte: "Pose l'équation, isole le cosinus puis utilise arccos :", latex: `${amp}\\left(1-${cosinusLatex(e, "t")}\\right)=${dl(e.Ebatterie)}` },
      ],
      unite: [
        { texte: "L'énergie de toute la journée s'obtient du lever au coucher du soleil :", latex: `${int(e.lever, fin, "P(t)")}` },
        { texte: "Puis convertis :", latex: "1\\ \\text{kW}\\cdot\\text{h}=1000\\ \\text{W}\\cdot\\text{h}" },
      ],
    },
    reponses: {
      modele: "",
      primitive: `F(t)=${F}`,
      quantite: `E\\approx ${dl(Math.round(m.quantite))}${U.Wh}`,
      transfert: `t\\approx ${dl(m.transfert, 2)}${U.h}`,
      unite: `E_{\\text{jour}}=\\dfrac{${dl(2 * e.Pm * e.D)}}{\\pi}${U.Wh}\\approx ${dl(m.unite, 2)}${U.kWh}`,
    },
    calculs: {
      primitive: `F(t)=${e.Pm}\\cdot\\left(-\\dfrac{${e.D}}{\\pi}\\right)${cosinusLatex(e, "t")}`,
      quantite: `E=${amp}\\left(${cosinusLatex(e, e.t1)}-${cosinusLatex(e, e.t2)}\\right)`,
      transfert: `${cosinusLatex(e, "t")}=1-\\dfrac{${dl(e.Ebatterie)}\\pi}{${dl(e.Pm * e.D)}}\\iff t=${e.lever}+\\dfrac{${e.D}}{\\pi}\\arccos\\left(1-\\dfrac{${dl(e.Ebatterie)}\\pi}{${dl(e.Pm * e.D)}}\\right)`,
      unite: `${int(e.lever, fin, "P(t)")}=${amp}\\big(1-\\cos\\pi\\big)=\\dfrac{${dl(2 * e.Pm * e.D)}}{\\pi}${U.Wh}`,
    },
    pieges: {
      modele: "Intégrer de 0 à la durée au lieu de l'heure de début à l'heure de fin : t est l'heure de la journée.",
      quantite: "Calculer le cosinus en degrés : la calculatrice doit être en radians.",
      transfert: "Compter l'énergie depuis t = 0 au lieu du lever du soleil.",
      unite: "Oublier de diviser par 1000 pour passer des W·h aux kW·h.",
    },
    figure: {
      axeT: "t (h)",
      axeY: "puissance (W)",
      courbes: [{ nom: "P(t)", fn: m.taux, de: e.lever, a: fin }],
      xMin: 0,
      xMax: 24,
      hachure: { de: e.t1, a: e.t2, haut: m.taux, bas: () => 0 },
      libelleAire: `l'énergie produite entre ${e.t1} h et ${e.t2} h`,
    },
  };
}

// ============================================================================
// Panneaux solaires — deux installations (polynôme).
// ============================================================================

function puissanceLatex(nom: string, i: InstallationSolaire): string {
  return `${nom}(t)=${i.k}(t-${i.debut})(${i.fin}-t)`;
}

export function primitivePolyLatex(i: InstallationSolaire): string {
  return `${i.k}\\left(-\\dfrac{t^3}{3}+${exact((i.debut + i.fin) / 2)}t^2-${i.debut * i.fin}t\\right)`;
}

function ficheSolaireComparer(e: ExerciceSolaireComparer): FicheAccumuler {
  const m = modeleNumerique(e);
  const EA = energieInstallation(e.A);
  const EB = energieInstallation(e.B);
  const milieu = (e.A.debut + e.A.fin) / 2;
  return {
    consigneGenerale: [
      t("Le même jour, deux installations solaires A et B fournissent les puissances (en watts, t est l'heure de la journée en heures) "),
      l(`${puissanceLatex("P_A", e.A)}`),
      t(" pour "),
      l(`t\\in[${e.A.debut}\\,;\\,${e.A.fin}]`),
      t(" et "),
      l(`${puissanceLatex("P_B", e.B)}`),
      t(" pour "),
      l(`t\\in[${e.B.debut}\\,;\\,${e.B.fin}]`),
      t(". L'installation B est plus puissante, mais ombragée le matin et le soir. L'énergie produite s'exprime en W·h."),
    ],
    blocDonnees: [puissanceLatex("P_A", e.A), `t\\in[${e.A.debut}\\,;\\,${e.A.fin}]`, puissanceLatex("P_B", e.B), `t\\in[${e.B.debut}\\,;\\,${e.B.fin}]`],
    options: [
      `E_A=${int(e.A.debut, e.A.fin, "P_A(t)")}`,
      `E_A=${int(0, e.A.fin - e.A.debut, "P_A(t)")}`,
      `E_A=${int(e.A.debut, e.A.fin, "P_A'(t)")}`,
      `E_A=(${e.A.fin}-${e.A.debut})\\cdot P_A(${dl(milieu)})`,
    ],
    consignes: {
      modele: [t("Quelle expression donne l'énergie produite par l'installation A sur la journée ?")],
      primitive: [t("Détermine une primitive "), l("F_A(t)"), t(" de "), l("P_A(t)"), t(".")],
      quantite: [t("Calcule l'énergie "), l("E_A"), t(" produite par A sur la journée, en W·h (valeur exacte).")],
      transfert: [t("Calcule de même "), l("E_B"), t(", puis la différence "), l("E_A-E_B"), t(" en W·h (elle peut être négative).")],
      unite: [t("Exprime "), l("E_A-E_B"), t(" en kW·h (valeur exacte).")],
    },
    questionsPapier: [
      [t("Calcule l'énergie "), l("E_A"), t(" produite par l'installation A sur la journée.")],
      [t("Quelle installation produit le plus d'énergie ce jour-là ? Calcule "), l("E_A-E_B"), t(".")],
      [t("Exprime "), l("E_A-E_B"), t(" en kW·h.")],
    ],
    champs: {
      primitive: { label: "F_A(t) =", placeholder: CONSIGNE_PRIMITIVE_PH, expression: true },
      quantite: { label: "E_A (en W·h) =", placeholder: PH_NOMBRE, expression: false },
      transfert: { label: "E_A − E_B (en W·h) =", placeholder: PH_NOMBRE, expression: false },
      unite: { label: "E_A − E_B (en kW·h) =", placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      modele: [{ texte: "Intégrer une puissance (en W) sur une durée (en h) donne une énergie (en W·h). Les bornes sont des heures de la journée :", latex: "\\text{W}\\times\\text{h}=\\text{W}\\cdot\\text{h}" }, null],
      primitive: [
        { texte: "Développe d'abord le produit :", latex: `(t-${e.A.debut})(${e.A.fin}-t)=-t^2+${e.A.debut + e.A.fin}t-${e.A.debut * e.A.fin}` },
        { texte: "Puis primitive terme à terme :", latex: "\\int (-t^2+bt-c)\\,dt=-\\dfrac{t^3}{3}+\\dfrac{b}{2}t^2-ct+C" },
      ],
      quantite: [
        { texte: "Évalue ta primitive entre le début et la fin de la production :", latex: `E_A=F_A(${e.A.fin})-F_A(${e.A.debut})` },
        { texte: "Contrôle possible, pour une parabole de ce type :", latex: "\\int_a^b k(t-a)(b-t)\\,dt=\\dfrac{k(b-a)^3}{6}" },
      ],
      transfert: [
        { texte: "Même calcul pour B, sur ses propres heures :", latex: `E_B=${int(e.B.debut, e.B.fin, "P_B(t)")}` },
        { texte: "Puis :", latex: `E_A-E_B=${dl(EA)}-E_B` },
      ],
      unite: [{ texte: "Conversion :", latex: "1\\ \\text{kW}\\cdot\\text{h}=1000\\ \\text{W}\\cdot\\text{h}" }, null],
    },
    reponses: {
      modele: "",
      primitive: `F_A(t)=${primitivePolyLatex(e.A)}`,
      quantite: `E_A=${dl(EA)}${U.Wh}`,
      transfert: `E_A-E_B=${dl(EA)}-${dl(EB)}=${dl(m.transfert)}${U.Wh}`,
      unite: `E_A-E_B=${dl(m.unite)}${U.kWh}`,
    },
    calculs: {
      primitive: `P_A(t)=${e.A.k}\\left(-t^2+${e.A.debut + e.A.fin}t-${e.A.debut * e.A.fin}\\right)\\ \\Rightarrow\\ F_A(t)=${primitivePolyLatex(e.A)}`,
      quantite: `E_A=F_A(${e.A.fin})-F_A(${e.A.debut})=\\dfrac{${e.A.k}\\cdot ${e.A.fin - e.A.debut}^3}{6}`,
      transfert: `E_B=\\dfrac{${e.B.k}\\cdot ${e.B.fin - e.B.debut}^3}{6}=${dl(EB)}`,
      unite: `\\dfrac{${dl(m.transfert)}}{1000}=${dl(m.unite)}`,
    },
    pieges: {
      modele: "Intégrer de 0 à la durée au lieu de l'heure de début à l'heure de fin.",
      transfert: "Juger sur la puissance maximale seule : B est plus puissante, mais produit moins longtemps.",
      unite: "Oublier de diviser par 1000 pour passer des W·h aux kW·h.",
    },
    figure: {
      axeT: "t (h)",
      axeY: "puissance (W)",
      courbes: [
        { nom: "P_A", fn: (x) => e.A.k * (x - e.A.debut) * (e.A.fin - x), de: e.A.debut, a: e.A.fin },
        { nom: "P_B", fn: (x) => e.B.k * (x - e.B.debut) * (e.B.fin - x), de: e.B.debut, a: e.B.fin, secondaire: true },
      ],
      xMin: 0,
      xMax: 24,
      hachure: { de: e.A.debut, a: e.A.fin, haut: m.taux, bas: () => 0 },
      libelleAire: "l'énergie produite par l'installation A",
    },
  };
}

// ============================================================================
// Pluie — averse exponentielle.
// ============================================================================

function exposantLatex(k: number, signe: "-" | ""): string {
  return `e^{${signe}${coef(k)}t}`;
}

function fichePluieSeuil(e: ExercicePluieSeuil): FicheAccumuler {
  const m = modeleNumerique(e);
  const q = e.I0 / e.k;
  const i = `${e.I0}${exposantLatex(e.k, "-")}`;
  return {
    consigneGenerale: [
      t("Pendant une averse qui faiblit, l'intensité de la pluie est modélisée par "),
      l(`i(t)=${i}`),
      t(` (en mm/h, t en heures depuis le début de l'averse, qui dure ${e.D} h). Un toit d'aire S = ${e.aireToit} m² recueille l'eau dans une citerne.`),
    ],
    blocDonnees: [`i(t)=${i}`, `t\\in[0\\,;\\,${e.D}]`, `S=${e.aireToit}\\ \\text{m}^2`],
    options: [`H=${int(0, e.D, "i(t)")}`, `H=${int(0, 60 * e.D, "i(t)")}`, `H=${e.D}\\cdot i(0)`, `H=${int(0, e.D, "i'(t)")}`],
    consignes: {
      modele: [t("Quelle expression donne la hauteur de pluie H (en mm) tombée pendant toute l'averse ?")],
      primitive: [t("Détermine une primitive "), l("F(t)"), t(" de "), l("i(t)"), t(".")],
      quantite: [t("Calcule la hauteur de pluie tombée pendant l'averse, en mm (valeur exacte ou arrondie au centième).")],
      transfert: [t(`Au bout de combien de temps ${e.Hcible} mm de pluie sont-ils tombés ? Donne t en heures (valeur exacte ou arrondie au centième).`)],
      unite: [t(`Quel volume d'eau le toit de ${e.aireToit} m² a-t-il recueilli pendant l'averse, en litres (arrondi au litre) ?`)],
    },
    questionsPapier: [
      [t("Calcule la hauteur de pluie tombée pendant l'averse (valeur exacte, puis arrondie au centième).")],
      [t(`Au bout de combien de temps ${e.Hcible} mm de pluie sont-ils tombés ?`)],
      [t(`Quel volume d'eau (en litres, arrondi au litre) le toit a-t-il recueilli pendant l'averse ?`)],
    ],
    champs: {
      primitive: { label: "F(t) =", placeholder: CONSIGNE_PRIMITIVE_PH, expression: true },
      quantite: { label: "H (en mm) =", placeholder: "valeur exacte ou arrondie", expression: false },
      transfert: { label: "t (en h) =", placeholder: "valeur exacte ou arrondie", expression: false },
      unite: { label: "Volume (en L) ≈", placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      modele: [{ texte: "Intégrer une intensité (en mm/h) sur une durée (en heures) donne une hauteur (en mm) :", latex: "\\dfrac{\\text{mm}}{\\text{h}}\\times\\text{h}=\\text{mm}" }, null],
      primitive: [
        { texte: "Une primitive d'une exponentielle :", latex: "\\int e^{-kt}\\,dt=-\\dfrac{1}{k}e^{-kt}+C" },
        { texte: "Ici :", latex: `k=${dl(e.k)}` },
      ],
      quantite: [
        { texte: "Évalue ta primitive entre 0 et la fin de l'averse :", latex: `H=F(${e.D})-F(0)` },
        { texte: "Ce qui donne :", latex: `H=${exact(q)}\\left(1-e^{-${dl(e.k * e.D)}}\\right)` },
      ],
      transfert: [
        { texte: "La hauteur tombée entre 0 et l'instant t vaut :", latex: `${int(0, "t", "i(u)", "u")}=${exact(q)}\\left(1-${exposantLatex(e.k, "-")}\\right)` },
        { texte: "Pose l'équation, isole l'exponentielle puis prends le logarithme :", latex: `${exact(q)}\\left(1-${exposantLatex(e.k, "-")}\\right)=${e.Hcible}` },
      ],
      unite: [
        { texte: "Une hauteur de 1 mm d'eau sur 1 m² représente un volume de :", latex: "0{,}001\\ \\text{m}\\times 1\\ \\text{m}^2=0{,}001\\ \\text{m}^3=1\\ \\text{L}" },
        { texte: "Donc le volume vaut :", latex: `V=H\\times ${e.aireToit}\\ \\text{L}` },
      ],
    },
    reponses: {
      modele: "",
      primitive: `F(t)=-${exact(q)}${exposantLatex(e.k, "-")}`,
      quantite: `H=${exact(q)}\\left(1-e^{-${dl(e.k * e.D)}}\\right)\\approx ${dl(m.quantite, 2)}${U.mm}`,
      transfert: `t=-${facteur(1 / e.k)}\\ln\\left(1-\\dfrac{${e.Hcible}}{${exact(q)}}\\right)\\approx ${dl(m.transfert, 2)}${U.h}`,
      unite: `V\\approx ${dl(Math.round(m.unite))}${U.L}`,
    },
    calculs: {
      primitive: `F(t)=-${e.I0}\\cdot ${e.k === 1 ? "1" : exact(1 / e.k)}\\,${exposantLatex(e.k, "-")}=-${exact(q)}${exposantLatex(e.k, "-")}`,
      quantite: `H=\\left[-${exact(q)}${exposantLatex(e.k, "-")}\\right]_0^{${e.D}}=${exact(q)}\\left(1-e^{-${dl(e.k * e.D)}}\\right)`,
      transfert: `${exposantLatex(e.k, "-")}=1-\\dfrac{${e.Hcible}}{${exact(q)}}\\iff t=-${facteur(1 / e.k)}\\ln\\left(1-\\dfrac{${e.Hcible}}{${exact(q)}}\\right)`,
      unite: `V\\approx ${dl(m.quantite, 2)}\\times ${e.aireToit}`,
    },
    pieges: {
      modele: "Mélanger les unités : l'intensité est en mm par HEURE, les bornes doivent être en heures, pas en minutes.",
      quantite: "Oublier le facteur 1/k de la primitive de l'exponentielle.",
      unite: "Multiplier des mm par des m² sans conversion : 1 mm sur 1 m² vaut 1 L (et non 1000 L).",
    },
    figure: {
      axeT: "t (h)",
      axeY: "intensité (mm/h)",
      courbes: [{ nom: "i(t)", fn: m.taux, de: 0, a: e.D }],
      xMin: 0,
      xMax: e.D,
      hachure: { de: 0, a: e.D, haut: m.taux, bas: () => 0 },
      libelleAire: "la hauteur de pluie tombée pendant l'averse",
    },
  };
}

// ============================================================================
// Pluie — orage et pluie fine.
// ============================================================================

function fichePluieComparer(e: ExercicePluieComparer): FicheAccumuler {
  const m = modeleNumerique(e);
  const i = `${e.c}t(${e.D}-t)`;
  const F = `${e.c}\\left(${facteur(e.D / 2)}t^2-\\dfrac{t^3}{3}\\right)`;
  const H2 = e.m * e.D2;
  return {
    consigneGenerale: [
      t(`Pendant un orage de ${e.D} heures, l'intensité de la pluie est modélisée par `),
      l(`i(t)=${i}`),
      t(` (en mm/h, t en heures depuis le début de l'orage). Le lendemain, une pluie fine tombe avec une intensité constante (notée i₂, en mm/h) pendant ${e.D2} heures. Un toit d'aire S = ${e.aireToit} m² recueille l'eau.`),
    ],
    blocDonnees: [`i(t)=${i}`, `t\\in[0\\,;\\,${e.D}]`, `i_2(t)=${dl(e.m)}`, `t\\in[0\\,;\\,${e.D2}]`, `S=${e.aireToit}\\ \\text{m}^2`],
    options: [`H_1=${int(0, e.D, "i(t)")}`, `H_1=${int(0, 60 * e.D, "i(t)")}`, `H_1=${e.D}\\cdot i(${exact(e.D / 2)})`, `H_1=${int(0, e.D, "i'(t)")}`],
    consignes: {
      modele: [t("Quelle expression donne la hauteur de pluie "), l("H_1"), t(" (en mm) tombée pendant l'orage ?")],
      primitive: [t("Détermine une primitive "), l("F(t)"), t(" de "), l("i(t)"), t(".")],
      quantite: [t("Calcule la hauteur "), l("H_1"), t(" tombée pendant l'orage, en mm (valeur exacte).")],
      transfert: [t("La pluie fine donne une hauteur "), l("H_2"), t(". Calcule "), l("H_1-H_2"), t(" en mm (elle peut être négative).")],
      unite: [t(`Quel volume d'eau (en litres) le toit de ${e.aireToit} m² a-t-il recueilli pendant l'orage ?`)],
    },
    questionsPapier: [
      [t("Calcule la hauteur de pluie "), l("H_1"), t(" tombée pendant l'orage.")],
      [t("Quelle pluie a donné le plus d'eau ? Calcule "), l("H_1-H_2"), t(", où "), l("H_2"), t(" est la hauteur de la pluie fine.")],
      [t("Quel volume d'eau (en litres) le toit a-t-il recueilli pendant l'orage ?")],
    ],
    champs: {
      primitive: { label: "F(t) =", placeholder: CONSIGNE_PRIMITIVE_PH, expression: true },
      quantite: { label: "H₁ (en mm) =", placeholder: PH_NOMBRE, expression: false },
      transfert: { label: "H₁ − H₂ (en mm) =", placeholder: PH_NOMBRE, expression: false },
      unite: { label: "Volume (en L) =", placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      modele: [{ texte: "Intégrer une intensité (en mm/h) sur une durée (en heures) donne une hauteur (en mm) :", latex: "\\dfrac{\\text{mm}}{\\text{h}}\\times\\text{h}=\\text{mm}" }, null],
      primitive: [
        { texte: "Développe d'abord :", latex: `i(t)=${e.c * e.D}t-${e.c}t^2` },
        { texte: "Puis primitive terme à terme :", latex: "\\int (at-bt^2)\\,dt=\\dfrac{a}{2}t^2-\\dfrac{b}{3}t^3+C" },
      ],
      quantite: [
        { texte: "Évalue ta primitive entre 0 et la fin de l'orage :", latex: `H_1=F(${e.D})-F(0)` },
        { texte: "Avec les nombres :", latex: `H_1=${e.c}\\left(\\dfrac{${e.D}\\cdot ${e.D}^2}{2}-\\dfrac{${e.D}^3}{3}\\right)` },
      ],
      transfert: [
        { texte: "Une intensité constante s'intègre en un rectangle :", latex: `H_2=${int(0, e.D2, dl(e.m))}=${dl(e.m)}\\times ${e.D2}` },
        { texte: "Puis :", latex: `H_1-H_2=${dl(m.quantite)}-H_2` },
      ],
      unite: [
        { texte: "Une hauteur de 1 mm d'eau sur 1 m² représente un volume de :", latex: "0{,}001\\ \\text{m}\\times 1\\ \\text{m}^2=0{,}001\\ \\text{m}^3=1\\ \\text{L}" },
        { texte: "Donc le volume vaut :", latex: `V=H_1\\times ${e.aireToit}\\ \\text{L}` },
      ],
    },
    reponses: {
      modele: "",
      primitive: `F(t)=${F}`,
      quantite: `H_1=${dl(m.quantite)}${U.mm}`,
      transfert: `H_1-H_2=${dl(m.quantite)}-${dl(H2)}=${dl(m.transfert)}${U.mm}`,
      unite: `V=${dl(m.unite)}${U.L}`,
    },
    calculs: {
      primitive: `i(t)=${e.c * e.D}t-${e.c}t^2\\ \\Rightarrow\\ F(t)=${F}`,
      quantite: `H_1=\\left[${F}\\right]_0^{${e.D}}=\\dfrac{${e.c}\\cdot ${e.D}^3}{6}`,
      transfert: `H_2=${dl(e.m)}\\times ${e.D2}=${dl(H2)}`,
      unite: `V=${dl(m.quantite)}\\times ${e.aireToit}`,
    },
    pieges: {
      modele: "Mélanger les unités : l'intensité est en mm par HEURE, les bornes doivent être en heures, pas en minutes.",
      transfert: "Comparer les intensités maximales au lieu des hauteurs : une pluie faible mais longue peut donner plus d'eau.",
      unite: "Multiplier des mm par des m² sans conversion : 1 mm sur 1 m² vaut 1 L (et non 1000 L).",
    },
    figure: {
      axeT: "t (h)",
      axeY: "intensité (mm/h)",
      courbes: [
        { nom: "orage", fn: m.taux, de: 0, a: e.D },
        { nom: "pluie fine", fn: () => e.m, de: 0, a: e.D2, secondaire: true },
      ],
      xMin: 0,
      xMax: Math.max(e.D, e.D2),
      hachure: { de: 0, a: e.D, haut: m.taux, bas: () => 0 },
      libelleAire: "la hauteur H₁ tombée pendant l'orage",
    },
  };
}

// ============================================================================
// CO₂.
// ============================================================================

function ficheCo2(e: ExerciceCo2): FicheAccumuler {
  const m = modeleNumerique(e);
  const q = exact(e.r0 / e.k);
  const r = `${e.r0}e^{${dl(e.k)}t}`;
  const annee = e.annee0 + e.T;
  return {
    consigneGenerale: [
      t(`Une région émettait ${e.r0} kilotonnes (kt) de CO₂ par an au 1er janvier ${e.annee0}, et ses émissions augmentent : on modélise le taux d'émission par `),
      l(`r(t)=${r}`),
      t(` (en kt par an, t en années depuis le 1er janvier ${e.annee0}). Entre ${e.anneeReference} et ${e.annee0}, elle avait déjà émis ${e.Q0} kt. Son budget carbone B, compté depuis ${e.anneeReference}, est de ${nt(e.budget)} kt. On note `),
      l("Q(t)"),
      t(` la quantité totale émise depuis ${e.anneeReference}.`),
    ],
    blocDonnees: [`r(t)=${r}`, `Q(0)=${e.Q0}${U.kt}`, `B=${dl(e.budget)}${U.kt}`],
    options: [
      `Q(${e.T})=${e.Q0}+${int(0, e.T, "r(t)")}`,
      `Q(${e.T})=${int(0, e.T, "r(t)")}`,
      `Q(${e.T})=${e.Q0}+r(${e.T})`,
      `Q(${e.T})=${e.Q0}+${int(e.annee0, annee, "r(t)")}`,
    ],
    consignes: {
      modele: [t(`Quelle expression donne la quantité totale émise depuis ${e.anneeReference}, au 1er janvier ${annee} ?`)],
      primitive: [t("Détermine une primitive "), l("F(t)"), t(" de "), l("r(t)"), t(".")],
      quantite: [t(`Calcule la quantité totale émise depuis ${e.anneeReference}, au 1er janvier ${annee}, en kt (arrondie à l'unité).`)],
      transfert: [t("Au bout de combien d'années t le budget carbone sera-t-il épuisé ? Donne t arrondi au centième.")],
      unite: [t(`Exprime la quantité totale émise au 1er janvier ${annee} en mégatonnes (Mt), arrondie au centième.`)],
    },
    questionsPapier: [
      [t(`Calcule la quantité totale émise depuis ${e.anneeReference}, au 1er janvier ${annee} (en kt, arrondie à l'unité).`)],
      [t("Au bout de combien d'années (arrondi au centième) le budget carbone sera-t-il épuisé ?")],
      [t(`Exprime la quantité émise au 1er janvier ${annee} en mégatonnes.`)],
    ],
    champs: {
      primitive: { label: "F(t) =", placeholder: CONSIGNE_PRIMITIVE_PH, expression: true },
      quantite: { label: `Q(${e.T}) (en kt) ≈`, placeholder: PH_NOMBRE, expression: false },
      transfert: { label: "t (en années) ≈", placeholder: PH_NOMBRE, expression: false },
      unite: { label: `Q(${e.T}) (en Mt) ≈`, placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      modele: [{ texte: "Intégrer un taux (en kt par an) sur une durée (en années) donne une quantité (en kt). Demande-toi ce qui était déjà émis, et ce que vaut t :", latex: "\\dfrac{\\text{kt}}{\\text{an}}\\times\\text{an}=\\text{kt}" }, null],
      primitive: [
        { texte: "Une primitive d'une exponentielle :", latex: "\\int e^{kt}\\,dt=\\dfrac{1}{k}e^{kt}+C" },
        { texte: "Ici :", latex: `k=${dl(e.k)}` },
      ],
      quantite: [
        { texte: "Quantité totale = quantité déjà émise + émissions entre 0 et cet instant :", latex: `Q(${e.T})=${e.Q0}+${int(0, e.T, "r(t)")}` },
        { texte: "Avec ta primitive :", latex: `Q(${e.T})=${e.Q0}+F(${e.T})-F(0)` },
      ],
      transfert: [
        { texte: "Le budget est épuisé quand :", latex: `${e.Q0}+${q}\\left(e^{${dl(e.k)}t}-1\\right)=${dl(e.budget)}` },
        { texte: "Isole l'exponentielle puis prends le logarithme :", latex: `e^{${dl(e.k)}t}=1+\\dfrac{${dl(e.k)}\\,(${dl(e.budget)}-${e.Q0})}{${e.r0}}` },
      ],
      unite: [{ texte: "Conversion :", latex: "1\\ \\text{Mt}=1000\\ \\text{kt}" }, null],
    },
    reponses: {
      modele: "",
      primitive: `F(t)=${q}e^{${dl(e.k)}t}`,
      quantite: `Q(${e.T})=${e.Q0}+${q}\\left(e^{${dl(e.k * e.T)}}-1\\right)\\approx ${dl(Math.round(m.quantite))}${U.kt}`,
      transfert: `t=${facteur(1 / e.k)}\\ln\\left(1+\\dfrac{${dl(e.k)}\\cdot ${dl(e.budget - e.Q0)}}{${e.r0}}\\right)\\approx ${dl(m.transfert, 2)}\\ \\text{ans}`,
      unite: `Q(${e.T})\\approx ${dl(m.unite, 2)}${U.Mt}`,
    },
    calculs: {
      primitive: `F(t)=${e.r0}\\cdot ${exact(1 / e.k)}\\,e^{${dl(e.k)}t}=${q}e^{${dl(e.k)}t}`,
      quantite: `Q(${e.T})=${e.Q0}+\\left[${q}e^{${dl(e.k)}t}\\right]_0^{${e.T}}=${e.Q0}+${q}\\left(e^{${dl(e.k * e.T)}}-1\\right)`,
      transfert: `e^{${dl(e.k)}t}=1+\\dfrac{${dl(e.k)}\\cdot ${dl(e.budget - e.Q0)}}{${e.r0}}\\iff t=${facteur(1 / e.k)}\\ln\\left(1+\\dfrac{${dl(e.k)}\\cdot ${dl(e.budget - e.Q0)}}{${e.r0}}\\right)`,
      unite: `\\dfrac{${dl(Math.round(m.quantite))}}{1000}\\approx ${dl(m.unite, 2)}`,
    },
    pieges: {
      modele: "Prendre les années comme bornes : t compte les années depuis le 1er janvier " + e.annee0 + ", les bornes sont 0 et " + e.T + ".",
      quantite: "Oublier la quantité déjà émise avant " + e.annee0 + ".",
      transfert: "Comparer au budget les seules émissions depuis " + e.annee0 + " : le budget compte aussi ce qui a déjà été émis.",
      unite: "Multiplier par 1000 au lieu de diviser : 1 Mt = 1000 kt.",
    },
    figure: {
      axeT: "t (années)",
      axeY: "émissions (kt/an)",
      courbes: [{ nom: "r(t)", fn: m.taux, de: 0, a: Math.ceil(m.transfert) + 1 }],
      xMin: 0,
      xMax: Math.ceil(m.transfert) + 1,
      hachure: { de: 0, a: e.T, haut: m.taux, bas: () => 0 },
      libelleAire: `les émissions entre 0 et ${e.T} ans`,
    },
  };
}

// ============================================================================
// Points d'entrée (écran, récapitulatif, export).
// ============================================================================

export function fiche(e: ExerciceAccumulerGrandeur): FicheAccumuler {
  switch (e.variante) {
    case "cuve-max":
    case "cuve-vide":
      return ficheCuve(e);
    case "salle-pleine":
      return ficheSalle(e);
    case "solaire-seuil":
      return ficheSolaireSeuil(e);
    case "solaire-comparer":
      return ficheSolaireComparer(e);
    case "pluie-seuil":
      return fichePluieSeuil(e);
    case "pluie-comparer":
      return fichePluieComparer(e);
    case "co2-seuil":
      return ficheCo2(e);
  }
}

export const LIBELLE_PHASE: Record<PhaseAccumulerGrandeur, string> = {
  modele: "Ce qu'il faut intégrer",
  primitive: "Primitive",
  quantite: "Quantité accumulée",
  transfert: "Question de transfert",
  unite: "Réponse dans l'unité demandée",
};

export function consigneGenerale(e: ExerciceAccumulerGrandeur): FragmentConsigne[] {
  return fiche(e).consigneGenerale;
}

export function blocDonnees(e: ExerciceAccumulerGrandeur): string[] {
  return fiche(e).blocDonnees;
}

export function consigneEcran(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur): FragmentConsigne[] {
  return fiche(e).consignes[phase];
}

/** Options du choix fermé, dans l'ordre d'affichage tiré (`ordreOptions`). */
export function optionsModele(e: ExerciceAccumulerGrandeur): OptionModele[] {
  const options = fiche(e).options;
  return e.ordreOptions.map((canon) => ({ id: String(canon), fragments: [l(options[canon])] }));
}

export function champEcran(e: ExerciceAccumulerGrandeur, phase: Exclude<PhaseAccumulerGrandeur, "modele">): ChampAccumuler {
  return fiche(e).champs[phase];
}

export function aideNiveau1(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur): AideAvecLatex {
  return fiche(e).aides[phase][0];
}

export function aideNiveau2(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur): AideAvecLatex {
  return fiche(e).aides[phase][1] ?? { texte: "", latex: null };
}

/** Réponse attendue d'un écran, en LaTeX (une seule formule). */
export function formatReponseAttenduePhaseLatex(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur): string[] {
  const f = fiche(e);
  if (phase === "modele") return [f.options[0]];
  return [f.reponses[phase]];
}
