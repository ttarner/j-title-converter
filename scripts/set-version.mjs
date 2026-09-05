import fs from 'fs';
import path from 'path';

function generateTimestampVersion() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');

  return year + '.' + month + '.' + day + '.' + hours + minutes;
}

const targetVersion = process.argv[2] || process.env.APP_VERSION || generateTimestampVersion();
console.log('Applying version: ' + targetVersion);

// 1. Update package.json
const pkgPath = path.resolve('package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = targetVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('Updated package.json version to ' + targetVersion);
}

// 2. Update Android (android/app/build.gradle)
const androidGradlePath = path.resolve('android/app/build.gradle');
if (fs.existsSync(androidGradlePath)) {
  let content = fs.readFileSync(androidGradlePath, 'utf8');

  // Generate integer versionCode (epoch seconds / 10)
  const now = new Date();
  const versionCode = Math.floor(now.getTime() / 1000);

  content = content.replace(/versionCode\s+\d+/, 'versionCode ' + versionCode);
  content = content.replace(/versionName\s+["'][^"']+["']/, 'versionName "' + targetVersion + '"');

  fs.writeFileSync(androidGradlePath, content, 'utf8');
  console.log('Updated android/app/build.gradle (versionName: ' + targetVersion + ', versionCode: ' + versionCode + ')');
}

// 3. Update iOS (ios/App/App/Info.plist)
const iosPlistPath = path.resolve('ios/App/App/Info.plist');
if (fs.existsSync(iosPlistPath)) {
  let content = fs.readFileSync(iosPlistPath, 'utf8');

  content = content.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*(<\/string>)/,
    '$1' + targetVersion + '$2'
  );
  content = content.replace(
    /(<key>CFBundleVersion<\/key>\s*<string>)[^<]*(<\/string>)/,
    '$1' + targetVersion + '$2'
  );

  fs.writeFileSync(iosPlistPath, content, 'utf8');
  console.log('Updated ios/App/App/Info.plist (CFBundleShortVersionString & CFBundleVersion: ' + targetVersion + ')');
}

// 4. Output for GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'version=' + targetVersion + '\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'tag=v' + targetVersion + '\n');
}

console.log('Successfully synced version ' + targetVersion);
