import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceSectionPlaneSolide } from "../../core/sectionPlaneSolide.types";
import { facesContenantLigne } from "../../moteur/verificationSectionPlaneSolide";
import { COURS_DEUX_PLANS, COURS_PERCEE, COURS_SECTION, droiteTex, listeEt, memeDirection, nomTex, phrase, planTex, segmentTex, type FigureEspace } from "../../ui/corrigeEspace1";
import { leNomPolygone, libellePoint, segmentSurFaceCachee } from "../../ui/formatSectionPlaneSolide";
import { type LigneTableauAppartenance, tableauAppartenanceSvg } from "../../ui/tableauAppartenanceSection";
import { construireSvgSectionPlaneSolide, nomPointAuxiliaire, ordreCycliqueDepuisP, ordreLabelsDepuisExercice } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen40 « Section plane d'un solide » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN de la résolution de référence
 * (`exercice.resolutionReference`) : un côté tracé directement (écran « segment »), un point
 * auxiliaire en DEUX écrans (« droites » puis « face »), puis la fermeture. Les constructeurs
 * d'étape prennent l'état CONFIRMÉ (points connus dans leur ordre de découverte, droites, face) :
 * l'appli les appelle avec l'état de SA session (l'élève peut suivre un autre ordre que la
 * référence), le papier avec la résolution de référence. Points de section P, Q, R puis S, T… dans
 * l'ordre de découverte ; points auxiliaires I₁, I₂ (papier) ou I (écran).
 */

type E = ExerciceSectionPlaneSolide;

/** Plan de coupe, nommé par les trois points de départ (variante « parallele » : le plan π). */
const PLAN_COUPE = ["P", "Q", "R"];

function planCoupeTex(e: E): string {
  return e.planParallele ? "\\pi" : planTex(PLAN_COUPE);
}

/** Figure de la brique : sommets, points de section (sur leur arête) nommés selon `connus`, points
 * auxiliaires `aux`. */
export function figureEspaceSection(e: E, connus: readonly number[], aux: { nom: string; position: { x: number; y: number; z: number } }[] = []): FigureEspace {
  return {
    sommets: e.solide.sommets,
    faces: e.solide.faces,
    points: [
      ...connus.map((id) => {
        const p = e.points.find((x) => x.id === id);
        if (!p) return { nom: libellePoint(connus, id), position: e.pointsAppui!.find((x) => x.id === id)!.position };
        return { nom: libellePoint(connus, id), position: p.position, surSegment: p.arete };
      }),
      ...(e.planParallele?.points ?? []).map((k) => ({ nom: k.nom, position: k.position, surSegment: k.arete })),
      ...aux.map((a) => ({ nom: a.nom, position: a.position })),
    ],
  };
}

function nomFaceIndex(e: E, face: number): string {
  return e.solide.faces[face]!.join("");
}

function faceTex(e: E, face: number): string {
  return planTex(e.solide.faces[face]!);
}

function areteDe(e: E, id: number): [string, string] {
  return e.points.find((p) => p.id === id)!.arete;
}

/** Noms (deux points) d'une droite candidate : « arete:AB », « diagonale:AC », « segment:a-b ». */
export function nomsLigne(_e: E, connus: readonly number[], cle: string): [string, string] {
  if (cle.startsWith("segment:")) {
    const [a, b] = cle.slice("segment:".length).split("-").map(Number) as [number, number];
    const [x, y] = connus.indexOf(a) <= connus.indexOf(b) ? [a, b] : [b, a];
    return [libellePoint(connus, x), libellePoint(connus, y)];
  }
  const noms = cle.slice(cle.indexOf(":") + 1);
  return [noms[0]!, noms.slice(1)];
}

function natureLigne(cle: string): string {
  return cle.startsWith("segment:") ? "côté de la section déjà tracé" : cle.startsWith("arete:") ? "arête" : "diagonale de face";
}

const UTILISE_SEGMENT = phrase(`Deux points du plan de coupe situés sur une même face : le côté de la section dans cette face est le segment qui les joint ${COURS_SECTION}.`);

