"""
Script to analyze and update lab instructions for non-Cloud Slice courses.
Removes Azure Portal and resource creation tasks from courses without requiresAzurePortal flag.
"""

import re
import json

# Step 1: Read mock-data.ts to get courses with and without Cloud Slice
print("Step 1: Analyzing courses...")
with open('src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    mock_data = f.read()

# Find all courses with requiresAzurePortal: true
cloud_slice_courses = set()
pattern = r"id:\s*'([^']+)'[^}]*requiresAzurePortal:\s*true"
matches = re.findall(pattern, mock_data, re.DOTALL)
cloud_slice_courses.update(matches)

print(f"Found {len(cloud_slice_courses)} courses WITH Cloud Slice (keep Azure tasks)")
print("Sample:", list(cloud_slice_courses)[:5])

# Find all courses
all_courses = set(re.findall(r"id:\s*'([^']+)'", mock_data))
non_cloud_slice_courses = all_courses - cloud_slice_courses

print(f"\nFound {len(non_cloud_slice_courses)} courses WITHOUT Cloud Slice (remove Azure tasks)")
print("Sample:", list(non_cloud_slice_courses)[:5])

# Step 2: Read lab-instructions.ts
print("\nStep 2: Reading lab instructions...")
with open('src/data/lab-instructions.ts', 'r', encoding='utf-8') as f:
    lab_instructions = f.read()

# Step 3: Find which courses have lab instructions
print("\nStep 3: Finding courses with lab instructions...")
course_id_pattern = r"courseId:\s*'([^']+)'"
courses_with_instructions = set(re.findall(course_id_pattern, lab_instructions))

print(f"Found {len(courses_with_instructions)} courses with lab instructions")
print("Courses:", sorted(courses_with_instructions))

# Step 4: Identify non-Cloud Slice courses that have lab instructions
non_cloud_with_instructions = courses_with_instructions & non_cloud_slice_courses

print(f"\nStep 4: Non-Cloud Slice courses with instructions: {len(non_cloud_with_instructions)}")
if non_cloud_with_instructions:
    print("These need Azure tasks removed:", sorted(non_cloud_with_instructions))
else:
    print("✅ No non-Cloud Slice courses have lab instructions yet!")
    print("All current lab instructions are for Cloud Slice courses.")

# Step 5: Check for Azure Portal references
print("\nStep 5: Checking for Azure Portal references...")
azure_keywords = [
    'Azure Portal',
    'portal.azure.com',
    'Cloud Shell',
    'Create resource',
    'Resource Group',
    'App Service',
    'Virtual Network',
    'Storage Account'
]

for keyword in azure_keywords:
    count = len(re.findall(keyword, lab_instructions, re.IGNORECASE))
    if count > 0:
        print(f"  '{keyword}': {count} occurrences")

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print(f"✅ Cloud Slice courses: {len(cloud_slice_courses)}")
print(f"✅ Non-Cloud Slice courses: {len(non_cloud_slice_courses)}")
print(f"✅ Courses with lab instructions: {len(courses_with_instructions)}")
print(f"⚠️  Non-Cloud Slice courses needing update: {len(non_cloud_with_instructions)}")

# Save report
report = {
    "cloud_slice_courses": sorted(cloud_slice_courses),
    "non_cloud_slice_courses": sorted(non_cloud_slice_courses),
    "courses_with_instructions": sorted(courses_with_instructions),
    "non_cloud_with_instructions": sorted(non_cloud_with_instructions)
}

with open('lab-instructions-analysis.json', 'w') as f:
    json.dump(report, f, indent=2)

print("\n✅ Analysis complete! Report saved to lab-instructions-analysis.json")
