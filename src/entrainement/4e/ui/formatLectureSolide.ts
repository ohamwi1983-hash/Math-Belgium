import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Point3D } from "../core/geometrieEspace.types";
import type { ExerciceLectureSolide, PlanLu, PositionDeuxDroites } from "../core/lectureSolide.types";
import type { EcranEspace } from "../components/AppEspaceLotH";
import { sectionSolide } from "./figurePositionsPlans";
import { COULEUR_ACCENT, COULEUR_PLAN_1, COULEUR_PLAN_2, figureEspaceSvg, type AnneauEspace, type ModeFigureEspace, type OptionsFigureEspace } from "./figureEspaceLotH";

/**
 * Textes et figures de gen133 « Lire un solide en perspective : vocabulaire et positions » — UNE
 * source pour l'appli, l'adaptateur papier et le corrigé. Noms de points, de droites et de plans en
 * texte (comme dans le cours : (AB), (ABG), [AD]) ; longueurs avec la virgule décimale.
 */

type E = ExerciceLectureSolide;
type F = FragmentConsigne[];
const T = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });

export const nombreFr = (x: number): string => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100).replace(".", ","));

export function nomSolide(e: E): string {
  if (e.genre === "cube") return "le cube ABCDEFGH";
  if (e.genre === "pave") return "le pavé droit ABCDEFGH";
  if (e.genre === "prisme") return "le prisme droit ABCDEF (ses bases ABC et DEF sont des triangles)";
  return "le tétraèdre ABCD";
}

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function phraseMilieux(e: E): string {
  if (e.points.length === 0) return "";
  const morceaux = e.points.map((p, i) => (i === 0 ? `${p.nom} est le milieu de [${p.milieuDe.join("")}]` : `${p.nom} celui de [${p.milieuDe.join("")}]`));
  return ` ${morceaux.join(", ")}.`;
}

export const nomDroite = (d: [string, string]) => `(${d.join("")})`;
export const nomPlanLu = (p: PlanLu) => `(${p.noms.join("")})`;
export const nomFaceLue = (s: string[]) => s.join("");

export function enonceTexte(e: E): string {
  const base = `${majuscule(nomSolide(e))} est dessiné en perspective cavalière (fuyantes à 45°, réduites de moitié).`;
  if (e.variante === "dessin") return `${base} Sur ce dessin, toutes ses arêtes sont tracées en trait plein.`;
  return `${base}${phraseMilieux(e)}`;
}

export const LIBELLES_POSITIONS: Record<PositionDeuxDroites, string> = { secantes: "sécantes", paralleles: "parallèles", gauches: "gauches" };
export const ORDRE_POSITIONS: PositionDeuxDroites[] = ["secantes", "paralleles", "gauches"];

export function etiquetteDeformee(e: E): string {
  return e.genre === "tetraedre" ? "triangle déformé" : "parallélogramme";
}

export const nomArete = (a: [string, string]) => `[${a.join("")}]`;

export function phraseLongueur(e: E): string {
  return `Ce solide a été dessiné à l'échelle 1 : sur ce dessin, l'arête ${nomArete(e.longueur.arete)} mesure ${nombreFr(e.longueur.dessinee)} cm. Quelle est la vraie longueur de ${nomArete(e.longueur.arete)} ?`;
}

export function texteOptionLongueur(v: number | null): string {
  return v === null ? "On ne peut pas la connaître sur un dessin en perspective" : `${nombreFr(v)} cm`;
}

