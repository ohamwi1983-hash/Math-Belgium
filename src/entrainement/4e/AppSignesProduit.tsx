import { useState } from "react";
import type { Enonce, Exercice } from "./core/generateur.types";
import type { ExerciceSignesProduit, FacteurQuadratiqueIrreductible, FacteurSignesProduit, SolutionEnsembleProduit } from "./core/signesProduit.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideFactorisationChamp1,
  activerAideFactorisationChamp2,
  activerAideFactorisationFactorisation,
  activerAideGrilleSolution,
  activerAideGrilleTableau,
  activerAideReductionFacteur,
  demarrerSessionSignesProduit,
  soumettreChoixMethodeFacteur,
  soumettreReponseFactorisationChamp1,
  soumettreReponseFactorisationChamp2,
  soumettreReponseFactorisationFactorisation,
  soumettreReponseGrille,
  soumettreReponseIntervalle,
  soumettreReponseRacineLineaire,
  soumettreReponseReductionFacteur,
  soumettreReponseSigneIrreductible,
} from "./moteur/sessionSignesProduit";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral } from "./moteur/verification";
import { diagnostiquerReductionCoefficients } from "./moteur/verificationSimplification";
import type { EtatSessionSignesProduit, PhaseSignesProduit } from "./moteur/typesSignesProduit";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  genererExerciceSignesProduit,
  type VarianteSignesProduitId,
} from "./generateurs/signesProduit";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeReductionCoefficients } from "./components/EtapeReductionCoefficients";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeRacineLineaire } from "./components/EtapeRacineLineaire";
import { EtapeSigneIrreductible } from "./components/EtapeSigneIrreductible";
import { EtapeGrilleSignes } from "./components/EtapeGrilleSignes";
import { EtapeIntervalleProduit } from "./components/EtapeIntervalleProduit";
import { calculerRecapitulatifSignesProduit } from "./ui/recapitulatifSignesProduit";
import { calculerEtatActuelSignesProduit } from "./ui/etatActuelSignesProduit";
import { formatTermesEnonceSignesProduitLatex } from "./ui/formatSignesProduit";
import { necessiteSimplification } from "./moteur/simplificationEquation";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { OPTIONS_CATEGORIE_AVEC_IRREDUCTIBLE } from "./ui/categorieLabels";
import { formatSolutionEnsembleProduit } from "./ui/formatSolutionEnsembleProduit";
import { formatFormeFactoriseeDepuisRacines } from "./ui/formatEquation";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Étudie le signe de ce produit de facteurs.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionSignesProduit {
  return demarrerSessionSignesProduit(REGLAGES_DEMO, genererExerciceSignesProduit);
}

/** Le facteur quadratique factorisable de l'exercice courant, s'il existe — même principe que p2DeFractionGauche (AppEquationRationnelle.tsx). */
function facteurFactorisable(exercice: ExerciceSignesProduit): Exercice | undefined {
  const facteur = exercice.facteurs.find((f) => f.type === "quadratique_factorisable");
  return facteur?.type === "quadratique_factorisable" ? facteur.exercice : undefined;
}

/** Les facteurs quadratiques irréductibles de l'exercice courant, dans l'ordre de exercice.facteurs. */
function facteursIrreductibles(exercice: ExerciceSignesProduit): FacteurQuadratiqueIrreductible[] {
  return exercice.facteurs.filter((f): f is FacteurQuadratiqueIrreductible => f.type === "quadratique_irreductible");
}

/** Les facteurs linéaires de l'exercice courant, dans l'ordre de exercice.facteurs. */
function facteursLineaires(exercice: ExerciceSignesProduit): Extract<FacteurSignesProduit, { type: "lineaire" }>[] {
  return exercice.facteurs.filter((f): f is Extract<FacteurSignesProduit, { type: "lineaire" }> => f.type === "lineaire");
}

/**
 * Un `Exercice` factice pour l'écran "methodeFacteur" d'un facteur réellement irréductible — ce
 * composant partagé exige un `exercice: Exercice` (utilisé par sa branche d'affichage PAR DÉFAUT),
 * jamais réellement rendu ici puisque `expressionAffichee` est toujours fourni sur cet écran (voir
 * plus bas) : seule sa forme suffit à satisfaire TypeScript, son contenu n'a aucune conséquence
 * fonctionnelle.
 */
function exerciceFactice(enonce: Enonce): Exercice {
  return {
    categorie: "irreductible",
    enonce,
    solution: { racines: [NaN, NaN], racinesExactes: true },
    formeAffichage: "canonique",
  };
}

