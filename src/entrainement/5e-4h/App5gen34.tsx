import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtremaBornes } from "./generateurs5e/extremaBornes/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivanteExtremaBornes,
  demarrerSessionExtremaBornes,
  niveauAideMaxExtremaBornes,
  soumettreReponseComparaisonBorne,
  soumettreReponseDeriverBorne,
  soumettreReponseTableauFPrimeBorne,
  soumettreReponseValeursBornes,
  soumettreReponseValeursExtremumsBorne,
} from "./moteur5e/sessionExtremaBornes";
import { ORDRE_ECRANS_EXTREMA_BORNES } from "./moteur5e/typesExtremaBornes";
import type { EcranExtremaBornes, EtatSessionExtremaBornes } from "./moteur5e/typesExtremaBornes";
import {
  candidatsComparaisonBorne,
  diagnostiquerCalculerDeriveeBorne,
  diagnostiquerChampParmiCiblesBorne,
  indexMaxAbsoluBorne,
  indexMinAbsoluBorne,
  tableauFPrimeBorneAttendu,
  valeursFAuxBornes,
  valeursFAuxExtremumsBorne,
} from "./moteur5e/verificationExtremaBornes";
import type { ReponseTableauFPrimeBorne } from "./moteur5e/verificationExtremaBornes";
import { EtapeDeriverExtremaBornes } from "./components5e/EtapeDeriverExtremaBornes";
import { EtapeTableauFPrimeExtremaBornes } from "./components5e/EtapeTableauFPrimeExtremaBornes";
import { EtapeChampsNumeriquesExtremaBornes } from "./components5e/EtapeChampsNumeriquesExtremaBornes";
import { EtapeComparaisonExtremaBornes } from "./components5e/EtapeComparaisonExtremaBornes";
import { TableauEtudeLocaleRecap } from "./components5e/TableauEtudeLocaleRecap";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { calculerRecapitulatifExtremaBornes } from "./ui5e/recapitulatifExtremaBornes";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import {
  consigneGeneraleExtremaBornes,
  formatDomaineLatex,
  formatFDeTLatex,
  formatReponseAttenduePhaseLatex,
  labelsChampsBornes,
  labelsChampsExtremums,
  placeholdersChampsBornes,
  placeholdersChampsExtremums,
  questionFinaleExtremaBornes,
} from "./ui5e/formatExtremaBornes";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { QuestionFinale } from "./components/QuestionFinale";
import type { ReactNode } from "react";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionExtremaBornes {
  return demarrerSessionExtremaBornes(REGLAGES_DEMO, genererExerciceExtremaBornes);
}

/** Réponse attendue de l'écran qui vient de se terminer — réplique exactement `contenu(ecran)` de
 * l'ancien `ResultatPanelExtremaBornes.tsx`. */
function reponseAttendueEcran(exercice: EtatSessionExtremaBornes["exerciceCourant"], ecran: EcranExtremaBornes): ReactNode {
  if (ecran === "tableauFPrime") {
    const attendu = tableauFPrimeBorneAttendu(exercice);
    const enteteColonnes = attendu.colonnes.map((col) => (col.type === "racine" ? `${exercice.racinesFPrime[col.index]}` : ""));
    return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode="fprime" attendu={attendu} />;
  }
  const candidats = candidatsComparaisonBorne(exercice);
  const candidatMax = candidats[indexMaxAbsoluBorne(exercice)];
  const candidatMin = candidats[indexMinAbsoluBorne(exercice)];
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, ecran, candidatMax, candidatMin).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionExtremaBornes;
  revele: boolean;
}

/** Ordre d'affichage des puces de progression — séquence FIXE à 5 écrans
 * (`ORDRE_ECRANS_EXTREMA_BORNES`, `moteur5e/typesExtremaBornes.ts`), jamais de saut pour ce
 * générateur (contrairement à 5gen29/30/31). Icône "revele" pilotée par
 * `etat.revelesPartiels[ecran]`, peuplé depuis `etapeCourante.revelee` à la clôture de chaque
 * écran (`sessionExtremaBornes.ts::soumettreEcran`) — jamais `scoresPartiels[ecran] === 0` (point
 * A, balayage générique) : la pénalité d'aide de ce générateur est soustraite APRÈS le score de
 * tentatives puis plafonnée à 0, donc une réussite fortement aidée pouvait légitimement tomber à
 * 0 et s'afficher à tort comme "révélée". */
function calculerSegmentsProgression(
  etat: EtatSessionExtremaBornes,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return ORDRE_ECRANS_EXTREMA_BORNES.map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideUtiliseeParPhase[ecran] ? "aide" : "correcte";
  });
}

