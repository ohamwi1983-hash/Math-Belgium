import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ElementTriangle, ExerciceResoudreTriangle } from "../../core/resoudreTriangle.types";
import type { CoteTriangle, SommetTriangle } from "../../core/triangle.types";
import { COTES, SOMMETS, angleOppose, autresCotes, coteOppose, estCoteElement, plusGrandAngle, positionObtus, type EtapeResolution } from "../../moteur/resolutionTriangle";
import { etapeControle as etapeControleMoteur, planExercice } from "../../moteur/verificationResoudreTriangle";
import { LIBELLES_CONFIGURATION, elementLatex, reponsePremiereLoi, valeurLatex } from "../../ui/formatResoudreTriangle";
import {
  COURS_TRIANGLE,
  angleDonne,
  angleMemoire,
  coteMemoire,
  deg,
  donnee,
  finaliserCorrigeTriangles,
  fragmentsListe,
  lignesAlKashiAngle,
  lignesAlKashiCote,
  lignesArcsin,
  lignesLoiSinusCote,
  lignesLoiSinusSinus,
  lignesSommeAngles,
  rel,
  type Val,
} from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen73 (résoudre complètement un triangle) — règle
 * `.claude/rules/feuilles-evaluations.md`. Quatre étapes = quatre écrans de l'appli : a) la
 * configuration des données (comptage des côtés et des angles, angle compris ou non), b) la première
 * loi (ce que chaque loi demande, testé sur les données), c) les trois éléments manquants dans
 * l'ordre de `planExercice` (un bloc par élément), d) le contrôle de l'angle obtenu par la somme,
 * recalculé par Al-Kashi. Chaque calcul utilise les valeurs EXACTES des étapes précédentes (mémoire
 * de la calculatrice), écrites arrondies. Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceResoudreTriangle;

const NOM_ELEMENT: Record<ElementTriangle, string> = { a: "Côté a", b: "Côté b", c: "Côté c", A: "Angle Â", B: "Angle B̂", C: "Angle Ĉ" };

/** Valeur à substituer : donnée (exacte) ou calculée (mémoire, écrite arrondie). */
function val(e: E, x: ElementTriangle): Val {
  const v = e.triangle[x];
  if (e.donnees.includes(x)) return estCoteElement(x) ? donnee(v) : angleDonne(v);
  return estCoteElement(x) ? coteMemoire(v) : angleMemoire(v);
}

function resultatElement(e: E, x: ElementTriangle): string {
  const d = estCoteElement(x) ? 2 : 1;
  return `${elementLatex(x)} ${rel(e.triangle[x], d)} ${valeurLatex(e, x)}`;
}

function lignesEtape(e: E, etape: EtapeResolution): LigneCalcul[] {
  const t = e.triangle;
  const x = etape.inconnue;
  switch (etape.loi) {
    case "somme": {
      const [Y, Z] = SOMMETS.filter((s) => s !== x) as [SommetTriangle, SommetTriangle];
      return lignesSommeAngles({ inconnu: elementLatex(x), autres: [elementLatex(Y), elementLatex(Z)], valeurs: [val(e, Y), val(e, Z)], resultat: t[x] });
    }
    case "sinus": {
      const [k, K] = etape.couple!;
      if (estCoteElement(x)) {
        const X = angleOppose(x);
        return lignesLoiSinusCote({ x, X: elementLatex(X), k, K: elementLatex(K), vk: val(e, k), vX: val(e, X), vK: val(e, K), resultat: t[x], unite: e.unite });
      }
      const y = coteOppose(x as SommetTriangle);
      const sinus = Math.sin((t[x] * Math.PI) / 180);
      return [
        ...lignesLoiSinusSinus({ X: elementLatex(x), x: y, K: elementLatex(K), k, vx: val(e, y), vK: val(e, K), vk: val(e, k), sinus }),
        ...lignesArcsin({ X: elementLatex(x), angle: t[x] }),
      ];
    }
    case "kashiCote": {
      const X = angleOppose(x as CoteTriangle);
      const [p, q] = COTES.filter((c) => c !== x) as [CoteTriangle, CoteTriangle];
      return lignesAlKashiCote({ x, p, q, X: elementLatex(X), vp: val(e, p), vq: val(e, q), vX: val(e, X), resultat: t[x], unite: e.unite });
    }
    case "kashiAngle": {
      const X = x as SommetTriangle;
      const [p, q] = autresCotes(X);
      const o = coteOppose(X);
      return lignesAlKashiAngle({ X: elementLatex(X), x: o, p, q, vx: val(e, o), vp: val(e, p), vq: val(e, q), angle: t[X] });
    }
  }
}

