# 🛍️ LUXE – Premium E-Commerce Store

## Project Overview

LUXE is a simple and modern online shopping website. It is built using **HTML, CSS, and Vanilla JavaScript**. No JavaScript frameworks are used. The website gets product data from the **FakeStore API**.

---

# Project Structure

```
ecommerce-store/
│
├── index.html
│
├── css/
│   ├── style.css
│   ├── dark-mode.css
│   └── skeleton.css
│
├── js/
│   ├── api.js
│   ├── ui.js
│   ├── filters.js
│   ├── cart.js
│   ├── products.js
│   └── app.js
│
└── README.md
```

---

# File Explanation

## index.html

This is the main file of the website. It contains the basic structure of the webpage.

### CSS Folder

### style.css

This file contains the main design of the website, including colors, layout, buttons, and product cards.

### dark-mode.css

This file contains the styles used when Dark Mode is turned on.

### skeleton.css

This file creates loading placeholders while products are being loaded from the API.

### JavaScript Folder

### api.js

This file connects the website to the FakeStore API and downloads product information.

### ui.js

This file controls the user interface, such as:

* Product popup
* Cart drawer
* Toast messages
* Dark mode
* FAQ section

### filters.js

This file manages:

* Product search
* Category filter
* Product sorting

### cart.js

This file manages the shopping cart. It allows users to:

* Add products
* Remove products
* Change quantity
* Save cart using Local Storage

### products.js

This file displays all products on the page. It also manages:

* Wishlist
* Compare products
* Product cards
* Loading skeleton

### app.js

This is the main JavaScript file. It starts the website and connects all other JavaScript files together.

---

# How to Run the Project

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension.
3. Right-click on **index.html**.
4. Click **Open with Live Server**.
5. The website will open in your browser.

**Note:** An internet connection is required because products are loaded from the FakeStore API.

---

# Features

### Product Grid

Shows all products from the FakeStore API.

### Search and Filter

Users can search products, filter by category, and sort products easily.

### Wishlist

Users can save their favorite products. The wishlist is stored in Local Storage.

### Shopping Cart

Users can add products, remove products, change quantity, and see the total price.

### Checkout

Shows an order confirmation with the selected products.

### Compare Products

Users can compare up to three products at the same time.

### Dark Mode

Users can switch between Light Mode and Dark Mode. The selected mode is saved automatically.

### Responsive Design

The website works well on desktop, tablet, and mobile devices.

### Accessibility

The website supports keyboard navigation and includes accessibility features for a better user experience.

---
# JavaScript File Order

The JavaScript files must be loaded in this order because each file depends on the previous one.

1. api.js – Loads product data from the API.
2. ui.js – Controls the user interface.
3. filters.js – Handles search, filter, and sorting.
4. cart.js – Manages the shopping cart.
5. products.js – Displays products on the page.
6. app.js – Starts the entire application.

---

# Customization

You can easily change different parts of the project:

* Edit **style.css** to change colors, fonts, and layout.
* Edit **dark-mode.css** to change Dark Mode colors.
* Change **BATCH_SIZE** in **products.js** to display more or fewer products at one time.
* Change **API_BASE** in **api.js** if you want to use another API instead of FakeStore API.

---

# Technologies Used

* HTML5
* CSS3
* Vanilla JavaScript
* FakeStore API
* Local Storage

---

# Conclusion

This project is a fully responsive e-commerce website. It includes modern features such as product search, category filtering, shopping cart, wishlist, compare products, checkout, and Dark Mode. It is built using only HTML, CSS, and JavaScript without using any frameworks.

# output screenshot:

# Desktop:

![alt text](<Screenshot 2026-06-30 091110-2.png>)

![alt text](<Screenshot 2026-06-30 091259-2.png>)

![alt text](<Screenshot 2026-06-30 131435.png>)

![alt text](<Screenshot 2026-06-30 131450.png>)


# mobile screenshot:

![alt text](<Screenshot 2026-06-30 124824.png>)

![alt text](<Screenshot 2026-06-30 124833.png>)

![alt text](<Screenshot 2026-06-30 131918.png>)

# ipad :

![alt text](<Screenshot 2026-06-30 130436.png>)

![alt text](<Screenshot 2026-06-30 131859.png>)


# video link + live demo :

  https://drive.google.com/file/d/1PhAn8lrs3_GMa-7zna2JJdm1OSwKIiDP/view?usp=drivesdk


