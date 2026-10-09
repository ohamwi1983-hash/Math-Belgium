import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex } from "../ui6e/formatProbabilitesProblemes";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
}

/** Écran "liste de configurations" (add-as-needed, taille VARIABLE) pour `6gen33`, famille C écran 1
 * UNIQUEMENT — pattern "pas de X / bouton d'ajout" imposé par CLAUDE.md pour tout ensemble de taille
 * variable choisie par l'élève (ici : combien de configurations distinctes existent pour "exactement
 * k succès parmi 3", l'élève doit le déterminer lui-même). Même mécanique à 3 états que la liste
 * "prive_points" d'`EnsembleReelGuideBuilder.tsx` (croix rouge `×` pour retirer, jamais un bouton
 * texte "Retirer" — CLAUDE.md), adaptée en écran autonome (son propre bouton "Valider"/aide, pas un
 * sous-composant remonté par `onChange`). `App6gen33.tsx` doit le rendre avec `key={phase}`. */
export function EtapeListeConfigurationsProbabilitesProblemes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.length > 0 && valeurs.every((v) => v.trim() !== "");

  function valider() {
    if (!toutRempli) return;
    onValider(valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      {blocDonnees.length > 0 && (
        <div className="equation-box">
          <div className="equation-box-donnees">
            {blocDonnees.map((frag, i) => (
              <Katex key={i} expression={frag} block />
            ))}
          </div>
        </div>
      )}
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <div className="liste-morceaux contenu-conditionnel">
        {valeurs.map((v, i) => (
          <div key={i} className="liste-morceaux-ligne">
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} placeholder={placeholder} value={v} onChange={(e) => changer(i, e.target.value)} />
            {valeurs.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la configuration ${i + 1}`} onClick={() => setValeurs((prev) => prev.filter((_, j) => j !== i))}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn liste-morceaux-ajouter" onClick={() => setValeurs((prev) => [...prev, ""])}>
          + Ajouter une configuration
        </button>
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
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
