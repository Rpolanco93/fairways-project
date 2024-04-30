#!/bin/bash

# Drop schema (deletes everything)
npx dotenv node ./bin/drop-schema.js

# Create schema (creates database)
npx dotenv node ./bin/create-schema.js

# Use NPM to migrate (creates tables)
npx dotenv sequelize db:migrate

# Use NPM to seed (adds sample data)
npx dotenv sequelize db:seed:all