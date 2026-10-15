import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDeriveeLogarithme } from "./generateurs6e/domaineDeriveeLogarithme";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDomaineDeriveeLogarithme,
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
  soumettreReponseGFPrimeSurF,
  soumettreReponseGIdentifier,
  soumettreReponseGIsoler,
} from "./moteur6e/sessionDomaineDeriveeLogarithme";
import { phaseApres, phaseInitiale } from "./moteur6e/typesDomaineDeriveeLogarithme";
import type { EtatSessionDomaineDeriveeLogarithme, PhaseDomaineDeriveeLogarithme } from "./moteur6e/typesDomaineDeriveeLogarithme";
import type { ReponseDeuxChamps } from "./moteur6e/verificationDomaineDeriveeLogarithme";
import {
  diagnostiquerADerivee,
  diagnostiquerBDerivee,
  diagnostiquerCAssemblage,
  diagnostiquerCFacteurs,
  diagnostiquerDAssemblage,
  diagnostiquerDND,
  diagnostiquerEDerivee,
  diagnostiquerESimplifier,
  diagnostiquerFDerivee,
  diagnostiquerGFPrimeSurF,
  diagnostiquerGIdentifier,
  diagnostiquerGIsoler,
} from "./moteur6e/verificationDomaineDeriveeLogarithme";
import { EtapeChampDomaineDeriveeLog } from "./components6e/EtapeChampDomaineDeriveeLog";
import { EtapeDeuxChampsDomaineDeriveeLog } from "./components6e/EtapeDeuxChampsDomaineDeriveeLog";
import { EtapeDomaineDomaineDeriveeLog } from "./components6e/EtapeDomaineDomaineDeriveeLog";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import { aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, etatActuel, labelsDeuxChamps } from "./ui6e/formatDomaineDeriveeLogarithme";
import { calculerRecapitulatifDomaineDeriveeLogarithme, calculerSegmentsProgressionDomaineDeriveeLogarithme } from "./ui6e/recapitulatifDomaineDeriveeLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/** Même libellé, phase par phase, que `LIBELLE_PHASE` (`ui6e/recapitulatifDomaineDeriveeLogarithme.ts`,
 * non exporté) — répliqué ICI pour la fiche de consultation. */
const LIBELLE_PHASE: Record<PhaseDomaineDeriveeLogarithme, string> = {
  aDomaine: "Domaine",
  aDerivee: "Dérivée",
  bDomaine: "Domaine",
  bDerivee: "Dérivée",
  cDomaine: "Domaine",
  cFacteurs: "u'(x) et v'(x)",
  cAssemblage: "Dérivée assemblée",
  dDomaine: "Domaine",
  dND: "N'(x) et D'(x)",
  dAssemblage: "Dérivée assemblée",
  eDomaine: "Domaine",
  eSimplifier: "Forme simplifiée",
  eDerivee: "Dérivée",
  fDomaine: "Domaine",
  fDerivee: "Dérivée",
  gIdentifier: "u(x) et v(x)",
  gFPrimeSurF: "f'/f",
  gIsoler: "f'(x) isolée",
};

/** Séquence RÉELLEMENT traversée par la famille de l'exercice courant — même reconstruction que
 * `sequenceReelle` (`ui6e/recapitulatifDomaineDeriveeLogarithme.ts`, non exporté), répliquée ICI à
 * partir de `phaseInitiale`/`phaseApres` pour aligner l'index des segments de `ProgressionPuces`
 * sur celui de `historique`. */
