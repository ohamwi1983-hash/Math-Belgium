import type { ExerciceHyperboliques, ExerciceHyperboliquesB } from "../../core6e/hyperboliques.types";
import type {
  AdaptateurFeuilleExercices, EnoncePapier,
  BaremeExercice,
  BlocCorrection,
  EtapeAmenagee,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phaseApres, phaseInitiale, type PhaseHyperboliques } from "../../moteur6e/typesHyperboliques";
import { pariteAttendueA } from "../../moteur6e/verificationHyperboliques";
import {
  CONSIGNE_GENERALE,
  blocDonnees,
  consigneEcran,
  formatDeriveeC,
  formatDeriveeSecondeC,
  formatFMoinsXA,
  formatFormeExponentielleD,
  reponseAttendueLatex,
} from "../../ui6e/formatHyperboliques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHyperboliques, type VarianteId } from "./index";

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
// version aménagée. Toutes les valeurs viennent de l'instance (mêmes fonctions que l'appli).
// ============================================================================

const SH = "\\operatorname{sh}";
const CH = "\\operatorname{ch}";
const PHRASE_PARITE = { paire: "f est paire.", impaire: "f est impaire.", aucune: "f n'est ni paire ni impaire." } as const;
const TYPES_PIEGES_A = new Set(["shCarre", "xSh", "shPlusConstante", "shPlusCh", "shMoinsCh"]);

function fonctionLatex(exercice: ExerciceHyperboliques): string {
  return blocDonnees(exercice)[0];
}

function kLatex(exercice: ExerciceHyperboliquesB): string {
  if (exercice.kDen === 1) return `${exercice.kNum}`;
  return `${exercice.kNum < 0 ? "-" : ""}\\dfrac{${Math.abs(exercice.kNum)}}{${exercice.kDen}}`;
}

/** Carré de l'inconnue, en fraction : 1+k² (trouverCh) ou k²−1 (trouverSh). */
function carreInconnueLatex(exercice: ExerciceHyperboliquesB): string {
  const d2 = exercice.kDen * exercice.kDen;
  const n = exercice.sousType === "trouverCh" ? d2 + exercice.kNum * exercice.kNum : exercice.kNum * exercice.kNum - d2;
  return d2 === 1 ? `${n}` : `\\dfrac{${n}}{${d2}}`;
}

function difficulteHyperboliques(exercice: ExerciceHyperboliques): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return TYPES_PIEGES_A.has(exercice.type) ? 2 : 1;
    case "B":
      if (exercice.sousType === "trouverCh") return 1;
      return exercice.signeX0 === null ? 3 : 2;
    case "C":
      return 2;
    case "D":
      return 3;
  }
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

