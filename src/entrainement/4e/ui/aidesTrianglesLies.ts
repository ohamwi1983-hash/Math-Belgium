import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import type { Triangle } from "../core/triangle.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { formatValeurUnite, libellesSommetPartage, uniteLongueurPont } from "./formatTriangleLies";
import { MESSAGE_RADIANS } from "./aidesTriangles";

/**
 * gen58 « Triangles liés » — textes des aides en KaTeX (audit 4e ch. 5, lot B, G4 et G5 : plus de
 * majuscules d'insistance ni de « / ») et messages ciblés (calculatrice en radians, côté non opposé,
 * angle utile = une visée brute, angle de l'hypothèse aigu au lieu d'obtus, soustraction inversée,
 * ½ oublié). Jamais la réponse.
 */

type Niveaux = FragmentConsigne[][];
const RAD = Math.PI / 180;
const proche = (v: number, x: number, pct = 0.012) => Number.isFinite(x) && Math.abs(v - x) <= Math.max(0.05, Math.abs(x) * pct);

function nombreLatex(x: number): string {
  return (Math.round(x * 100) / 100).toString().replace(".", "{,}");
}

const LOI_SINUS = "\\dfrac{a}{\\sin\\hat{A}} = \\dfrac{b}{\\sin\\hat{B}} = \\dfrac{c}{\\sin\\hat{C}}";
const AL_KASHI = "a^2 = b^2 + c^2 - 2bc\\cos\\hat{A}";

/** Configuration du triangle pont d'après les données affichées. */
function configurationPont(e: ExerciceTriangleLies): "rectangle" | "AAS" | "SAS" {
  if (e.typeTrianglePont === "rectangle") return "rectangle";
  const angles = e.donneesPont.filter((d) => d.unite === "°").length;
  return angles >= 2 ? "AAS" : "SAS";
}

// ---------------------------------------------------------------------------------------------
// Écran « pont »
// ---------------------------------------------------------------------------------------------

export function aidesPont(e: ExerciceTriangleLies): Niveaux {
  const config = configurationPont(e);
  const n1: FragmentConsigne[] =
    config === "rectangle"
      ? [
          texte("Le triangle pont est rectangle : Pythagore, ou les rapports trigonométriques "),
          latex("\\sin\\hat{X} = \\dfrac{\\text{opposé}}{\\text{hypoténuse}},\\ \\cos\\hat{X} = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}},\\ \\tan\\hat{X} = \\dfrac{\\text{opposé}}{\\text{adjacent}}"),
          texte("."),
        ]
      : [texte("Le triangle pont est quelconque : loi des sinus avec deux angles et un côté, "), latex(LOI_SINUS), texte(" ; Al-Kashi avec deux côtés et l'angle compris, "), latex(AL_KASHI), texte(".")];
  let n2: FragmentConsigne[];
  if (e.variante === "sommetPartage") {
    n2 = [texte("Ici trois valeurs sont à trouver : l'angle au sommet commun et les deux côtés qui en partent. Commence par l'angle (somme des angles : 180°), puis applique la loi des sinus à chaque côté, en face de son angle.")];
  } else if (config === "rectangle") {
    n2 = [latex(e.labelCoteTransfere), texte(" est l'hypoténuse : choisis le rapport qui relie l'hypoténuse au côté connu et à l'angle donné.")];
  } else if (config === "AAS") {
    n2 = [texte("Deux angles et un côté sont connus : calcule d'abord le troisième angle (la somme vaut 180°), puis écris la loi des sinus avec "), latex(e.labelCoteTransfere), texte(" et le côté connu, chacun en face de son angle.")];
  } else {
    n2 = [texte("Deux côtés et l'angle compris sont connus : écris Al-Kashi pour "), latex(e.labelCoteTransfere), texte(", le côté opposé à cet angle.")];
  }
  return [n1, n2];
}

/** Valeurs obtenues en mode radians, et loi des sinus avec le mauvais angle, pour le côté `a`
 * d'un triangle (b, c, A, B, C connus). */
