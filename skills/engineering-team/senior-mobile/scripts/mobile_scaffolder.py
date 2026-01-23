#!/usr/bin/env python3
"""
Module: mobile_scaffolder.py
Description: Generate cross-platform mobile project structures for React Native, Flutter, and Expo

This tool scaffolds production-ready mobile applications with complete infrastructure including:
- React Native with TypeScript and modern navigation
- Flutter with Dart null safety and state management
- Expo managed workflow with EAS Build
- Testing infrastructure (unit, integration, E2E)
- CI/CD pipelines (GitHub Actions, Bitrise, Codemagic)

Usage:
    python mobile_scaffolder.py MyApp
    python mobile_scaffolder.py MyApp --framework react-native --platforms both --auth
    python mobile_scaffolder.py MyApp -f flutter --state riverpod --testing all
    python mobile_scaffolder.py MyApp -f expo --ci github-actions -o json

Author: Claude Skills - Senior Mobile Engineer
Version: 1.1.0
Last Updated: 2025-12-14

ARCHITECTURE NOTE - Single-File Design:
    This script is intentionally monolithic for portability.
    Users can extract this single file and run it anywhere with Python 3.8+.
    This aligns with the repository's zero-dependency, portable-skills philosophy.

    Code is organized into logical sections for maintainability:

    SECTION 1: CONFIGURATION & CONSTANTS
        - Imports, logging setup, framework constants

    SECTION 2: COMMON TEMPLATES
        - CommonTemplates class
        - Shared templates (.env, .gitignore, etc.)

    SECTION 3: REACT NATIVE TEMPLATES
        - ReactNativeTemplates class
        - All React Native/Expo specific templates

    SECTION 4: FLUTTER TEMPLATES
        - FlutterTemplates class
        - All Flutter/Dart specific templates

    SECTION 5: BASE SCAFFOLDER
        - BaseScaffolder class
        - Common directory/file creation utilities

    SECTION 6: REACT NATIVE SCAFFOLDER
        - ReactNativeScaffolder class
        - React Native project structure and file generation

    SECTION 7: FLUTTER SCAFFOLDER
        - FlutterScaffolder class
        - Flutter project structure and file generation

    SECTION 8: CORE ORCHESTRATOR
        - MobileScaffolder class
        - Main orchestration, validation, framework routing

    SECTION 9: OUTPUT FORMATTING
        - format_text_output(), format_json_output()

    SECTION 10: CLI ENTRY POINT
        - main() function, argument parsing
"""

# ============================================================================
# SECTION 1: CONFIGURATION & CONSTANTS
# ============================================================================
# Imports, logging setup, and framework configuration constants

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Framework constants
FRAMEWORKS = ['react-native', 'flutter', 'expo']
PLATFORMS = ['ios', 'android', 'both']
NAVIGATION = {
    'react-native': ['react-navigation', 'none'],
    'expo': ['react-navigation', 'none'],
    'flutter': ['go_router', 'auto_route', 'none']
}
STATE_MANAGEMENT = {
    'react-native': ['redux', 'zustand', 'none'],
    'expo': ['redux', 'zustand', 'none'],
    'flutter': ['provider', 'riverpod', 'bloc', 'none']
}
TESTING_TYPES = ['unit', 'integration', 'e2e', 'all', 'none']
CI_PLATFORMS = ['github-actions', 'bitrise', 'codemagic', 'none']


# ============================================================================
# SECTION 2: COMMON TEMPLATES
# ============================================================================
# Shared templates used across multiple frameworks

class CommonTemplates:
    """Templates shared across React Native and Flutter projects"""

    @staticmethod
    def get_env_example() -> str:
        """Generate .env.example"""
        return '''# API Configuration
API_BASE_URL=https://api.example.com
API_KEY=your_api_key_here
API_TIMEOUT=30000

# Environment
ENVIRONMENT=development

# Features
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false'''

    @staticmethod
    def get_gitignore_react_native() -> str:
        """Generate .gitignore for React Native/Expo"""
        return '''# OSX
.DS_Store

# Node
node_modules/
npm-debug.log
yarn-error.log

# Expo
.expo/
.expo-shared/
dist/
web-build/

# React Native
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*

# Android
*.apk
*.ap_
*.aab
/android/app/debug
/android/app/release
/android/.gradle
/android/captures/
/android/build/

# iOS
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate
ios/Pods/
ios/build/

# Fastlane
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots
fastlane/test_output

# Environment
.env
.env.local
.env.*.local

# Testing
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Misc
.cache/'''

    @staticmethod
    def get_gitignore_flutter() -> str:
        """Generate .gitignore for Flutter"""
        return '''# Miscellaneous
*.class
*.log
*.pyc
*.swp
.DS_Store
.atom/
.buildlog/
.history
.svn/
migrate_working_dir/

# IntelliJ related
*.iml
*.ipr
*.iws
.idea/

# VS Code
.vscode/

# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
/build/

# Symbolication related
app.*.symbols

# Obfuscation related
app.*.map.json

# Android Studio
*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties

# iOS
**/ios/**/*.mode1v3
**/ios/**/*.mode2v3
**/ios/**/*.moved-aside
**/ios/**/*.pbxuser
**/ios/**/*.perspectivev3
**/ios/**/*sync/
**/ios/**/.sconsign.dblite
**/ios/**/.tags*
**/ios/**/.vagrant/
**/ios/**/DerivedData/
**/ios/**/Icon?
**/ios/**/Pods/
**/ios/**/.symlinks/
**/ios/**/profile
**/ios/**/xcuserdata
**/ios/.generated/
**/ios/Flutter/.last_build_id
**/ios/Flutter/App.framework
**/ios/Flutter/Flutter.framework
**/ios/Flutter/Flutter.podspec
**/ios/Flutter/Generated.xcconfig
**/ios/Flutter/ephemeral
**/ios/Flutter/app.flx
**/ios/Flutter/app.zip
**/ios/Flutter/flutter_assets/
**/ios/Flutter/flutter_export_environment.sh
**/ios/ServiceDefinitions.json
**/ios/Runner/GeneratedPluginRegistrant.*

# Environment
.env
.env.local
.env.*.local

# Coverage
coverage/

# Exceptions to above rules.
!**/ios/**/default.mode1v3
!**/ios/**/default.mode2v3
!**/ios/**/default.pbxuser
!**/ios/**/default.perspectivev3'''


# ============================================================================
# SECTION 3: REACT NATIVE TEMPLATES
# ============================================================================
# All React Native and Expo specific file templates

