import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { DeuxDroitesJustifiees, DroiteNommee, ExerciceDeuxDroites, ExerciceDeuxDroitesPlan, ExercicePlanDetermine, LieuPointCommun } from "../../core/deuxDroitesPlan.types";
import {
  alignes,
  COURS_DEUX_DROITES,
  COURS_PLAN,
  dansPlan,
  droiteTex,
  faceContenant,
  lignePointPlan,
  lignesParallele,
  nomFace,
  nomTex,
  phrase,
  planTex,
  raisonDansPlan,
  raisonHorsDroite,
  raisonHorsPlan,
  raisonSurDroite,
  type FigureEspace,
  type PointDefini,
} from "../../ui/corrigeEspace1";
import { figureDeuxDroitesPlanSvg } from "../../ui/figureDeuxDroitesPlan";
import { droiteContenue, droitePercante, phrasePosition, piegePlan, piegePositions, reponseJustification, reponseNomPlan, reponsePlanCommun, reponseVerdictPlan, texteRaison } from "../../ui/formatDeuxDroitesPlan";

/**
 * Corrigé détaillé « comme au tableau » de gen100 « Positions de deux droites et plan déterminé » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ui/formatDeuxDroitesPlan.ts::
 * ecrans`) : famille « positions » a) plan commun, b) position, c) justification ; famille « plan »
 * a) plan déterminé ?, b) nom du plan ou raison. Partagé par l'adaptateur et l'appli. Chaque ligne
 * du « Calcul » applique une propriété (point d'un plan, point d'une droite, parallélisme prouvé dans
 * une figure plane, point commun de deux droites d'un plan), nommée à droite ; les phrases de
 * réponse sont celles de l'écran (`formatDeuxDroitesPlan.ts`).
 */

type E = ExerciceDeuxDroitesPlan;
type Fr = FragmentConsigne[];

/** Points définis (milieu, centre de face) relus depuis leur définition d'écran. */
export function figureEspaceDeuxDroites(e: E): FigureEspace {
  const points: PointDefini[] = e.pointsNommes.map((p) => {
    const m = /milieu de \[(.)(.)\]/.exec(p.definition);
    if (m) return { nom: p.nom, position: p.position, milieuDe: [m[1]!, m[2]!] };
    const c = /centre de la face (\w+)/.exec(p.definition);
    if (c) {
      const face = e.solide.faces.find((f) => f.length === c[1]!.length && [...c[1]!].every((n) => f.includes(n)));
      if (face) return { nom: p.nom, position: p.position, centreDe: face };
    }
    return { nom: p.nom, position: p.position };
  });
  return { sommets: e.solide.sommets, faces: e.solide.faces, points };
}

const dt = (d: readonly string[]) => droiteTex(d[0]!, d[1]!);

/** « K » si le point commun n'est pas nommé. */
function nomPointCommun(lieu: LieuPointCommun): string {
  return lieu.type === "nomme" ? lieu.nom : "K";
}

/** Lignes du point commun de deux droites sécantes (dans leur plan commun). */
function lignesSecantes(f: FigureEspace, e: DeuxDroitesJustifiees): LigneCalcul[] {
  const j = e.justification;
  if (j.type !== "secantes") return [];
  const k = nomPointCommun(j.lieu);
  const plan = e.planCommun!;
  const lignes: LigneCalcul[] = [ligne(`${dt(e.d1)}\\cap${dt(e.d2)}=\\{${nomTex(k)}\\}`, phrase(`deux droites non parallèles du plan $${planTex(plan)}$`))];
  if (j.lieu.type === "nomme") {
    lignes.push(ligne(`${nomTex(k)}\\in${dt(e.d1)}`, raisonSurDroite(f, k, e.d1)), ligne(`${nomTex(k)}\\in${dt(e.d2)}`, raisonSurDroite(f, k, e.d2)));
  } else if (j.lieu.type === "arete") {
    lignes.push(ligne(`K\\in${droiteTex(j.lieu.arete[0], j.lieu.arete[1])}`, phrase(`$K$ tombe sur l'arête $[${j.lieu.arete.join("")}]$, en un point non nommé`)));
  } else if (j.lieu.type === "face") {
    lignes.push(ligne(`K\\in${planTex(j.lieu.face)}`, [texte(`K tombe ${j.lieu.centre ? "au centre" : "à l'intérieur"} de la face ${j.lieu.face.join("")}`)]));
  } else if (j.lieu.type === "interieur") {
    lignes.push(ligne(`K\\in${planTex(plan)}`, [texte(`K tombe ${j.lieu.centre ? "au centre" : "à l'intérieur"} du solide`)]));
  } else {
    lignes.push(ligne(`K\\in${planTex(plan)}`, [texte("K est hors du solide dessiné : on prolonge les deux droites")]));
  }
  return lignes;
}

