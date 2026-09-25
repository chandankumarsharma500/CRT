
import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  interval?: string;
  containerId?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ 
    symbol, 
    theme = 'dark', 
    interval = '15',
    containerId = 'tradingview_widget_container'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Use a stable ID that doesn't change on re-renders, but ensures uniqueness if multiple widgets exist
  const widgetId = useRef(`${containerId}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    let tvWidget: any = null;

    const initWidget = () => {
        // Critical: Check if component is still mounted AND if ref exists AND if element is actually in the DOM
        if (!isMounted || !containerRef.current || !document.body.contains(containerRef.current)) {
            return;
        }

        // Clean container strictly
        containerRef.current.innerHTML = "";

        if (window.TradingView) {
            try {
                tvWidget = new window.TradingView.widget({
                    autosize: true,
                    symbol: symbol,
                    interval: interval,
                    timezone: "Asia/Kolkata",
                    theme: theme,
                    style: "1",
                    locale: "in",
                    toolbar_bg: "#f1f3f6",
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: widgetId.current,
                    hide_side_toolbar: false,
                    withdateranges: true,
                    details: true,
                    hotlist: true,
                    calendar: true,
                    disabled_features: ["use_localstorage_for_settings"],
                    enabled_features: ["hide_left_toolbar_by_default"]
                });
            } catch (e) {
                console.error("TradingView Widget Error:", e);
            }
        }
    };

    // Load Script if not present
    if (!document.getElementById('tradingview-widget-script')) {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = initWidget;
        document.head.appendChild(script);
    } else {
        // If script exists, check if TV object is ready
        if (window.TradingView) {
            initWidget();
        } else {
            // Wait for it
            const checkInterval = setInterval(() => {
                if (window.TradingView) {
                    clearInterval(checkInterval);
                    initWidget();
                }
            }, 100);
            
            // Cleanup interval if unmounted before ready
            return () => clearInterval(checkInterval);
        }
    }

    return () => {
        isMounted = false;
        // Safely clear the container. Checking ref presence prevents accessing null.
        if (containerRef.current) {
            containerRef.current.innerHTML = "";
        }
        tvWidget = null;
    };
  }, [symbol, theme, interval]);

  return (
    <div 
        id={widgetId.current} 
        ref={containerRef} 
        className="w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden" 
    />
  );
};
