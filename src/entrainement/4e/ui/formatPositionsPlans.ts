import type { Point3D } from "../core/geometrieEspace.types";
import type { CandidatPointCommun, ExerciceDeuxPlans, ExercicePositionsPlans, ExerciceTroisPlans, IssueTroisPlans, PositionDeuxPlans } from "../core/positionsPlans.types";
import {
  additionner3D,
  distance3D,
  EPSILON_3D,
  multiplierScalaire3D,
  normalePlan,
  pointAppartientAuPlan,
  produitScalaire3D,
  produitVectoriel3D,
  sontParalleles3D,
  soustraire3D,
} from "../moteur/geometrieEspace";
import { COULEUR_CONSTRUCTION, COULEUR_DROITE, NOMS_COULEURS_PLANS, pointsPlan, positionNommee, sectionSolide, type DonneesFigurePlans, type OptionsFigure, type PointFigure } from "./figurePositionsPlans";

/**
 * Textes de gen101 (« Positions de deux plans et de trois plans ») : énoncé, consignes, options,
 * aides, explications, réponses attendues et éléments de la figure finale. UNE seule source pour
 * l'écran interactif et l'adaptateur papier (`generateurs/positionsPlans/exportEvaluation.ts`).
 *
 * Aides : jamais la réponse ; elles rappellent la méthode du cours (sections 5, 6 et 8 du chapitre).
 * Vocabulaire du cours : plan (ABC), droite (AB), « sécants suivant une droite », « parallèles »,
 * « confondus », point commun, « se coupent suivant ».
 */

// --- Énoncé ------------------------------------------------------------------------------------

const DESCRIPTIONS_SOLIDES: Record<string, string> = {
  cube: "le cube ABCDEFGH",
  parallelepipede: "le parallélépipède rectangle ABCDEFGH",
  prisme: "le prisme droit ABCDEF (bases ABC et DEF)",
  tetraedre: "le tétraèdre ABCD",
  pyramideCarree: "la pyramide SABCD (base carrée ABCD, sommet S)",
};

export function descriptionSolide(e: DonneesFigurePlans): string {
  return DESCRIPTIONS_SOLIDES[e.solide.id] ?? e.solide.label;
}

export function nomPlan(e: DonneesFigurePlans, i: number): string {
  return `(${e.plans[i]!.join("")})`;
}

export function phraseMilieux(e: DonneesFigurePlans): string {
  const m = e.milieux;
  if (m.length === 0) return "";
  const def = (i: number) => `[${m[i]!.milieuDe.join("")}]`;
  if (m.length === 1) return `${m[0]!.nom} est le milieu de ${def(0)}.`;
  if (m.length === 2) return `${m[0]!.nom} est le milieu de ${def(0)} et ${m[1]!.nom} celui de ${def(1)}.`;
  return `${m[0]!.nom} est le milieu de ${def(0)}, ${m[1]!.nom} celui de ${def(1)} et ${m[2]!.nom} celui de ${def(2)}.`;
}

function listeEt(elements: string[]): string {
  if (elements.length <= 1) return elements.join("");
  return `${elements.slice(0, -1).join(", ")} et ${elements[elements.length - 1]}`;
}

/** « On considère les plans (ABC) et (EFI), représentés par les triangles ABC (violet) et EFI (vert). » */
export function phrasePlans(e: ExercicePositionsPlans): string {
  const noms = e.plans.map((_, i) => nomPlan(e, i));
  const triangles = e.plans.map((p, i) => `${p.join("")} (${NOMS_COULEURS_PLANS[i]})`);
  return `On considère les plans ${listeEt(noms)}, représentés sur la figure par les triangles ${listeEt(triangles)}.`;
}

/** Énoncé (sans la question) : solide, milieux, plans. */
export function enonce(e: ExercicePositionsPlans): string {
  const solide = descriptionSolide(e);
  const milieux = phraseMilieux(e);
  return `Voici ${solide}.${milieux ? ` ${milieux}` : ""} ${phrasePlans(e)}`;
}

/** Consigne globale (écran et papier). */
export function consigneGlobale(e: ExercicePositionsPlans): string {
  if (e.variante === "deux-plans") {
    return `Détermine la position relative des plans ${nomPlan(e, 0)} et ${nomPlan(e, 1)} et justifie ta réponse. S'ils sont sécants, construis leur droite d'intersection.`;
  }
  return `Les plans ${nomPlan(e, 0)}, ${nomPlan(e, 1)} et ${nomPlan(e, 2)} ont-ils un seul point commun, une droite commune ou aucun point commun ? Justifie ta réponse.`;
}

