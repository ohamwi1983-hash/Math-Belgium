import type {
  ExerciceContexteEconomique,
  ExerciceContexteEconomiqueA,
  ExerciceContexteEconomiqueB,
  ExerciceContexteEconomiqueBonus,
} from "../../core5e/contexteEconomique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { consigneEcran, formatNombreLatex, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex, precisionRacineApprochee, PRECISION_EXTREMUM } from "../../ui5e/formatContexteEconomique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceContexteEconomique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceContexteEconomique>` pour 5gen33 ("Contexte
 * économique", `App5gen33.tsx`/`moteur5e/sessionContexteEconomique.ts`) — voir
 * `generateurs5e/limitesContexte/exportEvaluation.ts` pour le précédent direct (même esprit
 * "problème en contexte narratif économique/condensation d'un déroulé multi-écrans").
 *
 * **3 familles STRUCTURELLEMENT DISJOINTES** (voir `core5e/contexteEconomique.types.ts`), chacune
 * condensée séparément depuis la séquence RÉELLE d'écrans de `App5gen33.tsx` :
 * - "A" (coût marginal, 5 écrans : `coutMarginalDiscret`→`deriveeSymbolique`→`deriveeValeur`→
 *   `comparaisonEcart`→`extremum`) → 2 questions papier : a) les 3 premiers écrans (calcul discret,
 *   dérivée symbolique, dérivée évaluée) PUIS la comparaison (écart absolu/%) ; b) l'étude
 *   d'extremum. **Écueil évité** : le texte RÉEL de `consigneEcran(exercice,"comparaisonEcart")`
 *   incruste déjà les valeurs numériques CONFIRMÉES de `cmDiscret`/`cmDerivee` (légitime à l'écran,
 *   où l'élève les a déjà validées aux écrans précédents) — le reprendre tel quel dans une question
 *   papier FUSIONNÉE aurait donné la réponse des 2 sous-calculs précédents avant même que l'élève ne
 *   les résolve. La consigne a) reformule donc cette dernière partie en clair ("compare les deux
 *   résultats obtenus"), sans aucune valeur incrustée — seul endroit de ce fichier où le texte d'un
 *   écran n'est PAS repris tel quel (tous les autres fragments de consigne le sont, verbatim,
 *   `consigneEcran` étant déjà le texte affiché en `<p>` brut par `EtapeChamps*CE.tsx`, jamais rendu
 *   KaTeX, donc directement réutilisable comme fragment `texte()`).
 * - "B" (bénéfice maximum via égalité des marginales, 8 écrans : `recetteTotale`→`marginales`→
 *   `resoudreEgaliteMarginales`→`beneficeFormule`→`beneficeDerivee`→`tableauSigneBenefice`→
 *   `confirmationCoherence`→`beneficeMaximum`) → 2 questions papier : a) développer R_T(x), dériver
 *   coût/recette, résoudre l'égalité des marginales (rejeter la racine négative) ; b) développer
 *   B(x), dériver, signe de B' et cohérence avec a), calculer le bénéfice maximum. **Piège
 *   pédagogique du générateur préservé explicitement** (le cœur de 5gen33/famille B, voir
 *   `confirmationCoherence` dans `ui5e/formatContexteEconomique.ts` et son aide niveau 2) : le
 *   bénéfice est maximal à l'égalité des marginales (C'_T(x)=R'_T(x)), PAS à l'endroit où la recette
 *   seule serait maximale (R'_T(x)=0, une autre valeur de x en général) — reformulé dans un
 *   paragraphe de correction dédié, en plus de la resynthèse des réponses attendues.
 * - "bonus" (dichotomie sur le coût moyen, 6 écrans : `poserEquationReduite`→`iteration0..3`→
 *   `racineApprochee`) → **3 questions papier** (seule famille à en compter 3, pas 2 — dérogation
 *   documentée : les 4 itérations de dichotomie sont un bloc de calcul répétitif à part entière,
 *   naturellement un TABLEAU `ZoneReponse`/`BlocCorrection` dédié — même convention que
 *   `generateurs5e/comparaisonSuites/exportEvaluation.ts` — jamais fusionnables avec la question
 *   sur l'équation réduite ni avec la conclusion finale sans perdre la lisibilité du tableau) :
 *   a) poser/développer l'équation réduite P(q)=0 ; b) les 4 itérations (milieu, signe, sous-
 *   intervalle conservé) sous forme de tableau ; c) la racine approchée finale, avec la tolérance
 *   RÉELLEMENT codée (`toleranceFinale`, via `precisionRacineApprochee`, jamais une tolérance
 *   inventée — voir CLAUDE.md, "Annonce de précision").
 *
 * Entête (`enteteFragments`, TOUJOURS rendu en mode KaTeX "bloc" par `assemblerEvaluationHtml.ts` —
 * voir le piège documenté en tête de `generateurs/distanceDroite/exportEvaluation.ts`) : reprend
 * `formatTermesDonneesLatex` TEL QUEL (2 formules COMPLÈTES par famille, jamais des fragments courts
 * mêlés au texte), précédé d'une phrase d'introduction minimale et factuelle — ce générateur n'a
 * PAS de texte narratif dédié façon "histoire" (contrairement à `limitesContexte`, qui a
 * `formatContexteTexte`) : son "contexte économique" est déjà entièrement porté par le vocabulaire
 * mathématique lui-même (coût total, prix, coût/recette marginale), repris à l'identique de celui
 * déjà utilisé côté écran (`consigneGenerale`/`consigneEcran`), jamais un habillage narratif inventé
 * pour ce fichier — même principe que l'entête minimal de
 * `generateurs5e/asymptoteOblique/exportEvaluation.ts` ("On considère la fonction f(x)=…").
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues de l'instance tirée, via
 * `formatReponseAttenduePhaseLatex` — déjà la fonction utilisée côté écran pour le récapitulatif
 * (bloc "état actuel") — jamais recalculée indépendamment ici.
 *
 * `catalogueVariantes`/`genererInstanceAvecVariante` réutilisent tel quel le catalogue de scénarios
 * déjà exposé par `generateurs5e/contexteEconomique/index.ts` pour le panneau dev
 * (`CATALOGUE_VARIANTES`/`construireAvecVarianteId` : 2 sous-cas de la famille A par degré/existence
 * d'extremum, la famille B, le bonus).
 *
 * **PAS `regroupable`** : 2 (familles A/B) ou 3 (bonus) questions par instance selon la famille —
 * jamais UNE seule question constante pour toute instance —, ET des consignes qui dépendent des
 * valeurs tirées dans plusieurs cas (ex. `precisionRacineApprochee(exercice)` pour le bonus). Les 2
 * conditions requises par `AdaptateurFeuilleExercices.regroupable` sont donc violées, même raison
 * que `generateurs5e/limitesContexte/exportEvaluation.ts`/`generateurs5e/comparaisonSuites/exportEvaluation.ts`.
 *
 * **Couche A/Couche B — AUCUNE exception** : ce fichier n'importe RIEN de `src/moteur5e/`. Les
 * écrans (`"coutMarginalDiscret"`, `"extremum"`, `"resoudreEgaliteMarginales"`, `"iteration0"`…) sont
 * passés à `consigneEcran`/`formatReponseAttenduePhaseLatex` comme de simples LITTÉRAUX de chaîne :
 * TypeScript les valide par typage contextuel contre le paramètre `EcranContexteEconomique` déjà
 * déclaré dans la signature IMPORTÉE de ces fonctions (`ui5e/formatContexteEconomique.ts`), sans
 * jamais avoir besoin d'importer ce type lui-même ici — même technique que
 * `generateurs5e/limitesContexte/exportEvaluation.ts` avec `PhaseLimitesContexte`.
 */

// ============================================================================
// Entête — factuel, vocabulaire déjà utilisé côté écran, jamais de narration inventée.
// ============================================================================

function construireEnteteContexteEconomique(exercice: ExerciceContexteEconomique): FragmentConsigne[] {
  const [formule1, formule2] = formatTermesDonneesLatex(exercice);
  if (exercice.famille === "A") {
    return [texte("On considère un coût total de production "), latex(formule1), texte(" (en euros, pour q unités), avec "), latex(formule2), texte(".")];
  }
  if (exercice.famille === "B") {
    return [texte("On considère un prix unitaire "), latex(formule1), texte(" et un coût total de production "), latex(formule2), texte(" (x = quantité produite et vendue).")];
  }
  return [texte("On considère un coût total de production "), latex(formule1), texte(". "), latex(formule2), texte(".")];
}

// ============================================================================
// Énoncé.
// ============================================================================

function construireEnonceA(exercice: ExerciceContexteEconomiqueA): SectionExercice {
  const consigneA = `${consigneEcran(exercice, "coutMarginalDiscret")} ${consigneEcran(exercice, "deriveeSymbolique")} ${consigneEcran(exercice, "deriveeValeur")} Compare les deux résultats obtenus (l'approximation discrète et l'approximation exacte) : calcule l'écart absolu, puis l'écart en pourcentage (par rapport à la valeur exacte).`;
  const consigneB = `${consigneEcran(exercice, "extremum")} ${PRECISION_EXTREMUM}`;
  return {
    enteteFragments: construireEnteteContexteEconomique(exercice),
    questions: [
      { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 6 } },
      { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireEnonceB(exercice: ExerciceContexteEconomiqueB): SectionExercice {
  const consigneA = `${consigneEcran(exercice, "recetteTotale")} ${consigneEcran(exercice, "marginales")} ${consigneEcran(exercice, "resoudreEgaliteMarginales")}`;
  const consigneB = `${consigneEcran(exercice, "beneficeFormule")} ${consigneEcran(exercice, "beneficeDerivee")} ${consigneEcran(exercice, "tableauSigneBenefice")} ${consigneEcran(exercice, "confirmationCoherence")} Justifie ta réponse. ${consigneEcran(exercice, "beneficeMaximum")}`;
  return {
    enteteFragments: construireEnteteContexteEconomique(exercice),
    questions: [
      { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 6 } },
      { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 8 } },
    ],
  };
}

function construireEnonceBonus(exercice: ExerciceContexteEconomiqueBonus): SectionExercice {
  const consigneA = consigneEcran(exercice, "poserEquationReduite");
  const consigneB = `Effectue 4 itérations de dichotomie à partir de l'intervalle de départ donné : ${consigneEcran(exercice, "iteration0")}`;
  const consigneC = `${consigneEcran(exercice, "racineApprochee")} ${precisionRacineApprochee(exercice)}`;
  return {
    enteteFragments: construireEnteteContexteEconomique(exercice),
    questions: [
      { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte(consigneB)], reponse: { type: "tableau", libellesLignes: ["Milieu", "Signe de P(milieu)", "Sous-intervalle conservé"], nombreColonnes: 4 } },
      { consigne: [texte(consigneC)], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireEnonceContexteEconomique(exercice: ExerciceContexteEconomique): SectionExercice {
  if (exercice.famille === "A") return construireEnonceA(exercice);
  if (exercice.famille === "B") return construireEnonceB(exercice);
  return construireEnonceBonus(exercice);
}

// ============================================================================
// Correction — resynthétisée depuis les valeurs déjà connues de l'instance, jamais recalculée.
// ============================================================================

/** Joint un tableau de fragments LaTeX déjà formatés (`formatReponseAttenduePhaseLatex`) avec un
 * séparateur textuel — utilisé pour les écrans à 1 ou 2 réponses (extremum, marginales…). */
function joindreLatex(valeurs: string[], separateur = " ; "): FragmentConsigne[] {
  return valeurs.flatMap((v, i) => (i === 0 ? [latex(v)] : [texte(separateur), latex(v)]));
}

function construireCorrectionA(exercice: ExerciceContexteEconomiqueA): BlocCorrection[] {
  const [cmDiscret] = formatReponseAttenduePhaseLatex(exercice, "coutMarginalDiscret");
  const [deriveeSymbolique] = formatReponseAttenduePhaseLatex(exercice, "deriveeSymbolique");
  const [deriveeValeur] = formatReponseAttenduePhaseLatex(exercice, "deriveeValeur");
  const [ecartAbsolu, ecartPourcent] = formatReponseAttenduePhaseLatex(exercice, "comparaisonEcart");
  const extremum = formatReponseAttenduePhaseLatex(exercice, "extremum");
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("a) "),
        latex(cmDiscret),
        texte(", "),
        latex(deriveeSymbolique),
        texte(", "),
        latex(deriveeValeur),
        texte(" — "),
        latex(ecartAbsolu),
        texte(", "),
        latex(ecartPourcent),
        texte("."),
      ],
    },
    { type: "paragraphe", fragments: [texte("b) "), ...joindreLatex(extremum), texte(".")] },
  ];
}

