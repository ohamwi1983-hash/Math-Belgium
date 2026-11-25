import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Point3D } from "../core/geometrieEspace.types";
import type { ExerciceRealiteIllusion } from "../core/realiteIllusion.types";
import type { EcranEspace } from "../components/AppEspaceLotH";
import { ARETES_LATERALES } from "../generateurs/realiteIllusion";
import { COULEUR_CONSTRUCTION, COULEUR_DROITE, COULEUR_PLAN_1, COULEUR_PLAN_2, COULEUR_ACCENT, figureEspaceSvg, type AreteSurlignee, type MarqueEspace, type ModeFigureEspace, type SegmentEspace } from "./figureEspaceLotH";

/**
 * Textes, écrans et figures de gen135 « Réalité ou illusion ? » — UNE source pour l'appli, l'adaptateur
 * papier et le corrigé. Noms comme dans le cours : faces « ABED », droites « (AD) », plans « (ABED) ».
 * Les textes des options sont les MÊMES pour les deux verdicts (seules les explications d'un choix faux
 * dépendent de l'instance) : rien ne trahit la réponse avant l'écran qui la demande.
 */

type E = ExerciceRealiteIllusion;
type F = FragmentConsigne[];
const T = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });

export const FACES_LATERALES = ["ABED", "BCFE", "ACFD"] as const;
/** Couleur de chaque arête latérale (et de son prolongement) une fois l'écran 1 clos. */
export const COULEURS_ARETES = [COULEUR_PLAN_1, COULEUR_PLAN_2, COULEUR_ACCENT];

export const droiteLat = (i: number) => `(${ARETES_LATERALES[i]!.join("")})`;
export const DROITES_LATERALES = "(AD), (BE) et (CF)";

export const ENONCE_PAPIER = "On a dessiné en perspective cavalière le solide ABCDEF ci-dessous (base ABC, dessus DEF).";
export const CONSIGNE_PAPIER = "Ce solide, dont les faces sont supposées planes, peut-il exister ? Justifie.";

/** Arêtes « autres » que l'arête déplacée (dans l'ordre). */
function autres(e: E): [number, number] {
  return [0, 1, 2].filter((i) => i !== e.areteDeplacee) as [number, number];
}

/** Description de ce qu'on voit sur le dessin en prolongeant (corrigé, explications). */
export function constatDessin(e: E): string {
  if (e.disposition === "concourantes") return `Prolongées, (AD), (BE) et (CF) passent toutes les trois par un même point S.`;
  if (e.disposition === "paralleles") return "Prolongées, (AD), (BE) et (CF) restent parallèles : elles ont la même direction.";
  const p = e.areteDeplacee!;
  const [q, r] = autres(e);
  if (e.variante === "prisme") return `${droiteLat(q)} et ${droiteLat(r)} sont parallèles, mais ${droiteLat(p)} est penchée : elle les coupe en J et en K.`;
  return `${droiteLat(q)} et ${droiteLat(r)} se coupent en I, mais ${droiteLat(p)} passe à côté de I : elle les coupe en J et en K, trois points différents.`;
}

export function phraseVerdict(e: E): string {
  if (e.verdict === "existe")
    return e.variante === "tronc"
      ? "Ce solide peut exister : c'est une pyramide de sommet S coupée par le plan (DEF), un tronc de pyramide."
      : "Ce solide peut exister : c'est un prisme coupé par le plan oblique (DEF).";
  return "Ce solide ne peut pas exister : ses faces latérales ne peuvent pas être toutes les trois planes.";
}

// --- Écrans ---------------------------------------------------------------------------------------

export interface OptionChoix {
  texte: string;
  explication: string | null;
}

function ordonner<X>(options: X[], ordre: number[]): { options: X[]; bonne: number } {
  return { options: ordre.map((i) => options[i]!), bonne: ordre.indexOf(0) };
}

export function optionsEcran1(): OptionChoix[] {
  return [
    { texte: "Les trois faces latérales ABED, BCFE et ACFD", explication: null },
    {
      texte: "La base ABC et les deux faces ABED et ACFD",
      explication: "Ces trois plans se coupent suivant (AB), (AC) et (AD), qui passent toutes par le sommet A : c'est vrai pour tout solide, on n'apprend rien.",
    },
    {
      texte: "Le dessus DEF et les deux faces ABED et BCFE",
      explication: "Ces trois plans se coupent suivant (DE), (EF) et (BE), qui passent toutes par le sommet E : c'est vrai pour tout solide, on n'apprend rien.",
    },
    {
      texte: "La base ABC, le dessus DEF et la face ABED",
      explication: "La base et le dessus n'ont aucune arête commune : leur droite d'intersection n'est pas sur le dessin (ils peuvent même être parallèles).",
    },
  ];
}

