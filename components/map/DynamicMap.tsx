'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const CampusMap = dynamic(() => import('@/components/map/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-xs">
      Memuat peta Leaflet...
    </div>
  ),
});

export default CampusMap;
