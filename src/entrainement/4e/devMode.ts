/**
 * Détection du "mode dev" — active le panneau `components/SelecteurVarianteDev.tsx` sur les 58
 * générateurs de 4e. Jamais une fonctionnalité destinée aux élèves : actif UNIQUEMENT (1) en local
 * (`npm run dev`, `import.meta.env.DEV`) OU (2) sur le déploiement Vercel de production via le
 * paramètre d'URL `?dev=1` explicite — jamais par défaut sur l'URL normale donnée aux élèves.
 *
 * `estModeDevDepuisParametres` est la logique PURE, testable sans DOM (`vitest` tourne en
 * environnement `node`, sans `window` — voir CLAUDE.md, "Aucun test de composant React").
 * `estModeDevActif` est le seul point d'appel réel, qui lit `import.meta.env.DEV`/
 * `window.location.search`.
 */
export function estModeDevDepuisParametres(estBuildDev: boolean, rechercheUrl: string): boolean {
  if (estBuildDev) return true;
  return new URLSearchParams(rechercheUrl).get("dev") === "1";
}

export function estModeDevActif(): boolean {
  if (typeof window === "undefined") return import.meta.env.DEV;
  return estModeDevDepuisParametres(import.meta.env.DEV, window.location.search);
}
