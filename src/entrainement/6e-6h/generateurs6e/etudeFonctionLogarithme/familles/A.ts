import type { ExerciceEtudeLogA } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { assemblerQcm, tirerParmi } from "../aleatoire";
import { calculerViewBoxReel, candidat } from "../graphe";
import { puissanceELatex } from "./latex";

const K_VALEURS = [-2, -1, 1, 2] as const;
const C_VALEURS = [-1, 0, 1, 2] as const;

/**
 * Famille A — `f(x) = k(ln(x)+c)/x`, généralise l'exemple ln(x)/x du cours (k=1, c=0).
 * - Domaine ]0;+∞[ (ln ET dénominateur).
 * - x→0⁺ : ln(x)+c → −∞, divisé par x→0⁺ ⟹ −∞·signe(k) — asymptote verticale x=0.
 *   x→+∞ : croissances comparées, ln(x)/x → 0 et c/x → 0 ⟹ 0 — asymptote horizontale y=0.
 * - f'(x) = k(1−c−ln x)/x², nul en x = e^{1−c} : maximum si k>0, minimum si k<0.
 * - f''(x) = k(2ln x − 3 + 2c)/x³, change de signe en x = e^{3/2−c} : un point d'inflexion.
 * Les 4 valeurs de c × les 2 signes de k donnent 8 jeux de réponses distincts.
 */
export function construireA(): ExerciceEtudeLogA {
  for (;;) {
    const k = tirerParmi(K_VALEURS);
    const c = tirerParmi(C_VALEURS);
    const xExtremum = Math.exp(1 - c);
    const xInflexion = Math.exp(1.5 - c);
    const valeurExtremum = k * Math.exp(c - 1);

    const reel = candidat("reel", { k, c });
    const remarquables = [0, valeurExtremum];
    const viewBoxReel = calculerViewBoxReel("A", reel, remarquables);
    const hauteur = viewBoxReel.yMax - viewBoxReel.yMin;
    const qcm = assemblerQcm("A", reel, remarquables, [
      () => candidat("extremumDecale", { k, c: c + tirerParmi([-1, 1]) }),
      () => candidat("typeInverse", { k: -k, c }),
      () => candidat("asymptoteHorizontaleDecalee", { k, c }, { decalageY: tirerParmi([-1, 1]) * 0.3 * hauteur }),
    ]);
    if (qcm === null) continue;

    const limites: CibleLimite[] = [k > 0 ? { type: "moins_infini" } : { type: "plus_infini" }, { type: "zero" }];
    return {
      famille: "A",
      k,
      c,
      domaine: ensembleUnMorceau(versLeHautDepuis(0, false)),
      limites,
      asymptotes: [
        { type: "verticale", p: 0 },
        { type: "horizontale", valeur: 0 },
      ],
      croissance: { type: k > 0 ? "maximum" : "minimum", position: xExtremum },
      croissanceLatex: puissanceELatex(1 - c, 1),
      concavite: { type: "inflexions", positions: [xInflexion], positionsLatex: [puissanceELatex(3 - 2 * c, 2)] },
      valeursRemarquables: remarquables,
      candidats: qcm.candidats,
      indexCorrect: qcm.indexCorrect,
    };
  }
}