function etapeConfiguration(e: E): EtapeCorrection[] {
  const cotes = e.donnees.filter(estCoteElement) as CoteTriangle[];
  const angles = e.donnees.filter((x) => !estCoteElement(x)) as SommetTriangle[];
  const lignes: LigneCalcul[] = [
    ligne(`\\text{côtés connus}=${cotes.length}`, cotes.length ? `données : ${cotes.join(", ")}` : "aucun côté donné"),
    ligne(`\\text{angles connus}=${angles.length}`, angles.length ? [texte("données : "), ...angles.flatMap((A, i) => [...(i ? [texte(", ")] : []), latex(elementLatex(A))])] : "aucun angle donné"),
  ];
  if (angles.length === 1) {
    const A = angles[0]!;
    const [p, q] = autresCotes(A);
    lignes.push(ligne(`\\text{côtés qui forment } ${elementLatex(A)}=${p} \\text{ et } ${q}`, "les deux côtés issus de son sommet"));
    if (e.configuration === "SAS") lignes.push(ligne(`\\text{côté opposé à } ${elementLatex(A)}=${coteOppose(A)}`, [texte("il n'est pas donné : "), latex(elementLatex(A)), texte(" est compris entre les deux côtés connus")]));
    else {
      const autre = cotes.find((c) => c !== coteOppose(A))!;
      lignes.push(ligne(`\\text{côté opposé à } ${elementLatex(A)}=${coteOppose(A)}`, [texte("il est donné : "), latex(elementLatex(A)), texte(" n'est pas compris entre les deux côtés connus")]));
      lignes.push(ligne(`${coteOppose(A)}=${valeurLatex(e, coteOppose(A))}>${autre}=${valeurLatex(e, autre)}`, "l'angle donné fait face au plus grand des deux côtés : un seul triangle"));
    }
  }
  return [
    utilise("a", [texte(`On compte les côtés et les angles connus ; avec deux côtés et un angle, on regarde si l'angle est compris entre ces deux côtés (au sommet commun) ${COURS_TRIANGLE}.`)]),
    calcul("a", lignes),
    resultat("a", [texte(`${LIBELLES_CONFIGURATION[e.configuration]} (${e.configuration}).`)]),
  ];
}

function etapePremiereLoi(e: E): EtapeCorrection[] {
  const lignes: LigneCalcul[] = [];
  const angle = e.donnees.find((x) => !estCoteElement(x)) as SommetTriangle | undefined;
  switch (e.configuration) {
    case "AAS": {
      const X = SOMMETS.find((s) => !e.donnees.includes(s))!;
      lignes.push(ligne(`\\text{angles connus}=2`, [texte("la somme des angles donne tout de suite "), latex(elementLatex(X))]));
      const c = e.donnees.find(estCoteElement) as CoteTriangle;
      lignes.push(ligne(`\\text{couple complet}=(${c}\\,;\\,${elementLatex(angleOppose(c))})`, "ensuite : le côté donné et l'angle qui lui fait face, pour la loi des sinus"));
      break;
    }
    case "SAS":
      lignes.push(ligne(`\\text{couples complets}=0`, [texte("aucun côté donné ne fait face à "), latex(elementLatex(angle!)), texte(" : loi des sinus impossible au départ")]));
      lignes.push(ligne(`\\text{angle compris}=${elementLatex(angle!)}`, [texte("Al-Kashi donne le côté opposé "), latex(coteOppose(angle!))]));
      break;
    case "SSS": {
      const L = plusGrandAngle(e.triangle);
      const grand = coteOppose(L);
      const autres = COTES.filter((c) => c !== grand);
      lignes.push(ligne(`${grand}=${valeurLatex(e, grand)}`, [texte("plus grand côté : "), latex(`${grand}>${autres[0]}`), texte(" et "), latex(`${grand}>${autres[1]}`)]));
      lignes.push(ligne(`\\text{plus grand angle}=${elementLatex(L)}`, "il fait face au plus grand côté : seul angle qui peut être obtus, donné sans risque par Al-Kashi"));
      break;
    }
    case "SSA": {
      const x = coteOppose(angle!);
      lignes.push(ligne(`\\text{couple complet}=(${x}\\,;\\,${elementLatex(angle!)})`, [latex(x), texte(" fait face à "), latex(elementLatex(angle!))]));
      const Y = planExercice(e)[0]!.inconnue as SommetTriangle;
      lignes.push(ligne(`${coteOppose(Y)}<${x}`, [latex(elementLatex(Y)), texte(" fait face au plus petit côté : il est aigu, la touche "), latex("\\sin^{-1}"), texte(" le donne")]));
      break;
    }
  }
  return [
    utilise("b", [
      texte(`Ce que demande chaque loi ${COURS_TRIANGLE} : somme des angles — deux angles ; loi des sinus — un couple complet (un côté et l'angle qui lui fait face) et un autre élément ; Al-Kashi pour un côté — deux côtés et l'angle compris ; Al-Kashi pour un angle — les trois côtés.`),
    ]),
    calcul("b", lignes),
    resultat("b", [...reponsePremiereLoi(e), texte(".")]),
  ];
}