/** Écran « segment » : la face choisie, ses deux points connus a et b. */
export function etapesSegmentSection(e: E, connus: readonly number[], face: number, a: number, b: number, lettre: string, avecPiege = true): EtapeCorrection[] {
  const [x, y] = connus.indexOf(a) <= connus.indexOf(b) ? [a, b] : [b, a];
  const X = libellePoint(connus, x);
  const Y = libellePoint(connus, y);
  const F = faceTex(e, face);
  const lignes: LigneCalcul[] = [
    ligne(`${nomTex(X)}\\in${F}`, phrase(`$${nomTex(X)}$ est sur l'arête $${segmentTex(...areteDe(e, x))}$ de la face`)),
    ligne(`${nomTex(Y)}\\in${F}`, phrase(`$${nomTex(Y)}$ est sur l'arête $${segmentTex(...areteDe(e, y))}$ de la face`)),
    ligne(`${planCoupeTex(e)}\\cap${F}=${droiteTex(X, Y)}`, phrase(`$${nomTex(X)}$ et $${nomTex(Y)}$ sont communs aux deux plans`)),
  ];
  const cache = segmentSurFaceCachee(e, a, b);
  return [
    utilise(lettre, UTILISE_SEGMENT),
    calcul(lettre, lignes),
    resultat(lettre, phrase(`Côté $${segmentTex(X, Y)}$ de la section, dans la face ${nomFaceIndex(e, face)}${cache ? " (face cachée : en pointillés)" : ""}.`)),
    ...(avecPiege ? [piege(lettre, [texte("On ne relie deux points de section que s'ils sont sur une même face : sinon le segment traverserait le solide.")])] : []),
  ];
}

/** Écran « droites » : les deux droites prolongées, qui se coupent au point auxiliaire `nomI`. */
export function etapesLignesSection(e: E, connus: readonly number[], l1: string, l2: string, nomI: string, lettre: string): EtapeCorrection[] {
  const d1 = nomsLigne(e, connus, l1);
  const d2 = nomsLigne(e, connus, l2);
  const f1 = facesContenantLigne(e, l1);
  const commune = f1.find((f) => facesContenantLigne(e, l2).includes(f));
  const lignes: LigneCalcul[] = [];
  const segment = [l1, l2].find((c) => c.startsWith("segment:"));
  const ordre: [string, [string, string]][] = segment === l2 ? [[l2, d2], [l1, d1]] : [[l1, d1], [l2, d2]];
  if (segment) lignes.push(ligne(`${droiteTex(...nomsLigne(e, connus, segment))}\\subset${planCoupeTex(e)}`, "côté de la section déjà tracé : dans le plan de coupe"));
  if (commune !== undefined) {
    for (const [cle, d] of ordre) lignes.push(ligne(`${droiteTex(...d)}\\subset${faceTex(e, commune)}`, `${natureLigne(cle)} de la face ${nomFaceIndex(e, commune)}`));
    lignes.push(ligne(`${nomTex(nomI)}=${droiteTex(...d1)}\\cap${droiteTex(...d2)}`, `deux droites non parallèles de la face ${nomFaceIndex(e, commune)}`));
  } else {
    lignes.push(ligne(`${nomTex(nomI)}=${droiteTex(...d1)}\\cap${droiteTex(...d2)}`, phrase(`droites coplanaires du plan $${planTex([d1[0], d1[1], d2[0]])}$, non parallèles`)));
  }
  return [
    utilise(lettre, phrase(`Plus aucune face n'a deux points connus : on construit un point auxiliaire ${COURS_SECTION}. On prolonge deux droites d'une même face (coplanaires et non parallèles, donc sécantes) : l'une dans le plan de coupe, l'autre dans le plan d'une face où un seul point de section est connu.`)),
    calcul(lettre, lignes),
    resultat(lettre, phrase(`$${nomTex(nomI)}=${droiteTex(...d1)}\\cap${droiteTex(...d2)}$ : point auxiliaire${segment ? `, dans le plan de coupe (il est sur $${droiteTex(...nomsLigne(e, connus, segment))}$)` : ""}.`)),
    piege(lettre, [texte("On ne prolonge que deux droites d'une même face : deux droites qui se croisent seulement sur le dessin peuvent être gauches et n'avoir aucun point commun.")]),
  ];
}

