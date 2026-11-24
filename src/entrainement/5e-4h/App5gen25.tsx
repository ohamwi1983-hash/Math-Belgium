import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, derivee, genererExerciceAssociation, genererExerciceAssociationLibre } from "./generateurs5e/association/index";
import { EcranJustificationAssociation } from "./components5e/EcranJustificationAssociation";
import { specJustification } from "./moteur5e/justificationAssociation";
import { messageChoixJustification } from "./ui5e/retoursAssociation";
import { PREFIXE_CHOIX_FERME } from "./ui5e/retoursDerivees";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { CATALOGUE_VARIANTES_EXPORT_ASSOCIATION } from "./generateurs5e/association/exportEvaluation";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeAssociation } from "./generateurs5e/association/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionAssociation,
  niveauAideMaxAssociation,
  soumettreReponseAssociation,
  soumettreReponseJustification,
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
// Association : une tentative (forcée par le moteur) ; justification : 3 tentatives sur les champs.
const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

const LETTRES = ["A", "B", "C", "D", "E", "F", "G", "H"];

function nouvelleSession(): EtatSessionAssociation {
  return demarrerSessionAssociation(REGLAGES_DEMO, genererExerciceAssociationLibre);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs5e/association/exportEvaluation.ts`) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionAssociation {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionAssociation(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES_EXPORT_ASSOCIATION, genererExerciceAssociation, (id) => construireAvecFamilleId(id)));
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
  messageRevele?: string | null;
}

export function App5gen25() {
  const [etat, setEtat] = useState<EtatSessionAssociation>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la clé d'écran, pour que les menus
   * reviennent à « Choisis… » même quand la famille ne change pas. */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionAssociation) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee || nouvelEtat.phase !== etat.phase || nouvelEtat.indexExercice !== etat.indexExercice;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      // Choix fermés (une tentative) : message propre au choix au lieu de « Tentatives épuisées ».
      const message =
        !revele
          ? null
          : etat.phase === "association"
            ? `${PREFIXE_CHOIX_FERME} Compare le signe de la pente de f (montée / descente) avec le signe de chaque candidat.`
            : etat.etapeCourante.tentativesUtilisees + 1 < etat.reglages.tentativesMax
              ? messageChoixJustification(etat.exerciceCourant)
              : null;
      setEnAttente({ etatSuivant: nouvelEtat, revele, messageRevele: message });
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

  const lettreEcran = etat.phase === "association" ? "a" : "b";
  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        ...(enAttente.messageRevele ? { messageRevele: enAttente.messageRevele } : {}),
        reponseAttendue: etat.phase === "association" ? reponseAttendueAssociation(exercice) : undefined,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeAssociation(exercice), lettreEcran)} />,
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
          {etat.phase === "justification" ? (
            <EcranJustificationAssociation
              key={`${cleEcran}-justification`}
              exercice={exercice}
              rappel={
                <div className="association-item-contenu">
                  <p className="field-label field-label-minuscule">{specJustification(exercice).item + 1}</p>
                  {renderItem(specJustification(exercice).item)}
                </div>
              }
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={onActiverAide}
              onValider={(r) => terminerEtape(soumettreReponseJustification(etat, r))}
              validation={validation}
            />
          ) : (
          <ComposantAssociation
            key={cleEcran}
            reponsesAttendues={Array.from({ length: nombreElementsAssociation(exercice) }, (_, i) => reponseCorrecteAssociation(exercice.ordreLettres, exercice.famille === "grapheDeriveeAvancee" ? exercice.singulier : undefined, i))}
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
          )}
        </div>
      </main>
    </div>
  );
}
