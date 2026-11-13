import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceRotationsContexte, OrigineRotation, RotationSens, SituationRotation } from "../core/rotationsContexte.types";
import {
  angleReference,
  dureeDirecteSecondes,
  grandeurRetour,
  hauteurDirecte,
  kInverse,
  minutesDirectes,
  positionDirecte,
  propre,
  quadrantDe,
  solutionsContexte,
  solutionsTheta,
  thetaDirect,
} from "../moteur/modeleRotationsContexte";

/**
 * Textes de gen79 (écran ET papier : une seule source). Formules en LaTeX, jamais au clavier ;
 * virgule décimale ; signe moins typographique ; aucune prose dans le mode math.
 */

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

export function arrondi(v: number, decimales: number): number {
  const f = 10 ** decimales;
  const r = Math.round(v * f) / f;
  return r === 0 ? 0 : r;
}

/** Nombre en texte : virgule décimale, signe moins typographique, au plus `decimales` décimales. */
export function nombreFr(v: number, decimales = 2): string {
  return String(arrondi(v, decimales)).replace(".", ",").replace("-", "−");
}

/** Nombre en LaTeX : virgule décimale (`{,}`), au plus `decimales` décimales. */
export function nombreLatex(v: number, decimales = 2): string {
  return String(arrondi(v, decimales)).replace(".", "{,}");
}

export function estArrondiExact(v: number, decimales: number): boolean {
  return Math.abs(v - arrondi(v, decimales)) < 1e-9;
}

/** « = 17,3 » si la valeur s'écrit exactement avec `decimales` décimales, sinon « \approx 17,32 ». */
export function egalOuApprox(v: number, decimales: number): string {
  // Valeur approchée : toutes ses décimales (« 8,0 » et pas « 8 », qui se lirait comme exact).
  if (estArrondiExact(v, decimales)) return `= ${nombreLatex(v, decimales)}`;
  return `\\approx ${nombreFixeLatex(v, decimales)}`;
}

/** Nombre en LaTeX avec exactement `decimales` décimales (valeur approchée). */
export function nombreFixeLatex(v: number, decimales: number): string {
  const r = Math.round(v * 10 ** decimales) / 10 ** decimales;
  return (r === 0 ? 0 : r).toFixed(decimales).replace(".", "{,}");
}

export function degresLatex(v: number, decimales = 1): string {
  return `${nombreLatex(v, decimales)}^\\circ`;
}

// ---------------------------------------------------------------------------------------------
// Vocabulaire des situations
// ---------------------------------------------------------------------------------------------

const OBJET: Record<SituationRotation, string> = {
  roue: "la nacelle",
  horloge: "la pointe de l'aiguille",
  robot: "la pince",
  eolienne: "le bout de la pale",
  valve: "la valve",
};

export function objet(e: ExerciceRotationsContexte): string {
  return OBJET[e.situation];
}

export function objetMajuscule(e: ExerciceRotationsContexte): string {
  const o = objet(e);
  return o.charAt(0).toUpperCase() + o.slice(1);
}

/** « du sol », ou « de la table » pour le robot. */
export function reference(e: ExerciceRotationsContexte): string {
  return e.situation === "robot" ? "de la table" : "du sol";
}

export function libelleOrigine(o: OrigineRotation): string {
  return { 0: "0° (à droite)", 90: "90° (en haut)", 180: "180° (à gauche)", 270: "270° (en bas)" }[o];
}

export function libelleRotation(r: RotationSens): string {
  return r === 1 ? "Sens trigonométrique (antihoraire)" : "Sens horaire";
}

/** « 4 min 30 s », « 2 min », « 45 s ». */
export function dureeMinSec(secondes: number): string {
  const s = Math.round(secondes);
  const min = Math.floor(s / 60);
  const reste = s % 60;
  if (min === 0) return `${reste} s`;
  return reste === 0 ? `${min} min` : `${min} min ${reste} s`;
}

