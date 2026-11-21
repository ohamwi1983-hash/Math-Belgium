import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceNatureQuadrilatere } from "../../core/natureQuadrilatere.types";
import { angleDroitEnB, cotesConsecutifsEgaux, critereABBC, estParallelogramme, natureDe, normeCarree, vecAB, vecBC, vecDC } from "../../moteur/modeleNatureQuadrilatere";
import { figureNatureQuadrilatereSvg } from "../../ui/figureNatureQuadrilatere";
import { conclusionAngle, conclusionCotes, conclusionParallelogramme, phraseNature, piegeFragments, pointLatex } from "../../ui/formatNatureQuadrilatere";
import { COURS_COMPOSANTES, COURS_NORME, COURS_ORTHOGONALITE, COURS_VECTEUR, lignesComposantes, lignesNorme, lignesProduitScalaire, lignesTranslation, nb, norme, racineLatex, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen84 « Nature d'un quadrilatère » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (toujours 4 : parallélogramme ou
 * quatrième sommet, côtés consécutifs, angle droit, nature) ; partagé par l'adaptateur papier et
 * l'appli. Les conclusions des étapes a–c viennent des MÊMES fonctions que l'écran
 * (`conclusionParallelogramme`, `conclusionCotes`, `conclusionAngle`, `phraseNature`).
 */

type E = ExerciceNatureQuadrilatere;

function etapesParallelogramme(e: E): EtapeCorrection[] {
  const ab = vecAB(e);
  const dc = vecDC(e);
  const para = estParallelogramme(e);
  const diff = ab.x !== dc.x ? "les premières composantes diffèrent" : "les secondes composantes diffèrent";
  return [
    utilise("a", [
      texte("ABCD est un parallélogramme si et seulement si "),
      latex("\\vec{AB}=\\vec{DC}"),
      texte(` — même sens de parcours, A vers B et D vers C ${COURS_VECTEUR} ; composantes d'un vecteur : extrémité moins origine ${COURS_COMPOSANTES}.`),
    ]),
    calcul("a", [
      ...lignesComposantes("AB", e.A, e.B),
      ...lignesComposantes("DC", e.D, e.C),
      para ? ligne("\\vec{AB}=\\vec{DC}", "mêmes composantes") : ligne("\\vec{AB}\\neq\\vec{DC}", diff),
    ]),
    resultat("a", conclusionParallelogramme(e)),
  ];
}

function etapesQuatrieme(e: E): EtapeCorrection[] {
  const ab = vecAB(e);
  return [
    utilise("a", [
      texte("ABCD est un parallélogramme si et seulement si "),
      latex("\\vec{DC}=\\vec{AB}"),
      texte(` ${COURS_VECTEUR} : C est le translaté de D par `),
      latex("\\vec{AB}"),
      texte(", donc D s'obtient à partir de C en reculant de "),
      latex("\\vec{AB}"),
      texte(` : `),
      latex("x_D=x_C-x_{AB}"),
      texte(` ${COURS_COMPOSANTES}.`),
    ]),
    calcul("a", [...lignesComposantes("AB", e.A, e.B), ...lignesTranslation("D", e.C, "C", ab, "AB", -1, [texte("car "), latex("\\vec{DC}=\\vec{AB}")])]),
    resultat("a", [latex(pointLatex("D", e.D)), texte(" : ABCD est un parallélogramme par construction.")]),
    verification("a", [texte("On recalcule "), latex("\\vec{DC}"), texte(" : on retrouve "), latex("\\vec{AB}"), texte(".")], lignesComposantes("DC", e.D, e.C)),
  ];
}