// ============================================================================
// Formatage de "votreReponse" (fiche de consultation) — un format court par type d'écran, même
// style que les labels déjà utilisés par chaque composant d'écran.
// ============================================================================

function formatReponseChampsLatex(labels: string[], valeurs: string[]): string {
  return labels.map((label, i) => `${label}${valeurs[i] ?? "?"}`).join("\\quad");
}

function formatReponseTableauFPrimeBorneTexte(r: ReponseTableauFPrimeBorne): string {
  return `signes : ${r.signes.map((v) => v ?? "×").join(" ")} ; ${r.ligne2.map((v) => v ?? "×").join(" ")}`;
}

export function App5gen34() {
  const [etat, setEtat] = useState<EtatSessionExtremaBornes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionExtremaBornes`, jamais dans le moteur (même principe que
   * `AppAnalyseFonction.tsx`, 4e). Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réutilise `calculerRecapitulatifExtremaBornes` (même mécanisme que `RecapitulatifPanel`) pour
   * la réponse ATTENDUE : l'entrée qui vient d'être ajoutée est toujours la dernière du tableau, les
   * écrans se closent dans l'ordre (`ORDRE_ECRANS_EXTREMA_BORNES`). */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionExtremaBornes) {
    const recap = calculerRecapitulatifExtremaBornes(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand l'écran se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`). "comparaison" (dernier
   * écran) n'est jamais poussé : `calculerRecapitulatifExtremaBornes` ne le voit jamais non plus
   * (voir sa tête de fichier), et sa puce reste "courante" tant que `enAttente` est actif, puis
   * l'exercice entier redémarre à zéro dès "Nouvel exercice". */
  function terminerEtape(nouvelEtat: EtatSessionExtremaBornes, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
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
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionExtremaBornes(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEcran(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Extrema en contexte borné</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={consigneGeneraleExtremaBornes(exercice)}
            blocDonnees={
              <>
                <div className="equation-box equation-box-donnees">
                  <Katex expression={formatFDeTLatex(exercice)} />
                  <Katex expression={formatDomaineLatex(exercice)} />
                </div>
                <QuestionFinale question={questionFinaleExtremaBornes()} />
              </>
            }
          />
          <RecapitulatifPanel entrees={calculerRecapitulatifExtremaBornes(etat)} />
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
  exercice: EtatSessionExtremaBornes["exerciceCourant"];
  phase: EcranExtremaBornes;
  etat: EtatSessionExtremaBornes;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionExtremaBornes, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionExtremaBornes) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxExtremaBornes();
  const onActiverAide = () => setEtat(activerAideSuivanteExtremaBornes(etat));

  switch (phase) {
    case "deriver":
      return (
        <EtapeDeriverExtremaBornes
          key={cleEcran}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseDeriverBorne(etat, texte), `f'(t) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerCalculerDeriveeBorne(t, exercice)}
          validation={validation}
        />
      );

    case "tableauFPrime":
      return (
        <EtapeTableauFPrimeExtremaBornes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrimeBorne(etat, reponse), formatReponseTableauFPrimeBorneTexte(reponse))}
          validation={validation}
        />
      );

    case "valeursExtremums": {
      const labels = labelsChampsExtremums(exercice);
      return (
        <EtapeChampsNumeriquesExtremaBornes
          key={cleEcran}
          phase="valeursExtremums"
          labels={labels}
          placeholders={placeholdersChampsExtremums()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) =>
            terminerEtape(soumettreReponseValeursExtremumsBorne(etat, reponses), <Katex expression={formatReponseChampsLatex(labels, reponses)} />)
          }
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesBorne(t, valeursFAuxExtremumsBorne(exercice))}
          validation={validation}
        />
      );
    }

    case "valeursBornes": {
      const labels = labelsChampsBornes(exercice);
      return (
        <EtapeChampsNumeriquesExtremaBornes
          key={cleEcran}
          phase="valeursBornes"
          labels={labels}
          placeholders={placeholdersChampsBornes()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) =>
            terminerEtape(soumettreReponseValeursBornes(etat, reponses), <Katex expression={formatReponseChampsLatex(labels, reponses)} />)
          }
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesBorne(t, valeursFAuxBornes(exercice))}
          validation={validation}
        />
      );
    }

    case "comparaison":
      return (
        <EtapeComparaisonExtremaBornes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseComparaisonBorne(etat, reponse))}
          validation={validation}
        />
      );
  }
}
