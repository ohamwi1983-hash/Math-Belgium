import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { CalculTriangle, ExerciceDeuxPositions, ExerciceTexteTriangle, ExerciceTexteTriangleStandard, LoiTexteTriangle, RoleElement, TypeConversion } from "../core/texteTriangle.types";
import { arrondir, carreCosinus, valeurCalcul, type TypeEcran } from "../moteur/modeleTexteTriangle";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Textes de gen77 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; aides : une phrase qui se termine par « : », puis la formule.
 */

export const TITRES_STANDARD = ["Les éléments du triangle", "Les angles intérieurs", "La loi à utiliser", "Le calcul", "La réponse"];
export const TITRES_DEUX_POSITIONS = ["Les données du triangle", "La loi à utiliser", "Les deux angles possibles", "Les deux distances", "La position retenue"];

export function titresEcrans(e: ExerciceTexteTriangle): string[] {
  return e.variante === "deuxPositions" ? TITRES_DEUX_POSITIONS : TITRES_STANDARD;
}

/** Nombre en LaTeX, arrondi à `decimales` (2 par défaut), virgule décimale. */
export function n(valeur: number, decimales = 2): string {
  return String(Number(arrondir(valeur, decimales).toFixed(10))).replace(".", "{,}");
}

/** Nombre en texte, arrondi à `decimales`, virgule décimale. */
export function nt(valeur: number, decimales = 2): string {
  return String(Number(arrondir(valeur, decimales).toFixed(10))).replace(".", ",");
}

export function degres(valeur: number, decimales = 2): string {
  return `${n(valeur, decimales)}^\\circ`;
}

export const ROLES: { id: RoleElement; label: string }[] = [
  { id: "donne", label: "Donné" },
  { id: "convertir", label: "À convertir" },
  { id: "cherche", label: "Cherché" },
];

export function libelleRole(role: RoleElement): string {
  return ROLES.find((r) => r.id === role)!.label;
}

// ---------------------------------------------------------------------------------------------
// Noms utiles de « deux positions »
// ---------------------------------------------------------------------------------------------

export function nomsDeuxPositions(e: ExerciceDeuxPositions) {
  const { R, P, B } = e.noms;
  return {
    angleB: `\\widehat{${P}${B}${R}}`,
    angleR: `\\widehat{${P}${R}${B}}`,
    angleP: `\\widehat{${R}${P}${B}}`,
    PB: `${P}${B}`,
    RB: `${R}${B}`,
    RP: `${R}${P}`,
    angleB1: `\\widehat{${P}${B}_1${R}}`,
    angleB2: `\\widehat{${P}${B}_2${R}}`,
    angleR1: `\\widehat{${P}${R}${B}_1}`,
    angleR2: `\\widehat{${P}${R}${B}_2}`,
    PB1: `${P}${B}_1`,
    PB2: `${P}${B}_2`,
  };
}

// ---------------------------------------------------------------------------------------------
// Lois (écran 3)
// ---------------------------------------------------------------------------------------------

export type ChoixLoi = LoiTexteTriangle | "rectangle";

export function optionsLoi(e: ExerciceTexteTriangle): { id: ChoixLoi; fragments: FragmentConsigne[] }[] {
  const sinus = { id: "sinus" as const, fragments: [texte("La loi des sinus : "), latex("\\dfrac{a}{\\sin \\hat{A}} = \\dfrac{b}{\\sin \\hat{B}} = \\dfrac{c}{\\sin \\hat{C}}")] };
  const cosinus = { id: "cosinus" as const, fragments: [texte("La loi des cosinus (Al-Kashi) : "), latex("a^2 = b^2 + c^2 - 2bc\\cos \\hat{A}")] };
  const aire = { id: "aire" as const, fragments: [texte("La formule de l'aire : "), latex("\\mathcal{A} = \\dfrac{1}{2}\\, bc \\sin \\hat{A}")] };
  const rectangle = { id: "rectangle" as const, fragments: [texte("La trigonométrie du triangle rectangle (sinus, cosinus ou tangente d'un angle aigu)")] };
  return e.variante === "deuxPositions" ? [sinus, cosinus, rectangle] : [sinus, cosinus, aire, rectangle];
}

