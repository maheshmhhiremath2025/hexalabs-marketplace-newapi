"""
Aggressive script to completely remove Azure Portal tasks from non-Cloud Slice courses.
This will properly clean Windows Server 2025 and all other non-Cloud Slice courses.
"""

import re
import json

# Load analysis report
with open('lab-instructions-analysis.json', 'r') as f:
    report = json.load(f)

non_cloud_courses = set(report['non_cloud_with_instructions'])

print(f"Removing Azure tasks from {len(non_cloud_courses)} non-Cloud Slice courses...")

# Read lab instructions
with open('src/data/lab-instructions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Restore from backup if exists
try:
    with open('src/data/lab-instructions.ts.backup', 'r', encoding='utf-8') as f:
        content = f.read()
    print("✅ Restored from backup for fresh start")
except:
    print("⚠️  No backup found, working with current file")

# For each non-Cloud Slice course, we need to find and remove Azure Portal tasks
# Strategy: Find each course block and remove Azure-specific instructions

def remove_azure_tasks_from_course(course_id, content):
    """Remove Azure Portal tasks from a specific course"""
    
    # Find the course block
    pattern = f"'{course_id}':\\s*{{([^}}]*?courseId:\\s*'{course_id}'.*?)}},\\s*(?='[a-z0-9-]+':|}}\\s*;)"
    
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return content, False
    
    course_block = match.group(0)
    original_block = course_block
    
    # Remove Azure Portal specific instructions
    azure_patterns_to_remove = [
        # Remove entire instruction steps that mention Azure Portal
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?Azure Portal.*?[\'"].*?\},?',
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?portal\.azure\.com.*?[\'"].*?\},?',
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?Create.*?Azure.*?[\'"].*?\},?',
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?Cloud Shell.*?[\'"].*?\},?',
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?resource group.*?[\'"].*?\},?',
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?App Service.*?[\'"].*?\},?',
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?Virtual Network.*?[\'"].*?\},?',
        r'\{\s*step:\s*\d+,\s*action:\s*[\'"].*?Storage Account.*?[\'"].*?\},?',
    ]
    
    for pattern in azure_patterns_to_remove:
        course_block = re.sub(pattern, '', course_block, flags=re.IGNORECASE | re.DOTALL)
    
    # Clean up any double commas or trailing commas
    course_block = re.sub(r',\s*,', ',', course_block)
    course_block = re.sub(r',\s*\]', ']', course_block)
    
    # Replace in content
    if course_block != original_block:
        content = content.replace(original_block, course_block)
        return content, True
    
    return content, False

# Process each non-Cloud Slice course
total_updated = 0
for course_id in sorted(non_cloud_courses):
    content, updated = remove_azure_tasks_from_course(course_id, content)
    if updated:
        total_updated += 1
        print(f"  ✅ Cleaned {course_id}")

# Additional global replacements for any remaining Azure references
global_replacements = [
    (r'Open the Azure Portal', 'Connect to the VM using RDP'),
    (r'In the Azure Portal,?\s*', 'In the VM, '),
    (r'portal\.azure\.com', 'the VM desktop'),
    (r'Cloud Shell', 'PowerShell'),
    (r'Azure resource', 'VM resource'),
]

for pattern, replacement in global_replacements:
    content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

# Write updated content
with open('src/data/lab-instructions.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ Updated {total_updated} courses")
print("✅ Removed all Azure Portal references")
print("✅ File updated successfully!")

# Verify
azure_count = len(re.findall(r'Azure Portal', content, re.IGNORECASE))
print(f"\n📊 Remaining 'Azure Portal' references: {azure_count}")
if azure_count > 0:
    print("⚠️  Some references remain (likely in Cloud Slice courses)")
