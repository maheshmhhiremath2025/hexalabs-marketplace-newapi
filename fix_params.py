import os
import re

# Files to fix
files_to_fix = [
    r"src\app\api\v1\organizations\[orgId]\analytics\route.ts",
    r"src\app\api\v1\organizations\[orgId]\assign-lab\route.ts",
    r"src\app\api\v1\organizations\[orgId]\members\route.ts",
    r"src\app\api\v1\organizations\[orgId]\members\[userId]\route.ts",
    r"src\app\api\v1\organizations\[orgId]\route.ts",
    r"src\app\api\v1\users\[userId]\analytics\route.ts",
    r"src\app\api\v1\users\[userId]\labs\route.ts",
    r"src\app\api\v1\users\[userId]\orders\route.ts",
    r"src\app\api\v1\users\[userId]\route.ts",
]

for file_path in files_to_fix:
    if os.path.exists(file_path):
        print(f"Fixing: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace context parameter
        content = re.sub(
            r'async \(request: NextRequest, auth, context: any\) =>',
            r'async (request: NextRequest, auth) =>',
            content
        )
        
        # Replace context.params usage
        content = re.sub(
            r'const \{ (\w+) \} = context\.params;',
            r'''// Extract \1 from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const \1 = pathParts[pathParts.length - 1];''',
            content
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Fixed: {file_path}")
    else:
        print(f"✗ Not found: {file_path}")

print("\nAll files processed!")
