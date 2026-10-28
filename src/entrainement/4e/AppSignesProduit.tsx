import { useState } from "react";
import type { ReactNode } from "react";
import type { Enonce, Exercice } from "./core/generateur.types";
import type { ExerciceSignesProduit, FacteurQuadratiqueIrreductible, SolutionEnsembleProduit } from "./core/signesProduit.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideFactorisationChamp1,
  activerAideFactorisationChamp2,
  activerAideFactorisationFactorisation,
  activerAideGrilleSolution,
  activerAideGrilleTableau,
  activerAideReductionFacteur,
  activerAideSigneIrreductible,
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
import { calculerRecapitulatifSignesProduit, entreeRecapPourEcran } from "./ui/recapitulatifSignesProduit";
import { calculerEtatActuelSignesProduit } from "./ui/etatActuelSignesProduit";
import { formatTermesEnonceSignesProduitLatex } from "./ui/formatSignesProduit";
import { necessiteSimplification } from "./moteur/simplificationEquation";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { OPTIONS_CATEGORIE_AVEC_IRREDUCTIBLE, libelleCategorie } from "./ui/categorieLabels";
import { formatSolutionEnsembleProduit } from "./ui/formatSolutionEnsembleProduit";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Résous cette inéquation en étudiant le signe de chacun de ses facteurs.";

/** Aide de l'écran "réduction" propre à ce générateur — le diviseur doit être POSITIF, sinon le
 * signe du facteur (donc celui du produit) change (audit gen5). */