/** Heure d'horloge `m` minutes après midi : « 12 h 40 », « 13 h 05 ». */
export function heureApresMidi(minutes: number): string {
  const m = Math.round(minutes);
  return `${12 + Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export const CONSIGNE_GENERALE =
  "Un point tourne autour d'un centre fixe. Pour l'étudier, on superpose le cercle trigonométrique au schéma : origine au centre de rotation, axe X horizontal vers la droite, axe Y vertical vers le haut.";

function u(e: ExerciceRotationsContexte): string {
  return e.unite;
}

/** Typographie française : espace insécable avant « ; : ? ! ». */
function insecables(t: string): string {
  return t.replace(/ ([;:?!])/g, "\u00a0$1");
}

/** Description de la situation (données), sans la question. */
export function contexteTexte(e: ExerciceRotationsContexte): string {
  return insecables(contexteBrut(e));
}

function contexteBrut(e: ExerciceRotationsContexte): string {
  const r = `${nombreFr(e.rayon)} ${u(e)}`;
  const h = `${nombreFr(e.hauteurCentre)} ${u(e)}`;
  switch (e.situation) {
    case "roue": {
      const sens = e.rotation === 1 ? "dans le sens contraire des aiguilles d'une montre" : "dans le sens des aiguilles d'une montre";
      return `Une grande roue a un rayon de ${r} ; son centre est à ${h} du sol. Vue depuis l'entrée, elle tourne ${sens} et fait un tour complet en ${e.periode} min. On suit une nacelle (assimilée à un point de la jante) qui part du point le plus bas de la roue.`;
    }
    case "horloge":
      return `L'horloge d'un beffroi a une aiguille des minutes de ${r} ; le centre du cadran est à ${h} du sol. À midi pile, l'aiguille des minutes pointe vers le 12.`;
    case "robot": {
      const depart = e.origine === 180 ? "horizontal, pointé vers la gauche" : "horizontal, pointé vers la droite";
      const mouvement = (e.origine === 180) === (e.rotation === -1) ? "en se relevant : sa pince monte d'abord" : "en s'abaissant : sa pince descend d'abord";
      return `Le bras d'un robot mesure ${r} ; il pivote autour d'une articulation située à ${h} au-dessus de la table. Au départ, le bras est ${depart}. Il tourne ${mouvement}.`;
    }
    case "eolienne": {
      const sens = e.rotation === -1 ? "dans le sens des aiguilles d'une montre" : "dans le sens contraire des aiguilles d'une montre";
      const tour = e.sens === "inverse" ? ` Il fait un tour complet en ${e.periode} s.` : "";
      return `Les pales d'une éolienne mesurent ${r} ; le moyeu (le centre du rotor) est à ${h} du sol. Vu de face, le rotor tourne ${sens}.${tour} On suit le bout d'une pale qui part de la position verticale, vers le haut.`;
    }
    case "valve": {
      const sensVelo = e.rotation === -1 ? "vers la droite" : "vers la gauche";
      const depart = e.origine === 90 ? "tout en haut" : "tout en bas";
      return `Une roue de vélo a un rayon de ${h} : son moyeu est donc à ${h} du sol. La valve est à ${r} du centre de la roue. On regarde le vélo de côté : il roule ${sensVelo}. Au départ, la valve est ${depart} de la roue.`;
    }
  }
}

/** Question du contexte (ce que demande l'énoncé papier, sans la précision). */
export function questionTexte(e: ExerciceRotationsContexte): string {
  return insecables(questionBrute(e));
}

function questionBrute(e: ExerciceRotationsContexte): string {
  if (e.sens === "direct") {
    const ou = `À quelle hauteur au-dessus ${reference(e)} se trouve ${objet(e)}`;
    switch (e.situation) {
      case "roue":
        return `${ou} ${dureeMinSec(dureeDirecteSecondes(e))} après le départ ?`;
      case "horloge":
        return `${ou} des minutes à ${heureApresMidi(minutesDirectes(e))} ?`;
      case "robot":
        return `${ou} après une rotation du bras de ${e.alpha}° ?`;
      case "eolienne":
        return `${ou} après une rotation du rotor de ${e.alpha}° ?`;
      case "valve":
        return `${ou} quand la roue a tourné de ${e.alpha}° ?`;
    }
  }
  const H = `${nombreFr(e.hauteurCible ?? 0)} ${u(e)}`;
  switch (e.situation) {
    case "roue":
      return `Pendant le premier tour, à quels instants la nacelle est-elle à ${H} du sol ?`;
    case "horloge":
      return `Entre midi et 13 h, à quels moments la pointe de l'aiguille des minutes est-elle à ${H} du sol ?`;
    case "robot":
      return `Pendant un tour complet, pour quels angles de rotation du bras (entre 0° et 360°) la pince est-elle à ${H} au-dessus de la table ?`;
    case "eolienne":
      return `Pendant le premier tour, à quels instants le bout de la pale est-il à ${H} du sol ?`;
    case "valve":
      return `Pendant le premier tour de roue, pour quels angles de rotation de la roue (entre 0° et 360°) la valve est-elle à ${H} du sol ?`;
  }
}