/**
 * Segments de la barre de progression en puces — calculés dynamiquement à partir de
 * `exercice.facteurs` (jamais une liste statique de phases, contrairement à
 * AppAnalyseFonction.tsx) : les phases "racineLineaire"/"methodeFacteur"/"signeIrreductible" se
 * répètent une fois par facteur du type concerné, et "reductionFacteur" (facteur factorisable à
 * coefficients non réduits)/"factorisationFactorisation" (uniquement si categorie === "cas_general")
 * n'existent que pour certains exercices — voir le commentaire de `PhaseSignesProduit`
 * (moteur/typesSignesProduit.ts) et `phasePourFacteur` (moteur/sessionSignesProduit.ts). Chaque
 * segment reprend EXACTEMENT la même heuristique "revele" que `calculerRecapitulatifSignesProduit`
 * (ui/recapitulatifSignesProduit.ts) pour la phase correspondante, jamais recalculée différemment.
 */
function calculerSegmentsProgression(etat: EtatSessionSignesProduit): EtatPuceProgression[] {
  const segments: EtatPuceProgression[] = [];
  let nbLineaireVus = 0;
  let nbQuadratiqueVus = 0;
  let nbIrreductibleVus = 0;

  etat.exerciceCourant.facteurs.forEach((facteur, i) => {
    if (facteur.type === "lineaire") {
      const index = nbLineaireVus;
      nbLineaireVus += 1;
      if (i > etat.indexFacteurExercice) {
        segments.push("a-venir");
      } else if (i === etat.indexFacteurExercice && etat.phase === "racineLineaire") {
        segments.push("courante");
      } else {
        segments.push(etat.scoresRacineLineaireExercice[index] === 0 ? "revele" : "correcte");
      }
      return;
    }

    // Facteur quadratique (factorisable ou irréductible) : la sous-séquence de phases dépend de sa
    // vraie nature et, pour le facteur factorisable, de sa catégorie et de ses coefficients
    // initiaux — jamais du choix de l'élève à "methodeFacteur" (même principe que le moteur).
    const indexQuadratique = nbQuadratiqueVus;
    nbQuadratiqueVus += 1;
    const indexIrreductible = facteur.type === "quadratique_irreductible" ? nbIrreductibleVus : -1;
    if (facteur.type === "quadratique_irreductible") nbIrreductibleVus += 1;

    const reductionApplicable =
      facteur.type === "quadratique_factorisable" &&
      (etat.scoreReductionFacteurExercice !== null || necessiteSimplification(facteur.exercice));

    const sousPhases: PhaseSignesProduit[] = [
      ...(reductionApplicable ? ["reductionFacteur" as const] : []),
      "methodeFacteur",
      ...(facteur.type === "quadratique_factorisable"
        ? facteur.exercice.categorie === "cas_general"
          ? ["factorisationChamp1" as const, "factorisationChamp2" as const, "factorisationFactorisation" as const]
          : ["factorisationChamp1" as const, "factorisationChamp2" as const]
        : ["signeIrreductible" as const]),
    ];

    const indexSousPhaseCourante =
      i < etat.indexFacteurExercice ? sousPhases.length : i > etat.indexFacteurExercice ? -1 : sousPhases.indexOf(etat.phase);

    sousPhases.forEach((sousPhase, k) => {
      if (k > indexSousPhaseCourante) {
        segments.push("a-venir");
        return;
      }
      if (k === indexSousPhaseCourante && i === etat.indexFacteurExercice) {
        segments.push("courante");
        return;
      }
      const revele = (() => {
        switch (sousPhase) {
          case "reductionFacteur":
            return etat.scoreReductionFacteurExercice === 0;
          case "methodeFacteur":
            return etat.methodeRevelees[indexQuadratique] ?? false;
          case "factorisationChamp1":
            return etat.scoreFactorisationChamp1Exercice === 0;
          case "factorisationChamp2":
            return etat.scoreFactorisationChamp2Exercice === 0;
          case "factorisationFactorisation":
            return etat.scoreFactorisationFactorisationExercice === 0;
          default:
            return etat.scoresSigneIrreductibleExercice[indexIrreductible] === 0;
        }
      })();
      segments.push(revele ? "revele" : "correcte");
    });
  });

  segments.push(
    etat.scoreGrilleExercice !== null
      ? etat.grilleRevelee
        ? "revele"
        : "correcte"
      : etat.phase === "grille"
        ? "courante"
        : "a-venir",
  );
  // "intervalle" (dernière phase) n'a pas de branche "close" propre : une fois terminée, un nouvel
  // exercice démarre (l'état entier est remis à zéro) — même principe que "tableauSignes" dans
  // AppAnalyseFonction.tsx.
  segments.push(etat.phase === "intervalle" ? "courante" : "a-venir");

  return segments;
}

