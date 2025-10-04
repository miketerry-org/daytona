
topsecret encrypt server.env server.secret --key-file secret.key
topsecret encrypt ./tenants/001_development.env ./tenants/001_development.secret --key-file secret.key
topsecret encrypt tenants/002_testing.env tenants/002_testing.secret --key-file secret.key
topsecret encrypt tenants/003_production.env tenants/003_production.secret --key-file secret.key
