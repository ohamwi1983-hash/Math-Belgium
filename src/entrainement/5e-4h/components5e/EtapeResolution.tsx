import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { ReponseResolution } from "../moteur5e/sessionModelisationSinusoide";
import { consignePhaseFragments, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { FragmentsConsigneSinusoide } from "./FragmentsConsigneSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesModelisation } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "../moteur5e/verificationModelisationSinusoide";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseResolution) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error), même motif que 5gen2 (A.1) — voir
   * `EtapeChampSimpleModelisation.tsx` pour la documentation complète. */
  diagnostiquer?: (reponse: ReponseResolution) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "resolution" (technique B3 uniquement) — résoudre le système par combinaison
 * (soustraction puis addition) pour trouver ω puis φ, 2 champs côte à côte. */
export function EtapeResolution({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const donnees = exercice.phase1;
  if (donnees.technique !== "b3") throw new Error("EtapeResolution : technique hors 'b3'");
  const [omega, setOmega] = useState("");
  const [phi, setPhi] = useState("");
  const saisie = useTentativeLisible<ReponseResolution>();
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = omega.trim() !== "" && phi.trim() !== "";
  /** ω/φ diagnostiqués INDÉPENDAMMENT (`diagnostiquerNombre` réutilisée directement, même logique
   * que `diagnostiquerResolutionPhase` côté App, qui combine ces 2 mêmes appels — A.2). */
  const omegaErronee = (saisie.illisible || montrerErreurs) && diagnostiquerNombre(omega, donnees.fonction.omega) !== "correct";
  const phiErronee = (saisie.illisible || montrerErreurs) && diagnostiquerNombre(phi, donnees.fonction.phi as number) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { omega, phi };
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(reponse, estLisible(diagnostiquer?.(reponse)), onValider);
  }

  return (
    <div>
      <p className="prompt-text"><FragmentsConsigneSinusoide fragments={consignePhaseFragments(exercice, "resolution")} /></p>
      <div className="field-row">
        <div>
          <ApercuExpressionLatex texte={omega} label="ω =" />
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">ω =</label>
            <input type="text" className={`text-input${omegaErronee ? " is-erronee" : ""}`} value={omega} onChange={(e) => setOmega(e.target.value)} />
          </div>
        </div>
        <div>
          <ApercuExpressionLatex texte={phi} label="φ =" />
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">φ =</label>
            <input type="text" className={`text-input${phiErronee ? " is-erronee" : ""}`} value={phi} onChange={(e) => setPhi(e.target.value)} />
          </div>
        </div>
      </div>
      <AidesTrig niveauAide={niveauAide} aides={aidesModelisation(exercice, "resolution", texteAideNiveau2(exercice, "resolution"))} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="nombre"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? null : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
