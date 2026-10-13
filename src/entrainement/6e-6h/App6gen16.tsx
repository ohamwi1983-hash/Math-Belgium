import { useRef, useState } from "react";
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
import { ProgressionPuces } from "../components/ProgressionPuces";

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

  function terminerEtape(nouvelEtat: EtatSessionDomaineDeriveeLogarithme) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail vit soit dans `detailsPartiels` (écran intermédiaire), soit dans le `resultats` qui
      // vient d'être poussé (dernier écran de l'exercice), même principe que `App6gen7.tsx`.
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
    setEtat(demarrerSessionDomaineDeriveeLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;
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
    if (phase === "aDerivee") return terminerEtape(soumettreReponseADerivee(etat, texte));
    if (phase === "bDerivee") return terminerEtape(soumettreReponseBDerivee(etat, texte));
    if (phase === "cAssemblage") return terminerEtape(soumettreReponseCAssemblage(etat, texte));
    if (phase === "dAssemblage") return terminerEtape(soumettreReponseDAssemblage(etat, texte));
    if (phase === "eSimplifier") return terminerEtape(soumettreReponseESimplifier(etat, texte));
    if (phase === "eDerivee") return terminerEtape(soumettreReponseEDerivee(etat, texte));
    if (phase === "fDerivee") return terminerEtape(soumettreReponseFDerivee(etat, texte));
    if (phase === "gIdentifier") return terminerEtape(soumettreReponseGIdentifier(etat, texte));
    if (phase === "gFPrimeSurF") return terminerEtape(soumettreReponseGFPrimeSurF(etat, texte));
    return terminerEtape(soumettreReponseGIsoler(etat, texte));
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Domaine, dérivée et dérivation logarithmique</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionDomaineDeriveeLogarithme(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDomaineDeriveeLogarithme(etat)} />
        {PHASES_DOMAINE.has(phase) && (
          <EtapeDomaineDomaineDeriveeLog
            key={phase}
            estPremierEcran={estPremierEcran}
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
            onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
            validation={validation}
          />
        )}

        {PHASES_DEUX_CHAMPS.has(phase) && (
          <EtapeDeuxChampsDomaineDeriveeLog
            key={phase}
            estPremierEcran={estPremierEcran}
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
            onValider={(reponse) => terminerEtape(phase === "cFacteurs" ? soumettreReponseCFacteurs(etat, reponse) : soumettreReponseDND(etat, reponse))}
            diagnostiquer={diagnostiquerDeuxChamps}
            validation={validation}
          />
        )}

        {!PHASES_DOMAINE.has(phase) && !PHASES_DEUX_CHAMPS.has(phase) && (
          <EtapeChampDomaineDeriveeLog
            key={phase}
            estPremierEcran={estPremierEcran}
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
    </div>
  );
}
