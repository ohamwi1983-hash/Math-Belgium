import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Bouton « Voir comment on y arrive » qui déplie le corrigé détaillé « comme au tableau » d'un écran
 * DÉJÀ répondu (décision du professeur, 25/11/2026) : sous « Bonne réponse ! » (`ValidationEcran`,
 * écran clos non révélé) et dans la fiche d'une puce (`FicheReponseEcran`, réponse juste OU fausse).
 * Replié par défaut. `corrige` est le MÊME nœud que celui de l'écran (`ValidationEtapeProps.
 * corrigeDetaille` / `EntreeHistoriqueEtape.corrigeDetaille`), jamais une seconde source.
 *
 * Le contenu est rendu (caché) dès le départ : un corrigé qui ne produit rien à l'écran (ex.
 * `CorrigeDetailleEcran` sans aucune ligne pour cette étape) est détecté dans le DOM avant la
 * première peinture, et le bouton n'apparaît alors pas — jamais un bouton qui déplie du vide.
 */
export function CorrigeDepliable({ corrige }: { corrige: ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [vide, setVide] = useState(false);
  const contenuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    const el = contenuRef.current;
    if (!el) return;
    const estVide = el.firstElementChild === null && (el.textContent ?? "").trim() === "";
    setVide((avant) => (avant === estVide ? avant : estVide));
  });
  if (corrige === null || corrige === undefined || corrige === false) return null;
  return (
    <div className="corrige-depliable">
      {!vide && (
        <button
          type="button"
          className="btn corrige-depliable-bouton"
          aria-expanded={ouvert}
          aria-controls={id}
          onClick={() => setOuvert((o) => !o)}
        >
          <span>Voir comment on y arrive</span>
          <span className="corrige-depliable-chevron" aria-hidden="true" />
        </button>
      )}
      <div id={id} ref={contenuRef} className="corrige-depliable-contenu" hidden={!ouvert || vide}>
        {corrige}
      </div>
    </div>
  );
}
