import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { createMock } from 'storybook-addon-module-mock';
import HomePage from './HomePage';

// Ensure jest is available in the global scope
if (typeof jest === 'undefined') {
  global.jest = require('jest');
}

// Mocking supabase client for Storybook
jest.mock('../../utils/supabaseClient', () => ({
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      order: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              type: 'added',
              user_name: 'John Doe',
              user_id: '1',
              destination: '/item/1',
              list_id: '1',
              list_name: 'Favorites',
              item_id: '1',
              item_title: 'Example Item',
              created_at: '2023-05-20T12:34:56Z',
              cover: 'https://via.placeholder.com/150',
            },
          ],
          error: null,
        }),
      }),
    }),
  }),
}));

const meta: Meta<typeof HomePage> = {
  title: 'Components/HomePage',
  component: HomePage,
};

export default meta;

type Story = StoryObj<typeof HomePage>;

export const Default: Story = {
  args: {},
};

export const WithActivity: Story = {
  args: {},
  decorators: [
    (Story) => {
      
      createMock({
        module: '../../utils/supabaseClient',
        export: 'from',
        mock: () => ({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: 1,
                    type: 'added',
                    user_name: 'John Doe',
                    user_id: '1',
                    destination: '/item/1',
                    list_id: '1',
                    list_name: 'Favorites',
                    item_id: '1',
                    item_title: 'Example Item',
                    created_at: '2023-05-20T12:34:56Z',
                    cover: 'https://via.placeholder.com/150',
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      });
      
      
      return Story();
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const headerElement = await canvas.findByText(/Recent Activity/i);
    expect(headerElement).toBeInTheDocument();

    const activityItem = await canvas.findByText(/Example Item/i);
    expect(activityItem).toBeInTheDocument();
  },
};