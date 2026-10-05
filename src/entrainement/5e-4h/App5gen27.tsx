import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceFonctionDerivee } from "./generateurs5e/fonctionDerivee/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionFonctionDerivee,
  niveauAideMaxFonctionDerivee,
  soumettreReponseCalculer,
  soumettreReponseDecomposerComposee,
  soumettreReponseDecomposerUV,
  soumettreReponseReconnaissance,
} from "./moteur5e/sessionFonctionDerivee";
import type { EtatSessionFonctionDerivee } from "./moteur5e/typesFonctionDerivee";
import {
  diagnostiquerCalculerDerivee,
  diagnostiquerChampExterieur,
  diagnostiquerChampInterieur,
  diagnostiquerChampU,
  diagnostiquerChampV,
} from "./moteur5e/verificationFonctionDerivee";
import type { ExerciceFonctionDerivee, TypeDerivee } from "./core5e/fonctionDerivee.types";
import { EtapeReconnaissanceFonctionDerivee } from "./components5e/EtapeReconnaissanceFonctionDerivee";
import { EtapeDecomposerFonctionDerivee } from "./components5e/EtapeDecomposerFonctionDerivee";
import { EtapeCalculerFonctionDerivee } from "./components5e/EtapeCalculerFonctionDerivee";
import { ResultatPanelFonctionDerivee } from "./components5e/ResultatPanelFonctionDerivee";
import { ResumeSessionFonctionDerivee } from "./components5e/ResumeSessionFonctionDerivee";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionFonctionDerivee {
  return demarrerSessionFonctionDerivee(REGLAGES_DEMO, genererExerciceFonctionDerivee);
}

interface Bilan {
  resultat: EtatSessionFonctionDerivee["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen27() {
  const [etat, setEtat] = useState<EtatSessionFonctionDerivee>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionFonctionDerivee) {
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
        <h1 className="app-title">Fonction dérivée</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionFonctionDerivee(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EcranCourant
              exercice={exercice}
              etat={etat}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cleEcran={cleEcran}
              terminerEtape={terminerEtape}
              setEtat={setEtat}
            />
          )}
          {dernierBilan && (
            <ResultatPanelFonctionDerivee
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionFonctionDerivee resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceFonctionDerivee;
  etat: EtatSessionFonctionDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionFonctionDerivee) => void;
  setEtat: (etat: EtatSessionFonctionDerivee) => void;
}

function EcranCourant({ exercice, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
  const niveauAideMax = niveauAideMaxFonctionDerivee();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (etat.phase) {
    case "reconnaissance":
      return (
        <EtapeReconnaissanceFonctionDerivee
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(choix) => terminerEtape(soumettreReponseReconnaissance(etat, choix))}
        />
      );

    case "decomposer": {
      const typeRetenu = etat.typeRetenu as Exclude<TypeDerivee, "reglebase">;
      if (typeRetenu === "produit" || typeRetenu === "quotient") {
        return (
          <EtapeDecomposerFonctionDerivee
            key={cleEcran}
            exercice={exercice}
            typeRetenu={typeRetenu}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(reponse) => terminerEtape(soumettreReponseDecomposerUV(etat, { u: reponse.champ1, v: reponse.champ2 }))}
            diagnostiquer={(r) => ({ champ1: diagnostiquerChampU(r.champ1, exercice), champ2: diagnostiquerChampV(r.champ2, exercice) })}
          />
        );
      }
      return (
        <EtapeDecomposerFonctionDerivee
          key={cleEcran}
          exercice={exercice}
          typeRetenu={typeRetenu}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDecomposerComposee(etat, { interieur: reponse.champ1, exterieur: reponse.champ2 }))}
          diagnostiquer={(r) => ({
            champ1: diagnostiquerChampInterieur(r.champ1, exercice, typeRetenu),
            champ2: diagnostiquerChampExterieur(r.champ2, exercice, typeRetenu),
          })}
        />
      );
    }

    case "calculer":
      return (
        <EtapeCalculerFonctionDerivee
          key={cleEcran}
          exercice={exercice}
          typeRetenu={etat.typeRetenu as TypeDerivee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculer(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerDerivee(t, exercice)}
        />
      );
  }
}
