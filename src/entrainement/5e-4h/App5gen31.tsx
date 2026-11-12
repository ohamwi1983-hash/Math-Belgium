import { useState } from "react";
import type { ReactNode } from "react";
import type { EnsembleReelGuide } from "./core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudierFonction } from "./generateurs5e/etudierFonction/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  avancerRecap,
  demarrerSessionEtudierFonction,
  niveauAideMaxEtudierFonction,
  niveauAideMaxGraphique,
  soumettreReponseCalculerFPrime,
  soumettreReponseCalculerFSeconde,
  soumettreReponseCoordonnees,
  soumettreReponseDomaine,
  soumettreReponseGraphique,
  soumettreReponseLimites,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
} from "./moteur5e/sessionEtudierFonction";
import type { EcranEtudierFonction, EtatSessionEtudierFonction } from "./moteur5e/typesEtudierFonction";
import { ordreEcransEtudierFonction } from "./moteur5e/typesEtudierFonction";
import {
  diagnostiquerCalculerFPrime,
  diagnostiquerCalculerFSeconde,
  listeSlotsLimites,
  pointsClesEtudierFonction,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
} from "./moteur5e/verificationEtudierFonction";
import type { ReponseTableauEtudierFonction, ValeurReponseSlotLimite } from "./moteur5e/verificationEtudierFonction";
import { EtapeDomaineEtudierFonction } from "./components5e/EtapeDomaineEtudierFonction";
import { EtapeLimitesEtudierFonction } from "./components5e/EtapeLimitesEtudierFonction";
import { EtapeCalculerDeriveeGenerique } from "./components5e/EtapeCalculerDeriveeGenerique";
import { EtapeTableauEtudierFonction } from "./components5e/EtapeTableauEtudierFonction";
import { EtapeRecapitulatifEtudierFonction } from "./components5e/EtapeRecapitulatifEtudierFonction";
import { EtapeCoordonneesEtudierFonction } from "./components5e/EtapeCoordonneesEtudierFonction";
import { TableauEtudeLocaleRecap } from "./components5e/TableauEtudeLocaleRecap";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import { PlacementPointsGraphique } from "./components5e/PlacementPointsGraphique";
import { EtudierFonctionGraph } from "./components5e/EtudierFonctionGraph";
import { ResultatPanelEtudierFonction } from "./components5e/ResultatPanelEtudierFonction";
import { ResumeSessionEtudierFonction } from "./components5e/ResumeSessionEtudierFonction";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { calculerRecapitulatifEtudierFonction } from "./ui5e/recapitulatifEtudierFonction";
import {
  formatAbscissePointLatex,
  formatEnsembleReelGuideLatex,
  formatEnteteColonnesTableauEtudierFonction,
  formatLabelSlotLimite,
  formatOrdonneeLatex,
  formatReponseAttenduePhaseLatex,
  LIBELLE_ECRAN_ETUDIER_FONCTION,
} from "./ui5e/formatEtudierFonction";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEtudierFonction {
  return demarrerSessionEtudierFonction(REGLAGES_DEMO, genererExerciceEtudierFonction);
}

