import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceComposerForces, NomTriangle, UniteComposerForces } from "../core/composerForces.types";
import {
  angleCap,
  angleInterieur,
  angleSommetPetit,
  ecranIntensite,
  estCap,
  intensiteResultante,
  nombreEcrans,
  sommetCle,
  sommetPetit,
  triangleUtile,
  valeurAttendue,
} from "../moteur/modeleComposerForces";
import type { StatutComposerForces } from "../moteur/verificationComposerForces";
import { nombreFr, nombreFrLatex } from "./nombreFr";

/**
 * Textes de gen80 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; notation vectorielle du chapitre 6 (`\vec{F_1}`, `\vec{v_R}`…) et
 * intensités notées F₁, v₂… en KaTeX (`F_1`, `v_2`). Arrondis du chapitre 5 : intensités au
 * centième, angles au dixième de degré ; aucun arrondi intermédiaire dans le corrigé (valeurs
 * exactes gardées en mémoire de calculatrice).
 */

export const MENTION_TOLERANCE = " (une valeur approchée est acceptée, à environ 1 % près).";

export const OPTIONS_UNITE: UniteComposerForces[] = ["N", "kN", "km/h", "nœuds"];

// ---------------------------------------------------------------------------------------------
// Nombres et notations
// ---------------------------------------------------------------------------------------------

export function arrondiIntensite(v: number): number {
  return Math.round(v * 100) / 100;
}

