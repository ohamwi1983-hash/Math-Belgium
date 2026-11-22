import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { DroiteNommee2, ExerciceDemontrerParallelisme, ExerciceDeuxPlansParalleles, ExerciceDroitePlanParallele, RaisonParallele } from "../../core/demontrerParallelisme.types";
import { figurePositionsPlansSvg } from "../../ui/figurePositionsPlans";
import { conclusionJustification, critereValable, elementsFigure, libelle, libelleCandidat, nomP, nommeDansPlan } from "../../ui/formatDemontrerParallelisme";
import { descriptionPlan } from "../../ui/formatPositionsPlans";
import { COURS_PARALLELISME, COURS_PLAN, dL, finaliserEspace2, ligneMilieu, lignesDroiteDansPlan, nomL, paralleleL, planL } from "../../ui/corrigeEspace2";
import { texteRaison } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de gen103 « Démontrer un parallélisme » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : a) le critère du cours, écrit pour
 * l'instance ; b) la (ou les) droite(s) témoin(s) : appartenance des points au plan, inclusion,
 * parallélisme annoncé (et le leurre « parallèle mais hors du plan » écarté) ; c) (et d) la
 * justification du parallélisme : les propriétés de la figure plane, une par ligne (côtés opposés,
 * milieux écrits comme des longueurs égales, droite des milieux), puis la conclusion par le critère.
 * Partagé par l'adaptateur papier et l'appli (`paires` : les deux parallélismes confirmés à l'écran 2
 * de « deux plans », ceux de l'élève s'ils sont justes — les écrans 3 et 4 portent sur eux).
 */

type E = ExerciceDemontrerParallelisme;

function planLatex(e: E, i: number): string {
  return planL(e.plans[i]!);
}

/** Pourquoi les deux points de la droite sont dans le plan i (justification courte). */
function justificationPoints(e: E, d: DroiteNommee2, i: number): string {
  const nom = e.plans[i]!;
  if (d.every((n) => nom.includes(n))) return `points qui nomment le plan ${nomP(e, i)}`;
  const description = descriptionPlan(e, i);
  return description ? `le plan ${nomP(e, i)} est ${description}` : `points du plan ${nomP(e, i)}`;
}

export function texteJustif(r: RaisonParallele): string {
  if (r.type === "quad") return `Côtés opposés d'un parallélogramme (rectangle, carré) : ils sont parallèles ${COURS_PARALLELISME}.`;
  if (r.type === "milieux") return `Droite des milieux : dans un triangle, la droite qui joint les milieux de deux côtés est parallèle au troisième côté ${COURS_PARALLELISME}.`;
  return `Milieux de deux côtés opposés d'un parallélogramme : la droite qui les joint est parallèle aux deux autres côtés ${COURS_PARALLELISME}.`;
}

/** Les propriétés de la figure plane, une par ligne, jusqu'au parallélisme. */
export function lignesRaison(r: RaisonParallele): LigneCalcul[] {
  const conclusion = paralleleL(dL(r.droite1), dL(r.droite2));
  const fig = r.figure.join("");
  if (r.type === "quad") return [ligne(conclusion, `${fig} est un ${r.nature} : côtés opposés`)];
  if (r.type === "milieux") {
    const [x, y, z] = r.figure as [string, string, string];
    const tri = [...r.figure].sort().join("");
    return [ligneMilieu(r.milieux![0], x, y), ligneMilieu(r.milieux![1], x, z), ligne(conclusion, `droite des milieux dans le triangle ${tri}`)];
  }
  const [c1, c2] = r.cotes!;
  return [ligneMilieu(r.milieux![0], c1[0], c1[1]), ligneMilieu(r.milieux![1], c2[0], c2[1]), ligne(conclusion, `milieux des côtés opposés du ${r.nature} ${fig}`)];
}

function etapeJustification(sq: string, r: RaisonParallele): EtapeCorrection[] {
  return [utilise(sq, [texte(texteJustif(r))]), calcul(sq, lignesRaison(r))];
}

