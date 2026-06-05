import json

with open("package.json", "r") as f:
    text = f.read()

# remove the invalid lines inside dependencies
text = text.replace('    "version": "0.0.0",\n    "type": "module",\n    "engines": {\n      "node": ">=18"\n    },\n    "scripts": {\n', '')

with open("package.json", "w") as f:
    f.write(text)
