import { useState } from "react";
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import { diagnostiquerAireCercleEntier, diagnostiquerCirconferenceCercleEntier, type ReponseCercleEntier } from "../moteur5e/verificationPolygonesArcsSecteurs";
import { consignePhase, latexAideNiveau2, texteAideNiveau1 } from "../ui5e/formatPolygonesArcsSecteurs";
import { PolygoneCercleSketch } from "./PolygoneCercleSketch";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExercicePolygonesArcsSecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCercleEntier) => void;
  /** Statut à 3 valeurs calculé côté présentation (promptcorrectionsregroupees.md, A.1) sur les 2
   * champs COMBINÉS — jamais consommé par le score — optionnel, comportement générique inchangé
   * sans lui. */
  diagnostiquer?: (reponse: ReponseCercleEntier) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeCercleEntier({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [circonference, setCirconference] = useState("");
  const [aire, setAire] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const circonferenceErronee = montrerErreurs && diagnostiquerCirconferenceCercleEntier(exercice, circonference) !== "correct";
  const aireErronee = montrerErreurs && diagnostiquerAireCercleEntier(exercice, aire) !== "correct";
  const complet = circonference.trim() !== "" && aire.trim() !== "";

  function valider() {
    if (!complet) return;
    const reponse: ReponseCercleEntier = { circonference, aire };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consignePhase("cercleEntier")}</p>
      <PolygoneCercleSketch r={exercice.r} n={exercice.n} surlignage={null} />
      <ApercuExpressionLatex texte={circonference} label="Circonférence =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Circonférence =</label>
        <input
          type="text"
          className={`text-input${circonferenceErronee ? " is-erronee" : ""}`}
          value={circonference}
          onChange={(e) => setCirconference(e.target.value)}
          placeholder="ex : 4*pi"
        />
      </div>
      <ApercuExpressionLatex texte={aire} label="Aire =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Aire =</label>
        <input type="text" className={`text-input${aireErronee ? " is-erronee" : ""}`} value={aire} onChange={(e) => setAire(e.target.value)} placeholder="ex : 4*pi" />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <Katex expression={texteAideNiveau1("cercleEntier")} block />
          {niveauAide >= 2 && <Katex expression={latexAideNiveau2(exercice, "cercleEntier")} block />}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
