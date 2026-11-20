import type { ExerciceExpoProbA, ExerciceExpoProbA_Doublement, ExerciceExpoProbA_Evaluer } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_A_DOUBLEMENT, CONTEXTES_A_EVALUER } from "../contextes";
import { tirerEntier, tirerParmi } from "../aleatoire";

const K_POOL = [1, 2, 3] as const;

/** Sous-type "évaluer" — le SENS (croissance/décroissance) est tiré en premier, puis un contexte de
 * ce sens, puis la valeur initiale, le pourcentage et la durée dans les bornes réalistes de CE
 * contexte (audit 6e ch. 2 : plus de dose de 180 000 mg ni de voiture neuve à 180 000 €). */
export function construireAEvaluer(): ExerciceExpoProbA_Evaluer {
  const croissance = tirerParmi([true, false]);
  const contexte = tirerParmi(CONTEXTES_A_EVALUER.filter((c) => c.direction === (croissance ? "croissance" : "decroissance")));
  const Q0 = tirerParmi(contexte.q0Pool);
  const p = tirerParmi(contexte.pPool);
  const r = croissance ? 1 + p / 100 : 1 - p / 100;
  const n = tirerEntier(contexte.nMin, contexte.nMax);
  return { famille: "A", sousType: "evaluer", contexteId: contexte.id, Q0, p, croissance, r, n, valeurFinale: Q0 * Math.pow(r, n) };
}

/** Sous-type "doublement" — instant de référence réaliste par contexte (audit : plus de
 * doublements sur 30 à 100 périodes). */
export function construireADoublement(): ExerciceExpoProbA_Doublement {
  const contexte = tirerParmi(CONTEXTES_A_DOUBLEMENT);
  const T = tirerParmi(contexte.tPool);
  const k = tirerParmi(K_POOL);
  return { famille: "A", sousType: "doublement", contexteId: contexte.id, T, k, t: T - k };
}

export function construireA(): ExerciceExpoProbA {
  return tirerParmi(["evaluer", "doublement"] as const) === "evaluer" ? construireAEvaluer() : construireADoublement();
}
