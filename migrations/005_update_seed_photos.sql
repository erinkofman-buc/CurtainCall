-- Update seed listing photos with real Unsplash costume images
-- Also normalize category/condition values to use hyphens consistently

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=750&fit=crop"]'
WHERE title = 'Classical White Swan Tutu';

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&h=750&fit=crop"]'
WHERE title = 'Red Jazz Competition Costume';

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=750&fit=crop"]'
WHERE title = 'Emerald Figure Skating Dress';

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&h=750&fit=crop"]'
WHERE title = 'Lyrical Contemporary Bodysuit';

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=750&fit=crop"]'
WHERE title = 'Musical Theatre Showgirl Set';

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=600&h=750&fit=crop"]'
WHERE title = 'Gymnastics Competition Leotard - Purple Galaxy';

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&h=750&fit=crop"]'
WHERE title = 'Tap Dance Tuxedo Costume';

UPDATE listings SET photos = '["https://images.unsplash.com/photo-1547153760-18fc86c45a60?w=600&h=750&fit=crop"]'
WHERE title = 'Ballroom Latin Dress - Fiery Orange';
