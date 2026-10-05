import { useState } from "react";
import type { ExercicePopulation } from "../core5e/limitesContexte.types";
import { consigneGenerale, consignePhase, formatContexteTexte, formatTermesDonneesLatex, labelsChampsLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimitesContexte";
import type { ReponseEvaluerSeuil, StatutEvaluerSeuil } from "../moteur5e/verificationLimitesContexte";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EtatActuelLimitesContexte } from "./EtatActuelLimitesContexte";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExercicePopulation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEvaluerSeuil) => void;
  diagnostiquer?: (reponse: ReponseEvaluerSeuil) => StatutEvaluerSeuil;
}

/** Écran "evaluerSeuil" (famille D, unique) — valeur numérique + choix Supérieur/Inférieur gradés
 * EN PARALLÈLE (motif `EtapeDecisionOptimisation`, 4e), jamais un Oui/Non isolé sans second élément
 * structuré vérifié indépendamment. */
export function EtapeEvaluerSeuilPopulation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeur, setValeur] = useState("");
  const [comparaison, setComparaison] = useState<"superieur" | "inferieur" | null>(null);
  const [dernierStatut, setDernierStatut] = useState<StatutEvaluerSeuil | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeur.trim() !== "" && comparaison !== null;
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ valeur, comparaison }) : null;

  function valider() {
    if (!complet) return;
    const reponse: ReponseEvaluerSeuil = { valeur, comparaison };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <p className="prompt-text">{formatContexteTexte(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelLimitesContexte exercice={exercice} phase="evaluerSeuil" />
      <p className="prompt-text">{consignePhase(exercice, "evaluerSeuil")}</p>

      <div className="field champ-reponse-latex champ-reponse-latex-etroit">
        <span className="field-label-latex">
          <Katex expression={labelsChampsLatex(exercice, "evaluerSeuil")[0]} />
        </span>
        <input
          type="text"
          className={`text-input${statuts && statuts.valeur !== "correct" ? " is-erronee" : ""}`}
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          placeholder="ex : 10.23"
        />
      </div>

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${comparaison === "superieur" ? " toggle-active" : ""}${statuts && !statuts.comparaisonCorrecte && comparaison === "superieur" ? " is-erronee" : ""}`}
          onClick={() => setComparaison("superieur")}
        >
          Supérieur au seuil
        </button>
        <button
          type="button"
          className={`btn${comparaison === "inferieur" ? " toggle-active" : ""}${statuts && !statuts.comparaisonCorrecte && comparaison === "inferieur" ? " is-erronee" : ""}`}
          onClick={() => setComparaison("inferieur")}
        >
          Inférieur au seuil
        </button>
      </div>

      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut?.valeur)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "evaluerSeuil")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, "evaluerSeuil")}</p>}
        </div>
      )}
    </div>
  );
}