function sequenceReelle(exercice: Parameters<typeof phaseInitiale>[0]): PhaseDomaineDeriveeLogarithme[] {
  const sequence: PhaseDomaineDeriveeLogarithme[] = [];
  let phase: PhaseDomaineDeriveeLogarithme | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDomaineDeriveeLogarithme {
  return demarrerSessionDomaineDeriveeLogarithme(REGLAGES_DEMO, genererExerciceDomaineDeriveeLogarithme);
}

const PHASES_DOMAINE = new Set<PhaseDomaineDeriveeLogarithme>(["aDomaine", "bDomaine", "cDomaine", "dDomaine", "eDomaine", "fDomaine"]);
const PHASES_DEUX_CHAMPS = new Set<PhaseDomaineDeriveeLogarithme>(["cFacteurs", "dND"]);

const PLACEHOLDERS: Partial<Record<PhaseDomaineDeriveeLogarithme, string>> = {
  aDerivee: "ex : (ln(2)*2^x)/(2^x*ln(3))",
  bDerivee: "ex : -x/((1-x^2)*ln(2))",
  cAssemblage: "ex : 3*ln(x)+(3*x)*(1/x)",
  dAssemblage: "ex : ((1/x)*(2*x)-ln(x)*2)/(2*x)^2",
  eSimplifier: "ex : 0.5*ln(x)",
  eDerivee: "ex : 1/(2*x)",
  fDerivee: "ex : 2/sqrt(1-(2*x)^2)",
  gIdentifier: "ex : x^x",
  gFPrimeSurF: "ex : ln(x)+1",
  gIsoler: "ex : x^x*(ln(x)+1)",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDomaineDeriveeLogarithme;
  revele: boolean;
}

export function App6gen16() {
  const [etat, setEtat] = useState<EtatSessionDomaineDeriveeLogarithme>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionDomaineDeriveeLogarithme`, jamais dans le moteur. Remis à vide
   * à chaque nouvel exercice (mêmes endroits que `enAttente`). Contrairement à d'autres
   * générateurs 6e, l'aide PAR PHASE DÉJÀ CLOSE n'a pas besoin d'être trackée ici séparément : elle
   * est déjà persistée côté moteur (`detailsPartiels[phase].niveauAide`, voir
   * `DetailPhaseDomaineDeriveeLogarithme`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDomaineDeriveeLogarithme, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail vit soit dans `detailsPartiels` (écran intermédiaire), soit dans le `resultats` qui
      // vient d'être poussé (dernier écran de l'exercice), même principe que `App6gen7.tsx`.
      const exerciceVientDeFinir = nouvelEtat.resultats.length > etat.resultats.length;
      const detail = exerciceVientDeFinir
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].details[etat.phase]
        : nouvelEtat.detailsPartiels[etat.phase];
      const revele = detail?.revele ?? false;
      // `votreReponse` : UNIQUEMENT poussée dans l'historique dans cette branche de transition
      // RÉELLE — jamais à chaque clic sur "Valider".
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? reponseAttenduePhase() : undefined,
          },
        ]);
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
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSessionDomaineDeriveeLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const consigneG = consigneGenerale(exercice);
  const donnees = blocDonnees(exercice);
  const etatAct = etatActuel(exercice, phase);
  const consigne = consigneEcran(exercice, phase);
  const labels = labelsDeuxChamps(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(exercice, phase);
  const aide2 = aideNiveau2(exercice, phase);

  function diagnostiquerChampUnique(texte: string) {
    switch (phase) {
      case "aDerivee":
        return exercice.famille === "A" ? diagnostiquerADerivee(exercice, texte) : "parse_error";
      case "bDerivee":
        return exercice.famille === "B" ? diagnostiquerBDerivee(exercice, texte) : "parse_error";
      case "cAssemblage":
        return exercice.famille === "C" ? diagnostiquerCAssemblage(exercice, texte) : "parse_error";
      case "dAssemblage":
        return exercice.famille === "D" ? diagnostiquerDAssemblage(exercice, texte) : "parse_error";
      case "eSimplifier":
        return exercice.famille === "E" ? diagnostiquerESimplifier(exercice, texte) : "parse_error";
      case "eDerivee":
        return exercice.famille === "E" ? diagnostiquerEDerivee(exercice, texte) : "parse_error";
      case "fDerivee":
        return exercice.famille === "F" ? diagnostiquerFDerivee(exercice, texte) : "parse_error";
      case "gIdentifier":
        return exercice.famille === "G" ? diagnostiquerGIdentifier(exercice, texte) : "parse_error";
      case "gFPrimeSurF":
        return exercice.famille === "G" ? diagnostiquerGFPrimeSurF(exercice, texte) : "parse_error";
      case "gIsoler":
        return exercice.famille === "G" ? diagnostiquerGIsoler(exercice, texte) : "parse_error";
      default:
        return "parse_error" as const;
    }
  }

  function diagnostiquerDeuxChamps(reponse: ReponseDeuxChamps) {
    if (phase === "cFacteurs" && exercice.famille === "C") return diagnostiquerCFacteurs(exercice, reponse);
    if (phase === "dND" && exercice.famille === "D") return diagnostiquerDND(exercice, reponse);
    return "parse_error" as const;
  }

  function onValiderChampUnique(texte: string) {
    if (phase === "aDerivee") return terminerEtape(soumettreReponseADerivee(etat, texte), texte);
    if (phase === "bDerivee") return terminerEtape(soumettreReponseBDerivee(etat, texte), texte);
    if (phase === "cAssemblage") return terminerEtape(soumettreReponseCAssemblage(etat, texte), texte);
    if (phase === "dAssemblage") return terminerEtape(soumettreReponseDAssemblage(etat, texte), texte);
    if (phase === "eSimplifier") return terminerEtape(soumettreReponseESimplifier(etat, texte), texte);
    if (phase === "eDerivee") return terminerEtape(soumettreReponseEDerivee(etat, texte), texte);
    if (phase === "fDerivee") return terminerEtape(soumettreReponseFDerivee(etat, texte), texte);
    if (phase === "gIdentifier") return terminerEtape(soumettreReponseGIdentifier(etat, texte), texte);
    if (phase === "gFPrimeSurF") return terminerEtape(soumettreReponseGFPrimeSurF(etat, texte), texte);
    return terminerEtape(soumettreReponseGIsoler(etat, texte), texte);
  }

  // Réplique exactement le contenu (par écran RÉELLEMENT traversé) de l'ancien
  // `ResultatPanelDomaineDeriveeLogarithme.tsx` — jamais une cible recalculée séparément.
  const reponseAttenduePhase = () => {
    if (PHASES_DOMAINE.has(phase) && exercice.famille !== "G") return <Katex expression={formatEnsembleReelLatex(exercice.domaine)} />;
    if (phase === "aDerivee" || phase === "bDerivee" || phase === "fDerivee") {
      return "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).";
    }
    if (phase === "cFacteurs") return "u'(x) et v'(x), vérifiées séparément par équivalence numérique.";
    if (phase === "cAssemblage") return "f'(x) assemblée, vérifiée par équivalence numérique.";
    if (phase === "dND") return "N'(x) et D'(x), vérifiées séparément par équivalence numérique.";
    if (phase === "dAssemblage") return "f'(x) assemblée via (N'D−ND')/D², vérifiée par équivalence numérique.";
    if (phase === "eSimplifier") return "Forme simplifiée via les propriétés du log, jamais une recopie brute de l'énoncé.";
    if (phase === "eDerivee") return "Dérivée de la forme simplifiée, vérifiée par équivalence numérique avec f'(x).";
    if (phase === "gIdentifier") return "u(x) et v(x) identifiés (simplification préalable si nécessaire).";
    if (phase === "gFPrimeSurF") return "f'/f = v'·ln(u) + v·u'/u, par dérivation logarithmique implicite.";
    if (phase === "gIsoler") return "f' isolée en multipliant par f=u^v.";
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

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionDomaineDeriveeLogarithme`
  // avec `detailsPartiels[phase].niveauAide`, déjà persisté côté moteur (jamais recalculé ici).
  const sequence = sequenceReelle(exercice);
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionDomaineDeriveeLogarithme(etat).map((segment, index) => {
    if (segment !== "correcte") return segment;
    const detail = etat.detailsPartiels[sequence[index]];
    return detail && detail.niveauAide > 0 ? "aide" : segment;
  });

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Domaine, dérivée et dérivation logarithmique</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDomaineDeriveeLogarithme(etat)} />
        {PHASES_DOMAINE.has(phase) && (
          <EtapeDomaineDomaineDeriveeLog
            key={phase}
            consigneGenerale={consigneG}
            blocDonnees={donnees}
            consigneEcran={consigne}
            aideNiveau1={aide1}
            aideNiveau2={aide2}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse), <Katex expression={formatEnsembleReelLatex(reponse)} />)}
            validation={validation}
          />
        )}

        {PHASES_DEUX_CHAMPS.has(phase) && (
          <EtapeDeuxChampsDomaineDeriveeLog
            key={phase}
            consigneGenerale={consigneG}
            blocDonnees={donnees}
            etatActuel={etatAct}
            consigneEcran={consigne}
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
              terminerEtape(
                phase === "cFacteurs" ? soumettreReponseCFacteurs(etat, reponse) : soumettreReponseDND(etat, reponse),
                `${labels.a} = ${reponse.a} ; ${labels.b} = ${reponse.b}`,
              )
            }
            diagnostiquer={diagnostiquerDeuxChamps}
            validation={validation}
          />
        )}

        {!PHASES_DOMAINE.has(phase) && !PHASES_DEUX_CHAMPS.has(phase) && (
          <EtapeChampDomaineDeriveeLog
            key={phase}
            consigneGenerale={consigneG}
            blocDonnees={donnees}
            etatActuel={etatAct}
            consigneEcran={consigne}
            placeholder={PLACEHOLDERS[phase] ?? "ex : ln(x)+1"}
            aideNiveau1={aide1}
            aideNiveau2={aide2}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={onValiderChampUnique}
            diagnostiquer={diagnostiquerChampUnique}
            validation={validation}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
