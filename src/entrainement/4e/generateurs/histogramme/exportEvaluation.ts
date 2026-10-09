import type { ExerciceHistogramme } from "../../core/histogramme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_FREQUENCES,
  consigneClassement,
  formatClasseTexte,
  formatClassementAttenduTexte,
  formatEnonceTexte,
  formatFrequencesAttenduesTexte,
  formatTraceAttendueTexte,
} from "../../ui/formatHistogramme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHistogramme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceHistogramme>` pour gen31 (Regroupement en classes
 * et histogramme, `AppHistogramme.tsx`) — voir `generateurs/analyseFonction/exportWord.ts` pour le
 * mécanisme générique de référence.
 *
 * L'écran interactif (`AppHistogramme.tsx`/`moteur/sessionHistogramme.ts`) déroule jusqu'à 3 phases
 * successives sur la MÊME liste de données brutes affichée en permanence : "classement" (répartir
 * les données brutes dans les classes déjà bornées et donner l'effectif de chacune, TOUJOURS
 * présente), "frequences" (calculer la fréquence % de chaque classe — SAUTÉE pour la variante
 * "effectif", voir `sessionHistogramme.ts::phaseApresClassement`), puis "trace" (dernière phase,
 * toujours présente : glisser chaque barre à la bonne hauteur). Reproduit ici par 2 questions
 * (variante "effectif") ou 3 questions (variante "frequence") par instance — jamais `regroupable`
 * (plusieurs questions par instance, l'une des 2 conditions qui désactivent déjà ce mécanisme à
 * elles seules, voir la doc de `AdaptateurFeuilleExercices.regroupable` dans
 * `genererFeuilleExercices.ts`).
 *
 * Question "trace" — la SEULE des 3 qui ne peut pas être portée telle quelle sur papier (l'écran
 * est un glissement interactif de barres, `EtapeTraceHistogramme.tsx`/`HistogrammeGraph.tsx`) :
 * reformulée ici en une consigne de tracé classique à la main ("sur un repère, ...") plutôt qu'une
 * quelconque tentative de reproduire le geste de glissement. Pas de grille/axe vierge fourni en
 * énoncé (aucun `enteteHtml`, aucune `ZoneReponse`) : comme documenté dans le prompt de ce lot,
 * l'élève répond entièrement sur une copie séparée, y compris pour le tracé.
 *
 * Corrigé RESYNTHÉTISÉ depuis les valeurs déjà connues de l'instance (`instance.classes`), jamais
 * recalculé indépendamment ici : réutilise directement `formatClassementAttenduTexte`/
 * `formatFrequencesAttenduesTexte`/`formatTraceAttendueTexte` (`ui/formatHistogramme.ts`), déjà les
 * textes de RÉVÉLATION affichés côté écran dans le panneau de résultat après échec
 * (`ResultatPanelHistogramme.tsx`) — même source de vérité que l'écran, pas une nouvelle
 * synthèse ad hoc. Un tableau ("Classe"/"Effectif"[/"Fréquence (%)"]) accompagne ce texte pour une
 * lecture plus rapide sur la copie corrigée, même convention que `tableauFrequences/exportEvaluation.ts`
 * (une ligne de classes/valeurs suivie d'une ligne de résultat par ligne de tableau, sans ligne
 * d'étiquettes de colonnes séparée).
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function consigneTrace(instance: ExerciceHistogramme): string {
  const grandeur = instance.variante === "frequence" ? "la fréquence (%)" : "l'effectif";
  return (
    `Trace l'histogramme correspondant : place en abscisse les classes ci-dessus (bornes déjà données, largeur des barres ` +
    `= amplitude d'une classe), puis donne à chaque barre une hauteur égale à ${grandeur} de sa classe.`
  );
}

function construireEnonceHistogramme(instance: ExerciceHistogramme): SectionExercice {
  const { contexte, classes, donneesBrutes } = instance;
  const listeClasses = classes.map((_, i) => formatClasseTexte(instance, i)).join(", ");

  const questions: SectionExercice["questions"] = [{ consigne: [texte(consigneClassement(instance))] }];
  if (instance.variante === "frequence") {
    questions.push({ consigne: [texte(CONSIGNE_FREQUENCES)] });
  }
  questions.push({ consigne: [texte(consigneTrace(instance))] });

  return {
    enteteFragments: [
      texte(`${formatEnonceTexte(instance)} ${donneesBrutes.map(formatNombre).join(", ")} (en ${contexte.unite}).`),
      texte(` Classes retenues : ${listeClasses}.`),
    ],
    questions,
  };
}

function construireCorrectionHistogramme(instance: ExerciceHistogramme): BlocCorrection[] {
  const { classes } = instance;
  const lettreFrequences = "b";
  const lettreTrace = instance.variante === "frequence" ? "c" : "b";

  const libellesLignes = instance.variante === "frequence" ? ["Classe", "Effectif", "Fréquence (%)"] : ["Classe", "Effectif"];
  const ligneClasses = classes.map((_, i) => formatClasseTexte(instance, i));
  const ligneEffectifs = classes.map((c) => formatNombre(c.effectif));
  const ligneFrequences = classes.map((c) => `${formatNombre(c.frequencePourcent)} %`);
  const valeursParLigne = instance.variante === "frequence" ? [ligneClasses, ligneEffectifs, ligneFrequences] : [ligneClasses, ligneEffectifs];

  const blocs: BlocCorrection[] = [
    { type: "paragraphe", fragments: [texte(`a) ${formatClassementAttenduTexte(instance)}.`)] },
    { type: "tableau", libellesLignes, valeursParLigne },
  ];

  if (instance.variante === "frequence") {
    blocs.push({ type: "paragraphe", fragments: [texte(`${lettreFrequences}) ${formatFrequencesAttenduesTexte(instance)}.`)] });
  }

  blocs.push({
    type: "paragraphe",
    fragments: [texte(`${lettreTrace}) Hauteur attendue de chaque barre : ${formatTraceAttendueTexte(instance)}.`)],
  });

  return blocs;
}

export const adaptateurEvaluationHistogramme: AdaptateurFeuilleExercices<ExerciceHistogramme> = {
  titreDocument: "Regroupement en classes et histogramme — Évaluation",
  nomFichierBase: "histogramme",
  genererInstance: genererExerciceHistogramme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceHistogramme,
  construireCorrection: construireCorrectionHistogramme,
};
