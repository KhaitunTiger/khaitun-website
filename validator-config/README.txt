SOLANA RPC NODE SETUP GUIDE

SYSTEM REQUIREMENTS
- CPU: 16 cores / 32 threads, or more
- RAM: 256 GB, or more
- Storage: 2TB NVMe SSD, or more
- Network: 1 Gbps, or faster
- OS: Linux (Ubuntu 20.04 LTS recommended)

PREREQUISITES
1. Install dependencies (if you have sudo access):
   sudo apt-get update && sudo apt-get install -y libssl-dev libudev-dev pkg-config zlib1g-dev llvm clang cmake make

   If no sudo access, request system administrator to install these packages.

2. Install Solana CLI (does not require sudo):
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

3. Add Solana to your PATH:
   export PATH="/home/user/.local/share/solana/install/active_release/bin:$PATH"
   
   Add this line to your ~/.bashrc or ~/.profile to make it permanent:
   echo 'export PATH="/home/user/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

SETUP INSTRUCTIONS
1. Verify Solana installation:
   solana --version

2. Run setup script:
   cd validator-config
   ./setup.sh

RUNNING THE VALIDATOR

WITH SYSTEMD (if available):
- Start: systemctl start solana-validator
- Status: systemctl status solana-validator
- Logs: tail -f ~/kt/validator-config/solana-validator.log

WITHOUT SYSTEMD:
- Start manually using the command shown by setup.sh
- Logs will be in the current directory

MONITORING
- Check gossip network: solana gossip
- Check catchup status: solana catchup validator-keypair.json
- View logs: tail -f solana-validator.log

MAINTENANCE
- Update Solana: solana-install update
- Required ports: 8000-8020/tcp, 8899/tcp

RPC USAGE
- Endpoint: http://YOUR_IP:8899
- Example:
  curl http://YOUR_IP:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1, "method":"getBlockHeight"}'

IMPORTANT NOTES
1. Initial blockchain download takes several days
2. Monitor system resources regularly
3. Keep Solana software updated
4. Backup validator-keypair.json file
5. Check logs daily for errors
6. Maintain sufficient disk space

TROUBLESHOOTING
1. If 'solana: command not found':
   - Ensure you've run the export PATH command
   - Verify Solana installation with 'ls ~/.local/share/solana/install/active_release/bin'

2. If setup.sh fails with permission errors:
   - If no sudo access, follow manual setup steps in script output
   - Ensure you have write permission in current directory

3. If validator won't start:
   - Check system requirements are met
   - Verify all dependencies are installed
   - Check log files for specific errors
