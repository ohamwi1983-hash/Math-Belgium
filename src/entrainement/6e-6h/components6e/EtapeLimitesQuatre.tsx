import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { ReponseLimites } from "../moteur6e/verificationEtudeFonctionExponentielle";
import type { DirectionLabel, FragmentConsigne } from "../ui6e/formatEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionExponentielle";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, tousLisibles, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";
import type { EtatLimiteLocal } from "./EtapeLimitesDeux";
import { GroupeLimite } from "./EtapeLimitesDeux";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props extends PropsRetourChamp<ReponseLimites> {
  enonceLatex: string;
  consigneEcran: FragmentConsigne[];
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
export function EtapeLimitesQuatre({ enonceLatex, consigneEcran, labels, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
  const [pointPlus, setPointPlus] = useState<EtatLimiteLocal>(VIDE);
  const [pointMoins, setPointMoins] = useState<EtatLimiteLocal>(VIDE);
  const [plusInfini, setPlusInfini] = useState<EtatLimiteLocal>(VIDE);
  const [moinsInfini, setMoinsInfini] = useState<EtatLimiteLocal>(VIDE);
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<ReponseLimites>();

  function complet(e: EtatLimiteLocal): boolean {
    return e.statut !== null && (e.statut !== "valeur" || e.texte.trim() !== "");
  }

  const tousComplets = [pointPlus, pointMoins, plusInfini, moinsInfini].every(complet);

  function versReponse(e: EtatLimiteLocal) {
    return e.statut === "valeur" ? { type: "valeur" as const, texte: e.texte } : { type: e.statut as "plus_infini" | "moins_infini" | "zero" };
  }

  function valider() {
    if (!tousComplets) return;
    retour.tenter({ type: "quatre", pointPlus: versReponse(pointPlus), pointMoins: versReponse(pointMoins), plusInfini: versReponse(plusInfini), moinsInfini: versReponse(moinsInfini) }, tousLisibles(lire, [pointPlus, pointMoins, plusInfini, moinsInfini].filter((e) => e.statut === "valeur").map((e) => e.texte)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={enonceLatex} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <GroupeLimite label={labels[0].latex} etat={pointPlus} erreur={montrerErreurs} onChange={setPointPlus} />
      <GroupeLimite label={labels[1].latex} etat={pointMoins} erreur={montrerErreurs} onChange={setPointMoins} />
      <GroupeLimite label={labels[2].latex} etat={plusInfini} erreur={montrerErreurs} onChange={setPlusInfini} />
      <GroupeLimite label={labels[3].latex} etat={moinsInfini} erreur={montrerErreurs} onChange={setMoinsInfini} />
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!tousComplets} onClick={valider}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
