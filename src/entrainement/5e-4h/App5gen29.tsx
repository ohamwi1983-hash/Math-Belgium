import { useRef, useState } from "react";
import type { RacineEtudeLocale } from "./core5e/etudeLocale.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeLocale } from "./generateurs5e/etudeLocale/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEtudeLocale,
  niveauAideMaxEtudeLocale,
  soumettreReponseDomaine,
  soumettreReponseExtremums,
  soumettreReponseInflexions,
  soumettreReponseResoudreFPrime,
  soumettreReponseResoudreFSeconde,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
} from "./moteur5e/sessionEtudeLocale";
import type { EcranEtudeLocale, EtatSessionEtudeLocale } from "./moteur5e/typesEtudeLocale";
import { ordreEcransEtudeLocale } from "./moteur5e/typesEtudeLocale";
import {
  diagnostiquerChampParmiCibles,
  racinesFPrimeNumeriques,
  racinesFSecondeNumeriques,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  valeursFAuxExtremums,
  valeursFAuxInflexions,
} from "./moteur5e/verificationEtudeLocale";
import { EtapeDomaineEtudeLocale } from "./components5e/EtapeDomaineEtudeLocale";
import { EtapeChampsNumeriquesEtudeLocale } from "./components5e/EtapeChampsNumeriquesEtudeLocale";
import { EtapeZerosDeriveeEtudeLocale } from "./components5e/EtapeZerosDeriveeEtudeLocale";
import { EtapeTableauEtudeLocale } from "./components5e/EtapeTableauEtudeLocale";
import { TableauEtudeLocaleRecap } from "./components5e/TableauEtudeLocaleRecap";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import {
  formatEnteteColonnesTableau,
  formatReponseAttenduePhaseLatex,
  labelsChampsValeurF,
  precisionAnnonceeRacines,
  precisionAnnonceeValeursF,
} from "./ui5e/formatEtudeLocale";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeLocale {
  return demarrerSessionEtudeLocale(REGLAGES_DEMO, genererExerciceEtudeLocale);
}

function racinesExtremumsRetenues(exercice: EtatSessionEtudeLocale["exerciceCourant"]): RacineEtudeLocale[] {
  return exercice.racinesFPrime.filter((_, i) => exercice.classificationFPrime[i] !== "ni_lun_ni_lautre");
}

function racinesInflexionsRetenues(exercice: EtatSessionEtudeLocale["exerciceCourant"]): RacineEtudeLocale[] {
  return exercice.racinesFSeconde.filter((_, i) => exercice.classificationFSeconde[i] === "pi");
}

/** Réponse réellement attendue de l'écran qui vient de se clore — même dispatch que l'ancien
 * `ResultatPanelEtudeLocale.tsx` (supprimé, remplacé par la validation inline) : les écrans
 * "tableauFPrime"/"tableauFSeconde" rendent le tableau étendu en lecture seule plutôt qu'une simple
 * ligne de fragments Katex. */
function reponseAttendueEtudeLocale(exercice: EtatSessionEtudeLocale["exerciceCourant"], ecran: EcranEtudeLocale) {
  if (ecran === "tableauFPrime" || ecran === "tableauFSeconde") {
    const mode = ecran === "tableauFPrime" ? "fprime" : "fseconde";
    const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
    const enteteColonnes = formatEnteteColonnesTableau(exercice, attendu.colonnes, mode);
    return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode={mode} attendu={attendu} />;
  }
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, ecran).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionEtudeLocale;
  revele: boolean;
}

