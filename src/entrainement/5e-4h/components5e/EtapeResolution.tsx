import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { ReponseResolution } from "../moteur5e/sessionModelisationSinusoide";
import { consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
import { formatMessageErreur } from "../ui/messageErreur";
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
}

/** Écran "resolution" (technique B3 uniquement) — résoudre le système par combinaison
 * (soustraction puis addition) pour trouver ω puis φ, 2 champs côte à côte. */
export function EtapeResolution({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const donnees = exercice.phase1;
  if (donnees.technique !== "b3") throw new Error("EtapeResolution : technique hors 'b3'");
  const [omega, setOmega] = useState("");
  const [phi, setPhi] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = omega.trim() !== "" && phi.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  /** ω/φ diagnostiqués INDÉPENDAMMENT (`diagnostiquerNombre` réutilisée directement, même logique
   * que `diagnostiquerResolutionPhase` côté App, qui combine ces 2 mêmes appels — A.2). */
  const omegaErronee = apresEchec && diagnostiquerNombre(omega, donnees.fonction.omega) !== "correct";
  const phiErronee = apresEchec && diagnostiquerNombre(phi, donnees.fonction.phi as number) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { omega, phi };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase="resolution" />
      <p className="prompt-text">{consignePhase(exercice, "resolution")}</p>
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
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "resolution")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "resolution")} block />}
        </div>
      )}
    </div>
  );
}