// --- Écrans ------------------------------------------------------------------------------------

export const LIBELLES_POSITION: Record<PositionDeuxPlans, string> = {
  paralleles: "Parallèles : ils n'ont aucun point commun.",
  confondus: "Confondus : c'est le même plan, sous deux noms différents.",
  secants: "Sécants : ils se coupent suivant une droite.",
};

export const LIBELLES_ISSUE: Record<IssueTroisPlans, string> = {
  point: "Un seul point commun.",
  droite: "Une droite commune.",
  aucun: "Aucun point commun.",
};

export const ORDRE_POSITIONS: PositionDeuxPlans[] = ["paralleles", "confondus", "secants"];
export const ORDRE_ISSUES: IssueTroisPlans[] = ["point", "droite", "aucun"];

export interface EcranChoix {
  genre: "choix";
  titre: string;
  consigne: string;
  options: { id: string; texte: string }[];
  attendue: string;
  aides: string[];
}

export interface EcranPoints {
  genre: "points";
  titre: string;
  consigne: string;
  aides: string[];
}

export type EcranPositionsPlans = EcranChoix | EcranPoints;

const AIDES_POSITION_DEUX = [
  "Commence par regarder si les trois points qui nomment le second plan appartiennent aussi au premier : si c'est le cas, les deux noms désignent le même plan.",
  "Sinon, cherche un point commun aux deux plans : un point nommé qui appartient aux deux, ou le point de rencontre d'une droite de chaque plan tracées dans une même face. S'il en existe un, les plans sont sécants. S'il n'y en a aucun, vérifie le critère de parallélisme : deux droites sécantes du premier plan parallèles à deux droites du second.",
];

const AIDES_ISSUE = [
  "Méthode : prends deux des trois plans. S'ils sont parallèles, les trois plans n'ont aucun point commun. Sinon, cherche leur droite d'intersection d (deux points communs suffisent).",
  "Étudie ensuite la position de d par rapport au troisième plan. Si d le perce, il y a un seul point commun ; si d y est incluse, une droite commune ; si d lui est parallèle sans y être incluse, aucun point commun.",
];

const AIDES_JUSTIFICATION_DEUX = [
  "Vérifie chaque affirmation sur la figure, puis demande-toi si elle suffit vraiment : une impression sur le dessin ne prouve jamais rien.",
  "Deux plans parallèles : il faut deux droites SÉCANTES de l'un, parallèles à deux droites de l'autre. Deux plans confondus : il faut trois points communs non alignés.",
];

const AIDES_JUSTIFICATION_TROIS = [
  "Pour chaque affirmation, vérifie d'abord que la droite citée appartient VRAIMENT aux deux plans : il faut que deux de ses points soient dans chacun d'eux.",
  "Vérifie ensuite sa position par rapport au troisième plan : incluse si deux de ses points y sont, parallèle si elle est parallèle à une droite de ce plan sans y être incluse, sinon elle le perce.",
];

const AIDES_POINTS = [
  "Un point commun appartient à la fois aux deux plans. Pour en construire un, prends une droite du premier plan et une droite du second qui sont dans une même face du solide : elles se coupent, parfois sur leurs prolongements.",
  "Attention : deux droites qui se croisent sur le dessin sans être dans une même face peuvent être gauches. Elles n'ont alors aucun point commun : leur « intersection » n'existe pas.",
];

