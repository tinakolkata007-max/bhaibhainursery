import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, Truck, Shield, Heart, ArrowRight, Sparkles, Star, Sun, Droplets, Clock, TrendingUp, Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import type { Product, Category, ProductReview } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { settings } = useSettings();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [indoorPlants, setIndoorPlants] = useState<Product[]>([]);
  const [floweringPlants, setFloweringPlants] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*, category:categories(*)').eq('active', true).eq('featured', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('products').select('*, category:categories(*)').eq('active', true).eq('is_bestseller', true).order('created_at', { ascending: false }).limit(4),
      supabase.from('products').select('*, category:categories(*)').eq('active', true).eq('is_new', true).order('created_at', { ascending: false }).limit(4),
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('product_reviews').select('*, product:products(name)').eq('approved', true).order('created_at', { ascending: false }).limit(3),
      supabase.from('plant_care_articles').select('title, slug, excerpt, image_url, category, read_time').eq('published', true).order('published_at', { ascending: false }).limit(3),
    ]).then(async ([featRes, bestRes, newRes, catRes, revRes, artRes]) => {
      setFeatured(featRes.data || []);
      setBestsellers(bestRes.data || []);
      setNewArrivals(newRes.data || []);
      setCategories(catRes.data || []);
      setReviews(revRes.data || []);
      setArticles(artRes.data || []);

      const indoorCat = (catRes.data || []).find((c: Category) => c.slug === 'indoor-plants');
      const floweringCat = (catRes.data || []).find((c: Category) => c.slug === 'flowering-plants');
      if (indoorCat) {
        const { data: indoor } = await supabase.from('products').select('*, category:categories(*)').eq('active', true).eq('category_id', indoorCat.id).limit(4);
        setIndoorPlants(indoor || []);
      }
      if (floweringCat) {
        const { data: flowering } = await supabase.from('products').select('*, category:categories(*)').eq('active', true).eq('category_id', floweringCat.id).limit(4);
        setFloweringPlants(flowering || []);
      }
      setLoading(false);
    });
  }, []);

  const categoryImages: Record<string, string> = {
    'indoor-plants': 'https://images.pexels.com/photos/5517702/pexels-photo-5517702.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'flowering-plants': 'https://images.pexels.com/photos/15480253/pexels-photo-15480253.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'fruit-plants': 'https://images.pexels.com/photos/24811263/pexels-photo-24811263.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'outdoor-plants': 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'medicinal-plants': 'https://images.pexels.com/photos/12448627/pexels-photo-12448627.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/16433504/pexels-photo-16433504.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
            alt="Indoor plants"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-900/50 to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl text-white animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-secondary-400" />
              Healthy plants, happy homes
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {settings?.hero_title || 'Bring Nature Home'}
            </h1>
            <p className="text-lg text-primary-100 leading-relaxed mb-8 max-w-md">
              {settings?.hero_subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl font-medium transition-colors shadow-lg"
              >
                Shop Plants <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/plant-care"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-medium transition-colors"
              >
                Explore Plant Care
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-primary-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Leaf, title: 'Healthy Plants', desc: 'Nurtured with care' },
            { icon: Truck, title: 'Doorstep Delivery', desc: 'Safe packaging' },
            { icon: Shield, title: 'Quality Assured', desc: 'Every plant checked' },
            { icon: Heart, title: 'WhatsApp Ordering', desc: 'No online payment' },
          ].map((badge) => (
            <div key={badge.title} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <badge.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{badge.title}</h3>
                <p className="text-xs text-gray-500">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Browse by</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Plant Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={categoryImages[cat.slug] || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-serif text-lg font-semibold">{cat.name}</h3>
                <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Shop now <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Handpicked</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Featured Plants</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-secondary-600 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Popular</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Best Selling Plants</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-12 bg-primary-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Just In</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">New Arrivals</h2>
              </div>
              <Link to="/shop" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Indoor Collection */}
      {indoorPlants.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">For your home</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Indoor Plant Collection</h2>
            </div>
            <Link to="/shop?category=indoor-plants" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {indoorPlants.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Flowering Collection */}
      {floweringPlants.length > 0 && (
        <section className="py-12 bg-primary-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-secondary-600 font-semibold">Blooming beauty</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Flowering Plant Collection</h2>
              </div>
              <Link to="/shop?category=flowering-plants" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {floweringPlants.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Special Offers Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-700 to-primary-600 p-8 md:p-12">
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-500 text-white rounded-full text-xs font-bold mb-4">
              <Tag className="w-3 h-3" /> Special Offers
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3">Save on Healthy Plants</h2>
            <p className="text-primary-100 mb-6">Check out our latest coupons and discount offers on selected plants and gardening accessories.</p>
            <Link to="/offers" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-medium hover:bg-primary-50 transition-colors">
              View Offers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 hidden md:block">
            <img src="https://images.pexels.com/photos/4505166/pexels-photo-4505166.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Plant Care Tips */}
      {articles.length > 0 && (
        <section className="py-12 bg-primary-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Knowledge</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Plant Care Tips</h2>
              </div>
              <Link to="/plant-care" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.slug} to={`/plant-care/${article.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    {article.image_url && (
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{article.category}</span>
                      {article.read_time && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time} min</span>}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{article.title}</h3>
                    {article.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Testimonials</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-accent-400 fill-accent-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                {review.review_text && <p className="text-sm text-gray-600 leading-relaxed mb-4">"{review.review_text}"</p>}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">{review.customer_name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.customer_name}</p>
                    {review.product?.name && <p className="text-xs text-gray-400">{review.product.name}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Why Choose Us</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">The Green Haven Difference</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: 'Expertly Nurtured Plants', desc: 'Every plant is grown and cared for by our experienced nursery team.' },
              { icon: Truck, title: 'Safe Doorstep Delivery', desc: 'Carefully packaged and delivered to ensure your plants arrive healthy.' },
              { icon: Sun, title: 'Care Guidance Included', desc: 'Detailed plant care instructions with every purchase to help your plants thrive.' },
              { icon: Droplets, title: 'Quality You Can Trust', desc: 'Each plant is inspected for health and quality before it reaches your home.' },
              { icon: Heart, title: 'Personal Service', desc: 'Order via WhatsApp for a personal touch. No online payment required.' },
              { icon: Shield, title: 'Satisfaction First', desc: 'Not happy with your plant? We will make it right.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.pexels.com/photos/4505166/pexels-photo-4505166.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Our nursery"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">About Us</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1 mb-4">
              Passionate About Plants
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {settings?.about_text}
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Learn more about us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Ready to Start Your Plant Journey?</h2>
          <p className="text-primary-100 mb-8">Browse our collection of healthy plants and order via WhatsApp for a personal touch.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl font-medium transition-colors shadow-lg"
          >
            Shop All Plants <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
