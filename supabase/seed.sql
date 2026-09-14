-- DROPS — donnees de demonstration (V4)
-- A executer une fois la table `offers` creee (0001_create_offers.sql).
-- Reproduit exactement les offres qui existaient dans src/data/offers.ts.

insert into public.offers
  (id, title, description, platform, store, category, image, original_price, current_price, starts_at, expires_at, url, accent, featured, trending, is_new)
values
  ('echoes-of-nova', 'Echoes of Nova', 'Une aventure spatiale contemplative, à garder définitivement dans ta bibliothèque pendant la période de l''offre.', 'PC', 'Epic Games', 'JEUX', '/images/echoes-of-nova.svg', 29.99, 0, null, '2026-10-18T18:00:00+02:00', '#demo-echoes-of-nova', 'lime', true, true, true),
  ('stream-signal', 'Stream Signal Pack', 'Regarde les streams partenaires pour débloquer ce pack cosmétique exclusif, sans achat requis.', 'AUTRES', 'Twitch', 'TWITCH DROPS', '/images/stream-signal.svg', null, 0, null, '2026-10-21T18:00:00+02:00', '#demo-stream-signal', 'violet', true, true, true),
  ('carbon-skin', 'Carbon Skin', 'Un habillage métallisé au style minimal, disponible gratuitement pendant une durée limitée.', 'PLAYSTATION', 'PlayStation', 'ITEMS', '/images/carbon-skin.svg', 14.99, 0, null, '2026-10-24T18:00:00+02:00', '#demo-carbon-skin', 'blue', true, true, false),
  ('rift-runner', 'Rift Runner', 'Découvre Rift Runner et tout son contenu principal gratuitement jusqu''à la fin du week-end.', 'XBOX', 'Xbox', 'WEEK-END GRATUIT', '/images/rift-runner.svg', 22.98, 0, null, '2026-10-26T18:00:00+02:00', '#demo-rift-runner', 'orange', true, true, false),
  ('signal-archive', 'Signal Archive DLC', 'Une extension narrative courte à récupérer et conserver dans ta bibliothèque Steam.', 'PC', 'Steam', 'DLC', '/images/stream-signal.svg', 9.99, 0, null, '2026-10-30T17:00:00+02:00', '#demo-signal-archive', 'violet', false, false, true),
  ('creator-crown', 'Creator Crown', 'Un accessoire de collection gratuit créé pour la communauté, disponible pendant cette campagne.', 'AUTRES', 'Roblox', 'ITEMS', '/images/carbon-skin.svg', 7.99, 0, null, '2026-10-28T17:00:00+02:00', '#demo-creator-crown', 'blue', false, false, true),
  ('nightfall-protocol', 'Nightfall Protocol', 'Un jeu d''infiltration nocturne qui deviendra gratuit prochainement, à ajouter à ta liste de surveillance.', 'XBOX', 'Xbox', 'JEUX', '/images/rift-runner.svg', 19.99, 0, '2026-09-20T18:00:00+02:00', '2026-10-04T18:00:00+02:00', '#demo-nightfall-protocol', 'orange', false, false, false),
  ('vault-breaker-skin', 'Vault Breaker Skin', 'Un skin métallique qui sera offert prochainement sur Steam pendant une durée limitée.', 'PC', 'Steam', 'ITEMS', '/images/carbon-skin.svg', 12.99, 0, '2026-09-17T18:00:00+02:00', '2026-09-24T18:00:00+02:00', '#demo-vault-breaker-skin', 'blue', false, false, false)
on conflict (id) do nothing;
