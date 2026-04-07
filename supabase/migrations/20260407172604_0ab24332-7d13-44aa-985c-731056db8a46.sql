
-- Clear all existing collection items
DELETE FROM product_collection_items;

-- HARMATTAN SEASON (cold weather): hoodie, joggers, long sleeve, socks, durag, cap
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('61a8bca0-0b5d-4bec-a418-18965d83eb8c', 'e90577ab-b0b3-4c26-9d58-878ade860fc3', 0),
('61a8bca0-0b5d-4bec-a418-18965d83eb8c', 'e26c0ef7-0e56-4bf2-88c9-f71225395adc', 1),
('61a8bca0-0b5d-4bec-a418-18965d83eb8c', 'a8b3438a-37ed-4ddc-9627-28196c6c45c5', 2),
('61a8bca0-0b5d-4bec-a418-18965d83eb8c', 'fb22debe-c945-4bb0-8ae9-fad2b0cdf807', 3),
('61a8bca0-0b5d-4bec-a418-18965d83eb8c', '602e4957-e083-4636-9fdd-0920bd58fb02', 4),
('61a8bca0-0b5d-4bec-a418-18965d83eb8c', 'ff7f2c50-db35-47da-9384-fb827bcdd39d', 5);

-- RAINY SEASON: umbrella, water bottle, tote bag, face towel, bottle flask
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('f6c04f49-196d-4c07-b9f8-a2ac31cbc75b', '38727458-f686-479b-83b6-9f50e0c60af4', 0),
('f6c04f49-196d-4c07-b9f8-a2ac31cbc75b', 'a0caffde-dd01-447d-9d31-a439ba7185e2', 1),
('f6c04f49-196d-4c07-b9f8-a2ac31cbc75b', '3a23ae3c-20d6-4683-aa2e-ef0565bc89f6', 2),
('f6c04f49-196d-4c07-b9f8-a2ac31cbc75b', 'faaa263f-0139-4df1-a6ba-8071c33bc598', 3),
('f6c04f49-196d-4c07-b9f8-a2ac31cbc75b', '4611fa36-578d-49f0-bd9b-4e1d93af010a', 4);

-- DRY SEASON: tees, polo, caps
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('851fc050-7218-4945-b512-39ae7229bf1f', '826fa6f5-685f-4e03-b42b-0913c96970fe', 0),
('851fc050-7218-4945-b512-39ae7229bf1f', '31e76084-61ac-4047-afb2-373c3fdb3fa0', 1),
('851fc050-7218-4945-b512-39ae7229bf1f', '009bde43-b3d2-4b29-8224-ac8917080660', 2),
('851fc050-7218-4945-b512-39ae7229bf1f', '5a9678d3-029a-440c-975c-c52fc210f5dd', 3),
('851fc050-7218-4945-b512-39ae7229bf1f', '04e8cd9f-01ae-4f4a-a6a4-91add74283dc', 4),
('851fc050-7218-4945-b512-39ae7229bf1f', '34f2c324-1aa5-4beb-bf9e-4eb10d3b0520', 5),
('851fc050-7218-4945-b512-39ae7229bf1f', '50096d18-8bcd-4d34-af59-a828d949a8a7', 6);

-- FESTIVE SEASON: hoodie, polo, round neck, joggers, socks, phone case
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('2073f8cd-5a63-44e5-b403-e3fac9298b9f', 'e90577ab-b0b3-4c26-9d58-878ade860fc3', 0),
('2073f8cd-5a63-44e5-b403-e3fac9298b9f', '04e8cd9f-01ae-4f4a-a6a4-91add74283dc', 1),
('2073f8cd-5a63-44e5-b403-e3fac9298b9f', '826fa6f5-685f-4e03-b42b-0913c96970fe', 2),
('2073f8cd-5a63-44e5-b403-e3fac9298b9f', 'e26c0ef7-0e56-4bf2-88c9-f71225395adc', 3),
('2073f8cd-5a63-44e5-b403-e3fac9298b9f', 'fb22debe-c945-4bb0-8ae9-fad2b0cdf807', 4),
('2073f8cd-5a63-44e5-b403-e3fac9298b9f', '6d4e39ea-224c-497c-8611-bd9e16a133ce', 5);

-- GIFTS FOR MEN: hoodie, joggers, polo, cap, water bottle, durag
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('295e952c-c754-4b2e-ae4b-8c1cc7818d46', 'e90577ab-b0b3-4c26-9d58-878ade860fc3', 0),
('295e952c-c754-4b2e-ae4b-8c1cc7818d46', 'e26c0ef7-0e56-4bf2-88c9-f71225395adc', 1),
('295e952c-c754-4b2e-ae4b-8c1cc7818d46', '04e8cd9f-01ae-4f4a-a6a4-91add74283dc', 2),
('295e952c-c754-4b2e-ae4b-8c1cc7818d46', 'ff7f2c50-db35-47da-9384-fb827bcdd39d', 3),
('295e952c-c754-4b2e-ae4b-8c1cc7818d46', 'a0caffde-dd01-447d-9d31-a439ba7185e2', 4),
('295e952c-c754-4b2e-ae4b-8c1cc7818d46', '602e4957-e083-4636-9fdd-0920bd58fb02', 5);