function figureFinale(e: E, temoins: number | [number, number]): string {
  return figurePositionsPlansSvg(e, { mode: "papier", ...elementsFigure(e, temoins, true) });
}

const PIEGE_JUSTIF =
  "« Aucun point commun » ou « dans deux faces parallèles » ne prouve jamais que deux droites sont parallèles : elles pourraient être gauches. Il faut une figure plane qui les contient toutes les deux.";

function corrigeDroitePlan(e: ExerciceDroitePlanParallele): EtapeCorrection[] {
  const T = dL(e.droite);
  const Pi = planLatex(e, 0);
  const W = e.raison.droite2;
  const hors = e.candidats.find((_, i) => e.defautsCandidats[i]?.includes("bien parallèle"));
  const lignesB: LigneCalcul[] = [...lignesDroiteDansPlan(W[0], W[1], Pi, justificationPoints(e, W, 0)), ligne(paralleleL(dL(W), T), "même direction : justifié à l'étape 3")];
  if (hors) {
    const x = hors.find((n) => !nommeDansPlan(e, n, 0)) ?? hors[0];
    lignesB.push(ligne(`${nomL(x)}\\notin ${Pi}`, `${libelle(hors)} ∥ ${libelle(e.droite)}, mais elle n'est pas dans le plan : elle ne convient pas`));
  }
  return [
    utilise("a", [texte(`Critère « droite ∥ plan » : une droite est parallèle à un plan si elle est parallèle à une droite de ce plan ${COURS_PARALLELISME}.`)]),
    calcul("a", [ligne(`${T}\\parallel d\\text{ et }d\\subset ${Pi}\\Rightarrow ${T}\\parallel ${Pi}`, "critère droite ∥ plan")]),
    resultat("a", [texte(`Il suffit de trouver une droite d du plan ${nomP(e)} parallèle à ${libelle(e.droite)} : « ${critereValable(e)} »`)]),
    piege("a", [texte(`Une droite parallèle à ${libelle(e.droite)} qui passe seulement par un point du plan peut percer ce plan : le critère demande une droite DU plan.`)]),
    utilise("b", [texte(`Une droite est dans un plan quand deux de ses points y sont ${COURS_PLAN} ; la droite témoin doit être une droite du plan ET être parallèle à ${libelle(e.droite)}.`)]),
    calcul("b", lignesB),
    resultat("b", [texte(`Droite témoin : ${libelle(W)}, droite du plan ${nomP(e)} parallèle à ${libelle(e.droite)}.`)]),
    piege(
      "b",
      [
        texte(
          hors
            ? `${libelle(hors)} est aussi parallèle à ${libelle(e.droite)}, mais elle n'est pas dans le plan ${nomP(e)} : elle ne prouve rien. La droite témoin doit être une droite DU plan.`
            : `La droite témoin doit être une droite DU plan et être parallèle à ${libelle(e.droite)} : une droite du plan qui la croise seulement sur le dessin ne convient pas.`,
        ),
      ],
    ),
    ...etapeJustification("c", e.raison),
    calcul("c", [ligne(paralleleL(T, dL(W)), "parallélisme justifié ci-dessus"), ligne(`${dL(W)}\\subset ${Pi}`, "étape 2"), ligne(`${T}\\parallel ${Pi}`, "critère droite ∥ plan")], [], "Conclusion"),
    { ...resultat("c", [texte(`${texteRaison(e.raison)} ${conclusionJustification(e, 1)}`)]), figureHtml: figureFinale(e, e.temoin) },
    piege("c", [texte(PIEGE_JUSTIF)]),
  ];
}

function lignesSecantes(e: ExerciceDeuxPlansParalleles, a: number, b: number): LigneCalcul {
  const ga = e.candidats[a]!.gauche;
  const gb = e.candidats[b]!.gauche;
  const pc = ga.find((n) => gb.includes(n));
  if (pc) return ligne(`${dL(ga)}\\cap ${dL(gb)}=\\{${nomL(pc)}\\}`, `sécantes en ${pc}`);
  return ligne(`${dL(ga)}\\nparallel ${dL(gb)}`, "non parallèles, dans un même plan : sécantes");
}