/** État tenu en attente dès qu'une SOUS-ÉTAPE notée se termine (bonne réponse, ou tentatives
 * épuisées) — l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le
 * bouton de `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation
 * avant de passer à l'écran suivant"). Les phases "racineLineaire"/"methodeFacteur"/
 * "signeIrreductible" se répètent une fois par facteur (même nom de phase d'un facteur au suivant),
 * donc la clôture ne peut JAMAIS être détectée via un simple changement de `phase` pour ces 3-là —
 * elle est détectée via la croissance du tableau de scores concerné (voir `terminerEtape`). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionSignesProduit;
  revele: boolean;
}

export function AppSignesProduit() {
  const [etat, setEtat] = useState<EtatSessionSignesProduit>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionSignesProduit) {
    const transitionDEcran = (() => {
      switch (etat.phase) {
        case "racineLineaire":
          return nouvelEtat.scoresRacineLineaireExercice.length > etat.scoresRacineLineaireExercice.length;
        case "methodeFacteur":
          return nouvelEtat.scoresMethodeExercice.length > etat.scoresMethodeExercice.length;
        case "signeIrreductible":
          return nouvelEtat.scoresSigneIrreductibleExercice.length > etat.scoresSigneIrreductibleExercice.length;
        case "intervalle":
          return nouvelEtat.terminee !== etat.terminee || nouvelEtat.resultats.length > etat.resultats.length;
        default:
          // reductionFacteur/factorisationChamp1/factorisationChamp2/factorisationFactorisation/grille
          // ne se répètent jamais pour un même exercice (au plus une occurrence chacune) — un simple
          // changement de phase suffit à détecter leur clôture.
          return nouvelEtat.phase !== etat.phase;
      }
    })();

    if (!transitionDEcran) {
      setEtat(nouvelEtat);
      return;
    }

    const revele = (() => {
      switch (etat.phase) {
        case "racineLineaire":
          return nouvelEtat.scoresRacineLineaireExercice[nouvelEtat.scoresRacineLineaireExercice.length - 1] === 0;
        case "reductionFacteur":
          return nouvelEtat.scoreReductionFacteurExercice === 0;
        case "methodeFacteur":
          return nouvelEtat.methodeRevelees[nouvelEtat.methodeRevelees.length - 1]!;
        case "factorisationChamp1":
          return nouvelEtat.scoreFactorisationChamp1Exercice === 0;
        case "factorisationChamp2":
          return nouvelEtat.scoreFactorisationChamp2Exercice === 0;
        case "factorisationFactorisation":
          return nouvelEtat.scoreFactorisationFactorisationExercice === 0;
        case "signeIrreductible":
          return nouvelEtat.scoresSigneIrreductibleExercice[nouvelEtat.scoresSigneIrreductibleExercice.length - 1] === 0;
        case "grille":
          return nouvelEtat.grilleRevelee;
        case "intervalle":
          return nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.intervalleRevele;
      }
    })();

    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionSignesProduit(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteSignesProduitId)));
  }

  const recapitulatif = calculerRecapitulatifSignesProduit(etat);
  const etatActuel = calculerEtatActuelSignesProduit(etat);
  const expressionEnonceTermes = formatTermesEnonceSignesProduitLatex(etat.exerciceCourant);
  const factorisable = facteurFactorisable(etat.exerciceCourant);
  const irreductibles = facteursIrreductibles(etat.exerciceCourant);
  const lineaires = facteursLineaires(etat.exerciceCourant);
  const irreductibleCourant = irreductibles[etat.scoresSigneIrreductibleExercice.length];
  const facteurCourant = etat.exerciceCourant.facteurs[etat.indexFacteurExercice];

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : (() => {
          switch (etat.phase) {
            case "racineLineaire": {
              const index = etat.scoresRacineLineaireExercice.length;
              return (
                <>
                  Racine attendue (facteur linéaire{lineaires.length > 1 ? ` ${index + 1}` : ""}) : {lineaires[index]?.polynome.p}
                </>
              );
            }
            case "factorisationChamp2":
              return factorisable ? (
                <>Racines attendues (facteur à factoriser) : {[...factorisable.solution.racines].sort((a, b) => a - b).join(" ; ")}</>
              ) : undefined;
            case "factorisationFactorisation":
              return factorisable ? (
                <>
                  Forme factorisée attendue (facteur à factoriser) :{" "}
                  <Katex expression={`${formatFormeFactoriseeDepuisRacines(factorisable.enonce, factorisable.solution.racines)} = 0`} />
                </>
              ) : undefined;
            case "signeIrreductible": {
              const index = etat.scoresSigneIrreductibleExercice.length;
              return (
                <>
                  Signe attendu (facteur irréductible{irreductibles.length > 1 ? ` ${index + 1}` : ""}) :{" "}
                  {irreductibles[index]?.signe === "+" ? "toujours positif" : "toujours négatif"}
                </>
              );
            }
            case "grille":
              return <>Tableau attendu : signe du produit = {etat.exerciceCourant.grille.produit.join(" ")}</>;
            case "intervalle":
              return <>Réponse attendue : S = {formatSolutionEnsembleProduit(etat.exerciceCourant.solution)}</>;
            default:
              return undefined;
          }
        })(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de signes à plusieurs facteurs</h1>
        <p className="app-subtitle">Produit de facteurs du 1er et du 2nd degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box equation-box-termes">
                {expressionEnonceTermes.map((terme, i) => (
                  <Katex key={i} expression={terme} />
                ))}
              </div>
            }
          />
          {etat.phase === "racineLineaire" && facteurCourant?.type === "lineaire" ? (
            <EtapeRacineLineaire
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel as string}
              onValider={(racine) => terminerEtape(soumettreReponseRacineLineaire(etat, racine))}
              validation={validation}
            />
          ) : etat.phase === "reductionFacteur" && facteurCourant?.type === "quadratique_factorisable" ? (
            <EtapeReductionCoefficients
              exercice={facteurCourant.exercice}
              nom="facteur"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              masquerBlocDonnees
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerReductionCoefficients(facteurCourant.exercice, v)}
              aideActivee={etat.aideReductionFacteurUtilisee}
              onActiverAide={() => setEtat(activerAideReductionFacteur(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseReductionFacteur(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "methodeFacteur" && facteurCourant && facteurCourant.type !== "lineaire" ? (
            <EtapeReconnaissance
              exercice={facteurCourant.type === "quadratique_factorisable" ? facteurCourant.exercice : exerciceFactice(facteurCourant.enonce)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              masquerBlocDonnees
              etatActuel={etatActuel}
              options={OPTIONS_CATEGORIE_AVEC_IRREDUCTIBLE}
              question="Quelle est la méthode la plus rapide pour factoriser ce facteur ?"
              onChoisir={(choix) => terminerEtape(soumettreChoixMethodeFacteur(etat, choix))}
              validation={validation}
            />
          ) : etat.phase === "factorisationChamp1" && factorisable ? (
            <EtapeChamp1
              exercice={factorisable}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              masquerBlocDonnees
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(factorisable, v)}
              aideActivee={etat.aideFactorisationChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideFactorisationChamp1(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFactorisationChamp1(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "factorisationChamp2" && factorisable ? (
            <EtapeRacinesFlexibles
              exercice={factorisable}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              labelChamp="Racines"
              libellePasDe="Pas de racine"
              libelleAuMoins="Au moins une racine"
              placeholderPrefixe="racine"
              prefixeChamp="x ="
              expressionAfficheeTermes={expressionEnonceTermes}
              masquerBlocDonnees
              etatActuel={etatActuel}
              aideActivee={etat.aideFactorisationChamp2Utilisee}
              onActiverAide={() => setEtat(activerAideFactorisationChamp2(etat))}
              onValider={(racines) => terminerEtape(soumettreReponseFactorisationChamp2(etat, racines))}
              validation={validation}
            />
          ) : etat.phase === "factorisationFactorisation" && factorisable ? (
            <EtapeChamp1
              exercice={factorisable}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              masquerBlocDonnees
              etatActuel={etatActuel}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(factorisable, v)}
              aideActivee={etat.aideFactorisationFactorisationUtilisee}
              onActiverAide={() => setEtat(activerAideFactorisationFactorisation(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFactorisationFactorisation(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "signeIrreductible" && irreductibleCourant ? (
            <EtapeSigneIrreductible
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              onValider={(reponse) => terminerEtape(soumettreReponseSigneIrreductible(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" ? (
            <EtapeGrilleSignes
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideGrilleTableauUtilisee}
              onActiverAide={() => setEtat(activerAideGrilleTableau(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseGrille(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeIntervalleProduit
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAideGrilleSolution(etat))}
              onValider={(reponse: SolutionEnsembleProduit) => terminerEtape(soumettreReponseIntervalle(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
