import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { CandidatSecantePositionDroitePlan, ExercicePositionDroitePlan } from "../../core/positionDroitePlan.types";
import { pointDePercee, pointsFigureDansLePlan, verifierReponseParallele, verifierReponseSecante } from "../../moteur/verificationPositionDroitePlan";
import {
  COURS_DROITE_PLAN,
  COURS_PARALLELISME,
  droiteTex,
  faceContenant,
  lignePointPlan,
  lignesParallele,
  listeEt,
  nomFace,
  nomTex,
  phrase,
  planTex,
  raisonDansPlan,
  segmentTex,
  type FigureEspace,
} from "../../ui/corrigeEspace1";
import { libelleCandidatSecante, texteReponseJustificationAttendue } from "../../ui/formatPositionDroitePlan";
import { construireSvgPositionDroitePlan } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen39 « Position d'une droite par rapport à un plan » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : a) classification, b)
 * justification. Partagé par l'adaptateur papier et l'appli (`AppPositionDroitePlan.tsx`). Le
 * « Calcul » est la suite des propriétés appliquées, une par ligne (appartenance de chaque point au
 * plan avec sa raison, parallélisme justifié dans une figure plane, point de percée), comme la
 * méthode du cours (§ 4) : incluse ? parallèle ? sinon sécante.
 */

type E = ExercicePositionDroitePlan;

export function figureEspacePositionDroitePlan(e: E): FigureEspace {
  return { sommets: e.solide.sommets, faces: e.solide.faces, points: e.pointsNommes.map((p) => ({ nom: p.nom, position: p.position, milieuDe: p.milieuDe })) };
}

/** Le segment du plan de même direction que la droite (cas « parallèle »), celui de l'écran. */
function segmentParallele(e: E): [string, string] {
  const i = e.candidatsParallele.findIndex((_, k) => verifierReponseParallele(e, k));
  return e.candidatsParallele[i]!.sommets;
}

/** La cible de percée de l'écran (cas « sécante »). */
function ciblePercee(e: E): CandidatSecantePositionDroitePlan {
  return e.candidatsSecante[e.candidatsSecante.findIndex((_, k) => verifierReponseSecante(e, k))]!;
}

/** Nom du point de percée : le point nommé s'il en est un, sinon K. */
function nomPercee(e: E): string {
  const c = ciblePercee(e);
  return c.type === "arete" ? "K" : c.nom;
}

/** Lignes qui établissent le point de percée de (P₁P₂) dans le plan. */
function lignesPercee(e: E, f: FigureEspace): LigneCalcul[] {
  const [p1, p2] = e.droite;
  const d = droiteTex(p1, p2);
  const pl = planTex(e.plan);
  const c = ciblePercee(e);
  if (c.type === "arete") {
    const [x, y] = c.sommets;
    const face = faceContenant(f, [p1, p2, x, y]);
    const plan4 = face ? `de la face ${nomFace(face)}` : [p1, p2, x, y].every((n) => n === x || n === y || n === p1 || n === p2) ? `du plan $${planTex([p1, p2, x])}$` : "";
    return [
      ligne(`${droiteTex(x, y)}\\subset${pl}`, phrase(`$${nomTex(x)}$ et $${nomTex(y)}$ sont dans le plan`)),
      ligne(`${d}\\cap${droiteTex(x, y)}=\\{K\\}`, phrase(`deux droites non parallèles ${plan4}`)),
      ligne(`K\\in${pl}`, phrase(`$K$ est sur $${droiteTex(x, y)}$, droite du plan`)),
      ligne(`${d}\\cap${pl}=\\{K\\}`, phrase(`un seul point commun : $K$ sur $${segmentTex(x, y)}$`)),
    ];
  }
  const k = c.nom;
  const surDroite = e.droite.includes(k) ? texte("point qui nomme la droite") : texte(`${k} est aligné avec ${p1} et ${p2}`);
  return [ligne(`${nomTex(k)}\\in${d}`, [surDroite]), ligne(`${nomTex(k)}\\in${pl}`, raisonDansPlan(f, k, e.plan)), ligne(`${d}\\cap${pl}=\\{${nomTex(k)}\\}`, "un seul point commun : la droite n'est pas incluse")];
}

