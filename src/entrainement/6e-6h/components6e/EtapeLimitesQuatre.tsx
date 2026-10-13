import { useState } from "react";
import { Katex } from "../components/Katex";
import type { ReponseLimites } from "../moteur6e/verificationEtudeFonctionExponentielle";
import type { DirectionLabel } from "../ui6e/formatEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionExponentielle";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import type { EtatLimiteLocal } from "./EtapeLimitesDeux";
import { GroupeLimite } from "./EtapeLimitesDeux";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  estPremierEcran: boolean;
  enonceLatex: string;
  consigneEcran: string;
  labels: DirectionLabel[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLimites) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const VIDE: EtatLimiteLocal = { statut: null, texte: "" };

/**
 * Écran 2/6, "limites" — famille B UNIQUEMENT, 4 directions indépendantes
 * (x→p⁺/x→p⁻/x→+∞/x→−∞) sur UN SEUL écran, un SEUL bouton "Valider" commun aux 4 — décision de
 * conception explicite (design decision #2) : réutilise le SOUS-COMPOSANT `GroupeLimite`
 * (`EtapeLimitesDeux.tsx`, exporté pour cet usage) 4 fois plutôt qu'une 4e implémentation
 * indépendante — l'écran le plus dense du générateur, spec explicite. `App6gen11.tsx` doit le
 * rendre avec `key={indexExercice}`.
 */
export function EtapeLimitesQuatre({ estPremierEcran, enonceLatex, consigneEcran, labels, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [pointPlus, setPointPlus] = useState<EtatLimiteLocal>(VIDE);
  const [pointMoins, setPointMoins] = useState<EtatLimiteLocal>(VIDE);
  const [plusInfini, setPlusInfini] = useState<EtatLimiteLocal>(VIDE);
  const [moinsInfini, setMoinsInfini] = useState<EtatLimiteLocal>(VIDE);
  const montrerErreurs = tentativesUtilisees > 0;

  function complet(e: EtatLimiteLocal): boolean {
    return e.statut !== null && (e.statut !== "valeur" || e.texte.trim() !== "");
  }

  const tousComplets = [pointPlus, pointMoins, plusInfini, moinsInfini].every(complet);

  function versReponse(e: EtatLimiteLocal) {
    return e.statut === "valeur" ? { type: "valeur" as const, texte: e.texte } : { type: e.statut as "plus_infini" | "moins_infini" | "zero" };
  }

  function valider() {
    if (!tousComplets) return;
    onValider({ type: "quatre", pointPlus: versReponse(pointPlus), pointMoins: versReponse(pointMoins), plusInfini: versReponse(plusInfini), moinsInfini: versReponse(moinsInfini) });
  }

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={enonceLatex} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneEcran}</p>
      <GroupeLimite label={labels[0].latex} etat={pointPlus} erreur={montrerErreurs} onChange={setPointPlus} />
      <GroupeLimite label={labels[1].latex} etat={pointMoins} erreur={montrerErreurs} onChange={setPointMoins} />
      <GroupeLimite label={labels[2].latex} etat={plusInfini} erreur={montrerErreurs} onChange={setPlusInfini} />
      <GroupeLimite label={labels[3].latex} etat={moinsInfini} erreur={montrerErreurs} onChange={setMoinsInfini} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!tousComplets} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
