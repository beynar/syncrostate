import fs from 'fs';

let packageJson = fs.readFileSync('package.json', 'utf8');
packageJson = packageJson.replace('workspace:*', 'latest');
fs.writeFileSync('package.json', packageJson);
