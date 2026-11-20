import type { AngleAvecPremierQuadrant, AngleSurCercle, Quadrant } from "../core/cercleTrigonometrique.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";

/**
 * Aides à deux niveaux (formule en KaTeX) et messages ciblés des anciens générateurs du chapitre 5
 * de 4e — cercle trigonométrique (audit 4e ch. 5, lot B, G4 ; modèle : `aidesSecondDegre.ts`).
 * Niveau 1 : la propriété du cours ; niveau 2 : comment l'appliquer ici (la figure du cercle
 * s'affiche avec ce niveau). Jamais la réponse. Les messages ciblés reconnaissent une erreur du
 * cours dans la DERNIÈRE réponse fausse et disent où regarder.
 */

export type Aides = FragmentConsigne[][];

const reduit = (a: number) => ((a % 360) + 360) % 360;

/** « −480° » : vrai signe moins (G5). */
export function angleTexte(a: number): string {
  return `${a < 0 ? "−" : ""}${Math.abs(a)}°`;
}

export function angleLatex(a: number): string {
  return `${a < 0 ? "-" : ""}${Math.abs(a)}^\\circ`;
}

const NOM_QUADRANT: Record<Quadrant, string> = { I: "I", II: "II", III: "III", IV: "IV", axeOx: "axe horizontal", axeOy: "axe vertical" };

// ---------------------------------------------------------------------------------------------
// Réduction dans [0° ; 360°[ (gen14 ; gen15 dans l'aide « quadrant »)
// ---------------------------------------------------------------------------------------------

export function aidesReduction(e: AngleSurCercle): Aides {
  const negatif = e.angleDepart < 0;
  return [
    [texte("Ajouter ou retirer un tour complet ne change pas le point du cercle :"), latex("\\theta \\text{ et } \\theta + k \\cdot 360^\\circ \\ (k \\text{ entier}) \\text{ donnent le même point.}")],
    [
      texte("Ici "),
      latex(`\\theta = ${angleLatex(e.angleDepart)}`),
      texte(
        negatif
          ? " est négatif : ajoute 360° autant de fois qu'il le faut pour arriver dans "
          : " dépasse 360° : retire 360° autant de fois qu'il le faut pour arriver dans ",
      ),
      latex("[0^\\circ \\,;\\, 360^\\circ["),
      texte(". La figure montre le trajet."),
    ],
  ];
}

export function messageReduction(e: AngleSurCercle, v: number): FragmentConsigne[] | null {
  if (!Number.isInteger(v)) return null;
  if (v !== e.angleReduit && reduit(v) === e.angleReduit) {
    return [texte("C'est bien le même point du cercle, mais l'angle demandé est entre 0° et 360° (360° exclu).")];
  }
  if (e.angleDepart < 0 && reduit(-v) === e.angleReduit) {
    return [texte("Attention au signe : on ne supprime pas le « − ». Un angle négatif se parcourt dans le sens des aiguilles d'une montre ; ajoute des tours de 360°.")];
  }
  if (v === 360 - e.angleReduit && e.angleReduit !== 180) {
    return [texte("Tu as trouvé le symétrique par rapport à l'axe horizontal : vérifie le sens dans lequel tu ajoutes ou retires les tours.")];
  }
  return null;
}

