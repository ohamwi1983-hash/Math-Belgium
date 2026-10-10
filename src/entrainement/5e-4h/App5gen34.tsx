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
import type { EcranExtremaBornes, EtatSessionExtremaBornes } from "./moteur5e/typesExtremaBornes";
import {
  diagnostiquerCalculerDeriveeBorne,
  diagnostiquerChampParmiCiblesBorne,
  valeursFAuxBornes,
  valeursFAuxExtremumsBorne,
} from "./moteur5e/verificationExtremaBornes";
import { EtapeDeriverExtremaBornes } from "./components5e/EtapeDeriverExtremaBornes";
import { EtapeTableauFPrimeExtremaBornes } from "./components5e/EtapeTableauFPrimeExtremaBornes";
import { EtapeChampsNumeriquesExtremaBornes } from "./components5e/EtapeChampsNumeriquesExtremaBornes";
import { EtapeComparaisonExtremaBornes } from "./components5e/EtapeComparaisonExtremaBornes";
import { ResultatPanelExtremaBornes } from "./components5e/ResultatPanelExtremaBornes";
import { ResumeSessionExtremaBornes } from "./components5e/ResumeSessionExtremaBornes";
import { labelsChampsBornes, labelsChampsExtremums, placeholdersChampsBornes, placeholdersChampsExtremums } from "./ui5e/formatExtremaBornes";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionExtremaBornes {
  return demarrerSessionExtremaBornes(REGLAGES_DEMO, genererExerciceExtremaBornes);
}

interface Bilan {
  resultat: EtatSessionExtremaBornes["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen34() {
  const [etat, setEtat] = useState<EtatSessionExtremaBornes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionExtremaBornes) {
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Extrema en contexte borné</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionExtremaBornes(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
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
            />
          )}
          {dernierBilan && (
            <ResultatPanelExtremaBornes
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionExtremaBornes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
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
  terminerEtape: (nouvelEtat: EtatSessionExtremaBornes) => void;
  setEtat: (etat: EtatSessionExtremaBornes) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
  const niveauAideMax = niveauAideMaxExtremaBornes();
  const onActiverAide = () => setEtat(activerAideSuivanteExtremaBornes(etat));

  switch (phase) {
    case "deriver":
      return (
        <EtapeDeriverExtremaBornes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseDeriverBorne(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerDeriveeBorne(t, exercice)}
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
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrimeBorne(etat, reponse))}
        />
      );

    case "valeursExtremums":
      return (
        <EtapeChampsNumeriquesExtremaBornes
          key={cleEcran}
          exercice={exercice}
          phase="valeursExtremums"
          labels={labelsChampsExtremums(exercice)}
          placeholders={placeholdersChampsExtremums()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseValeursExtremumsBorne(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesBorne(t, valeursFAuxExtremumsBorne(exercice))}
        />
      );

    case "valeursBornes":
      return (
        <EtapeChampsNumeriquesExtremaBornes
          key={cleEcran}
          exercice={exercice}
          phase="valeursBornes"
          labels={labelsChampsBornes(exercice)}
          placeholders={placeholdersChampsBornes()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseValeursBornes(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCiblesBorne(t, valeursFAuxBornes(exercice))}
        />
      );

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
        />
      );
  }
}
