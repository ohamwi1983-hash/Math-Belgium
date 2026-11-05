import type { ExerciceHistogramme } from "../../core/histogramme.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { valeurHauteur } from "../../ui/histogrammeGraph";
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
import { avecVirgulesBelges, nombreFr, nombreFrLatex } from "../../ui/nombreFr";

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
      texte(`${formatEnonceTexte(instance)} ${donneesBrutes.map(nombreFr).join(" ; ")}.`),
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

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème, énoncé papier). Tout
// vient de l'instance (classes, effectifs, fréquences, donnée frontière — les mêmes champs que
// l'écran) ; nombres en notation belge (`nombreFr`/`nombreFrLatex`) — ces champs ne passent pas
// par `avecVirgulesBelges`, qui ne convertit que `construireEnonce`/`construireCorrection`.
// Étapes du corrigé = sous-questions de `construireEnonce` : a) classement, (b) fréquences,) puis
// le tracé (dernière lettre).
// ============================================================================

function classeLatex(instance: ExerciceHistogramme, index: number): string {
  const classe = instance.classes[index];
  const fermante = index === instance.classes.length - 1 ? "]" : "[";
  return `[${nombreFrLatex(classe.borneInf)}\\,;\\,${nombreFrLatex(classe.borneSup)}${fermante}`;
}

function classeTexte(instance: ExerciceHistogramme, index: number): string {
  const classe = instance.classes[index];
  const fermante = index === instance.classes.length - 1 ? "]" : "[";
  return `[${nombreFr(classe.borneInf)} ; ${nombreFr(classe.borneSup)}${fermante}`;
}

/** Tableau classes × effectifs (× fréquences en %) en LaTeX. */
function tableauClassesLatex(instance: ExerciceHistogramme, avecFrequences: boolean): string {
  const { classes } = instance;
  const rangees: [string, string[]][] = [
    ["\\text{Classe}", classes.map((_, i) => classeLatex(instance, i))],
    ["n_i", classes.map((c) => nombreFrLatex(c.effectif))],
  ];
  if (avecFrequences) rangees.push(["f_i\\ (\\%)", classes.map((c) => nombreFrLatex(c.frequencePourcent))]);
  return `\\begin{array}{l|${"c".repeat(classes.length)}} ${rangees.map(([tete, cellules]) => [tete, ...cellules].join(" & ")).join(" \\\\ \\hline ")} \\end{array}`;
}

/** Lettre d'étape du tracé (dernière sous-question de `construireEnonce`). */
function lettreTrace(instance: ExerciceHistogramme): string {
  return instance.variante === "frequence" ? "c" : "b";
}

/** Donnée égale à la borne supérieure de la dernière classe (fermée), s'il y en a une. */
function donneeSurBorneFinale(instance: ExerciceHistogramme): number | null {
  const borneFinale = instance.classes[instance.classes.length - 1].borneSup;
  return instance.donneesBrutes.some((d) => Math.abs(d - borneFinale) < 1e-9) ? borneFinale : null;
}

function phraseFrontiere(instance: ExerciceHistogramme): string {
  const { valeur, classeIndex, surFrontiere } = instance.donneeFrontiere;
  if (surFrontiere) {
    return `La donnée ${nombreFr(valeur)} tombe sur la frontière : elle appartient à la classe ${classeTexte(instance, classeIndex)} (borne inférieure incluse), pas à ${classeTexte(instance, classeIndex - 1)}.`;
  }
  return `La donnée ${nombreFr(valeur)} est juste sous la frontière ${nombreFr(instance.classes[classeIndex].borneSup)} : elle reste dans la classe ${classeTexte(instance, classeIndex)}.`;
}

/** ★★ en général ; ★★★ quand les deux pièges se cumulent (donnée exactement sur une frontière ET
 * hauteurs en fréquences). */
function difficulteHistogramme(instance: ExerciceHistogramme): 1 | 2 | 3 {
  return instance.variante === "frequence" && instance.donneeFrontiere.surFrontiere ? 3 : 2;
}

function reponseBreveHistogramme(instance: ExerciceHistogramme): FragmentConsigne[] {
  const hauteur = instance.variante === "frequence" ? "hauteurs = fréquences (%)" : "hauteurs = effectifs";
  return [latex(tableauClassesLatex(instance, instance.variante === "frequence")), texte(` ; ${hauteur}`)];
}

function correctionDetailleeHistogramme(instance: ExerciceHistogramme): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("Chaque donnée va dans la classe qui la contient : borne inférieure incluse, borne supérieure exclue — sauf la dernière classe, fermée des deux côtés.")],
    },
    { label: "Lecture", sousQuestion: "a", fragments: [texte(phraseFrontiere(instance))] },
  ];
  const finale = donneeSurBorneFinale(instance);
  if (finale !== null) {
    etapes.push({ label: "Lecture", sousQuestion: "a", fragments: [texte(`La donnée ${nombreFr(finale)} est la borne supérieure de la dernière classe, fermée : elle y est comptée.`)] });
  }
  etapes.push({ label: "Conclusion", sousQuestion: "a", fragments: [latex(tableauClassesLatex(instance, false)), texte(` (somme des effectifs : n = ${nombreFr(instance.n)})`)] });
  if (instance.variante === "frequence") {
    etapes.push({ label: "Méthode", sousQuestion: "b", fragments: [texte("Fréquence d'une classe, en % : "), latex("f_i = \\dfrac{n_i}{n} \\times 100"), texte(".")] });
    etapes.push({ label: "Conclusion", sousQuestion: "b", fragments: [latex(tableauClassesLatex(instance, true))] });
  }
  const t = lettreTrace(instance);
  const grandeur = instance.variante === "frequence" ? "la fréquence (en %)" : "l'effectif";
  etapes.push({
    label: "Méthode",
    sousQuestion: t,
    fragments: [
      texte(
        `Axe horizontal gradué de ${nombreFr(instance.classes[0].borneInf)} à ${nombreFr(instance.classes[instance.classes.length - 1].borneSup)} (${instance.contexte.unite}) ; une barre par classe, jointive avec ses voisines, de largeur égale à l'amplitude ${nombreFr(instance.amplitude)}.`,
      ),
    ],
  });
  etapes.push({
    label: "Conclusion",
    sousQuestion: t,
    fragments: [texte(`La hauteur de chaque barre est ${grandeur} de sa classe : `), texte(instance.classes.map((_, i) => `${classeTexte(instance, i)} → ${nombreFr(valeurHauteur(instance, i))}${instance.variante === "frequence" ? " %" : ""}`).join(" ; ")), texte(".")],
  });
  etapes.push({
    label: "Piège",
    sousQuestion: "a",
    fragments: [texte("Une donnée égale à une borne appartient à la classe qui COMMENCE par cette borne (la borne supérieure d'une classe est exclue), sauf la toute dernière valeur de la série.")],
  });
  return etapes;
}

