import { useEffect } from 'react';
import { Property, SiteSettings } from '../types';

export interface DynamicHeadOptions {
  currentView: 'public' | 'admin';
  selectedProperty: Property | null;
  selectedCategory: string;
  selectedLocation: string;
  searchQuery?: string;
  totalFilteredCount?: number;
  settings: SiteSettings;
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  ogType: string;
  keywords: string;
  robots: string;
  jsonLd: Record<string, any>;
}

export function generatePageMetadata({
  currentView,
  selectedProperty,
  selectedCategory,
  selectedLocation,
  searchQuery = '',
  totalFilteredCount = 0,
  settings
}: DynamicHeadOptions): GeneratedMetadata {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const defaultImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  let title = 'Feni House Rent - সেরা বাসা ও মেস ভাড়া পোর্টাল';
  let description = 'ফেনী শহরের আবাসিক ও বাণিজ্যিক বাসা ভাড়া, ফ্ল্যাট ও ব্যাচেলর মেস টু-লেট পোর্টাল। সরাসরি মালিকের যোগাযোগ নম্বর।';
  let ogImage = defaultImage;
  let canonicalUrl = `${origin}${pathname}`;
  let ogType = 'website';
  let robots = 'index, follow';
  let keywords = 'বাসা ভাড়া, Feni House Rent, ফেনী মেস ভাড়া, Feni To-Let, Trunk Road Feni rent, Bachelor Mess Feni';
  let jsonLd: Record<string, any> = {};

  // 1. Admin Portal View
  if (currentView === 'admin') {
    title = 'অ্যাডমিন ড্যাশবোর্ড | Feni House Rent';
    description = 'Feni House Rent অ্যাডমিন পোর্টাল - বাসা তালিকা ও পেমেন্ট অর্ডার ব্যবস্থাপনা।';
    canonicalUrl = `${origin}${pathname}#admin`;
    robots = 'noindex, nofollow';
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Feni House Rent Admin Portal',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': description
    };
  }
  // 2. Selected Property Details View (Highest specificity for SEO)
  else if (selectedProperty) {
    const formattedPrice = `৳${selectedProperty.price.toLocaleString()}/মাস`;
    const availStatus = selectedProperty.isAvailable !== false ? 'ভাড়া হবে' : 'বুকড';
    
    // 30-60 chars title
    title = `${selectedProperty.title} (${formattedPrice}) | Feni House Rent`;
    if (title.length > 60) {
      title = `${selectedProperty.title.slice(0, 38)}... (${formattedPrice}) | FHR`;
    }

    // 120-160 chars description
    description = `${selectedProperty.title} - এলাকা: ${selectedProperty.location} (${selectedProperty.exactAddress})। ${selectedProperty.beds} বেড, ${selectedProperty.baths} বাথ, ${selectedProperty.sqft} sqft। ভাড়া: ${formattedPrice} (${availStatus})`;
    if (description.length > 160) {
      description = description.slice(0, 157) + '...';
    }

    ogImage = selectedProperty.image || defaultImage;
    canonicalUrl = `${origin}${pathname}?property=${selectedProperty.id}`;
    ogType = 'article';
    keywords = `${selectedProperty.title}, ${selectedProperty.location} বাসা ভাড়া, ${selectedProperty.category} ভাড়া, ${selectedProperty.exactAddress}, টু-লেট ফেনী, Feni House Rent`;

    const reviews = selectedProperty.reviews || [];
    const ratingValue = selectedProperty.avgRating || 5.0;
    const reviewCount = selectedProperty.reviewCount || (reviews.length > 0 ? reviews.length : 1);

    // Schema.org Apartment / Accommodation listing
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Apartment',
      'name': selectedProperty.title,
      'description': description,
      'image': ogImage,
      'url': canonicalUrl,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': selectedProperty.exactAddress,
        'addressLocality': selectedProperty.location,
        'addressRegion': 'Feni',
        'addressCountry': 'BD'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 23.0159,
        'longitude': 91.3976
      },
      'numberOfRooms': selectedProperty.beds,
      'numberOfBathroomsTotal': selectedProperty.baths,
      'floorSize': {
        '@type': 'QuantitativeValue',
        'value': selectedProperty.sqft,
        'unitCode': 'FTK'
      },
      'offers': {
        '@type': 'Offer',
        'price': selectedProperty.price,
        'priceCurrency': 'BDT',
        'priceSpecification': {
          '@type': 'UnitPriceSpecification',
          'price': selectedProperty.price,
          'priceCurrency': 'BDT',
          'unitCode': 'MON'
        },
        'availability': selectedProperty.isAvailable !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': ratingValue,
        'reviewCount': reviewCount,
        'bestRating': 5,
        'worstRating': 1
      }
    };
  }
  // 3. Search Query Active View
  else if (searchQuery.trim().length > 0) {
    const query = searchQuery.trim();
    title = `'${query}' সম্পর্কিত বাসা ভাড়া (${totalFilteredCount}টি ফলাফল) | Feni House Rent`;
    description = `ফেনীতে '${query}' সংক্রান্ত মোট ${totalFilteredCount}টি বাসা ও মেসের বিস্তারিত তথ্য ও ভাড়া।`;
    canonicalUrl = `${origin}${pathname}?q=${encodeURIComponent(query)}`;
    keywords = `${query}, বাসা ভাড়া, ${query} Feni rent`;
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      'name': title,
      'description': description,
      'url': canonicalUrl
    };
  }
  // 4. Category or Location Filter View
  else if (selectedCategory !== 'All' || selectedLocation !== 'All') {
    const catText = selectedCategory !== 'All' ? selectedCategory : 'বাসা';
    const locText = selectedLocation !== 'All' ? `${selectedLocation} এলাকায়` : 'ফেনীতে';
    
    title = `${catText} ভাড়া ${locText} (${totalFilteredCount}টি উপলব্ধ) | Feni House Rent`;
    description = `${locText} পাওয়া যাচ্ছে যাচাইকৃত ${catText}। সরাসরি বাড়িওয়ালার সাথে কথা বলুন।`;
    canonicalUrl = `${origin}${pathname}?category=${encodeURIComponent(selectedCategory)}&location=${encodeURIComponent(selectedLocation)}`;
    keywords = `${catText} ভাড়া, ${locText} বাসা, ${selectedCategory} To-Let Feni, Feni House Rent`;
    
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': title,
      'description': description,
      'url': canonicalUrl,
      'about': {
        '@type': 'Thing',
        'name': `${catText} in ${locText}`
      }
    };
  }
  // 5. Default Public Homepage View
  else {
    title = 'Feni House Rent - সেরা বাসা ও মেস ভাড়া পোর্টাল';
    description = 'ফেনী শহরের আবাসিক ও বাণিজ্যিক বাসা ভাড়া, ফ্ল্যাট ও ব্যাচেলর মেস টু-লেট পোর্টাল। সরাসরি মালিকের যোগাযোগ নম্বর।';
    canonicalUrl = `${origin}${pathname}`;
    keywords = 'বাসা ভাড়া, Feni House Rent, ফেনী মেস ভাড়া, Feni To-Let, Trunk Road Feni, Masterpara Feni, Shaheed Shahidullah Kaiser Road rent';
    
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      'name': 'Feni House Rent',
      'description': description,
      'url': canonicalUrl,
      'image': ogImage,
      'telephone': settings.helpPhone || '01812-345678',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': settings.address || 'ট্রাঙ্ক রোড, ফেনী সদর',
        'addressLocality': 'Feni',
        'addressRegion': 'Chittagong',
        'addressCountry': 'BD'
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${origin}${pathname}?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  return {
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType,
    keywords,
    robots,
    jsonLd
  };
}

