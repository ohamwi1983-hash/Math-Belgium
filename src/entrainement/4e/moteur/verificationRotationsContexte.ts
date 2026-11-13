import type { ExerciceRotationsContexte, OrigineRotation, RotationSens } from "../core/rotationsContexte.types";
import {
  grandeurRetour,
  hauteurDirecte,
  kInverse,
  normaliserAngle,
  positionDirecte,
  solutionsContexte,
  solutionsTheta,
  thetaDirect,
  valeurRetour,
} from "./modeleRotationsContexte";

/**
 * Vérification de gen79. Chaque champ est comparé à la valeur EXACTE (pas à la saisie précédente de
 * l'élève : une erreur ne se propage pas d'un écran à l'autre). Tolérances cohérentes avec la
 * précision affichée dans la consigne (convention de gen19) :
 * - angle θ du sens direct : entier exact (α et θ₀ sont entiers) ;
 * - longueurs (coordonnées, hauteur), arrondies au centième : ± max(0,006 ; 0,5 %) — un arrondi
 *   au centième passe, un sinus arrondi trop tôt (deux décimales) est refusé ;
 * - sin θ (sens inverse) : valeur décimale exacte (au plus deux décimales par construction) ;
 * - angles du sens inverse, au dixième de degré : ± 0,11° ;
 * - durées / minutes : ± max(une demi-unité de la précision demandée, 0,5 %).
 * Une saisie illisible (`parse_error`) ou un angle juste mais non réduit à [0° ; 360°[
 * (`non_reduit`) ne consomme pas de tentative : l'appli affiche un message et attend.
 */

export type StatutChamp = "correct" | "faux" | "signe" | "non_reduit" | "parse_error";

export interface Diagnostic {
  statuts: StatutChamp[];
  correct: boolean;
  /** Aucune tentative comptée (saisie illisible ou angle non réduit). */
  nonCompte: boolean;
  /** Message ciblé (piège reconnu), ou `null`. */
  message: string | null;
}

/** Lecture d'un nombre : entier, décimal (virgule ou point), fraction a/b ; une unité finale
 * (°, m, cm, s, min) est tolérée. `null` si illisible. */
