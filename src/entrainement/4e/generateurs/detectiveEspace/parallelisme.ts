import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveEspace, TypeErreurEspace } from "../../core/detectiveEspace.types";
import type { OptionDemonstration, RaisonParallele } from "../../core/demontrerParallelisme.types";
import type { NomSolide3D, PlanSolide3D, Point3D } from "../../core/geometrieEspace.types";
import type { MilieuNomme } from "../../core/positionsPlans.types";
import { justificationsPour, libelle, raisonDepuisFait, texteRaison, type Contexte } from "../demontrerParallelisme";
import { faitsSolide, plansNommage, tirerTriangle, trianglesNommage, type FaitParallele, type Triangle } from "../demontrerParallelisme/geometrieParallelisme";
import { choisirPlan, droitesNommees, type DroiteNommee } from "../positionsPlans";
import { dansPlan, donneesSolide, droiteDansPlan, droitesParalleles, intersectionDroites, memeDroite, memePlan, plansParalleles, type PlanGeo, type PointDispo } from "../positionsPlans/geometriePlans";
import { GABARITS_SOLIDE3D } from "../solide3D/gabarits";
import { choisir, definitions, libelleSolide, melanger, descriptionsVariees, propositions, t } from "./commun";

/**
 * Thème « parallélisme » de gen107 : un élève démontre que deux plans (P) et (Q) d'un solide sont
 * parallèles, avec le critère du cours (deux droites sécantes de (P) parallèles à deux droites de
 * (Q)). La copie a toujours 4 lignes :
 * 1. (ℓ₁) et (ℓ₂) sont deux droites sécantes du plan (P) ;
 * 2. justification de (ℓ₁) ∥ (m₁), et (m₁) est une droite de (Q) ;
 * 3. justification de (ℓ₂) ∥ (m₂), et (m₂) est une droite de (Q) ;
 * 4. conclusion par le critère (toujours vraie : les plans SONT parallèles).
 *
 * Les parallélismes et leurs justifications viennent de gen103 (`faitsSolide` : côtés opposés d'un
 * parallélogramme, droite des milieux, milieux de deux côtés opposés ; `justificationsPour` : leurres
 * vrais mais insuffisants). Types d'erreur (tirés à parts égales, avant le reste ; chacun fixe sa
 * ligne) :
 * - `temoinsParalleles` (ligne 1) : les deux droites « sécantes » de (P) sont parallèles — une seule
 *   direction, comme « une seule droite pour deux plans » (fiche) ;
 * - `horsDuPlan` (ligne 2) : la droite (m₁) est bien parallèle à (ℓ₁), mais n'est pas dans (Q) —
 *   droite témoin hors du plan (fiche) ;
 * - `raisonFausse` (ligne 3) : (ℓ₂) ∥ (m₂) est vrai, mais la raison donnée ne le prouve pas.
 */

const SOLIDES: NomSolide3D[] = ["cube", "parallelepipede", "prisme"];
const LETTRES = ["I", "J", "K"];

interface Oriente {
  f: FaitParallele;
  l: [PointDispo, PointDispo];
  m: [PointDispo, PointDispo];
  inverse: boolean;
}

const pos2 = (x: [PointDispo, PointDispo]) => [x[0].position, x[1].position] as [Point3D, Point3D];
const dansPlanGeo = (pts: PointDispo[], p: PlanGeo) => pts.every((x) => dansPlan(x.position, p.trois));
const paralleles = (a: [Point3D, Point3D], b: [Point3D, Point3D]) => droitesParalleles(a[0], a[1], b[0], b[1]);
const meme = (a: [Point3D, Point3D], b: [Point3D, Point3D]) => memeDroite(a[0], a[1], b[0], b[1]);

export const LIGNE_DU_TYPE: Record<"temoinsParalleles" | "horsDuPlan" | "raisonFausse", number> = { temoinsParalleles: 0, horsDuPlan: 1, raisonFausse: 2 };

