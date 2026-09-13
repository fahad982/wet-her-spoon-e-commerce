# WET HER SPOON E-Commerce

Lovable Build Prompt — Female Fashion E-Commerce Site

Copy and paste everything below into Lovable:

Build a modern, minimal e-commerce website for a female clothing and accessories brand, inspired by Zara's website structure, layout, and UX. Use a clean, high-end fashion aesthetic: large product photography, generous white space, minimal text clutter, and a grid-based product layout.

Scope: This is a B2C (business-to-consumer) single-vendor store — one seller (the site owner) uploads and manages all products; customers only browse and purchase. No multi-vendor or B2B/wholesale features needed.

Branding

Use my existing logo, color palette, and fonts (I will upload brand assets)

Use my existing product photography (I will upload images)

Product category structure should mirror Zara's (e.g. New In, Clothing, Accessories, Sale, etc. — female-only, no menswear or kids)

Homepage

Large hero banner/imagery, minimal-text style like Zara

Featured/New Arrivals section

Clean grid-based category navigation

Product Catalog

Categories and subcategories for women's clothing and accessories

Each product supports multiple size and color variants

Out-of-stock handling with a "Notify Me" option for sold-out sizes/colors

Product detail page includes a size guide

"You may also like" and "Complete the look" recommendation sections on product pages

Filtering and sorting by size, color, price, category, and newest arrivals

Wishlist/Favorites feature (saved to user account)

Accounts & Auth

Account creation required to checkout (no guest checkout)

Sign up/login via: email + phone number, and Google sign-in

During signup/first visit, prompt user to select their country/region

Currency

Multi-currency support — user can manually select their preferred currency

Default/primary currencies: NGN (₦), USD ($), and GBP (£)

Selected country/region should suggest a default currency, but user can override it

Checkout & Payments

Integrate PayPal as the payment gateway

Shipping options: flat rate, location-based calculated rates, and a free-shipping threshold

No returns/exchanges automation needed for now (handled manually via email/phone)

Admin Panel (Critical)

Build a super admin dashboard for the site owner (non-technical user) to independently:

Add/edit/delete products (images, descriptions, prices, sizes, colors, stock levels)

Publish or unpublish products to go live

Manage inventory and stock levels

View and manage customer orders

View basic customer/account info

Admin UI must be simple, intuitive, and require no coding knowledge — the owner will run this solo with no developer support post-launch

Design Direction

Aesthetic: minimal, elegant, fashion-forward — similar visual language to Zara.com

Mobile-responsive throughout

Fast-loading, image-optimized product pages

Notes for me to fill in before/while using this prompt:

Upload logo, brand colors/fonts, and product photos when prompted by Lovable

Have real product data ready (at least a few sample products) to test the catalog and admin panel

Confirm PayPal business account is set up (note: PayPal settles in USD/GBP, not NGN — may want to revisit Paystack/Flutterwave for Nigerian customers later) , the name of the site is note; "WET HER SPOON" it is an all female clothing website, dresses only, no shoes, no accessories we are still trying to set up the business paypal, we are not in a rush

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ab6ed811-1eff-4fa8-b861-e1ce60499c0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
