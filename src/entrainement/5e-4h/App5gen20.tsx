import { useRef, useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimite } from "./generateurs5e/limites";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLimite,
  niveauAideMaxLimite,
  soumettreReponseConclureLimite,
  soumettreReponseEvaluerLimiteFinaleNumerique,
  soumettreReponseEvaluerLimiteFinaleSigne,
  soumettreReponseFactoriser,
  soumettreReponseFactoriserDenominateur,
  soumettreReponseLimitesGaucheDroite,
  soumettreReponseReconnaissance,
  soumettreReponseSimplifierEvaluer,
  soumettreReponseSimplifierLimiteRef,
  soumettreReponseTermeDominant,
} from "./moteur5e/sessionLimites";
import type { ReponseFactoriser, ReponseLimitesGaucheDroite, ReponseTermeDominant } from "./moteur5e/sessionLimites";
import type { EtatSessionLimite, PhaseLimite } from "./moteur5e/typesLimites";
import { ordreComplet } from "./moteur5e/typesLimites";
import {
  diagnostiquerFacteurs,
  diagnostiquerNombre,
  diagnostiquerRatioDominant,
  diagnostiquerTermeDominant,
  verifierSigne,
} from "./moteur5e/verificationLimites";
import type { ExerciceLimite } from "./core5e/limites.types";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { EtapeChampLibreLimite } from "./components5e/EtapeChampLibreLimite";
import { EtapeChoixSigne } from "./components5e/EtapeChoixSigne";
import { EtapeConclureLimiteInfiniePoint } from "./components5e/EtapeConclureLimiteInfiniePoint";
import { EtapeFactoriserDenominateurLimite } from "./components5e/EtapeFactoriserDenominateurLimite";
import { EtapeFactoriserLimite } from "./components5e/EtapeFactoriserLimite";
import { EtapeLimitesGaucheDroite } from "./components5e/EtapeLimitesGaucheDroite";
import { EtapeReconnaissanceLimite } from "./components5e/EtapeReconnaissanceLimite";
import { EtapeTermeDominant } from "./components5e/EtapeTermeDominant";
import { Katex } from "./components/Katex";
import { LIBELLE_FAMILLE_LIMITE, formatReponseAttenduePhaseLatex, limNecessiteModeDisplay } from "./ui5e/formatLimites";
import { calculerRecapitulatifLimite } from "./ui5e/recapitulatifLimite";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

const OPTIONS_SIGNE_INFINI: [string, string] = ["+∞", "−∞"];

function nouvelleSession(): EtatSessionLimite {
  return demarrerSessionLimite(REGLAGES_DEMO, genererExerciceLimite);
}

/** Réponse réellement attendue de la phase qui vient de se clore — même dispatch que l'ancien
 * `ResultatPanelLimite.tsx` (supprimé, remplacé par la validation inline) : "reconnaissance"
 * affiche le libellé de la VRAIE famille générée (jamais la réponse de l'élève), puis le LaTeX de
 * `formatReponseAttenduePhaseLatex` quand il y en a (non vide pour "reconnaissance" seulement dans
 * le cas "limiteReelle", où cet écran porte aussi la valeur numérique). */
