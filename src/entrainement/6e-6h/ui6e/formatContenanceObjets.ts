import type { ExerciceContenanceObjets, Frac } from "../core6e/contenanceObjets.types";
import { contenanceUnite, frac, fois, primitivePolynome, uniteContenance, volumeCm3, volumeSecond } from "../core6e/contenanceObjetsCalcul";
import type { PhaseContenance } from "../moteur6e/typesContenanceObjets";

/**
 * Couche ui (6e) — textes (consignes, aides) et LaTeX de `6gen83` « Contenance d'objets de
 * révolution ». Seule source des textes : l'écran ET l'adaptateur papier
 * (`generateurs6e/contenanceObjets/exportEvaluation.ts`) les lisent ici. Toutes les formules en
 * KaTeX, virgule décimale, signe « − » ; aucune notation clavier dans un texte visible.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
export function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export interface ChampDef {
  label: string;
  /** Étiquette en LaTeX (prioritaire sur `label` à l'écran). */
  labelLatex?: string;
  placeholder?: string;
  /** Unité affichée après le champ (cm, cm³, L, cL). */
  unite?: string;
  /** Saisie d'une expression (aperçu KaTeX en direct au-dessus du champ). */
  expression?: boolean;
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

// ============================================================================
// Nombres.
// ============================================================================

/** Groupe les milliers (espace fine) : « 1 876 », « 92 590 ». */
function grouper(entier: string, separateur: string): string {
  return entier.length <= 4 ? entier : entier.replace(/\B(?=(\d{3})+(?!\d))/g, separateur);
}

function formater(x: number, decimales: number, sepMilliers: string, virgule: string, moins: string): string {
  const facteur = 10 ** decimales;
  let arrondi = Math.round(x * facteur) / facteur;
  if (Object.is(arrondi, -0)) arrondi = 0;
  const negatif = arrondi < 0;
  const [ent, dec] = Math.abs(arrondi).toFixed(decimales).split(".");
  const decPropre = dec ? dec.replace(/0+$/, "") : "";
  return `${negatif ? moins : ""}${grouper(ent, sepMilliers)}${decPropre ? virgule + decPropre : ""}`;
}

/** Nombre en LaTeX : `1\,876{,}4`. */
export function nombreLatex(x: number, decimales = 2): string {
  return formater(x, decimales, "\\,", "{,}", "-");
}

/** Nombre en texte : « 1 876,4 », signe « − ». */
export function nombreTexte(x: number, decimales = 2): string {
  return formater(x, decimales, " ", ",", "−");
}

/** Fraction signée en LaTeX. */
export function fracLatex(p: Frac): string {
  if (p.num === 0) return "0";
  const s = p.num < 0 ? "-" : "";
  const n = Math.abs(p.num);
  return p.den === 1 ? `${s}${n}` : `${s}\\dfrac{${n}}{${p.den}}`;
}

/** Multiple rationnel de π : `64\pi`, `\dfrac{1792\pi}{3}`. */
export function multiplePiLatex(p: Frac): string {
  const n = Math.abs(p.num);
  const coeur = n === 1 ? "\\pi" : `${grouper(String(n), "\\,")}\\pi`;
  const s = p.num < 0 ? "-" : "";
  return p.den === 1 ? `${s}${coeur}` : `${s}\\dfrac{${coeur}}{${grouper(String(p.den), "\\,")}}`;
}

/** Polynôme (coefficients `Frac`, indice = degré) en LaTeX, puissances décroissantes. */
export function polynomeLatex(coefs: Frac[], variable = "x"): string {
  const morceaux: string[] = [];
  for (let n = coefs.length - 1; n >= 0; n--) {
    const c = coefs[n];
    if (!c || c.num === 0) continue;
    const premier = morceaux.length === 0;
    const signe = c.num < 0 ? "-" : premier ? "" : "+";
    const abs: Frac = { num: Math.abs(c.num), den: c.den };
    const puissance = n === 0 ? "" : n === 1 ? variable : `${variable}^{${n}}`;
    let corps: string;
    if (n === 0) corps = fracLatex(abs);
    else if (abs.den === 1) corps = `${abs.num === 1 ? "" : abs.num}${puissance}`;
    else corps = `\\dfrac{${abs.num === 1 ? "" : abs.num}${puissance}}{${abs.den}}`;
    morceaux.push(`${signe}${corps}`);
  }
  return morceaux.length === 0 ? "0" : morceaux.join("");
}