function baremeHistogramme(instance: ExerciceHistogramme): BaremeExercice {
  const t = lettreTrace(instance);
  const frequence = instance.variante === "frequence";
  const { valeur, classeIndex } = instance.donneeFrontiere;
  const criteres: CritereBareme[] = [
    { sousQuestion: "a", critere: [texte("Effectif de chaque classe (somme = n)")], points: frequence ? 1 : 1.5 },
    { sousQuestion: "a", critere: [texte(`Donnée ${nombreFr(valeur)} placée dans ${classeTexte(instance, classeIndex)}`)], points: 0.5 },
  ];
  if (frequence) criteres.push({ sousQuestion: "b", critere: [texte("Fréquences en % : "), latex("f_i = \\dfrac{n_i}{n} \\times 100")], points: 1 });
  criteres.push({ sousQuestion: t, critere: [texte("Barres jointives, de largeur égale à l'amplitude, axes gradués")], points: frequence ? 0.5 : 1 });
  criteres.push({ sousQuestion: t, critere: [texte(`Hauteur de chaque barre = ${frequence ? "fréquence (%)" : "effectif"} de sa classe`)], points: 1 });

  const erreurs: ErreurFrequente[] = [
    { description: [texte(`Donnée ${nombreFr(valeur)} comptée dans la mauvaise classe (borne supérieure exclue)`)], cout: "−0,5 sur a), suite notée sans double pénalité" },
    { description: [texte("Barres séparées ou de largeurs inégales")], cout: `−0,5 sur ${t})` },
  ];
  if (frequence) erreurs.push({ description: [texte("Hauteurs égales aux effectifs au lieu des fréquences")], cout: `0 pt sur les hauteurs en ${t})` });
  const finale = donneeSurBorneFinale(instance);
  if (finale !== null) erreurs.push({ description: [texte(`Donnée ${nombreFr(finale)} (borne finale) oubliée`)], cout: "−0,5 sur a)" });

  return {
    reponseFinale: [latex(tableauClassesLatex(instance, frequence))],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      ...(frequence ? [[texte("Fréquences en écriture décimale (0,2 au lieu de 20 %) si l'axe est gradué de même")]] : []),
      [texte("Graduation verticale différente, si les hauteurs restent lisibles et exactes")],
    ],
  };
}

/** Énoncé papier : la liste brute, les classes, puis UNE consigne — classer, (calculer les
 * fréquences,) tracer : les étapes de l'écran ne sont qu'une tâche, construire l'histogramme. Liste
 * séparée par « ; » (avec la virgule décimale, « 1,5, 2 » serait ambigu). */
function enoncePapierHistogramme(instance: ExerciceHistogramme): EnoncePapier {
  const listeClasses = instance.classes.map((_, i) => classeTexte(instance, i)).join(", ");
  const consigne =
    instance.variante === "frequence"
      ? "Détermine l'effectif puis la fréquence (en %) de chaque classe retenue, puis trace l'histogramme de la série, où la hauteur de chaque barre est la fréquence de sa classe."
      : "Détermine l'effectif de chaque classe retenue, puis trace l'histogramme de la série, où la hauteur de chaque barre est l'effectif de sa classe.";
  return {
    section: {
      enteteFragments: [
        texte(`${formatEnonceTexte(instance)} ${instance.donneesBrutes.map(nombreFr).join(" ; ")}.`),
        texte(` Classes retenues : ${listeClasses}.`),
      ],
      questions: [{ consigne: [texte(consigne)] }],
    },
    etapesParQuestion: [instance.variante === "frequence" ? ["a", "b", "c"] : ["a", "b"]],
  };
}

const adaptateurEvaluationHistogrammeBrut: AdaptateurFeuilleExercices<ExerciceHistogramme> = {
  titreDocument: "Regroupement en classes et histogramme — Évaluation",
  nomFichierBase: "histogramme",
  genererInstance: genererExerciceHistogramme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceHistogramme,
  construireCorrection: construireCorrectionHistogramme,
  difficulte: difficulteHistogramme,
  reponseBreve: reponseBreveHistogramme,
  correctionDetaillee: correctionDetailleeHistogramme,
  bareme: baremeHistogramme,
  enoncePapier: enoncePapierHistogramme,
  dureeMinutes: 8,
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationHistogramme: AdaptateurFeuilleExercices<ExerciceHistogramme> = avecVirgulesBelges(adaptateurEvaluationHistogrammeBrut);
