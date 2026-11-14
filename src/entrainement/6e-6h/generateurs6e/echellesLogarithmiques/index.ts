import type { ExerciceEchellesLogarithmiques, IdVarianteEchelles, RegimeEchelles } from "../../core6e/echellesLogarithmiques.types";
import { CONTEXTES_COMBIEN, CONTEXTES_COMPARER_DB, CONTEXTES_COMPARER_PH, CONTEXTES_REDUIRE, CONTEXTES_SOURCES, NB_CONTEXTES } from "../../core6e/contextesEchellesLogarithmiques";

export type { IdVarianteEchelles } from "../../core6e/echellesLogarithmiques.types";

/**
 * Couche A (6e) — tirage de `6gen90` « Échelles logarithmiques : rapports et sommes ». Une fonction
 * de construction par variante ; tirage libre équiprobable parmi les 11 variantes
 * (`CATALOGUE_VARIANTES`, aussi utilisé par `SelecteurVarianteDev` et l'adaptateur d'export).
 * Uniquement `Math.random` : la graine des feuilles imprimées (`export/codeExercice.ts::avecGraine`)
 * rejoue donc exactement la même instance.
 *
 * Le RÉGIME (exacte / calculatrice) est tiré AVANT les nombres (4 fois sur 10 « exacte ») : les
 * boucles de rejet ne biaisent donc pas sa fréquence. Les valeurs à une décimale sont tirées en
 * dixièmes entiers puis divisées par 10 (aucune dérive flottante).
 */

