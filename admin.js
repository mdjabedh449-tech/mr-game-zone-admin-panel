// M.R GAME ZONE Admin Panel — Firebase Authentication + Realtime Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, onValue, push, set, update, remove } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSZDoy8qcAgGR_qk4vZ5rWGlvID4t8B7Q",
  authDomain: "mr-game-shop-9f914.firebaseapp.com",
  databaseURL: "https://mr-game-shop-9f914-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mr-game-shop-9f914",
  storageBucket: "mr-game-shop-9f914.firebasestorage.app",
  messagingSenderId: "709309210572",
  appId: "1:709309210572:web:02e664a71cee8165874769"
};
const ADMIN_UID = "MYGho0eVmHMWPV9n9GFSmO3XvC62";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const $ = id => document.getElementById(id);
let products = {};
let orders = {};
let stopProducts = null;
let stopOrders = null;

function showLogin(message="") {
  $("loginPage")?.classList.remove("hidden");
  $("app")?.classList.add("hidden");
  if ($("loginMsg")) $("loginMsg").textContent=message;
}
function showPage(name) {
  ["dashboard","products","orders"].forEach(p=>$ (p+"Page")?.classList.toggle("hidden",p!==name));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
  $("pageTitle").textContent=({dashboard:"Dashboard",products:"Products",orders:"Orders"})[name]||"Dashboard";
}
function message(text) { if($("globalMsg")) $("globalMsg").textContent=text; }
function escapeHtml(v) { return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function money(v) { return "৳"+Number(v||0).toLocaleString("en-BD"); }
function authError(e) {
 const map={"auth/invalid-email":"ইমেইল সঠিক নয়।","auth/user-not-found":"ব্যবহারকারী পাওয়া যায়নি।","auth/wrong-password":"পাসওয়ার্ড সঠিক নয়।","auth/invalid-credential":"ইমেইল অথবা পাসওয়ার্ড ভুল।","auth/too-many-requests":"কিছুক্ষণ পরে আবার চেষ্টা করুন।","auth/network-request-failed":"ইন্টারনেট সংযোগ পরীক্ষা করুন।","auth/unauthorized-domain":"Firebase Authorized domains-এ GitHub Pages domain যোগ করুন।"};
 return map[e.code]||("Login ব্যর্থ: "+e.message);
}
function renderProducts() {
 const entries=Object.entries(products);
 $("productCount").textContent=entries.length;
 $("productList").innerHTML=entries.length?'<table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>'+entries.map(([id,p])=>'<tr><td>'+escapeHtml(p.name)+'</td><td>'+money(p.price)+'</td><td>'+Number(p.stock||0)+'</td><td><div class="table-actions"><button class="small-btn" data-edit="'+id+'">Edit</button><button class="small-btn danger" data-delete="'+id+'">Delete</button></div></td></tr>').join("")+'</tbody></table>':'<p class="muted">এখনো কোনো Product যোগ করা হয়নি।</p>';
}
function renderOrders() {
 const entries=Object.entries(orders).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0));
 $("orderCount").textContent=entries.length;
 $("pendingCount").textContent=entries.filter(([,o])=>(o.status||"Pending")==="Pending").length;
 const html=entries.map(([id,o])=>'<tr><td>'+escapeHtml(id.slice(-7))+'</td><td>'+escapeHtml(o.customer?.name)+'</td><td>'+escapeHtml(o.customer?.phone)+'</td><td>'+money(o.total)+'</td><td><select class="status-select" data-status="'+id+'">'+["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled"].map(s=>'<option '+((o.status||"Pending")===s?"selected":"")+'>'+s+'</option>').join("")+'</select></td></tr>').join("");
 const table=entries.length?'<table><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th></tr></thead><tbody>'+html+'</tbody></table>':'<p class="muted">এখনো কোনো Order আসেনি।</p>';
 $("orderList").innerHTML=table;
 $("recentOrders").innerHTML=entries.length?'<table><thead><tr><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>'+entries.slice(0,5).map(([,o])=>'<tr><td>'+escapeHtml(o.customer?.name)+'</td><td>'+money(o.total)+'</td><td>'+escapeHtml(o.status||"Pending")+'</td></tr>').join("")+'</tbody></table>':'<p class="muted">কোনো সাম্প্রতিক Order নেই।</p>';
}
function startDatabase() {
 if(stopProducts) stopProducts(); if(stopOrders) stopOrders();
 stopProducts=onValue(ref(db,"products"),snap=>{products=snap.val()||{};renderProducts();},e=>message("Product লোড হয়নি: "+e.message));
 stopOrders=onValue(ref(db,"orders"),snap=>{orders=snap.val()||{};renderOrders();},e=>message("Order লোড হয়নি: "+e.message));
}
function resetProductForm() { $("productForm").reset(); $("productId").value=""; $("productStock").value="0"; $("formTitle").textContent="Add product"; $("imageUploadStatus").textContent=""; $("productImageFile").value=""; }
$("loginForm")?.addEventListener("submit",async e=>{
 e.preventDefault(); $("loginMsg").textContent="Login হচ্ছে...";
 try { const c=await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value); if(c.user.uid!==ADMIN_UID){await signOut(auth);showLogin("এই অ্যাকাউন্টের Admin অনুমতি নেই।");} else $("password").value=""; }
 catch(err){showLogin(authError(err));}
});
$("logoutBtn")?.addEventListener("click",()=>signOut(auth));
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.goto)));
$("newProductBtn")?.addEventListener("click",()=>{$("productFormPanel").classList.remove("hidden");resetProductForm();});
$("productImageFile")?.addEventListener("change", async e=>{
 const file=e.target.files?.[0]; if(!file)return;
 if(!file.type.startsWith("image/")){message("শুধু ছবির ফাইল নির্বাচন করুন।");e.target.value="";return;}
 if(file.size>5*1024*1024){message("ছবির সাইজ ৫ MB-এর কম হতে হবে।");e.target.value="";return;}
 const status=$("imageUploadStatus"); status.textContent="ছবি আপলোড হচ্ছে...";
 try{
   const formData=new FormData();
   formData.append("file",file);
   formData.append("upload_preset","mrgamezone");
   const response=await fetch("https://api.cloudinary.com/v1_1/phvmgyj9/image/upload",{method:"POST",body:formData});
   const result=await response.json();
   if(!response.ok) throw new Error(result.error?.message||"Cloudinary upload failed");
   $("productImage").value=result.secure_url;
   status.textContent="ছবি আপলোড হয়েছে। Save product চাপুন।";
 }catch(err){
   status.textContent="আপলোড হয়নি: "+err.message;
   message("Cloudinary সেটিংস পরীক্ষা করুন: Upload Preset-এর নাম mrgamezone এবং Signing mode Unsigned হতে হবে।");
 }
});
function closeForm(){$("productFormPanel").classList.add("hidden");}
$("cancelProductBtn")?.addEventListener("click",closeForm); $("cancelProductBtn2")?.addEventListener("click",closeForm);
$("productForm")?.addEventListener("submit",async e=>{
 e.preventDefault();
 const id=$("productId").value;
 const product={name:$("productName").value.trim(),price:Number($("productPrice").value),category:$("productCategory").value.trim(),stock:Number($("productStock").value||0),image:$("productImage").value.trim(),description:$("productDescription").value.trim(),active:true,updatedAt:Date.now()};
 if(!product.name||!Number.isFinite(product.price)||product.price<0){message("Product name ও সঠিক price দিন।");return;}
 try { const productRef=id?ref(db,"products/"+id):push(ref(db,"products")); await (id?update(productRef,product):set(productRef,{...product,createdAt:Date.now()})); closeForm();resetProductForm();message("Product সফলভাবে সংরক্ষণ হয়েছে।"); }
 catch(err){message("সংরক্ষণ হয়নি: "+err.message);}
});
$("productList")?.addEventListener("click",async e=>{
 const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");
 if(edit){const id=edit.dataset.edit,p=products[id];if(!p)return;$("productId").value=id;$("productName").value=p.name||"";$("productPrice").value=p.price??"";$("productCategory").value=p.category||"";$("productStock").value=p.stock??0;$("productImage").value=p.image||"";$("productDescription").value=p.description||"";$("formTitle").textContent="Edit product";$("productFormPanel").classList.remove("hidden");}
 if(del){const id=del.dataset.delete;if(confirm("এই Product মুছে ফেলবেন?"))try{await remove(ref(db,"products/"+id));message("Product মুছে ফেলা হয়েছে।");}catch(err){message("Delete ব্যর্থ: "+err.message);}}
});
$("orderList")?.addEventListener("change",async e=>{
 const el=e.target.closest("[data-status]");if(!el)return;
 try{await update(ref(db,"orders/"+el.dataset.status),{status:el.value,updatedAt:Date.now()});message("Order status আপডেট হয়েছে।");}
 catch(err){message("Status পরিবর্তন হয়নি: "+err.message);}
});
$("refreshProducts")?.addEventListener("click",()=>message("Product তালিকা Realtime Database থেকে আপডেট হচ্ছে।"));
$("refreshOrders")?.addEventListener("click",()=>message("Order তালিকা Realtime Database থেকে আপডেট হচ্ছে।"));
setPersistence(auth,browserLocalPersistence).catch(console.error);
onAuthStateChanged(auth,async user=>{
 if(!user){if(stopProducts)stopProducts();if(stopOrders)stopOrders();showLogin();return;}
 if(user.uid!==ADMIN_UID){await signOut(auth);showLogin("এই অ্যাকাউন্টের Admin অনুমতি নেই।");return;}
 $("loginPage").classList.add("hidden");$("app").classList.remove("hidden");$("adminEmail").textContent=user.email||"Admin";showPage("dashboard");startDatabase();
});
