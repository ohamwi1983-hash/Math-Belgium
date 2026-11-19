import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceParaboleDroite } from "../../core/paraboleDroite.types";
import { evaluerG } from "./index";
import { fLatex, figure, gLatex, hLatex, inequationLatex, pointsLatex, solutionInequation } from "../../ui/formatParaboleDroite";
import { ensembleLatex, evaluerPoly, nombreLatex, symboleLatex } from "../../moteur/algebreTransfertSecondDegre";
import { polynome, qp } from "../../ui/corrigeChapitre3";
import { COURS_RESOUDRE, COURS_SIGNE_TRINOME, lignesDelta, lignesRacines } from "../../ui/corrigeTransfertSecondDegre";

/**
 * Corrigé détaillé « comme au tableau » de gen118 — règle `.claude/rules/feuilles-evaluations.md`.
 * Une étape par écran : ramener f(x) = g(x) à 0, résoudre (Δ), ordonnées des points communs (si
 * il y en a), inéquation par le signe de f − g avec la figure (parabole, droite, points communs).
 */

type E = ExerciceParaboleDroite;
const n = nombreLatex;

function lettres(e: E): { eq: string; res: string; pts: string | null; pos: string } {
  return e.communs.length ? { eq: "a", res: "b", pts: "c", pos: "d" } : { eq: "a", res: "b", pts: null, pos: "c" };
}

export function correctionDetailleeParaboleDroite(e: E): EtapeCorrection[] {
  const L = lettres(e);
  const [m, p] = e.g;
  const sortie: EtapeCorrection[] = [];

  // a) ramener à 0
  const lignesA: LigneCalcul[] = [
    ligne(`${fLatex(e)}=${gLatex(e)}`, "f(x) = g(x)"),
    ligne(`${fLatex(e)}-(${gLatex(e)})=0`, "on soustrait g(x) des deux membres"),
    ligne(`${hLatex(e)}=0`, "on réduit"),
  ];
  sortie.push(
    utilise(L.eq, [texte("Un point commun est sur la parabole ET sur la droite : son abscisse vérifie ".replace("ET", "et")), latex("f(x)=g(x)"), texte(`, qu'on ramène à 0 ${COURS_RESOUDRE}.`)]),
    calcul(L.eq, lignesA),
    resultat(L.eq, [latex(`${hLatex(e)}=0`)]),
    piege(L.eq, [texte("On soustrait g(x) en entier : la parenthèse "), latex(`-(${gLatex(e)})`), texte(" change le signe de chacun de ses termes.")]),
  );

  // b) résoudre
  const res = e.communs.length === 2 ? [latex(`x_1=${n(e.communs[0]!)}`), texte(" et "), latex(`x_2=${n(e.communs[1]!)}`)] : e.communs.length === 1 ? [latex(`x=${n(e.communs[0]!)}`), texte(" (racine double : la droite est tangente)")] : [texte("Aucune solution : aucun point commun.")];
  sortie.push(
    utilise(L.res, [texte("Discriminant "), latex("\\Delta=b^2-4ac"), texte(` : deux, une ou aucune solution selon son signe ${COURS_RESOUDRE}.`)]),
    calcul(L.res, e.h[2] === 0 && e.h[1] !== 0 ? [ligne(`x(${polynome([e.h[0], e.h[1]])})=0`, "c = 0 : on met x en évidence"), ligne(`x=0\\text{ ou }${polynome([e.h[0], e.h[1]])}=0`, "un produit est nul si un de ses facteurs est nul"), ligne(`x=${n(-e.h[1] / e.h[0])}`, "second facteur")] : [...lignesDelta(e.h), ...lignesRacines(e.h)]),
    resultat(L.res, res),
  );

  // c) ordonnées
  if (L.pts) {
    const lignesC: LigneCalcul[] = [];
    for (const x of e.communs) {
      lignesC.push(ligne(`g(${n(x)})=${m === 0 ? n(p) : `${m === 1 ? qp(x) : `${n(m)}\\cdot ${qp(x)}`}${p === 0 ? "" : p > 0 ? `+${p}` : p}`}`, "on remplace x dans g(x)"));
      if (m !== 0) lignesC.push(ligne(`=${n(evaluerG(e.g, x))}`));
    }
    const x0 = e.communs[0]!;
    sortie.push(
      utilise(L.pts, [texte("Un point commun est sur la droite : son ordonnée vaut "), latex("g(x)"), texte(" (on obtiendrait la même avec f).")]),
      calcul(L.pts, lignesC),
      resultat(L.pts, [texte(e.communs.length === 2 ? "Points communs : " : "Point commun : "), latex(pointsLatex(e))]),
      verification(L.pts, [texte("Avec f : ")], [ligne(`f(${n(x0)})=${polynome(e.f, `(${n(x0)})`)}=${n(evaluerPoly(e.f, x0))}`, "même ordonnée")]),
    );
  }

  // d) position
  const S = solutionInequation(e);
  const A = e.h[0];
  const zone = e.communs.length === 2 ? (A > 0 ? "positif à l'extérieur des racines, négatif entre elles" : "négatif à l'extérieur des racines, positif entre elles") : e.communs.length === 1 ? (A > 0 ? "positif partout, nul seulement en la racine double" : "négatif partout, nul seulement en la racine double") : A > 0 ? "toujours positif" : "toujours négatif";
  sortie.push(
    utilise(L.pos, [texte(`On ramène à 0 et on étudie le signe du trinôme : signe de a à l'extérieur des racines ${COURS_SIGNE_TRINOME}.`)]),
    {
      ...calcul(L.pos, [
        ligne(`${inequationLatex(e)}\\iff ${hLatex(e)}${symboleLatex(e.symbole)}0`, "on soustrait g(x)"),
        ligne(`a=${n(A)}${A > 0 ? ">" : "<"}0`, `le trinôme est ${zone}`),
        ligne(`S=${ensembleLatex(S)}`, e.communs.length === 0 ? "aucune racine : le signe ne change jamais" : e.symbole === "≤" || e.symbole === "≥" ? "symbole large : racines incluses" : "symbole strict : racines exclues"),
      ]),
      figureHtml: figure(e),
    },
    resultat(L.pos, [latex(`S=${ensembleLatex(S)}`)]),
    piege(L.pos, [texte("La parabole est au-dessus de la droite là où f(x) − g(x) > 0 : on lit le signe du trinôme, pas celui de f seul.")]),
  );
  return sortie;
}
