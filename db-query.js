import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

console.log('=== MEDSBUDDY DATABASE QUERY TOOL ===\n');

// Helper function to execute queries
function executeQuery(query, description) {
  try {
    console.log(`${description}:`);
    console.log(`Query: ${query}`);
    console.log('-'.repeat(50));
    
    const stmt = db.prepare(query);
    const result = stmt.all();
    
    if (result.length === 0) {
      console.log('No results found.\n');
      return;
    }
    
    // Get column names
    const columns = Object.keys(result[0]);
    
    // Print header
    console.log(columns.join(' | '));
    console.log('='.repeat(columns.join(' | ').length));
    
    // Print rows
    result.forEach(row => {
      console.log(columns.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'number' && value > 1000000000) {
          // Convert timestamp to readable date
          return new Date(value).toISOString().split('T')[0];
        }
        return String(value);
      }).join(' | '));
    });
    
    console.log(`\n${result.length} row(s) returned\n`);
    
  } catch (error) {
    console.error('Query error:', error.message);
    console.log('');
  }
}

// Show all tables
executeQuery(
  "SELECT name FROM sqlite_master WHERE type='table'",
  "DATABASE TABLES"
);

// Show users
executeQuery(
  "SELECT id, username, email, role, created_at FROM users",
  "ALL USERS"
);

// Show medications
executeQuery(
  "SELECT id, user_id, name, dosage, frequency, times, notes FROM medications",
  "ALL MEDICATIONS"
);

// Show medication logs
executeQuery(
  "SELECT id, medication_id, user_id, taken_at, scheduled_for FROM medication_logs",
  "ALL MEDICATION LOGS"
);

// Show record counts
executeQuery(`
  SELECT 
    'users' as table_name, 
    COUNT(*) as count 
  FROM users 
  UNION ALL 
  SELECT 
    'medications', 
    COUNT(*) 
  FROM medications 
  UNION ALL 
  SELECT 
    'medication_logs', 
    COUNT(*) 
  FROM medication_logs`,
  "RECORD COUNTS"
);

// Show table structures
console.log('TABLE STRUCTURES:\n');

console.log('USERS table structure:');
const usersInfo = db.prepare("PRAGMA table_info(users)").all();
usersInfo.forEach(col => {
  console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\nMEDICATIONS table structure:');
const medsInfo = db.prepare("PRAGMA table_info(medications)").all();
medsInfo.forEach(col => {
  console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\nMEDICATION_LOGS table structure:');
const logsInfo = db.prepare("PRAGMA table_info(medication_logs)").all();
logsInfo.forEach(col => {
  console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
});

db.close();
console.log('\n=== DATABASE QUERY COMPLETE ===');