import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import type { DessinLigne, ExerciceDetectiveEspace, TypeErreurEspace } from "../../core/detectiveEspace.types";
import type { NomSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type { MilieuNomme } from "../../core/positionsPlans.types";
import { candidatsDe, dist2D, distanceALaDroite2D, ligneLisible, pixel, seauxPaires, seauxTriplets, type Candidat, type PaireBrute } from "../deuxDroitesPlan";
import { GABARITS_SOLIDE3D } from "../solide3D/gabarits";
import { points3Colineaires } from "../solide3D/geometrieEspace";
import { LETTRES, choisir, contient, definitions, dr, libelleSolide, listeEt, melanger, nommerPlan, pl, plansDesPoints, descriptionsVariees, propositionsVariees, t, type PointNomme } from "./commun";

/**
 * Thème « plan » de gen107 : pour trois jeux de données — trois points, une droite et un point,
 * deux droites (un de chaque, dans un ordre tiré au hasard) —, un élève affirme à chaque ligne
 * qu'elles « déterminent un seul plan ». Toutes les lignes ont la même forme : seule la figure dit
 * laquelle est fausse.
 *
 * Types d'erreur (tirés à parts égales, avant le reste) = le jeu de données qui ne détermine PAS de
 * plan : `pointsAlignes` (trois points alignés — fiche), `pointSurDroite` (le point est sur la
 * droite), `droitesGauches` (deux droites gauches). La ligne fausse est tirée à parts égales,
 * indépendamment du type.
 *
 * Anti-devinette : le nombre de points définis (milieux, centres de faces) d'un jeu de données est
 * tiré avec les MÊMES poids qu'il soit juste ou faux (comme gen100) ; une droite confondue avec une
 * arête ne porte jamais un point « sur la droite » trivial (milieu de cette arête).
 */

type Genre = "troisPoints" | "droitePoint" | "deuxDroites";

const GENRE_DU_TYPE: Record<"pointsAlignes" | "pointSurDroite" | "droitesGauches", Genre> = {
  pointsAlignes: "troisPoints",
  pointSurDroite: "droitePoint",
  droitesGauches: "deuxDroites",
};

const SOLIDES: NomSolide3D[] = ["cube", "parallelepipede", "prisme", "pyramideCarree"];
const MAX_DEFINIS = 4;

function tirerPondere<T>(options: [T, number][]): T {
  const total = options.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [v, p] of options) {
    r -= p;
    if (r <= 0) return v;
  }
  return options[options.length - 1]![0];
}

// --- Une droite et un point --------------------------------------------------------------------

interface DroitePointBrut {
  points: [Candidat, Candidat, Candidat];
  surDroite: boolean;
  nonSommets: number;
}

function surUneArete(solide: Solide3D, p: Candidat, q: Candidat): boolean {
  return solide.faces.some((f) =>
    f.some((a, i) => {
      const b = f[(i + 1) % f.length]!;
      return points3Colineaires(solide.sommets[a]!, solide.sommets[b]!, p.position) && points3Colineaires(solide.sommets[a]!, solide.sommets[b]!, q.position);
    }),
  );
}

const CACHE_DP = new Map<string, Map<string, DroitePointBrut[]>>();

function seauxDroitePoint(solide: Solide3D): Map<string, DroitePointBrut[]> {
  let seaux = CACHE_DP.get(solide.id);
  if (seaux) return seaux;
  seaux = new Map();
  const cands = candidatsDe(solide, true);
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      const p = cands[i]!;
      const q = cands[j]!;
      if (!ligneLisible(solide, p, q)) continue;
      const arete = surUneArete(solide, p, q);
      // une droite définie par un milieu et confondue avec une arête : c'est l'arête sous un autre nom
      if (arete && !(p.sommet && q.sommet)) continue;
      const pp = pixel(solide, p.position);
      const pq = pixel(solide, q.position);
      for (const r of cands) {
        if (r === p || r === q) continue;
        const nonSommets = [p, q, r].filter((c) => !c.sommet).length;
        if (nonSommets === 0) continue;
        const pr = pixel(solide, r.position);
        if (dist2D(pr, pp) < 18 || dist2D(pr, pq) < 18) continue;
        const surDroite = points3Colineaires(p.position, q.position, r.position);
        if (surDroite && arete) continue; // milieu de l'arête : trivial
        if (!surDroite && distanceALaDroite2D(pr, pp, pq) < 14) continue; // semble sur la droite
        // un point défini ne doit pas se dessiner sur un sommet
        if (!r.sommet && Object.values(solide.sommets).some((s) => dist2D(pixel(solide, s), pr) < 14)) continue;
        const cle = `${surDroite ? "sur" : "hors"}|${nonSommets}`;
        const liste = seaux.get(cle) ?? [];
        liste.push({ points: [p, q, r], surDroite, nonSommets });
        seaux.set(cle, liste);
      }
    }
  }
  CACHE_DP.set(solide.id, seaux);
  return seaux;
}

