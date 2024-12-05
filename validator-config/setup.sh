#!/bin/bash

# Source Solana path
export PATH="/home/user/.local/share/solana/install/active_release/bin:$PATH"

# Create required directories
mkdir -p ledger accounts

# Configure Solana CLI for mainnet-beta
if command -v solana &> /dev/null; then
    solana config set --url https://api.mainnet-beta.solana.com
else
    echo "WARNING: Solana CLI not found. Please ensure you've installed it with:"
    echo "sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    echo "And then run: export PATH=\"/home/user/.local/share/solana/install/active_release/bin:\$PATH\""
    exit 1
fi

# Create necessary directories with appropriate permissions
mkdir -p /var/log/solana 2>/dev/null || {
    echo "WARNING: Could not create /var/log/solana directory."
    echo "Creating logs directory in current path instead."
    mkdir -p logs
}

# Attempt to install system service if systemd is available
if command -v systemctl &> /dev/null; then
    # Check if we can use sudo
    if command -v sudo &> /dev/null; then
        sudo cp solana-validator.service /etc/systemd/system/
        sudo systemctl daemon-reload
    else
        echo "WARNING: sudo not available. To install system service manually:"
        echo "1. Copy solana-validator.service to /etc/systemd/system/"
        echo "2. Run: systemctl daemon-reload"
    fi
else
    echo "WARNING: systemd not detected. To run the validator manually:"
    echo "Use the command in solana-validator.service ExecStart line"
fi

echo "
=== Solana RPC Node Setup Complete ===

System Requirements:
- CPU: 16 cores / 32 threads, or more
- RAM: 256 GB, or more
- Disk: 2TB SSD or more (NVMe recommended)
- Network: 1 Gbps, or faster

To start the validator manually:
$(grep ExecStart solana-validator.service | sed 's/ExecStart=//')

To view logs:
tail -f solana-validator.log

Monitor your validator:
solana gossip
solana catchup validator-keypair.json

Important Notes:
1. Initial blockchain download may take several days
2. Ensure ports 8000-8020 are open in your firewall
3. Monitor system resources regularly
4. Keep the Solana software updated

RPC Endpoint will be available at:
http://YOUR_IP:8899

For maintenance:
1. Update Solana software: solana-install update
2. Check validator status: solana validator-info get
3. Monitor system resources: htop
"