export const OPTIONS_ECRAN2 = ["Concourantes : elles passent toutes les trois par un même point", "Parallèles toutes les trois", "Ni concourantes ni parallèles"];
const INDICE_DISPOSITION = { concourantes: 0, paralleles: 1, aucune: 2 } as const;

function explicationsEcran2(e: E): (string | null)[] {
  const ex: (string | null)[] = [null, null, null];
  const cote = e.sens === "haut" ? "au-dessus du solide" : "en dessous du solide";
  if (e.disposition === "concourantes") {
    ex[1] = "Elles ne sont pas parallèles : prolongées, elles se rapprochent et finissent par se couper.";
    ex[2] = `Prolonge-les jusqu'au bout, ${cote} : les trois droites passent par un même point.`;
  } else if (e.disposition === "paralleles") {
    ex[0] = "Ces droites ont toutes la même direction : prolongées, elles ne se rencontrent jamais.";
    ex[2] = "Elles ont toutes les trois la même direction : elles sont parallèles.";
  } else {
    const p = e.areteDeplacee!;
    const [q, r] = autres(e);
    if (e.variante === "prisme") {
      ex[0] = `${droiteLat(q)} et ${droiteLat(r)} sont parallèles : elles n'ont aucun point commun, les trois droites ne peuvent pas passer par un même point.`;
      ex[1] = `${droiteLat(q)} et ${droiteLat(r)} sont bien parallèles, mais ${droiteLat(p)} est penchée : elle finit par les couper.`;
    } else {
      ex[0] = `${droiteLat(q)} et ${droiteLat(r)} se coupent bien en un point, mais ${droiteLat(p)} passe à côté de ce point : pose une règle pour le voir.`;
      ex[1] = "Elles ne sont pas parallèles : prolongées, elles se coupent deux à deux.";
    }
  }
  return ex;
}

/** Options de l'écran 3 — textes FIXES (les mêmes pour les deux verdicts), explications selon
 * l'instance : 0 « peut exister », 1 « impossible », 2 et 3 toujours faux. */
export function optionsEcran3(e: E): OptionChoix[] {
  const existe = e.verdict === "existe";
  const troncOuPrisme = e.variante === "tronc" ? "une pyramide de sommet S coupée par le plan (DEF)" : "un prisme coupé par un plan oblique";
  return [
    {
      texte: "Il peut exister : ses trois arêtes latérales prolongées sont concourantes ou parallèles, comme le veut le théorème des trois plans.",
      explication: existe ? null : "Regarde l'écran précédent : les arêtes latérales prolongées ne sont ni concourantes ni parallèles. Le théorème des trois plans l'interdit si les faces latérales sont planes.",
    },
    {
      texte: "Il est impossible : ses faces latérales, sécantes deux à deux, devraient se couper suivant trois droites concourantes ou parallèles, et ses arêtes latérales ne le sont pas.",
      explication: existe ? `Les arêtes latérales prolongées sont ${e.disposition === "concourantes" ? "concourantes" : "parallèles"} : c'est ce que demande le théorème. Ce solide existe : c'est ${troncOuPrisme}.` : null,
    },
    {
      texte: "Il est impossible : les arêtes latérales d'un solide à faces planes sont toujours parallèles.",
      explication: "Un tronc de pyramide a des faces planes et des arêtes latérales concourantes : le théorème des trois plans admet des droites concourantes ou parallèles.",
    },
    {
      texte: "On ne peut pas conclure : un dessin en perspective ne montre pas si des droites se coupent vraiment.",
      explication:
        "Ici, le dessin suffit : la perspective cavalière conserve le parallélisme et le point commun de deux droites. Si le solide existait, ses arêtes latérales seraient concourantes ou parallèles sur le dessin aussi.",
    },
  ];
}

/** Options de l'écran 3 dans l'ordre « juste d'abord » (pour `ordonner`) : la bonne en tête. */
function optionsEcran3Ordonnables(e: E): OptionChoix[] {
  const o = optionsEcran3(e);
  return e.verdict === "existe" ? [o[0]!, o[1]!, o[2]!, o[3]!] : [o[1]!, o[0]!, o[2]!, o[3]!];
}

export const TITRES_ECRANS_RI = ["Les plans en jeu", "Les arêtes latérales prolongées", "Le verdict"];

export const CONSIGNES_ECRANS_RI = [
  "Le théorème des trois plans parle de trois plans sécants deux à deux. Quels plans du solide faut-il considérer ?",
  `Prolonge, sur le dessin, les trois arêtes latérales ${DROITES_LATERALES}. Ces trois droites sont-elles :`,
  "Ce solide, dont les faces sont supposées planes, peut-il exister ?",
];