function erreursCoteA(t: Triangle): { radians: number[]; nonOpposes: number[] } {
  const r = (x: number) => x; // angle lu comme des radians
  return {
    radians: [
      (t.b * Math.sin(r(t.A))) / Math.sin(r(t.B)),
      (t.c * Math.sin(r(t.A))) / Math.sin(r(t.C)),
      Math.sqrt(Math.max(0, t.b * t.b + t.c * t.c - 2 * t.b * t.c * Math.cos(r(t.A)))),
    ],
    nonOpposes: [(t.b * Math.sin(t.B * RAD)) / Math.sin(t.A * RAD), (t.c * Math.sin(t.C * RAD)) / Math.sin(t.A * RAD)],
  };
}

const MESSAGE_NON_OPPOSE: FragmentConsigne[] = [texte("Dans la loi des sinus, chaque côté est divisé par le sinus de l'angle qui lui fait face : vérifie tes couples côté–angle.")];

function messageCote(v: number, attendu: number, t: Triangle, rectangle: boolean): FragmentConsigne[] | null {
  if (proche(v, attendu, 0.01)) return null;
  const { radians, nonOpposes } = erreursCoteA(t);
  if (rectangle) {
    // Hypoténuse a, côté c opposé à C : a = c / sin C ; erreurs : sin/cos échangés, radians.
    if (proche(v, t.c / Math.sin(t.C))) return [texte(MESSAGE_RADIANS)];
    if (proche(v, t.c / Math.cos(t.C * RAD)) || proche(v, t.c * Math.sin(t.C * RAD))) return [texte("Revois le rapport : la hauteur est le côté opposé à l'angle d'élévation, et "), latex("\\sin\\hat{X} = \\dfrac{\\text{opposé}}{\\text{hypoténuse}}"), texte(".")];
    return null;
  }
  if (radians.some((x) => proche(v, x))) return [texte(MESSAGE_RADIANS)];
  if (nonOpposes.some((x) => proche(v, x))) return MESSAGE_NON_OPPOSE;
  return null;
}

export function messagePont(e: ExerciceTriangleLies, v: number): FragmentConsigne[] | null {
  return messageCote(v, e.trianglePont.a, e.trianglePont, configurationPont(e) === "rectangle");
}

export function messagePontSommetPartage(e: ExerciceTriangleLies, r: { angle: number; cote1: number; cote2: number }): FragmentConsigne[] | null {
  const t = e.trianglePont;
  if (!proche(r.angle, t.A, 0.01)) return [texte("Commence par l'angle au sommet commun : la somme des trois angles d'un triangle vaut 180°.")];
  // Côtés b et c par la loi des sinus depuis le côté connu a (en face de l'angle au sommet commun).
  const enRadians = (x: number) => (t.a * Math.sin(x)) / Math.sin(t.A);
  if (proche(r.cote1, enRadians(t.B)) || proche(r.cote2, enRadians(t.C))) return [texte(MESSAGE_RADIANS)];
  if (proche(r.cote1, t.c) && proche(r.cote2, t.b)) return [texte("Les deux côtés sont échangés : chaque côté est en face de son angle.")];
  return null;
}

// ---------------------------------------------------------------------------------------------
// Écran « angles » (anglePartage)
// ---------------------------------------------------------------------------------------------

export function aidesAngles(e: ExerciceTriangleLies): Niveaux {
  const [v1, v2] = e.anglesBrutsVisee ?? [];
  const n1: FragmentConsigne[] = [
    texte("Les deux visées sont prises depuis le même point O, vers deux cibles : l'angle utile du triangle cible est leur différence, "),
    latex("\\widehat{MOT} = \\theta_T - \\theta_M"),
    texte(", jamais une visée seule."),
  ];
  const n2: FragmentConsigne[] = v1 && v2 ? [texte("Les deux visées : "), latex(`\\theta_M = ${nombreLatex(v1.valeur)}^\\circ`), texte(" et "), latex(`\\theta_T = ${nombreLatex(v2.valeur)}^\\circ`), texte(" (différence pas encore calculée).")] : [];
  const n3: FragmentConsigne[] = [
    texte(`Hypothèse : ${e.hypotheseAnnexe ?? ""} Dans le triangle rectangle formé avec le sol, l'angle en M est aigu ; l'angle `),
    latex("\\widehat{OMT}"),
    texte(" du triangle cible est son supplémentaire (il est obtus)."),
  ];
  return [n1, n2, n3];
}

