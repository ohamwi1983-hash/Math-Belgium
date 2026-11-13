import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Aide } from "../ui/formatResoudreTriangle";
import { messageStatut } from "../ui/formatResoudreTriangle";
import type { StatutChamp } from "../moteur/verificationResoudreTriangle";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écrans de gen73 (« Résoudre complètement un triangle ») : choix fermés (configuration, première
 * loi — UNE tentative) et champs numériques (calculs, contrôle — 3 tentatives, jamais de blocage de
 * frappe, règle CLAUDE.md). Aucun point affiché.
 */

/** Une ligne d'aide : la formule qui suit une phrase terminée par « : » passe en affichage. */
function LigneAide({ fragments }: { fragments: FragmentConsigne[] }) {
  const dernier = fragments[fragments.length - 1];
  const avant = fragments[fragments.length - 2];
  const formuleFinale = fragments.length > 1 && dernier?.type === "latex" && avant?.type === "texte" && avant.valeur.trimEnd().endsWith(":");
  if (!formuleFinale) {
    return (
      <p>
        <RenduFragments fragments={fragments} />
      </p>
    );
  }
  return (
    <>
      <p>
        <RenduFragments fragments={fragments.slice(0, -1)} />
      </p>
      <Katex expression={dernier.valeur} block />
    </>
  );
}

interface PropsAides {
  aides: Aide[];
  niveauAide: number;
  onActiverAide: () => void;
}

export function BlocAides({ aides, niveauAide, onActiverAide }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          {aide.map((ligne, j) => (
            <LigneAide key={j} fragments={ligne} />
          ))}
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Choix fermés (écrans 1 et 2)
// ---------------------------------------------------------------------------------------------

export interface OptionChoix<T extends string> {
  id: T;
  label: ReactNode;
}

interface GroupeChoix<T extends string> {
  question?: ReactNode;
  options: OptionChoix<T>[];
  /** Bonne réponse : sert seulement à marquer l'erreur une fois l'écran clos. */
  attendu: T;
}

interface PropsChoix<T extends string, U extends string> extends PropsAides {
  consigne: ReactNode;
  groupe: GroupeChoix<T>;
  /** Second choix éventuel (3 côtés : pour quel angle ?). */
  groupeSecondaire?: GroupeChoix<U>;
  onValider: (choix: T, secondaire: U | null) => void;
  validation?: ValidationEtapeProps | null;
}

function Options<T extends string>({ groupe, choix, onChoisir, fige }: { groupe: GroupeChoix<T>; choix: T | null; onChoisir: (id: T) => void; fige: boolean }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {groupe.question && <p style={{ margin: 0 }}>{groupe.question}</p>}
      <div className="options-grid" style={{ margin: 0 }}>
        {groupe.options.map((o) => {
          const choisi = choix === o.id;
          const faux = fige && choisi && groupe.attendu !== o.id;
          return (
            <button key={o.id} type="button" disabled={fige} aria-pressed={choisi} className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`} onClick={() => onChoisir(o.id)}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EtapeChoixResoudreTriangle<T extends string, U extends string>({ consigne, groupe, groupeSecondaire, onValider, validation, ...aides }: PropsChoix<T, U>) {
  const [choix, setChoix] = useState<T | null>(null);
  const [secondaire, setSecondaire] = useState<U | null>(null);
  const fige = !!validation;
  const complet = choix !== null && (!groupeSecondaire || secondaire !== null);
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 14, margin: "12px 0" }}>
        <Options groupe={groupe} choix={choix} onChoisir={setChoix} fige={fige} />
        {groupeSecondaire && <Options groupe={groupeSecondaire} choix={secondaire} onChoisir={setSecondaire} fige={fige} />}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(choix!, secondaire)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Champs numériques (écrans 3 et 4)
// ---------------------------------------------------------------------------------------------

export interface ChampNumerique {
  libelle: FragmentConsigne[];
  unite: string;
}

interface PropsChamps extends PropsAides {
  consigne: ReactNode;
  champs: ChampNumerique[];
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative (un par champ), `null` avant la première. */
  statuts: StatutChamp[] | null;
  /** Une valeur illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
  idBase: string;
}

export function EtapeChampsResoudreTriangle({ consigne, champs, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, idBase, ...aides }: PropsChamps) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");
  const fautifs = statuts ? statuts.map((s, i) => ({ s, i })).filter(({ s }) => s !== "correct") : [];
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 12, margin: "12px 0" }}>
        {champs.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== "correct";
          return (
            <div key={i} className="field" style={{ margin: 0 }}>
              <label className="field-label field-label-minuscule" htmlFor={`${idBase}-${i}`}>
                <RenduFragments fragments={champ.libelle} />
              </label>
              <div className="champ-avec-unite">
                <input
                  id={`${idBase}-${i}`}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={saisies[i]}
                  disabled={fige}
                  onChange={(ev) => {
                    const v = normaliserSigneMoins(ev.target.value);
                    setSaisies((s) => s.map((x, j) => (j === i ? v : x)));
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
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre décimal, avec une virgule (par exemple 12,35). Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {champs.length > 1 && fautifs.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {fautifs.map(({ s, i }) => (
                      <li key={i}>
                        <RenduFragments fragments={champs[i]!.libelle.slice(0, 2)} />
                        {` : ${messageStatut(s)}.`}
                      </li>
                    ))}
                  </ul>
                )}
                {champs.length === 1 && fautifs[0] && <p style={{ margin: "6px 0 0" }}>{`${messageStatut(fautifs[0].s).replace(/^./, (c) => c.toUpperCase())}.`}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
