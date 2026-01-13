import re
import os

file_path = 'src/data/blog-content.ts'

# Check if file exists
if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)

with open(file_path, 'r') as f:
    content = f.read()

# Regex to find slug and replace image.
# We assume slug appears before image in the object definition.
# Capture slug value (group 1) and the text between slug and image (group 2).
pattern = r"(slug:\s*['\"])([^'\"]+)(['\"][\s\S]*?image:\s*)(['\"][^'\"]+['\"])"

def replacer(match):
    prefix = match.group(1)
    slug = match.group(2)
    middle = match.group(3)
    # Construct new image path using the slug
    new_image_path = f'"/images/blog/{slug}.jpg"'
    return f"{prefix}{slug}{middle}{new_image_path}"

new_content = re.sub(pattern, replacer, content)

with open(file_path, 'w') as f:
    f.write(new_content)

print(f"Successfully updated image paths in {file_path}")
