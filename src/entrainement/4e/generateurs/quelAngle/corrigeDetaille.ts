import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceQuelAngle } from "../../core/quelAngle.types";
import { DOMAINE_LATEX, estEgalite, formatEnonceLatex, formatTermesSolutionsLatex, membreEgaliteLatex } from "../../ui/formatQuelAngle";
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

/** « α = −20° + 360° = 340° » : ramène un angle dans [0° ; 360°[ en une ligne (rien si déjà dedans). */
function ramener(a: number): string {
  if (a >= 0 && a < 360) return "";
  const k = a < 0 ? Math.ceil(-a / 360) : -Math.floor(a / 360);
  const r = a + 360 * k;
  const tours = Math.abs(k) === 1 ? "360^\\circ" : `${Math.abs(k)}\\times 360^\\circ`;
  return `${k > 0 ? "+" : "-"}${tours}=${deg(r)}`;
}

/** Variante « sin α = sin β, cos α = cos β » (décision 4 de l'utilisateur, fin de catalogue). */
function correctionEgalite(e: E & { angleEgal: number }): EtapeCorrection[] {
  const f = e.fonction as "sin" | "cos";
  const b = e.angleEgal;
  const membre = membreEgaliteLatex(e);
  const autre = f === "sin" ? 180 - b : -b;
  const lignes: LigneCalcul[] = [];
  const r1 = ramener(b);
  lignes.push(
    ligne(
      `\\alpha_1=${deg(b)}${r1}`,
      r1 === "" ? [texte("une solution évidente : "), latex(`\\${f}\\alpha=${membre}`)] : [texte("une solution évidente, ramenée dans "), latex(DOMAINE_LATEX)],
    ),
  );
  const ecriture = f === "sin" ? `180^\\circ-${b < 0 ? `(${deg(b)})` : deg(b)}` : `-${b < 0 ? `(${deg(b)})` : deg(b)}`;
  const r2 = ramener(autre);
  // Ligne courte sur papier : la réduction dans [0° ; 360°[ va sur une ligne à part.
  lignes.push(
    ligne(
      `\\alpha_2=${ecriture}=${deg(autre)}`,
      f === "sin"
        ? [texte("angles supplémentaires : "), latex("\\sin(180^\\circ-\\beta)=\\sin\\beta")]
        : [texte("angles opposés : "), latex("\\cos(-\\beta)=\\cos\\beta")],
    ),
  );
  if (r2 !== "") lignes.push(ligne(`\\alpha_2=${deg(autre)}${r2}`, [texte("ramené dans "), latex(DOMAINE_LATEX)]));
  const etapes: EtapeCorrection[] = [
    utilise("a", [
      texte(
        f === "sin"
          ? `Deux angles supplémentaires ont le même sinus ${COURS_EQUATIONS} : les solutions sont β et 180° − β, ramenés dans `
          : `Deux angles opposés ont le même cosinus ${COURS_EQUATIONS} : les solutions sont β et −β, ramenés dans `,
      ),
      latex(DOMAINE_LATEX),
      texte("."),
    ]),
    calcul("a", lignes),
    resultat("a", formatTermesSolutionsLatex(e).map((t) => latex(t))),
    verification(
      "a",
      [texte(`Chaque solution a bien le même ${f === "sin" ? "sinus" : "cosinus"} que `), latex(b < 0 ? `${deg(b)}` : deg(b)), texte(" :")],
      e.solutions.map((sol) => ligne(`${fonctionLatex(f, sol)}=${membre}`)),
    ),
    piege("a", [
      f === "sin"
        ? texte("Pour le sinus, la deuxième solution est 180° − β (famille supplémentaire), pas −β.")
        : texte("Pour le cosinus, la deuxième solution est −β (famille des opposés), pas 180° − β."),
    ]),
  ];
  return finaliserCorrige(etapes);
}

export function correctionDetailleeQuelAngle(e: E): EtapeCorrection[] {
  if (estEgalite(e)) return correctionEgalite(e);
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
