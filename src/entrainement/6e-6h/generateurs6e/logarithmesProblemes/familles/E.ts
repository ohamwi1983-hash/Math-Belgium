import type { ContexteE, ExerciceLogProbE, SensEcran2E, SensEcran3E } from "../../../core6e/logarithmesProblemes.types";
import { arrondir, tirerDeuxEntiersDistinctsTries, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille E — échelle logarithmique généralisée `L=a·log10(X)+b`. `a`/`b` sont des CONSTANTES DE
 * DÉFINITION fixées par le contexte (pH, décibels, magnitude) — jamais des inconnues à "retrouver"
 * numériquement à partir de données arbitraires : l'écran 1 (quand présent) fait donc pratiquer un
 * VRAI système à 2 équations dont la solution est déjà connue d'avance (les constantes fixes de la
 * grandeur), avec une tolérance de correction généreuse (voir `verificationLogarithmesProblemes.ts`)
 * plutôt qu'une re-dérivation stricte depuis des points arrondis à l'affichage.
 *
 * **Astuce de génération — `X` toujours une puissance PROPRE de 10** pour l'écran 1 et pour
 * `X0`/l'écran 2 (`versL`) : `log10(10^n)=n` exactement, donc AUCUN arrondi n'entache jamais la
 * valeur affichée de `X` ni la référence de correction qui en dépend — contourne complètement le
 * problème de plage de magnitude énorme (ex. décibels : X jusqu'à 10^13) sans jamais recourir à une
 * notation scientifique arrondie à l'affichage.
 */

interface ConfigContexteE {
  id: ContexteE;
  a: number;
  b: number;
  rangeL: [number, number];
  decimalsL: number;
  exposantMin: number;
  exposantMax: number;
  /** Sous-plage de `rangeL` réservée à l'écran 2 sens "versX" (X est alors la valeur RÉPONSE que
   * l'élève doit taper, contrairement à X0/X1/X2 qui restent des DONNÉES affichées) — restreinte
   * pour que X reste "tapable" (quelques chiffres, jamais 10^13) : X=10^((L-b)/a) explose vite en
   * dehors de cette plage vu l'ordre de grandeur de `a` pour décibels/magnitude. `null` pour
   * "magnitude" (aucune sous-plage ne donne un X raisonnable — cette énergie sismique est TOUJOURS
   * un nombre à 5+ chiffres au minimum, même pour une magnitude proche de 0 — voir devlog) : le
   * sens "versX" est alors désactivé pour ce contexte, toujours "versL" (documenté dans le devlog). */
  rangeVersX: [number, number] | null;
}

const CONFIGS: ConfigContexteE[] = [
  { id: "pH", a: -1, b: 0, rangeL: [1, 13], decimalsL: 1, exposantMin: -13, exposantMax: -1, rangeVersX: [0, 4] },
  { id: "decibels", a: 10, b: 0, rangeL: [10, 130], decimalsL: 0, exposantMin: 1, exposantMax: 13, rangeVersX: [0, 50] },
  { id: "magnitude", a: 1 / 1.5, b: -4.8 / 1.5, rangeL: [1, 9], decimalsL: 1, exposantMin: 6, exposantMax: 18, rangeVersX: null },
];

const K_ECRAN3_POOL = [2, 5, 10, 100] as const;

function tirerLDansPlage(plage: [number, number], decimales: number): number {
  const [min, max] = plage;
  const echelle = Math.pow(10, decimales);
  return tirerEntier(Math.round(min * echelle), Math.round(max * echelle)) / echelle;
}

export function construireE(contexteForce?: ContexteE, deduireABForce?: boolean): ExerciceLogProbE {
  const cfg = contexteForce ? CONFIGS.find((c) => c.id === contexteForce)! : tirerParmi(CONFIGS);
  const { a, b } = cfg;
  const deduireAB = deduireABForce ?? tirerParmi([true, false]);

  const [n1, n2] = tirerDeuxEntiersDistinctsTries(cfg.exposantMin, cfg.exposantMax);
  const X1 = Math.pow(10, n1);
  const X2 = Math.pow(10, n2);
  const L1 = arrondir(a * n1 + b, cfg.decimalsL);
  const L2 = arrondir(a * n2 + b, cfg.decimalsL);

  const sensEcran2: SensEcran2E = cfg.rangeVersX === null ? "versL" : tirerParmi(["versL", "versX"] as const);
  const n0 = tirerEntier(cfg.exposantMin, cfg.exposantMax);
  const X0 = Math.pow(10, n0);
  const L0Affiche = sensEcran2 === "versX" && cfg.rangeVersX !== null ? tirerLDansPlage(cfg.rangeVersX, cfg.decimalsL) : tirerLDansPlage(cfg.rangeL, cfg.decimalsL);
  const reponseEcran2 = sensEcran2 === "versL" ? a * n0 + b : Math.pow(10, (L0Affiche - b) / a);

  const sensEcran3: SensEcran3E = tirerParmi(["versDeltaL", "versFacteur"] as const);
  const kEcran3 = tirerParmi(K_ECRAN3_POOL);
  const deltaLDonnee = arrondir(a * Math.log10(tirerParmi(K_ECRAN3_POOL)), 2);
  const reponseEcran3 = sensEcran3 === "versDeltaL" ? a * Math.log10(kEcran3) : Math.pow(10, deltaLDonnee / a);

  const [L1e4, L2e4] = [tirerLDansPlage(cfg.rangeL, cfg.decimalsL), tirerLDansPlage(cfg.rangeL, cfg.decimalsL)];
  const X1e4 = Math.pow(10, (L1e4 - b) / a);
  const X2e4 = Math.pow(10, (L2e4 - b) / a);
  const Ltotal = a * Math.log10(X1e4 + X2e4) + b;

  return {
    famille: "E",
    contexteE: cfg.id,
    a,
    b,
    deduireAB,
    X1,
    L1,
    X2,
    L2,
    sensEcran2,
    X0,
    L0Affiche,
    reponseEcran2,
    sensEcran3,
    kEcran3,
    deltaLDonnee,
    reponseEcran3,
    L1e4,
    L2e4,
    X1e4,
    X2e4,
    Ltotal,
  };
}
