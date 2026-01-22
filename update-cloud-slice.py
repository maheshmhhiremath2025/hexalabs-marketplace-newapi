import re

# Read the file
with open('src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all course objects with "[Cloud Slice Provided]" that don't have requiresAzurePortal
# Pattern to match course objects
pattern = r'(\{[^}]*title:\s*[\'"].*?\[Cloud Slice Provided\].*?[\'"][^}]*)(level:\s*[\'"](?:Beginner|Intermediate|Advanced)[\'"],?\s*)(\})'

def add_requires_azure_portal(match):
    before = match.group(1)
    level = match.group(2)
    after = match.group(3)
    
    # Check if requiresAzurePortal already exists
    if 'requiresAzurePortal' in before:
        return match.group(0)  # Don't modify if already exists
    
    # Add requiresAzurePortal: true after level
    return f"{before}{level}\n        requiresAzurePortal: true,\n    {after}"

# Apply the replacement
updated_content = re.sub(pattern, add_requires_azure_portal, content, flags=re.DOTALL)

# Write back
with open('src/lib/mock-data.ts', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Updated Cloud Slice courses with requiresAzurePortal flag")