/** Puces de progression — séquence RÉELLEMENT parcourue par CET exercice (`ordreEcransEtudeLocale`,
 * 2 à 7 écrans selon `exercice.type`/`exercice.niveau`/le nombre de vrais extremums-PI — jamais la
 * liste complète des 7 écrans possibles, "domaine"/"resoudreFSeconde"/"tableauFSeconde"/"inflexions"
 * étant souvent sautés). Aucun booléen `xxxRevele` dédié par écran côté session : `scoresPartiels`
 * (`moteur5e/typesEtudeLocale.ts`/`sessionEtudeLocale.ts`) garde le score de chaque écran déjà clos
 * de l'exercice courant (remis à `{}` au prochain exercice) — heuristique `score === 0 ⟺ révélée`
 * (`soumettreEtapeTentatives`, `moteur/etapeTentatives.ts` — score forcé à 0 exactement quand
 * l'écran est révélé), même convention que `AppMethodeRapide.tsx` (4e). */
function calculerSegmentsProgression(etat: EtatSessionEtudeLocale): EtatPuceProgression[] {
  return ordreEcransEtudeLocale(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen29() {
  const [etat, setEtat] = useState<EtatSessionEtudeLocale>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEtudeLocale) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
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
    setEtat(demarrerSessionEtudeLocale(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const premierePhaseRef = useRef(etat.phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = etat.phase;
  }
  const estPremierEcran = etat.phase === premierePhaseRef.current;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEtudeLocale(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Étude locale (extremums et points critiques)</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
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
            estPremierEcran={estPremierEcran}
          />
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionEtudeLocale["exerciceCourant"];
  phase: EcranEtudeLocale;
  etat: EtatSessionEtudeLocale;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionEtudeLocale) => void;
  setEtat: (etat: EtatSessionEtudeLocale) => void;
  validation: ValidationEtapeProps | null;
  estPremierEcran: boolean;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation, estPremierEcran }: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudeLocale();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "domaine":
      return (
        <EtapeDomaineEtudeLocale
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
          validation={validation}
          estPremierEcran={estPremierEcran}
        />
      );

    case "resoudreFPrime": {
      return (
        <EtapeZerosDeriveeEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="resoudreFPrime"
          precisionAnnoncee={precisionAnnonceeRacines(exercice.racinesFPrime)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudreFPrime(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, racinesFPrimeNumeriques(exercice))}
          validation={validation}
          estPremierEcran={estPremierEcran}
        />
      );
    }

    case "tableauFPrime":
      return (
        <EtapeTableauEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="tableauFPrime"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrime(etat, reponse))}
          validation={validation}
          estPremierEcran={estPremierEcran}
        />
      );

    case "extremums": {
      const racines = racinesExtremumsRetenues(exercice);
      return (
        <EtapeChampsNumeriquesEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="extremums"
          labels={labelsChampsValeurF(racines)}
          placeholders={racines.map(() => "ex : 4")}
          precisionAnnoncee={precisionAnnonceeValeursF(exercice, racines)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseExtremums(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, valeursFAuxExtremums(exercice))}
          validation={validation}
          estPremierEcran={estPremierEcran}
        />
      );
    }

    case "resoudreFSeconde": {
      return (
        <EtapeZerosDeriveeEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="resoudreFSeconde"
          precisionAnnoncee={precisionAnnonceeRacines(exercice.racinesFSeconde)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudreFSeconde(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, racinesFSecondeNumeriques(exercice))}
          validation={validation}
          estPremierEcran={estPremierEcran}
        />
      );
    }

    case "tableauFSeconde":
      return (
        <EtapeTableauEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="tableauFSeconde"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFSeconde(etat, reponse))}
          validation={validation}
          estPremierEcran={estPremierEcran}
        />
      );

    case "inflexions": {
      const racines = racinesInflexionsRetenues(exercice);
      return (
        <EtapeChampsNumeriquesEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="inflexions"
          labels={labelsChampsValeurF(racines)}
          placeholders={racines.map(() => "ex : 4")}
          precisionAnnoncee={precisionAnnonceeValeursF(exercice, racines)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseInflexions(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, valeursFAuxInflexions(exercice))}
          validation={validation}
          estPremierEcran={estPremierEcran}
        />
      );
    }
  }
}
