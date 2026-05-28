import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { MapPin, Truck, ChevronLeft, Package, Clock, CheckCircle } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { adminUsers } from '../../admin/data/mockData';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 19.0760, // Mumbai HQ
  lng: 72.8777
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const { orders } = useOrders();
  
  // Find the order, or use a mock if not found for demo purposes
  const order = orders?.find(o => o.id === orderId) || {
    id: orderId || '#LJ-7890',
    status: 'shipped',
    customer: 'Customer',
    date: '27 May 2026',
    items: [{ name: 'Royal Diamond Necklace Set', qty: 1 }],
    tracking: 'AWB987654321',
    address: 'Andheri East, Mumbai'
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with real key
  });

  const [deliveryLocation, setDeliveryLocation] = useState({ lat: 19.1136, lng: 72.8697 }); // Andheri
  const [storeLocation] = useState(defaultCenter);
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  
  // Mock live vehicle movement
  useEffect(() => {
    if (!isLoaded || order.status === 'delivered') return;
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      if (progress > 1) {
        progress = 1;
        clearInterval(interval);
      }
      
      const newLat = storeLocation.lat + (deliveryLocation.lat - storeLocation.lat) * progress;
      const newLng = storeLocation.lng + (deliveryLocation.lng - storeLocation.lng) * progress;
      
      setCurrentLocation({ lat: newLat, lng: newLng });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoaded, order.status, storeLocation, deliveryLocation]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      }
    ]
  }), []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/customer/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
        <ChevronLeft size={16} /> Back to Orders
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Track Order {order.id}</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: '0.25rem' }}>Estimated Delivery: Today by 6:00 PM</p>
        </div>
        <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'info' : 'warning'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          {order.status.toUpperCase()}
        </span>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', boxShadow: 'var(--shadow-gold)' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={12}
            options={mapOptions}
          >
            {/* Store Location */}
            <Marker position={storeLocation} label={{ text: 'S', color: 'white', fontWeight: 'bold' }} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }} />
            
            {/* Delivery Destination */}
            <Marker position={deliveryLocation} label={{ text: 'D', color: 'white', fontWeight: 'bold' }} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }} />
            
            {/* Current Vehicle Location */}
            <Marker position={currentLocation} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/truck.png', scaledSize: new window.google.maps.Size(32, 32) }} />
            
            {/* Route Line */}
            <Polyline
              path={[storeLocation, deliveryLocation]}
              options={{ strokeColor: '#C9A84C', strokeOpacity: 0.8, strokeWeight: 4, borderStyle: 'dashed' }}
            />
          </GoogleMap>
        ) : (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading Maps...</p>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="admin-card">
          <h3 className="card-title">Delivery Status</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-24px', width: '2px', background: 'var(--gold)' }}></div>
              <div style={{ background: 'var(--gold)', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <CheckCircle size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Order Confirmed</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.date}, 10:00 AM</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-24px', width: '2px', background: order.status === 'shipped' || order.status === 'delivered' ? 'var(--gold)' : 'var(--border)' }}></div>
              <div style={{ background: order.status === 'shipped' || order.status === 'delivered' ? 'var(--gold)' : 'var(--surface)', color: order.status === 'shipped' || order.status === 'delivered' ? '#000' : 'var(--text-muted)', border: order.status === 'shipped' || order.status === 'delivered' ? 'none' : '2px solid var(--border)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <Package size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: order.status === 'shipped' || order.status === 'delivered' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Dispatched from Store</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.status === 'shipped' || order.status === 'delivered' ? `${order.date}, 2:30 PM` : 'Pending'}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              <div style={{ background: order.status === 'delivered' ? 'var(--gold)' : 'var(--surface)', color: order.status === 'delivered' ? '#000' : 'var(--text-muted)', border: order.status === 'delivered' ? 'none' : '2px solid var(--border)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <MapPin size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: order.status === 'delivered' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Out for Delivery</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.status === 'delivered' ? `${order.date}, 5:45 PM` : 'In transit'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-card">
          <h3 className="card-title">Delivery Partner</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
              RS
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Ramesh Singh</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Truck size={14} /> MH-01-AB-1234
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
             <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery PIN</h4>
             <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px dashed var(--gold)', padding: '1rem', borderRadius: '8px', textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)' }}>
                1234
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>Provide this PIN to the delivery partner during handover.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
