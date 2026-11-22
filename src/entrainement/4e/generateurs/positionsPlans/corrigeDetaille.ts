import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceDeuxPlans, ExercicePositionsPlans, ExerciceTroisPlans } from "../../core/positionsPlans.types";
import {
  COURS_DEUX_PLANS,
  COURS_PARALLELISME,
  COURS_PERCEE,
  COURS_TROIS_PLANS,
  dansPlan,
  droiteTex,
  lignesDroiteDansPlan,
  lignePointPlan,
  lignesParallele,
  lignesPlansParalleles,
  lignesPointCommun,
  memeDirection,
  parallelismeJustifiable,
  nomTex,
  phrase,
  planTex,
  raisonDansPlan,
  raisonHorsPlan,
  type FigureEspace,
} from "../../ui/corrigeEspace1";
import { figurePositionsPlansSvg } from "../../ui/figurePositionsPlans";
import { conclusionTroisPlans, descriptionPlan, droitePaire, elementsFigureFinale, LIBELLES_ISSUE, LIBELLES_POSITION, legendeFigureFinale, nomDuPoint, pointCommunTrois, pointsDeLaPaire } from "../../ui/formatPositionsPlans";

/**
 * Corrigé détaillé « comme au tableau » de gen101 « Positions de deux plans et de trois plans » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ui/formatPositionsPlans.ts::
 * ecransExercice`) : a) position (ou issue pour trois plans), b) deux points communs (sécants) ou
 * justification. La justification VALABLE de l'écran (`e.justifications`, texte du générateur) est
 * relue en ses morceaux (parallélismes, points communs, droite d'intersection) : chaque morceau
 * devient une ligne prouvée (raison dans une figure plane, point d'un plan…), et le texte de l'écran
 * reste le Résultat. `paire` : la paire de points CONFIRMÉE à l'écran (sécants).
 */

type E = ExercicePositionsPlans;

export function figureEspacePlans(e: E): FigureEspace {
  return { sommets: e.solide.sommets, faces: e.solide.faces, points: e.milieux.map((m) => ({ nom: m.nom, position: m.position, milieuDe: m.milieuDe })) };
}

function valide(e: E): string {
  return e.justifications.find((j) => j.valide)!.texte;
}

const paire2 = (s: string): [string, string] => [s[0]!, s.slice(1)];

/** Lignes des points communs de la paire et de la droite d'intersection (deux plans sécants). */
function lignesSecants(e: ExerciceDeuxPlans, f: FigureEspace, paire: [number, number]): LigneCalcul[] {
  const [p, q] = e.plans;
  const pts = pointsDeLaPaire(e, paire);
  const lignes = pts.flatMap(({ candidat, nom }) => lignesPointCommun(f, { nom, construction: candidat.construction }, p, q));
  const d = droitePaire(e, paire).slice(1, -1);
  lignes.push(ligne(`${planTex(p)}\\cap${planTex(q)}=${droiteTex(...paire2(d))}`, "deux points distincts communs aux deux plans"));
  return lignes;
}

/** Figure avec les points construits M, N (ajoutés à la figure de la brique). */
function avecConstruits(e: ExerciceDeuxPlans, f: FigureEspace, paire: [number, number]): FigureEspace {
  const extra = pointsDeLaPaire(e, paire)
    .filter((x) => x.candidat.construction && x.candidat.position)
    .map((x) => ({ nom: x.nom, position: x.candidat.position! }));
  return { ...f, points: [...f.points, ...extra] };
}

function lignesJustificationDeux(e: ExerciceDeuxPlans, f: FigureEspace): LigneCalcul[] {
  const [p, q] = e.plans;
  const t = valide(e);
  if (e.position === "paralleles") {
    const m = /^\((\w+)\) ∥ \((\w+)\) et \((\w+)\) ∥ \((\w+)\)/.exec(t);
    return m ? lignesPlansParalleles(f, p, q, [[paire2(m[1]!), paire2(m[2]!)], [paire2(m[3]!), paire2(m[4]!)]]) : lignesPlansParalleles(f, p, q);
  }
  // Confondus : les trois points du second nom sont dans le premier plan.
  return [...q.map((n) => ligne(`${nomTex(n)}\\in${planTex(p)}`, raisonDansPlan(f, n, p))), ligne(`${planTex(q)}=${planTex(p)}`, "trois points non alignés communs : un seul plan")];
}