// ============================================================================
// Profil.
// ============================================================================

export function fLatex(e: ExerciceContenanceObjets): string {
  const p = e.profil;
  switch (p.type) {
    case "racine": {
      const k = Math.round(Math.sqrt(p.a));
      return k * k === p.a ? `${k}\\sqrt{x}` : `\\sqrt{${p.a}x}`;
    }
    case "parabole":
      return `${p.r}+\\dfrac{x^2}{${p.n}}`;
    case "bombe":
      return `${p.R}-\\dfrac{x^2}{${p.n}}`;
    case "ellipse": {
      const k = frac(p.b, p.a);
      return `${fracLatex(k)}\\sqrt{${p.a * p.a}-x^2}`;
    }
    case "droite":
      return `${p.r}+${polynomeLatex([frac(0), frac(p.R - p.r, p.h)])}`;
  }
}

export function carreLatex(e: ExerciceContenanceObjets): string {
  return polynomeLatex(e.carre);
}

export function primitiveLatex(e: ExerciceContenanceObjets, variable = "x"): string {
  return polynomeLatex(primitivePolynome(e.carre), variable);
}

const UNITE_LATEX: Record<string, string> = { cm: "\\text{ cm}", "cm³": "\\text{ cm}^3", L: "\\text{ L}", cL: "\\text{ cL}" };

export function volumeLatex(e: ExerciceContenanceObjets): string {
  return `V=${multiplePiLatex(e.volumeSurPi)}${UNITE_LATEX["cm³"]}\\approx ${nombreLatex(volumeCm3(e), 1)}${UNITE_LATEX["cm³"]}`;
}

/** Contenance dans l'unité du contexte : forme exacte (multiple de π) puis valeur approchée. */
export function contenanceLatex(e: ExerciceContenanceObjets): string {
  const u = uniteContenance(e);
  const exact = fois(e.volumeSurPi, frac(1, u === "cL" ? 10 : 1000));
  return `${multiplePiLatex(exact)}${UNITE_LATEX[u]}\\approx ${nombreLatex(contenanceUnite(e), u === "cL" ? 1 : 2)}${UNITE_LATEX[u]}`;
}

/** Hauteur exacte quand la quantité est une fraction 1/k de la contenance du verre : t = h·√(1/k). */
function hauteurExacteLatex(e: ExerciceContenanceObjets): string | null {
  if (!e.fraction) return null;
  const k = e.fraction.den / e.fraction.num;
  const h = e.b - e.a;
  const s = Math.round(Math.sqrt(k));
  if (s * s === k) return fracLatex(frac(h, s));
  const c = frac(h, k);
  return c.den === 1 ? `${c.num === 1 ? "" : c.num}\\sqrt{${k}}` : `\\dfrac{${c.num === 1 ? "" : c.num}\\sqrt{${k}}}{${c.den}}`;
}

export function hauteurLatex(e: ExerciceContenanceObjets): string {
  const exact = hauteurExacteLatex(e);
  return `t${exact ? `=${exact}` : ""}\\approx ${nombreLatex(e.hauteurLiquide, 1)}${UNITE_LATEX.cm}`;
}

export function volumeSecondLatex(e: ExerciceContenanceObjets): string {
  return e.secondSurPi ? `V_2=${multiplePiLatex(e.secondSurPi)}${UNITE_LATEX["cm³"]}\\approx ${nombreLatex(volumeSecond(e), 1)}${UNITE_LATEX["cm³"]}` : "";
}