/** Lignes « (d₁) ∥ (r), (d₂) ∥ (r), donc (d₁) ∥ (d₂) ». */
function lignesParalleles(f: FigureEspace, e: DeuxDroitesJustifiees): LigneCalcul[] {
  const j = e.justification;
  if (j.type !== "paralleles") return [];
  const r = j.options[j.bonne]!;
  return [...lignesParallele(f, e.d1, r), ...lignesParallele(f, e.d2, r), ligne(`${dt(e.d1)}\\parallel${dt(e.d2)}`, "deux droites parallèles à une même troisième")];
}

/** Lignes des droites gauches : la droite qui perce le plan contenant l'autre. */
function lignesGauches(f: FigureEspace, e: DeuxDroitesJustifiees): LigneCalcul[] {
  const j = e.justification;
  if (j.type !== "gauches") return [];
  const percante = droitePercante(e);
  const contenue = droiteContenue(e);
  const autre = percante.find((n) => n !== j.point)!;
  const pl = planTex(j.plan);
  return [
    ligne(`${dt(contenue)}\\subset${pl}`, phrase(`$${nomTex(contenue[0]!)}$ et $${nomTex(contenue[1]!)}$ sont dans le plan`)),
    ligne(`${nomTex(j.point)}\\in${pl}`, raisonDansPlan(f, j.point, j.plan)),
    ligne(`${nomTex(autre)}\\notin${pl}`, raisonHorsPlan(f, autre, j.plan)),
    ligne(`${dt(percante)}\\cap${pl}=\\{${nomTex(j.point)}\\}`, "un seul point commun : la droite perce le plan"),
    ligne(`${nomTex(j.point)}\\notin${dt(contenue)}`, raisonHorsDroite(f, j.point, contenue as DroiteNommee)),
  ];
}

// --- famille « positions » -------------------------------------------------------------------