function etapesDeuxPlans(e: ExerciceDeuxPlans, paireConfirmee: [number, number] | null): EtapeCorrection[] {
  const f = figureEspacePlans(e);
  const [p, q] = e.plans;
  const P = planTex(p);
  const horsP = q.find((n) => !dansPlan(f, n, p));
  const a: LigneCalcul[] = [];
  if (horsP) a.push(ligne(`${nomTex(horsP)}\\notin${P}`, raisonHorsPlan(f, horsP, p)));
  let resA: string;
  if (e.position === "confondus") {
    a.push(...lignesJustificationDeux(e, f));
    resA = `Les plans $${P}$ et $${planTex(q)}$ sont confondus.`;
  } else if (e.position === "secants") {
    const paire = e.paireAttendue!;
    const pts = pointsDeLaPaire(e, paire);
    const fp = avecConstruits(e, f, paire);
    a.push(...lignesPointCommun(fp, { nom: pts[0]!.nom, construction: pts[0]!.candidat.construction }, p, q));
    resA = `Distincts et avec un point commun : les plans $${P}$ et $${planTex(q)}$ sont sécants (suivant une droite).`;
  } else {
    a.push(...lignesJustificationDeux(e, f));
    resA = `Les plans $${P}$ et $${planTex(q)}$ sont parallèles (distincts, sans point commun).`;
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", phrase(`Trois questions ${COURS_DEUX_PLANS} : les trois points d'un nom sont-ils dans l'autre plan (confondus) ? Sinon, les plans ont-ils un point commun (sécants, suivant une droite) ? Sinon, on vérifie le critère : deux droites sécantes de l'un parallèles à deux droites de l'autre (parallèles) ${COURS_PARALLELISME}.`)),
    calcul("a", a),
    resultat("a", phrase(resA)),
  ];
  if (e.position === "secants") {
    const paire = paireConfirmee ?? e.paireAttendue!;
    const fp = avecConstruits(e, f, paire);
    etapes.push(
      utilise("b", phrase(`Deux points distincts communs aux deux plans donnent leur droite d'intersection ${COURS_PERCEE} : un point nommé qui est dans les deux plans, ou le point de rencontre d'une droite de chaque plan tracées dans une même face.`)),
      calcul("b", lignesSecants(e, fp, paire)),
      { ...resultat("b", phrase(`La droite d'intersection des plans $${P}$ et $${planTex(q)}$ est $${droiteTex(...paire2(droitePaire(e, paire).slice(1, -1)))}$. ${legendeFigureFinale(e)}`)), figureHtml: figurePositionsPlansSvg(e, { mode: "papier", ...elementsFigureFinale(e, paire) }) },
      piege("b", [texte("Deux droites qui se croisent sur le dessin ne se coupent pas forcément : il faut qu'elles soient dans une même face, sinon elles peuvent être gauches. Et deux triangles qui ne se touchent pas sur le dessin peuvent appartenir à des plans sécants : un plan est infini.")]),
    );
    return etapes;
  }
  const description = descriptionPlan(e, 0);
  etapes.push(
    utilise("b", phrase(e.position === "paralleles" ? `Critère ${COURS_PARALLELISME} : deux plans sont parallèles si deux droites SÉCANTES du premier sont parallèles à deux droites du second ; chaque parallélisme se prouve dans une figure plane.` : `Trois points non alignés déterminent un seul plan ${COURS_DEUX_PLANS} : s'ils sont dans les deux plans, ce sont les mêmes.`)),
    calcul("b", lignesJustificationDeux(e, f)),
    { ...resultat("b", phrase(`${valide(e)}${e.position === "confondus" && description ? ` C'est ${description}.` : ""} ${legendeFigureFinale(e)}`)), figureHtml: figurePositionsPlansSvg(e, { mode: "papier", ...elementsFigureFinale(e, null) }) },
    piege("b", [texte(e.position === "paralleles" ? "Deux droites parallèles entre elles ne suffisent pas, ni des triangles « qui ne se touchent pas » : le critère demande deux droites SÉCANTES du premier plan." : "Deux points communs ne suffisent pas : deux plans sécants en ont aussi. Il faut trois points communs non alignés.")]),
  );
  return etapes;
}

/** Lignes de la justification des trois plans (texte valable de l'écran relu). */
function lignesTroisPlans(e: ExerciceTroisPlans, f: FigureEspace): { lignes: LigneCalcul[]; noyau: LigneCalcul[] } {
  const t = valide(e);
  const nomVersPlan = (nom: string) => e.plans.find((pl) => pl.join("") === nom)!;
  const par = /^\((\w+)\) et \((\w+)\) sont parallèles\./.exec(t);
  if (par) {
    const l = lignesPlansParalleles(f, nomVersPlan(par[1]!), nomVersPlan(par[2]!));
    return { lignes: l, noyau: l.slice(-1) };
  }
  const m = /^\((\w+)\) et \((\w+)\) se coupent suivant \((\w+)\), et/.exec(t)!;
  const P = nomVersPlan(m[1]!);
  const Q = nomVersPlan(m[2]!);
  const R = e.plans.find((pl) => pl !== P && pl !== Q)!;
  const d = paire2(m[3]!);
  const lignes: LigneCalcul[] = [...lignesDroiteDansPlan(f, d, P), ...lignesDroiteDansPlan(f, d, Q)];
  const inter = ligne(`${planTex(P)}\\cap${planTex(Q)}=${droiteTex(...d)}`, "intersection de deux plans : deux points communs");
  lignes.push(inter);
  const noyau: LigneCalcul[] = [inter];
  const R3 = planTex(R);
  if (/perce le plan/.test(t)) {
    const pt = pointCommunTrois(e);
    const nom = pt ? nomDuPoint(e, pt) : null;
    const hors = d.find((n) => !dansPlan(f, n, R)) ?? d[0];
    lignes.push(lignePointPlan(f, hors, R));
    const fin = ligne(`${droiteTex(...d)}\\cap${R3}=\\{${nomTex(nom ?? "M")}\\}`, nom ? raisonDansPlan(f, nom, R) : phrase(`$${droiteTex(...d)}$ n'est pas parallèle au plan : elle le perce en un point $M$`));
    lignes.push(fin);
    noyau.push(fin);
  } else if (/est incluse/.test(t)) {
    const incl = lignesDroiteDansPlan(f, d, R);
    const fin = incl[incl.length - 1]!;
    lignes.push(...incl);
    noyau.push(fin);
  } else {
    // Parallèle au troisième plan, sans y être incluse : une droite de R de même direction.
    const nommes = [...Object.keys(f.sommets), ...f.points.map((x) => x.nom)].filter((n) => dansPlan(f, n, R));
    // Témoin : une droite de R de même direction, de préférence une dont le parallélisme se prouve
    // dans une figure plane (sinon « même direction » restait seul, < 1 % des tirages).
    const temoins: [string, string][] = [];
    for (let i = 0; i < nommes.length; i++) for (let j = i + 1; j < nommes.length; j++) if (memeDirection(f, d, [nommes[i]!, nommes[j]!])) temoins.push([nommes[i]!, nommes[j]!]);
    const temoin: [string, string] | null = temoins.find((x) => parallelismeJustifiable(f, d, x)) ?? temoins[0] ?? null;
    const hors = d.find((n) => !dansPlan(f, n, R))!;
    if (temoin) lignes.push(...lignesParallele(f, d, temoin), ...lignesDroiteDansPlan(f, temoin, R));
    lignes.push(lignePointPlan(f, hors, R));
    const fin = ligne(`${droiteTex(...d)}\\parallel${R3}`, "parallèle à une droite du plan, sans y être incluse");
    lignes.push(fin);
    noyau.push(fin);
  }
  return { lignes, noyau };
}

function etapesTroisPlans(e: ExerciceTroisPlans): EtapeCorrection[] {
  const f = figureEspacePlans(e);
  const pt = pointCommunTrois(e);
  const fp: FigureEspace = pt && !nomDuPoint(e, pt) ? { ...f, points: [...f.points, { nom: "M", position: pt }] } : f;
  const { lignes, noyau } = lignesTroisPlans(e, fp);
  return [
    utilise("a", phrase(`On prend deux des plans ${COURS_TROIS_PLANS} : parallèles → aucun point commun ; sinon leur droite d'intersection d, puis la position de d par rapport au troisième plan : sécante → un seul point commun, incluse → une droite commune, parallèle → aucun point commun.`)),
    calcul("a", noyau),
    resultat("a", [texte(LIBELLES_ISSUE[e.issue])]),
    utilise("b", phrase(`Une droite est commune à deux plans si deux de ses points sont dans chacun d'eux ; sa position par rapport au troisième plan se lit comme au § 4 (incluse, parallèle à une droite du plan, sinon sécante).`)),
    calcul("b", lignes),
    { ...resultat("b", phrase(`${valide(e)} ${conclusionTroisPlans(e)} ${legendeFigureFinale(e)}`)), figureHtml: figurePositionsPlansSvg(e, { mode: "papier", ...elementsFigureFinale(e, null) }) },
    piege("b", [
      texte(
        e.issue === "aucun" && e.sousCas === "toblerone"
          ? "Trois plans sécants deux à deux n'ont pas forcément un point commun : leurs trois droites d'intersection peuvent être parallèles (le Toblerone)."
          : "La droite citée doit appartenir aux DEUX plans : vérifie que deux de ses points sont dans chacun d'eux, sans te fier au dessin.",
      ),
    ]),
  ];
}

export function correctionDetailleePositionsPlans(e: E, paireConfirmee: [number, number] | null = null): EtapeCorrection[] {
  return e.variante === "deux-plans" ? etapesDeuxPlans(e, paireConfirmee) : etapesTroisPlans(e);
}

/** Libellé de la position (réponse brève). */
export function libellePositionDeuxPlans(e: ExerciceDeuxPlans): string {
  return LIBELLES_POSITION[e.position];
}