export function messageAngles(e: ExerciceTriangleLies, r: { angleUtile: number; angleHypothese: number }): FragmentConsigne[] | null {
  const [v1, v2] = e.anglesBrutsVisee ?? [];
  if (!v1 || !v2) return null;
  if (!proche(r.angleUtile, e.triangleCible.B, 0.01) && (proche(r.angleUtile, v1.valeur, 0.001) || proche(r.angleUtile, v2.valeur, 0.001))) {
    return [texte("L'angle utile n'est pas une visée brute : c'est la différence des deux angles d'élévation.")];
  }
  if (!proche(r.angleHypothese, e.triangleCible.C, 0.01) && proche(r.angleHypothese, 180 - e.triangleCible.C, 0.005)) {
    return [texte("L'angle en M du triangle cible est obtus : c'est le supplémentaire de l'angle aigu du triangle rectangle (90° + l'élévation de M).")];
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Écran « soustraction » (sommetPartage)
// ---------------------------------------------------------------------------------------------

export function aidesSoustraction(e: ExerciceTriangleLies): Niveaux {
  const [d1, d2] = e.distancesParcourues ?? [];
  const l = libellesSommetPartage(e);
  const u = uniteLongueurPont(e);
  const n1: FragmentConsigne[] = [texte("Chaque côté du triangle cible s'obtient en retranchant la distance déjà parcourue au côté du triangle pont qui part du sommet commun.")];
  const n2: FragmentConsigne[] =
    d1 && d2
      ? [
          latex(`${l.coteCible1} = ${l.cote1} - ${nombreLatex(d1.valeur)}\\text{ ${u}}`),
          texte(" et "),
          latex(`${l.coteCible2} = ${l.cote2} - ${nombreLatex(d2.valeur)}\\text{ ${u}}`),
          texte(`, avec les côtés du triangle pont trouvés à l'écran précédent (${formatValeurUnite(e.trianglePont.b, u)} et ${formatValeurUnite(e.trianglePont.c, u)}).`),
        ]
      : [];
  return [n1, n2];
}

export function messageSoustraction(e: ExerciceTriangleLies, r: { cote1: number; cote2: number }): FragmentConsigne[] | null {
  const [d1, d2] = e.distancesParcourues ?? [];
  if (!d1 || !d2) return null;
  if (proche(r.cote1, e.trianglePont.b + d1.valeur) || proche(r.cote2, e.trianglePont.c + d2.valeur)) return [texte("On retranche la distance déjà parcourue, on ne l'ajoute pas.")];
  if (proche(r.cote1, e.trianglePont.b - d2.valeur) || proche(r.cote2, e.trianglePont.c - d1.valeur)) return [texte("Chaque distance parcourue se retranche au côté sur lequel elle a été parcourue : vérifie les couples.")];
  return null;
}

// ---------------------------------------------------------------------------------------------
// Écran « cible »
// ---------------------------------------------------------------------------------------------

export function aidesCible(e: ExerciceTriangleLies): Niveaux {
  const n1: FragmentConsigne[] =
    e.grandeurDemandee === "aire"
      ? [texte("L'aire d'un triangle est la moitié du produit de deux côtés par le sinus de l'angle compris entre eux : "), latex("\\mathcal{A} = \\dfrac{1}{2} \\cdot p \\cdot q \\cdot \\sin\\hat{X}"), texte(". Repère d'abord les deux côtés et l'angle connus ou calculables.")]
      : [texte("Choisis la loi d'après les données du triangle cible : deux angles et un côté, loi des sinus "), latex(LOI_SINUS), texte(" ; deux côtés et l'angle compris, Al-Kashi "), latex(AL_KASHI), texte(".")];
  const u = uniteLongueurPont(e);
  const n2: FragmentConsigne[] =
    e.variante === "sommetPartage"
      ? (() => {
          const l = libellesSommetPartage(e);
          return [
            texte("Les deux côtés obtenus par soustraction valent "),
            latex(`${l.coteCible1} \\approx ${nombreLatex(e.triangleCible.b)}\\text{ ${u}}`),
            texte(" et "),
            latex(`${l.coteCible2} \\approx ${nombreLatex(e.triangleCible.c)}\\text{ ${u}}`),
            texte(", et l'angle au sommet commun reste celui du triangle pont, "),
            latex(`${nombreLatex(e.trianglePont.A)}^\\circ`),
            texte(" : réutilise ces valeurs (pas celles que tu avais proposées si elles étaient fausses)."),
          ];
        })()
      : [
          texte("Le côté transféré de l'écran précédent vaut "),
          latex(`${e.labelCoteTransfere} \\approx ${nombreLatex(e.trianglePont.a)}\\text{ ${u}}`),
          texte(" : réutilise cette valeur (pas celle que tu avais proposée si elle était fausse)."),
        ];
  const niveaux: Niveaux = [n1, n2];
  if (e.grandeurDemandee === "aire") niveaux.push([texte("Une fois les deux côtés autour de l'angle connu déterminés, remplace-les dans la formule de l'aire avec cet angle.")]);
  return niveaux;
}

/** Message ciblé de l'écran « cible » : radians, ½ oublié, côté non opposé (même décalage que la
 * réponse quand elle ajoute une longueur connue, ex. la hauteur de M). */
export function messageCible(e: ExerciceTriangleLies, v: number): FragmentConsigne[] | null {
  const attendu = e.valeurCibleAttendue;
  if (proche(v, attendu, 0.01)) return null;
  const t = e.triangleCible;
  if (e.grandeurDemandee === "aire") {
    const paires: [number, number, number][] = [
      [t.a, t.b, t.C],
      [t.b, t.c, t.A],
      [t.a, t.c, t.B],
    ];
    if (paires.some(([p, q, x]) => proche(v, 0.5 * p * q * Math.sin(x)))) return [texte(MESSAGE_RADIANS)];
    if (paires.some(([p, q, x]) => proche(v, p * q * Math.sin(x * RAD)))) return [texte("N'oublie pas le facteur "), latex("\\dfrac{1}{2}"), texte(" de la formule de l'aire.")];
    return null;
  }
  if (e.grandeurDemandee === "angle") {
    if (proche(v, attendu * RAD, 0.02)) return [texte(MESSAGE_RADIANS)];
    if (proche(v, 180 - attendu, 0.005)) return [texte("Vérifie si l'angle est aigu ou obtus : la touche "), latex("\\sin^{-1}"), texte(" ne donne que l'angle aigu.")];
    return null;
  }
  // Côté : la réponse vaut un côté du triangle cible + un décalage connu (0, ou une hauteur).
  for (const [cote, rot] of [
    [t.a, (x: Triangle) => x],
    [t.b, (x: Triangle): Triangle => ({ a: x.b, A: x.B, b: x.c, B: x.C, c: x.a, C: x.A })],
    [t.c, (x: Triangle): Triangle => ({ a: x.c, A: x.C, b: x.a, B: x.A, c: x.b, C: x.B })],
  ] as [number, (x: Triangle) => Triangle][]) {
    const decalage = attendu - cote;
    if (Math.abs(decalage) > Math.abs(attendu)) continue;
    const { radians, nonOpposes } = erreursCoteA(rot(t));
    if (radians.some((x) => proche(v, x + decalage))) return [texte(MESSAGE_RADIANS)];
    if (nonOpposes.some((x) => proche(v, x + decalage))) return MESSAGE_NON_OPPOSE;
    if (Math.abs(decalage) > 0.01 && proche(v, cote)) return [texte("C'est un côté du triangle cible : relis la question, la grandeur demandée lui ajoute une longueur connue.")];
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Écran « interprétation » (choix fermé)
// ---------------------------------------------------------------------------------------------

export function aidesInterpretation(): Niveaux {
  return [
    [texte("Relis la grandeur réellement demandée par l'énoncé et son unité.")],
    [texte("Une longueur s'exprime en m ou en km, une aire en m² ou en km², un angle en degrés. Écarte aussi une valeur intermédiaire (le côté transféré, une donnée) : la bonne proposition est le résultat de l'écran précédent.")],
  ];
}
