const { Connection, PublicKey } = require('@solana/web3.js');
const { PythHttpClient } = require('../pyth-client-js/src/PythHttpClient');

async function testPythClient() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const pythProgramKey = new PublicKey('YourPythProgramKeyHere'); // Replace with actual key
  const client = new PythHttpClient(connection, pythProgramKey);

  try {
    const data = await client.getData();
    console.log('Available product symbols:', data.symbols);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

testPythClient();