export function aidesQuadrant(e: AngleSurCercle): Aides {
  const aReduire = e.angleDepart < 0 || e.angleDepart >= 360;
  return [
    [
      texte("Repère entre quels multiples de 90° tombe l'angle (pris dans [0° ; 360°[) :"),
      latex("]0^\\circ;90^\\circ[\\ \\text{I},\\quad ]90^\\circ;180^\\circ[\\ \\text{II},\\quad ]180^\\circ;270^\\circ[\\ \\text{III},\\quad ]270^\\circ;360^\\circ[\\ \\text{IV}"),
      texte(" ; 0°, 90°, 180° et 270° sont sur un axe."),
    ],
    aReduire
      ? [texte("Ici "), latex(`\\theta = ${angleLatex(e.angleDepart)}`), texte(e.angleDepart < 0 ? " est négatif : ajoute d'abord 360° autant de fois qu'il le faut pour arriver dans [0° ; 360°[, puis compare." : " dépasse 360° : retire d'abord 360° autant de fois qu'il le faut pour arriver dans [0° ; 360°[, puis compare.")]
      : [texte("Ici "), latex(`\\theta = ${angleLatex(e.angleDepart)}`), texte(" : compare-le à 90°, 180° et 270°.")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Angle du premier quadrant (gen14, gen15)
// ---------------------------------------------------------------------------------------------

const FORMULES_QUADRANTS = "\\text{II} : \\alpha = 180^\\circ - \\theta \\quad \\text{III} : \\alpha = \\theta - 180^\\circ \\quad \\text{IV} : \\alpha = 360^\\circ - \\theta";

export function aidesAnglePremierQuadrant(e: AngleAvecPremierQuadrant): Aides {
  const reduitDifferent = e.angleDepart !== e.angleReduit;
  return [
    [
      texte("L'angle du premier quadrant α est l'angle aigu entre le rayon [OM] et l'axe horizontal. Selon le quadrant de θ (pris dans [0° ; 360°[) :"),
      latex(FORMULES_QUADRANTS),
    ],
    [
      ...(reduitDifferent ? [texte("Travaille avec l'angle ramené dans [0° ; 360°[, "), latex(`\\theta = ${angleLatex(e.angleReduit)}`), texte(", ")] : [texte("Ici "), latex(`\\theta = ${angleLatex(e.angleReduit)}`), texte(" ")]),
      texte(`est dans le quadrant ${NOM_QUADRANT[e.quadrant]} : applique la formule de ce quadrant. La figure montre le point symétrique dans le premier quadrant.`),
    ],
  ];
}

export function messageAnglePremierQuadrant(e: AngleAvecPremierQuadrant, v: number): FragmentConsigne[] | null {
  const alpha = e.anglePremierQuadrant;
  if (v === alpha) return null;
  if (v === e.angleReduit || v === e.angleDepart) {
    return [texte("C'est l'angle de départ : l'angle du premier quadrant est son symétrique, entre 0° et 90°.")];
  }
  if (v === 90 - alpha && alpha !== 45) {
    return [texte("Tu as pris l'angle avec l'axe vertical : l'angle du premier quadrant se mesure à partir de l'axe horizontal.")];
  }
  if (v < 0 || v > 90) {
    return [texte("L'angle du premier quadrant est toujours compris entre 0° et 90° : revois la formule du quadrant "), latex(`\\text{${NOM_QUADRANT[e.quadrant]}}`), texte(".")];
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Signes (gen14) et valeurs sur un axe (gen14)
// ---------------------------------------------------------------------------------------------

export function aidesSignes(): Aides {
  return [
    [texte("Sur le cercle trigonométrique, le cosinus est l'abscisse de M(θ), le sinus son ordonnée, et "), latex("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"), texte(".")],
    [
      texte("Regarde où tombe M(θ) sur la figure : à droite ou à gauche de l'axe vertical (signe de "),
      latex("\\cos\\theta"),
      texte("), au-dessus ou en dessous de l'axe horizontal (signe de "),
      latex("\\sin\\theta"),
      texte("). Un quotient de deux nombres de même signe est positif, de signes contraires négatif."),
    ],
  ];
}

export function aidesValeursAxe(): Aides {
  return [
    [
      texte("Sur un axe, M(θ) est l'un des quatre points "),
      latex("(1\\,;\\,0),\\ (0\\,;\\,1),\\ (-1\\,;\\,0),\\ (0\\,;\\,-1)"),
      texte(" : son abscisse est "),
      latex("\\cos\\theta"),
      texte(", son ordonnée "),
      latex("\\sin\\theta"),
      texte("."),
    ],
    [texte("Lis les coordonnées du point sur la figure, puis "), latex("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"), texte(" : elle n'existe pas quand "), latex("\\cos\\theta = 0"), texte(".")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Valeurs exactes (gen15)
// ---------------------------------------------------------------------------------------------

export function aidesValeursExactes(e: AngleAvecPremierQuadrant): Aides {
  const surAxe = e.quadrant === "axeOx" || e.quadrant === "axeOy";
  if (surAxe) return aidesValeursAxe();
  return [
    [
      texte("Les valeurs de θ sont celles de son angle du premier quadrant α, au signe près ; le signe se lit sur le quadrant :"),
      latex("|\\sin\\theta| = \\sin\\alpha,\\quad |\\cos\\theta| = \\cos\\alpha,\\quad |\\tan\\theta| = \\tan\\alpha"),
    ],
    [
      texte("Moyen mnémotechnique : "),
      latex("\\sin 30^\\circ,\\ \\sin 45^\\circ,\\ \\sin 60^\\circ = \\dfrac{\\sqrt{1}}{2},\\ \\dfrac{\\sqrt{2}}{2},\\ \\dfrac{\\sqrt{3}}{2}"),
      texte(" (le cosinus dans l'ordre inverse). Ici "),
      latex(`\\alpha = ${e.anglePremierQuadrant}^\\circ`),
      texte(` et θ est dans le quadrant ${NOM_QUADRANT[e.quadrant]} : regarde sur la figure le signe de l'abscisse et de l'ordonnée de M(θ).`),
    ],
  ];
}

/** Message ciblé des choix fermés (une tentative) de gen15 : signe du quadrant oublié, sinus et
 * cosinus échangés. Affiché avec la réponse révélée. */
export function messageValeursExactes(attendu: { sin: number; cos: number; tan: number | null }, saisi: { sin: number | null; cos: number | null; tan: number | null | "indefini" }): string | null {
  const eq = (a: number | null, b: number | null) => a !== null && b !== null && Math.abs(a - b) < 1e-9;
  if (saisi.sin === null || saisi.cos === null) return null;
  if (eq(saisi.sin, attendu.cos) && eq(saisi.cos, attendu.sin) && !eq(attendu.sin, attendu.cos)) {
    return "Ce n'était pas la bonne réponse : tu as échangé le sinus et le cosinus. Le cosinus est l'abscisse de M(θ), le sinus son ordonnée.";
  }
  const signeSeul =
    (eq(Math.abs(saisi.sin), Math.abs(attendu.sin)) && !eq(saisi.sin, attendu.sin)) ||
    (eq(Math.abs(saisi.cos), Math.abs(attendu.cos)) && !eq(saisi.cos, attendu.cos));
  if (signeSeul && eq(Math.abs(saisi.sin), Math.abs(attendu.sin)) && eq(Math.abs(saisi.cos), Math.abs(attendu.cos))) {
    return "Ce n'était pas la bonne réponse : les valeurs sans le signe sont justes, mais un signe ne l'est pas. Regarde le quadrant de θ.";
  }
  return null;
}
