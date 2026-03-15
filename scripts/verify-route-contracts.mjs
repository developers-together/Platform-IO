#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const apiRoutesPath = path.join(cwd, 'routes', 'api.php');
const frontendApiDir = path.join(cwd, 'resources', 'js', 'lib', 'api');

const normalizePath = (rawPath) => {
    if (!rawPath) return '/';

    let value = rawPath.trim();
    const queryIndex = value.indexOf('?');
    if (queryIndex >= 0) {
        value = value.slice(0, queryIndex);
    }

    value = value.replace(/\$\{[^}]+\}/g, '{param}');

    if (!value.startsWith('/')) {
        value = `/${value}`;
    }

    value = value.replace(/\/+/g, '/');
    value = value.replace(/\{[^}]+\}/g, '{param}');

    if (value.length > 1 && value.endsWith('/')) {
        value = value.slice(0, -1);
    }

    return value;
};

const readFile = (targetPath) => {
    try {
        return fs.readFileSync(targetPath, 'utf8');
    } catch (error) {
        console.error(`Unable to read file: ${targetPath}`);
        throw error;
    }
};

const extractBackendRoutes = () => {
    const content = readFile(apiRoutesPath);
    const regex = /Route::(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g;
    const routes = new Set();

    let match;
    while ((match = regex.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const routePath = normalizePath(`/api/${match[2]}`);
        routes.add(`${method} ${routePath}`);
    }

    return routes;
};

const extractMethodFromOptions = (optionsSource) => {
    if (!optionsSource) {
        return 'GET';
    }

    const methodMatch = optionsSource.match(
        /method\s*:\s*['"](GET|POST|PUT|PATCH|DELETE)['"]/i,
    );
    return methodMatch ? methodMatch[1].toUpperCase() : 'GET';
};

const extractFrontendApiCalls = () => {
    const apiFiles = fs
        .readdirSync(frontendApiDir)
        .filter((file) => file.endsWith('.ts') && file !== '__tests__')
        .map((file) => path.join(frontendApiDir, file));

    const calls = [];

    for (const filePath of apiFiles) {
        const content = readFile(filePath);

        const apiRequestRegex =
            /apiRequest<[^>]*>\(\s*`([^`]+)`\s*(?:,\s*\{([\s\S]*?)\}\s*)?\)/g;
        let match;
        while ((match = apiRequestRegex.exec(content)) !== null) {
            const rawPath = match[1];
            if (!rawPath.includes('/api/')) {
                continue;
            }

            calls.push({
                file: filePath,
                method: extractMethodFromOptions(match[2]),
                path: normalizePath(rawPath),
                source: 'apiRequest',
            });
        }

        const fetchRegex = /fetch\(\s*`([^`]+)`\s*,\s*\{([\s\S]*?)\}\s*\)/g;
        while ((match = fetchRegex.exec(content)) !== null) {
            const rawPath = match[1];
            if (!rawPath.includes('/api/')) {
                continue;
            }

            calls.push({
                file: filePath,
                method: extractMethodFromOptions(match[2]),
                path: normalizePath(rawPath),
                source: 'fetch',
            });
        }
    }

    return calls;
};

const backendRoutes = extractBackendRoutes();
const frontendCalls = extractFrontendApiCalls();

const missing = [];
const covered = [];

for (const call of frontendCalls) {
    const key = `${call.method} ${call.path}`;

    if (backendRoutes.has(key)) {
        covered.push(call);
        continue;
    }

    missing.push({ ...call, key });
}

console.log('Frontend API Contract Verification');
console.log(`Backend routes parsed: ${backendRoutes.size}`);
console.log(`Frontend API calls parsed: ${frontendCalls.length}`);
console.log(`Covered: ${covered.length}`);
console.log(`Missing: ${missing.length}`);

if (missing.length > 0) {
    console.log('\nMissing route contracts:');
    for (const item of missing) {
        console.log(`- ${item.key}`);
        console.log(
            `  File: ${path.relative(cwd, item.file)} (${item.source})`,
        );
    }
    process.exit(1);
}

console.log('\nAll frontend API calls map to backend api.php routes.');
process.exit(0);
