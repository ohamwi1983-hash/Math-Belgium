import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExercicePercee } from "../../core/perceePlanAuxiliaire.types";
import { COURS_PERCEE, droiteTex, lignePointPlan, lignesPointCommun, phrase, planTex, type FigureEspace, type PointDefini } from "../../ui/corrigeEspace1";
import { figurePerceeSvg } from "../../ui/figurePercee";
import { elementsFinaux, faceDuPlan, legendeFinale, nomB, nomDroite, nomPlan, phraseNomsConstruits, phrasePositionPercee, pointsDeLaPaire } from "../../ui/formatPercee";

/**
 * Corrigé détaillé « comme au tableau » de gen102 « Point de percée par plan auxiliaire » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : a) plan auxiliaire π, b) droite b
 * commune à π et α (deux points communs), c) point de percée P = d ∩ b. `option` / `paire` : le plan
 * et la paire CONFIRMÉS à l'écran (ceux de l'élève s'ils conviennent, sinon ceux de la référence) ;
 * le papier suit la référence (`e.reference`, sa paire attendue).
 */

type E = ExercicePercee;

export function figureEspacePercee(e: E, extra: { nom: string; position: { x: number; y: number; z: number } }[] = []): FigureEspace {
  const points: PointDefini[] = e.points.map((p) => {
    const d = p.definition;
    if (d.type === "milieu") return { nom: p.nom, position: p.position, milieuDe: d.arete };
    if (d.type === "tiers") return { nom: p.nom, position: p.position, surSegment: [d.depuis, d.vers] };
    const face = e.solide.faces.find((f) => f.length === d.face.length && [...d.face].every((n) => f.includes(n)));
    return face ? { nom: p.nom, position: p.position, centreDe: face } : { nom: p.nom, position: p.position };
  });
  return { sommets: e.solide.sommets, faces: e.solide.faces, points: [...points, ...extra] };
}

export function correctionDetailleePercee(e: E, optionIndex: number = e.reference, paireConfirmee?: [number, number]): EtapeCorrection[] {
  const o = e.options[optionIndex]!;
  const s = o.suite!;
  const paire = paireConfirmee ?? s.paireAttendue;
  const pts = pointsDeLaPaire(s, paire);
  const construits = pts.filter((x) => x.candidat.construction && x.candidat.position).map((x) => ({ nom: x.nom, position: x.candidat.position! }));
  const f = figureEspacePercee(e, [...construits, { nom: "P", position: e.percee }]);
  const [a, b] = e.droite;
  const pi = o.nom;
  const alpha = e.plan;
  const face = faceDuPlan(e, pi);
  const B = nomB(e, s, paire).slice(1, -1);
  const bDroite: [string, string] = [B[0]!, B.slice(1)];
  const d = droiteTex(a, b);
  const bT = droiteTex(...bDroite);
  const PI = planTex(pi);
  const ALPHA = planTex(alpha);

  const lignesA: LigneCalcul[] = [lignePointPlan(f, a, pi), lignePointPlan(f, b, pi), ligne(`${d}\\subset${PI}`, "deux points de d sont dans le plan")];
  const lignesB: LigneCalcul[] = [...pts.flatMap((x) => lignesPointCommun(f, { nom: x.nom, construction: x.candidat.construction }, pi, alpha)), ligne(`${PI}\\cap${ALPHA}=${bT}`, "deux points distincts communs aux deux plans")];
  const lignesC: LigneCalcul[] = [
    ligne(`${d}\\subset${PI}`, "établi à l'étape a"),
    ligne(`${bT}\\subset${PI}`, "établi à l'étape b"),
    ligne(`P=${d}\\cap${bT}`, phrase(`deux droites non parallèles du plan $\\pi=${PI}$`)),
    ligne(`P\\in${ALPHA}`, phrase(`$P$ est sur $${bT}$, droite du plan $\\alpha$`)),
    ligne(`${d}\\cap${ALPHA}=\\{P\\}`, "point de percée de d dans α"),
  ];
  return [
    utilise("a", phrase(`On choisit un plan auxiliaire $\\pi$ qui contient la droite $d$ ${COURS_PERCEE} : il suffit qu'il contienne deux de ses points. Il coupe alors $\\alpha$ suivant une droite $b$, et le point de percée est l'intersection de $d$ et $b$, deux droites du plan $\\pi$.`)),
    calcul("a", lignesA),
    resultat("a", phrase(`$\\pi=${PI}$${face ? ` (${face})` : ""} contient $d=${d}$.`)),
    piege("a", [texte("Un plan qui ne contient qu'un seul point de d ne convient pas : d le percerait, au lieu d'y être contenue.")]),
    utilise("b", phrase(`Deux points distincts communs à $\\pi$ et $\\alpha$ donnent leur droite d'intersection $b$ ${COURS_PERCEE} : un point nommé qui est dans les deux plans, ou le point de rencontre de deux droites d'une même face, l'une dans $\\pi$, l'autre dans $\\alpha$.`)),
    calcul("b", lignesB),
    resultat("b", phrase(`${phraseNomsConstruits(s, paire)} La droite commune à $\\pi$ et $\\alpha$ est $b=${bT}$.`.trim())),
    piege("b", [texte("Deux droites qui se croisent sur le dessin sans être dans une même face peuvent être gauches : leur « point de rencontre » n'existe pas.")]),
    utilise("c", phrase(`$d$ et $b$ sont deux droites du plan $\\pi$, non parallèles : elles se coupent en un point $P$, qui est sur $b$, donc dans $\\alpha$ ${COURS_PERCEE}.`)),
    calcul("c", lignesC),
    {
      ...resultat("c", phrase(`$P=${d}\\cap${bT}$ est le point de percée de $d=${nomDroite(e)}$ dans $\\alpha=${nomPlan(alpha)}$. ${phrasePositionPercee(e)} ${legendeFinale()}`)),
      figureHtml: figurePerceeSvg(e, { mode: "papier", etiquetteD: true, ...elementsFinaux(e, o, paire) }),
    },
    piege("c", [texte("Le point où d semble croiser une arête ou un côté de α sur le dessin n'est pas le point de percée : d et cette droite sont souvent gauches. Seule l'intersection de d avec b, deux droites d'un même plan, est sûre.")]),
  ];
}