// ============================================================================
// Énoncé.
// ============================================================================

const NOMS: Record<ExerciceContenanceObjets["objet"], { premier: string; second: string; pluriel: string }> = {
  verre: { premier: "Le verre à vin", second: "Le verre conique", pluriel: "verres" },
  vase: { premier: "Le vase évasé", second: "Le vase cylindrique", pluriel: "vases" },
  tonneau: { premier: "Le tonneau", second: "La cuve cylindrique", pluriel: "tonneaux" },
  flacon: { premier: "Le flacon ellipsoïdal", second: "Le flacon cylindrique", pluriel: "flacons" },
  pot: { premier: "Le pot", second: "Le second pot", pluriel: "pots" },
};

function n(x: number): string {
  return nombreTexte(x, 1);
}

const REPERE: FragmentConsigne = texte(
  " Dans le repère, l'axe des abscisses est l'axe de l'objet : x est la position le long de cet axe (en cm) et f(x) le rayon intérieur (en cm) à la position x. La contenance est le volume engendré par la rotation de la courbe de f autour de l'axe des abscisses.",
);

export function consigneGenerale(e: ExerciceContenanceObjets): FragmentConsigne[] {
  const p = e.profil;
  const f = latex(`f(x)=${fLatex(e)}`);
  switch (e.objet) {
    case "verre":
      return [texte(`Un verre à vin mesure ${n(e.hauteurTotale)} cm de haut, dont ${n(e.horsCavite)} cm de pied. On mesure x depuis le fond de la coupe ; le profil intérieur de la coupe est `), f, texte("."), REPERE];
    case "vase":
      return [texte(`Un vase en verre mesure ${n(e.hauteurTotale)} cm de haut ; son fond a une épaisseur de ${n(e.horsCavite)} cm. On mesure x depuis le fond intérieur ; le profil intérieur est `), f, texte("."), REPERE];
    case "tonneau": {
      const r = p.type === "bombe" ? p.R - (e.b * e.b) / p.n : 0;
      const R = p.type === "bombe" ? p.R : 0;
      return [
        texte(`Un tonneau posé debout mesure ${n(e.hauteurTotale)} cm de haut ; son diamètre intérieur vaut ${n(2 * R)} cm au milieu (à la bonde) et ${n(2 * r)} cm aux deux fonds (parois minces). On mesure x depuis le milieu du tonneau ; le profil intérieur est `),
        f,
        texte("."),
        REPERE,
      ];
    }
    case "flacon":
      return [texte(`Un flacon de parfum mesure ${n(e.hauteurTotale)} cm de haut, dont ${n(e.horsCavite)} cm de bouchon ; son réservoir est un ellipsoïde (parois minces). On mesure x depuis le centre du réservoir ; le profil intérieur est `), f, texte("."), REPERE];
    case "pot": {
      const r = p.type === "droite" ? p.r : 0;
      const R = p.type === "droite" ? p.R : 0;
      return [
        texte(`Un pot de fleurs mesure ${n(e.hauteurTotale)} cm de haut ; son fond a une épaisseur de ${n(e.horsCavite)} cm. Son intérieur est un tronc de cône : diamètre intérieur de ${n(2 * r)} cm au fond et de ${n(2 * R)} cm à l'ouverture. On mesure x depuis le fond intérieur ; le rayon intérieur f(x) varie de façon affine avec x.`),
        REPERE,
      ];
    }
  }
}

/** Données encadrées (LaTeX) : le profil quand il est donné. */
export function blocDonnees(e: ExerciceContenanceObjets): string[] {
  return e.objet === "pot" ? [] : [`f(x)=${fLatex(e)}`];
}

const FRACTIONS_TEXTE: Record<number, string> = { 2: "à la moitié", 3: "au tiers", 4: "au quart" };

export const PRECISION_HAUTEUR = "Donne la valeur exacte, ou une valeur arrondie au millimètre (en cm).";