function etapesPositions(e: ExerciceDeuxDroites): EtapeCorrection[] {
  const f = figureEspaceDeuxDroites(e);
  const quatre = [...e.d1, ...e.d2];
  const j = e.justification;
  const a: LigneCalcul[] = [];
  if (e.planCommun) {
    for (const n of [...new Set(quatre)]) a.push(lignePointPlan(f, n, e.planCommun));
    a.push(ligne(`${dt(e.d1)}\\subset${planTex(e.planCommun)}`, "deux de ses points sont dans le plan"), ligne(`${dt(e.d2)}\\subset${planTex(e.planCommun)}`, "deux de ses points sont dans le plan"));
  } else if (j.type === "gauches") {
    a.push(...lignesGauches(f, e).slice(0, 4));
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", phrase(`Un plan contient une droite dès qu'il contient deux de ses points ${COURS_PLAN} : un plan commun aux deux droites contient leurs quatre points. Par une droite et un point extérieur, il ne passe qu'un seul plan.`)),
    calcul("a", a),
    resultat("a", phrase(e.planCommun ? reponsePlanCommun(e) : `${reponsePlanCommun(e)} Un tel plan contiendrait $${dt(droiteContenue(e))}$ et $${nomTex(j.type === "gauches" ? j.point : "")}$ : ce serait $${planTex(j.type === "gauches" ? j.plan : [])}$, qui ne contient pas toute la droite $${dt(droitePercante(e))}$.`)),
  ];
  // b) position
  const b: LigneCalcul[] =
    e.position === "paralleles"
      ? lignesParallele(f, e.d1, e.d2)
      : e.position === "secantes"
        ? [ligne(`${dt(e.d1)}\\nparallel${dt(e.d2)}`, phrase(`directions différentes dans le plan $${planTex(e.planCommun!)}$`)), ligne(`${dt(e.d1)}\\cap${dt(e.d2)}=\\{${nomTex(j.type === "secantes" ? nomPointCommun(j.lieu) : "K")}\\}`, "deux droites non parallèles d'un même plan")]
        : [ligne(`${dt(e.d1)}\\nparallel${dt(e.d2)}`, "deux parallèles seraient dans un même plan"), ligne(`${dt(e.d1)}\\cap${dt(e.d2)}=\\varnothing`, "deux sécantes seraient dans un même plan")];
  etapes.push(
    utilise("b", phrase(`Deux droites sans plan commun sont gauches ; dans un même plan, deux droites distinctes sont sécantes (un point commun) ou parallèles (même direction) ${COURS_DEUX_DROITES}.`)),
    calcul("b", b),
    resultat("b", [texte(phrasePosition(e))]),
  );
  if (e.position !== "gauches") etapes.push(piege("b", [texte(piegePositions(e))]));
  // c) justification
  const c = j.type === "secantes" ? lignesSecantes(f, e) : j.type === "paralleles" ? lignesParalleles(f, e) : lignesGauches(f, e);
  const utiliseC: Fr =
    j.type === "secantes"
      ? phrase(`Le point commun de deux droites sécantes est sur chacune d'elles ${COURS_DEUX_DROITES} ; il peut tomber hors des points nommés, ou hors du solide (on prolonge).`)
      : j.type === "paralleles"
        ? phrase(`Deux droites parallèles à une même troisième sont parallèles entre elles ; chaque parallélisme se prouve dans une figure plane (parallélogramme, droite des milieux).`)
        : phrase(`Une droite qui perce un plan en un point qui n'est pas sur une droite de ce plan n'a aucun point commun avec elle ; elle ne lui est pas parallèle non plus (une parallèle à une droite du plan serait parallèle au plan) ${COURS_DEUX_DROITES}.`);
  etapes.push(
    utilise("c", utiliseC),
    calcul("c", c),
    { ...resultat("c", [texte(reponseJustification(e))]), figureHtml: figureDeuxDroitesPlanSvg(e, { corrige: true, largeurMax: 360 }) },
  );
  if (e.position === "gauches") etapes.push(piege("c", [texte(piegePositions(e))]));
  return etapes;
}

// --- famille « plan » ------------------------------------------------------------------------

function lignesAlignement(f: FigureEspace, e: ExercicePlanDetermine): LigneCalcul[] {
  const p = e.points;
  // Le point testé : celui dont la raison est une propriété (milieu, centre, face), dans l'ordre
  // naturel d'abord (le point des données sur la droite des deux autres).
  const essais: [string, DroiteNommee][] = [
    [p[2]!, [p[0]!, p[1]!]],
    [p[0]!, [p[1]!, p[2]!]],
    [p[1]!, [p[0]!, p[2]!]],
  ];
  const surLaDroite = alignes(f, p[0]!, p[1]!, p[2]!);
  const raison = (x: string, d: DroiteNommee) => (surLaDroite ? raisonSurDroite(f, x, d) : raisonHorsDroite(f, x, d));
  const generique = (r: Fr) => r.length === 1 && r[0]!.type === "texte" && /^(aligné avec|hors de la droite)/.test(r[0]!.valeur) || r.some((x) => x.type === "texte" && /qui ne porte pas/.test(x.valeur));
  const [x, d] = essais.find(([x0, d0]) => !generique(raison(x0, d0))) ?? essais[0]!;
  return [ligne(`${nomTex(x)}${surLaDroite ? "\\in" : "\\notin"}${dt(d)}`, raison(x, d))];
}

