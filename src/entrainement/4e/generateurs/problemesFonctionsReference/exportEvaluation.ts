import type { ExerciceProblemesFonctionsReference } from "../../core/problemesFonctionsReference.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte as texteBrut } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { decrireProbleme, morceauLatex } from "../../moteur/problemesFonctionsReference";
import {
  consigneDomaine,
  consigneFonction,
  consigneQuestion,
  dureeTexte,
  enonceFragments,
  fonctionAttendueLatex,
  insecables,
  fonctionLatex,
  optionsInterpretation,
  questionConcrete,
  questionInterpretation,
} from "../../ui/formatProblemesFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProblemesFonctionsReference } from "./index";
import { correctionDetailleeProblemesFonctionsReference, domaineConclusionLatex, solutionLatex } from "./corrigeDetaille";
import { profilProblemesFonctionsReference } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProblemesFonctionsReference>` de gen68
 * (`AppProblemesFonctionsReference.tsx`, 4e chapitre 3, processus TRANSFÉRER).
 *
 * Étapes de l'appli (lettres du corrigé et du barème) : a) expression de la fonction, b) domaine
 * imposé par le contexte, c) question concrète (inéquation restreinte au domaine), d)
 * interprétation. Sur papier, ce sont TROIS vraies questions d'un problème : 1) écrire la fonction
 * ET son domaine (étapes a et b — le choix du domaine parmi quatre propositions est un guidage
 * d'écran), 2) répondre à la question concrète (étape c), 3) interpréter, en question OUVERTE
 * justifiée (étape d — les quatre propositions de l'écran disparaissent). Version aménagée : même
 * énoncé (le pipeline ne change que la mise en page).
 *
 * Textes, inéquation, domaines, ensemble-solution : MÊMES fonctions que l'appli
 * (`decrireProbleme`, `ui/formatProblemesFonctionsReference.ts`), jamais recalculés à part.
 */

type E = ExerciceProblemesFonctionsReference;

const texte = (valeur: string): FragmentConsigne => texteBrut(insecables(valeur));

function enteteFragments(e: E): FragmentConsigne[] {
  return enonceFragments(e);
}

function consignesEcrans(e: E): FragmentConsigne[][] {
  return [consigneFonction(e), consigneDomaine(e), consigneQuestion(e), questionInterpretation(e)];
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enteteFragments(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function questionsPapier(e: E): FragmentConsigne[][] {
  const d = decrireProbleme(e);
  return [
    [texte("Exprime "), latex(fonctionLatex(e)), texte(" en fonction de "), latex(d.variable), texte(", puis donne le domaine de "), latex(d.nomFonction), texte(" imposé par la situation.")],
    [...questionConcrete(e), texte(" Réponds à l'aide d'une inéquation.")],
    [...questionInterpretation(e), texte(" Justifie.")],
  ];
}

function construireCorrection(e: E): BlocCorrection[] {
  return correctionDetailleeProblemesFonctionsReference(e)
    .filter((l) => l.type === "resultat")
    .map((l): BlocCorrection => ({ type: "paragraphe", fragments: [texte(`${l.sousQuestion}) `), ...l.fragments] }));
}

function reponseBreve(e: E): FragmentConsigne[] {
  const d = decrireProbleme(e);
  return [
    texte("a) "),
    latex(fonctionAttendueLatex(e)),
    texte(" ; b) "),
    latex(morceauLatex(d.domaineContexte)),
    texte(" ; c) "),
    latex(solutionLatex(e)),
    texte(" ; d) "),
    texte(optionsInterpretation(e)[0]!),
  ];
}

function reponseBrevePapier(e: E): FragmentConsigne[] {
  return [
    texte("a) "),
    latex(fonctionAttendueLatex(e)),
    texte(", "),
    latex(domaineConclusionLatex(e)),
    texte(" ; b) "),
    latex(solutionLatex(e)),
    texte(" ; c) "),
    texte(optionsInterpretation(e)[0]!),
  ];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enteteFragments(e), questions: questionsPapier(e).map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a", "b"], ["c"], ["d"]],
    reponseBreve: reponseBrevePapier(e),
  };
}

function erreurSpecifique(e: E): { description: FragmentConsigne[]; cout: string }[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [
        { description: [texte("Sens de l'inégalité non inversé (la durée diminue quand la vitesse augmente)")], cout: "0 pt sur la résolution" },
        ...(p.minutes! > 0 ? [{ description: [texte(`${dureeTexte(e)} converti en `), latex(`${p.heures}{,}${String(p.minutes).padStart(2, "0")}`), texte(" h")], cout: "0 pt sur l'inéquation" }] : []),
      ];
    case "location":
      return [{ description: [texte("Sens de l'inégalité non inversé en passant à la durée")], cout: "0 pt sur la résolution" }];
    case "thermostat":
      return e.sens === ">" || e.sens === "≥" ? [{ description: [texte("Un seul intervalle au lieu de deux morceaux")], cout: "0 pt sur la résolution" }] : [{ description: [texte("Valeur absolue traitée comme une parenthèse (une seule inégalité)")], cout: "0 pt sur la résolution" }];
    case "plaque":
      return [{ description: [texte("Longueurs négatives gardées dans la réponse")], cout: "0 pt sur la restriction au domaine" }];
    default:
      return [{ description: [texte("Borne de l'ensemble oubliée (domaine non pris en compte)")], cout: "0 pt sur la restriction au domaine" }];
  }
}

function bareme(e: E): BaremeExercice {
  const d = decrireProbleme(e);
  return {
    reponseFinale: reponseBrevePapier(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Expression de la fonction : "), latex(fonctionAttendueLatex(e))], points: 1 },
      { sousQuestion: "b", critere: [texte("Domaine imposé par la situation : "), latex(morceauLatex(d.domaineContexte))], points: 0.75 },
      { sousQuestion: "c", critere: [texte("Inéquation correcte : "), latex(d.inequationLatex)], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Résolution avec le bon sens de l'inégalité")], points: 0.5 },
      {
        sousQuestion: "c",
        // Thermostat « écart inférieur » : l'intervalle centré tombe déjà dans la plage, la restriction est invisible.
        critere: [texte(e.famille === "thermostat" && (e.sens === "<" || e.sens === "≤") ? "Ensemble-solution : " : "Restriction au domaine : "), latex(solutionLatex(e))],
        points: 0.5,
      },
      { sousQuestion: "d", critere: [texte("Interprétation justifiée : "), texte(optionsInterpretation(e)[0]!)], points: 0.75 },
    ],
    erreursFrequentes: [
      { description: [texte("Domaine algébrique "), latex(d.domaineAlgebriqueLatex), texte(" donné au lieu du domaine de la situation")], cout: "0 pt sur le domaine" },
      ...erreurSpecifique(e),
      { description: [texte("Interprétation sans justification")], cout: "moitié des points de l'interprétation" },
    ],
    reponsesAcceptees: [
      [texte("Expression équivalente de la fonction (autre écriture du même quotient, de la même valeur absolue…)")],
      [texte("Ensemble donné par un encadrement ou des inégalités au lieu d'intervalles")],
    ],
  };
}

/** ★★ : contexte direct (racine, carré, valeur absolue en un seul intervalle) ; ★★★ : sens qui
 * s'inverse avec une fonction décroissante (trajet, location) ou réponse en deux morceaux. */
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeProblemesFonctionsReference(e)), methode: 2, piege: 1 };
}

export const adaptateurEvaluationProblemesFonctionsReference: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilProblemesFonctionsReference,
  titreDocument: "Problèmes modélisés par une fonction de référence — Évaluation",
  nomFichierBase: "problemes-fonctions-reference",
  genererInstance: genererExerciceProblemesFonctionsReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeProblemesFonctionsReference,
  bareme,
  enoncePapier,
};
