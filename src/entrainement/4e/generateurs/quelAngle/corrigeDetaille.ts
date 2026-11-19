import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceQuelAngle } from "../../core/quelAngle.types";
import { DOMAINE_LATEX, formatEnonceLatex, formatTermesSolutionsLatex } from "../../ui/formatQuelAngle";
import {
  COURS_EQUATIONS,
  COURS_REMARQUABLES,
  deg,
  finaliserCorrige,
  fonctionLatex,
  ligneValeurAbsolue,
  lignesCandidats,
  quadrantsCandidats,
  valeurRemarquableLatex,
} from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen18 (quel angle ?) — règle
 * `.claude/rules/feuilles-evaluations.md`. Un seul écran (lettre a) : |k| > 1 → aucune solution ;
 * sinon angle de référence par la table des valeurs remarquables, puis les deux candidats (quadrants
 * donnés par le signe de k), confondus sur un axe ; vérification en remplaçant chaque solution.
 */

type E = ExerciceQuelAngle;

/** Valeur de k (membre de droite de l'énoncé de l'écran). */
function kLatex(e: E): string {
  return formatEnonceLatex(e).split("=")[1]!.trim().replace(/\\frac/g, "\\dfrac");
}

export function correctionDetailleeQuelAngle(e: E): EtapeCorrection[] {
  const f = e.fonction;
  const k = kLatex(e);
  const etapes: EtapeCorrection[] = [];
  if (e.angleReference === null) {
    const abs = k.replace(/^-/, "");
    const lignes: LigneCalcul[] = [];
    const va = ligneValeurAbsolue(k, abs);
    if (va) lignes.push(va);
    const approx: Record<string, FragmentConsigne[]> = {
      "\\sqrt{2}": [texte("car "), latex("\\sqrt{2}\\approx 1{,}41")],
      "\\sqrt{3}": [texte("car "), latex("\\sqrt{3}\\approx 1{,}73")],
      "\\dfrac{3}{2}": [texte("car "), latex("\\dfrac{3}{2}=1{,}5")],
      "2": [texte("plus grand que 1")],
    };
    lignes.push(ligne(`${abs.replace("\\frac", "\\dfrac")}>1`, approx[abs] ?? "plus grand que 1"));
    etapes.push(
      utilise("a", [texte(`Pour tout angle α, ${f} α est compris entre −1 et 1 ${COURS_EQUATIONS} : `), latex(`-1\\leq \\${f}\\alpha\\leq 1`), texte(".")]),
      calcul("a", lignes),
      resultat("a", formatTermesSolutionsLatex(e).map((t) => latex(t))),
      piege("a", [texte("Ne pas chercher d'angle : aucun point du cercle n'a une coordonnée plus grande que 1 en valeur absolue.")]),
    );
    return finaliserCorrige(etapes);
  }
  const ref = e.angleReference;
  const positif = e.signeK === 1 || k === "0";
  const abs = valeurRemarquableLatex(f, ref)!;
  const lignes: LigneCalcul[] = [];
  const va = ligneValeurAbsolue(k, abs);
  if (va) lignes.push(va);
  lignes.push(ligne(`${fonctionLatex(f, ref)}=${abs}`, [texte("valeur remarquable : "), latex(`\\alpha_0=${deg(ref)}`)]));
  lignes.push(...lignesCandidats(f, ref, positif));
  const [q1, q2] = quadrantsCandidats(f, positif);
  etapes.push(
    utilise("a", [
      texte(`On cherche l'angle de référence α₀ du premier quadrant dans la table des valeurs remarquables ${COURS_REMARQUABLES}, puis les deux angles de `),
      latex(DOMAINE_LATEX),
      texte(` où ${f} α a le signe de k (${f === "tan" ? "la tangente a une période de 180° ; " : ""}${q1} et ${q2.replace("quadrant ", "")}) ${COURS_EQUATIONS}.`),
    ]),
    calcul("a", lignes),
    resultat("a", formatTermesSolutionsLatex(e).map((t) => latex(t))),
    verification(
      "a",
      [texte("Chaque solution redonne bien k :")],
      e.solutions.map((s) => ligne(`${fonctionLatex(f, s)}=${k.replace(/\\frac/g, "\\dfrac")}`)),
    ),
    piege("a", [
      e.solutions.length === 1
        ? texte("Une seule solution dans [0° ; 360°[ : la valeur est atteinte en un seul point du cercle (sur un axe).")
        : f === "tan"
          ? texte("La tangente se répète tous les 180° : la deuxième solution est la première + 180°, pas 180° − la première.")
          : texte("Deux solutions dans [0° ; 360°[ : ne pas oublier l'angle symétrique."),
    ]),
  );
  return finaliserCorrige(etapes);
}