class ReactNativeTemplates:
    """Templates for React Native and Expo projects"""

    @staticmethod
    def get_package_json(project_name: str, framework: str, navigation: str,
                         state: str, testing: str) -> str:
        """Generate package.json for React Native/Expo"""
        is_expo = framework == 'expo'

        base_deps = {
            "react": "18.2.0",
            "react-native": "0.72.6" if not is_expo else None
        }

        if is_expo:
            base_deps["expo"] = "~49.0.0"
            base_deps["expo-status-bar"] = "~1.6.0"

        if navigation == 'react-navigation':
            base_deps["@react-navigation/native"] = "^6.1.9"
            base_deps["@react-navigation/native-stack"] = "^6.9.17"
            base_deps["react-native-screens"] = "^3.27.0"
            base_deps["react-native-safe-area-context"] = "^4.7.4"

        if state == 'redux':
            base_deps["@reduxjs/toolkit"] = "^1.9.7"
            base_deps["react-redux"] = "^8.1.3"
        elif state == 'zustand':
            base_deps["zustand"] = "^4.4.7"

        # Remove None values
        base_deps = {k: v for k, v in base_deps.items() if v is not None}

        dev_deps = {
            "@types/react": "~18.2.14",
            "@types/react-native": "0.72.5" if not is_expo else None,
            "typescript": "^5.1.3",
            "@typescript-eslint/eslint-plugin": "^6.10.0",
            "@typescript-eslint/parser": "^6.10.0",
            "eslint": "^8.53.0",
            "prettier": "^3.1.0"
        }

        if testing in ['unit', 'all']:
            dev_deps["jest"] = "^29.7.0"
            dev_deps["@testing-library/react-native"] = "^12.4.0"
            dev_deps["@testing-library/jest-native"] = "^5.4.3"

        if testing in ['e2e', 'all']:
            dev_deps["detox"] = "^20.13.5"

        # Remove None values
        dev_deps = {k: v for k, v in dev_deps.items() if v is not None}

        package = {
            "name": project_name.lower(),
            "version": "1.0.0",
            "description": f"Mobile application built with {framework}",
            "main": "index.js" if not is_expo else "node_modules/expo/AppEntry.js",
            "scripts": {
                "start": "expo start" if is_expo else "react-native start",
                "android": "expo run:android" if is_expo else "react-native run-android",
                "ios": "expo run:ios" if is_expo else "react-native run-ios",
                "test": "jest",
                "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
                "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json}\""
            },
            "dependencies": base_deps,
            "devDependencies": dev_deps
        }

        return json.dumps(package, indent=2)

    @staticmethod
    def get_tsconfig() -> str:
        """Generate TypeScript configuration"""
        return '''{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["esnext"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}'''

    @staticmethod
    def get_babel_config(framework: str) -> str:
        """Generate Babel configuration"""
        preset = "babel-preset-expo" if framework == 'expo' else "module:metro-react-native-babel-preset"
        return f'''module.exports = {{
  presets: ['{preset}'],
  plugins: [
    [
      'module-resolver',
      {{
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {{
          '@': './src',
        }},
      }},
    ],
  ],
}};'''

    @staticmethod
    def get_eslint_config() -> str:
        """Generate ESLint configuration"""
        return '''module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-native/no-inline-styles': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};'''

    @staticmethod
    def get_prettier_config() -> str:
        """Generate Prettier configuration"""
        return '''{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}'''

    @staticmethod
    def get_expo_app(navigation: str) -> str:
        """Generate Expo App.tsx entry point"""
        nav_import = "import RootNavigator from './src/navigation/RootNavigator';" if navigation == 'react-navigation' else ""
        nav_component = "<RootNavigator />" if navigation == 'react-navigation' else "<HomeScreen />"

        return f'''import React from 'react';
import {{ StatusBar }} from 'expo-status-bar';
{nav_import}
{'' if nav_import else "import HomeScreen from './src/screens/HomeScreen';"}

export default function App() {{
  return (
    <>
      <StatusBar style="auto" />
      {nav_component}
    </>
  );
}}'''

    @staticmethod
    def get_expo_app_json(project_name: str) -> str:
        """Generate Expo app.json"""
        app_config = {
            "expo": {
                "name": project_name,
                "slug": project_name.lower(),
                "version": "1.0.0",
                "orientation": "portrait",
                "icon": "./assets/icon.png",
                "userInterfaceStyle": "light",
                "splash": {
                    "image": "./assets/splash.png",
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff"
                },
                "assetBundlePatterns": ["**/*"],
                "ios": {
                    "supportsTablet": True,
                    "bundleIdentifier": f"com.{project_name.lower()}.app"
                },
                "android": {
                    "adaptiveIcon": {
                        "foregroundImage": "./assets/adaptive-icon.png",
                        "backgroundColor": "#ffffff"
                    },
                    "package": f"com.{project_name.lower()}.app"
                },
                "web": {
                    "favicon": "./assets/favicon.png"
                }
            }
        }
        return json.dumps(app_config, indent=2)

    @staticmethod
    def get_rn_index() -> str:
        """Generate React Native index.js"""
        return '''import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);'''

    @staticmethod
    def get_rn_app(navigation: str) -> str:
        """Generate React Native App.tsx"""
        nav_import = "import RootNavigator from './src/navigation/RootNavigator';" if navigation == 'react-navigation' else ""
        nav_component = "<RootNavigator />" if navigation == 'react-navigation' else "<HomeScreen />"

        return f'''import React from 'react';
import {{ SafeAreaProvider }} from 'react-native-safe-area-context';
{nav_import}
{'' if nav_import else "import HomeScreen from './src/screens/HomeScreen';"}

const App = () => {{
  return (
    <SafeAreaProvider>
      {nav_component}
    </SafeAreaProvider>
  );
}};

export default App;'''

    @staticmethod
    def get_metro_config() -> str:
        """Generate Metro bundler configuration"""
        return '''const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);'''

    @staticmethod
    def get_root_navigator() -> str:
        """Generate React Navigation root navigator"""
        return '''import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;'''

    @staticmethod
    def get_navigation_types() -> str:
        """Generate navigation TypeScript types"""
        return '''import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;'''

    @staticmethod
    def get_redux_store() -> str:
        """Generate Redux store configuration"""
        return '''import { configureStore } from '@reduxjs/toolkit';
import exampleReducer from './slices/exampleSlice';

export const store = configureStore({
  reducer: {
    example: exampleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;'''

    @staticmethod
    def get_redux_slice() -> str:
        """Generate Redux slice example"""
        return '''import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
  value: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ExampleState = {
  value: 0,
  status: 'idle',
};

export const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = exampleSlice.actions;
export default exampleSlice.reducer;'''

    @staticmethod
    def get_zustand_store() -> str:
        """Generate Zustand store example"""
        return '''import { create } from 'zustand';

interface ExampleStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));'''

    @staticmethod
    def get_home_screen(project_name: str) -> str:
        """Generate HomeScreen component"""
        return f'''import React from 'react';
import {{ View, Text, StyleSheet }} from 'react-native';
import Button from '../components/Button';

const HomeScreen = () => {{
  const handlePress = () => {{
    console.log('Button pressed!');
  }};

  return (
    <View style={{styles.container}}>
      <Text style={{styles.title}}>Welcome to {project_name}</Text>
      <Text style={{styles.subtitle}}>Start building your mobile app</Text>
      <Button title="Get Started" onPress={{handlePress}} />
    </View>
  );
}};

const styles = StyleSheet.create({{
  container: {{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  }},
  title: {{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  }},
  subtitle: {{
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  }},
}});

export default HomeScreen;'''

    @staticmethod
    def get_button_component() -> str:
        """Generate Button component"""
        return '''import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', ...props }) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant]]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#5856D6',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;'''

    @staticmethod
    def get_jest_config() -> str:
        """Generate Jest configuration"""
        return '''module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};'''

    @staticmethod
    def get_app_test() -> str:
        """Generate App test"""
        return '''import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders correctly', () => {
    const { getByText } = render(<App />);
    expect(getByText(/Welcome/i)).toBeTruthy();
  });
});'''

    @staticmethod
    def get_detox_config() -> str:
        """Generate Detox configuration"""
        return '''module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.release': {
      type: 'ios.app',
      build: 'xcodebuild -workspace ios/App.xcworkspace -scheme App -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/App.app',
    },
    'android.release': {
      type: 'android.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 14' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_5_API_31' },
    },
  },
  configurations: {
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};'''

    @staticmethod
    def get_e2e_test() -> str:
        """Generate E2E test"""
        return '''describe('App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display welcome message', async () => {
    await expect(element(by.text('Welcome'))).toBeVisible();
  });

  it('should navigate after button press', async () => {
    await element(by.id('get-started-button')).tap();
    await expect(element(by.text('Next Screen'))).toBeVisible();
  });
});'''

    @staticmethod
    def get_github_actions(project_name: str) -> str:
        """Generate GitHub Actions workflow for React Native"""
        return f'''name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build-android:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Install dependencies
        run: npm ci

      - name: Build Android
        run: |
          cd android
          ./gradlew assembleRelease

  build-ios:
    needs: test
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install CocoaPods
        run: |
          cd ios
          pod install

      - name: Build iOS
        run: |
          cd ios
          xcodebuild -workspace {project_name}.xcworkspace \\
            -scheme {project_name} \\
            -configuration Release \\
            -sdk iphonesimulator \\
            -derivedDataPath build
'''

    @staticmethod
    def get_readme(project_name: str, framework: str, platforms: str,
                   navigation: str, state: str, testing: str, ci: str) -> str:
        """Generate README for React Native"""
        install_cmd = "npm install"
        run_cmd = "npm start" if framework == 'expo' else "npm run ios # or npm run android"

        return f'''# {project_name}

Mobile application built with {framework.replace('-', ' ').title()}

## Features

- **Framework:** {framework}
- **Platforms:** {platforms}
- **Navigation:** {navigation}
- **State Management:** {state}
- **Testing:** {testing}
- **CI/CD:** {ci}

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
{"- Xcode (for iOS development)" if platforms in ['ios', 'both'] else ""}
{"- Android Studio (for Android development)" if platforms in ['android', 'both'] else ""}
{"- Expo CLI: `npm install -g expo-cli`" if framework == 'expo' else ""}

### Installation

1. Install dependencies:
```bash
{install_cmd}
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration

### Running the App

```bash
{run_cmd}
```

### Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

### Building

#### iOS
```bash
npm run ios:build
```

#### Android
```bash
npm run android:build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── store/          # State management
├── hooks/          # Custom React hooks
├── services/       # API and external services
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
```

## Scripts

- `npm start` - Start development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code with Prettier

## Tech Stack

- **Language:** TypeScript
- **Framework:** {framework}
- **Navigation:** {navigation}
- **State:** {state}
- **Testing:** Jest, React Native Testing Library
- **Linting:** ESLint + Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

---

Generated with mobile_scaffolder.py
'''


