import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the Item type
export interface Item {
  id: number;
  name: string;
  // Add other fields as needed
}

export const itemsApi = createApi({
  reducerPath: "itemsApi",
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5001/api' }),
  endpoints: (build) => ({
    getItems: build.query<Item[], string>({
      query: (q) => ({
        url: 'items',
        params: { q }
      })
    })
  })
})

export const { useLazyGetItemsQuery } = itemsApi;