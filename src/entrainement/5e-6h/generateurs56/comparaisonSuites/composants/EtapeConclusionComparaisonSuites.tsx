// Copie 5e (6h) de `5e-4h/components5e/EtapeConclusionComparaisonSuites.tsx` (56gen11 ← 5gen18, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ExerciceComparaisonSuites } from "../core/comparaisonSuites.types";
import { consigneConclusion, consigneGenerale, labelTraduction, texteAideNiveau1, texteAideNiveau2 } from "../ui/formatComparaisonSuites";
import { Katex } from "../../../../5e-4h/components/Katex";
import { ValidationEcran } from "../../../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../../../components/ValidationEcran";
import { BoutonAide } from "../../../../5e-4h/components5e/BoutonAide";
import { EnTeteExercice } from "../../../../5e-4h/components5e/EnTeteExercice";
import { EtatActuelComparaisonSuites } from "./EtatActuelComparaisonSuites";
import { formatMessageErreur } from "../../../../5e-4h/ui/messageErreur";
import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { TexteInsistance } from "../../../../components/TexteInsistance";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "conclusion" — 2 champs : le rang n trouvé par balayage du tableau, ET sa traduction dans
 * l'unité du contexte (année / numéro du mois) — les 2 doivent être corrects (piège du cours : oublier
 * de traduire). */
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
  validation,
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
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={<EtatActuelComparaisonSuites exercice={exercice} />}
      />
      <p className="prompt-text">{consigneConclusion(exercice)}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="n=" />
        </label>
        <input type="text" style={{ minHeight: 44 }} className={`text-input${nSeuilErronee ? " is-erronee" : ""}`} value={nSeuil} onChange={(e) => setNSeuil(e.target.value)} />
      </div>
      <div className="field field-inline">
        <label className="field-label">{labelTraduction(exercice)}</label>
        <input type="text" style={{ minHeight: 44 }} className={`text-input${traductionErronee ? " is-erronee" : ""}`} value={traduction} onChange={(e) => setTraduction(e.target.value)} />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p><TexteInsistance texte={texteAideNiveau1(exercice, "conclusion")} /></p>
          {niveauAide >= 2 && aide2.texte.length > 0 && <p><TexteInsistance texte={aide2.texte} /></p>}
          {niveauAide >= 2 && aide2.latex.length > 0 && <Katex expression={aide2.latex} block />}
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
