import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatLoiNormale";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  champs: ChampDef[];
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

/**
 * Écran GÉNÉRIQUE à N champs (1 à 4), mélangeant `"texte"` (saisie libre) et `"choix"` (boutons
 * `.btn.toggle-active`, jamais de texte libre) pour `6gen51` — mirroir `EtapeChampsCalculAires.tsx`
 * (6gen26). C'est CE composant, et non un composant QCM dédié séparé, qui porte les écrans de
 * "reformulation" des familles A/C/D (un champ `choix` pour la transformation + un champ `texte`
 * pour la valeur numérique — voir en-tête `generateurs6e/loiNormale/familleA.ts` pour la
 * justification de ce choix de conception plutôt qu'un composant QCM séparé façon
 * `EtapeChoixCongruenceFormeTrigonometrique.tsx`, qui n'aurait pas pu porter le champ numérique
 * associé sur le même écran). Structure d'écran imposée par CLAUDE.md (consigne générale → bloc
 * données → état actuel → bloc de travail) conservée à l'identique. `App6gen51.tsx` doit le rendre
 * avec `key={phase}`.
 */
export function EtapeChampsLoiNormale({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

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
      <div className={`field-row ${champs.length > 1 ? "field-row-wrap" : ""}`}>
        {champs.map((champ, i) =>
          champ.type === "choix" ? (
            // `.field` TOUJOURS empilé (label AU-DESSUS), JAMAIS `.field-inline` — même règle que
            // `EtapeChampsVariablesDiscretesEsperance.tsx`/`EtapeChampsLoiBinomiale.tsx`/`EtapeChamps
            // LoiPoisson.tsx`/`EtapeChampsExtensionsBinomialeNormaleBayes.tsx` ("leçon dure de la
            // revue 6gen44") : l'ancien `field-inline`+`flexWrap:"wrap"` réglait le débordement
            // horizontal (le groupe de boutons de CE générateur, 2 à 3 options "Directe"/"Symétrique"/
            // "Encadrée", pouvait dépasser 375px à côté du label) en repliant le label ET le groupe de
            // boutons chacun sur sa propre ligne — un simple `.field` empilé obtient le même résultat
            // plus directement, ET permet la grille `.options-grid` (2 colonnes, convention
            // transversale CLAUDE.md pour tout bouton de choix) sans risque de largeur indéfinie dans
            // un contexte flex.
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <div className="options-grid">
                {(champ.options ?? []).map((option) => (
                  <button key={option.valeur} type="button" className={`btn ${valeurs[i] === option.valeur ? "toggle-active" : ""} ${montrerErreurs && valeurs[i] === option.valeur ? "is-erronee" : ""}`} onClick={() => changer(i, option.valeur)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={champs.length > 1 ? "field field-inline" : "field"} key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
            </div>
          ),
        )}
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
        <div className="aide-5e contenu-conditionnel">
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
