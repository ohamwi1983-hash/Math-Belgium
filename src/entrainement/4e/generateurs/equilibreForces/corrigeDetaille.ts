import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquilibreForces } from "../../core/equilibreForces.types";
import { angleF3, f1, f2, f3, intensiteArrondie, intensiteExacteDemandee, normeCarreeF3, resultante, simplifierRacine } from "../../moteur/modeleEquilibreForces";
import { construireFigureCorrigePapier } from "../../ui/figureEquilibreForces";
import { NORME3, OPTIONS_CONDITION_LATEX, SOMME12, V1, V2, V3, colonne, colonneTexte, dixieme, nb, reponseAttendueFragments, sensTexte } from "../../ui/formatEquilibreForces";
import { COURS_NORME, COURS_PHYSIQUE, COURS_SOMME_REPERE, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen90 « Équilibre de forces en composantes » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (condition, résultante, force cherchée,
 * intensité, direction) ; partagé par l'adaptateur papier et l'appli. Tout en composantes ; intensité
 * exacte (racine simplifiée) ou au dixième ; angle par la tangente, en degrés.
 */

type E = ExerciceEquilibreForces;

const S12 = SOMME12.replace(/ /g, "");

function etapesCondition(): EtapeCorrection[] {
  return [
    utilise("a", [texte(`Un système est à l'équilibre quand la somme des forces qui s'exercent sur lui est le vecteur nul ${COURS_PHYSIQUE}.`)]),
    calcul("a", [ligne(`${V1}+${V2}+${V3}=\\vec{0}`, "condition d'équilibre"), ligne(`${V3}=-${V1}-${V2}`, "on isole la force inconnue"), ligne(`=-(${S12})`, "on met le signe − en évidence")]),
    resultat("a", [latex(OPTIONS_CONDITION_LATEX.oppose), texte(" : la force cherchée est l'opposée de la résultante des deux autres.")]),
  ];
}

function etapesResultante(e: E): EtapeCorrection[] {
  const a = f1(e);
  const b = f2(e);
  const r = resultante(e);
  const lignes: LigneCalcul[] = [];
  if (e.situation === "anneau") {
    lignes.push(
      ligne(`${V1}=${colonneTexte(`${nb(e.f1.x)}\\cdot ${e.unite}`, `${nb(e.f1.y)}\\cdot ${e.unite}`)}`, `carreaux lus sur le quadrillage, × ${e.unite} N`),
      ligne(`=${colonne(a)}`),
      ligne(`${V2}=${colonneTexte(`${nb(e.f2.x)}\\cdot ${e.unite}`, `${nb(e.f2.y)}\\cdot ${e.unite}`)}`, `carreaux lus sur le quadrillage, × ${e.unite} N`),
      ligne(`=${colonne(b)}`),
    );
  }
  lignes.push(ligne(`${S12}=${colonneTexte(`${nb(a.x)}+${nb(b.x, true)}`, `${nb(a.y)}+${nb(b.y, true)}`)}`, "composante par composante"), ligne(`=${colonne(r)}`));
  return [
    utilise("b", [texte(`La résultante de deux forces est leur somme ; dans un repère, on additionne composante par composante ${COURS_SOMME_REPERE}.`), ...(e.situation === "anneau" ? [texte(` Sur le quadrillage, un carreau vaut ${e.unite} N.`)] : [])]),
    calcul("b", lignes),
    resultat("b", reponseAttendueFragments(e, 1)),
  ];
}

function etapesF3(e: E): EtapeCorrection[] {
  const a = f1(e);
  const b = f2(e);
  const r = resultante(e);
  const g = f3(e);
  return [
    utilise("c", [texte("La force cherchée est l'opposée de la résultante : chaque composante change de signe.")]),
    calcul("c", [ligne(`${V3}=-(${S12})`, "étape a"), ligne(`=-${colonne(r)}`, "résultante de l'étape b"), ligne(`=${colonne(g)}`, "on change le signe de chaque composante")]),
    { ...resultat("c", [latex(`${V3}${colonne(g)}`), texte(` : la force cherchée est dirigée ${sensTexte(g)}.`)]), figureHtml: construireFigureCorrigePapier(e) },
    verification("c", [texte("Le polygone des forces se referme : la somme des trois forces est nulle.")], [
      ligne(`${V1}+${V2}+${V3}=${colonneTexte(`${nb(a.x)}+${nb(b.x, true)}+${nb(g.x, true)}`, `${nb(a.y)}+${nb(b.y, true)}+${nb(g.y, true)}`)}`, "composante par composante"),
      ligne(`=${colonneTexte("0", "0")}`, "c'est le vecteur nul"),
    ]),
    piege("c", [
      texte("Ne pas confondre la résultante "),
      latex(`${SOMME12}${colonne(r)}`),
      texte(" et la force d'équilibre : oublier le signe moins donnerait une force qui double l'effet des deux autres au lieu de le compenser."),
    ]),
  ];
}

function etapesIntensite(e: E): EtapeCorrection[] {
  const g = f3(e);
  const n2 = normeCarreeF3(e);
  const { k, m } = simplifierRacine(n2);
  const lignes: LigneCalcul[] = [
    ligne(`${NORME3}=\\sqrt{${nb(g.x, true)}^2+${nb(g.y, true)}^2}`, "norme du vecteur"),
    ligne(`=\\sqrt{${nb(g.x * g.x)}+${nb(g.y * g.y)}}`),
    ligne(`=\\sqrt{${nb(n2)}}`),
  ];
  if (m === 1) lignes.push(ligne(`=${nb(k)}`, `${nb(n2).replace(/\\,/g, " ")} = ${nb(k)}²`));
  else if (intensiteExacteDemandee(e)) {
    if (k > 1) lignes.push(ligne(`=\\sqrt{${nb(k * k)}\\cdot ${nb(m)}}`, "on extrait le plus grand carré"), ligne(`=${nb(k)}\\sqrt{${nb(m)}}`));
  } else lignes.push(ligne(`\\approx ${dixieme(intensiteArrondie(e))}`, "au dixième de newton (calculatrice)"));
  const exact = intensiteExacteDemandee(e) && m !== 1;
  return [
    utilise("d", [texte("L'intensité d'une force est la norme de son vecteur : "), latex("\\|\\vec{u}\\|=\\sqrt{x^2+y^2}"), texte(` ${COURS_NORME}.`)]),
    calcul("d", lignes),
    resultat("d", [texte("Intensité de la force cherchée : "), ...reponseAttendueFragments(e, 3), ...(exact ? [texte(` (≈ ${dixieme(intensiteArrondie(e), "texte")} N)`)] : []), texte(".")]),
  ];
}

function etapesDirection(e: E): EtapeCorrection[] {
  const g = f3(e);
  const ax = Math.abs(g.x);
  const ay = Math.abs(g.y);
  const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b));
  const pg = Number.isInteger(ax) && Number.isInteger(ay) ? pgcd(ay, ax) : 1;
  return [
    utilise("e", [texte("Dans le triangle rectangle formé par les composantes, le côté opposé à α mesure |y| et le côté adjacent |x| : "), latex("\\tan\\alpha=\\dfrac{|y|}{|x|}"), texte(" (angle en degrés).")]),
    calcul("e", [
      ligne(`\\tan\\alpha=\\dfrac{|${nb(g.y)}|}{|${nb(g.x)}|}`, "composantes de la force cherchée"),
      ligne(`=\\dfrac{${nb(ay)}}{${nb(ax)}}`),
      ...(pg > 1 ? [ligne(`=\\dfrac{${nb(ay / pg)}}{${nb(ax / pg)}}`, `on simplifie par ${pg}`)] : []),
      ligne(`\\alpha\\approx ${dixieme(angleF3(e))}^\\circ`, "calculatrice : touche tan⁻¹, en degrés"),
    ]),
    resultat("e", [texte(`La force cherchée est dirigée ${sensTexte(g)} et fait un angle d'environ `), latex(`${dixieme(angleF3(e))}^\\circ`), texte(" avec l'axe x.")]),
  ];
}

function corrigeBrutEquilibreForces(e: E): EtapeCorrection[] {
  return [...etapesCondition(), ...etapesResultante(e), ...etapesF3(e), ...etapesIntensite(e), ...(e.direction ? etapesDirection(e) : [])];
}

export function correctionDetailleeEquilibreForces(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutEquilibreForces(e));
}
