import type { ExerciceCaracteristiquesAlgebriques, ExerciceCaracteristiquesAlgebriquesNiveau1, ReponseDomaine } from "../../core/caracteristiquesAlgebriques.types";
import type { FamilleReference } from "../../core/fonctionsReference.types";
import type { Morceau } from "../../core/inequation.types";
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
import {
  ceAttendues,
  domaineAttendu,
  equationIsoleeAdmetSolution,
  existeOrdonneeNiveau1,
  necessiteSeparation,
  pariteAttendue,
  zerosNiveau1,
} from "../../moteur/verificationCaracteristiquesAlgebriques";
import {
  INSTRUCTION_ZEROS,
  formatCEAttenduesLatex,
  formatEquationDebarrasseeLatex,
  formatEquationIsoleeLatex,
  formatEquationNiveau1Latex,
  formatBaseLatex,
  formatEquationsSepareesLatex,
  formatFractionLatex,
  formatOrdonneeExacteLatex,
  formatP1Latex,
  formatPariteLabel,
  formatValeurExacteLatex,
  formatZerosAttendusLatex,
  instructionDebarrasser,
  instructionIsolement,
} from "../../ui/formatCaracteristiquesAlgebriques";
import { CATALOGUE_VARIANTES_FAMILLE_NIVEAU, construireAvecVarianteFamilleNiveau, genererExerciceFamilleNiveauAleatoire } from "./index";
import {
  baremeNiveau2,
  construireCorrectionNiveau2,
  construireEnonceNiveau2,
  correctionDetailleeNiveau2,
  difficulteNiveau2,
  enoncePapierNiveau2,
  reponseBreveNiveau2,
} from "./exportEvaluationNiveau2";
import { profilCaracteristiquesAlgebriques, LIBELLE_CAS_ETUDE_ALGEBRIQUE } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCaracteristiquesAlgebriquesNiveau1>` pour gen13
 * (Étudier algébriquement une fonction de référence, chapitre 3 — `AppCaracteristiquesAlgebriques.tsx`).
 *
 * NIVEAUX 1 ET 2 (mise à jour : demande de l'utilisateur, le sélecteur de variantes des feuilles doit
 * proposer la famille ET le niveau — catalogue `CATALOGUE_VARIANTES_FAMILLE_NIVEAU`). Le niveau 2 est
 * rédigé dans `exportEvaluationNiveau2.ts` ; ce fichier garde le niveau 1 et aiguille selon
 * `instance.niveau`. Note d'origine, conservée pour l'historique : niveau 1 uniquement, car les deux
 * niveaux ne sont PAS deux étapes progressives d'une même séance (voir
 * l'ancien écran de réglages, supprimé depuis) mais un réglage professeur qui s'applique
 * UNIFORMÉMENT à toute une série (`niveau1` par défaut à l'écran, jamais mélangé — voir
 * `creerGenerateurCaracteristiquesAlgebriques`) : ce sont deux modes de générateur indépendants,
 * pas un seul exercice à couvrir en plusieurs questions. Le niveau 2 fait en outre diverger la
 * séquence d'écrans par FAMILLE (`carre`/`cube` : 2 phases après isolement ; `inverse`/
 * `racine_cubique` : 3 ; `racine_carree`/`valeur_absolue` : jusqu'à 5, avec un nombre de validations
 * variable), avec des structures de données internes différentes par famille
 * (`ExerciceNiveau2Quadratique`/`RacineCarree`/`ValeurAbsolue`/`Cubique`) — bien plus risqué à
 * resynthétiser fidèlement sur papier qu'à couvrir correctement dans le temps imparti. Le niveau 1
 * est strictement homogène (7-8 phases fixes, une structure de données unique) et correspond au
 * réglage par défaut de l'écran interactif, retenu ici en toute sécurité mathématique plutôt que de
 * risquer un corrigé faux sur le niveau 2 (voir la note de `AdaptateurFeuilleExercices` : la
 * correction doit toujours être resynthétisée depuis des valeurs déjà connues et correctes).
 *
 * 6 ou 7 questions par instance — une par écran RÉELLEMENT traversé côté interactif (voir
 * `moteur/sessionCaracteristiquesAlgebriques.ts`, séquence niveau 1) : CE → domaine → ordonnée à
 * l'origine → parité → isolement (zéros) → séparation (`valeur_absolue`/`carre`) OU débarrasser (les
 * 4 autres familles), absente si l'équation isolée n'a aucune solution → zéros. Chaque consigne réutilise TEXTUELLEMENT ce que l'écran affiche
 * (`ui/formatCaracteristiquesAlgebriques.ts` — `instructionIsolement`, `instructionDebarrasser`,
 * `INSTRUCTION_ZEROS`), jamais reformulée indépendamment. `regroupable` non activé : plusieurs
 * questions par instance (voir `AdaptateurFeuilleExercices.regroupable`, condition explicite "une
 * seule question par instance").
 *
 * Correction : RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`ceAttendues`, `domaineAttendu`, `pariteAttendue`, `zerosNiveau1`...) et les mêmes fonctions de
 * formatage LaTeX que l'écran interactif (`formatEquationIsoleeLatex`, `formatEquationsSepareesLatex`,
 * `formatEquationDebarrasseeLatex`, `formatOrdonneeExacteLatex`, `formatCEAttenduesLatex`,
 * `formatPariteLabel`, `formatZerosAttendusLatex`) — jamais recalculée indépendamment.
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

function construireEnonceCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): SectionExercice {
  // Sans solution à l'équation isolée (K<0), pas de question intermédiaire — même règle que
  // `phaseApresIsolement` côté interactif (`equationIsoleeAdmetSolution`).
  const questionsIntermediaires = !equationIsoleeAdmetSolution(instance)
    ? []
    : [
        necessiteSeparation(instance)
          ? { consigne: [texte("Sépare l'équation isolée en deux équations.")] }
          : { consigne: [texte(instructionDebarrasser(instance.famille))] },
      ];

  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatEquationNiveau1Latex(instance)), texte(".")],
    questions: [
      {
        consigne: [texte("Quelles sont les conditions d'existence de cette fonction ?")],
      },
      {
        consigne: [texte("Quel est le domaine de définition de cette fonction ?")],
      },
      {
        consigne: [texte("Quelle est l'ordonnée à l'origine de cette fonction ? (forme exacte ; indique si elle n'existe pas.)")],
      },
      {
        consigne: [texte("Cette fonction est-elle paire, impaire, ou ni l'une ni l'autre ? Justifie.")],
      },
      {
        consigne: [texte(instructionIsolement(instance.famille))],
      },
      ...questionsIntermediaires,
      {
        consigne: [texte(INSTRUCTION_ZEROS)],
      },
    ],
  };
}

function construireCorrectionCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];

  // a) Conditions d'existence.
  const conditions = ceAttendues(instance);
  if (conditions.length === 0) {
    blocs.push({ type: "paragraphe", fragments: [texte("a) Cette fonction n'a aucune condition d'existence.")] });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("a) Conditions d'existence : "), latex(formatCEAttenduesLatex(conditions) as string)],
    });
  }

  // b) Domaine de définition.
  blocs.push({
    type: "paragraphe",
    fragments: [texte("b) Domaine de définition : "), latex(`\\mathrm{dom}\\,f = ${formatDomaineAttenduLatex(domaineAttendu(instance))}`)],
  });

  // c) Ordonnée à l'origine (après le domaine, dont son existence dépend).
  if (!existeOrdonneeNiveau1(instance)) {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("c) L'ordonnée à l'origine n'existe pas : x = 0 n'appartient pas au domaine de définition.")],
    });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [texte("c) Ordonnée à l'origine : "), latex(`f(0) = ${formatOrdonneeExacteLatex(instance)}`)],
    });
  }

  // d) Parité.
  blocs.push({
    type: "paragraphe",
    fragments: [texte(`d) Cette fonction est ${formatPariteLabel(pariteAttendue(instance))}.`)],
  });

  // e) Isolement.
  blocs.push({
    type: "paragraphe",
    fragments: [texte("e) L'équation isolée : "), latex(formatEquationIsoleeLatex(instance))],
  });

  const zeros = zerosNiveau1(instance);

  // f) Séparation ou "se débarrasser de..." — absente sans solution (voir l'énoncé ci-dessus) : la
  // lettre des zéros suit donc dynamiquement.
  let lettreZeros = "f";
  if (zeros.length > 0) {
    lettreZeros = "g";
    if (necessiteSeparation(instance)) {
      blocs.push({
        type: "paragraphe",
        fragments: [texte("f) On sépare en deux équations : "), latex(formatEquationsSepareesLatex(instance))],
      });
    } else {
      blocs.push({
        type: "paragraphe",
        fragments: [texte(`f) ${instructionDebarrasser(instance.famille)} On obtient : `), latex(formatEquationDebarrasseeLatex(instance))],
      });
    }
  }

  // Zéros.
  if (zeros.length === 0) {
    blocs.push({
      type: "paragraphe",
      fragments: [texte(`${lettreZeros}) Cette fonction n'a aucun zéro : le membre de droite de l'équation isolée est négatif, ce que la fonction de référence ne peut jamais valoir.`)],
    });
  } else {
    blocs.push({
      type: "paragraphe",
      fragments: [texte(`${lettreZeros}) Zéros attendus : `), latex(formatZerosAttendusLatex(zeros) as string)],
    });
  }

  return blocs;
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème) —
// méthode `.claude/rules/feuilles-evaluations.md`. Toutes les valeurs viennent des MÊMES fonctions
// que l'écran interactif (`ceAttendues`, `domaineAttendu`, `pariteAttendue`, `zerosNiveau1`,
// `formatEquationIsoleeLatex`...) : jamais une seconde source.
//
// Étapes (lettres `sousQuestion`, dans l'ordre des écrans et de `construireEnonce`) : a CE, b domaine,
// c ordonnée à l'origine, d parité, e isolement, puis f séparation/« se débarrasser » (absente sans
// solution) et enfin les zéros (f ou g).
// ============================================================================

type EtapeGen13 = "ce" | "domaine" | "ordonnee" | "parite" | "isolement" | "intermediaire" | "zeros";

const LETTRES_ETAPES = "abcdefg";

function etapesDeLInstance(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): EtapeGen13[] {
  return ["ce", "domaine", "ordonnee", "parite", "isolement", ...(equationIsoleeAdmetSolution(instance) ? (["intermediaire"] as const) : []), "zeros"];
}

function lettreEtape(instance: ExerciceCaracteristiquesAlgebriquesNiveau1, etape: EtapeGen13): string {
  return LETTRES_ETAPES[etapesDeLInstance(instance).indexOf(etape)];
}

function kNumerique(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): number {
  return instance.k.num / instance.k.den;
}

/** ` + k` / ` - |k|` / `` (k nul) — même convention que `formatEquationNiveau1Latex`. */
function termeKLatex(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): string {
  const { k } = instance;
  if (k.num === 0) return "";
  return k.num > 0 ? ` + ${formatFractionLatex(k)}` : ` - ${formatFractionLatex({ num: -k.num, den: k.den })}`;
}

const NOM_BASE: Record<FamilleReference, string> = {
  carre: "un carré",
  valeur_absolue: "une valeur absolue",
  racine_carree: "une racine carrée",
  cube: "un cube",
  racine_cubique: "une racine cubique",
  inverse: "un inverse",
};

function domaineLatex(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): string {
  return `\\mathrm{dom}\\,f = ${formatDomaineAttenduLatex(domaineAttendu(instance))}`;
}

function ordonneeFragments(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): FragmentConsigne[] {
  const ordonnee = formatOrdonneeExacteLatex(instance);
  return ordonnee === null ? [texte("pas d'ordonnée à l'origine ("), latex("0 \\notin \\mathrm{dom}\\,f"), texte(")")] : [latex(`f(0) = ${ordonnee}`)];
}

function zerosFragments(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): FragmentConsigne[] {
  const zeros = formatZerosAttendusLatex(zerosNiveau1(instance));
  return zeros === null ? [texte("aucun zéro")] : [texte(zerosNiveau1(instance).length > 1 ? "zéros : " : "zéro : "), latex(zeros)];
}

function ceFragments(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): FragmentConsigne[] {
  const ce = formatCEAttenduesLatex(ceAttendues(instance));
  return ce === null ? [texte("aucune condition d'existence")] : [texte("CE : "), latex(ce)];
}

/** Justification de la parité (corrigé, étape d), dans le même ordre que `pariteAttendue` : domaine
 * symétrique d'abord, puis comparaison de f(−x) avec f(x) et −f(x). */
function justificationParite(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): FragmentConsigne[] {
  const { famille, a, b } = instance;
  const p = formatValeurExacteLatex(-b / a);
  if (famille === "racine_carree") {
    return [texte("Le domaine "), latex(formatDomaineAttenduLatex(domaineAttendu(instance))), texte(" n'est pas symétrique par rapport à 0 : f n'est ni paire ni impaire.")];
  }
  if (famille === "inverse" && b !== 0) {
    return [texte("Le domaine "), latex(formatDomaineAttenduLatex(domaineAttendu(instance))), texte(" n'est pas symétrique par rapport à 0 (la valeur exclue n'est pas 0) : f n'est ni paire ni impaire.")];
  }
  if (b !== 0) {
    return [
      texte("Le graphique de f est celui de la fonction de référence translaté horizontalement : son axe ou son centre de symétrie se trouve en "),
      latex(`x = ${p}`),
      texte(", pas en 0. f n'est donc ni paire ni impaire."),
    ];
  }
  const kTerme = termeKLatex(instance);
  const fMoinsX = `f(-x) = ${formatBaseLatex(famille, formatP1Latex(-a, 0))}${kTerme}`;
  if (famille === "carre" || famille === "valeur_absolue") {
    return [latex(`${fMoinsX} = ${formatBaseLatex(famille, formatP1Latex(a, 0))}${kTerme} = f(x)`), texte(" : f est paire.")];
  }
  const oppose = `-${formatBaseLatex(famille, formatP1Latex(a, 0))}`;
  if (kNumerique(instance) === 0) return [latex(`${fMoinsX} = ${oppose} = -f(x)`), texte(" : f est impaire.")];
  return [
    latex(`${fMoinsX} = ${oppose}${kTerme}`),
    texte(", différent de "),
    latex("f(x)"),
    texte(" et de "),
    latex(`-f(x) = ${oppose}${kTerme.startsWith(" + ") ? kTerme.replace(" + ", " - ") : kTerme.replace(" - ", " + ")}`),
    texte(" (à cause de la constante) : f n'est ni paire ni impaire."),
  ];
}

/** Rappel de la propriété utilisée à l'étape intermédiaire, en LaTeX (jamais une formule au clavier). */
function proprieteIntermediaireLatex(famille: FamilleReference): string {
  switch (famille) {
    case "valeur_absolue":
      return "|u| = K \\;(K>0) \\iff u = K \\text{ ou } -u = K";
    case "carre":
      return "u^2 = K \\;(K>0) \\iff u = \\sqrt{K} \\text{ ou } u = -\\sqrt{K}";
    case "inverse":
      return "\\dfrac{1}{u} = K \\iff 1 = K \\cdot u";
    case "racine_carree":
      return "\\sqrt{u} = K \\;(K \\geq 0) \\iff u = K^2";
    case "racine_cubique":
      return "\\sqrt[3]{u} = K \\iff u = K^3";
    case "cube":
      return "u^3 = K \\iff u = \\sqrt[3]{K}";
  }
}

function pourquoiAucunZero(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): FragmentConsigne[] {
  if (instance.famille === "inverse") return [texte("Un inverse ne vaut jamais 0 : l'équation isolée n'a aucune solution, f n'a aucun zéro.")];
  return [texte(`L'équation isolée demande qu'${NOM_BASE[instance.famille]} vaille un nombre négatif : c'est impossible, f n'a aucun zéro.`)];
}

function reponseBreveCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): FragmentConsigne[] {
  return [
    ...ceFragments(instance),
    texte(" ; "),
    latex(domaineLatex(instance)),
    texte(" ; "),
    ...ordonneeFragments(instance),
    texte(` ; f ${pariteAttendue(instance) === "ni" ? "n'est ni paire ni impaire" : `est ${formatPariteLabel(pariteAttendue(instance))}`} ; `),
    ...zerosFragments(instance),
  ];
}

function difficulteCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): 1 | 2 | 3 {
  // CE effective (et donc domaine restreint, ordonnée parfois inexistante) : plus de pièges.
  return instance.famille === "racine_carree" || instance.famille === "inverse" ? 3 : 2;
}

function correctionDetailleeCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): EtapeCorrection[] {
  const L = (etape: EtapeGen13) => lettreEtape(instance, etape);
  const { famille, a } = instance;
  const conditions = ceAttendues(instance);
  const etapes: EtapeCorrection[] = [];

  // a) Conditions d'existence.
  etapes.push({
    label: "Méthode",
    sousQuestion: L("ce"),
    fragments: [texte("Seuls un dénominateur (non nul) et une racine carrée (radicande positif ou nul) imposent une condition ; le carré, le cube, la racine cubique et la valeur absolue n'en imposent aucune.")],
  });
  if (famille === "racine_carree") {
    etapes.push({
      label: "Calcul",
      sousQuestion: L("ce"),
      fragments: [latex(`${formatP1Latex(a, instance.b)} \\geq 0`), texte(a < 0 ? " : on divise par a < 0, le sens de l'inégalité s'inverse." : " : on divise par a > 0, le sens ne change pas.")],
    });
  }
  etapes.push({ label: "Conclusion", sousQuestion: L("ce"), fragments: conditions.length === 0 ? [texte("Aucune condition d'existence.")] : [latex(formatCEAttenduesLatex(conditions) as string)] });

  // b) Domaine.
  etapes.push({ label: "Conclusion", sousQuestion: L("domaine"), fragments: [latex(domaineLatex(instance))] });

  // c) Ordonnée à l'origine.
  if (!existeOrdonneeNiveau1(instance)) {
    etapes.push({ label: "Conclusion", sousQuestion: L("ordonnee"), fragments: [latex("0 \\notin \\mathrm{dom}\\,f"), texte(" : f(0) n'existe pas, pas d'ordonnée à l'origine.")] });
  } else {
    etapes.push({ label: "Calcul", sousQuestion: L("ordonnee"), fragments: [latex(`f(0) = ${formatOrdonneeExacteLatex(instance)}`)] });
  }

  // d) Parité.
  etapes.push({
    label: "Méthode",
    sousQuestion: L("parite"),
    fragments: [texte("Le domaine doit être symétrique par rapport à 0 ; on compare ensuite "), latex("f(-x)"), texte(" à "), latex("f(x)"), texte(" et à "), latex("-f(x)"), texte(".")],
  });
  etapes.push({ label: "Conclusion", sousQuestion: L("parite"), fragments: justificationParite(instance) });

  // e) Isolement.
  etapes.push({ label: "Méthode", sousQuestion: L("isolement"), fragments: [texte("On résout f(x) = 0 : la constante passe dans l'autre membre, avec le signe opposé.")] });
  etapes.push({ label: "Calcul", sousQuestion: L("isolement"), fragments: [latex(formatEquationIsoleeLatex(instance))] });

  // f) Séparation / se débarrasser de la fonction de référence.
  if (equationIsoleeAdmetSolution(instance)) {
    etapes.push({ label: "Méthode", sousQuestion: L("intermediaire"), fragments: [latex(proprieteIntermediaireLatex(famille))] });
    etapes.push({
      label: "Calcul",
      sousQuestion: L("intermediaire"),
      fragments: [latex(necessiteSeparation(instance) ? formatEquationsSepareesLatex(instance) : formatEquationDebarrasseeLatex(instance))],
    });
  }

  // Zéros.
  const zeros = zerosNiveau1(instance);
  if (zeros.length === 0) {
    etapes.push({ label: "Conclusion", sousQuestion: L("zeros"), fragments: pourquoiAucunZero(instance) });
  } else {
    etapes.push({ label: "Méthode", sousQuestion: L("zeros"), fragments: [texte("On résout chaque équation du premier degré obtenue (isoler x).")] });
    etapes.push({ label: "Conclusion", sousQuestion: L("zeros"), fragments: [latex(formatZerosAttendusLatex(zeros) as string)] });
  }

  // Piège ciblé, rattaché à l'étape qu'il concerne.
  if (famille === "racine_carree" && a < 0) {
    etapes.push({ label: "Piège", sousQuestion: L("ce"), fragments: [texte("a est négatif : en divisant l'inégalité par a, son sens s'inverse — le domaine est une demi-droite tournée vers la gauche.")] });
  } else if ((famille === "carre" || famille === "valeur_absolue") && zeros.length === 2) {
    etapes.push({ label: "Piège", sousQuestion: L("intermediaire"), fragments: [texte(`${famille === "carre" ? "Un carré" : "Une valeur absolue"} égal à un nombre positif donne DEUX équations : ne pas oublier celle avec le signe moins.`)] });
  } else if (zeros.length === 0) {
    etapes.push({ label: "Piège", sousQuestion: L("zeros"), fragments: [texte("Ne pas « résoudre » quand même l'équation isolée : elle n'a aucune solution, il n'y a rien à calculer.")] });
  } else if (instance.b === 0 && famille !== "carre" && famille !== "valeur_absolue" && famille !== "racine_carree" && kNumerique(instance) !== 0) {
    etapes.push({ label: "Piège", sousQuestion: L("parite"), fragments: [texte("La fonction de référence est impaire, mais la constante ajoutée détruit cette imparité.")] });
  } else if (!existeOrdonneeNiveau1(instance)) {
    etapes.push({ label: "Piège", sousQuestion: L("ordonnee"), fragments: [texte("Ne pas calculer f(0) sans vérifier d'abord que 0 appartient au domaine.")] });
  } else if (famille === "inverse") {
    etapes.push({ label: "Piège", sousQuestion: L("domaine"), fragments: [texte("La valeur qui annule le dénominateur est exclue du domaine : elle ne peut être ni l'abscisse d'un point du graphique, ni un zéro.")] });
  } else if (famille === "racine_carree") {
    etapes.push({ label: "Piège", sousQuestion: L("domaine"), fragments: [texte("Le radicande peut valoir 0 : la borne du domaine est incluse (crochet fermé).")] });
  } else if (famille === "cube" || famille === "racine_cubique") {
    etapes.push({ label: "Piège", sousQuestion: L("ce"), fragments: [texte(`${famille === "cube" ? "Le cube" : "La racine cubique"} n'impose aucune condition : ne pas exclure de valeur du domaine.`)] });
  } else {
    etapes.push({ label: "Piège", sousQuestion: L("isolement"), fragments: [texte("La constante change de signe en passant dans l'autre membre.")] });
  }
  return etapes;
}

function baremeCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): BaremeExercice {
  const L = (etape: EtapeGen13) => lettreEtape(instance, etape);
  const { famille, a, b } = instance;
  const avecIntermediaire = equationIsoleeAdmetSolution(instance);
  const criteres: CritereBareme[] = [
    { sousQuestion: L("ce"), critere: ceFragments(instance), points: 0.5 },
    { sousQuestion: L("domaine"), critere: [latex(domaineLatex(instance))], points: 0.5 },
    { sousQuestion: L("ordonnee"), critere: ordonneeFragments(instance), points: 0.5 },
    { sousQuestion: L("parite"), critere: [texte(`Parité (${formatPariteLabel(pariteAttendue(instance))}) justifiée par le domaine ou le calcul de f(−x)`)], points: 1 },
    { sousQuestion: L("isolement"), critere: [texte("Équation isolée : "), latex(formatEquationIsoleeLatex(instance))], points: 0.5 },
    ...(avecIntermediaire
      ? [
          {
            sousQuestion: L("intermediaire"),
            critere: [texte(necessiteSeparation(instance) ? "Deux équations : " : "Équation sans la fonction de référence : "), latex(necessiteSeparation(instance) ? formatEquationsSepareesLatex(instance) : formatEquationDebarrasseeLatex(instance))],
            points: 0.5,
          },
        ]
      : []),
    { sousQuestion: L("zeros"), critere: zerosNiveau1(instance).length === 0 ? [texte("Aucun zéro, justifié")] : zerosFragments(instance), points: avecIntermediaire ? 0.5 : 1 },
  ];
  const erreurs: ErreurFrequente[] = [];
  if (famille === "racine_carree" && a < 0) erreurs.push({ description: [texte("Sens de l'inégalité non inversé en divisant par a < 0")], cout: "0 pt sur a) et b)" });
  if (!existeOrdonneeNiveau1(instance)) erreurs.push({ description: [texte("Calculer f(0) alors que 0 n'appartient pas au domaine")], cout: "0 pt sur c)" });
  if ((famille === "carre" || famille === "valeur_absolue") && b !== 0) erreurs.push({ description: [texte("Déclarer f paire parce que la fonction de référence l'est, alors que l'expression est décalée")], cout: "0 pt sur d)" });
  if (famille !== "carre" && famille !== "valeur_absolue" && famille !== "racine_carree" && b === 0 && kNumerique(instance) !== 0)
    erreurs.push({ description: [texte("Déclarer f impaire sans tenir compte de la constante ajoutée")], cout: "0 pt sur d)" });
  erreurs.push({ description: [texte("Constante passée dans l'autre membre sans changer de signe")], cout: "0 pt sur e), suite notée sans double pénalité" });
  if ((famille === "carre" || famille === "valeur_absolue") && zerosNiveau1(instance).length === 2) erreurs.push({ description: [texte("Une seule des deux équations écrite (oubli du signe moins)")], cout: "moitié des points de la suite" });
  if (zerosNiveau1(instance).length === 0 && famille !== "inverse") erreurs.push({ description: [texte(`Des zéros « trouvés » alors qu'${NOM_BASE[famille]} ne peut pas valoir un nombre négatif`)], cout: "0 pt sur les zéros" });
  return {
    reponseFinale: reponseBreveCaracteristiquesAlgebriques(instance),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Domaine écrit en intervalle(s) ou en notation d'ensemble")],
      [texte("Valeurs exactes sous une forme équivalente non simplifiée (fraction non réduite)")],
    ],
  };
}

