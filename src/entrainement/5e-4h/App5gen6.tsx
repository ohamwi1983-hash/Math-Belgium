import { useState } from "react";
import type { QuantiteArcSecteur } from "./core5e/arcsSecteurs.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { genererExerciceArcSecteur, genererExerciceConversion, genererExerciceDeuxVersTrois } from "./generateurs5e/arcsSecteurs";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_MODE = [
  { id: "deuxVersTrois", label: "2 données → 3 inconnues" },
  { id: "conversion", label: "Conversion pure (deg ↔ rad)" },
];
import {
  NIVEAU_AIDE_MAX_ARC_SECTEUR,
  activerAideSuivante,
  demarrerSessionArcSecteur,
  soumettreReponseArcSecteur,
} from "./moteur5e/sessionArcsSecteurs";
import type { EtatSessionArcSecteur, PhaseArcSecteur, ResultatExerciceArcSecteur } from "./moteur5e/typesArcsSecteurs";
import { diagnostiquerValeurArcSecteur } from "./moteur5e/verificationArcsSecteurs";
import { EtapeConversionArcSecteur } from "./components5e/EtapeConversionArcSecteur";
import { EtapeQuantiteArcSecteur } from "./components5e/EtapeQuantiteArcSecteur";
import { ResultatPanelArcSecteur } from "./components5e/ResultatPanelArcSecteur";
import { ResumeSessionArcSecteur } from "./components5e/ResumeSessionArcSecteur";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 6, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionArcSecteur {
  return demarrerSessionArcSecteur(REGLAGES_DEMO, genererExerciceArcSecteur);
}

interface Bilan {
  resultat: ResultatExerciceArcSecteur;
  aideParPhase: Partial<Record<PhaseArcSecteur, number>>;
}

export function App5gen6() {
  const [etat, setEtat] = useState<EtatSessionArcSecteur>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseArcSecteur, number>>>({});

  function terminerEtape(nouvelEtat: EtatSessionArcSecteur) {
    const miseAJour = { ...aideParPhase, [etat.phase]: etat.niveauAide };
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Arcs et secteurs</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_MODE}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionArcSecteur(REGLAGES_DEMO, id === "conversion" ? genererExerciceConversion : genererExerciceDeuxVersTrois));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {exercice.mode === "deuxVersTrois" && (
                <EtapeQuantiteArcSecteur
                  key={etat.phase}
                  exercice={exercice}
                  phase={etat.phase as QuantiteArcSecteur}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_ARC_SECTEUR}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseArcSecteur(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerValeurArcSecteur(texte, exercice.valeurs[etat.phase as QuantiteArcSecteur])}
                />
              )}
              {exercice.mode === "conversion" && (
                <EtapeConversionArcSecteur
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_ARC_SECTEUR}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseArcSecteur(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerValeurArcSecteur(texte, exercice.valeurCible)}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelArcSecteur
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionArcSecteur resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