export function genererParallelisme(type: TypeErreurEspace): ExerciceDetectiveEspace {
  const typeP = type as keyof typeof LIGNE_DU_TYPE;
  let solide = GABARITS_SOLIDE3D[choisir(SOLIDES)];
  for (let tentative = 0; tentative < 4000; tentative++) {
    if (tentative > 0 && tentative % 100 === 0) solide = GABARITS_SOLIDE3D[choisir(SOLIDES)];
    const d = donneesSolide(solide);
    const plans = plansNommage(d);
    const p = choisirPlan(plans);
    const pool = plans.filter((x) => x !== p && plansParalleles(x, p) && !memePlan(x, p));
    if (pool.length === 0) continue;
    const q = choisirPlan(pool);
    const faits = faitsSolide(d);
    const orientes: Oriente[] = [];
    for (const f of faits) {
      if (dansPlanGeo(f.d1, p) && dansPlanGeo(f.d2, q)) orientes.push({ f, l: f.d1, m: f.d2, inverse: false });
      else if (dansPlanGeo(f.d2, p) && dansPlanGeo(f.d1, q)) orientes.push({ f, l: f.d2, m: f.d1, inverse: true });
    }
    if (orientes.length < 2) continue;
    const o1 = choisir(orientes);
    const secants = orientes.filter((o) => !paralleles(pos2(o.l), pos2(o1.l)));
    if (secants.length === 0) continue;
    const o2 = choisir(secants);

    // Éléments propres au type d'erreur.
    let fauxL2: Oriente | null = null; // temoinsParalleles : seconde droite parallèle à ℓ₁
    let hors: Oriente | null = null; // horsDuPlan : ℓ₁ ∥ (m), m hors de (Q)
    if (typeP === "temoinsParalleles") {
      // Seconde droite parallèle à ℓ₁, avec une droite de (Q) DIFFÉRENTE de m₁ (sinon « (ℓ₁) ∥ (m) et
      // (ℓ₂) ∥ (m) » trahirait d'emblée le parallélisme de ℓ₁ et ℓ₂).
      const doublons = orientes.filter((o) => paralleles(pos2(o.l), pos2(o1.l)) && !meme(pos2(o.l), pos2(o1.l)) && !meme(pos2(o.m), pos2(o1.m)));
      if (doublons.length === 0) continue;
      fauxL2 = choisir(doublons);
    } else if (typeP === "horsDuPlan") {
      const candidats: Oriente[] = [];
      for (const f of faits) {
        for (const [l, m, inverse] of [
          [f.d1, f.d2, false],
          [f.d2, f.d1, true],
        ] as [[PointDispo, PointDispo], [PointDispo, PointDispo], boolean][]) {
          if (!dansPlanGeo(l, p) || !meme(pos2(l), pos2(o1.l))) continue;
          if (droiteDansPlan(m[0].position, m[1].position, q.trois) || droiteDansPlan(m[0].position, m[1].position, p.trois)) continue;
          candidats.push({ f, l, m, inverse });
        }
      }
      if (candidats.length === 0) continue;
      hors = choisir(candidats);
    }

    // Points définis utiles (au plus 3), puis noms des plans.
    const utilises = [o1, o2, ...(fauxL2 ? [fauxL2] : []), ...(hors ? [hors] : [])].flatMap((o) => [...o.l, ...o.m]);
    const milieuxUtiles = new Set(utilises.filter((x) => x.milieuDe).map((x) => x.cle));
    if (milieuxUtiles.size > 3) continue;
    const tp = trianglesNommage(d, p);
    const tq = trianglesNommage(d, q);
    if (tp.length === 0 || tq.length === 0) continue;
    let noms: [Triangle, Triangle] | null = null;
    for (let essai = 0; essai < 60 && !noms; essai++) {
      const a = tirerTriangle(tp);
      const b = tirerTriangle(tq);
      const mil = new Set([...milieuxUtiles, ...[...a, ...b].filter((x) => x.milieuDe).map((x) => x.cle)]);
      if (mil.size > 3) continue;
      noms = [a, b];
    }
    if (!noms) continue;
    const ex = construire(typeP, d.solide, d, p, q, noms, o1, o2, fauxL2, hors, orientes);
    if (ex) return ex;
  }
  throw new Error("gen107 (parallélisme) : aucune copie trouvée");
}

