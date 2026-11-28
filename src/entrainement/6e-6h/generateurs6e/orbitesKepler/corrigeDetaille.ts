import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceKE } from "../../core6e/orbitesKepler";
import { aphelie, excentricite, perihelie, unite } from "../../core6e/orbitesKepler";
import { milliersL, nL, pgcd } from "../../ui6e/outilsConiquesLotH2";
import { coordCentralL, figureKE, mots } from "../../ui6e/formatOrbitesKepler";

/**
 * Corrigé détaillé « comme au tableau » de `6gen141`, une lettre par écran : a) distances au corps central
 * (rayon terrestre ajouté pour un satellite), a et c par demi-somme et demi-différence ; b) première loi de
 * Kepler : le corps central est au foyer situé du côté du point le plus proche ; c) e = c/a simplifiée ;
 * d) b² = a² − c², contrôle b² = qQ, schéma.
 */

type E = ExerciceKE;
const ft = texte;
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function lignesA(e: E): LigneCalcul[] {
  const q = perihelie(e);
  const Q = aphelie(e);
  const lignes: LigneCalcul[] = [];
  if (e.R > 0) {
    lignes.push(ligne(`q=${milliersL(e.R)}+${milliersL(q - e.R)}=${milliersL(q)}`, "rayon terrestre + altitude au périgée"));
    lignes.push(ligne(`Q=${milliersL(e.R)}+${milliersL(Q - e.R)}=${milliersL(Q)}`, "rayon terrestre + altitude à l'apogée"));
  }
  lignes.push(ligne(`a-c=${milliersL(q)}\\quad\\text{et}\\quad a+c=${milliersL(Q)}`, "distances au corps central"));
  lignes.push(ligne(`a=\\dfrac{${milliersL(q)}+${milliersL(Q)}}{2}=${milliersL(e.a)}`, "on additionne"));
  lignes.push(ligne(`c=\\dfrac{${milliersL(Q)}-${milliersL(q)}}{2}=${milliersL(e.c)}`, "on soustrait"));
  return lignes;
}

export function correctionDetailleeKE(e: E): EtapeCorrection[] {
  const m = mots(e);
  const g = pgcd(e.c, e.a);
  const q = perihelie(e);
  const Q = aphelie(e);
  return [
    utilise("a", [ft(`Le ${m.proche} et l'${m.loin} sont les sommets du grand axe ; le corps central étant à un foyer, leurs distances à lui valent `), L("a-c"), ft(" et "), L("a+c"), ft(" (cours, points 1 et 3).")]),
    calcul("a", lignesA(e)),
    resultat("a", [L(`a=${milliersL(e.a)}`), ft(` ${unite(e)}`), ft(" et "), L(`c=${milliersL(e.c)}`), ft(` ${unite(e)}`), ft(".")]),
    utilise("b", [ft(`Première loi de Kepler : l'orbite est une ellipse dont le centre ${m.centralDe} occupe un foyer — pas le centre de l'ellipse.`)]),
    calcul("b", [ligne(`F(c\\,;0)\\quad\\text{et}\\quad F'(-c\\,;0)`, "foyers de l'ellipse"), ligne(`${m.nom}=F`, `foyer du côté du ${m.proche}`)]),
    resultat("b", [L(coordCentralL(e)), ft(".")]),
    verification("b", [ft(`Distance de ${m.nom} au ${m.proche} `), L(`(${milliersL(e.a)}\\,;0)`), ft(" : "), L(`${milliersL(e.a)}-${milliersL(e.c)}=${milliersL(q)}`), ft(", la donnée.")]),
    utilise("c", [ft("Excentricité d'une ellipse : "), L("e=\\dfrac{c}{a}"), ft(" (cours, point 2).")]),
    calcul("c", [ligne(`e=\\dfrac{${milliersL(e.c)}}{${milliersL(e.a)}}=${nL(excentricite(e))}`, g > 1 ? `on simplifie par ${g}` : "fraction irréductible")]),
    resultat("c", [L(`e=${nL(excentricite(e))}`), ft(e.variante === "comete" ? " : proche de 1, orbite très allongée." : e.variante === "satellite" ? "." : " : orbite peu aplatie.")]),
    utilise("d", [ft("Relation de l'ellipse : "), L("b^2=a^2-c^2"), ft(" (cours, point 1).")]),
    calcul("d", [ligne(`b^2=${milliersL(e.a)}^2-${milliersL(e.c)}^2=${milliersL(e.a * e.a)}-${milliersL(e.c * e.c)}=${milliersL(e.b * e.b)}`), ligne(`b=${milliersL(e.b)}`)]),
    { ...resultat("d", [L(`b=${milliersL(e.b)}`), ft(` ${unite(e)}`), ft(".")]), figureHtml: figureKE(e, true, true) },
    verification("d", [L(`q\\cdot Q=${milliersL(q)}\\cdot ${milliersL(Q)}=${milliersL(q * Q)}=b^2`), ft(" : en effet "), L("(a-c)(a+c)=a^2-c^2"), ft(".")]),
    piege("d", e.variante === "satellite" ? [ft("Prendre les altitudes pour les distances au foyer : elles se mesurent depuis le sol, le foyer est au centre de la Terre.")] : [ft(`Placer ${m.central} au centre de l'orbite : il est à un foyer, à `), L("c"), ft(" du centre.")]),
  ];
}