export function arrondiAngle(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Angle en LaTeX, au dixième (« 65{,}4° »). */
export function angleLatex(v: number): string {
  return `${nombreFrLatex(arrondiAngle(v))}°`;
}

export function intensiteLatex(v: number): string {
  return nombreFrLatex(arrondiIntensite(v));
}

export function uniteTexte(e: ExerciceComposerForces): string {
  return `\u00a0${e.unite}`;
}

/** Forces (F) ou vitesses (v). */
export function lettre(e: ExerciceComposerForces): "F" | "v" {
  return e.situation === "remorqueurs" || e.situation === "charge" ? "F" : "v";
}

export function vecteur(e: ExerciceComposerForces, indice: "1" | "2" | "R"): string {
  return `\\vec{${lettre(e)}_${indice}}`;
}

export function intensiteNom(e: ExerciceComposerForces, indice: "1" | "2" | "R"): string {
  return `${lettre(e)}_${indice}`;
}

/** Angle de sommet `milieu` : `\widehat{OAC}`. */
export function angleNom(premier: string, milieu: string, dernier: string): string {
  return `\\widehat{${premier}${milieu}${dernier}}`;
}

/** Nom du parallélogramme dans l'ordre de parcours : O, extrémité du grand vecteur, C, extrémité du
 * petit (« OACB »). */
export function nomParallelogramme(e: ExerciceComposerForces): string {
  return `O${e.sommetGrand}C${sommetPetit(e)}`;
}

/** « la résultante », « la vitesse réelle », « la vitesse-sol ». */
export function nomResultante(e: ExerciceComposerForces): string {
  if (e.situation === "bateau") return "la vitesse réelle";
  if (e.situation === "avion") return "la vitesse-sol";
  return "la résultante";
}

/** « la vitesse propre », « la première force » (le grand vecteur, indice 1). */
export function nomGrand(e: ExerciceComposerForces): string {
  return lettre(e) === "F" ? "la première force" : "la vitesse propre";
}

/** Angle intérieur du sens direct, au sommet G (extrémité du grand vecteur). */
export function angleInterieurNom(e: ExerciceComposerForces): string {
  return angleNom("O", e.sommetGrand, "C");
}

/** Déviation (sens direct) : angle en O entre la résultante et le grand vecteur. */
export function deviationNom(e: ExerciceComposerForces): string {
  return angleNom(e.sommetGrand, "O", "C");
}

/** Cap : angle en C (entre le cap et la route), angle en P, angle donné β en O. */
export function angleCapNom(e: ExerciceComposerForces): string {
  return angleNom("O", "C", sommetPetit(e));
}

export function angleSommetPetitNom(e: ExerciceComposerForces): string {
  return angleNom("O", sommetPetit(e), "C");
}

export function angleDonneCapNom(e: ExerciceComposerForces): string {
  return angleNom(sommetPetit(e), "O", "C");
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

function intensiteDonnee(e: ExerciceComposerForces, indice: "1" | "2"): FragmentConsigne[] {
  const v = indice === "1" ? e.grand : e.petit;
  return [latex(`${intensiteNom(e, indice)} = ${nombreFrLatex(v)}`), texte(uniteTexte(e))];
}

function phraseFigure(e: ExerciceComposerForces): FragmentConsigne[] {
  const g = e.sommetGrand;
  const p = sommetPetit(e);
  const suite: FragmentConsigne[] = estCap(e)
    ? [texte(" est le parallélogramme construit sur ces deux vecteurs : sa diagonale [OC] est portée par la route voulue.")]
    : [texte(" est le parallélogramme construit sur ces deux vecteurs.")];
  return [
    texte(" Sur la figure, "),
    latex(`${vecteur(e, "1")} = \\vec{O${g}}`),
    texte(" et "),
    latex(`${vecteur(e, "2")} = \\vec{O${p}}`),
    texte(` ; ${nomParallelogramme(e)}`),
    ...suite,
  ];
}

function enonceDirect(e: ExerciceComposerForces): FragmentConsigne[] {
  const v1 = latex(vecteur(e, "1"));
  const v2 = latex(vecteur(e, "2"));
  const somme = latex(`${vecteur(e, "R")} = ${vecteur(e, "1")} + ${vecteur(e, "2")}`);
  const angle = latex(`${e.angle}°`);
  switch (e.situation) {
    case "bateau":
      return [
        texte("Un bateau traverse un fleuve. Sa vitesse propre (par rapport à l'eau) est "), v1, texte(", d'intensité "), ...intensiteDonnee(e, "1"),
        texte(". Le courant l'entraîne avec la vitesse "), v2, texte(", d'intensité "), ...intensiteDonnee(e, "2"),
        texte(". L'angle entre "), v1, texte(" et "), v2, texte(" vaut "), angle,
        texte(". La vitesse réelle du bateau est la résultante "), somme, texte("."),
      ];
    case "avion":
      return [
        texte("Un avion vole avec une vitesse propre (par rapport à l'air) "), v1, texte(", d'intensité "), ...intensiteDonnee(e, "1"),
        texte(". Le vent souffle avec la vitesse "), v2, texte(", d'intensité "), ...intensiteDonnee(e, "2"),
        texte(". L'angle entre "), v1, texte(" et "), v2, texte(" vaut "), angle,
        texte(". La vitesse-sol de l'avion est la résultante "), somme, texte("."),
      ];
    case "remorqueurs":
      return [
        texte("Deux remorqueurs tirent un navire à l'aide de deux câbles fixés au même point de sa proue. Le premier exerce la force "), v1, texte(", d'intensité "), ...intensiteDonnee(e, "1"),
        texte(" ; le second, la force "), v2, texte(", d'intensité "), ...intensiteDonnee(e, "2"),
        texte(". Les deux câbles forment un angle de "), angle,
        texte(". Le navire est tiré par la résultante "), somme, texte("."),
      ];
    case "charge":
      return [
        texte("Deux personnes tirent une lourde caisse à l'aide de deux cordes attachées au même anneau. La première exerce la force "), v1, texte(", d'intensité "), ...intensiteDonnee(e, "1"),
        texte(" ; la seconde, la force "), v2, texte(", d'intensité "), ...intensiteDonnee(e, "2"),
        texte(". Les deux cordes forment un angle de "), angle,
        texte(". La caisse est tirée par la résultante "), somme, texte("."),
      ];
  }
}

function enonceCap(e: ExerciceComposerForces): FragmentConsigne[] {
  const v1 = latex(vecteur(e, "1"));
  const v2 = latex(vecteur(e, "2"));
  const somme = latex(`${vecteur(e, "R")} = ${vecteur(e, "1")} + ${vecteur(e, "2")}`);
  const angle = latex(`${e.angle}°`);
  if (e.situation === "avion") {
    return [
      texte("Un avion part de l'aérodrome O et veut rejoindre une ville en ligne droite : c'est la route voulue. Sa vitesse propre (par rapport à l'air) "), v1,
      texte(" a pour intensité "), ...intensiteDonnee(e, "1"),
      texte(", mais sa direction — le cap — reste à choisir. Le vent "), v2, texte(", d'intensité "), ...intensiteDonnee(e, "2"),
      texte(", fait un angle de "), angle, texte(" avec la route voulue. Le pilote choisit le cap pour que la vitesse-sol "), somme,
      texte(" suive exactement la route voulue."),
    ];
  }
  return [
    texte("Un bateau part du point O et veut rejoindre en ligne droite un ponton situé sur l'autre rive : c'est la route voulue. Sa vitesse propre (par rapport à l'eau) "), v1,
    texte(" a pour intensité "), ...intensiteDonnee(e, "1"),
    texte(", mais sa direction — le cap — reste à choisir. Le courant "), v2, texte(", d'intensité "), ...intensiteDonnee(e, "2"),
    texte(", fait un angle de "), angle, texte(" avec la route voulue. Le pilote choisit le cap pour que la vitesse réelle "), somme,
    texte(" suive exactement la route voulue."),
  ];
}

export function enonceFragments(e: ExerciceComposerForces): FragmentConsigne[] {
  return [...(estCap(e) ? enonceCap(e) : enonceDirect(e)), ...phraseFigure(e)];
}

export function consigneGenerale(e: ExerciceComposerForces): string {
  return estCap(e)
    ? "La direction de la résultante est imposée (la route voulue) : trouve le cap à prendre, puis l'intensité de la vitesse obtenue sur la route."
    : "Compose les deux vecteurs par la règle du parallélogramme : la résultante est la diagonale [OC]. Résous ensuite le bon triangle.";
}

/** Vraies questions de l'énoncé papier (une seule pour l'intensité seule). */
export function questionsPapier(e: ExerciceComposerForces): FragmentConsigne[][] {
  const intensite: FragmentConsigne[] = [texte("Calcule l'intensité "), latex(intensiteNom(e, "R")), texte(` de ${nomResultante(e)} (au centième près).`)];
  if (e.question === "intensite") return [intensite];
  if (e.question === "direction") {
    return [intensite, [texte("Calcule l'angle entre "), latex(vecteur(e, "R")), texte(" et "), latex(vecteur(e, "1")), texte(" (au dixième de degré près).")]];
  }
  return [
    [texte("Calcule l'angle entre le cap (la direction de "), latex(vecteur(e, "1")), texte(") et la route voulue (au dixième de degré près).")],
    [texte("Calcule l'intensité "), latex(intensiteNom(e, "R")), texte(` de ${nomResultante(e)} obtenue sur la route voulue (au centième près).`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export function titresEcrans(e: ExerciceComposerForces): string[] {
  if (estCap(e)) return ["Le triangle à résoudre", "L'angle entre le cap et la route", `L'angle en ${sommetPetit(e)}`, "L'intensité de la vitesse sur la route"];
  const titres = ["Le triangle à résoudre", "L'angle intérieur du triangle", "L'intensité de la résultante", "La direction de la résultante"];
  return titres.slice(0, nombreEcrans(e));
}

/** Consigne de chaque écran. `papier` : titre d'étape du corrigé (sans mention de tolérance ni
 * tournure d'écran). */
export function consignesEcrans(e: ExerciceComposerForces, support: "ecran" | "papier"): FragmentConsigne[][] {
  const ecran = support === "ecran";
  const fin = ecran ? MENTION_TOLERANCE : ".";
  const triangle = triangleUtile(e);
  const premier: FragmentConsigne[] = ecran
    ? [texte(estCap(e) ? "Sur la figure, quel triangle faut-il résoudre pour trouver le cap ?" : `Sur la figure, quel triangle faut-il résoudre pour calculer l'intensité de ${nomResultante(e)} ?`)]
    : [texte("Repérer, sur le parallélogramme, le triangle à résoudre.")];
  if (estCap(e)) {
    return [
      premier,
      [texte(ecran ? "Calcule l'angle " : "Calculer l'angle "), latex(angleCapNom(e)), texte(" : c'est l'angle entre le cap (la direction de "), latex(vecteur(e, "1")), texte(`) et la route voulue${fin}`)],
      [texte(ecran ? "Calcule l'angle " : "Calculer l'angle "), latex(angleSommetPetitNom(e)), texte(` du triangle ${triangle}${fin}`)],
      [texte(ecran ? "Calcule l'intensité " : "Calculer l'intensité "), latex(intensiteNom(e, "R")), texte(` de ${nomResultante(e)} sur la route, c'est-à-dire la longueur OC${fin}`)],
    ];
  }
  const consignes: FragmentConsigne[][] = [
    premier,
    ecran
      ? [texte(`Dans le triangle ${triangle}, quelle est l'amplitude de l'angle `), latex(angleInterieurNom(e)), texte(" ?")]
      : [texte("Calculer l'angle "), latex(angleInterieurNom(e)), texte(` du triangle ${triangle}.`)],
    [texte(ecran ? "Calcule l'intensité " : "Calculer l'intensité "), latex(intensiteNom(e, "R")), texte(` de ${nomResultante(e)}, c'est-à-dire la longueur OC${fin}`)],
    [texte(ecran ? "Calcule l'angle " : "Calculer l'angle "), latex(deviationNom(e)), texte(" entre "), latex(vecteur(e, "R")), texte(" et "), latex(vecteur(e, "1")), texte(fin)],
  ];
  return consignes.slice(0, nombreEcrans(e));
}

/** Libellé du champ de saisie d'un écran (index ≥ 1). */
export function libelleChamp(e: ExerciceComposerForces, ecran: number): FragmentConsigne[] {
  if (ecranIntensite(e, ecran)) return [latex(`${intensiteNom(e, "R")} =`)];
  if (estCap(e)) return [latex(`${ecran === 1 ? angleCapNom(e) : angleSommetPetitNom(e)} =`)];
  return [latex(`${ecran === 1 ? angleInterieurNom(e) : deviationNom(e)} =`)];
}

export function placeholderChamp(e: ExerciceComposerForces, ecran: number): string {
  return ecranIntensite(e, ecran) ? "ex : 12,5" : "ex : 47,3";
}

export function libelleTriangle(t: NomTriangle): string {
  return `Le triangle ${t}`;
}

/** Réponse attendue d'un écran de saisie, valeur arrondie et unité. */
export function reponseAttendueFragments(e: ExerciceComposerForces, ecran: number): FragmentConsigne[] {
  const v = valeurAttendue(e, ecran);
  const [nom] = libelleChamp(e, ecran);
  const gauche = nom!.valeur.replace(/ =$/, "");
  if (ecranIntensite(e, ecran)) return [latex(`${gauche} \\approx ${intensiteLatex(v)}`), texte(uniteTexte(e))];
  const exact = !estCap(e) && ecran === 1;
  return [latex(`${gauche} ${exact ? "=" : "\\approx"} ${angleLatex(v)}`)];
}

/** Saisie de l'élève relue dans la fiche de consultation (virgule, unité ou degrés). */
export function saisieTexte(e: ExerciceComposerForces, ecran: number, valeur: number, unite: UniteComposerForces | null): string {
  return ecranIntensite(e, ecran) ? `${nombreFr(valeur)} ${unite ?? ""}`.trim() : `${nombreFr(valeur)}°`;
}

// ---------------------------------------------------------------------------------------------
// Aides (2 niveaux par écran ; jamais la réponse finale : il reste toujours un calcul)
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: ExerciceComposerForces, ecran: number): FragmentConsigne[][] {
  const g = e.sommetGrand;
  const p = sommetPetit(e);
  const k = sommetCle(e);
  const autre = k === g ? p : g;
  if (ecran === 0) {
    if (estCap(e)) {
      return [
        [texte(`${nomResultante(e).replace(/^./, (c) => c.toUpperCase())} est la diagonale [OC], portée par la route voulue. Le triangle à résoudre contient cette diagonale et le vecteur dont tu connais l'angle avec la route.`)],
        [texte("Reporte la vitesse propre à l'extrémité de "), latex(vecteur(e, "2")), texte(` : le côté [${k}C] est parallèle à [O${autre}] et de même longueur.`)],
      ];
    }
    return [
      [texte("La résultante est la diagonale [OC] du parallélogramme : le triangle à résoudre doit avoir [OC] comme côté. L'autre diagonale ne représente pas la somme des deux vecteurs.")],
      [texte(`Reporte `), latex(vecteur(e, "2")), texte(" à l'extrémité de "), latex(vecteur(e, "1")), texte(` : le côté [${g}C] est parallèle à [O${p}] et de même longueur.`)],
    ];
  }
  if (estCap(e)) {
    const b = nombreFrLatex(e.angle);
    if (ecran === 1) {
      return [
        [texte(`Dans le triangle O${p}C, tu connais O${p}, ${p}C et l'angle en O, opposé à ${p}C. La loi des sinus donne l'angle en C, opposé à O${p} :`), latex(`\\dfrac{\\sin ${angleCapNom(e)}}{O${p}} = \\dfrac{\\sin ${angleDonneCapNom(e)}}{${p}C}`)],
        [texte("Avec "), latex(`O${p} = ${e.petit}`), texte(", "), latex(`${p}C = ${e.grand}`), texte(" et "), latex(`${angleDonneCapNom(e)} = ${e.angle}°`), texte(" :"), latex(`\\sin ${angleCapNom(e)} = \\dfrac{${nombreFrLatex(e.petit)} \\cdot \\sin ${b}°}{${nombreFrLatex(e.grand)}}`)],
      ];
    }
    if (ecran === 2) {
      return [
        [texte("La somme des angles d'un triangle vaut 180° :"), latex(`${angleSommetPetitNom(e)} = 180° - ${angleDonneCapNom(e)} - ${angleCapNom(e)}`)],
        [texte("Avec l'angle en C trouvé à l'étape précédente :"), latex(`${angleSommetPetitNom(e)} = 180° - ${b}° - ${angleLatex(angleCap(e))}`)],
      ];
    }
    return [
      [texte(`La loi des sinus relie OC à l'angle en ${p}, qui lui est opposé :`), latex(`\\dfrac{OC}{\\sin ${angleSommetPetitNom(e)}} = \\dfrac{${p}C}{\\sin ${angleDonneCapNom(e)}}`)],
      [texte("Avec "), latex(`${p}C = ${e.grand}`), texte(" et les angles trouvés :"), latex(`OC = \\dfrac{${nombreFrLatex(e.grand)} \\cdot \\sin ${angleLatex(angleSommetPetit(e))}}{\\sin ${b}°}`)],
    ];
  }
  if (ecran === 1) {
    return [
      [texte("L'angle donné, "), latex(`${angleNom(p, "O", g)} = ${e.angle}°`), texte(", est l'angle entre les deux vecteurs, en O. Dans le parallélogramme, deux angles consécutifs sont supplémentaires :"), latex(`${angleInterieurNom(e)} + ${angleNom(p, "O", g)} = 180°`)],
      [texte("Donc :"), latex(`${angleInterieurNom(e)} = 180° - ${e.angle}°`)],
    ];
  }
  if (ecran === 2) {
    return [
      [texte(`Al-Kashi dans le triangle O${g}C, avec l'angle en ${g} (opposé à OC) :`), latex(`OC^2 = O${g}^2 + ${g}C^2 - 2 \\cdot O${g} \\cdot ${g}C \\cdot \\cos ${angleInterieurNom(e)}`)],
      [texte("Avec "), latex(`O${g} = ${e.grand}`), texte(", "), latex(`${g}C = ${e.petit}`), texte(" et "), latex(`${angleInterieurNom(e)} = ${angleInterieur(e)}°`), texte(" :"), latex(`${intensiteNom(e, "R")}^2 = ${e.grand}^2 + ${e.petit}^2 - 2 \\cdot ${e.grand} \\cdot ${e.petit} \\cdot \\cos ${angleInterieur(e)}°`)],
    ];
  }
  return [
    [texte(`La loi des sinus dans le triangle O${g}C relie l'angle en O au côté ${g}C, qui lui est opposé :`), latex(`\\dfrac{\\sin ${deviationNom(e)}}{${g}C} = \\dfrac{\\sin ${angleInterieurNom(e)}}{OC}`)],
    [texte("Avec "), latex(`${g}C = ${e.petit}`), texte(" et OC trouvé à l'étape précédente :"), latex(`\\sin ${deviationNom(e)} = \\dfrac{${nombreFrLatex(e.petit)} \\cdot \\sin ${angleInterieur(e)}°}{${intensiteLatex(intensiteResultante(e))}}`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Messages d'erreur ciblés
// ---------------------------------------------------------------------------------------------

export function messageStatut(e: ExerciceComposerForces, ecran: number, statut: StatutComposerForces): string | null {
  const g = e.sommetGrand;
  switch (statut) {
    case "piege_theta":
      if (ecran === 1) return `C'est l'angle entre les deux vecteurs, mesuré en O — pas l'angle du triangle en ${g}.`;
      if (ecranIntensite(e, ecran)) return `Tu as mis l'angle entre les deux vecteurs dans Al-Kashi : c'est l'angle du triangle en ${g} qu'il faut utiliser (tu as calculé l'autre diagonale).`;
      return "Ce résultat vient de la longueur de l'autre diagonale : utilise l'intensité OC de la résultante.";
    case "radians":
      return "Vérifie que ta calculatrice est en degrés.";
    case "autre_vecteur":
      return estCap(e)
        ? `C'est l'angle donné entre ${e.situation === "avion" ? "le vent" : "le courant"} et la route. L'angle en C s'obtient par la loi des sinus.`
        : `C'est l'angle entre la résultante et l'autre vecteur : on demande l'angle avec ${nomGrand(e)}.`;
    case "oubli_angle":
      return "N'oublie pas l'angle en C : la somme des trois angles du triangle vaut 180°.";
    case "unite":
      return "La valeur est juste, mais l'unité ne convient pas.";
    default:
      return null;
  }
}
