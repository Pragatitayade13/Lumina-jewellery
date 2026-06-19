import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, CheckCircle, RefreshCcw, Loader, Type, List, Search, UploadCloud, Link as LinkIcon, BookOpen, LayoutTemplate, Plus, Trash2, Clock, TrendingUp, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { uploadToImgBB } from '../../config/imgbb';
const localHeroVideo1 = '/whatsapp_video.mp4';
const localHeroVideo2 = '/hero_video_2.mp4';
import '../admin.css';

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (e) => reject(e);
      img.src = event.target.result;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export default function LandingPageCMS() {
  const { showToast, assignedStores, user } = useApp();
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super admin';
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(null);
  const [uploadingShowcaseImage, setUploadingShowcaseImage] = useState(null);
  const [uploadingNewArrival, setUploadingNewArrival] = useState(null);
  const [uploadingBestSeller, setUploadingBestSeller] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [selectedStore, setSelectedStore] = useState('global');
  const [heroBanner, setHeroBanner] = useState([
    {
      title: 'Lumina Jewels',
      subtitle: 'Exclusive luxury jewellery',
      ctaText: 'Shop Now',
      mediaType: 'video',
      mediaUrl: '',
      isActive: true,
      sortOrder: 1
    }
  ]);
  const [originalHeroBanner, setOriginalHeroBanner] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(null);
  const [publishing, setPublishing] = useState(false);

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
    branding: {
      storeName: 'Lumina Jewels',
      logoUrl: ''
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
        { title: 'Refer & Earn', sub: '₹1000 for every referral', icon: '◉', bg: 'linear-gradient(135deg, #001a10, #000d08)' }
      ]
    }
  });

  useEffect(() => {
    fetchData();
    fetchHeroBanner(selectedStore);
  }, [selectedStore]);

  const fetchHeroBanner = async (storeId) => {
    try {
      if (!db) return;
      const draftRef = doc(db, 'landingCMS', storeId, 'sections', 'heroBannersDraft');
      const draftSnap = await getDoc(draftRef);
      if (draftSnap.exists()) {
        const d = draftSnap.data();
        const slides = Array.isArray(d.slides) ? d.slides : [d];
        setHeroBanner(slides);
        setOriginalHeroBanner(slides);
        return;
      }

      const publishRef = doc(db, 'landingCMS', storeId, 'sections', 'heroBanners');
      const publishSnap = await getDoc(publishRef);
      if (publishSnap.exists()) {
        const d = publishSnap.data();
        const slides = Array.isArray(d.slides) ? d.slides : [d];
        setHeroBanner(slides);
        setOriginalHeroBanner(slides);
      } else {
        const defaults = [
          {
            title: 'Lumina Jewels',
            subtitle: 'Exclusive luxury jewellery',
            ctaText: 'Shop Now',
            mediaType: 'video',
            mediaUrl: '',
            isActive: true,
            sortOrder: 1
          }
        ];
        setHeroBanner(defaults);
        setOriginalHeroBanner(defaults);
      }
    } catch (err) {
      console.error("Error fetching hero banner CMS:", err);
    }
  };

  const handleMediaUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      showToast("Invalid file type. Please upload an image or video.", "error");
      return;
    }

    if (isImage) {
      if (file.size > 50 * 1024 * 1024) {
        showToast("Image size exceeds 50MB limit.", "error");
        return;
      }
      const allowedExts = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedExts.includes(file.type)) {
        showToast("Allowed image formats: JPG, JPEG, PNG, WEBP.", "error");
        return;
      }
    }

    if (isVideo) {
      if (file.size > 100 * 1024 * 1024) {
        showToast("Video size exceeds 100MB limit.", "error");
        return;
      }
      const allowedExts = ['video/mp4', 'video/webm'];
      if (!allowedExts.includes(file.type)) {
        showToast("Allowed video formats: MP4, WEBM.", "error");
        return;
      }
    }

    setUploadingMedia(index);
    setUploadProgress(0);

    // Set immediate local preview
    if (isImage) {
      compressImage(file).then(compressedUrl => {
        setHeroBanner(prev => {
          const newBanners = [...prev];
          newBanners[index] = { ...newBanners[index], mediaUrl: compressedUrl, mediaType: 'image' };
          return newBanners;
        });
      }).catch(() => {
        const objectUrl = URL.createObjectURL(file);
        setHeroBanner(prev => {
          const newBanners = [...prev];
          newBanners[index] = { ...newBanners[index], mediaUrl: objectUrl, mediaType: 'image' };
          return newBanners;
        });
      });
    } else if (isVideo) {
      const objectUrl = URL.createObjectURL(file);
      setHeroBanner(prev => {
        const newBanners = [...prev];
        newBanners[index] = { ...newBanners[index], mediaUrl: objectUrl, mediaType: 'video' };
        return newBanners;
      });
    }

    if (isVideo) {
      if (!storage) {
        showToast("Firebase Storage not available. Video loaded locally only.", "warning");
        setUploadingMedia(null);
        return;
      }
      showToast("Uploading video to secure cloud storage...");
      
      const storageRef = ref(storage, `cms/${selectedStore}/heroBanners/video_${index}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        }, 
        (error) => {
          console.error("Firebase Storage video upload error:", error);
          showToast("Video upload failed. Loaded locally only.", "error");
          setUploadingMedia(null);
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setHeroBanner(prev => {
              const newBanners = [...prev];
              newBanners[index] = { ...newBanners[index], mediaUrl: downloadURL, mediaType: 'video' };
              return newBanners;
            });
            setUploadingMedia(null);
            showToast("Video uploaded and saved permanently!");
          });
        }
      );
      return;
    }

    uploadToImgBB(file, setUploadProgress)
      .then(downloadURL => {
        setHeroBanner(prev => {
          const newBanners = [...prev];
          newBanners[index] = { ...newBanners[index], mediaUrl: downloadURL, mediaType: 'image' };
          return newBanners;
        });
        setUploadingMedia(null);
        showToast("Image uploaded successfully via ImgBB!");
      })
      .catch(error => {
        console.error("ImgBB upload error:", error);
        showToast("Upload failed. Loading compressed image locally...", "warning");
        compressImage(file).then(compressedUrl => {
          setHeroBanner(prev => {
            const newBanners = [...prev];
            newBanners[index] = { ...newBanners[index], mediaUrl: compressedUrl, mediaType: 'image' };
            return newBanners;
          });
          setUploadingMedia(null);
        }).catch(() => {
          setUploadingMedia(null);
        });
      });
  };

  const handleSlideChange = (index, field, value) => {
    setHeroBanner(prev => {
      const newBanners = [...prev];
      newBanners[index] = { ...newBanners[index], [field]: value };
      return newBanners;
    });
  };

  const addSlide = () => {
    setHeroBanner(prev => [
      ...prev,
      {
        title: '',
        subtitle: '',
        ctaText: 'Shop Now',
        mediaType: 'image',
        mediaUrl: '',
        isActive: true,
        sortOrder: prev.length + 1
      }
    ]);
  };

  const removeSlide = (index) => {
    setHeroBanner(prev => {
      const newBanners = [...prev];
      newBanners.splice(index, 1);
      return newBanners;
    });
  };

  const handleSaveDraft = async () => {
    if (!isSuperAdmin) {
      showToast("Access Denied: Only Super Admin can save drafts.", "error");
      return;
    }
    const hasBlobUrls = heroBanner.some(slide => slide.mediaUrl && slide.mediaUrl.startsWith('blob:'));
    if (hasBlobUrls) {
      showToast("Please wait for all media files to finish uploading before saving.", "error");
      return;
    }
    setSaving(true);
    try {
      if (!db) throw new Error("Database not initialized");
      const draftRef = doc(db, 'landingCMS', selectedStore, 'sections', 'heroBannersDraft');
      await setDoc(draftRef, {
        slides: heroBanner,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'admin'
      }, { merge: true });
      setOriginalHeroBanner(heroBanner);
      showToast("Draft saved successfully!");
    } catch (err) {
      console.error("Error saving draft:", err);
      showToast("Failed to save draft.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isSuperAdmin) {
      showToast("Access Denied: Only Super Admin can publish banners.", "error");
      return;
    }
    const hasBlobUrls = heroBanner.some(slide => slide.mediaUrl && slide.mediaUrl.startsWith('blob:'));
    if (hasBlobUrls) {
      showToast("Please wait for all media files to finish uploading before publishing.", "error");
      return;
    }
    setPublishing(true);
    try {
      if (!db) throw new Error("Database not initialized");
      const publishRef = doc(db, 'landingCMS', selectedStore, 'sections', 'heroBanners');
      await setDoc(publishRef, {
        slides: heroBanner,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'admin'
      }, { merge: true });
      
      const draftRef = doc(db, 'landingCMS', selectedStore, 'sections', 'heroBannersDraft');
      await setDoc(draftRef, {
        slides: heroBanner,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'admin'
      }, { merge: true });

      setOriginalHeroBanner(heroBanner);
      showToast("Successfully updated! Changes published to live landing page.");
    } catch (err) {
      console.error("Error publishing changes:", err);
      showToast("Failed to publish changes.", "error");
    } finally {
      setPublishing(false);
    }
  };

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
      if (typeof navigator !== 'undefined' && !navigator.onLine || e.code === 'unavailable' || e.message?.includes('offline')) {
        console.warn("Offline: Using cached or default CMS data");
      } else {
        console.error("Error fetching CMS data:", e);
      }
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
    if (!isSuperAdmin) {
      showToast("Access Denied: Only Super Admin can publish landing page changes.", "error");
      return;
    }
    setSaving(true);
    try {
      if (!db) throw new Error("Database not initialized");

      // Save custom New Arrivals to main products collection
      const newArrivalsItems = data.newArrivals?.items || [];
      const updatedNewArrivalsItems = [];
      for (let item of newArrivalsItems) {
        if (!item.name) continue;
        
        const q = query(
          collection(db, 'products'),
          where('name', '==', item.name),
          where('storeId', '==', selectedStore)
        );
        const snap = await getDocs(q);
        let productId = item.id;
        
        const productPayload = {
          name: item.name,
          category: item.category || 'Necklaces',
          price: Number(item.price) || 0,
          originalPrice: Number(item.originalPrice) || 0,
          mrp: Number(item.originalPrice) || 0,
          image: item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80',
          badge: item.badge || 'New',
          rating: Number(item.rating) || 5,
          reviews: Number(item.reviews) || 0,
          storeId: selectedStore,
          stock: 10,
          minStock: 3,
          warehouse: 'Mumbai HQ',
          status: 'ok',
          isNew: true,
          updatedAt: serverTimestamp()
        };

        if (!snap.empty) {
          productId = snap.docs[0].id;
          await setDoc(doc(db, 'products', productId), productPayload, { merge: true });
        } else {
          const docRef = await addDoc(collection(db, 'products'), {
            ...productPayload,
            createdAt: serverTimestamp()
          });
          productId = docRef.id;
        }
        
        updatedNewArrivalsItems.push({
          ...item,
          id: productId,
          image: productPayload.image
        });
      }

      // Save custom Best Sellers to main products collection
      const bestSellersItems = data.bestSellers?.items || [];
      const updatedBestSellersItems = [];
      for (let item of bestSellersItems) {
        if (!item.name) continue;
        
        const q = query(
          collection(db, 'products'),
          where('name', '==', item.name),
          where('storeId', '==', selectedStore)
        );
        const snap = await getDocs(q);
        let productId = item.id;
        
        const productPayload = {
          name: item.name,
          category: item.category || 'Rings',
          price: Number(item.price) || 0,
          originalPrice: Number(item.originalPrice) || 0,
          mrp: Number(item.originalPrice) || 0,
          image: item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80',
          badge: item.badge || 'Best Seller',
          rating: Number(item.rating) || 5,
          reviews: Number(item.reviews) || 0,
          storeId: selectedStore,
          stock: 10,
          minStock: 3,
          warehouse: 'Mumbai HQ',
          status: 'ok',
          isBestSeller: true,
          updatedAt: serverTimestamp()
        };

        if (!snap.empty) {
          productId = snap.docs[0].id;
          await setDoc(doc(db, 'products', productId), productPayload, { merge: true });
        } else {
          const docRef = await addDoc(collection(db, 'products'), {
            ...productPayload,
            createdAt: serverTimestamp()
          });
          productId = docRef.id;
        }
        
        updatedBestSellersItems.push({
          ...item,
          id: productId,
          image: productPayload.image
        });
      }

      // Update CMS data structure with the synchronized IDs and images
      const finalData = {
        ...data,
        newArrivals: {
          ...data.newArrivals,
          items: updatedNewArrivalsItems
        },
        bestSellers: {
          ...data.bestSellers,
          items: updatedBestSellersItems
        }
      };

      await setDoc(doc(db, 'cms', 'landingPage'), {
        ...finalData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setData(finalData);
      setOriginalData(finalData);
      showToast("Changes made successfully!");
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
    
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be smaller than 10MB", "error");
      return;
    }

    setUploadingSlide(index);
    uploadToImgBB(file)
      .then(downloadURL => {
        handleHeroChange(index, 'bgImage', downloadURL);
        setUploadingSlide(null);
        showToast("Image uploaded successfully via ImgBB!");
      })
      .catch(error => {
        console.error("ImgBB upload error:", error);
        showToast("Upload failed. Loading compressed image locally...", "warning");
        compressImage(file).then(compressedUrl => {
          handleHeroChange(index, 'bgImage', compressedUrl);
          setUploadingSlide(null);
        }).catch(() => {
          setUploadingSlide(null);
        });
      });
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
    
    if (file.size > 50 * 1024 * 1024) {
      showToast("Image must be smaller than 50MB", "error");
      return;
    }

    setUploadingNewArrival(index);
    const objectUrl = URL.createObjectURL(file);
    handleNewArrivalsItemChange(index, 'image', objectUrl);

    uploadToImgBB(file)
      .then(downloadURL => {
        handleNewArrivalsItemChange(index, 'image', downloadURL);
        setUploadingNewArrival(null);
        showToast("Image uploaded successfully via ImgBB!");
      })
      .catch(error => {
        console.error("ImgBB upload error:", error);
        showToast("Upload failed. Loading compressed image locally...", "warning");
        compressImage(file).then(compressedUrl => {
          handleNewArrivalsItemChange(index, 'image', compressedUrl);
          setUploadingNewArrival(null);
        }).catch(() => {
          setUploadingNewArrival(null);
        });
      });
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

    if (file.size > 50 * 1024 * 1024) {
      showToast("Image must be smaller than 50MB", "error");
      return;
    }

    setUploadingBestSeller(index);
    const objectUrl = URL.createObjectURL(file);
    handleBestSellersItemChange(index, 'image', objectUrl);

    uploadToImgBB(file)
      .then(downloadURL => {
        handleBestSellersItemChange(index, 'image', downloadURL);
        setUploadingBestSeller(null);
        showToast("Image uploaded successfully via ImgBB!");
      })
      .catch(error => {
        console.error("ImgBB upload error:", error);
        showToast("Upload failed. Loading compressed image locally...", "warning");
        compressImage(file).then(compressedUrl => {
          handleBestSellersItemChange(index, 'image', compressedUrl);
          setUploadingBestSeller(null);
        }).catch(() => {
          setUploadingBestSeller(null);
        });
      });
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
    
    if (file.size > 50 * 1024 * 1024) {
      showToast("Image must be smaller than 50MB", "error");
      return;
    }

    setUploadingShowcaseImage(index);
    const objectUrl = URL.createObjectURL(file);
    handleProductShowcaseImageChange(index, objectUrl);

    uploadToImgBB(file)
      .then(downloadURL => {
        handleProductShowcaseImageChange(index, downloadURL);
        setUploadingShowcaseImage(null);
        showToast("Image uploaded successfully via ImgBB!");
      })
      .catch(error => {
        console.error("ImgBB upload error:", error);
        showToast("Upload failed. Loading compressed image locally...", "warning");
        compressImage(file).then(compressedUrl => {
          handleProductShowcaseImageChange(index, compressedUrl);
          setUploadingShowcaseImage(null);
        }).catch(() => {
          setUploadingShowcaseImage(null);
        });
      });
  };

  const handleResetAll = async () => {
    setLoading(true);
    try {
      await fetchData();
      await fetchHeroBanner(selectedStore);
      showToast("Content reset to last saved state.");
    } catch (err) {
      console.error("Error resetting content:", err);
      showToast("Failed to reset content.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData) || JSON.stringify(heroBanner) !== JSON.stringify(originalHeroBanner);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Landing Page CMS</h1>
          <p className="page-subtitle">Manage homepage content, banners, and SEO dynamically.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={handleResetAll} disabled={saving || !hasChanges}><RefreshCcw size={16} style={{ marginRight: 6 }} /> Reset</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving || !hasChanges || !isSuperAdmin} style={{ color: '#fff', fontWeight: 'bold', opacity: (!hasChanges || !isSuperAdmin ? 0.6 : 1) }}>
            {saving ? <Loader className="spin" size={16} /> : <Save size={16} />} 
            <span style={{ marginLeft: 6 }}>{saving ? 'Saving...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Warning alert if not superadmin */}
      {!isSuperAdmin && (
        <div style={{
          marginBottom: '1.5rem', backgroundColor: 'rgba(231,76,60,0.1)', border: '1px solid var(--status-red)', 
          color: 'var(--status-red)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <ShieldCheck size={20} />
          <span><strong>Access Restricted:</strong> You are logged in as {user?.role || 'staff'}. Only a Super Admin can edit or publish landing page content.</span>
        </div>
      )}

      {/* Store Selection Dropdown */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 'bold', minWidth: '100px' }}>Select Store:</label>
          <select 
            className="form-input" 
            style={{ maxWidth: '300px' }} 
            value={selectedStore} 
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            <option value="global">Global (Fallback)</option>
            {assignedStores && assignedStores.map(store => (
              <option key={store.id} value={store.id}>{store.name || store.id}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div className="admin-card" style={{ padding: '1rem 0' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { id: 'branding', label: 'Branding', icon: <ImageIcon size={16} /> },
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
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">Hero Banner Editor ({heroBanner.length} slides)</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={handleSaveDraft} 
                    disabled={saving || uploadingMedia !== null || !isSuperAdmin}
                  >
                    {saving ? <Loader className="spin" size={16} style={{ marginRight: 6 }} /> : null}
                    Save Draft
                  </button>
                  <button 
                    className="btn btn-gold" 
                    style={{ color: '#fff', fontWeight: 'bold', opacity: (!isSuperAdmin ? 0.6 : 1) }} 
                    onClick={handlePublish} 
                    disabled={publishing || uploadingMedia !== null || !isSuperAdmin}
                  >
                    {publishing ? <Loader className="spin" size={16} style={{ marginRight: 6 }} /> : null}
                    Publish to Live
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {heroBanner.map((slide, index) => (
                  <div key={index} style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--gold)' }}>Slide #{index + 1}</h3>
                      {heroBanner.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)', padding: '0.4rem 0.8rem' }}
                          onClick={() => removeSlide(index)}
                        >
                          <Trash2 size={14} style={{ marginRight: 4 }} /> Remove Slide
                        </button>
                      )}
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label>Title</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={slide.title || ''} 
                          onChange={e => handleSlideChange(index, 'title', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Subtitle</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={slide.subtitle || ''} 
                          onChange={e => handleSlideChange(index, 'subtitle', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>CTA Button Text</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={slide.ctaText || ''} 
                          onChange={e => handleSlideChange(index, 'ctaText', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Media Type</label>
                        <select 
                          className="form-input"
                          value={slide.mediaType || 'image'}
                          onChange={e => handleSlideChange(index, 'mediaType', e.target.value)}
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Media Upload ({slide.mediaType || 'image'})</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {slide.mediaType === 'video' ? 'Formats: MP4, WEBM (Max 100MB)' : 'Formats: JPG, PNG, WEBP (Max 50MB)'}
                        </span>
                      </label>
                      
                      {(slide.mediaUrl || slide.mediaType === 'video') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ position: 'relative', maxWidth: '480px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            {slide.mediaType === 'video' ? (
                              <video src={slide.mediaUrl || (index === 0 ? localHeroVideo2 : localHeroVideo1)} controls muted style={{ width: '100%', display: 'block' }} />
                            ) : (
                              <img src={slide.mediaUrl} alt="Hero Banner Preview" style={{ width: '100%', display: 'block' }} />
                            )}
                            {uploadingMedia === index ? (
                              <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#fff'
                              }}>
                                <Loader className="spin" size={24} color="var(--gold)" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Uploading {uploadProgress}%</span>
                                <div style={{ width: '60%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--gold)' }} />
                                </div>
                              </div>
                            ) : (
                              slide.mediaUrl ? (
                                <button 
                                  type="button"
                                  className="btn btn-outline" 
                                  style={{ 
                                    position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.9)', 
                                    color: 'var(--status-red)', borderColor: 'var(--status-red)', padding: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' 
                                  }}
                                  onClick={() => handleSlideChange(index, 'mediaUrl', '')}
                                >
                                  <Trash2 size={14} /> Delete Custom Media
                                </button>
                              ) : null
                            )}
                          </div>
                          {slide.mediaUrl ? (
                            uploadingMedia !== index && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                Media URL: <a href={slide.mediaUrl} target="_blank" rel="noreferrer">{slide.mediaUrl}</a>
                              </p>
                            )
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <p style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 'bold', margin: 0 }}>
                                🎬 Using default landing page video background (localHeroVideo2)
                              </p>
                              <label className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start', margin: 0 }}>
                                <UploadCloud size={14} /> Upload Custom Video/Image to Replace
                                <input 
                                  type="file" 
                                  accept={slide.mediaType === 'video' ? 'video/*' : 'image/*'} 
                                  style={{ display: 'none' }} 
                                  onChange={(e) => handleMediaUpload(e, index)} 
                                  disabled={uploadingMedia !== null}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <UploadCloud size={16} /> Choose File & Upload
                            <input 
                              type="file" 
                              accept={slide.mediaType === 'video' ? 'video/*' : 'image/*'} 
                              style={{ display: 'none' }} 
                              onChange={(e) => handleMediaUpload(e, index)} 
                              disabled={uploadingMedia !== null}
                            />
                          </label>
                          {uploadingMedia === index && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--gold)', borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{uploadProgress}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid-2" style={{ marginTop: '1rem' }}>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          id={`hero-slide-active-${index}`}
                          checked={slide.isActive} 
                          onChange={e => handleSlideChange(index, 'isActive', e.target.checked)} 
                        />
                        <label htmlFor={`hero-slide-active-${index}`} style={{ cursor: 'pointer', userSelect: 'none' }}>Active (Display on Homepage)</label>
                      </div>
                      <div className="form-group">
                        <label>Sort Order</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={slide.sortOrder || 1} 
                          onChange={e => handleSlideChange(index, 'sortOrder', parseInt(e.target.value) || 1)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                  onClick={addSlide}
                >
                  <Plus size={16} style={{ marginRight: 6 }} /> Add Slide
                </button>
              </div>
            </div>
          )}
          {/* BRANDING TAB */}
          {activeTab === 'branding' && (
            <div className="admin-card">
              <h2 className="admin-card-title">Store Branding</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Manage your store name and logo. These will appear in the header, footer, admin panel, and browser tabs.
              </p>
              
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={data.branding?.storeName || ''} 
                  onChange={(e) => setData({...data, branding: {...data.branding, storeName: e.target.value}})} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store Logo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: 8, border: '1px dashed var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa',
                    backgroundImage: data.branding?.logoUrl ? `url(${data.branding.logoUrl})` : 'none',
                    backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
                  }}>
                    {!data.branding?.logoUrl && <ImageIcon size={32} color="var(--border)" />}
                  </div>
                  <div>
                    <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                      <UploadCloud size={16} style={{ marginRight: 8 }} />
                      Upload Logo
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 50 * 1024 * 1024) {
                            showToast("Logo size exceeds 50MB limit.", "error");
                            return;
                          }
                          if (!file.type.startsWith('image/')) {
                            showToast("Please upload an image file.", "error");
                            return;
                          }
                          const saveLogoData = async (url) => {
                            const updatedData = {
                              ...data,
                              branding: {
                                ...data.branding,
                                logoUrl: url
                              }
                            };
                            setData(updatedData);
                            if (db) {
                              await setDoc(doc(db, 'cms', 'landingPage'), {
                                ...updatedData,
                                updatedAt: serverTimestamp()
                              }, { merge: true });
                            }
                            setOriginalData(updatedData);
                            showToast("Changes made successfully!");
                          };

                          // Set immediate local preview
                          const objectUrl = URL.createObjectURL(file);
                          setData(prev => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              logoUrl: objectUrl
                            }
                          }));

                          uploadToImgBB(file)
                            .then(async (url) => {
                              try {
                                await saveLogoData(url);
                              } catch (saveErr) {
                                console.error("Error saving updated logo:", saveErr);
                                showToast("Failed to save logo changes", "error");
                              }
                            })
                            .catch(async (error) => {
                              console.error("ImgBB upload error:", error);
                              showToast("Logo upload failed. Loading locally as fallback...", "warning");
                              compressImage(file).then(async (compressedUrl) => {
                                try {
                                  await saveLogoData(compressedUrl);
                                } catch (saveErr) {
                                  console.error("Error saving updated logo:", saveErr);
                                  showToast("Failed to save logo changes", "error");
                                }
                              }).catch(err => {
                                console.error("Local compression error:", err);
                                showToast("Failed to process logo", "error");
                              });
                            });
                        }}
                      />
                    </label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Recommended: Transparent PNG, 200x200px or similar ratio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO TAB */}
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input type="text" className="form-input" placeholder="Title (e.g. 50,000+)" value={badge.label} onChange={e => handleBrandStoryBadgeChange(i, 'label', e.target.value)} />
                            <input type="text" className="form-input" placeholder="Subtitle (e.g. Happy Customers)" value={badge.sub} onChange={e => handleBrandStoryBadgeChange(i, 'sub', e.target.value)} />
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
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 50MB limit</span>
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
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                   <div className="form-group" style={{ margin: 0 }}>
                                     <label style={{ display: 'block', marginBottom: '0.3rem' }}>Product Image URL / Path</label>
                                     <input 
                                       type="text" 
                                       className="form-input" 
                                       placeholder="e.g. /src/assets/rings.png or https://images.unsplash.com/..." 
                                       value={item.image || ''} 
                                       onChange={e => handleNewArrivalsItemChange(i, 'image', e.target.value)} 
                                     />
                                   </div>
                                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                     <label className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                       <UploadCloud size={14} /> Upload Image
                                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleNewArrivalsImageUpload(e, i)} />
                                     </label>
                                     {uploadingNewArrival === i ? (
                                       <div style={{ fontSize: '0.8rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader size={12} className="spin" /> Uploading...</div>
                                     ) : (
                                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 50MB limit</span>
                                     )}
                                   </div>
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
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                   <div className="form-group" style={{ margin: 0 }}>
                                     <label style={{ display: 'block', marginBottom: '0.3rem' }}>Product Image URL / Path</label>
                                     <input 
                                       type="text" 
                                       className="form-input" 
                                       placeholder="e.g. /src/assets/rings.png or https://images.unsplash.com/..." 
                                       value={item.image || ''} 
                                       onChange={e => handleBestSellersItemChange(i, 'image', e.target.value)} 
                                     />
                                   </div>
                                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                     <label className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                       <UploadCloud size={14} /> Upload Image
                                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleBestSellersImageUpload(e, i)} />
                                     </label>
                                     {uploadingBestSeller === i ? (
                                       <div style={{ fontSize: '0.8rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader size={12} className="spin" /> Uploading...</div>
                                     ) : (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 50MB limit</span>
                                     )}
                                   </div>
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
