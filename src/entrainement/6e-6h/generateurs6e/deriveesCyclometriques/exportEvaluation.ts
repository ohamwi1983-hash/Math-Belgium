import type { ExerciceDeriveesCyclometriques } from "../../core6e/deriveesCyclometriques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import {
  CONSIGNE_GENERALE,
  formatFonctionALatex,
  formatFonctionBLatex,
  formatFonctionCLatex,
  formatFonctionDLatex,
  formatFonctionELatex,
  formatFonctionFLatex,
  formatFonctionGLatex,
  texteAideADeriveeFinaleNiveau2,
  texteAideADeriveeUNiveau1,
  texteAideADeriveeUNiveau2,
  texteAideBDeriveeArcNiveau1,
  texteAideBDeriveeArcNiveau2,
  texteAideBDeriveeFinaleNiveau2,
  texteAideBDeriveeUNiveau2,
  texteAideCDenominateurNiveau1,
  texteAideCDenominateurNiveau2,
  texteAideCDeriveeFinaleNiveau2,
  texteAideCNumerateurNiveau1,
  texteAideCNumerateurNiveau2,
  texteAideDBrutNiveau2,
  texteAideDDenominateurNiveau1,
  texteAideDDenominateurNiveau2,
  texteAideDNumerateurNiveau1,
  texteAideDNumerateurNiveau2,
  texteAideEDeriveeFinaleNiveau2,
  texteAideEDeriveeInterneNiveau1,
  texteAideEDeriveeInterneNiveau2,
  texteAideFBruteNiveau2,
  texteAideFSimplifieeNiveau2,
  texteAideGDeriveeFinaleNiveau2,
  texteAideGDeriveeInterneNiveau1,
  texteAideGDeriveeInterneNiveau2,
} from "../../ui6e/formatDeriveesCyclometriques";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDeriveesCyclometriques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDeriveesCyclometriques>` pour `6gen4` (Dérivées de
 * fonctions cyclométriques) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Une seule question par instance ("Dérive f(x).", `CONSIGNE_GENERALE`) — inchangé. Correction
 * enrichie (par rapport à la version précédente qui n'affichait que la formule finale substituée,
 * sans AUCUNE phrase de justification) : chaque famille produit maintenant plusieurs paragraphes,
 * un par étape de calcul (u'/v' → assemblage via la règle adaptée → simplification éventuelle),
 * combinant la phrase d'aide niveau 1 déjà écrite côté écran (`ui6e/formatDeriveesCyclometriques.ts`)
 * et la formule niveau 2 correspondante — jamais recalculées indépendamment, même principe que
 * pour 6gen9/6gen10 (chapitre 2 de 6e). Famille D : la forme brute peut encore se simplifier via
 * l'identité arcsin(u)+arccos(u)=π/2, mentionnée en corrigé sans imposer la forme totalement
 * réduite (les deux formes restent acceptées côté écran interactif).
 */

function formatFonctionLatex(exercice: ExerciceDeriveesCyclometriques): string {
  switch (exercice.famille) {
    case "A":
      return formatFonctionALatex(exercice);
    case "B":
      return formatFonctionBLatex(exercice);
    case "C":
      return formatFonctionCLatex(exercice);
    case "D":
      return formatFonctionDLatex(exercice);
    case "E":
      return formatFonctionELatex(exercice);
    case "F":
      return formatFonctionFLatex(exercice);
    case "G":
      return formatFonctionGLatex(exercice);
  }
}

function construireEnonceDeriveesCyclometriques(exercice: ExerciceDeriveesCyclometriques): SectionExercice {
  return {
    enteteFragments: [latex(formatFonctionLatex(exercice))],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)], reponse: { type: "lignes", nombre: 4 } }],
  };
}

function construireParagraphesResolution(exercice: ExerciceDeriveesCyclometriques): FragmentConsigne[][] {
  switch (exercice.famille) {
    case "A": {
      const u2 = texteAideADeriveeUNiveau2(exercice);
      const f2 = texteAideADeriveeFinaleNiveau2(exercice);
      return [
        [texte(`${texteAideADeriveeUNiveau1(exercice)} ${u2.texte} `), latex(u2.latex as string), texte(".")],
        [
          texte("On applique ensuite la règle de la chaîne : f'(x) = k fois la dérivée de l'arcfonction évaluée en u, fois u'(x). "),
          latex(f2.latex as string),
          texte("."),
        ],
      ];
    }
    case "B": {
      const u2 = texteAideBDeriveeUNiveau2(exercice);
      const arc2 = texteAideBDeriveeArcNiveau2(exercice);
      const f2 = texteAideBDeriveeFinaleNiveau2(exercice);
      return [
        [texte("On dérive d'abord u(x) = m·x, une fonction affine. "), latex(u2.latex as string), texte(".")],
        [texte(`${texteAideBDeriveeArcNiveau1(exercice)} `), latex(arc2.latex as string), texte(".")],
        [texte("On applique enfin la règle du produit, f'(x) = u'(x)·arcfonction(v(x)) + u(x)·[dérivée de arcfonction(v(x))] : "), latex(f2.latex as string), texte(".")],
      ];
    }
    case "C": {
      const n1 = texteAideCNumerateurNiveau1();
      const n2 = texteAideCNumerateurNiveau2(exercice);
      const d1 = texteAideCDenominateurNiveau1();
      const d2 = texteAideCDenominateurNiveau2(exercice);
      const f2 = texteAideCDeriveeFinaleNiveau2(exercice);
      return [
        [texte(`${n1} `), latex(n2.latex as string), texte(".")],
        [texte(`${d1} `), latex(d2.latex as string), texte(".")],
        [texte("On assemble enfin via la formule du quotient f'=(N'D-ND')/D² : "), latex(f2.latex as string), texte(".")],
      ];
    }
    case "D": {
      const n1 = texteAideDNumerateurNiveau1();
      const n2 = texteAideDNumerateurNiveau2(exercice);
      const d1 = texteAideDDenominateurNiveau1();
      const d2 = texteAideDDenominateurNiveau2(exercice);
      const brut2 = texteAideDBrutNiveau2(exercice);
      return [
        [texte(`${n1} `), latex(n2.latex as string), texte(".")],
        [texte(`${d1} `), latex(d2.latex as string), texte(".")],
        [texte("En assemblant via la formule du quotient f'=(N'D-ND')/D² (résultat brut, non simplifié) : "), latex(brut2.latex as string), texte(".")],
        [
          texte("Peut se simplifier davantage grâce à l'identité "),
          latex("\\arcsin(u)+\\arccos(u)=\\dfrac{\\pi}{2}"),
          texte(", repérable dans le numérateur ci-dessus."),
        ],
      ];
    }
    case "E": {
      const i1 = texteAideEDeriveeInterneNiveau1();
      const i2 = texteAideEDeriveeInterneNiveau2(exercice);
      const f2 = texteAideEDeriveeFinaleNiveau2(exercice);
      return [
        [texte(`${i1} `), latex(i2.latex as string), texte(".")],
        [
          texte(
            exercice.gType === "carre"
              ? "On applique ensuite la chaîne extérieure (mise au carré) : "
              : "On applique ensuite la chaîne extérieure (racine carrée) : ",
          ),
          latex(f2.latex as string),
          texte("."),
        ],
      ];
    }
    case "F": {
      const b2 = texteAideFBruteNiveau2(exercice);
      return [
        [texte("Chaîne à deux niveaux : dérivée de trig(u) fois dérivée de u=arcfonction(v). "), latex(b2.latex as string), texte(".")],
        [texte(texteAideFSimplifieeNiveau2(exercice))],
      ];
    }
    case "G": {
      const i1 = texteAideGDeriveeInterneNiveau1(exercice);
      const i2 = texteAideGDeriveeInterneNiveau2(exercice);
      const f2 = texteAideGDeriveeFinaleNiveau2(exercice);
      return [
        [texte(`${i1} `), latex(i2.latex as string), texte(".")],
        [
          texte(
            exercice.sousCas === "h"
              ? "On combine ensuite la règle de la puissance -1 avec la formule cyclométrique : "
              : "On applique enfin la formule cyclométrique standard avec u et u' corrects de l'étape précédente : ",
          ),
          latex(f2.latex as string),
          texte("."),
        ],
      ];
    }
  }
}

function construireCorrectionDeriveesCyclometriques(exercice: ExerciceDeriveesCyclometriques): BlocCorrection[] {
  return construireParagraphesResolution(exercice).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationDeriveesCyclometriques: AdaptateurFeuilleExercices<ExerciceDeriveesCyclometriques> = {
  titreDocument: "Dérivées de fonctions cyclométriques — Évaluation",
  nomFichierBase: "derivees-cyclometriques",
  genererInstance: genererExerciceDeriveesCyclometriques,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceDeriveesCyclometriques,
  construireCorrection: construireCorrectionDeriveesCyclometriques,
  // Une seule question par instance, consigne GÉNÉRIQUE (`CONSIGNE_GENERALE`, constante) — voir
  // `AdaptateurFeuilleExercices.regroupable`, `AppEvaluation6e.tsx::construireItemRegroupe`.
  regroupable: true,
};
