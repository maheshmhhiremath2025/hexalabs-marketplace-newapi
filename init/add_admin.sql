-- Append guacadmin user creation
INSERT INTO guacamole_entity (name, type) VALUES ('guacadmin', 'USER');

INSERT INTO guacamole_user (entity_id, password_hash, password_salt, password_date)
SELECT entity_id,
       decode('CA458A7D494E3BE824F5E1E175A1556C0F8EEF2C2D7DF3633BEC4A29C4411960', 'hex'),
       decode('FE24ADC5E11E2B25288D1704ABE67A79E342ECC26064CE69C5B3177795A82264', 'hex'),
       CURRENT_TIMESTAMP
FROM guacamole_entity WHERE name = 'guacadmin' AND type = 'USER';

INSERT INTO guacamole_system_permission (entity_id, permission)
SELECT entity_id, permission::guacamole_system_permission_type
FROM guacamole_entity, (VALUES ('CREATE_CONNECTION'), ('CREATE_CONNECTION_GROUP'), ('CREATE_SHARING_PROFILE'), ('CREATE_USER'), ('CREATE_USER_GROUP'), ('ADMINISTER')) AS permissions(permission)
WHERE name = 'guacadmin' AND type = 'USER';

INSERT INTO guacamole_user_permission (entity_id, affected_user_id, permission)
SELECT guacamole_entity.entity_id, guacamole_entity.entity_id, permission::guacamole_user_permission_type
FROM guacamole_entity, (VALUES ('READ'), ('UPDATE'), ('DELETE'), ('ADMINISTER')) AS permissions(permission)
WHERE name = 'guacadmin' AND type = 'USER';
