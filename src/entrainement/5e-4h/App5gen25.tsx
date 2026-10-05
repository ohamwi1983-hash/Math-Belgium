import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, derivee, genererExerciceAssociation } from "./generateurs5e/association/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionAssociation,
  niveauAideMaxAssociation,
  soumettreReponseAssociation,
} from "./moteur5e/sessionAssociation";
import type { EtatSessionAssociation } from "./moteur5e/typesAssociation";
import { diagnostiquerLignes } from "./moteur5e/verificationAssociation";
import { nombreElementsAssociation } from "./core5e/association.types";
import {
  CONSIGNE_GENERALE_ASSOCIATION,
  consigneAssociation,
  texteAideNiveau1Association,
  texteAideNiveau2Association,
} from "./ui5e/formatAssociation";
import { ComposantAssociation } from "./components5e/ComposantAssociation";
import { PolynomeAssociationGraph } from "./components5e/PolynomeAssociationGraph";
import { FonctionRicheAssociationGraph } from "./components5e/FonctionRicheAssociationGraph";
import { ResultatPanelAssociation } from "./components5e/ResultatPanelAssociation";
import { ResumeSessionAssociation } from "./components5e/ResumeSessionAssociation";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionAssociation {
  return demarrerSessionAssociation(REGLAGES_DEMO, genererExerciceAssociation);
}

interface Bilan {
  resultat: EtatSessionAssociation["resultats"][number];
}

export function App5gen25() {
  const [etat, setEtat] = useState<EtatSessionAssociation>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionAssociation) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1] });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAideMax = niveauAideMaxAssociation();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const cleEcran = `${etat.indexExercice}-${exercice.famille}`;

  function renderItem(index: number) {
    if (exercice.famille === "grapheDerivee") return <PolynomeAssociationGraph coeffs={exercice.fonctions[index]} />;
    if (exercice.famille === "grapheVerbal") return <PolynomeAssociationGraph coeffs={exercice.fonctions[index]} />;
    if (exercice.famille === "grapheDeriveeAvancee") return <FonctionRicheAssociationGraph fonction={exercice.fonctions[index]} />;
    return <Katex expression={exercice.fLatex[index]} block />;
  }

  function renderCandidat(index: number) {
    if (exercice.famille === "grapheDerivee") {
      const numeroSource = exercice.ordreLettres[index];
      return <PolynomeAssociationGraph coeffs={derivee(exercice.fonctions[numeroSource])} />;
    }
    if (exercice.famille === "grapheVerbal") return <p>{exercice.enonces[index]}</p>;
    if (exercice.famille === "grapheDeriveeAvancee") {
      const numeroSource = exercice.ordreLettres[index];
      return <FonctionRicheAssociationGraph fonction={exercice.fonctions[numeroSource]} derivee />;
    }
    return <Katex expression={exercice.gLatex[index]} block />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Association graphique/mots ↔ signe de f'/f''</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionAssociation(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <ComposantAssociation
              key={cleEcran}
              nombreItems={nombreElementsAssociation(exercice)}
              renderItem={renderItem}
              renderCandidat={renderCandidat}
              consigneGenerale={CONSIGNE_GENERALE_ASSOCIATION}
              consigne={consigneAssociation(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={onActiverAide}
              onValider={(choix) => terminerEtape(soumettreReponseAssociation(etat, choix))}
              diagnostiquer={(choix) =>
                diagnostiquerLignes(exercice.ordreLettres, choix, exercice.famille === "grapheDeriveeAvancee" ? exercice.singulier : undefined)
              }
              texteAideNiveau1={texteAideNiveau1Association(exercice)}
              texteAideNiveau2={texteAideNiveau2Association(exercice)}
              libelleOptionSupplementaire={exercice.famille === "grapheDeriveeAvancee" ? "f' n'existe pas ici" : undefined}
            />
          )}
          {dernierBilan && (
            <ResultatPanelAssociation resultat={dernierBilan.resultat} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionAssociation resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
