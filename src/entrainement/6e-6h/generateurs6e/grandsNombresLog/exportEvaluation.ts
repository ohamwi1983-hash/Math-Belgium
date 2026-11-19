import { DUREES, basesCommunes, donneesTaille, ecritureScientifique, logPuissance, logsDuree } from "../../core6e/grandsNombresLog";
import type { ExerciceGrandsNombres } from "../../core6e/grandsNombresLog";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesGrandsNombresLog";
import type { PhaseGrandsNombres } from "../../moteur6e/typesGrandsNombresLog";
import { consigneEcran, consigneGenerale, logPuissanceLatex, nbTexte, puissanceLatex, reponseFragments, scientifiqueLatex } from "../../ui6e/formatGrandsNombresLog";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGrandsNombres } from "./index";
import type { IdVarianteGrandsNombres } from "./index";
import { VARIANTES_CALCULATRICE_GRANDS_NOMBRES, profilGrandsNombres } from "./profilEvaluation";
import { correctionDetailleeGrandsNombres } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGrandsNombres>` de `6gen92` « Grands nombres et
 * logarithme décimal » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : le contexte (consigne générale de l'écran) et la demande globale. Seule
 *   l'écriture scientifique garde deux VRAIES questions (a) écriture scientifique, b) premier
 *   chiffre et nombre de chiffres) ; les autres variantes ont une seule demande.
 * - Corrigé : une étape par écran (lettres a, b, c dans l'ordre des écrans), valeurs tirées des
 *   MÊMES fonctions que l'écran (`reponseFragments`, `logPuissanceLatex`), une ligne « Piège » ciblée.
 * - Aucune figure. Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefgh";

// ============================================================================
// Énoncés.
// ============================================================================

function demandeGlobale(e: ExerciceGrandsNombres): FragmentConsigne[] {
  switch (e.variante) {
    case "chiffres":
      return e.mersenne ? [] : [t(" Détermine le nombre de chiffres de "), f(puissanceLatex(e.a, e.n)), t(".")];
    case "premier-chiffre":
      return [];
    case "comparer":
      return e.sousCas === "exact" ? [t(" Justifie.")] : [t(" Justifie à l'aide du logarithme décimal (logarithmes arrondis au millième).")];
    case "temps":
      return e.sousCas === "duree"
        ? [t(" Donne la durée en secondes, puis en années, sous la forme "), f("m\\times 10^{E}"), t(" (mantisse "), f("m"), t(" arrondie au centième).")]
        : [t(" Justifie par le calcul.")];
  }
}

function entetePapier(e: ExerciceGrandsNombres): FragmentConsigne[] {
  if (e.variante === "premier-chiffre") {
    return [t("Le nombre "), f(puissanceLatex(e.a, e.n)), t(" est trop grand pour ta calculatrice. On note "), f("\\log"), t(" le logarithme décimal, de base 10 ("), f("\\log(10^k)=k"), t(").")];
  }
  return [...consigneGenerale(e), ...demandeGlobale(e)];
}

/** Titres des étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): FragmentConsigne[] {
  if (phase === "verdict") return [t("Conclus en justifiant.")];
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExerciceGrandsNombres): SectionExercice {
  return { enteteFragments: [...consigneGenerale(e), ...demandeGlobale(e)], questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceGrandsNombres): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

function reponseBreve(e: ExerciceGrandsNombres): FragmentConsigne[] {
  switch (e.variante) {
    case "chiffres": {
      const k = ecritureScientifique(logPuissance(e.a, e.n)).E + 1;
      const nom = e.mersenne ? `${puissanceLatex(2, e.n)}-1` : puissanceLatex(e.a, e.n);
      return [f(nom), t(` compte ${nbTexte(k, 0)} chiffres.`)];
    }
    case "premier-chiffre": {
      const L = logPuissance(e.a, e.n);
      const s = ecritureScientifique(L);
      return [t("a) "), f(`${puissanceLatex(e.a, e.n)}\\approx ${scientifiqueLatex(L)}`), t(` ; b) premier chiffre ${Math.floor(s.m)}, ${nbTexte(s.E + 1, 0)} chiffres.`)];
    }
    case "comparer":
      return [...reponseFragments(e, "verdict").slice(-2)];
    case "temps":
      if (e.sousCas === "duree") {
        const L = logsDuree(e);
        return [f(`T\\approx ${scientifiqueLatex(L.secondes)}`), t(" secondes, soit environ "), f(scientifiqueLatex(L.annees)), t(" années.")];
      }
      return [t(`Plus grande taille traitable en ${DUREES[e.duree].libelle} : `), f(`n=${donneesTaille(e).nMax}`), t(".")];
  }
}

function enoncePapier(e: ExerciceGrandsNombres): EnoncePapier {
  if (e.variante === "premier-chiffre") {
    const P = puissanceLatex(e.a, e.n);
    return {
      section: {
        enteteFragments: entetePapier(e),
        questions: [
          { consigne: [t("Donne l'écriture scientifique "), f(`${P}\\approx m\\times 10^{E}`), t(" (avec "), f("1\\leq m<10"), t(", mantisse arrondie au centième, "), f("E"), t(" entier).")] },
          { consigne: [t("Déduis-en le premier chiffre de "), f(P), t(" et le nombre de chiffres de son écriture.")] },
        ],
      },
      etapesParQuestion: [["a", "b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

const correctionDetaillee = correctionDetailleeGrandsNombres;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceGrandsNombres): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: 1 };
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

const ERREUR_LN = { description: [t("Logarithme népérien utilisé à la place du logarithme décimal")], cout: "−0,5" };
const ERREUR_ARRONDI = { description: [t("log(a) arrondi avant d'être multiplié par n (résultat faux)")], cout: "−0,5" };

function bareme(e: ExerciceGrandsNombres): BaremeExercice {
  const r = (phase: PhaseGrandsNombres) => reponseFragments(e, phase);
  switch (e.variante) {
    case "chiffres":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Propriété de la puissance : "), ...r("logPuissance")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Encadrement entre deux entiers consécutifs : "), ...r("partieEntiere")], points: 1 },
          { sousQuestion: "c", critere: [t("Nombre de chiffres justifié : "), ...r("nombreChiffres")], points: 1.5 },
        ],
        erreursFrequentes: [{ description: [t("« + 1 » oublié (partie entière donnée comme nombre de chiffres)")], cout: "−1" }, ERREUR_LN, ERREUR_ARRONDI],
        reponsesAcceptees: [[t("Logarithme exact (par exemple n·log(a)) ou arrondi au millième")]],
      };
    case "premier-chiffre":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: r("logPuissance"), points: 1 },
          { sousQuestion: "b", critere: [t("Partie entière et partie décimale séparées, mantisse "), f("10^{f}"), t(" : "), ...r("scientifique")], points: 1.5 },
          { sousQuestion: "c", critere: r("premierChiffre"), points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Partie décimale f prise pour la mantisse (au lieu de "), f("10^{f}"), t(")")], cout: "−1" },
          { description: [t("Nombre de chiffres égal à E (« + 1 » oublié)")], cout: "−0,5" },
          ERREUR_ARRONDI,
        ],
        reponsesAcceptees: [[t("Mantisse à 0,02 près (arrondis intermédiaires au millième)")]],
      };
    case "comparer":
      if (e.sousCas === "exact") {
        const [A, B] = basesCommunes(e);
        return {
          reponseFinale: reponseBreve(e),
          criteres: [
            { sousQuestion: "a", critere: [t("Exposant commun repéré, bases "), f(`${A}`), t(" et "), f(`${B}`), t(" : "), ...r("memeExposant")], points: 2 },
            { sousQuestion: "b", critere: [t("Conclusion justifiée (même exposant, bases comparées) : "), ...r("verdict").slice(-2)], points: 2 },
          ],
          erreursFrequentes: [
            { description: [t("Conclusion tirée des exposants seuls ou des bases seules")], cout: "0 pt sur la conclusion" },
            { description: [t("Erreur sur une puissance de puissance (exposants additionnés au lieu d'être multipliés)")], cout: "−1" },
          ],
          reponsesAcceptees: [[t("Comparaison par les logarithmes sans calculatrice (") , f("\\log(A)"), t(" et "), f("\\log(B)"), t(")")]],
        };
      }
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [f(logPuissanceLatex(e.a, e.n))], points: 1 },
          { sousQuestion: "a", critere: [f(logPuissanceLatex(e.b, e.m))], points: 1 },
          { sousQuestion: "b", critere: [t("Conclusion justifiée par la croissance de log : "), ...r("verdict").slice(-2)], points: 2 },
        ],
        erreursFrequentes: [ERREUR_ARRONDI, ERREUR_LN, { description: [t("Conclusion sans invoquer la croissance de log")], cout: "−0,5" }],
        reponsesAcceptees: [[t("Logarithmes exacts ou arrondis au millième ; comparaison de "), f("\\ln"), t(" également correcte si elle est cohérente")]],
      };
    case "temps":
      if (e.sousCas === "duree") {
        return {
          reponseFinale: reponseBreve(e),
          criteres: [
            { sousQuestion: "a", critere: r("logOperations"), points: 1 },
            { sousQuestion: "b", critere: [t("Durée en secondes : "), ...r("dureeSecondes")], points: 1.5 },
            { sousQuestion: "c", critere: [t("Conversion en années : "), ...r("dureeAnnees")], points: 1.5 },
          ],
          erreursFrequentes: [
            { description: [t("Multiplication par le nombre d'opérations par seconde au lieu d'une division")], cout: "−1" },
            { description: [t("Conversion incomplète (heures ou jours au lieu d'années)")], cout: "−0,5" },
            { description: [t("Mantisse hors de [1 ; 10[ ou exposant faux")], cout: "−0,5" },
          ],
          reponsesAcceptees: [[t("Mantisses à quelques centièmes près (arrondis intermédiaires)")]],
        };
      }
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Nombre d'opérations disponibles : "), ...r("operations")], points: 1 },
          { sousQuestion: "b", critere: [t("Inéquation résolue avec log : "), ...r("borne")], points: 2 },
          { sousQuestion: "c", critere: r("plusGrandN"), points: 1 },
        ],
        erreursFrequentes: [
          { description: [t("Borne arrondie vers le haut (n trop grand)")], cout: "−0,5" },
          { description: [t("Durée non convertie en secondes")], cout: "−1" },
          { description: [t("Division par log(2) oubliée (log(N) pris pour n)")], cout: "−1" },
        ],
        reponsesAcceptees: [[t("Logarithme népérien des deux côtés : même borne")]],
      };
  }
}

export const adaptateurEvaluationGrandsNombres: AdaptateurFeuilleExercices<ExerciceGrandsNombres> = {
  titreDocument: "Grands nombres et logarithme décimal — Évaluation",
  nomFichierBase: "grands-nombres-logarithme",
  genererInstance: genererExerciceGrandsNombres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteGrandsNombres),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilGrandsNombres,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_GRANDS_NOMBRES,
};