# ============================================================================
# SECTION 4: FLUTTER TEMPLATES
# ============================================================================
# All Flutter and Dart specific file templates

class FlutterTemplates:
    """Templates for Flutter projects"""

    @staticmethod
    def get_pubspec_yaml(project_name: str, navigation: str, state: str,
                         testing: str) -> str:
        """Generate pubspec.yaml for Flutter"""
        deps = {
            "flutter": {"sdk": "flutter"},
            "cupertino_icons": "^1.0.2"
        }

        if navigation == 'go_router':
            deps["go_router"] = "^12.1.1"
        elif navigation == 'auto_route':
            deps["auto_route"] = "^7.8.4"

        if state == 'provider':
            deps["provider"] = "^6.1.1"
        elif state == 'riverpod':
            deps["flutter_riverpod"] = "^2.4.9"
            deps["riverpod_annotation"] = "^2.3.3"
        elif state == 'bloc':
            deps["flutter_bloc"] = "^8.1.3"
            deps["bloc"] = "^8.1.2"

        dev_deps = {
            "flutter_test": {"sdk": "flutter"},
            "flutter_lints": "^3.0.0"
        }

        if testing in ['integration', 'all']:
            dev_deps["integration_test"] = {"sdk": "flutter"}

        yaml = f'''name: {project_name.lower()}
description: Mobile application built with Flutter
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
'''
        for key, value in deps.items():
            if isinstance(value, dict):
                yaml += f'  {key}:\n    sdk: {value["sdk"]}\n'
            else:
                yaml += f'  {key}: {value}\n'

        yaml += '\ndev_dependencies:\n'
        for key, value in dev_deps.items():
            if isinstance(value, dict):
                yaml += f'  {key}:\n    sdk: {value["sdk"]}\n'
            else:
                yaml += f'  {key}: {value}\n'

        yaml += '''
flutter:
  uses-material-design: true

  # assets:
  #   - assets/images/
  #   - assets/fonts/
'''
        return yaml

    @staticmethod
    def get_analysis_options() -> str:
        """Generate analysis_options.yaml"""
        return '''include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - always_declare_return_types
    - always_require_non_null_named_parameters
    - avoid_print
    - avoid_empty_else
    - prefer_const_constructors
    - prefer_const_literals_to_create_immutables
    - prefer_single_quotes
    - sort_child_properties_last

analyzer:
  errors:
    missing_required_param: error
    missing_return: error
'''

    @staticmethod
    def get_main(project_name: str, navigation: str, state: str) -> str:
        """Generate Flutter main.dart"""
        if state == 'provider':
            wrapper = '''  runApp(
    MultiProvider(
      providers: [],
      child: const MyApp(),
    ),
  );'''
        elif state == 'riverpod':
            wrapper = '''  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );'''
        else:
            wrapper = '  runApp(const MyApp());'

        if navigation == 'go_router':
            router_setup = f'''  final router = AppRouter.router;

  @override
  Widget build(BuildContext context) {{
    return MaterialApp.router(
      title: '{project_name}',
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }}'''
        else:
            router_setup = f'''  @override
  Widget build(BuildContext context) {{
    return MaterialApp(
      title: '{project_name}',
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
    );
  }}'''

        return f'''import 'package:flutter/material.dart';
{("import 'package:flutter_riverpod/flutter_riverpod.dart';" if state == 'riverpod' else "")}
{("import 'package:provider/provider.dart';" if state == 'provider' else "")}
import 'core/theme/app_theme.dart';
{("import 'core/router/app_router.dart';" if navigation == 'go_router' else "")}
{("import 'features/home/presentation/screens/home_screen.dart';" if navigation != 'go_router' else "")}

void main() {{
{wrapper}
}}

class MyApp extends StatelessWidget {{
  const MyApp({{super.key}});

{router_setup}
}}'''

    @staticmethod
    def get_app_constants(project_name: str) -> str:
        """Generate app_constants.dart"""
        return f'''class AppConstants {{
  // App Information
  static const String appName = '{project_name}';
  static const String appVersion = '1.0.0';

  // API Configuration
  static const String apiBaseUrl = 'https://api.example.com';
  static const Duration apiTimeout = Duration(seconds: 30);

  // UI Constants
  static const double defaultPadding = 16.0;
  static const double defaultBorderRadius = 8.0;

  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 600);
}}'''

    @staticmethod
    def get_app_theme() -> str:
        """Generate app_theme.dart"""
        return '''import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.dark,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}'''

    @staticmethod
    def get_go_router() -> str:
        """Generate GoRouter configuration"""
        return '''import 'package:go_router/go_router.dart';
import '../../features/home/presentation/screens/home_screen.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
    ],
  );
}'''

    @staticmethod
    def get_provider_example() -> str:
        """Generate Provider example"""
        return '''import 'package:flutter/foundation.dart';

class ExampleProvider with ChangeNotifier {
  int _count = 0;

  int get count => _count;

  void increment() {
    _count++;
    notifyListeners();
  }

  void decrement() {
    _count--;
    notifyListeners();
  }

  void reset() {
    _count = 0;
    notifyListeners();
  }
}'''

    @staticmethod
    def get_riverpod_example() -> str:
        """Generate Riverpod example"""
        return '''import 'package:flutter_riverpod/flutter_riverpod.dart';

class Counter {
  const Counter(this.value);
  final int value;
}

class CounterNotifier extends StateNotifier<Counter> {
  CounterNotifier() : super(const Counter(0));

  void increment() {
    state = Counter(state.value + 1);
  }

  void decrement() {
    state = Counter(state.value - 1);
  }

  void reset() {
    state = const Counter(0);
  }
}

final counterProvider = StateNotifierProvider<CounterNotifier, Counter>((ref) {
  return CounterNotifier();
});'''

    @staticmethod
    def get_bloc_example() -> str:
        """Generate BLoC example"""
        return '''import 'package:flutter_bloc/flutter_bloc.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  HomeBloc() : super(HomeInitial()) {
    on<LoadHomeData>(_onLoadHomeData);
  }

  Future<void> _onLoadHomeData(
    LoadHomeData event,
    Emitter<HomeState> emit,
  ) async {
    emit(HomeLoading());
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));
      emit(HomeLoaded(data: 'Home data loaded successfully'));
    } catch (e) {
      emit(HomeError(message: e.toString()));
    }
  }
}'''

    @staticmethod
    def get_bloc_event() -> str:
        """Generate BLoC event"""
        return '''abstract class HomeEvent {}

class LoadHomeData extends HomeEvent {}'''

    @staticmethod
    def get_bloc_state() -> str:
        """Generate BLoC state"""
        return '''abstract class HomeState {}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  HomeLoaded({required this.data});
  final String data;
}

class HomeError extends HomeState {
  HomeError({required this.message});
  final String message;
}'''

    @staticmethod
    def get_home_screen(project_name: str) -> str:
        """Generate Flutter home screen"""
        return f'''import 'package:flutter/material.dart';
import '../../../../shared/widgets/custom_button.dart';

class HomeScreen extends StatelessWidget {{
  const HomeScreen({{super.key}});

  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(
        title: const Text('{project_name}'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Welcome to {project_name}',
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Start building your mobile app',
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              CustomButton(
                text: 'Get Started',
                onPressed: () {{
                  // Navigate to next screen
                }},
              ),
            ],
          ),
        ),
      ),
    );
  }}
}}'''

    @staticmethod
    def get_custom_button() -> str:
        """Generate Flutter custom button"""
        return '''import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.variant = ButtonVariant.primary,
  });

  final String text;
  final VoidCallback onPressed;
  final ButtonVariant variant;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: variant == ButtonVariant.primary
            ? theme.colorScheme.primary
            : theme.colorScheme.secondary,
        foregroundColor: Colors.white,
      ),
      child: Text(text),
    );
  }
}

enum ButtonVariant { primary, secondary }'''

    @staticmethod
    def get_widget_test(project_name: str) -> str:
        """Generate Flutter widget test"""
        return f'''import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:{project_name.lower()}/features/home/presentation/screens/home_screen.dart';

void main() {{
  testWidgets('HomeScreen displays welcome message', (WidgetTester tester) async {{
    await tester.pumpWidget(
      const MaterialApp(
        home: HomeScreen(),
      ),
    );

    expect(find.text('Welcome'), findsOneWidget);
    expect(find.text('Get Started'), findsOneWidget);
  }});

  testWidgets('Button tap triggers callback', (WidgetTester tester) async {{
    await tester.pumpWidget(
      const MaterialApp(
        home: HomeScreen(),
      ),
    );

    await tester.tap(find.text('Get Started'));
    await tester.pump();

    // Add assertions for navigation or state changes
  }});
}}'''

    @staticmethod
    def get_integration_test(project_name: str) -> str:
        """Generate Flutter integration test"""
        return f'''import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:{project_name.lower()}/main.dart' as app;

void main() {{
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {{
    testWidgets('app launches and displays home screen', (tester) async {{
      app.main();
      await tester.pumpAndSettle();

      expect(find.text('Welcome'), findsOneWidget);
    }});

    testWidgets('navigation flow works correctly', (tester) async {{
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();

      // Add navigation assertions
    }});
  }});
}}'''

    @staticmethod
    def get_github_actions() -> str:
        """Generate GitHub Actions workflow for Flutter"""
        return '''name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'

      - name: Get dependencies
        run: flutter pub get

      - name: Analyze
        run: flutter analyze

      - name: Run tests
        run: flutter test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build-android:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Get dependencies
        run: flutter pub get

      - name: Build APK
        run: flutter build apk --release

  build-ios:
    needs: test
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'

      - name: Get dependencies
        run: flutter pub get

      - name: Build iOS (no codesign)
        run: flutter build ios --release --no-codesign
'''

    @staticmethod
    def get_readme(project_name: str, platforms: str, navigation: str,
                   state: str, testing: str, ci: str) -> str:
        """Generate README for Flutter"""
        return f'''# {project_name}

Mobile application built with Flutter

## Features

- **Framework:** Flutter
- **Platforms:** {platforms}
- **Navigation:** {navigation}
- **State Management:** {state}
- **Testing:** {testing}
- **CI/CD:** {ci}

## Getting Started

### Prerequisites

- Flutter SDK 3.16.0+
- Dart 3.0.0+
{"- Xcode (for iOS development)" if platforms in ['ios', 'both'] else ""}
{"- Android Studio (for Android development)" if platforms in ['android', 'both'] else ""}

### Installation

1. Get dependencies:
```bash
flutter pub get
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration

### Running the App

```bash
# Debug mode
flutter run

# Release mode
flutter run --release
```

### Testing

```bash
# Run unit tests
flutter test

# Run with coverage
flutter test --coverage

# Run integration tests
flutter test integration_test/
```

### Building

#### Android APK
```bash
flutter build apk --release
```

#### Android App Bundle
```bash
flutter build appbundle --release
```

#### iOS
```bash
flutter build ios --release
```

## Project Structure

```
lib/
├── core/
│   ├── constants/    # App constants
│   ├── theme/        # Theme configuration
│   ├── router/       # Navigation setup
│   └── utils/        # Utility functions
├── features/
│   └── home/         # Feature modules
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/
    └── widgets/      # Reusable widgets
```

## Scripts

- `flutter run` - Run in debug mode
- `flutter test` - Run tests
- `flutter analyze` - Analyze code
- `flutter pub get` - Get dependencies

## Tech Stack

- **Language:** Dart
- **Framework:** Flutter
- **Navigation:** {navigation}
- **State:** {state}
- **Testing:** flutter_test
- **Architecture:** Clean Architecture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

---

Generated with mobile_scaffolder.py
'''


