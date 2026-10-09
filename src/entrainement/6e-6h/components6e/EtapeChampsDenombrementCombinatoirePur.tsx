import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatDenombrementCombinatoirePur";
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
 * Écran GÉNÉRIQUE à N champs (texte libre ET/OU choix) pour `6gen46` — mirroir EXACT de
 * `EtapeChampsDenombrementCombine.tsx` (6gen44), lui-même déjà corrigé du piège
 * `.field-inline`/CHOIX documenté par CLAUDE.md ("CRITIQUE, bug fraîchement découvert dans la revue
 * de 6gen44 : si un écran a besoin de 2+ champs CHOIX simultanés avec labels longs, ne JAMAIS
 * utiliser `.field-inline` pour ces champs — `.field-inline .field-label` force `white-space:
 * nowrap`, déborde en mobile") : un champ `type==="choix"` reçoit TOUJOURS la classe simple
 * `"field"` (jamais `"field field-inline"`, quel que soit `champs.length`), seuls les champs texte
 * gardent le comportement `field-inline` conditionnel existant. Ce générateur n'a jamais 2 champs
 * choix simultanés sur le même écran (au plus 1, famille D écran 3), mais le patron corrigé est
 * répliqué à l'identique par prudence/cohérence inter-générateurs.
 *
 * `champs: ChampDef[]` (`ui6e/formatDenombrementCombinatoirePur.ts`) pilote entièrement le rendu —
 * AUCUN JSX par famille/écran dans ce composant. Structure d'écran imposée par CLAUDE.md (consigne
 * générale → bloc données → état actuel → bloc de travail) conservée à l'identique. Jamais utilisé
 * pour `dEcran1` (famille D écran 1 — 2 listes add-as-needed, composant dédié
 * `EtapeListeDecompositionsDenombrementCombinatoirePur.tsx`). `App6gen46.tsx` doit le rendre avec
 * `key={phase}`.
 */
export function EtapeChampsDenombrementCombinatoirePur({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <div className="options-grid-compact">
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
