import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import {
  CATALOGUE_FAMILLES,
  construireAvecFamilleId,
  genererExerciceDomaineDeriveeExponentielle,
} from "./generateurs6e/domaineDeriveeExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDomaineDeriveeExponentielle,
  soumettreReponseADerivee,
  soumettreReponseBDerivee,
  soumettreReponseCAssemblage,
  soumettreReponseCFacteurs,
  soumettreReponseDAssemblage,
  soumettreReponseDND,
  soumettreReponseDomaine,
  soumettreReponseEDerivee,
  soumettreReponseESimplifier,
  soumettreReponseFDerivee,
} from "./moteur6e/sessionDomaineDeriveeExponentielles";
import type { EtatSessionDomaineDeriveeExponentielle } from "./moteur6e/typesDomaineDeriveeExponentielles";
import { EtapeChampDomaineDerivee } from "./components6e/EtapeChampDomaineDerivee";
import { EtapeDeuxChampsDomaineDerivee } from "./components6e/EtapeDeuxChampsDomaineDerivee";
import { EtapeDomaineDomaineDerivee } from "./components6e/EtapeDomaineDomaineDerivee";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import {
  aideNiveau1,
  aideNiveau2,
  consigneEcran,
  etatActuel as calculerEtatActuel,
  formatFonctionLatex,
  labelsDeuxChamps,
} from "./ui6e/formatDomaineDeriveeExponentielles";
import { calculerRecapitulatifDomaineDeriveeExponentielle, calculerSegmentsProgressionDomaineDeriveeExponentielle } from "./ui6e/recapitulatifDomaineDeriveeExponentielles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDomaineDeriveeExponentielle {
  return demarrerSessionDomaineDeriveeExponentielle(REGLAGES_DEMO, genererExerciceDomaineDeriveeExponentielle);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDomaineDeriveeExponentielle;
  revele: boolean;
}

export function App6gen7() {
  const [etat, setEtat] = useState<EtatSessionDomaineDeriveeExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDomaineDeriveeExponentielle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail vit soit dans `detailsPartiels` (écran intermédiaire), soit dans le `resultats` qui
      // vient d'être poussé (dernier écran de l'exercice), même principe que `App6gen6.tsx`.
      const exerciceVientDeFinir = nouvelEtat.resultats.length > etat.resultats.length;
      const detail = exerciceVientDeFinir
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].details[etat.phase]
        : nouvelEtat.detailsPartiels[etat.phase];
      setEnAttente({ etatSuivant: nouvelEtat, revele: detail?.revele ?? false });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(
      demarrerSessionDomaineDeriveeExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** `estPremierEcran` : vrai uniquement sur le premier écran vu pour CET `exercice` (change de
   * valeur quand un nouvel exercice est tiré, jamais au fil des écrans d'un même exercice) — voir
   * `EnTeteExercice.tsx`, option 1B ("plein puis compact"). */
  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  const enonceLatex = formatFonctionLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const labels = labelsDeuxChamps(exercice);
  const etatActuelEcran = calculerEtatActuel(exercice, phase);

  // Panneau dev — expose l'exercice/la phase courants pour la vérification Playwright (même
  // principe que les autres générateurs 6e, ex. `App6gen23.tsx`).
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen7?: unknown }).__debug6gen7 = { exercice, phase };
  }

  const phasesDomaine = new Set(["aDomaine", "bDomaine", "cDomaine", "dDomaine", "eDomaine", "fDomaine"]);
  const phasesDeuxChamps = new Set(["cFacteurs", "dND"]);
  const phasesChampUnique = new Set(["aDerivee", "bDerivee", "cAssemblage", "dAssemblage", "eSimplifier", "eDerivee", "fDerivee"]);

  const PLACEHOLDERS: Record<string, string> = {
    aDerivee: "ex : 2*x*3^(x^2)*ln(3)",
    bDerivee: "ex : ln(2)*2^sqrt(x^2-4)*(x/sqrt(x^2-4))",
    cAssemblage: "ex : (3*x^2-4*x)*e^(x^3-2*x^2)*(1+x^3-2*x^2)",
    dAssemblage: "ex : (ln(2)*2^x*x-(2^x+1))/x^2",
    eSimplifier: "ex : 1-2^(-x)",
    eDerivee: "ex : ln(2)*2^(-x)",
    fDerivee: "ex : -sin(e^(x^2-2))*2*x*e^(x^2-2)",
  };

  // Réplique exactement le contenu (par écran RÉELLEMENT traversé) de l'ancien
  // `ResultatPanelDomaineDeriveeExponentielle.tsx` — jamais une cible recalculée séparément.
  const reponseAttenduePhase = () => {
    if (phasesDomaine.has(phase)) return <Katex expression={formatEnsembleReelLatex(exercice.domaine)} />;
    if (phase === "aDerivee" || phase === "bDerivee" || phase === "fDerivee") {
      return "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).";
    }
    if (phase === "cFacteurs") return "u'(x) et v'(x), vérifiées séparément par équivalence numérique.";
    if (phase === "cAssemblage") return "f'(x) assemblée, vérifiée par équivalence numérique.";
    if (phase === "dND") return "N'(x) et D'(x), vérifiées séparément par équivalence numérique.";
    if (phase === "dAssemblage") return "f'(x) assemblée via (N'D−ND')/D², vérifiée par équivalence numérique.";
    if (phase === "eSimplifier") return "Forme simplifiée, équivalente à f(x) (jamais une recopie brute de l'énoncé).";
    if (phase === "eDerivee") return "Dérivée de la forme simplifiée, vérifiée par équivalence numérique avec f'(x).";
    return null;
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Domaine et dérivée de fonctions exponentielles</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionDomaineDeriveeExponentielle(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDomaineDeriveeExponentielle(etat)} />
        <div className="card-body">
          {phasesDomaine.has(phase) && (
            <EtapeDomaineDomaineDerivee
              key={phase}
              estPremierEcran={estPremierEcran}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={etatActuelEcran}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
              validation={validation}
            />
          )}

          {phasesDeuxChamps.has(phase) && (
            <EtapeDeuxChampsDomaineDerivee
              key={phase}
              estPremierEcran={estPremierEcran}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={etatActuelEcran}
              labelA={labels.a}
              labelB={labels.b}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) =>
                terminerEtape(phase === "cFacteurs" ? soumettreReponseCFacteurs(etat, reponse) : soumettreReponseDND(etat, reponse))
              }
              validation={validation}
            />
          )}

          {phasesChampUnique.has(phase) && (
            <EtapeChampDomaineDerivee
              key={phase}
              estPremierEcran={estPremierEcran}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={etatActuelEcran}
              placeholder={PLACEHOLDERS[phase] ?? "ex : 2*x*3^(x^2)*ln(3)"}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => {
                if (phase === "aDerivee") return terminerEtape(soumettreReponseADerivee(etat, texte));
                if (phase === "bDerivee") return terminerEtape(soumettreReponseBDerivee(etat, texte));
                if (phase === "cAssemblage") return terminerEtape(soumettreReponseCAssemblage(etat, texte));
                if (phase === "dAssemblage") return terminerEtape(soumettreReponseDAssemblage(etat, texte));
                if (phase === "eSimplifier") return terminerEtape(soumettreReponseESimplifier(etat, texte));
                if (phase === "eDerivee") return terminerEtape(soumettreReponseEDerivee(etat, texte));
                return terminerEtape(soumettreReponseFDerivee(etat, texte));
              }}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