function construireCorrectionB(exercice: ExerciceContexteEconomiqueB): BlocCorrection[] {
  const [recetteTotale] = formatReponseAttenduePhaseLatex(exercice, "recetteTotale");
  const [coutMarginal, recetteMarginale] = formatReponseAttenduePhaseLatex(exercice, "marginales");
  const [racineRetenue, racineRejetee] = formatReponseAttenduePhaseLatex(exercice, "resoudreEgaliteMarginales");
  const [beneficeFormule] = formatReponseAttenduePhaseLatex(exercice, "beneficeFormule");
  const [beneficeDerivee] = formatReponseAttenduePhaseLatex(exercice, "beneficeDerivee");
  const [signeAvant, signeApres] = formatReponseAttenduePhaseLatex(exercice, "tableauSigneBenefice");
  const [coherence] = formatReponseAttenduePhaseLatex(exercice, "confirmationCoherence");
  const [beneficeMaximum] = formatReponseAttenduePhaseLatex(exercice, "beneficeMaximum");
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("a) "),
        latex(recetteTotale),
        texte(" ; "),
        latex(coutMarginal),
        texte(", "),
        latex(recetteMarginale),
        texte(" — égalité des marginales : "),
        latex(racineRetenue),
        texte(", "),
        latex(racineRejetee),
        texte("."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("b) "),
        latex(beneficeFormule),
        texte(", "),
        latex(beneficeDerivee),
        texte(" — "),
        latex(signeAvant),
        texte(", "),
        latex(signeApres),
        texte(" ⟹ maximum ("),
        latex(coherence),
        texte(") — "),
        latex(beneficeMaximum),
        texte("."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(
          "Piège à éviter : le bénéfice est maximal là où les marginales s'égalisent (C'_T(x)=R'_T(x)), jamais là où la recette seule serait maximale (R'_T(x)=0 donnerait en général une autre valeur de x).",
        ),
      ],
    },
  ];
}