-- GIFTS FOR WOMEN: tote bag, phone case, socks, face towel, mug, passport holder
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('a662d69d-6a1b-43bb-b93f-9cc181b3aa3e', '3a23ae3c-20d6-4683-aa2e-ef0565bc89f6', 0),
('a662d69d-6a1b-43bb-b93f-9cc181b3aa3e', '6d4e39ea-224c-497c-8611-bd9e16a133ce', 1),
('a662d69d-6a1b-43bb-b93f-9cc181b3aa3e', 'fb22debe-c945-4bb0-8ae9-fad2b0cdf807', 2),
('a662d69d-6a1b-43bb-b93f-9cc181b3aa3e', 'faaa263f-0139-4df1-a6ba-8071c33bc598', 3),
('a662d69d-6a1b-43bb-b93f-9cc181b3aa3e', 'ee9f6756-c112-4fb2-920c-bb1216f2d589', 4),
('a662d69d-6a1b-43bb-b93f-9cc181b3aa3e', '94e98a38-ec2a-4979-be1d-f781c3a2cce6', 5);

-- GIFTS FOR CHILDREN: slogan tees, socks, flag cap, baseball cap
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('ccb0f249-efa3-4070-846d-1a6f4aee61fe', '31e76084-61ac-4047-afb2-373c3fdb3fa0', 0),
('ccb0f249-efa3-4070-846d-1a6f4aee61fe', '009bde43-b3d2-4b29-8224-ac8917080660', 1),
('ccb0f249-efa3-4070-846d-1a6f4aee61fe', '5a9678d3-029a-440c-975c-c52fc210f5dd', 2),
('ccb0f249-efa3-4070-846d-1a6f4aee61fe', 'fb22debe-c945-4bb0-8ae9-fad2b0cdf807', 3),
('ccb0f249-efa3-4070-846d-1a6f4aee61fe', '34f2c324-1aa5-4beb-bf9e-4eb10d3b0520', 4),
('ccb0f249-efa3-4070-846d-1a6f4aee61fe', 'a8d9bff6-5948-4301-993e-fbeac2d47314', 5);

-- GIFTS FOR DIGNITARIES: polo, passport holder, notepad, mug, keychain, bottle flask
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('c5493aed-fd59-4914-b8f0-0291c635ceaf', '04e8cd9f-01ae-4f4a-a6a4-91add74283dc', 0),
('c5493aed-fd59-4914-b8f0-0291c635ceaf', '94e98a38-ec2a-4979-be1d-f781c3a2cce6', 1),
('c5493aed-fd59-4914-b8f0-0291c635ceaf', '080b06b9-e1a6-4e63-a4ad-24ac74aa26c4', 2),
('c5493aed-fd59-4914-b8f0-0291c635ceaf', 'ee9f6756-c112-4fb2-920c-bb1216f2d589', 3),
('c5493aed-fd59-4914-b8f0-0291c635ceaf', '180ba1cb-e9dc-473d-aa72-bf9a0c6f806c', 4),
('c5493aed-fd59-4914-b8f0-0291c635ceaf', '4611fa36-578d-49f0-bd9b-4e1d93af010a', 5);

-- CORPORATE GIFTS: notepad, mug, water bottle, keychain, bottle flask, umbrella
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('cd70b676-e855-403c-8f28-2d0cf89e3e21', '080b06b9-e1a6-4e63-a4ad-24ac74aa26c4', 0),
('cd70b676-e855-403c-8f28-2d0cf89e3e21', 'ee9f6756-c112-4fb2-920c-bb1216f2d589', 1),
('cd70b676-e855-403c-8f28-2d0cf89e3e21', 'a0caffde-dd01-447d-9d31-a439ba7185e2', 2),
('cd70b676-e855-403c-8f28-2d0cf89e3e21', '180ba1cb-e9dc-473d-aa72-bf9a0c6f806c', 3),
('cd70b676-e855-403c-8f28-2d0cf89e3e21', '4611fa36-578d-49f0-bd9b-4e1d93af010a', 4),
('cd70b676-e855-403c-8f28-2d0cf89e3e21', '38727458-f686-479b-83b6-9f50e0c60af4', 5);

-- WEDDING GUEST ESSENTIALS: polo, tote bag, face towel, passport holder, phone case, umbrella
INSERT INTO product_collection_items (collection_id, product_id, display_order) VALUES
('57f7ee9e-3589-4ac2-b43d-398ab8f5966c', '04e8cd9f-01ae-4f4a-a6a4-91add74283dc', 0),
('57f7ee9e-3589-4ac2-b43d-398ab8f5966c', '3a23ae3c-20d6-4683-aa2e-ef0565bc89f6', 1),
('57f7ee9e-3589-4ac2-b43d-398ab8f5966c', 'faaa263f-0139-4df1-a6ba-8071c33bc598', 2),
('57f7ee9e-3589-4ac2-b43d-398ab8f5966c', '94e98a38-ec2a-4979-be1d-f781c3a2cce6', 3),
('57f7ee9e-3589-4ac2-b43d-398ab8f5966c', '6d4e39ea-224c-497c-8611-bd9e16a133ce', 4),
('57f7ee9e-3589-4ac2-b43d-398ab8f5966c', '38727458-f686-479b-83b6-9f50e0c60af4', 5);