# ============================================================================
# SECTION 5: BASE SCAFFOLDER
# ============================================================================
# Common directory and file creation utilities

class BaseScaffolder:
    """Base class with common scaffolding utilities"""

    def __init__(self, project_path: Path, dry_run: bool = False,
                 verbose: bool = False):
        self.project_path = project_path
        self.dry_run = dry_run
        self.verbose = verbose
        self.files_created: List[str] = []
        self.dirs_created: List[str] = []

    def create_dir(self, path: str) -> None:
        """Create directory if not in dry run mode"""
        dir_path = self.project_path / path if path else self.project_path

        if self.verbose:
            prefix = '[DRY RUN] ' if self.dry_run else ''
            print(f"{prefix}Creating directory: {dir_path}")

        if not self.dry_run:
            dir_path.mkdir(parents=True, exist_ok=True)

        self.dirs_created.append(str(dir_path))

    def create_file(self, path: str, content: str) -> None:
        """Create file with content if not in dry run mode"""
        file_path = self.project_path / path

        if self.verbose:
            prefix = '[DRY RUN] ' if self.dry_run else ''
            print(f"{prefix}Creating file: {file_path}")

        if not self.dry_run:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

        self.files_created.append(str(file_path))


# ============================================================================
# SECTION 6: REACT NATIVE SCAFFOLDER
# ============================================================================
# React Native and Expo project structure and file generation

