import type { EnsembleReelGuide } from "../../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../../core6e/injectiviteFonctions.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { approxFractionLatex } from "../../ui6e/formatFraction";
import { aideDomaineNiveau2, aideImageNiveau2, aideReciproqueNiveau2, CONSIGNE_GENERALE, formatFLatexAffichage, formatReciproqueLatex } from "../../ui6e/formatInjectiviteFonctions";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInjectiviteFonctions } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInjectiviteFonctions>` pour `6gen1` (Fonctions
 * injectives/surjectives/bijectives) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Même traitement "résolution rédigée hyper détaillée" que `generateurs/secondDegre/exportEvaluation.ts`
 * (chapitre 2 de 4e) : les 5 écrans interactifs (domaine → injective+intervalle → réciproque →
 * image → bijection) ne deviennent PAS 5 questions lettrées, mais une seule consigne ouverte
 * (`CONSIGNE_GENERALE`, déjà écrite côté écran) suivie d'une résolution rédigée en paragraphes
 * continus — chacun reprenant le couple {texte, latex} d'aide niveau 2 déjà écrit côté écran
 * (`ui6e/formatInjectiviteFonctions.ts`), jamais reformulé/recalculé indépendamment. Comme pour
 * gen2 de 4e, la branche "droite" est retenue par convention pour la réciproque quand f n'est pas
 * injective (voir l'en-tête de l'ancien fichier, et `core6e/injectiviteFonctions.types.ts`).
 */

function nombreLignesReponse(nombreParagraphes: number): number {
  return Math.max(10, nombreParagraphes * 2 + 2);
}

function construireEnonceInjectiviteFonctions(exercice: ExerciceInjectiviteFonctions): SectionExercice {
  const nombreParagraphes = construireParagraphesResolution(exercice).length;
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFLatexAffichage(exercice))],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)], reponse: { type: "lignes", nombre: nombreLignesReponse(nombreParagraphes) } }],
  };
}

/** Valeur critique extraite du domaine DÉJÀ calculé (`EnsembleReelGuide`) — jamais recalculée : le
 * domaine est soit `prive_points` (un point exclu, familles à équation x=valeur) soit `morceaux`
 * (une demi-droite bornée d'un côté, familles à inéquation) — un seul cas pertinent dans chaque
 * cas pour ce générateur (jamais 2 points exclus ni 2 morceaux). */
function valeurCritiqueDomaine(domaine: EnsembleReelGuide): number | null {
  if (domaine.forme === "prive_points") return domaine.points[0];
  if (domaine.forme === "intervalles") {
    const m = domaine.morceaux[0];
    return m.inf !== null ? m.inf : m.sup;
  }
  return null;
}

function construireParagrapheDomaine(exercice: ExerciceInjectiviteFonctions): FragmentConsigne[] {
  const aide = aideDomaineNiveau2(exercice);
  const domaineLatex = formatEnsembleReelLatex(exercice.domaine);
  if (!aide.latex) {
    return [texte(`On commence par le domaine de définition de f : ${aide.texte} `), latex(`\\mathcal{D}_f = ${domaineLatex}`), texte(".")];
  }
  if (exercice.domaine.forme === "prive_points") {
    const v = valeurCritiqueDomaine(exercice.domaine) as number;
    return [
      texte(`On commence par déterminer le domaine de définition de f. ${aide.texte} `),
      latex(`${aide.latex} \\;\\Longrightarrow\\; x = ${approxFractionLatex(v)}`),
      texte(", valeur exclue du domaine : "),
      latex(`\\mathcal{D}_f = ${domaineLatex}`),
      texte("."),
    ];
  }
  return [
    texte(`On commence par déterminer le domaine de définition de f. ${aide.texte} `),
    latex(`${aide.latex} \\;\\Longrightarrow\\; \\mathcal{D}_f = ${domaineLatex}`),
    texte("."),
  ];
}

function construireParagrapheInjectivite(exercice: ExerciceInjectiviteFonctions): FragmentConsigne[] {
  if (exercice.injective) {
    return [
      texte("f est strictement monotone sur tout son domaine (jamais de partie où elle stagne ou change de sens) : deux valeurs distinctes de x donnent donc toujours deux images distinctes. f est donc injective sur "),
      latex(formatEnsembleReelLatex(exercice.domaine)),
      texte(" tout entier."),
    ];
  }
  const pivot = approxFractionLatex(exercice.pivot as number);
  const intervalleLatex = formatEnsembleReelLatex(exercice.intervalleDroite);
  return [
    texte("f n'est pas injective sur tout son domaine : son graphique est symétrique par rapport à la droite verticale "),
    latex(`x = ${pivot}`),
    texte(", donc deux valeurs symétriques par rapport à ce pivot ont la même image. Le plus grand intervalle sur lequel f redevient injective est l'une des deux moitiés de part et d'autre de ce pivot ; on retient ici "),
    latex(intervalleLatex),
    texte(" (l'autre moitié est tout aussi valable)."),
  ];
}

function construireParagrapheReciproque(exercice: ExerciceInjectiviteFonctions): FragmentConsigne[] {
  const aide = aideReciproqueNiveau2(exercice);
  const reciproqueLatex = formatReciproqueLatex(exercice, "droite");
  return [
    texte(`On détermine ensuite la réciproque sur cet intervalle. ${aide.texte} `),
    latex(aide.latex as string),
    texte(", d'où, en isolant y : "),
    latex(`f^{-1}(x) = ${reciproqueLatex}`),
    texte("."),
  ];
}

function construireParagrapheImage(exercice: ExerciceInjectiviteFonctions): FragmentConsigne[] {
  const aide = aideImageNiveau2(exercice);
  const imageLatex = formatEnsembleReelLatex(exercice.image);
  if (!aide.latex) {
    return [texte(`Pour l'image : ${aide.texte} `), latex(`\\text{Im}(f) = ${imageLatex}`), texte(".")];
  }
  return [texte(`Pour l'image : ${aide.texte} `), latex(aide.latex), texte(", d'où : "), latex(`\\text{Im}(f) = ${imageLatex}`), texte(".")];
}