export function loiAttendue(e: ExerciceTexteTriangle): ChoixLoi {
  return e.variante === "deuxPositions" ? "sinus" : e.calcul.loi;
}

const NOM_LOI: Record<ChoixLoi, string> = {
  sinus: "la loi des sinus",
  cosinus: "la loi des cosinus (Al-Kashi)",
  aire: "la formule de l'aire (deux côtés et l'angle compris)",
  rectangle: "la trigonométrie du triangle rectangle",
};

export function nomLoi(loi: ChoixLoi): string {
  return NOM_LOI[loi];
}

/** Justification du choix de la loi (corrigé et réponse attendue). */
export function justificationLoi(e: ExerciceTexteTriangle): FragmentConsigne[] {
  if (e.variante === "deuxPositions") {
    const N = nomsDeuxPositions(e);
    return [
      texte("On connaît deux côtés, "),
      latex(N.RP),
      texte(" et "),
      latex(N.RB),
      texte(", et l'angle "),
      latex(N.angleP),
      texte(" opposé à l'un d'eux : la loi des sinus donne le sinus de l'angle "),
      latex(N.angleB),
      texte(", opposé à l'autre."),
    ];
  }
  const c = e.calcul;
  switch (c.loi) {
    case "cosinus":
      return [texte("On connaît deux côtés, "), latex(c.cote1.latex), texte(" et "), latex(c.cote2.latex), texte(", et l'angle qu'ils forment, "), latex(c.angle.latex), texte(" : loi des cosinus.")];
    case "aire":
      return [texte("On cherche une aire et on connaît deux côtés, "), latex(c.cote1.latex), texte(" et "), latex(c.cote2.latex), texte(", et l'angle compris "), latex(c.angle.latex), texte(" : formule de l'aire.")];
    case "sinus":
      return [
        texte("On connaît un côté, "),
        latex(c.coteConnu.latex),
        texte(", son angle opposé "),
        latex(c.angleOpposeConnu.latex),
        texte(" et l'angle "),
        latex(c.angleOpposeCherche.latex),
        texte(" opposé au côté cherché : loi des sinus."),
      ];
  }
}

// ---------------------------------------------------------------------------------------------
// Formules du calcul (écran 4, aides et corrigé)
// ---------------------------------------------------------------------------------------------

export function formuleGenerale(c: CalculTriangle, inconnue: string): string {
  switch (c.loi) {
    case "cosinus":
      return `${inconnue}^2 = ${c.cote1.latex}^2 + ${c.cote2.latex}^2 - 2 \\cdot ${c.cote1.latex} \\cdot ${c.cote2.latex} \\cdot \\cos ${c.angle.latex}`;
    case "sinus":
      return `\\dfrac{${inconnue}}{\\sin ${c.angleOpposeCherche.latex}} = \\dfrac{${c.coteConnu.latex}}{\\sin ${c.angleOpposeConnu.latex}}`;
    case "aire":
      return `${inconnue} = \\dfrac{1}{2} \\cdot ${c.cote1.latex} \\cdot ${c.cote2.latex} \\cdot \\sin ${c.angle.latex}`;
  }
}

/** Formule avec les valeurs, sans le résultat. */
export function substitution(c: CalculTriangle, inconnue: string): string {
  switch (c.loi) {
    case "cosinus":
      return `${inconnue}^2 = ${n(c.cote1.valeur)}^2 + ${n(c.cote2.valeur)}^2 - 2 \\cdot ${n(c.cote1.valeur)} \\cdot ${n(c.cote2.valeur)} \\cdot \\cos ${degres(c.angle.valeur)}`;
    case "sinus":
      return `${inconnue} = \\dfrac{${n(c.coteConnu.valeur)} \\cdot \\sin ${degres(c.angleOpposeCherche.valeur)}}{\\sin ${degres(c.angleOpposeConnu.valeur)}}`;
    case "aire":
      return `${inconnue} = \\dfrac{1}{2} \\cdot ${n(c.cote1.valeur)} \\cdot ${n(c.cote2.valeur)} \\cdot \\sin ${degres(c.angle.valeur)}`;
  }
}

