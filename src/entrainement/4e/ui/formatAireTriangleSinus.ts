import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceAireTriangleSinus, NombreRadical } from "../core/aireTriangleSinus.types";
import {
  aireABC,
  aireACD,
  aireExacte,
  anglesAttendus,
  calculExact,
  coteAttendu,
  demiPerimetre,
  diagonale,
  diagonaleCarree,
  etapes,
  nomsAngleCompris,
  produitHeron,
  sinDeg,
  sinusAttendu,
  sinusExact,
  valeurAttendue,
  type EtapeAireTriangle,
  type OptionFormule,
} from "../moteur/modeleAireTriangleSinus";
import type { PiegeAngles, PiegeNombre } from "../moteur/verificationAireTriangleSinus";
import { nombreFrLatex } from "./nombreFr";

/**
 * Textes de gen75 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; aides = une phrase qui se termine par « : » puis la formule, sans
 * jamais donner la réponse finale.
 */

type Angle = Extract<ExerciceAireTriangleSinus, { famille: "aire" | "angle" | "cote" }>;
type Quadri = Extract<ExerciceAireTriangleSinus, { famille: "quadrilatere" }>;
type Heron = Extract<ExerciceAireTriangleSinus, { famille: "heron" }>;
type FamilleAngle = Extract<ExerciceAireTriangleSinus, { famille: "angle" }>;

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

export function arrondi(v: number, decimales: number): number {
  const f = 10 ** decimales;
  const r = Math.round(v * f) / f;
  return r === 0 ? 0 : r;
}

export function n(v: number, decimales = 2): string {
  return nombreFrLatex(arrondi(v, decimales));
}

function estEntier(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-9;
}

/** « = 8 » si la valeur est entière, sinon « ≈ 7,98 ». */
export function egalOuEnviron(v: number, decimales = 2): string {
  return estEntier(v) ? `= ${n(v, 0)}` : `\\approx ${n(v, decimales)}`;
}

export function radicalLatex(x: NombreRadical): string {
  const rac = x.r === 1 ? "" : `\\sqrt{${x.r}}`;
  if (x.d === 1) return x.r === 1 ? String(x.n) : `${x.n === 1 ? "" : x.n}${rac}`;
  if (x.r === 1) return `\\dfrac{${x.n}}{${x.d}}`;
  return `\\dfrac{${x.n === 1 ? "" : x.n}${rac}}{${x.d}}`;
}

export function uniteLongueur(e: ExerciceAireTriangleSinus): string {
  return `\\text{ ${e.unite}}`;
}

export function uniteAire(e: ExerciceAireTriangleSinus): string {
  return `\\text{ ${e.unite}}^2`;
}

export function chapeau(s: string): string {
  return `\\hat{${s}}`;
}

export const AIRE = "\\mathcal{A}";

/** Aire donnée (familles `angle` et `cote`), sans unité. */
export function aireDonneeLatex(e: Extract<ExerciceAireTriangleSinus, { famille: "angle" | "cote" }>): string {
  return e.aire.exacte ? radicalLatex(e.aire.exacte) : n(e.aire.valeur, 1);
}

