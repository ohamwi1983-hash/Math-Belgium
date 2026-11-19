import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceCasAmbigu } from "../../core/casAmbigu.types";
import { resoudreSSA, type ResolutionSSA } from "../../moteur/modeleCasAmbigu";
import { REPONSE_ARC_SANS_CANDIDAT } from "../../moteur/verificationCasAmbigu";
import { A_CHAPEAU, B_CHAPEAU, OPTIONS_ARC, optionComparaison, optionNombre, reponsesChampsLatex, sinusLatex, uniteLatex } from "../../ui/formatCasAmbigu";
import { figureCasAmbiguSvg } from "../../ui/figureCasAmbigu";
import {
  COURS_ANGLES_ASSOCIES,
  COURS_TRIANGLE,
  angleDonne,
  angleMemoire,
  apres,
  donnee,
  finaliserCorrigeTriangles,
  fragmentsListe,
  lignesArcsin,
  lignesLoiSinusCote,
  lignesLoiSinusSinus,
  lignesSommeAngles,
  nb,
  nbFixe,
  rel,
} from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen74 (cas ambigu : 0, 1 ou 2 triangles ?) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans de l'appli : a) sin B̂ par la loi
 * des sinus, b) comparaison à 1 (nombre d'angles candidats), c) les candidats et leur test
 * Â + B̂ < 180° (ou, sans candidat, la hauteur h comparée à a), d) le nombre de triangles (lecture des
 * tests, avec la figure à l'arc de compas), e) le côté c de chaque triangle (ou la plus petite longueur
 * de BC). Valeurs : `resoudreSSA` (mêmes nombres que l'écran), réponses : `reponsesChampsLatex`.
 * Partagé par l'adaptateur papier et l'appli (`AppCasAmbigu.tsx`).
 */

type E = ExerciceCasAmbigu;

const indice = (r: ResolutionSSA, rang: number) => (r.candidats.length === 2 ? `_${rang}` : "");

function lignesHauteur(e: E, r: ResolutionSSA): LigneCalcul[] {
  return [
    ligne(`h=b\\cdot\\sin ${A_CHAPEAU}`, "distance de C à la demi-droite : côté opposé à Â dans le triangle rectangle"),
    ligne(`=${nb(e.b)}\\cdot\\sin ${e.angleA}^\\circ`, "on remplace, calculatrice en degrés"),
    ligne(`${apres(rel(r.hauteur, 2), r.hauteur, 2)}${uniteLatex(e)}`),
  ];
}

function etapeSinus(e: E, r: ResolutionSSA): EtapeCorrection[] {
  return [
    utilise("a", [texte(`Loi des sinus ${COURS_TRIANGLE} : chaque côté avec le sinus de l'angle qui lui fait face, ici le couple complet `), latex(`(a\\,;\\,${A_CHAPEAU})`), texte(" et le côté b, opposé à "), latex(B_CHAPEAU), texte(".")]),
    calcul("a", lignesLoiSinusSinus({ X: B_CHAPEAU, x: "b", K: A_CHAPEAU, k: "a", vx: donnee(e.b), vK: angleDonne(e.angleA), vk: donnee(e.a), sinus: r.sinB, d: 3 })),
    resultat("a", [latex(reponsesChampsLatex(e, 0)[0]!)]),
  ];
}

function etapeComparaison(r: ResolutionSSA): EtapeCorrection[] {
  const s = `\\sin ${B_CHAPEAU}`;
  const lignes: LigneCalcul[] =
    r.comparaison === "superieur"
      ? [ligne(`${s}${apres(rel(r.sinB, 3), r.sinB, 3)}>1`, [texte("un sinus ne dépasse jamais 1 : aucun angle "), latex(B_CHAPEAU), texte(" n'a ce sinus")])]
      : r.comparaison === "egal"
        ? [ligne(`${s}=1`, "sinus maximal"), ligne(`${B_CHAPEAU}=90^\\circ`, "un seul angle entre 0° et 180° a un sinus égal à 1 : 180° − 90° = 90°, le même")]
        : [
            ligne(`${s}${apres(rel(r.sinB, 3), r.sinB, 3)}<1`, "deux angles entre 0° et 180° ont ce sinus"),
            ligne(`\\sin(180^\\circ-${B_CHAPEAU}_1)=\\sin ${B_CHAPEAU}_1`, `angles supplémentaires ${COURS_ANGLES_ASSOCIES}`),
          ];
  const etapes: EtapeCorrection[] = [
    utilise("b", [texte("Le sinus d'un angle est compris entre −1 et 1 ; entre 0° et 180°, deux angles supplémentaires ont le même sinus "), latex("\\sin(180^\\circ-x)=\\sin x"), texte(` ${COURS_ANGLES_ASSOCIES}.`)]),
    calcul("b", lignes),
    resultat("b", optionComparaison(r.comparaison).fragments),
  ];
  if (r.comparaison === "superieur") {
    etapes.push(
      piege("b", [texte("La calculatrice affiche une erreur pour "), latex(`\\sin^{-1}(${sinusLatex(r.sinB)})`), texte(" : ce n'est pas une faute de calcul, c'est la preuve qu'aucun triangle n'existe.")]),
    );
  }
  return etapes;
}

/** Test d'un candidat : Â + B̂ₖ ≈ … < 180° (ou ≥ 180°, refusé). */
function lignesTest(e: E, r: ResolutionSSA, c: ResolutionSSA["candidats"][number]): LigneCalcul[] {
  const B = `${B_CHAPEAU}${indice(r, c.rang)}`;
  const vB = c.angleB === 90 ? angleDonne(90) : angleMemoire(c.angleB);
  const exact = c.angleB === 90;
  return [
    ligne(`${A_CHAPEAU}+${B}${exact ? "=" : "\\approx"}${e.angleA}^\\circ+${exact ? "90" : nbFixe(vB.v, 1)}^\\circ`, exact ? "on remplace" : "on remplace (valeur exacte gardée en mémoire, écrite arrondie)"),
    ligne(`${exact ? apres(rel(c.somme, 1), c.somme, 1) : apres("\\approx", c.somme, 1)}^\\circ`),
    ligne(`${c.valide ? "<" : "\\geq"}180^\\circ`, c.valide ? "il reste de la place pour Ĉ : candidat retenu" : "aucune place pour Ĉ : candidat refusé"),
  ];
}

function etapeCandidats(e: E, r: ResolutionSSA): EtapeCorrection[] {
  if (r.candidats.length === 0) {
    return [
      utilise("c", [texte(`Aucun candidat : on regarde la figure. La distance de C à la demi-droite [Ax) est la hauteur h issue de C ${COURS_TRIANGLE} : `), latex(`h=b\\cdot\\sin ${A_CHAPEAU}`)]),
      calcul("c", [...lignesHauteur(e, r), ligne(`a=${nb(e.a)}${uniteLatex(e)}<${nbFixe(r.hauteur, 2)}${uniteLatex(e)}`, "le rayon a de l'arc est plus court que h")]),
      resultat("c", OPTIONS_ARC.find((o) => o.id === REPONSE_ARC_SANS_CANDIDAT)!.fragments),
    ];
  }
  const blocs: EtapeCorrection[] = [];
  if (r.candidats.length === 1) {
    blocs.push(calcul("c", [ligne(`${B_CHAPEAU}=90^\\circ`, "le seul angle de sinus 1"), ...lignesTest(e, r, r.candidats[0]!)]));
  } else {
    const [c1, c2] = r.candidats as [ResolutionSSA["candidats"][number], ResolutionSSA["candidats"][number]];
    blocs.push(calcul("c", lignesArcsin({ X: `${B_CHAPEAU}_1`, angle: c1.angleB, supplementaire: { X2: `${B_CHAPEAU}_2`, angle2: c2.angleB } }), [], "Les deux candidats"));
    blocs.push(calcul("c", lignesTest(e, r, c1), [], "Test du candidat aigu"));
    blocs.push(calcul("c", lignesTest(e, r, c2), [], "Test du candidat obtus"));
  }
  const etapes: EtapeCorrection[] = [
    utilise("c", [texte("Un angle candidat donne un triangle seulement s'il laisse de la place au troisième angle : "), latex(`${A_CHAPEAU}+${B_CHAPEAU}<180^\\circ`), texte(` ${COURS_TRIANGLE}.`)]),
    ...blocs,
    resultat("c", fragmentsListe(reponsesChampsLatex(e, 2))),
  ];
  if (r.comparaison === "egal") {
    etapes.push(piege("c", [texte("Avec "), latex(`\\sin ${B_CHAPEAU}=1`), texte(", il n'y a qu'un candidat : "), latex("180^\\circ-90^\\circ=90^\\circ"), texte(" est le même angle, pas un second triangle.")]));
  } else if (r.nombreTriangles === 1) {
    etapes.push(
      piege("c", [latex(`${B_CHAPEAU}_2`), texte(" a le même sinus que "), latex(`${B_CHAPEAU}_1`), texte(", mais "), latex(`${A_CHAPEAU}+${B_CHAPEAU}_2\\geq 180^\\circ`), texte(" : le garder sans tester la somme conduirait à un « second triangle » impossible.")]),
    );
  } else {
    etapes.push(piege("c", [texte("Ne pas s'arrêter à l'angle aigu donné par la touche "), latex("\\sin^{-1}"), texte(" : son supplémentaire "), latex(`${B_CHAPEAU}_2`), texte(" a le même sinus et donne ici un second triangle.")]));
  }
  return etapes;
}

function etapeNombre(e: E, r: ResolutionSSA): EtapeCorrection[] {
  const lignes: LigneCalcul[] =
    r.candidats.length === 0
      ? [ligne("\\text{candidats}=0", "aucun angle n'a un sinus supérieur à 1 : l'arc n'atteint pas la demi-droite")]
      : r.candidats.map((c) => {
          const B = `${B_CHAPEAU}${indice(r, c.rang)}`;
          const triangle = r.candidats.length === 2 ? `triangle AB${c.rang === 1 ? "₁" : "₂"}C` : "triangle ABC";
          return ligne(`${A_CHAPEAU}+${B}${c.angleB === 90 ? "=" : "\\approx"}${c.angleB === 90 ? nb(c.somme, 1) : nbFixe(c.somme, 1)}^\\circ${c.valide ? "<" : "\\geq"}180^\\circ`, c.valide ? `${triangle} : il existe` : "pas de triangle avec ce candidat");
        });
  const texteFigure =
    r.nombreTriangles === 0
      ? "L'arc de centre C et de rayon a ne rencontre pas la demi-droite [Ax)."
      : r.nombreTriangles === 2
        ? "L'arc de centre C et de rayon a coupe la demi-droite [Ax) en deux points, B₁ et B₂."
        : r.comparaison === "egal"
          ? "L'arc de centre C et de rayon a touche la demi-droite [Ax) en un seul point : le triangle est rectangle en B."
          : "L'arc de centre C et de rayon a coupe la droite (Ax) deux fois, mais un seul point est sur la demi-droite [Ax) — l'autre, derrière A, correspond au candidat refusé.";
  return [
    utilise("d", [texte("Chaque candidat retenu à l'étape précédente donne un triangle ; sur la figure, chaque triangle est un point où l'arc de centre C et de rayon a coupe la demi-droite [Ax).")]),
    calcul("d", lignes),
    { ...resultat("d", [...optionNombre(r.nombreTriangles).fragments, texte(`. ${texteFigure}`)]), figureHtml: figureCasAmbiguSvg(e, true) },
  ];
}

function etapeCote(e: E, r: ResolutionSSA): EtapeCorrection[] {
  if (r.nombreTriangles === 0) {
    return [
      utilise("e", [texte("L'arc touche la demi-droite dès que a atteint la distance h de C à [Ax), la hauteur issue de C : pour a = h, un seul triangle, rectangle en B.")]),
      calcul("e", lignesHauteur(e, r)),
      resultat("e", [latex(reponsesChampsLatex(e, 4)[0]!)]),
    ];
  }
  const blocs = r.triangles.map((t) => {
    const i = r.nombreTriangles === 2 ? `_${t.rang}` : "";
    const vB = t.angleB === 90 ? angleDonne(90) : angleMemoire(t.angleB);
    return calcul(
      "e",
      [
        ...lignesSommeAngles({ inconnu: `\\hat{C}${i}`, autres: [A_CHAPEAU, `${B_CHAPEAU}${i}`], valeurs: [angleDonne(e.angleA), vB], resultat: t.angleC }),
        ...lignesLoiSinusCote({ x: `c${i}`, X: `\\hat{C}${i}`, k: "a", K: A_CHAPEAU, vk: donnee(e.a), vX: t.angleB === 90 ? angleDonne(t.angleC) : angleMemoire(t.angleC), vK: angleDonne(e.angleA), resultat: t.c, unite: e.unite }),
      ],
      [],
      r.nombreTriangles === 2 ? `Triangle AB${t.rang === 1 ? "₁" : "₂"}C` : "Triangle ABC",
    );
  });
  return [
    utilise("e", [texte(`Dans chaque triangle, le troisième angle complète la somme à 180°, puis la loi des sinus avec le couple complet `), latex(`(a\\,;\\,${A_CHAPEAU})`), texte(` ${COURS_TRIANGLE}.`)]),
    ...blocs,
    resultat("e", fragmentsListe(reponsesChampsLatex(e, 4))),
  ];
}

export function correctionDetailleeCasAmbigu(e: E): EtapeCorrection[] {
  const r = resoudreSSA(e);
  return finaliserCorrigeTriangles([...etapeSinus(e, r), ...etapeComparaison(r), ...etapeCandidats(e, r), ...etapeNombre(e, r), ...etapeCote(e, r)]);
}
