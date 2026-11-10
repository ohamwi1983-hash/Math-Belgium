/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs des chapitres 2 (« Équations et inéquations du second degré ») et 3
 * (« Caractéristiques des fonctions de référence ») de 4e. Décisions de l'utilisateur (voir
 * `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») : par défaut une évaluation ne tire
 * que des exercices COMPLETS (toutes les étapes à faire, aucun raccourci) ; un cas particulier ne
 * sort que si le professeur coche « inclure un cas particulier », et c'est le même dans toutes les
 * séries. Les générateurs interactifs gardent toute leur variété.
 *
 * `calcul` est toujours absent ici : dans ces deux chapitres, toutes les réponses sont EXACTES
 * (entiers, fractions, radicaux) — la calculatrice n'est jamais requise, elle n'est donc pas un
 * critère de tirage.
 *
 * Ne sont PAS des cas particuliers (vraies étapes, pas des raccourcis) : une racine rejetée par les
 * conditions d'existence, une racine double obtenue par produit remarquable, une racine
 * irrationnelle, l'absence de symétrie dans une transformation. gen3, gen5 et gen6 n'ont pas de
 * profil : aucun raccourci mesuré (5 000 tirages par variante), et la calculatrice y est sans objet.
 *
 * Plusieurs caractéristiques à la fois → identifiants joints par « + » (jamais tirés pour la case).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { Exercice } from "../core/generateur.types";
import type { ExerciceInequation } from "../core/inequation.types";
import type { ExerciceEquationRationnelle } from "../core/equationRationnelle.types";
import type { ExerciceRelationsRacines } from "../core/relationsRacines.types";
import type { ExerciceFonctionReference } from "../core/fonctionsReference.types";
import type { ExerciceFormeCanoniqueFonctionReference } from "../core/formeCanoniqueFonctionsReference.types";
import type { ExerciceCaracteristiquesFonction } from "../core/caracteristiquesFonction.types";
import type { ExerciceCaracteristiquesAlgebriquesNiveau1 } from "../core/caracteristiquesAlgebriques.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

// ---------------------------------------------------------------------------------------------
// Chapitre 2
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_SECOND_DEGRE = "Inclure un cas particulier (équation incomplète : b = 0 ou c = 0)";

/** gen1 — résoudre par la méthode la plus rapide. La variante est la méthode : une mise en
 * évidence simple a toujours c = 0, un binôme conjugué toujours b = 0 (c'est leur définition). Seule
 * la « mise en évidence généralisée » peut tomber sur une équation incomplète (b = 0 ou c = 0), qui
 * relève alors d'une autre méthode, plus courte. */
export function profilSecondDegre(e: Exercice): ProfilInstance {
  return {
    casParticulier: e.categorie === "mise_en_evidence_generalisee" && (e.enonce.b === 0 || e.enonce.c === 0) ? "equation-incomplete" : null,
  };
}

export const LIBELLE_CAS_TRINOME = "Inclure un cas particulier (trinôme incomplet : b = 0 ou c = 0)";

/** gen2 — tableau de signes d'un trinôme : un trinôme incomplet (b = 0 ou c = 0) se factorise ou se
 * signe sans discriminant. */
export function profilInequationTrinome(e: ExerciceInequation): ProfilInstance {
  // Un seul identifiant : en Δ = 0, l'incomplet est toujours ax² (b = 0 ET c = 0).
  return { casParticulier: e.enonce.b === 0 || e.enonce.c === 0 ? "trinome-incomplet" : null };
}

export const LIBELLE_CAS_EQUATION_RATIONNELLE = "Inclure un cas particulier (toutes les solutions rejetées par les conditions d'existence)";

/** gen4 — l'inconnue au dénominateur : rejeter UNE racine est une étape du cours, pas un cas
 * particulier ; en revanche « toutes les racines rejetées » (S = ∅) déséquilibre deux séries. */
export function profilEquationRationnelle(e: ExerciceEquationRationnelle): ProfilInstance {
  const racines = e.equationIsolee?.solution?.racines ?? [];
  const ce: number[] = e.ce ?? [];
  const toutesRejetees = racines.length > 0 && racines.every((x) => ce.some((c) => Math.abs(c - x) < 1e-9));
  return { casParticulier: toutesRejetees ? "aucune-solution" : null };
}

export const LIBELLE_CAS_RELATIONS_RACINES = "Inclure un cas particulier (a = ±1, racine nulle ou racines opposées)";

/** gen67 — relations de Viète. a = ±1 : S et P se lisent sans division et « l'équation de
 * coefficient a = 1 » est (au signe près) celle de l'énoncé ; racine nulle (c = 0, P = 0) et racines
 * opposées (b = 0, S = 0) : équation incomplète. Une racine double reste un cas complet. */
export function profilRelationsRacines(e: ExerciceRelationsRacines): ProfilInstance {
  const [x1, x2] = e.racines;
  return {
    casParticulier: cas([Math.abs(e.enonce.a) === 1 && "coefficient-a-1", (x1 === 0 || x2 === 0) && "racine-nulle", x1 !== 0 && x1 === -x2 && "racines-opposees"]),
  };
}

// ---------------------------------------------------------------------------------------------
// Chapitre 3
// ---------------------------------------------------------------------------------------------

/** Transformations que le professeur choisit d'inclure (cases du panneau, cochées par défaut) ; une
 * case décochée impose cette transformation ABSENTE dans toutes les questions de la ligne. */
export const PARAMETRES_TRANSFORMATIONS = [
  { id: "sans-translation-horizontale", label: "Translation horizontale" },
  { id: "sans-translation-verticale", label: "Translation verticale" },
  { id: "sans-etirement", label: "Étirement ou compression" },
];

/** gen10 — transformer une fonction de référence. Complet : les deux translations ET au moins un
 * étirement/une compression (le générateur n'en combine souvent qu'un des deux — horizontal et
 * vertical sont interchangeables pour le carré et la valeur absolue, ce n'est pas un raccourci). Une
 * symétrie absente n'est pas un cas particulier. */
export function profilFonctionReference(e: ExerciceFonctionReference): ProfilInstance {
  return {
    casParticulier: cas([e.th === 0 && "sans-translation-horizontale", e.tv === 0 && "sans-translation-verticale", e.ch === e.eh && e.ev === e.cv && "sans-etirement"]),
  };
}

export const PARAMETRES_FORME_CANONIQUE = PARAMETRES_TRANSFORMATIONS.filter((p) => p.id !== "sans-etirement");

/** gen11 — forme canonique : le générateur exclut déjà « aucun étirement horizontal ». Une
 * translation nulle (TH = 0 ou TV = 0) retire une étape de la mise sous forme canonique. */
export function profilFormeCanonique(e: ExerciceFormeCanoniqueFonctionReference): ProfilInstance {
  return { casParticulier: cas([e.th === 0 && "sans-translation-horizontale", e.tv === 0 && "sans-translation-verticale"]) };
}

export const LIBELLE_CAS_LECTURE_GRAPHIQUE = "Inclure un cas particulier (fonction sans zéro)";

/** gen12 — lecture graphique : « aucun zéro » règle la question des zéros en une ligne. Les
 * intervalles sans tracé, le trou, le point redéfini et une ordonnée à l'origine inexistante sont des
 * pièges de lecture du cours, pas des raccourcis. */
export function profilCaracteristiquesFonction(e: ExerciceCaracteristiquesFonction): ProfilInstance {
  return { casParticulier: (e.zeros ?? []).length === 0 ? "aucun-zero" : null };
}

export const LIBELLE_CAS_ETUDE_ALGEBRIQUE = "Inclure un cas particulier (pas de zéro, k = 0 ou argument sans constante)";

const FAMILLES_PAIRES_POSITIVES = ["carre", "valeur_absolue", "racine_carree"];

/** gen13 — étude algébrique de f(x) = [base](ax + b) + k. Raccourcis : k > 0 pour le carré, la
 * valeur absolue ou la racine carrée (« aucun zéro » en une ligne) ; k = 0 (le zéro se lit
 * directement, ax + b = 0) ; b = 0 (argument ax : parité et zéro immédiats). */
export function profilCaracteristiquesAlgebriques(e: ExerciceCaracteristiquesAlgebriquesNiveau1): ProfilInstance {
  if (e.niveau !== "niveau1") return { casParticulier: null };
  return {
    casParticulier: cas([
      FAMILLES_PAIRES_POSITIVES.includes(e.famille) && e.k.num > 0 && "sans-zero",
      e.k.num === 0 && "k-nul",
      e.b === 0 && "argument-sans-constante",
    ]),
  };
}
