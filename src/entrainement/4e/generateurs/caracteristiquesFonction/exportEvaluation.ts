import type { ExerciceCaracteristiquesFonction } from "../../core/caracteristiquesFonction.types";
import type { Morceau } from "../../core/inequation.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  constanceAttendueCaracteristiques,
  croissanceAttendueCaracteristiques,
  decroissanceAttendueCaracteristiques,
  domaineCaracteristiques,
  evaluerCourbeCaracteristiques,
  existeOrdonneeCaracteristiques,
  existeValeurEnVCaracteristiques,
} from "../../moteur/verificationCaracteristiquesFonction";
import { genererExerciceCaracteristiquesFonction } from "./index";
import { correctionDetailleeCaracteristiquesFonction } from "./corrigeDetaille";
import { profilCaracteristiquesFonction, LIBELLE_CAS_LECTURE_GRAPHIQUE } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCaracteristiquesFonction>` pour gen12 (Lire les
 * caractéristiques sur un graphique) — feuille d'évaluation.
 *
 * Pas de `CATALOGUE_VARIANTES`/`construireAvecVarianteId` ici : `generateurs/caracteristiquesFonction/index.ts`
 * n'exporte qu'un `genererExerciceCaracteristiquesFonction` sans argument — `catalogueVariantes`/
 * `genererInstanceAvecVariante` restent donc omis (contrat optionnel, voir `genererFeuilleExercices.ts`).
 *
 * `regroupable` NON défini : ce générateur a un graphique (`enteteHtml`) ET 8 questions distinctes
 * par instance — les 2 seules conditions qui, indépendamment déjà, désactivent ce mécanisme (voir
 * la doc de `AdaptateurFeuilleExercices.regroupable`).
 *
 * L'écran interactif (`AppCaracteristiquesFonction.tsx`) déroule 8 phases FIXES, toujours dans le
 * même ordre, sur le MÊME graphique affiché en permanence (jamais de variation d'un écran à
 * l'autre, contrairement aux autres générateurs à indices/dévoilement progressif) — reproduit ici
 * par UNE seule image de graphique (`construireGrapheCaracteristiques`, partagée par toutes les
 * questions) suivie de 8 questions, une par phase, dans le même ordre : domaine, zéros, croissance,
 * décroissance, constance, ordonnée à l'origine, valeur en x=v, équations des asymptotes. Les
 * consignes ci-dessous recopient mot pour mot les `<p className="prompt-text">` des 8 composants
 * `Etape*Caracteristiques.tsx` (source de vérité pour la formulation exacte vue par l'élève).
 *
 * Corrigé : chaque réponse est relue directement sur des champs déjà calculés de l'instance via les
 * fonctions du moteur de vérification (`moteur/verificationCaracteristiquesFonction.ts` — SEULE
 * source de vérité, partagée avec l'écran), jamais redérivée indépendamment ici.
 *
 * Graphique (`construireGrapheCaracteristiques`) : la courbe est composite (7 zones + une branche
 * hyperbolique, jamais une seule formule `(x)=>y`), donc pas directement représentable par le
 * pattern `construireSvgFonction((x)=>f(x), viewBox)` utilisé tel quel par
 * `transformationsGraphiques/exportEvaluation.ts`/`export/svgGraphCyclo.ts` (aucun de ces deux
 * appelants n'a de discontinuité/asymptote à gérer). `construireSvgFonction` reste réutilisé pour
 * le tracé (axes, grille, échantillonnage de segments continus) — seul l'évaluateur passé en
 * argument est spécifique à gen12 (voir `evaluerPourSvgCaracteristiques` : force un `null` dans une
 * fenêtre étroite autour de `b5` et de `AV`, pour empêcher `construireSvgFonction` de relier par une
 * fausse ligne droite deux valeurs qui ne sont JAMAIS reliées sur la vraie courbe — même piège que
 * documenté en tête de `ui/mafsCaracteristiquesFonction.ts`, ici sans le luxe d'un moteur de tracé
 * conscient du domaine par segment explicite). Les marqueurs (cercles pleins/vides à la
 * discontinuité, au point creux `c`, aux bornes de gap, + asymptotes en pointillé) n'ont pas
 * d'équivalent dans `PointMarqueSvg` (seulement point plein/croix, jamais de cercle vide) : ajoutés
 * en post-traitement du `<svg>` déjà construit (`construireMarqueursSupplementaires`), avec une
 * transformation x/y→pixel DUPLIQUÉE de celle, interne et non exportée, de `svgGraph.ts` — même
 * principe que `ajusterAuRatio` dans `ui/mafsCaracteristiquesFonction.ts` (« dupliquée plutôt que
 * réexportée depuis mafsTransformation.ts... ne jamais risquer de régression sur les consommateurs
 * existants d'un si petit utilitaire pur »), jamais une modification de `svgGraph.ts` lui-même.
 */

import { construireGrapheCaracteristiques, formatMorceauxLatex, formatNombre } from "./figure";

function construireEnonceCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): SectionExercice {
  return {
    enteteFragments: [
      texte(
        "Le graphique ci-dessous représente une fonction f (trait plein : la courbe ; pointillé : asymptotes et discontinuité ; cercle plein : point appartenant à la courbe ; cercle vide : point exclu). Réponds aux questions suivantes en te basant uniquement sur la lecture du graphique.",
      ),
    ],
    enteteHtml: construireGrapheCaracteristiques(exercice),
    questions: [
      { consigne: [texte("Quel est le domaine de définition de cette fonction ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Quels sont les zéros de cette fonction ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Sur quels intervalles cette fonction est-elle strictement croissante ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Sur quels intervalles cette fonction est-elle strictement décroissante ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Sur quel(s) intervalle(s) cette fonction est-elle constante ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Quelle est l'ordonnée à l'origine de cette fonction ?")], reponse: { type: "lignes", nombre: 1 } },
      {
        consigne: [texte("La fonction est-elle définie en "), latex(`x = ${formatNombre(exercice.v)}`), texte(" ? Si oui, quelle est sa valeur ?")],
        reponse: { type: "lignes", nombre: 1 },
      },
      { consigne: [texte("Donne les équations des deux asymptotes.")], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): BlocCorrection[] {
  const blocs: BlocCorrection[] = [{ type: "html", html: construireGrapheCaracteristiques(exercice) }];

  blocs.push({
    type: "paragraphe",
    fragments: [texte("a) "), latex(`\\mathrm{dom}\\,f = ${formatMorceauxLatex(domaineCaracteristiques(exercice))}`), texte(".")],
  });

  const zerosTries = [...exercice.zeros].sort((a, b) => a - b);
  blocs.push({
    type: "paragraphe",
    fragments:
      zerosTries.length === 0
        ? [texte("b) Aucun zéro : la courbe ne recoupe jamais l'axe des abscisses.")]
        : [texte("b) "), latex(zerosTries.map((z) => `x = ${formatNombre(z)}`).join(" \\text{ ; } ")), texte(".")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("c) Croissante sur "), latex(formatMorceauxLatex(croissanceAttendueCaracteristiques(exercice))), texte(".")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("d) Décroissante sur "), latex(formatMorceauxLatex(decroissanceAttendueCaracteristiques(exercice))), texte(".")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("e) Constante sur "), latex(formatMorceauxLatex(constanceAttendueCaracteristiques(exercice))), texte(".")],
  });

  const ordonneeExiste = existeOrdonneeCaracteristiques(exercice);
  blocs.push({
    type: "paragraphe",
    fragments: ordonneeExiste
      ? [texte("f) "), latex(`f(0) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, 0))}`), texte(".")]
      : [texte("f) 0 n'appartient pas au domaine de définition : cette fonction n'a pas d'ordonnée à l'origine.")],
  });

  const valeurEnVExiste = existeValeurEnVCaracteristiques(exercice);
  blocs.push({
    type: "paragraphe",
    fragments: valeurEnVExiste
      ? [texte("g) "), latex(`f(${formatNombre(exercice.v)}) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, exercice.v))}`), texte(".")]
      : [texte("g) "), latex(`x = ${formatNombre(exercice.v)}`), texte(" n'appartient pas au domaine de définition : cette valeur n'existe pas.")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("h) "),
      latex(`AH \\equiv y = ${formatNombre(exercice.L)}`),
      texte(" et "),
      latex(`AV \\equiv x = ${formatNombre(exercice.AV)}`),
      texte("."),
    ],
  });

  return blocs;
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème).
// Les 8 lectures (une par écran, toujours dans le même ordre) sont les ÉTAPES a)…h) : sur papier,
// l'énoncé est le graphique + une consigne globale qui les énumère ; elles passent dans le corrigé.
// Toutes les valeurs viennent du moteur de vérification partagé avec l'écran
// (`moteur/verificationCaracteristiquesFonction.ts`), jamais recalculées ici.
// ============================================================================

const LEGENDE =
  "Le graphique ci-dessous représente une fonction f (trait plein : la courbe ; pointillé : asymptotes et discontinuité ; cercle plein : point appartenant à la courbe ; cercle vide : point exclu).";

/** Ensemble d'intervalles, ou ∅ s'il n'y en a aucun. */
function ensembleLatex(morceaux: Morceau[]): string {
  return morceaux.length === 0 ? "\\varnothing" : formatMorceauxLatex(morceaux);
}

function zerosLatex(exercice: ExerciceCaracteristiquesFonction): string | null {
  const zeros = [...exercice.zeros].sort((a, b) => a - b);
  return zeros.length === 0 ? null : zeros.map((z) => `x = ${formatNombre(z)}`).join(" \\text{ ; } ");
}

function ordonneeLatex(exercice: ExerciceCaracteristiquesFonction): string | null {
  return existeOrdonneeCaracteristiques(exercice) ? `f(0) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, 0))}` : null;
}

function valeurLatex(exercice: ExerciceCaracteristiquesFonction): string | null {
  return existeValeurEnVCaracteristiques(exercice) ? `f(${formatNombre(exercice.v)}) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, exercice.v))}` : null;
}

function asymptotesLatex(exercice: ExerciceCaracteristiquesFonction): string {
  return `AV \\equiv x = ${formatNombre(exercice.AV)} \\quad\\text{et}\\quad AH \\equiv y = ${formatNombre(exercice.L)}`;
}

function enoncePapierCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(LEGENDE)],
      enteteHtml: construireGrapheCaracteristiques(exercice),
      questions: [
        {
          consigne: [
            texte(
              "Lis sur le graphique les caractéristiques de f : son domaine de définition, ses zéros, les intervalles sur lesquels f est strictement croissante, strictement décroissante et constante, son ordonnée à l'origine, sa valeur en ",
            ),
            latex(`x = ${formatNombre(exercice.v)}`),
            texte(" (si elle existe) et les équations de ses deux asymptotes."),
          ],
        },
      ],
    },
    etapesParQuestion: [["a", "b", "c", "d", "e", "f", "g", "h"]],
  };
}

function reponseBreveCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): FragmentConsigne[] {
  const zeros = zerosLatex(exercice);
  const ordonnee = ordonneeLatex(exercice);
  const valeur = valeurLatex(exercice);
  return [
    texte("Domaine : "),
    latex(ensembleLatex(domaineCaracteristiques(exercice))),
    texte(" ; zéros : "),
    ...(zeros ? [latex(zeros)] : [texte("aucun")]),
    texte(" ; croissante sur "),
    latex(ensembleLatex(croissanceAttendueCaracteristiques(exercice))),
    texte(" ; décroissante sur "),
    latex(ensembleLatex(decroissanceAttendueCaracteristiques(exercice))),
    texte(" ; constante sur "),
    latex(ensembleLatex(constanceAttendueCaracteristiques(exercice))),
    texte(" ; "),
    ...(ordonnee ? [latex(ordonnee)] : [texte("pas d'ordonnée à l'origine")]),
    texte(" ; "),
    ...(valeur ? [latex(valeur)] : [latex(`f(${formatNombre(exercice.v)})`), texte(" n'existe pas")]),
    texte(" ; "),
    latex(asymptotesLatex(exercice)),
  ];
}

function baremeCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): BaremeExercice {
  const criteres: CritereBareme[] = [
    { sousQuestion: "a", critere: [texte("Domaine : toutes les exclusions, et seulement elles")], points: 0.5 },
    { sousQuestion: "b", critere: [texte("Zéros : tous, sans valeur en trop")], points: 0.5 },
    { sousQuestion: "c", critere: [texte("Intervalles de croissance (bornes et crochets)")], points: 0.5 },
    { sousQuestion: "d", critere: [texte("Intervalles de décroissance (bornes et crochets)")], points: 0.5 },
    { sousQuestion: "e", critere: [texte("Intervalle(s) de constance")], points: 0.5 },
    { sousQuestion: "f", critere: existeOrdonneeCaracteristiques(exercice) ? [texte("Ordonnée à l'origine")] : [texte("Absence d'ordonnée à l'origine (0 exclu du domaine)")], points: 0.5 },
    { sousQuestion: "g", critere: existeValeurEnVCaracteristiques(exercice) ? [texte("Valeur lue sur le point plein")] : [texte("Valeur inexistante (abscisse exclue)")], points: 0.5 },
    { sousQuestion: "h", critere: [texte("Les deux équations d'asymptotes, sous la forme « x = … » et « y = … »")], points: 0.5 },
  ];
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Oublier d'exclure le point creux "), latex(`x = ${formatNombre(exercice.c)}`), texte(" (cercle vide seul)")], cout: "0 pt sur a)" },
  ];
  if (exercice.gaps.length > 0) erreurs.push({ description: [texte("Exclure aussi les bornes des intervalles sans tracé (ce sont des points pleins)")], cout: "0 pt sur a)" });
  if (exercice.discontinuite.type !== "trou") erreurs.push({ description: [texte("Exclure "), latex(`x = ${formatNombre(exercice.b5)}`), texte(" à cause du cercle vide, alors qu'un point plein existe à la même abscisse")], cout: "0 pt sur a)" });
  erreurs.push({ description: [texte("Réunir en un seul intervalle deux morceaux séparés par une asymptote, un trou ou un intervalle sans tracé")], cout: "0 pt sur l'intervalle concerné" });
  erreurs.push({
    description:
      exercice.v === exercice.c || exercice.discontinuite.type === "trou"
        ? [texte("Donner pour "), latex(`f(${formatNombre(exercice.v)})`), texte(" l'ordonnée d'un cercle vide")]
        : [texte("Lire "), latex(`f(${formatNombre(exercice.v)})`), texte(" sur le cercle vide au lieu du point plein")],
    cout: "0 pt sur g)",
  });
  erreurs.push({ description: [texte("Équations d'asymptotes inversées ("), latex("y = "), texte(" pour la verticale, "), latex("x = "), texte(" pour l'horizontale)")], cout: "0 pt sur h)" });
  return {
    reponseFinale: reponseBreveCaracteristiquesFonction(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Domaine écrit sous la forme "), latex("\\mathbb{R} \\setminus \\{\\ldots\\}"), texte(" (avec les intervalles retirés)")],
      [texte("Zéros donnés comme un ensemble de valeurs")],
    ],
  };
}

/** Plus il y a d'exclusions particulières (intervalles sans tracé, discontinuité « trou » ou point
 * redéfini), plus la lecture du domaine et de f(v) demande de réflexion. */
function difficulteCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): 1 | 2 | 3 {
  const pieges = exercice.gaps.length + (exercice.discontinuite.type === "pointPlein" ? 0 : 1);
  return pieges >= 2 ? 3 : 2;
}

export const adaptateurEvaluationCaracteristiquesFonction: AdaptateurFeuilleExercices<ExerciceCaracteristiquesFonction> = {
  profilInstance: profilCaracteristiquesFonction,
  libelleCasParticulier: LIBELLE_CAS_LECTURE_GRAPHIQUE,
  titreDocument: "Caractéristiques d'une fonction (lecture graphique) — Évaluation",
  nomFichierBase: "caracteristiques-fonction",
  genererInstance: genererExerciceCaracteristiquesFonction,
  construireEnonce: construireEnonceCaracteristiquesFonction,
  construireCorrection: construireCorrectionCaracteristiquesFonction,
  difficulte: difficulteCaracteristiquesFonction,
  reponseBreve: reponseBreveCaracteristiquesFonction,
  correctionDetaillee: correctionDetailleeCaracteristiquesFonction,
  bareme: baremeCaracteristiquesFonction,
  enoncePapier: enoncePapierCaracteristiquesFonction,
  dureeMinutes: 8,
};
