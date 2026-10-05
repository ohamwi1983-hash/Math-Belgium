import { useState } from "react";
import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";
import { consigneConclusion, consigneGenerale, labelTraduction, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatComparaisonSuites";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelComparaisonSuites } from "./EtatActuelComparaisonSuites";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceComparaisonSuites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: { nSeuil: string; traduction: string }) => void;
  /** Statut à 3 valeurs — voir `EtapeTableauComparaisonSuites.tsx`, même motif (A.1). */
  diagnostiquer?: (reponse: { nSeuil: string; traduction: string }) => StatutVerification;
  /** Statuts à 3 valeurs PAR CHAMP (A.2 — highlight rouge indépendant). */
  diagnostiquerNSeuil?: (texte: string) => StatutVerification;
  diagnostiquerTraduction?: (texte: string) => StatutVerification;
}

/** Écran "conclusion" — 2 champs : l'indice n trouvé, ET sa traduction dans l'unité du contexte
 * (année/mois) — les 2 doivent être corrects (piège explicite de la spec : oublier de traduire). */
export function EtapeConclusionComparaisonSuites({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  diagnostiquerNSeuil,
  diagnostiquerTraduction,
}: Props) {
  const [nSeuil, setNSeuil] = useState("");
  const [traduction, setTraduction] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = nSeuil.trim() !== "" && traduction.trim() !== "";
  const aide2 = texteAideNiveau2(exercice, "conclusion");

  const apresEchec = tentativesUtilisees > 0;
  const nSeuilErronee = apresEchec && !!diagnostiquerNSeuil && diagnostiquerNSeuil(nSeuil) !== "correct";
  const traductionErronee = apresEchec && !!diagnostiquerTraduction && diagnostiquerTraduction(traduction) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { nSeuil, traduction };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <EtatActuelComparaisonSuites exercice={exercice} />
      <p className="prompt-text">{consigneConclusion(exercice)}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="n=" />
        </label>
        <input type="text" className={`text-input${nSeuilErronee ? " is-erronee" : ""}`} value={nSeuil} onChange={(e) => setNSeuil(e.target.value)} />
      </div>
      <div className="field field-inline">
        <label className="field-label">{labelTraduction(exercice)}</label>
        <input type="text" className={`text-input${traductionErronee ? " is-erronee" : ""}`} value={traduction} onChange={(e) => setTraduction(e.target.value)} />
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
          <p>{texteAideNiveau1(exercice, "conclusion")}</p>
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
