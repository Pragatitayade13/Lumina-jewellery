import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, CheckCircle, RefreshCcw, Loader, Type, List, Search, UploadCloud, Link as LinkIcon, BookOpen, LayoutTemplate, Plus, Trash2, Clock, TrendingUp, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import '../admin.css';

export default function LandingPageCMS() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(null);
  const [uploadingShowcaseImage, setUploadingShowcaseImage] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [data, setData] = useState({
    hero: {
      slides: [
        { title: '', subtitle: '', ctaText: '', ctaLink: '', bgImage: '' },
        { title: '', subtitle: '', ctaText: '', ctaLink: '', bgImage: '' },
        { title: '', subtitle: '', ctaText: '', ctaLink: '', bgImage: '' }
      ]
    },
    seo: {
      title: 'Lumina Jewels',
      description: 'Exclusive luxury jewellery'
    },
    navBar: [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/collections' },
      { label: 'Men\'s', href: '/mens' },
      { label: 'Collections', href: '/collections' },
      { label: 'New Arrivals', href: '/#new-arrivals' },
      { label: 'Best Sellers', href: '/#best-sellers' },
      { label: 'About Us', href: '/#brand-story' },
      { label: 'Contact Us', href: '#support' }
    ],
    brandStory: {
      sectionLabel: 'Our Story',
      title: 'Crafting Dreams Into Timeless Jewellery',
      desc1: 'For over 25 years, Lumina Jewels has been India\'s most trusted name in authentic, handcrafted jewellery. Every piece we create tells a story — of passion, precision, and the timeless art of goldsmithing.',
      desc2: 'Our master artisans, many from generations of jewellery-making families, bring centuries of tradition into every creation. From intricate filigree work to modern diamond settings, each piece is a testament to uncompromising craftsmanship.',
      buttonText: 'Discover Our Heritage',
      buttonLink: 'https://en.wikipedia.org/wiki/Jewellery#India',
      yearsOfExcellence: '25+',
      badges: [
        { label: 'BIS Hallmark', sub: 'Certified Gold' },
        { label: '100% Authentic', sub: 'Guaranteed' },
        { label: 'IGI Certified', sub: 'Diamonds' },
        { label: '50,000+', sub: 'Happy Customers' }
      ]
    },
    productShowcase: {
      sectionLabel: 'Luxury Gallery',
      title: 'Product Showcase',
      subtitle: 'Explore our finest handcrafted jewellery with exquisite detail.',
      images: []
    },
    newArrivals: {
      sectionLabel: 'Just Arrived',
      title: 'New Arrivals',
      subtitle: 'Discover our latest jewellery pieces fresh from our master craftsmen\'s studios.'
    },
    bestSellers: {
      sectionLabel: 'Customer Favorites',
      title: 'Best Sellers',
      subtitle: 'Our most loved pieces — trusted by thousands of happy customers across India.'
    },
    testimonials: {
      sectionLabel: 'Customer Love',
      title: 'What Our Customers Say',
      subtitle: 'Real experiences from real jewellery lovers across India.',
      stats: {
        avgRating: { value: '4.9/5', sub: 'Based on 10,000+ reviews' },
        satisfaction: { value: '98%', sub: 'Would recommend us' }
      },
      reviews: [
        { id: 1, name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Absolutely stunning bridal set! The craftsmanship is beyond compare. Received so many compliments at my wedding. Lumina Jewels made my special day even more magical.', initials: 'PS', color: '#C9A84C' },
        { id: 2, name: 'Ananya Reddy', city: 'Hyderabad', rating: 5, text: 'The diamond pendant I ordered arrived beautifully packaged and looks even better in person. Genuine BIS hallmark certified. Will definitely order again!', initials: 'AR', color: '#8B1A2E' },
        { id: 3, name: 'Meera Krishnan', city: 'Chennai', rating: 5, text: 'I have been buying jewellery from Lumina for 5 years now. The quality is consistently exceptional. Their customer service team is also incredibly helpful.', initials: 'MK', color: '#1A4A2E' },
        { id: 4, name: 'Sunita Gupta', city: 'Delhi', rating: 4, text: 'Beautiful gold bangles, exactly as shown in the photos. The weight and finish are premium. Delivery was fast and secure. Highly recommend to everyone!', initials: 'SG', color: '#1A2E5E' },
        { id: 5, name: 'Kavita Patel', city: 'Ahmedabad', rating: 5, text: 'Got the Heritage Jhumkas and they are magnificent! The ruby accents add such elegance. My mother-in-law was thoroughly impressed. Thank you Lumina Jewels!', initials: 'KP', color: '#4A1A5E' }
      ]
    },
    whyChooseUs: {
      sectionLabel: 'Our Promise',
      title: 'Why Choose Lumina?',
      subtitle: 'We don\'t just sell jewellery — we promise an experience of trust, quality, and elegance.',
      stats: [
        { target: 25, suffix: '+', label: 'Years in Business' },
        { target: 50, suffix: 'K+', label: 'Happy Customers' },
        { target: 10, suffix: 'K+', label: 'Unique Designs' },
        { target: 99, suffix: '%', label: 'Satisfaction Rate' }
      ],
      features: [
        { icon: 'Award', title: 'BIS Certified Gold', desc: 'All our gold jewellery comes with Bureau of Indian Standards hallmark certification, guaranteeing purity and authenticity.', color: '#C9A84C' },
        { icon: 'Shield', title: 'Secure Payment', desc: 'Multiple secure payment options including UPI, cards, and net banking with 256-bit SSL encryption for all transactions.', color: '#2ecc71' },
        { icon: 'Truck', title: 'Fast Delivery', desc: 'Insured express delivery to all major cities within 3-5 business days, with real-time tracking available 24/7.', color: '#3498db' },
        { icon: 'RefreshCw', title: 'Easy Returns', desc: '15-day hassle-free return policy. Not satisfied? Return it with our pre-paid shipping label, no questions asked.', color: '#e74c3c' },
        { icon: 'Gem', title: 'Premium Quality', desc: 'Each piece passes rigorous quality checks by our expert gemologists before reaching your doorstep.', color: '#9b59b6' },
        { icon: 'Headphones', title: '24/7 Support', desc: 'Our dedicated customer care team is available round the clock to assist you via call, chat, or email.', color: '#e67e22' }
      ]
    },
    exclusiveOffers: {
      sectionLabel: 'Limited Time',
      title: 'Exclusive Offers',
      subtitle: 'Grab these amazing deals before they\'re gone! Use coupon codes at checkout.',
      flashTitle: 'Wedding Collection',
      flashSub: 'Up to 40% off on selected bridal jewellery sets',
      flashEndDate: Date.now() + 86400000 * 1.5,
      banners: [
        { title: 'Festival Offers', sub: 'Up to 35% on gold', icon: '✦', bg: 'linear-gradient(135deg, #2a1f00, #1a0800)' },
        { title: 'First Purchase', sub: '₹500 cashback', icon: '◈', bg: 'linear-gradient(135deg, #1a002a, #0d0015)' },
        { title: 'Refer & Earn', sub: '₹1000 for every referral', icon: '◉', bg: 'linear-gradient(135deg, #001a10, #000d08)' },
      ]
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Database not initialized");
      const docRef = doc(db, 'cms', 'landingPage');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        
        // Ensure nested structures exist even if older data was saved
        if (fetchedData.brandStory && !fetchedData.brandStory.badges) {
          fetchedData.brandStory.badges = [
            { label: 'BIS Hallmark', sub: 'Certified Gold' },
            { label: '100% Authentic', sub: 'Guaranteed' },
            { label: 'IGI Certified', sub: 'Diamonds' },
            { label: '50,000+', sub: 'Happy Customers' }
          ];
        }

        if (fetchedData.testimonials && !fetchedData.testimonials.reviews) {
          fetchedData.testimonials.stats = {
            avgRating: { value: '4.9/5', sub: 'Based on 10,000+ reviews' },
            satisfaction: { value: '98%', sub: 'Would recommend us' }
          };
          fetchedData.testimonials.reviews = [
            { id: 1, name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Absolutely stunning bridal set! The craftsmanship is beyond compare. Received so many compliments at my wedding. Lumina Jewels made my special day even more magical.', initials: 'PS', color: '#C9A84C' },
            { id: 2, name: 'Ananya Reddy', city: 'Hyderabad', rating: 5, text: 'The diamond pendant I ordered arrived beautifully packaged and looks even better in person. Genuine BIS hallmark certified. Will definitely order again!', initials: 'AR', color: '#8B1A2E' },
            { id: 3, name: 'Meera Krishnan', city: 'Chennai', rating: 5, text: 'I have been buying jewellery from Lumina for 5 years now. The quality is consistently exceptional. Their customer service team is also incredibly helpful.', initials: 'MK', color: '#1A4A2E' },
            { id: 4, name: 'Sunita Gupta', city: 'Delhi', rating: 4, text: 'Beautiful gold bangles, exactly as shown in the photos. The weight and finish are premium. Delivery was fast and secure. Highly recommend to everyone!', initials: 'SG', color: '#1A2E5E' },
            { id: 5, name: 'Kavita Patel', city: 'Ahmedabad', rating: 5, text: 'Got the Heritage Jhumkas and they are magnificent! The ruby accents add such elegance. My mother-in-law was thoroughly impressed. Thank you Lumina Jewels!', initials: 'KP', color: '#4A1A5E' }
          ];
        }
        if (fetchedData.whyChooseUs && !fetchedData.whyChooseUs.stats) {
          fetchedData.whyChooseUs.stats = [
            { target: 25, suffix: '+', label: 'Years in Business' },
            { target: 50, suffix: 'K+', label: 'Happy Customers' },
            { target: 10, suffix: 'K+', label: 'Unique Designs' },
            { target: 99, suffix: '%', label: 'Satisfaction Rate' }
          ];
          fetchedData.whyChooseUs.features = [
            { icon: 'Award', title: 'BIS Certified Gold', desc: 'All our gold jewellery comes with Bureau of Indian Standards hallmark certification, guaranteeing purity and authenticity.', color: '#C9A84C' },
            { icon: 'Shield', title: 'Secure Payment', desc: 'Multiple secure payment options including UPI, cards, and net banking with 256-bit SSL encryption for all transactions.', color: '#2ecc71' },
            { icon: 'Truck', title: 'Fast Delivery', desc: 'Insured express delivery to all major cities within 3-5 business days, with real-time tracking available 24/7.', color: '#3498db' },
            { icon: 'RefreshCw', title: 'Easy Returns', desc: '15-day hassle-free return policy. Not satisfied? Return it with our pre-paid shipping label, no questions asked.', color: '#e74c3c' },
            { icon: 'Gem', title: 'Premium Quality', desc: 'Each piece passes rigorous quality checks by our expert gemologists before reaching your doorstep.', color: '#9b59b6' },
            { icon: 'Headphones', title: '24/7 Support', desc: 'Our dedicated customer care team is available round the clock to assist you via call, chat, or email.', color: '#e67e22' }
          ];
        }
        
        setData((prev) => {
          const safePrev = prev || {};
          const merged = { ...safePrev };
          Object.keys(fetchedData).forEach(key => {
            if (typeof fetchedData[key] === 'object' && !Array.isArray(fetchedData[key]) && fetchedData[key] !== null) {
              merged[key] = { ...safePrev[key], ...fetchedData[key] };
            } else {
              merged[key] = fetchedData[key];
            }
          });
          return merged;
        });
        setOriginalData((prev) => {
          const safePrev = prev || {};
          const merged = { ...safePrev };
          Object.keys(fetchedData).forEach(key => {
            if (typeof fetchedData[key] === 'object' && !Array.isArray(fetchedData[key]) && fetchedData[key] !== null) {
              merged[key] = { ...safePrev[key], ...fetchedData[key] };
            } else {
              merged[key] = fetchedData[key];
            }
          });
          return merged;
        });
      } else {
        setOriginalData(data);
      }
    } catch (e) {
      console.error("Error fetching CMS data:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- Exclusive Offers ---
  const handleExclusiveOffersChange = (field, value) => {
    setData({ ...data, exclusiveOffers: { ...data.exclusiveOffers, [field]: value } });
  };

  const handleExclusiveOffersBannerChange = (index, field, value) => {
    const newBanners = [...(data.exclusiveOffers?.banners || [])];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setData({ ...data, exclusiveOffers: { ...data.exclusiveOffers, banners: newBanners } });
  };

  const addExclusiveOffersBanner = () => {
    const newBanners = [...(data.exclusiveOffers?.banners || []), { title: '', sub: '', icon: '✦', bg: 'linear-gradient(135deg, #2a1f00, #1a0800)' }];
    setData({ ...data, exclusiveOffers: { ...data.exclusiveOffers, banners: newBanners } });
  };

  const removeExclusiveOffersBanner = (index) => {
    const newBanners = [...(data.exclusiveOffers?.banners || [])];
    newBanners.splice(index, 1);
    setData({ ...data, exclusiveOffers: { ...data.exclusiveOffers, banners: newBanners } });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!db) throw new Error("Database not initialized");
      await setDoc(doc(db, 'cms', 'landingPage'), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setOriginalData(data);
      showToast("Landing page content saved successfully!");
    } catch (e) {
      console.error("Error saving CMS data:", e);
      showToast("Error saving content", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroChange = (index, field, value) => {
    const newSlides = [...data.hero.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setData({ ...data, hero: { ...data.hero, slides: newSlides } });
  };

  const addHeroSlide = () => {
    const newSlides = [...data.hero.slides, { title: '', subtitle: '', ctaText: '', ctaLink: '', bgImage: '' }];
    setData({ ...data, hero: { ...data.hero, slides: newSlides } });
  };

  const removeHeroSlide = (index) => {
    const newSlides = [...data.hero.slides];
    newSlides.splice(index, 1);
    setData({ ...data, hero: { ...data.hero, slides: newSlides } });
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2MB", "error");
      return;
    }

    try {
      if (!storage) {
        showToast("Storage is not configured.", "error");
        return;
      }
      setUploadingSlide(index);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_slide_${index}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, `cms/landing/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {},
        (error) => {
          console.error("Upload error:", error);
          showToast("Failed to upload image", "error");
          setUploadingSlide(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleHeroChange(index, 'bgImage', downloadURL);
          setUploadingSlide(null);
          showToast("Image uploaded successfully");
        }
      );
    } catch (error) {
      console.error("Upload process error:", error);
      showToast("Failed to start upload", "error");
      setUploadingSlide(null);
    }
  };

  const handleSeoChange = (field, value) => {
    setData({ ...data, seo: { ...data.seo, [field]: value } });
  };

  const handleNavBarChange = (index, field, value) => {
    const newNavBar = [...(data.navBar || [])];
    newNavBar[index] = { ...newNavBar[index], [field]: value };
    setData({ ...data, navBar: newNavBar });
  };

  const addNavBarLink = () => {
    setData({ ...data, navBar: [...(data.navBar || []), { label: '', href: '' }] });
  };

  const removeNavBarLink = (index) => {
    const newNavBar = [...(data.navBar || [])];
    newNavBar.splice(index, 1);
    setData({ ...data, navBar: newNavBar });
  };

  const handleBrandStoryChange = (field, value) => {
    setData({ ...data, brandStory: { ...(data.brandStory || {}), [field]: value } });
  };

  const handleBrandStoryBadgeChange = (index, field, value) => {
    const newBadges = [...(data.brandStory?.badges || [])];
    newBadges[index] = { ...newBadges[index], [field]: value };
    setData({ ...data, brandStory: { ...data.brandStory, badges: newBadges } });
  };

  const addBrandStoryBadge = () => {
    const newBadges = [...(data.brandStory?.badges || []), { label: '', sub: '' }];
    setData({ ...data, brandStory: { ...data.brandStory, badges: newBadges } });
  };

  const removeBrandStoryBadge = (index) => {
    const newBadges = [...(data.brandStory?.badges || [])];
    newBadges.splice(index, 1);
    setData({ ...data, brandStory: { ...data.brandStory, badges: newBadges } });
  };

  // --- New Arrivals Items ---
  const handleNewArrivalsItemChange = (index, field, value) => {
    const newItems = [...(data.newArrivals?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, newArrivals: { ...data.newArrivals, items: newItems } });
  };

  const addNewArrivalsItem = () => {
    const newItems = [...(data.newArrivals?.items || []), {
      id: Date.now().toString(),
      name: '',
      price: 0,
      originalPrice: 0,
      image: '',
      badge: 'New',
      category: '',
      rating: 5,
      reviews: 0
    }];
    setData({ ...data, newArrivals: { ...data.newArrivals, items: newItems } });
  };

  const removeNewArrivalsItem = (index) => {
    const newItems = [...(data.newArrivals?.items || [])];
    newItems.splice(index, 1);
    setData({ ...data, newArrivals: { ...data.newArrivals, items: newItems } });
  };

  const handleNewArrivalsImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Using simple object URL for instant preview. 
    // In production, you'd upload this to Firebase Storage and get the URL.
    const url = URL.createObjectURL(file);
    handleNewArrivalsItemChange(index, 'image', url);
  };

  // --- Best Sellers Items ---
  const handleBestSellersItemChange = (index, field, value) => {
    const newItems = [...(data.bestSellers?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, bestSellers: { ...data.bestSellers, items: newItems } });
  };

  const addBestSellersItem = () => {
    const newItems = [...(data.bestSellers?.items || []), {
      id: Date.now().toString(),
      name: '',
      price: 0,
      originalPrice: 0,
      image: '',
      badge: 'Hot',
      category: '',
      rating: 5,
      reviews: 0
    }];
    setData({ ...data, bestSellers: { ...data.bestSellers, items: newItems } });
  };

  const removeBestSellersItem = (index) => {
    const newItems = [...(data.bestSellers?.items || [])];
    newItems.splice(index, 1);
    setData({ ...data, bestSellers: { ...data.bestSellers, items: newItems } });
  };

  const handleBestSellersImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleBestSellersItemChange(index, 'image', url);
  };

  const handleProductShowcaseChange = (field, value) => {
    setData({ ...data, productShowcase: { ...(data.productShowcase || {}), [field]: value } });
  };

  const handleProductShowcaseImageChange = (index, value) => {
    const newImages = [...(data.productShowcase?.images || [])];
    newImages[index] = value;
    setData({ ...data, productShowcase: { ...data.productShowcase, images: newImages } });
  };

  const addProductShowcaseImage = () => {
    const newImages = [...(data.productShowcase?.images || []), ''];
    setData({ ...data, productShowcase: { ...data.productShowcase, images: newImages } });
  };

  const removeProductShowcaseImage = (index) => {
    const newImages = [...(data.productShowcase?.images || [])];
    newImages.splice(index, 1);
    setData({ ...data, productShowcase: { ...data.productShowcase, images: newImages } });
  };

  const handleSimpleSectionChange = (section, field, value) => {
    setData({ ...data, [section]: { ...(data[section] || {}), [field]: value } });
  };

  const handleTestimonialStatChange = (statKey, field, value) => {
    setData({
      ...data,
      testimonials: {
        ...data.testimonials,
        stats: {
          ...data.testimonials.stats,
          [statKey]: { ...data.testimonials.stats[statKey], [field]: value }
        }
      }
    });
  };

  const handleTestimonialReviewChange = (index, field, value) => {
    const newReviews = [...(data.testimonials?.reviews || [])];
    
    // Auto-generate initials if name changes
    if (field === 'name') {
      const parts = value.trim().split(' ');
      let initials = value.substring(0, 1).toUpperCase();
      if (parts.length > 1) {
        initials = parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
      }
      newReviews[index] = { ...newReviews[index], [field]: value, initials };
    } else {
      newReviews[index] = { ...newReviews[index], [field]: value };
    }
    
    setData({ ...data, testimonials: { ...data.testimonials, reviews: newReviews } });
  };

  const addTestimonialReview = () => {
    const colors = ['#C9A84C', '#8B1A2E', '#1A4A2E', '#1A2E5E', '#4A1A5E', '#e67e22', '#2c3e50'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newReviews = [...(data.testimonials?.reviews || []), { 
      id: Date.now(), name: '', city: '', rating: 5, text: '', initials: 'A', color: randomColor 
    }];
    setData({ ...data, testimonials: { ...data.testimonials, reviews: newReviews } });
  };

  const removeTestimonialReview = (index) => {
    const newReviews = [...(data.testimonials?.reviews || [])];
    newReviews.splice(index, 1);
    setData({ ...data, testimonials: { ...data.testimonials, reviews: newReviews } });
  };

  const handleWhyChooseUsStatChange = (index, field, value) => {
    const newStats = [...(data.whyChooseUs?.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setData({ ...data, whyChooseUs: { ...data.whyChooseUs, stats: newStats } });
  };

  const handleWhyChooseUsFeatureChange = (index, field, value) => {
    const newFeatures = [...(data.whyChooseUs?.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setData({ ...data, whyChooseUs: { ...data.whyChooseUs, features: newFeatures } });
  };

  const addWhyChooseUsFeature = () => {
    const newFeatures = [...(data.whyChooseUs?.features || []), {
      icon: 'Award', title: '', desc: '', color: '#C9A84C'
    }];
    setData({ ...data, whyChooseUs: { ...data.whyChooseUs, features: newFeatures } });
  };

  const removeWhyChooseUsFeature = (index) => {
    const newFeatures = [...(data.whyChooseUs?.features || [])];
    newFeatures.splice(index, 1);
    setData({ ...data, whyChooseUs: { ...data.whyChooseUs, features: newFeatures } });
  };

  const handleShowcaseImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2MB", "error");
      return;
    }

    try {
      if (!storage) {
        showToast("Storage is not configured.", "error");
        return;
      }
      setUploadingShowcaseImage(index);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `showcase_img_${index}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, `cms/landing/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {},
        (error) => {
          console.error("Upload error:", error);
          showToast("Failed to upload image", "error");
          setUploadingShowcaseImage(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleProductShowcaseImageChange(index, downloadURL);
          setUploadingShowcaseImage(null);
          showToast("Image uploaded successfully");
        }
      );
    } catch (error) {
      console.error("Upload process error:", error);
      showToast("Failed to start upload", "error");
      setUploadingShowcaseImage(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Landing Page CMS</h1>
          <p className="page-subtitle">Manage homepage content, banners, and SEO dynamically.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchData} disabled={saving || !hasChanges}><RefreshCcw size={16} style={{ marginRight: 6 }} /> Reset</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving || !hasChanges} style={{ color: '#fff', fontWeight: 'bold', opacity: (!hasChanges ? 0.6 : 1) }}>
            {saving ? <Loader className="spin" size={16} /> : <Save size={16} />} 
            <span style={{ marginLeft: 6 }}>{saving ? 'Saving...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div className="admin-card" style={{ padding: '1rem 0' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { id: 'seo', label: 'SEO Settings', icon: <Search size={16} /> },
                { id: 'hero', label: 'Hero Banners', icon: <ImageIcon size={16} /> },
                { id: 'navBar', label: 'Navigation Bar', icon: <LinkIcon size={16} /> },
                { id: 'newArrivals', label: 'Just Arrived', icon: <Clock size={16} /> },
                { id: 'bestSellers', label: 'Best Sellers', icon: <TrendingUp size={16} /> },
                { id: 'productShowcase', label: 'Showcase', icon: <LayoutTemplate size={16} /> },
                { id: 'brandStory', label: 'Our Story', icon: <BookOpen size={16} /> },
                { id: 'testimonials', label: 'Customer Love', icon: <MessageSquare size={16} /> },
                { id: 'exclusiveOffers', label: 'Exclusive Offers', icon: <Zap size={16} /> },
                { id: 'whyChooseUs', label: 'Our Promise', icon: <ShieldCheck size={16} /> }
              ].map(tab => (
                <li key={tab.id}>
                  <button 
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '1rem 1.5rem', background: activeTab === tab.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                      border: 'none', borderLeft: `3px solid ${activeTab === tab.id ? 'var(--gold)' : 'transparent'}`,
                      color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-primary)', fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === 'hero' && (
            <div className="admin-card">
              <div className="card-header"><div className="card-title">Hero Banners</div></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {data.hero.slides.map((slide, i) => (
                  <div key={i} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ color: 'var(--gold)', margin: 0 }}>Slide {i + 1}</h4>
                      <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeHeroSlide(i)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label>Title</label>
                        <input type="text" className="form-input" value={slide.title} onChange={e => handleHeroChange(i, 'title', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Subtitle</label>
                        <input type="text" className="form-input" value={slide.subtitle} onChange={e => handleHeroChange(i, 'subtitle', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>CTA Button Text</label>
                        <input type="text" className="form-input" value={slide.ctaText} onChange={e => handleHeroChange(i, 'ctaText', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Background Image</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recommended size: 1920x1080px (Max 2MB)</span>
                        </label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input type="text" className="form-input" style={{ flex: 1 }} placeholder="https://..." value={slide.bgImage} onChange={e => handleHeroChange(i, 'bgImage', e.target.value)} />
                          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <UploadCloud size={16} /> Upload
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, i)} />
                          </label>
                        </div>
                        {uploadingSlide === i && <div style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader size={12} className="spin" /> Uploading image...</div>}
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline" onClick={addHeroSlide} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={16} /> Add Slide
                </button>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="admin-card">
              <div className="card-header"><div className="card-title">SEO Settings</div></div>
              <div className="card-body">
                <div className="form-group">
                  <label>Website Title (Meta Title)</label>
                  <input type="text" className="form-input" value={data.seo.title} onChange={e => handleSeoChange('title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea className="form-input" rows="4" value={data.seo.description} onChange={e => handleSeoChange('description', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'navBar' && (
            <div className="admin-card">
              <div className="card-header"><div className="card-title">Navigation Links</div></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(data.navBar || []).map((link, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="form-input" placeholder="Label (e.g., Home)" value={link.label} onChange={e => handleNavBarChange(i, 'label', e.target.value)} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input type="text" className="form-input" placeholder="URL (e.g., / or /collections)" value={link.href} onChange={e => handleNavBarChange(i, 'href', e.target.value)} />
                      </div>
                      <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeNavBarLink(i)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-outline" onClick={addNavBarLink} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'brandStory' && (
            <div className="admin-card">
              <div className="card-header"><div className="card-title">Our Story Section</div></div>
              <div className="card-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label>Section Label</label>
                    <input type="text" className="form-input" value={data.brandStory?.sectionLabel || ''} onChange={e => handleBrandStoryChange('sectionLabel', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" className="form-input" value={data.brandStory?.title || ''} onChange={e => handleBrandStoryChange('title', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Description Paragraph 1</label>
                    <textarea className="form-input" rows="3" value={data.brandStory?.desc1 || ''} onChange={e => handleBrandStoryChange('desc1', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Description Paragraph 2</label>
                    <textarea className="form-input" rows="3" value={data.brandStory?.desc2 || ''} onChange={e => handleBrandStoryChange('desc2', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Button Text</label>
                    <input type="text" className="form-input" value={data.brandStory?.buttonText || ''} onChange={e => handleBrandStoryChange('buttonText', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Button Link</label>
                    <input type="text" className="form-input" value={data.brandStory?.buttonLink || ''} onChange={e => handleBrandStoryChange('buttonLink', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Years of Excellence Label</label>
                    <input type="text" className="form-input" value={data.brandStory?.yearsOfExcellence || ''} onChange={e => handleBrandStoryChange('yearsOfExcellence', e.target.value)} />
                  </div>
                  
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <label style={{ fontWeight: 'bold', margin: 0 }}>Features & Milestones (Badges)</label>
                      <button className="btn btn-outline" onClick={addBrandStoryBadge} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        <Plus size={14} /> Add Badge
                      </button>
                    </div>
                    <div className="grid-2">
                      {(data.brandStory?.badges || []).map((badge, i) => (
                        <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                          <button className="btn btn-outline" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeBrandStoryBadge(i)}>
                            <Trash2 size={14} />
                          </button>
                          <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--gold)', fontSize: '0.85rem' }}>Badge {i + 1}</h5>
                          {i === 3 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>(Automatically synced with "Our Promise" stats)</p>}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input type="text" className="form-input" placeholder="Title (e.g. 50,000+)" value={badge.label} onChange={e => handleBrandStoryBadgeChange(i, 'label', e.target.value)} disabled={i === 3} />
                            <input type="text" className="form-input" placeholder="Subtitle (e.g. Happy Customers)" value={badge.sub} onChange={e => handleBrandStoryBadgeChange(i, 'sub', e.target.value)} disabled={i === 3} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'productShowcase' && (
            <div className="admin-card">
              <div className="card-header"><div className="card-title">Product Showcase Section</div></div>
              <div className="card-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label>Section Label</label>
                    <input type="text" className="form-input" value={data.productShowcase?.sectionLabel || ''} onChange={e => handleProductShowcaseChange('sectionLabel', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" className="form-input" value={data.productShowcase?.title || ''} onChange={e => handleProductShowcaseChange('title', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Subtitle</label>
                    <textarea className="form-input" rows="3" value={data.productShowcase?.subtitle || ''} onChange={e => handleProductShowcaseChange('subtitle', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Gallery Images</span>
                      <button className="btn btn-outline" onClick={addProductShowcaseImage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        <Plus size={14} /> Add Image
                      </button>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(data.productShowcase?.images || []).map((img, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.85rem' }}>Image {i + 1} URL</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 2MB</span>
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <input type="text" className="form-input" style={{ flex: 1 }} placeholder="https://..." value={img} onChange={e => handleProductShowcaseImageChange(i, e.target.value)} />
                              <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <UploadCloud size={16} /> Upload
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleShowcaseImageUpload(e, i)} />
                              </label>
                            </div>
                            {uploadingShowcaseImage === i && <div style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader size={12} className="spin" /> Uploading image...</div>}
                          </div>
                          <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--status-red)', borderColor: 'var(--status-red)', alignSelf: 'flex-end', marginBottom: uploadingShowcaseImage === i ? '1.8rem' : '0' }} onClick={() => removeProductShowcaseImage(i)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {(!data.productShowcase?.images || data.productShowcase.images.length === 0) && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No custom images added. The default gallery images will be shown.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {['newArrivals', 'bestSellers', 'testimonials', 'whyChooseUs', 'exclusiveOffers'].includes(activeTab) && (
            <div className="admin-card">
              <div className="card-header">
                <div className="card-title">
                  {activeTab === 'newArrivals' ? 'Just Arrived Section' : 
                   activeTab === 'bestSellers' ? 'Customer Favorites Section' : 
                   activeTab === 'testimonials' ? 'Customer Love Section' : 
                   activeTab === 'exclusiveOffers' ? 'Exclusive Offers Section' : 'Our Promise Section'}
                </div>
              </div>
              <div className="card-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label>Section Label</label>
                    <input type="text" className="form-input" value={data[activeTab]?.sectionLabel || ''} onChange={e => handleSimpleSectionChange(activeTab, 'sectionLabel', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" className="form-input" value={data[activeTab]?.title || ''} onChange={e => handleSimpleSectionChange(activeTab, 'title', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Subtitle</label>
                    <input type="text" className="form-input" value={data[activeTab]?.subtitle || ''} onChange={e => handleSimpleSectionChange(activeTab, 'subtitle', e.target.value)} />
                  </div>
                  
                  {activeTab === 'newArrivals' && (
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        <div>
                          <h4 style={{ color: 'var(--gold)', margin: 0 }}>Featured Products (Custom)</h4>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>If you add products here, they will override the automatic "New" products on the homepage.</p>
                        </div>
                        <button className="btn btn-outline" onClick={addNewArrivalsItem} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          <Plus size={14} /> Add Product
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(data.newArrivals?.items || []).map((item, i) => (
                          <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                            <button className="btn btn-outline" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeNewArrivalsItem(i)}>
                              <Trash2 size={14} />
                            </button>
                            
                            <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                              <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, backgroundColor: 'var(--dark)' }}>
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                      <ImageIcon size={32} />
                                    </div>
                                  )}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Image <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Max 2MB)</span></label>
                                  <input type="file" accept="image/*" onChange={(e) => handleNewArrivalsImageUpload(e, i)} style={{ fontSize: '0.9rem' }} />
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Upload a square image (Max 2MB) for best results.</p>
                                </div>
                              </div>
                              
                              <div className="form-group">
                                <label>Product Name</label>
                                <input type="text" className="form-input" value={item.name} onChange={e => handleNewArrivalsItemChange(i, 'name', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Category (e.g. Necklaces)</label>
                                <input type="text" className="form-input" value={item.category} onChange={e => handleNewArrivalsItemChange(i, 'category', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Sale Price (₹)</label>
                                <input type="number" className="form-input" value={item.price} onChange={e => handleNewArrivalsItemChange(i, 'price', parseInt(e.target.value) || 0)} />
                              </div>
                              <div className="form-group">
                                <label>Original MRP (₹)</label>
                                <input type="number" className="form-input" value={item.originalPrice} onChange={e => handleNewArrivalsItemChange(i, 'originalPrice', parseInt(e.target.value) || 0)} />
                              </div>
                              <div className="form-group">
                                <label>Badge Text</label>
                                <select className="form-input" value={item.badge} onChange={e => handleNewArrivalsItemChange(i, 'badge', e.target.value)}>
                                  <option value="New">New</option>
                                  <option value="Hot">Hot</option>
                                  <option value="">(None)</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Star Rating (1-5)</label>
                                <input type="number" min="1" max="5" step="0.1" className="form-input" value={item.rating} onChange={e => handleNewArrivalsItemChange(i, 'rating', parseFloat(e.target.value) || 0)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'bestSellers' && (
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        <div>
                          <h4 style={{ color: 'var(--gold)', margin: 0 }}>Featured Products (Custom)</h4>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>If you add products here, they will override the automatic "Best Seller" products on the homepage.</p>
                        </div>
                        <button className="btn btn-outline" onClick={addBestSellersItem} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          <Plus size={14} /> Add Product
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(data.bestSellers?.items || []).map((item, i) => (
                          <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                            <button className="btn btn-outline" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeBestSellersItem(i)}>
                              <Trash2 size={14} />
                            </button>
                            
                            <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                              <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, backgroundColor: 'var(--dark)' }}>
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                      <ImageIcon size={32} />
                                    </div>
                                  )}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Image <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Max 2MB)</span></label>
                                  <input type="file" accept="image/*" onChange={(e) => handleBestSellersImageUpload(e, i)} style={{ fontSize: '0.9rem' }} />
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Upload a square image (Max 2MB) for best results.</p>
                                </div>
                              </div>
                              
                              <div className="form-group">
                                <label>Product Name</label>
                                <input type="text" className="form-input" value={item.name} onChange={e => handleBestSellersItemChange(i, 'name', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Category (e.g. Rings)</label>
                                <input type="text" className="form-input" value={item.category} onChange={e => handleBestSellersItemChange(i, 'category', e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>Sale Price (₹)</label>
                                <input type="number" className="form-input" value={item.price} onChange={e => handleBestSellersItemChange(i, 'price', parseInt(e.target.value) || 0)} />
                              </div>
                              <div className="form-group">
                                <label>Original MRP (₹)</label>
                                <input type="number" className="form-input" value={item.originalPrice} onChange={e => handleBestSellersItemChange(i, 'originalPrice', parseInt(e.target.value) || 0)} />
                              </div>
                              <div className="form-group">
                                <label>Badge Text</label>
                                <select className="form-input" value={item.badge} onChange={e => handleBestSellersItemChange(i, 'badge', e.target.value)}>
                                  <option value="Hot">Hot</option>
                                  <option value="Best Seller">Best Seller</option>
                                  <option value="Popular">Popular</option>
                                  <option value="">(None)</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Star Rating (1-5)</label>
                                <input type="number" min="1" max="5" step="0.1" className="form-input" value={item.rating} onChange={e => handleBestSellersItemChange(i, 'rating', parseFloat(e.target.value) || 0)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'testimonials' && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Stats Configuration */}
                      <div>
                        <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Statistics Blocks</h4>
                        <div className="grid-2">
                          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                            <h5 style={{ margin: '0 0 1rem 0' }}>Average Rating</h5>
                            <div className="form-group">
                              <label>Value (e.g. 4.9/5)</label>
                              <input type="text" className="form-input" value={data.testimonials?.stats?.avgRating?.value || ''} onChange={e => handleTestimonialStatChange('avgRating', 'value', e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Subtitle (e.g. Based on reviews)</label>
                              <input type="text" className="form-input" value={data.testimonials?.stats?.avgRating?.sub || ''} onChange={e => handleTestimonialStatChange('avgRating', 'sub', e.target.value)} />
                            </div>
                          </div>
                          
                          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                            <h5 style={{ margin: '0 0 1rem 0' }}>Satisfaction Rate</h5>
                            <div className="form-group">
                              <label>Value (e.g. 98%)</label>
                              <input type="text" className="form-input" value={data.testimonials?.stats?.satisfaction?.value || ''} onChange={e => handleTestimonialStatChange('satisfaction', 'value', e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Subtitle (e.g. Would recommend)</label>
                              <input type="text" className="form-input" value={data.testimonials?.stats?.satisfaction?.sub || ''} onChange={e => handleTestimonialStatChange('satisfaction', 'sub', e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>* The 3rd stat block "Happy Customers" is synced from your "Our Story" settings.</p>
                      </div>

                      {/* Reviews Configuration */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                          <h4 style={{ color: 'var(--gold)', margin: 0 }}>Customer Reviews</h4>
                          <button className="btn btn-outline" onClick={addTestimonialReview} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <Plus size={14} /> Add Review
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {(data.testimonials?.reviews || []).map((review, i) => (
                            <div key={review.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                              <button className="btn btn-outline" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeTestimonialReview(i)}>
                                <Trash2 size={14} />
                              </button>
                              
                              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                                <div className="form-group">
                                  <label>Customer Name</label>
                                  <input type="text" className="form-input" value={review.name} onChange={e => handleTestimonialReviewChange(i, 'name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label>City / Location</label>
                                  <input type="text" className="form-input" value={review.city} onChange={e => handleTestimonialReviewChange(i, 'city', e.target.value)} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                  <label>Review Text</label>
                                  <textarea className="form-input" rows="3" value={review.text} onChange={e => handleTestimonialReviewChange(i, 'text', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label>Star Rating (1-5)</label>
                                  <input type="number" min="1" max="5" className="form-input" value={review.rating} onChange={e => handleTestimonialReviewChange(i, 'rating', parseInt(e.target.value))} />
                                </div>
                                <div className="form-group">
                                  <label>Avatar Background Color</label>
                                  <input type="color" className="form-input" style={{ padding: '0.2rem', height: '42px' }} value={review.color} onChange={e => handleTestimonialReviewChange(i, 'color', e.target.value)} />
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!data.testimonials?.reviews || data.testimonials.reviews.length === 0) && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No reviews added. Default reviews will be shown on the live site.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'whyChooseUs' && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Stats Counters */}
                      <div>
                        <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Counter Statistics</h4>
                        <div className="grid-2">
                          {(data.whyChooseUs?.stats || []).map((stat, i) => (
                            <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                              <h5 style={{ margin: '0 0 1rem 0' }}>Stat Block {i + 1}</h5>
                              <div className="form-group">
                                <label>Target Number (e.g. 25)</label>
                                <input type="number" className="form-input" value={stat.target} onChange={e => handleWhyChooseUsStatChange(i, 'target', parseInt(e.target.value) || 0)} />
                              </div>
                              <div className="form-group">
                                <label>Suffix (e.g. +, K+, %)</label>
                                <input type="text" className="form-input" value={stat.suffix} onChange={e => handleWhyChooseUsStatChange(i, 'suffix', e.target.value)} />
                              </div>
                              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Label</label>
                                <input type="text" className="form-input" value={stat.label} onChange={e => handleWhyChooseUsStatChange(i, 'label', e.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Feature Cards */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                          <h4 style={{ color: 'var(--gold)', margin: 0 }}>Feature Cards</h4>
                          <button className="btn btn-outline" onClick={addWhyChooseUsFeature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <Plus size={14} /> Add Feature
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {(data.whyChooseUs?.features || []).map((feature, i) => (
                            <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                              <button className="btn btn-outline" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeWhyChooseUsFeature(i)}>
                                <Trash2 size={14} />
                              </button>
                              
                              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                                <div className="form-group">
                                  <label>Feature Title</label>
                                  <input type="text" className="form-input" value={feature.title} onChange={e => handleWhyChooseUsFeatureChange(i, 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label>Icon</label>
                                  <select className="form-input" value={feature.icon} onChange={e => handleWhyChooseUsFeatureChange(i, 'icon', e.target.value)}>
                                    <option value="Award">Award (Medal)</option>
                                    <option value="Shield">Shield (Security)</option>
                                    <option value="Truck">Truck (Delivery)</option>
                                    <option value="RefreshCw">Refresh (Returns)</option>
                                    <option value="Gem">Gem (Quality)</option>
                                    <option value="Headphones">Headphones (Support)</option>
                                    <option value="CheckCircle">Check Circle</option>
                                    <option value="Star">Star</option>
                                    <option value="Heart">Heart</option>
                                  </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                  <label>Description</label>
                                  <textarea className="form-input" rows="2" value={feature.desc} onChange={e => handleWhyChooseUsFeatureChange(i, 'desc', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label>Icon Background Color</label>
                                  <input type="color" className="form-input" style={{ padding: '0.2rem', height: '42px' }} value={feature.color} onChange={e => handleWhyChooseUsFeatureChange(i, 'color', e.target.value)} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'exclusiveOffers' && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Flash Sale Block */}
                      <div>
                        <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Flash Sale Banner</h4>
                        <div className="grid-2">
                          <div className="form-group">
                            <label>Flash Title</label>
                            <input type="text" className="form-input" value={data.exclusiveOffers?.flashTitle || ''} onChange={e => handleExclusiveOffersChange('flashTitle', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Flash Subtitle</label>
                            <input type="text" className="form-input" value={data.exclusiveOffers?.flashSub || ''} onChange={e => handleExclusiveOffersChange('flashSub', e.target.value)} />
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Flash End Timestamp (ms)</label>
                            <input type="number" className="form-input" value={data.exclusiveOffers?.flashEndDate || Date.now()} onChange={e => handleExclusiveOffersChange('flashEndDate', parseInt(e.target.value) || Date.now())} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Current time in ms: {Date.now()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Offer Banners Block */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                          <h4 style={{ color: 'var(--gold)', margin: 0 }}>Offer Banners</h4>
                          <button className="btn btn-outline" onClick={addExclusiveOffersBanner} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <Plus size={14} /> Add Banner
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {(data.exclusiveOffers?.banners || []).map((banner, i) => (
                            <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative' }}>
                              <button className="btn btn-outline" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => removeExclusiveOffersBanner(i)}>
                                <Trash2 size={14} />
                              </button>
                              
                              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                                <div className="form-group">
                                  <label>Banner Title</label>
                                  <input type="text" className="form-input" value={banner.title} onChange={e => handleExclusiveOffersBannerChange(i, 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label>Banner Subtitle</label>
                                  <input type="text" className="form-input" value={banner.sub} onChange={e => handleExclusiveOffersBannerChange(i, 'sub', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label>Icon (Emoji/Character)</label>
                                  <input type="text" className="form-input" value={banner.icon} onChange={e => handleExclusiveOffersBannerChange(i, 'icon', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label>Background Color</label>
                                  <input type="color" className="form-input" style={{ padding: '0.2rem', height: '42px' }} value={banner.bg?.startsWith('#') ? banner.bg : '#000000'} onChange={e => handleExclusiveOffersBannerChange(i, 'bg', e.target.value)} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
