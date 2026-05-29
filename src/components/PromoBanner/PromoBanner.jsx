import React from 'react';
import promoImage from '../../assets/jewellery_promo_banner.png';
import './PromoBanner.css';

export default function PromoBanner() {
  return (
    <section className="promo-banner-section reveal">
      <div className="container">
        <div className="promo-banner-wrapper">
          <img 
            src={promoImage} 
            alt="Jewelry of Everlasting Beauty - Discover our newest collection of elegant jewelry" 
            className="promo-banner-image"
          />
        </div>
      </div>
    </section>
  );
}