class ReactNativeScaffolder(BaseScaffolder):
    """Scaffolder for React Native and Expo projects"""

    def __init__(self, project_path: Path, project_name: str, framework: str,
                 navigation: str, state: str, testing: str, ci: str,
                 platforms: str, dry_run: bool = False, verbose: bool = False):
        super().__init__(project_path, dry_run, verbose)
        self.project_name = project_name
        self.framework = framework
        self.navigation = navigation
        self.state = state
        self.testing = testing
        self.ci = ci
        self.platforms = platforms

    def scaffold(self) -> None:
        """Generate React Native/Expo project structure"""
        logger.debug(f"Scaffolding {self.framework} project")

        self._create_directories()
        self._create_config_files()
        self._create_app_entry()
        self._create_navigation()
        self._create_state_management()
        self._create_components()
        self._create_testing()
        self._create_ci_cd()

    def _create_directories(self) -> None:
        """Create directory structure"""
        self.create_dir('')
        self.create_dir('src')
        self.create_dir('src/components')
        self.create_dir('src/screens')
        self.create_dir('src/navigation')
        self.create_dir('src/store')
        self.create_dir('src/hooks')
        self.create_dir('src/services')
        self.create_dir('src/utils')
        self.create_dir('src/types')
        self.create_dir('src/assets')
        self.create_dir('src/assets/images')
        self.create_dir('src/assets/fonts')

        if self.testing in ['unit', 'all']:
            self.create_dir('__tests__')
            self.create_dir('__tests__/components')
            self.create_dir('__tests__/screens')
            self.create_dir('__tests__/utils')

        if self.testing in ['e2e', 'all']:
            self.create_dir('e2e')
            self.create_dir('e2e/tests')

        if self.ci == 'github-actions':
            self.create_dir('.github')
            self.create_dir('.github/workflows')

    def _create_config_files(self) -> None:
        """Create configuration files"""
        self.create_file('package.json', ReactNativeTemplates.get_package_json(
            self.project_name, self.framework, self.navigation,
            self.state, self.testing))
        self.create_file('tsconfig.json', ReactNativeTemplates.get_tsconfig())
        self.create_file('babel.config.js', ReactNativeTemplates.get_babel_config(self.framework))
        self.create_file('.eslintrc.js', ReactNativeTemplates.get_eslint_config())
        self.create_file('.prettierrc', ReactNativeTemplates.get_prettier_config())
        self.create_file('.env.example', CommonTemplates.get_env_example())
        self.create_file('.gitignore', CommonTemplates.get_gitignore_react_native())
        self.create_file('README.md', ReactNativeTemplates.get_readme(
            self.project_name, self.framework, self.platforms,
            self.navigation, self.state, self.testing, self.ci))

    def _create_app_entry(self) -> None:
        """Create app entry point files"""
        if self.framework == 'expo':
            self.create_file('App.tsx', ReactNativeTemplates.get_expo_app(self.navigation))
            self.create_file('app.json', ReactNativeTemplates.get_expo_app_json(self.project_name))
        else:
            self.create_file('index.js', ReactNativeTemplates.get_rn_index())
            self.create_file('App.tsx', ReactNativeTemplates.get_rn_app(self.navigation))
            self.create_file('metro.config.js', ReactNativeTemplates.get_metro_config())

    def _create_navigation(self) -> None:
        """Create navigation files"""
        if self.navigation == 'react-navigation':
            self.create_file('src/navigation/RootNavigator.tsx',
                             ReactNativeTemplates.get_root_navigator())
            self.create_file('src/navigation/types.ts',
                             ReactNativeTemplates.get_navigation_types())

    def _create_state_management(self) -> None:
        """Create state management files"""
        if self.state == 'redux':
            self.create_file('src/store/index.ts', ReactNativeTemplates.get_redux_store())
            self.create_file('src/store/slices/exampleSlice.ts',
                             ReactNativeTemplates.get_redux_slice())
        elif self.state == 'zustand':
            self.create_file('src/store/useExampleStore.ts',
                             ReactNativeTemplates.get_zustand_store())

    def _create_components(self) -> None:
        """Create sample components and screens"""
        self.create_file('src/screens/HomeScreen.tsx',
                         ReactNativeTemplates.get_home_screen(self.project_name))
        self.create_file('src/components/Button.tsx',
                         ReactNativeTemplates.get_button_component())

    def _create_testing(self) -> None:
        """Create testing setup files"""
        if self.testing in ['unit', 'all']:
            self.create_file('jest.config.js', ReactNativeTemplates.get_jest_config())
            self.create_file('__tests__/App.test.tsx', ReactNativeTemplates.get_app_test())

        if self.testing in ['e2e', 'all']:
            self.create_file('e2e/.detoxrc.js', ReactNativeTemplates.get_detox_config())
            self.create_file('e2e/tests/app.e2e.ts', ReactNativeTemplates.get_e2e_test())

    def _create_ci_cd(self) -> None:
        """Create CI/CD configuration"""
        if self.ci == 'github-actions':
            self.create_file('.github/workflows/ci.yml',
                             ReactNativeTemplates.get_github_actions(self.project_name))


