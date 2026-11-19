import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceLectureInequation } from "../../core/lectureInequationGraphique.types";
import { abscisses, estLarge, f, lectureJuste, veutDessus } from "../../moteur/modeleLectureInequationGraphique";
import { abscissesFragments, figureSvg, inequationLatex, lectureFragments, reponseSolutionFragments, solutionLatex } from "../../ui/formatLectureInequationGraphique";

/**
 * Corrigé détaillé « comme au tableau » de gen117 — règle `.claude/rules/feuilles-evaluations.md`,
 * conventions « Lectures graphiques » (une ligne par chose lue, avec une relation, la justification
 * dit où on lit). a) points d'intersection (lecture), b) position de la parabole, zone par zone,
 * c) ensemble-solution avec la figure annotée (points communs marqués).
 */

type E = ExerciceLectureInequation;
const lat = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function droite(e: E): string {
  return e.variante === "axe" ? "0" : e.variante === "horizontale" ? String(e.p) : "g(x)";
}

function nomDroite(e: E): string {
  return e.variante === "axe" ? "l'axe des x" : "d";
}

function lignesLecture(e: E): LigneCalcul[] {
  const xs = abscisses(e);
  if (xs.length === 0) return [ligne(`f(x)\\neq ${droite(e)}`, `𝒫 ne rencontre jamais ${nomDroite(e)}`)];
  return xs.map((x) => {
    const y = f(e, x);
    const gauche = e.variante === "oblique" ? `f(${x})=g(${x})=${y}` : `f(${x})=${y}`;
    return ligne(gauche, `${xs.length === 1 ? "𝒫 touche" : "𝒫 coupe"} ${nomDroite(e)} au nœud (${String(x).replace("-", "−")} ; ${String(y).replace("-", "−")})`);
  });
}

function zone(e: E, exterieur: boolean): string {
  if (e.issue === 2) return exterieur ? `x\\in\\mathopen{]}-\\infty\\,;\\,${e.x1}\\mathclose{[}\\cup\\mathopen{]}${e.x2}\\,;\\,+\\infty\\mathclose{[}` : `x\\in\\mathopen{]}${e.x1}\\,;\\,${e.x2}\\mathclose{[}`;
  if (e.issue === 1) return exterieur ? `x\\neq ${e.x1}` : `x=${e.x1}`;
  return "x\\in\\mathbb{R}";
}

function lignesPosition(e: E): LigneCalcul[] {
  const exterieurDessus = e.alpha > 0;
  const ref = nomDroite(e);
  const lignes: LigneCalcul[] = [ligne(inequationLatex(e), veutDessus(e.symbole) ? `il faut 𝒫 au-dessus de ${ref}${estLarge(e.symbole) ? " (ou sur)" : ""}` : `il faut 𝒫 en dessous de ${ref}${estLarge(e.symbole) ? " (ou sur)" : ""}`)];
  if (e.issue === 0) {
    lignes.push(ligne(zone(e, true), exterieurDessus ? `𝒫 est toujours au-dessus de ${ref}` : `𝒫 est toujours en dessous de ${ref}`));
    return lignes;
  }
  lignes.push(ligne(zone(e, true), exterieurDessus ? `𝒫 au-dessus de ${ref}` : `𝒫 en dessous de ${ref}`));
  lignes.push(ligne(zone(e, false), e.issue === 1 ? `𝒫 touche ${ref}` : exterieurDessus ? `𝒫 en dessous de ${ref}` : `𝒫 au-dessus de ${ref}`));
  return lignes;
}

export function correctionDetailleeLectureInequation(e: E): EtapeCorrection[] {
  const large = estLarge(e.symbole);
  const sansPoint = e.issue === 0;
  return [
    utilise("a", [texte(`Un point commun à 𝒫 et à ${nomDroite(e)} vérifie `), lat(`f(x)=${droite(e)}`), texte(" ; on lit son abscisse sur la grille, en descendant jusqu'à l'axe des x (cours, § 2).")]),
    calcul("a", lignesLecture(e)),
    resultat("a", abscissesFragments(e)),
    utilise("b", [lat(`f(x)>${droite(e)}`), texte(` : 𝒫 au-dessus de ${nomDroite(e)} ; `), lat(`f(x)<${droite(e)}`), texte(` : 𝒫 en dessous (cours, § 2 et § 7).`)]),
    calcul("b", lignesPosition(e)),
    resultat("b", lectureFragments(lectureJuste(e), e)),
    utilise("c", [texte("Crochets inversés (cours, § 2) : un symbole large inclut les abscisses des points communs, un symbole strict les exclut ; ±∞ a toujours un crochet ouvert.")]),
    calcul("c", [ligne(solutionLatex(e), sansPoint ? "aucune borne à décider" : large ? "symbole large : points communs inclus" : "symbole strict : points communs exclus")]),
    { ...resultat("c", reponseSolutionFragments(e)), figureHtml: figureSvg(e, true) },
    piege("c", e.issue === 1 ? [texte("Au point de contact, f(x) = g(x) : il appartient à S seulement si le symbole est large.")] : sansPoint ? [texte("Pas de point commun ne veut pas dire « pas de solution » : regarde de quel côté est la parabole.")] : [texte("On lit des abscisses (sur l'axe des x), jamais les ordonnées des points communs.")]),
  ];
}
