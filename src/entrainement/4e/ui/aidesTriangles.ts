import type { ExerciceTriangleQuelconque } from "../core/triangleQuelconque.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { diagnostiquerCalculNumeriqueTriangle } from "../moteur/verificationTriangle";
import { donneesFormuleAire } from "../moteur/verificationTriangleQuelconque";
import { valeurAffichee } from "./formatTriangleQuelconque";

/**
 * gen19 (triangle quelconque) et gen58 (triangles liés) — messages ciblés (audit 4e ch. 5, lot B) :
 * calculatrice en radians, angle obtus pris pour l'aigu (touche sin⁻¹), côté non opposé à l'angle
 * dans la loi des sinus, signe de Al-Kashi, ½ oublié dans l'aire, bonne valeur avec la mauvaise
 * unité. Jamais la réponse.
 */

const RAD = Math.PI / 180;
const prochePct = (v: number, x: number, pct = 0.01) => Number.isFinite(x) && Math.abs(v - x) <= Math.max(0.01, Math.abs(x) * pct);

export const MESSAGE_RADIANS = "Ta calculatrice est-elle en mode degrés (DEG) ? Ce résultat correspond à un calcul en radians.";

export interface ErreurConnue {
  valeur: number;
  message: FragmentConsigne[];
}

/** Message ciblé générique d'un résultat numérique de triangle. `attendu` : valeur juste ;
 * `angle` : la grandeur est un angle (test du supplémentaire) ; `radians` : valeurs obtenues en
 * mode radians ; `autres` : autres erreurs reconnues. */
export function messageCalculTriangle(v: number, attendu: number, opts: { angle?: boolean; radians?: number[]; autres?: ErreurConnue[] }): FragmentConsigne[] | null {
  if (diagnostiquerCalculNumeriqueTriangle(v, attendu) === "correct") return null;
  if ((opts.radians ?? []).some((r) => prochePct(v, r, 0.015))) return [texte(MESSAGE_RADIANS)];
  if (opts.angle && Math.abs(v - (180 - attendu)) <= Math.max(0.6, attendu * 0.01)) {
    return attendu > 90
      ? [texte("La touche "), latex("\\sin^{-1}"), texte(" ne donne que l'angle aigu : ici l'angle est obtus, c'est le supplémentaire de ce résultat (180° moins ce résultat).")]
      : [texte("C'est le supplémentaire de l'angle cherché : ici l'angle est aigu.")];
  }
  for (const e of opts.autres ?? []) if (prochePct(v, e.valeur)) return e.message;
  return null;
}

export const MESSAGE_UNITE: FragmentConsigne[] = [texte("La valeur est juste, mais pas l'unité : relis l'unité des données.")];

// ---------------------------------------------------------------------------------------------
// gen19
// ---------------------------------------------------------------------------------------------

export function messageDonneeManquanteTQ(e: ExerciceTriangleQuelconque, v: number, uniteJuste: boolean): FragmentConsigne[] | null {
  const t = e.triangle;
  const attendu = t[e.donneeManquante];
  if (diagnostiquerCalculNumeriqueTriangle(v, attendu) === "correct") return uniteJuste ? null : MESSAGE_UNITE;
  const a = valeurAffichee(e, "a");
  const b = valeurAffichee(e, "b");
  const c = valeurAffichee(e, "c");
  const A = valeurAffichee(e, "A");
  const B = valeurAffichee(e, "B");
  if (e.configuration === "loiSinus") {
    return messageCalculTriangle(v, attendu, {
      radians: [(a * Math.sin(B)) / Math.sin(A)],
      autres: [{ valeur: (a * Math.sin(A * RAD)) / Math.sin(B * RAD), message: [texte("Chaque côté est en face de son angle : "), latex("AC"), texte(" est opposé à "), latex("\\hat{B}"), texte(", "), latex("BC"), texte(" à "), latex("\\hat{A}"), texte(".")] }],
    });
  }
  if (e.configuration === "alKashi") {
    return messageCalculTriangle(v, attendu, {
      angle: true,
      radians: [attendu * RAD],
      autres: [{ valeur: Math.acos(Math.max(-1, Math.min(1, (b * b + c * c + a * a) / (2 * b * c)))) / RAD, message: [texte("Dans Al-Kashi isolé, on retranche le carré du côté opposé à l'angle : "), latex("\\cos\\hat{A} = \\dfrac{AC^2 + AB^2 - BC^2}{2 \\cdot AC \\cdot AB}"), texte(".")] }],
    });
  }
  return messageCalculTriangle(v, attendu, {
    radians: [Math.sqrt(Math.max(0, b * b + c * c - 2 * b * c * Math.cos(A)))],
    autres: [{ valeur: Math.sqrt(b * b + c * c + 2 * b * c * Math.cos(A * RAD)), message: [texte("Attention au signe dans Al-Kashi : on retranche "), latex("2 \\cdot AC \\cdot AB \\cdot \\cos\\hat{A}"), texte(".")] }],
  });
}

export function messageAireTQ(e: ExerciceTriangleQuelconque, v: number, attendu: number, uniteJuste: boolean): FragmentConsigne[] | null {
  if (diagnostiquerCalculNumeriqueTriangle(v, attendu) === "correct") return uniteJuste ? null : MESSAGE_UNITE;
  const { cote1, cote2, angleCompris } = donneesFormuleAire(e);
  const p = valeurAffichee(e, cote1);
  const q = valeurAffichee(e, cote2);
  const x = valeurAffichee(e, angleCompris);
  return messageCalculTriangle(v, attendu, {
    radians: [0.5 * p * q * Math.sin(x)],
    autres: [{ valeur: p * q * Math.sin(x * RAD), message: [texte("N'oublie pas le facteur "), latex("\\dfrac{1}{2}"), texte(" de la formule de l'aire.")] }],
  });
}

/** Niveau 1 des aides de gen19 : la loi, en KaTeX (les données sont surlignées sur le croquis). */
export function aide1DonneeManquanteTQ(e: ExerciceTriangleQuelconque): FragmentConsigne[] {
  if (e.configuration === "loiSinus") {
    return [texte("Deux angles et un côté connus : loi des sinus, chaque côté divisé par le sinus de l'angle opposé (données surlignées sur la figure) :"), latex("\\dfrac{BC}{\\sin\\hat{A}} = \\dfrac{AC}{\\sin\\hat{B}} = \\dfrac{AB}{\\sin\\hat{C}}")];
  }
  if (e.configuration === "alKashi") {
    return [texte("Trois côtés connus : Al-Kashi (loi des cosinus), écrite pour le côté opposé à l'angle cherché (données surlignées sur la figure) :"), latex("BC^2 = AC^2 + AB^2 - 2 \\cdot AC \\cdot AB \\cdot \\cos\\hat{A}")];
  }
  return [texte("Deux côtés et l'angle compris connus : Al-Kashi (loi des cosinus) (données surlignées sur la figure) :"), latex("BC^2 = AC^2 + AB^2 - 2 \\cdot AC \\cdot AB \\cdot \\cos\\hat{A}")];
}

export function aide1AireTQ(): FragmentConsigne[] {
  return [texte("Aire d'un triangle : la moitié du produit de deux côtés par le sinus de l'angle compris entre eux (surlignés sur la figure) :"), latex("\\mathcal{A} = \\dfrac{1}{2} \\cdot p \\cdot q \\cdot \\sin\\hat{X}")];
}