# ============================================================================
# SECTION 7: FLUTTER SCAFFOLDER
# ============================================================================
# Flutter project structure and file generation

class FlutterScaffolder(BaseScaffolder):
    """Scaffolder for Flutter projects"""

    def __init__(self, project_path: Path, project_name: str,
                 navigation: str, state: str, testing: str, ci: str,
                 platforms: str, dry_run: bool = False, verbose: bool = False):
        super().__init__(project_path, dry_run, verbose)
        self.project_name = project_name
        self.navigation = navigation
        self.state = state
        self.testing = testing
        self.ci = ci
        self.platforms = platforms

    def scaffold(self) -> None:
        """Generate Flutter project structure"""
        logger.debug("Scaffolding Flutter project")

        self._create_directories()
        self._create_config_files()
        self._create_core_files()
        self._create_navigation()
        self._create_state_management()
        self._create_components()
        self._create_testing()
        self._create_ci_cd()

    def _create_directories(self) -> None:
        """Create directory structure"""
        self.create_dir('')
        self.create_dir('lib')
        self.create_dir('lib/core')
        self.create_dir('lib/core/constants')
        self.create_dir('lib/core/theme')
        self.create_dir('lib/core/utils')
        self.create_dir('lib/features')
        self.create_dir('lib/features/home')
        self.create_dir('lib/features/home/presentation')
        self.create_dir('lib/features/home/presentation/screens')
        self.create_dir('lib/features/home/presentation/widgets')
        self.create_dir('lib/shared')
        self.create_dir('lib/shared/widgets')

        if self.testing in ['unit', 'integration', 'all']:
            self.create_dir('test')
            self.create_dir('test/features')
            self.create_dir('test/features/home')

        if self.testing in ['integration', 'all']:
            self.create_dir('integration_test')

        self.create_dir('assets')
        self.create_dir('assets/images')
        self.create_dir('assets/fonts')

        if self.ci == 'github-actions':
            self.create_dir('.github')
            self.create_dir('.github/workflows')

    def _create_config_files(self) -> None:
        """Create configuration files"""
        self.create_file('pubspec.yaml', FlutterTemplates.get_pubspec_yaml(
            self.project_name, self.navigation, self.state, self.testing))
        self.create_file('analysis_options.yaml', FlutterTemplates.get_analysis_options())
        self.create_file('.env.example', CommonTemplates.get_env_example())
        self.create_file('.gitignore', CommonTemplates.get_gitignore_flutter())
        self.create_file('README.md', FlutterTemplates.get_readme(
            self.project_name, self.platforms, self.navigation,
            self.state, self.testing, self.ci))

    def _create_core_files(self) -> None:
        """Create core application files"""
        self.create_file('lib/main.dart', FlutterTemplates.get_main(
            self.project_name, self.navigation, self.state))
        self.create_file('lib/core/constants/app_constants.dart',
                         FlutterTemplates.get_app_constants(self.project_name))
        self.create_file('lib/core/theme/app_theme.dart',
                         FlutterTemplates.get_app_theme())

    def _create_navigation(self) -> None:
        """Create navigation files"""
        if self.navigation == 'go_router':
            self.create_dir('lib/core/router')
            self.create_file('lib/core/router/app_router.dart',
                             FlutterTemplates.get_go_router())

    def _create_state_management(self) -> None:
        """Create state management files"""
        if self.state == 'provider':
            self.create_dir('lib/core/providers')
            self.create_file('lib/core/providers/example_provider.dart',
                             FlutterTemplates.get_provider_example())
        elif self.state == 'riverpod':
            self.create_dir('lib/core/providers')
            self.create_file('lib/core/providers/example_provider.dart',
                             FlutterTemplates.get_riverpod_example())
        elif self.state == 'bloc':
            self.create_dir('lib/features/home/presentation/bloc')
            self.create_file('lib/features/home/presentation/bloc/home_bloc.dart',
                             FlutterTemplates.get_bloc_example())
            self.create_file('lib/features/home/presentation/bloc/home_event.dart',
                             FlutterTemplates.get_bloc_event())
            self.create_file('lib/features/home/presentation/bloc/home_state.dart',
                             FlutterTemplates.get_bloc_state())

    def _create_components(self) -> None:
        """Create sample screens and widgets"""
        self.create_file('lib/features/home/presentation/screens/home_screen.dart',
                         FlutterTemplates.get_home_screen(self.project_name))
        self.create_file('lib/shared/widgets/custom_button.dart',
                         FlutterTemplates.get_custom_button())

    def _create_testing(self) -> None:
        """Create testing setup files"""
        if self.testing in ['unit', 'all']:
            self.create_file('test/features/home/home_screen_test.dart',
                             FlutterTemplates.get_widget_test(self.project_name))

        if self.testing in ['integration', 'all']:
            self.create_file('integration_test/app_test.dart',
                             FlutterTemplates.get_integration_test(self.project_name))

    def _create_ci_cd(self) -> None:
        """Create CI/CD configuration"""
        if self.ci == 'github-actions':
            self.create_file('.github/workflows/ci.yml',
                             FlutterTemplates.get_github_actions())