function corrigeDeuxPlans(e: ExerciceDeuxPlansParalleles, paires: [number, number] | null): EtapeCorrection[] {
  const [a, b] = paires ?? e.paireAttendue;
  const ca = e.candidats[a]!;
  const cb = e.candidats[b]!;
  const P = planLatex(e, 0);
  const Q = planLatex(e, 1);
  const lignesB: LigneCalcul[] = [
    ...lignesDroiteDansPlan(ca.gauche[0], ca.gauche[1], P, justificationPoints(e, ca.gauche, 0)),
    ...lignesDroiteDansPlan(cb.gauche[0], cb.gauche[1], P, justificationPoints(e, cb.gauche, 0)),
    lignesSecantes(e, a, b),
    ...lignesDroiteDansPlan(ca.droite[0], ca.droite[1], Q, justificationPoints(e, ca.droite, 1)),
    ...lignesDroiteDansPlan(cb.droite[0], cb.droite[1], Q, justificationPoints(e, cb.droite, 1)),
  ];
  const pc = ca.gauche.find((n) => cb.gauche.includes(n));
  return [
    utilise("a", [texte(`Critère « plan ∥ plan » : deux plans sont parallèles si deux droites sécantes du premier sont parallèles à deux droites du second ${COURS_PARALLELISME}.`)]),
    calcul("a", [
      ligne(`d_1,\\,d_2\\subset ${P}`, "deux droites sécantes du premier plan"),
      ligne(`d_1',\\,d_2'\\subset ${Q}`, "deux droites du second plan"),
      ligne(`d_1\\parallel d_1'\\text{ et }d_2\\parallel d_2'\\Rightarrow ${P}\\parallel ${Q}`, "critère plan ∥ plan"),
    ]),
    resultat("a", [texte(`Il suffit de trouver deux droites sécantes du plan ${nomP(e, 0)} parallèles à deux droites du plan ${nomP(e, 1)} : « ${critereValable(e)} »`)]),
    piege("a", [texte("Une seule direction commune ne suffit pas : deux plans sécants contiennent aussi des droites parallèles (à leur droite d'intersection).")]),
    utilise("b", [texte(`Une droite est dans un plan quand deux de ses points y sont ${COURS_PLAN} ; les deux droites du premier plan doivent être sécantes (deux directions différentes).`)]),
    calcul("b", lignesB),
    resultat("b", [texte(`${libelleCandidat(ca)} et ${libelleCandidat(cb)}, avec ${libelle(ca.gauche)} et ${libelle(cb.gauche)} sécantes${pc ? ` en ${pc}` : ""} dans le plan ${nomP(e, 0)}.`)]),
    piege("b", [texte(`Une seule droite, ou deux droites parallèles entre elles, ne suffisent pas : il faut deux droites sécantes du plan ${nomP(e, 0)}, chacune parallèle à une droite du plan ${nomP(e, 1)}.`)]),
    ...etapeJustification("c", ca.raison!),
    resultat("c", [texte(texteRaison(ca.raison!))]),
    piege("c", [texte(PIEGE_JUSTIF)]),
    ...etapeJustification("d", cb.raison!),
    calcul(
      "d",
      [
        ligne(paralleleL(dL(ca.gauche), dL(ca.droite)), "étape 3"),
        ligne(paralleleL(dL(cb.gauche), dL(cb.droite)), "ci-dessus"),
        lignesSecantes(e, a, b),
        ligne(`${P}\\parallel ${Q}`, "critère plan ∥ plan"),
      ],
      [],
      "Conclusion",
    ),
    { ...resultat("d", [texte(`${texteRaison(cb.raison!)} ${conclusionJustification(e, 2)}`)]), figureHtml: figureFinale(e, [a, b]) },
  ];
}

export function correctionDetailleeDemontrerParallelisme(e: E, paires: [number, number] | null = null): EtapeCorrection[] {
  return finaliserEspace2(e.variante === "droite-plan" ? corrigeDroitePlan(e) : corrigeDeuxPlans(e, paires));
}