/** Consignes des étapes sur papier (titres « Étape n » du corrigé). */
export const CONSIGNES_ETAPES_PAPIER = [
  "Quels trois plans du solide sont sécants deux à deux suivant ses arêtes latérales ?",
  `Prolonge les arêtes latérales ${DROITES_LATERALES} sur le dessin : comment sont-elles placées ?`,
  "Conclus : ce solide peut-il exister ? Justifie par le théorème des trois plans.",
];

export const COURS_TROIS_PLANS = "Théorème (cours, § 6) : trois plans distincts, sécants deux à deux, se coupent suivant trois droites concourantes, parallèles ou confondues.";
export const COURS_CAVALIERE = "La perspective cavalière est une projection parallèle (cours, § 1) : deux droites parallèles restent parallèles sur le dessin, et le point commun de deux droites est dessiné au point commun de leurs dessins.";

function aides(e: E): F[][] {
  const [q, r] = e.areteDeplacee === null ? [0, 1] : autres(e);
  return [
    [[T(COURS_TROIS_PLANS)], [T("Cherche trois faces qui ont, deux à deux, une arête commune — sans que ces trois arêtes passent par un même sommet.")]],
    [[T("Pose une règle le long de chaque arête latérale et prolonge-la au-delà du solide.")], [T(`Repère où ${droiteLat(q)} et ${droiteLat(r)} se rencontrent (si elles se rencontrent), puis regarde si la troisième passe par ce point ou a la même direction.`)]],
    [[T(`${COURS_TROIS_PLANS} ${COURS_CAVALIERE}`)], [T(`Si les faces latérales étaient planes, que devraient être ${DROITES_LATERALES} ? Compare avec ce que tu as vu à l'écran précédent.`)]],
  ];
}

export function ecransRI(e: E): EcranEspace[] {
  const a = aides(e);
  const o1 = ordonner(optionsEcran1(), e.ordre1);
  const o3 = ordonner(optionsEcran3Ordonnables(e), e.ordre3);
  const ex2 = explicationsEcran2(e);
  return [
    { type: "choix", titre: TITRES_ECRANS_RI[0]!, consigne: [T(CONSIGNES_ECRANS_RI[0]!)], options: o1.options.map((o) => [T(o.texte)]), bonne: o1.bonne, explications: o1.options.map((o) => (o.explication ? [T(o.explication)] : null)), aides: a[0]! },
    { type: "choix", titre: TITRES_ECRANS_RI[1]!, consigne: [T(CONSIGNES_ECRANS_RI[1]!)], options: OPTIONS_ECRAN2.map((o) => [T(o)]), bonne: INDICE_DISPOSITION[e.disposition], explications: ex2.map((x) => (x ? [T(x)] : null)), aides: a[1]! },
    { type: "choix", titre: TITRES_ECRANS_RI[2]!, consigne: [T(CONSIGNES_ECRANS_RI[2]!)], options: o3.options.map((o) => [T(o.texte)]), bonne: o3.bonne, explications: o3.options.map((o) => (o.explication ? [T(o.explication)] : null)), aides: a[2]! },
  ];
}

// --- Figures --------------------------------------------------------------------------------------

/** Étape atteinte : 0 énoncé ; 1 arêtes latérales en couleur (droites d'intersection des faces) ;
 * 2 et plus : prolongements et points de rencontre. */
export function figureRI(e: E, mode: ModeFigureEspace, etape: number): string {
  const aretes: AreteSurlignee[] = etape >= 1 ? ARETES_LATERALES.map(([a, b], i) => ({ a, b, couleur: COULEURS_ARETES[i]! })) : [];
  const segments: SegmentEspace[] = [];
  const marques: MarqueEspace[] = [];
  if (etape >= 2) {
    e.prolongements.forEach(([a, b], i) => segments.push({ a, b, couleur: COULEURS_ARETES[i]!, pointille: true, epaisseur: 2.2 }));
    for (const p of e.points) marques.push({ position: p.position, couleur: p.nom === "S" ? COULEUR_CONSTRUCTION : COULEUR_DROITE, label: p.nom });
  }
  const cadre: Point3D[] = e.prolongements.flat();
  const svg = figureEspaceSvg({ mode, solide: e.solide, cadre, aretes, segments, marques, ariaLabel: "Solide ABCDEF en perspective cavalière" });
  // Papier : largeur annoncée de 300 px (au lieu de 380) — un groupe a), b), c) en imprime deux par
  // rangée (seuil 316 px de `rangsDesFigures`), place gardée au-dessus du solide pour les prolongements.
  return mode === "papier" ? svg.replace("<svg viewBox=", '<svg width="300" height="240" viewBox=').replace("max-width:380px", "max-width:300px") : svg;
}

export function figureEcranRI(e: E, ctx: { ecran: number; clos: boolean }): string {
  return figureRI(e, "ecran", ctx.ecran + (ctx.clos ? 1 : 0));
}
