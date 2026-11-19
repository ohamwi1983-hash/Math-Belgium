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
 * irrationnelle, l'absence de symétrie dans une transformation. gen3, gen5, gen6 et gen57 n'ont
 * aucun raccourci (5 000 tirages par variante) : leur profil ne porte que la `forme` (signature de
 * difficulté, lot E de l'audit 4e ch. 2) ; la calculatrice de gen57 (familles A) passe par
 * `calculatriceIndispensable`.
 *
 * Plusieurs caractéristiques à la fois → identifiants joints par « + » (jamais tirés pour la case).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { Exercice } from "../core/generateur.types";
import type { ExerciceInequation } from "../core/inequation.types";
import type { ExerciceEquationRationnelle } from "../core/equationRationnelle.types";
import type { ExerciceRelationsRacines } from "../core/relationsRacines.types";
import type { ExerciceSimplification } from "../core/simplification.types";
import type { ExerciceSignesProduit } from "../core/signesProduit.types";
import type { ExerciceInequationRationnelle } from "../core/inequationRationnelle.types";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ExerciceFonctionReference } from "../core/fonctionsReference.types";
import type { ExerciceFormeCanoniqueFonctionReference } from "../core/formeCanoniqueFonctionsReference.types";
import type { ExerciceCaracteristiquesFonction } from "../core/caracteristiquesFonction.types";
import type { ExerciceCaracteristiquesAlgebriques } from "../core/caracteristiquesAlgebriques.types";

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
  const meg = e.categorie === "mise_en_evidence_generalisee";
  // « Aucune solution » (décision 2) : un VERDICT, jamais un cas particulier ; pas de racine du tout,
  // donc la case « racines irrationnelles » est sans objet, comme pour la mise en évidence généralisée.
  const sansRacine = Number.isNaN(e.solution.racines[0]);
  const marqueurs = [meg && (e.enonce.b === 0 || e.enonce.c === 0) && "equation-incomplete", !meg && !sansRacine && e.solution.racinesExactes && "racines-rationnelles"].filter(Boolean);
  return {
    casParticulier: marqueurs.length ? marqueurs.join("+") : null,
    parametresNonApplicables: meg || sansRacine ? ["racines-rationnelles"] : undefined,
  };
}

/** Case du panneau (cochée par défaut) : cochée = racines irrationnelles (radical à simplifier),
 * décochée = racines entières ou rationnelles — pour toutes les questions de la ligne et toutes les
 * séries (≈ 50 % de chaque dans les quatre premières variantes). */
export const PARAMETRES_SECOND_DEGRE = [{ id: "racines-rationnelles", label: "Racines irrationnelles (radical à simplifier)" }];

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

export const LIBELLE_CAS_RELATIONS_RACINES = "Inclure un cas particulier (racines opposées : S = 0)";

/** gen67 — relations de Viète. Depuis le lot C (audit 4e ch. 2 G15), a = ±1, la racine double et la
 * racine nulle sont des VARIANTES choisies dans le panneau (lignes distinctes) : elles ne sont plus
 * des cas particuliers, sans quoi la variante « racines distinctes (a = ±1) » n'aurait jamais de cas
 * complet. Reste le cas particulier des racines opposées (b = 0, S = 0 : équation incomplète). */
export function profilRelationsRacines(e: ExerciceRelationsRacines): ProfilInstance {
  const [x1, x2] = e.racines;
  return {
    casParticulier: cas([x1 !== 0 && x1 === -x2 && "racines-opposees"]),
  };
}

