import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDroitesParametre } from "../../core/droitesParametre.types";
import { q, qp, racineCarreeLatex } from "../../ui/corrigeChapitre3";
import { COURS_RELATIONS, dedoublonner } from "../../ui/corrigeLotG";
import { NOMS, conditionPosee, directeurD, directeurFamille, equationLatex, familleLatex, valeursFragments } from "../../ui/formatDroitesParametre";
import { valeurP } from "./index";
import { nb } from "../../ui/geometrieLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen95 « Droites dépendant d'un paramètre » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ui/formatDroitesParametre.ts::ecrans`) :
 * a) la condition (critère de colinéarité, produit scalaire, point, coefficient) ; b) l'équation en m posée
 * puis développée ; c) résolution (premier degré, ou Δ et formule) puis contrôle des coefficients de x et
 * de y pour chaque solution (valeur rejetée si les deux sont nuls). Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceDroitesParametre;

const PROPRIETE: Record<E["variante"], string> = {
  parallele: "Deux droites sont parallèles exactement quand le critère de colinéarité de leurs vecteurs directeurs est nul",
  perpendiculaire: "Deux droites sont perpendiculaires exactement quand le produit scalaire de leurs vecteurs directeurs est nul",
  point: "Un point appartient à une droite exactement quand ses coordonnées vérifient l'équation de la droite",
  horizontale: "La droite ax + by + c = 0 est horizontale exactement quand a = 0 et b ≠ 0 (vecteur directeur (−b ; a) = (−b ; 0))",
  verticale: "La droite ax + by + c = 0 est verticale exactement quand b = 0 et a ≠ 0 (vecteur directeur (−b ; a) = (0 ; a))",
};

function lignesCondition(e: E): LigneCalcul[] {
  if (e.variante === "parallele" || e.variante === "perpendiculaire") {
    return [ligne(directeurFamille(e).replace("\\begin", "=\\begin"), "vecteur directeur de dₘ : (−b(m) ; a(m))"), ligne(directeurD(e).replace("\\begin", "=\\begin"), "vecteur directeur de d : (−b ; a)")];
  }
  if (e.variante === "point") return [ligne(`x=${q(e.p!.x)}`, "abscisse de P"), ligne(`y=${q(e.p!.y)}`, "ordonnée de P")];
  return [ligne(e.variante === "horizontale" ? "a(m)=0" : "b(m)=0", e.variante === "horizontale" ? "coefficient de x nul" : "coefficient de y nul")];
}

function lignesResolution(e: E): LigneCalcul[] {
  const [a, b, c] = e.q;
  const L: LigneCalcul[] = [ligne(equationLatex(e), "l'équation en m")];
  if (e.degre === 1) {
    L.push(ligne(`${b === 1 ? "" : b === -1 ? "-" : q(b)}m=${q(-c)}`, c === 0 ? undefined : "on isole le terme en m"));
    L.push(ligne(`m=${q(-c / b)}`, b === 1 ? undefined : `on divise par ${nb(b)}`));
    return dedoublonner(L);
  }
  const delta = b * b - 4 * a * c;
  L.push(ligne(`\\Delta=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`, "discriminant b² − 4ac"), ligne(`=${q(delta)}`));
  if (delta < 0) L.push(ligne(`\\Delta=${q(delta)}<0`, "aucune solution réelle"));
  else if (delta === 0) L.push(ligne(`m=\\dfrac{-${qp(b)}}{2\\cdot ${qp(a)}}=${q(-b / (2 * a))}`, "Δ = 0 : une seule solution"));
  else {
    const r = racineCarreeLatex(delta);
    L.push(ligne(`m_1=\\dfrac{-${qp(b)}-${r}}{2\\cdot ${qp(a)}}=${q((-b - Math.sqrt(delta)) / (2 * a))}`, `√Δ = ${r.replace("\\sqrt", "√")}`));
    L.push(ligne(`m_2=\\dfrac{-${qp(b)}+${r}}{2\\cdot ${qp(a)}}=${q((-b + Math.sqrt(delta)) / (2 * a))}`));
  }
  return dedoublonner(L);
}

function lignesControle(e: E): LigneCalcul[] {
  const L: LigneCalcul[] = [];
  for (const r of e.racines) {
    const va = valeurP(e.A, r);
    const vb = valeurP(e.B, r);
    const rejet = Math.abs(va) < 1e-9 && Math.abs(vb) < 1e-9;
    L.push(ligne(`a(${q(r)})=${q(va)}`, `coefficient de x pour m = ${nb(r)}`));
    L.push(ligne(`b(${q(r)})=${q(vb)}`, rejet ? "les deux coefficients sont nuls : ce n'est plus une droite, valeur rejetée" : "les deux coefficients ne sont pas nuls : c'est bien une droite, valeur gardée"));
  }
  return L;
}

