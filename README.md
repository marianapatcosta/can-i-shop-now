# Can I Shop Now?

Can I show Now? is a fullstack application that tracks the prices of products of some fashion stores and sends an email to the user when the size they need becomes available or the price decreases.

The application was developed with the following technologies:

- TypeScript
- React
- NextJS
- NextJS OAuth
- TailwindCSS
- React Query
- Zustand
- Prisma
- Postgressql


![can-i-shop-now](https://github.com/marianapatcosta/can-i-shop-now/assets/43031902/d5641bec-7ed9-41fa-b99d-b043458fefeb)


Check it [here](https://can-i-shop-now.vercel.app/)!

## Add a Store

- Add new Store in `Store` type in `src\types.ts` file
- Implement a new scrapper in `src\api-utils\productScrappers` directory
- Add scrapper to `scrapperMapper` in `src\api-utils\productScrappers\index.ts` file

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
