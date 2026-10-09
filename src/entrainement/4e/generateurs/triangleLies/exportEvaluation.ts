import type { ExerciceTriangleLies } from "../../core/triangleLies.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { calculerCroquisTriangleLies, HAUTEUR_CROQUIS, LARGEUR_CROQUIS, segmentPartage } from "../../ui/triangleLiesSketch";
import {
  consigneAngles,
  consigneCible,
  consignePont,
  consigneSoustraction,
  formatAnglesBrutsViseeTexte,
  formatDistancesParcouruesTexte,
  formatDonneesCibleEnonceTexte,
  formatDonneesPontTexte,
} from "../../ui/formatTriangleLies";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceTriangleLies } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTriangleLies>` pour gen58 ("Triangles liés —
 * triangulation, côté ou angle partagé", `generateurs/triangleLies/index.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence et
 * `generateurs/simplification/exportEvaluation.ts` pour un 2e exemple de correction multi-écrans
 * consolidée en questions papier.
 *
 * **Catalogue non standard, bridgé ici** : ce générateur nomme son catalogue/constructeur
 * `CATALOGUE_FAMILLES`/`construireAvecFamilleId` (un seul axe de tirage, la "famille" — voir l'en-tête
 * de `index.ts`), pas `CATALOGUE_VARIANTES`/`construireAvecVarianteId` comme la plupart des autres
 * générateurs. Le contrat `AdaptateurFeuilleExercices<T>` (`export/genererFeuilleExercices.ts`) exige
 * néanmoins des noms de CHAMP standard (`catalogueVariantes`/`genererInstanceAvecVariante`) — ils sont
 * simplement branchés ci-dessous sur `CATALOGUE_FAMILLES`/`construireAvecFamilleId`, sans renommer quoi
 * que ce soit côté `index.ts` (qui reste la seule source de vérité de sa propre convention de nommage).
 *
 * **11 familles, 3 structures de résolution** (voir `core/triangleLies.types.ts` pour le détail complet
 * de chaque famille) — `ExerciceTriangleLies.variante` aiguille directement sur la bonne séquence
 * d'écrans (`moteur/sessionTriangleLies.ts::phaseApresPont`), reprise ici telle quelle en questions
 * papier lettrées a)/b)/c) :
 * - `cotePartage` (3 familles : `terrainRectangle`, `terrainQuelconque`, `terrainSportif`) — 2 questions :
 *   a) résoudre le triangle "pont" (`questionPont`, données `donneesPont`) ; b) résoudre le triangle
 *   "cible" (`questionCible`), dont les 2 angles qui le ferment sont déjà DONNÉS dans l'énoncé
 *   (`donneesCibleEnonce`) — rien à calculer entre les deux, le seul écran intermédiaire ("angles") de
 *   `sessionTriangleLies.ts` étant absent de cette variante.
 * - `anglePartage` (5 familles : `hauteurInaccessible`, `distanceInaccessible`, `inclinaisonCable`,
 *   `hauteurArbre`, `sectionFalaise`) — 3 questions : a) triangle "pont" ; b) écran "angles" — les 2
 *   angles qui ferment le triangle cible ne sont PAS donnés directement : l'un est la DIFFÉRENCE de 2
 *   visées brutes prises depuis le même point d'observation (`anglesBrutsVisee`), l'autre découle d'une
 *   hypothèse annexe propre au contexte (`hypotheseAnnexe`, ex. verticalité d'un mât/arbre/paroi,
 *   perpendicularité d'une rive) ; c) triangle "cible" (`questionCible`), réutilisant le côté transféré
 *   de a) et les 2 angles de b).
 * - `sommetPartage` (3 familles : `naviresConvergents`, `randonneursSommet`, `avionsConvergents`) — 3
 *   questions : a) triangle "pont" — ICI 3 valeurs à trouver (l'angle au sommet commun ET les 2 côtés
 *   qui en partent, `donneesPont`) ; b) écran "soustraction" — chaque côté du triangle cible s'obtient
 *   en retranchant la distance déjà parcourue (`distancesParcourues`) au côté correspondant du triangle
 *   pont ; c) triangle "cible", réutilisant l'angle au sommet (transféré tel quel depuis a)) et les 2
 *   côtés de b).
 *
 * **Écran "interpretation" (QCM) volontairement absent** de cet export : `verifierInterpretation`
 * (`moteur/verificationTriangleLies.ts`) vérifie une sélection parmi `optionsInterpretation`, pas un
 * calcul — la grandeur qu'il fait reformuler est déjà celle obtenue à la question "cible" ci-dessus,
 * sans calcul supplémentaire à corriger sur copie. Aucun autre adaptateur du projet ne consomme
 * `optionsInterpretation` (vérifié) ; ce générateur ne fait pas exception.
 *
 * **Réutilisation du texte déjà généré, jamais de nouvelle formulation** : `contexte`, `questionPont`,
 * `questionCible` et `hypotheseAnnexe` viennent tels quels de l'instance (Couche A, un par famille — 11
 * formulations distinctes, jamais une consigne générique). Les 2 consignes qui n'ont PAS de champ dédié
 * par famille (écrans "angles"/"soustraction", génériques par construction — voir
 * `sessionTriangleLies.ts`) réutilisent les fonctions déjà utilisées côté écran interactif
 * (`ui/formatTriangleLies.ts::consigneAngles`/`consigneSoustraction`/`consignePont`/`consigneCible`,
 * déjà celles affichées à l'élève, y compris la mention de tolérance "valeur approchée acceptée, à
 * environ 1 % près" qui reflète la vérité de `moteur/verificationTriangleLies.ts`) plutôt que d'en
 * écrire de nouvelles. Les blocs de données (`donneesPont`/`donneesCibleEnonce`/`anglesBrutsVisee`/
 * `distancesParcourues`) sont mis en texte via les formateurs déjà utilisés côté écran
 * (`formatDonneesPontTexte` etc.), jamais reconstruits.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`trianglePont`/`triangleCible`/`valeurCibleAttendue`, vérité terrain — jamais recalculées
 * indépendamment ici, même principe que `analyseFonction/exportWord.ts`) : gen58 n'a pas de texte
 * d'aide progressif à concaténer (ses aides, `ui/formatTriangleLies.ts::texteAide*`, sont déjà de
 * courtes phrases méthodologiques génériques, pas une résolution chiffrée complète) — la correction
 * ci-dessous explicite donc le calcul complet de chaque étape (méthode utilisée + résultat arrondi),
 * jamais une simple transcription des aides.
 *
 * **Croquis (`enteteHtml`)** : réutilise tel quel le moteur géométrique déjà utilisé par le rendu
 * écran SVG sur mesure (`components/TriangleLiesSketch.tsx`, `ui/triangleLiesSketch.ts` —
 * `calculerCroquisTriangleLies`/`segmentPartage`, similitude à échelle uniforme, PROPORTIONNELLEMENT
 * FIDÈLE aux valeurs réellement générées, jamais un croquis schématique à sommets fixes). Seule
 * différence avec `TriangleLiesSketch.tsx` : les classes CSS `.triangle-lies-sketch-*` (`App.css`) n'y
 * sont pour rien, le document HTML d'évaluation étant autonome (voir `genererFeuilleExercicesHtml.ts`,
 * `assemblerEvaluationHtml.ts`) — les mêmes couleurs sont donc réappliquées ici en attributs SVG
 * INLINE (`stroke`/`fill` littéraux, même patron que `construireSvgBoiteMoustaches`,
 * `generateurs/boiteMoustaches/exportEvaluation.ts`) plutôt que via des classes qui resteraient sans
 * effet. Rendu UNE SEULE FOIS en tête de l'énoncé (pas de 2e croquis dans la correction : la
 * correction se lit à côté de l'énoncé déjà imprimé, même convention que les autres adaptateurs à
 * `enteteHtml`, ex. `boiteMoustaches`/`caracteristiquesFonction`).
 *
 * **PAS `regroupable`** : chacune des 11 familles a sa propre consigne DÉPENDANTE du contexte narratif
 * et des valeurs tirées (`contexte`/`questionPont`/`questionCible`, jamais une constante générique), et
 * chaque instance produit 2 ou 3 questions (jamais une seule) plus un `enteteHtml` (croquis) — les 3
 * conditions de `AdaptateurFeuilleExercices.regroupable` (consigne générique, une seule question, pas
 * d'`enteteHtml`) sont donc toutes les 3 violées ici, comme pour `simplification/exportEvaluation.ts`
 * (voir son en-tête).
 */

const LARGEUR_SVG = 260;

function formatNombre(valeur: number): string {
  return Number(valeur.toFixed(2)).toString();
}

function formatValeurUnite(valeur: number, unite: string): string {
  return `${formatNombre(valeur)}${unite === "°" ? "°" : ` ${unite}`}`;
}

const TOLERANCE_ABSOLUE_MIN = 0.05;
const TOLERANCE_RELATIVE = 0.01;

function proche(valeur: number, attendu: number): boolean {
  const tolerance = Math.max(TOLERANCE_ABSOLUE_MIN, Math.abs(attendu) * TOLERANCE_RELATIVE);
  return Math.abs(valeur - attendu) <= tolerance;
}

/**
 * Explicite la dernière ligne de correction de l'écran "cible" (grandeur demandée = côté/angle/aire),
 * TOUJOURS conclue par la valeur de référence déjà connue `valeurCibleAttendue` (jamais recalculée —
 * même principe que le reste de cette correction) mais avec la méthode/le calcul intermédiaire montré :
 * - `aire` : Aire = ½ · a · b · sin(C) — identité valable pour N'IMPORTE QUEL triangle valide (a/A,
 *   b/B, c/C toujours opposés par convention, voir `core/triangle.types.ts`), jamais dépendante de la
 *   paire côtés/angle réellement utilisée par la famille pour calculer cette aire à la génération.
 * - `angle` : l'angle demandé est directement le 3e angle du triangle cible, déjà obtenu par ASA.
 * - `cote` : DÉTECTION GÉNÉRIQUE (jamais une liste de familles en dur) — si `valeurCibleAttendue`
 *   correspond à un côté du triangle cible résolu, la réponse est directe ; sinon (cas documenté de
 *   `hauteurInaccessible`/`hauteurArbre`, voir `core/triangleLies.types.ts` "léger écart au patron
 *   générique" — la hauteur totale demandée ajoute une donnée déjà connue AVANT même l'écran "cible",
 *   ex. la hauteur du point de repère M, à un côté du triangle cible), la décomposition est retrouvée
 *   en cherchant quel côté + quelle donnée de `donneesPont` (même unité) reproduit `valeurCibleAttendue`
 *   à la tolérance de vérification près, et affichée explicitement plutôt que passée sous silence.
 */
function expliciterReponseCible(instance: ExerciceTriangleLies): string {
  const { grandeurDemandee, triangleCible, valeurCibleAttendue, uniteGrandeurCible } = instance;

  if (grandeurDemandee === "aire") {
    return (
      `Aire = ½ · ${formatNombre(triangleCible.a)} · ${formatNombre(triangleCible.b)} · sin(${formatNombre(triangleCible.C)}°) = ` +
      `${formatValeurUnite(valeurCibleAttendue, uniteGrandeurCible)}.`
    );
  }

  if (grandeurDemandee === "angle") {
    return `Réponse : ${formatValeurUnite(valeurCibleAttendue, uniteGrandeurCible)}.`;
  }

  const cotes: [number, string][] = [
    [triangleCible.a, "a"],
    [triangleCible.b, "b"],
    [triangleCible.c, "c"],
  ];
  if (cotes.some(([valeurCote]) => proche(valeurCote, valeurCibleAttendue))) {
    return `Réponse : ${formatValeurUnite(valeurCibleAttendue, uniteGrandeurCible)}.`;
  }
  for (const [valeurCote] of cotes) {
    for (const donnee of instance.donneesPont) {
      if (donnee.unite === uniteGrandeurCible && proche(valeurCote + donnee.valeur, valeurCibleAttendue)) {
        return (
          `Ce côté du triangle cible (${formatNombre(valeurCote)} ${uniteGrandeurCible}) s'ajoute à ${donnee.label} ` +
          `(${formatValeurUnite(donnee.valeur, donnee.unite)}, déjà connue avant même de résoudre le triangle cible) : ` +
          `${formatNombre(valeurCote)} + ${formatNombre(donnee.valeur)} = ${formatValeurUnite(valeurCibleAttendue, uniteGrandeurCible)}.`
        );
      }
    }
  }
  // Filet de robustesse — aucune décomposition simple trouvée (n'arrive jamais avec les 11 familles
  // actuelles, vérifié par le smoke test) : la valeur de référence reste affichée telle quelle.
  return `Réponse : ${formatValeurUnite(valeurCibleAttendue, uniteGrandeurCible)}.`;
}

/** Croquis SVG autonome (attributs inline, aucune dépendance à `App.css`) — voir le commentaire de
 * tête pour la justification de cette réimplémentation plutôt qu'un rendu direct de
 * `TriangleLiesSketch.tsx` (composant React, non instanciable dans ce pipeline texte/HTML). */
function construireCroquisHtml(exercice: ExerciceTriangleLies): string {
  const croquis = calculerCroquisTriangleLies(exercice);
  const partage = segmentPartage(exercice);

  function point(nom: string) {
    return croquis.find((p) => p.nom === nom)!;
  }

  function estPartage(segment: readonly [string, string]): boolean {
    return partage != null && ((segment[0] === partage[0] && segment[1] === partage[1]) || (segment[0] === partage[1] && segment[1] === partage[0]));
  }

  function ligne(n1: string, n2: string, couleur: string, epaisseur: number): string {
    return `<line x1="${point(n1).point.x.toFixed(1)}" y1="${point(n1).point.y.toFixed(1)}" x2="${point(n2).point.x.toFixed(1)}" y2="${point(n2).point.y.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"/>`;
  }

  const segmentsPont = exercice.segmentsPont
    .filter((s) => !estPartage(s))
    .map(([n1, n2]) => ligne(n1, n2, "#1971c2", 2))
    .join("");
  const segmentsCible = exercice.segmentsCible
    .filter((s) => !estPartage(s))
    .map(([n1, n2]) => ligne(n1, n2, "#f08c00", 2))
    .join("");
  const segmentPartageHtml = partage ? ligne(partage[0], partage[1], "#2f9e44", 3) : "";

  const points = croquis.map((p) => `<circle cx="${p.point.x.toFixed(1)}" cy="${p.point.y.toFixed(1)}" r="3" fill="#6b6b80"/>`).join("");
  const labels = croquis
    .map((p) => `<text x="${p.label.x.toFixed(1)}" y="${p.label.y.toFixed(1)}" font-size="13" font-weight="700" fill="#6b6b80" text-anchor="middle" dominant-baseline="middle">${p.nom}</text>`)
    .join("");

  return `<svg width="${LARGEUR_SVG}" height="${Math.round((LARGEUR_SVG / LARGEUR_CROQUIS) * HAUTEUR_CROQUIS)}" viewBox="0 0 ${LARGEUR_CROQUIS} ${HAUTEUR_CROQUIS}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_CROQUIS}" height="${HAUTEUR_CROQUIS}" fill="#ffffff"/>
${segmentsPont}${segmentsCible}${segmentPartageHtml}${points}${labels}
</svg>`;
}

function construireEnonceTriangleLies(instance: ExerciceTriangleLies): SectionExercice {
  const questions: SectionExercice["questions"] = [];

  questions.push({
    consigne: [texte(`Données : ${formatDonneesPontTexte(instance).join(", ")}. ${consignePont(instance)}`)],
  });

  if (instance.variante === "anglePartage") {
    questions.push({
      consigne: [
        texte(
          `Données (visées depuis le même point d'observation) : ${formatAnglesBrutsViseeTexte(instance).join(", ")}. ` +
            `Hypothèse : ${instance.hypotheseAnnexe}. ${consigneAngles()}`,
        ),
      ],
    });
  } else if (instance.variante === "sommetPartage") {
    questions.push({
      consigne: [texte(`Données : ${formatDistancesParcouruesTexte(instance).join(", ")}. ${consigneSoustraction()}`)],
    });
  }

  const donneesCible = formatDonneesCibleEnonceTexte(instance);
  questions.push({
    consigne: [texte(donneesCible.length > 0 ? `Données : ${donneesCible.join(", ")}. ${consigneCible(instance)}` : consigneCible(instance))],
  });

  return {
    enteteFragments: [texte(instance.contexte)],
    enteteHtml: construireCroquisHtml(instance),
    questions,
  };
}

function construireCorrectionTriangleLies(instance: ExerciceTriangleLies): BlocCorrection[] {
  const { trianglePont, triangleCible } = instance;
  const blocs: BlocCorrection[] = [];

  if (instance.variante === "sommetPartage") {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `a) Triangle pont résolu : angle au sommet commun = ${formatNombre(trianglePont.A)}°, ` +
            `côté 1 = ${formatNombre(trianglePont.b)}, côté 2 = ${formatNombre(trianglePont.c)}.`,
        ),
      ],
    });
    const [d1, d2] = instance.distancesParcourues ?? [];
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `b) Côtés du triangle cible = côté du pont − distance déjà parcourue : ` +
            `côté 1 = ${formatNombre(trianglePont.b)} − ${d1 ? formatNombre(d1.valeur) : "?"} = ${formatNombre(triangleCible.b)} ; ` +
            `côté 2 = ${formatNombre(trianglePont.c)} − ${d2 ? formatNombre(d2.valeur) : "?"} = ${formatNombre(triangleCible.c)}.`,
        ),
      ],
    });
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `c) Triangle cible résolu par l'angle au sommet commun (${formatNombre(trianglePont.A)}°, transféré tel quel) et les 2 côtés ` +
            `trouvés en b) — ${instance.questionCible} ${expliciterReponseCible(instance)}`,
        ),
      ],
    });
    return blocs;
  }

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte(
        `a) Triangle pont ${instance.typeTrianglePont === "rectangle" ? "rectangle" : "quelconque"} résolu — ` +
          `${instance.labelCoteTransfere} = ${formatNombre(trianglePont.a)}${formatUniteTransferee(instance)}.`,
      ),
    ],
  });

  if (instance.variante === "anglePartage") {
    const [visee1, visee2] = instance.anglesBrutsVisee ?? [];
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `b) Angle utile = différence des 2 visées = ${visee2 ? formatNombre(visee2.valeur) : "?"}° − ` +
            `${visee1 ? formatNombre(visee1.valeur) : "?"}° = ${formatNombre(triangleCible.B)}°. ` +
            `Hypothèse annexe (${instance.hypotheseAnnexe}) ⇒ 2e angle = ${formatNombre(triangleCible.C)}°.`,
        ),
      ],
    });
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `c) Triangle cible résolu par ASA à partir de ${instance.labelCoteTransfere} = ${formatNombre(trianglePont.a)} et des 2 angles ` +
            `trouvés en b) — ${instance.questionCible} ${expliciterReponseCible(instance)}`,
        ),
      ],
    });
    return blocs;
  }

  // cotePartage : les 2 angles qui ferment le triangle cible sont déjà donnés dans l'énoncé.
  blocs.push({
    type: "paragraphe",
    fragments: [
      texte(
        `b) Triangle cible résolu par ASA à partir de ${instance.labelCoteTransfere} = ${formatNombre(trianglePont.a)} et des 2 angles ` +
          `donnés dans l'énoncé (${formatDonneesCibleEnonceTexte(instance).join(", ")}) — ${instance.questionCible} ` +
          expliciterReponseCible(instance),
      ),
    ],
  });

  return blocs;
}

