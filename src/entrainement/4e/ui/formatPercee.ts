import type { Point3D } from "../core/geometrieEspace.types";
import type { CandidatPointCommun } from "../core/positionsPlans.types";
import type { CandidatPercee, ExercicePercee, OptionPlanAuxiliaire, SuitePlanAuxiliaire } from "../core/perceePlanAuxiliaire.types";
import { additionner3D, distance3D, EPSILON_3D, multiplierScalaire3D, normalePlan, pointAppartientAuPlan, produitScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import {
  cadreFigure,
  COULEUR_CONSTRUCTION,
  COULEUR_DROITE,
  pixelAnneau,
  pointsDuPlan,
  positionNommee,
  type AnneauFigure,
  type OptionsFigurePercee,
  type PointFigurePercee,
  type SegmentFigurePercee,
} from "./figurePercee";

/**
 * Textes de gen102 (« Point de percée par plan auxiliaire ») : énoncé, consignes, options, aides,
 * explications, réponses attendues et éléments des figures. UNE seule source pour l'écran interactif
 * et l'adaptateur papier (`generateurs/perceePlanAuxiliaire/exportEvaluation.ts`).
 *
 * Vocabulaire et notations du cours (section 8 du chapitre) : point de percée, plan auxiliaire π qui
 * contient d, droite b commune à π et α, plan (ABC), droite (AB), « se coupent », « gauches ».
 * Aides : jamais la réponse ; elles rappellent la méthode.
 */

// --- Énoncé ------------------------------------------------------------------------------------

const DESCRIPTIONS_SOLIDES: Record<string, string> = {
  cube: "le cube ABCDEFGH",
  parallelepipede: "le parallélépipède rectangle ABCDEFGH",
  prisme: "le prisme droit ABCDEF (bases ABC et DEF)",
  tetraedre: "le tétraèdre ABCD",
};

export function descriptionSolide(e: ExercicePercee): string {
  return DESCRIPTIONS_SOLIDES[e.solide.id] ?? e.solide.label;
}

export function nomPlan(noms: readonly string[]): string {
  return `(${noms.join("")})`;
}

export function nomDroite(e: ExercicePercee): string {
  return `(${e.droite.join("")})`;
}

function definitionPoint(e: ExercicePercee, i: number): string {
  const p = e.points[i]!;
  const d = p.definition;
  if (d.type === "milieu") return `${p.nom} est le milieu de [${d.arete.join("")}]`;
  if (d.type === "tiers") return `${p.nom} est le point de [${d.depuis}${d.vers}] tel que ${d.depuis}${p.nom} soit le tiers de ${d.depuis}${d.vers}`;
  return `${p.nom} est le centre de la face ${d.face}`;
}

export function phrasePoints(e: ExercicePercee): string {
  const defs = e.points.map((_, i) => definitionPoint(e, i));
  if (defs.length === 0) return "";
  if (defs.length === 1) return `${defs[0]}.`;
  return `${defs.slice(0, -1).join(", ")} et ${defs[defs.length - 1]}.`;
}

/** Énoncé (sans la question). */
export function enonce(e: ExercicePercee): string {
  const points = phrasePoints(e);
  return `Voici ${descriptionSolide(e)}.${points ? ` ${points}` : ""} La droite d = ${nomDroite(e)}, en orange, perce le plan α = ${nomPlan(e.plan)}, représenté par le triangle ${e.plan.join("")} en violet.`;
}

export function consigneGlobale(e: ExercicePercee): string {
  return `Construis le point de percée P de la droite d = ${nomDroite(e)} dans le plan α = ${nomPlan(e.plan)} à l'aide d'un plan auxiliaire, et justifie chaque étape de ta construction.`;
}

// --- Écrans ------------------------------------------------------------------------------------

export const TITRES_ECRANS = ["Plan auxiliaire", "Droite commune b", "Point de percée"];

export const AIDES_PLAN = [
  "Le plan auxiliaire doit contenir toute la droite d : il suffit qu'il contienne deux de ses points. Vérifie, pour chaque plan proposé, que les deux points qui nomment d lui appartiennent.",
  "Touche un plan : son triangle s'affiche en vert sur la figure. Un point est dans ce plan s'il est sur une droite qui joint deux points du plan — par exemple sur une arête ou une diagonale d'une face qui contient le triangle.",
];

export const AIDES_POINTS = [
  "Un point commun aux deux plans peut être un point nommé qui appartient à π et à α. Sinon, construis-en un : une droite de π et une droite de α tracées dans une même face du solide se coupent, parfois sur leurs prolongements.",
  "Attention : deux droites qui se croisent sur le dessin sans être dans une même face peuvent être gauches. Elles n'ont alors aucun point commun.",
];

export const AIDES_PERCEE = [
  "P est sur d, donc dans le plan π qui contient d. P est aussi dans α. Il est donc sur la droite b, commune à π et α.",
  "d et b sont deux droites du plan π : elles se coupent vraiment. Prolonge le segment rouge jusqu'à ce qu'il rencontre d.",
];

export function consigneEcran(e: ExercicePercee, ecran: number, option: OptionPlanAuxiliaire | null): string {
  if (ecran === 0) return `Choisis un plan auxiliaire π qui contient la droite d = ${nomDroite(e)}.`;
  const pi = option ? nomPlan(option.nom) : "π";
  if (ecran === 1) return `Les plans π = ${pi} et α = ${nomPlan(e.plan)} se coupent suivant une droite b. Désigne deux points distincts communs à π et à α : touche un point nommé sur la figure, ou choisis un point de rencontre de deux droites.`;
  return "La droite b passe par les deux points rouges. Désigne le point de percée P de d dans α : touche-le sur la figure ou choisis son numéro.";
}

export function texteOption(o: OptionPlanAuxiliaire): string {
  return `le plan ${nomPlan(o.nom)}`;
}

// --- Écran 1 -----------------------------------------------------------------------------------

/** Option dont la suite sert aux écrans 2 et 3 : celle de l'élève si elle en a une (bon plan dont la
 * droite commune avec α se construit sur la figure), sinon l'option de référence. */
export function optionSuivie(e: ExercicePercee, choix: number | null): number {
  if (choix !== null && e.options[choix]?.suite) return choix;
  return e.reference;
}

export function explicationPlan(e: ExercicePercee, choix: number): string[] {
  const o = e.options[choix]!;
  const ref = e.options[e.reference]!;
  const [a, b] = e.droite;
  if (o.contientDroite) {
    const lignes = [`Le plan ${nomPlan(o.nom)} contient ${a} et ${b}, donc toute la droite d. Il coupe α, puisqu'il contient le point où d perce α : c'est un bon plan auxiliaire.`];
    if (!o.suite) lignes.push(`Pour la suite, on travaille avec le plan ${nomPlan(ref.nom)}, qui convient aussi : sa droite commune avec α se construit avec les points de la figure.`);
    const autres = e.options.filter((x, i) => x.contientDroite && i !== choix);
    if (autres.length > 0 && o.suite) lignes.push(`Le plan ${nomPlan(autres[0]!.nom)} convenait aussi.`);
    return lignes;
  }
  const lignes = [`${o.pointManquant} n'appartient pas au plan ${nomPlan(o.nom)} : ce plan ne contient pas la droite d.`];
  const bons = e.options.filter((x) => x.contientDroite).map((x) => nomPlan(x.nom));
  lignes.push(bons.length > 1 ? `Les plans ${bons.join(" et ")} contiennent ${a} et ${b}, donc d : ils conviennent. On travaille avec ${nomPlan(ref.nom)}.` : `Le plan ${bons[0]} contient ${a} et ${b}, donc d : c'est lui qui convient.`);
  return lignes;
}

// --- Écran 2 -----------------------------------------------------------------------------------

function dansPlan(e: ExercicePercee, p: Point3D, noms: readonly string[]): boolean {
  return pointAppartientAuPlan(p, pointsDuPlan(e, noms));
}

export function estCommun(e: ExercicePercee, o: OptionPlanAuxiliaire, c: CandidatPointCommun): boolean {
  return c.position !== null && dansPlan(e, c.position, o.nom) && dansPlan(e, c.position, e.plan);
}

export function paireCorrecte(e: ExercicePercee, o: OptionPlanAuxiliaire, a: number, b: number): boolean {
  const s = o.suite!;
  const ca = s.candidats[a];
  const cb = s.candidats[b];
  if (!ca || !cb || a === b || !estCommun(e, o, ca) || !estCommun(e, o, cb)) return false;
  return distance3D(ca.position!, cb.position!) > EPSILON_3D;
}

function faceContenant(e: ExercicePercee, points: Point3D[]): string | null {
  for (const face of e.solide.faces) {
    const plan = [e.solide.sommets[face[0]!]!, e.solide.sommets[face[1]!]!, e.solide.sommets[face[2]!]!] as [Point3D, Point3D, Point3D];
    if (points.every((p) => pointAppartientAuPlan(p, plan))) return face.join("");
  }
  return null;
}

/** Pourquoi un candidat est (ou n'est pas) un point commun à π et α. */
export function raisonCandidat(e: ExercicePercee, o: OptionPlanAuxiliaire, c: CandidatPointCommun): string {
  const P = nomPlan(o.nom);
  const A = nomPlan(e.plan);
  if (!c.construction) {
    const dansP = dansPlan(e, c.position!, o.nom);
    const dansA = dansPlan(e, c.position!, e.plan);
    if (dansP && dansA) return `${c.libelle} appartient à la fois au plan π = ${P} et au plan α = ${A}.`;
    if (!dansP && !dansA) return `${c.libelle} n'appartient ni à π ni à α.`;
    return `${c.libelle} n'appartient pas au plan ${dansP ? `α = ${A}` : `π = ${P}`}.`;
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
  const dans = (a: Point3D, b: Point3D, noms: readonly string[]) => dansPlan(e, a, noms) && dansPlan(e, b, noms);
  if (estCommun(e, o, c)) {
    const premiereDansPi = dans(a1, b1, o.nom);
    return premiereDansPi
      ? `${d1} est dans π et ${d2} dans α${ouFace} : leur point de rencontre est commun aux deux plans.`
      : `${d1} est dans α et ${d2} dans π${ouFace} : leur point de rencontre est commun aux deux plans.`;
  }
  const horsPi = !dansPlan(e, c.position, o.nom);
  const fautif = horsPi ? `π = ${P}` : `α = ${A}`;
  const laquelle = dans(a1, b1, horsPi ? o.nom : e.plan) ? d2 : d1;
  return `${laquelle} n'est pas dans le plan ${fautif} : le point de rencontre de ${d1} et ${d2} n'appartient pas à ce plan.`;
}

const NOMS_CONSTRUITS = ["M", "N"];

/** Points de la paire, avec un nom (M, N) pour les points construits. */
export function pointsDeLaPaire(s: SuitePlanAuxiliaire, paire: [number, number]): { candidat: CandidatPointCommun; nom: string }[] {
  let k = 0;
  return paire.map((i) => {
    const c = s.candidats[i]!;
    return { candidat: c, nom: c.construction ? NOMS_CONSTRUITS[k++]! : c.libelle };
  });
}

export function libellePaire(s: SuitePlanAuxiliaire, paire: [number, number]): string {
  return `${s.candidats[paire[0]]!.libelle} et ${s.candidats[paire[1]]!.libelle}`;
}

/** Nom de la droite b d'après la paire (« (EM) »). */
export function nomB(e: ExercicePercee, s: SuitePlanAuxiliaire, paire: [number, number]): string {
  const noms = pointsDeLaPaire(s, paire).map((p) => p.nom);
  const rang = (n: string) => (e.solide.sommets[n] ? 0 : 1);
  noms.sort((x, y) => rang(x) - rang(y) || x.localeCompare(y));
  return `(${noms[0]}${noms[1]})`;
}

/** « On nomme M le point (FK) ∩ (BC). » ou chaîne vide. */
export function phraseNomsConstruits(s: SuitePlanAuxiliaire, paire: [number, number]): string {
  const noms = pointsDeLaPaire(s, paire).filter((p) => p.candidat.construction);
  return noms.length ? `On nomme ${noms.map((p) => `${p.nom} le point ${p.candidat.libelle}`).join(" et ")}.` : "";
}

export function explicationPoints(e: ExercicePercee, o: OptionPlanAuxiliaire, paire: [number, number]): string[] {
  const s = o.suite!;
  if (paireCorrecte(e, o, paire[0], paire[1])) {
    return [...paire.map((i) => raisonCandidat(e, o, s.candidats[i]!)), `${phraseNomsConstruits(s, paire)} La droite b, commune à π et α, est donc ${nomB(e, s, paire)}.`.trim()];
  }
  const lignes: string[] = [];
  if (paire.every((i) => estCommun(e, o, s.candidats[i]!))) lignes.push("Ces deux points sont confondus : il faut deux points DISTINCTS.");
  for (const i of paire) if (!estCommun(e, o, s.candidats[i]!)) lignes.push(raisonCandidat(e, o, s.candidats[i]!));
  const attendue = s.paireAttendue;
  lignes.push(`Par exemple, ${libellePaire(s, attendue)} conviennent :`);
  for (const i of attendue) lignes.push(raisonCandidat(e, o, s.candidats[i]!));
  lignes.push(`${phraseNomsConstruits(s, attendue)} La droite b est ${nomB(e, s, attendue)}.`.trim());
  return lignes;
}

// --- Écran 3 -----------------------------------------------------------------------------------

export function percee(s: SuitePlanAuxiliaire): CandidatPercee {
  return s.percee.find((c) => c.nature === "percee")!;
}

/** Le point de percée est-il dans le solide (bord compris) ? */
export function perceeDansSolide(e: ExercicePercee): boolean {
  const sommets = Object.values(e.solide.sommets);
  const centre = multiplierScalaire3D(sommets.reduce((s, x) => additionner3D(s, x), { x: 0, y: 0, z: 0 }), 1 / sommets.length);
  return e.solide.faces.every((face) => {
    const t = [e.solide.sommets[face[0]!]!, e.solide.sommets[face[1]!]!, e.solide.sommets[face[2]!]!] as [Point3D, Point3D, Point3D];
    const n = normalePlan(...t);
    const cote = Math.sign(produitScalaire3D(n, soustraire3D(centre, t[0])));
    return produitScalaire3D(n, soustraire3D(e.percee, t[0])) * cote >= -EPSILON_3D;
  });
}

export function phrasePositionPercee(e: ExercicePercee): string {
  return perceeDansSolide(e) ? "P est dans le solide (sur une face ou à l'intérieur)." : "P est hors du solide : il a fallu prolonger d et b.";
}

export function explicationPercee(e: ExercicePercee, o: OptionPlanAuxiliaire, paire: [number, number], numero: number): string[] {
  const s = o.suite!;
  const b = nomB(e, s, paire);
  const d = nomDroite(e);
  const choisi = s.percee.find((c) => c.numero === numero)!;
  const juste = percee(s);
  const conclusion = `d = ${d} et b = ${b} sont deux droites du plan π = ${nomPlan(o.nom)} : elles se coupent en P. P est sur b, donc dans α : c'est le point de percée de d dans α. ${phrasePositionPercee(e)}`;
  if (choisi.nature === "percee") return [conclusion];
  const lignes: string[] = [];
  if (choisi.nature === "gauche") {
    const dansAlpha = dansPlan(e, choisi.appui[0], e.plan) && dansPlan(e, choisi.appui[1], e.plan);
    lignes.push(
      dansAlpha
        ? `Le point n°${numero} est l'endroit où d croise ${choisi.nomAppui} sur le dessin. ${choisi.nomAppui} est bien dans α, mais d et ${choisi.nomAppui} sont gauches : elles ne se coupent pas dans l'espace.`
        : `Le point n°${numero} est l'endroit où d croise ${choisi.nomAppui} sur le dessin, mais ces droites sont gauches : elles ne se coupent pas dans l'espace.`,
    );
  } else {
    lignes.push(`d coupe bien ${choisi.nomAppui} au point n°${numero}, mais ${choisi.nomAppui} n'est pas dans α : ce point n'appartient pas à α.`);
  }
  lignes.push(`Le point de percée est le point n°${juste.numero}, où d rencontre b = ${b}.`, conclusion);
  return lignes;
}

// --- Figures -----------------------------------------------------------------------------------

/** Éléments de la figure d'un candidat de l'écran 2 sélectionné : point nommé entouré, ou les deux
 * droites de la construction (pointillés bleus) et leur point de rencontre. */
export function elementsCandidat(e: ExercicePercee, c: CandidatPointCommun, couleur = COULEUR_CONSTRUCTION): { points: PointFigurePercee[]; segments: SegmentFigurePercee[] } {
  if (!c.construction) return { points: [{ position: c.position!, label: "", couleur, anneau: true }], segments: [] };
  const segments: SegmentFigurePercee[] = [];
  const points: PointFigurePercee[] = [];
  for (const dr of [c.construction.droite1, c.construction.droite2]) {
    const a = positionNommee(e, dr[0]);
    const b = positionNommee(e, dr[1]);
    segments.push({ a, b, couleur: COULEUR_CONSTRUCTION, pointille: true });
    if (c.position) {
      const proche = distance3D(a, c.position) < distance3D(b, c.position) ? a : b;
      segments.push({ a: proche, b: c.position, couleur: COULEUR_CONSTRUCTION, pointille: true });
    }
  }
  if (c.position) points.push({ position: c.position, label: "", couleur, anneau: true });
  return { points, segments };
}

/** Prolongements des droites d'une construction, sans marquer le point. */
function segmentsConstruction(e: ExercicePercee, c: CandidatPointCommun): SegmentFigurePercee[] {
  return elementsCandidat(e, c).segments;
}

/** Figure de l'écran 3 (et de la fin de l'écran 2) : π, constructions de la paire, les deux points
 * de b en rouge et le segment qui les joint. */
export function elementsPaire(e: ExercicePercee, o: OptionPlanAuxiliaire, paire: [number, number]): Omit<OptionsFigurePercee, "mode"> {
  const s = o.suite!;
  const p = pointsDeLaPaire(s, paire);
  const segments = p.flatMap(({ candidat }) => (candidat.construction ? segmentsConstruction(e, candidat) : []));
  segments.push({ a: p[0]!.candidat.position!, b: p[1]!.candidat.position!, couleur: COULEUR_DROITE });
  const points: PointFigurePercee[] = p.map(({ candidat, nom }) => ({ position: candidat.position!, label: candidat.construction ? nom : "", couleur: COULEUR_DROITE }));
  return { planAux: o.nom, segments, points };
}

export function anneauxFigure(e: ExercicePercee, o: OptionPlanAuxiliaire, selection: number | null, clos: boolean): AnneauFigure[] {
  const cadre = cadreFigure(e);
  // Écran clos : le point de percée est dessiné (P, en rouge) à la place de son anneau.
  return o.suite!.percee.filter((c) => !clos || c.nature !== "percee").map((c) => ({
    numero: c.numero,
    pixel: pixelAnneau(e, cadre, c),
    selectionne: selection === c.numero,
    etat: clos ? (c.nature === "percee" ? "juste" : selection === c.numero ? "faux" : null) : null,
  }));
}

/** Figure finale : sections complètes, b prolongée, P. */
export function elementsFinaux(e: ExercicePercee, o: OptionPlanAuxiliaire, paire: [number, number]): Omit<OptionsFigurePercee, "mode"> {
  const s = o.suite!;
  const p = pointsDeLaPaire(s, paire);
  const base = elementsPaire(e, o, paire);
  return {
    planAux: o.nom,
    sections: true,
    droites: [{ a: p[0]!.candidat.position!, b: p[1]!.candidat.position!, couleur: COULEUR_DROITE }],
    segments: (base.segments ?? []).filter((x) => x.pointille),
    points: [...(base.points ?? []), { position: e.percee, label: "P", couleur: COULEUR_DROITE }],
  };
}

export function legendeFinale(): string {
  return "En vert, le plan auxiliaire π ; en rouge, la droite b commune à π et α, et le point de percée P ; en pointillés, les sections de α et de π dans le solide.";
}

// --- Réponses attendues --------------------------------------------------------------------------

export function reponsePlan(e: ExercicePercee): string {
  const bons = e.options.filter((o) => o.contientDroite).map((o) => nomPlan(o.nom));
  return bons.length > 1 ? `Les plans ${bons.join(" ou ")} (ils contiennent d).` : `Le plan ${bons[0]} (il contient d).`;
}

export function reponsePoints(e: ExercicePercee, o: OptionPlanAuxiliaire): string {
  const s = o.suite!;
  return `Par exemple ${libellePaire(s, s.paireAttendue)} : la droite b est ${nomB(e, s, s.paireAttendue)}.`;
}

export function reponsePercee(e: ExercicePercee, o: OptionPlanAuxiliaire, paire: [number, number]): string {
  const s = o.suite!;
  return `Le point n°${percee(s).numero}, où d rencontre b = ${nomB(e, s, paire)}.`;
}

/** Description d'une face par ses sommets si `noms` désigne le plan d'une face (« la face ABFE »). */
export function faceDuPlan(e: ExercicePercee, noms: readonly string[]): string | null {
  const t = pointsDuPlan(e, noms);
  for (const face of e.solide.faces) {
    if (face.every((n) => pointAppartientAuPlan(e.solide.sommets[n]!, t))) return `la face ${face.join("")}`;
  }
  return null;
}