function correctionDetailleeHyperboliques(exercice: ExerciceHyperboliques): EtapeCorrection[] {
  switch (exercice.famille) {
    case "A": {
      const parite = pariteAttendueA(exercice);
      const comparaison =
        parite === "paire" ? "on retrouve f(x) : " : parite === "impaire" ? "on obtient −f(x) : " : "on n'obtient ni f(x) ni −f(x) : ";
      return [
        { label: "Méthode", fragments: [texte("Calculer f(−x) en utilisant "), latex(`${SH}(-x)=-${SH}(x)`), texte(" (sh impaire) et "), latex(`${CH}(-x)=${CH}(x)`), texte(" (ch paire), puis comparer à f(x) et à −f(x).")] },
        { label: "Calcul", fragments: [latex(`f(-x) = ${formatFMoinsXA(exercice)}`)] },
        { label: "Comparaison", fragments: [texte(comparaison), latex(fonctionLatex(exercice))] },
        { label: "Conclusion", fragments: [texte(PHRASE_PARITE[parite])] },
      ];
    }
    case "B": {
      const etapes: EtapeCorrection[] = [
        { label: "Méthode", fragments: [texte("On utilise l'identité "), latex(`${CH}^2(x)-${SH}^2(x)=1`), texte(" en x₀.")] },
        exercice.sousType === "trouverCh"
          ? { label: "Calcul", fragments: [latex(`${CH}^2(x_0) = 1+${SH}^2(x_0) = 1+\\left(${kLatex(exercice)}\\right)^2 = ${carreInconnueLatex(exercice)}`)] }
          : { label: "Calcul", fragments: [latex(`${SH}^2(x_0) = ${CH}^2(x_0)-1 = \\left(${kLatex(exercice)}\\right)^2-1 = ${carreInconnueLatex(exercice)}`)] },
      ];
      if (exercice.sousType === "trouverCh") {
        etapes.push({ label: "Signe", fragments: [texte("ch(x) ≥ 1 pour tout réel x : on garde la racine positive.")] });
      } else if (exercice.signeX0 === null) {
        etapes.push({ label: "Signe", fragments: [texte("Le signe de x₀ n'est pas donné et sh(x) a le signe de x : les deux racines conviennent.")] });
      } else {
        etapes.push({ label: "Signe", fragments: [texte(`sh(x) a le signe de x et x₀ ${exercice.signeX0 > 0 ? "> 0" : "< 0"} : on garde la racine ${exercice.signeX0 > 0 ? "positive" : "négative"}.`)] });
      }
      etapes.push({ label: "Conclusion", fragments: [latex(reponseAttendueLatex(exercice, "bValeurs"))] });
      return etapes;
    }
    case "C":
      return [
        { label: "Méthode", sousQuestion: "a", fragments: [latex(`${SH}' = ${CH}`), texte(" et "), latex(`${CH}' = ${SH}`), texte(` ; la dérivée de l'argument ${exercice.k === 1 ? "x vaut 1" : `${exercice.k}x fait apparaître le facteur ${exercice.k}`}.`)] },
        { label: "Calcul", sousQuestion: "a", fragments: [latex(`f'(x) = ${formatDeriveeC(exercice)}`)] },
        { label: "Calcul", sousQuestion: "b", fragments: [texte("Même règle appliquée à f'(x) : "), latex(`f''(x) = ${formatDeriveeSecondeC(exercice)}`)] },
      ];
    case "D": {
      const { a, b } = exercice;
      return [
        { label: "Méthode", sousQuestion: "a", fragments: [texte("Remplacer sh(x) et ch(x) par leur définition, puis regrouper les termes en "), latex("e^x"), texte(" et en "), latex("e^{-x}"), texte(" : coefficient de "), latex("e^x"), texte(" : "), latex("\\dfrac{a+b}{2}"), texte(", de "), latex("e^{-x}"), texte(" : "), latex("\\dfrac{b-a}{2}"), texte(".")] },
        { label: "Calcul", sousQuestion: "a", fragments: [latex(`f(x) = ${formatFormeExponentielleD(exercice)}`)] },
        { label: "Limites", sousQuestion: "b", fragments: [texte("En +∞, "), latex("e^{-x}\\to 0"), texte(` : le terme en eˣ domine, de coefficient a+b = ${a + b}. En −∞, `), latex("e^{x}\\to 0"), texte(` : le terme en e⁻ˣ domine, de coefficient b−a = ${b - a}.`)] },
        { label: "Conclusion", sousQuestion: "b", fragments: [latex(reponseAttendueLatex(exercice, "dLimites"))] },
      ];
    }
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

function enonceAmenageHyperboliques(exercice: ExerciceHyperboliques): EtapeAmenagee[] {
  switch (exercice.famille) {
    case "A":
      return [
        { consigne: [texte("Écris f(−x) : remplace chaque x par −x dans "), latex(fonctionLatex(exercice)), texte(".")], points: 1 },
        { consigne: [texte("Simplifie avec la parité de sh et de ch.")], rappel: [latex(`${SH}(-x)=-${SH}(x)`), texte(" et "), latex(`${CH}(-x)=${CH}(x)`)], points: 1 },
        { consigne: [texte("Compare ton résultat à f(x), puis à −f(x).")], points: 1 },
        { consigne: [texte("Conclus : f est paire, impaire, ou ni l'une ni l'autre.")], rappel: [texte("Paire : f(−x) = f(x). Impaire : f(−x) = −f(x).")], points: 1 },
      ];
    case "B": {
      const inconnue = exercice.sousType === "trouverCh" ? "ch(x₀)" : "sh(x₀)";
      return [
        { consigne: [texte("Écris l'identité qui relie ch et sh.")], rappel: [texte("Elle ressemble à cos² + sin² = 1, avec un signe moins.")], points: 1 },
        { consigne: [texte(`Remplace la valeur donnée et calcule le carré de ${inconnue}.`)], points: 1 },
        { consigne: [texte(`Prends la racine carrée et simplifie : c'est la valeur exacte de ${inconnue}.`)], points: 1 },
        {
          consigne: [texte(exercice.sousType === "trouverCh" ? "Choisis le signe de ch(x₀)." : exercice.signeX0 === null ? "Le signe de x₀ n'est pas donné : combien de valeurs conviennent ?" : "Utilise le signe de x₀ pour choisir le signe de sh(x₀).")],
          rappel: [texte(exercice.sousType === "trouverCh" ? "ch(x) ≥ 1 pour tout réel x." : "sh(x) a toujours le même signe que x.")],
          points: 1,
        },
      ];
    }
    case "C":
      return [
        { consigne: [texte("Dérive chaque terme de f(x).")], rappel: [latex(`${SH}' = ${CH}`), texte(", "), latex(`${CH}' = ${SH}`), texte(", sans changement de signe.")], points: 1 },
        { consigne: [texte("N'oublie pas la dérivée de l'argument et écris f'(x).")], rappel: [texte("La dérivée de sh(kx) est k·ch(kx).")], points: 1 },
        { consigne: [texte("Dérive f'(x) de la même façon et écris f''(x).")], points: 2 },
      ];
    case "D":
      return [
        { consigne: [texte("Remplace sh(x) et ch(x) par leur définition.")], rappel: [latex(`${SH}(x)=\\dfrac{e^x-e^{-x}}{2}`), texte(", "), latex(`${CH}(x)=\\dfrac{e^x+e^{-x}}{2}`)], points: 1 },
        { consigne: [texte("Regroupe les termes en "), latex("e^x"), texte(" et les termes en "), latex("e^{-x}"), texte(".")], points: 1 },
        { consigne: [texte("En +∞, quel terme tend vers 0 ? Déduis la limite de f.")], rappel: [latex("\\lim_{x\\to+\\infty} e^{-x}=0")], points: 1 },
        { consigne: [texte("En −∞, quel terme tend vers 0 ? Déduis la limite de f.")], rappel: [latex("\\lim_{x\\to-\\infty} e^{x}=0")], points: 1 },
      ];
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
  titreDocument: "Sinus et cosinus hyperboliques (sh, ch) — Évaluation",
  nomFichierBase: "hyperboliques",
  genererInstance: genererExerciceHyperboliques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteId),
  construireEnonce: construireEnonceHyperboliques,
  construireCorrection: construireCorrectionHyperboliques,
  difficulte: difficulteHyperboliques,
  reponseBreve: reponseBreveHyperboliques,
  correctionDetaillee: correctionDetailleeHyperboliques,
  bareme: baremeHyperboliques,
  enonceAmenage: enonceAmenageHyperboliques,
  enoncePapier: enoncePapierHyperboliques,
  dureeMinutes: 6,
};