/** Énoncé papier : la fonction et la consigne globale — les 6 ou 7 sous-questions sont les étapes
 * des écrans, reprises dans le corrigé. */
function enoncePapierCaracteristiquesAlgebriques(instance: ExerciceCaracteristiquesAlgebriquesNiveau1): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Étudie algébriquement la fonction "),
        latex(formatEquationNiveau1Latex(instance)),
        texte(" : détermine ses conditions d'existence et son domaine de définition, son ordonnée à l'origine (valeur exacte, ou justifie qu'elle n'existe pas), sa parité (justifie) et ses zéros."),
      ],
      questions: [],
    },
  };
}

type Instance = ExerciceCaracteristiquesAlgebriques;

/** Aiguillage niveau 1 / niveau 2 — chaque niveau garde ses propres fonctions (mêmes sources que
 * l'écran interactif). */
function selonNiveau<R>(niveau1: (e: ExerciceCaracteristiquesAlgebriquesNiveau1) => R, niveau2: (e: Exclude<Instance, ExerciceCaracteristiquesAlgebriquesNiveau1>) => R) {
  return (instance: Instance): R => (instance.niveau === "niveau1" ? niveau1(instance) : niveau2(instance));
}

export const adaptateurEvaluationCaracteristiquesAlgebriques: AdaptateurFeuilleExercices<Instance> = {
  profilInstance: profilCaracteristiquesAlgebriques,
  libelleCasParticulier: LIBELLE_CAS_ETUDE_ALGEBRIQUE,
  titreDocument: "Étudier algébriquement une fonction de référence — Évaluation",
  nomFichierBase: "caracteristiques-algebriques",
  genererInstance: genererExerciceFamilleNiveauAleatoire,
  catalogueVariantes: CATALOGUE_VARIANTES_FAMILLE_NIVEAU,
  genererInstanceAvecVariante: construireAvecVarianteFamilleNiveau,
  construireEnonce: selonNiveau(construireEnonceCaracteristiquesAlgebriques, construireEnonceNiveau2),
  construireCorrection: selonNiveau(construireCorrectionCaracteristiquesAlgebriques, construireCorrectionNiveau2),
  difficulte: selonNiveau(difficulteCaracteristiquesAlgebriques, difficulteNiveau2),
  reponseBreve: selonNiveau(reponseBreveCaracteristiquesAlgebriques, reponseBreveNiveau2),
  correctionDetaillee: selonNiveau(correctionDetailleeCaracteristiquesAlgebriques, correctionDetailleeNiveau2),
  bareme: selonNiveau(baremeCaracteristiquesAlgebriques, baremeNiveau2),
  enoncePapier: selonNiveau(enoncePapierCaracteristiquesAlgebriques, enoncePapierNiveau2),
  dureeMinutes: 10,
};
