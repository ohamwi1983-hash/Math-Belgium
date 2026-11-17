import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveEspace, TypeErreurEspace } from "../../core/detectiveEspace.types";
import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import { pixel } from "../deuxDroitesPlan";
import { GABARITS_SOLIDE3D } from "../solide3D/gabarits";
import { choisir, descriptionsVariees, dr, libelleSolide, melanger, nomFace, propositions, sg, t } from "./commun";

/**
 * Thème « section » de gen107, sur l'exemple du cours « 4 faces traversées » : le plan (PQR) coupe
 * un cube ou un parallélépipède rectangle ; P, Q, R sont sur trois des quatre arêtes parallèles
 * (consécutives), si bien que la section est le parallélogramme PQRS. Pour préparer la
 * construction, un élève note trois remarques (une par ligne, dans un ordre tiré au hasard) :
 * - un côté direct (« la face … contient deux points déjà connus… ») ;
 * - la technique des faces parallèles (« sur la face …, le côté est parallèle à … ») ;
 * - un point auxiliaire (« (PQ) et (AB) sont dans la face … : elles se coupent… »).
 *
 * Type d'erreur = la remarque fausse (tirée à parts égales, avant le reste) :
 * - `unSeulPoint` (fiche) : segment « direct » entre deux points qui ne sont sur aucune face
 *   commune — la face citée n'en contient qu'un (piège central du cours) ;
 * - `mauvaisCote` : sur la face opposée, parallèle au mauvais côté (celui d'une face voisine) ;
 * - `nonCoplanaires` : point auxiliaire construit avec une arête qui n'est pas dans la face citée
 *   (les traits ne se croisent que sur le dessin).
 * Chaque remarque a la même forme, juste ou fausse ; la ligne fausse est tirée indépendamment du type.
 */

type Arete = [string, string];

/** Les 4 arêtes parallèles de chaque direction, dans l'ordre où l'on en fait le tour ; chaque arête
 * est écrite de son extrémité « début » à son extrémité « fin ». */
const DIRECTIONS: Arete[][] = [
  [
    ["A", "E"],
    ["B", "F"],
    ["C", "G"],
    ["D", "H"],
  ],
  [
    ["A", "B"],
    ["E", "F"],
    ["H", "G"],
    ["D", "C"],
  ],
  [
    ["A", "D"],
    ["E", "H"],
    ["F", "G"],
    ["B", "C"],
  ],
];

type Genre = "direct" | "parallele" | "auxiliaire";

const GENRE_DU_TYPE: Record<"unSeulPoint" | "mauvaisCote" | "nonCoplanaires", Genre> = {
  unSeulPoint: "direct",
  mauvaisCote: "parallele",
  nonCoplanaires: "auxiliaire",
};

function lerp(a: Point3D, b: Point3D, u: number): Point3D {
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u };
}

function faceAvec(solide: Solide3D, lettres: string[]): string[] {
  return solide.faces.find((f) => lettres.every((l) => f.includes(l)))!;
}

const aleaT = () => Math.round((0.2 + Math.random() * 0.6) * 20) / 20;

/** Intersection des traits (a1a2) et (b1b2) sur le dessin, dans le cadre 400 × 320. */
function croisementTraits(solide: Solide3D, a1: Point3D, a2: Point3D, b1: Point3D, b2: Point3D): boolean {
  const [p1, p2, q1, q2] = [a1, a2, b1, b2].map((p) => pixel(solide, p));
  const d1 = { x: p2!.x - p1!.x, y: p2!.y - p1!.y };
  const d2 = { x: q2!.x - q1!.x, y: q2!.y - q1!.y };
  const det = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(det) < 1e-9) return false;
  const s = ((q1!.x - p1!.x) * d2.y - (q1!.y - p1!.y) * d2.x) / det;
  const x = p1!.x + s * d1.x;
  const y = p1!.y + s * d1.y;
  return x > 10 && x < 390 && y > 10 && y < 310;
}

