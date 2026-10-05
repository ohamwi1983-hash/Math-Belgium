import type { ExerciceAnalyseFonction } from "../../core/analyseFonction.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import { formatFonctionColoreeLatex, formatFonctionOrdreLatex, consigneAxeSommet } from "../../ui/formatAnalyseFonction";
import { libelleCategorie } from "../../ui/categorieLabels";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnalyseFonction } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAnalyseFonction>` pour gen7 (Analyse d'une
 * fonction du second degré) — implémentation de référence du pilote export Word
 * (`promptexportwordpilotegen7.md`), à recopier/adapter pour tout autre générateur qui voudrait
 * ce même export (voir `export/genererFeuilleExercices.ts` pour le mécanisme générique).
 *
 * Décision documentée — comment les aides progressives deviennent une correction rédigée :
 * gen7 n'a PAS de texte d'aide à concaténer (vérifié en explorant `moteur/sessionAnalyseFonction.ts`
 * et les 4 composants `Etape*.tsx` porteurs d'une aide — `coefficients`/`axeSommet`/
 * `domaineImage`/`tableauSignes`) : ses 4 aides sont purement visuelles (une formule colorée ou un
 * croquis Ox/Oy interactif), jamais une phrase à révéler. Concaténer des fragments de hint
 * n'était donc pas une option pour ce générateur précis. La correction ci-dessous est à la place
 * RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.exercice.solution`, `exercice.xS/yS`, `exercice.grilleSigneVariation`) — un texte de
 * résolution nouveau, jamais une transcription. Pour un futur générateur dont les aides SONT déjà
 * du texte (`niveauAide` avec des chaînes, voir CLAUDE.md "Aide progressive additive"), la bonne
 * approche sera l'inverse : réutiliser/retravailler ces chaînes existantes plutôt que d'en
 * resynthétiser de nouvelles — à décider au cas par cas selon ce que le générateur expose déjà.
 *
 * Rasterisation des formules : voir `export/katexImage.ts` — chaque fragment `latex(...)` ci-dessous
 * devient une image PNG au moment de l'assemblage du .docx (jamais une équation Word native).
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function construireEnonceAnalyseFonction(instance: ExerciceAnalyseFonction): SectionExercice {
  const { exercice, ordreTermes, grilleSigneVariation } = instance;
  // +2 : colonnes -∞/+∞ dédiées (jamais fusionnées avec la 1ʳᵉ/dernière colonne de
  // `grilleSigneVariation`, qui reste elle-même la valeur du 1er/dernier intervalle) — même
  // convention que l'écran interactif (`EtapeTableauSigneVariation.tsx`, cellules
  // `grille-signes-borne` dédiées et toujours vides dans les lignes de données).
  const nombreColonnesTableau = grilleSigneVariation.ligneSigne.length + 2;

  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFonctionOrdreLatex(exercice.enonce, ordreTermes))],
    questions: [
      { consigne: [texte("Identifie les coefficients "), latex("a"), texte(", "), latex("b"), texte(" et "), latex("c"), texte(".")] },
      { consigne: [texte("Donne le signe de "), latex("a"), texte(", puis celui du produit "), latex("a \\cdot b"), texte(".")] },
      { consigne: [texte(consigneAxeSommet())], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Donne l'ensemble-image ("), latex("\\mathrm{im}\\,f"), texte(") de cette fonction (rappel : "), latex("\\mathrm{dom}\\,f=\\mathbb{R}"), texte(").")] },
      {
        consigne: [
          texte("Factorise "),
          latex("f(x)"),
          texte(" en précisant la méthode utilisée (mise en évidence, binôme conjugué, produit remarquable), ou indique qu'aucune factorisation réelle n'est possible ; donne ensuite les racines de "),
          latex("f"),
          texte(", ou indique qu'il n'y en a pas."),
        ],
        reponse: { type: "lignes", nombre: 2 },
      },
      {
        consigne: [texte("Complète le tableau de signe et de variation de "), latex("f"), texte(".")],
        reponse: { type: "tableau", libellesLignes: ["x", "Signe de f(x)", "Variation"], nombreColonnes: nombreColonnesTableau },
      },
    ],
  };
}

