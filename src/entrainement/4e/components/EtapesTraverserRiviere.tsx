import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ChampEcran } from "../ui/formatTraverserRiviere";
import type { StatutChamp } from "../moteur/verificationTraverserRiviere";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran de saisie de gen87 (« Traverser une rivière ») : un ou deux champs libres (les deux
 * composantes de la vitesse réelle, ou une seule grandeur), chacun suivi de son unité fixe. Jamais
 * de blocage de frappe (règle CLAUDE.md) : seule `normaliserSigneMoins` transforme la saisie. Après
 * une tentative fausse, seul le champ fautif est marqué. Aucun point affiché.
 */

interface Props {
  consigne: ReactNode;
  champs: ChampEcran[];
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statut de chaque champ à la dernière tentative fausse (`null` avant). */
  statuts: StatutChamp[] | null;
  /** Message ciblé de la dernière tentative fausse, ou `null`. */
  messageErreur: string | null;
  /** Saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (textes: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeSaisieTraverserRiviere({
  consigne,
  champs,
  aides,
  niveauAide,
  onActiverAide,
  tentativesUtilisees,
  tentativesMax,
  statuts,
  messageErreur,
  erreurLecture,
  onValider,
  validation,
}: Props) {
  const [textes, setTextes] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = textes.every((t) => t.trim() !== "");
  const avecRacine = champs.some((c) => c.racine);

  function valider() {
    if (complet && !fige) onValider(textes);
  }

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }}>
        {champs.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== "correct";
          const id = `riviere-saisie-${i}`;
          return (
            <div key={champ.grandeur} className="field" style={{ margin: 0 }}>
              <label className="field-label field-label-minuscule" htmlFor={id} style={{ fontSize: "1.15em" }}>
                <RenduFragments fragments={champ.libelle} />
              </label>
              <div className="champ-avec-unite">
                <input
                  id={id}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  placeholder={champ.placeholder}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={textes[i]}
                  disabled={fige}
                  onChange={(ev) => {
                    const valeur = normaliserSigneMoins(ev.target.value);
                    setTextes((t) => t.map((x, j) => (j === i ? valeur : x)));
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") valider();
                  }}
                />
                <span className="champ-avec-unite-suffixe">{champ.unite}</span>
              </div>
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {avecRacine ? "Un nombre (virgule acceptée), ou la valeur exacte avec une racine : rac(13)." : "Un nombre, virgule acceptée."}
          </p>
          <div>
            {aides.slice(0, niveauAide).map((aide, i) => (
              <div key={i} className="triangle-quelconque-aide">
                <p>
                  <RenduFragments fragments={aide} />
                </p>
              </div>
            ))}
            <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
          </div>
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Valeur illisible : écris un nombre, par exemple 2,5{avecRacine ? ", ou une racine comme rac(13)" : ""}. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {messageErreur && <p style={{ margin: "6px 0 0" }}>{messageErreur}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
