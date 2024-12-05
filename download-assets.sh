#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p public/images

# Download images
curl -o public/images/hero.jpg "https://raw.githubusercontent.com/yourusername/kt-token/main/public/Qmc1qdSe7y82kR7rbWgPLD1poWXnQXHFxjJbRLwUJgSaF7.jpg" || echo "Failed to download hero.jpg"
curl -o public/images/features.webp "https://raw.githubusercontent.com/yourusername/kt-token/main/public/QtrtTlC53zGn37ZQqGOM.webp" || echo "Failed to download features.webp"
curl -o public/images/community.webp "https://raw.githubusercontent.com/yourusername/kt-token/main/public/VDRo7y7T9w6SreQ8xslu.webp" || echo "Failed to download community.webp"
curl -o public/images/tokenomics.jpg "https://raw.githubusercontent.com/yourusername/kt-token/main/public/467970237_956852316472370_5862938173089959610_n.jpg" || echo "Failed to download tokenomics.jpg"
curl -o public/images/whitepaper.mp4 "https://raw.githubusercontent.com/yourusername/kt-token/main/public/9404EC75-5785-4CC4-A5C7-665F5C0A9B84.mp4" || echo "Failed to download whitepaper.mp4"

echo "Please update the image paths in the components to use the new locations:"
echo "- /images/hero.jpg"
echo "- /images/features.webp"
echo "- /images/community.webp"
echo "- /images/tokenomics.jpg"
echo "- /images/whitepaper.mp4"