/** Précision demandée pour la réponse finale (papier ; `exacte` : valeur exacte, sans calculatrice). */
export function precisionPapier(e: ExerciceRotationsContexte, exacte: boolean): string {
  if (e.sens === "direct") return exacte ? "Donne la valeur exacte." : "Arrondis au centième.";
  if (exacte) return "Donne les valeurs exactes.";
  switch (grandeurRetour(e.situation)) {
    case "secondes":
      return e.situation === "roue" ? "Donne les instants en secondes après le départ, arrondis à l'unité." : "Donne les instants en secondes après le départ, arrondis au centième.";
    case "minutes":
      return "Donne les moments en minutes après midi, arrondis au dixième.";
    case "angle":
      return "Arrondis au dixième de degré.";
  }
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export const NOMBRE_ECRANS = 4;

export function titresEcrans(e: ExerciceRotationsContexte): string[] {
  return e.sens === "direct"
    ? ["Départ et sens de rotation", "Angle trigonométrique", "Position du point", `Hauteur au-dessus ${reference(e)}`]
    : ["Départ et sens de rotation", "Mise en équation", "Les angles trigonométriques", "Retour au contexte"];
}

/** Champ numérique d'un écran : libellé, unité affichée, précision (décimales) et tolérance. */
export interface ChampRotation {
  libelle: FragmentConsigne[];
  unite: string;
  decimales: number;
}

export function libelleRetour(e: ExerciceRotationsContexte, i: number): FragmentConsigne[] {
  const indice = `_{${i + 1}}`;
  switch (grandeurRetour(e.situation)) {
    case "secondes":
      return [latex(`t${indice} =`)];
    case "minutes":
      return [texte(`Moment ${i + 1}, en minutes après midi :`)];
    case "angle":
      return [latex(`\\alpha${indice} =`)];
  }
}

export function uniteRetour(e: ExerciceRotationsContexte): string {
  return { secondes: "s", minutes: "min", angle: "°" }[grandeurRetour(e.situation)];
}

export function decimalesRetour(e: ExerciceRotationsContexte): number {
  if (e.situation === "roue") return 0;
  if (e.situation === "eolienne") return 2;
  return 1;
}

/** Champs de l'écran `ecran` (1, 2 ou 3 ; l'écran 0 est un choix fermé). `nbSolutions` : écran 4 du
 * sens inverse (une ligne par solution). */
export function champsEcran(e: ExerciceRotationsContexte, ecran: number, nbSolutions = 2): ChampRotation[] {
  const unite = e.unite;
  if (e.sens === "direct") {
    if (ecran === 1) return [{ libelle: [latex("\\theta =")], unite: "°", decimales: 0 }];
    if (ecran === 2)
      return [
        { libelle: [latex("x =")], unite, decimales: 2 },
        { libelle: [latex("y =")], unite, decimales: 2 },
      ];
    return [{ libelle: [texte("Hauteur :")], unite, decimales: 2 }];
  }
  if (ecran === 1) return [{ libelle: [latex("\\sin\\theta =")], unite: "", decimales: 4 }];
  if (ecran === 2)
    return Array.from({ length: nbSolutions }, (_, i) => ({ libelle: [latex(nbSolutions === 1 ? "\\theta =" : `\\theta_{${i + 1}} =`)], unite: "°", decimales: 1 }));
  return Array.from({ length: nbSolutions }, (_, i) => ({
    libelle: nbSolutions === 1 ? libelleRetour(e, 0).map((f) => (f.type === "latex" ? latex(f.valeur.replace("_{1}", "")) : texte(f.valeur.replace(" 1", "")))) : libelleRetour(e, i),
    unite: uniteRetour(e),
    decimales: decimalesRetour(e),
  }));
}


/** Phrase qui donne l'angle parcouru (sens direct) ou dit comment l'obtenir. */
function phraseAlpha(e: ExerciceRotationsContexte): string {
  switch (e.situation) {
    case "roue":
      return `Calcule l'angle α parcouru par la nacelle en ${dureeMinSec(dureeDirecteSecondes(e))}, puis`;
    case "horloge":
      return `Calcule l'angle α parcouru par l'aiguille des minutes entre midi et ${heureApresMidi(minutesDirectes(e))}, puis`;
    default:
      return `L'angle parcouru depuis le départ est α = ${e.alpha}°. Déduis-en`;
  }
}

export function consignesEcrans(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  const premiere: FragmentConsigne[] = [
    texte(`Sur le cercle trigonométrique superposé au schéma, quel angle repère la position de départ ${e.situation === "eolienne" ? "du bout de la pale" : `de ${objet(e)}`}, et dans quel sens tourne-t-${e.situation === "eolienne" ? "il" : "elle"} ?`),
  ];
  if (e.sens === "direct") {
    return [
      premiere,
      [texte(`${phraseAlpha(e)} l'angle trigonométrique θ de la position atteinte, réduit à `), latex("[0^\\circ ; 360^\\circ\\mathclose{[}"), texte(".")],
      [texte(`Calcule les coordonnées (x ; y) de ${objet(e)} dans ce repère (en ${e.unite}, arrondies au centième).`)],
      [texte(`Réponds à la question : à quelle hauteur au-dessus ${reference(e)} se trouve ${objet(e)} ? (En ${e.unite}, arrondie au centième.)`)],
    ];
  }
  const nbSol = solutionsTheta(e).length;
  const retour = (() => {
    switch (grandeurRetour(e.situation)) {
      case "secondes":
        return `Retraduis chaque solution dans le contexte : l'instant correspondant, en secondes après le départ (${e.situation === "roue" ? "arrondi à l'unité" : "arrondi au centième"}), dans l'ordre chronologique.`;
      case "minutes":
        return "Retraduis chaque solution dans le contexte : le moment correspondant, en minutes après midi (arrondi au dixième), dans l'ordre chronologique.";
      case "angle":
        return "Retraduis chaque solution dans le contexte : l'angle de rotation α depuis le départ, entre 0° et 360° (arrondi au dixième de degré), du plus petit au plus grand.";
    }
  })();
  return [
    premiere,
    [texte(`Mets le problème en équation : quelle valeur doit prendre sin θ pour que ${objet(e)} soit à ${nombreFr(e.hauteurCible ?? 0)} ${e.unite} au-dessus ${reference(e)} ?`)],
    [texte("Résous cette équation : donne toutes ses solutions dans "), latex("[0^\\circ ; 360^\\circ\\mathclose{[}"), texte(" (arrondies au dixième de degré).")],
    [texte(nbSol === 1 ? retour.replace("chaque solution", "la solution").replace(", dans l'ordre chronologique", "").replace(", du plus petit au plus grand", "") : retour)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Valeurs exactes (angles remarquables)
// ---------------------------------------------------------------------------------------------

/** Valeur exacte de sin(réf) en LaTeX pour un angle de référence remarquable (0 < réf < 90). */
const SIN_EXACT: Record<number, { latex: string; racine: number | null; num: number }> = {
  30: { latex: "\\dfrac{1}{2}", racine: null, num: 1 },
  45: { latex: "\\dfrac{\\sqrt{2}}{2}", racine: 2, num: 1 },
  60: { latex: "\\dfrac{\\sqrt{3}}{2}", racine: 3, num: 1 },
};

function signeDe(fonction: "sin" | "cos", theta: number): 1 | -1 {
  const q = quadrantDe(theta);
  if (fonction === "sin") return q === "I" || q === "II" ? 1 : -1;
  return q === "I" || q === "IV" ? 1 : -1;
}

/** Valeur exacte de sin θ ou cos θ (θ remarquable, hors axe), en LaTeX signé. */
export function valeurExacteLatex(fonction: "sin" | "cos", theta: number): string {
  const ref = angleReference(theta);
  const refF = fonction === "sin" ? ref : 90 - ref;
  const v = SIN_EXACT[refF]!;
  return `${signeDe(fonction, theta) === -1 ? "-" : ""}${v.latex}`;
}

/** r × (valeur exacte de sin θ ou cos θ), simplifié : « 10\sqrt{3} », « 7{,}5 », « 0{,}75\sqrt{2} ». */
export function produitExactLatex(r: number, fonction: "sin" | "cos", theta: number): string {
  const ref = angleReference(theta);
  const refF = fonction === "sin" ? ref : 90 - ref;
  const v = SIN_EXACT[refF]!;
  const signe = signeDe(fonction, theta) === -1 ? "-" : "";
  const coef = propre(r / 2);
  if (v.racine === null) return `${signe}${nombreLatex(coef, 4)}`;
  return `${signe}${coef === 1 ? "" : nombreLatex(coef, 4)}\\sqrt{${v.racine}}`;
}

/** h + y en écriture exacte : « 22 - 10\sqrt{3} », ou un décimal. */
export function hauteurExacteLatex(e: ExerciceRotationsContexte): string {
  const theta = thetaDirect(e);
  const y = produitExactLatex(e.rayon, "sin", theta);
  if (!y.includes("\\sqrt")) return nombreLatex(hauteurDirecte(e), 4);
  return y.startsWith("-") ? `${nombreLatex(e.hauteurCentre, 4)} - ${y.slice(1)}` : `${nombreLatex(e.hauteurCentre, 4)} + ${y}`;
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (affichage après validation, corrigé)
// ---------------------------------------------------------------------------------------------

/** Formule de conversion θ = θ₀ ± α, en LaTeX. */
export function formuleConversionLatex(e: ExerciceRotationsContexte): string {
  return `\\theta = ${e.origine}^\\circ ${e.rotation === 1 ? "+" : "-"} \\alpha`;
}

export function thetaDirectLatex(e: ExerciceRotationsContexte): string {
  return `\\theta = ${thetaDirect(e)}^\\circ`;
}

export function positionLatex(e: ExerciceRotationsContexte): string {
  const { x, y } = positionDirecte(e);
  return `x ${egalOuApprox(x, 2)} \\text{ ${e.unite}} \\quad ; \\quad y ${egalOuApprox(y, 2)} \\text{ ${e.unite}}`;
}

export function hauteurLatex(e: ExerciceRotationsContexte): string {
  return `${egalOuApprox(hauteurDirecte(e), 2).replace(/^=\s*/, "")}`;
}

export function kLatex(e: ExerciceRotationsContexte): string {
  return `\\sin\\theta = ${nombreLatex(kInverse(e), 4)}`;
}

export function solutionsThetaLatex(e: ExerciceRotationsContexte): string {
  return solutionsTheta(e)
    .map((t, i, l) => `\\theta${l.length > 1 ? `_{${i + 1}}` : ""} ${egalOuApprox(t, 1)}^\\circ`)
    .join(" \\quad ; \\quad ");
}

export function valeurRetourLatex(e: ExerciceRotationsContexte, v: number): string {
  const d = decimalesRetour(e);
  const n = estArrondiExact(v, d) ? nombreLatex(v, d) : nombreFixeLatex(v, d);
  switch (grandeurRetour(e.situation)) {
    case "secondes":
      return `${n}\\text{ s}`;
    case "minutes":
      return `${n}\\text{ min}`;
    case "angle":
      return `${n}^\\circ`;
  }
}

export function retoursLatex(e: ExerciceRotationsContexte): string {
  const sols = solutionsContexte(e);
  const d = decimalesRetour(e);
  const nom = grandeurRetour(e.situation) === "angle" ? "\\alpha" : grandeurRetour(e.situation) === "secondes" ? "t" : "m";
  return sols
    .map((s, i) => `${nom}${sols.length > 1 ? `_{${i + 1}}` : ""} ${estArrondiExact(s.valeur, d) ? "=" : "\\approx"} ${valeurRetourLatex(e, s.valeur)}`)
    .join(" \\quad ; \\quad ");
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours un calcul à faire)
// ---------------------------------------------------------------------------------------------

function aideDepartSituation(e: ExerciceRotationsContexte): string {
  switch (e.situation) {
    case "roue":
      return "Repère sur le schéma où se trouve la nacelle au départ (le point le plus bas). Le sens de rotation est donné en toutes lettres dans l'énoncé : sens des aiguilles d'une montre = sens horaire.";
    case "horloge":
      return "À midi, l'aiguille des minutes est verticale, vers le haut. Une aiguille d'horloge tourne… dans le sens des aiguilles d'une montre !";
    case "robot":
      return "Repère d'abord le côté où pointe le bras au départ. Puis imagine sa pince : partir de ce côté en montant (ou en descendant), est-ce tourner comme les aiguilles d'une montre, ou en sens contraire ?";
    case "eolienne":
      return "Au départ, la pale est verticale vers le haut. Le sens de rotation, vu de face, est donné dans l'énoncé : sens des aiguilles d'une montre = sens horaire.";
    case "valve":
      return "Quand le vélo avance, le haut de la roue part vers l'avant et le bas vers l'arrière. Regarde vers où roule le vélo : la roue tourne-t-elle alors comme les aiguilles d'une montre, ou en sens contraire ?";
  }
}

export function aidesEcran0(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  return [
    [
      texte("Sur le cercle trigonométrique, l'angle 0° est le point de droite de l'axe X, 90° le point du haut, 180° celui de gauche et 270° celui du bas. Le sens trigonométrique est le sens contraire des aiguilles d'une montre."),
    ],
    [texte(aideDepartSituation(e))],
  ];
}

export function aidesEcran1Direct(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  const niveau1: FragmentConsigne[] = (() => {
    switch (e.situation) {
      case "roue":
        return [texte(`Un tour, c'est 360° en ${e.periode} min : l'angle parcouru est proportionnel au temps. Avec t en minutes :`), latex(`\\alpha = 360^\\circ \\times \\dfrac{t}{${e.periode}}`)];
      case "horloge":
        return [texte("L'aiguille des minutes fait un tour (360°) en 60 min, soit 6° par minute. Avec m le nombre de minutes écoulées depuis midi :"), latex("\\alpha = 6^\\circ \\times m")];
      default:
        return [texte("L'angle parcouru est donné. Tourner dans le sens trigonométrique, c'est AJOUTER l'angle parcouru ; dans le sens horaire, c'est le RETRANCHER.")];
    }
  })();
  const plus = (e.alpha ?? 0) > 360 ? " Plus d'un tour a été fait : retire 360° autant de fois qu'il le faut." : "";
  const niveau2: FragmentConsigne[] = [
    texte(`On part de ${e.origine}° et on tourne ${e.rotation === 1 ? "dans le sens trigonométrique : on ajoute α" : "dans le sens horaire : on retranche α"}.${plus} Puis ramène le résultat dans [0° ; 360°[ :`),
    latex(formuleConversionLatex(e)),
  ];
  return [niveau1, niveau2];
}

export function aidesEcran2Direct(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  const t = thetaDirect(e);
  const q = quadrantDe(t);
  const ref = angleReference(t);
  const calcRef = { I: `${t}^\\circ`, II: `180^\\circ - ${t}^\\circ`, III: `${t}^\\circ - 180^\\circ`, IV: `360^\\circ - ${t}^\\circ`, axe: "" }[q];
  const sCos = signeDe("cos", t) === 1 ? "" : "-";
  const sSin = signeDe("sin", t) === 1 ? "" : "-";
  const signes = q === "I" ? "positifs tous les deux" : `${sCos ? "cos θ négatif" : "cos θ positif"} et ${sSin ? "sin θ négatif" : "sin θ positif"}`;
  const niveau2: FragmentConsigne[] =
    q === "I"
      ? [texte(`θ = ${t}° est dans le quadrant I : cos θ et sin θ sont positifs tous les deux, la calculatrice donne directement :`), latex(`\\cos ${t}^\\circ \\quad ; \\quad \\sin ${t}^\\circ`)]
      : [
          texte(`θ = ${t}° est dans le quadrant ${q} : ${signes}. Son angle du premier quadrant vaut `),
          latex(`${calcRef} = ${ref}^\\circ`),
          texte(", donc :"),
          latex(`\\cos ${t}^\\circ = ${sCos}\\cos ${ref}^\\circ \\quad ; \\quad \\sin ${t}^\\circ = ${sSin}\\sin ${ref}^\\circ`),
        ];
  return [
    [texte(`Un point d'un cercle de rayon r centré à l'origine, repéré par l'angle θ, a pour coordonnées :`), latex(`(r\\cos\\theta \\,;\\, r\\sin\\theta) \\text{, ici } r = ${nombreLatex(e.rayon)}`)],
    niveau2,
  ];
}

export function aidesEcran3Direct(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  return [
    [texte(`La hauteur au-dessus ${reference(e)} est celle du centre, plus l'ordonnée y du point (y est négatif quand le point est sous le centre) :`), latex("\\text{hauteur} = h + y")],
    [texte(`Ici le centre est à ${nombreFr(e.hauteurCentre)} ${e.unite} :`), latex(`\\text{hauteur} = ${nombreLatex(e.hauteurCentre)} + ${nombreLatex(e.rayon)}\\sin ${thetaDirect(e)}^\\circ`)],
  ];
}

export function aidesEcran1Inverse(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  return [
    [texte(`Le point repéré par l'angle θ est à la hauteur suivante au-dessus ${reference(e)} ; écris qu'elle vaut ${nombreFr(e.hauteurCible ?? 0)} ${e.unite} :`), latex("h + r\\sin\\theta = H")],
    [texte("Avec les données de l'énoncé, isole sin θ :"), latex(`${nombreLatex(e.hauteurCentre)} + ${nombreLatex(e.rayon)}\\sin\\theta = ${nombreLatex(e.hauteurCible ?? 0)}`)],
  ];
}

export function aidesEcran2Inverse(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  const k = kInverse(e);
  const niveau1: FragmentConsigne[] =
    Math.abs(k) === 1
      ? [texte(`sin θ = ${nombreFr(k)} : le point est ${k === 1 ? "tout en haut" : "tout en bas"} du cercle. Combien de points du cercle ont cette ordonnée ?`)]
      : Math.abs(k) === 0.5
        ? [texte("C'est une valeur remarquable :"), latex("\\sin 30^\\circ = \\dfrac{1}{2}"), texte(". L'angle de référence est donc 30° ; la seconde solution s'obtient par symétrie (même ordonnée).")]
        : [
            texte("La touche sin⁻¹ de la calculatrice (en mode degrés) donne une première solution, entre −90° et 90° ; la seconde a le même sinus, c'est son supplémentaire :"),
            latex("\\theta_2 = 180^\\circ - \\theta_1"),
            texte(". Un angle négatif se ramène dans [0° ; 360°[ en ajoutant 360°."),
          ];
  const niveau2: FragmentConsigne[] = [
    texte(
      Math.abs(k) === 1
        ? "Une droite horizontale qui touche le cercle tout en haut ou tout en bas ne le rencontre qu'en un seul point."
        : k > 0
          ? "sin θ > 0 : les solutions sont dans les quadrants I et II (au-dessus de l'axe X), symétriques par rapport à l'axe Y."
          : "sin θ < 0 : les solutions sont dans les quadrants III et IV (sous l'axe X), symétriques par rapport à l'axe Y.",
    ),
  ];
  return [niveau1, niveau2];
}

export function aidesEcran3Inverse(e: ExerciceRotationsContexte): FragmentConsigne[][] {
  const niveau1: FragmentConsigne[] = [
    texte(
      `Pour chaque solution θ, l'angle parcouru depuis le départ (${e.origine}°) en tournant ${e.rotation === 1 ? "dans le sens trigonométrique" : "dans le sens horaire"} est le suivant, ramené dans [0° ; 360°[ (ajoute 360° s'il est négatif) :`,
    ),
    latex(e.rotation === 1 ? `\\alpha = \\theta - ${e.origine}^\\circ` : `\\alpha = ${e.origine}^\\circ - \\theta`),
  ];
  const niveau2: FragmentConsigne[] = (() => {
    switch (e.situation) {
      case "roue":
        return [texte(`Un tour (360°) dure ${e.periode} min, soit ${(e.periode ?? 0) * 60} s : la durée est proportionnelle à l'angle parcouru :`), latex(`t = \\dfrac{\\alpha}{360^\\circ} \\times ${(e.periode ?? 0) * 60}\\text{ s}`)];
      case "eolienne":
        return [texte(`Un tour (360°) dure ${e.periode} s : la durée est proportionnelle à l'angle parcouru :`), latex(`t = \\dfrac{\\alpha}{360^\\circ} \\times ${e.periode}\\text{ s}`)];
      case "horloge":
        return [texte("L'aiguille des minutes tourne de 6° par minute :"), latex("m = \\dfrac{\\alpha}{6^\\circ}")];
      default:
        return [texte("Ici, la réponse du contexte est l'angle de rotation α lui-même : vérifie qu'il est bien entre 0° et 360°, et range les valeurs dans l'ordre croissant.")];
    }
  })();
  return [niveau1, niveau2];
}

/** Espace entre un texte et la formule qui le suit (« … : » puis LaTeX), et inversement. */
export function espacer(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map((f, i) => {
    if (f.type !== "texte") return f;
    let v = f.valeur;
    if (fragments[i + 1]?.type === "latex" && /[^\s(]$/.test(v)) v += " ";
    if (fragments[i - 1]?.type === "latex" && /^[^\s.,;:)]/.test(v)) v = " " + v;
    return texte(v);
  });
}

/** Aides de l'écran courant. */
export function aidesEcran(e: ExerciceRotationsContexte, ecran: number): FragmentConsigne[][] {
  const brutes = ecran === 0 ? aidesEcran0(e) : e.sens === "direct" ? [aidesEcran1Direct, aidesEcran2Direct, aidesEcran3Direct][ecran - 1]!(e) : [aidesEcran1Inverse, aidesEcran2Inverse, aidesEcran3Inverse][ecran - 1]!(e);
  return brutes.map(espacer);
}

/** Pronom sujet de l'objet suivi (« elle » pour la nacelle, « il » pour le bout de la pale). */
export function pronom(e: ExerciceRotationsContexte): string {
  return e.situation === "eolienne" ? "il" : "elle";
}

// ---------------------------------------------------------------------------------------------
// Calculs montrés (réponse attendue à l'écran, corrigé papier)
// ---------------------------------------------------------------------------------------------

/** Angle parcouru α, avec son calcul quand il vient d'une durée (roue) ou d'une heure (horloge). */
export function alphaCalculLatex(e: ExerciceRotationsContexte): string {
  const a = e.alpha ?? 0;
  if (e.situation === "roue") {
    const t = dureeDirecteSecondes(e);
    return `\\alpha = 360^\\circ \\times \\dfrac{${t}\\text{ s}}{${(e.periode ?? 0) * 60}\\text{ s}} = ${a}^\\circ`;
  }
  if (e.situation === "horloge") return `\\alpha = 6^\\circ \\times ${minutesDirectes(e)} = ${a}^\\circ`;
  return `\\alpha = ${a}^\\circ`;
}

/** θ = θ₀ ± α = brut (puis réduit), en LaTeX. */
export function thetaCalculLatex(e: ExerciceRotationsContexte): string {
  const a = e.alpha ?? 0;
  const brut = e.origine + e.rotation * a;
  const theta = thetaDirect(e);
  const debut = `\\theta = ${e.origine}^\\circ ${e.rotation === 1 ? "+" : "-"} ${a}^\\circ = ${brut}^\\circ`;
  if (brut === theta) return debut;
  const tours = (theta - brut) / 360;
  const correction = tours > 0 ? `+ ${tours === 1 ? "" : `${tours} \\times `}360^\\circ` : `- ${tours === -1 ? "" : `${-tours} \\times `}360^\\circ`;
  return `${debut} \\;\\to\\; ${brut}^\\circ ${correction} = ${theta}^\\circ`;
}

/** Mise en équation du sens inverse : h + r sin θ = H ⟺ sin θ = k. */
export function equationInverseLatex(e: ExerciceRotationsContexte): string {
  const h = nombreLatex(e.hauteurCentre);
  const r = nombreLatex(e.rayon);
  const H = nombreLatex(e.hauteurCible ?? 0);
  return `${h} + ${r}\\sin\\theta = ${H} \\iff \\sin\\theta = \\dfrac{${H} - ${h}}{${r}} = ${nombreLatex(kInverse(e), 4)}`;
}

/** Réponse attendue de l'écran `ecran` (1 à 3) en LaTeX. */
export function reponseEcranLatex(e: ExerciceRotationsContexte, ecran: number): string {
  if (e.sens === "direct") {
    if (ecran === 1) return e.situation === "roue" || e.situation === "horloge" ? `${alphaCalculLatex(e)} \\;;\\; ${thetaCalculLatex(e)}` : thetaCalculLatex(e);
    if (ecran === 2) return positionLatex(e);
    return `\\text{hauteur} ${egalOuApprox(hauteurDirecte(e), 2)}\\text{ ${e.unite}}`;
  }
  if (ecran === 1) return equationInverseLatex(e);
  if (ecran === 2) return solutionsThetaLatex(e);
  return retoursLatex(e);
}

/** Libellé de champ sans son « = » / « : » final (liste des champs fautifs). */
export function nomCourtChamp(libelle: FragmentConsigne[]): FragmentConsigne[] {
  return libelle.map((f) => (f.type === "latex" ? latex(f.valeur.replace(/\s*=\s*$/, "")) : texte(f.valeur.replace(/\s*:\s*$/, ""))));
}

