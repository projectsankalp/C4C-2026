const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// Navigates up from /apps/mobile to the main workspace root folder
const workspaceRoot = path.resolve(projectRoot, '../..'); 

const config = getDefaultConfig(projectRoot);

// Force Metro to watch all files in both the app and the shared workspace root
config.watchFolders = [workspaceRoot];

// Force Metro to try resolving modules from the local app and the root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// MUST BE FALSE FOR PNPM PEER DEPENDENCY RESOLUTION:
// Allows Metro to crawl the nested virtual store inside .pnpm directories
config.resolver.disableHierarchicalLookup = false;

// Force forward slash path serialization for virtual files
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;