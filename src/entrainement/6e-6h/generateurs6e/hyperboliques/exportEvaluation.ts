import type { ExerciceHyperboliques } from "../../core6e/hyperboliques.types";
import type {
  AdaptateurFeuilleExercices, EnoncePapier,
  BaremeExercice,
  BlocCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phaseApres, phaseInitiale, type PhaseHyperboliques } from "../../moteur6e/typesHyperboliques";
import { pariteAttendueA } from "../../moteur6e/verificationHyperboliques";
import {
  CONSIGNE_GENERALE,
  blocDonnees,
  consigneEcran,
  formatDeriveeC,
  formatDeriveeSecondeC,
  formatFormeExponentielleD,
  reponseAttendueLatex,
} from "../../ui6e/formatHyperboliques";
import { correctionDetailleeHyperboliques } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHyperboliques, type VarianteId } from "./index";
import { profilHyperboliques, LIBELLE_CAS_HYPERBOLIQUES } from "../profilsEvaluationLogarithmes";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceHyperboliques>` pour `6gen19` (Sinus et cosinus
 * hyperboliques, sh/ch) — feuille d'évaluation.
 *
 * 4 familles STRUCTURELLEMENT DISJOINTES (1 ou 2 écrans chacune, voir `moteur6e/
 * typesHyperboliques.ts`) — condensées ici en autant de questions écrites qu'il y a d'écrans
 * RÉELLEMENT traversés par la famille tirée (`phasesPourExercice`, dérivé des mêmes
 * `phaseInitiale`/`phaseApres` que le moteur de session). Consignes reprises telles quelles depuis
 * `consigneEcran` (texte affiché à l'écran). Famille A ajoute « Justifie en calculant f(−x). » :
 * une feuille papier sans exigence de justification ne testerait rien.
 *
 * Le corrigé réutilise `reponseAttendueLatex` — exactement la réponse révélée à l'écran (valeurs
 * EXACTES, jamais un arrondi), jamais une formule dupliquée ici.
 */

const LETTRES = "abcd";

const NOMBRE_LIGNES_PAR_PHASE: Record<PhaseHyperboliques, number> = {
  aParite: 3,
  bValeurs: 3,
  cDerivee: 3,
  cDeriveeSeconde: 3,
  dReecriture: 3,
  dLimites: 3,
};

function phasesPourExercice(exercice: ExerciceHyperboliques): PhaseHyperboliques[] {
  const phases: PhaseHyperboliques[] = [];
  let phase: PhaseHyperboliques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

function construireEnonceHyperboliques(exercice: ExerciceHyperboliques): SectionExercice {
  const phases = phasesPourExercice(exercice);
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [...CONSIGNE_GENERALE, texte(" On donne "), latex(donnees.join(",\\quad ")), texte(".")],
    questions: phases.map((phase) => {
      const suffixe = phase === "aParite" ? " Justifie en calculant f(−x)." : "";
      return {
        consigne: suffixe ? [...consigneEcran(exercice, phase), texte(suffixe)] : consigneEcran(exercice, phase),
        reponse: { type: "lignes", nombre: NOMBRE_LIGNES_PAR_PHASE[phase] },
      };
    }),
  };
}

function construireCorrectionHyperboliques(exercice: ExerciceHyperboliques): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${LETTRES[i]}) `), latex(reponseAttendueLatex(exercice, phase))],
  }));
}

// ============================================================================
// Feuille d'exercices / évaluation enrichies — difficulté, réponse brève, corrigé détaillé, barème,
// Toutes les valeurs viennent de l'instance (mêmes fonctions que l'appli).
// ============================================================================

const PHRASE_PARITE = { paire: "f est paire.", impaire: "f est impaire.", aucune: "f n'est ni paire ni impaire." } as const;




/** Parité dont la réponse attendue contredit le réflexe (variantes « piège ») — sh², x·sh, sh + c. */
const PIEGES_PARITE = new Set(["shCarre", "xSh", "shPlusConstante"]);

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceHyperboliques): CriteresDifficulte {
  const [methode, piege]: [0 | 1, 0 | 1] =
    e.famille === "A" ? [0, PIEGES_PARITE.has(e.type) ? 1 : 0] : e.famille === "B" ? [0, e.sousType === "trouverCh" ? 0 : 1] : e.famille === "D" ? [1, 0] : [0, 0];
  return { ...etapesDuCorrige(correctionDetailleeHyperboliques(e)), methode, piege };
}

function reponseBreveHyperboliques(exercice: ExerciceHyperboliques): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return [texte(PHRASE_PARITE[pariteAttendueA(exercice)])];
    case "B":
      return [latex(reponseAttendueLatex(exercice, "bValeurs"))];
    case "C":
      return [texte("a) "), latex(`f'(x) = ${formatDeriveeC(exercice)}`), texte(" ; b) "), latex(`f''(x) = ${formatDeriveeSecondeC(exercice)}`)];
    case "D":
      return [texte("a) "), latex(`f(x) = ${formatFormeExponentielleD(exercice)}`), texte(" ; b) "), latex(reponseAttendueLatex(exercice, "dLimites"))];
  }
}

