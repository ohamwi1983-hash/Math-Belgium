import type { ContexteBinomialeA } from "../../core6e/binomialeSequenceOrdonnee.types";
import type { ContexteLoiBinomialeA, ContexteLoiBinomialeC } from "../../core6e/loiBinomiale.types";

/**
 * Couche A (6e) — banque de contextes narratifs pour `6gen50`, familles A/B/C. Thèmes de la spec :
 * factures impayées, hérédité, bus indisponibles, pièces défectueuses/produit commercial.
 *
 * **Famille A — `n`/`p` EMBARQUÉS dans la phrase** (`texteTemplate`, voir en-tête
 * `core6e/loiBinomiale.types.ts`) : l'élève doit pouvoir les en extraire à l'écran 1, donc jamais
 * affichés séparément avant confirmation. `p` formaté en POURCENTAGE ENTIER (`formatPourcentageMot`)
 * — lisible dans une phrase française, contrairement à une fraction/décimale qui y serait
 * artificielle ; la valeur EXACTE (`0.1`...) reste stockée en interne pour tout calcul.
 *
 * **Famille B — générique, jamais de `n`/`p`/`k` mentionné** (mirroir `ContexteBinomialeA`/
 * `ContexteBinomialeB` de `6gen48`) : banque DISTINCTE de celle de `6gen48` (nouveaux contextes,
 * spec), mais MÊME FORME `{id,texte,labelSucces}` — réutilise le type `ContexteBinomialeA` de
 * `6gen48` tel quel (Couche A ↔ Couche A, autorisé par CLAUDE.md) plutôt que d'en dupliquer la
 * définition structurelle.
 *
 * **Famille C — générique, cadre "au moins 1 succès sur n répétitions"** : narratif distinct des
 * deux autres familles (n est ici l'INCONNUE à trouver, jamais une donnée du contexte).
 */

/** `%` échappé en `\%` — piège découvert en vérification Playwright (`.katex-error`) : ce texte
 * finit toujours dans un fragment `\text{...}` (KaTeX, mode maths), où `%` reste un caractère de
 * COMMENTAIRE LaTeX même à l'intérieur de `\text{}` (tronque tout le reste jusqu'à la fin de la
 * chaîne, y compris l'accolade fermante) — jamais un simple caractère littéral, contrairement à
 * l'intuition. */
function formatPourcentageMot(p: number): string {
  return `${Math.round(p * 100)}\\%`;
}

export const CONTEXTES_A: readonly ContexteLoiBinomialeA[] = [
  {
    id: "facturesA",
    texteTemplate: (n, p) => `Un service comptable examine ${n} factures indépendantes. On estime que la probabilité qu'une facture donnée reste impayée est de ${formatPourcentageMot(p)}.`,
    labelSucces: "la facture reste impayée",
  },
  {
    id: "herediteA",
    texteTemplate: (n, p) => `On observe ${n} naissances indépendantes dans une espèce où chaque descendant a une probabilité de ${formatPourcentageMot(p)} de présenter un caractère héréditaire donné.`,
    labelSucces: "le descendant présente le caractère héréditaire",
  },
  {
    id: "busA",
    texteTemplate: (n, p) => `Une société de transport suit ${n} trajets de bus indépendants. La probabilité qu'un trajet donné soit assuré par un bus indisponible est de ${formatPourcentageMot(p)}.`,
    labelSucces: "le trajet est assuré par un bus indisponible",
  },
  {
    id: "piecesA",
    texteTemplate: (n, p) => `Un contrôle qualité examine ${n} pièces indépendantes issues d'une même chaîne de production. La probabilité qu'une pièce donnée soit défectueuse est de ${formatPourcentageMot(p)}.`,
    labelSucces: "la pièce est défectueuse",
  },
];

export const CONTEXTES_B: readonly ContexteBinomialeA[] = [
  { id: "facturesB", texte: "Un service comptable examine plusieurs factures indépendantes, chacune ayant la même probabilité d'être impayée.", labelSucces: "reste impayée" },
  { id: "herediteB", texte: "On observe plusieurs naissances indépendantes dans une famille, chaque naissance ayant la même probabilité de présenter un caractère héréditaire donné.", labelSucces: "présente le caractère héréditaire" },
  { id: "busB", texte: "Une société de transport suit plusieurs trajets de bus indépendants, chacun ayant la même probabilité d'être assuré par un bus indisponible.", labelSucces: "est assuré par un bus indisponible" },
  { id: "produitB", texte: "Un contrôle qualité examine plusieurs unités indépendantes d'un même produit commercial, chacune ayant la même probabilité d'être défectueuse.", labelSucces: "est défectueuse" },
];

export const CONTEXTES_C: readonly ContexteLoiBinomialeC[] = [
  { id: "graines", texte: "On sème des graines de manière indépendante ; chaque graine a la même probabilité de germer." },
  { id: "depistage", texte: "On réalise des tests de dépistage indépendants ; chaque test a la même probabilité de revenir positif." },
  { id: "connexion", texte: "Un serveur tente des connexions indépendantes ; chaque tentative a la même probabilité de réussir." },
  { id: "ampoules", texte: "On met sous tension des ampoules indépendantes ; chaque ampoule a la même probabilité de tomber en panne dès sa mise sous tension." },
];

export { formatPourcentageMot };