// --- Tirage --------------------------------------------------------------------------------------

interface ItemPlan {
  genre: Genre;
  /** troisPoints : X, Y, Z ; droitePoint : P, Q (droite) puis R ; deuxDroites : P, Q puis R, S. */
  points: Candidat[];
  determine: boolean;
  paire: PaireBrute | null;
}

function nonSommetsDe(cs: Candidat[]): string[] {
  return cs.filter((c) => !c.sommet).map((c) => c.cle);
}

function tirerItem(solide: Solide3D, genre: Genre, determine: boolean, definis: Set<string>): ItemPlan | null {
  const accepte = (cs: Candidat[]) => new Set([...definis, ...nonSommetsDe(cs)]).size <= MAX_DEFINIS;
  if (genre === "troisPoints") {
    const n = tirerPondere<number>([
      [1, 0.6],
      [3, 0.4],
    ]);
    const seau = (seauxTriplets(solide).get(`${determine ? "libres" : "alignes"}|${n}`) ?? []).filter((x) => accepte(x.points));
    if (seau.length === 0) return null;
    return { genre, points: melanger(choisir(seau).points), determine, paire: null };
  }
  if (genre === "droitePoint") {
    const n = tirerPondere<number>([
      [1, 0.4],
      [2, 0.3],
      [3, 0.3],
    ]);
    const seau = (seauxDroitePoint(solide).get(`${determine ? "hors" : "sur"}|${n}`) ?? []).filter((x) => accepte(x.points));
    if (seau.length === 0) return null;
    const x = choisir(seau);
    const [p, q] = Math.random() < 0.5 ? [x.points[0], x.points[1]] : [x.points[1], x.points[0]];
    return { genre, points: [p, q, x.points[2]], determine, paire: null };
  }
  const milieux = tirerPondere<number>([
    [0, 0.35],
    [2, 0.65],
  ]);
  const positions = determine ? [Math.random() < 0.5 ? "secantes" : "paralleles"] : ["gauches"];
  const seau = [...seauxPaires(solide).entries()]
    .filter(([cle]) => positions.includes(cle.split("|")[0]!) && cle.endsWith(`|${milieux}`))
    .flatMap(([, v]) => v)
    .filter((p) => accepte([p.lignes[0].p, p.lignes[0].q, p.lignes[1].p, p.lignes[1].q]));
  if (seau.length === 0) return null;
  const paire = choisir(seau);
  const [l1, l2] = Math.random() < 0.5 ? [paire.lignes[0], paire.lignes[1]] : [paire.lignes[1], paire.lignes[0]];
  const a = Math.random() < 0.5 ? [l1.p, l1.q] : [l1.q, l1.p];
  const b = Math.random() < 0.5 ? [l2.p, l2.q] : [l2.q, l2.p];
  return { genre, points: [...a, ...b], determine, paire };
}

