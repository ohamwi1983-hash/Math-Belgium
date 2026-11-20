import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { ReponseConcavite } from "../moteur6e/verificationEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE, consigneConcavite } from "../ui6e/formatEtudeFonctionExponentielle";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesExpo, MESSAGES_ILLISIBLE_EXPO, MessageRetour, tousLisibles, useTentativeLisible } from "./RetourSaisieExpo";
import type { PropsRetourChamp } from "./RetourSaisieExpo";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const OPTIONS: { id: ReponseConcavite["type"]; label: string; requiertPosition: boolean }[] = [
  { id: "convexe_partout", label: "Convexe sur chaque intervalle du domaine", requiertPosition: false },
  { id: "concave_partout", label: "Concave sur chaque intervalle du domaine", requiertPosition: false },
  { id: "inflexion", label: "Un point d'inflexion", requiertPosition: true },
];

interface Props extends PropsRetourChamp<ReponseConcavite> {
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConcavite) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 5/6, "concavité" — COMMUN aux 4 familles (même contrat `CibleConcavite`). Nouveauté du
 * chapitre : l'aide niveau 1 rappelle TOUJOURS la méthode complète (signe de f'', voir
 * `ui6e/formatEtudeFonctionExponentielle.ts::aideConcaviteNiveau1`) — jamais seulement "la première
 * fois". `App6gen11.tsx` doit le rendre avec `key={indexExercice}`. Le domaine, les limites, les
 * asymptotes et la croissance confirmés aux 4 écrans précédents sont listés dans le récapitulatif
 * "Ce qu'on sait déjà" (`ui6e/recapitulatifEtudeFonctionExponentielle.ts`). */
export function EtapeConcavite({ enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, lire, messageIllisible, cible}: Props) {
  const [type, setType] = useState<ReponseConcavite["type"] | null>(null);
  const [position, setPosition] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const retour = useTentativeLisible<ReponseConcavite>();

  const requiertPosition = type === "inflexion";
  const complet = type !== null && (!requiertPosition || position.trim() !== "");

  function valider() {
    if (!complet || type === null) return;
    retour.tenter({ type, position }, !requiertPosition || tousLisibles(lire, [position]), onValider);
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
        <RenduFragments fragments={consigneConcavite()} />
      </p>
      <div className="options-liste-longue">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" className={`btn ${type === o.id ? "toggle-active" : ""} ${montrerErreurs && type === o.id ? "is-erronee" : ""}`} onClick={() => setType(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      {requiertPosition && (
        <>
          <ApercuExpressionLatex texte={position} />
          <div className="field contenu-conditionnel">
            <label className="field-label field-label-minuscule">Abscisse du point d'inflexion</label>
            <input type="text" className={`text-input ${montrerErreurs && position === retour.soumise?.position ? "is-erronee" : ""}`} value={position} placeholder="ex : 5/2" onChange={(e) => setPosition(e.target.value)} />
          </div>
        </>
      )}
      <AidesExpo aide1={aideNiveau1} aide2={aideNiveau2} niveauAide={niveauAide} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <MessageRetour illisible={retour.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} texteIllisible={messageIllisible ?? MESSAGES_ILLISIBLE_EXPO.expressionX} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