function etapeCalculs(e: E): EtapeCorrection[] {
  const plan = planExercice(e);
  const obtus = SOMMETS.find((s) => e.triangle[s] > 90);
  const L = plusGrandAngle(e.triangle);
  const etapes: EtapeCorrection[] = [
    utilise("c", [texte(`Les lois dans l'ordre de la méthode ${COURS_TRIANGLE}, calculatrice en degrés ; chaque calcul réutilise les valeurs exactes déjà obtenues (mémoire de la calculatrice), écrites arrondies.`)]),
    ...plan.map((etape, i) => calcul("c", lignesEtape(e, etape), [], `${i + 1}. ${NOM_ELEMENT[etape.inconnue]}`)),
    resultat("c", fragmentsListe(plan.map((etape) => resultatElement(e, etape.inconnue)))),
    verification("c", [
      texte("Le plus grand angle, "),
      latex(elementLatex(L)),
      texte(", fait bien face au plus grand côté, "),
      latex(coteOppose(L)),
      texte("."),
    ]),
  ];
  if (obtus && positionObtus(e.triangle, e.donnees) === "calcule" && (e.configuration === "SAS" || e.configuration === "SSS")) {
    const sinus = Math.sin((e.triangle[obtus] * Math.PI) / 180);
    etapes.push(
      piege("c", [
        texte("L'angle "),
        latex(`${elementLatex(obtus)} \\approx ${valeurLatex(e, obtus)}`),
        texte(" est obtus. Par la loi des sinus, on obtiendrait "),
        latex(`\\sin ${elementLatex(obtus)} \\approx ${String(Math.round(sinus * 10000) / 10000).replace(".", "{,}")}`),
        texte(", et la touche "),
        latex("\\sin^{-1}"),
        texte(" renverrait l'angle aigu "),
        latex(deg(180 - e.triangle[obtus])),
        texte(" : faux. C'est pourquoi le plus grand angle se calcule par Al-Kashi."),
      ]),
    );
  } else if (e.configuration === "AAS") {
    etapes.push(piege("c", [texte("Chaque côté va avec l'angle qui lui fait face dans la loi des sinus ; et la calculatrice doit être en degrés.")]));
  } else if (e.configuration === "SSA") {
    etapes.push(piege("c", [texte("Si l'angle donné faisait face au plus petit des deux côtés, la touche "), latex("\\sin^{-1}"), texte(" ne suffirait plus : il faudrait tester l'angle aigu et son supplémentaire (cas ambigu).")]));
  } else {
    etapes.push(piege("c", [texte("Ici aucun angle n'est obtus, mais on ne le sait qu'après le calcul : on commence toujours par le plus grand angle, par Al-Kashi. Sans arrondir les valeurs intermédiaires.")]));
  }
  return etapes;
}

function etapeVerifControle(e: E): EtapeCorrection[] {
  const controle = etapeControleMoteur(e);
  const X = controle.inconnue as SommetTriangle;
  return [
    utilise("d", [texte(`L'angle `), latex(elementLatex(X)), texte(` a été obtenu par la somme des angles ; on le recalcule par Al-Kashi isolée en cosinus, avec les trois côtés ${COURS_TRIANGLE}.`)]),
    calcul("d", lignesEtape(e, controle)),
    resultat("d", [latex(resultatElement(e, X)), texte(" : la même valeur que par la somme des angles.")]),
    verification("d", [texte("Les trois angles vérifient donc "), latex("\\hat{A}+\\hat{B}+\\hat{C}=180^\\circ"), texte(".")]),
  ];
}

export function correctionDetailleeResoudreTriangle(e: E): EtapeCorrection[] {
  return finaliserCorrigeTriangles([...etapeConfiguration(e), ...etapePremiereLoi(e), ...etapeCalculs(e), ...etapeVerifControle(e)]);
}