function explicationLongueur(e: E, v: number | null): F | null {
  const L = e.longueur;
  const a = nomArete(L.arete);
  if (v === L.vraie) return null;
  if (L.fuyante) {
    if (v === null) return [T(`La convention cavalière permet de la retrouver : ${a} est une fuyante, dessinée à la moitié de sa vraie longueur.`)];
    if (v === L.dessinee) return [T(`${a} est une fuyante (tracée à 45°) : elle est dessinée à la moitié de sa vraie longueur. On ne la lit pas directement : il faut doubler.`)];
    return [T(`C'est le dessin qui réduit de moitié : la vraie longueur est le double de la longueur dessinée, pas sa moitié.`)];
  }
  if (v === null) return [T(`${a} est horizontale ou verticale dans une face parallèle à la feuille : elle est en vraie grandeur, sa longueur se lit directement.`)];
  return [T(`${a} n'est pas une fuyante : horizontale ou verticale dans une face parallèle à la feuille, elle est dessinée en vraie grandeur.`)];
}

export function questionsPapier(e: E): string[] {
  if (e.variante === "dessin")
    return [
      "Quelles faces sont dessinées en vraie grandeur ? Lesquelles sont déformées ?",
      "Quelles arêtes devraient être tracées en pointillés (arêtes cachées) ?",
      phraseLongueur(e),
    ];
  if (e.variante === "appartenance") return e.plans.map((p) => consignePlan(p));
  return e.paires.map((p) => `${nomDroite(p.d1)} et ${nomDroite(p.d2)}`);
}

export const CONSIGNE_POSITIONS = "Sans justifier, dis si les droites de chaque paire sont sécantes, parallèles ou gauches.";

export function consignePlan(p: PlanLu): string {
  return `Quels points nommés, autres que ${p.noms[0]}, ${p.noms[1]} et ${p.noms[2]}, appartiennent au plan ${nomPlanLu(p)} ?`;
}

// --- Écrans ---------------------------------------------------------------------------------------

function ecransDessin(e: E): EcranEspace[] {
  const tetra = e.genre === "tetraedre";
  const L = e.longueur;
  return [
    {
      type: "lignes",
      titre: "Faces en vraie grandeur",
      consigne: [T("Pour chaque face, dis si elle est dessinée en vraie grandeur ou déformée.")],
      lignes: e.faces.map((f) => [T(`Face ${nomFaceLue(f.sommets)}`)]),
      etiquettes: ["vraie grandeur", etiquetteDeformee(e)],
      bonnes: e.faces.map((f) => (f.vraieGrandeur ? 0 : 1)),
      aides: [
        [T("Perspective cavalière (cours, § 1) : seules les faces parallèles à la feuille gardent leur vraie forme ; une face qui contient une fuyante est déformée.")],
        [T(tetra ? "Repère les fuyantes, les arêtes tracées à 45° : une face qui en contient une est déformée." : "Repère les fuyantes, les arêtes tracées à 45° : une face qui en contient une est déformée. Pense à la face arrière, superposable à la face avant.")],
      ],
      messageFaux: [
        T(
          tetra
            ? "Seule la face avant, parallèle à la feuille, est en vraie grandeur : les trois autres contiennent la fuyante et sont déformées."
            : "Les faces avant et arrière, parallèles à la feuille, sont en vraie grandeur ; les autres contiennent des fuyantes et deviennent des parallélogrammes.",
        ),
      ],
    },
    {
      type: "cases",
      titre: "Arêtes cachées",
      consigne: [T("Toutes les arêtes sont tracées en trait plein. Coche celles qui devraient être en pointillés (arêtes cachées).")],
      options: e.aretes.map((a) => [T(nomArete(a.sommets))]),
      bonnes: e.aretes.flatMap((a, i) => (a.cachee ? [i] : [])),
      colonnes: 4,
      aides: [
        [T("Les fuyantes partent vers la droite et vers le haut : on voit le solide de face, d'en haut et par la droite (cours, § 1).")],
        [T("Une arête est cachée quand les faces qui la bordent sont toutes cachées : les faces du dessous, de gauche et de l'arrière ne se voient pas.")],
      ],
      messageFaux: [T("Une arête est cachée quand aucune face vue ne la borde : les faces du dessous, de gauche et de l'arrière sont cachées.")],
    },
    {
      type: "choix",
      titre: "Vraie longueur d'une arête",
      consigne: [T(phraseLongueur(e))],
      options: L.options.map((v) => [T(texteOptionLongueur(v))]),
      bonne: L.bonne,
      explications: L.options.map((v) => explicationLongueur(e, v)),
      aides: [
        [T("Perspective cavalière (cours, § 1) : les fuyantes sont dessinées à la moitié de leur vraie longueur ; les horizontales et les verticales des faces parallèles à la feuille sont en vraie grandeur.")],
        [T(`Regarde la direction de ${nomArete(L.arete)} sur le dessin : est-elle tracée à 45° ?`)],
      ],
    },
  ];
}

