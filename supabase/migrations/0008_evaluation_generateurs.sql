-- =================================================================================================
-- Math-Belgium — carnet : générateurs choisis pour une évaluation annoncée
-- =================================================================================================
--
-- À coller APRÈS 0007_devoirs_evaluations.sql (il suppose 0001 à 0007 déjà exécutés : séances et
-- leurs colonnes d'évaluation), dans l'éditeur SQL du projet Supabase (SQL Editor → New query →
-- coller TOUT ce fichier → Run). Idempotent : le relancer ne casse rien et ne perd aucune donnée
-- (colonne `add column if not exists`, contrainte ajoutée seulement si absente). Aucune clé secrète,
-- aucun jeton, aucun mot de passe : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /carnet : dans « Noter la séance »,
-- bloc « Évaluation », les exercices décochés sous chaque section de « Matière » sont gardés avec la
-- séance (Supabase peut mettre quelques secondes à voir la nouvelle colonne). Tant que ce fichier
-- n'est pas exécuté, le carnet marche comme avant : le choix des exercices ne vaut que pour le lien
-- « Préparer l'évaluation » ouvert depuis le panneau, et n'est pas gardé.
--
-- Contenu (AUCUNE donnée d'élève : des identifiants d'exercices) :
--   seances  + evaluation_generateurs : générateurs retenus pour l'évaluation (identifiants gen7,
--              5gen48, 6gen13…), parmi ceux des sections évaluées. Tableau vide = tous les
--              générateurs des sections évaluées (règle d'avant cette colonne : rien à migrer).
--   RLS      inchangé : les politiques de 0002 couvrent déjà toutes les colonnes de `seances`
--            (proprietaire = auth.uid() et compte actif, pour TOUTES les opérations ; `anon` n'a
--            aucun droit). Rien n'est ouvert à l'administrateur.
-- =================================================================================================

alter table public.seances add column if not exists evaluation_generateurs jsonb not null default '[]'::jsonb;

do $$
begin
  -- Même limite que les exercices joints au devoir (0007) : 100 identifiants de 40 caractères au plus.
  if not exists (select 1 from pg_constraint where conname = 'seances_evaluation_generateurs_valides' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_evaluation_generateurs_valides
      check (public.tableau_de_textes(evaluation_generateurs, 100, 40));
  end if;
  -- Sans évaluation : aucun générateur retenu (comme les parties évaluées, contrainte de 0007).
  if not exists (select 1 from pg_constraint where conname = 'seances_evaluation_generateurs_coherents' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_evaluation_generateurs_coherents
      check (evaluation_type is not null or evaluation_generateurs = '[]'::jsonb);
  end if;
end;
$$;

comment on column public.seances.evaluation_generateurs is 'Générateurs retenus pour l''évaluation (identifiants), parmi ceux des sections évaluées ; vide = tous.';

-- Droits et RLS : ceux de 0002 (aucun changement ; rappelés pour qu'une base où ils auraient été
-- modifiés à la main retrouve l'état attendu).
revoke all on public.seances from anon;
grant select, insert, update, delete on public.seances to authenticated;
alter table public.seances enable row level security;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