function reponseAttendueLimite(exercice: ExerciceLimite, phase: PhaseLimite) {
  const reponseLatex = formatReponseAttenduePhaseLatex(exercice, phase);
  const libelleFamille = phase === "reconnaissance" ? LIBELLE_FAMILLE_LIMITE[exercice.famille] ?? exercice.famille : null;
  if (!libelleFamille && reponseLatex.length === 0) return undefined;
  return (
    <>
      {libelleFamille}
      {reponseLatex.length > 0 && (
        <span className="equation-box-termes">
          {reponseLatex.map((frag, i) => (
            <Katex key={i} expression={frag} block={limNecessiteModeDisplay(frag)} />
          ))}
        </span>
      )}
    </>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLimite;
  revele: boolean;
}

/** Une puce par phase de `ordreComplet(etat.exerciceCourant)` — séquence RÉELLE propre à la
 * famille du tirage (4 familles structurellement disjointes, longueur variable), jamais un
 * `ORDRE_PHASES` fixe reconstitué à la main (contrairement à `AppAnalyseFonction`, 4e, où la
 * séquence est commune à toutes les catégories) : même source que `calculerRecapitulatifLimite`.
 * "courante" pour `etat.phase`, "correcte"/"revele" pour les phases déjà closes
 * (`scoresPartiels[phase]`, 0 ⟺ révélée), "a-venir" au-delà. */
function calculerSegmentsProgression(etat: EtatSessionLimite): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen20() {
  const [etat, setEtat] = useState<EtatSessionLimite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLimite) {
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
    setEtat(demarrerSessionLimite(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueLimite(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites, reconnaissance et calcul</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifLimite(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={phase}
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
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceLimite;
  phase: PhaseLimite;
  etat: EtatSessionLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLimite) => void;
  setEtat: (etat: EtatSessionLimite) => void;
  validation: ValidationEtapeProps | null;
}

/** Dispatch par phase — chaque famille a une séquence FIXE (jamais de branche interne variable
 * contrairement à 5gen14), donc un simple `switch` sur `phase` suffit, la famille étant déjà
 * garantie cohérente avec la phase courante par `ordreComplet` (jamais atteinte hors de sa
 * famille). "reconnaissance" (écran 0) est IDENTIQUE pour les 4 familles — famille "limiteReelle" :
 * ce même écran soumet classification ET valeur numérique en un seul geste (`soumettreReponseReconnaissance`
 * accepte un `valeurTexte` optionnel), aucun écran supplémentaire. */
function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxLimite();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "reconnaissance":
      return (
        <EtapeReconnaissanceLimite
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(choix, valeurTexte) => terminerEtape(soumettreReponseReconnaissance(etat, choix, valeurTexte))}
          validation={validation}
        />
      );

    case "factoriser": {
      if (exercice.famille !== "formeIndeterminee") return null;
      const exo = exercice;
      const diagnostiquer = (r: ReponseFactoriser) => ({
        numerateur: diagnostiquerFacteurs(r.numerateur, exo.a, exo.kN, exo.p),
        denominateur: diagnostiquerFacteurs(r.denominateur, exo.a, exo.kD, exo.q),
      });
      return (
        <EtapeFactoriserLimite
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseFactoriser(etat, reponse))}
          diagnostiquer={diagnostiquer}
          validation={validation}
        />
      );
    }

    case "simplifierEvaluer": {
      if (exercice.famille !== "formeIndeterminee") return null;
      const cible = exercice.limite.num / exercice.limite.den;
      return (
        <>
          <EtapeChampLibreLimite
            key={cleEcran}
            exercice={exercice}
            phase="simplifierEvaluer"
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(texte) => terminerEtape(soumettreReponseSimplifierEvaluer(etat, texte))}
            placeholder="ex : -1/3"
            diagnostiquer={(t) => diagnostiquerNombre(t, cible)}
            validation={validation}
          />
          <CalculatriceScientifique />
        </>
      );
    }

    case "factoriserDenominateur": {
      if (exercice.famille !== "limiteInfiniePoint") return null;
      const exo = exercice;
      const autreRacine = exo.sousCas === "racineDouble" ? exo.a : (exo.q as number);
      return (
        <EtapeFactoriserDenominateurLimite
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(textes) => terminerEtape(soumettreReponseFactoriserDenominateur(etat, textes))}
          diagnostiquer={(textes) => diagnostiquerFacteurs(textes, exo.a, exo.kD, autreRacine)}
          validation={validation}
        />
      );
    }

    case "limitesGaucheDroite": {
      if (exercice.famille !== "limiteInfiniePoint") return null;
      const exo = exercice;
      return (
        <>
          <EtapeLimitesGaucheDroite
            key={cleEcran}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(reponse: ReponseLimitesGaucheDroite) => terminerEtape(soumettreReponseLimitesGaucheDroite(etat, reponse))}
            diagnostiquer={(r) => ({
              gauche: verifierSigne(r.gauche, exo.signeLimiteGauche),
              droite: verifierSigne(r.droite, exo.signeLimiteDroite),
            })}
            validation={validation}
          />
          <CalculatriceScientifique />
        </>
      );
    }

    case "conclureLimite": {
      if (exercice.famille !== "limiteInfiniePoint") return null;
      return (
        <EtapeConclureLimiteInfiniePoint
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          onValider={(choix) => terminerEtape(soumettreReponseConclureLimite(etat, choix))}
          validation={validation}
        />
      );
    }

    case "termeDominant": {
      if (exercice.famille !== "limiteInfini") return null;
      const exo = exercice;
      const diagnostiquer = (r: ReponseTermeDominant) => ({
        numerateur: diagnostiquerTermeDominant(r.numerateur, exo.coeffsN[exo.degN], exo.degN),
        denominateur: diagnostiquerTermeDominant(r.denominateur, exo.coeffsD[exo.degD], exo.degD),
      });
      return (
        <EtapeTermeDominant
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTermeDominant(etat, reponse))}
          diagnostiquer={diagnostiquer}
          validation={validation}
        />
      );
    }

    case "simplifierLimiteRef": {
      if (exercice.famille !== "limiteInfini") return null;
      const exo = exercice;
      return (
        <>
          <EtapeChampLibreLimite
            key={cleEcran}
            exercice={exercice}
            phase="simplifierLimiteRef"
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(texte) => terminerEtape(soumettreReponseSimplifierLimiteRef(etat, texte))}
            placeholder={exo.degreResultat === 0 ? "ex : -4" : "ex : 2x^2"}
            diagnostiquer={(t) => diagnostiquerRatioDominant(t, exo.ratioCoefficients, exo.degreResultat)}
            validation={validation}
          />
          <CalculatriceScientifique />
        </>
      );
    }

    case "evaluerLimiteFinale": {
      if (exercice.famille !== "limiteInfini") return null;
      const exo = exercice;
      if (exo.natureLimite === "infinie") {
        const attendu = exo.signeLimiteInfinie as 1 | -1;
        return (
          <>
            <EtapeChoixSigne
              key={cleEcran}
              exercice={exercice}
              phase="evaluerLimiteFinale"
              champs={[{ label: "" }]}
              options={OPTIONS_SIGNE_INFINI}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={onActiverAide}
              onValider={(choix) => terminerEtape(soumettreReponseEvaluerLimiteFinaleSigne(etat, choix[0]))}
              diagnostiquer={(choix) => [verifierSigne(choix[0], attendu)]}
              validation={validation}
            />
            <CalculatriceScientifique />
          </>
        );
      }
      const cible = exo.natureLimite === "zero" ? 0 : exo.ratioCoefficients.num / exo.ratioCoefficients.den;
      return (
        <>
          <EtapeChampLibreLimite
            key={cleEcran}
            exercice={exercice}
            phase="evaluerLimiteFinale"
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(texte) => terminerEtape(soumettreReponseEvaluerLimiteFinaleNumerique(etat, texte))}
            placeholder="ex : 0"
            diagnostiquer={(t) => diagnostiquerNombre(t, cible)}
            validation={validation}
          />
          <CalculatriceScientifique />
        </>
      );
    }
  }
}
