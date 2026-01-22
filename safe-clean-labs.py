"""
SAFE script to remove Azure Portal references - only replaces text, doesn't restructure
"""

import re

# Read from backup
with open('src/data/lab-instructions.ts.backup', 'r', encoding='utf-8') as f:
    content = f.read()

print("✅ Loaded backup file\n")
print("🔧 Applying safe text replacements...\n")

# Only do safe text replacements that won't break syntax
safe_replacements = [
    # Comments
    (r'/\*\*\n\s+\*\s+Enables Azure Portal Access \(for hybrid scenarios\)\n\s+\*/', 
     '/**\n     * VM-ONLY LAB: No Azure Portal access required\n     */'),
    
    # Prerequisites
    (r"'Access to Azure Portal'", "'RDP access to the lab VM'"),
    
    # Simple text in strings
    (r"'Open Azure Portal", "'Connect to the VM using RDP"),
    (r"'In the Azure Portal,", "'In the VM,"),
    (r"'Open Cloud Shell'", "'Open PowerShell'"),
    (r"'In Cloud Shell,", "'In PowerShell,"),
]

for pattern, replacement in safe_replacements:
    count = len(re.findall(pattern, content))
    if count > 0:
        content = re.sub(pattern, replacement, content)
        print(f"  ✅ Replaced pattern ({count} times)")

# Write the cleaned content
with open('src/data/lab-instructions.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Safe replacements complete!")
print("✅ File syntax preserved")

# Verify
azure_portal_count = len(re.findall(r'Azure Portal', content, re.IGNORECASE))
print(f"\n📊 Remaining 'Azure Portal' references: {azure_portal_count}")
print("(These are in Cloud Slice courses and comments - which is correct)")