/** Ligne de calcul complète du corrigé (avec résultat). */
export function calculComplet(e: ExerciceTexteTriangleStandard): string {
  const c = e.calcul;
  const x = e.inconnue.latex;
  const unite = uniteLatex(e.unite);
  const v = valeurCalcul(c);
  if (c.loi === "cosinus") return `${substitution(c, x)} \\approx ${n(carreCosinus(c))} \\quad\\Rightarrow\\quad ${x} \\approx ${n(v)}${unite}`;
  return `${substitution(c, x)} \\approx ${n(v)}${unite}`;
}

export function uniteLatex(unite: string): string {
  if (unite === "m²") return "\\text{ m}^2";
  return `\\text{ ${unite}}`;
}

// ---------------------------------------------------------------------------------------------
// Consignes
// ---------------------------------------------------------------------------------------------

export function consigneEcran(e: ExerciceTexteTriangle, type: TypeEcran): FragmentConsigne[] {
  switch (type) {
    case "identifier":
      return [
        texte(
          `On travaille dans le triangle ${e.triangle}. Pour chaque élément, indique s'il est donné tel quel dans le texte, s'il faut le convertir (angle du triangle à déduire d'un cap, d'un angle d'élévation ou de dépression…), ou s'il est cherché.`,
        ),
      ];
    case "convertir":
      return [texte(`Traduis les données du texte en angles intérieurs du triangle ${e.triangle}, en degrés.`)];
    case "loi":
      if (e.variante === "deuxPositions") return [texte("Quelle loi permet de calculer d'abord l'angle "), latex(nomsDeuxPositions(e).angleB), texte(", au point où se trouve le mobile ?")];
      return e.calcul.loi === "aire" ? [texte("Quelle formule permet de calculer l'aire demandée ?")] : [texte("Quelle loi permet de calculer "), latex((e as ExerciceTexteTriangleStandard).inconnue.latex), texte(" ?")];
    case "calculer": {
      const s = e as ExerciceTexteTriangleStandard;
      return [texte(s.calcul.loi === "aire" ? "Calcule l'aire " : "Calcule "), latex(s.inconnue.latex), texte(" (une valeur approchée est acceptée, à environ 1 % près).")];
    }
    case "repondre":
      return [texte("Choisis la phrase qui répond à la question, avec l'unité et l'arrondi demandés.")];
    case "configuration":
      return [texte(`Dans le triangle ${e.triangle}, quelles sont les données, et que cherche-t-on ?`)];
    case "candidats": {
      const N = nomsDeuxPositions(e as ExerciceDeuxPositions);
      return [texte("Calcule les deux valeurs possibles de l'angle "), latex(N.angleB), texte(", en degrés (une valeur approchée est acceptée, à environ 1 % près).")];
    }
    case "distances": {
      const N = nomsDeuxPositions(e as ExerciceDeuxPositions);
      return [texte("Pour chacune des deux positions, calcule la distance "), latex(N.PB), texte(" (une valeur approchée est acceptée, à environ 1 % près).")];
    }
    case "trancher":
      return [texte("Utilise l'information supplémentaire de l'énoncé pour retenir la bonne position.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux par écran ; jamais la réponse finale)
// ---------------------------------------------------------------------------------------------

const METHODES_CONVERSION: Record<TypeConversion, FragmentConsigne[]> = {
  virage: [texte("Au virage, l'angle intérieur du triangle est le supplémentaire de l'écart δ entre les deux caps (l'angle dont la route tourne) :"), latex("180^\\circ - \\delta")],
  ecartCaps: [
    texte("Deux directions qui partent du même point forment un angle égal à l'écart de leurs caps : "),
    latex("\\theta_2 - \\theta_1"),
    texte(", ou "),
    latex("360^\\circ - (\\theta_2 - \\theta_1)"),
    texte(" si les caps sont de part et d'autre du nord."),
  ],
  supplementaire: [texte("Deux angles qui forment un angle plat sont supplémentaires :"), latex("\\hat{x} + \\hat{y} = 180^\\circ")],
  differenceVisees: [texte("La somme des angles d'un triangle vaut 180° :"), latex("\\hat{A} + \\hat{B} + \\hat{C} = 180^\\circ")],
  somme: [texte("La somme des angles d'un triangle vaut 180° :"), latex("\\hat{A} + \\hat{B} + \\hat{C} = 180^\\circ")],
  alternes: [texte("L'horizontale passant par l'observateur et le sol sont parallèles : coupées par une visée, elles forment des angles alternes-internes, égaux.")],
  releveOuest: [texte("Un cap se mesure depuis le nord. Plein est correspond au cap 90°, plein ouest au cap 270° ; l'angle entre deux directions est l'écart de leurs caps.")],
  releveEst: [texte("Un cap se mesure depuis le nord. Plein est correspond au cap 90°, plein ouest au cap 270° ; l'angle entre deux directions est l'écart de leurs caps.")],
};

export function aidesEcran(e: ExerciceTexteTriangle, type: TypeEcran): FragmentConsigne[][] {
  switch (type) {
    case "identifier":
      return [
        [texte("L'élément cherché est la grandeur demandée par la question finale.")],
        [
          texte(
            "Un angle du triangle est donné tel quel seulement si le texte le mesure entre deux côtés du triangle (par exemple entre la base et une visée). Un cap se mesure depuis le nord, un angle de dépression depuis l'horizontale de l'observateur, un angle d'élévation pris au point le plus proche est extérieur au triangle : ces angles-là sont à convertir.",
          ),
        ],
      ];
    case "convertir": {
      const s = e as ExerciceTexteTriangleStandard;
      const types = [...new Set(s.conversions.map((c) => c.type))];
      const niveau1 = types.flatMap((t, i) => (i === 0 ? METHODES_CONVERSION[t] : [texte(" "), ...METHODES_CONVERSION[t]]));
      const niveau2 = s.conversions.flatMap((c, i) => [...(i > 0 ? [texte(" ")] : []), texte(c.justification + " "), latex(`${c.latex} = ${c.calculLatex}`)]);
      return [niveau1, niveau2];
    }
    case "loi":
      if (e.variante === "deuxPositions") {
        return [
          [texte("Repère les données : deux côtés et un angle. L'angle connu est-il compris entre les deux côtés connus, ou opposé à l'un d'eux ?")],
          [texte("La loi des sinus relie chaque côté au sinus de l'angle qui lui fait face :"), latex("\\dfrac{\\sin \\hat{B}}{b} = \\dfrac{\\sin \\hat{A}}{a}")],
        ];
      }
      return [
        [texte("Fais l'inventaire de ce que tu connais maintenant dans le triangle (angles convertis compris) : quels côtés, quels angles ?")],
        [texte("Deux côtés et l'angle qu'ils forment : loi des cosinus, ou formule de l'aire si c'est l'aire qui est demandée. Un côté, son angle opposé et un autre angle : loi des sinus.")],
      ];
    case "calculer": {
      const s = e as ExerciceTexteTriangleStandard;
      return [
        [texte("Écris la loi avec les noms du triangle :"), latex(formuleGenerale(s.calcul, s.inconnue.latex))],
        [
          texte("Remplace par les valeurs (calculatrice en degrés) :"),
          latex(substitution(s.calcul, s.inconnue.latex)),
          ...(s.calcul.loi === "cosinus" ? [texte(" Puis prends la racine carrée.")] : []),
        ],
      ];
    }
    case "repondre":
      return [
        [texte(`Relis la question : la réponse s'exprime en ${e.unite}, ${e.precision.texte}.`)],
        [texte("Pour arrondir, regarde le premier chiffre que tu supprimes : s'il vaut 5 ou plus, augmente d'une unité le dernier chiffre gardé ; sinon, garde-le tel quel.")],
      ];
    case "configuration": {
      const N = nomsDeuxPositions(e as ExerciceDeuxPositions);
      return [
        [texte("Repère les deux côtés connus et l'angle connu. Où se trouve cet angle par rapport aux deux côtés ?")],
        [texte("L'angle "), latex(N.angleP), texte(" est formé par les côtés "), latex(N.RP), texte(" et "), latex(N.PB), texte(" ; le côté "), latex(N.RB), texte(" lui fait face.")],
      ];
    }
    case "candidats": {
      const d = e as ExerciceDeuxPositions;
      const N = nomsDeuxPositions(d);
      return [
        [texte("Loi des sinus dans le triangle :"), latex(`\\dfrac{\\sin ${N.angleB}}{${N.RP}} = \\dfrac{\\sin ${N.angleP}}{${N.RB}} \\quad\\Rightarrow\\quad \\sin ${N.angleB} = \\dfrac{${n(d.RP)} \\cdot \\sin ${degres(d.angleP)}}{${n(d.RB)}}`)],
        [texte("Entre 0° et 180°, deux angles ont le même sinus : l'angle aigu donné par la calculatrice, et son supplémentaire :"), latex(`${N.angleB2} = 180^\\circ - ${N.angleB1}`)],
      ];
    }
    case "distances": {
      const N = nomsDeuxPositions(e as ExerciceDeuxPositions);
      return [
        [texte("Pour chaque position, l'angle en R complète la somme des angles à 180° :"), latex(`${N.angleR} = 180^\\circ - ${N.angleP} - ${N.angleB}`)],
        [texte("Puis la loi des sinus donne la distance :"), latex(`${N.PB} = \\dfrac{${N.RB} \\cdot \\sin ${N.angleR}}{\\sin ${N.angleP}}`)],
      ];
    }
    case "trancher": {
      const d = e as ExerciceDeuxPositions;
      const parAngle = d.info.type.startsWith("angle");
      return [
        [texte("Relis l'information supplémentaire de l'énoncé et teste-la sur chacune des deux positions.")],
        [texte(parAngle ? `Compare chacun des deux angles en ${d.noms.R} obtenus à l'étape précédente à ${d.info.seuil}°.` : `Compare chacune des deux distances obtenues à l'étape précédente à ${d.info.seuil} km.`)],
      ];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Récapitulatif « Ce qu'on sait déjà » (valeurs confirmées des écrans clos)
// ---------------------------------------------------------------------------------------------

export function entreeRecap(e: ExerciceTexteTriangle, type: TypeEcran, revele: boolean): EntreeRecapitulatif | null {
  switch (type) {
    case "identifier": {
      const s = e as ExerciceTexteTriangleStandard;
      return { libelle: "Cherché", valeur: s.inconnue.latex, estLatex: true, revele };
    }
    case "convertir": {
      const s = e as ExerciceTexteTriangleStandard;
      return { libelle: "Angles intérieurs", valeur: "", estLatex: true, revele, valeurs: s.conversions.map((c, i) => `${c.latex} = ${degres(c.valeur)}${i < s.conversions.length - 1 ? " \\,;" : ""}`) };
    }
    case "loi":
      return { libelle: "Loi", valeur: nomLoi(loiAttendue(e)), estLatex: false, revele };
    case "calculer": {
      const s = e as ExerciceTexteTriangleStandard;
      const d = Math.max(s.precision.decimales, 0) + 2;
      return { libelle: "Valeur calculée", valeur: `${s.inconnue.latex} \\approx ${n(s.inconnue.valeur, d)}${uniteLatex(s.unite)}`, estLatex: true, revele };
    }
    case "configuration":
      return null;
    case "candidats": {
      const d = e as ExerciceDeuxPositions;
      const N = nomsDeuxPositions(d);
      return { libelle: "Angles possibles", valeur: "", estLatex: true, revele, valeurs: [`${N.angleB1} \\approx ${degres(d.candidats[0])} \\,;`, `${N.angleB2} \\approx ${degres(d.candidats[1])}`] };
    }
    case "distances": {
      const d = e as ExerciceDeuxPositions;
      const N = nomsDeuxPositions(d);
      return {
        libelle: "Deux positions",
        valeur: "",
        estLatex: true,
        revele,
        valeurs: [
          `${N.angleR1} \\approx ${degres(d.anglesR[0])} \\;\\Rightarrow\\; ${N.PB1} \\approx ${n(d.distances[0])}\\text{ km}`,
          `${N.angleR2} \\approx ${degres(d.anglesR[1])} \\;\\Rightarrow\\; ${N.PB2} \\approx ${n(d.distances[1])}\\text{ km}`,
        ],
      };
    }
    default:
      return null;
  }
}
