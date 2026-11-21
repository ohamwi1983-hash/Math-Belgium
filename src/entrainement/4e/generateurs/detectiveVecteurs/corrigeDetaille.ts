import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, decouperLigneCalcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveVecteurs, Point, ValeurLigne } from "../../core/detectiveVecteurs.types";
import { copieEleve, descriptionCorrecte, expressionChasles, indiceLigneFausse, relationLatex, resolutionCorrecte, support, typeErreur, valeursAttendues } from "../../moteur/modeleDetectiveVecteurs";
import { constat, descriptionFragments, piege as piegeEcran, valeurFragments } from "../../ui/formatDetectiveVecteurs";
import {
  COURS_CHASLES,
  COURS_COLINEARITE,
  COURS_COMPOSANTES,
  COURS_DIFFERENCE,
  COURS_MILIEU,
  COURS_NORME,
  COURS_ORTHOGONALITE,
  COURS_VECTEUR,
  col,
  lignesComposantes,
  lignesCritereColinearite,
  lignesMultiple,
  lignesNorme,
  lignesProduitScalaire,
  moins,
  nb,
  nbp,
  plus,
  finaliserVecteurs,
} from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen91 « Le détective d'erreurs vectoriel » — règle
 * `.claude/rules/feuilles-evaluations.md`, sur le modèle de gen99 / gen81 (mécanique propre : trois
 * ÉCRANS, ligne fausse, erreur commise, correction). a) la ligne fausse refaite à partir des données,
 * comparée à la copie ; b) la règle du cours et l'erreur nommée (description de l'écran) ; c) la
 * copie reprise sans l'erreur, un bloc « Ligne k » par ligne à partir de la ligne fausse, une
 * transformation par ligne. Valeurs : `resolutionCorrecte` / `valeursAttendues` du moteur.
 */

type E = ExerciceDetectiveVecteurs;

function vec(P: Point, Q: Point) {
  return moins(Q, P);
}