/** sin d'un angle donné : valeur exacte (remarquable) ou approchée au millième. */
export function sinusLatex(angle: number): string {
  const ex = sinusExact(angle);
  return ex ? `\\sin ${angle}^\\circ = ${radicalLatex(ex)}` : `\\sin ${angle}^\\circ \\approx ${n(sinDeg(angle), 3)}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export function noms(e: Angle) {
  return nomsAngleCompris(e.sommet);
}

export function donneesFragments(e: ExerciceAireTriangleSinus): FragmentConsigne[] {
  const L = uniteLongueur(e);
  switch (e.famille) {
    case "aire": {
      const { X, seg1, seg2 } = noms(e);
      return [texte("Dans le triangle ABC : "), latex(`${seg1} = ${e.cote1}${L}`), texte(", "), latex(`${seg2} = ${e.cote2}${L}`), texte(" et "), latex(`${chapeau(X)} = ${e.angle}^\\circ`), texte(".")];
    }
    case "cote": {
      const { X, seg1 } = noms(e);
      return [texte("Dans le triangle ABC : "), latex(`${seg1} = ${e.cote1}${L}`), texte(", "), latex(`${chapeau(X)} = ${e.angle}^\\circ`), texte(" et l'aire vaut "), latex(`${AIRE} = ${aireDonneeLatex(e)}${uniteAire(e)}`), texte(".")];
    }
    case "angle": {
      const { seg1, seg2 } = noms(e);
      return [texte("Dans le triangle ABC : "), latex(`${seg1} = ${e.cote1}${L}`), texte(", "), latex(`${seg2} = ${e.cote2}${L}`), texte(" et l'aire vaut "), latex(`${AIRE} = ${aireDonneeLatex(e)}${uniteAire(e)}`), texte(".")];
    }
    case "quadrilatere":
      return [
        texte("Dans le quadrilatère convexe ABCD : "),
        latex(`AB = ${e.AB}${L}`),
        texte(", "),
        latex(`BC = ${e.BC}${L}`),
        texte(", "),
        latex(`\\widehat{ABC} = ${e.angleB}^\\circ`),
        texte(", "),
        latex(`CD = ${e.CD}${L}`),
        texte(" et "),
        latex(`\\widehat{ACD} = ${e.angleACD}^\\circ`),
        texte("."),
      ];
    case "heron":
      return [texte("Les côtés du triangle ABC mesurent "), latex(`BC = ${e.a}${L}`), texte(", "), latex(`AC = ${e.b}${L}`), texte(" et "), latex(`AB = ${e.c}${L}`), texte(".")];
  }
}

/** Objectif de l'exercice (en-tête de l'écran, consigne globale du papier). */
export function consigneGenerale(e: ExerciceAireTriangleSinus): FragmentConsigne[] {
  switch (e.famille) {
    case "aire":
      return [texte("Calcule l'aire du triangle ABC.")];
    case "cote":
      return [texte(`Calcule la longueur ${noms(e).seg2}.`)];
    case "angle":
      return [texte("Détermine la ou les amplitudes possibles de l'angle "), latex(chapeau(noms(e).X)), texte(".")];
    case "quadrilatere":
      return [texte("Calcule l'aire du quadrilatère ABCD.")];
    case "heron":
      return [texte("Calcule l'aire du triangle ABC avec la formule de Héron.")];
  }
}

/** Consigne papier : l'objectif et la précision demandée (consigne autosuffisante). */
export function consignePapier(e: ExerciceAireTriangleSinus): FragmentConsigne[] {
  const exact = calculExact(e);
  let precision: string;
  if (e.famille === "angle") precision = exact ? " Donne les valeurs exactes." : " Arrondis au dixième de degré.";
  else if (e.famille === "aire") precision = exact ? " Donne sa valeur exacte." : " Arrondis au centième.";
  else precision = exact ? "" : " Arrondis au centième.";
  return [...consigneGenerale(e), ...(precision ? [texte(precision)] : [])];
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export function nombreEcrans(e: ExerciceAireTriangleSinus): number {
  return etapes(e).length;
}

export function titreEtape(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): string {
  const X = e.famille === "aire" || e.famille === "cote" || e.famille === "angle" ? noms(e).X : "";
  switch (etape) {
    case "formuleAire":
      return "La formule de l'aire";
    case "calculAire":
      return "L'aire du triangle";
    case "formuleCote":
      return "La longueur à isoler";
    case "calculCote":
      return e.famille === "cote" ? `La longueur ${noms(e).seg2}` : "La longueur";
    case "sinus":
      return `Le sinus de l'angle ${X}`;
    case "nombreAngles":
      return "Le nombre d'amplitudes";
    case "angles":
      return `L'amplitude de l'angle ${X}`;
    case "aireABC":
      return "L'aire du triangle ABC";
    case "diagonale":
      return "La diagonale AC";
    case "aireTotale":
      return "L'aire de ABCD";
    case "demiPerimetre":
      return "Le demi-périmètre";
    case "aireHeron":
      return "L'aire (Héron)";
  }
}

