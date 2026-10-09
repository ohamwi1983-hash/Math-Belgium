import type { ExerciceExtA, SousTypeExtA } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { CANDIDATS_P_C, CANDIDATS_SEUIL_C, calculerNMinimalC } from "../loiBinomiale/familleC";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille A ("Indépendance composée + trouver n via logarithme") pour
 * `6gen52`. 2 sous-types :
 * - "compose" (ex. jeu télévisé à 2 épreuves indépendantes) : le succès global est la réussite des
 *   DEUX épreuves (`p=p1·p2`, ET logique — jamais OU) — écran supplémentaire par rapport à "direct".
 * - "direct" (ex. tirer une carte précise) : `p` déjà donné directement pour une seule épreuve.
 *
 * ============================================================================
 * **RÉUTILISATION DIRECTE — `calculerNMinimalC`/`CANDIDATS_P_C`/`CANDIDATS_SEUIL_C` de
 * `generateurs6e/loiBinomiale/familleC.ts` (`6gen50` famille C), Couche A ↔ Couche A libre entre
 * générateurs 6e (CLAUDE.md)** — lire avant de modifier ce fichier
 * ============================================================================
 * `calculerNMinimalC(p, seuil)` calcule DÉJÀ le nombre minimal `n` tel que `1-(1-p)^n>seuil`
 * (résolution par logarithme, piège du sens de l'inégalité déjà géré dans son propre fichier —
 * jamais réimplémenté ici). `CANDIDATS_P_C`/`CANDIDATS_SEUIL_C` (mêmes bornes que `6gen50`,
 * garantissent des couples `p`/`seuil` déjà éprouvés — jamais de nouvelles bornes inventées ici pour
 * le sous-type "direct"). Le sous-type "compose" calcule `p=p1·p2` PUIS appelle EXACTEMENT la même
 * fonction avec ce `p` composé — la résolution en `n` ne connaît pas la différence entre les deux
 * sous-types, seule la Couche A de CE fichier construit `p` différemment en amont.
 */

const CANDIDATS_P1P2: readonly number[] = [0.2, 0.3, 0.4, 0.5, 0.6];

/** Décimal français en TEXTE BRUT (jamais de `\text{...}` manuel ici — voir en-tête de fichier et
 * `core6e/extensionsBinomialeNormaleBayes.types.ts` : la Couche ui découpe ce texte en fragments
 * KaTeX courts au moment de l'affichage). Une simple virgule suffit (pas de `{,}`, ce truc KaTeX
 * n'a de sens qu'en MODE MATHS — ici le nombre finit entouré de `\text{...}`, une virgule y est un
 * caractère de texte ordinaire). */
function formatVirguleSimple(v: number): string {
  return String(v).replace(".", ",");
}

interface ContexteCompose {
  id: string;
  texte: (p1: number, p2: number) => string;
}
interface ContexteDirect {
  id: string;
  texte: (p: number) => string;
}

const CONTEXTES_COMPOSE: readonly ContexteCompose[] = [
  {
    id: "jeuTelevise",
    texte: (p1, p2) => `Dans un jeu télévisé, un candidat doit réussir 2 épreuves indépendantes. La 1ʳᵉ réussit avec une probabilité ${formatVirguleSimple(p1)}, la 2ᵉ avec ${formatVirguleSimple(p2)}. Le candidat gagne s'il réussit les deux.`,
  },
  {
    id: "controleQualite",
    texte: (p1, p2) => `Un produit passe 2 contrôles qualité indépendants. Le 1ᵉʳ est raté avec une probabilité ${formatVirguleSimple(p1)}, le 2ᵉ avec ${formatVirguleSimple(p2)}. Succès si le produit rate les deux (défaut qui passe inaperçu).`,
  },
];

const CONTEXTES_DIRECT: readonly ContexteDirect[] = [
  {
    id: "carteAs",
    texte: (p) => `On tire une carte au hasard dans un jeu, on la remet, puis on répète. La probabilité de tirer un as est de ${formatVirguleSimple(p)} à chaque tirage.`,
  },
  {
    id: "loterie",
    texte: (p) => `On achète un billet de loterie, encore et encore. La probabilité qu'un billet soit gagnant est de ${formatVirguleSimple(p)} à chaque achat.`,
  },
];

/** Construction déterministe "composé" (`p1`/`p2`/`seuil` fixés) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. */
export function construireCompose(p1: number = tirerParmi(CANDIDATS_P1P2), p2: number = tirerParmi(CANDIDATS_P1P2), seuil: number = tirerParmi(CANDIDATS_SEUIL_C), contexteTexte?: string): ExerciceExtA {
  const p = p1 * p2;
  const texte = contexteTexte ?? tirerParmi(CONTEXTES_COMPOSE).texte(p1, p2);
  return { famille: "A", sousType: "compose", contexteTexte: texte, p1, p2, p, seuil, valeurN: calculerNMinimalC(p, seuil) };
}

/** Construction déterministe "direct" (`p`/`seuil` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. */
export function construireDirect(p: number = tirerParmi(CANDIDATS_P_C), seuil: number = tirerParmi(CANDIDATS_SEUIL_C), contexteTexte?: string): ExerciceExtA {
  const texte = contexteTexte ?? tirerParmi(CONTEXTES_DIRECT).texte(p);
  return { famille: "A", sousType: "direct", contexteTexte: texte, p, seuil, valeurN: calculerNMinimalC(p, seuil) };
}

const SOUS_TYPES: readonly SousTypeExtA[] = ["compose", "direct"];

export function construireFamilleA(): ExerciceExtA {
  const sousType = tirerParmi(SOUS_TYPES);
  return sousType === "compose" ? construireCompose() : construireDirect();
}
