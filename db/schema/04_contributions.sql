DROP TABLE IF EXISTS contributions CASCADE;

CREATE TABLE contributions (
  id SERIAL PRIMARY KEY NOT NULL,
  story_id INTEGER REFERENCES stories(id), -- don't cascade on delete? How does this work because stories will be deleted..
  upvotes INTEGER DEFAULT 0,
  state VARCHAR(255) NOT NULL DEFAULT 'In Progress',
  created_on DATE DEFAULT CURRENT_DATE,
  resolved_on DATE,
  status VARCHAR (255) NOT NULL DEFAULT 'active',
  content TEXT,
  contributor_id INTEGER REFERENCES users(id) -- don't cascade on delete? as above
);

/*
db/schema/04_contributions.sql
*/