export function ecransExercice(e: ExercicePositionsPlans): EcranPositionsPlans[] {
  if (e.variante === "deux-plans") {
    const premier: EcranChoix = {
      genre: "choix",
      titre: "Position des deux plans",
      consigne: `Quelle est la position relative des plans ${nomPlan(e, 0)} et ${nomPlan(e, 1)} ?`,
      options: ORDRE_POSITIONS.map((id) => ({ id, texte: LIBELLES_POSITION[id] })),
      attendue: e.position,
      aides: AIDES_POSITION_DEUX,
    };
    if (e.position === "secants") {
      return [
        premier,
        {
          genre: "points",
          titre: "Deux points communs",
          consigne: `Les plans ${nomPlan(e, 0)} et ${nomPlan(e, 1)} sont sécants. Désigne deux points distincts communs à ces deux plans : un point nommé, ou le point de rencontre de deux droites. Leur droite d'intersection passera par ces deux points.`,
          aides: AIDES_POINTS,
        },
      ];
    }
    return [
      premier,
      {
        genre: "choix",
        titre: "Justification",
        consigne: `Les plans ${nomPlan(e, 0)} et ${nomPlan(e, 1)} sont ${e.position === "paralleles" ? "parallèles" : "confondus"}. Quelle affirmation le justifie ?`,
        options: e.justifications.map((j, i) => ({ id: String(i), texte: j.texte })),
        attendue: String(e.justifications.findIndex((j) => j.valide)),
        aides: AIDES_JUSTIFICATION_DEUX,
      },
    ];
  }
  return [
    {
      genre: "choix",
      titre: "Points communs aux trois plans",
      consigne: `Combien de points communs ont les plans ${nomPlan(e, 0)}, ${nomPlan(e, 1)} et ${nomPlan(e, 2)} ?`,
      options: ORDRE_ISSUES.map((id) => ({ id, texte: LIBELLES_ISSUE[id] })),
      attendue: e.issue,
      aides: AIDES_ISSUE,
    },
    {
      genre: "choix",
      titre: "Justification",
      consigne: "Quelle affirmation justifie cette réponse ?",
      options: e.justifications.map((j, i) => ({ id: String(i), texte: j.texte })),
      attendue: String(e.justifications.findIndex((j) => j.valide)),
      aides: AIDES_JUSTIFICATION_TROIS,
    },
  ];
}

// --- Géométrie de présentation -----------------------------------------------------------------

function dansPlan(e: ExercicePositionsPlans, p: Point3D, i: number): boolean {
  return pointAppartientAuPlan(p, pointsPlan(e, i));
}

function droiteDansPlan(e: ExercicePositionsPlans, a: Point3D, b: Point3D, i: number): boolean {
  return dansPlan(e, a, i) && dansPlan(e, b, i);
}

/** Droite d'intersection des plans i et j (deux points), `null` s'ils sont parallèles ou confondus. */
export function droiteIntersection(e: ExercicePositionsPlans, i: number, j: number): [Point3D, Point3D] | null {
  const p = pointsPlan(e, i);
  const q = pointsPlan(e, j);
  const n1 = normalePlan(...p);
  const n2 = normalePlan(...q);
  const u = produitVectoriel3D(n1, n2);
  if (produitScalaire3D(u, u) < EPSILON_3D) return null;
  const d1 = produitScalaire3D(n1, p[0]);
  const d2 = produitScalaire3D(n2, q[0]);
  const x0 = multiplierScalaire3D(additionner3D(multiplierScalaire3D(produitVectoriel3D(n2, u), d1), multiplierScalaire3D(produitVectoriel3D(u, n1), d2)), 1 / produitScalaire3D(u, u));
  return [x0, additionner3D(x0, u)];
}

/** Point nommé (sommet ou milieu) situé exactement en `p`, ou `null`. */
export function nomDuPoint(e: DonneesFigurePlans, p: Point3D): string | null {
  for (const [nom, q] of Object.entries(e.solide.sommets)) if (distance3D(p, q) < EPSILON_3D) return nom;
  for (const m of e.milieux) if (distance3D(p, m.position) < EPSILON_3D) return m.nom;
  return null;
}

function nomsSurDroite(e: ExercicePositionsPlans, a: Point3D, b: Point3D): string[] {
  const dir = soustraire3D(b, a);
  const sur = (p: Point3D) => distance3D(p, a) < EPSILON_3D || sontParalleles3D(dir, soustraire3D(p, a));
  return [...Object.entries(e.solide.sommets).filter(([, p]) => sur(p)).map(([n]) => n), ...e.milieux.filter((m) => sur(m.position)).map((m) => m.nom)];
}

/** « (AB) » si la droite porte deux points nommés, sinon `null`. */
export function libelleDroiteGeo(e: ExercicePositionsPlans, a: Point3D, b: Point3D): string | null {
  const noms = nomsSurDroite(e, a, b);
  return noms.length >= 2 ? `(${noms[0]}${noms[1]})` : null;
}

// --- Écran « deux points communs » ---------------------------------------------------------------

export function estCommun(e: ExerciceDeuxPlans, c: CandidatPointCommun): boolean {
  return c.position !== null && dansPlan(e, c.position, 0) && dansPlan(e, c.position, 1);
}

