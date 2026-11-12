import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceContexteEconomique } from "./generateurs5e/contexteEconomique/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  activerAideSuivante,
  demarrerSessionContexteEconomique,
  niveauAideMaxContexteEconomique,
  soumettreReponseBeneficeDerivee,
  soumettreReponseBeneficeFormule,
  soumettreReponseBeneficeMaximum,
  soumettreReponseComparaisonEcart,
  soumettreReponseCoutMarginalDiscret,
  soumettreReponseDeriveeSymbolique,
  soumettreReponseDeriveeValeur,
  soumettreReponseEgaliteMarginales,
  soumettreReponseIteration,
  soumettreReponseMinimum,
  soumettreReponseMarginales,
  soumettreReponsePoserEquationReduite,
  soumettreReponseRacineApprochee,
  soumettreReponseRecetteTotale,
  soumettreReponseTableauSigneBenefice,
} from "./moteur5e/sessionContexteEconomique";
import type { EcranContexteEconomique, EtatSessionContexteEconomique } from "./moteur5e/typesContexteEconomique";
import { indexIteration, ordreEcransContexteEconomique } from "./moteur5e/typesContexteEconomique";
import {
  diagnostiquerBeneficeDerivee,
  diagnostiquerBeneficeFormule,
  diagnostiquerBeneficeMaximum,
  diagnostiquerCoutMarginalB,
  diagnostiquerCoutMarginalDiscret,
  diagnostiquerDeriveeSymboliqueA,
  diagnostiquerDeriveeValeur,
  diagnostiquerEcartAbsolu,
  diagnostiquerEcartPourcent,
  diagnostiquerEquationReduite,
  diagnostiquerMilieuIteration,
  diagnostiquerMinimumQ,
  diagnostiquerMinimumValeur,
  diagnostiquerRacineApprochee,
  diagnostiquerRacineMarginale,
  diagnostiquerRacineRetenue,
  diagnostiquerRecetteMarginale,
  diagnostiquerRecetteTotale,
} from "./moteur5e/verificationContexteEconomique";
import { formatReponseAttenduePhaseLatex, libelleEcran, precisionRacineApprochee } from "./ui5e/formatContexteEconomique";
import { calculerRecapitulatifContexteEconomique } from "./ui5e/recapitulatifContexteEconomique";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import type { ReponseEgaliteMarginales, ReponseIterationDichotomie, ReponseTableauSigneBenefice } from "./moteur5e/verificationContexteEconomique";
import { EtapeChampsLibresCE } from "./components5e/EtapeChampsLibresCE";
import { EtapeChampsNumeriquesCE } from "./components5e/EtapeChampsNumeriquesCE";
import { EtapeResoudreEgaliteMarginales } from "./components5e/EtapeResoudreEgaliteMarginales";
import { EtapeTableauSigneBenefice } from "./components5e/EtapeTableauSigneBenefice";
import { EtapeIterationDichotomie } from "./components5e/EtapeIterationDichotomie";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionContexteEconomique {
  return demarrerSessionContexteEconomique(REGLAGES_DEMO, genererExerciceContexteEconomique);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs5e/contexteEconomique/exportEvaluation.ts`) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionContexteEconomique {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionContexteEconomique(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceContexteEconomique, (id) => construireAvecVarianteId(id)));
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionContexteEconomique;
  revele: boolean;
}

/** Même source que `calculerRecapitulatifContexteEconomique` (`revelesPartiels[ecran]`) —
 * `ordreEcransContexteEconomique(exercice)` donne la séquence RÉELLE (5 écrans pour la famille "A",
 * 8 pour "B", 6 pour le bonus, fixée dès le tirage).
 *
 * `aideUtiliseeParPhase` : état local dédié (voir `App5gen33`, ci-dessous) — rien dans
 * `EtatSessionContexteEconomique` ne trace le niveau d'aide d'un écran déjà clos (`niveauAide` est
 * remis à 0 à l'écran suivant). Écrit une seule fois, au moment exact de la clôture réelle de
 * chaque écran (`terminerEtape`), donc fiable pour tout écran déjà clos. */
function calculerSegmentsProgression(
  etat: EtatSessionContexteEconomique,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return ordreEcransContexteEconomique(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideUtiliseeParPhase[ecran] ? "aide" : "correcte";
  });
}

// ============================================================================
// Formatage de "votreReponse" (fiche de consultation) — un format court par type d'écran, même
// style "label=valeur" que `formatReponseAttenduePhaseLatex` (ui5e/formatContexteEconomique.ts).
// ============================================================================

/** Réponse de l'élève pour la fiche des puces : libellés en KaTeX, saisies en texte brut (une
 * saisie fausse ou incomplète ne doit jamais produire d'erreur KaTeX). */
function formatReponseChamps(labels: string[], valeurs: string[]): ReactNode {
  return (
    <>
      {labels.map((label, i) => (
        <span key={i} style={{ marginRight: "1em", display: "inline-block" }}>
          <Katex expression={label} /> {valeurs[i] ?? "?"}
        </span>
      ))}
    </>
  );
}

function formatReponseEgaliteMarginalesTexte(r: ReponseEgaliteMarginales): ReactNode {
  return formatReponseChamps(["x_1=", "x_2=", "x_{\\text{retenue}}="], [r.racines[0], r.racines[1], r.retenue]);
}

function formatReponseTableauSigneBenefice(exercice: EtatSessionContexteEconomique["exerciceCourant"], r: ReponseTableauSigneBenefice): ReactNode {
  if (exercice.famille !== "B") return null;
  return formatReponseChamps([`B'(${exercice.pointTestAvant})=`, `B'(${exercice.pointTestApres})=`], [r.avant, r.apres]);
}

function formatReponseIterationTexte(r: ReponseIterationDichotomie): string {
  return `milieu = ${r.milieu} ; signe de P au milieu : ${r.signe > 0 ? "+" : "−"} ; on garde la partie ${r.garder === "gauche" ? "de gauche" : "de droite"}`;
}

export function App5gen33() {
  const [etat, setEtat] = useState<EtatSessionContexteEconomique>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionContexteEconomique`, jamais dans le moteur (même principe que
   * `AppAnalyseFonction.tsx`, 4e). Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});
  /** Incrémenté à chaque nouvel exercice : fait partie de la clé d'écran (champs remis à zéro). */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  /** Réutilise `formatReponseAttenduePhaseLatex` — même source de vérité que
   * `calculerRecapitulatifContexteEconomique`/le bloc `validation` ci-dessous pour l'écran COURANT
   * revélé (jamais la réponse soumise par l'élève, contrairement à 5gen32). */
  function ajouterHistorique(votreReponse: ReactNode, ecranClos: EcranContexteEconomique, nouvelEtat: EtatSessionContexteEconomique) {
    setHistorique((h) => [
      ...h,
      {
        titre: libelleEcran(nouvelEtat.exerciceCourant, ecranClos),
        votreReponse,
        correcte: !nouvelEtat.derniereEtapeRevelee,
        reponseAttendue: nouvelEtat.derniereEtapeRevelee ? (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(nouvelEtat.exerciceCourant, ecranClos).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand l'écran se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et JAMAIS pour le
   * DERNIER écran de l'exercice (sa puce reste "courante" tant que `enAttente` est actif, puis
   * l'exercice entier redémarre à zéro dès "Nouvel exercice" — même principe que les autres
   * générateurs 5e déjà migrés). */
  function terminerEtape(nouvelEtat: EtatSessionContexteEconomique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      const exerciceTermine = nouvelEtat.resultats.length > etat.resultats.length;
      if (!exerciceTermine && votreReponse !== undefined) {
        ajouterHistorique(votreReponse, etat.phase, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setNumeroGeneration((n) => n + 1);
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setNumeroGeneration((n) => n + 1);
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionContexteEconomique(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, etat.phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Contexte économique</h1>
        <p className="app-subtitle">Chapitre 5 — Dérivées et applications</p>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifContexteEconomique(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={etat.phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionContexteEconomique["exerciceCourant"];
  phase: EcranContexteEconomique;
  etat: EtatSessionContexteEconomique;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionContexteEconomique, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionContexteEconomique) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxContexteEconomique();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  if (exercice.famille === "A") {
    switch (phase) {
      case "coutMarginalDiscret": {
        const labels = ["C_m(q_0)="];
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 0,5"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseCoutMarginalDiscret(etat, r[0]), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerCoutMarginalDiscret(r[0], exercice)]}
            validation={validation}
          />
        );
      }
      case "deriveeSymbolique": {
        const labels = ["C'_T(q)="];
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 4q − 3"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseDeriveeSymbolique(etat, r[0]), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerDeriveeSymboliqueA(r[0], exercice)]}
            validation={validation}
          />
        );
      }
      case "deriveeValeur": {
        const labels = ["C'_T(q_0)="];
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 0,5"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseDeriveeValeur(etat, r[0]), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerDeriveeValeur(r[0], exercice)]}
            validation={validation}
          />
        );
      }
      case "comparaisonEcart": {
        const labels = ["\\text{écart absolu}=", "\\text{écart en \\%}="];
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 0,5", "ex : 0,25"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) =>
              terminerEtape(soumettreReponseComparaisonEcart(etat, { ecartAbsolu: r[0], ecartPourcent: r[1] }), formatReponseChamps(labels, r))
            }
            diagnostiquer={(r) => [diagnostiquerEcartAbsolu(r[0], exercice), diagnostiquerEcartPourcent(r[1], exercice)]}
            validation={validation}
          />
        );
      }
      case "extremum": {
        const labels = ["q=", exercice.minimum.grandeur === "coutMoyen" ? "C_M(q)_{\\min}=" : "C'_T(q)_{\\min}="];
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 0,5", "ex : 0,5"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseMinimum(etat, { q: r[0], valeur: r[1] }), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerMinimumQ(r[0], exercice), diagnostiquerMinimumValeur(r[1], exercice)]}
            validation={validation}
          />
        );
      }
      default:
        return null;
    }
  }

  if (exercice.famille === "B") {
    switch (phase) {
      case "recetteTotale": {
        const labels = ["R_T(x)="];
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 3x² + 2x"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseRecetteTotale(etat, r[0]), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerRecetteTotale(r[0], exercice)]}
            validation={validation}
          />
        );
      }
      case "marginales": {
        const labels = ["C'_T(x)=", "R'_T(x)="];
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 3x² − 2", "ex : 4x + 5"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) =>
              terminerEtape(soumettreReponseMarginales(etat, { coutMarginal: r[0], recetteMarginale: r[1] }), formatReponseChamps(labels, r))
            }
            diagnostiquer={(r) => [diagnostiquerCoutMarginalB(r[0], exercice), diagnostiquerRecetteMarginale(r[1], exercice)]}
            validation={validation}
          />
        );
      }
      case "resoudreEgaliteMarginales":
        return (
          <EtapeResoudreEgaliteMarginales
            key={cleEcran}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseEgaliteMarginales(etat, r), formatReponseEgaliteMarginalesTexte(r))}
            diagnostiquerRacine={(t) => diagnostiquerRacineMarginale(t, exercice)}
            diagnostiquerRetenue={(t) => diagnostiquerRacineRetenue(t, exercice)}
            validation={validation}
          />
        );
      case "beneficeFormule": {
        const labels = ["B(x)="];
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : −x³ + 2x² + 7x"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseBeneficeFormule(etat, r[0]), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerBeneficeFormule(r[0], exercice)]}
            validation={validation}
          />
        );
      }
      case "beneficeDerivee": {
        const labels = ["B'(x)="];
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : −3x² + 4x + 7"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseBeneficeDerivee(etat, r[0]), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerBeneficeDerivee(r[0], exercice)]}
            validation={validation}
          />
        );
      }
      case "tableauSigneBenefice":
        return (
          <EtapeTableauSigneBenefice
            key={cleEcran}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseTableauSigneBenefice(etat, r), formatReponseTableauSigneBenefice(exercice, r))}
            validation={validation}
          />
        );
      case "beneficeMaximum": {
        const labels = [`B(${exercice.xOpt})=`];
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={labels}
            placeholders={["ex : 0,5"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseBeneficeMaximum(etat, r[0]), formatReponseChamps(labels, r))}
            diagnostiquer={(r) => [diagnostiquerBeneficeMaximum(r[0], exercice)]}
            validation={validation}
          />
        );
      }
      default:
        return null;
    }
  }

  // Bonus.
  switch (phase) {
    case "poserEquationReduite": {
      const labels = ["P(q)="];
      return (
        <EtapeChampsLibresCE
          key={cleEcran}
          exercice={exercice}
          ecran={phase}
          labels={labels}
          placeholders={["ex : 3q³ + q² − 4"]}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(r) => terminerEtape(soumettreReponsePoserEquationReduite(etat, r[0]), formatReponseChamps(labels, r))}
          diagnostiquer={(r) => [diagnostiquerEquationReduite(r[0], exercice)]}
          validation={validation}
        />
      );
    }
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3": {
      const index = indexIteration(phase);
      const it = exercice.iterations[index];
      return (
        <EtapeIterationDichotomie
          key={cleEcran}
          exercice={exercice}
          ecran={phase}
          intervalleCourant={{ gauche: it.gauche, droite: it.droite }}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(r) => terminerEtape(soumettreReponseIteration(etat, r), formatReponseIterationTexte(r))}
          diagnostiquerMilieu={(t) => diagnostiquerMilieuIteration(t, it.milieu)}
          validation={validation}
        />
      );
    }
    case "racineApprochee": {
      const labels = ["q\\approx"];
      return (
        <EtapeChampsNumeriquesCE
          key={cleEcran}
          exercice={exercice}
          ecran={phase}
          labels={labels}
          placeholders={["valeur approchée"]}
          precisionAnnoncee={precisionRacineApprochee(exercice)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(r) => terminerEtape(soumettreReponseRacineApprochee(etat, r[0]), formatReponseChamps(labels, r))}
          diagnostiquer={(r) => [diagnostiquerRacineApprochee(r[0], exercice)]}
          validation={validation}
        />
      );
    }
    default:
      return null;
  }
}
