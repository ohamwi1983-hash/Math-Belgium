import type { ExerciceCaracteristiquesAlgebriquesNiveau1, ReponseDomaine } from "../../core/caracteristiquesAlgebriques.types";
import type { FamilleReference } from "../../core/fonctionsReference.types";
import type { Morceau } from "../../core/inequation.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  ceAttendues,
  domaineAttendu,
  existeOrdonneeNiveau1,
  necessiteSeparation,
  zerosNiveau1,
} from "../../moteur/verificationCaracteristiquesAlgebriques";
import {
  INSTRUCTION_ZEROS,
  formatCEAttenduesLatex,
  formatEquationDebarrasseeLatex,
  formatEquationIsoleeLatex,
  formatEquationNiveau1Latex,
  formatEquationsSepareesLatex,
  formatOrdonneeExacteLatex,
  formatValeurExacteLatex,
  formatZerosAttendusLatex,
  instructionDebarrasser,
  instructionIsolement,
} from "../../ui/formatCaracteristiquesAlgebriques";
import { CATALOGUE_VARIANTES, construireNiveau1AvecFamille, genererExerciceCaracteristiquesAlgebriques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCaracteristiquesAlgebriquesNiveau1>` pour gen13
 * (Étudier algébriquement une fonction de référence, chapitre 2 — `AppCaracteristiquesAlgebriques.tsx`).
 *
 * NIVEAU RETENU — niveau 1 uniquement (`k` constant), jamais le niveau 2 (`k(x)=cx+d`) : les deux
 * niveaux ne sont PAS deux étapes progressives d'une même séance (voir
 * `EtapeReglagesCaracteristiquesAlgebriques.tsx`) mais un réglage professeur qui s'applique
 * UNIFORMÉMENT à toute une série (`niveau1` par défaut à l'écran, jamais mélangé — voir
 * `creerGenerateurCaracteristiquesAlgebriques`) : ce sont deux modes de générateur indépendants,
 * pas un seul exercice à couvrir en plusieurs questions. Le niveau 2 fait en outre diverger la
 * séquence d'écrans par FAMILLE (`carre`/`cube` : 2 phases après isolement ; `inverse`/
 * `racine_cubique` : 3 ; `racine_carree`/`valeur_absolue` : jusqu'à 5, avec un nombre de validations
 * variable), avec des structures de données internes différentes par famille
 * (`ExerciceNiveau2Quadratique`/`RacineCarree`/`ValeurAbsolue`/`Cubique`) — bien plus risqué à
 * resynthétiser fidèlement sur papier qu'à couvrir correctement dans le temps imparti. Le niveau 1
 * est strictement homogène (6-7 phases fixes, une structure de données unique) et correspond au
 * réglage par défaut de l'écran interactif, retenu ici en toute sécurité mathématique plutôt que de
 * risquer un corrigé faux sur le niveau 2 (voir la note de `AdaptateurFeuilleExercices` : la
 * correction doit toujours être resynthétisée depuis des valeurs déjà connues et correctes).
 *
 * 6 questions par instance — une par écran RÉELLEMENT traversé côté interactif (voir
 * `moteur/sessionCaracteristiquesAlgebriques.ts`, séquence niveau 1) : ordonnée à l'origine → CE →
 * domaine → isolement (zéros) → séparation (`valeur_absolue`/`carre`) OU débarrasser (les 4 autres
 * familles) → zéros. Chaque consigne réutilise TEXTUELLEMENT ce que l'écran affiche
 * (`ui/formatCaracteristiquesAlgebriques.ts` — `instructionIsolement`, `instructionDebarrasser`,
 * `INSTRUCTION_ZEROS`), jamais reformulée indépendamment. `regroupable` non activé : plusieurs
 * questions par instance (voir `AdaptateurFeuilleExercices.regroupable`, condition explicite "une
 * seule question par instance").
 *
 * Correction : RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`ceAttendues`, `domaineAttendu`, `zerosNiveau1`...) et les mêmes fonctions de formatage LaTeX que
 * l'écran interactif (`formatEquationIsoleeLatex`, `formatEquationsSepareesLatex`,
 * `formatEquationDebarrasseeLatex`, `formatOrdonneeExacteLatex`, `formatCEAttenduesLatex`,
 * `formatZerosAttendusLatex`) — jamais recalculée indépendamment.
 */

/** `[base](ax+b) = -k`/deux équations séparées/équation débarrassée : ce module ne connaît que le
 * niveau 1 — la casse `niveau2` n'est jamais atteinte (garantie par `genererInstanceNiveau1`
 * ci-dessous et par `construireNiveau1AvecFamille`), mais les fonctions de `ui/
 * formatCaracteristiquesAlgebriques.ts` réutilisées ici acceptent le type union complet
 * (`ExerciceCaracteristiquesAlgebriques`) — jamais besoin d'un cast, `ExerciceCaracteristiquesAlgebriquesNiveau1`
 * est un membre valide de cette union.
 */

/** `domf = ...` en LaTeX, à partir de `ReponseDomaine` (jamais du format `EtatMorceauFraction` de
 * `ui/apercuDomaine.ts`, qui décrit une saisie écran en cours de construction, pas une valeur déjà
 * calculée) — seules 3 des 4 formes sont jamais atteintes par ce générateur (`reel`/`prive_points`/
 * `intervalles`, voir `domaineAttendu` : `vide` n'est jamais la bonne réponse), mais les 4 sont
 * couvertes pour rester un formatage complet. */
function formatMorceauLatex(m: Morceau): string {
  const gauche = typeof m.borneGauche === "number" ? formatValeurExacteLatex(m.borneGauche) : "-\\infty";
  const droite = typeof m.borneDroite === "number" ? formatValeurExacteLatex(m.borneDroite) : "+\\infty";
  return `${m.crochetGauche}${gauche} \\;;\\; ${droite}${m.crochetDroit}`;
}

function formatDomaineAttenduLatex(domaine: ReponseDomaine): string {
  switch (domaine.forme) {
    case "reel":
      return "\\mathbb{R}";
    case "vide":
      return "\\varnothing";
    case "prive_points":
      return `\\mathbb{R} \\setminus \\{${domaine.points.map(formatValeurExacteLatex).join(" ; ")}\\}`;
    case "intervalles":
      return domaine.intervalles.map(formatMorceauLatex).join(" \\cup ");
  }
}

/** Toujours niveau 1 (voir la note de tête de fichier) — `genererExerciceCaracteristiquesAlgebriques`
 * (export zéro-argument de `./index`) construit déjà exclusivement des instances niveau 1, cette
 * fonction ne fait que resserrer le type union à `ExerciceCaracteristiquesAlgebriquesNiveau1` pour
 * le contrat `AdaptateurFeuilleExercices<T>` (jamais une seconde logique de tirage de famille
 * dupliquée ici). */
function genererInstanceNiveau1(): ExerciceCaracteristiquesAlgebriquesNiveau1 {
  const instance = genererExerciceCaracteristiquesAlgebriques();
  if (instance.niveau !== "niveau1") {
    throw new Error("genererInstanceNiveau1 : genererExerciceCaracteristiquesAlgebriques a produit une instance niveau 2 inattendue");
  }
  return instance;
}

function construireEnonceCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): SectionExercice {
  const questionSeparationOuDebarrasser = necessiteSeparation(instance)
    ? { consigne: [texte("Sépare l'équation isolée en deux équations.")], reponse: { type: "lignes" as const, nombre: 2 } }
    : { consigne: [texte(instructionDebarrasser(instance.famille))], reponse: { type: "lignes" as const, nombre: 1 } };

  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatEquationNiveau1Latex(instance)), texte(".")],
    questions: [
      {
        consigne: [texte("Quelle est l'ordonnée à l'origine de cette fonction ? (forme exacte ; indique si elle n'existe pas.)")],
        reponse: { type: "lignes", nombre: 1 },
      },
      {
        consigne: [texte("Quelles sont les conditions d'existence de cette fonction ?")],
        reponse: { type: "lignes", nombre: 2 },
      },
      {
        consigne: [texte("Quel est le domaine de définition de cette fonction ?")],
        reponse: { type: "lignes", nombre: 1 },
      },
      {
        consigne: [texte(instructionIsolement(instance.famille))],
        reponse: { type: "lignes", nombre: 1 },
      },
      questionSeparationOuDebarrasser,
      {
        consigne: [texte(INSTRUCTION_ZEROS)],
        reponse: { type: "lignes", nombre: 2 },
      },
    ],
  };
}

function construireCorrectionCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];

  // a) Ordonnée à l'origine.
  if (!existeOrdonneeNiveau1(instance)) {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("a) L'ordonnée à l'origine n'existe pas : x = 0 n'appartient pas au domaine de définition.")],
    });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("a) Ordonnée à l'origine : "), latex(`f(0) = ${formatOrdonneeExacteLatex(instance)}`)],
    });
  }

  // b) Conditions d'existence.
  const conditions = ceAttendues(instance);
  if (conditions.length === 0) {
    blocs.push({ type: "paragraphe", fragments: [texte("b) Cette fonction n'a aucune condition d'existence.")] });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("b) Conditions d'existence : "), latex(formatCEAttenduesLatex(conditions) as string)],
    });
  }

  // c) Domaine de définition.
  blocs.push({
    type: "paragraphe",
    fragments: [texte("c) Domaine de définition : "), latex(`\\mathrm{dom}\\,f = ${formatDomaineAttenduLatex(domaineAttendu(instance))}`)],
  });

  // d) Isolement.
  blocs.push({
    type: "paragraphe",
    fragments: [texte("d) L'équation isolée : "), latex(formatEquationIsoleeLatex(instance))],
  });

  // e) Séparation ou "se débarrasser de...".
  if (necessiteSeparation(instance)) {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("e) On sépare en deux équations : "), latex(formatEquationsSepareesLatex(instance))],
    });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [texte(`e) ${instructionDebarrasser(instance.famille)} On obtient : `), latex(formatEquationDebarrasseeLatex(instance))],
    });
  }

  // f) Zéros.
  const zeros = zerosNiveau1(instance);
  if (zeros.length === 0) {
    blocs.push({ type: "paragraphe", fragments: [texte("f) Cette fonction n'a aucun zéro.")] });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("f) Zéros attendus : "), latex(formatZerosAttendusLatex(zeros) as string)],
    });
  }

  return blocs;
}

export const adaptateurEvaluationCaracteristiquesAlgebriques: AdaptateurFeuilleExercices<ExerciceCaracteristiquesAlgebriquesNiveau1> = {
  titreDocument: "Étudier algébriquement une fonction de référence — Évaluation",
  nomFichierBase: "caracteristiques-algebriques",
  genererInstance: genererInstanceNiveau1,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireNiveau1AvecFamille(id as FamilleReference),
  construireEnonce: construireEnonceCaracteristiquesAlgebriques,
  construireCorrection: construireCorrectionCaracteristiquesAlgebriques,
};