/** Paire juste ? Deux candidats distincts, tous deux communs aux deux plans (positions distinctes). */
export function paireCorrecte(e: ExerciceDeuxPlans, a: number, b: number): boolean {
  const ca = e.candidats[a];
  const cb = e.candidats[b];
  if (!ca || !cb || a === b || !estCommun(e, ca) || !estCommun(e, cb)) return false;
  return distance3D(ca.position!, cb.position!) > EPSILON_3D;
}

/** Pourquoi un candidat est (ou n'est pas) un point commun — phrase du corrigé et de l'explication. */
export function raisonCandidat(e: ExerciceDeuxPlans, c: CandidatPointCommun): string {
  const P = nomPlan(e, 0);
  const Q = nomPlan(e, 1);
  if (!c.construction) {
    const dansP = dansPlan(e, c.position!, 0);
    const dansQ = dansPlan(e, c.position!, 1);
    if (dansP && dansQ) return `${c.libelle} appartient à la fois au plan ${P} et au plan ${Q}.`;
    if (!dansP && !dansQ) return `${c.libelle} n'appartient ni au plan ${P} ni au plan ${Q}.`;
    return `${c.libelle} n'appartient pas au plan ${dansP ? Q : P}.`;
  }
  const d1 = `(${c.construction.droite1.join("")})`;
  const d2 = `(${c.construction.droite2.join("")})`;
  if (!c.position) return `${d1} et ${d2} se croisent sur le dessin, mais elles sont gauches (aucun plan ne les contient toutes les deux) : elles n'ont aucun point commun.`;
  const a1 = positionNommee(e, c.construction.droite1[0]);
  const b1 = positionNommee(e, c.construction.droite1[1]);
  const a2 = positionNommee(e, c.construction.droite2[0]);
  const b2 = positionNommee(e, c.construction.droite2[1]);
  const face = faceContenant(e, [a1, b1, a2, b2]);
  const ouFace = face ? `, toutes deux dans la face ${face}` : "";
  if (estCommun(e, c)) {
    const p1 = droiteDansPlan(e, a1, b1, 0) ? P : Q;
    const p2 = p1 === P ? Q : P;
    return `${d1} est dans le plan ${p1} et ${d2} dans le plan ${p2}${ouFace} : leur point de rencontre est commun aux deux plans.`;
  }
  const horsP = !dansPlan(e, c.position, 0);
  const fautive = horsP ? P : Q;
  const laquelle = droiteDansPlan(e, a1, b1, horsP ? 0 : 1) ? d2 : d1;
  return `${laquelle} n'est pas dans le plan ${fautive} : le point de rencontre de ${d1} et ${d2} n'appartient pas à ce plan.`;
}

/** Nom (ABCD…) de la face du solide qui contient tous ces points, ou `null`. */
function faceContenant(e: ExercicePositionsPlans, points: Point3D[]): string | null {
  for (const face of e.solide.faces) {
    const plan = [e.solide.sommets[face[0]!]!, e.solide.sommets[face[1]!]!, e.solide.sommets[face[2]!]!] as [Point3D, Point3D, Point3D];
    if (points.every((p) => pointAppartientAuPlan(p, plan))) return face.join("");
  }
  return null;
}

const NOMS_CONSTRUITS = ["M", "N"];

/** Points de la paire retenue, avec un nom (M, N) pour les points construits. */
export function pointsDeLaPaire(e: ExerciceDeuxPlans, paire: [number, number]): { candidat: CandidatPointCommun; nom: string }[] {
  let k = 0;
  return paire.map((i) => {
    const c = e.candidats[i]!;
    return { candidat: c, nom: c.construction ? NOMS_CONSTRUITS[k++]! : c.libelle };
  });
}

/** Libellé court d'un choix (« A et (FK) ∩ (BC) »). */
export function libellePaire(e: ExerciceDeuxPlans, paire: [number, number]): string {
  return `${e.candidats[paire[0]]!.libelle} et ${e.candidats[paire[1]]!.libelle}`;
}

/** Droite d'intersection nommée par la paire (« (AM) »). */
export function droitePaire(e: ExerciceDeuxPlans, paire: [number, number]): string {
  const noms = pointsDeLaPaire(e, paire).map((p) => p.nom);
  const rang = (n: string) => (e.solide.sommets[n] ? 0 : 1);
  noms.sort((x, y) => rang(x) - rang(y) || x.localeCompare(y));
  return `(${noms[0]}${noms[1]})`;
}

// --- Réponses et explications --------------------------------------------------------------------

