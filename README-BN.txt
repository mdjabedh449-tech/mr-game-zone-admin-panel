M.R GAME ZONE — ADMIN PANEL
=============================

এই ZIP-এ আছে:
- admin.html       : Admin Panel-এর পেজ
- admin.css        : Black & Gold responsive design
- admin.js         : Firebase Login, Product CRUD, Order status
- firestore.rules : Firestore security rules

গুরুত্বপূর্ণ:
এই Admin Panel আপনার বর্তমান storefront-এর সঙ্গে নিজে থেকে যুক্ত হয়ে যাবে না। Storefront-এর product/order collection-এর নাম ও data field একই হতে হবে। এখানে collection নাম রাখা হয়েছে:
  products
  orders

শুরু করার ধাপ:
1. Firebase Console খুলুন: https://console.firebase.google.com/
2. আপনার ওয়েবসাইটের Firebase project নির্বাচন করুন।
3. Project settings > General > Your apps থেকে Web App config কপি করুন।
4. admin.js ফাইলে firebaseConfig-এর YOUR_... মানগুলো নিজের config দিয়ে বদলান।
5. Firebase Console > Authentication > Sign-in method থেকে Email/Password চালু করুন।
6. Authentication > Users থেকে নিজের Admin account তৈরি করুন।
7. ওই user-এর UID কপি করে admin.js-এর ADMIN_UID-তে বসান।
8. একই UID firestore.rules-এর PASTE_ADMIN_USER_UID_HERE জায়গায় বসান।
9. Firestore Database > Rules-এ firestore.rules-এর কোড প্রকাশ করুন।
10. admin.html, admin.css ও admin.js একই folder-এ রাখুন।
11. ES module ব্যবহারের কারণে সরাসরি file:// দিয়ে না খুলে GitHub Pages/hosting বা local web server দিয়ে চালান।

নিরাপত্তা:
- Firebase config ওয়েব অ্যাপে থাকা স্বাভাবিক; এটি password নয়।
- Admin password বা private key কখনো HTML/JS ফাইলে লিখবেন না।
- Firestore rules প্রকাশ না করলে শুধু UI-তে Admin UID চেক যথেষ্ট নিরাপত্তা নয়।
- নিজের storefront-এ order create করার নিয়ম আলাদা হলে firestore.rules-এর create rule যথাযথভাবে বদলাতে হবে।
- Admin UID কাউকে দেবেন না।

Storefront সংযোগ:
আপনার মূল ওয়েবসাইটের product collection এবং order collection যদি products/orders না হয়,
তাহলে admin.js ও firestore.rules-এ collection নাম মিলিয়ে নিতে হবে।
বর্তমান ওয়েবসাইটের ZIP দিলে তার structure অনুযায়ী integration করা যাবে।

এই starter panel-এ আছে:
- Admin email/password login
- Admin UID allowlist check
- Dashboard counts
- Product add/edit/delete
- Orders list
- Order status update
- Mobile responsive layout

এটি Firebase project config ও rules বসানোর পরই কাজ করবে।
