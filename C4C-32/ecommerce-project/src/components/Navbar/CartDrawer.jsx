import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const CartDrawer = () => {
  const { t } = useLanguage();
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shippingFee, 
    totalAmount,
    clearCart
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'loading' | 'success'

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    setCheckoutStep('loading');
    
    // Simulate premium payment processing gateway
    setTimeout(() => {
      setCheckoutStep('success');
      clearCart();
      toast.success("Order placed successfully! Preserving Craft, Honoring Hands.", {
        duration: 5000
      });
    }, 2500);
  };

  const handleSuccessClose = () => {
    setCheckoutStep('cart');
    closeCart();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {/* Dark semi-transparent background overlay */}
      <div 
        onClick={checkoutStep === 'loading' ? null : closeCart}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(45, 37, 34, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          cursor: checkoutStep === 'loading' ? 'not-allowed' : 'pointer'
        }}
      />

      {/* Cart Sliding Panel Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        backgroundColor: 'var(--secondary-cream)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--cream-border)',
        transform: 'translateX(0)',
        animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        
        {/* HEADER PANEL */}
        <div style={{
          padding: '24px 30px',
          borderBottom: '1px solid var(--cream-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--cream-card)'
        }}>
          <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiShoppingBag style={{ color: 'var(--primary-terracotta)' }} />
            {checkoutStep === 'success' ? t('cart.orderComplete') : t('cart.yourCart')}
          </h3>
          {checkoutStep !== 'loading' && (
            <button 
              onClick={checkoutStep === 'success' ? handleSuccessClose : closeCart}
              style={{
                fontSize: '22px',
                color: 'var(--warm-charcoal-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '50%'
              }}
              className="nav-btn-icon"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* VIEW 1: Standard Cart Items List */}
        {checkoutStep === 'cart' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
              {cartItems.length === 0 ? (
                <div style={{
                  height: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'var(--warm-charcoal-muted)',
                  gap: '16px'
                }}>
                  <FiShoppingBag size={48} style={{ color: 'var(--cream-border)', marginBottom: '8px' }} />
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--warm-charcoal)' }}>{t('cart.cartEmpty')}</p>
                  <p style={{ fontSize: '14px' }}>{t('cart.cartEmptySub')}</p>
                  <button 
                    onClick={closeCart} 
                    className="btn-primary" 
                    style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px' }}
                  >
                    {t('cart.startExploring')}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {cartItems.map(item => (
                    <div 
                      key={item.id} 
                      style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '16px',
                        background: 'var(--cream-card)',
                        border: '1px solid var(--cream-border)',
                        borderRadius: 'var(--border-radius-md)',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: 'var(--border-radius-sm)',
                          objectFit: 'cover',
                          border: '1px solid var(--cream-border)'
                        }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px', fontFamily: 'var(--font-sans)' }}>{item.title}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--warm-charcoal-muted)' }}>{item.subtitle}</p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          {/* Quantity control pill */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--cream-border)',
                            borderRadius: '30px',
                            background: 'var(--white-pure)',
                            padding: '2px'
                          }}>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                            >
                              <FiMinus />
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: '600', padding: '0 8px', minWidth: '24px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                            >
                              <FiPlus />
                            </button>
                          </div>
                          
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-terracotta)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Delete trash button */}
                      <button 
                        onClick={() => { removeFromCart(item.id); toast.success("Item removed from cart"); }}
                        style={{
                          alignSelf: 'flex-start',
                          color: 'var(--warm-charcoal-muted)',
                          padding: '4px'
                        }}
                        className="nav-btn-icon"
                        title="Remove product"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUMMARY & ORDER PLACEMENT CTA */}
            {cartItems.length > 0 && (
              <div style={{
                padding: '30px',
                background: 'var(--cream-card)',
                borderTop: '1px solid var(--cream-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--warm-charcoal-muted)' }}>{t('cart.subtotal')}</span>
                    <span style={{ fontWeight: '500' }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--warm-charcoal-muted)' }}>{t('cart.shipping')}</span>
                    <span style={{ fontWeight: '500' }}>{shippingFee === 0 ? t('cart.free') : formatPrice(shippingFee)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '18px',
                    fontWeight: '700',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--cream-border)',
                    color: 'var(--warm-charcoal)'
                  }}>
                    <span>{t('cart.total')}</span>
                    <span style={{ color: 'var(--primary-terracotta)' }}>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <div style={{
                  padding: '12px 16px',
                  background: 'var(--primary-terracotta-light)',
                  border: '1px dashed rgba(168, 63, 27, 0.3)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '12px',
                  color: 'var(--primary-terracotta)',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {t('cart.pledgeText')}
                </div>

                <button onClick={handleCheckout} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '16px' }}>
                  {t('cart.placeOrder')} • {formatPrice(totalAmount)}
                </button>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: Processing Payment loading */}
        {checkoutStep === 'loading' && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            gap: '24px'
          }}>
            {/* Spinning potter wheel themed loader */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '4px solid var(--cream-border)',
              borderTopColor: 'var(--primary-terracotta)',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            
            <div>
              <h3 style={{ marginBottom: '8px' }}>{t('cart.securingTransaction')}</h3>
              <p style={{ color: 'var(--warm-charcoal-muted)', fontSize: '14px' }}>
                {t('cart.securingSub')}
              </p>
            </div>
          </div>
        )}

        {/* VIEW 3: Payment Success screen */}
        {checkoutStep === 'success' && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            gap: '30px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '2px solid var(--gold-accent)',
              backgroundColor: 'var(--primary-terracotta-light)',
              animation: 'pulseGold 2s infinite'
            }}>
              <FiCheckCircle size={56} style={{ color: 'var(--primary-terracotta)' }} />
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-terracotta)', fontSize: '26px', marginBottom: '12px' }}>
                {t('cart.orderPlacedSuccess')}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--warm-charcoal)', fontWeight: '500', marginBottom: '8px' }}>
                {t('cart.receiptCreated')}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--warm-charcoal-muted)' }}>
                {t('cart.preparingPackage')}
              </p>
            </div>

            <div style={{
              background: 'var(--cream-card)',
              border: '1px solid var(--cream-border)',
              padding: '16px 20px',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '13px',
              width: '100%'
            }}>
              {t('cart.profitInfo')}
            </div>

            <button onClick={handleSuccessClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {t('cart.returnBtn')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