function aide2Plan(p: PlanLu): F {
  if (p.type === "face") return [T(`Le plan ${nomPlanLu(p)} est celui d'une face du solide : cherche cette face, puis les points nommés qui sont dessus.`)];
  if (p.type === "diagonal") return [T(`Cherche une droite parallèle à un côté du triangle ${p.noms.join("")}, menée par un de ses sommets : elle est dans le plan.`)];
  return [T("Un milieu d'arête est dans le plan si les deux extrémités de l'arête y sont, ou s'il est sur une droite du plan.")];
}

function ecransAppartenance(e: E): EcranEspace[] {
  return e.plans.map((p) => ({
    type: "cases" as const,
    titre: `Points du plan ${nomPlanLu(p)}`,
    consigne: [T(`Coche tous les points nommés, autres que ${p.noms[0]}, ${p.noms[1]} et ${p.noms[2]}, qui appartiennent au plan ${nomPlanLu(p)}.`)],
    options: p.candidats.map((n) => [T(n)]),
    bonnes: p.candidats.flatMap((n, i) => (p.dans.includes(n) ? [i] : [])),
    colonnes: 4,
    aides: [[T("Un point appartient au plan s'il est sur une droite du plan : la droite qui joint deux points du plan, ou la parallèle à une droite du plan menée par un de ses points (cours, § 2).")], aide2Plan(p)],
    messageFaux: [T("Un point du plan est sur une droite du plan. Sur le dessin, un point qui semble dans le triangle peut être devant ou derrière le plan.")],
  }));
}

function ecransPositions(e: E): EcranEspace[] {
  return [
    {
      type: "lignes",
      titre: "Positions de deux droites",
      consigne: [T("Pour chaque paire de droites, choisis leur position. Touche une paire pour la voir en couleur sur la figure.")],
      lignes: e.paires.map((p) => [T(`${nomDroite(p.d1)} et ${nomDroite(p.d2)}`)]),
      etiquettes: ORDRE_POSITIONS.map((p) => LIBELLES_POSITIONS[p]),
      bonnes: e.paires.map((p) => ORDRE_POSITIONS.indexOf(p.position)),
      aides: [
        [T("Cherche un plan qui contient les quatre points des deux droites : s'il n'y en a aucun, elles sont gauches ; sinon elles sont parallèles (même direction) ou sécantes (cours, § 3).")],
        [T("Deux droites qui se croisent sur le dessin ne sont pas forcément sécantes ; deux droites parallèles peuvent être dans deux faces différentes.")],
      ],
      messageFaux: [T("Gauches : aucun plan ne contient les quatre points. Parallèles : dans un même plan et de même direction. Sécantes : dans un même plan, de directions différentes.")],
    },
  ];
}

export function ecrans(e: E): EcranEspace[] {
  if (e.variante === "dessin") return ecransDessin(e);
  if (e.variante === "appartenance") return ecransAppartenance(e);
  return ecransPositions(e);
}

export const TITRES_ECRANS = (e: E) => ecrans(e).map((x) => x.titre);

// --- Figures --------------------------------------------------------------------------------------

export function positionPoint(e: E, nom: string): Point3D {
  return e.solide.sommets[nom] ?? e.points.find((p) => p.nom === nom)!.position;
}

