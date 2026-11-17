import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveEspace, TypeErreurEspace } from "../../core/detectiveEspace.types";
import type { PositionDeuxDroites } from "../../core/deuxDroitesPlan.types";
import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type { MilieuNomme } from "../../core/positionsPlans.types";
import { SOLIDES_DEUX_DROITES, seauxPaires, type Candidat, type PaireBrute } from "../deuxDroitesPlan";
import { GABARITS_SOLIDE3D } from "../solide3D/gabarits";
import { LETTRES, choisir, contient, definitions, dr, faceContenant, libelleSolide, melanger, nommerPlan, pl, plansDesPoints, descriptionsVariees, propositionsVariees, t, type PointNomme } from "./commun";

/**
 * Thème « droites » de gen107 : un élève donne la position relative de TROIS paires de droites d'un
 * solide (une ligne par paire). Chaque position — sécantes, parallèles, gauches — est écrite une fois
 * dans la copie, dans un ordre tiré au hasard : le mot écrit sur une ligne ne désigne jamais la ligne
 * fausse. Les paires viennent de l'énumération de gen100 (`seauxPaires` : lisibilité du dessin,
 * croisement des traits, position du point commun).
 *
 * Types d'erreur (tirés à parts égales, avant le reste, par l'appelant) :
 * - `croisementApparent` : la copie écrit « sécantes » pour deux droites GAUCHES dont les traits se
 *   croisent sur le dessin ;
 * - `pasDeCroisement` : la copie écrit « parallèles » pour deux droites GAUCHES dont les traits ne
 *   se croisent pas sur le dessin (point de la liste « Avant de rendre ta copie » du cours) ;
 * - `faceCommune` : la copie écrit « gauches » pour deux droites d'un même plan qui n'est pas une
 *   face (plan diagonal, plan par des milieux) — parallèles ou sécantes, à parts égales.
 * La ligne fausse est tirée à parts égales parmi les trois, indépendamment du type.
 */

type Verdict = PositionDeuxDroites;

const MOTS: Record<Verdict, string> = { secantes: "sécantes", paralleles: "parallèles", gauches: "gauches" };

const AFFICHE: Record<"croisementApparent" | "pasDeCroisement" | "faceCommune", Verdict> = {
  croisementApparent: "secantes",
  pasDeCroisement: "paralleles",
  faceCommune: "gauches",
};

const CACHE = new Map<string, PaireBrute[]>();

function toutesPaires(solide: Solide3D): PaireBrute[] {
  let liste = CACHE.get(solide.id);
  if (!liste) {
    liste = [...seauxPaires(solide).values()].flat();
    CACHE.set(solide.id, liste);
  }
  return liste;
}

function quatre(p: PaireBrute): Candidat[] {
  return [p.lignes[0].p, p.lignes[0].q, p.lignes[1].p, p.lignes[1].q];
}

function aUneFaceCommune(solide: Solide3D, p: PaireBrute): boolean {
  return faceContenant(solide, quatre(p).map((c) => c.position)) >= 0;
}

const cleLigne = (a: Candidat, b: Candidat) => [a.cle, b.cle].sort().join("-");

interface Item {
  paire: PaireBrute;
  /** Points dans l'ordre d'écriture : (PQ) et (RS). */
  pts: [Candidat, Candidat, Candidat, Candidat];
}

function orienter(p: PaireBrute): Item {
  const [l1, l2] = Math.random() < 0.5 ? [p.lignes[0], p.lignes[1]] : [p.lignes[1], p.lignes[0]];
  const a = Math.random() < 0.5 ? [l1.p, l1.q] : [l1.q, l1.p];
  const b = Math.random() < 0.5 ? [l2.p, l2.q] : [l2.q, l2.p];
  return { paire: p, pts: [a[0]!, a[1]!, b[0]!, b[1]!] };
}

