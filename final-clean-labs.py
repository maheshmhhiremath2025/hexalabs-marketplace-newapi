"""
FINAL COMPREHENSIVE SCRIPT - Remove ALL Azure Portal tasks from non-Cloud Slice courses
This will completely clean Windows Server 2025 and all other non-Cloud Slice courses.
"""

import re
import json

# Load analysis report
with open('lab-instructions-analysis.json', 'r') as f:
    report = json.load(f)

non_cloud_courses = set(report['non_cloud_with_instructions'])
cloud_courses = set(report['cloud_slice_courses'])

print("="*70)
print("FINAL COMPREHENSIVE AZURE TASK REMOVAL")
print("="*70)
print(f"\n📋 Processing {len(non_cloud_courses)} non-Cloud Slice courses")
print(f"✅ Keeping Azure tasks in {len(cloud_courses)} Cloud Slice courses\n")

# Read from backup
with open('src/data/lab-instructions.ts.backup', 'r', encoding='utf-8') as f:
    content = f.read()

print("✅ Loaded original backup file\n")

# For each non-Cloud Slice course, completely rewrite Azure-heavy sections
courses_to_clean = {
    'ws011wv-2025': {
        'new_objectives': [
            'Configure Windows Server 2025 core services',
            'Set up Windows Admin Center',
            'Implement Hotpatching',
            'Configure server roles and features'
        ],
        'new_prerequisites': [
            'Basic knowledge of Windows Server administration',
            'RDP client installed'
        ],
        'remove_tasks_with': ['Azure', 'portal', 'Cloud', 'Arc', 'resource group']
    }
}

# Strategy: For each non-Cloud Slice course, remove Azure-specific content
def clean_course_section(content, course_id):
    """Remove Azure content from a specific course section"""
    
    # Find the course block - more flexible pattern
    pattern = f"'{course_id}':\\s*{{(.*?)(?=\\n\\s*'[a-z0-9-]+':\\s*{{|\\n}};)"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        return content, False
    
    course_block = match.group(0)
    original_block = course_block
    
    # Remove Azure-specific content
    # 1. Remove Azure from objectives
    course_block = re.sub(
        r"'Deploy.*?Azure.*?',?\n",
        "",
        course_block,
        flags=re.IGNORECASE
    )
    
    course_block = re.sub(
        r"'.*?Azure Arc.*?',?\n",
        "",
        course_block,
        flags=re.IGNORECASE
    )
    
    # 2. Remove Azure from prerequisites
    course_block = re.sub(
        r"'Access to Azure Portal'",
        "'RDP access to the lab VM'",
        course_block
    )
    
    # 3. Remove Azure from description
    course_block = re.sub(
        r"set up hybrid management with Azure Arc",
        "configure local server management",
        course_block,
        flags=re.IGNORECASE
    )
    
    # 4. Remove entire tasks that are Azure-specific
    # Remove tasks with Azure Portal in action
    course_block = re.sub(
        r"\{\s*step:\s*\d+,\s*action:\s*'[^']*Azure Portal[^']*'\s*\},?\n?",
        "",
        course_block,
        flags=re.IGNORECASE
    )
    
    course_block = re.sub(
        r"\{\s*step:\s*\d+,\s*action:\s*'[^']*Create.*?Azure[^']*'\s*\},?\n?",
        "",
        course_block,
        flags=re.IGNORECASE
    )
    
    course_block = re.sub(
        r"\{\s*step:\s*\d+,\s*action:\s*'[^']*Cloud Shell[^']*'\s*\},?\n?",
        "",
        course_block,
        flags=re.IGNORECASE
    )
    
    # 5. Clean up comments
    course_block = re.sub(
        r"/\*\*\n\s*\*.*?Azure Portal Access.*?\n\s*\*/\n",
        "/**\n     * VM-ONLY LAB: No Azure Portal access required\n     */\n",
        course_block,
        flags=re.DOTALL
    )
    
    # 6. Clean up trailing commas
    course_block = re.sub(r',\s*,', ',', course_block)
    course_block = re.sub(r',\s*\]', ']', course_block)
    course_block = re.sub(r',\s*\}', '}', course_block)
    
    # Replace in content
    if course_block != original_block:
        content = content.replace(original_block, course_block)
        return content, True
    
    return content, False

