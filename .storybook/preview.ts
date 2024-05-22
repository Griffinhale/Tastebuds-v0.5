import type { Preview } from "@storybook/nextjs";
import { getMock } from 'storybook-addon-module-mock';
import { withTests } from '@storybook/addon-jest';
import results from '../.jest-test-results.json';

export const decorators = [
  withTests({
    results,
  }),
];
import '../jest.setup.js';
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  tags: ["autodocs", "autodocs"]
};

export default preview;