function etapesCotes(e: E): EtapeCorrection[] {
  const ab = vecAB(e);
  const bc = vecBC(e);
  const egal = cotesConsecutifsEgaux(e);
  return [
    utilise("b", [
      texte("Un losange est un parallélogramme dont deux côtés CONSÉCUTIFS (AB et BC, issus de B) ont la même longueur ; norme d'un vecteur : "),
      latex("\\|\\vec{u}\\|=\\sqrt{x_u^2+y_u^2}"),
      texte(` ${COURS_NORME}.`),
    ]),
    calcul("b", lignesComposantes("BC", e.B, e.C), [], "Composantes"),
    calcul("b", [...lignesNorme(norme("AB"), ab), ...lignesNorme(norme("BC"), bc)], [], "Longueurs"),
    calcul("b", [egal ? ligne(`${norme("AB")}=${norme("BC")}`, "mêmes valeurs") : ligne(`${norme("AB")}\\neq${norme("BC")}`, `${racineLatexTexte(normeCarree(ab))} et ${racineLatexTexte(normeCarree(bc))}`)], [], "Comparaison"),
    resultat("b", conclusionCotes(e)),
  ];
}

/** Valeur d'une norme en texte pour une justification (« 5 », « √10 », « 2√5 »). */
function racineLatexTexte(n: number): string {
  return racineLatex(n).replace(/\\sqrt\{(\d+)\}/, "√$1");
}

function etapesAngle(e: E): EtapeCorrection[] {
  const ab = vecAB(e);
  const bc = vecBC(e);
  const droit = angleDroitEnB(e);
  const lignes = lignesProduitScalaire("AB", "BC", ab, bc);
  lignes[lignes.length - 1] = ligne(lignes[lignes.length - 1]!.latex, droit ? "produit scalaire nul : angle droit en B" : "produit scalaire non nul : pas d'angle droit en B");
  return [
    utilise("c", [
      texte("Un rectangle est un parallélogramme qui a un angle droit ; l'angle en B est droit si et seulement si "),
      latex("\\vec{AB}"),
      texte(" et "),
      latex("\\vec{BC}"),
      texte(" sont orthogonaux, c'est-à-dire si leur produit scalaire "),
      latex("x_{AB}\\cdot x_{BC}+y_{AB}\\cdot y_{BC}"),
      texte(` est nul ${COURS_ORTHOGONALITE}.`),
    ]),
    calcul("c", lignes),
    resultat("c", conclusionAngle(e)),
  ];
}

function etapesNature(e: E): EtapeCorrection[] {
  const para = estParallelogramme(e);
  const egal = cotesConsecutifsEgaux(e);
  const droit = angleDroitEnB(e);
  const ps = critereABBC(e);
  return [
    utilise("d", [
      texte(
        `Tout part du parallélogramme : un losange est un parallélogramme à côtés consécutifs égaux, un rectangle un parallélogramme à angle droit, un carré est à la fois losange et rectangle ${COURS_ORTHOGONALITE}. On garde la nature la plus précise.`,
      ),
    ]),
    calcul("d", [
      ligne(para ? "\\vec{AB}=\\vec{DC}" : "\\vec{AB}\\neq\\vec{DC}", para ? "étape a : parallélogramme" : "étape a : pas un parallélogramme, les deux autres tests ne prouvent rien"),
      ligne(egal ? `${norme("AB")}=${norme("BC")}` : `${norme("AB")}\\neq${norme("BC")}`, egal ? "étape b : côtés consécutifs égaux" : "étape b : côtés consécutifs différents"),
      ligne(droit ? "\\vec{AB}\\cdot\\vec{BC}=0" : `\\vec{AB}\\cdot\\vec{BC}=${nb(ps)}`, droit ? "étape c : angle droit en B" : "étape c : pas d'angle droit"),
    ]),
    { ...resultat("d", [texte(phraseNature(natureDe(e)))]), figureHtml: figureNatureQuadrilatereSvg(e, "corrige") },
  ];
}

function corrigeBrutNatureQuadrilatere(e: E): EtapeCorrection[] {
  const etapes = [...(e.variante === "quatrieme" ? etapesQuatrieme(e) : etapesParallelogramme(e)), ...etapesCotes(e), ...etapesAngle(e), ...etapesNature(e)];
  const p = piegeFragments(e);
  // Le piège s'affiche dans SON étape : inséré après la dernière ligne de cette lettre.
  const fin = etapes.map((x) => x.sousQuestion).lastIndexOf(p.sousQuestion);
  etapes.splice(fin + 1, 0, piege(p.sousQuestion, p.fragments));
  return etapes;
}

export function correctionDetailleeNatureQuadrilatere(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutNatureQuadrilatere(e));
}
