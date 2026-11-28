import { useEffect, useId, useRef } from "react";
import type { Block, ChapterContent, ChapterSection } from "../../content/types";
import { ModeLiensChapitre, RichText } from "../../components/Math";
import { phrasesRappel } from "../../lib/prerequisChapitre";
import type { PrerequisResolu } from "../../lib/prerequisChapitre";
import { Essentiel, ExempleLibrePasAPas, ExemplePasAPas } from "../../components/chapter/ContenuEtape";

/**
 * Calque « Je bloque » (voir `JeBloque.tsx`) : `<dialog>` natif ouvert par `showModal()` (focus piégé par
 * le navigateur, Échap ferme, clic sur le voile ferme, focus rendu au bouton) ; feuille du bas sur
 * téléphone, panneau à droite sur ordinateur. L'exercice reste dessous, intact : on y revient en
 * fermant. Contenu : l'exemple résolu de l'étape, révélé pas à pas avec les composants du cours
 * (`ExemplePasAPas` / `ExempleLibrePasAPas`, comme le tiroir d'exemple de l'étape) — à défaut
 * d'exemple, « L'essentiel » de l'étape — et le lien « Revoir l'étape » (nouvel onglet).
 */
export default function PanneauJeBloque({
  ouvert,
  fermer,
  chapitre,
  section,
  numero,
  bloc,
  prerequis,
}: {
  ouvert: boolean;
  fermer: () => void;
  chapitre: ChapterContent;
  section: ChapterSection;
  numero: number;
  bloc: Extract<Block, { kind: "exemple" | "exempleLibre" }> | null;
  prerequis: PrerequisResolu[];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titreId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouvert && !d.open) {
      try {
        d.showModal();
      } catch {
        d.setAttribute("open", "");
      }
    } else if (!ouvert && d.open) d.close();
  }, [ouvert]);

  const lien = `/${chapitre.levelSlug}/${chapitre.slug}#${section.id}`;
  const titreExemple = bloc ? (bloc.kind === "exemple" ? `Exemple résolu${bloc.badge ? ` : ${bloc.badge}` : ""}` : (bloc.label ?? "Exemple résolu")) : null;

  return (
    <dialog
      ref={ref}
      className="je-bloque-panneau no-export"
      aria-labelledby={titreId}
      onClose={fermer}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      {ouvert && (
        <div className="je-bloque-contenu">
          <div className="je-bloque-entete">
            <h2 id={titreId}>Tu bloques ? C’est normal.</h2>
            <button type="button" className="je-bloque-fermer" onClick={() => ref.current?.close()}>
              Fermer <span aria-hidden="true">✕</span>
            </button>
          </div>
          <ModeLiensChapitre.Provider value="nouvel-onglet">
          <div className="je-bloque-corps">
            <p className="je-bloque-texte">
              Deux essais sans réussir : revois {bloc ? "l’exemple résolu" : "l’essentiel"} de ce point du cours. Ton exercice t’attend ici, rien n’est perdu.
            </p>
            <p className="je-bloque-etape">
              Point {numero} · <RichText text={section.title} />
            </p>
            {bloc ? (
              <section className="je-bloque-exemple" aria-label={titreExemple ?? "Exemple résolu"}>
                <p className="je-bloque-exemple-titre">{titreExemple}</p>
                {bloc.kind === "exemple" ? <ExemplePasAPas bloc={bloc} /> : <ExempleLibrePasAPas bloc={bloc} />}
              </section>
            ) : section.essentiel && section.essentiel.length > 0 ? (
              <Essentiel phrases={section.essentiel} />
            ) : (
              <p className="je-bloque-texte">Ce point n’a pas d’exemple résolu : relis-le dans le cours.</p>
            )}
            {prerequis.length > 0 && (
              <section className="je-bloque-besoin" aria-label="Tu as besoin de…">
                <p className="je-bloque-besoin-titre">Tu as besoin de…</p>
                <ul>
                  {prerequis.map((p) => (
                    <li key={p.entree.cible}>
                      <p className="je-bloque-besoin-nom">
                        {p.cible.titreEtape}
                        <span className="je-bloque-besoin-ou">{`«\u00a0${p.cible.chapitre.title}\u00a0», point\u00a0${p.cible.numero}`}</span>
                      </p>
                      {phrasesRappel(p).map((t, i) => (
                        <p key={i} className="je-bloque-besoin-rappel">
                          <RichText text={t} />
                        </p>
                      ))}
                      <a className="je-bloque-besoin-revoir" href={p.cible.href} target="_blank" rel="noopener">
                        Revoir le point <span className="je-bloque-onglet">(nouvel onglet)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          </ModeLiensChapitre.Provider>
          <div className="je-bloque-actions">
            <a className="btn je-bloque-revoir" href={lien} target="_blank" rel="noopener">
              Revoir le point {numero} <span className="je-bloque-onglet">(nouvel onglet)</span>
            </a>
            <button type="button" className="btn btn-retour-exercice" onClick={() => ref.current?.close()}>
              Retour à l’exercice
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