export function genererSection(type: TypeErreurEspace, ligneFausse: number): ExerciceDetectiveEspace {
  const genreFaux = GENRE_DU_TYPE[type as keyof typeof GENRE_DU_TYPE];
  const autres = melanger((["direct", "parallele", "auxiliaire"] as Genre[]).filter((g) => g !== genreFaux));
  const genres: Genre[] = [0, 1, 2].map((i) => (i === ligneFausse ? genreFaux : autres[[0, 1, 2].filter((k) => k !== ligneFausse).indexOf(i)]!));

  for (;;) {
    const solide = GABARITS_SOLIDE3D[choisir(["cube", "parallelepipede"] as const)];
    const dir = choisir(DIRECTIONS);
    const k = Math.floor(Math.random() * 4);
    const sens = Math.random() < 0.5 ? 1 : -1;
    const e = [0, 1, 2, 3].map((i) => dir[(k + sens * i + 8) % 4]!);
    const ts = [aleaT(), aleaT(), aleaT()];
    const t3 = ts[0]! - ts[1]! + ts[2]!;
    if (t3 < 0.15 || t3 > 0.85) continue;
    // Côté du point auxiliaire : [PQ] (face e0-e1) ou [QR] (face e1-e2) ; il doit couper nettement l'arête de bout.
    const coteAux = Math.random() < 0.5 ? 0 : 1;
    if (Math.abs(ts[coteAux]! - ts[coteAux + 1]!) < 0.2) continue;
    const ex = construire(type as keyof typeof GENRE_DU_TYPE, ligneFausse, solide, e, [...ts, t3], genres, coteAux);
    if (ex) return ex;
  }
}

