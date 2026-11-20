import { useState } from "react";
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import { diagnostiquerAireCercleEntier, diagnostiquerCirconferenceCercleEntier, type ReponseCercleEntier } from "../moteur5e/verificationPolygonesArcsSecteurs";
import { consignePhase } from "../ui5e/formatPolygonesArcsSecteurs";
import { aidesPolygone, messageCibleCercleEntier } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import { PolygoneCercleSketch } from "./PolygoneCercleSketch";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
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
  const saisie = useTentativeLisible<ReponseCercleEntier>();
  const montrerErreurs = tentativesUtilisees > 0;
  const circonferenceErronee = (saisie.illisible || montrerErreurs) && diagnostiquerCirconferenceCercleEntier(exercice, circonference) !== "correct";
  const aireErronee = (saisie.illisible || montrerErreurs) && diagnostiquerAireCercleEntier(exercice, aire) !== "correct";
  const cible = montrerErreurs && saisie.soumise ? (messageCibleCercleEntier("circonference", saisie.soumise.circonference, exercice) ?? messageCibleCercleEntier("aire", saisie.soumise.aire, exercice)) : null;
  const complet = circonference.trim() !== "" && aire.trim() !== "";

  function valider() {
    if (!complet) return;
    const reponse: ReponseCercleEntier = { circonference, aire };
    // Saisie illisible (un des deux champs) : rien n'est transmis au moteur.
    saisie.tenter(reponse, estLisible(diagnostiquer?.(reponse)), onValider);
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
          placeholder="ex : 7π/11"
        />
      </div>
      <ApercuExpressionLatex texte={aire} label="Aire =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Aire =</label>
        <input type="text" className={`text-input${aireErronee ? " is-erronee" : ""}`} value={aire} onChange={(e) => setAire(e.target.value)} placeholder="ex : 7π/11" />
      </div>
      <AidesTrig niveauAide={niveauAide} aides={aidesPolygone(exercice, "cercleEntier")} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig illisible={saisie.illisible} champ="nombre" tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={cible} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