# ============================================================================
# SECTION 8: CORE ORCHESTRATOR
# ============================================================================
# Main orchestration, validation, and framework routing

class MobileScaffolder:
    """Main orchestrator for mobile project scaffolding"""

    # Default navigation per framework
    DEFAULT_NAVIGATION = {
        'react-native': 'react-navigation',
        'expo': 'react-navigation',
        'flutter': 'go_router'
    }

    # Default state management per framework
    DEFAULT_STATE = {
        'react-native': 'zustand',
        'expo': 'zustand',
        'flutter': 'riverpod'
    }

    def __init__(self, project_name: str, **options):
        verbose = options.get('verbose', False)
        if verbose:
            logging.getLogger().setLevel(logging.DEBUG)

        self.project_name = project_name
        self.framework = options.get('framework', 'react-native')
        self.platforms = options.get('platforms', 'both')
        self.navigation = options.get('navigation') or self.DEFAULT_NAVIGATION.get(self.framework, 'none')
        self.state = options.get('state') or self.DEFAULT_STATE.get(self.framework, 'none')
        self.testing = options.get('testing', 'all')
        self.ci = options.get('ci', 'github-actions')
        self.output_dir = Path(options.get('output_dir', '.'))
        self.dry_run = options.get('dry_run', False)
        self.verbose = verbose

        self.project_path = self.output_dir / self.project_name
        self._scaffolder: Optional[BaseScaffolder] = None

        logger.debug("MobileScaffolder initialized")

    # -------------------------------------------------------------------------
    # Validation Helper Methods (extracted for reduced complexity)
    # -------------------------------------------------------------------------

    def _validate_project_name(self) -> Optional[str]:
        """Validate project name. Returns error message or None."""
        if not self.project_name:
            logger.warning("Project name is missing")
            return "Project name is required"

        if not self.project_name.replace('-', '').replace('_', '').isalnum():
            return f"Invalid project name: {self.project_name} (use alphanumeric, hyphens, underscores)"

        return None

    def _validate_enum_value(self, value: str, valid_values: List[str],
                              field_name: str, context: str = "") -> Optional[str]:
        """Validate enum value. Returns error message or None."""
        if value not in valid_values:
            ctx = f" for {context}" if context else ""
            return f"Invalid {field_name}{ctx}: {value}. Choose from: {', '.join(valid_values)}"
        return None

    def _validate_framework_option(self, value: str, options_map: Dict[str, List[str]],
                                    option_name: str) -> Optional[str]:
        """Validate framework-specific option. Returns error message or None."""
        valid_options = options_map.get(self.framework, [])
        if value not in valid_options:
            return f"Invalid {option_name} for {self.framework}: {value}. Choose from: {', '.join(valid_options)}"
        return None

    # -------------------------------------------------------------------------
    # Public Methods
    # -------------------------------------------------------------------------

    def validate(self) -> List[str]:
        """Validate configuration and return list of errors"""
        logger.debug("Validating configuration")
        errors = []

        # Validate project name
        error = self._validate_project_name()
        if error:
            errors.append(error)

        # Validate framework
        error = self._validate_enum_value(self.framework, FRAMEWORKS, "framework")
        if error:
            errors.append(error)

        # Validate platforms
        error = self._validate_enum_value(self.platforms, PLATFORMS, "platforms")
        if error:
            errors.append(error)

        # Validate navigation (framework-specific)
        error = self._validate_framework_option(self.navigation, NAVIGATION, "navigation")
        if error:
            errors.append(error)

        # Validate state management (framework-specific)
        error = self._validate_framework_option(self.state, STATE_MANAGEMENT, "state management")
        if error:
            errors.append(error)

        # Validate testing
        error = self._validate_enum_value(self.testing, TESTING_TYPES, "testing")
        if error:
            errors.append(error)

        # Validate CI
        error = self._validate_enum_value(self.ci, CI_PLATFORMS, "CI platform")
        if error:
            errors.append(error)

        # Check if project directory exists
        if self.project_path.exists() and not self.dry_run:
            errors.append(f"Project directory already exists: {self.project_path}")

        return errors

    def scaffold(self) -> Dict[str, Any]:
        """Generate the project structure"""
        logger.debug("Starting scaffold generation")
        start_time = datetime.now()

        if self.verbose:
            print(f"Scaffolding {self.framework} project: {self.project_name}")
            print(f"Platform(s): {self.platforms}")
            print(f"Navigation: {self.navigation}")
            print(f"State: {self.state}")
            print(f"Testing: {self.testing}")
            print(f"CI/CD: {self.ci}")
            print(f"Dry run: {self.dry_run}\n")

        # Create appropriate scaffolder based on framework
        if self.framework in ['react-native', 'expo']:
            self._scaffolder = ReactNativeScaffolder(
                project_path=self.project_path,
                project_name=self.project_name,
                framework=self.framework,
                navigation=self.navigation,
                state=self.state,
                testing=self.testing,
                ci=self.ci,
                platforms=self.platforms,
                dry_run=self.dry_run,
                verbose=self.verbose
            )
        elif self.framework == 'flutter':
            self._scaffolder = FlutterScaffolder(
                project_path=self.project_path,
                project_name=self.project_name,
                navigation=self.navigation,
                state=self.state,
                testing=self.testing,
                ci=self.ci,
                platforms=self.platforms,
                dry_run=self.dry_run,
                verbose=self.verbose
            )

        # Execute scaffolding
        if self._scaffolder:
            self._scaffolder.scaffold()

        end_time = datetime.now()
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        return {
            "status": "success",
            "project_name": self.project_name,
            "framework": self.framework,
            "project_path": str(self.project_path),
            "files_created": len(self._scaffolder.files_created) if self._scaffolder else 0,
            "directories_created": len(self._scaffolder.dirs_created) if self._scaffolder else 0,
            "duration_ms": duration_ms,
            "configuration": {
                "platforms": self.platforms,
                "navigation": self.navigation,
                "state_management": self.state,
                "testing": self.testing,
                "ci_cd": self.ci
            }
        }


