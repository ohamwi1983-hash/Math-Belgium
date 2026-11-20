import { latex, texte } from "../../export/corrigeTableau";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceLectureParabole, IdOptionImage, IdOptionSignes, Signe, TripleSignes } from "../core/lectureParabole.types";
import { ensembleLatex, nombreLatex } from "../moteur/algebreTransfertSecondDegre";
import { coefC, f, intervalleImage } from "../moteur/modeleLectureParabole";
import type { EcranTSD } from "./ecransTransfertSecondDegre";
import { etiquettePoint, figureParaboleGrille, figurePourEcran } from "./figureParaboleGrille";

/**
 * Textes, écrans et figures de gen123 « Lire une parabole sur un graphique » (écran ET papier : une
 * seule source). Notation du cours (décision de l'utilisateur) : sommet S(x_S ; y_S), axe x = x_S,
 * f(0) = c ; jamais « Δ », « discriminant » ni « concavité ».
 */

type E = ExerciceLectureParabole;
type Fragments = FragmentConsigne[];
const n = nombreLatex;

export const CONSIGNE_GENERALE = "Lis la parabole sur le quadrillage : signes de a, b et c, sommet et axe de symétrie, zéros et ordonnée à l'origine, puis image de f.";

export const TITRES_ECRANS = ["Les signes de a, b et c", "Le sommet et l'axe", "Les intersections avec les axes", "L'image"];

export function enonceFragments(): Fragments {
  return [
    texte("On a tracé la parabole d'équation "),
    latex("y=f(x)=ax^2+bx+c"),
    texte(". Son sommet, ses zéros et son ordonnée à l'origine tombent sur des nœuds du quadrillage."),
  ];
}

/** Consigne globale imprimée (énoncé papier). */
export function consignePapier(): Fragments {
  return [texte("Lis sur le graphique les signes de "), latex("a"), texte(", "), latex("b"), texte(" et "), latex("c"), texte(", le sommet et l'axe de symétrie, les zéros et l'ordonnée à l'origine, puis l'image de "), latex("f"), texte(".")];
}