export const CATALOGUE_VARIANTES: { id: IdVarianteEchelles; label: string }[] = [
  { id: "db-sources", label: "Décibels — n sources identiques (niveau total)" },
  { id: "db-reduire", label: "Décibels — intensité divisée par k (nouveau niveau)" },
  { id: "db-combien", label: "Décibels — combien de sources pour atteindre un niveau" },
  { id: "db-comparer", label: "Décibels — comparer deux niveaux (rapport d'intensités)" },
  { id: "seisme-amplitude", label: "Séismes — rapport des amplitudes" },
  { id: "seisme-energie", label: "Séismes — rapport des énergies" },
  { id: "seisme-magnitude", label: "Séismes — magnitude d'un séisme k fois plus énergétique" },
  { id: "ph-comparer", label: "pH — rapport des concentrations en ions H₃O⁺" },
  { id: "ph-diluer", label: "pH — pH après une dilution" },
  { id: "etoiles-eclat", label: "Étoiles — rapport d'éclat" },
  { id: "etoiles-magnitude", label: "Étoiles — magnitude d'une étoile k fois plus/moins lumineuse" },
];

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function melanger(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

function tirerRegime(): RegimeEchelles {
  return Math.random() < 0.4 ? "exacte" : "calculatrice";
}

function base(variante: IdVarianteEchelles, regime: RegimeEchelles): ExerciceEchellesLogarithmiques {
  return { variante, regime, contexte: entier(0, NB_CONTEXTES[variante] - 1), contexte2: -1, v1: 0, v2: 0, k: 0, sens: "plus", ordreOptions: melanger(4) };
}

/** Écarts (dB) du type « combien » au régime calculatrice : 10^(ΔL/10) a une partie décimale
 * entre 0,1 et 0,9 (l'arrondi à l'entier supérieur se distingue de l'arrondi au plus proche ou de
 * la troncature, et aucun « presque entier » ne trompe la calculatrice). */
const ECARTS_COMBIEN_CALC = [4, 5, 8, 9, 11, 12, 14, 15, 16, 18, 19];

export function construire(variante: IdVarianteEchelles, regimeForce?: RegimeEchelles): ExerciceEchellesLogarithmiques {
  const regime = regimeForce ?? tirerRegime();
  const e = base(variante, regime);
  const exact = regime === "exacte";
  switch (variante) {
    case "db-sources": {
      const [a, b] = CONTEXTES_SOURCES[e.contexte].plage;
      return { ...e, v1: entier(a, b), k: exact ? choisir([10, 100]) : choisir([2, 3, 4, 5, 6, 8, 20, 50]) };
    }
    case "db-reduire": {
      const [a, b] = CONTEXTES_REDUIRE[e.contexte].plage;
      return { ...e, v1: entier(a, b), k: exact ? choisir([10, 100, 1000]) : choisir([2, 4, 5, 20, 50, 200, 500]) };
    }
    case "db-combien": {
      const [a, b] = CONTEXTES_COMBIEN[e.contexte].plage;
      const v1 = entier(a, b);
      return { ...e, v1, v2: v1 + (exact ? choisir([10, 20, 30]) : choisir(ECARTS_COMBIEN_CALC)) };
    }
    case "db-comparer": {
      for (;;) {
        const i = entier(0, CONTEXTES_COMPARER_DB.length - 2);
        const j = entier(i + 1, CONTEXTES_COMPARER_DB.length - 1);
        const v1 = entier(...CONTEXTES_COMPARER_DB[i].plage);
        const v2 = entier(...CONTEXTES_COMPARER_DB[j].plage);
        const d = v2 - v1;
        if (exact ? d % 10 !== 0 || d < 10 || d > 70 : d % 10 === 0 || d < 3 || d > 39) continue;
        return { ...e, contexte: i, contexte2: j, v1, v2 };
      }
    }
    case "seisme-amplitude":
    case "seisme-energie": {
      for (;;) {
        const t1 = entier(30, 62);
        // Dixièmes de magnitude d'écart. Amplitudes : exact ⇔ ΔM entier. Énergies : exact ⇔ 1,5·ΔM
        // entier ⇔ ΔM pair (2 ou 4).
        const dt =
          variante === "seisme-amplitude"
            ? exact
              ? 10 * entier(1, 3)
              : entier(3, 35)
            : exact
              ? choisir([20, 40])
              : entier(3, 26);
        if (!exact && dt % (variante === "seisme-amplitude" ? 10 : 20) === 0) continue;
        if (t1 + dt > 90) continue;
        return { ...e, contexte2: (e.contexte + 1 + entier(0, NB_CONTEXTES[variante] - 2)) % NB_CONTEXTES[variante], v1: t1 / 10, v2: (t1 + dt) / 10 };
      }
    }
    case "seisme-magnitude": {
      for (;;) {
        const t1 = entier(30, 65);
        const k = exact ? choisir([10, 100, 1000, 10000]) : choisir([2, 3, 5, 20, 30, 50, 200, 500]);
        if (t1 / 10 + Math.log10(k) / 1.5 > 9) continue;
        return { ...e, v1: t1 / 10, k };
      }
    }
    case "ph-comparer": {
      for (;;) {
        const i = entier(0, CONTEXTES_COMPARER_PH.length - 1);
        const j = entier(0, CONTEXTES_COMPARER_PH.length - 1);
        if (i === j) continue;
        const ta = entier(...CONTEXTES_COMPARER_PH[i].plage);
        const tb = entier(...CONTEXTES_COMPARER_PH[j].plage);
        const d = tb - ta;
        if (d <= 0) continue;
        if (exact ? d % 10 !== 0 || d > 40 : d % 10 === 0 || d < 3 || d > 35) continue;
        return { ...e, contexte: i, contexte2: j, v1: ta / 10, v2: tb / 10 };
      }
    }
    case "ph-diluer": {
      for (;;) {
        const t0 = entier(10, 35);
        const k = exact ? choisir([10, 100, 1000]) : choisir([2, 4, 5, 20, 25, 50, 200]);
        if (t0 / 10 + Math.log10(k) > 6) continue;
        return { ...e, v1: t0 / 10, k };
      }
    }
    case "etoiles-eclat": {
      for (;;) {
        const ta = entier(-15, 40);
        const dt = exact ? choisir([25, 50, 75]) : entier(5, 80);
        if (!exact && dt % 25 === 0) continue;
        if (ta + dt > 65) continue;
        return { ...e, v1: ta / 10, v2: (ta + dt) / 10 };
      }
    }
    case "etoiles-magnitude": {
      for (;;) {
        const ta = entier(0, 40);
        const k = exact ? choisir([10, 100, 1000]) : choisir([2, 3, 4, 5, 6, 20, 50]);
        const sens = choisir(["plus", "moins"] as const);
        const mb = ta / 10 + (sens === "moins" ? 1 : -1) * 2.5 * Math.log10(k);
        if (mb < -2 || mb > 9) continue;
        return { ...e, v1: ta / 10, k, sens };
      }
    }
  }
}

export function construireAvecVarianteId(id: IdVarianteEchelles): ExerciceEchellesLogarithmiques {
  return construire(id);
}

export function genererExerciceEchellesLogarithmiques(): ExerciceEchellesLogarithmiques {
  return construire(choisir(CATALOGUE_VARIANTES.map((c) => c.id)));
}