function construireCorrectionAnalyseFonction(instance: ExerciceAnalyseFonction): BlocCorrection[] {
  const { exercice, xS, yS, grilleSigneVariation } = instance;
  const { a, b, c } = exercice.enonce;
  const aPositif = a > 0;

  const blocs: BlocCorrection[] = [];

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("a) "),
      latex(formatFonctionColoreeLatex(exercice.enonce)),
      texte(` — donc a = ${formatNombre(a)}, b = ${formatNombre(b)}, c = ${formatNombre(c)}.`),
    ],
  });

  const signeAB = a * b;
  blocs.push({
    type: "paragraphe",
    fragments: [
      texte(
        `b) Puisque a ${aPositif ? "> 0" : "< 0"}, la parabole est ouverte vers le ${aPositif ? "haut (elle possède un minimum)" : "bas (elle possède un maximum)"}. ` +
          `Le produit a·b vaut ${formatNombre(signeAB)}, donc il est ${signeAB > 0 ? "positif" : signeAB < 0 ? "négatif" : "nul"}.`,
      ),
    ],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte(`c) L'axe de symétrie a pour équation x = ${formatNombre(xS)}, donc le sommet est S(${formatNombre(xS)} ; ${formatNombre(yS)}).`)],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte(
        `d) dom f = ℝ. Comme a ${aPositif ? "> 0" : "< 0"}, f admet un ${aPositif ? "minimum" : "maximum"} en ${formatNombre(yS)}, ` +
          `donc im f = ${aPositif ? `[${formatNombre(yS)} ; +∞[` : `]−∞ ; ${formatNombre(yS)}]`}.`,
      ),
    ],
  });

  if (exercice.categorie === "irreductible") {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          `e) Aucune factorisation réelle n'est possible ici. En effet, le sommet est S(${formatNombre(xS)} ; ${formatNombre(yS)}), donc f(x) ${aPositif ? "≥" : "≤"} ${formatNombre(yS)} ` +
            `pour tout x — toujours ${aPositif ? "strictement positif" : "strictement négatif"}, f ne s'annule donc jamais : aucune racine réelle.`,
        ),
      ],
    });
  } else {
    const { formeFactorisee, racines } = exercice.solution;
    const [r1, r2] = racines;
    const racineDouble = r1 === r2;
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(`e) Méthode : ${libelleCategorie(exercice.categorie)}. `),
        latex(`f(x) = ${formeFactorisee}`),
        texte(
          racineDouble
            ? ` — une racine double x = ${formatNombre(r1)}.`
            : ` — deux racines distinctes x = ${formatNombre(Math.min(r1, r2))} et x = ${formatNombre(Math.max(r1, r2))}.`,
        ),
      ],
    });
  }

  blocs.push({ type: "paragraphe", fragments: [texte("f) Tableau de signe et de variation :")] });

  // -∞/+∞ dans leurs propres colonnes, jamais superposées à une valeur de `ligneSigne`/
  // `ligneVariation` (voir commentaire de `construireEnonceAnalyseFonction`) : ces 2 lignes,
  // purement des données de signe/variation, restent donc vides sous -∞ et +∞.
  const { colonnesValeurs, ligneSigne, ligneVariation } = grilleSigneVariation;
  const ligneXMilieu = ligneSigne.map((_, i) => (i % 2 === 1 ? formatNombre(colonnesValeurs[(i - 1) / 2]) : ""));
  blocs.push({
    type: "tableau",
    libellesLignes: ["x", "Signe de f(x)", "Variation"],
    valeursParLigne: [
      ["−∞", ...ligneXMilieu, "+∞"],
      ["", ...ligneSigne, ""],
      ["", ...ligneVariation, ""],
    ],
  });

  return blocs;
}

export const adaptateurExportWordAnalyseFonction: AdaptateurFeuilleExercices<ExerciceAnalyseFonction> = {
  titreDocument: "Analyse d'une fonction du second degré — Feuille d'exercices",
  nomFichierBase: "analyse-fonction-second-degre",
  genererInstance: genererExerciceAnalyseFonction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceAnalyseFonction,
  construireCorrection: construireCorrectionAnalyseFonction,
};