export function correctionDetailleeDroitesParametre(e: E): EtapeCorrection[] {
  const sansSolution = e.racines.length === 0;
  return [
    utilise("a", [texte(`${PROPRIETE[e.variante]} ${COURS_RELATIONS}.`)]),
    calcul("a", lignesCondition(e), [texte("Avec "), latex(familleLatex(e)), texte(" :")]),
    resultat("a", [texte(`dₘ ${NOMS[e.variante]} ⟺ `), ...(e.variante === "parallele" ? [texte("critère de colinéarité de "), latex("\\vec{u}_m"), texte(" et "), latex("\\vec{v}"), texte(" nul.")] : e.variante === "perpendiculaire" ? [latex("\\vec{u}_m\\cdot\\vec{v}=0"), texte(".")] : e.variante === "point" ? [texte("les coordonnées de P vérifient l'équation de dₘ.")] : [texte(`le coefficient de ${e.variante === "horizontale" ? "x" : "y"} est nul (et l'autre ne l'est pas).`)])]),
    piege("a", [texte(e.variante === "parallele" || e.variante === "perpendiculaire" ? "Ne pas confondre les deux critères : colinéarité nulle pour des parallèles, produit scalaire nul pour des perpendiculaires." : e.variante === "point" ? "On remplace x par l'abscisse de P et y par son ordonnée, pas l'inverse." : "Horizontale : coefficient de x nul ; verticale : coefficient de y nul — pas l'inverse.")]),
    utilise("b", [texte("On écrit la condition avec les coefficients de dₘ, qui dépendent de m, puis on développe et on réduit.")]),
    calcul("b", [ligne(pleineLargeur(conditionPosee(e)), e.variante === "parallele" ? "α·β′ − β·α′ = 0" : e.variante === "perpendiculaire" ? "α·α′ + β·β′ = 0" : e.variante === "point" ? "on remplace x et y" : "condition sur le coefficient"), ligne(equationLatex(e), "on développe et on réduit")]),
    resultat("b", [latex(equationLatex(e))]),
    piege("b", [texte("Attention aux signes en développant : chaque coefficient est un polynôme en m, à mettre entre parenthèses.")]),
    utilise("c", [texte(e.degre === 1 ? "Équation du premier degré en m ; puis, pour chaque solution, dₘ doit rester une droite : a(m) et b(m) ne peuvent pas être nuls ensemble." : "Équation du second degré en m : discriminant, puis formule ; pour chaque solution, dₘ doit rester une droite : a(m) et b(m) ne peuvent pas être nuls ensemble.")]),
    calcul("c", lignesResolution(e)),
    ...(sansSolution ? [] : [calcul("c", lignesControle(e), [texte("Contrôle : "), latex("d_m\\equiv a(m)x+b(m)y+c(m)=0"), texte(" doit être une droite.")], "Contrôle")]),
    resultat("c", valeursFragments(e)),
    ...(e.valeurs.length > 0
      ? [verification("c", [texte("On remplace dans la condition : ")], e.valeurs.map((v) => ligne(`${poly2(e, v)}=0`, `pour m = ${nb(v)}`)))]
      : []),
    piege("c", [texte("Une solution de l'équation n'est retenue que si dₘ est encore une droite : il faut toujours contrôler les deux coefficients.")]),
  ];
}

/** Ligne au membre de gauche long : entre accolades (aucun « = » de niveau 0), elle prend toute la
 * largeur du calcul au lieu de comprimer la colonne « = 0 » (≈ 230 px à 680 px). */
function pleineLargeur(l: string): string {
  const visible = l.replace(/\\[a-zA-Z]+/g, "").replace(/[{}\s]/g, "").length;
  return visible > 30 ? `{${l}}` : l;
}

/** Valeur de Q en m = v, substituée : « 2·(−1)² − 3·(−1) − 5 ». */
function poly2(e: E, v: number): string {
  const [a, b, c] = e.q;
  const t: string[] = [];
  if (v === 0) {
    // m = 0 : coefficients écrits en entier (jamais « −0² »).
    if (a !== 0) t.push(`${q(a)}\\cdot 0^2`);
    if (b !== 0) t.push(`${b < 0 ? "-" : t.length ? "+" : ""}${q(Math.abs(b))}\\cdot 0`);
    if (c !== 0) t.push(`${c < 0 ? "-" : t.length ? "+" : ""}${q(Math.abs(c))}`);
    return t.join("") || "0";
  }
  if (a !== 0) t.push(`${a === 1 ? "" : a === -1 ? "-" : `${q(a)}\\cdot `}${qp(v)}^2`);
  if (b !== 0) t.push(`${b < 0 ? "-" : t.length ? "+" : ""}${Math.abs(b) === 1 ? qp(v) : `${q(Math.abs(b))}\\cdot ${qp(v)}`}`);
  if (c !== 0) t.push(`${c < 0 ? "-" : t.length ? "+" : ""}${q(Math.abs(c))}`);
  return t.join("") || "0";
}
