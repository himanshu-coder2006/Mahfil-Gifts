import React, { useEffect, useState } from 'react';
import { productAPI, categoryAPI } from '../services/api';
import HeroBanner from '../components/home/HeroBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import BestsellerSection from '../components/home/BestsellerSection';
import BudgetBuys from '../components/home/BudgetBuys';
import TrustBadges from '../components/home/TrustBadges';
import Testimonials from '../components/home/Testimonials';
import NewsletterSection from '../components/home/NewsletterSection';
import Loader from '../components/Loader';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productAPI.getAll({ bestseller: true }),
      categoryAPI.getAll(),
    ])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data || []);
        setCategories(cRes.data || []);
      })
      .catch(() => { /* handled by empty states */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const heroProduct = products.find((p) => p.bestseller && p.tags?.includes('box bag')) || products[0];

  return (
    <>
      <HeroBanner heroProduct={heroProduct} />
      <CategoryGrid categories={categories} />
      <BestsellerSection products={products} />
      <BudgetBuys />
      <TrustBadges />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}