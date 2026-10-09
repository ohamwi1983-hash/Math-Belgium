/**
 * Couche A (6e) — FONDATIONS PARTAGÉES de dénombrement, établies par `6gen43` ("Dénombrement
 * fondamental et arrangements", générateur D'OUVERTURE du chapitre "Analyse combinatoire").
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — 6gen44 ("Dénombrement combiné"), 6gen45 ("Binôme de Newton"),
 * 6gen46 ("problèmes"), 6gen47 ("hypergéométrique"), 6gen48 ("binomiale") — lire avant de modifier
 * ce fichier.** Ces 5 générateurs réutilisent directement les 3 fonctions ci-dessous — signatures et
 * comportement aux bornes STABLES, ne pas changer sans vérifier tous les appelants.
 * ============================================================================
 * - `factorielle(n: number): number` — `n!`. `n` DOIT être un entier `≥0` (jette sinon). `0!=1`.
 * - `coefficientBinomial(n: number, k: number): number` — `C(n,k) = n!/(k!(n-k)!)`, nombre de
 *   façons de choisir `k` éléments parmi `n` SANS tenir compte de l'ordre. `n` DOIT être un entier
 *   `≥0` (jette sinon). Bornes : `k<0` ou `k>n` → retourne `0` (jamais une exception — ce sont des
 *   cas mathématiquement valides, juste "aucune façon possible"), jamais `NaN`.
 * - `arrangements(n: number, k: number): number` — `A(n,k) = n!/(n-k)! = n·(n-1)·…·(n-k+1)`, nombre
 *   de façons de CHOISIR ET ORDONNER `k` éléments parmi `n` (l'ordre compte, contrairement à
 *   `coefficientBinomial`). `n` DOIT être un entier `≥0` (jette sinon). Bornes : `k<0` ou `k>n` →
 *   retourne `0` (même convention que `coefficientBinomial`, jamais une exception).
 *
 * ============================================================================
 * **Pourquoi ce fichier est un fichier RACINE de `generateurs6e/` plutôt que dans un sous-dossier
 * `calculPrimitives/`**
 * ============================================================================
 * Le prompt de mission suggérait initialement `generateurs6e/calculPrimitives/combinatoire.ts` —
 * DÉLIBÉRÉMENT ÉCARTÉ : `generateurs6e/calculPrimitives/` est déjà un dossier existant, mais
 * ENTIÈREMENT propre à `6gen23` ("Calcul de PRIMITIVES", chapitre 4 — au sens ANTIDÉRIVÉE, pas au
 * sens "briques de base") — `calculPrimitives/aleatoire.ts` y est explicitement documenté comme
 * "partagé par les 7 fichiers familles/{A..G}.ts DE 6gen23" et n'est importé par AUCUN autre
 * générateur du chantier (vérifié : `grep -rl "calculPrimitives/aleatoire" src` ne remonte QUE des
 * fichiers `6gen23`). Y ajouter un module de combinatoire générale aurait créé une collision de
 * sens ("Primitives" = antidérivées vs "primitives" = briques de base) et pollué le dossier d'un
 * générateur existant sans rapport. Le PRÉCÉDENT réellement pertinent pour "un fichier Couche A
 * PARTAGÉ entre plusieurs générateurs 6e, placé à la racine de `generateurs6e/`" est
 * `generateurs6e/ensembleReel.ts` (partagé 6gen1/6gen3, voir son en-tête) — ce fichier suit
 * exactement le même patron.
 *
 * ============================================================================
 * **Pourquoi ne PAS réutiliser `coefficientBinomial` de
 * `generateurs6e/probabilitesProblemes/familleB.ts` (chapitre 8, `6gen33`)**
 * ============================================================================
 * Ce fichier existe et exporte bien une fonction `coefficientBinomial` avec la même sémantique aux
 * bornes (`k<0||k>n` → `0`) — mais c'est un fichier PROPRE À LA FAMILLE B d'un générateur précis
 * (`6gen33`, chapitre "Probabilités"), jamais documenté comme infrastructure partagée
 * inter-chapitres dans `docs/infrastructure-partagee.md`, et dépourvu des 2 fonctions sœurs
 * (`factorielle` exportée séparément, `arrangements`) dont ce nouveau chapitre a besoin comme un
 * TRIO cohérent. Importer une fonction isolée d'un fichier de famille d'un AUTRE chapitre aurait
 * créé un couplage accidentel (le jour où `6gen33` retouche `familleB.ts` pour ses propres besoins,
 * ce chapitre en hériterait sans lien logique). Couche A ↔ Couche A reste libre entre générateurs
 * 6e (CLAUDE.md) — la fonction ci-dessous est donc une redéfinition VOLONTAIREMENT DIFFÉRENCIÉE,
 * comportement identique vérifié par test croisé (`combinatoire.test.ts`), mais vivant dans le
 * fichier fondation officiel de CE chapitre, celui que 6gen44-48 sont chargés d'importer.
 */

export function factorielle(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error(`factorielle : n doit être un entier ≥0, reçu ${n}`);
  let resultat = 1;
  for (let i = 2; i <= n; i++) resultat *= i;
  return resultat;
}

export function coefficientBinomial(n: number, k: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error(`coefficientBinomial : n doit être un entier ≥0, reçu ${n}`);
  if (k < 0 || k > n) return 0;
  // k et n-k symétriques : on itère sur le plus petit des deux pour limiter la taille intermédiaire.
  const kEffectif = Math.min(k, n - k);
  let resultat = 1;
  for (let i = 0; i < kEffectif; i++) {
    resultat = (resultat * (n - i)) / (i + 1);
  }
  return Math.round(resultat);
}

export function arrangements(n: number, k: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error(`arrangements : n doit être un entier ≥0, reçu ${n}`);
  if (k < 0 || k > n) return 0;
  let resultat = 1;
  for (let i = 0; i < k; i++) resultat *= n - i;
  return resultat;
}
