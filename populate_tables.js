const { Client } = require('pg');

async function runScript() {
  const client = new Client({
    host: 'db-book-instance.cq5k2jq6t1ai.eu-north-1.rds.amazonaws.com',
    database: 'bookDbRDS',
    user: 'postgres',
    password: 'cAK6x2Aewm4dbtyuvq7c',
    port: 5432,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    
    const query = async (sql, params = []) => {
      try {
        const result = await client.query(sql, params);
        return result.rows;
      } catch (error) {
        throw error;
      }
    }
    console.log('Connected to the database');
    await query('TRUNCATE TABLE cart_items, carts RESTART IDENTITY CASCADE;');
    await query(`
      INSERT INTO carts (user_id, created_at, updated_at, status)
      VALUES
        ('VOLODYMYRHARHAY', NOW(), NOW(), 'OPEN'),
        ('TESTUSER', NOW(), NOW(), 'ORDERED');
    `);

    const cartIdVolodymyr = await query(`
      SELECT id FROM carts WHERE user_id = 'VOLODYMYRHARHAY';
    `);

    const cartIdTestUser = await query(`
      SELECT id FROM carts WHERE user_id = 'TESTUSER';
    `);

    console.log('Cart IDs for users:', cartIdVolodymyr[0].id, cartIdTestUser[0].id);

    // Insert test data into cart_items table for the users
      await query(`
        INSERT INTO cart_items (cart_id, product_id, count)
        VALUES
          ('${cartIdVolodymyr[0].id}', 'bc84a80e-31ce-4ca6-9816-73272b87ca42', 3),
          ('${cartIdVolodymyr[0].id}', 'f655e062-cdd4-40a8-ad66-e442115b6dbb', 2),
          ('${cartIdTestUser[0].id}', 'bc84a80e-31ce-4ca6-9816-73272b87ca42', 1),
          ('${cartIdTestUser[0].id}', 'f655e062-cdd4-40a8-ad66-e442115b6dbb', 4);
      `);

    console.log('Script executed successfully');
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

runScript();
