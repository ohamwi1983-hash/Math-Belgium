import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { D, P } from "./outilsLieuxLotH1";
import { droiteEntiere, membreL, memeDroite, nb, nbp, somme } from "./outilsLieuxLotH1";

/**
 * Briques de corrigé « comme au tableau » communes au lot H1 du 6e ch. 9 : équation d'une droite par un
 * point et un vecteur normal (forme a(x − x₀) + b(y − y₀) = 0, développée, puis coefficients entiers
 * réduits), milieu, une transformation par ligne. Sans `docx`.
 */

/** « 3(x-2) », « -(y+1) », « 2x » (x₀ = 0), « » (coefficient nul). */
function facteur(coef: number, variable: string, v0: number, premier: boolean): string {
  if (coef === 0) return "";
  const interieur = v0 === 0 ? variable : `\\left(${variable}${v0 > 0 ? "-" : "+"}${nb(Math.abs(v0))}\\right)`;
  const c = coef === 1 ? "" : coef === -1 ? "-" : nb(coef);
  const terme = `${c}${interieur}`;
  return premier || coef < 0 ? terme : `+${terme}`;
}

/** Lignes : droite passant par M, de vecteur normal n — a(x − x_M) + b(y − y_M) = 0, développée,
 * puis multipliée / simplifiée jusqu'aux coefficients entiers premiers entre eux. */
export function lignesDroiteNormale(n: P, M: P, nomPoint: string): { lignes: LigneCalcul[]; droite: D } {
  const brut: D = { a: n.x, b: n.y, c: -(n.x * M.x + n.y * M.y) };
  const fx = facteur(n.x, "x", M.x, true);
  const fy = facteur(n.y, "y", M.y, fx === "");
  const lignes: LigneCalcul[] = [ligne(`${fx}${fy}=0`, `passe par ${nomPoint}, vecteur normal (${nbTexte(n.x)} ; ${nbTexte(n.y)})`)];
  const dev = `${membreL(brut)}=0`;
  if (dev !== lignes[0]!.latex) lignes.push(ligne(dev, "on développe"));
  const fin = droiteEntiere(brut);
  if (!(fin.a === brut.a && fin.b === brut.b && fin.c === brut.c)) {
    const k = brut.a !== 0 ? fin.a / brut.a : fin.b / brut.b;
    lignes.push(ligne(`${membreL(fin)}=0`, k > 1 || k < -1 ? `on multiplie par ${nbTexte(k)}` : `on divise par ${nbTexte(1 / k)}`));
  }
  return { lignes, droite: fin };
}

/** Nombre en texte brut (« −3 », « 1/2 »), pour une justification. */
export function nbTexte(v: number): string {
  return nb(v)
    .replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")
    .replace(/^-/, "−")
    .replace(/\\sqrt\{(\d+)\}/, "√$1")
    .replace(/\{,\}/g, ",");
}

/** Lignes du milieu de [UV] : « M(\dfrac{xU+xV}{2} ; …) = (… ; …) ». */
export function lignesMilieu(nom: string, U: P, V: P, nU: string, nV: string): LigneCalcul[] {
  const M = { x: (U.x + V.x) / 2, y: (U.y + V.y) / 2 };
  const s = (a: number, b: number) => `${nb(a)}${b < 0 ? "" : "+"}${nb(b)}`;
  return [ligne(`${nom}\\left(\\dfrac{${s(U.x, V.x)}}{2}\\,;\\dfrac{${s(U.y, V.y)}}{2}\\right)=\\left(${nb(M.x)}\\,;${nb(M.y)}\\right)`, `milieu de [${nU}${nV}]`)];
}

/** Vecteur \vec{UV} en colonne, calculé. */
export function ligneVecteur(nom: string, U: P, V: P): LigneCalcul {
  return ligne(`\\vec{${nom}}\\begin{pmatrix}${nb(V.x)}-${nbp(U.x)}\\\\${nb(V.y)}-${nbp(U.y)}\\end{pmatrix}=\\begin{pmatrix}${nb(V.x - U.x)}\\\\${nb(V.y - U.y)}\\end{pmatrix}`);
}

export { memeDroite, somme };

/** Figure du corrigé à taille raisonnable : la règle commune (`.figure-corrige-bloc svg`, largeur 100 %,
 * jusqu'à 14 cm) agrandissait nos repères de 300 px jusqu'à la colonne entière ; on la borne à 9 cm. */
export const figureCorrigeLot = (svg: string) => `<div style="max-width:9cm;margin:0 auto">${svg}</div>`;