export function useDynamicHead(options: DynamicHeadOptions) {
  useEffect(() => {
    const meta = generatePageMetadata(options);

    // 1. Update Document Title
    document.title = meta.title;

    // Helper to safely update or create meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard SEO Meta Tags
    setMetaTag('name', 'description', meta.description);
    setMetaTag('name', 'keywords', meta.keywords);
    setMetaTag('name', 'robots', meta.robots);

    // 3. OpenGraph Social Share Card Tags
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('property', 'og:description', meta.description);
    setMetaTag('property', 'og:image', meta.ogImage);
    setMetaTag('property', 'og:url', meta.canonicalUrl);
    setMetaTag('property', 'og:type', meta.ogType);
    setMetaTag('property', 'og:site_name', 'Feni House Rent');
    setMetaTag('property', 'og:locale', 'bn_BD');

    // 4. Twitter / X Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', meta.title);
    setMetaTag('name', 'twitter:description', meta.description);
    setMetaTag('name', 'twitter:image', meta.ogImage);

    // 5. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', meta.canonicalUrl);

    // 6. Schema.org JSON-LD structured data script
    let scriptTag = document.getElementById('seo-jsonld-schema') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-jsonld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(meta.jsonLd, null, 2);
  }, [
    options.currentView,
    options.selectedProperty,
    options.selectedCategory,
    options.selectedLocation,
    options.searchQuery,
    options.totalFilteredCount,
    options.settings
  ]);
}