/** Écran « face » : la face débloquée, son point connu, le nouveau point de section. */
export function etapesFaceSection(
  e: E,
  connus: readonly number[],
  construction: { ligne1: string; ligne2: string; face: number; pointConnu: number; pointCible: number },
  nomI: string,
  lettre: string,
): EtapeCorrection[] {
  const { ligne1, ligne2, face, pointConnu, pointCible } = construction;
  const apres = [...connus, pointCible];
  const Z = libellePoint(connus, pointConnu);
  const S = libellePoint(apres, pointCible);
  const F = faceTex(e, face);
  const PQR = planCoupeTex(e);
  const lignes: LigneCalcul[] = [];
  const dansCoupe = [ligne1, ligne2].find((c) => c.startsWith("segment:"));
  const dansFace = [ligne1, ligne2].find((c) => facesContenantLigne(e, c).includes(face));
  if (dansCoupe) lignes.push(ligne(`${nomTex(nomI)}\\in${PQR}`, phrase(`$${nomTex(nomI)}$ est sur $${droiteTex(...nomsLigne(e, connus, dansCoupe))}$, côté de la section`)));
  if (dansFace) lignes.push(ligne(`${nomTex(nomI)}\\in${F}`, phrase(`$${nomTex(nomI)}$ est sur $${droiteTex(...nomsLigne(e, connus, dansFace))}$, ${natureLigne(dansFace)} de cette face`)));
  lignes.push(ligne(`${nomTex(Z)}\\in${F}`, phrase(`point de section déjà connu, sur l'arête $${segmentTex(...areteDe(e, pointConnu))}$`)));
  lignes.push(ligne(`${PQR}\\cap${F}=${droiteTex(nomI, Z)}`, phrase(`$${nomTex(nomI)}$ et $${nomTex(Z)}$ sont communs aux deux plans`)));
  const [u, v] = areteDe(e, pointCible);
  lignes.push(ligne(`${nomTex(S)}=${droiteTex(nomI, Z)}\\cap${droiteTex(u, v)}`, phrase(`la droite coupe l'arête $${segmentTex(u, v)}$ de la face`)));
  return [
    utilise(lettre, phrase(`Le point auxiliaire est à la fois dans le plan de coupe et dans le plan de la face visée ; avec le point de section déjà connu de cette face, il donne la droite d'intersection des deux plans ${COURS_PERCEE}.`)),
    calcul(lettre, lignes),
    resultat(lettre, phrase(`$${nomTex(S)}=${droiteTex(nomI, Z)}\\cap${droiteTex(u, v)}$ : nouveau point de section, sur l'arête $${segmentTex(u, v)}$ de la face ${nomFaceIndex(e, face)}.`)),
    piege(lettre, [texte("La droite qui donne le nouveau point doit être dans le plan de la face : elle passe par le point auxiliaire ET par le point de section déjà connu de cette face.")]),
  ];
}

/** Écran « tracer dans une face » avec un point donné hors section (variantes du manuel) : le plan
 * de la face contient ce point et un point de section connu ; la droite qui les joint donne le côté
 * et un nouveau point. */
export function etapesAppuiSection(
  e: E,
  connus: readonly number[],
  etape: { face: number; appui: number; pointConnu: number; pointCible: number },
  lettre: string,
  avecPiege = true,
): EtapeCorrection[] {
  const { face, appui, pointConnu, pointCible } = etape;
  const apres = [...connus, pointCible];
  const X = libellePoint(connus, appui);
  const Z = libellePoint(connus, pointConnu);
  const S = libellePoint(apres, pointCible);
  const F = faceTex(e, face);
  const donne = e.pointsAppui!.find((x) => x.id === appui)!;
  const lignes: LigneCalcul[] = [];
  if (donne.nature === "face") {
    lignes.push(ligne(`${nomTex(X)}\\in${F}`, "point donné à l'intérieur de cette face"));
  } else {
    const [u, v] = donne.arete!;
    lignes.push(ligne(`${nomTex(X)}\\in${droiteTex(u, v)}`, phrase(`point donné sur la droite $${droiteTex(u, v)}$, au-delà de $${nomTex(donne.auDelaDe!)}$`)));
    lignes.push(ligne(`${droiteTex(u, v)}\\subset${F}`, phrase(`$${segmentTex(u, v)}$ est une arête de la face ${nomFaceIndex(e, face)}`)));
  }
  lignes.push(ligne(`${nomTex(Z)}\\in${F}`, phrase(`$${nomTex(Z)}$ est sur l'arête $${segmentTex(...areteDe(e, pointConnu))}$ de la face`)));
  lignes.push(ligne(`${planCoupeTex(e)}\\cap${F}=${droiteTex(X, Z)}`, phrase(`$${nomTex(X)}$ et $${nomTex(Z)}$ sont communs aux deux plans`)));
  const [u, v] = areteDe(e, pointCible);
  lignes.push(ligne(`${nomTex(S)}=${droiteTex(X, Z)}\\cap${droiteTex(u, v)}`, phrase(`la droite, prolongée, coupe l'arête $${segmentTex(u, v)}$ de la face`)));
  const cache = segmentSurFaceCachee(e, pointConnu, pointCible);
  const piegeTexte =
    donne.nature === "face"
      ? `Le point ${X} n'est pas un sommet de la section : il est sur le côté [${Z}${S}], dont les deux extrémités sont sur des arêtes de la face.`
      : `Le point ${X}, hors du solide, n'est pas un sommet de la section : il sert seulement à tracer la droite (${X}${Z}) dans le plan de la face.`;
  return [
    utilise(lettre, phrase(`Dès que le plan d'une face contient deux points du plan de coupe, la droite qui les joint est l'intersection des deux plans ; prolongée jusqu'au bord de la face, elle donne le côté de la section dans cette face ${COURS_SECTION}.`)),
    calcul(lettre, lignes),
    resultat(lettre, phrase(`Côté $${segmentTex(Z, S)}$ de la section, dans la face ${nomFaceIndex(e, face)}${cache ? " (face cachée : en pointillés)" : ""} ; nouveau point $${nomTex(S)}$ sur l'arête $${segmentTex(u, v)}$.`)),
    ...(avecPiege ? [piege(lettre, [texte(piegeTexte)])] : []),
  ];
}

