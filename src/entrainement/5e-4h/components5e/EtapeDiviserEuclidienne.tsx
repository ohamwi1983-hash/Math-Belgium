import { useState } from "react";
import type { ExerciceAsymptoteOblique } from "../core5e/asymptoteOblique.types";
import type { ReponseDiviserEuclidienne } from "../moteur5e/sessionAsymptoteOblique";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatAsymptoteOblique";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceAsymptoteOblique;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDiviserEuclidienne) => void;
  diagnostiquer?: (reponse: ReponseDiviserEuclidienne) => { quotient: StatutVerification; reste: StatutVerification };
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "diviserEuclidienne" (variante "divisionEuclidienne" uniquement) — 1 champ symbolique
 * (quotient Q(x)) + 1 champ numérique (reste R(x)), vérifiés INDÉPENDAMMENT. */
export function EtapeDiviserEuclidienne({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [quotient, setQuotient] = useState("");
  const [reste, setReste] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = quotient.trim() !== "" && reste.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ quotient, reste }) : null;
  const aide2 = texteAideNiveau2("diviserEuclidienne");

  function valider() {
    if (!complet) return;
    const reponse: ReponseDiviserEuclidienne = { quotient, reste };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.quotient !== "correct" ? s.quotient : s.reste);
    }
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={consigneGenerale()}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{consignePhase(exercice, "diviserEuclidienne")}</p>
      <ApercuExpressionLatex texte={quotient} label="Q(x)=" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="Q(x)=" />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.quotient !== "correct" ? " is-erronee" : ""}`}
          value={quotient}
          onChange={(e) => setQuotient(e.target.value)}
          placeholder="ex : 2x-3"
        />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="R(x)=" />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.reste !== "correct" ? " is-erronee" : ""}`}
          value={reste}
          onChange={(e) => setReste(e.target.value)}
          placeholder="ex : 5"
        />
      </div>
      <CalculatriceScientifique />
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
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("diviserEuclidienne")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