/** Une paire compatible avec celles déjà choisies : aucune droite répétée, au plus 4 points définis. */
function compatible(p: PaireBrute, lignesVues: Set<string>, nonSommets: Set<string>): boolean {
  if (lignesVues.has(cleLigne(p.lignes[0].p, p.lignes[0].q)) || lignesVues.has(cleLigne(p.lignes[1].p, p.lignes[1].q))) return false;
  const nouveaux = new Set(nonSommets);
  for (const c of quatre(p)) if (!c.sommet) nouveaux.add(c.cle);
  return nouveaux.size <= 4;
}

function retenir(p: PaireBrute, lignesVues: Set<string>, nonSommets: Set<string>) {
  lignesVues.add(cleLigne(p.lignes[0].p, p.lignes[0].q));
  lignesVues.add(cleLigne(p.lignes[1].p, p.lignes[1].q));
  for (const c of quatre(p)) if (!c.sommet) nonSommets.add(c.cle);
}

export function genererDroites(type: TypeErreurEspace, ligneFausse: number): ExerciceDetectiveEspace {
  const typeD = type as keyof typeof AFFICHE;
  // Tirés AVANT la boucle de rejet : vraie position d'une paire « faceCommune », ordre des deux autres mots.
  const vraieFaceCommune: Verdict = Math.random() < 0.5 ? "paralleles" : "secantes";
  const affiche = AFFICHE[typeD];
  const autresMots = melanger((["secantes", "paralleles", "gauches"] as Verdict[]).filter((v) => v !== affiche));

  for (let essai = 0; essai < 2000; essai++) {
    const solide = GABARITS_SOLIDE3D[choisir(SOLIDES_DEUX_DROITES)];
    const paires = toutesPaires(solide);
    const estFausse = (p: PaireBrute) => {
      if (typeD === "croisementApparent") return p.position === "gauches" && p.croisement;
      if (typeD === "pasDeCroisement") return p.position === "gauches" && !p.croisement;
      return p.position === vraieFaceCommune && !aUneFaceCommune(solide, p);
    };
    // Nombre de milieux de chaque paire (0 ou 2), tiré avec les MÊMES poids pour chaque ligne, juste
    // ou fausse ; les lignes sont remplies dans un ordre tiré au hasard (le plafond de points
    // définis ne pèse ainsi pas davantage sur les lignes justes que sur la fausse).
    const milieux = [0, 1, 2].map(() => (Math.random() < 0.5 ? 0 : 2));
    const autresLignes = [0, 1, 2].filter((i) => i !== ligneFausse);
    const filtre = (i: number) => (p: PaireBrute) => p.nbMilieux === milieux[i] && (i === ligneFausse ? estFausse(p) : p.position === autresMots[autresLignes.indexOf(i)]);
    const lignesVues = new Set<string>();
    const nonSommets = new Set<string>();
    const choisies: (PaireBrute | null)[] = [null, null, null];
    let ok = true;
    for (const i of melanger([0, 1, 2])) {
      const candidates = paires.filter((p) => filtre(i)(p) && compatible(p, lignesVues, nonSommets));
      if (candidates.length === 0) {
        ok = false;
        break;
      }
      const p = choisir(candidates);
      retenir(p, lignesVues, nonSommets);
      choisies[i] = p;
    }
    if (!ok) continue;
    const mots: Verdict[] = [0, 1, 2].map((i) => (i === ligneFausse ? affiche : autresMots[autresLignes.indexOf(i)]!));
    const exercice = construire(typeD, ligneFausse, solide, (choisies as PaireBrute[]).map(orienter), mots);
    if (exercice) return exercice;
  }
  throw new Error("gen107 (droites) : aucune copie trouvée");
}

// ---------------------------------------------------------------------------------------------
// Rédaction
// ---------------------------------------------------------------------------------------------

