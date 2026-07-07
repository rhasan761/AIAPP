import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const products = [
  {
    id: 'watch-pro',
    name: 'PulseFit Smart Watch Pro',
    category: 'Wearables',
    price: 5490,
    oldPrice: 6990,
    badge: 'Best seller',
    icon: '⌚',
    details: 'Bangla notifications, 7-day battery, heart-rate tracking, and IP68 splash resistance.',
  },
  {
    id: 'buds-air',
    name: 'AeroPods ANC Wireless Earbuds',
    category: 'Audio',
    price: 3290,
    oldPrice: 4290,
    badge: 'New arrival',
    icon: '🎧',
    details: 'Active noise cancellation, low-latency gaming mode, and USB-C fast charging case.',
  },
  {
    id: 'home-cam',
    name: 'SecureView 360 Wi-Fi Camera',
    category: 'Smart Home',
    price: 4190,
    oldPrice: 4990,
    badge: 'Home safety',
    icon: '📹',
    details: 'Night vision, two-way talk, motion alerts, and easy setup for apartments and shops.',
  },
  {
    id: 'power-bank',
    name: '20,000mAh Fast Power Bank',
    category: 'Accessories',
    price: 2790,
    oldPrice: 3490,
    badge: 'Hot deal',
    icon: '🔋',
    details: '22.5W fast output, dual USB ports, Type-C input, and flight-friendly compact build.',
  },
];

const categories = ['All', 'Wearables', 'Audio', 'Smart Home', 'Accessories'];
const formatter = new Intl.NumberFormat('en-BD');

