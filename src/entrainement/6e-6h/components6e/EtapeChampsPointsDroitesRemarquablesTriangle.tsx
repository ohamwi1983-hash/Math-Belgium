import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, DefinitionEcran } from "../ui6e/formatPointsDroitesRemarquablesTriangle";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  definition: DefinitionEcran;
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

const MAX_LIGNES_LISTE = 4;

/**
 * Écran GÉNÉRIQUE unique pour `6gen54` — mirroir `EtapeChampsDenombrementFondamental.tsx` (6gen43)
 * étendu à 2 besoins propres à ce générateur (voir en-tête `ui6e/formatPointsDroitesRemarquablesTriangle.ts`) :
 * un champ `"choixMultiple"` (plusieurs boutons `.btn.toggle-active` activables simultanément —
 * famille E, écran 1) et un mode `"liste"` add-as-needed complet (nombre de lignes VARIABLE, croix
 * rouge `×` pour retirer, jamais un bouton texte "Retirer" — mirroir
 * `EtapeListeDecompositionsDenombrementCombinatoirePur.tsx`, 6gen46) pour un nombre de solutions
 * pas connu à l'avance par l'élève (famille C, écrans 2-3). AUCUN JSX par famille/écran : tout
 * passe par `definition: DefinitionEcran`.
 *
 * **Convention CLAUDE.md respectée à la lettre** : tout champ, choix ou texte, reste en layout
 * `.field` STACKÉ (label au-dessus), jamais `.field-inline` — certains libellés de ce générateur
 * ("Relation pour A", "Construction(s) possible(s)"...) sont plus descriptifs que le style "x="
 * historique de 6gen43, donc `.field-inline` (qui force `white-space:nowrap` et déborde sur mobile)
 * est banni ici sans exception, y compris pour les champs courts.
 */
export function EtapeChampsPointsDroitesRemarquablesTriangle({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, definition, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      {definition.kind === "champs" ? (
        <BlocChamps
          champs={definition.champs}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={onValider}
          diagnostiquer={diagnostiquer}
          aideNiveau1={aideNiveau1}
          aideNiveau2={aideNiveau2}
        />
      ) : (
        <BlocListe
          forme={definition.forme}
          label={definition.label}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={onValider}
          diagnostiquer={diagnostiquer}
          aideNiveau1={aideNiveau1}
          aideNiveau2={aideNiveau2}
        />
      )}
    </div>
  );
}

interface BlocCommunProps {
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
}

function BlocAide({ niveauAide, niveauAideMax, onActiverAide, aideNiveau1, aideNiveau2 }: Pick<BlocCommunProps, "niveauAide" | "niveauAideMax" | "onActiverAide" | "aideNiveau1" | "aideNiveau2">) {
  return (
    <>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
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
    </>
  );
}

function BlocChamps({ champs, tentativesUtilisees, tentativesMax, diagnostiquer, onValider, ...aide }: BlocCommunProps & { champs: import("../ui6e/formatPointsDroitesRemarquablesTriangle").ChampDef[] }) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  function toggleChoixMultiple(index: number, optionValeur: string) {
    setValeurs((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const actuels = v.split(",").filter((s) => s !== "");
        const sansOption = actuels.filter((s) => s !== optionValeur);
        const nouveaux = sansOption.length === actuels.length ? [...actuels, optionValeur] : sansOption;
        return nouveaux.join(",");
      }),
    );
  }

  function valider() {
    if (!toutRempli) return;
    onValider(valeurs);
  }

  return (
    <div>
      <div className="field-row field-row-wrap">
        {champs.map((champ, i) => {
          if (champ.type === "choix") {
            return (
              <div className="field" key={i}>
                <label className="field-label field-label-minuscule">{champ.label}</label>
                <div className="field-row field-row-wrap">
                  {(champ.options ?? []).map((option) => (
                    <button key={option.valeur} type="button" className={`btn ${valeurs[i] === option.valeur ? "toggle-active" : ""} ${montrerErreurs && valeurs[i] === option.valeur ? "is-erronee" : ""}`} onClick={() => changer(i, option.valeur)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          if (champ.type === "choixMultiple") {
            const selection = valeurs[i].split(",").filter((s) => s !== "");
            return (
              <div className="field" key={i}>
                <label className="field-label field-label-minuscule">{champ.label}</label>
                <div className="field-row field-row-wrap">
                  {(champ.options ?? []).map((option) => (
                    <button key={option.valeur} type="button" className={`btn ${selection.includes(option.valeur) ? "toggle-active" : ""} ${montrerErreurs ? "is-erronee" : ""}`} onClick={() => toggleChoixMultiple(i, option.valeur)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
            </div>
          );
        })}
      </div>
      <BlocAide {...aide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
    </div>
  );
}

function ligneVide(forme: "valeur" | "point"): string[] {
  return forme === "point" ? ["", ""] : [""];
}

function BlocListe({ forme, label, tentativesUtilisees, tentativesMax, diagnostiquer, onValider, ...aide }: BlocCommunProps & { forme: "valeur" | "point"; label: string }) {
  const [lignes, setLignes] = useState<string[][]>(() => [ligneVide(forme)]);
  const montrerErreurs = tentativesUtilisees > 0;

  function valeursCourantes(): string[] {
    return lignes.flat();
  }

  const dernierStatut = montrerErreurs ? diagnostiquer(valeursCourantes()) : null;
  const toutRempli = lignes.every((ligne) => ligne.every((v) => v.trim() !== ""));

  function modifier(indexLigne: number, indexChamp: number, valeur: string) {
    setLignes((prev) => prev.map((ligne, i) => (i === indexLigne ? ligne.map((v, j) => (j === indexChamp ? valeur : v)) : ligne)));
  }

  function ajouter() {
    setLignes((prev) => (prev.length >= MAX_LIGNES_LISTE ? prev : [...prev, ligneVide(forme)]));
  }

  function retirer(indexLigne: number) {
    setLignes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== indexLigne) : prev));
  }

  function valider() {
    if (!toutRempli) return;
    onValider(valeursCourantes());
  }

  return (
    <div>
      <div className="field">
        <label className="field-label field-label-minuscule">{label}</label>
        {lignes.map((ligne, i) => (
          <div key={i} className="field-row">
            {ligne.map((valeur, j) => (
              <input
                key={j}
                type="text"
                className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
                value={valeur}
                placeholder={forme === "point" ? (j === 0 ? "x" : "y") : "ex : 2"}
                onChange={(e) => modifier(i, j, e.target.value)}
              />
            ))}
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la ligne ${i + 1}`} onClick={() => retirer(i)}>
                ×
              </button>
            )}
          </div>
        ))}
        {lignes.length < MAX_LIGNES_LISTE && (
          <button type="button" className="btn" onClick={ajouter}>
            + Ajouter
          </button>
        )}
      </div>
      <BlocAide {...aide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
    </div>
  );
}