function base(e: E, mode: ModeFigureEspace): OptionsFigureEspace {
  return { mode, solide: e.solide, points: e.points.map((p) => ({ nom: p.nom, position: p.position })), ariaLabel: `${majuscule(nomSolide(e))} en perspective cavalière` };
}

/** Figure de l'énoncé (papier et écran avant toute réponse). */
export function figureEnonce(e: E, mode: ModeFigureEspace): string {
  return figureEspaceSvg({ ...base(e, mode), toutesAretesPleines: e.variante === "dessin" });
}

/** Faces en vraie grandeur en vert (corrigé a, écran a clos). */
export function figureFaces(e: E, mode: ModeFigureEspace, pleines: boolean): string {
  return figureEspaceSvg({
    ...base(e, mode),
    toutesAretesPleines: pleines,
    polygones: e.faces.filter((f) => f.vraieGrandeur).map((f) => ({ sommets: f.sommets.map((n) => e.solide.sommets[n]!), couleur: COULEUR_PLAN_2, opacite: 0.22 })),
  });
}

/** Arêtes cachées en pointillés, surlignées (corrigé b). */
export function figureCachees(e: E, mode: ModeFigureEspace): string {
  return figureEspaceSvg({ ...base(e, mode), aretes: e.aretes.filter((a) => a.cachee).map((a) => ({ a: a.sommets[0], b: a.sommets[1], couleur: COULEUR_PLAN_1 })) });
}

/** Arête de l'écran c, avec sa longueur dessinée. */
export function figureLongueur(e: E, mode: ModeFigureEspace, vraie: boolean): string {
  const L = e.longueur;
  return figureEspaceSvg({ ...base(e, mode), aretes: [{ a: L.arete[0], b: L.arete[1], couleur: COULEUR_ACCENT, texte: `${nombreFr(vraie ? L.vraie : L.dessinee)} cm${vraie ? " (vraie)" : ""}` }] });
}

export function figurePlan(e: E, mode: ModeFigureEspace, p: PlanLu, revele: boolean): string {
  const pts = p.noms.map((n) => positionPoint(e, n));
  const section = revele ? sectionSolide(e.solide, pts as [Point3D, Point3D, Point3D]) : [];
  return figureEspaceSvg({
    ...base(e, mode),
    polygones: revele && section.length >= 3 ? [{ sommets: section, couleur: COULEUR_PLAN_1, opacite: 0.16 }] : [{ sommets: pts, couleur: COULEUR_PLAN_1, opacite: 0.2 }],
    marques: revele ? p.dans.map((n) => ({ position: positionPoint(e, n), couleur: COULEUR_PLAN_2, anneau: true })) : [],
  });
}

export function figurePaire(e: E, mode: ModeFigureEspace, i: number): string {
  const p = e.paires[i]!;
  return figureEspaceSvg({
    ...base(e, mode),
    droites: [
      { a: positionPoint(e, p.d1[0]), b: positionPoint(e, p.d1[1]), couleur: COULEUR_ACCENT },
      { a: positionPoint(e, p.d2[0]), b: positionPoint(e, p.d2[1]), couleur: COULEUR_PLAN_1 },
    ],
  });
}

/** Figure de l'appli selon l'écran et son état. */
export function figureEcran(e: E, ctx: { ecran: number; clos: boolean; ligneActive: number | null; anneaux: AnneauEspace[] }): string {
  if (e.variante === "dessin") {
    if (ctx.ecran === 0) return ctx.clos ? figureFaces(e, "ecran", true) : figureEnonce(e, "ecran");
    if (ctx.ecran === 1) return ctx.clos ? figureCachees(e, "ecran") : figureEnonce(e, "ecran");
    return figureLongueur(e, "ecran", false);
  }
  if (e.variante === "appartenance") return figurePlan(e, "ecran", e.plans[ctx.ecran]!, ctx.clos);
  return figurePaire(e, "ecran", ctx.ligneActive ?? 0);
}