function construire(
  type: keyof typeof LIGNE_DU_TYPE,
  solide: (typeof GABARITS_SOLIDE3D)[NomSolide3D],
  d: ReturnType<typeof donneesSolide>,
  p: PlanGeo,
  q: PlanGeo,
  noms: [Triangle, Triangle],
  o1: Oriente,
  o2: Oriente,
  fauxL2: Oriente | null,
  hors: Oriente | null,
  orientes: Oriente[],
): ExerciceDetectiveEspace | null {
  // Nommage des milieux : lettres I, J, K dans un ordre tiré au hasard.
  const tous = [o1, o2, ...(fauxL2 ? [fauxL2] : []), ...(hors ? [hors] : [])].flatMap((o) => [...o.l, ...o.m]);
  const milieux = [...noms[0], ...noms[1], ...tous].filter((x, i, arr) => x.milieuDe && arr.findIndex((y) => y.cle === x.cle) === i);
  const lettres = melanger(LETTRES).slice(0, milieux.length).sort();
  const ordre = melanger(milieux);
  const nomsMilieux = new Map(ordre.map((m, i) => [m.cle, lettres[i]!]));
  const nomDe = (x: PointDispo) => x.sommet ?? nomsMilieux.get(x.cle)!;
  const listeMilieux: MilieuNomme[] = ordre.map((m) => ({ nom: nomsMilieux.get(m.cle)!, position: m.position, milieuDe: m.milieuDe! })).sort((a, b) => a.nom.localeCompare(b.nom));
  const nommes = [...Object.entries(solide.sommets).map(([nom, position]) => ({ nom, position })), ...listeMilieux.map((m) => ({ nom: m.nom, position: m.position }))];
  const nomPlan = (tri: Triangle): PlanSolide3D => {
    const l = tri.map(nomDe);
    return [...l.filter((x) => solide.sommets[x]).sort(), ...l.filter((x) => !solide.sommets[x]).sort()] as PlanSolide3D;
  };
  const nomP = nomPlan(noms[0]);
  const nomQ = nomPlan(noms[1]);
  const P = `(${nomP.join("")})`;
  const Q = `(${nomQ.join("")})`;
  const ctx: Contexte = { d, pos: (n) => nommes.find((x) => x.nom === n)!.position };
  const raison = (o: Oriente): RaisonParallele => raisonDepuisFait(o.f, nomDe, o.inverse);
  const sansPoint = (s: string) => s.replace(/\.$/, "");
  const ligneParallele = (texteJustif: string, m: string) => `${sansPoint(texteJustif)} ; de plus, ${m} est une droite du plan ${Q}.`;
  const pointHors = (noms2: [string, string], plan: [Point3D, Point3D, Point3D]) => noms2.find((n) => !dansPlan(ctx.pos(n), plan))!;
  const lignesNommees = droitesNommees(nommes, () => true);

  const r1 = raison(o1);
  const r2 = raison(o2);
  const L1 = libelle(r1.droite1);
  const L2 = libelle(r2.droite1);
  const M1 = libelle(r1.droite2);
  const M2 = libelle(r2.droite2);
  const conclusion = `Deux droites sécantes du plan ${P} sont parallèles à deux droites du plan ${Q} : les plans ${P} et ${Q} sont parallèles.`;
  const controleL4 = t(`Ligne 4 : c'est le critère du cours ; la conclusion est vraie, mais elle ne vaut que si les lignes 1 à 3 sont justes.`);
  const point = (a: [Point3D, Point3D], b: [Point3D, Point3D]) => {
    const i = intersectionDroites(a[0], a[1], b[0], b[1]);
    const n = i ? nommes.find((x) => Math.hypot(x.position.x - i.x, x.position.y - i.y, x.position.z - i.z) < 1e-6) : null;
    return n ? ` (en ${n.nom})` : "";
  };

  let lignes: string[];
  let controles: FragmentConsigne[][];
  let descriptions;
  let corrections;
  let questionCorrection: string;
  let ligneCorrigee: string;
  let suite: string | null = null;
  let piege: string;
  let nomErreur: string;
  let corrigeDroites: [Point3D, Point3D][];

  if (type === "temoinsParalleles") {
    const rf = raison(fauxL2!);
    const Lf = libelle(rf.droite1);
    const Mf = libelle(rf.droite2);
    lignes = [`Les droites ${L1} et ${Lf} sont deux droites sécantes du plan ${P}.`, ligneParallele(texteRaison(r1), M1), ligneParallele(texteRaison(rf), Mf), conclusion];
    controles = [
      t(`Ligne 1 : ${L1} et ${Lf} sont bien deux droites du plan ${P}, mais elles sont parallèles, pas sécantes. La copie est fausse.`),
      t(`Ligne 2 : ${sansPoint(texteRaison(r1))}, et ${M1} est bien dans le plan ${Q}. C'est juste.`),
      t(`Ligne 3 : ${sansPoint(texteRaison(rf))}, et ${Mf} est bien dans le plan ${Q}. C'est juste, mais ce parallélisme ne donne pas de nouvelle direction.`),
      controleL4,
    ];
    descriptions = descriptionsVariees(t(`${L1} et ${Lf} sont parallèles : elles ne donnent qu'une direction du plan ${P}.`), [
      t(`${Lf} n'est pas une droite du plan ${P} : la ligne 1 ne peut pas l'utiliser.`),
      t(`${L1} et ${Lf} sont sécantes, mais leur point commun n'est pas un sommet.`),
      t(`Il faut trois droites sécantes du plan ${P}, et non deux, pour conclure.`),
    ]);
    // Bonne seconde droite : ℓ₂ (sécante à ℓ₁, avec un parallélisme justifiable vers (Q)).
    const l1p = pos2(o1.l);
    const dansP = (l: DroiteNommee) => droiteDansPlan(l.a, l.b, p.trois);
    const secanteL1 = (l: DroiteNommee) => !droitesParalleles(l.a, l.b, l1p[0], l1p[1]) && intersectionDroites(l.a, l.b, l1p[0], l1p[1]) !== null;
    const horsP = lignesNommees.filter((l) => !dansP(l) && secanteL1(l));
    const dansQ = lignesNommees.filter((l) => droiteDansPlan(l.a, l.b, q.trois));
    const paraP = lignesNommees.filter((l) => dansP(l) && droitesParalleles(l.a, l.b, l1p[0], l1p[1]) && !meme([l.a, l.b], l1p) && !meme([l.a, l.b], pos2(fauxL2!.l)));
    const leurres = [...melanger(horsP).slice(0, 2), ...melanger(paraP).slice(0, 1)];
    for (const l of melanger(dansQ)) if (leurres.length < 3 && !leurres.includes(l)) leurres.push(l);
    if (leurres.length < 3) return null;
    questionCorrection = `Par quelle droite fallait-il remplacer ${Lf} à la ligne 1 ?`;
    ligneCorrigee = `Les droites ${L1} et ${L2} sont deux droites sécantes du plan ${P}${point(l1p, pos2(o2.l))}.`;
    corrections = propositions(t(L2), leurres.slice(0, 3).map((l) => t(libelle(l.noms))));
    suite = `La ligne 3 devient : ${ligneParallele(texteRaison(r2), M2)}`;
    piege = "Le critère demande deux droites SÉCANTES du premier plan : deux droites parallèles n'en donnent qu'une seule direction, comme si l'on n'avait utilisé qu'une droite. Avec une seule direction, les deux plans peuvent encore être sécants.";
    nomErreur = "deux droites parallèles utilisées comme droites sécantes";
    corrigeDroites = [l1p, pos2(o1.m), pos2(o2.l), pos2(o2.m)];
  } else if (type === "horsDuPlan") {
    const rh = raison(hors!);
    const Lh = libelle(rh.droite1);
    const Mh = libelle(rh.droite2);
    // ℓ₁ écrite avec les mêmes lettres partout : celles du parallélisme de la copie.
    lignes = [`Les droites ${Lh} et ${L2} sont deux droites sécantes du plan ${P}.`, ligneParallele(texteRaison(rh), Mh), ligneParallele(texteRaison(r2), M2), conclusion];
    const ph = pointHors(rh.droite2, q.trois);
    controles = [
      t(`Ligne 1 : ${Lh} et ${L2} sont deux droites du plan ${P} qui se coupent${point(pos2(hors!.l), pos2(o2.l))}. C'est juste.`),
      t(`Ligne 2 : ${sansPoint(texteRaison(rh))} — c'est vrai, mais ${Mh} n'est pas une droite du plan ${Q} : le point ${ph} n'appartient pas à ce plan. La copie est fausse.`),
      t(`Ligne 3 : ${sansPoint(texteRaison(r2))}, et ${M2} est bien dans le plan ${Q}. C'est juste.`),
      controleL4,
    ];
    descriptions = descriptionsVariees(t(`${Mh} n'est pas une droite du plan ${Q} : ce parallélisme ne concerne pas ${Q}.`), [
      t(`${Lh} et ${Mh} ne sont pas parallèles : la raison citée est fausse.`),
      t(`La raison citée ne suffit pas à prouver que ${Lh} est parallèle à ${Mh}.`),
      t(`${Mh} devrait aussi être une droite du plan ${P}, comme ${Lh}.`),
    ]);
    const lp = pos2(hors!.l);
    const dansQ = (l: DroiteNommee) => droiteDansPlan(l.a, l.b, q.trois);
    const bonne = lignesNommees.find((l) => dansQ(l) && meme([l.a, l.b], pos2(o1.m)))!;
    const qNonPara = lignesNommees.filter((l) => dansQ(l) && !droitesParalleles(l.a, l.b, lp[0], lp[1]));
    const paraHors = lignesNommees.filter((l) => !dansQ(l) && droitesParalleles(l.a, l.b, lp[0], lp[1]) && !meme([l.a, l.b], lp) && !meme([l.a, l.b], pos2(hors!.m)));
    const leurres = [...melanger(qNonPara).slice(0, 2), ...melanger(paraHors).slice(0, 1)];
    for (const l of melanger(qNonPara)) if (leurres.length < 3 && !leurres.includes(l)) leurres.push(l);
    if (!bonne || leurres.length < 3) return null;
    // Parallélisme justifiable vers la bonne droite, écrit avec les lettres de ℓ₁ de la copie.
    const justes = orientes.filter((o) => meme(pos2(o.l), lp) && meme(pos2(o.m), [bonne.a, bonne.b]));
    const rj = raison(choisir(justes.length > 0 ? justes : [o1]));
    questionCorrection = `Quelle droite du plan ${Q}, parallèle à ${Lh}, fallait-il utiliser à la ligne 2 ?`;
    ligneCorrigee = ligneParallele(texteRaison(rj), libelle(rj.droite2));
    corrections = propositions(t(libelle(bonne.noms)), leurres.slice(0, 3).map((l) => t(libelle(l.noms))));
    piege = "Chaque droite témoin doit appartenir au plan visé : une droite parallèle à (ℓ) mais située hors du plan (Q) ne dit rien de (Q). Vérifie que ses deux points sont dans (Q).";
    nomErreur = `droite témoin ${Mh} hors du plan ${Q}`;
    corrigeDroites = [lp, [bonne.a, bonne.b], pos2(o2.l), pos2(o2.m)];
  } else {
    const options: OptionDemonstration[] = justificationsPour(ctx, r2);
    const invalides = options.filter((o) => !o.valide);
    // La copie emploie un leurre qui A LA FORME d'une vraie justification (bonne propriété, mauvaise
    // figure ; ou mêmes mots que la propriété du cours) — jamais un argument visiblement hors cours
    // (« sur le dessin », « aucun point commun », « deux faces parallèles ») : ceux-là restent des
    // propositions de l'écran c. La figure est alors nécessaire pour trancher.
    const horsCours = (o: OptionDemonstration) => /Sur le dessin|aucun point commun|faces parallèles|parallèles à la face|même longueur/.test(o.texte);
    // De préférence un leurre écrit sur le MÊME gabarit que la raison valable (« ABFE est un… »,
    // « Dans le triangle XYZ, I et J sont les milieux… ») : seule la figure le distingue alors.
    const gabarit = (s: string) => s.replace(/[A-Z]/g, "X").slice(0, 30);
    const valable = texteRaison(r2);
    const memeGabarit = invalides.filter((o) => gabarit(o.texte) === gabarit(valable));
    const vraisemblables = invalides.filter((o) => !horsCours(o));
    if (memeGabarit.length === 0 && Math.random() < 0.7) return null;
    const copie = choisir(memeGabarit.length > 0 ? memeGabarit : vraisemblables.length > 0 ? vraisemblables : invalides);
    lignes = [`Les droites ${L1} et ${L2} sont deux droites sécantes du plan ${P}.`, ligneParallele(texteRaison(r1), M1), ligneParallele(copie.texte, M2), conclusion];
    controles = [
      t(`Ligne 1 : ${L1} et ${L2} sont deux droites du plan ${P} qui se coupent${point(pos2(o1.l), pos2(o2.l))}. C'est juste.`),
      t(`Ligne 2 : ${sansPoint(texteRaison(r1))}, et ${M1} est bien dans le plan ${Q}. C'est juste.`),
      t(`Ligne 3 : ${L2} ∥ ${M2} est vrai, mais la raison donnée ne le prouve pas. ${copie.defaut} La copie est fausse.`),
      controleL4,
    ];
    descriptions = descriptionsVariees(t(copie.defaut), [
      t(`${M2} n'est pas une droite du plan ${Q} : ce parallélisme ne relie donc pas les deux plans.`),
      t(`${L1} et ${L2} ne sont pas sécantes : elles sont parallèles, la ligne 1 est donc fausse.`),
      t(`${L2} et ${M2} ne sont pas parallèles : aucune justification ne peut donc convenir ici.`),
    ]);
    const generiques = [
      `${L2} et ${M2} n'ont aucun point commun, donc ${L2} ∥ ${M2}.`,
      `Sur le dessin, ${L2} et ${M2} semblent parallèles, donc ${L2} ∥ ${M2}.`,
      `${L2} et ${M2} sont dans deux plans parallèles, donc ${L2} ∥ ${M2}.`,
    ];
    const autres = invalides.filter((o) => o !== copie).map((o) => o.texte);
    for (const g of generiques) if (autres.length < 3 && !autres.includes(g) && g !== copie.texte) autres.push(g);
    questionCorrection = `Quelle justification de ${L2} ∥ ${M2} fallait-il écrire à la ligne 3 ?`;
    ligneCorrigee = ligneParallele(texteRaison(r2), M2);
    corrections = propositions(t(texteRaison(r2)), autres.slice(0, 3).map(t));
    piege = "Un parallélisme se justifie par une propriété du cours (côtés opposés d'un parallélogramme, droite des milieux…) appliquée à la bonne figure : une impression, une même longueur ou l'absence de point commun ne suffisent pas.";
    nomErreur = "parallélisme vrai mais mal justifié";
    corrigeDroites = [pos2(o1.l), pos2(o1.m), pos2(o2.l), pos2(o2.m)];
  }

  const intro = definitions(listeMilieux.map((m) => ({ nom: m.nom, definition: `le milieu de [${m.milieuDe[0]}${m.milieuDe[1]}]` })));
  const ligneF = LIGNE_DU_TYPE[type] + 1;
  return {
    theme: "parallelisme",
    type,
    ligneFausse: LIGNE_DU_TYPE[type],
    enonce: t(`Voici ${libelleSolide(solide)}${intro ? ` ; ${intro}` : "."} Un élève démontre que les plans ${P} et ${Q} sont parallèles.`),
    lignes: lignes.map(t),
    descriptions,
    questionCorrection: t(questionCorrection),
    corrections,
    controles,
    ligneCorrigee: t(ligneCorrigee),
    suite: suite ? t(suite) : null,
    piege: t(piege),
    nomErreur,
    aides: [
      [
        t("Vérifie chaque ligne sur la figure : les droites citées sont-elles dans le bon plan ? sont-elles sécantes ? la raison donnée prouve-t-elle le parallélisme ?"),
        t("Critère du cours : deux plans sont parallèles si deux droites SÉCANTES de l'un sont parallèles à deux droites de l'autre. Chaque mot compte."),
      ],
      [
        t(`À la ligne ${ligneF}, contrôle chaque affirmation séparément : appartenance au plan, position des deux droites, raison du parallélisme.`),
        t("Une droite est dans un plan si deux de ses points sont dans ce plan."),
      ],
      [
        t("La proposition juste doit rendre la ligne vraie ET utile au critère."),
        t("Repère sur la figure les parallélogrammes du solide (faces, plans diagonaux) et les milieux nommés : ce sont eux qui justifient les parallélismes."),
      ],
    ],
    figure: { type: "solide", solide, points: listeMilieux, plans: [nomP, nomQ], dessins: null },
    corrige: { droites: corrigeDroites, plans: [nomP, nomQ], sections: true, points: [], dessin: null },
  };
}