/** Lignes « comme au tableau » de la ligne d'indice j de la résolution CORRECTE (vide : ligne de rappel). */
function lignesTableau(e: E, j: number): LigneCalcul[] {
  const { A, B, C } = e.donnees;
  const ab = vec(A, B);
  const ac = vec(A, C);
  switch (support(e)) {
    case "relation": {
      const k = e.donnees.k!;
      const kac = { x: k * ac.x, y: k * ac.y };
      const am = plus(ab, kac);
      if (j === 0) return lignesComposantes("AB", A, B);
      if (j === 1) return lignesComposantes("AC", A, C);
      if (j === 2) return lignesMultiple(`${k}\\vec{AC}`, k, ac);
      if (j === 3) return [ligne(`\\vec{AM}=${relationLatex(k).replace(/ /g, "")}`, "relation de l'énoncé"), ligne(`=${col(`${nb(ab.x)}+${nbp(kac.x)}`, `${nb(ab.y)}+${nbp(kac.y)}`)}`, "composante par composante"), ligne(`=${col(am.x, am.y)}`)];
      const M = plus(A, am);
      return [ligne(`x_M=x_A+x_{AM}=${nb(A.x)}+${nbp(am.x)}`, "translation de A par AM"), ligne(`=${nb(M.x)}`), ligne(`y_M=y_A+y_{AM}=${nb(A.y)}+${nbp(am.y)}`), ligne(`=${nb(M.y)}`)];
    }
    case "chasles": {
      const D = e.donnees.D!;
      const enchainement = e.sousVariante === "enchainement";
      const [O, X, nom] = enchainement ? [C, A, "CA"] : [C, B, "CB"];
      const r = vec(O, X);
      const M = plus(D, r);
      if (j === 0) {
        const red = enchainement
          ? [ligne(`${expressionChasles("enchainement").replace(/ /g, "")}=\\vec{CB}+\\vec{BA}`, "on change l'ordre des termes"), ligne("=\\vec{CA}", "relation de Chasles (B entre les deux)")]
          : [ligne(`${expressionChasles("difference").replace(/ /g, "")}=\\vec{AB}+\\vec{CA}`, "soustraire, c'est ajouter l'opposé"), ligne("=\\vec{CA}+\\vec{AB}", "on change l'ordre des termes"), ligne("=\\vec{CB}", "relation de Chasles (A entre les deux)")];
        return [...red, ...lignesComposantes(nom, O, X)];
      }
      if (j === 1) return [ligne(`x_M=x_D+x_{${nom}}`, [latex(`\\vec{DM}=\\vec{${nom}}`), texte(" : translation de D")]), ligne(`=${nb(D.x)}+${nbp(r.x)}`), ligne(`=${nb(M.x)}`)];
      if (j === 2) return [ligne(`y_M=y_D+y_{${nom}}`, "de même"), ligne(`=${nb(D.y)}+${nbp(r.y)}`), ligne(`=${nb(M.y)}`)];
      return [];
    }
    case "isocele": {
      if (j === 0) return lignesComposantes("AB", A, B);
      if (j === 1) return [ligne("AB=\\|\\vec{AB}\\|", "longueur = norme"), ...lignesNorme("", ab)];
      if (j === 2) return lignesComposantes("AC", A, C);
      if (j === 3) return [ligne("AC=\\|\\vec{AC}\\|", "longueur = norme"), ...lignesNorme("", ac)];
      const egales = ab.x * ab.x + ab.y * ab.y === ac.x * ac.x + ac.y * ac.y;
      return [ligne(egales ? "AB=AC" : "AB\\neq AC", egales ? "mêmes longueurs" : "longueurs différentes")];
    }
    case "alignement": {
      if (j === 0) return lignesComposantes("AB", A, B);
      if (j === 1) return lignesComposantes("AC", A, C);
      const d = ab.x * ac.y - ab.y * ac.x;
      if (j === 2) return lignesCritereColinearite("AB", "AC", ab, ac);
      return [ligne(d === 0 ? "x_{AB}\\cdot y_{AC}-y_{AB}\\cdot x_{AC}=0" : `${nb(d)}\\neq 0`, d === 0 ? "critère nul : A, B, C alignés" : "critère non nul : A, B, C non alignés")];
    }
    case "rectangle": {
      if (j === 0) return lignesComposantes("AB", A, B);
      if (j === 1) return lignesComposantes("AC", A, C);
      const p = ab.x * ac.x + ab.y * ac.y;
      if (j === 2) return lignesProduitScalaire("AB", "AC", ab, ac);
      return [ligne(p === 0 ? "\\vec{AB}\\cdot\\vec{AC}=0" : `${nb(p)}\\neq 0`, p === 0 ? "produit scalaire nul : angle droit en A" : "produit scalaire non nul : pas d'angle droit en A")];
    }
    case "parallelogramme": {
      const D = { x: C.x - ab.x, y: C.y - ab.y };
      if (j === 0) return [ligne("\\vec{AB}=\\vec{DC}", "ABCD : A vers B, puis D vers C (même sens)")];
      if (j === 1) return lignesComposantes("AB", A, B);
      if (j === 2) return [ligne(`\\vec{DC}=${col("x_C-x_D", "y_C-y_D")}`, "composantes : extrémité − origine"), ligne(`=${col(`${nb(C.x)}-x_D`, `${nb(C.y)}-y_D`)}`)];
      if (j === 3) return [ligne(`${nb(C.x)}-x_D=${nb(ab.x)}`, "premières composantes égales"), ligne(`${nb(C.y)}-y_D=${nb(ab.y)}`, "secondes composantes égales")];
      return [ligne(`x_D=${nb(C.x)}-${nbp(ab.x)}`, "on isole l'abscisse de D"), ligne(`=${nb(D.x)}`), ligne(`y_D=${nb(C.y)}-${nbp(ab.y)}`, "on isole l'ordonnée de D"), ligne(`=${nb(D.y)}`)];
    }
    case "milieu": {
      const M = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
      const D = { x: 2 * M.x - B.x, y: 2 * M.y - B.y };
      if (j === 0) return [];
      if (j === 1) return [ligne(`x_M=\\dfrac{x_A+x_C}{2}=\\dfrac{${nb(A.x)}+${nbp(C.x)}}{2}`, "milieu de [AC] : moyenne des abscisses"), ligne(`=${nb(M.x)}`), ligne(`y_M=\\dfrac{y_A+y_C}{2}=\\dfrac{${nb(A.y)}+${nbp(C.y)}}{2}`, "moyenne des ordonnées"), ligne(`=${nb(M.y)}`)];
      if (j === 2) return [ligne(`x_D=2x_M-x_B=2\\cdot ${nbp(M.x)}-${nbp(B.x)}`, [texte("M milieu de [BD] : "), latex("{x_M=\\dfrac{x_B+x_D}{2}}")]), ligne(`=${nb(D.x)}`), ligne(`y_D=2y_M-y_B=2\\cdot ${nbp(M.y)}-${nbp(B.y)}`, "de même"), ligne(`=${nb(D.y)}`)];
      return [];
    }
  }
}