/** Question de transfert (dernier écran ; question b) de l'énoncé papier). */
export function texteTransfert(e: ExerciceContenanceObjets): FragmentConsigne[] {
  if (e.transfert === "hauteur") {
    if (e.objet === "pot") return [texte(`On verse ${nombreTexte(e.quantite, 1)} L de terreau dans le pot, en surface plane. À quelle hauteur t, mesurée depuis le fond intérieur, arrive le terreau ? ${PRECISION_HAUTEUR}`)];
    const debut = e.fraction ? `On remplit le verre ${FRACTIONS_TEXTE[e.fraction.den]} de sa contenance.` : `On sert ${nombreTexte(e.quantite, 0)} cL de vin dans ce verre.`;
    return [texte(`${debut} À quelle hauteur t, mesurée depuis le fond de la coupe, arrive le vin ? ${PRECISION_HAUTEUR}`)];
  }
  if (e.transfert === "nombre") {
    const s = e.source?.libelle ?? "";
    if (e.objet === "vase") return [texte(`Combien de ${s} faut-il verser pour remplir complètement le vase ?`)];
    if (e.objet === "tonneau") return [texte(`Combien de ${s} peut-on remplir complètement avec le contenu du tonneau ?`)];
    return [texte(`Avec ${s}, combien de ${NOMS[e.objet].pluriel} peut-on remplir complètement ?`)];
  }
  const d = e.second;
  if (!d) return [];
  const D = n(d.diametre);
  const k = n(d.hauteur);
  const description: Record<ExerciceContenanceObjets["objet"], string> = {
    verre: `Un second verre, conique, a une ouverture de ${D} cm de diamètre et une profondeur de ${k} cm.`,
    vase: `Un second vase, cylindrique, a un diamètre intérieur de ${D} cm et la même hauteur intérieure que le premier.`,
    tonneau: `Une cuve cylindrique a un diamètre intérieur de ${D} cm et la même hauteur intérieure que le tonneau.`,
    flacon: `Un second flacon, cylindrique, a un diamètre intérieur de ${D} cm et une hauteur intérieure de ${k} cm.`,
    pot: "",
  };
  const qui: Record<ExerciceContenanceObjets["objet"], string> = { verre: "verres", vase: "vases", tonneau: "récipients", flacon: "flacons", pot: "pots" };
  return [texte(`${description[e.objet]} Lequel des deux ${qui[e.objet]} contient le plus ?`)];
}

// ============================================================================
// Écrans.
// ============================================================================

export function consigneEcran(e: ExerciceContenanceObjets, phase: PhaseContenance): FragmentConsigne[] {
  switch (phase) {
    case "modele":
      return [texte("La contenance est le volume de l'intérieur de l'objet. Quelle formule permet de la calculer ? Les bornes a et b seront déterminées à l'étape suivante.")];
    case "poser":
      if (e.objet === "pot") return [texte("Détermine l'expression de f(x) à partir des cotes, puis les bornes a et b de l'intégrale.")];
      return [texte("Pose l'intégrale : donne les bornes a et b (à partir des cotes et de l'origine choisie pour x), puis l'expression développée de "), latex("[f(x)]^2"), texte(".")];
    case "calculer":
      return [texte("Calcule la contenance V en cm³. Donne la valeur exacte, ou une valeur arrondie à l'unité.")];
    case "convertir":
      return uniteContenance(e) === "cL"
        ? [texte("Exprime cette contenance en centilitres. Donne la valeur exacte, ou une valeur arrondie au dixième.")]
        : [texte("Exprime cette contenance en litres. Donne la valeur exacte, ou une valeur arrondie au centième.")];
    case "transfert":
      return texteTransfert(e);
  }
}

