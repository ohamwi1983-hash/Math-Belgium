import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceArbreTableauEffectifs } from "./generateurs6e/arbreTableauEffectifs";
import type { IdVarianteArbreTableauEffectifs } from "./generateurs6e/arbreTableauEffectifs";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionArbreTableauEffectifs, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionArbreTableauEffectifs";
import { phasesPourExercice } from "./moteur6e/typesArbreTableauEffectifs";
import type { EtatSessionArbreTableauEffectifs, PhaseArbreTableauEffectifs } from "./moteur6e/typesArbreTableauEffectifs";
import { diagnostiquerChamps } from "./moteur6e/verificationArbreTableauEffectifs";
import { Katex } from "./components/Katex";
import { EtapeChampsArbreTableauEffectifs } from "./components6e/EtapeChampsArbreTableauEffectifs";
import { EtapeChoixArbreTableauEffectifs } from "./components6e/EtapeChoixArbreTableauEffectifs";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  LIBELLE_PHASE,
  OPTIONS_INDEPENDANCE,
  aideNiveau1,
  aideNiveau2,
  arbreEcran,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  tableauEcran,
  verdictIndependanceTexte,
} from "./ui6e/formatArbreTableauEffectifs";
import { calculerRecapitulatifArbreTableauEffectifs, calculerSegmentsProgressionArbreTableauEffectifs } from "./ui6e/recapitulatifArbreTableauEffectifs";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen74` — « Arbre, tableau, effectifs : une situation, trois écritures » (chapitre 6, « Les
 * probabilités », audit 6e ch. 6, décision M). Une population de N individus et deux événements :
 * l'élève passe d'une écriture à l'autre (pourcentages, arbre pondéré, tableau d'effectifs), calcule
 * P(B|A) ET P(A|B) sur les mêmes données, puis décide de l'indépendance (choix fermé, un seul
 * essai). Même patron que `App6gen34.tsx` : dispatcher piloté par `ui6e/formatArbreTableauEffectifs.ts`
 * et `moteur6e/verificationArbreTableauEffectifs.ts`, `?code=` (QR code des feuilles), compteur de
 * génération dans la `key` de l'écran.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionArbreTableauEffectifs {
  return demarrerSessionArbreTableauEffectifs(REGLAGES_DEMO, genererExerciceArbreTableauEffectifs);
}

/** Première session : si l'URL porte `?code=` (QR code d'une feuille d'exercices ou d'une
 * évaluation), rejoue EXACTEMENT l'instance imprimée — même catalogue et mêmes fonctions de tirage
 * que l'adaptateur (`generateurs6e/arbreTableauEffectifs/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionArbreTableauEffectifs {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionArbreTableauEffectifs(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceArbreTableauEffectifs, (id) => construireAvecVarianteId(id as IdVarianteArbreTableauEffectifs)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionArbreTableauEffectifs;
  revele: boolean;
}

export function App6gen74() {
  const [etat, setEtat] = useState<EtatSessionArbreTableauEffectifs>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseArbreTableauEffectifs, boolean>>>({});
  /** Compteur de génération, inclus dans la `key` de l'écran : champs vidés à chaque nouvel
   * exercice, même s'il commence par la même phase que le précédent. */
  const [generation, setGeneration] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** Réponse attendue d'un écran (validation + fiche de l'historique) : le verdict en clair pour
   * l'écran « indépendance », puis les valeurs en KaTeX. */
  function reponseAttendue(p: PhaseArbreTableauEffectifs): ReactNode {
    return (
      <span className="equation-box-termes">
        {p === "independance" && <span>{verdictIndependanceTexte(exercice)} </span>}
        {formatReponseAttenduePhaseLatex(exercice, p).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </span>
    );
  }

  function terminerEtape(nouvelEtat: EtatSessionArbreTableauEffectifs, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const phaseFermee = etat.phase;
      const revele = nouvelEtat.derniereTransitionRevelee;
      setAideParPhase((prev) => ({ ...prev, [phaseFermee]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        setHistorique((h) => [...h, { titre: LIBELLE_PHASE[phaseFermee], votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttendue(phaseFermee) : undefined }]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideParPhase({});
      setGeneration((g) => g + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setGeneration((g) => g + 1);
    setEtat(demarrerSessionArbreTableauEffectifs(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteArbreTableauEffectifs)));
  }

  // Hook DEV-ONLY : expose l'instance tirée pour la vérification Playwright (jamais lu par l'appli).
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen74?: unknown }).__debug6gen74 = { exercice, phase };
  }

  const tentativesMax = tentativesMaxCourant(etat);
  const aideCommun = {
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    aideNiveau1: aideNiveau1(exercice, phase),
    aideNiveau2: aideNiveau2(exercice, phase),
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(phase === "independance" ? { messageRevele: "Ce n'était pas la bonne réponse." } : {}),
      }
    : null;

  const segmentsBase = calculerSegmentsProgressionArbreTableauEffectifs(etat);
  const segments: EtatPuceProgression[] = phasesPourExercice(exercice).map((p, i) => (segmentsBase[i] === "correcte" && aideParPhase[p] ? "aide" : segmentsBase[i]));

  const cle = `${generation}-${phase}`;
  const champs = champsEcran(exercice, phase);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Arbre, tableau, effectifs : une situation, trois écritures</h1>
        <p className="app-subtitle">Chapitre 6 — Les probabilités</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifArbreTableauEffectifs(etat)} />
        {phase === "independance" ? (
          <EtapeChoixArbreTableauEffectifs
            key={cle}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            arbre={arbreEcran(exercice, phase)}
            tableau={tableauEcran(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            options={OPTIONS_INDEPENDANCE}
            onValider={(choixId) => terminerEtape(soumettreReponseEcran(etat, [choixId]), OPTIONS_INDEPENDANCE.find((o) => o.id === choixId)?.label)}
            validation={validation}
          />
        ) : (
          <EtapeChampsArbreTableauEffectifs
            key={cle}
            {...aideCommun}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={tentativesMax}
            consigneGenerale={consigneGenerale(exercice)}
            arbre={arbreEcran(exercice, phase)}
            tableau={tableauEcran(exercice, phase)}
            travail={phase === "arbre" || phase === "tableau" ? phase : null}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champs}
            diagnostiquerChamps={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
            onValider={(valeurs) =>
              terminerEtape(
                soumettreReponseEcran(etat, valeurs),
                <span className="equation-box-termes">
                  {champs.map((c, i) => (
                    <span key={i}>
                      <Katex expression={c.labelLatex} /> : {valeurs[i]}
                      {i < champs.length - 1 ? " ; " : ""}
                    </span>
                  ))}
                </span>,
              )
            }
            validation={validation}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />}
    </div>
  );
}