function baremeHyperboliques(exercice: ExerciceHyperboliques): BaremeExercice {
  switch (exercice.famille) {
    case "A": {
      const parite = pariteAttendueA(exercice);
      return {
        reponseFinale: [texte(PHRASE_PARITE[parite])],
        criteres: [
          { critere: [texte("Écrit f(−x) en remplaçant x par −x")], points: 1 },
          { critere: [texte("Utilise sh(−x) = −sh(x) et ch(−x) = ch(x)")], points: 1 },
          { critere: [texte("Compare le résultat à f(x) et à −f(x)")], points: 1 },
          { critere: [texte("Conclut correctement sur la parité")], points: 1 },
        ],
        erreursFrequentes: [
          exercice.type === "shCarre" || exercice.type === "xSh"
            ? { description: [texte("Conclure « impaire » parce que sh est impaire, sans calculer f(−x)")], cout: "0 pt sur la conclusion" }
            : exercice.type === "shPlusConstante"
              ? { description: [texte("Oublier que la constante ne change pas de signe : conclure « impaire »")], cout: "0 pt sur la conclusion" }
              : { description: [texte("Conclure sans avoir calculé f(−x)")], cout: "−2" },
        ],
      };
    }
    case "B":
      return {
        reponseFinale: [latex(reponseAttendueLatex(exercice, "bValeurs"))],
        criteres: [
          { critere: [texte("Utilise l'identité ch²(x) − sh²(x) = 1")], points: 1 },
          { critere: [texte("Calcule le carré de l'inconnue")], points: 1 },
          { critere: [texte("Prend la racine et simplifie la valeur exacte")], points: 1 },
          { critere: [texte(exercice.sousType === "trouverCh" ? "Justifie le signe (ch ≥ 1)" : exercice.signeX0 === null ? "Donne les deux valeurs (signe de x₀ inconnu)" : "Choisit le bon signe grâce au signe de x₀")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Utiliser ch² + sh² = 1 (confusion avec cos² + sin² = 1)")], cout: "−2" },
          ...(exercice.sousType === "trouverSh" && exercice.signeX0 === null ? [{ description: [texte("Ne donner que la valeur positive")], cout: "−1" }] : []),
          { description: [texte("Donner une valeur approchée au lieu de la valeur exacte")], cout: "−1" },
        ],
      };
    case "C":
      return {
        reponseFinale: [latex(`f'(x) = ${formatDeriveeC(exercice)}`), texte(" ; "), latex(`f''(x) = ${formatDeriveeSecondeC(exercice)}`)],
        criteres: [
          { sousQuestion: "a", critere: [texte("sh' = ch et ch' = sh (sans changement de signe)")], points: 1 },
          { sousQuestion: "a", critere: [texte("Facteur k de l'argument appliqué")], points: 1 },
          { sousQuestion: "b", critere: [texte("Dérive f'(x) avec la même règle")], points: 1 },
          { sousQuestion: "b", critere: [texte("f''(x) correcte")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Écrire ch' = −sh (confusion avec cos' = −sin)")], cout: "−1" },
          ...(exercice.k !== 1 ? [{ description: [texte("Oublier le facteur k à chaque dérivation")], cout: "−1" }] : []),
        ],
      };
    case "D":
      return {
        reponseFinale: [latex(`f(x) = ${formatFormeExponentielleD(exercice)}`), texte(" ; "), latex(reponseAttendueLatex(exercice, "dLimites"))],
        criteres: [
          { sousQuestion: "a", critere: [texte("Remplace sh et ch par leur définition")], points: 1 },
          { sousQuestion: "a", critere: [texte("Regroupe correctement les termes en eˣ et en e⁻ˣ")], points: 1 },
          { sousQuestion: "b", critere: [texte("Identifie le terme dominant à chaque infini")], points: 1 },
          { sousQuestion: "b", critere: [texte("Conclut le signe des deux limites")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Erreur de signe dans la définition de sh (e⁻ˣ − eˣ)")], cout: "−1" },
          { description: [texte("Conclure à une limite finie ou nulle")], cout: "0 pt sur la limite concernée" },
        ],
        reponsesAcceptees: [[texte("Forme non regroupée correcte : "), latex(`\\dfrac{${exercice.a}(e^x-e^{-x})+${exercice.b}(e^x+e^{-x})}{2}`), texte(" en a) si le regroupement est fait ensuite en b)")]],
      };
  }
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapierHyperboliques(exercice: ExerciceHyperboliques): EnoncePapier {
  const { enteteFragments, questions } = construireEnonceHyperboliques(exercice);
  const lettres = questions.map((_, i) => "abcdefghijklmnopqrstuvwxyz"[i]);
  switch (exercice.famille) {
    case "A":
    case "B":
      // Une seule question : elle EST la consigne globale.
      return { section: { enteteFragments, questions }, etapesParQuestion: [lettres] };
    case "C":
      return {
        section: { enteteFragments, questions: [{ consigne: [texte("Calcule f'(x) et f''(x).")] }] },
        etapesParQuestion: [lettres],
        reponseBreve: [latex(`f'(x) = ${formatDeriveeC(exercice)}`), texte(" ; "), latex(`f''(x) = ${formatDeriveeSecondeC(exercice)}`)],
      };
    case "D":
      return {
        section: { enteteFragments, questions: [{ consigne: [texte("Détermine les limites de f en "), latex("-\\infty"), texte(" et en "), latex("+\\infty"), texte(".")] }] },
        etapesParQuestion: [lettres],
        reponseBreve: [latex(reponseAttendueLatex(exercice, "dLimites"))],
      };
  }
}

export const adaptateurEvaluationHyperboliques: AdaptateurFeuilleExercices<ExerciceHyperboliques> = {
  profilInstance: profilHyperboliques,
  libelleCasParticulier: LIBELLE_CAS_HYPERBOLIQUES,
  titreDocument: "Sinus et cosinus hyperboliques (sh, ch) — Évaluation",
  nomFichierBase: "hyperboliques",
  genererInstance: genererExerciceHyperboliques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteId),
  construireEnonce: construireEnonceHyperboliques,
  construireCorrection: construireCorrectionHyperboliques,
  criteresDifficulte,
  reponseBreve: reponseBreveHyperboliques,
  correctionDetaillee: correctionDetailleeHyperboliques,
  bareme: baremeHyperboliques,
  enoncePapier: enoncePapierHyperboliques,
};

