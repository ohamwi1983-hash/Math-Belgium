import { useState } from "react";
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
import type { EtatSessionLimite, PhaseLimite, ResultatExerciceLimite } from "./moteur5e/typesLimites";
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
import { ResultatPanelLimite } from "./components5e/ResultatPanelLimite";
import { ResumeSessionLimite } from "./components5e/ResumeSessionLimite";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

const OPTIONS_SIGNE_INFINI: [string, string] = ["+∞", "−∞"];

function nouvelleSession(): EtatSessionLimite {
  return demarrerSessionLimite(REGLAGES_DEMO, genererExerciceLimite);
}

interface Bilan {
  resultat: ResultatExerciceLimite;
  aideParPhase: Partial<Record<PhaseLimite, { niveauAide: number; revele: boolean }>>;
}

export function App5gen20() {
  const [etat, setEtat] = useState<EtatSessionLimite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseLimite, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionLimite) {
    // A.1 : `revele` doit être lu sur `nouvelEtat` (POST-soumission), jamais `etat.etapeCourante.revelee`
    // (PRÉ-soumission, structurellement toujours `false` ici — même motif que 5gen14).
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites, reconnaissance et calcul</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionLimite(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EcranCourant
              exercice={exercice}
              phase={phase}
              etat={etat}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cleEcran={cleEcran}
              terminerEtape={terminerEtape}
              setEtat={setEtat}
            />
          )}
          {dernierBilan && (
            <ResultatPanelLimite
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && <ResumeSessionLimite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}{" "}
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
}

/** Dispatch par phase — chaque famille a une séquence FIXE (jamais de branche interne variable
 * contrairement à 5gen14), donc un simple `switch` sur `phase` suffit, la famille étant déjà
 * garantie cohérente avec la phase courante par `ordreComplet` (jamais atteinte hors de sa
 * famille). "reconnaissance" (écran 0) est IDENTIQUE pour les 4 familles — famille "limiteReelle" :
 * ce même écran soumet classification ET valeur numérique en un seul geste (`soumettreReponseReconnaissance`
 * accepte un `valeurTexte` optionnel), aucun écran supplémentaire. */
function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
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
          />
          <CalculatriceScientifique />
        </>
      );
    }
  }
}