function construire(
  type: keyof typeof GENRE_DU_TYPE,
  ligneFausse: number,
  solide: Solide3D,
  e: Arete[],
  ts: number[],
  genres: Genre[],
  coteAux: number,
): ExerciceDetectiveEspace | null {
  const S3 = (n: string) => solide.sommets[n]!;
  const position = (i: number) => lerp(S3(e[i]![0]), S3(e[i]![1]), ts[i]!);
  const NOMS = ["P", "Q", "R", "S"];
  const pts = [0, 1, 2, 3].map(position);
  // Faces latérales F(i, i+1) et faces de bout (début, fin).
  const F = (i: number) => nomFace(faceAvec(solide, [...e[i % 4]!, ...e[(i + 1) % 4]!]));
  const debut = faceAvec(solide, e.map((a) => a[0]));
  const fin = faceAvec(solide, e.map((a) => a[1]));
  const arete = (i: number) => {
    const [a, b] = [...e[i]!].sort();
    return sg(a!, b!);
  };
  /** Arête de bout de la face F(i, i+1) : du côté « début » (bout = 0) ou « fin » (bout = 1). */
  const areteBout = (i: number, bout: 0 | 1): [string, string] => [e[i % 4]![bout], e[(i + 1) % 4]![bout]].sort() as [string, string];

  const lignes: FragmentConsigne[][] = [];
  const controles: FragmentConsigne[][] = [];
  let descriptions = null as ReturnType<typeof propositions> | null;
  let corrections = null as ReturnType<typeof propositions> | null;
  let ligneCorrigee = "";
  let piege = "";
  let nomErreur = "";
  let questionCorrection = "";
  let suiteSection = "";
  const corrigeDroites: [Point3D, Point3D][] = [];

  for (let ligne = 0; ligne < 3; ligne++) {
    const genre = genres[ligne]!;
    const faux = ligne === ligneFausse;
    const n = ligne + 1;
    if (genre === "direct") {
      if (!faux) {
        const i = Math.random() < 0.5 ? 0 : 1; // [PQ] sur F01 ou [QR] sur F12
        const [X, Y] = Math.random() < 0.5 ? [NOMS[i]!, NOMS[i + 1]!] : [NOMS[i + 1]!, NOMS[i]!];
        lignes.push(t(`La face ${F(i)} contient deux points déjà connus, ${X} et ${Y} : ${sg(X, Y)} est un côté de la section.`));
        controles.push(t(`Ligne ${n} : ${NOMS[i]} est sur ${arete(i)} et ${NOMS[i + 1]} sur ${arete(i + 1)}, deux arêtes de la face ${F(i)} : ${sg(X, Y)} est bien un côté de la section. C'est juste.`));
      } else {
        // R et P (arêtes e2 et e0, opposées) : la face citée n'en contient qu'un.
        const surR = Math.random() < 0.5;
        const face = surR ? F(2) : F(3);
        const connu = surR ? "R" : "P";
        const absent = surR ? "P" : "R";
        const [X, Y] = Math.random() < 0.5 ? ["R", "P"] : ["P", "R"];
        lignes.push(t(`La face ${face} contient deux points déjà connus, ${X} et ${Y} : ${sg(X, Y)} est un côté de la section.`));
        controles.push(t(`Ligne ${n} : ${absent} est sur ${arete(surR ? 0 : 2)}, qui n'est pas une arête de la face ${face} : P et R ne sont sur aucune face commune, et ${sg(X, Y)} traverserait l'intérieur du solide. La copie est fausse.`));
        // Construction correcte sur cette face : par le point connu, parallèle au côté de la face opposée.
        const coteDroite = surR ? dr("P", "Q") : dr("Q", "R");
        const opposee = surR ? F(0) : F(1);
        const bout = areteBout(surR ? 2 : 3, Math.random() < 0.5 ? 0 : 1);
        descriptions = descriptionsVariees(t(`${absent} n'est pas sur la face ${face} : cette face n'a qu'un point connu, ${connu}.`), [
          t(`${X} et ${Y} sont bien sur la face ${face}, mais il fallait d'abord construire S.`),
          t(`Une face traversée apporte trois sommets à la section : il manque un point sur ${sg(X, Y)}.`),
          t("Un côté de la section relie toujours deux points de deux faces différentes."),
        ]);
        ligneCorrigee = `La face ${face} n'a qu'un point connu, ${connu} : son côté est porté par la parallèle à ${coteDroite} menée par ${connu}.`;
        corrections = propositions(t(ligneCorrigee), [
          t(`La face ${face} contient deux points déjà connus, ${connu} et Q : ${sg(connu, "Q")} est un côté de la section.`),
          t(`La face ${face} n'a qu'un point connu, ${connu} : elle n'apporte donc qu'un seul sommet à la section.`),
          t(`La face ${face} n'a qu'un point connu, ${connu} : son côté est porté par la parallèle à ${dr(bout[0], bout[1])} menée par ${connu}.`),
        ]);
        suiteSection = `Les faces ${face} et ${opposee} sont parallèles : le côté de la section sur ${face} est parallèle à son côté sur ${opposee}, ${coteDroite.replace("(", "[").replace(")", "]")}. `;
        questionCorrection = `Que fallait-il écrire à la ligne ${n} ? Choisis la remarque corrigée.`;
        piege = "Piège central du cours : on ne trace un côté de la section que sur une face qui a déjà SES DEUX points connus. Deux points situés sur deux arêtes opposées ne sont sur aucune face commune : le segment qui les joint traverse le solide.";
        nomErreur = `segment ${sg(X, Y)} tracé sur une face qui ne contient qu'un des deux points`;
        corrigeDroites.push([pts[0]!, pts[2]!]);
      }
    } else if (genre === "parallele") {
      const i = Math.random() < 0.5 ? 0 : 1; // F01 ∥ F23 (côté [PQ]) ou F12 ∥ F30 (côté [QR])
      const bon = i === 0 ? sg("P", "Q") : sg("Q", "R");
      const mauvais = i === 0 ? sg("Q", "R") : sg("P", "Q");
      const Fa = F(i);
      const Fb = F(i + 2);
      if (!faux) {
        lignes.push(t(`Les faces ${Fa} et ${Fb} sont parallèles : sur la face ${Fb}, le côté de la section est parallèle à ${bon}.`));
        controles.push(t(`Ligne ${n} : les faces ${Fa} et ${Fb} sont opposées, donc parallèles ; le plan de coupe les traverse suivant deux droites parallèles, et son côté sur ${Fa} est ${bon}. C'est juste.`));
      } else {
        lignes.push(t(`Les faces ${Fa} et ${Fb} sont parallèles : sur la face ${Fb}, le côté de la section est parallèle à ${mauvais}.`));
        // Le mauvais côté est sur la face voisine F(1) (si i = 0) ou F(0) (si i = 1).
        const voisine = i === 0 ? F(1) : F(0);
        controles.push(t(`Ligne ${n} : les faces ${Fa} et ${Fb} sont bien parallèles, mais le côté de la section sur ${Fa} est ${bon} ; ${mauvais} est sur la face ${voisine}, qui n'est pas parallèle à ${Fb}. La copie est fausse.`));
        const bout = areteBout(i + 2, Math.random() < 0.5 ? 0 : 1);
        descriptions = descriptionsVariees(t(`${mauvais} n'est pas sur la face ${Fa} : il fallait mener la parallèle à ${bon}.`), [
          t(`Les faces ${Fa} et ${Fb} ne sont pas parallèles : elles ont une arête commune.`),
          t("Deux faces parallèles sont coupées par le plan de coupe suivant deux droites sécantes."),
          t(`Sur la face ${Fb}, le côté de la section est toujours parallèle à une arête.`),
        ]);
        ligneCorrigee = `Les faces ${Fa} et ${Fb} sont parallèles : sur la face ${Fb}, le côté de la section est parallèle à ${bon}.`;
        corrections = propositions(t(ligneCorrigee), [
          t(`Les faces ${Fa} et ${Fb} sont parallèles : sur la face ${Fb}, le côté de la section est parallèle à ${sg("P", "R")}.`),
          t(`Les faces ${voisine} et ${Fb} sont parallèles : sur la face ${Fb}, le côté de la section est parallèle à ${mauvais}.`),
          t(`Les faces ${Fa} et ${Fb} sont parallèles : sur la face ${Fb}, le côté de la section est parallèle à l'arête ${sg(bout[0], bout[1])}.`),
        ]);
        questionCorrection = `Que fallait-il écrire à la ligne ${n} ? Choisis la remarque corrigée.`;
        piege = "Sur un parallélépipède, deux faces OPPOSÉES sont coupées suivant deux côtés parallèles : la parallèle se mène au côté déjà tracé sur la face opposée, pas à un côté d'une face voisine.";
        nomErreur = `parallèle menée à ${mauvais} au lieu de ${bon}`;
        corrigeDroites.push(i === 0 ? [pts[0]!, pts[1]!] : [pts[1]!, pts[2]!]);
      }
    } else {
      const i = coteAux; // côté [PQ] (face F01) ou [QR] (face F12)
      const [A, B] = [NOMS[i]!, NOMS[i + 1]!];
      const cote = dr(A, B);
      const Fc = F(i);
      // Arête de bout de cette face où le côté coupe le plus près.
      const tA = ts[i]!;
      const tB = ts[i + 1]!;
      // (AB) rencontre le bout « début » (t = 0) ou « fin » (t = 1) : on garde le plus proche.
      const bout: 0 | 1 = Math.abs(tA + tB) < Math.abs(2 - tA - tB) ? 0 : 1;
      const xy = areteBout(i, bout);
      const faceBout = nomFace(bout === 0 ? debut : fin);
      const autresBout = [1, 2, 3].map((d) => areteBout(i + d, bout));
      const pa = pts[i]!;
      const pb = pts[i + 1]!;
      const croisees = autresBout.filter((a) => croisementTraits(solide, pa, pb, S3(a[0]), S3(a[1])));
      const fauxXY = choisir(croisees.length > 0 ? croisees : autresBout);
      const phrase = (arete2: [string, string], face: string) => `${cote} et ${dr(arete2[0], arete2[1])} sont dans la face ${face} : elles se coupent en un point qui est à la fois dans le plan de coupe et dans le plan de la face ${faceBout}.`;
      if (!faux) {
        lignes.push(t(phrase(xy, Fc)));
        controles.push(t(`Ligne ${n} : ${dr(xy[0], xy[1])} est une arête de la face ${Fc}, qui contient aussi ${cote} ; ces deux droites ne sont pas parallèles, elles se coupent en un point de ${cote} (donc du plan de coupe) et de ${dr(xy[0], xy[1])} (donc du plan de la face ${faceBout}). C'est juste.`));
      } else {
        lignes.push(t(phrase(fauxXY, Fc)));
        controles.push(t(`Ligne ${n} : ${dr(fauxXY[0], fauxXY[1])} n'est pas une arête de la face ${Fc} : ${cote} et ${dr(fauxXY[0], fauxXY[1])} ne sont pas dans un même plan, leurs traits ne se croisent que sur le dessin. La copie est fausse.`));
        const autreFaux = autresBout.find((a) => a !== fauxXY)!;
        descriptions = descriptionsVariees(t(`${dr(fauxXY[0], fauxXY[1])} n'est pas dans la face ${Fc} : ces deux droites ne se coupent que sur le dessin.`), [
          t(`${cote} et ${dr(fauxXY[0], fauxXY[1])} sont parallèles : elles ne peuvent pas avoir de point commun.`),
          t("Le point existe, mais il est hors du solide : un point auxiliaire doit être sur une arête."),
          t("Le point obtenu est un point déjà connu de la section : il ne sert donc à rien."),
        ]);
        ligneCorrigee = phrase(xy, Fc);
        corrections = propositions(t(ligneCorrigee), [
          t(`${cote} et ${dr(fauxXY[0], fauxXY[1])} sont dans la face ${faceBout} : elles se coupent en un point qui est à la fois dans le plan de coupe et dans le plan de la face ${faceBout}.`),
          t(phrase(autreFaux, Fc)),
          t(`${cote} et ${dr(fauxXY[0], fauxXY[1])} sont parallèles : on ne peut construire aucun point auxiliaire avec ces deux droites de la figure.`),
        ]);
        questionCorrection = `Que fallait-il écrire à la ligne ${n} ? Choisis la remarque corrigée.`;
        piege = "Un point auxiliaire est l'intersection de deux droites situées dans une MÊME face : un côté de la section et une arête de cette face. Deux droites de faces différentes peuvent se croiser sur le dessin sans se couper dans l'espace.";
        nomErreur = `point auxiliaire pris avec ${dr(fauxXY[0], fauxXY[1])}, qui n'est pas dans la face ${Fc}`;
        corrigeDroites.push([pa, pb], [S3(xy[0]), S3(xy[1])]);
      }
    }
  }
  if (!descriptions || !corrections) return null;

  const points = [0, 1, 2].map((i) => ({ nom: NOMS[i]!, position: pts[i]!, milieuDe: e[i]! }));
  const nf = ligneFausse + 1;
  return {
    theme: "section",
    type,
    ligneFausse,
    enonce: t(`Le plan (PQR) coupe ${libelleSolide(solide)} ; P est un point de ${arete(0)}, Q un point de ${arete(1)} et R un point de ${arete(2)}. Pour préparer la construction de la section, un élève a noté trois remarques.`),
    lignes,
    descriptions,
    questionCorrection: t(questionCorrection),
    corrections,
    controles,
    ligneCorrigee: t(ligneCorrigee),
    suite: t(`${suiteSection}Avec les trois remarques justes, la section est le parallélogramme PQRS, où S est sur ${arete(3)}.`),
    piege: t(piege),
    nomErreur,
    aides: [
      [
        t("Pour chaque remarque, vérifie sur quelles arêtes sont les points cités et quelles arêtes contient la face citée."),
        t("Rappels du cours : un côté direct relie deux points d'une même face ; deux faces opposées sont coupées suivant deux côtés parallèles ; un point auxiliaire est l'intersection de deux droites d'une même face."),
      ],
      [
        t(`À la ligne ${nf}, nomme les faces qui contiennent chacun des points ou chacune des droites cités.`),
        t("Une droite est dans une face si ses deux points sont sur des arêtes de cette face (ou en sont les sommets)."),
      ],
      [
        t("La remarque corrigée doit rester vraie quand on la vérifie sur la figure, face par face."),
        t("Pense à la technique des faces parallèles : sur une face qui n'a qu'un point connu, on mène par ce point la parallèle au côté de la face opposée."),
      ],
    ],
    figure: { type: "solide", solide, points, plans: [], dessins: null },
    corrige: { droites: corrigeDroites, plans: [["P", "Q", "R"]], sections: true, points: [{ nom: "S", position: pts[3]! }], dessin: null },
  };
}