export function reponseEcran(e: ExercicePositionsPlans, ecran: number): string {
  if (e.variante === "deux-plans") {
    if (ecran === 0) return LIBELLES_POSITION[e.position];
    if (e.position === "secants") {
      const paire = e.paireAttendue!;
      return `Par exemple ${libellePaire(e, paire)} : la droite d'intersection est ${droitePaire(e, paire)}.`;
    }
  } else if (ecran === 0) {
    return LIBELLES_ISSUE[e.issue];
  }
  return e.justifications.find((j) => j.valide)!.texte;
}

export function explicationEcran1(e: ExercicePositionsPlans): string {
  if (e.variante === "deux-plans") {
    if (e.position === "secants") return "Les deux plans sont distincts et ne sont pas parallèles : ils sont sécants, suivant une droite. Il reste à trouver deux points de cette droite.";
    if (e.position === "paralleles") return "Les deux plans n'ont aucun point commun : ils sont parallèles. Il reste à le justifier.";
    return "Les deux noms désignent le même plan : les plans sont confondus. Il reste à le justifier.";
  }
  if (e.issue === "point") return "Les trois plans ont un seul point commun. Il reste à le justifier.";
  if (e.issue === "droite") return "Les trois plans ont une droite commune, comme les pages d'un livre ouvert autour de la reliure. Il reste à le justifier.";
  return "Les trois plans n'ont aucun point commun. Il reste à le justifier.";
}

/** Conclusion des trois plans (explication de l'écran 2 et corrigé). */
export function conclusionTroisPlans(e: ExerciceTroisPlans): string {
  if (e.issue === "aucun" && e.sousCas === "paralleles") return "Deux des plans sont parallèles : ils n'ont aucun point commun, donc les trois plans non plus.";
  if (e.issue === "aucun") return "Les trois plans sont sécants deux à deux suivant trois droites parallèles, comme les faces d'une barre de Toblerone : aucun point n'est commun aux trois.";
  if (e.issue === "droite") {
    const d = droiteIntersection(e, 0, 1)!;
    return `La droite ${libelleDroiteGeo(e, d[0], d[1]) ?? "d'intersection"} est commune aux trois plans.`;
  }
  const p = pointCommunTrois(e);
  const nom = p ? nomDuPoint(e, p) : null;
  return nom ? `Le seul point commun aux trois plans est ${nom}.` : "Les trois plans ont un seul point commun : le point où la droite d'intersection de deux d'entre eux perce le troisième.";
}

export function pointCommunTrois(e: ExerciceTroisPlans): Point3D | null {
  const d = droiteIntersection(e, 0, 1);
  if (!d) return null;
  const plan = pointsPlan(e, 2);
  const n = normalePlan(...plan);
  const dir = soustraire3D(d[1], d[0]);
  const den = produitScalaire3D(n, dir);
  if (Math.abs(den) < EPSILON_3D) return null;
  const t = produitScalaire3D(n, soustraire3D(plan[0], d[0])) / den;
  return additionner3D(d[0], multiplierScalaire3D(dir, t));
}

// --- Figure finale (écran clos, corrigé) --------------------------------------------------------

/** Éléments ajoutés à la figure une fois l'exercice résolu : sections complètes des plans, droite(s)
 * d'intersection, points construits. `paire` : la paire confirmée (sécants). */