function construireParagrapheBijection(exercice: ExerciceInjectiviteFonctions): FragmentConsigne[] {
  return [
    texte("Par construction, f restreinte à "),
    latex(formatEnsembleReelLatex(exercice.intervalleDroite)),
    texte(" est donc bijective vers "),
    latex(formatEnsembleReelLatex(exercice.image)),
    texte(" : injective par restriction (étape précédente), et surjective sur son image par définition même de l'image."),
  ];
}

/** Résolution rédigée et justifiée, un seul exercice ouvert sur la copie — jamais de sous-questions
 * a)/b)/c)/d)/e) comme avant : chaque paragraphe reprend le même enchaînement logique (domaine →
 * injectivité → réciproque → image → bijection), justifié comme un manuel scolaire le ferait.
 * Toutes les valeurs utilisées (domaine, pivot, intervalleDroite, image) sont déjà connues sur
 * l'instance ou issues des fonctions d'aide niveau 2 déjà écrites côté écran — jamais recalculées
 * indépendamment. */
function construireParagraphesResolution(exercice: ExerciceInjectiviteFonctions): FragmentConsigne[][] {
  return [
    construireParagrapheDomaine(exercice),
    construireParagrapheInjectivite(exercice),
    construireParagrapheReciproque(exercice),
    construireParagrapheImage(exercice),
    construireParagrapheBijection(exercice),
  ];
}

function construireCorrectionInjectiviteFonctions(exercice: ExerciceInjectiviteFonctions): BlocCorrection[] {
  return construireParagraphesResolution(exercice).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationInjectiviteFonctions: AdaptateurFeuilleExercices<ExerciceInjectiviteFonctions> = {
  titreDocument: "Fonctions injectives, surjectives, bijectives — Évaluation",
  nomFichierBase: "injectivite-fonctions",
  genererInstance: genererExerciceInjectiviteFonctions,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceInjectiviteFonctions,
  construireCorrection: construireCorrectionInjectiviteFonctions,
};