function construire(type: keyof typeof AFFICHE, ligneFausse: number, solide: Solide3D, items: Item[], mots: Verdict[]): ExerciceDetectiveEspace | null {
  const sommets = Object.keys(solide.sommets);
  // Lettres des points définis, dans l'ordre d'apparition.
  const noms = new Map<string, string>();
  const definis: MilieuNomme[] = [];
  const defs: { nom: string; definition: string }[] = [];
  for (const it of items) {
    for (const c of it.pts) {
      if (c.sommet || noms.has(c.cle)) continue;
      const nom = LETTRES[definis.length]!;
      noms.set(c.cle, nom);
      const [a, b] = c.cle.slice(1).split("") as [string, string];
      definis.push({ nom, position: c.position, milieuDe: [a, b] });
      defs.push({ nom, definition: c.definition! });
    }
  }
  const nomDe = (c: Candidat) => c.sommet ?? noms.get(c.cle)!;
  const nommes: PointNomme[] = [...Object.entries(solide.sommets).map(([nom, position]) => ({ nom, position })), ...definis.map((d) => ({ nom: d.nom, position: d.position }))];
  const plans = plansDesPoints(nommes);
  // Chaque plan reçoit UN nom, le même dans la copie, les propositions et le corrigé.
  const nomsPlans = new Map<PointNomme[], string[]>();
  const nomListe = (plan: PointNomme[]): string[] => {
    if (!nomsPlans.has(plan)) nomsPlans.set(plan, nommerPlan(plan, sommets)!);
    return nomsPlans.get(plan)!;
  };
  const nomPlan = (plan: PointNomme[]) => pl(nomListe(plan));

  const texteDroites = (it: Item) => {
    const [P, Q, R, S] = it.pts.map(nomDe) as [string, string, string, string];
    return { P, Q, R, S, d1: dr(P, Q), d2: dr(R, S) };
  };

  const lignes: FragmentConsigne[][] = items.map((it, i) => {
    const { d1, d2 } = texteDroites(it);
    return t(`${d1} et ${d2} sont ${MOTS[mots[i]!]}.`);
  });

  /** Plan commun (sécantes, parallèles) ou plan témoin d'une paire gauche. */
  interface Preuve {
    plan: PointNomme[];
    phrase: string;
    /** Gauches : droite contenue, point de l'autre dans le plan, point hors du plan. */
    temoin?: { dc: string; r: string; s: string };
  }
  const preuve = (it: Item): Preuve => {
    const { P, Q, R, S, d1, d2 } = texteDroites(it);
    const pos = it.paire.position;
    if (pos !== "gauches") {
      const plan = plans.find((p) => [P, Q, R, S].every((n) => contient(p, n)))!;
      if (pos === "paralleles") return { plan, phrase: `${d1} et ${d2} sont dans le plan ${nomPlan(plan)} et n'ont aucun point commun : elles sont parallèles.` };
      const lieu = it.paire.lieu!;
      const ou = lieu.type === "nomme" ? ` (en ${nommes.find((n) => Math.hypot(n.position.x - it.paire.inter!.x, n.position.y - it.paire.inter!.y, n.position.z - it.paire.inter!.z) < 1e-6)!.nom})` : lieu.type === "hors" ? " (en un point situé hors du solide)" : " (en un point du solide qui n'est pas nommé)";
      return { plan, phrase: `${d1} et ${d2} sont dans le plan ${nomPlan(plan)} et ne sont pas parallèles : elles sont sécantes${ou}.` };
    }
    const [contenue, autre] = Math.random() < 0.5 ? [[P, Q], [R, S]] : [[R, S], [P, Q]];
    const [r, s] = Math.random() < 0.5 ? [autre[0]!, autre[1]!] : [autre[1]!, autre[0]!];
    const plan = plans.find((p) => contient(p, contenue[0]!) && contient(p, contenue[1]!) && contient(p, r))!;
    const dc = dr(contenue[0]!, contenue[1]!);
    return {
      plan,
      temoin: { dc, r, s },
      phrase: `Le plan ${nomPlan(plan)} contient ${dc} et le point ${r}, mais pas le point ${s} : aucun plan ne contient les deux droites, elles sont gauches.`,
    };
  };

  const preuves = items.map(preuve);
  const controles: FragmentConsigne[][] = items.map((_, i) => {
    const juste = i !== ligneFausse;
    return t(`Ligne ${i + 1} : ${preuves[i]!.phrase} ${juste ? "C'est juste." : `La copie dit « ${MOTS[mots[i]!]} » : c'est faux.`}`);
  });

  const it = items[ligneFausse]!;
  const pf = preuves[ligneFausse]!;
  const { P, Q, R, S, d1, d2 } = texteDroites(it);
  const vrai = it.paire.position;
  const n = ligneFausse + 1;

  // --- Écran b : l'erreur ----------------------------------------------------------------------
  let correcte: string;
  let leurres: string[];
  if (type === "croisementApparent") {
    correcte = `${d1} et ${d2} ne se coupent que sur le dessin : aucun plan ne contient ces deux droites.`;
    leurres = [
      `${d1} et ${d2} ont la même direction : elles sont parallèles, donc pas sécantes.`,
      `${d1} et ${d2} sont dans un même plan, mais leur point commun est hors du solide.`,
      `${d1} et ${d2} ne sont pas dans une même face du solide : elles ne peuvent pas se couper.`,
    ];
  } else if (type === "pasDeCroisement") {
    correcte = `${d1} et ${d2} n'ont pas la même direction, et aucun plan ne contient ces deux droites.`;
    leurres = [
      `${d1} et ${d2} sont dans un même plan et se coupent hors du dessin : elles sont sécantes.`,
      `${d1} et ${d2} sont parallèles, mais il fallait citer une droite parallèle aux deux.`,
      `${d1} et ${d2} ne sont pas dans une même face : elles ne peuvent donc pas être parallèles.`,
    ];
  } else {
    correcte = `${d1} et ${d2} sont dans un même plan, même si ce plan n'est pas une face du solide.`;
    leurres = [
      `${d1} et ${d2} se croisent sur le dessin : elles sont donc forcément sécantes.`,
      `${d1} et ${d2} sont gauches, mais il fallait citer le plan qui contient les deux.`,
      `${d1} et ${d2} sont gauches, car l'une des deux droites traverse l'intérieur du solide.`,
    ];
  }
  const descriptions = descriptionsVariees(t(correcte), leurres.map(t));

  // --- Écran c : la ligne corrigée ---------------------------------------------------------------
  const planNom = nomPlan(pf.plan);
  let ligneCorrigee: string;
  let leurresC: string[];
  if (vrai === "gauches") {
    const { dc, r, s } = pf.temoin!;
    ligneCorrigee = `${d1} et ${d2} sont gauches : le plan ${planNom} contient ${dc} et le point ${r}, mais pas le point ${s}.`;
    leurresC = [
      `${d1} et ${d2} sont gauches : le plan ${planNom} contient ${dc} et le point ${s}, mais pas le point ${r}.`,
      `${d1} et ${d2} sont sécantes : le plan ${planNom} contient les deux droites, non parallèles.`,
      `${d1} et ${d2} sont gauches : elles ne sont ni dans une même face du solide, ni parallèles.`,
    ];
  } else {
    // Plan qui contient une seule des deux droites (mauvais plan).
    const unSeul = plans.filter((p) => (contient(p, P) && contient(p, Q)) !== (contient(p, R) && contient(p, S)) && ((contient(p, P) && contient(p, Q)) || (contient(p, R) && contient(p, S))));
    if (unSeul.length === 0) return null;
    const mauvais = nomPlan(choisir(unSeul));
    if (vrai === "paralleles") {
      ligneCorrigee = `${d1} et ${d2} sont parallèles : elles sont toutes deux dans le plan ${planNom} et n'ont aucun point commun.`;
      leurresC = [
        `${d1} et ${d2} sont parallèles : elles sont toutes deux dans le plan ${mauvais} et n'ont aucun point commun.`,
        `${d1} et ${d2} sont sécantes : elles sont toutes deux dans le plan ${planNom} et ne sont pas parallèles.`,
        `${d1} et ${d2} sont gauches : aucun plan ne contient à la fois ces deux droites du solide.`,
      ];
    } else {
      ligneCorrigee = `${d1} et ${d2} sont sécantes : elles sont toutes deux dans le plan ${planNom} et ne sont pas parallèles.`;
      leurresC = [
        `${d1} et ${d2} sont sécantes : elles sont toutes deux dans le plan ${mauvais} et ne sont pas parallèles.`,
        `${d1} et ${d2} sont parallèles : elles sont toutes deux dans le plan ${planNom} et n'ont aucun point commun.`,
        `${d1} et ${d2} sont gauches : aucun plan ne contient à la fois ces deux droites du solide.`,
      ];
    }
  }
  const corrections = propositionsVariees(t(ligneCorrigee), leurresC.map(t));

  const piege: Record<typeof type, string> = {
    croisementApparent: "Deux traits qui se croisent sur le dessin ne représentent pas forcément deux droites sécantes : le dessin écrase la profondeur. Deux droites sont sécantes seulement si un plan les contient toutes les deux et qu'elles ne sont pas parallèles.",
    pasDeCroisement: "Deux droites qui ne se croisent pas sur le dessin ne sont pas forcément parallèles : elles peuvent être gauches. Des droites parallèles ont la même direction ET sont dans un même plan.",
    faceCommune: "Un plan n'est pas forcément une face du solide : plans diagonaux et plans passant par des milieux contiennent aussi des droites sécantes ou parallèles. « Pas de face commune » ne veut pas dire « gauches ».",
  };
  const nomErreur: Record<typeof type, string> = {
    croisementApparent: "croisement des traits sur le dessin pris pour un point commun",
    pasDeCroisement: "droites sans croisement sur le dessin déclarées parallèles",
    faceCommune: "droites d'un même plan déclarées gauches faute de face commune",
  };

  const pos = (c: Candidat): Point3D => c.position;
  const intro = definitions(defs);
  return {
    theme: "droites",
    type,
    ligneFausse,
    enonce: t(`Voici ${libelleSolide(solide)}${intro ? ` ; ${intro}` : "."} Un élève a donné la position relative de trois paires de droites (sécantes, parallèles ou gauches).`),
    lignes,
    descriptions,
    questionCorrection: t(`Que fallait-il écrire à la ligne ${n} ? Choisis la ligne corrigée, juste et correctement justifiée.`),
    corrections,
    controles,
    ligneCorrigee: t(ligneCorrigee),
    suite: null,
    piege: t(piege[type]),
    nomErreur: nomErreur[type],
    aides: [
      [
        t("Pour chaque ligne, cherche un plan qui contient les deux droites : s'il existe, elles sont sécantes ou parallèles ; s'il n'existe pas, elles sont gauches."),
        t("Méfie-toi des apparences : deux traits peuvent se croiser sur le dessin sans que les droites se coupent, et deux droites qui ne sont pas dans une même face peuvent être dans un même plan (plan diagonal, plan par des milieux)."),
      ],
      [
        t(`Teste la position écrite à la ligne ${n} : existe-t-il un plan qui contient ${d1} et ${d2} ?`),
        t("Pense aussi aux plans qui ne sont pas des faces. Pour montrer que deux droites sont gauches, on trouve un plan qui contient l'une des droites et un seul point de l'autre."),
      ],
      [
        t("Une ligne corrigée doit donner la bonne position ET une justification vraie."),
        t("Vérifie sur la figure le plan cité : contient-il vraiment les points annoncés ?"),
      ],
    ],
    figure: {
      type: "solide",
      solide,
      points: definis,
      plans: [],
      dessins: items.map((x) => ({ droites: [[pos(x.pts[0]), pos(x.pts[1])], [pos(x.pts[2]), pos(x.pts[3])]], points: [] })),
    },
    corrige: {
      droites: [[pos(it.pts[0]), pos(it.pts[1])], [pos(it.pts[2]), pos(it.pts[3])]],
      plans: [nomListe(pf.plan) as [string, string, string]],
      sections: false,
      points: [],
      dessin: null,
    },
  };
}