interface Bilan {
  resultat: EtatSessionEtudierFonction["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

/** Puces de progression — séquence RÉELLEMENT parcourue par CET exercice
 * (`ordreEcransEtudierFonction`, 7 ou 8 écrans selon `possedeDomaineRestreint`). Index-based plutôt
 * que la seule présence d'un score dans `scoresPartiels` : l'écran "recap" (purement
 * présentationnel, voir `typesEtudierFonction.ts`/`sessionEtudierFonction.ts::avancerRecap`) n'a
 * JAMAIS de clé dans `scoresPartiels` même une fois franchi — seule sa position dans l'ordre avant
 * `etat.phase` dit qu'il est déjà clos ("correcte", jamais "revele", aucune notion de révélation
 * pour un écran sans question). Pour les autres écrans, `etat.revelesPartiels[ecran]` (peuplé
 * depuis `etapeCourante.revelee` à la clôture, `sessionEtudierFonction.ts::soumettreEcran`).
 *
 * `aideParPhase` : même état local déjà tenu par le composant pour le bilan
 * (`ResultatPanelEtudierFonction`) — réutilisé ICI tel quel pour distinguer "correcte"/"aide" :
 * aucun autre champ ne trace le niveau d'aide utilisé PAR ÉCRAN DÉJÀ CLOS (le moteur ne garde que
 * `niveauAide` courant, remis à 0 à chaque nouvel écran). Pour un écran déjà clos, l'entrée
 * `aideParPhase[ecran]` a été écrite une dernière fois (par `terminerEtape`, ci-dessous) au moment
 * exact de sa clôture réelle, donc fiable même si des tentatives ratées antérieures l'ont écrite
 * entre-temps avec des valeurs provisoires. "recap" (aucun mécanisme d'aide, voir
 * `formatEtudierFonction.ts`) retombe toujours dans la branche "correcte" sans jamais consulter
 * `aideParPhase` (pas de score `undefined` → "correcte" direct, jamais "aide" inventée). */
function calculerSegmentsProgression(
  etat: EtatSessionEtudierFonction,
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>,
): EtatPuceProgression[] {
  const ordre = ordreEcransEtudierFonction(etat.exerciceCourant);
  const indexCourant = ordre.indexOf(etat.phase);
  return ordre.map((ecran, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "correcte";
    if (etat.revelesPartiels[ecran]) return "revele";
    return (aideParPhase[ecran]?.niveauAide ?? 0) > 0 ? "aide" : "correcte";
  });
}

// ============================================================================
// Formatage de "votreReponse" (fiche de consultation) — un format court par type d'écran, même
// style que ce que `calculerRecapitulatifEtudierFonction`/`formatReponseAttenduePhaseLatex`
// affichent pour la réponse ATTENDUE de la MÊME phase (jamais un second vocabulaire).
// ============================================================================

function formatValeurReponseLimiteLatex(valeur: ValeurReponseSlotLimite): string {
  if (valeur === 1) return "+\\infty";
  if (valeur === -1) return "-\\infty";
  return valeur ?? "?";
}

function formatReponseLimitesLatex(exercice: EtatSessionEtudierFonction["exerciceCourant"], reponses: ValeurReponseSlotLimite[]): string {
  const slots = listeSlotsLimites(exercice);
  return slots.map((slot, i) => `${formatLabelSlotLimite(slot).replace("\\,?", "")}${formatValeurReponseLimiteLatex(reponses[i])}`).join("\\;;\\;");
}

function formatReponseTableauTexte(reponse: ReponseTableauEtudierFonction): string {
  return `signes : ${reponse.signes.map((v) => v ?? "×").join(" ")} ; ${reponse.ligne2.map((v) => v ?? "×").join(" ")}`;
}

/** Réponse attendue d'un écran (validation et fiches) : tableau en lecture seule, ou formules. */
function reponseAttenduePhase(exercice: EtatSessionEtudierFonction["exerciceCourant"], ecran: EcranEtudierFonction): ReactNode {
  if (ecran === "tableauFPrime" || ecran === "tableauFSeconde") {
    const mode = ecran === "tableauFPrime" ? "fprime" : "fseconde";
    const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
    return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={formatEnteteColonnesTableauEtudierFonction(exercice, attendu.colonnes, mode)} mode={mode} attendu={attendu} />;
  }
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, ecran).map((frag, i) => (
        <Katex key={i} expression={frag} block={frag.includes("\\lim_{")} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionEtudierFonction;
  revele: boolean;
}

export function App5gen31() {
  const [etat, setEtat] = useState<EtatSessionEtudierFonction>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionEtudierFonction`, jamais dans le moteur (même principe que
   * `AppAnalyseFonction.tsx`, 4e). Remis à vide à chaque nouvel exercice, comme `aideParPhase`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Compteur de générations : entre dans la clé d'écran, tout « Générer » repart de champs vides. */
  const [numeroGeneration, setNumeroGeneration] = useState(0);
  /** Écran clos en attente de « Écran suivant » (bloc `ValidationEcran`, réponse attendue affichée). */
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function ajouterHistorique(ecran: EcranEtudierFonction, votreReponse: ReactNode, nouvelEtat: EtatSessionEtudierFonction) {
    const revele = nouvelEtat.revelesPartiels[ecran] ?? false;
    setHistorique((h) => [
      ...h,
      { titre: LIBELLE_ECRAN_ETUDIER_FONCTION[ecran], votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttenduePhase(etat.exerciceCourant, ecran) : undefined },
    ]);
  }

  function appliquer(nouvelEtat: EtatSessionEtudierFonction, ecranClos: EcranEtudierFonction, niveauAide: number) {
    const miseAJour = { ...aideParPhase, [ecranClos]: { niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
      setHistorique([]);
      setFicheOuverteIndex(null);
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  /** Un écran qui se clôt passe par le bloc `ValidationEcran` (réponse attendue, « Écran suivant ») ;
   * une tentative ratée non finale reste sur l'écran. Le dernier écran (« graphique ») a son propre
   * bouton « Continuer » et n'est jamais poussé dans l'historique. */
  function terminerEtape(nouvelEtat: EtatSessionEtudierFonction, votreReponse?: ReactNode) {
    const clos = nouvelEtat.phase !== etat.phase || nouvelEtat.resultats.length > etat.resultats.length;
    if (!clos) {
      setEtat(nouvelEtat);
      return;
    }
    if (votreReponse !== undefined) ajouterHistorique(etat.phase, votreReponse, nouvelEtat);
    if (etat.phase === "graphique") {
      appliquer(nouvelEtat, etat.phase, etat.niveauAide);
      return;
    }
    setAideParPhase((m) => ({ ...m, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } }));
    setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    appliquer(enAttente.etatSuivant, etat.phase, etat.niveauAide);
    setEnAttente(null);
  }

  /** Écran « recap » — sans question : on passe directement aux coordonnées. */
  function continuerRecap() {
    const nouvelEtat = avancerRecap(etat);
    ajouterHistorique("recap", "Synthèse consultée", nouvelEtat);
    setEtat(nouvelEtat);
  }

  function repartir(nouvelEtat: EtatSessionEtudierFonction) {
    setDernierBilan(null);
    setAideParPhase({});
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEnAttente(null);
    setNumeroGeneration((n) => n + 1);
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;
  const validation: ValidationEtapeProps | null = enAttente
    ? { revele: enAttente.revele, reponseAttendue: reponseAttenduePhase(exercice, etat.phase), labelSuivant: "Écran suivant", onSuivant: passerEcranSuivant }
    : null;
  const etatPuces = enAttente ? enAttente.etatSuivant : etat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Étudier une fonction</h1>
        <p className="app-subtitle">Chapitre 5 — Dérivées et applications</p>
        {enCoursDeSession && (
          <ProgressionPuces segments={calculerSegmentsProgression(etatPuces, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        )}
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => repartir(demarrerSessionEtudierFonction(REGLAGES_DEMO, () => construireAvecVarianteId(id)))}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && <RecapitulatifPanel entrees={calculerRecapitulatifEtudierFonction(etat)} />}
          {enCoursDeSession && (
            <EcranCourant
              exercice={exercice}
              phase={etat.phase}
              etat={etat}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cleEcran={cleEcran}
              terminerEtape={terminerEtape}
              setEtat={setEtat}
              continuerRecap={continuerRecap}
              validation={validation}
            />
          )}
          {dernierBilan && (
            <ResultatPanelEtudierFonction
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEtudierFonction
              resultats={etat.resultats}
              onRecommencer={() => repartir(nouvelleSession())}
            />
          )}{" "}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionEtudierFonction["exerciceCourant"];
  phase: EcranEtudierFonction;
  etat: EtatSessionEtudierFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionEtudierFonction, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionEtudierFonction) => void;
  continuerRecap: () => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, continuerRecap, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudierFonction();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "domaine":
      return (
        <EtapeDomaineEtudierFonction
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          validation={validation}
          onValider={(reponse: EnsembleReelGuide) =>
            terminerEtape(soumettreReponseDomaine(etat, reponse), <Katex expression={`\\text{dom}\\,f=${formatEnsembleReelGuideLatex(reponse)}`} />)
          }
        />
      );

    case "limites":
      return (
        <EtapeLimitesEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="limites"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          validation={validation}
          onValider={(reponses: ValeurReponseSlotLimite[]) =>
            terminerEtape(soumettreReponseLimites(etat, reponses), <Katex expression={formatReponseLimitesLatex(exercice, reponses)} />)
          }
        />
      );

    case "calculerFPrime":
      return (
        <EtapeCalculerDeriveeGenerique
          key={cleEcran}
          exercice={exercice}
          phase="calculerFPrime"
          labelChamp="f'(x)="
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          validation={validation}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerFPrime(etat, texte), `f'(x) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerCalculerFPrime(t, exercice)}
        />
      );

    case "tableauFPrime":
      return (
        <EtapeTableauEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="tableauFPrime"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          validation={validation}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrime(etat, reponse), formatReponseTableauTexte(reponse))}
        />
      );