/** `trianglePont.a` est un côté (toujours une longueur, jamais un angle — voir la convention en tête
 * de `core/triangleLies.types.ts`) sauf pour `sommetPartage` où l'unité affichée dans la correction est
 * déjà gérée séparément (branche dédiée ci-dessus) ; ici l'unité suit celle de `donneesPont`, jamais
 * "°" (le côté transféré n'est jamais un angle pour `cotePartage`/`anglePartage`). */
function formatUniteTransferee(instance: ExerciceTriangleLies): string {
  const uniteExemple = instance.donneesPont.find((d) => d.unite !== "°")?.unite ?? instance.uniteGrandeurCible.replace("²", "");
  return uniteExemple ? ` ${uniteExemple}` : "";
}

export const adaptateurEvaluationTriangleLies: AdaptateurFeuilleExercices<ExerciceTriangleLies> = {
  titreDocument: "Triangles liés (triangulation) — Évaluation",
  nomFichierBase: "triangles-lies-triangulation",
  genererInstance: genererExerciceTriangleLies,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceTriangleLies,
  construireCorrection: construireCorrectionTriangleLies,
  // PAS regroupable — 11 contextes narratifs distincts, 2 à 3 questions par instance, `enteteHtml`
  // (croquis) présent : voir le commentaire de tête pour le détail des 3 conditions violées.
};