export function champsEcran(e: ExerciceContenanceObjets, phase: PhaseContenance): ChampDef[] {
  const bornes: ChampDef[] = [
    { label: "a =", labelLatex: "a=", unite: "cm", placeholder: "ex : 2" },
    { label: "b =", labelLatex: "b=", unite: "cm", placeholder: "ex : 12" },
  ];
  switch (phase) {
    case "modele":
      return [];
    case "poser":
      if (e.objet === "pot") return [{ label: "f(x) =", labelLatex: "f(x)=", placeholder: "ex : 3 + x/5", expression: true }, ...bornes];
      return [...bornes, { label: "[f(x)]² =", labelLatex: "[f(x)]^2=", placeholder: "ex : 4x + 1", expression: true }];
    case "calculer":
      return [{ label: "V =", labelLatex: "V=", unite: "cm³", placeholder: "ex : 450", expression: true }];
    case "convertir":
      return [{ label: "Contenance =", unite: uniteContenance(e), placeholder: uniteContenance(e) === "cL" ? "ex : 12,5" : "ex : 1,25", expression: true }];
    case "transfert":
      if (e.transfert === "hauteur") return [{ label: "t =", labelLatex: "t=", unite: "cm", placeholder: "ex : 5,3", expression: true }];
      if (e.transfert === "nombre") return [{ label: "Nombre =", placeholder: "ex : 7" }];
      return [];
  }
}

const OPTIONS_MODELE_LATEX = [
  "V=\\pi\\displaystyle\\int_a^b [f(x)]^2\\,dx",
  "V=\\pi\\displaystyle\\int_a^b f(x)\\,dx",
  "V=\\displaystyle\\int_a^b [f(x)]^2\\,dx",
];

export function paroiEpaisse(e: ExerciceContenanceObjets): boolean {
  return e.objet === "verre" || e.objet === "vase" || e.objet === "pot";
}

/** Option du modèle d'indice canonique `i` (0 = correcte). */
export function optionModele(e: ExerciceContenanceObjets, i: number): FragmentConsigne[] {
  if (i < 3) return [latex(OPTIONS_MODELE_LATEX[i])];
  if (paroiEpaisse(e)) return [latex("V=\\pi\\displaystyle\\int_a^b \\left([g(x)]^2-[f(x)]^2\\right)dx"), texte(" (g : profil extérieur)")];
  return [latex("V=\\pi\\displaystyle\\int_a^b [2f(x)]^2\\,dx")];
}

export function optionsEcran(e: ExerciceContenanceObjets, phase: PhaseContenance): OptionChoix[] {
  if (phase === "modele") return e.ordreModele.map((i) => ({ id: String(i), fragments: optionModele(e, i) }));
  if (phase === "transfert" && e.transfert === "comparer") {
    return [
      { id: "premier", fragments: [texte(`${NOMS[e.objet].premier} (profil f)`)] },
      { id: "second", fragments: [texte(NOMS[e.objet].second)] },
    ];
  }
  return [];
}

export function verdictComparaison(e: ExerciceContenanceObjets): FragmentConsigne[] {
  const gagnant = e.premierPlusGrand ? `${NOMS[e.objet].premier} (profil f)` : NOMS[e.objet].second;
  return [texte(`${gagnant} contient le plus.`)];
}

// ============================================================================
// Aides (jamais la réponse : il reste toujours un calcul).
// ============================================================================

const AUCUNE: AideAvecLatex = { texte: "", latex: null };