function formatPrice(amount) {
  return `৳${formatter.format(amount)}`;
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = !normalizedQuery || `${product.name} ${product.category} ${product.details}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.navbar}>
          <View>
            <Text style={styles.brandKicker}>RHGLOBAL Point</Text>
            <Text style={styles.brand}>Smart gadgets for Bangladesh</Text>
          </View>
          <View style={styles.cartPill}>
            <Text style={styles.cartText}>Cart {cart.length}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Launch offer • Dhaka delivery in 24-48 hours</Text>
            <Text style={styles.heroTitle}>Upgrade everyday life with trusted smart gadgets.</Text>
            <Text style={styles.heroText}>
              RHGLOBAL Point brings wearables, audio, smart home security, and mobile accessories with fair local pricing, bKash/Nagad-ready checkout, and nationwide courier support.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Shop Deals</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>WhatsApp Order</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>📱</Text>
            <Text style={styles.heroCardTitle}>Free setup help</Text>
            <Text style={styles.heroCardText}>Our team helps pair watches, earbuds, and cameras before dispatch.</Text>
          </View>
        </View>

        <View style={styles.trustGrid}>
          {['Cash on delivery', 'bKash & Nagad', '7-day replacement', 'BD warranty support'].map((item) => (
            <View key={item} style={styles.trustCard}>
              <Text style={styles.trustText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>Featured collection</Text>
            <Text style={styles.sectionTitle}>Popular smart gadgets</Text>
          </View>
          <Text style={styles.totalText}>{formatPrice(cartTotal)} selected</Text>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search watches, earbuds, cameras..."
          placeholderTextColor="#7c8aa0"
          value={query}
          onChangeText={setQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, activeCategory === category && styles.categoryChipActive]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[styles.categoryText, activeCategory === category && styles.categoryTextActive]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.productGrid}>
          {visibleProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productTopRow}>
                <Text style={styles.productIcon}>{product.icon}</Text>
                <Text style={styles.badge}>{product.badge}</Text>
              </View>
              <Text style={styles.categoryLabel}>{product.category}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDetails}>{product.details}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
              </View>
              <TouchableOpacity style={styles.addButton} onPress={() => setCart((current) => [...current, product])}>
                <Text style={styles.addButtonText}>Add to cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.orderPanel}>
          <Text style={styles.orderTitle}>Ready for Bangladesh-wide orders</Text>
          <Text style={styles.orderText}>Add SSLCommerz or manual bKash/Nagad confirmation next, then connect inventory and courier zones for a complete production storefront.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#06111f' },
  page: { padding: 20, paddingBottom: 40, gap: 20 },
  navbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  brandKicker: { color: '#38f2ad', fontSize: 22, fontWeight: '900' },
  brand: { color: '#a8b7ca', fontSize: 13, marginTop: 2 },
  cartPill: { backgroundColor: '#10233a', borderColor: '#21405f', borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10 },
  cartText: { color: '#f8fafc', fontWeight: '800' },
  hero: { backgroundColor: '#0b1b2d', borderColor: '#1f3b57', borderRadius: 30, borderWidth: 1, gap: 18, padding: 24 },
  heroCopy: { gap: 12 },
  eyebrow: { color: '#38f2ad', fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { color: '#f8fbff', fontSize: 38, fontWeight: '900', lineHeight: 42 },
  heroText: { color: '#b7c6d8', fontSize: 16, lineHeight: 24 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  primaryButton: { backgroundColor: '#38f2ad', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 14 },
  primaryButtonText: { color: '#052019', fontWeight: '900' },
  secondaryButton: { backgroundColor: '#14263c', borderColor: '#2d4b6b', borderRadius: 999, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 14 },
  secondaryButtonText: { color: '#e8f1fb', fontWeight: '900' },
  heroCard: { backgroundColor: '#10233a', borderRadius: 24, padding: 18 },
  heroIcon: { fontSize: 54 },
  heroCardTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginTop: 8 },
  heroCardText: { color: '#b7c6d8', marginTop: 6, lineHeight: 20 },
  trustGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trustCard: { backgroundColor: '#0f2035', borderRadius: 16, flexGrow: 1, padding: 14 },
  trustText: { color: '#d8e7f7', fontWeight: '800', textAlign: 'center' },
  sectionHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sectionKicker: { color: '#38f2ad', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  sectionTitle: { color: '#f8fbff', fontSize: 26, fontWeight: '900' },
  totalText: { color: '#a8b7ca', fontWeight: '800' },
  search: { backgroundColor: '#0f2035', borderColor: '#223d5b', borderRadius: 18, borderWidth: 1, color: '#f8fbff', fontSize: 16, paddingHorizontal: 16, paddingVertical: 14 },
  categoryRow: { gap: 10, paddingRight: 20 },
  categoryChip: { backgroundColor: '#10233a', borderColor: '#24415f', borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10 },
  categoryChipActive: { backgroundColor: '#38f2ad' },
  categoryText: { color: '#c6d5e7', fontWeight: '800' },
  categoryTextActive: { color: '#052019' },
  productGrid: { gap: 16 },
  productCard: { backgroundColor: '#0f2035', borderColor: '#223d5b', borderRadius: 24, borderWidth: 1, gap: 10, padding: 18 },
  productTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  productIcon: { fontSize: 46 },
  badge: { backgroundColor: '#1c3d32', borderRadius: 999, color: '#6ff5bd', fontSize: 12, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 6 },
  categoryLabel: { color: '#38f2ad', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  productName: { color: '#ffffff', fontSize: 21, fontWeight: '900' },
  productDetails: { color: '#a8b7ca', lineHeight: 20 },
  priceRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  price: { color: '#ffffff', fontSize: 23, fontWeight: '900' },
  oldPrice: { color: '#72839a', fontSize: 15, textDecorationLine: 'line-through' },
  addButton: { alignItems: 'center', backgroundColor: '#38f2ad', borderRadius: 16, marginTop: 4, paddingVertical: 14 },
  addButtonText: { color: '#052019', fontWeight: '900' },
  orderPanel: { backgroundColor: '#10233a', borderColor: '#24415f', borderRadius: 24, borderWidth: 1, padding: 20 },
  orderTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  orderText: { color: '#a8b7ca', lineHeight: 22, marginTop: 8 },
});
