import type { StorybookConfig } from "@storybook/nextjs";
import path from 'path';
import webpack from 'webpack';


const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/builder-vite",
    "@chromatic-com/storybook",
    "storybook-addon-module-mock",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-babel"
  ],
  
  framework: { name: '@storybook/nextjs', options: {} },
  
  staticDirs: ['../public'],
  
  
};

export default config;