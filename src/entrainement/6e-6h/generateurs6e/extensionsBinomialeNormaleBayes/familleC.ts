import type { ExerciceExtC } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { construireFamilleD as construireFamilleDLoiNormale } from "../loiNormale/familleD";
import type { ExerciceLoiNormaleD } from "../../core6e/loiNormale.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille C ("Loi normale inverse en contexte") pour `6gen52`. RÉUTILISE
 * INTÉGRALEMENT `construireFamilleD` de `generateurs6e/loiNormale/familleD.ts` (`6gen51` famille D,
 * "Générale, sens inverse") — génération ET logique mathématique (`valeurCibleTableD`/`valeurZD`/
 * `destandardiserD`, réexportées telles quelles par `moteur6e/verificationExtensionsBinomialeNormale
 * Bayes.ts` — voir cet en-tête) INTÉGRALEMENT reprises, JAMAIS réimplémentées. Seul ajout : un
 * habillage narratif "contexte de classement" (`contexteTexte`), propre à `6gen52`, qui donne un sens
 * concret aux 3 sous-types déjà existants "cumulee"/"symetrique"/"encadree" (ex. seuil d'admission au
 * percentile supérieur, plage de notes autour de la moyenne, tranche de classement).
 */

/** TEXTE BRUT (jamais de `\text{...}` manuel ici — la Couche ui, `ui6e/
 * formatExtensionsBinomialeNormaleBayes.ts::decouperEnFragmentsTexte`, découpe ce texte en
 * fragments KaTeX courts au moment de l'affichage, voir `core6e/
 * extensionsBinomialeNormaleBayes.types.ts::ExerciceExtC.contexteTexte`). */
const CONTEXTES_C: readonly string[] = [
  "Les notes obtenues à un concours d'entrée suivent une loi normale.",
  "Les temps réalisés lors d'une course suivent une loi normale.",
  "Les scores obtenus à un test standardisé suivent une loi normale.",
];

/** Construction déterministe — reçoit un exercice `6gen51` famille D DÉJÀ construit (jamais
 * régénéré ici) et lui ajoute l'habillage narratif — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. */
export function construireAvecBase(base: ExerciceLoiNormaleD, contexteTexte?: string): ExerciceExtC {
  return { famille: "C", base, contexteTexte: contexteTexte ?? tirerParmi(CONTEXTES_C) };
}

/** Force un sous-type précis en ré-appelant `construireFamilleDLoiNormale` (générateur ÉQUIPROBABLE
 * des 3 sous-types en interne, aucun paramètre de forçage exposé côté `6gen51`) jusqu'à obtenir le
 * sous-type voulu — utilisée par `CATALOGUE_VARIANTES` (dev uniquement, coût négligeable, 3 sous-types
 * équiprobables donc convergence quasi immédiate). */
export function construireAvecSousType(sousType: ExerciceLoiNormaleD["sousType"]): ExerciceExtC {
  for (let essai = 0; essai < 500; essai++) {
    const base = construireFamilleDLoiNormale();
    if (base.sousType === sousType) return construireAvecBase(base);
  }
  /* c8 ignore next */
  throw new Error("construireAvecSousType : sous-type introuvable après 500 tentatives");
}

export function construireFamilleC(): ExerciceExtC {
  return construireAvecBase(construireFamilleDLoiNormale());
}
