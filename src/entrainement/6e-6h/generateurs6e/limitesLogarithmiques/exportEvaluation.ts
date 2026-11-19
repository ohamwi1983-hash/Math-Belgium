import type { CibleLimiteLog, ExerciceLimiteLogarithmique, ExerciceLimiteLogC } from "../../core6e/limitesLogarithmiques.types";
import type { AdaptateurFeuilleExercices, EnoncePapier, BaremeExercice, BlocCorrection, CritereBareme, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_GENERALE, configDiagnosticPartiesC, consigneEcran, formatCategorieLabel, formatCibleTexte, formatLimiteEnonceLatex, formatReformulationBLatex } from "../../ui6e/formatLimitesLogarithmiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLimiteLogarithmique } from "./index";
import { approche, correctionDetailleeLimitesLog as correctionDetaillee } from "./corrigeDetaille";
import { reponseAttendueDLatex } from "../../ui6e/formatLimitesPuissances";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimiteLogarithmique>` pour `6gen17` (Calcul de
 * limites, fonctions logarithmes) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Contrairement à `deriveesCyclometriques` (6gen4, UNE seule question générique par instance),
 * `6gen17` a une consigne écran PAR FAMILLE (et parfois par sous-type, ex. B) qui change de nature
 * à chaque étape (identifier une dominance, poser une substitution, diagnostiquer chaque partie,
 * calculer un exposant puis sa limite, développer puis simplifier...) — voir
 * `moteur6e/typesLimitesLogarithmiques.ts` (`phaseInitiale`/`phaseApres`) : 2 écrans par famille.
 * Chaque écran RÉELLEMENT traversé devient donc une question a)/b) séparée — `regroupable` n'est
 * donc PAS activé ici. Les consignes réutilisent directement `consigneEcran` (ui6e), jamais
 * réécrites en dur ici. Famille D (puissances f^g, 3 écrans) : corrigé détaillé « comme au tableau »
 * partagé avec l'écran (`corrigeDetaille.ts`) ; les familles A–C gardent leur corrigé historique.
 * Le corrigé n'affiche que des formes EXACTES déjà construites par le
 * générateur (`CibleLimiteLog.latex`, `limiteLatex`, `formatReformulationBLatex`) et une valeur
 * approchée à virgule quand elle est utile — jamais un flottant brut à point décimal (audit
 * chapitre 3 de 6e, point 7).
 */

/** Valeur approchée au centième, virgule décimale. */
function formatApproche(valeur: number): string {
  return valeur.toFixed(2).replace(".", "{,}");
}

function construireEnonceLimitesLogarithmiques(exercice: ExerciceLimiteLogarithmique): SectionExercice {
  const entete = [texte(CONSIGNE_GENERALE + " "), latex(formatLimiteEnonceLatex(exercice))];

  switch (exercice.famille) {
    case "A":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("aDominance", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("aConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "B":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("bReformuler", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("bConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "C":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("cDiagnostic", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("cConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "D":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("dForme", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("dExposant", exercice), reponse: { type: "lignes", nombre: 3 } },
          { consigne: consigneEcran("dConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
  }
}

function construireCorrectionLimitesLogarithmiques(exercice: ExerciceLimiteLogarithmique): BlocCorrection[] {
  switch (exercice.famille) {
    case "A":
      return [
        {
          type: "paragraphe",
          fragments: [
            texte("a) Dominance — numérateur : "),
            texte(formatCategorieLabel(exercice.dominanceNumerateur)),
            texte(", dénominateur : "),
            texte(formatCategorieLabel(exercice.dominanceDenominateur)),
            texte("."),
          ],
        },
        {
          type: "paragraphe",
          fragments:
            exercice.limiteGlobale.type === "valeur" && exercice.limiteGlobale.latex !== "1"
              ? [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteGlobale)), texte(" ≈ "), latex(formatApproche(exercice.limiteGlobale.valeur)), texte(".")]
              : [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteGlobale)), texte(".")],
        },
      ];

    case "B":
      return [
        { type: "paragraphe", fragments: [texte("a) En posant u = x/x₀ − 1 (u → 0), f devient : "), latex(formatReformulationBLatex(exercice)), texte(", où apparaît la limite de référence ln(1+u)/u → 1.")] },
        {
          type: "paragraphe",
          fragments:
            exercice.sousType === "produit"
              ? [texte("b) Limite : "), latex(exercice.limiteLatex), texte(" ≈ "), latex(formatApproche(exercice.limiteFinale)), texte(".")]
              : [texte("b) Limite : "), latex(exercice.limiteLatex), texte(".")],
        },
      ];

    case "C": {
      const { partie1, partie2 } = configDiagnosticPartiesC(exercice);
      const [cible1, cible2] = exercice.sousType === "c2" ? [exercice.partieFacteur1, exercice.partieFacteur2] : [exercice.partieNumerateur, exercice.partieDenominateur];
      return [
        {
          type: "paragraphe",
          fragments: [
            texte(`a) ${partie1.label} : `),
            latex(formatCibleTexte(cible1)),
            texte(`. ${partie2.label} : `),
            latex(formatCibleTexte(cible2)),
            texte("."),
          ],
        },
        { type: "paragraphe", fragments: [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteFinale)), texte(".")] },
      ];
    }
    case "D":
      return [
        { type: "paragraphe", fragments: [texte("a) "), latex(reponseAttendueDLatex(exercice, "dForme"))] },
        { type: "paragraphe", fragments: [texte("b) "), latex(reponseAttendueDLatex(exercice, "dExposant"))] },
        { type: "paragraphe", fragments: [texte("c) "), latex(reponseAttendueDLatex(exercice, "dConclure"))] },
      ];
  }
}

// ============================================================================
// Champs de la refonte des feuilles (difficulté, réponse brève, corrigé détaillé, barème) — tout est calculé à partir de l'instance, avec les mêmes formes exactes que le corrigé.
// ============================================================================


/** Limite attendue de l'exercice, quelle que soit sa famille. */
function limiteAttendue(exercice: ExerciceLimiteLogarithmique): CibleLimiteLog {
  if (exercice.famille === "A") return exercice.limiteGlobale;
  if (exercice.famille === "B") return { type: "valeur", valeur: exercice.limiteFinale, latex: exercice.limiteLatex };
  return exercice.limiteFinale;
}

/** Profil de tirage équilibré (même structure dans toutes les séries) : famille D, `forme` = type de
 * forme indéterminée (1^∞, 0^0, ∞^0) — JAMAIS l'issue (valeur finie, 1, +∞, 0), que l'élève doit
 * décider ; familles A–C, `forme` = la famille (sa sous-famille est déjà fixée quand le professeur
 * choisit une variante ; en tirage libre, une question A reste une question A dans les séries B, C…).
 * Aucun cas particulier, pas de `calcul` (valeurs toujours exactes). */
function profilInstance(exercice: ExerciceLimiteLogarithmique): ProfilInstance {
  if (exercice.famille === "D") return { casParticulier: null, forme: `D:${exercice.forme}` };
  return { casParticulier: null, forme: exercice.famille };
}

/** Limite en LaTeX, avec une valeur approchée au centième quand elle n'est pas entière. */
function limiteLatexAvecApproche(cible: CibleLimiteLog): string {
  const exacte = formatCibleTexte(cible);
  if (cible.type === "valeur" && !Number.isInteger(cible.valeur)) return `${exacte} \\approx ${formatApproche(cible.valeur)}`;
  return exacte;
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceLimiteLogarithmique): CriteresDifficulte {
  const [methode, piege]: [0 | 1, 0 | 1] =
    e.famille === "A" ? [e.sousType === "sous1" || e.sousType === "sous2" ? 0 : 1, 0] : e.famille === "C" ? [1, e.sousType === "c3" ? 1 : 0] : e.famille === "D" ? [1, 1] : [1, 0];
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode, piege };
}

function reponseBreve(exercice: ExerciceLimiteLogarithmique): FragmentConsigne[] {
  // Famille D : e^L écrit exactement, valeur approchée à 4 chiffres significatifs (e^{−6} ≈ 0,002479).
  if (exercice.famille === "D") {
    const f = exercice.limiteFinale;
    return [latex(`\\text{limite} = ${formatCibleTexte(f)}${f.type === "valeur" && f.valeur !== 1 ? ` \\approx ${approche(f.valeur)}` : ""}`)];
  }
  return [latex(`\\text{limite} = ${limiteLatexAvecApproche(limiteAttendue(exercice))}`)];
}

/** Les deux parties évaluées séparément (numérateur/dénominateur, ou les deux facteurs). */
function partiesC(exercice: ExerciceLimiteLogC): { label1: string; label2: string; cible1: CibleLimiteLog; cible2: CibleLimiteLog; signe2: string } {
  if (exercice.sousType === "c2") {
    return { label1: "Facteur x", label2: "Second facteur", cible1: exercice.partieFacteur1, cible2: exercice.partieFacteur2, signe2: "1" };
  }
  const signe2 = exercice.sousType === "c1" ? (exercice.direction === "droite" ? "0^+" : "0^-") : "0^+";
  return { label1: "Numérateur", label2: "Dénominateur", cible1: exercice.partieNumerateur, cible2: exercice.partieDenominateur, signe2 };
}

function bareme(exercice: ExerciceLimiteLogarithmique): BaremeExercice {
  const limite = limiteAttendue(exercice);
  const finale = [latex(formatCibleTexte(limite))];
  let criteres: CritereBareme[];
  let erreursFrequentes: BaremeExercice["erreursFrequentes"];
  if (exercice.famille === "A") {
    criteres = [
      { sousQuestion: "a", critere: [texte(`Terme dominant du numérateur : ${formatCategorieLabel(exercice.dominanceNumerateur).toLowerCase()}`)], points: 1 },
      { sousQuestion: "a", critere: [texte(`Terme dominant du dénominateur : ${formatCategorieLabel(exercice.dominanceDenominateur).toLowerCase()}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Mise en évidence des termes dominants, raisonnement justifié")], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite : "), latex(formatCibleTexte(limite))], points: 1 },
    ];
    erreursFrequentes = [
      { description: [texte("Conclure « forme indéterminée » sans comparer les termes dominants")], cout: "0 pt en b)" },
      exercice.sousType === "sous3"
        ? { description: [texte("Oublier le facteur ln(" + exercice.base + ") du changement de base")], cout: "−1" }
        : { description: [texte("Inverser la hiérarchie (logarithme plus rapide que le polynôme)")], cout: "−2" },
    ];
  } else if (exercice.famille === "B") {
    criteres = [
      { sousQuestion: "a", critere: [texte("Substitution "), latex("u = x/x_0 - 1"), texte(" posée, "), latex("u \\to 0")], points: 1 },
      { sousQuestion: "a", critere: [texte("Réécriture : "), latex(formatReformulationBLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite de référence "), latex("\\ln(1+u)/u \\to 1"), texte(" invoquée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite : "), latex(exercice.limiteLatex)], points: 1 },
    ];
    erreursFrequentes = [
      { description: [texte("Remplacer directement x par " + exercice.x0 + ", obtenir 0/0 et s'arrêter")], cout: "0 pt en a)" },
      { description: [texte("Oublier le coefficient de u en appliquant la limite de référence")], cout: "−1" },
    ];
  } else if (exercice.famille === "D") {
    criteres = [
      { sousQuestion: "a", critere: [texte("Limites de la base et de l'exposant, forme indéterminée "), latex(reponseAttendueDLatex(exercice, "dForme").split("\\text{forme } ")[1])], points: 1 },
      { sousQuestion: "b", critere: [texte("Réécriture "), latex("f(x)^{g(x)}=e^{g(x)\\ln f(x)}"), texte(" et transformation du produit")], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite de l'exposant : "), latex(formatCibleTexte(exercice.limiteProduit))], points: 1 },
      { sousQuestion: "c", critere: [texte("Limite : "), latex(formatCibleTexte(exercice.limiteFinale))], points: 1 },
    ];
    erreursFrequentes = [
      { description: [texte("Conclure sans calcul que "), latex(exercice.forme === "un_infini" ? "1^{\\infty}=1" : exercice.forme === "zero_zero" ? "0^{0}=1" : "(+\\infty)^{0}=1")], cout: "0 pt en b) et c)" },
      { description: [texte("Donner la limite de l'exposant au lieu de son exponentielle")], cout: "−1" },
    ];
  } else {
    const { label1, label2, cible1, signe2 } = partiesC(exercice);
    criteres = [
      { sousQuestion: "a", critere: [texte(`${label1} → `), latex(formatCibleTexte(cible1))], points: 1 },
      { sousQuestion: "a", critere: [texte(`${label2} → `), latex(signe2)], points: 1 },
      { sousQuestion: "b", critere: [texte(exercice.sousType === "c2" ? "Produit d'un infini par une constante positive" : "Règle des signes du quotient")], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite : "), latex(formatCibleTexte(exercice.limiteFinale))], points: 1 },
    ];
    erreursFrequentes = [
      exercice.sousType === "c3"
        ? { description: [texte("Traiter l'expression comme une forme 0/0 (le numérateur ne s'annule pas)")], cout: "0 pt en a) pour le numérateur" }
        : { description: [texte("Conclure « forme indéterminée » sans évaluer chaque partie")], cout: "0 pt en a)" },
      ...(exercice.sousType === "c2" ? [] : [{ description: [texte("Oublier le signe du 0 au dénominateur (+∞ au lieu de −∞ ou l'inverse)")], cout: "−1" }]),
    ];
  }
  const reponsesAcceptees: FragmentConsigne[][] = [];
  if (limite.type === "valeur" && !Number.isInteger(limite.valeur)) reponsesAcceptees.push([texte("Valeur approchée "), latex(exercice.famille === "D" ? approche(limite.valeur) : formatApproche(limite.valeur)), texte(" si la forme exacte est aussi donnée dans la démarche")]);
  if (exercice.famille === "D" && exercice.limiteProduit.type === "valeur") reponsesAcceptees.push([texte("Limite de l'exposant non simplifiée (même valeur), à condition que la conclusion soit "), latex(formatCibleTexte(exercice.limiteFinale))]);
  if (exercice.famille === "A" && exercice.sousType === "sous3") reponsesAcceptees.push([latex(`\\dfrac{${exercice.p1}\\ln(${exercice.base})}{${exercice.p2}}`), texte(" non simplifiée")]);
  return { reponseFinale: finale, criteres, erreursFrequentes, ...(reponsesAcceptees.length > 0 ? { reponsesAcceptees } : {}) };
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapier(exercice: ExerciceLimiteLogarithmique): EnoncePapier {
  return { section: { ...construireEnonceLimitesLogarithmiques(exercice), questions: [] } };
}

export const adaptateurEvaluationLimitesLogarithmiques: AdaptateurFeuilleExercices<ExerciceLimiteLogarithmique> = {
  titreDocument: "Calcul de limites (fonctions logarithmes) — Évaluation",
  nomFichierBase: "limites-logarithmiques",
  genererInstance: genererExerciceLimiteLogarithmique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceLimitesLogarithmiques,
  construireCorrection: construireCorrectionLimitesLogarithmiques,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier: enoncePapier,
  profilInstance,
};