export function aideNiveau1(e: ExerciceContenanceObjets, phase: PhaseContenance): AideAvecLatex {
  switch (phase) {
    case "modele":
      return { texte: "Chaque tranche fine de l'intérieur, perpendiculaire à l'axe, est un disque de rayon f(x) ; son aire vaut :", latex: "S(x)=\\pi[f(x)]^2" };
    case "poser":
      if (e.objet === "tonneau") return { texte: "x part du milieu : le tonneau s'étend d'une demi-hauteur de chaque côté de l'origine :", latex: "a=-\\dfrac{\\text{hauteur}}{2},\\quad b=\\dfrac{\\text{hauteur}}{2}" };
      if (e.objet === "flacon") return { texte: "x part du centre du réservoir ; le réservoir mesure la hauteur totale moins le bouchon, et s'étend de part et d'autre de l'origine :", latex: "a=-\\dfrac{\\text{réservoir}}{2},\\quad b=\\dfrac{\\text{réservoir}}{2}" };
      if (e.objet === "verre") return { texte: "x part du fond de la coupe ; seule la coupe contient du vin, pas le pied :", latex: "a=0,\\quad b=\\text{hauteur totale}-\\text{pied}" };
      return { texte: "x part du fond intérieur ; l'épaisseur du fond ne contient rien :", latex: "a=0,\\quad b=\\text{hauteur totale}-\\text{fond}" };
    case "calculer":
      return { texte: "Calcule une primitive F de [f(x)]² terme à terme, évalue-la entre les bornes, sans oublier π :", latex: "V=\\pi\\Big[F(x)\\Big]_a^b=\\pi\\big(F(b)-F(a)\\big)" };
    case "convertir":
      return { texte: "Conversions de volume :", latex: "1\\text{ L}=1\\text{ dm}^3=1\\,000\\text{ cm}^3" };
    case "transfert":
      if (e.transfert === "hauteur") return { texte: "Le contenu remplit le solide depuis le fond jusqu'à la hauteur t : on résout, avec le volume versé en cm³ :", latex: "\\pi\\displaystyle\\int_0^{t}[f(x)]^2\\,dx=V_{\\text{versé}}" };
      if (e.transfert === "nombre") {
        if (e.objet === "vase") return { texte: "Compare la contenance du vase à celle d'un récipient versé, dans la même unité :", latex: "\\dfrac{\\text{contenance du vase}}{\\text{contenance d'un récipient}}" };
        if (e.objet === "tonneau") return { texte: "Compare la contenance du tonneau à celle d'une bouteille, dans la même unité :", latex: "\\dfrac{\\text{contenance du tonneau}}{\\text{contenance d'une bouteille}}" };
        return { texte: "Compare la quantité disponible à la contenance d'un récipient, dans la même unité :", latex: "\\dfrac{\\text{quantité disponible}}{\\text{contenance d'un récipient}}" };
      }
      return e.second?.forme === "cone"
        ? { texte: "Volume d'un cône de rayon ρ et de hauteur k (ou méthode des disques avec un profil linéaire) :", latex: "V_2=\\dfrac{1}{3}\\pi\\rho^2k" }
        : { texte: "Volume d'un cylindre de rayon ρ et de hauteur k :", latex: "V_2=\\pi\\rho^2k" };
  }
}

