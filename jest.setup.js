import '@test/jest-dom/extend-expect';
import { setGlobalConfig } from '@storybook/testing-react';
import * as globalStorybookConfig from './.storybook/preview';

// Apply the global configuration to all tests
setGlobalConfig(globalStorybookConfig);