export function genererPlan(type: TypeErreurEspace, ligneFausse: number): ExerciceDetectiveEspace {
  const genreFaux = GENRE_DU_TYPE[type as keyof typeof GENRE_DU_TYPE];
  // Ordre des deux autres jeux de données : tiré avant la boucle de rejet.
  const autres = melanger((["troisPoints", "droitePoint", "deuxDroites"] as Genre[]).filter((g) => g !== genreFaux));
  const genres: Genre[] = [0, 1, 2].map((i) => (i === ligneFausse ? genreFaux : autres[[0, 1, 2].filter((k) => k !== ligneFausse).indexOf(i)]!));
  for (let essai = 0; essai < 600; essai++) {
    const solide = GABARITS_SOLIDE3D[choisir(SOLIDES)];
    const definis = new Set<string>();
    const items: (ItemPlan | null)[] = [null, null, null];
    // Ordre de remplissage tiré au hasard : le plafond de points définis pèse autant sur chaque ligne.
    const ordre = melanger([0, 1, 2]);
    let ok = true;
    for (const i of ordre) {
      const item = tirerItem(solide, genres[i]!, i !== ligneFausse, definis);
      if (!item) {
        ok = false;
        break;
      }
      for (const c of nonSommetsDe(item.points)) definis.add(c);
      items[i] = item;
    }
    if (!ok) continue;
    // Jamais deux fois exactement les mêmes points dans deux lignes.
    const cles = items.map((x) => x!.points.map((c) => c.cle).sort().join(","));
    if (new Set(cles).size < 3) continue;
    const exercice = construire(type as keyof typeof GENRE_DU_TYPE, ligneFausse, solide, items as ItemPlan[]);
    if (exercice) return exercice;
  }
  throw new Error("gen107 (plan) : aucune copie trouvée");
}

// --- Rédaction -----------------------------------------------------------------------------------