const TEXTE_AIDE_REDUCTION =
  "Cherche le plus grand diviseur commun aux trois coefficients, puis divise tout le facteur par ce nombre pris positif : diviser par un nombre négatif changerait le signe du facteur, donc celui du produit.";

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
        segments.push(etat.racineLineaireRevelees[index] ? "revele" : "correcte");
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
            return etat.reductionFacteurRevele;
          case "methodeFacteur":
            return etat.methodeRevelees[indexQuadratique] ?? false;
          case "factorisationChamp1":
            return etat.factorisationChamp1Revele;
          case "factorisationChamp2":
            return etat.factorisationChamp2Revele;
          case "factorisationFactorisation":
            return etat.factorisationFactorisationRevele;
          default:
            return etat.signeIrreductibleRevelees[indexIrreductible];
        }
      })();
      if (revele) {
        segments.push("revele");
        return;
      }
      // "methodeFacteur" (comme "racineLineaire" ci-dessus) n'a aucun mécanisme d'aide (toujours
      // "correcte", jamais "aide").
      const aideUtilisee =
        sousPhase === "signeIrreductible"
          ? (etat.aidesSigneIrreductibleExercice[indexIrreductible] ?? false)
          : sousPhase === "reductionFacteur"
          ? etat.aideReductionFacteurUtilisee
          : sousPhase === "factorisationChamp1"
            ? etat.aideFactorisationChamp1Utilisee
            : sousPhase === "factorisationChamp2"
              ? etat.aideFactorisationChamp2Utilisee
              : sousPhase === "factorisationFactorisation"
                ? etat.aideFactorisationFactorisationUtilisee
                : false;
      segments.push(aideUtilisee ? "aide" : "correcte");
    });
  });

  segments.push(
    etat.scoreGrilleExercice !== null
      ? etat.grilleRevelee
        ? "revele"
        : etat.aideGrilleTableauUtilisee
          ? "aide"
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
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionSignesProduit`, jamais dans le moteur (voir
   * AppAnalyseFonction.tsx). Remis à vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Même mécanisme que AppAnalyseFonction.tsx::ajouterHistorique — la réponse ATTENDUE vient de
   * l'entrée du récapitulatif produite par l'écran qui se clôt, retrouvée EXPLICITEMENT par sa
   * phase et la position de son facteur (`entreeRecapPourEcran`) — jamais « la dernière ligne du
   * récap », qui n'était souvent pas celle de l'écran clos (audit gen5 : fiche d'un autre écran,
   * parfois « ✓ Correct » pour un écran raté). "grille" a sa propre fonction ci-dessous,
   * "intervalle" (dernière phase) n'est jamais poussée dans l'historique. */
  function ajouterHistoriqueDepuisRecap(votreReponse: ReactNode, nouvelEtat: EtatSessionSignesProduit) {
    const entree = entreeRecapPourEcran(nouvelEtat, etat.phase, etat.indexFacteurExercice);
    if (!entree) return;
    setHistorique((h) => [
      ...h,
      {
        titre: entree.libelle,
        votreReponse,
        correcte: !entree.revele,
        reponseAttendue: entree.revele ? (entree.estLatex ? <Katex expression={entree.valeur} /> : entree.valeur) : undefined,
      },
    ]);
  }

  /** "grille" n'a pas d'entrée dans `calculerRecapitulatifSignesProduit` (voir son commentaire) —
   * même donnée que `validation.reponseAttendue` pour cette phase, construite directement depuis
   * `exerciceCourant.grille`, jamais une seconde source. */
  function ajouterHistoriqueGrille(votreReponse: ReactNode, nouvelEtat: EtatSessionSignesProduit) {
    setHistorique((h) => [
      ...h,
      {
        titre: "Tableau de signes",
        votreReponse,
        correcte: !nouvelEtat.grilleRevelee,
        reponseAttendue: nouvelEtat.grilleRevelee ? <>Signe du produit = {nouvelEtat.exerciceCourant.grille.produit.join(" ")}</> : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand la SOUS-ÉTAPE se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire détaillé
   * de AppAnalyseFonction.tsx::terminerEtape, même garde reproduit ici à l'identique). */
  function terminerEtape(nouvelEtat: EtatSessionSignesProduit, votreReponse?: ReactNode) {
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

    if (votreReponse !== undefined) {
      if (etat.phase === "grille") {
        ajouterHistoriqueGrille(votreReponse, nouvelEtat);
      } else {
        ajouterHistoriqueDepuisRecap(votreReponse, nouvelEtat);
      }
    }

    const revele = (() => {
      switch (etat.phase) {
        case "racineLineaire":
          return nouvelEtat.racineLineaireRevelees[nouvelEtat.racineLineaireRevelees.length - 1]!;
        case "reductionFacteur":
          return nouvelEtat.reductionFacteurRevele;
        case "methodeFacteur":
          return nouvelEtat.methodeRevelees[nouvelEtat.methodeRevelees.length - 1]!;
        case "factorisationChamp1":
          return nouvelEtat.factorisationChamp1Revele;
        case "factorisationChamp2":
          return nouvelEtat.factorisationChamp2Revele;
        case "factorisationFactorisation":
          return nouvelEtat.factorisationFactorisationRevele;
        case "signeIrreductible":
          return nouvelEtat.signeIrreductibleRevelees[nouvelEtat.signeIrreductibleRevelees.length - 1]!;
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
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSessionSignesProduit(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteSignesProduitId)));
  }

  const recapitulatif = calculerRecapitulatifSignesProduit(etat);
  const etatActuel = calculerEtatActuelSignesProduit(etat);
  // Toujours l'énoncé tel que tiré : la réduction d'un facteur ne doit jamais modifier l'énoncé
  // affiché (audit gen5) — elle apparaît dans le récapitulatif et l'état actuel du facteur.
  const expressionEnonceTermes = formatTermesEnonceSignesProduitLatex(etat.exerciceInitial);
  const factorisable = facteurFactorisable(etat.exerciceCourant);
  const irreductibles = facteursIrreductibles(etat.exerciceCourant);
  const irreductibleCourant = irreductibles[etat.scoresSigneIrreductibleExercice.length];
  const facteurCourant = etat.exerciceCourant.facteurs[etat.indexFacteurExercice];

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        // Tous les écrans par facteur (dont réduction/méthode/Δ ou factorisation, sans réponse
        // attendue avant l'audit gen5) : la même entrée que le récapitulatif, retrouvée par la phase
        // et le facteur de l'écran qui se clôt — jamais une seconde source.
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : (() => {
          switch (etat.phase) {
            case "grille":
              return <>Tableau attendu : signe du produit = {etat.exerciceCourant.grille.produit.join(" ")}</>;
            case "intervalle":
              return <>S = {formatSolutionEnsembleProduit(etat.exerciceCourant.solution)}</>;
            default: {
              const entree = entreeRecapPourEcran(enAttente.etatSuivant, etat.phase, etat.indexFacteurExercice);
              if (!entree) return undefined;
              return (
                <>
                  {entree.libelle} : {entree.estLatex ? <Katex expression={entree.valeur} /> : entree.valeur}
                </>
              );
            }
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
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

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
              onValider={(racine) => terminerEtape(soumettreReponseRacineLineaire(etat, racine), `x = ${racine}`)}
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
              texteAide={TEXTE_AIDE_REDUCTION}
              onActiverAide={() => setEtat(activerAideReductionFacteur(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseReductionFacteur(etat, reponse), reponse)}
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
              onChoisir={(choix) => terminerEtape(soumettreChoixMethodeFacteur(etat, choix), libelleCategorie(choix))}
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
              labelFactorisation="Forme factorisée du facteur"
              diagnostiquer={(v) => diagnostiquerChampPrincipal(factorisable, v)}
              aideActivee={etat.aideFactorisationChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideFactorisationChamp1(etat))}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseFactorisationChamp1(etat, reponse),
                  factorisable.categorie === "cas_general" ? `Δ = ${reponse}` : `${reponse} = 0`,
                )
              }
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
              onValider={(racines) =>
                terminerEtape(
                  soumettreReponseFactorisationChamp2(etat, racines),
                  // "Pas de racine" est transmis comme [NaN, NaN] : jamais « NaN ; NaN » dans la fiche.
                  racines.every(Number.isFinite) ? racines.join(" ; ") : "Pas de racine",
                )
              }
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
              onValider={(reponse) => terminerEtape(soumettreReponseFactorisationFactorisation(etat, reponse), `${reponse} = 0`)}
              validation={validation}
            />
          ) : etat.phase === "signeIrreductible" && irreductibleCourant ? (
            <EtapeSigneIrreductible
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              aideActivee={etat.aideSigneIrreductibleCourante}
              onActiverAide={() => setEtat(activerAideSigneIrreductible(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSigneIrreductible(etat, reponse), reponse === "+" ? "Toujours positif" : "Toujours négatif")}
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
              onValider={(reponse) => terminerEtape(soumettreReponseGrille(etat, reponse), `Signe du produit = ${reponse.produit.join(" ")}`)}
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

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
