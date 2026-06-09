INSERT INTO store_settings (key, value) 
VALUES ('notification_sound', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3')
ON CONFLICT (key) DO NOTHING;

INSERT INTO store_settings (key, value) 
VALUES ('notification_sounds', '[{"name": "Clássico", "url": "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"}, {"name": "Sino Moderno", "url": "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"}, {"name": "Suave", "url": "https://assets.mixkit.co/active_storage/sfx/2566/2566-preview.mp3"}]')
ON CONFLICT (key) DO NOTHING;