/** Écran « parallèle » (variante du manuel) : le côté de la face `face` tracé par le dernier point
 * trouvé, parallèle au côté de KLM situé dans cette face ou dans la face qui lui est parallèle. */
export function etapesParalleleSection(
  e: E,
  connus: readonly number[],
  etape: { face: number; cote: number; pointConnu: number; pointCible: number },
  lettre: string,
  avecPiege = true,
): EtapeCorrection[] {
  const plan = e.planParallele!;
  const { face, cote, pointConnu, pointCible } = etape;
  const c = plan.cotes[cote]!;
  const [k1, k2] = [plan.points[c.a]!, plan.points[c.b]!];
  const apres = [...connus, pointCible];
  const Z = libellePoint(connus, pointConnu);
  const S = libellePoint(apres, pointCible);
  const F = faceTex(e, face);
  const Fc = faceTex(e, c.face);
  const KL = droiteTex(k1.nom, k2.nom);
  const lignes: LigneCalcul[] = [
    ligne(`${planTex(["K", "L", "M"])}\\cap${Fc}=${KL}`, phrase(`$${nomTex(k1.nom)}$ et $${nomTex(k2.nom)}$ sont sur des arêtes de la face ${nomFaceIndex(e, c.face)}`)),
  ];
  if (c.face !== face) {
    lignes.push(ligne(`${F}\\parallel${Fc}`, "faces opposées du pavé"));
    lignes.push(ligne(`${planTex(["K", "L", "M"])}\\cap${F}\\parallel${KL}`, "le plan (KLM) coupe ces deux faces parallèles"));
  }
  lignes.push(ligne(`\\pi\\parallel${planTex(["K", "L", "M"])}`, "donnée"));
  lignes.push(ligne(`\\pi\\cap${F}\\parallel${KL}`, c.face === face ? "le plan de la face coupe les deux plans parallèles π et (KLM)" : "le plan de la face coupe les deux plans parallèles π et (KLM), puis la ligne précédente"));
  lignes.push(ligne(`${nomTex(Z)}\\in\\pi\\cap${F}`, phrase(`$${nomTex(Z)}$ est un point de section, sur l'arête $${segmentTex(...areteDe(e, pointConnu))}$ de la face`)));
  const [u, v] = areteDe(e, pointCible);
  lignes.push(ligne(`${nomTex(S)}\\in${droiteTex(u, v)}`, phrase(`la parallèle à $${KL}$ menée par $${nomTex(Z)}$ coupe l'arête $${segmentTex(u, v)}$ de la face`)));
  const cache = segmentSurFaceCachee(e, pointConnu, pointCible);
  return [
    utilise(lettre, phrase(`Si un plan coupe deux plans parallèles, les deux droites d'intersection sont parallèles ${COURS_DEUX_PLANS}. Ici, π est parallèle à (KLM), et les faces opposées d'un pavé sont parallèles.`)),
    calcul(lettre, lignes),
    resultat(lettre, phrase(`Côté $${segmentTex(Z, S)}$ de la section, parallèle à $${segmentTex(k1.nom, k2.nom)}$, dans la face ${nomFaceIndex(e, face)}${cache ? " (face cachée : en pointillés)" : ""} ; nouveau point $${nomTex(S)}$ sur l'arête $${segmentTex(u, v)}$.`)),
    ...(avecPiege ? [piege(lettre, [texte("Le côté cherché n'est parallèle qu'au côté de KLM situé dans la même face ou dans la face parallèle, jamais à un côté situé dans une face sécante.")])] : []),
  ];
}

