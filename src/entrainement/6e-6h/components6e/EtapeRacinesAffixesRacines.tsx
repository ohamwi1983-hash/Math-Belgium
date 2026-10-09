import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex } from "../ui6e/formatAffixesRacines";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  diagnostiquer: (textes: string[]) => StatutVerification;
}

/**
 * Écran add-as-needed pour `6gen35`, famille C écran 3 UNIQUEMENT ("donne les 2 racines
 * ±(x+yi)") — adapté de `EtapeRacinesCalculAires.tsx` (6gen26, patron add-as-needed établi) en y
 * ajoutant le fil `diagnostiquer` (StatutVerification, convention CLAUDE.md sur tout champ de
 * saisie libre — absent de l'original 6gen26, ajouté ICI pour distinguer un `parse_error` d'un
 * `not_equivalent` dans le message affiché, mirroir `EtapeChampsAffixesRacines.tsx`). Démarre à 2
 * lignes (PAS 1 — le piège central de la spec est qu'une racine carrée complexe non nulle a
 * TOUJOURS 2 solutions ; démarrer à 1 ligne suggérerait visuellement qu'une seule pourrait
 * suffire), une croix rouge `×` pour retirer une ligne (jamais un bouton texte "Retirer"), jusqu'à 4
 * lignes (largement suffisant : la cible n'a jamais plus de 2 valeurs, la marge sert seulement à
 * corriger une saisie sans tout effacer). `App6gen35.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeRacinesAffixesRacines({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>(() => ["", ""]);
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(lignes) : null;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    if (lignes.length >= 4) return;
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      </div>
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
      <div className="contenu-conditionnel">
        {lignes.map((ligne, i) => (
          <div key={i}>
            <ApercuExpressionLatex texte={ligne} />
            <div className="field-row">
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder="ex : 2+i" onChange={(e) => modifierLigne(i, e.target.value)} />
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la racine ${i + 1}`} onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        {lignes.length < 4 && (
          <button type="button" className="btn" onClick={ajouterLigne}>
            + Ajouter une racine
          </button>
        )}
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
