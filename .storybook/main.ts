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
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: '../customVite.config.js',
      },
    },
  },
  framework: { name: '@storybook/nextjs', options: {} },
  
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Add TypeScript support
    

    // Add CSS support
    config.module!.rules!.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      include: path.resolve(__dirname, '../'),
    });

    // Add support for other assets (images, fonts, etc.)
    config.module!.rules!.push({
      test: /\.(png|jpe?g|gif|svg|woff|woff2|eot|ttf|otf)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        },
      ],
    });
    // Suppress warnings for dynamic dependencies
    config.plugins!.push(
      new webpack.ContextReplacementPlugin(
        /@jest\/reporters\/build/,
        path.resolve(__dirname, '../')
      )
    );


    return config;
  },
};

export default config;