export function lireNombre(texte: string): number | null {
  const s = texte
    .trim()
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-")
    .replace(",", ".")
    .replace(/(°|degrés?|cm|m|min|s)$/i, "");
  if (s === "") return null;
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return Number(s);
  const fraction = /^([+-]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(s);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
  return null;
}

const proche = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol + 1e-9;

export function toleranceLongueur(attendu: number): number {
  return Math.max(0.006, 0.005 * Math.abs(attendu));
}

export const TOLERANCE_ANGLE_INVERSE = 0.11;

export function toleranceRetour(e: ExerciceRotationsContexte, attendu: number): number {
  switch (e.situation) {
    case "roue":
      return Math.max(0.6, 0.005 * Math.abs(attendu));
    case "eolienne":
      return Math.max(0.006, 0.005 * Math.abs(attendu));
    case "horloge":
      return Math.max(0.06, 0.005 * Math.abs(attendu));
    default:
      return TOLERANCE_ANGLE_INVERSE;
  }
}

function illisible(n: number): Diagnostic {
  return { statuts: Array.from({ length: n }, () => "parse_error"), correct: false, nonCompte: true, message: "Une valeur n'est pas lisible : écris un nombre (virgule ou point décimal). Aucune tentative n'est comptée." };
}

// ---------------------------------------------------------------------------------------------
// Écran 1 (les deux sens) — choix fermé
// ---------------------------------------------------------------------------------------------

export function verifierRepere(e: ExerciceRotationsContexte, origine: OrigineRotation, rotation: RotationSens): boolean {
  return origine === e.origine && rotation === e.rotation;
}

// ---------------------------------------------------------------------------------------------
// Sens direct
// ---------------------------------------------------------------------------------------------

export function diagnostiquerThetaDirect(e: ExerciceRotationsContexte, saisie: string): Diagnostic {
  const v = lireNombre(saisie);
  if (v === null) return illisible(1);
  const attendu = thetaDirect(e);
  if (proche(v, attendu, 0.01)) return { statuts: ["correct"], correct: true, nonCompte: false, message: null };
  if (proche(normaliserAngle(v), attendu, 0.01) || proche(normaliserAngle(v), attendu - 360, 0.01)) {
    return { statuts: ["non_reduit"], correct: false, nonCompte: true, message: "Ton angle repère bien la bonne position, mais il n'est pas dans [0° ; 360°[ : ajoute ou retire 360°. Aucune tentative n'est comptée." };
  }
  const alpha = e.alpha ?? 0;
  const n = normaliserAngle(v);
  let message: string | null = null;
  if (proche(n, normaliserAngle(e.origine - e.rotation * alpha), 0.01)) message = "Ce serait la bonne position si l'on tournait dans l'autre sens : vérifie le sens de rotation.";
  else if (proche(n, normaliserAngle(alpha), 0.01)) message = "C'est l'angle parcouru α, compté depuis 0° dans le sens trigonométrique : mais le contexte ne part pas de 0°.";
  return { statuts: ["faux"], correct: false, nonCompte: false, message };
}

export function diagnostiquerPosition(e: ExerciceRotationsContexte, saisies: string[]): Diagnostic {
  const lus = saisies.map(lireNombre);
  if (lus.some((v) => v === null)) return illisible(2);
  const [x, y] = lus as number[];
  const p = positionDirecte(e);
  const statut = (v: number, a: number): StatutChamp => (proche(v, a, toleranceLongueur(a)) ? "correct" : proche(-v, a, toleranceLongueur(a)) ? "signe" : "faux");
  const statuts = [statut(x!, p.x), statut(y!, p.y)];
  const correct = statuts.every((s) => s === "correct");
  let message: string | null = null;
  if (!correct) {
    if (proche(x!, p.y, toleranceLongueur(p.y)) && proche(y!, p.x, toleranceLongueur(p.x))) message = "x et y sont échangés : l'abscisse utilise le cosinus, l'ordonnée le sinus.";
    else if (statuts.includes("signe")) message = "Une valeur a le bon nombre mais le mauvais signe : regarde dans quel quadrant tombe θ.";
    else if (proche(Math.abs(x!), Math.abs(p.x) / e.rayon, 0.006) || proche(Math.abs(y!), Math.abs(p.y) / e.rayon, 0.006)) message = `Multiplie par le rayon : le cercle de la situation a un rayon de ${String(e.rayon).replace(".", ",")} ${e.unite}, pas 1.`;
  }
  return { statuts, correct, nonCompte: false, message };
}

export function diagnostiquerHauteur(e: ExerciceRotationsContexte, saisie: string): Diagnostic {
  const v = lireNombre(saisie);
  if (v === null) return illisible(1);
  const attendu = hauteurDirecte(e);
  if (proche(v, attendu, toleranceLongueur(attendu))) return { statuts: ["correct"], correct: true, nonCompte: false, message: null };
  const y = positionDirecte(e).y;
  let message: string | null = null;
  if (proche(v, y, toleranceLongueur(y))) message = "C'est la hauteur par rapport au CENTRE de rotation : ajoute la hauteur du centre.";
  else if (proche(v, e.hauteurCentre - y, toleranceLongueur(attendu))) message = "Attention au signe de y : un point sous le centre est plus bas que le centre.";
  return { statuts: ["faux"], correct: false, nonCompte: false, message };
}

// ---------------------------------------------------------------------------------------------
// Sens inverse
// ---------------------------------------------------------------------------------------------

export function diagnostiquerK(e: ExerciceRotationsContexte, saisie: string): Diagnostic {
  const v = lireNombre(saisie);
  if (v === null) return illisible(1);
  const k = kInverse(e);
  if (proche(v, k, 0.0005)) return { statuts: ["correct"], correct: true, nonCompte: false, message: null };
  let message: string | null = null;
  const H = e.hauteurCible ?? 0;
  if (proche(v, H / e.rayon, 0.0005)) message = "Retire d'abord la hauteur du centre : seule la partie au-dessus (ou au-dessous) du centre vaut r sin θ.";
  else if (proche(v, -k, 0.0005)) message = "Le signe est à revoir : le point est-il au-dessus ou au-dessous du centre ?";
  return { statuts: ["faux"], correct: false, nonCompte: false, message };
}

/** Appariement sans ordre : pour chaque saisie, la valeur attendue la plus proche non encore prise. */
function apparier(lus: number[], attendus: number[], tol: (a: number) => number, equivalent?: (v: number) => number): StatutChamp[] {
  const libres = [...attendus];
  return lus.map((v) => {
    const i = libres.findIndex((a) => proche(v, a, tol(a)));
    if (i >= 0) {
      libres.splice(i, 1);
      return "correct";
    }
    if (equivalent) {
      const j = libres.findIndex((a) => proche(equivalent(v), a, tol(a)));
      if (j >= 0) {
        libres.splice(j, 1);
        return "non_reduit";
      }
    }
    return "faux";
  });
}

export function diagnostiquerThetasInverse(e: ExerciceRotationsContexte, saisies: string[]): Diagnostic {
  const lus = saisies.map(lireNombre);
  if (lus.some((v) => v === null)) return illisible(saisies.length);
  const attendus = solutionsTheta(e);
  if (lus.length !== attendus.length) {
    return {
      statuts: lus.map(() => "faux"),
      correct: false,
      nonCompte: false,
      message:
        attendus.length === 2
          ? "Il y a deux solutions : une droite horizontale coupe le cercle en deux points (sauf tout en haut ou tout en bas)."
          : "Il n'y a qu'une solution : le point est tout en haut ou tout en bas du cercle, la droite horizontale n'y touche le cercle qu'en un point.",
    };
  }
  const statuts = apparier(lus as number[], attendus, () => TOLERANCE_ANGLE_INVERSE, normaliserAngle);
  const correct = statuts.every((s) => s === "correct");
  if (!correct && statuts.every((s) => s === "correct" || s === "non_reduit")) {
    return { statuts, correct: false, nonCompte: true, message: "Tes angles repèrent les bons points, mais chaque solution doit être dans [0° ; 360°[ : ajoute 360° à un angle négatif. Aucune tentative n'est comptée." };
  }
  let message: string | null = null;
  if (attendus.length === 2 && statuts.filter((s) => s === "correct").length === 1) {
    message = "Une des deux solutions est juste. L'autre a le même SINUS (même ordonnée) : elle est symétrique par rapport à l'axe Y.";
  }
  return { statuts: statuts.map((s) => (s === "non_reduit" ? "faux" : s)), correct, nonCompte: false, message };
}

export function diagnostiquerRetours(e: ExerciceRotationsContexte, saisies: string[]): Diagnostic {
  const lus = saisies.map(lireNombre);
  if (lus.some((v) => v === null)) return illisible(saisies.length);
  const sols = solutionsContexte(e);
  const attendus = sols.map((s) => s.valeur);
  const angle = grandeurRetour(e.situation) === "angle";
  const statuts = apparier(lus as number[], attendus, (a) => toleranceRetour(e, a), angle ? normaliserAngle : undefined);
  const correct = statuts.every((s) => s === "correct");
  if (!correct && angle && statuts.every((s) => s === "correct" || s === "non_reduit")) {
    return { statuts, correct: false, nonCompte: true, message: "Tes angles sont justes à un tour près : donne-les entre 0° et 360°. Aucune tentative n'est comptée." };
  }
  let message: string | null = null;
  if (!correct) {
    const thetas = solutionsTheta(e);
    const sensInverse = thetas.map((t) => normaliserAngle(-e.rotation * (t - e.origine)));
    const alphas = sols.map((s) => s.alpha);
    const vals = lus as number[];
    const tous = (cibles: number[], tol: number) => vals.every((v) => cibles.some((c) => proche(v, c, tol)));
    if (tous(thetas, TOLERANCE_ANGLE_INVERSE) && !angle) message = "Ce sont les angles trigonométriques θ : retraduis-les d'abord en angle parcouru depuis le départ, puis en durée.";
    else if (tous(thetas, TOLERANCE_ANGLE_INVERSE)) message = "Ce sont les angles trigonométriques θ, comptés depuis 0° : l'angle de rotation se compte depuis la position de départ.";
    else if (!angle && tous(alphas, TOLERANCE_ANGLE_INVERSE)) message = "Ce sont les angles parcourus α : il reste à les convertir.";
    else if (tous(sensInverse.map((a) => valeurRetour(e, a)), angle ? TOLERANCE_ANGLE_INVERSE : toleranceRetour(e, attendus[0]!)))
      message = "Ces valeurs correspondent à une rotation dans l'autre sens : vérifie le sens de rotation.";
  }
  return { statuts: statuts.map((s) => (s === "non_reduit" ? "faux" : s)), correct, nonCompte: false, message };
}
