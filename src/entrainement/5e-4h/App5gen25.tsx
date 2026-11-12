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
import type { ExerciceAssociation } from "./core5e/association.types";
import { lettreCorrecte, nombreElementsAssociation, reponseCorrecteAssociation } from "./core5e/association.types";
import {
  CONSIGNE_GENERALE_ASSOCIATION,
  consigneAssociation,
  texteAideNiveau1Association,
  texteAideNiveau2Association,
} from "./ui5e/formatAssociation";
import { ComposantAssociation } from "./components5e/ComposantAssociation";
import { PolynomeAssociationGraph } from "./components5e/PolynomeAssociationGraph";
import { FonctionRicheAssociationGraph } from "./components5e/FonctionRicheAssociationGraph";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/** Une seule tentative : avec autant de menus que de lettres, plusieurs essais permettraient de
 * trouver l'association par élimination (audit 5c5a, point 8). */
const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 1 };

const LETTRES = ["A", "B", "C", "D", "E", "F", "G", "H"];

function nouvelleSession(): EtatSessionAssociation {
  return demarrerSessionAssociation(REGLAGES_DEMO, genererExerciceAssociation);
}

/** Réponse réellement attendue de l'exercice qui vient de se clore — même dispatch par élément
 * numéroté que l'ancien `ResultatPanelAssociation.tsx` (supprimé, remplacé par la validation
 * inline) : l'exercice tient sur un seul écran, donc une seule validation couvre TOUS les
 * éléments numérotés d'un coup (jamais une validation par ligne, même principe que le récapitulatif
 * qu'elle remplace). */
function reponseAttendueAssociation(exercice: ExerciceAssociation) {
  const n = nombreElementsAssociation(exercice);
  const singulier = exercice.famille === "grapheDeriveeAvancee" ? exercice.singulier : undefined;

  function contenuLigne(numero: number) {
    const lettre = lettreCorrecte(exercice.ordreLettres, numero);
    if (exercice.famille === "grapheDerivee") return <PolynomeAssociationGraph coeffs={exercice.fonctions[exercice.ordreLettres[lettre]]} />;
    if (exercice.famille === "grapheVerbal") return <span>{exercice.enonces[lettre]}</span>;
    if (exercice.famille === "grapheDeriveeAvancee") {
      if (singulier?.[numero]) return null;
      return <FonctionRicheAssociationGraph fonction={exercice.fonctions[exercice.ordreLettres[lettre]]} derivee />;
    }
    return <Katex expression={exercice.gLatex[lettre]} />;
  }

  function labelLigne(numero: number): string {
    const reponse = reponseCorrecteAssociation(exercice.ordreLettres, singulier, numero);
    return reponse === "aucune" ? `Élément ${numero + 1} → f' n'existe pas ici` : `Élément ${numero + 1} → ${LETTRES[reponse]}`;
  }

  return (
    <div>
      {Array.from({ length: n }, (_, numero) => (
        <div key={numero}>
          <p>{labelLigne(numero)}</p>
          {contenuLigne(numero)}
        </div>
      ))}
    </div>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionAssociation;
  revele: boolean;
}

export function App5gen25() {
  const [etat, setEtat] = useState<EtatSessionAssociation>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la clé d'écran, pour que les menus
   * reviennent à « Choisis… » même quand la famille ne change pas. */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionAssociation) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
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
    setNumeroGeneration((g) => g + 1);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionAssociation(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
    setNumeroGeneration((g) => g + 1);
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAideMax = niveauAideMaxAssociation();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${exercice.famille}`;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueAssociation(exercice),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

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
        <p className="app-subtitle">Chapitre 5 — Dérivées et applications</p>
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
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
            aideNiveau2={texteAideNiveau2Association(exercice)}
            libelleOptionSupplementaire={exercice.famille === "grapheDeriveeAvancee" ? "f' n'existe pas ici" : undefined}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