export function elementsFigureFinale(e: ExercicePositionsPlans, paire: [number, number] | null): Omit<OptionsFigure, "mode"> {
  if (e.variante === "deux-plans") {
    if (e.position !== "secants") return { sections: true };
    const p = pointsDeLaPaire(e, paire ?? e.paireAttendue!);
    const segments = p.flatMap(({ candidat }) => {
      if (!candidat.construction) return [];
      return [candidat.construction.droite1, candidat.construction.droite2].flatMap((dr) => {
        const a = positionNommee(e, dr[0]);
        const b = positionNommee(e, dr[1]);
        // Prolongement jusqu'au point construit : segment de l'extrémité la plus proche au point.
        const x = candidat.position!;
        const proche = distance3D(a, x) < distance3D(b, x) ? a : b;
        return [{ a: proche, b: x, couleur: COULEUR_CONSTRUCTION }];
      });
    });
    const points: PointFigure[] = p.map(({ candidat, nom }) => ({ position: candidat.position!, label: candidat.construction ? nom : "", couleur: candidat.construction ? COULEUR_CONSTRUCTION : COULEUR_DROITE }));
    return { sections: true, droites: [{ a: p[0]!.candidat.position!, b: p[1]!.candidat.position!, couleur: COULEUR_DROITE }], segments, points };
  }
  if (e.issue === "aucun" && e.sousCas === "paralleles") return { sections: true };
  if (e.issue === "aucun") {
    const droites = [
      [0, 1],
      [0, 2],
      [1, 2],
    ]
      .map(([i, j]) => droiteIntersection(e, i!, j!))
      .filter((d): d is [Point3D, Point3D] => d !== null)
      .map((d) => ({ a: d[0], b: d[1], couleur: COULEUR_DROITE }));
    return { sections: true, droites };
  }
  const d = droiteIntersection(e, 0, 1)!;
  if (e.issue === "droite") return { sections: true, droites: [{ a: d[0], b: d[1], couleur: COULEUR_DROITE }] };
  // Un seul point commun : les trois droites d'intersection deux à deux, concourantes en ce point.
  const pt = pointCommunTrois(e);
  const points: PointFigure[] = pt && pointRaisonnable(e, pt) ? [{ position: pt, label: nomDuPoint(e, pt) ? "" : "M", couleur: COULEUR_DROITE }] : [];
  const droites = [
    [0, 1],
    [0, 2],
    [1, 2],
  ]
    .map(([i, j]) => droiteIntersection(e, i!, j!)!)
    .map((x) => ({ a: x[0], b: x[1], couleur: COULEUR_DROITE }));
  return { sections: true, droites, points };
}

/** Un point assez proche du solide pour être dessiné sans trop réduire la figure. */
function pointRaisonnable(e: ExercicePositionsPlans, p: Point3D): boolean {
  const s = Object.values(e.solide.sommets);
  const axes = ["x", "y", "z"] as const;
  return axes.every((ax) => {
    const min = Math.min(...s.map((q) => q[ax]));
    const max = Math.max(...s.map((q) => q[ax]));
    const marge = 0.35 * (max - min || 1);
    return p[ax] >= min - marge && p[ax] <= max + marge;
  });
}

/** Description du plan i par ses sommets (« la face ABFE », « le plan diagonal ACGE »), ou `null`
 * s'il passe par moins de trois sommets. */
export function descriptionPlan(e: DonneesFigurePlans, i: number): string | null {
  const plan = pointsPlan(e, i);
  const section = sectionSolide(e.solide, plan);
  const noms = section.map((p) => nomDuPoint(e, p));
  const sommets = noms.filter((n): n is string => n !== null && e.solide.sommets[n] !== undefined);
  if (sommets.length < 3 || sommets.length !== section.length) return null;
  // Nom cyclique usuel : commence par la plus petite lettre, dans le sens où la suivante est la plus
  // petite (ABGH plutôt que BAHG).
  const debut = sommets.indexOf([...sommets].sort()[0]!);
  const tourne = [...sommets.slice(debut), ...sommets.slice(0, debut)];
  const inverse = [tourne[0]!, ...tourne.slice(1).reverse()];
  const nom = (tourne[1]! < inverse[1]! ? tourne : inverse).join("");
  const estFace = e.solide.faces.some((face) => face.length === sommets.length && face.every((s) => sommets.includes(s)));
  return estFace ? `la face ${nom}` : `le plan ${nom}`;
}

/** Le point nommé `nom` appartient-il au plan i ? */
export function pointNommeDansPlan(e: DonneesFigurePlans, nom: string, i: number): boolean {
  return pointAppartientAuPlan(positionNommee(e, nom), pointsPlan(e, i));
}

/** « Deux triangles… » → « deux triangles… » (après « ne convient pas : »). */
export function minusculeInitiale(t: string): string {
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/** Légende de la figure finale (écran clos, corrigé). */
export function legendeFigureFinale(e: ExercicePositionsPlans): string {
  const sections = "en pointillés, la section complète de chaque plan dans le solide.";
  const seules = "En pointillés : la section complète de chaque plan dans le solide.";
  if (e.variante === "deux-plans") return e.position === "secants" ? `En rouge, la droite d'intersection des deux plans ; ${sections}` : seules;
  if (e.issue === "aucun" && e.sousCas === "paralleles") return seules;
  if (e.issue === "aucun") return `En rouge, les trois droites d'intersection, parallèles ; ${sections}`;
  if (e.issue === "droite") return `En rouge, la droite commune aux trois plans ; ${sections}`;
  return `En rouge, les droites d'intersection des plans deux à deux : elles passent toutes par le point commun ; ${sections}`;
}