    case "calculerFSeconde":
      return (
        <EtapeCalculerDeriveeGenerique
          key={cleEcran}
          exercice={exercice}
          phase="calculerFSeconde"
          labelChamp="f''(x)="
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          validation={validation}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerFSeconde(etat, texte), `f''(x) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerCalculerFSeconde(t, exercice)}
        />
      );

    case "tableauFSeconde":
      return (
        <EtapeTableauEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="tableauFSeconde"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          validation={validation}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFSeconde(etat, reponse), formatReponseTableauTexte(reponse))}
        />
      );

    case "recap":
      return <EtapeRecapitulatifEtudierFonction key={cleEcran} exercice={exercice} onContinuer={continuerRecap} />;

    case "coordonnees":
      return (
        <EtapeCoordonneesEtudierFonction
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          validation={validation}
          onValider={(reponses) => terminerEtape(soumettreReponseCoordonnees(etat, reponses), reponses.join(" ; "))}
        />
      );

    case "graphique": {
      const points = pointsClesEtudierFonction(exercice).map((p) => ({
        id: p.id,
        label: p.label,
        labelLatex: `\\left(${formatAbscissePointLatex(p)}\\,;\\,${formatOrdonneeLatex(p.y)}\\right)`,
        x: p.x,
        y: p.y,
      }));
      return (
        <div key={cleEcran}>
          <p className="prompt-text">Place chaque point sur le graphique en tapant à l'endroit correspondant ; la courbe apparaîtra une fois tous les points placés.</p>
          <PlacementPointsGraphique
            points={points}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMaxGraphique()}
            onActiverAide={onActiverAide}
            onValider={(resume) => terminerEtape(soumettreReponseGraphique(etat, resume))}
            renderGraphe={({ onTap, propositionsConfirmees, dernierTapRate, zoneAideActive, pointActif }) => (
              <EtudierFonctionGraph
                exercice={exercice}
                onTap={onTap}
                propositionsConfirmees={propositionsConfirmees}
                dernierTapRate={dernierTapRate}
                abscisseAide={zoneAideActive && pointActif ? pointActif.x : null}
                afficherCourbe={pointActif === null}
              />
            )}
          />
        </div>
      );
    }
  }
}