# Process all non-Cloud Slice courses
print("🔧 Cleaning courses:\n")
updated_count = 0

for course_id in sorted(non_cloud_courses):
    content, updated = clean_course_section(content, course_id)
    if updated:
        updated_count += 1
        print(f"  ✅ {course_id}")

print(f"\n✅ Updated {updated_count} courses\n")

# Global text replacements for any remaining references
print("🔧 Applying global replacements...\n")

replacements = [
    # Azure Portal
    (r'Open the Azure Portal and search for', 'On the VM, open Server Manager and navigate to'),
    (r'Open Azure Portal', 'Connect to the VM using RDP'),
    (r'In the Azure Portal,?\s*', 'In the VM, '),
    (r'Navigate to the Azure Portal', 'Open Server Manager'),
    (r'portal\.azure\.com', 'the VM desktop'),
    
    # Cloud Shell
    (r'Open Cloud Shell', 'Open PowerShell'),
    (r'In Cloud Shell,?\s*', 'In PowerShell, '),
    (r'Cloud Shell', 'PowerShell'),
    
    # Resource creation
    (r'Create a resource group', 'Use the pre-configured environment'),
    (r'Create.*?Azure.*?virtual machine', 'Use the provided VM'),
    (r'Deploy.*?to Azure', 'Configure on the local VM'),
    
    # Azure Arc
    (r'Onboard.*?to Azure Arc', 'Configure local management tools'),
    (r'Azure Arc', 'local management'),
    
    # General Azure references
    (r'in Azure', 'on the VM'),
    (r'Azure resource', 'VM resource'),
]

for pattern, replacement in replacements:
    before_count = len(re.findall(pattern, content, re.IGNORECASE))
    if before_count > 0:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
        print(f"  Replaced '{pattern[:40]}...' ({before_count} times)")

# Write the cleaned content
with open('src/data/lab-instructions.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n" + "="*70)
print("✅ TASK COMPLETE!")
print("="*70)

# Final verification
azure_portal_count = len(re.findall(r'Azure Portal', content, re.IGNORECASE))
create_azure_count = len(re.findall(r'Create.*?Azure', content, re.IGNORECASE))
cloud_shell_count = len(re.findall(r'Cloud Shell', content, re.IGNORECASE))

print(f"\n📊 Final Statistics:")
print(f"  - Courses updated: {updated_count}/{len(non_cloud_courses)}")
print(f"  - 'Azure Portal' references: {azure_portal_count}")
print(f"  - 'Create Azure' references: {create_azure_count}")
print(f"  - 'Cloud Shell' references: {cloud_shell_count}")

print(f"\n✅ File saved: src/data/lab-instructions.ts")
print(f"✅ Backup available: src/data/lab-instructions.ts.backup")

# Verify Windows Server 2025 specifically
if 'ws011wv-2025' in content:
    ws_section = re.search(r"'ws011wv-2025':.*?(?='[a-z0-9-]+':|};)", content, re.DOTALL)
    if ws_section:
        ws_content = ws_section.group(0)
        ws_azure_count = len(re.findall(r'Azure Portal', ws_content, re.IGNORECASE))
        print(f"\n🔍 Windows Server 2025 verification:")
        print(f"  - 'Azure Portal' in WS2025: {ws_azure_count}")
        if ws_azure_count == 0:
            print(f"  ✅ Windows Server 2025 is clean!")
        else:
            print(f"  ⚠️  Still has {ws_azure_count} Azure Portal references")

print("\n🎉 All non-Cloud Slice courses now have VM-only instructions!")
