import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import {
  CATALOGUE_FAMILLES,
  construireAvecFamilleId,
  genererExerciceGraphiqueDeriveeExponentielle,
} from "./generateurs6e/graphiquesDeriveeExponentielles/index";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionGraphiqueDeriveeExponentielle,
  soumettreReponseDerivee,
  soumettreReponseSelection,
} from "./moteur6e/sessionGraphiquesDeriveeExponentielles";
import type { EtatSessionGraphiqueDeriveeExponentielle } from "./moteur6e/typesGraphiquesDeriveeExponentielles";
import { Katex } from "./components/Katex";
import { EtapeDeriveeGraphExpo } from "./components6e/EtapeDeriveeGraphExpo";
import { EtapeSelectionGraphiqueDeriveeExpo } from "./components6e/EtapeSelectionGraphiqueDeriveeExpo";
import { GrapheOptionDeriveeExpo } from "./components6e/GrapheOptionDeriveeExpo";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideDeriveeNiveau1,
  aideDeriveeNiveau2,
  aideSelectionNiveau1,
  aideSelectionNiveau2,
  calculerViewBoxGraphique,
  consigneEcranDerivee,
  formatDeriveeCorrecteLatex,
  formatFonctionLatex,
  placeholderDerivee,
  rappelDomaineDerivee,
} from "./ui6e/formatGraphiquesDeriveeExponentielles";
import { calculerRecapitulatifGraphiquesDeriveeExponentielles, calculerSegmentsProgressionGraphiquesDeriveeExponentielles } from "./ui6e/recapitulatifGraphiquesDeriveeExponentielles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionGraphiqueDeriveeExponentielle {
  return demarrerSessionGraphiqueDeriveeExponentielle(REGLAGES_DEMO, genererExerciceGraphiqueDeriveeExponentielle);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionGraphiqueDeriveeExponentielle;
  revele: boolean;
}

export function App6gen8() {
  const [etat, setEtat] = useState<EtatSessionGraphiqueDeriveeExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule de l'écran "derivee" déjà clos (familles B/D uniquement — voir
   * `typesGraphiquesDeriveeExponentielles.ts`) — tenu ICI, à part de
   * `EtatSessionGraphiqueDeriveeExponentielle`, jamais dans le moteur (même principe que la
   * référence 4e, `AppAnalyseFonction.tsx`). Au plus 1 entrée possible pour ce générateur (2 écrans
   * max), jamais besoin d'un index : `ficheOuverte` suffit. */
  const [historiqueDerivee, setHistoriqueDerivee] = useState<EntreeHistoriqueEtape | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  /** Vrai si l'écran "derivee" a été clos avec `niveauAide>0` — capturé ICI au moment précis de la
   * clôture (`scoreDeriveePartiel` ne retient que le score déjà pénalisé, qui ne permet pas de
   * distinguer "pénalité d'aide" de "pénalité de tentatives" une fois l'écran clos). */
  const [aideDeriveeUtilisee, setAideDeriveeUtilisee] = useState(false);

  function terminerEtape(nouvelEtat: EtatSessionGraphiqueDeriveeExponentielle, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // Seul l'écran "derivee" a un écran suivant ("selection") depuis lequel le revoir — "selection"
      // clôt directement l'exercice entier, jamais revisitée (voir le commentaire de
      // `historiqueDerivee` ci-dessus).
      if (votreReponse !== undefined && etat.phase === "derivee") {
        const recap = calculerRecapitulatifGraphiquesDeriveeExponentielles(nouvelEtat);
        const derniere = recap[0];
        if (derniere) {
          setHistoriqueDerivee({
            titre: derniere.libelle,
            votreReponse,
            correcte: !derniere.revele,
            reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
          });
        }
        if (etat.niveauAide > 0) {
          setAideDeriveeUtilisee(true);
        }
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistoriqueDerivee(null);
      setAideDeriveeUtilisee(false);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistoriqueDerivee(null);
    setAideDeriveeUtilisee(false);
    setEtat(
      demarrerSessionGraphiqueDeriveeExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  // Inclut `indexExercice` dans la clé — la phase seule peut rester identique entre 2 exercices
  // consécutifs (ex. familles A puis C, toutes deux à un seul écran "selection"), ce qui
  // empêcherait React de remonter le composant et laisserait la saisie/sélection de l'exercice
  // précédent persister visuellement (leçon déjà retenue à plusieurs reprises sur ce projet — voir
  // CLAUDE.md, "5gen6/5gen7").
  const cle = `${etat.indexExercice}-${etat.phase}`;

  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen8?: unknown }).__debug6gen8 = { exercice, phase: etat.phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "derivee" ? (
            formatDeriveeCorrecteLatex(exercice) && <Katex expression={formatDeriveeCorrecteLatex(exercice) as string} />
          ) : (
            <GrapheOptionDeriveeExpo exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={150} hauteur={150} />
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // "aide" (puce jaune) remplace "correcte" pour l'écran "derivee" s'il a été clos avec
  // `aideDeriveeUtilisee` — jamais recalculé depuis le score (voir son commentaire ci-dessus). Les 2
  // écrans possibles ("derivee" puis "selection") sont TOUJOURS les 2 premiers segments quand
  // "derivee" existe pour cet exercice (voir `calculerSegmentsProgressionGraphiquesDeriveeExponentielles`).
  const segmentsBase = calculerSegmentsProgressionGraphiquesDeriveeExponentielles(etat);
  const segments: EtatPuceProgression[] =
    segmentsBase.length === 2 && segmentsBase[0] === "correcte" && aideDeriveeUtilisee ? ["aide", segmentsBase[1]] : segmentsBase;
  // Seul le 1ᵉʳ segment (écran "derivee") a quelque chose à consulter : "selection" (dernier) clôt
  // directement l'exercice, jamais revisitée (voir le commentaire de `historiqueDerivee`).
  const indexSegmentDerivee = segmentsBase.length === 2 ? 0 : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Graphique de la dérivée (fonctions exponentielles)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces
          segments={segments}
          onSegmentClick={indexSegmentDerivee !== null ? (index) => index === indexSegmentDerivee && setFicheOuverte(true) : undefined}
        />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifGraphiquesDeriveeExponentielles(etat)} />
        <div className="card-body">
          {etat.phase === "derivee" && (
            <EtapeDeriveeGraphExpo
              key={cle}
              consigneEcran={consigneEcranDerivee()}
              fonctionLatex={formatFonctionLatex(exercice)}
              rappelDomaine={rappelDomaineDerivee(exercice)}
              placeholder={placeholderDerivee(exercice)}
              aideNiveau1={aideDeriveeNiveau1(exercice)}
              aideNiveau2={aideDeriveeNiveau2(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseDerivee(etat, texte), texte)}
              validation={validation}
            />
          )}
          {etat.phase === "selection" && (
            <EtapeSelectionGraphiqueDeriveeExpo
              key={cle}
              exercice={exercice}
              aideNiveau1={aideSelectionNiveau1(exercice)}
              aideNiveau2={aideSelectionNiveau2(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(index) => terminerEtape(soumettreReponseSelection(etat, index))}
              validation={validation}
            />
          )}
        </div>
      </main>
      {ficheOuverte && historiqueDerivee && <FicheReponseEcran entree={historiqueDerivee} onFermer={() => setFicheOuverte(false)} />}
    </div>
  );
}