export function consignesEcrans(): Fragments[] {
  return [
    [texte("Quels sont les signes de "), latex("a"), texte(", "), latex("b"), texte(" et "), latex("c"), texte(" ?")],
    [texte("Lis le sommet "), latex("S(x_S\\,;y_S)"), texte(" et l'équation de l'axe de symétrie.")],
    [texte("Lis les zéros de "), latex("f"), texte(" et son ordonnée à l'origine "), latex("f(0)"), texte(".")],
    [texte("Quelle est l'image de "), latex("f"), texte(" ?")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------------------------

function relSigne(s: Signe): string {
  return s > 0 ? ">0" : s < 0 ? "<0" : "=0";
}

export function signesLatex(t: TripleSignes): string {
  return `a${relSigne(t[0])},\\ b${relSigne(t[1])},\\ c${relSigne(t[2])}`;
}

export function sommetLatex(e: E): string {
  return `S(${n(e.xS)}\\,;${n(e.yS)})`;
}

export function axeLatex(e: E): string {
  return `x=${n(e.xS)}`;
}

export function imageLatex(e: E, id: IdOptionImage = "juste"): string {
  return ensembleLatex([intervalleImage(e, id)]);
}

export function reponseSignes(e: E): Fragments {
  return [latex(signesLatex(e.optionsSignes.find((o) => o.id === "juste")!.signes))];
}

export function reponseSommet(e: E): Fragments {
  return [latex(sommetLatex(e)), texte(" ; axe de symétrie : "), latex(axeLatex(e))];
}

export function zerosFragments(e: E): Fragments {
  if (e.zeros.length === 0) return [texte("aucun zéro")];
  if (e.zeros.length === 1) return [texte("un seul zéro : "), latex(`x=${n(e.zeros[0]!)}`)];
  return [texte("zéros : "), latex(`x=${n(e.zeros[0]!)}`), texte(" et "), latex(`x=${n(e.zeros[1]!)}`)];
}

export function reponseIntersections(e: E): Fragments {
  return [...zerosFragments(e), texte(" ; "), latex(`f(0)=${n(coefC(e))}`)];
}

export function reponseImage(e: E): Fragments {
  return [latex(`\\operatorname{im} f=${imageLatex(e)}`)];
}

/** Réponse brève (papier) : les quatre lectures. */
export function reponseComplete(e: E): Fragments {
  return [...reponseSignes(e), texte(" ; "), ...reponseSommet(e), texte(" ; "), ...reponseIntersections(e), texte(" ; "), ...reponseImage(e)];
}

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

export function figure(e: E): string {
  return figureParaboleGrille((x) => f(e, x), e.fenetre);
}

/** Figure du corrigé : sommet, zéros, (0 ; c) étiquetés, axe de symétrie en pointillés. */
export function figureAnnotee(e: E): string {
  const c = coefC(e);
  const haut = e.a > 0;
  const points = [
    { x: e.xS, y: e.yS, label: `S${etiquettePoint(e.xS, e.yS)}`, couleur: "#c2410c", labelPosition: (haut ? "dessous" : "dessus") as "dessous" | "dessus" },
    ...e.zeros.filter((z) => z !== e.xS).map((z) => ({ x: z, y: 0, label: etiquettePoint(z, 0), couleur: "#2f9e44", labelPosition: (haut ? "dessus" : "dessous") as "dessous" | "dessus" })),
  ];
  if (!(e.xS === 0) && !e.zeros.includes(0)) points.push({ x: 0, y: c, label: etiquettePoint(0, c), couleur: "#1b1d22", labelPosition: (c >= e.fenetre.yMax - 1 ? "dessous" : "dessus") as "dessous" | "dessus" });
  return figureParaboleGrille((x) => f(e, x), e.fenetre, { points, axe: e.xS });
}

export function figureEcran(e: E): string {
  return figurePourEcran(figure(e));
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

const MESSAGES_SIGNES: Record<IdOptionSignes, string | undefined> = {
  juste: undefined,
  bSeul: "Le signe de b ne se lit jamais seul : axe de symétrie à gauche de l'axe des y, a et b ont le même signe ; à droite, des signes opposés.",
  cSommet: "c est l'ordonnée à l'origine : il se lit là où la courbe coupe l'axe des y, pas au sommet.",
  ouverture: "Regarde d'abord l'ouverture : vers le haut, a > 0 ; vers le bas, a < 0 (le signe de b en dépend).",
};

const MESSAGES_IMAGE: Record<IdOptionImage, string | undefined> = {
  juste: undefined,
  sens: "Le sens dépend du signe de a : ouverte vers le haut, la parabole prend toutes les valeurs au-dessus de l'ordonnée du sommet ; vers le bas, toutes celles en dessous.",
  abscisse: "L'image se lit sur l'axe des y : elle est bornée par l'ordonnée du sommet, pas par son abscisse.",
  origine: "L'image est bornée par l'ordonnée du sommet, pas par l'ordonnée à l'origine.",
  ouvert: "Le sommet est un point de la courbe : son ordonnée est atteinte, le crochet est fermé de ce côté.",
  reels: "ℝ est le domaine d'une fonction du second degré ; son image s'arrête au sommet.",
};

function signeTexte(v: number): string {
  return v > 0 ? "au-dessus" : v < 0 ? "en dessous" : "sur";
}

export function ecrans(e: E): EcranTSD[] {
  const c = coefC(e);
  const iJuste = e.optionsSignes.findIndex((o) => o.id === "juste");
  const piegesSommetX = [e.yS].filter((v) => v !== e.xS).map((valeur) => ({ valeur, message: "C'est l'ordonnée du sommet : $x_S$ se lit sur l'axe horizontal." }));
  const piegesSommetY = [
    ...[e.xS].filter((v) => v !== e.yS).map((valeur) => ({ valeur, message: "C'est l'abscisse du sommet : $y_S$ se lit sur l'axe vertical." })),
    ...[c].filter((v) => v !== e.yS && v !== e.xS).map((valeur) => ({ valeur, message: "C'est l'ordonnée à l'origine $f(0)$ ; le sommet est le point le plus bas (ou le plus haut) de la courbe." })),
  ];
  const piegesAxe = [e.yS].filter((v) => v !== e.xS).map((valeur) => ({ valeur, message: "L'axe de symétrie est une droite verticale qui passe par le sommet : son équation est $x=x_S$." }));
  const piegesZeros = [
    ...(e.zeros.includes(c) || (e.zeros.length === 1 && c === 0) ? [] : [{ valeurs: [c], message: "C'est l'ordonnée à l'origine : un zéro est l'abscisse d'un point où la courbe coupe l'axe des x." }]),
    ...(e.zeros.length && e.zeros.some((z) => !e.zeros.includes(-z)) ? [{ valeurs: e.zeros.map((z) => -z), message: "Attention au signe : lis les abscisses sur la graduation de l'axe des x." }] : []),
  ];
  const piegesOrigine = [
    ...[e.yS].filter((v) => v !== c).map((valeur) => ({ valeur, message: "C'est l'ordonnée du sommet : $f(0)$ se lit là où la courbe coupe l'axe des y." })),
    ...e.zeros.filter((z) => z !== c && z !== e.yS).slice(0, 1).map((valeur) => ({ valeur, message: "C'est un zéro (sur l'axe des x) : l'ordonnée à l'origine se lit sur l'axe des y." })),
  ];
  const iImage = e.optionsImage.indexOf("juste");
  const ref = e.a > 0 ? "le plus bas" : "le plus haut";
  return [
    {
      type: "choix",
      titre: TITRES_ECRANS[0]!,
      consigne: consignesEcrans()[0]!,
      options: e.optionsSignes.map((o) => [latex(signesLatex(o.signes))]),
      bonne: iJuste,
      aides: [
        [texte("Trois lectures, dans cet ordre : "), latex("a"), texte(" par l'ouverture, "), latex("c=f(0)"), texte(" là où la courbe coupe l'axe des y, puis "), latex("b"), texte(" avec "), latex("x_S=-\\dfrac{b}{2a}"), texte(".")],
        [texte("Axe de symétrie à gauche de l'axe des y : "), latex("a"), texte(" et "), latex("b"), texte(" ont le même signe ; à droite : des signes opposés ; sur l'axe des y : "), latex("b=0"), texte(`. Ici, l'axe est ${e.xS < 0 ? "à gauche de" : e.xS > 0 ? "à droite de" : "confondu avec"} l'axe des y.`)],
      ],
      messageFaux: "Ce n'était pas la bonne combinaison de signes.",
      messagesOptions: e.optionsSignes.map((o) => MESSAGES_SIGNES[o.id]),
    },
    {
      type: "champs",
      titre: TITRES_ECRANS[1]!,
      consigne: consignesEcrans()[1]!,
      champs: [
        { type: "nombre", id: "xS", libelle: [latex("x_S=")], cible: e.xS, pieges: piegesSommetX, messageSiFaux: `Le sommet est le point ${ref} de la courbe : lis son abscisse sur l'axe des x.` },
        { type: "nombre", id: "yS", libelle: [latex("y_S=")], cible: e.yS, pieges: piegesSommetY, messageSiFaux: "Lis l'ordonnée du sommet sur l'axe des y." },
        { type: "nombre", id: "axe", libelle: [texte("axe de symétrie : "), latex("x=")], cible: e.xS, pieges: piegesAxe, messageSiFaux: "L'axe de symétrie est la droite verticale qui passe par le sommet." },
      ],
      aides: [
        [texte("Le sommet est le point le plus bas (si "), latex("a>0"), texte(") ou le plus haut (si "), latex("a<0"), texte(") de la courbe ; l'axe de symétrie est la droite verticale qui passe par lui : "), latex("x=x_S"), texte(".")],
        [texte(`Ici, le sommet est le point ${ref} de la courbe. Descends (ou monte) de ce point jusqu'à l'axe des x pour lire `), latex("x_S"), texte(", puis va horizontalement jusqu'à l'axe des y pour lire "), latex("y_S"), texte(".")],
      ],
      reponse: reponseSommet(e),
    },
    {
      type: "champs",
      titre: TITRES_ECRANS[2]!,
      consigne: consignesEcrans()[2]!,
      champs: [
        { type: "liste", id: "zeros", libelle: [texte("zéros : "), latex("x=")], cibles: e.zeros, videPermis: true, pieges: piegesZeros, messageSiFaux: "Les zéros sont les abscisses des points où la courbe coupe (ou touche) l'axe des x ; s'il n'y en a pas, écris « aucun »." },
        { type: "nombre", id: "c", libelle: [texte("ordonnée à l'origine : "), latex("f(0)=")], cible: c, pieges: piegesOrigine, messageSiFaux: "$f(0)$ se lit là où la courbe coupe l'axe des y." },
      ],
      aides: [
        [texte("Les zéros de "), latex("f"), texte(" sont les abscisses des points où la courbe coupe l'axe des x (il peut y en avoir 0, 1 ou 2) ; l'ordonnée à l'origine est "), latex("f(0)=c"), texte(", là où elle coupe l'axe des y.")],
        [texte(`Le sommet est ${signeTexte(e.yS)} l'axe des x et la parabole est ouverte vers ${e.a > 0 ? "le haut" : "le bas"} : déduis-en si la courbe rencontre l'axe des x. Deux zéros sont toujours symétriques par rapport à l'axe `), latex(axeLatex(e)), texte(".")],
      ],
      reponse: reponseIntersections(e),
    },
    {
      type: "choix",
      titre: TITRES_ECRANS[3]!,
      consigne: consignesEcrans()[3]!,
      options: e.optionsImage.map((id) => [latex(`\\operatorname{im} f=${imageLatex(e, id)}`)]),
      bonne: iImage,
      aides: [
        [texte("Si "), latex("a>0"), texte(", le sommet est un minimum : "), latex("\\operatorname{im} f=[y_S\\,;+\\infty\\mathclose{[}"), texte(" ; si "), latex("a<0"), texte(", c'est un maximum : "), latex("\\operatorname{im} f=\\mathopen{]}-\\infty\\,;y_S]"), texte(".")],
        [texte("L'image se lit sur l'axe des y : ce sont toutes les hauteurs atteintes par la courbe. Le sommet est sur la courbe, donc sa hauteur est atteinte.")],
      ],
      messageFaux: "Ce n'était pas l'image de f.",
      messagesOptions: e.optionsImage.map((id) => MESSAGES_IMAGE[id]),
    },
  ];
}
