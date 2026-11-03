import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { CONSIGNE_GENERALE } from "../ui6e/formatLimitesLogarithmiques";
import type { FragmentConsigne } from "../ui6e/formatLimitesLogarithmiques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: FragmentConsigne[];
  enonceLatex: string;
  /** `null` sur le tout premier écran de chaque famille (rien à rappeler) — voir
   * `ui6e/formatLimitesLogarithmiques.ts::etatActuel`. */
  etatActuel: string[] | null;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs de la dernière saisie refusée — distingue une erreur de syntaxe
   * (`parse_error`) d'une réponse fausse dans le message affiché. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran GÉNÉRIQUE à un seul champ texte libre (`6gen17`) — réutilisé par tous les écrans à
 * réponse en expression/valeur libre (famille B). `App6gen17.tsx` doit le rendre avec une `key`
 * qui change à chaque exercice et à chaque écran. Même patron que `EtapeChampLimiteExpo.tsx` (6gen6). */
export function EtapeChampLimiteLog({ consigneEcran, enonceLatex, etatActuel, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  /** Dernière saisie REFUSÉE — le champ n'est rouge que tant qu'il la contient encore. */
  const [soumis, setSoumis] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && soumis !== null;
  const statut = montrerErreurs && diagnostiquer ? diagnostiquer(soumis as string) : null;

  function valider() {
    if (texte.trim() === "") return;
    setSoumis(texte);
    onValider(texte);
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
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <input type="text" className={`text-input ${montrerErreurs && texte === soumis ? "is-erronee" : ""}`} value={texte} placeholder={placeholder} onChange={(e) => setTexte(e.target.value)} />
      </div>
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
