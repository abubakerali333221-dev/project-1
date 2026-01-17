import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  deleteDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMoQdcRgPGNHsembYYPUJIUtzBb0BD7vM",
  authDomain: "smart-reminder-1688c.firebaseapp.com",
  projectId: "smart-reminder-1688c",
  storageBucket: "smart-reminder-1688c.firebasestorage.app",
  messagingSenderId: "706661285934",
  appId: "1:706661285934:web:dd82f4ad7c5168abbfdfbf",
  measurementId: "G-WWWZ8YYHNN"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export const saveProfileToFirestore = async (storeId: string, profile: any) => {
  const docRef = doc(db, "merchants", storeId);
  await setDoc(docRef, profile, { merge: true });
};

export const getProfileFromFirestore = async (storeId: string) => {
  const docRef = doc(db, "merchants", storeId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const getAllMerchantsFromFirestore = async () => {
  const colRef = collection(db, "merchants");
  const querySnapshot = await getDocs(colRef);
  const merchants: any[] = [];
  querySnapshot.forEach((doc) => {
    merchants.push({ id: doc.id, ...doc.data() });
  });
  return merchants;
};

export const deleteMerchantFromFirestore = async (merchantId: string) => {
  await deleteDoc(doc(db, "merchants", merchantId));
};

export const saveEventToFirestore = async (event: any) => {
  const docRef = doc(db, "events", event.id);
  await setDoc(docRef, event);
};

export const deleteEventFromFirestore = async (eventId: string) => {
  await deleteDoc(doc(db, "events", eventId));
};

export const getAllEventsFromFirestore = async () => {
  const colRef = collection(db, "events");
  const querySnapshot = await getDocs(colRef);
  const events: any[] = [];
  querySnapshot.forEach((doc) => {
    events.push(doc.data());
  });
  return events;
};

export const saveContentToFirestore = async (merchantId: string, content: any) => {
  const docRef = doc(db, "merchants", merchantId, "generated_contents", content.id);
  await setDoc(docRef, content);
};

export const getMerchantContentsFromFirestore = async (merchantId: string) => {
  const colRef = collection(db, "merchants", merchantId, "generated_contents");
  const q = query(colRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const contents: any[] = [];
  querySnapshot.forEach((doc) => {
    contents.push(doc.data());
  });
  return contents;
};

export const savePlatformSettings = async (settings: any) => {
  const docRef = doc(db, "settings", "platform");
  await setDoc(docRef, settings, { merge: true });
};

export const getPlatformSettings = async () => {
  const docRef = doc(db, "settings", "platform");
  const docSnap = await getDoc(docRef);
  // Default structure if not exists
  return docSnap.exists() ? docSnap.data() : { socialLinks: {}, plans: { basic: 99, pro: 299, enterprise: 999 } };
};

export const saveDiscountCodeToFirestore = async (coupon: any) => {
  const docRef = doc(db, "discount_codes", coupon.id);
  await setDoc(docRef, coupon);
};

export const getAllDiscountCodesFromFirestore = async () => {
  const colRef = collection(db, "discount_codes");
  const querySnapshot = await getDocs(colRef);
  const coupons: any[] = [];
  querySnapshot.forEach((doc) => {
    coupons.push(doc.data());
  });
  return coupons;
};

export const deleteDiscountCodeFromFirestore = async (couponId: string) => {
  await deleteDoc(doc(db, "discount_codes", couponId));
};

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const savePortfolioImage = async (base64: string) => {
  const docRef = doc(db, "portfolio", "main");
  await setDoc(docRef, { imageBase64: base64 }, { merge: true });
};

export { db, app };