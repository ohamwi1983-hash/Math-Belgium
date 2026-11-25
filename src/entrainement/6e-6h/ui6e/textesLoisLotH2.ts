import { decimalFixe, decimalFixeL } from "../core6e/tablePhi";
import { decL } from "./nombresCombinatoireLotH2";

/**
 * Écritures communes des générateurs 6gen116–6gen122 (6e ch. 8, lot H, seconde moitié). Notation du
 * chapitre (décision du 18/11/2026) : 𝒩(μ ; σ) — le second paramètre est l'ÉCART-TYPE —, 𝓑(n ; p)
 * calligraphique, Φ(z) = P(Z ≤ z), Cₙᵏ, P(X = k) ; virgule décimale `{,}` ; « − » typographique.
 */

/** Décimal LaTeX à `n` décimales FIXES (« 0{,}8900 »). */
export const dL = decimalFixeL;
/** Décimal texte à `n` décimales FIXES (« 0,8900 »). */
export const dT = decimalFixe;
/** Décimal LaTeX, zéros inutiles retirés (au plus 4 décimales) : « 172 », « 2{,}5 ». */
export const nL = (x: number, dec = 4): string => decL(x, dec);
/** Décimal texte (« 2,5 », « −1,25 »). */
export const nT = (x: number, dec = 4): string => decL(x, dec).replace("{,}", ",").replace(/\\,/g, " ").replace(/^-/, "−");
/** Pourcentage LaTeX : « 95{,}4\,\% ». */
export const pctL = (x: number, dec = 2): string => `${decL(x, dec)}\\,\\%`;
/** Pourcentage texte : « 95,4 % ». */
export const pctT = (x: number, dec = 2): string => `${nT(x, dec)} %`;
/** 𝒩(μ ; σ). */
export const NL = (mu: number, sigma: number): string => `\\mathcal{N}(${nL(mu)}\\,;${nL(sigma)})`;
/** 𝓑(n ; p). */
export const BL = (n: number, p: string | number): string => `\\mathcal{B}(${n}\\,;${typeof p === "number" ? nL(p) : p})`;
/** Φ(1{,}23). */
export const phiL = (z: number): string => `\\Phi(${dL(z, 2)})`;
/** z à deux décimales (« 1{,}23 », « -0{,}85 »). */
export const zL = (z: number): string => dL(z, 2);
/** Probabilité de table (« 0{,}8907 »). */
export const p4L = (x: number): string => dL(x, 4);
