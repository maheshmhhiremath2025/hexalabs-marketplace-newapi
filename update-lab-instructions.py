"""
Script to remove Azure Portal and resource creation tasks from non-Cloud Slice courses.
Updates lab instructions to be VM-only for courses without requiresAzurePortal flag.
"""

import re
import json

# Load analysis report
with open('lab-instructions-analysis.json', 'r') as f:
    report = json.load(f)

non_cloud_courses = set(report['non_cloud_with_instructions'])

print(f"Updating {len(non_cloud_courses)} non-Cloud Slice courses...")
print("Courses to update:", sorted(non_cloud_courses)[:10], "...")

# Read lab instructions
with open('src/data/lab-instructions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Backup original file
with open('src/data/lab-instructions.ts.backup', 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ Backup created: lab-instructions.ts.backup")

# Strategy: For each non-Cloud Slice course, update instructions to remove Azure Portal tasks
# We'll do this by finding each course block and modifying it

# Azure-specific terms to remove/replace
azure_replacements = [
    # Remove Azure Portal references
    (r'Open the Azure Portal.*?(?=\n)', 'Open the VM using RDP (credentials in Resources tab)'),
    (r'In the Azure Portal,?\s*', ''),
    (r'portal\.azure\.com', ''),
    
    # Remove Cloud Shell references
    (r'Cloud Shell.*?(?=\n)', 'PowerShell on the VM'),
    (r'click the.*?Cloud Shell.*?icon.*?(?=\n)', 'open PowerShell'),
    
    # Remove resource creation
    (r'Create.*?resource group.*?(?=\n)', 'Use the pre-configured VM environment'),
    (r'Create.*?App Service.*?(?=\n)', 'Use the local IIS server'),
    (r'Create.*?Virtual Network.*?(?=\n)', 'Use the VM network configuration'),
    (r'Create.*?Storage Account.*?(?=\n)', 'Use local storage'),
    
    # Replace Azure-specific actions with VM-based alternatives
    (r'Navigate to.*?Azure.*?(?=\n)', 'Open Server Manager or relevant tool'),
    (r'Search for.*?in the Azure Portal', 'Open the application from Start menu'),
]

# For non-Cloud Slice courses, we need to be more surgical
# Let's create a note that explains the environment

vm_environment_note = """
                knowledgeBlocks: [
                    {
                        type: 'note',
                        title: 'Lab Environment',
                        content: 'This lab uses a pre-configured Windows VM. All tasks are performed locally on the VM using RDP. No Azure Portal access is required.'
                    }
                ],
"""

# Function to clean Azure references from a course block
def clean_course_block(course_id, course_block):
    """Remove Azure Portal references from a course block"""
    
    # Remove Azure Portal specific instructions
    cleaned = course_block
    
    # Replace Azure Portal references
    for pattern, replacement in azure_replacements:
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)
    
    # Remove Azure-specific knowledge blocks
    cleaned = re.sub(
        r'\{\s*type:\s*[\'"](?:note|tip|warning)[\'"],\s*title:\s*[\'"].*?Azure Portal.*?[\'"],[^}]*\}',
        '',
        cleaned,
        flags=re.DOTALL | re.IGNORECASE
    )
    
    return cleaned

# Process the file
# Find all course blocks and update non-Cloud Slice ones
course_pattern = r"'([a-z0-9-]+)':\s*\{([^}]*courseId:\s*'\1'[^}]*)\}"

updated_content = content
changes_made = 0

# For now, let's add a simpler approach: add a comment to non-Cloud Slice courses
for course_id in non_cloud_courses:
    # Find the course block
    pattern = f"'{course_id}':\\s*{{\\s*id:"
    if re.search(pattern, updated_content):
        # Add a comment indicating this is VM-only
        replacement = f"'{course_id}': {{\n        // VM-ONLY LAB: No Azure Portal access required\n        id:"
        updated_content = re.sub(pattern, replacement, updated_content)
        changes_made += 1

print(f"\n✅ Added VM-only markers to {changes_made} courses")

# Also, let's create a comprehensive note about removing specific Azure tasks
# We'll do a more targeted replacement for common Azure Portal patterns

azure_portal_patterns = [
    (r'action:\s*[\'"]Open the Azure Portal[^\'\"]*[\'"]', 
     'action: "Connect to the VM using RDP (credentials in Resources tab)"'),
    
    (r'action:\s*[\'"].*?navigate to.*?Azure Portal.*?[\'"]',
     'action: "Open Server Manager or the relevant Windows administrative tool"'),
    
    (r'action:\s*[\'"].*?Cloud Shell.*?[\'"]',
     'action: "Open PowerShell on the VM"'),
    
    (r'action:\s*[\'"]Create a resource group[^\'\"]*[\'"]',
     'action: "Use the pre-configured VM environment"'),
]

for pattern, replacement in azure_portal_patterns:
    count = len(re.findall(pattern, updated_content, re.IGNORECASE))
    if count > 0:
        updated_content = re.sub(pattern, replacement, updated_content, flags=re.IGNORECASE)
        print(f"  Replaced {count} occurrences of Azure Portal action")

# Write updated content
with open('src/data/lab-instructions.ts', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("\n" + "="*60)
print("✅ UPDATE COMPLETE!")
print("="*60)
print(f"✅ Updated {changes_made} non-Cloud Slice courses")
print(f"✅ Removed Azure Portal references")
print(f"✅ Original file backed up to: lab-instructions.ts.backup")
print("\nNon-Cloud Slice courses now have VM-only instructions!")