/** Valeur d'une ligne en LaTeX, pour la comparer à la copie (« ≠ »). */
function valeurLatex(v: ValeurLigne | null): string | null {
  if (!v) return null;
  switch (v.genre) {
    case "nombre":
      return v.latex;
    case "vecteur":
      return col(v.x, v.y);
    case "point":
      return `${v.nom}(${nb(v.x)}\\,;\\,${nb(v.y)})`;
    case "verdict":
      return null;
  }
}

const REGLES: Record<ReturnType<typeof typeErreur>, FragmentConsigne[]> = {
  sens: [texte(`Composantes d'un vecteur : extrémité moins origine ${COURS_COMPOSANTES}, `), latex("\\vec{AB}\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}"), texte(".")],
  chasles: [texte(`Relation de Chasles ${COURS_CHASLES} : `), latex("\\vec{XY}+\\vec{YZ}=\\vec{XZ}"), texte(` (l'extrémité du premier est l'origine du second) ; soustraire un vecteur, c'est ajouter son opposé ${COURS_DIFFERENCE}.`)],
  norme: [texte(`Norme d'un vecteur ${COURS_NORME} : `), latex("\\|\\vec{u}\\|=\\sqrt{x_u^2+y_u^2}"), texte(", racine carrée d'une somme de carrés, tous positifs.")],
  colinearite: [texte(`Deux vecteurs sont colinéaires si et seulement si leur critère de colinéarité `), latex("x_u\\cdot y_v-y_u\\cdot x_v"), texte(` est nul ${COURS_COLINEARITE}.`)],
  orthogonalite: [texte(`Deux vecteurs sont orthogonaux si et seulement si leur produit scalaire `), latex("x_u\\cdot x_v+y_u\\cdot y_v"), texte(` est nul ${COURS_ORTHOGONALITE}.`)],
  parallelogramme: [texte(`ABCD est un parallélogramme si et seulement si `), latex("\\vec{AB}=\\vec{DC}"), texte(` ${COURS_VECTEUR} ; ses diagonales ont le même milieu, de coordonnées les moyennes des extrémités ${COURS_MILIEU}.`)],
};

/** Dernier bloc d'un calcul (depuis la dernière ligne qui a un membre de gauche). */
function dernierBloc(lignes: LigneCalcul[]): LigneCalcul[] {
  let j = lignes.length - 1;
  while (j > 0 && decouperLigneCalcul(lignes[j]!.latex).gauche === "") j--;
  return lignes.slice(j);
}

function corrigeBrutDetectiveVecteurs(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const k = i + 1;
  const correcte = resolutionCorrecte(e);
  const copie = copieEleve(e);
  const refaite = lignesTableau(e, i);
  const juste = valeurLatex(correcte[i]!.valeur);
  const fausse = valeurLatex(copie[i]!.valeur);
  const comparaison: LigneCalcul[] = juste && fausse && juste !== fausse ? [ligne(`${juste}\\neq ${fausse}`, `valeur écrite dans la copie à la ligne ${k}`)] : [];
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("On refait la copie ligne par ligne à partir des données : la première ligne qui ne redonne pas le même résultat est la ligne fausse (les suivantes ne font qu'en hériter).")]),
    calcul("a", [...refaite, ...comparaison], [texte(`Ligne ${k} refaite :`)]),
    resultat("a", [texte(`La ligne ${k} est fausse. `), ...constat(e)]),
    utilise("b", REGLES[typeErreur(e)]),
    calcul("b", refaite.length ? dernierBloc(refaite) : [ligne("\\vec{AB}=\\vec{DC}", "règle du cours")]),
    resultat("b", descriptionFragments(descriptionCorrecte(e), e)),
    piege("b", piegeEcran(e)),
    utilise("c", [texte(`On reprend la copie sans l'erreur, à partir de la ligne ${k} : les lignes qui suivent changent aussi.`)]),
  ];
  for (let j = i; j < correcte.length; j++) {
    const l = lignesTableau(e, j);
    if (l.length) etapes.push(calcul("c", l, [], `Ligne ${j + 1}`));
  }
  etapes.push(resultat("c", valeursAttendues(e).flatMap((v, n) => (n === 0 ? valeurFragments(v) : [texte(" ; "), ...valeurFragments(v)]))));
  return etapes;
}

export function correctionDetailleeDetectiveVecteurs(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutDetectiveVecteurs(e));
}