function construireCorrectionBonus(exercice: ExerciceContexteEconomiqueBonus): BlocCorrection[] {
  const [equationReduite] = formatReponseAttenduePhaseLatex(exercice, "poserEquationReduite");
  const [racineApprochee] = formatReponseAttenduePhaseLatex(exercice, "racineApprochee");
  return [
    { type: "paragraphe", fragments: [texte("a) "), latex(equationReduite), texte(".")] },
    {
      type: "tableau",
      libellesLignes: ["Milieu", "Signe de P(milieu)", "Sous-intervalle conservé"],
      valeursParLigne: [
        exercice.iterations.map((it) => formatNombreLatex(it.milieu)),
        exercice.iterations.map((it) => (it.signeMilieu > 0 ? "P > 0" : "P < 0")),
        exercice.iterations.map((it) =>
          it.garderCote === "gauche"
            ? `[${formatNombreLatex(it.gauche)} ; ${formatNombreLatex(it.milieu)}]`
            : `[${formatNombreLatex(it.milieu)} ; ${formatNombreLatex(it.droite)}]`,
        ),
      ],
    },
    { type: "paragraphe", fragments: [texte("c) "), latex(racineApprochee), texte(` (réponse acceptée à ${exercice.toleranceFinale.toFixed(2)} près).`)] },
  ];
}

function construireCorrectionContexteEconomique(exercice: ExerciceContexteEconomique): BlocCorrection[] {
  if (exercice.famille === "A") return construireCorrectionA(exercice);
  if (exercice.famille === "B") return construireCorrectionB(exercice);
  return construireCorrectionBonus(exercice);
}

// ============================================================================
// Adaptateur.
// ============================================================================

export const adaptateurEvaluationContexteEconomique: AdaptateurFeuilleExercices<ExerciceContexteEconomique> = {
  titreDocument: "Contexte économique — Évaluation",
  nomFichierBase: "contexte-economique",
  genererInstance: genererExerciceContexteEconomique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceContexteEconomique,
  construireCorrection: construireCorrectionContexteEconomique,
  // PAS regroupable — 2 (familles A/B) ou 3 (bonus) questions par instance selon la famille, jamais
  // UNE constante, et consignes dépendantes des valeurs tirées (ex. tolérance du bonus) — voir le
  // commentaire de tête.
};