export function consigneEtape(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): FragmentConsigne[] {
  switch (etape) {
    case "formuleAire":
      return [texte("Quelle formule donne l'aire du triangle ABC à partir de ces données ?")];
    case "calculAire":
      return [texte("Calcule l'aire du triangle ABC.")];
    case "formuleCote":
      return [texte(`Quelle expression donne la longueur ${noms(e as Angle).seg2} ?`)];
    case "calculCote":
      return [texte(`Calcule la longueur ${noms(e as Angle).seg2}.`)];
    case "sinus":
      return [texte("Calcule "), latex(`\\sin ${chapeau(noms(e as Angle).X)}`), texte(".")];
    case "nombreAngles":
      return [texte("Combien d'amplitudes de l'angle "), latex(chapeau(noms(e as Angle).X)), texte(" (entre 0° et 180°) ont ce sinus ?")];
    case "angles": {
      const X = chapeau(noms(e as Angle).X);
      return anglesAttendus(e as FamilleAngle).length === 2
        ? [texte("Calcule les deux amplitudes possibles de l'angle "), latex(X), texte(".")]
        : [texte("Calcule l'amplitude de l'angle "), latex(X), texte(".")];
    }
    case "aireABC":
      return [texte("Calcule l'aire du triangle ABC.")];
    case "diagonale":
      return [texte("Calcule la longueur de la diagonale AC.")];
    case "aireTotale":
      return [texte("Calcule l'aire du quadrilatère ABCD.")];
    case "demiPerimetre":
      return [texte("Calcule le demi-périmètre "), latex("p"), texte(" du triangle ABC.")];
    case "aireHeron":
      return [texte("Calcule l'aire du triangle ABC avec la formule de Héron.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Choix fermés
// ---------------------------------------------------------------------------------------------

/** Formule de l'aire (famille `aire`) ou expression du côté (famille `cote`) : 4 options. */
export function latexOptionFormule(e: Angle, etape: EtapeAireTriangle, option: OptionFormule): string {
  const { X, Y, seg1, seg2 } = noms(e);
  const x = chapeau(X);
  if (etape === "formuleAire") {
    switch (option) {
      case "correcte":
        return `${AIRE} = \\dfrac{1}{2} \\cdot ${seg1} \\cdot ${seg2} \\cdot \\sin ${x}`;
      case "piege1":
        return `${AIRE} = \\dfrac{1}{2} \\cdot ${seg1} \\cdot ${seg2} \\cdot \\cos ${x}`;
      case "piege2":
        return `${AIRE} = ${seg1} \\cdot ${seg2} \\cdot \\sin ${x}`;
      case "piege3":
        return `${AIRE} = \\dfrac{1}{2} \\cdot ${seg1} \\cdot ${seg2} \\cdot \\sin ${chapeau(Y)}`;
    }
  }
  switch (option) {
    case "correcte":
      return `${seg2} = \\dfrac{2${AIRE}}{${seg1} \\cdot \\sin ${x}}`;
    case "piege1":
      return `${seg2} = \\dfrac{${AIRE}}{2 \\cdot ${seg1} \\cdot \\sin ${x}}`;
    case "piege2":
      return `${seg2} = \\dfrac{2${AIRE} \\cdot \\sin ${x}}{${seg1}}`;
    case "piege3":
      return `${seg2} = \\dfrac{${AIRE}}{${seg1} \\cdot \\sin ${x}}`;
  }
}

const OPTIONS: OptionFormule[] = ["correcte", "piege1", "piege2", "piege3"];

/** Options dans l'ordre d'affichage tiré à la génération (`ordreOptions`). */
export function optionsFormule(e: Angle, etape: EtapeAireTriangle): { id: OptionFormule; latex: string }[] {
  return e.ordreOptions.map((i) => ({ id: OPTIONS[i]!, latex: latexOptionFormule(e, etape, OPTIONS[i]!) }));
}

export const LIBELLES_NOMBRE_ANGLES = { un: "Une seule amplitude", deux: "Deux amplitudes" } as const;

// ---------------------------------------------------------------------------------------------
// Champs numériques
// ---------------------------------------------------------------------------------------------

export interface ChampNumerique {
  libelle: string;
  suffixe: string;
}

export function champEtape(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): ChampNumerique {
  switch (etape) {
    case "calculAire":
    case "aireHeron":
      return { libelle: AIRE, suffixe: uniteAire(e) };
    case "calculCote":
      return { libelle: noms(e as Angle).seg2, suffixe: uniteLongueur(e) };
    case "sinus":
      return { libelle: `\\sin ${chapeau(noms(e as Angle).X)}`, suffixe: "" };
    case "aireABC":
      return { libelle: `${AIRE}_{ABC}`, suffixe: uniteAire(e) };
    case "diagonale":
      return { libelle: "AC", suffixe: uniteLongueur(e) };
    case "aireTotale":
      return { libelle: `${AIRE}_{ABCD}`, suffixe: uniteAire(e) };
    case "demiPerimetre":
      return { libelle: "p", suffixe: uniteLongueur(e) };
    default:
      return { libelle: "", suffixe: "" };
  }
}

/** Libellés des champs de l'écran « angles » (un ou deux). */
export function champsAngles(e: FamilleAngle): string[] {
  const X = chapeau(noms(e).X);
  return anglesAttendus(e).length === 2 ? [`${X}_1 \\text{ (aigu)}`, `${X}_2 \\text{ (obtus)}`] : [X];
}

/** Rappel de saisie sous le champ. */
export function indicationSaisie(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): string {
  if (etape === "sinus") return "Une valeur exacte (comme √3/2) ou approchée au millième.";
  if (etape === "angles") return "En degrés : une valeur approchée est acceptée, à environ 1 % près.";
  return calculExact(e)
    ? "Une valeur exacte (comme 6√3) ou approchée : acceptée à environ 1 % près."
    : "Une valeur approchée est acceptée, à environ 1 % près.";
}

/** Le bouton « √ » n'apparaît que si une valeur exacte peut contenir un radical. */
export function proposerRacine(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): boolean {
  if (etape === "sinus") return true;
  return calculExact(e) && (etape === "calculAire" || etape === "aireHeron");
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (écran révélé, corrigé, réponse brève)
// ---------------------------------------------------------------------------------------------

/** Valeur attendue d'une étape numérique, en LaTeX, avec son nom et son unité. */
export function reponseNumeriqueLatex(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): string {
  const { libelle, suffixe } = champEtape(e, etape);
  const v = valeurAttendue(e, etape)!;
  if (etape === "calculAire" && e.famille === "aire") {
    const ex = aireExacte(e.cote1, e.cote2, e.angle);
    if (ex) return `${libelle} = ${radicalLatex(ex)}${ex.r === 1 && ex.d === 1 ? "" : ` \\approx ${n(v)}`}${suffixe}`;
  }
  if (etape === "sinus" && e.famille === "angle" && e.aire.exacte) {
    const ex = sinusExact(e.angle)!;
    return `${libelle} = ${radicalLatex(ex)}${ex.r === 1 ? "" : ` \\approx ${n(v, 3)}`}`;
  }
  const decimales = etape === "sinus" ? 3 : 2;
  return `${libelle} ${egalOuEnviron(v, decimales)}${suffixe}`;
}

export function reponseAnglesLatex(e: FamilleAngle): string {
  const X = chapeau(noms(e).X);
  const a = anglesAttendus(e);
  const val = (v: number) => `${egalOuEnviron(v, 1)}^\\circ`;
  return a.length === 1 ? `${X} = 90^\\circ` : `${X}_1 ${val(a[0]!)} \\quad\\text{et}\\quad ${X}_2 ${val(a[1]!)}`;
}

// ---------------------------------------------------------------------------------------------
// Aides (deux paliers, jamais la réponse finale)
// ---------------------------------------------------------------------------------------------

export function aidesEtape(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): FragmentConsigne[][] {
  switch (etape) {
    case "formuleAire":
      return [
        [texte("L'aire se calcule avec deux côtés et l'angle qu'ils forment entre eux (l'angle COMPRIS) : quel angle se trouve entre ces deux côtés ?")],
        [texte("Formule du cours, avec l'angle Ĉ compris entre les côtés a et b :"), latex(`${AIRE} = \\dfrac{1}{2}\\, a b \\sin \\hat{C}`)],
      ];
    case "calculAire": {
      const t = e as Angle;
      const { X, seg1, seg2 } = noms(t);
      return [
        [texte("Remplace dans la formule :"), latex(`${AIRE} = \\dfrac{1}{2} \\cdot ${t.cote1} \\cdot ${t.cote2} \\cdot \\sin ${t.angle}^\\circ`)],
        [texte(`Valeur du sinus de l'angle ${X} compris entre ${seg1} et ${seg2}${sinusExact(t.angle) ? " (valeur remarquable)" : " (calculatrice en mode degrés)"} :`), latex(sinusLatex(t.angle))],
      ];
    }
    case "formuleCote": {
      const t = e as Angle;
      const { X, seg1, seg2 } = noms(t);
      return [
        [texte(`Écris d'abord la formule de l'aire avec les deux côtés qui encadrent l'angle ${X} :`), latex(`${AIRE} = \\dfrac{1}{2} \\cdot ${seg1} \\cdot ${seg2} \\cdot \\sin ${chapeau(X)}`)],
        [texte(`Multiplie les deux membres par 2, puis divise par ce qui accompagne ${seg2} :`), latex(`2${AIRE} = ${seg1} \\cdot ${seg2} \\cdot \\sin ${chapeau(X)}`)],
      ];
    }
    case "calculCote": {
      const t = e as Extract<ExerciceAireTriangleSinus, { famille: "cote" }>;
      const { seg2 } = noms(t);
      return [
        [texte("Remplace dans l'expression :"), latex(`${seg2} = \\dfrac{2 \\cdot ${aireDonneeLatex(t)}}{${t.cote1} \\cdot \\sin ${t.angle}^\\circ}`)],
        [texte(sinusExact(t.angle) ? "Valeur remarquable du sinus :" : "Valeur du sinus (calculatrice en mode degrés) :"), latex(sinusLatex(t.angle))],
      ];
    }
    case "sinus": {
      const t = e as FamilleAngle;
      const { X, seg1, seg2 } = noms(t);
      return [
        [texte(`Pars de la formule de l'aire et isole le sinus de l'angle ${X} :`), latex(`\\sin ${chapeau(X)} = \\dfrac{2${AIRE}}{${seg1} \\cdot ${seg2}}`)],
        [texte("Remplace par les données :"), latex(`\\sin ${chapeau(X)} = \\dfrac{2 \\cdot ${aireDonneeLatex(t)}}{${t.cote1} \\cdot ${t.cote2}}`)],
      ];
    }
    case "nombreAngles":
      return [
        [texte("Sur le cercle trigonométrique, le sinus est l'ordonnée du point. Combien de points du demi-cercle supérieur ont cette ordonnée ?")],
        [texte("Deux angles supplémentaires ont le même sinus :"), latex("\\sin(180^\\circ - x) = \\sin x")],
      ];
    case "angles": {
      const t = e as FamilleAngle;
      const X = chapeau(noms(t).X);
      if (anglesAttendus(t).length === 1) {
        return [
          [texte("Le sinus vaut 1 :"), latex(`\\sin ${X} = 1`)],
          [texte("Sur le cercle trigonométrique, un seul point a une ordonnée égale à 1 : quel angle lui correspond ?")],
        ];
      }
      const premiere: FragmentConsigne[] = t.aire.exacte
        ? [texte("Valeur remarquable : quel angle aigu a ce sinus ?"), latex(`\\sin ${X}_1 = ${radicalLatex(sinusExact(t.angle)!)}`)]
        : [texte("La touche « sin⁻¹ » de la calculatrice (en mode degrés) donne l'angle aigu :"), latex(`${X}_1 = \\sin^{-1}(${n(sinusAttendu(t), 3)})`)];
      return [premiere, [texte("La seconde amplitude est le supplémentaire de la première :"), latex(`${X}_2 = 180^\\circ - ${X}_1`)]];
    }
    case "aireABC": {
      const q = e as Quadri;
      return [
        [texte("Dans le triangle ABC, l'angle B est compris entre AB et BC :"), latex(`${AIRE}_{ABC} = \\dfrac{1}{2} \\cdot AB \\cdot BC \\cdot \\sin \\widehat{ABC}`)],
        [texte("Remplace par les données :"), latex(`${AIRE}_{ABC} = \\dfrac{1}{2} \\cdot ${q.AB} \\cdot ${q.BC} \\cdot \\sin ${q.angleB}^\\circ`)],
      ];
    }
    case "diagonale": {
      const q = e as Quadri;
      if (q.angleB === 90) {
        return [
          [texte("Le triangle ABC est rectangle en B : AC est son hypoténuse :"), latex("AC^2 = AB^2 + BC^2")],
          [texte("Remplace, puis prends la racine carrée :"), latex(`AC^2 = ${q.AB}^2 + ${q.BC}^2`)],
        ];
      }
      return [
        [texte("Al-Kashi dans le triangle ABC, avec l'angle B compris entre AB et BC :"), latex("AC^2 = AB^2 + BC^2 - 2 \\cdot AB \\cdot BC \\cdot \\cos \\widehat{ABC}")],
        [texte("Remplace, puis prends la racine carrée :"), latex(`AC^2 = ${q.AB}^2 + ${q.BC}^2 - 2 \\cdot ${q.AB} \\cdot ${q.BC} \\cdot \\cos ${q.angleB}^\\circ`)],
      ];
    }
    case "aireTotale": {
      const q = e as Quadri;
      return [
        [texte("La diagonale AC découpe ABCD en deux triangles ; additionne leurs aires :"), latex(`${AIRE}_{ABCD} = ${AIRE}_{ABC} + ${AIRE}_{ACD}`)],
        [texte("Dans ACD, l'angle C est compris entre CA et CD :"), latex(`${AIRE}_{ACD} = \\dfrac{1}{2} \\cdot AC \\cdot CD \\cdot \\sin \\widehat{ACD} \\approx \\dfrac{1}{2} \\cdot ${n(diagonale(q))} \\cdot ${q.CD} \\cdot \\sin ${q.angleACD}^\\circ`)],
      ];
    }
    case "demiPerimetre": {
      const h = e as Heron;
      return [
        [texte("Le demi-périmètre est la moitié de la somme des trois côtés :"), latex("p = \\dfrac{a + b + c}{2}")],
        [texte("Remplace par les côtés :"), latex(`p = \\dfrac{${h.a} + ${h.b} + ${h.c}}{2}`)],
      ];
    }
    case "aireHeron": {
      const h = e as Heron;
      const p = n(demiPerimetre(h), 1);
      return [
        [texte("Formule de Héron, avec le demi-périmètre p et les trois côtés a, b et c :"), latex(`${AIRE} = \\sqrt{p\\,(p-a)(p-b)(p-c)}`)],
        [texte("Remplace :"), latex(`${AIRE} = \\sqrt{${p} \\cdot (${p} - ${h.a}) \\cdot (${p} - ${h.b}) \\cdot (${p} - ${h.c})}`)],
      ];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Messages des erreurs reconnues (jamais la valeur attendue)
// ---------------------------------------------------------------------------------------------

export function messagePiegeNombre(etape: EtapeAireTriangle, piege: PiegeNombre): string {
  switch (piege) {
    case "sansDemi":
      return "Tu sembles avoir oublié le facteur ½ de la formule.";
    case "cosinus":
      return "La formule de l'aire utilise le SINUS de l'angle compris, pas son cosinus.";
    case "radians":
      return "Ta calculatrice semble être en radians : passe-la en mode degrés.";
    case "sansSinus":
      return etape === "calculCote" ? "N'oublie pas de diviser aussi par le sinus de l'angle." : "Il manque le sinus de l'angle compris.";
    case "sansDeux":
      return "Revois l'isolement : quand on isole, le ½ de la formule devient un facteur 2 de l'autre côté.";
    case "produit":
      return "Le sinus doit diviser, pas multiplier.";
    case "inverse":
      return "Tu as inversé le quotient : le double de l'aire va au numérateur.";
    case "carre":
      return "Tu as donné AC² : prends encore la racine carrée.";
    case "sansCos":
      return "N'oublie pas le terme en cosinus de la formule d'Al-Kashi.";
    case "signe":
      return "Attention au signe : dans Al-Kashi, on SOUSTRAIT le terme en cosinus (le cosinus d'un angle obtus est négatif).";
    case "aireACDseule":
      return "C'est l'aire du triangle ACD seulement : ajoute celle du triangle ABC.";
    case "aireABCseule":
      return "C'est l'aire du triangle ABC seulement : il manque celle du triangle ACD.";
    case "perimetre":
      return etape === "demiPerimetre" ? "C'est le périmètre : le demi-périmètre en est la moitié." : "La formule de Héron utilise le DEMI-périmètre p, pas le périmètre.";
    case "sansRacine":
      return "N'oublie pas la racine carrée de la formule de Héron.";
  }
}

export function messagePiegeAngles(piege: PiegeAngles): string {
  switch (piege) {
    case "identiques":
      return "Les deux amplitudes doivent être différentes : la seconde est le supplémentaire de la première.";
    case "supplementaire":
      return "Une des amplitudes est juste ; l'autre est son supplémentaire (même sinus).";
    case "complementaire":
      return "Supplémentaire, pas complémentaire : les deux amplitudes ont une somme de 180°.";
    case "radians":
      return "Ta calculatrice semble être en radians : passe-la en mode degrés.";
    case "sansDeux":
      return "Revois le sinus : c'est le DOUBLE de l'aire qu'on divise par le produit des deux côtés.";
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé (partagé par l'adaptateur papier)
// ---------------------------------------------------------------------------------------------

export function latexCalculAire(c1: number, c2: number, angle: number, nom: string, e: ExerciceAireTriangleSinus): string {
  const v = 0.5 * c1 * c2 * sinDeg(angle);
  const ex = aireExacte(c1, c2, angle);
  const fin = ex ? `= ${radicalLatex(ex)}${ex.r === 1 && ex.d === 1 ? "" : ` \\approx ${n(v)}`}` : `\\approx ${n(v)}`;
  return `${nom} = \\dfrac{1}{2} \\cdot ${c1} \\cdot ${c2} \\cdot \\sin ${angle}^\\circ ${fin}${uniteAire(e)}`;
}

export function latexCalculCote(e: Extract<ExerciceAireTriangleSinus, { famille: "cote" }>): string {
  const { seg2 } = noms(e);
  return `${seg2} = \\dfrac{2 \\cdot ${aireDonneeLatex(e)}}{${e.cote1} \\cdot \\sin ${e.angle}^\\circ} ${egalOuEnviron(coteAttendu(e))}${uniteLongueur(e)}`;
}

export function latexCalculSinus(e: FamilleAngle): string {
  const { X } = noms(e);
  const s = sinusAttendu(e);
  const fin = e.aire.exacte ? `= ${radicalLatex(sinusExact(e.angle)!)}` : `\\approx ${n(s, 3)}`;
  return `\\sin ${chapeau(X)} = \\dfrac{2 \\cdot ${aireDonneeLatex(e)}}{${e.cote1} \\cdot ${e.cote2}} ${fin}`;
}

export function latexDiagonale(q: Quadri): string {
  const terme = q.angleB === 90 ? "" : ` - 2 \\cdot ${q.AB} \\cdot ${q.BC} \\cdot \\cos ${q.angleB}^\\circ`;
  return `AC^2 = ${q.AB}^2 + ${q.BC}^2${terme} ${egalOuEnviron(diagonaleCarree(q))} \\quad\\Rightarrow\\quad AC ${egalOuEnviron(diagonale(q))}${uniteLongueur(q)}`;
}

export function latexAireACD(q: Quadri): string {
  return `${AIRE}_{ACD} = \\dfrac{1}{2} \\cdot AC \\cdot ${q.CD} \\cdot \\sin ${q.angleACD}^\\circ \\approx ${n(aireACD(q))}${uniteAire(q)}`;
}

export function latexAireTotale(q: Quadri): string {
  return `${AIRE}_{ABCD} = ${AIRE}_{ABC} + ${AIRE}_{ACD} \\approx ${n(aireABC(q))} + ${n(aireACD(q))} \\approx ${n(aireABC(q) + aireACD(q))}${uniteAire(q)}`;
}

export function latexDemiPerimetre(h: Heron): string {
  return `p = \\dfrac{${h.a} + ${h.b} + ${h.c}}{2} = ${n(demiPerimetre(h), 1)}${uniteLongueur(h)}`;
}

export function latexHeron(h: Heron): string {
  const p = n(demiPerimetre(h), 1);
  const P = produitHeron(h);
  return `${AIRE} = \\sqrt{${p} \\cdot ${n(demiPerimetre(h) - h.a, 1)} \\cdot ${n(demiPerimetre(h) - h.b, 1)} \\cdot ${n(demiPerimetre(h) - h.c, 1)}} = \\sqrt{${n(P, 4)}} ${egalOuEnviron(Math.sqrt(P))}${uniteAire(h)}`;
}
