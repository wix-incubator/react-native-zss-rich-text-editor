#!/bin/bash
sed -i '' 's/WIX_GUARD:.*CK_GUARD:/WIX_GUARD:"\\u200b",CK_GUARD:/' './src/wixck.min.js'
sed -i '' 's/wixck.min.js/wixck3.min.js/' './src/NoUIBundleWixRichText.js'
mv ./src/wixck.min.js ./src/wixck3.min.js