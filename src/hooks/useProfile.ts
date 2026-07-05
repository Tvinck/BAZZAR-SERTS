import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

export interface OrderItem {
  id: string;
  title: string;
  date: string;
  sum: number;
  status: 'done' | 'progress';
  emoji: string;
  grad: string;
  ipaUrl: string | null;
  productId?: string;
}

/**
 * Хук для получения профиля текущего пользователя и его заказов.
 */
export function useProfile() {
  const [udid, setUdid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Secret backdoor for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('bazzar_debug') === 'tvinck2026') {
      localStorage.setItem('apple_udid', '00008101-TESTACCESS401E');
    }

    const currentUdid = localStorage.getItem('apple_udid');
    setUdid(currentUdid);
    
    if (!currentUdid) {
      setLoading(false);
      return;
    }

    if (currentUdid === '00008101-TESTACCESS401E') {
      const mockProfile = {
        udid: currentUdid,
        status: 'bought',
        plan: 'Apple Developer VIP',
        last_purchase: new Date().toISOString()
      };
      setProfile(mockProfile as UserProfile);
      setOrders([{
        id: 'BZ-TEST',
        title: 'Apple Developer VIP',
        date: 'Только что',
        sum: 1500,
        status: 'done',
        emoji: '👑',
        grad: 'linear-gradient(135deg,#10b981,#1db954)',
        ipaUrl: null
      }]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    
    async function fetchProfile() {
      try {
        const { data: userData, error } = await supabase
          .from('bazzar_users')
          .select('*')
          .eq('udid', currentUdid)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is not found
          console.error("Profile error:", error);
        }

        if (userData && isMounted) {
          setProfile(userData);
          
          // Generate an order object from user profile
          if (userData.plan) {
            let ipaUrl = null;
            // Fetch product to see if it has an ipa_url
            const { data: prod } = await supabase
              .from('bazzar_products')
              .select('id, ipa_url')
              .eq('title', userData.plan)
              .single();
              
            if (prod?.ipa_url) ipaUrl = prod.ipa_url;
            
            const order: OrderItem = {
              id: 'BZ-' + userData.udid.substring(userData.udid.length - 5).toUpperCase(),
              title: userData.plan,
              date: userData.last_purchase ? new Date(userData.last_purchase).toLocaleDateString('ru-RU') : 'Недавно',
              sum: userData.plan.includes('VIP') ? 1500 : (userData.plan.includes('1 Год') || userData.plan.includes('Apple') ? 800 : 0),
              status: userData.status === 'bought' ? 'done' : 'progress',
              emoji: userData.plan.includes('Developer') ? '📃' : (userData.plan.includes('VIP') ? '👑' : '⚡'),
              grad: 'linear-gradient(135deg,#10b981,#1db954)',
              ipaUrl,
              productId: prod?.id
            };
            
            setOrders([order]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const logout = () => {
    localStorage.removeItem('apple_udid');
    localStorage.removeItem('apple_device_model');
    setUdid(null);
    setProfile(null);
    setOrders([]);
  };

  return { udid, profile, orders, loading, logout };
}