function construire(type: keyof typeof GENRE_DU_TYPE, ligneFausse: number, solide: Solide3D, items: ItemPlan[]): ExerciceDetectiveEspace | null {
  const sommets = Object.keys(solide.sommets);
  const noms = new Map<string, string>();
  const definis: MilieuNomme[] = [];
  const defs: { nom: string; definition: string }[] = [];
  // Lettres attribuées dans l'ordre d'apparition dans la copie.
  for (const it of items) {
    for (const c of it.points) {
      if (c.sommet || noms.has(c.cle)) continue;
      const nom = LETTRES[definis.length]!;
      noms.set(c.cle, nom);
      definis.push({ nom, position: c.position, milieuDe: ["", ""] });
      defs.push({ nom, definition: c.definition! });
    }
  }
  const nomDe = (c: Candidat) => c.sommet ?? noms.get(c.cle)!;
  const nommes: PointNomme[] = [...Object.entries(solide.sommets).map(([nom, position]) => ({ nom, position })), ...definis.map((d) => ({ nom: d.nom, position: d.position }))];
  const plans = plansDesPoints(nommes);
  const nomsPlans = new Map<PointNomme[], string[]>();
  const nomListe = (plan: PointNomme[], interdits: string[] = []): string[] => {
    if (!nomsPlans.has(plan)) nomsPlans.set(plan, nommerPlan(plan, sommets, [], interdits)!);
    return nomsPlans.get(plan)!;
  };

  const lignes: FragmentConsigne[][] = items.map((it) => {
    const n = it.points.map(nomDe);
    if (it.genre === "troisPoints") return t(`Les points ${listeEt(n)} déterminent un seul plan : le plan ${pl(n)}.`);
    if (it.genre === "droitePoint") return t(`La droite ${dr(n[0]!, n[1]!)} et le point ${n[2]} déterminent un seul plan : le plan ${pl(n)}.`);
    return t(`Les droites ${dr(n[0]!, n[1]!)} et ${dr(n[2]!, n[3]!)} déterminent un seul plan : le plan ${pl(n.slice(0, 3))}.`);
  });

  /** Gauches : plan témoin (contient la première droite et R, pas S). */
  const temoinGauches = (n: string[]) => plans.find((p) => contient(p, n[0]!) && contient(p, n[1]!) && contient(p, n[2]!))!;

  const controles: FragmentConsigne[][] = items.map((it, i) => {
    const n = it.points.map(nomDe);
    const fin = i === ligneFausse ? " La copie est fausse." : " C'est juste.";
    let phrase: string;
    if (it.genre === "troisPoints") phrase = it.determine ? `les points ${listeEt(n)} ne sont pas alignés : ils déterminent un seul plan.` : `les points ${listeEt(n)} sont alignés : une infinité de plans passent par ces trois points.`;
    else if (it.genre === "droitePoint") phrase = it.determine ? `le point ${n[2]} n'est pas sur la droite ${dr(n[0]!, n[1]!)} : ils déterminent un seul plan.` : `le point ${n[2]} est sur la droite ${dr(n[0]!, n[1]!)} : une infinité de plans contiennent cette droite et ce point.`;
    else if (it.determine) phrase = `les droites ${dr(n[0]!, n[1]!)} et ${dr(n[2]!, n[3]!)} sont ${it.paire!.position === "secantes" ? "sécantes" : "parallèles"} : elles déterminent un seul plan.`;
    else {
      const q = nomListe(temoinGauches(n));
      phrase = `les droites ${dr(n[0]!, n[1]!)} et ${dr(n[2]!, n[3]!)} sont gauches (le plan ${pl(q)} contient ${dr(n[0]!, n[1]!)} et ${n[2]}, mais pas ${n[3]}) : aucun plan ne les contient toutes les deux.`;
    }
    return t(`Ligne ${i + 1} : ${phrase}${fin}`);
  });

  const it = items[ligneFausse]!;
  const n = it.points.map(nomDe);
  const ligne = ligneFausse + 1;

  // Plans qui contiennent les données fausses (leurres « un seul plan ») — jamais nommés par un
  // triplet aligné (impossible) ni par les seules données.
  let descriptions;
  let corrections;
  let ligneCorrigee: string;
  let piege: string;
  let nomErreur: string;
  let dessinCorrige: [Point3D, Point3D][] = [];
  let planCorrige: string[] | null = null;
  const pos = (c: Candidat) => c.position;
  if (type === "pointsAlignes") {
    const contenant = plans.filter((p) => n.every((x) => contient(p, x)));
    if (contenant.length === 0) return null;
    const unPlan = pl(nomListe(choisir(contenant)));
    const donnees = `Les points ${listeEt(n)}`;
    descriptions = descriptionsVariees(t(`Les points ${listeEt(n)} sont alignés : ils sont tous les trois sur une même droite.`), [
      t("Trois points ne déterminent un plan que s'ils sont tous des sommets du solide."),
      t("Il faut au moins quatre points, et non trois, pour déterminer un seul plan."),
      t(`Le plan ${pl(n)} n'est pas une face du solide : ce plan n'existe donc pas.`),
    ]);
    ligneCorrigee = `${donnees} ne déterminent pas de plan : ils sont alignés, et une infinité de plans les contiennent.`;
    corrections = propositionsVariees(t(ligneCorrigee), [
      t(`${donnees} ne déterminent pas de plan : ils sont alignés, et donc aucun plan ne peut les contenir.`),
      t(`${donnees} déterminent un seul plan : le plan ${unPlan}, qui contient bien ces trois points à la fois.`),
      t(`${donnees} déterminent un seul plan : ces trois points ne sont pas tous des sommets du solide dessiné.`),
    ]);
    piege = "Trois points ne déterminent un seul plan que s'ils ne sont pas alignés. Un milieu est sur son arête ; le centre d'une face est sur ses diagonales et sur les droites qui joignent les milieux de deux côtés opposés.";
    nomErreur = "trois points alignés";
    const [a, b] = [it.points[0]!, it.points[1]!];
    dessinCorrige = [[pos(a), pos(b)]];
  } else if (type === "pointSurDroite") {
    const contenant = plans.filter((p) => n.every((x) => contient(p, x)));
    if (contenant.length === 0) return null;
    const unPlan = pl(nomListe(choisir(contenant)));
    const donnees = `La droite ${dr(n[0]!, n[1]!)} et le point ${n[2]}`;
    descriptions = descriptionsVariees(t(`Le point ${n[2]} est sur la droite ${dr(n[0]!, n[1]!)} : la droite et le point ne suffisent pas.`), [
      t("Une droite et un point ne déterminent jamais un plan, quelle que soit leur position."),
      t("Le point doit être un sommet du solide pour déterminer un plan avec une droite."),
      t(`Le plan ${pl(n)} n'est pas une face du solide : ce plan n'existe donc pas.`),
    ]);
    ligneCorrigee = `${donnees} ne déterminent pas de plan : le point est sur la droite, et une infinité de plans les contiennent.`;
    corrections = propositionsVariees(t(ligneCorrigee), [
      t(`${donnees} ne déterminent pas de plan : le point est sur la droite, et donc aucun plan ne peut les contenir.`),
      t(`${donnees} déterminent un seul plan : le plan ${unPlan}, qui contient bien la droite et le point à la fois.`),
      t(`${donnees} déterminent un seul plan : le point n'est pas un sommet du solide, ni une extrémité de la droite.`),
    ]);
    piege = "Une droite et un point déterminent un seul plan seulement si le point n'est PAS sur la droite. Un centre de face est sur les diagonales de cette face ; le milieu d'une arête est sur les droites qui le relient aux extrémités de cette arête.";
    nomErreur = "point situé sur la droite";
    dessinCorrige = [[pos(it.points[0]!), pos(it.points[1]!)]];
  } else {
    const temoin = temoinGauches(n);
    const q = pl(nomListe(temoin));
    const donnees = `Les droites ${dr(n[0]!, n[1]!)} et ${dr(n[2]!, n[3]!)}`;
    descriptions = descriptionsVariees(t(`Les droites ${dr(n[0]!, n[1]!)} et ${dr(n[2]!, n[3]!)} sont gauches : aucun plan ne les contient toutes les deux.`), [
      t("Deux droites ne déterminent un plan que si elles sont sécantes, jamais si elles sont parallèles."),
      t("Deux droites qui ne se coupent pas ne déterminent jamais un seul plan, quelles qu'elles soient."),
      t(`Le plan ${pl(n.slice(0, 3))} n'est pas une face du solide : ce plan n'existe donc pas.`),
    ]);
    ligneCorrigee = `${donnees} ne déterminent pas de plan : elles sont gauches, car le plan ${q} ne contient pas ${n[3]}.`;
    corrections = propositionsVariees(t(ligneCorrigee), [
      t(`${donnees} ne déterminent pas de plan : elles sont gauches, et une infinité de plans les contiennent.`),
      t(`${donnees} déterminent un seul plan : le plan ${q}, qui contient bien ${dr(n[0]!, n[1]!)} et le point ${n[2]}.`),
      t(`${donnees} déterminent un seul plan : ces deux droites du solide n'ont aucun point commun.`),
    ]);
    piege = "Deux droites déterminent un plan seulement si elles sont sécantes ou parallèles. Deux droites gauches ne sont dans aucun plan commun, même si leurs traits se croisent sur le dessin.";
    nomErreur = "droites gauches";
    dessinCorrige = [
      [pos(it.points[0]!), pos(it.points[1]!)],
      [pos(it.points[2]!), pos(it.points[3]!)],
    ];
    planCorrige = nomListe(temoin);
  }

  const dessins: DessinLigne[] = items.map((x) => {
    const p = x.points.map(pos);
    if (x.genre === "troisPoints") return { droites: [], points: p };
    if (x.genre === "droitePoint") return { droites: [[p[0]!, p[1]!]], points: [p[2]!] };
    return { droites: [[p[0]!, p[1]!], [p[2]!, p[3]!]], points: [] };
  });
  const intro = definitions(defs);
  return {
    theme: "plan",
    type,
    ligneFausse,
    enonce: t(`Voici ${libelleSolide(solide)}${intro ? ` ; ${intro}` : "."} Pour chaque ligne, un élève a dit si les données déterminent un seul plan.`),
    lignes,
    descriptions,
    questionCorrection: t(`Que fallait-il écrire à la ligne ${ligne} ? Choisis la ligne corrigée.`),
    corrections,
    controles,
    ligneCorrigee: t(ligneCorrigee),
    suite: null,
    piege: t(piege),
    nomErreur,
    aides: [
      [
        t("Rappel du cours : un seul plan est déterminé par trois points non alignés, une droite et un point extérieur à la droite, ou deux droites sécantes ou parallèles."),
        t("Pour chaque ligne, vérifie sur la figure la condition qui manque souvent : les points sont-ils alignés ? le point est-il sur la droite ? les droites sont-elles gauches ?"),
      ],
      [
        t(`Relis les données de la ligne ${ligne} et place-les sur la figure.`),
        t("Repère où sont les points définis : un milieu est sur son arête, le centre d'une face est sur ses diagonales."),
      ],
      [
        t("Quand les données ne déterminent pas de plan, demande-toi combien de plans les contiennent : aucun, ou une infinité ?"),
        t("Trois points alignés, ou une droite et un point de cette droite : on peut faire « tourner » un plan autour de la droite. Deux droites gauches : aucun plan ne contient les deux."),
      ],
    ],
    figure: { type: "solide", solide, points: definis, plans: [], dessins },
    corrige: { droites: dessinCorrige, plans: planCorrige ? [planCorrige as [string, string, string]] : [], sections: false, points: [], dessin: null },
  };
}