# ============================================================================
# SECTION 9: OUTPUT FORMATTING
# ============================================================================
# Text and JSON output formatting functions

def format_text_output(results: Dict[str, Any], verbose: bool = False) -> str:
    """Format results as human-readable text"""
    output = "=" * 60 + "\n"
    output += "Mobile Project Scaffolding Complete\n"
    output += "=" * 60 + "\n\n"

    output += f"Status: {results['status']}\n"
    output += f"Project: {results['project_name']}\n"
    output += f"Framework: {results['framework']}\n"
    output += f"Location: {results['project_path']}\n\n"

    output += "Configuration:\n"
    config = results['configuration']
    output += f"  Platforms: {config['platforms']}\n"
    output += f"  Navigation: {config['navigation']}\n"
    output += f"  State Management: {config['state_management']}\n"
    output += f"  Testing: {config['testing']}\n"
    output += f"  CI/CD: {config['ci_cd']}\n\n"

    output += "Created:\n"
    output += f"  {results['directories_created']} directories\n"
    output += f"  {results['files_created']} files\n"
    output += f"  Duration: {results['duration_ms']}ms\n\n"

    output += "Next Steps:\n"
    output += f"  cd {results['project_name']}\n"

    if results['framework'] in ['react-native', 'expo']:
        output += "  npm install\n"
        output += "  cp .env.example .env\n"
        if results['framework'] == 'expo':
            output += "  npm start\n"
        else:
            output += "  npm run ios  # or npm run android\n"
    else:
        output += "  flutter pub get\n"
        output += "  cp .env.example .env\n"
        output += "  flutter run\n"

    output += "\n" + "=" * 60 + "\n"

    return output


def format_json_output(results: Dict[str, Any]) -> str:
    """Format results as JSON with metadata"""
    output = {
        "metadata": {
            "tool": "mobile_scaffolder.py",
            "version": "1.1.0",
            "timestamp": datetime.now().astimezone().isoformat()
        },
        "results": results
    }
    return json.dumps(output, indent=2)


# ============================================================================
# SECTION 10: CLI ENTRY POINT
# ============================================================================
# Main function and argument parsing

def main():
    """Main entry point with CLI argument parsing"""
    parser = argparse.ArgumentParser(
        description='Generate cross-platform mobile project structures',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s MyApp
  %(prog)s MyApp --framework react-native --platforms both
  %(prog)s MyApp -f flutter --state riverpod --testing all
  %(prog)s MyApp -f expo --ci github-actions --dry-run
  %(prog)s MyApp -f react-native -p ios --navigation react-navigation -v

Frameworks:
  react-native   React Native with TypeScript
  flutter        Flutter with Dart
  expo           Expo managed workflow

Navigation:
  React Native:  react-navigation, none
  Flutter:       go_router, auto_route, none

State Management:
  React Native:  redux, zustand, none
  Flutter:       provider, riverpod, bloc, none

For more information, see:
skills/engineering-team/senior-mobile/SKILL.md
        """
    )

    # Positional argument
    parser.add_argument(
        'project_name',
        help='Name of the project to create'
    )

    # Optional arguments
    parser.add_argument(
        '--framework', '-f',
        choices=FRAMEWORKS,
        default='react-native',
        help='Mobile framework (default: react-native)'
    )

    parser.add_argument(
        '--platforms', '-p',
        choices=PLATFORMS,
        default='both',
        help='Target platforms (default: both)'
    )

    parser.add_argument(
        '--navigation',
        help='Navigation library (auto-detected based on framework)'
    )

    parser.add_argument(
        '--state',
        help='State management (auto-detected based on framework)'
    )

    parser.add_argument(
        '--testing',
        choices=TESTING_TYPES,
        default='all',
        help='Testing setup (default: all)'
    )

    parser.add_argument(
        '--ci',
        choices=CI_PLATFORMS,
        default='github-actions',
        help='CI/CD platform (default: github-actions)'
    )

    parser.add_argument(
        '--output-dir', '-d',
        default='.',
        help='Output directory (default: current directory)'
    )

    parser.add_argument(
        '--output', '-o',
        choices=['text', 'json'],
        default='text',
        help='Output format (default: text)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be created without creating'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )

    parser.add_argument(
        '--version',
        action='version',
        version='%(prog)s 1.1.0'
    )

    args = parser.parse_args()

    try:
        # Create scaffolder instance
        scaffolder = MobileScaffolder(
            project_name=args.project_name,
            framework=args.framework,
            platforms=args.platforms,
            navigation=args.navigation,
            state=args.state,
            testing=args.testing,
            ci=args.ci,
            output_dir=args.output_dir,
            dry_run=args.dry_run,
            verbose=args.verbose
        )

        # Validate configuration
        errors = scaffolder.validate()
        if errors:
            print("Validation errors:", file=sys.stderr)
            for error in errors:
                print(f"  - {error}", file=sys.stderr)
            sys.exit(1)

        # Scaffold project
        results = scaffolder.scaffold()

        # Format and output results
        if args.output == 'json':
            output = format_json_output(results)
        else:
            output = format_text_output(results, verbose=args.verbose)

        print(output)
        sys.exit(0)

    except KeyboardInterrupt:
        print("\nOperation cancelled by user", file=sys.stderr)
        sys.exit(130)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