function lignesDeuxDroites(f: FigureEspace, e: ExercicePlanDetermine): LigneCalcul[] {
  const j = e.justificationDroites;
  if (!j) return [];
  const dd: DeuxDroitesJustifiees = { d1: [e.points[0]!, e.points[1]!], d2: [e.points[2]!, e.points[3]!], planCommun: e.nomPlan, justification: j };
  if (j.type === "secantes") return lignesSecantes(f, dd);
  if (j.type === "paralleles") return lignesParalleles(f, dd);
  return [...lignesGauches(f, dd), ligne(`${dt(dd.d1)}\\nparallel${dt(dd.d2)}`, "une parallèle à une droite du plan ne le percerait pas")];
}

function etapesPlan(e: ExercicePlanDetermine): EtapeCorrection[] {
  const f = figureEspaceDeuxDroites(e);
  const a = e.type === "deuxDroites" ? lignesDeuxDroites(f, e) : lignesAlignement(f, e);
  const methode =
    e.type === "troisPoints"
      ? "Trois points déterminent un seul plan s'ils ne sont pas alignés ; alignés, une infinité de plans les contiennent"
      : e.type === "droitePoint"
        ? "Une droite et un point déterminent un seul plan si le point n'est pas sur la droite ; sinon, une infinité de plans les contiennent"
        : "Deux droites sécantes ou parallèles déterminent un seul plan ; deux droites gauches n'en déterminent aucun";
  const etapes: EtapeCorrection[] = [utilise("a", phrase(`${methode} ${COURS_PLAN}.`)), calcul("a", a), resultat("a", [texte(reponseVerdictPlan(e))])];
  if (e.determine) {
    const nom = e.nomPlan!;
    const lignes = e.pointsDuPlan.map((n) => ligne(`${nomTex(n)}\\in${planTex(nom)}`, raisonDansPlan(f, n, nom)));
    etapes.push(
      piege("a", [texte(piegePlan(e))]),
      utilise("b", phrase(`Un plan se nomme par trois de ses points NON alignés ${COURS_PLAN} ; tous les points des données sont dans ce plan, et d'autres sommets du solide peuvent y être aussi.`)),
      calcul("b", lignes),
      { ...resultat("b", [texte(`${reponseNomPlan(e)} Les lettres peuvent être écrites dans n'importe quel ordre.`)]), figureHtml: figureDeuxDroitesPlanSvg(e, { corrige: true, largeurMax: 360 }) },
    );
  } else {
    const face = e.type !== "deuxDroites" ? faceContenant(f, e.points.slice(0, 2)) : null;
    const b: LigneCalcul[] =
      e.type === "deuxDroites"
        ? lignesDeuxDroites(f, e).slice(-2)
        : [...lignesAlignement(f, e), ...(face && e.points.slice(0, 3).every((n) => dansPlan(f, n, face)) ? [ligne(`${dt([e.points[0]!, e.points[1]!])}\\subset${planTex(face)}`, `un plan parmi l'infinité qui contiennent la droite : la face ${nomFace(face)}`)] : [])];
    etapes.push(
      utilise("b", phrase(e.type === "deuxDroites" ? `Aucun plan ne contient deux droites gauches ${COURS_DEUX_DROITES}.` : `Par une droite passent une infinité de plans ${COURS_PLAN} : des données toutes sur une même droite n'en fixent aucun.`)),
      calcul("b", b),
      resultat("b", [texte(texteRaison(e, "vraie"))]),
      piege("b", [texte(piegePlan(e))]),
    );
  }
  return etapes;
}

export function correctionDetailleeDeuxDroitesPlan(e: E): EtapeCorrection[] {
  return e.variante === "positions" ? etapesPositions(e) : etapesPlan(e);
}