// ---------------------------------------------------------------------------------------------
// Chapitre 2 — profils de FORME (lot E de l'audit 4e ch. 2)
// ---------------------------------------------------------------------------------------------
//
// gen3, gen5, gen6 et gen57 n'ont aucun raccourci (pas de case « cas particulier ») mais leur
// difficulté varie d'un tirage à l'autre : `forme` est leur SIGNATURE DE DIFFICULTÉ, reproduite par
// les séries B, C… (même nombre de discriminants à calculer, même type d'inégalité), jamais un
// verdict (la méthode rapide précise, le nombre de racines, une racine à rejeter ne sont pas dans la
// forme). Fréquences mesurées sur 5 000 tirages par variante : la plus rare de chaque variante est
// donnée au-dessus de chaque profil (la recherche de graine fait 20 000 essais en 200 ms).

type AvecCategorie = { categorie: string };
const estPolynome2 = (p: unknown): p is AvecCategorie => typeof p === "object" && p !== null && "categorie" in p;
const nombreDelta = (polynomes: unknown[]): number => polynomes.filter((p) => estPolynome2(p) && p.categorie === "cas_general").length;

/** gen3 — simplifier une fraction rationnelle : nombre de trinômes à factoriser par Δ (0, 1 ou 2). */
export function profilSimplification(e: ExerciceSimplification): ProfilInstance {
  return { casParticulier: null, forme: `delta-${nombreDelta([e.numerateur, e.denominateur])}` };
}

/** gen5 — signe d'un produit : nombre de facteurs du second degré à factoriser par Δ, et présence
 * d'un facteur du premier degré à coefficient négatif (visible dans l'énoncé). */
export function profilSignesProduit(e: ExerciceSignesProduit): ProfilInstance {
  const delta = nombreDelta(e.facteurs.map((f) => (f.type === "quadratique_factorisable" ? f.exercice : null)));
  const negatif = e.facteurs.some((f) => f.type === "lineaire" && f.polynome.k < 0);
  return { casParticulier: null, forme: `delta-${delta}${negatif ? "|neg" : ""}` };
}

/** gen6 — inéquation rationnelle : nombre de trinômes à factoriser par Δ et inégalité large ou
 * stricte (la valeur interdite reste exclue malgré « ≤ »). */
export function profilInequationRationnelle(e: ExerciceInequationRationnelle): ProfilInstance {
  const polynomes: unknown[] =
    e.niveau === "facteurCommun" ? [e.fraction.numerateur, e.fraction.denominateur] : e.niveau === "sansFacteurCommun" ? [e.numerateur, e.denominateur] : "numerateur" in e ? [e.numerateur] : [];
  const large = e.symbole === "≤" || e.symbole === "≥";
  return { casParticulier: null, forme: `delta-${nombreDelta(polynomes)}|${large ? "large" : "strict"}` };
}

/** gen57 — problème du second degré en contexte : pour une inéquation, ensemble cherché entre les
 * racines ou à l'extérieur, et symbole large ou strict (lus dans l'énoncé) ; la racine rejetée par
 * le domaine est un verdict, jamais dans la forme. Familles A : calculatrice (`calculatriceIndispensable`). */
export function profilEquationInequationSecondDegre(e: ExerciceEquationInequationSecondDegre): ProfilInstance {
  return {
    casParticulier: null,
    forme: e.variante === "equation" ? "equation" : `${e.entreRacines ? "entre" : "exterieur"}|${e.large ? "large" : "strict"}`,
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
 * directement, ax + b = 0) ; b = 0 (argument ax : parité et zéro immédiats). Niveau 2 (k(x) = cx + d,
 * proposé dans les feuilles depuis le catalogue famille × niveau) : aucun raccourci mesuré — « aucun
 * zéro » s'y obtient par le calcul de Δ ou par la validation (un verdict, jamais filtré). */
export function profilCaracteristiquesAlgebriques(e: ExerciceCaracteristiquesAlgebriques): ProfilInstance {
  if (e.niveau !== "niveau1") return { casParticulier: null };
  return {
    casParticulier: cas([
      FAMILLES_PAIRES_POSITIVES.includes(e.famille) && e.k.num > 0 && "sans-zero",
      e.k.num === 0 && "k-nul",
      e.b === 0 && "argument-sans-constante",
    ]),
  };
}