export function aideNiveau2(e: ExerciceContenanceObjets, phase: PhaseContenance): AideAvecLatex {
  const p = e.profil;
  switch (phase) {
    case "modele":
      return paroiEpaisse(e)
        ? { texte: "Des rondelles entre le profil extérieur et f donneraient le volume de la paroi (la matière), pas la contenance. Le volume est la somme des aires des tranches :", latex: "V=\\displaystyle\\int_a^b S(x)\\,dx" }
        : { texte: "f(x) est un rayon, pas un diamètre. Le volume est la somme des aires des tranches :", latex: "V=\\displaystyle\\int_a^b S(x)\\,dx" };
    case "poser":
      if (p.type === "racine")
        return Number.isInteger(Math.sqrt(p.a))
          ? { texte: "Le carré porte sur le coefficient et sur la racine :", latex: "\\left(k\\sqrt{u}\\right)^2=k^2u" }
          : { texte: "Le carré annule la racine :", latex: "\\left(\\sqrt{u}\\right)^2=u" };
      if (p.type === "parabole" || p.type === "bombe") return { texte: "Développe le carré d'un binôme :", latex: "(p\\pm q)^2=p^2\\pm 2pq+q^2" };
      if (p.type === "ellipse") return { texte: "Le carré porte sur le coefficient et sur la racine :", latex: "\\left(k\\sqrt{u}\\right)^2=k^2u" };
      return { texte: "Les cotes Ø sont des diamètres. Le rayon passe de r (fond) à R (ouverture) de façon affine sur la profondeur intérieure h :", latex: "f(x)=r+\\dfrac{R-r}{h}\\,x" };
    case "calculer":
      return { texte: "Une primitive de [f(x)]² est :", latex: `F(x)=${primitiveLatex(e)}` };
    case "convertir":
      return uniteContenance(e) === "cL" ? { texte: "Et pour les centilitres :", latex: "1\\text{ L}=100\\text{ cL},\\quad\\text{donc}\\quad 1\\text{ cL}=10\\text{ cm}^3" } : { texte: "Un litre vaut un décimètre cube :", latex: "1\\text{ cm}^3=0{,}001\\text{ L}" };
    case "transfert":
      if (e.transfert === "hauteur") {
        if (e.fraction) return { texte: "Le volume jusqu'à la hauteur t vaut π·a·t²/2 : il est proportionnel à t². L'équation devient :", latex: `\\dfrac{t^2}{${e.b - e.a}^2}=${fracLatex(e.fraction)}` };
        const cm3 = e.objet === "pot" ? e.quantite * 1000 : e.quantite * 10;
        return { texte: `Avec la primitive de [f(x)]² (et ${e.objet === "pot" ? "1 L = 1 000 cm³" : "1 cL = 10 cm³"}), l'équation devient :`, latex: `\\pi\\left(${primitiveLatex(e, "t")}\\right)=${nombreLatex(cm3, 0)}` };
      }
      if (e.transfert === "nombre") {
        return e.arrondi === "ceil"
          ? { texte: "Le quotient n'est pas entier : le dernier récipient, même incomplet, est nécessaire, donc on arrondit à l'entier supérieur.", latex: null }
          : { texte: "Le quotient n'est pas entier : seuls les récipients remplis complètement comptent, donc on garde la partie entière.", latex: null };
      }
      return e.second ? { texte: "La cote donnée est un diamètre ; le rayon vaut sa moitié :", latex: `\\rho=\\dfrac{${nombreLatex(e.second.diametre, 1)}}{2}` } : AUCUNE;
  }
}

// ============================================================================
// Réponses attendues, libellés.
// ============================================================================

export function bornesLatex(e: ExerciceContenanceObjets): string {
  return `a=${e.a},\\quad b=${e.b}`;
}

export function formatReponseAttenduePhaseLatex(e: ExerciceContenanceObjets, phase: PhaseContenance): string[] {
  switch (phase) {
    case "modele":
      return [OPTIONS_MODELE_LATEX[0]];
    case "poser":
      return [e.objet === "pot" ? `f(x)=${fLatex(e)},\\quad ${bornesLatex(e)}` : `${bornesLatex(e)},\\quad [f(x)]^2=${carreLatex(e)}`];
    case "calculer":
      return [volumeLatex(e)];
    case "convertir":
      return [`V=${contenanceLatex(e)}`];
    case "transfert":
      if (e.transfert === "hauteur") return [hauteurLatex(e)];
      if (e.transfert === "nombre") return [`n=${e.nombre}`];
      return [volumeSecondLatex(e)];
  }
}

export function libellePhase(e: ExerciceContenanceObjets, phase: PhaseContenance): string {
  switch (phase) {
    case "modele":
      return "Étape 1 (modèle)";
    case "poser":
      return "Étape 2 (intégrale)";
    case "calculer":
      return "Étape 3 (volume en cm³)";
    case "convertir":
      return `Étape 4 (contenance en ${uniteContenance(e)})`;
    case "transfert":
      return e.transfert === "hauteur" ? "Étape 5 (hauteur)" : e.transfert === "nombre" ? "Étape 5 (nombre de récipients)" : "Étape 5 (comparaison)";
  }
}

