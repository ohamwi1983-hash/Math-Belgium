import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveEspace, ThemeDetectiveEspace } from "../../core/detectiveEspace.types";
import { descriptionCorrecte, dessinPaveSvg, figureSolideSvg } from "../../ui/formatDetectiveEspace";
import { COURS_CAVALIERE, COURS_DEUX_DROITES, COURS_PARALLELISME, COURS_PLAN, COURS_SECTION, finaliserEspace2 } from "../../ui/corrigeEspace2";
import { retirerDebut } from "./commun";

/**
 * Corrigé détaillé « comme au tableau » de gen107 « Détective d'erreurs : géométrie dans l'espace » —
 * règle `.claude/rules/feuilles-evaluations.md`, sur le modèle de gen91 (trois ÉCRANS : la ligne
 * fausse, l'erreur, la correction). a) chaque ligne de la copie contrôlée sur la figure, un bloc
 * « Ligne k » de propriétés (∈, ⊂, ∥, ∩, longueurs, angle…) ; b) la règle du cours et les lignes qui
 * contredisent la copie ; c) la ligne refaite juste (et la suite reprise), figure du corrigé en
 * `figureHtml`. Lignes rédigées au tirage par le générateur (`ExerciceDetectiveEspace.tableau`).
 */

type E = ExerciceDetectiveEspace;

const COURS: Record<ThemeDetectiveEspace, string> = {
  droites: COURS_DEUX_DROITES,
  plan: COURS_PLAN,
  section: COURS_SECTION,
  parallelisme: COURS_PARALLELISME,
  cavaliere: COURS_CAVALIERE,
};

const REGLES: Record<ThemeDetectiveEspace, string> = {
  droites: "deux droites contenues dans un même plan sont sécantes ou parallèles ; si aucun plan ne les contient toutes les deux, elles sont gauches. On le montre avec un plan qui contient l'une des droites et un seul point de l'autre",
  plan: "un plan est déterminé par trois points non alignés, par une droite et un point extérieur à cette droite, ou par deux droites sécantes ou parallèles",
  section: "un côté de la section relie deux points d'une même face ; deux faces parallèles sont coupées suivant deux côtés parallèles ; un point auxiliaire est l'intersection de deux droites d'une même face",
  parallelisme: "deux plans sont parallèles si deux droites SÉCANTES du premier sont parallèles à deux droites du second ; chaque parallélisme se justifie dans une figure plane (parallélogramme, droite des milieux)",
  cavaliere: "face avant en vraie grandeur ; fuyantes parallèles, à 45° de l'horizontale, vers la droite et vers le haut, réduites de moitié ; arêtes cachées (celles du sommet arrière en bas à gauche) en pointillés",
};

function figureCorrige(e: E): string {
  if (e.figure.type === "cavaliere") return dessinPaveSvg(e.corrige.dessin!, "papier");
  return figureSolideSvg(e.figure, "papier", { corrige: e.corrige });
}

function enMinuscule(f: FragmentConsigne[]): FragmentConsigne[] {
  return f.map((x, j) => (j === 0 && x.type === "texte" && /^[A-ZÉ][a-zé]/.test(x.valeur) ? { ...x, valeur: x.valeur[0]!.toLowerCase() + x.valeur.slice(1) } : x));
}

export function correctionDetailleeDetectiveEspace(e: E, avecFigure = true): EtapeCorrection[] {
  const n = e.ligneFausse + 1;
  const cours = COURS[e.theme];
  const avecFig = (r: EtapeCorrection): EtapeCorrection => (avecFigure ? { ...r, figureHtml: figureCorrige(e) } : r);
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`On contrôle chaque ligne de la copie sur la figure, avec la propriété du cours qu'elle invoque ${cours} : la ligne fausse est celle dont le contrôle contredit ce qui est écrit.`)]),
    ...e.tableau.controles.map((lignes, k) => calcul("a", lignes, [], `Ligne ${k + 1}`)),
    resultat("a", [texte(`La ligne ${n} est fausse : ${e.nomErreur}.`)]),
    utilise("b", [texte(`Le cours ${cours} : ${REGLES[e.theme]}.`)]),
    calcul("b", e.tableau.controles[e.ligneFausse]!, [texte(`Ligne ${n} :`)]),
    resultat("b", retirerDebut(descriptionCorrecte(e))),
    piege("b", e.piege),
    utilise("c", [texte(`On réécrit la ligne ${n} avec la bonne propriété du cours ${cours}, appliquée à la figure${e.suite ? ", puis on reprend la suite" : ""}.`)]),
    calcul("c", e.tableau.correction),
  ];
  if (e.theme === "cavaliere") {
    etapes.push(resultat("c", [texte(`Ligne ${n} corrigée : `), ...enMinuscule(e.ligneCorrigee)]));
    etapes.push(avecFig(resultat("c", [texte("Le dessin juste : fuyantes à 45°, vers la droite et vers le haut, réduites de moitié ; arêtes [AD], [CD] et [DH] en pointillés.")], "Conclusion")));
  } else if (e.suite) {
    etapes.push(resultat("c", [texte(`Ligne ${n} corrigée : `), ...enMinuscule(e.ligneCorrigee)]));
    etapes.push(avecFig(resultat("c", e.suite, "Suite")));
  } else {
    etapes.push(avecFig(resultat("c", [texte(`Ligne ${n} corrigée : `), ...enMinuscule(e.ligneCorrigee)])));
  }
  return finaliserEspace2(etapes);
}
