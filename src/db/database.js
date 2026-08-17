import pkg from 'pg'
const {Pool} = pkg;

const pool = new Pool({
connectionString: process.env.postgresql://neondb_owner:npg_ok1NsyiQShw5@ep-dark-flower-aym8w4lg-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require,
  ssl: { rejectUnauthorized: false }
});

export default pool;