/** Lettres des écrans de la résolution de référence : un segment = une lettre, un point auxiliaire =
 * deux lettres (« droites », « face »), puis la fermeture. */
export interface EcranSection {
  /** « appui » / « parallele » : variantes du manuel (un écran chacun). */
  type: "segment" | "lignes" | "face" | "appui" | "parallele" | "fermeture";
  /** Indice de l'étape de `resolutionReference` (absent pour la fermeture). */
  reference?: number;
}

export function ecransSection(e: E): EcranSection[] {
  const ecrans: EcranSection[] = [];
  e.resolutionReference.forEach((etape, i) => {
    if (etape.type === "segment") ecrans.push({ type: "segment", reference: i });
    else if (etape.type === "appui" || etape.type === "parallele") ecrans.push({ type: etape.type, reference: i });
    else ecrans.push({ type: "lignes", reference: i }, { type: "face", reference: i });
  });
  ecrans.push({ type: "fermeture" });
  return ecrans;
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";
export function lettreEcranSection(i: number): string {
  return LETTRES[i] ?? String(i + 1);
}

/** Le dernier écran « segment » est-il le côté tracé automatiquement à l'écran (seul candidat) ? */
export function dernierSegmentAutomatique(e: E): boolean {
  const ref = e.resolutionReference;
  return ref.length > 0 && ref[ref.length - 1]!.type === "segment";
}

function etapeFermeture(e: E, lettre: string): EtapeCorrection[] {
  const ordre = ordreLabelsDepuisExercice(e);
  const cycle = ordreCycliqueDepuisP(e);
  const noms = cycle.map((id) => libellePoint(ordre, id));
  const k = cycle.length;
  const lignes: LigneCalcul[] = [];
  const cotes: { a: number; b: number; face: number }[] = [];
  cycle.forEach((id, i) => {
    const suivant = cycle[(i + 1) % k]!;
    const pa = e.points.find((p) => p.id === id)!;
    const pb = e.points.find((p) => p.id === suivant)!;
    const face = pa.faces.find((f) => pb.faces.includes(f))!;
    cotes.push({ a: id, b: suivant, face });
    lignes.push(ligne(`${segmentTex(noms[i]!, noms[(i + 1) % k]!)}\\subset${faceTex(e, face)}`, `côté dans la face ${nomFaceIndex(e, face)}`));
  });
  const caches = cotes.filter((c) => segmentSurFaceCachee(e, c.a, c.b)).map((c) => `$${segmentTex(libellePoint(ordre, c.a), libellePoint(ordre, c.b))}$`);
  // Vérification : deux côtés sur deux faces parallèles sont parallèles.
  const f = figureEspaceSection(e, ordre);
  const verifs: LigneCalcul[] = [];
  for (let i = 0; i < cotes.length; i++) {
    for (let j = i + 1; j < cotes.length; j++) {
      const ci = cotes[i]!;
      const cj = cotes[j]!;
      const fi = e.solide.faces[ci.face]!;
      const fj = e.solide.faces[cj.face]!;
      if (!facesParalleles(f, fi, fj)) continue;
      const di: [string, string] = [libellePoint(ordre, ci.a), libellePoint(ordre, ci.b)];
      const dj: [string, string] = [libellePoint(ordre, cj.a), libellePoint(ordre, cj.b)];
      if (!memeDirection(f, di, dj)) continue;
      verifs.push(ligne(`${droiteTex(...di)}\\parallel${droiteTex(...dj)}`, `faces ${fi.join("")} et ${fj.join("")} parallèles, coupées par le plan de coupe`));
    }
  }
  return [
    utilise(lettre, phrase(`Un plan coupe un solide convexe suivant un polygone fermé ; chaque face traversée en donne exactement un côté ${COURS_SECTION}.`)),
    calcul(lettre, lignes),
    {
      ...resultat(lettre, phrase(`La section est ${leNomPolygone(k)} ${noms.join("")}${caches.length ? ` ; ${caches.length > 1 ? `les côtés ${listeEt(caches)}, sur des faces cachées, se tracent` : `le côté ${caches[0]}, sur une face cachée, se trace`} en pointillés` : ""}.`)),
      figureHtml: construireSvgSectionPlaneSolide(e, true),
    },
    verification(lettre, phrase(`${k} faces traversées, ${k} côtés : le polygone est fermé, et deux côtés consécutifs se rejoignent sur une arête.`), verifs.length ? verifs : undefined),
    {
      label: "Tableau",
      sousQuestion: lettre,
      fragments: [texte("Appartenance des points aux faces, dans l'ordre de la construction (chaque point dans les faces dont le plan le contient) :")],
      figureHtml: tableauAppartenanceSvg(e, lignesTableauReference(e)),
    },
  ];
}

/** Lignes du tableau d'appartenance du corrigé papier : points donnés, puis, dans l'ordre de la
 * résolution de référence, chaque point auxiliaire (I₁, I₂…) et chaque nouveau point de section. */
export function lignesTableauReference(e: E): LigneTableauAppartenance[] {
  const ordre = ordreLabelsDepuisExercice(e);
  const position = (id: number) => e.points.find((p) => p.id === id)?.position ?? e.pointsAppui!.find((x) => x.id === id)!.position;
  const lignes: LigneTableauAppartenance[] = e.idsDepart.map((id) => ({ nom: libellePoint(ordre, id), position: position(id) }));
  let rang = 0;
  for (const etape of e.resolutionReference) {
    if (etape.type === "segment") continue;
    if (etape.type === "auxiliaire") lignes.push({ nom: nomPointAuxiliaire(rang++), position: etape.pointAuxiliaire, auxiliaire: true });
    lignes.push({ nom: libellePoint(ordre, etape.pointCible), position: position(etape.pointCible) });
  }
  return lignes;
}

function facesParalleles(f: FigureEspace, a: readonly string[], b: readonly string[]): boolean {
  const n = (face: readonly string[]) => {
    const [p, q, r] = face.map((x) => f.sommets[x]!);
    const u = { x: q!.x - p!.x, y: q!.y - p!.y, z: q!.z - p!.z };
    const v = { x: r!.x - p!.x, y: r!.y - p!.y, z: r!.z - p!.z };
    return { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
  };
  const na = n(a);
  const nb = n(b);
  const c = { x: na.y * nb.z - na.z * nb.y, y: na.z * nb.x - na.x * nb.z, z: na.x * nb.y - na.y * nb.x };
  return c.x * c.x + c.y * c.y + c.z * c.z < 1e-9 * (na.x * na.x + na.y * na.y + na.z * na.z) * (nb.x * nb.x + nb.y * nb.y + nb.z * nb.z) && a.join("") !== b.join("");
}

/** Points connus (ordre de découverte de la référence) AVANT l'étape `i`. */
function connusAvant(e: E, i: number): number[] {
  const ordre = ordreLabelsDepuisExercice(e);
  const ref = e.resolutionReference;
  const nouveaux = ref.slice(0, i).filter((x) => x.type !== "segment").length;
  return ordre.slice(0, e.idsDepart.length + nouveaux);
}

export function correctionDetailleeSectionPlaneSolide(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  let rang = 0;
  let premierSegment = true;
  let premierAppui = true;
  let premierParallele = true;
  ecransSection(e).forEach((ecran, i) => {
    const lettre = lettreEcranSection(i);
    if (ecran.type === "fermeture") {
      etapes.push(...etapeFermeture(e, lettre));
      return;
    }
    const ref = e.resolutionReference[ecran.reference!]!;
    const connus = connusAvant(e, ecran.reference!);
    if (ref.type === "segment") {
      etapes.push(...etapesSegmentSection(e, connus, ref.face, ref.pointA, ref.pointB, lettre, premierSegment));
      premierSegment = false;
      return;
    }
    if (ref.type === "appui") {
      etapes.push(...etapesAppuiSection(e, connus, ref, lettre, premierAppui));
      premierAppui = false;
      return;
    }
    if (ref.type === "parallele") {
      etapes.push(...etapesParalleleSection(e, connus, ref, lettre, premierParallele));
      premierParallele = false;
      return;
    }
    const nomI = nomPointAuxiliaire(ecran.type === "lignes" ? rang : rang++);
    if (ecran.type === "lignes") etapes.push(...etapesLignesSection(e, connus, ref.ligne1, ref.ligne2, nomI, lettre));
    else etapes.push(...etapesFaceSection(e, connus, ref, nomI, lettre));
  });
  return etapes;
}