function etapeClassification(e: E): EtapeCorrection[] {
  const f = figureEspacePositionDroitePlan(e);
  const [p1, p2] = e.droite;
  const d = droiteTex(p1, p2);
  const pl = planTex(e.plan);
  const lignes: LigneCalcul[] = [lignePointPlan(f, p1, e.plan), lignePointPlan(f, p2, e.plan)];
  let res: string;
  if (e.classification === "incluse") {
    lignes.push(ligne(`${d}\\subset${pl}`, "deux points de la droite sont dans le plan"));
    res = `$${d}\\subset${pl}$ : la droite est incluse dans le plan.`;
  } else if (e.classification === "parallele") {
    const [x, y] = segmentParallele(e);
    lignes.push(...lignesParallele(f, [p1, p2], [x, y]));
    lignes.push(ligne(`${droiteTex(x, y)}\\subset${pl}`, phrase(`$${nomTex(x)}$ et $${nomTex(y)}$ sont dans le plan`)));
    lignes.push(ligne(`${d}\\parallel${pl}`, "parallèle à une droite du plan, sans y être incluse"));
    res = `$${d}\\parallel${pl}$ : la droite est parallèle au plan (sans y être incluse).`;
  } else {
    lignes.push(...lignesPercee(e, f));
    res = `La droite $${d}$ est sécante au plan $${pl}$, en $${nomTex(nomPercee(e))}$.`;
  }
  return [
    utilise("a", phrase(`Trois questions, dans cet ordre ${COURS_DROITE_PLAN} : les deux points de la droite sont-ils dans le plan (incluse) ? Sinon, la droite est-elle parallèle à une droite du plan (parallèle) ? Sinon, elle est sécante.`)),
    calcul("a", lignes),
    resultat("a", phrase(res)),
    ...(e.classification === "secante"
      ? []
      : [piege("a", [texte(e.classification === "incluse" ? "Le plan ne se limite pas aux trois points de son nom : il contient tous les sommets de la surface colorée et les milieux de ses arêtes." : "Ne pas conclure « sécante » parce que la droite semble couper le plan sur le dessin : une droite parallèle à une droite du plan ne le rencontre jamais.")])]),
    ...(e.classification === "secante" ? [piege("a", [texte("Sur un dessin en perspective, deux droites qui se croisent sur le papier ne se coupent pas forcément dans l'espace : le point de percée doit être à la fois sur la droite et dans le plan.")])] : []),
  ];
}

function etapeJustification(e: E): EtapeCorrection[] {
  const f = figureEspacePositionDroitePlan(e);
  const [p1, p2] = e.droite;
  const d = droiteTex(p1, p2);
  const pl = planTex(e.plan);
  const reponse = texteReponseJustificationAttendue(e);
  if (e.classification === "incluse") {
    const points = pointsFigureDansLePlan(e);
    return [
      utilise("b", phrase(`Un plan contient bien plus que les trois points de son nom ${COURS_DROITE_PLAN} : toute arête de la figure dont deux points sont dans le plan y est entière, avec ses extrémités et son milieu.`)),
      calcul("b", points.map((n) => ligne(`${nomTex(n)}\\in${pl}`, raisonDansPlan(f, n, e.plan)))),
      { ...resultat("b", phrase(`Points de la figure dans le plan $${pl}$ : ${listeEt(points)} ; ${p1} et ${p2} en font partie.`)), figureHtml: construireSvgPositionDroitePlan(e) },
      piege("b", [texte("Oublier un sommet de la surface colorée (le plan en a souvent quatre) ou un milieu nommé d'une de ses arêtes.")]),
    ];
  }
  if (e.classification === "parallele") {
    const [x, y] = segmentParallele(e);
    return [
      utilise("b", phrase(`Une droite est parallèle à un plan si elle est parallèle à une droite de ce plan ${COURS_PARALLELISME} : on cherche une arête ou une diagonale du plan de même direction, et on le prouve dans une figure plane (parallélogramme, droite des milieux).`)),
      calcul("b", [...lignesParallele(f, [p1, p2], [x, y]), ligne(`${droiteTex(x, y)}\\subset${pl}`, phrase(`$${nomTex(x)}$ et $${nomTex(y)}$ sont dans le plan`))]),
      { ...resultat("b", phrase(`$${d}\\parallel${droiteTex(x, y)}$, ${reponse} du plan $${pl}$.`)), figureHtml: construireSvgPositionDroitePlan(e, { segment: [f.sommets[x]!, f.sommets[y]!] }) },
      verification("b", phrase(`$${nomTex(p1)}\\notin${pl}$ : la droite n'est pas incluse, elle ne rencontre donc jamais le plan.`)),
      piege("b", [texte("La droite témoin doit être DANS le plan : une droite parallèle à la droite donnée mais hors du plan ne prouve rien.")]),
    ];
  }
  const c = ciblePercee(e);
  const k = nomPercee(e);
  const K = pointDePercee(e)!;
  const lignes: LigneCalcul[] =
    c.type === "arete"
      ? lignesPercee(e, f)
      : [
          ligne(`${nomTex(k)}\\in${d}`, [texte(e.droite.includes(k) ? "point qui nomme la droite" : `${k} est aligné avec ${p1} et ${p2}`)]),
          ligne(`${nomTex(k)}\\in${pl}`, raisonDansPlan(f, k, e.plan)),
        ];
  return [
    utilise("b", phrase(`Une droite sécante perce le plan en un seul point ${COURS_DROITE_PLAN}, à la fois sur la droite et dans le plan (le plan est infini).`)),
    calcul("b", lignes),
    { ...resultat("b", phrase(`$${d}\\cap${pl}=\\{${nomTex(k)}\\}$ : la droite perce le plan en ${libelleCandidatSecante(c).replace(/^le /, "")}${c.type === "arete" ? ` (point $K$)` : ""}.`)), figureHtml: construireSvgPositionDroitePlan(e, { point: { position: K, label: c.type === "arete" ? "K" : "" } }) },
    piege("b", [texte("Un croisement de deux traits sur le dessin n'est pas forcément un point commun : le point de percée doit être sur la droite ET dans le plan.")]),
  ];
}

export function correctionDetailleePositionDroitePlan(e: E): EtapeCorrection[] {
  return [...etapeClassification(e), ...etapeJustification(e)];
}
